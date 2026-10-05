/* xj_world.js —— 世界状态与地图元素装配
 *
 * 负责把「地图脚本 + 对象脚本」真正跑成可见的世界：
 *   1. World  —— 全局状态（事件标记、调试 flag、金钱、背包、队伍、好感度）
 *   2. 装配元素 —— 遍历元素层对象，带脚本的自建元素，无脚本的用地图 elementAnt
 *   3. 传送出口 —— world.change / npc.setPosition 等
 *
 * ★ 两种元素必须分开处理（实测 cs_ss_d 元素层 106 个对象：
 *   28 个带脚本 → 脚本里 element.addToNpc 自带 ANT；
 *   78 个无脚本 → 用地图的 elementAnt + anim 状态索引）
 */
(function (global) {
  'use strict';
  var XJ = global.XJ, XS = global.XJScript;

  // ------------------------------------------------------------ 世界状态
  function World(opts) {
    opts = opts || {};
    this.events = {};          // event<数字> → 0/1
    this.fees = {};            // 调试 flag
    this.gold = opts.gold != null ? opts.gold : 0;
    this.items = Object.create(null);
    this.party = Object.create(null);   // 队友名 → 好感度
    this.heroes = Object.create(null);  // 持久角色记录（XJParty）
    this.members = ['chonglou'];        // 出战 key（chonglou/liyiru/zixuan）
    this.followers = Object.create(null); // partner id → 跟随的 NPC id
    this.fly = false;                   // 御剑飞行（setFlyEnabled）
    this.mapTitle = '';                 // world.setName 的地图中文名（对接 enemy.str）
    this.showNpc = true;                // game.showNpc（默认全显示）
    this.showPlayer = true;             // game.showPlayer
    this.showMonster = true;            // game.showMonster / hideMonster
    this.countdown = null;              // {until, file, line} 倒计时脚本
    this.deferred = { intents: [], messages: [] };  // 延迟到 drain 的 UI 意图
    if (global.XJParty) global.XJParty.initParty(this);
    this.tasks = [];
    this.skills = Object.create(null);
    this.mapName = '';
    this.elements = [];
    this.plainObjects = [];
    this.zones = [];
    this.playerDir = 'down';
    this.tasks = this.tasks || [];
    this.playerX = 0; this.playerY = 0;
    this.pending = [];         // 需要宿主处理的副作用（对话/战斗/传送…）
    this.dialog = null;        // {text, type, visible, portrait}
    this.mapName_ = '';
    this.log = [];
    // 表达式作用域（e.java:2302 注入 player.x / player.y）
    this.scope = new XS.Expr();
    this.interp = new XS.Interp(this);
    this.stats = { elements: 0, scripted: 0, plain: 0, removed: 0, unknown: 0 };
  }

  // ---- 供 Cond / Interp / Expr 调用的状态接口 ----
  World.prototype.expr = function (s) {
    return XS.evalExpr(s, { 'player.x': this.playerX, 'player.y': this.playerY, lv: 1 });
  };
  World.prototype.event = function (n) { return this.events[n] || 0; };
  World.prototype.fee = function (n) { return !!this.fees[n]; };
  World.prototype.itemCount = function (n) { return this.items[n] || 0; };
  // ★ 好感条件用数字 id（0=月瑶 1=紫萱），名字也兼容
  World.prototype._feelingKey = function (n) {
    var P = global.XJParty;
    if (P && P.PARTNER_ROLE && P.PARTNER_ROLE[n] != null) {
      var hs = this.heroes || {};
      var h = hs[P.PARTNER_ROLE[n]];
      return h ? h.name : n;
    }
    return n;
  };
  World.prototype.feeling = function (n) { return this.party[this._feelingKey(n)] || 0; };
  World.prototype.partnerExists = function (n) {
    var P = global.XJParty;
    if (P && P.PARTNER_ROLE && P.PARTNER_ROLE[n] != null)
      return (this.members || []).indexOf(P.PARTNER_ROLE[n]) >= 0;
    return this.party[n] !== undefined;
  };

  World.prototype.addItem = function (n, c) { this.items[n] = (this.items[n] || 0) + (c || 1); };
  World.prototype.removeItem = function (n, c) {
    this.items[n] = Math.max(0, (this.items[n] || 0) - (c || 1));
  };
  World.prototype.addGold = function (n) { this.gold = Math.max(0, this.gold + n); };

  World.prototype.push = function (kind, data) {
    this.pending.push({ kind: kind, data: data });
    if (this.pending.length > 400) this.pending.shift();
    return data;
  };

  // ------------------------------------------------------------ 元素
  /**
   * 装配一张地图的全部元素。
   * 顺序：地图级脚本 → 逐个对象脚本（元素层优先，再遮挡层）
   */
  World.prototype.build = function (mapName, playerX, playerY, opts) {
    var m = XJ.map(mapName);
    opts = opts || {};
    this.elements = [];
    this.plainObjects = [];
    this.zones = [];
    this.playerDir = 'down';
    this.tasks = this.tasks || [];
    this.stats = { elements: 0, scripted: 0, plain: 0, removed: 0, unknown: 0 };
    if (!m) return this;
    this.mapName = mapName;
    // ★ 每次装配前清空解释器效果队列，否则切图后旧效果会残留
    this.interp.effects.length = 0;
    // ★ 地图中文名（world.setName 首个）→ 对接 enemy.str 遇敌键
    this.mapTitle = '';
    for (var si = 0; si < (m.script || []).length; si++) {
      var sc = m.script[si];
      if (sc.obj === 'world' && sc.cmd === 'setName' && sc.raw_args && sc.raw_args[0]) {
        this.mapTitle = String(sc.raw_args[0]);
        break;
      }
    }
    this.playerX = playerX || 0;
    this.playerY = playerY || 0;

    // ★ 顺序：先对象脚本，后地图级脚本。
    //   地图级过场（如 boss 战前的 npc.setPosition/showFace）要操作已装配好的演员；
    //   若反过来，findElement 全是空，整段过场调度在原版里也会落空。
    // ① 对象脚本：元素层(index 1) 优先，其次遮挡层(index 2)
    var self = this;
    var order = [1, 2, 0];
    for (var oi = 0; oi < order.length; oi++) {
      var L = m.layers[order[oi]];
      if (!L) continue;
      for (var i = 0; i < (L.o || []).length; i++) {
        var o = L.o[i];
        var ast = o[3];
        if (ast && ast.length) {
          // 带脚本：脚本里的 element.addToXxx 会自建元素
          var before = this.elements.length;
          this.runElementScript(ast, o);
          if (this.elements.length > before) this.stats.scripted++;
        } else if (order[oi] === 1) {
          // 无脚本的元素层对象：直接用地图 elementAnt + anim 状态索引
          this.plainObjects.push({ anim: o[0], x: o[1], y: o[2], layer: L.i });
          this.stats.plain++;
        }
      }
    }
    this.stats.elements = this.elements.length;

    // ★ 先装碰撞盒/触发区，再跑地图级脚本（脚本暂停恢复后世界已是完整的）
    this.loadZones(mapName);

    // ② 地图级脚本。world.change 在这里是【立即切图】（e.java:2573 super.a(true)），
    //    不是等玩家触发 —— 第一条生效，后面的脚本不再执行。记录下来交给宿主处理。
    // ★ warp 进图（脚本切图/触发区切图）不再连锁切图：跳过 change 行，
    //   否则互指的两张图（ms_syt_1↔yw_syc）会无限乒乓。其余指令（midi/字幕/道具）照常跑。
    // ★ script.break/wait 处暂停（e.java:990），断点存 pausedBuild，宿主回车/计时恢复。
    this.pendingChange = null;
    this.pausedBuild = null;
    var script = m.script;
    if (opts.skipChange) {
      script = (m.script || []).filter(function (c) { return !(c.obj === 'world' && c.cmd === 'change'); });
    }
    var selfBuild = this;
    this.interp.runAll(script, function (cmd, ran) { selfBuild._stepHook(cmd, ran); });
    // ★ pendingChange 已由 _stepHook 在首条 change 处捕获（先记后落子）
    if (this.interp.paused) {
      this.pausedBuild = { script: script, pc: this.interp.paused.pc, waitMs: this.interp.paused.waitMs };
    }

    void self;
    return this;
  };

  /** 继续之前暂停的地图脚本（宿主回车/计时恢复时调）；返回 {paused} 或 null */
  World.prototype.continueBuild = function () {
    var pb = this.pausedBuild;
    if (!pb) return null;
    this.pausedBuild = null;
    var self = this;
    this.interp.runAll(pb.script, function (cmd, ran) { self._stepHook(cmd, ran); }, pb.pc);
    this.flushState();
    if (this.interp.paused) {
      this.pausedBuild = { script: pb.script, pc: this.interp.paused.pc, waitMs: this.interp.paused.waitMs };
      return { paused: this.pausedBuild };
    }
    return { done: true };
  };

  /**
   * 跑一个对象脚本，并把它创建的元素落到该对象的位置上。
   * 元素在脚本里 addToNpc 时并没有坐标 —— 坐标来自地图对象的 x/y
   * （e.java:2325 把 bn.J()/bn.K() 即对象坐标传进 bl 构造器）。
   */
  World.prototype.runElementScript = function (ast, obj) {
    var created = [];
    var self = this;
    var i = 0;
    for (; i < ast.length; i++) {
      var c = ast[i];
      // 条件先行（与 Interp.step 一致）
      if (c.cond != null) {
        var okAll = true;
        var terms = (c.cond && c.cond.terms) ? c.cond.terms.map(function (t) { return t.raw; })
                                             : [c.cond];
        for (var k = 0; k < terms.length; k++) {
          if (!XS.testConds(self, terms[k])) { okAll = false; break; }
        }
        if (!okAll) { this.stats.skippedByCond = (this.stats.skippedByCond || 0) + 1; continue; }
      }
      var ns = c.obj, cmd = c.cmd, a = c.raw_args || [];
      var S = function (i2) { return a[i2]; };

      if (ns === 'element') {
        if (cmd === 'addToNpc') {
          var el = this.makeElement('npc', c, obj);
          created.push(el); this.elements.push(el);
        } else if (cmd === 'addToMonster') {
          var el2 = this.makeElement('monster', c, obj); created.push(el2); this.elements.push(el2);
        } else if (cmd === 'addToTreasureBox') {
          var el3 = this.makeElement('box', c, obj); created.push(el3); this.elements.push(el3);
        } else if (cmd === 'addToDropRock') {
          var el4 = this.makeElement('rock', c, obj); created.push(el4); this.elements.push(el4);
        } else if (cmd === 'remove') {
          // ★ element.remove() 移除「最近创建的」那个元素（e.java:2372-2382）
          if (this.elements.length) { this.elements.pop(); this.stats.removed++; }
        } else if (cmd === 'setSequence') {
          if (this.elements.length) this.elements[this.elements.length - 1].seq = S(0);
        } else if (/^addTo(Bird|Fish|Wave|Butterfly|Poult|Cock|Cloud)$/.test(cmd)) {
          var el5 = this.makeElement(cmd.replace('addTo', '').toLowerCase(), c, obj);
          created.push(el5); this.elements.push(el5);
        } else {
          this.stats.unknown++;
        }
        continue;
      }

      if (ns === 'npc') {
        // npc.* 作用于「最近创建的」元素（e.java:2384 要求 object2 != null）
        var cur = this.elements[this.elements.length - 1];
        if (!cur) { this.stats.unknown++; continue; }
        switch (cmd) {
          case 'setState':        cur.state = S(0) === 'walk' ? '走路' : '站立'; break;
          case 'setDirection':    cur.dir = this.dirOf(S(0), cur.dir); break;
          case 'setPosition':     cur.x = this.E(a[0]); cur.y = this.E(a[1]); break;
          case 'setVelocity':     cur.velocity = this.E(a[0]); break;
          case 'setSequence':     cur.seq = S(0); break;
          case 'setAiEnabled':    cur.ai = S(0) === 'true'; break;
          case 'setIgnoreEvent':  cur.ignoreEvent = S(0) === 'true'; break;
          case 'addActivityRegion': cur.region = { x: this.E(a[0]), y: this.E(a[1]), r: this.E(a[2]), dir: S(3) }; break;
          case 'addNode':         (cur.nodes = cur.nodes || []).push([this.E(a[0]), this.E(a[1])]); break;
          case 'addInitialPosition': cur.x = this.E(a[0]); cur.y = this.E(a[1]); break;
          case 'reverse':         cur.reverse = S(0) === 'true'; break;
          case 'setPortrait':     cur.portrait = S(0); cur.portraitState = a[1]; break;
          case 'showFace':        cur.showFace = true; break;
          case 'hideFace':        cur.showFace = false; break;
          case 'moveTo':          cur.moveTo = [this.E(a[0]), this.E(a[1])]; break;
          case 'in':              cur.inScene = true; cur.delay = this.E(a[0]); cur.follow = cur.follow || 6; break;
          case 'bindPlayer':      cur.bound = true; cur.follow = cur.follow || 6; break;
          case 'unbindPlayer':    cur.bound = false; cur.follow = null; break;
          default: this.stats.unknown++;
        }
        continue;
      }

      // 其余命名空间交给通用解释器（状态即时提交）
      this.interp.step(c);
      this.flushState();
    }
    void created;
    return this.elements;
  };

  World.prototype.E = function (a) {
    try { return this.expr(String(a)); } catch (e) { return 0; }
  };

  World.prototype.dirOf = function (s, cur) {
    var m = { up: 'up', down: 'down', left: 'left', right: 'right',
               上: 'up', 下: 'down', 左: 'left', 右: 'right' };
    if (m[s]) return m[s];
    return cur || 'down';                       // keep → 保持原方向
  };

  /**
   * 由 element.addToXxx 的参数建出元素。
   * ant 参数可能是 `npc_34.ant`（自带 ANT）或纯数字（用地图 elementAnt）。
   */
  World.prototype.makeElement = function (kind, cmd, obj) {
    var a = cmd.raw_args || [];
    var id = this.E(a[0]);
    var antArg = a.length > 1 ? String(a[1]) : null;
    var ant = null;
    if (antArg && /\.ant$/i.test(antArg)) ant = antArg.replace(/\.ant$/i, '');
    // ★ 明怪固定用 guaiwu.ant（状态 "0"/"1"；config_game 明怪动画文件）
    if (kind === 'monster') ant = 'guaiwu';
    // ★ 落石用 npc_<id>.ant（e.java:2346）
    if (kind === 'rock') ant = 'npc_' + id;
    var el = {
      kind: kind,
      id: id,
      ant: ant,                       // null → 用地图 elementAnt
      anim: obj ? obj[0] : 0,         // 地图对象的状态索引（无脚本时用）
      x: obj ? obj[1] : 0,
      y: obj ? obj[2] : 0,
      state: '站立',
      dir: 'down',
      velocity: 0,
      ai: false,
      ignoreEvent: false,
      showFace: true,
      portrait: null,
      portraitState: null,
      inScene: false,
      t: 0
    };
    // ★ NPC 游荡轴锁（bl.i=左右移动/moveLR，bl.j=上下移动/moveUD，e.java:2325 传参顺序）；
    //   ai 由 npc.setAiEnabled 写（e.java:2405 → bl.b(boolean) → C 标记）。
    if (kind === 'npc') {
      var defs = (XJ.data.npc && XJ.data.npc.defs) || {};
      var dd = defs[String(id)] || null;
      el.moveLR = !!(dd && dd.moveLR);
      el.moveUD = !!(dd && dd.moveUD);
      el.aiWaitUntil = 0;   // 站立计时（bk 定时器；到点掷步数方向）
      el.aiSteps = 0;       // 剩余步数（w）
      el.aiDir = null;      // 游荡方向
      el.aiTx = null; el.aiTy = null;  // 当前步目标（像素）
    }
    // ★ 宝箱开合由事件标记决定（ad 构造器：e(n) 已标记即开箱）
    if (kind === 'box') el.opened = !!this.events[id];
    // ★ 明怪家坐标（追击/返回用，ar.b/c）
    if (kind === 'monster') { el.homeX = el.x; el.homeY = el.y; el.monState = '0'; }
    return el;
  };

  /** 取出并清空解释器效果队列（宿主 Scene 负责落子） */
  World.prototype.takeEffects = function () {
    var out = (this.interp && this.interp.effects) ? this.interp.effects.slice() : [];
    if (this.interp) this.interp.effects.length = 0;
    return out;
  };

  /**
   * 即时提交：把队列里的效果落子（状态立即生效，UI 意图进 deferred）。
   * ★ 原版 markEvent 等是立即写状态的，后续批次/指令的条件依赖它；
   *   延迟到 drain 才写会导致同脚本内的门控全错（如 H2 开场只播出 2 段）。
   */
  World.prototype.flushState = function () {
    var fxs = this.takeEffects();
    if (!fxs.length) return;
    var fx = this.applyStateEffects(fxs);
    var d = this.deferred || (this.deferred = { intents: [], messages: [] });
    if (fx.intents && fx.intents.length) d.intents.push.apply(d.intents, fx.intents);
    if (fx.messages && fx.messages.length) d.messages.push.apply(d.messages, fx.messages);
  };

  /** 取出延迟的 UI 意图（Scene 消费） */
  World.prototype.drainDeferred = function () {
    var d = this.deferred || { intents: [], messages: [] };
    this.deferred = { intents: [], messages: [] };
    return d;
  };

  /** runAll 的钩子：首条 change 记录 pending + 每条即时提交 */
  World.prototype._stepHook = function (cmd, ran) {
    if (ran && !this.pendingChange && cmd && cmd.obj === 'world' && cmd.cmd === 'change') {
      var efs = (this.interp && this.interp.effects) || [];
      for (var i = efs.length - 1; i >= 0; i--) {
        if (efs[i].kind === 'world.change') { this.pendingChange = efs[i].data; break; }
      }
    }
    this.flushState();
  };

  /** 按 id 找已装配的元素 */
  World.prototype.findElement = function (id) {
    for (var i = 0; i < (this.elements || []).length; i++) {
      if (String(this.elements[i].id) === String(id)) return this.elements[i];
    }
    return null;
  };

  /**
   * 把 Interp 记录的效果真正落到 World 状态。
   * 需要宿主（Scene/音频/菜单）处理的返回为 intents，由调用方执行；
   * 纯状态变更在这里直接写完。
   * 返回 {intents:[], messages:[]}。
   */
  World.prototype.applyStateEffects = function (effects) {
    var P = global.XJParty;
    var intents = [], messages = [];
    var self = this;
    function E(v) { try { return self.expr(String(v)); } catch (e) { return 0; } }
    function mainHero() {
      if (!P) return null;
      var hs = P.heroes(self);
      return hs[(self.members || ['chonglou'])[0]] || hs.chonglou || null;
    }
    (effects || []).forEach(function (ef) {
      var d = ef.data || {}, k = ef.kind, handled = true;
      switch (k) {
        case 'world.setName': self.mapTitle = String(d.name || ''); break;
        case 'world.setFlyEnabled': self.fly = (String((ef.raw && ef.raw[0]) || d.on) === 'true') || d.on === true; break;
        case 'world.fadeOut': intents.push({ type: 'fade', ms: d.ms || 0 }); break;
        case 'world.addMask': intents.push({ type: 'mask', id: d.id }); break;
        case 'world.removeAllMask': intents.push({ type: 'unmask' }); break;
        case 'midi.play': intents.push({ type: 'bgm', file: d.file, loop: d.loop }); break;
        case 'midi.stop': intents.push({ type: 'bgmStop' }); break;
        case 'game.markEvent': self.events[E(d.n)] = 1; break;
        case 'game.unmarkEvent': self.events[E(d.n)] = 0; break;
        case 'game.fight': intents.push({ type: 'fight', key: d.key, script: d.t1 }); break;
        case 'game.showMenu': intents.push({ type: 'menu' }); break;
        case 'game.showFee': intents.push({ type: 'fee' }); break;
        case 'game.black': intents.push({ type: 'subtitle', mode: 'black', text: deNull(d.text) }); break;
        case 'game.verse': intents.push({ type: 'subtitle', mode: 'verse', text: deNull(d.text) }); break;
        case 'game.flicker': intents.push({ type: 'flicker', ms: d.ms, color: d.color }); break;
        case 'game.vibrate': intents.push({ type: 'shake', ms: 400 }); break;
        case 'game.dropRock': intents.push({ type: 'dropRock', a: d }); break;
        case 'game.dropRockClear': intents.push({ type: 'dropRockClear' }); break;
        case 'game.waitForKey': intents.push({ type: 'waitKey', keys: d.keys, msg: d.msg }); break;
        case 'game.branch': intents.push({ type: 'branch', a: d.a }); break;
        case 'game.gray': intents.push({ type: 'gray', on: !!d.on }); break;
        case 'game.clear': intents.push({ type: 'clearFx' }); break;
        case 'game.showNpc': self.showNpc = true; break;
        case 'game.showPlayer': self.showPlayer = true; break;
        case 'game.showMonster': self.showMonster = true; break;
        case 'game.hideMonster': self.showMonster = false; break;
        case 'dialog.setText': intents.push({ type: 'dlgText', text: deNull(d.text) }); break;
        case 'dialog.setType': intents.push({ type: 'dlgType', t: d.type }); break;
        case 'dialog.show': intents.push({ type: 'dlgShow' }); break;
        case 'dialog.hide': intents.push({ type: 'dlgHide' }); break;
        case 'dialog.showPlayerPortrait': intents.push({ type: 'dlgPortrait', who: 'player' }); break;
        case 'dialog.showNpcPortrait': intents.push({ type: 'dlgPortrait', who: 'npc' }); break;
        case 'dialog.hidePortrait': intents.push({ type: 'dlgPortrait', who: null }); break;
        case 'guide.setText': intents.push({ type: 'guide', text: d.text }); break;
        case 'guide.setTarget': intents.push({ type: 'guideTarget', t: d.t }); break;
        case 'system.showInfo': messages.push(String(d.text || '')); break;
        case 'system.showAsideInfo': messages.push('[旁白] ' + (d.a || []).join(' ')); break;
        case 'system.trade': intents.push({ type: 'shop', items: d.items || [] }); break;
        case 'system.markFee': self.fees[E(d.n)] = true; break;
        case 'system.unmarkFee': self.fees[E(d.n)] = false; break;
        case 'system.returnToMainMenu': intents.push({ type: 'mainMenu' }); break;
        case 'system.showScreenMargin': intents.push({ type: 'margin', on: true }); break;
        case 'system.hideScreenMargin': intents.push({ type: 'margin', on: false }); break;
        case 'fee.ybdx': if (P) {
          Object.keys(P.heroes(self)).forEach(function (key) {
            var h = P.heroes(self)[key];
            var list = (XJ.data.logic.skillFormulas || {}).player || [];
            list.forEach(function (sk) {
              if (sk.kindCode !== 0 && !sk.isTemplate && sk.name && sk.name !== 'name')
                h.arts[sk.name] = { learned: true, uses: 30 };
            });
          });
          messages.push('一步登仙：全体仙术全开');
        } break;
        case 'script.wait': intents.push({ type: 'wait', ms: d.ms || 0 }); break;
        default: handled = false;
      }
      if (handled) return;
      // ---- 以下 kind 需要读 raw 参数 ----
      var raw = ef.raw || (d && (d.raw || d.a)) || [];
      function S(i) { return raw[i]; }
      switch (k) {
        case 'player.setPosition': intents.push({ type: 'playerPos', x: E(S(0)), y: E(S(1)) }); break;
        case 'player.setDirection': intents.push({ type: 'playerDir', dir: self.dirOf(String(S(0)), 'down') }); break;
        case 'player.setState': intents.push({ type: 'playerState', st: S(0) }); break;
        case 'player.setSequence': intents.push({ type: 'playerState', st: S(0) }); break;
        case 'player.setVelocity': intents.push({ type: 'playerVel', v: E(S(0)) }); break;
        case 'player.moveTo': intents.push({ type: 'playerMove', x: E(S(0)), y: E(S(1)) }); break;
        case 'player.move': intents.push({ type: 'playerStep', dir: S(0), n: E(S(1)) }); break;
        case 'player.takeTheStairs': intents.push({ type: 'playerStep', dir: self.playerDir, n: 2 }); break;
        case 'player.playAnimation': intents.push({ type: 'playerState', st: S(0) }); break;
        case 'player.addItem': self.addItem(S(0), raw.length > 1 ? E(S(1)) : 1); break;
        case 'player.removeItem': self.removeItem(S(0), raw.length > 1 ? E(S(1)) : 1); break;
        case 'player.addGold': self.addGold(E(S(0))); break;
        case 'player.reduceGold': self.addGold(-E(S(0))); break;
        case 'player.setGold': self.gold = Math.max(0, E(S(0))); break;
        case 'player.healing': { var mh = mainHero(); if (mh && P) P.fullRestore(mh); break; }
        case 'player.levelup': {
          if (P) {
            self.fees[500] = true;
            P.activeHeroes(self).forEach(function (h) { P.levelUp(self, h, E(S(0)) || 1); });
            messages.push('等级提升' + (E(S(0)) || 1) + '级');
          }
          break;
        }
        case 'player.task': {
          var tn = String(S(0));
          // ★ e.java:2646：空表先垫"无"再追加（与 xj_talk 对话路径一致）
          if (!self.tasks.length) self.tasks.push('无');
          if (self.tasks.indexOf(tn) < 0) self.tasks.push(tn);
          messages.push('接受任务：' + tn);
          break;
        }
        case 'player.firstTask': {
          var fn2 = String(S(0));
          if (!self.tasks.length) self.tasks.push(fn2);
          else self.tasks[0] = fn2;
          messages.push('当前任务：' + fn2);
          break;
        }
        case 'player.removeTask': {
          var ri = self.tasks.indexOf(String(S(0)));
          if (ri >= 0) self.tasks.splice(ri, 1);
          break;
        }
        case 'player.startSkill': if (P) { var m0 = mainHero(); if (m0) P.learnSkill(self, m0.name, String(S(0))); messages.push('开通技能' + S(0)); } break;
        case 'player.startArtSkill': if (P) { var m1 = mainHero(); if (m1) P.learnArt(self, m1.name, String(S(0))); messages.push('开通技能' + S(0)); } break;
        case 'player.addspeed': case 'player.addluck': case 'player.addgod':
        case 'player.addhp': case 'player.addlove': {
          if (P) {
            var mh2 = mainHero();
            if (mh2) {
              var st2 = P.statsOf(mh2), v = E(S(0));
              if (k === 'player.addhp') mh2.hp = Math.min(st2.maxHp, mh2.hp + v);
              else if (k === 'player.addgod') mh2.mp = Math.min(st2.maxMp, mh2.mp + v);
              else if (k === 'player.addspeed') mh2.bonusSpd = (mh2.bonusSpd || 0) + v;
              else if (k === 'player.addluck') mh2.bonusLuk = (mh2.bonusLuk || 0) + v;
              else if (k === 'player.addlove') {
                mh2.feeling = Math.max(0, Math.min(100, mh2.feeling + v));
                self.party[mh2.name] = mh2.feeling;
              }
              P.clampHero(mh2);
              messages.push(mh2.name + ' ' + k.replace('player.', '') + '+' + v);
            }
          }
          break;
        }
        case 'player.showFace': self.playerFace = true; break;
        case 'player.hideFace': self.playerFace = false; break;
        case 'partner.addFeeling': if (P) P.addFeeling(self, E(S(0)), E(S(1))); break;
        case 'partner.reduceFeeling': if (P) P.addFeeling(self, E(S(0)), -E(S(1))); break;
        case 'partner.in': {
          // ★ in(队友id, NPC编号, 延迟)：该 NPC 开始跟随主角
          var pi = E(S(0)), npcId = E(S(1));
          if (P) P.partnerIn(self, pi);
          self.followers[pi] = npcId;
          messages.push('队友加入：' + (P && P.PARTNER_ROLE[pi] ? P.heroes(self)[P.PARTNER_ROLE[pi]].name : pi));
          break;
        }
        case 'partner.out': {
          // ★ out(队友id, NPC编号, x, y, 延迟)：停止跟随并落到 x,y
          var po = E(S(0));
          if (P) P.partnerOut(self, po);
          delete self.followers[po];
          var el = self.findElement(E(S(1)));
          if (el) { el.x = E(S(2)); el.y = E(S(3)); }
          break;
        }
        case 'item.remove': messages.push('（物品被移除）'); break;
        case 'user.addHP': { var uh = mainHero(); if (uh && P) { var st3 = P.statsOf(uh); uh.hp = Math.min(st3.maxHp, uh.hp + E(S(0))); } break; }
        case 'countdownTimer.setMillis':
          // ★ setMillis(ms, 脚本文件, 条目)：超时执行该脚本行（e.java 超时回调）
          intents.push({ type: 'countdown', ms: E(S(0)), file: S(1), line: E(S(2)) });
          break;
        case 'countdownTimer.stop': intents.push({ type: 'countdownStop' }); break;
        case 'camera.setFocusOnPlayer': intents.push({ type: 'camPlayer' }); break;
        case 'camera.setFocusOnNpc': intents.push({ type: 'camNpc', id: S(0) }); break;
        case 'camera.setPosition': intents.push({ type: 'camPos', x: E(S(0)), y: E(S(1)) }); break;
        case 'camera.moveTo': intents.push({ type: 'camPos', x: E(S(0)), y: E(S(1)) }); break;
        default: {
          // ★ 地图级 npc.* 带 NPC 编号（与对象级裸 npc.* 不同）
          if (/^npc\./.test(k)) {
            var ncmd = k.slice(4), el2 = self.findElement(E(S(0)));
            if (!el2) break;
            if (ncmd === 'setPosition') { el2.x = E(S(1)); el2.y = E(S(2)); }
            else if (ncmd === 'setDirection') el2.dir = self.dirOf(String(S(1)), el2.dir);
            else if (ncmd === 'setState') el2.state = S(1) === 'walk' ? '走路' : '站立';
            else if (ncmd === 'setSequence') el2.seq = S(1);
            else if (ncmd === 'setVelocity') el2.velocity = E(S(1));
            else if (ncmd === 'setAiEnabled') el2.ai = S(1) === 'true';
            else if (ncmd === 'setIgnoreEvent') el2.ignoreEvent = S(1) === 'true';
            else if (ncmd === 'moveTo') el2.moveTo = [E(S(1)), E(S(2))];
            else if (ncmd === 'showFace') el2.showFace = true;
            else if (ncmd === 'hideFace') el2.showFace = false;
            else if (ncmd === 'addActivityRegion') el2.region = { x: E(S(1)), y: E(S(2)), r: E(S(3)), dir: S(4) };
            else if (ncmd === 'addNode') (el2.nodes = el2.nodes || []).push([E(S(1)), E(S(2))]);
            else if (ncmd === 'addInitialPosition') { el2.x = E(S(1)); el2.y = E(S(2)); }
            // ★ npc.in(id, 延迟)：入场并跟随主角（e.java:2760 Y 槽登记）
            else if (ncmd === 'in') { el2.inScene = true; el2.follow = Math.max(1, E(S(1)) || 4); }
            // ★ bindPlayer：绑定跟随；unbindPlayer 解除（e.java:2777-2779）
            else if (ncmd === 'bindPlayer') { el2.bound = true; el2.follow = el2.follow || 6; }
            else if (ncmd === 'unbindPlayer') { el2.bound = false; el2.follow = null; }
          }
          break;
        }
      }
    });
    return { intents: intents, messages: messages };
  };

  // ------------------------------------------------------------ 触发区
  /**
   * 收集地图的 region / trigger 矩形。
   * ★ regions（i 列表，必有脚本）：带 world.change 的就是地图出口；
   * ★ triggers（j 列表）：【全部是碰撞盒】——全 69 图 3526 个 trigger，
   *   没有一个带脚本（ay.java:507 碰撞查询只看矩形重叠、不看脚本；
   *   有脚本的才额外跑事件 ay.java:361/406）。之前这里把无脚本 trigger
   *   全丢了 + 移动时根本不查 → 穿墙的根因。
   */
  World.prototype.loadZones = function (mapName) {
    var m = XJ.map(mapName);
    var self = this;
    this.zones = [];
    this.solids = [];
    if (!m) return this;
    for (var li = 0; li < m.layers.length; li++) {
      var L = m.layers[li];
      (L.r || []).forEach(function (r, i) {
        self_zone(r, 'region', li, i);
      });
      (L.g || []).forEach(function (t, i) {
        self.solids.push({
          x: t.x, y: t.y, w: t.w, h: t.h,
          ast: (t.scriptAst && t.scriptAst.length) ? t.scriptAst : null
        });
        self_zone(t, 'trigger', li, i);
      });
    }
    function self_zone(z, kind, layer, idx) {
      if (!z || !z.scriptAst || !z.scriptAst.length) return;
      var hasChange = z.scriptAst.some(function (c) {
        return c.obj === 'world' && c.cmd === 'change';
      });
      self.zones.push({
        kind: kind, layer: layer, idx: idx,
        x: z.x, y: z.y, w: z.w, h: z.h,
        ast: z.scriptAst,
        isExit: hasChange,
        fired: false
      });
    }
    return this;
  };

  /** 点是否落在矩形内（用左上角） */
  World.prototype.inZone = function (z, x, y) {
    return x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h;
  };

  /**
   * 移动线段是否穿过矩形（绊线式触发区用）。
   * 关卡里的触发区大量是 3~6px 宽的细线（yw_hhc r2: x=274 w=6,h=43 竖线），
   * 按 16px 整格跳的点判定永远踩不中（272→288 直接跨过 [274,280)）。
   * 原版是像素级连续移动所以能触发；这里按"穿过即触发"等效。
   */
  World.prototype.segHits = function (x0, y0, x1, y1, r) {
    var rx0 = r.x, rx1 = r.x + r.w, ry0 = r.y, ry1 = r.y + r.h;
    if (x0 === x1 && y0 === y1) return this.inZone(r, x0, y0);
    if (y0 === y1) {
      if (y0 < ry0 || y0 >= ry1) return false;
      var ax0 = Math.min(x0, x1), ax1 = Math.max(x0, x1);
      return ax0 < rx1 && ax1 >= rx0;
    }
    if (x0 === x1) {
      if (x0 < rx0 || x0 >= rx1) return false;
      var ay0 = Math.min(y0, y1), ay1 = Math.max(y0, y1);
      return ay0 < ry1 && ay1 >= ry0;
    }
    // 斜向（理论上走不到）：退化成两端点判定
    return this.inZone(r, x0, y0) || this.inZone(r, x1, y1);
  };

  /** 点是否撞上碰撞盒（trigger 矩形，ay.java:507 纯矩形重叠判定） */
  World.prototype.solidAt = function (x, y) {
    var ss = this.solids || [];
    for (var i = 0; i < ss.length; i++) {
      var s = ss[i];
      if (x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) return s;
    }
    return null;
  };

  /** 移动线段撞到的第一个碰撞盒（细墙同样按"穿过即撞"，与绊线同理） */
  World.prototype.solidSeg = function (x0, y0, x1, y1) {
    var ss = this.solids || [];
    for (var i = 0; i < ss.length; i++) {
      if (this.segHits(x0, y0, x1, y1, ss[i])) return ss[i];
    }
    return null;
  };

  /** 找出玩家位置命中的所有未触发过的触发区（x0,y0 缺省=只判落点） */
  World.prototype.zonesAt = function (x, y, x0, y0) {
    var out = [];
    for (var i = 0; i < (this.zones || []).length; i++) {
      var z = this.zones[i];
      if (z.fired) continue;
      if (x0 == null || y0 == null) {
        if (this.inZone(z, x, y)) out.push(z);
      } else if (this.segHits(x0, y0, x, y, z)) out.push(z);
    }
    return out;
  };

  /**
   * 执行一段脚本 AST（触发区脚本 / 外部脚本行如 xuanze.str）。
   * 返回 {change, moveTo, dialog, gated, did}；副作用进 interp.effects，宿主负责 drain。
   * 语义：world.change 立即切图 abort 后续（e.java:2573）；
   *   openScriptList 只门控本批（跳到 closeScriptList 继续）。
   */
  World.prototype.execAst = function (ast, from) {
    var r = { change: null, moveTo: null, dialog: null, dialogs: [] };
    var self = this, did = false;
    function condOk(c) {
      if (c.cond == null) return true;
      var terms = (c.cond && c.cond.terms) ? c.cond.terms.map(function (t) { return t.raw; }) : [c.cond];
      for (var k = 0; k < terms.length; k++) {
        if (!XS.testConds(self, terms[k])) return false;
      }
      return true;
    }
    ast = ast || [];
    var i = (from | 0);
    while (i < ast.length) {
      var c = ast[i];
      // ★ script.break / script.wait（条件成立时）暂停执行（e.java:990），
      //   断点存 r.paused={nodes,pc,waitMs}，宿主用 execAst(nodes, pc) 继续。
      //   之前这里直接无视 break，整段过场一帧跑完——剧情"乱跳"的根因。
      if (c.obj === 'script' && (c.cmd === 'break' || c.cmd === 'wait')) {
        if (!condOk(c)) { i++; continue; }
        var ms = 0;
        if (c.cmd === 'wait') {
          try { ms = this.E((c.raw_args || [])[0]) | 0; } catch (e) { ms = 0; }
        }
        r.paused = { nodes: ast, pc: i + 1, waitMs: ms };
        did = true;
        break;
      }
      // ★ 门控批：跳到配对的 closeScriptList，继续往后
      if (c.obj === 'script' && c.cmd === 'openScriptList' && !condOk(c)) {
        r.gated = true;
        var depth = 1;
        i++;
        while (i < ast.length && depth > 0) {
          var cc = ast[i];
          if (cc.obj === 'script' && cc.cmd === 'openScriptList') depth++;
          if (cc.obj === 'script' && cc.cmd === 'closeScriptList') depth--;
          i++;
        }
        continue;
      }
      if (!condOk(c)) { i++; continue; }
      if (c.obj === 'world' && c.cmd === 'change') {
        var a = c.raw_args || [];
        r.change = {
          map: String(a[0] || '').replace(/\.map$/i, ''),
          tileBin: String(a[1] || '').replace(/\.bin$/i, ''),
          elementAnt: String(a[2] || '').replace(/\.ant$/i, ''),
          elementBin: String(a[3] || '').replace(/\.bin$/i, ''),
          x: this.E(a[4]), y: this.E(a[5]),
          dir: this.dirOf(String(a[6]), 'down')
        };
        did = true;
        break;   // ★ 立即切图，后续脚本不再执行（e.java:2573）
      }
      if (c.obj === 'player' && c.cmd === 'moveTo') {
        // moveTo(x, y, flag)：-1 表示保持当前值
        var b = c.raw_args || [];
        var nx = this.E(b[0]), ny = this.E(b[1]);
        r.moveTo = { x: nx < 0 ? null : nx, y: ny < 0 ? null : ny };
        did = true;
        i++;
        continue;
      }
      if (c.obj === 'player' && c.cmd === 'setDirection') {
        this.playerDir = this.dirOf(String((c.raw_args || [])[0]), this.playerDir || 'down');
        did = true;
        i++;
        continue;
      }
      if (c.obj === 'dialogBox' && c.cmd === 'setText') {
        var da = (c.args || [])[0] || {};
        var dlg = { speaker: da.speaker || null, text: deNull(da.value != null ? da.value : String((c.raw_args || [])[0])) };
        r.dialogs.push(dlg);
        r.dialog = dlg;   // 兼容：保留最后一段
        did = true;
        i++;
        continue;
      }
      // 其余交给通用解释器（状态即时提交，后续条件可见）
      if (this.interp.step({ obj: c.obj, cmd: c.cmd, raw_args: c.raw_args || [], cond: null })) did = true;
      this.flushState();
      i++;
    }
    r.did = did;
    return r;
  };

  /**
   * 执行一个触发区脚本。返回 {change, moveTo, dialog, effects}。
   * ★ world.change 是立即切图（e.java:2573 super.a(true); super.y()），
   *   走进矩形就触发，切图后后续脚本不再执行。
   * ★ script.openScriptList[条件] 只门控【本批】（到 closeScriptList 为止），
   *   条件不成立则跳过本批、继续往后；整区什么都没执行时不标记 fired，
   *   否则事件达成后玩家再也进不去这个区。
   */
  World.prototype.fireZone = function (z) {
    var r = this.execAst(z.ast);
    r.zone = z;
    // 什么都没执行（全被门控）则保持未触发
    if (r.did) z.fired = true;
    return r;
  };

  /**
   * 执行外部脚本行（game.branch 的 文件:行 / countdownTimer 超时）。
   * 行号 = STR 条目索引（b.a(file, n) 取第 n 条，b.java）。
   * 返回 execAst 结果（宿主 drainWorldFx 落子）；找不到返回 null。
   */
  World.prototype.runScriptEntry = function (file, entry) {
    var base = String(file || '').replace(/\.str$/i, '');
    var S = (XJ.data.scripts || {});
    var book = (S.talk && S.talk[base]) || (S['其他'] && S['其他'][base]) || null;
    if (!book) return null;
    var blocks = book.blocks || [];
    var want = parseInt(entry, 10);
    var b = null;
    for (var i = 0; i < blocks.length; i++) {
      if (parseInt(blocks[i].entry, 10) === want) { b = blocks[i]; break; }
    }
    if (!b) return null;
    // 条目条件（condRaw）先行
    if (b.cond && !XS.testConds(this, b.cond)) return { skipped: true };
    return this.execAst(b.nodes || []);
  };

  /** 脚本字面 null（全数据仅 ms_syt_1#173 game.black(null) 一处）= 无文本。
   * 原版 Java 侧传 null 进 drawString 必 NPE 崩溃，游戏不崩 ⇒ 原版必有空 guard ⇒
   * 空黑屏（节奏/按键保留，只是不画"null"四个字母）。精确匹配才转，子串不动。 */
  function deNull(s) { return s === 'null' ? '' : s; }

  /** 把地图脚本的暂停点全部跑完（测试/校验用；浏览器里由回车/计时逐步恢复） */
  World.prototype.drainBuildPauses = function () {
    var n = 0;
    while (this.pausedBuild && n++ < 100000) { this.continueBuild(); }
    return n;
  };

  /** build + 跑完所有暂停点（测试用全量语义；游戏里逐步恢复） */
  World.prototype.buildFull = function (mapName, px, py, opts) {
    this.build(mapName, px, py, opts);
    this.drainBuildPauses();
    this.flushState();
    return this;
  };

  /** execAst 跑到完（测试用；返回合并后的 r） */
  World.prototype.runExecFull = function (ast) {
    var r = this.execAst(ast), n = 0;
    while (r && r.paused && n++ < 100000) {
      var p = r.paused;
      mergeExec(r, this.execAst(p.nodes, p.pc));
    }
    return r;
  };

  /** runScriptEntry 跑到完（测试用；浏览器里分段、回车恢复） */
  World.prototype.runScriptEntryFull = function (file, entry) {
    var base = String(file || '').replace(/\.str$/i, '');
    var S = (XJ.data.scripts || {});
    var book = (S.talk && S.talk[base]) || (S['其他'] && S['其他'][base]) || null;
    if (!book) return null;
    var blocks = book.blocks || [];
    var want = parseInt(entry, 10);
    var b = null;
    for (var i = 0; i < blocks.length; i++) {
      if (parseInt(blocks[i].entry, 10) === want) { b = blocks[i]; break; }
    }
    if (!b) return null;
    if (b.cond && !XS.testConds(this, b.cond)) return { skipped: true };
    return this.runExecFull(b.nodes || []);
  };

  /** fireZone 跑到完（测试用；浏览器里分段、回车恢复） */
  World.prototype.fireZoneFull = function (z) {
    var r = this.fireZone(z), n = 0;
    while (r && r.paused && n++ < 100000) {
      var p = r.paused;
      mergeExec(r, this.execAst(p.nodes, p.pc));
      this.flushState();
      if (r.did) z.fired = true;
    }
    return r;
  };

  /** 把后一段 execAst 结果合并进前一段（对话累积、change/moveTo/gated 保留） */
  function mergeExec(r, r2) {
    if (!r2) return r;
    r.dialogs = (r.dialogs || []).concat(r2.dialogs || []);
    if (r2.dialog) r.dialog = r2.dialog;
    if (r2.change) r.change = r2.change;
    if (r2.moveTo) r.moveTo = r2.moveTo;
    if (r2.gated) r.gated = true;
    if (r2.skipped) r.skipped = true;
    r.did = r.did || r2.did;
    r.paused = r2.paused || null;
    return r;
  }

  /** 重置触发区（切图后调用） */
  World.prototype.resetZones = function () { (this.zones || []).forEach(function (z) { z.fired = false; }); };

  // ------------------------------------------------------------ 出口
  /** 找离主角最近、且朝向匹配的出口 */
  World.prototype.nearestExit = function (x, y, dir) {
    var m = XJ.map(this.mapName);
    if (!m) return null;
    var want = { up: 'up', down: 'down', left: 'left', right: 'right' };
    var best = null, bestD = 1e9;
    for (var i = 0; i < (m.exits || []).length; i++) {
      var e = m.exits[i];
      var d = Math.abs(e.x - x) + Math.abs(e.y - y);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (!best) return null;
    void want;
    return best;
  };

  global.XJWorld = World;
})(typeof window !== 'undefined' ? window : globalThis);