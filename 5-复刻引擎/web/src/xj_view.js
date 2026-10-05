/* xj_view.js —— 场景渲染：地砖层 + 元素层 + 遮挡层 + 角色
 *
 * 地图三层（mapfile 解析结果）：
 *   layer 0 地砖   —— 有 cols×rows 的地砖网格，值为 tileBin 的条目下标
 *   layer 1 元素   —— 元素对象 [animStateIndex, x, y, script]，用 elementAnt 绘制
 *   layer 2 遮挡   —— 元素对象，画在角色之上（门框、屋檐等）
 *
 * 视口用 XJ.Viewport，元素绘制直接复用 XJ.drawState，
 * 因此 flags 映射与动画时序只在一处实现。
 */
(function (global) {
  'use strict';
  var XJ = global.XJ;

  function Scene(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    // 原版是 1:1 直贴（PIX/PNG 尺寸与裁剪表 w×h 完全一致），
    // 关掉插值既能保证像素级一致，也避免缩放采样带来的 ±1 舍入。
    this.ctx.imageSmoothingEnabled = false;
    this.mapName = null;
    this.m = null;
    this.vp = new XJ.Viewport(canvas.width, canvas.height);
    this.t0 = performance.now();
    this.player = { x: 0, y: 0, dir: 'down', state: '站立', ant: null, t: 0 };
    this.world = new global.XJWorld();
    this.world._party = global.XJParty || null;  // 战斗回写用
    this.battleView = null;  // XJBattleView —— 进入战斗时非空
    this.inBattle = false;
    this.dialog = null;     // 当前对话 {speaker,text,visible}
    this.dialogBox = null;  // {text, speaker, type, visible}
    this.branch = null;     // 分支选项
    this.trade = null;      // 商店
    this.npcs = [];        // {x,y,dir,state,ant}
    this.showGrid = false;
    this.showHitbox = false;
    // ---- 过场/演出状态（game.black/flicker/vibrate/waitForKey…）----
    this.cut = null;        // {text, mode} 字幕（black/verse），回车关闭
    this.cutQueue = [];     // 待显示的字幕队列
    this.pausedRunner = null; // ★ script.break/wait 暂停的脚本（e.java:990），回车/计时恢复
    this.stashedRunner = null; // ★ 战前 H2 播出时暂存的地图 build 暂停（见 trackPause）
    this.waitKeys = null;   // {keys:[...], msg} 等待按键
    this.flicker = null;    // {until, color}
    this.shakeUntil = 0;    // 震屏截止时间
    this.fade = null;       // {until} 黑场
    this.gray = false;
    this.margin = false;    // 黑边
    this.guide = null;      // 引导文字
    this.rocks = [];        // 落石演出 [{x,y,vy}]
    this.moveQueue = [];    // 主角移动队列 [{x,y}]
    this.followTrail = [];  // 主角轨迹（跟随者用）
    this.menu = null;       // XJMenu
    this.feeMenu = null;    // 简单 fee 说明
    this.stats = { tiles: 0, objs: 0, elements: 0, frames: 0, miss: 0, pending: 0 };
  }

  Scene.prototype.load = function (mapName, px, py, runScript) {
    var m = XJ.map(mapName);
    if (!m) return false;
    this.mapName = mapName;
    this.m = m;
    // ★ 进新图 = 新的脚本上下文，旧的暂停点作废（原版切图打断 runner）
    this.pausedRunner = null;
    this.px = px != null ? px : Math.floor(m.cols * m.tw / 2);
    this.py = py != null ? py : Math.floor(m.rows * m.th / 2);
    // ★ 装配世界：跑地图级脚本 + 逐个对象脚本，真正把 NPC/怪物/宝箱等建出来
    //   runScript=false（warp 进图）时跳过 change 行防连锁，其余照常
    this.world.build(mapName, this.px, this.py, { skipChange: runScript === false });
    this.checkZones();
    // ★ 地图级脚本的副作用在这里落子（midi/剧情战斗/菜单/字幕/道具…）
    this.drainWorldFx();
    // ★ 地图脚本跑到 break/wait 暂停了：等回车/计时恢复（e.java:990）
    if (this.world.pausedBuild) this.trackPause({ paused: this.world.pausedBuild }, 'build');
    // ★ 先开战、后切图（原版 fight 是模态的，后续行战后才跑）：
    //   若落子排了战斗，pendingChange 暂存到战后执行
    var w = this._followPendingChange();
    if (w != null) return w;
    return true;
  };

  /** 跟进地图脚本留下的 pendingChange（开战则暂存战后，否则直接 warp）；无事返回 null */
  Scene.prototype._followPendingChange = function () {
    if (this.pendingBattle && this.world.pendingChange) {
      var pc = this.world.pendingChange;
      this.world.pendingChange = null;
      this.pendingBattle.afterGoto = [pc.map, pc.x, pc.y, pc.dir, false];
      this.log('战后切图 → ' + pc.map + ' @' + pc.x + ',' + pc.y);
      return true;
    } else if (this.world.pendingChange && (this._warpDepth || 0) < 4) {
      var c = this.world.pendingChange;
      this.world.pendingChange = null;
      this._warpDepth = (this._warpDepth || 0) + 1;
      this._warpGuard = this.mapName + '>' + c.map;
      if (this._warpGuard !== this._lastWarp) {
        this._lastWarp = this._warpGuard;
        this.log('剧情切图 → ' + c.map + ' @' + c.x + ',' + c.y);
        var okWarp = this.goto(c.map, c.x, c.y, c.dir, false);
        this._warpDepth--;
        return okWarp;
      }
      this._warpDepth--;
      return true;
    }
    return null;
  };

  /**
   * 暂停点登记（script.break 等按键 / script.wait 等毫秒，e.java:990）。
   * kind: 'exec'（触发区/条目脚本）或 'build'（地图脚本）。
   * preBattle: 来自战前 H2 开场——开战排队中也允许恢复；否则排队中不恢复，
   *   战后由 endBattle 自动恢复（原版战后脚本自动继续）。
   */
  Scene.prototype.trackPause = function (r, kind, preBattle) {
    if (!r || !r.paused) return r;
    var self = this, p = r.paused;
    // ★ 战前 H2 暂停 + 地图 build 暂停同时存在时（进图即战：build 跑出 fight 意图→
    //   H2 先暂停，build 随后也暂停）：build 暂停暂存，H2 播完→开战→战后 endBattle
    //   再恢复它。直接覆盖会丢掉 H2 的恢复闭包，两边互相等——按回车永远没反应的死锁。
    function stashIfBlocked(pr) {
      if (self.pendingBattle && !pr.preBattle &&
          self.pausedRunner && self.pausedRunner.preBattle) {
        self.stashedRunner = pr;
        if (p.waitMs) {
          (function (token) {
            setTimeout(function () {
              if (self.stashedRunner === token) {
                self.pausedRunner = self.stashedRunner;
                self.stashedRunner = null;
                self.resumeRunner();
              }
            }, Math.min(Math.max(p.waitMs, 0), 30000));
          })(pr);
        }
        return true;
      }
      return false;
    }
    if (kind === 'build') {
      var bpr = { preBattle: false, waitMs: p.waitMs, resume: function () {
        var rr = self.world.continueBuild();
        self.drainWorldFx();
        self._followPendingChange();
        if (rr && rr.paused) self.trackPause({ paused: rr.paused }, 'build');
        return rr;
      } };
      if (stashIfBlocked(bpr)) return r;
      this.pausedRunner = bpr;
    } else {
      // ★ H2 播出中再次暂停（多 break）：pendingBattle 还在排队就是 H2 流，保住 preBattle
      var keepPre = !!preBattle || !!(this.pendingBattle && this.pausedRunner && this.pausedRunner.preBattle);
      var epr = { preBattle: keepPre, waitMs: p.waitMs, resume: function () {
        var r2 = self.world.execAst(p.nodes, p.pc);
        self.playExecTail(r2, { moveTo: true, dialog: true, preBattle: keepPre });
        return r2;
      } };
      if (stashIfBlocked(epr)) return r;
      this.pausedRunner = epr;
    }
    if (p.waitMs) {
      var token = this.pausedRunner;
      setTimeout(function () {
        if (self.pausedRunner === token) self.resumeRunner();
      }, Math.min(Math.max(p.waitMs, 0), 30000));
    }
    return r;
  };

  /** 恢复暂停的脚本（回车/计时/战后调用）。战斗中不恢复。 */
  Scene.prototype.resumeRunner = function () {
    var pr = this.pausedRunner;
    if (!pr) return false;
    if (this.inBattle) return false;
    // ★ 开战排队中：只有战前 H2 的暂停能恢复（把它播完才能开战）；
    //   战后脚本暂停等 endBattle 自动恢复
    if (this.pendingBattle && !pr.preBattle) return false;
    this.pausedRunner = null;
    pr.resume();
    return true;
  };

  /**
   * 条目/触发区脚本的通用收尾：落子 → 对话进队列 → 切图 → 登记暂停点。
   * opts.moveTo/dialog：是否处理 player.moveTo 传送与 dialogBox（触发区/分支要，H2 开场不要）。
   */
  Scene.prototype.playExecTail = function (r, opts) {
    if (!r || r.skipped) return r;
    opts = opts || {};
    if (opts.moveTo && r.moveTo) {
      if (r.moveTo.x != null) this.px = r.moveTo.x;
      if (r.moveTo.y != null) this.py = r.moveTo.y;
    }
    if (opts.dialog && r.dialog) {
      this.dialogBox = { text: r.dialog.text, speaker: r.dialog.speaker, type: null, visible: true };
    }
    if (this.world.playerDir) { this.player.dir = this.world.playerDir; }
    this.drainWorldFx();
    var self = this;
    (r.dialogs || []).forEach(function (dd) {
      self.cutQueue.push({ mode: 'dlg', text: dd.text, speaker: dd.speaker });
    });
    self.nextCut();
    if (r.change) this.goto(r.change.map, r.change.x, r.change.y, r.change.dir, false);
    this.trackPause(r, 'exec', !!opts.preBattle);
    return r;
  };

  /** 取出 World 解释器攒的效果 → 状态落子 + 意图执行 */
  Scene.prototype.drainWorldFx = function () {
    // ★ 状态已由各 runner 即时提交（flushState），这里只取延迟的 UI 意图
    this.world.flushState();
    var fx = this.world.drainDeferred();
    var self = this;
    (fx.messages || []).forEach(function (m) { self.log(m); });
    this.runIntents(fx.intents || []);
    return fx;
  };

  /**
   * 执行意图（applyStateEffects 返回的 UI/音频/战斗类副作用）。
   * 与 e.java 各指令的宿主行为对应。
   */
  Scene.prototype.runIntents = function (intents) {
    var self = this;
    (intents || []).forEach(function (it) {
      switch (it.type) {
        case 'bgm': self.audioPlay(it.file, it.loop); break;
        case 'bgmStop': self.audioStop(); break;
        case 'fight': self.queueBattle(it.key, it.script); break;
        case 'menu': self.openMenu(); break;
        case 'fee': self.openFee(); break;
        case 'shop': self.openShop(it.items); break;
        case 'subtitle':
          self.cutQueue.push({ mode: it.mode, text: it.text });
          self.nextCut();
          break;
        case 'dlgText': self._cutText = it.text; break;
        case 'dlgType': self._cutType = it.t; break;
        case 'dlgShow':
          self.cutQueue.push({ mode: 'dlg', text: self._cutText || '', type: self._cutType });
          self._cutText = null;
          self.nextCut();
          break;
        case 'dlgHide': self.cut = null; self.dialogBox = null; break;
        case 'dlgPortrait': break;  // 立绘在绘制时按 dialog.portrait 现场取（portraitAnt）
        case 'guide': self.guide = it.text; break;
        case 'guideTarget': self.guide = '目标：' + it.t; break;
        case 'flicker': self.flicker = { until: performance.now() + (it.ms || 300), color: it.color }; break;
        case 'shake': self.shakeUntil = performance.now() + (it.ms || 400); break;
        case 'clearFx': self.flicker = null; self.shakeUntil = 0; break;
        case 'fade': self.fade = { until: performance.now() + (it.ms || 500) }; break;
        case 'mask': self.mask = it.id; break;
        case 'unmask': self.mask = null; break;
        case 'gray': self.gray = !!it.on; break;
        case 'margin': self.margin = !!it.on; break;
        case 'wait': self.waitKeys = { keys: ['ok'], msg: '', until: performance.now() + (it.ms || 0) }; break;
        case 'waitKey': self.waitKeys = { keys: String(it.keys || '').split('|'), msg: it.msg }; break;
        case 'countdown':
          // ★ 倒计时脚本（e.java 超时回调 this.a(aP)：时间到执行指定条目）
          self.world.countdown = { until: Date.now() + (it.ms || 0), file: it.file, line: it.line };
          break;
        case 'countdownStop': self.world.countdown = null; break;
        case 'dropRock': self.spawnRocks(it.a); break;
        case 'dropRockClear': self.rocks.length = 0; break;
        case 'branch': self.branch = self.parseBranch(it.a); break;
        case 'playerPos': self.px = it.x; self.py = it.y; self.moveQueue.length = 0; break;
        case 'playerMove': self.moveQueue.push({ x: it.x, y: it.y }); break;
        case 'playerStep': for (var i = 0; i < (it.n || 1); i++) self.stepOnce(it.dir); break;
        case 'playerDir': self.player.dir = it.dir; break;
        case 'playerState':
          self.player.state = (it.st === 'fly') ? '飞行' : (it.st === 'walk' || it.st === 'move' ? '走路' : '站立');
          break;
        case 'playerVel': self.playerVel = it.v; break;
        case 'camPlayer': self.camFocus = null; break;
        case 'camNpc': {
          var el = self.world.findElement(it.id);
          if (el) self.camFocus = { x: el.x, y: el.y };
          break;
        }
        case 'camPos': self.camFocus = { x: it.x, y: it.y }; break;
        case 'mainMenu': self.boot(true); break;
      }
    });
    return true;
  };

  /** 过场字幕推进 */
  Scene.prototype.nextCut = function () {
    if (this.cut || !this.cutQueue.length) return false;
    this.cut = this.cutQueue.shift();
    return true;
  };

  Scene.prototype.parseBranch = function (a) {
    a = a || [];
    return { options: [
      { label: a[0], file: a[1], line: a[2] },
      { label: a[3], file: a[4], line: a[5] }
    ], sel: 0 };
  };

  /** 主角等级（遇敌缩放用，f.java:443 取主角等级） */
  Scene.prototype.mainLevel = function () {
    var P = global.XJParty;
    if (P) {
      var h = P.heroes(this.world).chonglou;
      if (h) return h.level;
    }
    return 1;
  };

  /**
   * 切换地图。保留事件标记/背包/队伍等全局状态，只重装地图内容。
   * @param mapName 目标地图
   * @param x,y 落点（像素）；缺省用出口数据里的落点
   */
  Scene.prototype.goto = function (mapName, x, y, dir, runScript) {
    // ★ 战斗排队中：切图暂存，战后执行（原版 fight 模态语义）
    if (this.pendingBattle && !this.inBattle) {
      this.pendingBattle.afterGoto = [mapName, x, y, dir, runScript];
      this.log('战后切图 → ' + mapName);
      return true;
    }
    var prev = this.mapName;
    var px = x, py = y;
    if (px == null || py == null) {
      var ex = this.world.nearestExit(px || this.px, py || this.py, dir || this.player.dir);
      if (ex) { px = ex.x; py = ex.y; }
    }
    if (!this.load(mapName, px, py, runScript === false ? false : true)) return false;
    if (dir) this.player.dir = dir;
    this.log('切图 ' + prev + ' → ' + mapName + ' @' + this.px + ',' + this.py);
    return true;
  };

  /**
   * 排队战斗：game.fight(key, 脚本行, 回合A, 回合B)。
   * H2.str 有 7 个条目（不是空的！）：t1>=0 时先播开场剧情（邪剑仙对峙/新手教程），
   * 播完再开战。H2 行号 = STR 条目索引（b.a(file, n) 取第 n 条）。
   */
  Scene.prototype.queueBattle = function (key, script) {
    if (script != null && script >= 0) {
      var r = this.world.runScriptEntry('H2.str', script);
      // ★ preBattle：开战排队中也允许回车播完它（播完+对白清空才开战）
      this.playExecTail(r, { preBattle: true });
    }
    // ★ 开场播完（过场清空+无暂停点）才真正开战
    this.pendingBattle = { key: key };
  };
  Scene.prototype.startBattle = function (key, playerLevel) {
    var XB = global.XJBattle, P = global.XJParty;
    var lv = playerLevel != null ? playerLevel : this.mainLevel();
    var enc = XB.encounter(key, lv, null, this.world);
    if (!enc || !enc.monsters.length) {
      this.log('战斗组建失败 key=' + key);
      return false;
    }
    var b = new XB.Battle({});
    var self = this;
    var members = P ? P.activeHeroes(this.world) : [];
    members.slice(0, 3).forEach(function (h, i) {
      var st = P.statsOf(h);
      var u = new XB.Unit({
        side: 'hero', slot: i, name: h.name,
        hp: h.hp, maxHp: st.maxHp, mp: h.mp, maxMp: st.maxMp,
        gas: h.gas, maxGas: st.maxGas,
        atk: st.atk, def: st.def, spd: st.spd, luk: st.luk,
        level: h.level, gainGas: 0
      });
      u.heroName = h.name;
      u.T = h.feeling;
      u.skills = self.heroBattleSkills(h);
      b.add(u);
    });
    if (!b.heroes.length) { this.log('无出战队员'); return false; }
    enc.monsters.forEach(function (m, i) {
      m.side = 'foe'; m.slot = i;
      if (!m.skills || !m.skills.normal.length)
        m.skills = { normal: [{ name: '攻击', formula: 'atk', kindCode: 0 }], spell: [] };
      b.add(m);
    });
    b.expTotal = enc.exp; b.goldTotal = enc.gold;
    b.key = key; b.bgAnt = enc.bgAnt; b.bgm = enc.bgm;

    this.battleView = new global.XJBattleView(this.cv, { battle: b, world: this.world });
    this.battleView.setBattle(b, enc.bgAnt);
    this.battleView.onEnd = function (result) { self.endBattle(result); };
    this.inBattle = true;
    this.audioPlay(enc.bgm, -1);
    this.log('进入战斗 ' + key + ' ' + b.foes.length + ' 只怪（' +
      b.foes.map(function (u) { return u.name + ' Lv' + u.H; }).join(',') + '）');
    return true;
  };

  /**
   * 出战技能：普通技能（首个）+ 已学仙术（slv 折算 Bj.b）。
   * 普通攻击 slv 强制 4，走 execSkill 的 skillLevel。
   */
  Scene.prototype.heroBattleSkills = function (h) {
    var P = global.XJParty;
    var normal = [];
    (h.normalSkills || []).forEach(function (n) {
      var sk = P.skillByName(n);
      if (sk) normal.push(Object.assign({}, sk, { level: 4 }));
    });
    if (!normal.length) normal.push({ name: '攻击', formula: 'atk', kindCode: 0, all: false, level: 4 });
    var spell = [];
    Object.keys(h.arts || {}).forEach(function (n) {
      if (!h.arts[n].learned) return;
      var sk = P.skillByName(n);
      if (sk) spell.push(Object.assign({}, sk, { level: P.artSlv(this.world, h.name, n) }));
    }, this);
    // ★ 普通技能全带（攻击菜单用首个；魔尊真身 id7 走变身分支）
    return { normal: normal, spell: spell };
  };

  /** 战斗结束回地图：f.java:1020 胜利结算（掉落/经验/金钱/升级/阵亡扣好感） */
  Scene.prototype.endBattle = function (result, settle) {
    var P = global.XJParty, XB = global.XJBattle;
    var b = this.battleView && this.battleView.battle;
    this.inBattle = false;
    this.battleView = null;
    // ★ 战后切图（排队时暂存的 goto，胜负都执行——原版后续行照跑）
    if (result === 'win' && b) {
      var exp = b.expTotal || 0, gold = b.goldTotal || 0;
      // ★ 四倍修行（fee 7）：exp/gold <<= 2（f.java:1052-1055）
      if (this.world.fees && this.world.fees[7]) { exp <<= 2; gold <<= 2; }
      // ★ 掉落（逐条命中，最多 3 件）
      var drops = XB.rollDrops(b.foes, null);
      drops.forEach(function (n) { this.world.addItem(n, 1); }, this);
      if (gold > 0) this.world.addGold(gold);
      var r = b.settleWin(exp, gold);
      // ★ 结算写回持久角色：存活恢复快照、阵亡扣好感精置1、经验升级
      var notes = [];
      if (P) {
        b.heroes.forEach(function (u) {
          var h = P.heroByName(this.world, u.heroName || u.name);
          if (!h) return;
          if (!u.isDead()) {
            h.hp = u.I; h.mp = u.M; h.gas = u.O;
            h.feeling = u.T;
            this.world.party[h.name] = h.feeling;
            var lr = P.addExp(this.world, h, exp);
            if (lr.leveled) notes.push(h.name + '升级到' + h.level + '级！');
            else if (lr.capped) notes.push(h.name + '已到等级上限');
          } else {
            h.feeling = Math.max(0, (h.feeling || 0) - 5);
            this.world.party[h.name] = h.feeling;
            h.hp = 1;   // 精强制置 1（f.java:1070）
            P.clampHero(h);
            notes.push(h.name + '阵亡，好感-5');
          }
        }, this);
      }
      this.log('战斗胜利 经验 ' + exp + ' 金钱 ' + gold +
        (drops.length ? ' 掉落 ' + drops.join('、') : '') +
        (notes.length ? '（' + notes.join('；') + '）' : ''));
      this.drainWorldFx();
    } else if (result === 'lose') {
      // ★ 失败：伤害写回（f 把战斗快照写回持久记录），回地图
      if (b && P) {
        b.heroes.forEach(function (u) {
          var h = P.heroByName(this.world, u.heroName || u.name);
          if (!h) return;
          h.hp = Math.max(0, u.I); h.mp = u.M; h.gas = u.O;
          P.clampHero(h);
        }, this);
      }
      this.log('战斗失败，回到进入点');
    } else if (result === 'escape' || (b && b.phase === 3)) {
      this.log('逃跑成功');
    }
    // ★ 执行战后切图（有则；胜负逃都执行——原版后续行照跑）
    var _warped = false;
    if (this._afterGoto) {
      var ag = this._afterGoto;
      this._afterGoto = null;
      _warped = !!this.goto(ag[0], ag[1], ag[2], ag[3], ag[4]);
    }
    // ★ 战后脚本自动继续（原版 fight 返回后 runner 继续跑；新图 warp 则等玩家按键）
    //   战前 H2 暂存的地图 build 暂停在这里恢复（trackPause 注释里的死锁对付）。
    if (this.stashedRunner && !this.pausedRunner) {
      this.pausedRunner = this.stashedRunner;
      this.stashedRunner = null;
    }
    if (this.pausedRunner && !_warped) this.resumeRunner();
    // 切回地图 BGM
    this.audioMapBgm();
  };

  Scene.prototype.fireZone = function (z) {
    var r = this.world.fireZone(z);
    // player.moveTo(-1, y) —— -1 保持不变（execAst 内处理）
    this.playExecTail(r, { moveTo: true, dialog: true });
    return !!(r && r.change);
  };

  /** 检查玩家当前位置的触发区 */
  Scene.prototype.checkZones = function (x0, y0) {
    var zs = this.world.zonesAt(this.px, this.py, x0, y0);
    for (var i = 0; i < zs.length; i++) {
      if (this.fireZone(zs[i])) return true;
    }
    return false;
  };

  /** 引擎侧日志（同时打到侧栏日志框） */
  Scene.prototype.log = function (msg) {
    this.messages = this.messages || [];
    this.messages.push(msg);
    if (this.messages.length > 200) this.messages.shift();
    if (this.onLog) this.onLog(msg);
    return msg;
  };

  /**
   * 回放 World.pending 里的系统级副作用。
   * 状态变更（markEvent / addItem / task / trade…）已在 Dialog.exec 里直接写进
   * World，这里只把「提示类」的打到日志上（showInfo / showAsideInfo）。
   * Dialog 未直接处理的命名空间（走 interp.step 记账的，如 countdownTimer.stop）
   * 在这里统一落子。
   */
  Scene.prototype.flushTalkEffects = function () {
    var w = this.world;
    if (!w || !w.pending) return;
    for (var i = 0; i < w.pending.length; i++) {
      var p = w.pending[i];
      if (p.kind === 'showInfo') this.log('提示：' + p.data.text);
      else if (p.kind === 'showAsideInfo') this.log('旁白：' + JSON.stringify(p.data.a));
      else if (p.kind === 'branch') this.log('分支：' + JSON.stringify(p.data));
    }
    w.pending.length = 0;
    // 未直接处理的Interp效果统一落子（状态已即时提交，这里只取 UI 意图）
    w.flushState();
    var fx = w.drainDeferred();
    var self = this;
    (fx.messages || []).forEach(function (m) { self.log(m); });
    this.runIntents(fx.intents || []);
    return true;
  };

  Scene.prototype.openShop = function (items) {
    this.shop = new global.XJShop.Shop(this.world, items);
    this.log('商店开张，商品 ' + items.length + ' 种（←→切换买卖，回车确认，Esc 关闭）');
    return this.shop;
  };

  Scene.prototype.mapPxW = function () { return this.m ? this.m.cols * this.m.tw : 0; };
  Scene.prototype.mapPxH = function () { return this.m ? this.m.rows * this.m.th : 0; };

  // ---------------------------------------------------------- 移动
  var DIRS = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
  };

  /** 尝试移动；返回是否真的移动了（撞边界/撞元素则 false） */
  Scene.prototype.tryMove = function (dir) {
    if (!this.m) return false;
    if (this.cut || this.cutQueue.length || this.waitKeys || this.menu || this.branch) return false;
    if (this.pausedRunner) return false;
    var d = DIRS[dir];
    if (!d) return false;
    this.player.dir = dir;
    // ★ 飞行速度读主角 roles 标量（重楼 12；无党时保底 32）
    var flyStep = 32;
    try {
      var _P = global.XJParty;
      var _hs = _P ? _P.heroes(this.world) : {};
      var _h = _hs.chonglou || _hs[Object.keys(_hs)[0]];
      if (_h) {
        var _rc = _P.roleCfg ? _P.roleCfg(_h.role) : null;
        var _fv = _rc ? parseInt((_rc.scalars || {})['飞行速度'], 10) : NaN;
        if (!isNaN(_fv) && _fv > 0) flyStep = _fv;
      }
    } catch (e) { /* 保底 32 */ }
    var step = this.world.fly ? flyStep : this.m.tw;
    var nx = this.px + d[0] * step;
    var ny = this.py + d[1] * step;
    if (nx < 0 || ny < 0 || nx >= this.mapPxW() || ny >= this.mapPxH()) return false;
    if (this.hitElement(nx, ny)) return false;
    // ★ 碰撞盒（MAP trigger 矩形，ay.java:507）：撞墙停；带脚本的撞了还跑脚本。
    //   点判 + 线段判（细墙 7~12px 按格跳会被跨过，穿过即撞）。
    var ox = nx - d[0] * step, oy = ny - d[1] * step;
    var s = this.world.solidAt ? this.world.solidAt(nx, ny) : null;
    if (!s && this.world.solidSeg) s = this.world.solidSeg(ox, oy, nx, ny);
    if (s) {
      if (s.ast && s.ast.length) {
        var r2 = this.world.execAst(s.ast);
        this.playExecTail(r2, { moveTo: true, dialog: true });
      }
      return false;
    }
    this.px = nx; this.py = ny;
    this.player.state = this.world.fly ? '飞行' : '走路';
    this.pushTrail(nx, ny);
    this.checkZones(ox, oy);
    this.touchMonsters();
    return true;
  };

  /** 剧情移动一格（player.move，无视演出锁） */
  Scene.prototype.stepOnce = function (dir) {
    var d = DIRS[dir] || DIRS[this.player.dir] || [0, 1];
    var nx = this.px + d[0] * this.m.tw, ny = this.py + d[1] * this.m.th;
    if (nx < 0 || ny < 0 || nx >= this.mapPxW() || ny >= this.mapPxH()) return false;
    this.px = nx; this.py = ny;
    this.pushTrail(nx, ny);
    this.checkZones(nx - d[0] * this.m.tw, ny - d[1] * this.m.th);
    return true;
  };

  /** 是否撞上可碰撞元素（NPC/怪/箱/石；鸟鱼云等氛围物不挡路） */
  Scene.prototype.hitElement = function (x, y) {
    var els = this.world.elements || [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.kind !== 'npc' && e.kind !== 'monster' && e.kind !== 'box' && e.kind !== 'rock') continue;
      if (Math.abs(e.x - x) < 14 && Math.abs(e.y - y) < 14) return true;
    }
    return false;
  };

  /** 主角轨迹（跟随者沿轨迹走） */
  Scene.prototype.pushTrail = function (x, y) {
    this.followTrail.push({ x: x, y: y });
    if (this.followTrail.length > 40) this.followTrail.shift();
  };

  /**
   * 明怪 AI（ar.java 简化：视线 50 追击、接触 10 开战、否则在家 30 范围内随机走）。
   * 半径全部读 config_game（明怪视线半径/追击半径/移动半径/移动速度……）。
   */
  Scene.prototype.updateMonsters = function () {
    if (this.world.showMonster === false) return;
    var cfg = (XJ.data.config.gameCfg && XJ.data.config.gameCfg.scalars) || {};
    function N(k, d) { var v = parseInt(cfg[k], 10); return isNaN(v) ? d : v; }
    var sight = N('明怪视线半径', 50), chase = N('明怪追击半径', 100),
        home = N('明怪移动半径', 30), spd = N('明怪移动速度', 10);
    var els = this.world.elements || [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.kind !== 'monster') continue;
      e.t = (e.t || 0) + 1;
      var dx = this.px - e.x, dy = this.py - e.y;
      var dist2 = dx * dx + dy * dy;
      if (dist2 <= 10 * 10) { this.touchMonster(e); return; }
      var mv = null;
      // ★ 神行飞剑（fee 1）：所到之处怪物退避，不追击
      var noChase = this.world.fees && this.world.fees[1];
      if (!noChase && dist2 <= sight * sight && dist2 <= chase * chase) {
        mv = { x: dx, y: dy };   // 追击
      } else if (e.t % 30 === 0) {
        // 在家附近随机走 1~3 步
        var a = Math.random() * Math.PI * 2, st = 1 + ((Math.random() * 3) | 0);
        var tx = e.homeX + Math.cos(a) * st * 16, ty = e.homeY + Math.sin(a) * st * 16;
        if ((tx - e.homeX) * (tx - e.homeX) + (ty - e.homeY) * (ty - e.homeY) <= home * home) mv = { x: tx - e.x, y: ty - e.y };
      }
      if (mv) {
        var len = Math.sqrt(mv.x * mv.x + mv.y * mv.y) || 1;
        var step = Math.min(spd, len);
        e.x += Math.round(mv.x / len * step);
        e.y += Math.round(mv.y / len * step);
        e.monState = '1';
      } else {
        e.monState = '0';
      }
    }
  };

  /**
   * NPC 自主游荡（bl.java AI tick + e.java:2405 setAiEnabled → C 标记）：
   * 站 rand(最短,最长站立时间)ms → 走 rand(最小,最大移动步数)步（w%4 定向：
   * 0下1上2右3左；moveUD(j)锁纵轴、moveLR(i)锁横轴；双 false 不动 bl.java:343）
   * → 每步查碰撞盒，撞墙停 → 站。模态（战斗/过场/菜单）时冻结。
   */
  Scene.prototype.updateNpc = function () {
    if (this.inBattle || this.cut || this.cutQueue.length || this.pausedRunner ||
        this.menu || this.branch || (this.talk && this.talk.active) ||
        (this.shop && this.shop.active)) return;
    var cfg = (XJ.data.config.gameCfg && XJ.data.config.gameCfg.scalars) || {};
    function N(k, d) { var v = parseInt(cfg[k], 10); return isNaN(v) ? d : v; }
    var minStep = N('NPC最小移动步数', 3), maxStep = N('NPC最大移动步数', 10);
    var minWait = N('NPC最短站立时间', 1000), maxWait = N('NPC最长站立时间', 3000);
    var now = Date.now();
    var DIRS4 = ['down', 'up', 'right', 'left'];
    var DXY = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    var step = (this.m && this.m.tw) || 16;
    var els = this.world.elements || [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (!e || e.kind !== 'npc' || !e.ai || e.gone) continue;
      if (!(e.moveUD || e.moveLR)) continue;
      if (e.follow || e.moveTo) continue;
      if (e.aiTx != null) {
        // 走向当前步目标（4px/帧滑行；到点记一步；剩步数沿原方向继续，撞墙停）
        var dx = e.aiTx - e.x, dy = e.aiTy - e.y;
        var dd = Math.sqrt(dx * dx + dy * dy);
        if (dd <= 4) {
          e.x = e.aiTx; e.y = e.aiTy; e.aiTx = null; e.aiTy = null;
          e.aiSteps--;
          if (e.aiSteps <= 0) {
            e.state = '站立';
            e.aiWaitUntil = now + minWait + Math.random() * (maxWait - minWait);
          } else {
            var d2 = DXY[e.aiDir] || [0, 1];
            var mx = e.x + d2[0] * step, my = e.y + d2[1] * step;
            if (mx < 0 || my < 0 || mx >= this.mapPxW() || my >= this.mapPxH() ||
                (this.world.solidAt && this.world.solidAt(mx, my))) {
              e.aiSteps = 0;
              e.state = '站立';
              e.aiWaitUntil = now + minWait + Math.random() * (maxWait - minWait);
            } else {
              e.aiTx = mx; e.aiTy = my;
              e.state = '走路';
            }
          }
        } else {
          e.x += Math.round(dx / dd * 4); e.y += Math.round(dy / dd * 4);
          e.state = '走路';
        }
        continue;
      }
      if (!e.aiWaitUntil) e.aiWaitUntil = now + minWait + Math.random() * (maxWait - minWait);
      if (now < e.aiWaitUntil) continue;
      // 掷步数 + 方向
      var w = minStep + ((Math.random() * (maxStep - minStep + 1)) | 0);
      var roll = w % 4, dir;
      if (e.moveUD && !e.moveLR) dir = DIRS4[roll % 2];
      else if (!e.moveUD && e.moveLR) dir = DIRS4[2 + (roll % 2)];
      else dir = DIRS4[roll];
      var d = DXY[dir];
      var nx = e.x + d[0] * step, ny = e.y + d[1] * step;
      if (nx < 0 || ny < 0 || nx >= this.mapPxW() || ny >= this.mapPxH() ||
          (this.world.solidAt && this.world.solidAt(nx, ny))) {
        e.state = '站立';
        e.aiWaitUntil = now + minWait + Math.random() * (maxWait - minWait);
        continue;
      }
      e.dir = dir; e.aiDir = dir; e.aiSteps = w; e.aiTx = nx; e.aiTy = ny;
      e.state = '走路';
    }
  };

  /** 接触明怪 → 按地图中文名组建遭遇（e.s() 取地图名 B） */
  Scene.prototype.touchMonsters = function () {
    var els = this.world.elements || [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.kind !== 'monster') continue;
      var dx = this.px - e.x, dy = this.py - e.y;
      if (dx * dx + dy * dy <= 10 * 10) { this.touchMonster(e); return; }
    }
  };

  Scene.prototype.touchMonster = function (e) {
    if (this.inBattle) return;
    var key = this.world.mapTitle;
    if (!key || !global.XJBattle.enemySpec(key)) {
      this.log('此地无遭遇配置（' + (key || '无地图名') + '）');
      return;
    }
    // 打完这只怪就消失（避免原地连续开战）
    e.gone = true;
    this.world.elements = (this.world.elements || []).filter(function (x) { return x !== e; });
    this.startBattle(key, this.mainLevel());
  };

  // ---------------------------------------------------------- 地砖
  Scene.prototype.drawTiles = function () {
    var m = this.m, ctx = this.ctx, vp = this.vp;
    if (!m) return;
    var n = 0;
    for (var li = 0; li < m.layers.length; li++) {
      var L = m.layers[li];
      if (!L.t) continue;                       // 该层无网格
      var c0 = Math.max(0, Math.floor(vp.x / m.tw));
      var c1 = Math.min(m.cols - 1, Math.ceil((vp.x + vp.w) / m.tw));
      var r0 = Math.max(0, Math.floor(vp.y / m.th));
      var r1 = Math.min(L.t.length - 1, Math.ceil((vp.y + vp.h) / m.th));
      for (var r = r0; r <= r1; r++) {
        var row = XJ.tileRow(m, li, r);
        if (!row) continue;
        for (var c = c0; c <= c1; c++) {
          var v = row[c];
          if (v < 0) continue;              // 0xFFFF 读作 -1 = 本格无地砖
          var st = XJ.spriteState(m.tileBin, v);
          if (st === 'missing') { this.stats.miss++; continue; }
          if (st !== 'ok') { this.stats.pending++; continue; }
          var im = XJ.sprite(m.tileBin, v);
          var dx = c * m.tw - vp.x, dy2 = r * m.th - vp.y;
          if (im.naturalWidth === m.tw && im.naturalHeight === m.th) {
            ctx.drawImage(im, dx, dy2);          // 1:1 直贴，零重采样
          } else {
            ctx.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, dx, dy2, m.tw, m.th);
          }
          n++;
        }
      }
    }
    this.stats.tiles = n;
  };

  // ---------------------------------------------------------- 元素层
  Scene.prototype.drawObjects = function (layerIdx) {
    var m = this.m, ctx = this.ctx, vp = this.vp, t = performance.now() - this.t0;
    if (!m) return;
    var L = m.layers[layerIdx];
    if (!L) return;
    // 该地图可能用多个元素 ANT（addToNpc 各自带 ant），这里统一用 elementAnt
    var antName = m.elementAnt;
    var a = antName ? XJ.data.ant.ants[antName] : null;
    var n = 0;
    for (var i = 0; i < L.o.length; i++) {
      var o = L.o[i];
      var x = o[1] - vp.x, y = o[2] - vp.y;
      if (x < -80 || x > vp.w + 80 || y < -120 || y > vp.h + 80) continue;
      if (!a || o[0] < 0 || o[0] >= a.states.length) { this.stats.miss++; continue; }
      // 每个对象用「绝对时间 - 位置哈希」做相位偏移，避免整齐同步
      XJ.drawState(ctx, antName, a.states[o[0]], x, y,
        t + (o[1] * 31 + o[2] * 17) % 1000, true);
      n++;
    }
    this.stats.objs += n;
  };

  /**
   * 绘制脚本装配出来的元素（自带 ANT 的 NPC / 怪物 / 宝箱 / 鸟 / 云 …）。
   * 与 drawObjects 的区别：这些元素有【自己的 ANT】，不用地图的 elementAnt。
   */
  Scene.prototype.drawElements = function () {
    var els = this.world.elements, ctx = this.ctx, vp = this.vp;
    if (!els) return;
    if (this.world.showMonster === false) {
      els = els.filter(function (e) { return e.kind !== 'monster'; });
    }
    var t = performance.now() - this.t0;
    var n = 0;
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.gone) continue;
      if (e.kind === 'npc' && this.world.showNpc === false) continue;
      var x = e.x - vp.x, y = e.y - vp.y;
      if (x < -80 || x > vp.w + 80 || y < -120 || y > vp.h + 80) continue;
      var antName = e.ant || this.m.elementAnt;
      var a = antName ? XJ.data.ant.ants[antName] : null;
      if (!a) { this.stats.miss++; continue; }
      var st = null;
      if (e.kind === 'box') {
        // ★ 宝箱开合是命名状态（ad 构造器取 宝箱（开/关））
        st = XJ.state(antName, e.opened ? '宝箱（开）' : '宝箱（关）');
      } else if (e.kind === 'monster') {
        // ★ 明怪用 guaiwu 的 "0"/"1" 两帧
        st = XJ.state(antName, e.monState || '0') || a.states[0];
      } else {
        // 有自己 ANT 的用状态名解析；没有的退回 anim 索引
        // ★ npc.setSequence(name) 优先按名取状态，取不到再按 state+dir 解析
        st = null;
        if (e.ant && e.seq != null) st = XJ.state(antName, String(e.seq));
        if (!st) {
          st = e.ant ? XJ.resolveState(antName, e.state, e.dir)
                     : (e.anim >= 0 && e.anim < a.states.length ? a.states[e.anim] : null);
        }
      }
      if (!st) { this.stats.miss++; continue; }
      // 跟随者画个小标记
      XJ.drawState(ctx, antName, st, x, y, t + ((e.x * 31 + e.y * 17) % 1000), true);
      n++;
      if (e.kind === 'npc') this.drawNpcName(e, x, y);
    }
    this.stats.elements = n;
  };

  /**
   * NPC 名牌（bl.a：玩家踩进对话区矩形、不看朝向，才画白字；
   * y - nameHeight，底中对齐 33）。
   */
  Scene.prototype.drawNpcName = function (e, x, y) {
    var T = global.XJTalk;
    if (!T || !T.npcDef || !T.inDialogRegion) return;
    var def = T.npcDef(e.id);
    if (!def || !def.name) return;
    if (!T.inDialogRegion(this.px, this.py, e.x, e.y, null, def)) return;
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(def.name, x + 8, y - (def.nameHeight || 20));
    ctx.restore();
  };

  // ---------------------------------------------------------- 角色
  Scene.prototype.drawActor = function (x, y, dir, baseState, antName, tOffset) {
    var ctx = this.ctx;
    if (!antName || !XJ.data.ant.ants[antName]) { this.stats.miss++; return false; }
    var st = XJ.resolveState(antName, baseState, dir);
    if (!st) { this.stats.miss++; return false; }
    XJ.drawState(ctx, antName, st, x - this.vp.x, y - this.vp.y,
      (performance.now() - this.t0) + (tOffset || 0), true);
    this.stats.frames++;
    return true;
  };

  // ---------------------------------------------------------- 对话框
  /**
   * 对话立绘：portrait_*.ant 的 normal 状态（npc.setPortrait / 角色配置 头像列）。
   * 返回 {ant, state} 或 null。
   */
  Scene.prototype.portraitAnt = function (d) {
    var P = global.XJParty;
    if (!d || !d.portrait) return null;
    if (d.portrait === 'player' && P) {
      var hs = P.heroes(this.world);
      var h = hs[(this.world.members || ['chonglou'])[0]] || hs.chonglou;
      if (h) {
        var cfg = P.roleCfg(h.role);
        var p = cfg && cfg.scalars && cfg.scalars['头像'];
        if (p) {
          var parts = String(p).split(',');
          return { ant: parts[0].replace(/\.ant$/i, ''), state: parts[1] || 'normal' };
        }
      }
      return null;
    }
    if (d.portrait === 'npc' && this.talk) {
      var nid = (this.talk.portraitNpc != null ? this.talk.portraitNpc : this.talk.npcId);
      var el = this.world.findElement(nid);
      if (el && el.portrait) return { ant: String(el.portrait).replace(/\.ant$/i, ''), state: el.portraitState || 'normal' };
    }
    return null;
  };

  /** 画 J2ME 风格的底部对话框 */
  Scene.prototype.drawDialog = function () {
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    var d = this.dialogBox || this.dialog;
    if (!d || d.visible === false || !d.text) return false;
    var pad = 4;
    var boxH = 58, boxY = H - boxH - pad;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.82)';
    ctx.strokeStyle = '#6a6a8a';
    ctx.lineWidth = 1;
    ctx.fillRect(pad, boxY, W - pad * 2, boxH);
    ctx.strokeRect(pad + .5, boxY + .5, W - pad * 2 - 1, boxH - 1);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textBaseline = 'top';
    var tx = pad + 8;
    // 立绘（左 44px）
    var pa = this.portraitAnt(d);
    if (pa && XJ.data.ant.ants[pa.ant]) {
      var pst = XJ.state(pa.ant, pa.state) || XJ.data.ant.ants[pa.ant].states[0];
      if (pst) {
        XJ.drawState(ctx, pa.ant, pst, tx, boxY + boxH - 6, 0, false);
        tx += 46;
      }
    }
    if (d.speaker) {
      ctx.fillStyle = '#ffd76a';
      var name = String(d.speaker);
      ctx.fillText(name, tx, boxY + 6);
      var nw = ctx.measureText(name).width;
      ctx.fillStyle = '#c8c8d0';
      var body = String(d.text);
      if (body.indexOf(name) === 0) body = body.slice(name.length).replace(/^[：:]/, '');
      wrapText(ctx, body, tx + nw + 8, boxY + 6, W - pad * 2 - nw - 20, 16);
    } else {
      ctx.fillStyle = '#c8c8d0';
      wrapText(ctx, String(d.text), tx, boxY + 6, W - pad * 2 - 16, 16);
    }
    // 右下角提示
    if (this._blink && !this.branch) {
      ctx.fillStyle = '#8a8aa0';
      ctx.font = '11px monospace';
      ctx.fillText('▼', W - pad - 14, boxY + boxH - 15);
    }
    ctx.restore();
    return true;
  };

  function wrapText(ctx, text, x, y, maxW, lh) {
    var line = '', yy = y;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var t = line + ch;
      if (ctx.measureText(t).width > maxW && line) {
        ctx.fillText(line, x, yy); yy += lh; line = ch;
      } else line = t;
    }
    if (line) ctx.fillText(line, x, yy);
    return yy;
  }

  // ---------------------------------------------------------- 主循环
  Scene.prototype.render = function (dt) {
    var ctx = this.ctx, m = this.m;
    // 战斗中走战斗循环
    // ★ frame() 里可能同步结束战斗（finish→onEnd→endBattle 置空），render 前重判
    if (this.inBattle && this.battleView) {
      this.battleView.frame(dt || 16);
      if (this.inBattle && this.battleView) this.battleView.render(dt || 16);
      return;
    }
    // 标题画面
    if (this.title) { this.drawTitle(dt || 16); return; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    if (!m) { this.hud('未加载地图'); return; }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    this.stats.tiles = 0; this.stats.objs = 0;
    this.stats.frames = 0; this.stats.miss = 0; this.stats.pending = 0;
    this.stats.elements = 0;

    this.update(dt || 16);

    this.vp.centerOn(this.px, this.py, this.mapPxW(), this.mapPxH());
    if (this.camFocus) {
      this.vp.centerOn(this.camFocus.x, this.camFocus.y, this.mapPxW(), this.mapPxH());
    }
    // 震屏
    if (this.shakeUntil && performance.now() < this.shakeUntil) {
      ctx.translate(((Math.random() * 6) | 0) - 3, ((Math.random() * 6) | 0) - 3);
    } else {
      this.shakeUntil = 0;
    }

    this.drawTiles();
    this.drawObjects(1);                       // 元素层（无脚本对象，用地图 elementAnt）
    this.drawElements();                       // 脚本装配出的元素（自带 ANT）
    // 主角：优先用玩家自己的 ANT（renwu），否则退回地图元素 ANT 的 站立
    if (this.world.showPlayer !== false) {
      this.drawActor(this.px, this.py, this.player.dir, this.player.state,
        this.player.ant || m.elementAnt, 0);
    }
    this.drawObjects(2);                       // 遮挡层盖在角色之上

    // 闪烁提示
    this._blink = ((performance.now() / 500) | 0) % 2 === 0;

    this.drawDialog();
    this.drawBranch();
    this.drawCut();
    if (this.shop && this.shop.active) {
      this.shop.render(ctx, this.cv.width, this.cv.height);
    }
    if (this.menu && this.menu.active) {
      this.menu.render(ctx, this.cv.width, this.cv.height);
    }
    if (this.feeMenu) this.drawFeeMenu();
    if (this.flicker && performance.now() < this.flicker.until) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.7;
      ctx.fillRect(0, 0, this.cv.width, this.cv.height);
      ctx.restore();
    } else {
      this.flicker = null;
    }
    if (this.fade && performance.now() < this.fade.until) {
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.cv.width, this.cv.height);
      ctx.restore();
    } else {
      this.fade = null;
    }
    if (this.gray) {
      ctx.save();
      ctx.fillStyle = 'rgba(128,128,128,.45)';
      ctx.fillRect(0, 0, this.cv.width, this.cv.height);
      ctx.restore();
    }
    if (this.margin) {
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.cv.width, 24);
      ctx.fillRect(0, this.cv.height - 24, this.cv.width, 24);
      ctx.restore();
    }
    if (this.mask != null) {
      // ★ world.addMask：全屏罩（资源映射未知，先画半透明黑）
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.fillRect(0, 0, this.cv.width, this.cv.height);
      ctx.restore();
    }
    if (this.guide) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(6, 44, this.cv.width - 12, 20);
      ctx.fillStyle = '#ffd76a';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(this.guide).slice(0, 40), 12, 58);
      ctx.restore();
    }
    this.drawRocks();
    if (this.showGrid) this.drawGrid();
    this.hud();
  };

  /** 分支选项绘制（game.branch；1/2 或上下+回车） */
  Scene.prototype.drawBranch = function () {
    if (!this.branch) return false;
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    var opts = this.branch.options || [];
    ctx.save();
    var bw = 220, bh = opts.length * 20 + 14;
    var bx = (W - bw) / 2, by = (H - bh) / 2 - 30;
    ctx.fillStyle = 'rgba(0,0,12,.92)';
    ctx.strokeStyle = '#6a6a8a';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textBaseline = 'top';
    for (var i = 0; i < opts.length; i++) {
      ctx.fillStyle = i === this.branch.sel ? '#ffd76a' : '#c8c8d0';
      ctx.fillText((i === this.branch.sel ? '▶ ' : '　') + (i + 1) + '. ' + opts[i].label, bx + 10, by + 8 + i * 20);
    }
    ctx.restore();
    return true;
  };

  /** 过场字幕绘制（black 全黑 / verse 竖排简化为居中多行） */
  Scene.prototype.drawCut = function () {
    if (!this.cut) return false;
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    ctx.save();
    if (this.cut.mode === 'black') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#eee';
      ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'top';
      wrapText(ctx, String(this.cut.text || ''), 30, 60, W - 60, 22);
    } else {
      var pad = 4, boxH = 76, boxY = H - boxH - pad;
      ctx.fillStyle = 'rgba(0,0,0,.85)';
      ctx.fillRect(pad, boxY, W - pad * 2, boxH);
      ctx.strokeStyle = '#6a6a8a';
      ctx.strokeRect(pad + .5, boxY + .5, W - pad * 2 - 1, boxH - 1);
      ctx.fillStyle = '#eee';
      ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'top';
      wrapText(ctx, String(this.cut.text || ''), pad + 8, boxY + 8, W - pad * 2 - 16, 17);
    }
    ctx.fillStyle = '#8a8aa0';
    ctx.font = '11px monospace';
    ctx.fillText('▼', W - 18, H - 22);
    ctx.restore();
    return true;
  };

  /** 每帧逻辑：剧情移动队列 / 跟随者 / 明怪 / 落石 */
  Scene.prototype.update = function (dt) {
    // 待开战斗：过场（字幕/对话/分支/菜单/商店/等待按键/脚本暂停点）清空后开战
    if (this.pendingBattle && !this.inBattle && !this.cut && !this.cutQueue.length &&
        !this.pausedRunner &&
        !(this.talk && this.talk.active) && !this.menu && !(this.shop && this.shop.active) && !this.branch) {
      var pb = this.pendingBattle;
      this.pendingBattle = null;
      // ★ afterGoto 另存（endBattle 时用；pendingBattle 已清空）
      this._afterGoto = pb.afterGoto || null;
      this.waitKeys = null;
      this.startBattle(pb.key, this.mainLevel());
    }
    // 剧情移动队列
    if (this.moveQueue.length && !this.inBattle) {
      var wp = this.moveQueue[0];
      var dx = wp.x - this.px, dy = wp.y - this.py;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        this.px = wp.x; this.py = wp.y;
        this.moveQueue.shift();
        this.player.state = '站立';
      } else {
        var sp = Math.max(2, this.playerVel || 6);
        this.px += Math.round(dx / dist * Math.min(sp, dist));
        this.py += Math.round(dy / dist * Math.min(sp, dist));
        this.player.state = '走路';
        this.pushTrail(this.px, this.py);
      }
    }
    // 跟随者沿轨迹走（partner.in 绑定的 NPC）
    var fl = this.world.followers || {};
    var self = this;
    Object.keys(fl).forEach(function (pid) {
      var el = self.world.findElement(fl[pid]);
      if (!el || !self.followTrail.length) return;
      var tp = self.followTrail[Math.max(0, self.followTrail.length - 6)];
      el.x = tp.x; el.y = tp.y;
    });
    // npc.in / bindPlayer 绑定的元素跟随（el.follow = 轨迹回看格数）
    (this.world.elements || []).forEach(function (e) {
      if (!e.follow || !self.followTrail.length) return;
      var back = Math.max(1, e.follow | 0);
      var tp2 = self.followTrail[Math.max(0, self.followTrail.length - back)];
      e.x = tp2.x; e.y = tp2.y;
      e.state = '走路';
    });
    // 倒计时脚本：超时执行指定条目（e.java: 超时回调 this.a(aP)）
    if (this.world.countdown && !this.inBattle) {
      if (Date.now() >= this.world.countdown.until) {
        var cd = this.world.countdown;
        this.world.countdown = null;
        var rr = this.world.runScriptEntry(cd.file, cd.line);
        this.playExecTail(rr);
      }
    }
    // NPC 自带 moveTo 队列
    (this.world.elements || []).forEach(function (e) {
      if (!e.moveTo) return;
      var mx = e.moveTo[0] - e.x, my = e.moveTo[1] - e.y;
      var md = Math.sqrt(mx * mx + my * my);
      if (md < 4) { e.x = e.moveTo[0]; e.y = e.moveTo[1]; e.moveTo = null; e.state = '站立'; }
      else {
        var s2 = Math.max(2, e.velocity || 4);
        e.x += Math.round(mx / md * Math.min(s2, md));
        e.y += Math.round(my / md * Math.min(s2, md));
        e.state = '走路';
      }
    });
    if (!this.inBattle) this.updateMonsters();
    if (!this.inBattle) this.updateNpc();
    // 落石演出
    if (this.rocks.length) {
      for (var i = this.rocks.length - 1; i >= 0; i--) {
        var r = this.rocks[i];
        r.vy += dt * 0.02; r.y += r.vy;
        if (r.y > this.mapPxH() + 40) this.rocks.splice(i, 1);
      }
    }
    void dt;
  };

  /** 落石演出：从屏幕上方掉落一批石头 */
  Scene.prototype.spawnRocks = function () {
    for (var i = 0; i < 8; i++) {
      this.rocks.push({ x: Math.random() * this.mapPxW(), y: -20 - i * 30, vy: 1 + i * 0.3 });
    }
  };

  /** 落石演出绘制（game.dropRock 的视觉部分） */
  Scene.prototype.drawRocks = function () {
    if (!this.rocks.length) return;
    var ctx = this.ctx, vp = this.vp;
    ctx.save();
    ctx.fillStyle = '#999';
    for (var i = 0; i < this.rocks.length; i++) {
      var r = this.rocks[i];
      ctx.fillRect(r.x - vp.x - 4, r.y - vp.y - 4, 8, 8);
    }
    ctx.restore();
  };

  Scene.prototype.drawGrid = function () {
    var m = this.m, ctx = this.ctx, vp = this.vp;
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,255,.25)';
    ctx.beginPath();
    for (var c = 0; c <= m.cols; c++) {
      var x = c * m.tw - vp.x;
      ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, this.cv.height);
    }
    for (var r = 0; r <= m.rows; r++) {
      var y = r * m.th - vp.y;
      ctx.moveTo(0, y + .5); ctx.lineTo(this.cv.width, y + .5);
    }
    ctx.stroke();
    ctx.restore();
  };

  Scene.prototype.hud = function (msg) {
    var ctx = this.ctx;
    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(0, 0, this.cv.width, 42);
    ctx.fillStyle = '#7f7';
    var m = this.m;
    var lines = [
      msg || ('地图 ' + this.mapName + '  ' + (m ? m.cols + '×' + m.rows + ' 格 ' + m.tw + '×' + m.th : '')
        + '  视口 ' + this.vp.x + ',' + this.vp.y),
      '坐标 ' + this.px + ',' + this.py + '  格 '
        + (m ? Math.floor(this.px / m.tw) + ',' + Math.floor(this.py / m.th) : '')
        + '  朝向 ' + this.player.dir + '  状态 ' + this.player.state,
      '本帧 地砖 ' + this.stats.tiles + '  元素 ' + this.stats.objs
        + '  脚本元素 ' + this.stats.elements
        + '  角色帧 ' + this.stats.frames + '  缺资源 ' + this.stats.miss
        + '   [G]网格'
    ];
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], 6, 14 + i * 13);
    ctx.restore();
  };

  // ---------------------------------------------------------- 输入
  Scene.prototype.bindKeys = function () {
    var self = this;
    // ★ newGame 重跑构造器时会再调一次：守卫防重复绑定（否则一次按键走两次）
    if (this._keysBound) return;
    this._keysBound = true;
    var KEY = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      8: 'up', 2: 'down', 4: 'left', 6: 'right'   // ★ 数字键 2468 移动（config 帮助原文）
    };
    var K2E = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
                  w: 'up', s: 'down', a: 'left', d: 'right', Enter: 'ok', ' ': 'ok', Escape: 'cancel' };
    global.addEventListener('keydown', function (e) {
      // ★ 游戏页 DOM 菜单（标题主菜单）开着时，画布输入全锁，按键走宿主菜单
      if (self.inputLocked) { e.preventDefault(); return; }
      if (e.key === 'g' || e.key === 'G') { self.showGrid = !self.showGrid; return; }
      // 标题画面：任意键跳过进游戏
      if (self.title) { e.preventDefault(); self.finishTitle(); return; }
      // 战斗中走战斗输入
      if (self.inBattle && self.battleView) {
        e.preventDefault();
        if (K2E[e.key]) self.battleView.key(K2E[e.key]);
        return;
      }
      // 菜单开着时走菜单输入
      if (self.menu && self.menu.active) {
        e.preventDefault();
        var MKEY = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
                     w: 'up', s: 'down', a: 'left', d: 'right', Enter: 'ok', ' ': 'ok', Escape: 'cancel' };
        if (MKEY[e.key]) self.menuKey(MKEY[e.key]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (self.shop && self.shop.active) { self.shop.close(); self.shop = null; }
        if (self.feeMenu) self.feeMenu = null;
        return;
      }
      // 商城菜单输入
      if (self.feeMenu) {
        e.preventDefault();
        var FKEY = { ArrowUp: 'up', ArrowDown: 'down', Enter: 'ok', ' ': 'ok', Escape: 'cancel' };
        if (FKEY[e.key]) self.feeKey(FKEY[e.key]);
        return;
      }
      // 分支选择：1/2 或上下+回车
      if (self.branch) {
        e.preventDefault();
        if (e.key === '1') { self.chooseBranch(0); return; }
        if (e.key === '2') { self.chooseBranch(1); return; }
        if (e.key === 'ArrowUp' || e.key === 'w') { self.branch.sel = 0; return; }
        if (e.key === 'ArrowDown' || e.key === 's') { self.branch.sel = 1; return; }
        if (e.key === 'Enter' || e.key === ' ') { self.chooseBranch(self.branch.sel); return; }
        return;
      }
      // 等待按键（game.waitForKey）：任意列出的键都可通过
      if (self.waitKeys) {
        var keys = self.waitKeys.keys || [];
        var KN = { fire: ['Enter', ' '], up: ['ArrowUp', 'w'], down: ['ArrowDown', 's'],
                   left: ['ArrowLeft', 'a'], right: ['ArrowRight', 'd'] };
        for (var i = 0; i < keys.length; i++) {
          if ((KN[keys[i]] || []).indexOf(e.key) >= 0) { self.waitKeys = null; e.preventDefault(); return; }
        }
        // 没列出的键也允许用回车通过（避免卡死）
        if (e.key === 'Enter' || e.key === ' ') { self.waitKeys = null; e.preventDefault(); return; }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // 商店开着时，把确认键喂给商店
        if (self.shop && self.shop.active) {
          self.shop.key('ok');
          if (!self.shop.active) self.shop = null;
          return;
        }
        self.interact();
        return;
      }
      // M / Q 开菜单（game.showMenu 对应；Q = 左软键，原版左软键呼出菜单）
      if (e.key === 'm' || e.key === 'M' || e.key === 'q' || e.key === 'Q') { e.preventDefault(); self.openMenu(); return; }
      // 商店里的方向键
      if (self.shop && self.shop.active) {
        var SM = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
                   w: 'up', s: 'down', a: 'left', d: 'right', Enter: 'ok', ' ': 'ok', Escape: 'cancel' };
        if (SM[e.key]) { e.preventDefault(); self.shop.key(SM[e.key]); return; }
      }
      var dir = KEY[e.key];
      if (!dir) return;
      e.preventDefault();
      // 对话进行中不移动
      if (self.talk && self.talk.active) return;
      self.tryMove(dir);
    });
  };

  /**
   * 交互（回车/空格）：
   *   ① 过场字幕/等待按键/分支 → 推进过场
   *   ② 对话进行中 → 推进一步
   *   ③ 宝箱/落石 → 开箱
   *   ④ 否则 → 查找面前 NPC 并启动对话
   */
  Scene.prototype.interact = function () {
    var T = global.XJTalk;
    // 商店开着时交给商店
    if (this.shop && this.shop.active) return false;
    // 过场优先
    if (this.cut) {
      this.cut = null; this.nextCut();
      // ★ 字幕播完且脚本停在 break 上：同一次按键继续往下演（原版一次按键即继续）
      if (!this.cut && !this.cutQueue.length) this.resumeRunner();
      return true;
    }
    if (this.waitKeys) {
      if (!this.waitKeys.until || performance.now() >= this.waitKeys.until) this.waitKeys = null;
      return true;
    }
    if (this.talk && this.talk.active) {
      var st = this.talk.state();
      // 商店 / 分支 优先
      if (st.trade) { this.openShop(st.trade.items); return true; }
      if (st.branch) {
        // ★ 玩家自己选（1/2），选中后跳转 文件:行
        this.branch = { options: st.branch.options, sel: 0, fromTalk: true };
        this.log('分支：' + st.branch.options.map(function (o) { return o.label; }).join(' / '));
        return true;
      }
      if (st.dialog) this.dialogBox = { text: st.dialog.text, speaker: st.dialog.speaker, type: st.dialog.type, visible: true };
      this.talk.advance();
      var st2 = this.talk.state();
      if (st2.trade) { this.openShop(st2.trade.items); return true; }
      if (st2.dialog) this.dialogBox = { text: st2.dialog.text, speaker: st2.dialog.speaker, type: st2.dialog.type, visible: true };
      else if (!this.talk.active) { this.dialogBox = null; this.talk = null; }
      // 对话写进 World 的副作用（任务/事件/金钱等）在这里回放
      this.flushTalkEffects();
      return true;
    }
    if (!this.talk) {
      // ★ 没有字幕但脚本停在 break 上（纯演出段落）：回车继续往下演
      if (this.pausedRunner && !this.cut && !this.cutQueue.length &&
          !this.waitKeys && !this.branch && !this.menu && !this.inBattle) {
        this.resumeRunner();
        return true;
      }
      var npc = T.facingNpc.call({ world: this.world }, this.px, this.py, this.player.dir);
      if (npc) {
        var d = new T.Dialog(this.world, npc.id);
        if (d.start()) {
          this.talk = d;
          var s0 = d.state();
          if (s0.dialog) this.dialogBox = { text: s0.dialog.text, speaker: s0.dialog.speaker, type: s0.dialog.type, visible: true };
          this.log('与 ' + (s0.name || ('NPC ' + npc.id)) + ' 对话');
          return true;
        }
        this.log((T.npcDef(npc.id) || {}).name + ' 没有对话');
        return false;
      }
    }
    // 宝箱 / 落石：30px 内互动（ad.java:23 j.a(...,30)）
    var box = this.nearBox();
    if (box) { this.openBox(box); return true; }
    // 没 facingNpc 时退化：找最近的有对话 NPC
    var els = this.world.elements || [];
    var best = null, bd = 1e9;
    for (var i = 0; i < els.length; i++) {
      var e2 = els[i];
      if (e2.kind !== 'npc') continue;
      var dd = T.npcDef(e2.id);
      if (!dd || !T.talkScript(e2.id)) continue;
      var dist = Math.abs(e2.x - this.px) + Math.abs(e2.y - this.py);
      if (dist < 64 && dist < bd) { bd = dist; best = e2; }
    }
    if (best) {
      var d2 = new T.Dialog(this.world, best.id);
      if (d2.start()) {
        this.talk = d2;
        var s1 = d2.state();
        if (s1.dialog) this.dialogBox = { text: s1.dialog.text, speaker: s1.dialog.speaker, type: s1.dialog.type, visible: true };
        return true;
      }
    }
    return false;
  };

  /** 30px 内的宝箱（ad.java:23） */
  Scene.prototype.nearBox = function () {
    var els = this.world.elements || [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.kind !== 'box' || e.opened) continue;
      var dx = this.px - e.x, dy = this.py - e.y;
      if (dx * dx + dy * dy <= 30 * 30) return e;
    }
    return null;
  };

  /**
   * 开箱（ad.java:20-41）：
   * 未激活「神秘宝藏」→ 请到商城激活；否则按累积权重拿一件（可能空箱），
   * 标记事件 id（下次进图显示开箱状态）。
   */
  Scene.prototype.openBox = function (e) {
    var P = global.XJParty;
    if (!this.world.fees[2]) {
      this.log('请到商城激活');
      this.dialogBox = { text: '请到商城激活', speaker: null, type: null, visible: true };
      return false;
    }
    e.opened = true;
    this.world.events[e.id] = 1;
    var got = P ? P.rollTreasure(null) : null;
    if (!got) {
      this.log('这是空箱子');
      this.dialogBox = { text: '这是空箱子', speaker: null, type: null, visible: true };
    } else {
      this.world.addItem(got, 1);
      this.log('获得' + got);
      this.dialogBox = { text: '获得' + got, speaker: null, type: null, visible: true };
    }
    return true;
  };

  /** 分支选择：执行 文件:行（game.branch 跳转；b.a(file, n) 取第 n 条） */
  Scene.prototype.chooseBranch = function (idx) {
    if (!this.branch) return false;
    var self = this;
    var op = this.branch.options[idx] || this.branch.options[0];
    this.log('选择：' + op.label);
    this.world.push('branch', op);
    this.branch = null;
    // ★ 跨文件跳转：执行目标条目（全部对话进过场队列）
    if (op.file) {
      var r = this.world.runScriptEntry(op.file, op.line);
      this.playExecTail(r, { moveTo: true, dialog: true });
      // 跳转后原对话终结（原版切到别的文件继续）
      if (this.talk) { this.talk.active = false; this.talk = null; }
    } else if (this.talk && this.talk.active) {
      // 无文件目标的分支（防御性）：走原对话继续
      this.talk.choose(idx);
      var st2 = this.talk.state();
      if (st2.dialog) this.dialogBox = { text: st2.dialog.text, speaker: st2.dialog.speaker, type: st2.dialog.type, visible: true };
    }
    return true;
  };

  /** 开菜单（game.showMenu / M 键） */
  Scene.prototype.openMenu = function () {
    if (!global.XJMenu) { this.log('菜单模块未加载'); return null; }
    this.menu = new global.XJMenu.Menu(this.world, this);
    return this.menu;
  };

  Scene.prototype.menuKey = function (k) {
    if (!this.menu) return false;
    this.menu.key(k);
    if (!this.menu.active) this.menu = null;
    return true;
  };

  /** fee 商城（game.showFee；原付费项，复刻版选择即激活并跑对应脚本效果） */
  Scene.prototype.openFee = function () {
    this.feeMenu = { sel: 0 };
    return true;
  };

  Scene.prototype.feeKey = function (k) {
    if (!this.feeMenu) return false;
    var rows = ((XJ.data.config.fee || {}).GotoFee) || [];
    if (k === 'up') { this.feeMenu.sel = (this.feeMenu.sel + rows.length - 1) % rows.length; return true; }
    if (k === 'down') { this.feeMenu.sel = (this.feeMenu.sel + 1) % rows.length; return true; }
    if (k === 'cancel') { this.feeMenu = null; return true; }
    if (k === 'ok') {
      var r = rows[this.feeMenu.sel];
      if (r && global.XJParty) {
        var msg = global.XJParty.activateFee(this.world, parseInt((r.cols || [])[0], 10));
        this.log(msg);
      }
      return true;
    }
    return false;
  };

  Scene.prototype.drawFeeMenu = function () {
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    var rows = ((XJ.data.config.fee || {}).GotoFee) || [];
    var sel = (this.feeMenu && this.feeMenu.sel) || 0;
    ctx.save();
    var bw = W - 60, bh = Math.min(H - 60, 30 + rows.length * 17);
    ctx.fillStyle = 'rgba(0,0,12,.92)';
    ctx.fillRect(30, 30, bw, bh);
    ctx.strokeStyle = '#6a6a8a';
    ctx.strokeRect(30.5, 30.5, bw - 1, bh - 1);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#ffd76a';
    ctx.fillText('商城（回车激活，Esc 关闭）', 40, 44);
    ctx.fillStyle = '#c8c8d0';
    for (var i = 0; i < rows.length; i++) {
      var c = rows[i].cols || [];
      var mark = this.world.fees[c[0]] ? '[已激活]' : '[未激活]';
      ctx.fillStyle = i === sel ? '#ffd76a' : '#c8c8d0';
      ctx.fillText((i === sel ? '▶ ' : '　') + mark + ' ' + rows[i].key, 40, 64 + i * 17);
    }
    ctx.restore();
  };

  // ---------------------------------------------------------- 音频
  Scene.prototype.audioPlay = function (file, loop) {
    if (global.XJAudio) global.XJAudio.play(file, loop);
  };
  Scene.prototype.audioStop = function () {
    if (global.XJAudio) global.XJAudio.stop();
  };
  /** 按地图脚本的 midi.play 切 BGM（进图/战斗结束时调用） */
  Scene.prototype.audioMapBgm = function () {
    if (this.inBattle) return;
    var m = this.m;
    if (!m) return;
    for (var i = 0; i < (m.script || []).length; i++) {
      var c = m.script[i];
      if (c.obj === 'midi' && c.cmd === 'play' && c.raw_args && c.raw_args[0]) {
        this.audioPlay(c.raw_args[0], c.raw_args[1]);
        return;
      }
    }
  };

  /**
   * 开机：读 config_game 初始地图/主角动画，进第一张图。
   * reboot=true 时保留全局状态只重进初始图（system.returnToMainMenu）。
   */
  Scene.prototype.boot = function (reboot) {
    var cfg = (XJ.data.config.gameCfg && XJ.data.config.gameCfg.scalars) || {};
    var map0 = String(cfg['初始场景地图文件'] || 'ms_syt_1.map').replace(/\.map$/i, '');
    var ant0 = String(cfg['主角动画文件'] || 'chonglou.ant').replace(/\.ant$/i, '');
    this.player.ant = ant0;
    this.player.state = '站立';
    this.cutQueue.length = 0; this.cut = null;
    this.waitKeys = null; this.branch = null;
    this.load(map0);
    this.audioMapBgm();
    this.log('开机：' + map0 + '（' + (this.world.mapTitle || '') + '）');
    return true;
  };

  // ---------------------------------------------------------- 标题画面
  /**
   * 标题（h.java）：黑底 → LOGO 动画（corp/logo.ant）→ 播完进游戏。
   * music.play tag 处播 logo.mid（1 遍）；播完自动进 boot，任意键跳过。
   * sp.png 开场 splash 约 1.2s（Startup.java 引用，具体时长未知，取近似值）。
   */
  Scene.prototype.startTitle = function () {
    this.title = { phase: 'splash', acc: 0, musicOn: false, logoAcc: 0 };
    this.spImg = null;
    var self = this;
    var im = new Image();
    im.onload = function () { self.spImg = im; };
    im.src = 'data/img/sp.png';
    return true;
  };

  Scene.prototype.finishTitle = function () {
    if (!this.title) return false;
    this.title = null;
    this.audioStop();
    // ★ 游戏页钩子：标题播完先出主菜单（新的开始/回忆/设置/帮助/关于/离开，
    //   system/b.java:94-99 六项原文），宿主未设钩子时保持旧行为直接 boot。
    if (this.onTitleDone) { this.onTitleDone(); return true; }
    this.boot();
    return true;
  };

  /**
   * 新的开始（system/b.java 主菜单第0项 → new e(null)）：
   * 重跑构造器清掉全部状态（事件/背包/队伍/任务/演出队列…），再 boot 进初始图。
   */
  Scene.prototype.newGame = function () {
    // ★ 构造器重跑会清 _keysBound，但 window 上的旧监听还指着本对象：不再绑，直接复用。
    var bound = this._keysBound;
    Scene.call(this, this.cv);
    this._keysBound = bound;
    this.boot();
    return true;
  };

  /** LOGO 当前帧包围盒（居中用） */
  Scene.prototype.logoBox = function () {
    var A = XJ.data.ant.ants['logo'];
    if (!A) return null;
    var st = XJ.state('logo', 'LOGO');
    if (!st) return null;
    var total = XJ.stateDuration(st);
    var at = Math.min(Math.max(this.title.logoAcc || 0, 0), total - 1), acc = 0, fi = 0;
    for (var i = 0; i < st.q.length; i++) {
      var d = st.q[i][3] || 0;
      if (at < acc + d) { fi = i; break; }
      acc += d; fi = i;
    }
    var seq = st.q[fi], part = A.layers[seq[0]] || [];
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    part.forEach(function (q) {
      var c = A.clips[q[0]];
      if (!c) return;
      var ft = XJ.FLAG_TABLE[q[3]] || XJ.FLAG_TABLE[0];
      var w = ft.swap ? c[4] : c[3], h = ft.swap ? c[3] : c[4];
      var x = q[1] + seq[1], y = q[2] + seq[2];
      if (x < x0) x0 = x; if (y < y0) y0 = y;
      if (x + w > x1) x1 = x + w; if (y + h > y1) y1 = y + h;
    });
    if (x1 < x0) return null;
    return { x0: x0, y0: y0, w: x1 - x0, h: y1 - y0, frame: fi };
  };

  Scene.prototype.drawTitle = function (dt) {
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height, t = this.title;
    // ★ 用帧 dt 累计（后台切走时 rAF 停，墙钟会跳变导致标题被跳过）
    t.acc += dt || 16;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    if (t.phase === 'splash') {
      if (this.spImg && this.spImg.naturalWidth) {
        var sw = this.spImg.naturalWidth, sh = this.spImg.naturalHeight;
        ctx.drawImage(this.spImg, (W - sw) / 2, (H - sh) / 2);
      }
      if (t.acc > 1200) { t.phase = 'logo'; t.logoAcc = 0; }
      ctx.restore();
      return true;
    }
    // LOGO 动画（播完自动进游戏）
    var A = XJ.data.ant.ants['logo'];
    var st = A && XJ.state('logo', 'LOGO');
    if (!st) { this.finishTitle(); ctx.restore(); return true; }
    t.logoAcc += dt || 16;
    var box = this.logoBox();
    var ox = box ? (W - box.w) / 2 - box.x0 : W / 2;
    var oy = box ? (H - box.h) / 2 - box.y0 : H / 2;
    var r = XJ.drawState(ctx, 'logo', st, ox, oy, t.logoAcc, false);
    // music.play tag 帧播音乐（h.java: g() 检查 tag=="music.play();"）
    if (!t.musicOn) {
      var tags = XJ.stateScripts('logo', st, (box && box.frame) || 0);
      if (tags.some(function (s) { return /music\.play/.test(s); })) {
        t.musicOn = true;
        this.audioPlay('logo', 1);
      }
    }
    ctx.restore();
    if (r.done) this.finishTitle();
    return true;
  };

  Scene.prototype.start = function () {
    var self = this;
    this.bindKeys();
    var last = performance.now();
    (function loop() {
      var now = performance.now();
      var dt = Math.min(64, now - last);
      last = now;
      self.render(dt);
      requestAnimationFrame(loop);
    })();
  };

  global.XJScene = Scene;

  /**
   * 像素级自检：验证地砖网格对齐零漂移。
   * 做法：同一地图渲染两帧，相机精确移动一格(16px)，
   * 逐像素比对「A 的 [shift, w) 列」与「B 的 [0, w-shift) 列」。
   * 必须 100% 相同，否则说明坐标计算有 off-by-one。
   * 注意必须屏蔽 hud()，因为 HUD 会显示坐标文字，位移后本就该不同。
   */
  Scene.prototype.verifyDrift = function (mapName, axis) {
    axis = axis || 'x';
    var ctx = this.ctx, self = this;
    var oDO = this.drawObjects, oDA = this.drawActor, oHUD = this.hud;
    this.drawObjects = function () {}; this.drawActor = function () {};
    this.hud = function () {};
    var grab = function () {
      self.render();
      return ctx.getImageData(0, 0, self.cv.width, self.cv.height).data;
    };
    this.load(mapName || 'cs_ljb_1');
    this.px = this.mapPxW() / 2; this.py = this.mapPxH() / 2;
    this.vp.centerOn(this.px, this.py, this.mapPxW(), this.mapPxH());
    var A = grab().slice();
    var v0 = axis === 'x' ? this.vp.x : this.vp.y;
    if (axis === 'x') this.px += this.m.tw; else this.py += this.m.th;
    this.vp.centerOn(this.px, this.py, this.mapPxW(), this.mapPxH());
    var B = grab();
    var sh = (axis === 'x' ? this.vp.x : this.vp.y) - v0;
    var W = this.cv.width, H = this.cv.height, same = 0, diff = 0, first = null;
    var x0 = axis === 'x' ? sh : 0, x1 = axis === 'x' ? W : W - sh;
    var y0 = axis === 'y' ? sh : 0, y1 = axis === 'y' ? H : H - sh;
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        var ia = (y * W + x) * 4;
        var ib = (axis === 'x' ? (y * W + x - sh) : ((y - sh) * W + x)) * 4;
        if (A[ia] === B[ib] && A[ia + 1] === B[ib + 1] && A[ia + 2] === B[ib + 2]) same++;
        else {
          diff++;
          if (!first) first = { x: x, y: y, a: [A[ia], A[ia + 1], A[ia + 2]], b: [B[ib], B[ib + 1], B[ib + 2]] };
        }
      }
    }
    this.drawObjects = oDO; this.drawActor = oDA; this.hud = oHUD;
    return { map: mapName || 'cs_ljb_1', axis: axis, shift: sh, same: same, diff: diff,
             drift: diff === 0 ? '零漂移' : '有漂移', firstDiff: first };
  };

  /** 一次跑完所有地图的缺资源统计 */
  Scene.prototype.verifyAllMaps = function () {
    var tot = { miss: 0, pending: 0 }, bad = [], tiles = 0, objs = 0;
    for (var n of Object.keys(global.XJ.data.maps.maps).sort()) {
      this.load(n); this.render();
      tot.miss += this.stats.miss; tot.pending += this.stats.pending;
      tiles += this.stats.tiles; objs += this.stats.objs;
      if (this.stats.miss) bad.push(n + ':' + this.stats.miss);
    }
    return { maps: Object.keys(global.XJ.data.maps.maps).length,
             miss: tot.miss, pending: tot.pending,
             tilesDrawn: tiles, objectsDrawn: objs, badMaps: bad };
  };
})(typeof window !== 'undefined' ? window : globalThis);