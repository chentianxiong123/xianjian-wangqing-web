/* xj_battleview.js —— 战斗画面
 *
 * 渲染与交互严格对照 f.java（战斗画布）：
 *   槽位：英雄 [182,249] [150,272] [210,219]；敌兵 [26,164] [40,128] [86,113]
 *   英雄 ANT：slot0→fight_cl，slot1→fight_lyr，slot2→fight_zx（f.java:186-188）
 *   怪物 ANT：fight_<ID>.ant，ID = fight_N.str 的 ID 列（f.java:231）
 *   背景 ANT：enemy.str 第 4 列（如 fight_conglin / fight_mishi / fight_ssm）
 *
 * 流程：
 *   tick 推进行动条 → 有人到 W → 英雄开指令菜单 / 怪物执行 AI →
 *   到 1000 执行技能 → 结算 → 胜/败转回地图。
 */
(function (global) {
  'use strict';
  var XJ = global.XJ, XB = global.XJBattle;

  var HERO_ANTS = ['fight_cl', 'fight_lyr', 'fight_zx'];

  function BattleView(canvas, opts) {
    opts = opts || {};
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.battle = opts.battle || null;
    this.world = opts.world || null;         // 传回事件/gold/exp
    this.onEnd = null;                       // 回调(win|lose)
    this.menu = null;                        // {unit, sel, options, x, y}
    this.target = null;                      // {from, options:[units], sel}
    this.popups = [];                        // 飘字动画
    this.msg = null; this.msgTimer = 0;
    this.t0 = performance.now();
    this.bgAnt = opts.bgAnt || 'fight_mishi';
    this.vp = { x: 0, y: 0, w: canvas.width, h: canvas.height };
    this.stats = { frames: 0 };
    this._skillsLoaded = false;
  }

  BattleView.prototype.setBattle = function (b, bgAnt) {
    this.battle = b;
    if (bgAnt) this.bgAnt = bgAnt;
    // 给每个单位绑定 ANT 与站位
    var C = XJ.C();
    b.heroes.forEach(function (u, i) {
      u.ant = HERO_ANTS[i] || HERO_ANTS[0];
      var p = C.HERO_SLOTS[i] || [182, 249];
      u.px = p[0]; u.py = p[1];
    });
    b.foes.forEach(function (u, i) {
      var id = (u.def_ && u.def_.ID) || u.cfgId || 0;
      u.ant = 'fight_' + id;
      if (!XJ.data.ant.ants[u.ant]) u.ant = 'fight_1';
      var p = C.FOE_SLOTS[i] || [26, 164];
      u.px = p[0]; u.py = p[1];
    });
    return this;
  };

  // ------------------------------------------------------------ 渲染
  /**
   * 画战斗背景。
   * ★ 原版 f.java 把 ANT 状态（fight_mishi 等的「战斗背景」帧）和
   *   图片分开：布局来自 ANT 的 layer 记录，图片固定用 fight_beijing.bin。
   *   所以 clip.sheet 是到 fight_beijing 的下标，不是 ANT 自身 bin 的。
   */
  BattleView.prototype.drawBackground = function () {
    var ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    var a = XJ.data.ant.ants[this.bgAnt];
    if (!a) return;
    var st = null;
    for (var si = 0; si < a.states.length; si++) {
      if (a.states[si].n === '战斗背景') { st = a.states[si]; break; }
    }
    if (!st) st = a.states[0];
    if (!st) return;
    var BIN = 'fight_beijing';
    var seq = st.q[0];
    var part = a.layers[seq[0]] || [];
    for (var k = part.length - 1; k >= 0; k--) {
      var q = part[k];
      var c = a.clips[q[0]];
      if (!c) continue;
      // clip.sheet → fight_beijing 的条目下标
      var ents = XJ.data.bin.bins[BIN] || [];
      if (c[0] < 0 || c[0] >= ents.length) continue;
      var ft = XJ.FLAG_TABLE[q[3]] || XJ.FLAG_TABLE[0];
      var dw = ft.swap ? c[4] : c[3];
      var dh = ft.swap ? c[3] : c[4];
      // 背景按战斗区拉伸铺满
      var im = XJ.sprite(BIN, c[0]);
      if (!im || !im.naturalWidth) continue;
      ctx.save();
      if (ft.t) {
        ctx.translate(q[1] + dw / 2, q[2] + dh / 2);
        var tf = XJ.transformToCanvas(ft.t);
        if (tf.flipX) ctx.scale(-1, 1);
        if (tf.rot) ctx.rotate(tf.rot * Math.PI / 180);
        ctx.drawImage(im, c[1], c[2], c[3], c[4],
          -c[3] / 2, -c[4] / 2, this.cv.width, this.cv.height);
      } else {
        ctx.drawImage(im, c[1], c[2], c[3], c[4], q[1] + seq[1], q[2] + seq[2],
          this.cv.width, this.cv.height);
      }
      ctx.restore();
    }
  };

  /** 单位的 ANT 状态名：按 ax.t 状态机 + 变身/重伤 */
  BattleView.prototype.unitStateName = function (u) {
    if (u.ac) {
      switch (u.t) {
        case 2: return '变身攻击';
        case 8: return '变身动画';
        case 7: return '死亡';
        default: return '变身站立';
      }
    }
    if (u.isDead()) return '死亡';
    if (u.isWounded && u.isWounded()) return '重伤';
    switch (u.t) {
      case 2: return '攻击';
      case 8: return '仙术释放';
      case 1: return '消失';
      default: return '站立';
    }
  };

  BattleView.prototype.drawUnit = function (u) {
    var ctx = this.ctx, t = performance.now() - this.t0;
    var a = u.ant ? XJ.data.ant.ants[u.ant] : null;
    if (!a) return;
    var st = XJ.state(u.ant, this.unitStateName(u)) ||
             XJ.resolveState(u.ant, '站立', 'down') || a.states[0];
    if (!st) return;
    XJ.drawState(ctx, u.ant, st, u.px - this.vp.x, u.py - this.vp.y,
      t + (u.slot * 137), true);
  };

  BattleView.prototype.drawHpBar = function (u) {
    var ctx = this.ctx, W2 = 56, H2 = 5;
    var x = u.px - this.vp.x - (W2 >> 1), y = u.py - this.vp.y - 56;
    var pct = Math.max(0, Math.min(1, u.I / Math.max(1, u.J)));
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(x - 1, y - 1, W2 + 2, H2 + 2);
    ctx.fillStyle = u.side === 'hero' ? '#3c6' : '#c33';
    ctx.fillRect(x, y, Math.round(W2 * pct), H2);
    ctx.fillStyle = '#eee';
    ctx.font = '9px monospace';
    ctx.fillText(u.name, x, y - 3);
    ctx.restore();
  };

  /** 速度条：W 阈值线 + 每个单位的行动条刻度 */
  BattleView.prototype.drawGauge = function () {
    var b = this.battle;
    if (!b) return;
    var ctx = this.ctx, W = this.cv.width;
    var y0 = this.cv.height - 12;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(4, y0 - 6, W - 8, 10);
    // W 阈值线
    var wx = 4 + (W - 8) * (b.W / b.GAUGE_MAX);
    ctx.fillStyle = '#fd6';
    ctx.fillRect(wx, y0 - 6, 1, 10);
    b.units.forEach(function (u, i) {
      if (u.isDead()) return;
      var x = 4 + (W - 8) * (Math.min(u.i, b.GAUGE_MAX) / b.GAUGE_MAX);
      ctx.fillStyle = u.side === 'hero' ? (i === 0 ? '#6cf' : '#9cf') : '#f66';
      ctx.fillRect(x - 1, y0 - 5 + (i % 3) * 3, 3, 3);
    });
    ctx.restore();
  };

  /** 飘字（a=飘字类型） */
  BattleView.prototype.spawnPopups = function () {
    var b = this.battle;
    if (!b) return;
    while (b.popups.length) {
      var p = b.popups.shift();
      var u = null;
      b.units.forEach(function (x) { if (x.name === p.unit) u = x; });
      if (!u) continue;
      var txt = p.kind === 2 ? '闪避' : (p.kind === 3 ? '+' + p.value :
                (p.kind === 4 ? '未命中' : (p.kind === 5 ? '吸收' + p.value :
                (p.kind === 1 ? '暴击' + p.value : String(p.value)))));
      this.popups.push({
        x: u.px - this.vp.x, y: u.py - this.vp.y - 70,
        t: 0, life: 1000, txt: txt,
        color: p.kind === 1 ? '#fd4' : (p.side === 'hero' ? '#f66' : '#ff6')
      });
    }
  };

  BattleView.prototype.drawPopups = function (dt) {
    var ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    for (var i = this.popups.length - 1; i >= 0; i--) {
      var p = this.popups[i];
      p.t += dt;
      if (p.t >= p.life) { this.popups.splice(i, 1); continue; }
      var k = p.t / p.life;
      var y = p.y - k * 26;
      var a = 1 - k * k;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#000';
      ctx.fillText(p.txt, p.x + 1, y + 1);
      ctx.fillStyle = p.color;
      ctx.fillText(p.txt, p.x, y);
    }
    ctx.restore();
  };

  // ------------------------------------------------------------ 指令菜单
  var MENU = ['攻击', '仙术', '物品', '防御', '逃跑'];

  BattleView.prototype.openMenu = function (u) {
    var opts = MENU.slice();
    // ★ 有魔尊真身（id 7）才出现变身选项
    var ns = (u.skills && u.skills.normal) || [];
    for (var i = 0; i < ns.length; i++) {
      if (ns[i].id === 7 || ns[i].name === '魔尊真身') { opts.push('变身'); break; }
    }
    this.menu = { unit: u, sel: 0, options: opts };
  };

  BattleView.prototype.drawMenu = function () {
    if (!this.menu) return;
    var ctx = this.ctx;
    var opts = this.menu.options, W = this.cv.width;
    var bw = 96, bh = opts.length * 18 + 12;
    var bx = W - bw - 6, by = this.cv.height - bh - 22;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,12,.88)';
    ctx.strokeStyle = '#6a6a8a';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    for (var i = 0; i < opts.length; i++) {
      ctx.fillStyle = i === this.menu.sel ? '#ffd76a' : '#c8c8d0';
      ctx.fillText((i === this.menu.sel ? '▶ ' : '　') + opts[i], bx + 8, by + 20 + i * 18);
    }
    ctx.restore();
  };

  /** 目标选择：增益类选己方，否则选敌方存活单位 */
  BattleView.prototype.openTarget = function (from, skill) {
    var pool = skill && skill.gain
      ? this.battle.heroes.filter(function (u) { return !u.isDead(); })
      : this.battle.foes.filter(function (u) { return !u.isDead(); });
    if (!pool.length) return false;
    this.target = { from: from, skill: skill, options: pool, sel: 0 };
    return true;
  };

  BattleView.prototype.drawTarget = function () {
    if (!this.target) return;
    var ctx = this.ctx, o = this.target.options[this.target.sel];
    if (!o) return;
    ctx.save();
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(o.px - this.vp.x - 22, o.py - this.vp.y - 62, 44, 62);
    ctx.restore();
  };

  // ------------------------------------------------------------ 主循环
  BattleView.prototype.frame = function (dt) {
    var b = this.battle;
    if (!b) return;
    this.stats.frames++;

    // 行动条推进
    var r = b.tick();
    this.spawnPopups();

    // 有人轮到：英雄开菜单，怪物执行 AI
    for (var i = 0; i < r.began.length; i++) {
      var u = r.began[i];
      // 变身扣气（bd.java:43）
      b.payMorph(u);
      if (u.side === 'hero') {
        if (!this.menu && !this.target) this.openMenu(u);
      } else {
        this.monsterAct(u);
      }
    }
    // 回合结束（到 1000）→ 执行技能
    for (var j = 0; j < r.ended.length; j++) this.unitAct(r.ended[j]);

    var over = b.checkOver();
    if (over && !this._overHandled) {
      this._overHandled = true;
      this.finish(over);
    }
  };

  /** 双方队伍（供 execSkill 选目标） */
  BattleView.prototype.ctxTeams = function () {
    var b = this.battle;
    return { allies: b.heroes.slice(), foes: b.foes.slice() };
  };

  BattleView.prototype.fx = function () {
    var self = this, b = this.battle;
    return {
      msg: function (s) { if (s) self.msg = s; },
      // ★ 偷窃：从携带表扣 1 个进背包（ax.java:825-837）
      steal: function (foe) {
        if (!foe || !foe.carryList) return null;
        for (var i = 0; i < foe.carryList.length; i++) {
          if (foe.carryList[i].count > 0) {
            foe.carryList[i].count--;
            if (self.world) self.world.addItem(foe.carryList[i].name, 1);
            return foe.carryList[i].name;
          }
        }
        return null;
      }
    };
  };

  /** 怪物行动：AI 选技能 → execSkill 直接执行 */
  BattleView.prototype.monsterAct = function (u) {
    var b = this.battle;
    var sk = b.aiPickSkill(u, {
      carryItems: ((u.carryList || []).filter(function (c) { return c.count > 0; })
        .map(function (c) { return c.name; })),
      spellSkills: (u.skills && u.skills.spell) || [],
      normalSkills: (u.skills && u.skills.normal) || []
    });
    if (sk.useItem) {
      this.msg = u.name + ' 使用物品：' + sk.useItem;
      b.tick && b.resetGauge(u);
      return;
    }
    var skill = sk.skill;
    var targets = skill && skill.all ? b.heroes : [this.pickHero()];
    var s = { name: skill && skill.name, formula: skill && skill.formula,
            kindCode: skill ? skill.kindCode : 0, all: !!(skill && skill.all),
            anim: skill && skill.anim, costGas: 0, costMp: 0 };
    // ★ 怪物行动期增量 = fight_N.str 仙术速度求值（slv 恒 1，见战斗系统.md）
    u.c = Math.max(1, u.skillSpeed || 10);
    u.t = 2;
    var self = this;
    this._queue = this._queue || [];
    var qfn = function () {
      var r = b.execSkill(u, s, (targets.filter(function (t) { return !t.isDead(); }))[0],
        { allies: b.foes.slice(), foes: b.heroes.slice() }, self.fx());
      void r;
    };
    qfn._unit = u;
    this._queue.push(qfn);
  };

  BattleView.prototype.pickHero = function () {
    var b = this.battle;
    // f.i()：随机起点找存活玩家
    var alive = b.heroes.filter(function (u) { return !u.isDead(); });
    if (!alive.length) return b.heroes[0];
    return alive[(Math.random() * alive.length) | 0];
  };

  /** 回合结束执行技能（只执行属于本单位的队列项，避免串招） */
  BattleView.prototype.unitAct = function (u) {
    var b = this.battle;
    if (u.side === 'hero' && u === this._actingHero) {
      // 玩家指令已在选择时直接执行，这里只重置
    }
    var q = this._queue || [], rest = [];
    while (q.length) {
      var fn = q.shift();
      if (fn && fn._unit && fn._unit !== u) { rest.push(fn); continue; }
      fn();
    }
    this._queue = rest;
    b.resetGauge(u);
    this._actingHero = null;
  };

  /** 战斗结束 */
  BattleView.prototype.finish = function (over) {
    var b = this.battle;
    if (over === 1) {
      var r = b.settleWin(b.expTotal || 0, b.goldTotal || 0);
      this.msg = '战斗胜利！';
      if (this.onEnd) this.onEnd('win', r);
    } else if (over === 3) {
      this.msg = '逃跑成功！';
      if (this.onEnd) this.onEnd('escape', null);
    } else {
      this.msg = '你失败了！！';
      if (this.onEnd) this.onEnd('lose', null);
    }
  };

  // ------------------------------------------------------------ 输入
  BattleView.prototype.key = function (e) {
    var b = this.battle;
    if (!b || b.phase !== 0) return false;

    if (this.target) {
      var n = this.target.options.length;
      if (e === 'left' || e === 'up') { this.target.sel = (this.target.sel + n - 1) % n; return true; }
      if (e === 'right' || e === 'down') { this.target.sel = (this.target.sel + 1) % n; return true; }
      if (e === 'ok') {
        var t = this.target.options[this.target.sel];
        var from = this.target.from, sk = this.target.skill;
        this.target = null; this.menu = null;
        this._actingHero = from;
        this.heroAct(from, sk, t);
        return true;
      }
      if (e === 'cancel') { this.target = null; this.openMenu(this.menu.unit); return true; }
      return false;
    }

    // 物品子菜单：选物品 → 选己方目标
    if (this.menu && this.menu.isItem) {
      var io = this.menu.options;
      if (e === 'up') { this.menu.sel = (this.menu.sel + io.length - 1) % io.length; return true; }
      if (e === 'down') { this.menu.sel = (this.menu.sel + 1) % io.length; return true; }
      if (e === 'cancel') { this.openMenu(this.menu.unit); return true; }
      if (e === 'ok') {
        var itemName = io[this.menu.sel];
        var u2 = this.menu.unit;
        this.menu = null;
        this.useBattleItem(u2, itemName);
        return true;
      }
      return false;
    }

    if (this.menu) {
      var opts = this.menu.options;
      if (e === 'up') { this.menu.sel = (this.menu.sel + opts.length - 1) % opts.length; return true; }
      if (e === 'down') { this.menu.sel = (this.menu.sel + 1) % opts.length; return true; }
      if (e === 'cancel') { this.menu = null; return true; }
      if (e === 'ok') {
        // ★ 仙术子菜单：先验神气再选目标
        if (this.menu.isSpell) {
          var su0 = this.menu.unit;
          var ssk0 = this.menu.skills[this.menu.sel];
          if (su0.O < (ssk0.costGas || 0) || su0.M < (ssk0.costMp || 0)) {
            this.msg = '神气不足，放不出' + ssk0.name;
            return true;
          }
          this.openTarget(su0, ssk0);
          return true;
        }
        var cmd = opts[this.menu.sel], u = this.menu.unit;
        if (cmd === '攻击') {
          var normals = (u.skills && u.skills.normal) || [];
          var atk0 = [{ name: '攻击', formula: 'atk', kindCode: 0, all: false }];
          var allN = atk0.concat(normals.filter(function (s) { return s.name !== '攻击'; }));
          if (allN.length <= 1) {
            this.openTarget(u, allN[0]);
          } else {
            // ★ 普通攻击子菜单：默认 攻击 + 已学普通技
            this.menu = { unit: u, sel: 0, options: allN.map(function (s) { return s.name; }),
                          skills: allN, isSpell: true, isAttack: true };
          }
        } else if (cmd === '仙术') {
          var spells = u.skills && u.skills.spell;
          if (!spells || !spells.length) {
            this.msg = '没有可用的仙术';
            return true;
          }
          this.menu = { unit: u, sel: 0, options: spells.map(function (s) { return s.name; }),
                        skills: spells, isSpell: true };
        } else if (cmd === '防御') {
          u.ab = true;
          this.menu = null;
          this.msg = u.name + ' 进入防御';
        } else if (cmd === '逃跑') {
          this.menu = null;
          this.msg = u.name + ' 逃跑';
          this._queue = this._queue || [];
          var bb = b;
          var qfn4 = function () {
            if (Math.random() < 0.5) { bb.phase = 3; }
          };
          qfn4._unit = u;
          this._queue.push(qfn4);
        } else if (cmd === '物品') {
          var items = this.battleItems();
          if (!items.length) { this.msg = '没有可用的物品'; return true; }
          this.menu = { unit: u, sel: 0, options: items, isItem: true };
        } else if (cmd === '变身') {
          var ms = ((u.skills && u.skills.normal) || []).filter(function (s) { return s.id === 7 || s.name === '魔尊真身'; })[0];
          if (!ms) { this.msg = '没有可变身的技能'; return true; }
          if (u.O < (ms.costGas || 0)) { this.msg = '气不足，不能变身'; return true; }
          this.menu = null;
          this._actingHero = u;
          this.heroAct(u, ms, null);
        }
        return true;
      }
      return false;
    }
    return false;
  };

  /** 英雄行动：execSkill 入队（到 1000 时真正执行） */
  BattleView.prototype.heroAct = function (from, sk, target) {
    var b = this.battle, self = this;
    from.s = { name: sk && sk.name, formula: sk && sk.formula,
               kindCode: sk ? sk.kindCode : 0, all: !!(sk && sk.all),
               anim: sk && sk.anim, costGas: sk && sk.costGas, costMp: sk && sk.costMp,
               level: sk && sk.level };
    from.t = sk && sk.kindCode !== 0 ? 8 : 2;
    // ★ 行动期增量按仙术速度公式设（bd.a：c = eval(仙术速度, slv)）
    if (self.world && self.world._party && from.heroName) {
      try {
        var P = self.world._party;
        var hs = P.heroes(self.world);
        var h = P.heroByName(self.world, from.heroName) || hs[from.heroName];
        var slv = (sk && sk.kindCode === 0) ? 4 : (sk && sk.level) || 1;
        if (sk && sk.id === 7) slv = 5;
        if (h) {
          var f = (P.roleCfg(h.role).formulas || {})['仙术速度'];
          if (f && f.expr) from.c = Math.max(1, P && b.evalFormula(f.expr, slv, 0));
        }
      } catch (e) { /* 兜底：onTurnStart 设 10 */ }
    }
    this._queue = this._queue || [];
    var qfn2 = function () {
      var r = b.execSkill(from, from.s, target,
        { allies: b.heroes.slice(), foes: b.foes.slice() }, self.fx());
      if (!r.ok) self.msg = r.reason || '放不出技能';
      else if (self.world && self.world._party && from.heroName && sk && sk.kindCode !== 0 && sk.id != null) {
        // ★ 仙术命中后记使用次数（升级/连招用，bj.a/b）
        var rec = self.world._party.recordArtUse(self.world, from.heroName, sk.id);
        if (rec.unlocked.length) self.msg = '领悟了新技能' + rec.unlocked.join('、');
      }
    };
    qfn2._unit = from;
    this._queue.push(qfn2);
  };

  /** 战斗中可用物品：背包里的药品 */
  BattleView.prototype.battleItems = function () {
    var out = [];
    var items = (this.world && this.world.items) || {};
    Object.keys(items).forEach(function (k) {
      if (items[k] > 0 && window.XJShop && window.XJShop.typeOf(k) === '药品') out.push(k);
    });
    return out;
  };

  /** 战斗中使用物品：选己方目标 */
  BattleView.prototype.useBattleItem = function (u, itemName) {
    var b = this.battle;
    var allies = b.heroes.filter(function (x) { return !x.isDead() || /还魂|九转/.test(itemName); });
    if (!allies.length) { this.msg = '没有可用目标'; this.openMenu(u); return; }
    // 默认给自己用；复活类给第一个阵亡者
    var target = allies[0];
    for (var i = 0; i < allies.length; i++) {
      if (allies[i].isDead()) { target = allies[i]; break; }
    }
    if (!target.isDead() && target === u) target = u;
    this._actingHero = u;
    u.t = 8;
    var self = this;
    this._queue = this._queue || [];
    var qfn3 = function () {
      if ((self.world.items[itemName] || 0) <= 0) { self.msg = '没有' + itemName; return; }
      var P = window.XJParty;
      var hname = target.heroName || target.name;
      var r = P ? P.useItem(self.world, hname, itemName) : { ok: false };
      if (r.ok) {
        // 同步回战斗单位
        var h = P ? (P.heroByName(self.world, hname) || P.heroes(self.world)[hname]) : null;
        if (h) {
          var st = P.statsOf(h);
          target.I = h.hp; target.J = st.maxHp;
          target.M = h.mp; target.N = st.maxMp;
          if (target.isDead() && h.hp > 0) { target.t = 0; target.dead = false; }
        }
        b.popup(target, 3, 0);
        self.msg = r.msg;
      } else {
        self.msg = r.msg || '用不出';
      }
    };
    qfn3._unit = u;
    this._queue.push(qfn3);
    this.menu = null;
  };

  // ------------------------------------------------------------ 渲染入口
  BattleView.prototype.render = function (dt) {
    this.drawBackground();
    var b = this.battle;
    if (!b) return;
    this.sortForDraw();
    for (var i = 0; i < this._drawList.length; i++) {
      this.drawUnit(this._drawList[i]);
      this.drawHpBar(this._drawList[i]);
    }
    this.drawGauge();
    this.drawPopups(dt);
    this.drawMenu();
    this.drawTarget();
    if (this.msg) {
      var ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.7)';
      ctx.fillRect(6, 6, this.cv.width - 12, 20);
      ctx.fillStyle = '#ffd76a';
      ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(this.msg, 12, 20);
      ctx.restore();
    }
  };

  BattleView.prototype.sortForDraw = function () {
    var b = this.battle;
    // y 越大越靠前绘制（越晚画越在上层）
    this._drawList = b.units.slice().sort(function (p, q) { return p.py - q.py; });
  };

  global.XJBattleView = BattleView;
})(typeof window !== 'undefined' ? window : globalThis);