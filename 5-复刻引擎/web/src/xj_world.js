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
    this.tasks = [];
    this.skills = Object.create(null);
    this.mapName = '';
    this.elements = [];
    this.plainObjects = [];
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
  World.prototype.feeling = function (n) { return this.party[n] || 0; };
  World.prototype.partnerExists = function (n) { return this.party[n] !== undefined; };

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
  World.prototype.build = function (mapName, playerX, playerY) {
    var m = XJ.map(mapName);
    this.elements = [];
    this.plainObjects = [];
    this.stats = { elements: 0, scripted: 0, plain: 0, removed: 0, unknown: 0 };
    if (!m) return this;
    this.mapName = mapName;
    this.playerX = playerX || 0;
    this.playerY = playerY || 0;

    // ① 地图级脚本
    this.interp.runAll(m.script);

    // ② 对象脚本：元素层(index 1) 优先，其次遮挡层(index 2)
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
    void self;
    return this;
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
          case 'in':              cur.inScene = true; cur.delay = this.E(a[0]); break;
          case 'bindPlayer':      cur.bound = true; break;
          case 'unbindPlayer':    cur.bound = false; break;
          default: this.stats.unknown++;
        }
        continue;
      }

      // 其余命名空间交给通用解释器
      this.interp.step(c);
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
    return {
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
  };

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