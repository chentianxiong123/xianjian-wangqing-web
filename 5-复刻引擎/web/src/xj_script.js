/* xj_script.js —— 脚本解释器
 *
 * 三部分，全部对应已确认的反编译结论：
 *   1. Expr    —— t.java 的表达式引擎移植（保留 7 个 Java 语义细节）
 *   2. Cond    —— 19 条条件求值（e.java:2199-2283）
 *   3. Interp  —— 指令派发（命名空间与指令名取自 XJ_LOGIC.ops / 脚本 AST）
 *
 * ★ 条件求值的关键语义（e.java:2281 / f.java:1158）：
 *   未登记的条件写法走 else 分支直接 return false，
 *   也就是【整条指令被静默丢弃】，不是报错。这里严格照做。
 */
(function (global) {
  'use strict';
  var XJ = global.XJ;

  // ==================================================================== 1. 表达式
  var OPS = '+-*/%^=()';
  function isOp(c) { return OPS.indexOf(c) >= 0; }
  function isIdStart(c) {
    return c === '_' || c === '$' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
  }
  function isIdPart(c) { return !isOp(c) && c !== ' '; }

  function toLong(v) {
    // JS Number 是 double；用 |0 截 32 位会与 Java long 不符，
    // 这里保留 double 精度，只在除法/取模时模拟 Java 的整数语义。
    return v;
  }
  /** Java 整数除法：向 0 截断 */
  function jdiv(a, b) {
    var q = Math.trunc(a / b);
    return q;
  }
  /** Java 取模：结果符号跟随被除数 */
  function jmod(a, b) { return a - jdiv(a, b) * b; }

  function Expr(vars) {
    this.v = Object.create(null);
    if (vars) for (var k in vars) this.v[k] = vars[k] | 0;
    this.s = ''; this.i = 0; this.tok = null; this.kind = 0;
  }
  Expr.prototype.set = function (n, v) { this.v[n] = v | 0; return this; };
  Expr.prototype.get = function (n) {
    var x = this.v[n];
    return x === undefined ? 0 : x;          // 未定义变量取 0（t.java:170）
  };
  Expr.prototype.keys = function () { return Object.keys(this.v); };

  Expr.prototype._next = function () {
    this.tok = ''; this.kind = 0;
    while (this.i < this.s.length && this.s[this.i] === ' ') this.i++;
    if (this.i >= this.s.length) { this.tok = null; return; }
    var c = this.s[this.i];
    if (isOp(c)) { this.tok = c; this.i++; this.kind = 1; return; }
    if (isIdStart(c)) {
      while (this.i < this.s.length && isIdPart(this.s[this.i])) { this.tok += this.s[this.i]; this.i++; }
      this.kind = 2; return;
    }
    if (c >= '0' && c <= '9') {
      while (this.i < this.s.length && isIdPart(this.s[this.i])) { this.tok += this.s[this.i]; this.i++; }
      this.kind = 3; return;
    }
    var e = new Error('表达式错误。: 非法字符 ' + c);
    e.xjExpr = true; throw e;
  };

  Expr.prototype.eval = function (src) {
    this.s = String(src); this.i = 0;
    this._next();
    if (this.tok === null) { var e0 = new Error('表达式错误。: 空表达式'); e0.xjExpr = true; throw e0; }
    var val;
    if (this.kind === 2) {                    // 首 token 是标识符 → 可能是赋值
      var name = this.tok;
      this._next();
      if (this.tok === '=') {
        this._next();
        val = this._add();
        this.set(name, val);
      } else {
        if (this.tok !== null) this.i -= this.tok.length;
        this.tok = name; this.kind = 2;       // 回退：恢复首 token（对应原实现）
        val = this._add();
      }
    } else {
      val = this._add();
    }
    if (this.tok !== null) {
      var e = new Error('表达式错误。: ' + src + ' 尾部残留 ' + this.tok);
      e.xjExpr = true; throw e;
    }
    return val | 0;
  };

  Expr.prototype._add = function () {
    var v = this._mul();
    while (this.tok === '+' || this.tok === '-') {
      var op = this.tok; this._next();
      var r = this._mul();
      v = toLong(op === '+' ? v + r : v - r);
    }
    return v;
  };
  Expr.prototype._mul = function () {
    var v = this._pow();
    while (this.tok === '*' || this.tok === '/' || this.tok === '%') {
      var op = this.tok; this._next();
      var r = this._pow();
      if (op === '*') v = toLong(v * r);
      else if (op === '/') {
        if (r === 0) { var e = new Error('算术错误。'); e.xjArith = true; throw e; }
        v = toLong(jdiv(v, r));
      } else {
        if (r === 0) { var e2 = new Error('算术错误。'); e2.xjArith = true; throw e2; }
        v = toLong(jmod(v, r));
      }
    }
    return v;
  };
  Expr.prototype._pow = function () {
    var sign = '';
    if (this.kind === 1 && (this.tok === '+' || this.tok === '-')) {
      sign = this.tok; this._next();
    }
    var v;
    if (this.tok === '(') {
      this._next();
      v = this._add();
      if (this.tok !== ')') { var e = new Error('表达式错误。: 缺少右括号'); e.xjExpr = true; throw e; }
      this._next();
    } else {
      v = this._operand();
    }
    if (sign === '-') v = -v;
    if (this.tok === '^') {
      this._next();
      var ex = this._pow();                   // 右结合
      var base = v;
      if (ex < 0) v = 0;
      else if (ex === 0) v = 1;
      else { for (var k = ex - 1; k > 0; k--) v = toLong(v * base); }  // 连乘底数，不是平方
    }
    return v;
  };
  Expr.prototype._operand = function () {
    var k = this.kind, t = this.tok;
    if (t === null) { var e = new Error('表达式错误。: 缺少操作数'); e.xjExpr = true; throw e; }
    var v;
    if (k === 3) {
      if (!/^[0-9]+$/.test(t)) { var e1 = new Error('表达式错误。: 非法数字 ' + t); e1.xjExpr = true; throw e1; }
      v = parseInt(t, 10);
    } else if (k === 2) {
      v = this.get(t);
    } else {
      var e2 = new Error('表达式错误。: 非法 token ' + t); e2.xjExpr = true; throw e2;
    }
    this._next();
    return v;
  };

  function evalExpr(src, vars) { return new Expr(vars).eval(src); }

  /** 静态扫描表达式引用的变量 */
  function exprVars(src) {
    var e = new Expr(); e.s = String(src); e.i = 0; var out = [], t;
    for (;;) {
      e._next();
      if (e.tok === null) break;
      if (e.kind === 2 && out.indexOf(e.tok) < 0) out.push(e.tok);
      t = e.tok;
      void t;
    }
    return out;
  }

  // ==================================================================== 2. 条件
  /* 19 条条件，取自 e.java:2199-2283。
   * 每条返回 true/false；未登记的写法返回 false（整条指令被丢弃）。 */
  function Cond(world, line) {
    this.w = world;
    this.line = String(line == null ? '' : line);
  }
  Cond.prototype.args = function () {
    var m = this.line.match(/\(([^)]*)\)/);
    if (!m) return [];
    // ★ 条件参数用 `|` 分隔（如 partner.feelingIsGreaterThan(0|40)，见 d.f）；
    //   逗号分隔的同样兼容
    return m[1].split(/[|,]/).map(function (s) { return s.trim(); });
  };
  Cond.prototype.name = function () {
    var m = this.line.match(/^\s*([^(]+)/);
    return m ? m[1].trim() : '';
  };

  Cond.prototype.test = function () {
    var w = this.w, n = this.name(), a = this.args();
    var num = function (i) { try { return w.expr(a[i]); } catch (e) { return 0; } };
    switch (n) {
      case 'eventMarked':        return w.event(+a[0]) === 1;
      case '!eventMarked':       return w.event(+a[0]) !== 1;
      case 'feeMarked':          return !!w.fee(+a[0]);
      case '!feeMarked':         return !w.fee(+a[0]);
      case 'player.itemCountIsGreaterThan': return w.itemCount(a[0]) > num(1);
      case 'player.itemCountIsLesserThan':  return w.itemCount(a[0]) < num(1);
      case 'player.itemExists':             return w.itemCount(a[0]) > 0;
      case 'player.goldIsGreaterThan':      return w.gold() > num(0);
      case 'player.goldIsLesserThan':       return w.gold() < num(0);
      case 'partner.feelingIsGreaterThan':  return w.feeling(a[0]) > num(1);
      case 'partner.feelingIsLesserThan':   return w.feeling(a[0]) < num(1);
      case 'partner.feelingIsEqualTo':      return w.feeling(a[0]) === num(1);
      case 'partner.feelingIsGreater':      return w.feeling(a[0]) >= num(1);
      case '!partner.feelingIsGreater':     return w.feeling(a[0]) < num(1);
      case 'partner.feelingEqual':          return w.feeling(a[0]) === num(1);
      case 'partner.exists':                return w.partnerExists(a[0]);
      case '!partner.exists':               return !w.partnerExists(a[0]);
      default:
        // ★ 未登记条件 → false → 整条指令被静默丢弃（e.java:2281）
        return false;
    }
  };

  /**
   * 条件串切分后逐条 AND，任一不满足即跳过整行。
   * 支持用逗号或分号分隔（原脚本用 [a,b] 或 (a)(b) 两种写法）。
   * ★ 也接受已解析的 AST 条件对象（{terms:[{raw}]}），地图级 runAll 直接传 AST。
   */
  function testConds(world, cond) {
    if (cond == null) return true;
    var parts;
    if (typeof cond === 'string') {
      parts = String(cond).split(/[,;]/).map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });
    } else if (cond.terms) {
      parts = cond.terms.map(function (t) { return t.raw; });
    } else if (cond.raw) {
      parts = [cond.raw];
    } else {
      parts = [];
    }
    if (!parts.length) return true;
    for (var i = 0; i < parts.length; i++) {
      if (!new Cond(world, parts[i]).test()) return false;
    }
    return true;
  }

  // ==================================================================== 3. 解释器
  /**
   * World 是外部注入的游戏状态提供者，需实现：
   *   expr(str) / event(n) / fee(n) / gold() / itemCount(name) /
   *   feeling(name) / partnerExists(name) / mapName()
   * Interp 只负责派发与记录效果，不直接改状态，便于回放与测试。
   */
  function Interp(world) {
    this.w = world;
    this.effects = [];       // 产生副作用的指令记录在这里
    this.stats = { exec: 0, skippedByCond: 0, unknownNs: 0, unknownCmd: 0, unknownCond: 0 };
  }

  Interp.prototype.log = function (kind, data) {
    this.effects.push({ kind: kind, data: data });
    return data;
  };

  /** 执行一条已解析的 AST 指令；返回是否真的执行了 */
  Interp.prototype.step = function (cmd) {
    if (!cmd) return false;
    // 条件先行
    if (cmd.cond != null) {
      var ok = true;
      var parts = (Array.isArray(cmd.cond) ? cmd.cond : [cmd.cond]);
      for (var i = 0; i < parts.length; i++) {
        if (!testConds(this.w, parts[i])) { ok = false; break; }
      }
      if (!ok) { this.stats.skippedByCond++; return false; }
    }
    var ns = cmd.obj || cmd.ns;
    var name = cmd.cmd;
    var a = cmd.raw_args || cmd.args || [];
    var self = this;
    // ★ 给每条效果自动附上原始参数（宿主落子时区分「地图级带 id」与「对象级裸指令」用）
    var _log = this.log;
    this.log = function (kind, data) {
      data = data || {};
      if (data.a == null && data.raw == null) data.raw = a.slice ? a.slice() : a;
      return _log.call(self, kind, data);
    };
    try { return this._stepInner(ns, name, a); }
    finally { this.log = _log; }
  };

  Interp.prototype._stepInner = function (ns, name, a) {
    var self = this;
    function E(i) { try { return self.w.expr(a[i]); } catch (e) { return 0; } }
    function S(i) { return a[i]; }

    // ---- 命名空间分派 ----
    switch (ns) {
      // ---------------- world ----------------
      case 'world':
        switch (name) {
          case 'setName':        return !!this.log('world.setName', { name: S(0) });
          case 'change': {
            // ★ world.change(目标map, 地砖bin, 元素ant, 元素bin, x, y, dir)
            //   落子时需要全套参数（切图要带 ANT），这里全部记下
            return !!this.log('world.change', {
              map: String(S(0) || '').replace(/\.map$/i, ''),
              tileBin: String(S(1) || '').replace(/\.bin$/i, ''),
              elementAnt: String(S(2) || '').replace(/\.ant$/i, ''),
              elementBin: String(S(3) || '').replace(/\.bin$/i, ''),
              x: E(4), y: E(5), dir: S(6)
            });
          }
          case 'addMask':        return !!this.log('world.addMask', { id: S(0) });
          case 'removeAllMask':  return !!this.log('world.removeAllMask', {});
          case 'fadeOut':        return !!this.log('world.fadeOut', { ms: E(0) });
          case 'setFlyEnabled':  return !!this.log('world.setFlyEnabled', { on: S(0) === 'true' });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- element ----------------
      case 'element':
        switch (name) {
          case 'addToNpc':          return !!this.log('element.addToNpc', { id: E(0), ant: S(1) });
          case 'addToMonster':      return !!this.log('element.addToMonster', { id: S(0) });
          case 'addToDropRock':     return !!this.log('element.addToDropRock', { id: E(0) });
          case 'addToBird': case 'addToFish': case 'addToWave':
          case 'addToButterfly': case 'addToPoult': case 'addToCock':
          case 'addToCloud':
            return !!this.log('element.' + name, {});
          case 'addToTreasureBox':  return !!this.log('element.addToTreasureBox', { id: E(0) });
          case 'remove':            return !!this.log('element.remove', {});
          case 'setSequence':       return !!this.log('element.setSequence', { seq: S(0) });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- npc ----------------
      case 'npc':
        switch (name) {
          case 'addInitialPosition': return !!this.log('npc.addInitialPosition', { x: E(0), y: E(1) });
          case 'addActivityRegion':  return !!this.log('npc.addActivityRegion', { x: E(0), y: E(1), r: E(2), dir: S(3) });
          case 'addNode':            return !!this.log('npc.addNode', { x: E(0), y: E(1) });
          case 'removeNode':         return !!this.log('npc.removeNode', {});
          case 'setVelocity':        return !!this.log('npc.setVelocity', { v: E(0) });
          case 'setState':           return !!this.log('npc.setState', { st: S(0) });
          case 'setDirection':       return !!this.log('npc.setDirection', { d: S(0) });
          case 'setPosition':        return !!this.log('npc.setPosition', { x: E(0), y: E(1) });
          case 'setSequence':        return !!this.log('npc.setSequence', { seq: S(0) });
          case 'setAiEnabled':       return !!this.log('npc.setAiEnabled', { on: S(0) === 'true' });
          case 'setIgnoreEvent':     return !!this.log('npc.setIgnoreEvent', { on: S(0) === 'true' });
          case 'setPortrait':        return !!this.log('npc.setPortrait', {});
          case 'reverse':            return !!this.log('npc.reverse', { on: S(0) === 'true' });
          // npc.in <延迟>：把元素登记进场景表并记录初始坐标（e.java:2760）
          case 'in':                 return !!this.log('npc.in', { delay: E(0) });
          case 'moveTo':             return !!this.log('npc.moveTo', { x: E(0), y: E(1) });
          case 'showFace':           return !!this.log('npc.showFace', {});
          case 'hideFace':           return !!this.log('npc.hideFace', {});
          case 'bindPlayer':         return !!this.log('npc.bindPlayer', {});
          case 'unbindPlayer':       return !!this.log('npc.unbindPlayer', {});
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- player ----------------
      case 'player':
        switch (name) {
          case 'moveTo': case 'move': case 'takeTheStairs':
            return !!this.log('player.' + name, { a: a.slice() });
          case 'playAnimation': case 'setSequence': case 'setVelocity':
          case 'setDirection': case 'setPosition':
            return !!this.log('player.' + name, { a: a.slice() });
          case 'setState':          return !!this.log('player.setState', { st: S(0) });
          case 'addItem':           return !!this.log('player.addItem', { item: S(0), n: a.length > 1 ? E(1) : 1 });
          case 'removeItem':        return !!this.log('player.removeItem', { item: S(0), n: a.length > 1 ? E(1) : 1 });
          case 'addGold':           return !!this.log('player.addGold', { n: E(0) });
          case 'reduceGold':        return !!this.log('player.reduceGold', { n: E(0) });
          case 'setGold':           return !!this.log('player.setGold', { n: E(0) });
          case 'healing':           return !!this.log('player.healing', { n: E(0) });
          case 'levelup':           return !!this.log('player.levelup', {});
          case 'showFace': case 'hideFace':
            return !!this.log('player.' + name, {});
          case 'firstTask':         return !!this.log('player.firstTask', {});
          case 'task':              return !!this.log('player.task', { id: E(0) });
          case 'removeTask':        return !!this.log('player.removeTask', { id: E(0) });
          case 'startSkill':        return !!this.log('player.startSkill', { id: E(0) });
          case 'startArtSkill':    return !!this.log('player.startArtSkill', { id: E(0) });
          case 'addspeed':          return !!this.log('player.addspeed', { n: E(0) });
          case 'addluck':           return !!this.log('player.addluck', { n: E(0) });
          case 'addgod':            return !!this.log('player.addgod', { n: E(0) });
          case 'addhp':             return !!this.log('player.addhp', { n: E(0) });
          case 'addlove':           return !!this.log('player.addlove', { n: E(0) });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- partner ----------------
      case 'partner':
        switch (name) {
          case 'addFeeling':    return !!this.log('partner.addFeeling', { who: S(0), n: E(1) });
          case 'reduceFeeling': return !!this.log('partner.reduceFeeling', { who: S(0), n: E(1) });
          // partner.in <队友> <延迟>：加入并登记初始坐标（e.java:2800）
          case 'in':   return !!this.log('partner.in', { who: S(0), delay: E(1) });
          // partner.out <队友> <延迟>：离开并播放立绘收回（e.java:2814）
          case 'out':  return !!this.log('partner.out', { who: S(0), delay: E(1) });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- item / user ----------------
      case 'item':
        if (name === 'remove') return !!this.log('item.remove', {});
        this.stats.unknownCmd++; return false;
      case 'user':
        if (name === 'addHP') return !!this.log('user.addHP', { n: E(0) });
        this.stats.unknownCmd++; return false;
      // ---------------- camera ----------------
      case 'camera':
        switch (name) {
          case 'setFocusOnPlayer': return !!this.log('camera.setFocusOnPlayer', {});
          case 'setFocusOnNpc':    return !!this.log('camera.setFocusOnNpc', { who: S(0) });
          case 'setPosition':      return !!this.log('camera.setPosition', { x: E(0), y: E(1) });
          case 'moveTo':           return !!this.log('camera.moveTo', { x: E(0), y: E(1) });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- dialogBox ----------------
      case 'dialogBox':
        switch (name) {
          case 'setText':            return !!this.log('dialog.setText', { text: S(0) });
          case 'setType':            return !!this.log('dialog.setType', { type: S(0) });
          case 'showDialog':         return !!this.log('dialog.show', {});
          case 'hideDialog':         return !!this.log('dialog.hide', {});
          case 'showPlayerPortrait': return !!this.log('dialog.showPlayerPortrait', {});
          case 'showNpcPortrait':    return !!this.log('dialog.showNpcPortrait', {});
          case 'hidePortrait':       return !!this.log('dialog.hidePortrait', {});
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- guide ----------------
      case 'guide':
        if (name === 'setText')  return !!this.log('guide.setText', { text: S(0) });
        if (name === 'setTarget') return !!this.log('guide.setTarget', { t: S(0) });
        this.stats.unknownCmd++; return false;
      // ---------------- script ----------------
      case 'script':
        switch (name) {
          case 'openScriptList':  return !!this.log('script.openScriptList', {});
          case 'closeScriptList': return !!this.log('script.closeScriptList', {});
          case 'wait':            return !!this.log('script.wait', { ms: E(0) });
          case 'break':           return !!this.log('script.break', {});
          case 'load':            return !!this.log('script.load', { file: S(0) });
          case 'include':         return !!this.log('script.include', { file: S(0), line: E(1) });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- game ----------------
      case 'game':
        switch (name) {
          case 'markEvent':       return !!this.log('game.markEvent', { n: E(0) });
          case 'unmarkEvent':     return !!this.log('game.unmarkEvent', { n: E(0) });
          case 'showMenu':        return !!this.log('game.showMenu', {});
          case 'showFee':         return !!this.log('game.showFee', {});
          case 'dropRock':        return !!this.log('game.dropRock', {});
          case 'dropRockClear':   return !!this.log('game.dropRockClear', {});
          case 'waitForKey':      return !!this.log('game.waitForKey', { keys: S(0), msg: S(1) });
          case 'branch':          return !!this.log('game.branch', { a: a.slice() });
          case 'gray':            return !!this.log('game.gray', { on: S(0) === 'true' });
          case 'fight':           return !!this.log('game.fight', { key: S(0), t1: E(1), t2: E(2), t3: E(3) });
          case 'flicker':         return !!this.log('game.flicker', { ms: E(0), color: a.length > 1 ? E(1) : null });
          case 'vibrate':         return !!this.log('game.vibrate', {});
          case 'black':           return !!this.log('game.black', { text: S(0) });
          case 'verse':           return !!this.log('game.verse', { text: S(0) });
          case 'showNpc':         return !!this.log('game.showNpc', {});
          case 'showPlayer':      return !!this.log('game.showPlayer', {});
          // game.clear：清闪烁时长、停震动、清当前目标（e.java:3038）
          case 'clear':           return !!this.log('game.clear', {});
          case 'showMonster':     return !!this.log('game.showMonster', {});
          case 'hideMonster':     return !!this.log('game.hideMonster', {});
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- countdownTimer ----------------
      case 'countdownTimer':
        if (name === 'setMillis') return !!this.log('countdown.setMillis', { ms: E(0) });
        if (name === 'stop')      return !!this.log('countdown.stop', {});
        this.stats.unknownCmd++; return false;
      // ---------------- midi ----------------
      case 'midi':
        switch (name) {
          // 第二参数直接是 Player.setLoopCount，-1 = 无限循环
          case 'play': return !!this.log('midi.play', { file: S(0), loop: E(1) });
          case 'stop': return !!this.log('midi.stop', {});
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- system ----------------
      case 'system':
        switch (name) {
          case 'showInfo':           return !!this.log('system.showInfo', { text: S(0), ms: E(1) });
          case 'showAsideInfo':      return !!this.log('system.showAsideInfo', { a: a.slice() });
          case 'trade':             return !!this.log('system.trade', { items: String(S(0) || '').split('|') });
          case 'returnToMainMenu':  return !!this.log('system.returnToMainMenu', {});
          case 'showScreenMargin':   return !!this.log('system.showScreenMargin', { on: S(0) === 'true' });
          case 'hideScreenMargin':   return !!this.log('system.hideScreenMargin', {});
          case 'markFee':            return !!this.log('system.markFee', { n: E(0) });
          case 'unmarkFee':          return !!this.log('system.unmarkFee', { n: E(0) });
          default: this.stats.unknownCmd++; return false;
        }
      // ---------------- fee ----------------
      case 'fee':
        if (name === 'ybdx') return !!this.log('fee.ybdx', {});
        this.stats.unknownCmd++; return false;
      // ---------------- 战斗侧 ----------------
      case 'attacker':
      case 'skill':
        this.stats.unknownNs++; return false;
      default:
        this.stats.unknownNs++;
        return false;
    }
  };

  /** 跑完一整份地图脚本 AST；返回统计
   * ★ 遇到 world.change 即停（原版立即切图，后续脚本不再执行，e.java:2573） */
  Interp.prototype.runAll = function (ast) {
    for (var i = 0; i < (ast || []).length; i++) {
      if (this.step(ast[i])) this.stats.exec++;
      var last = this.effects[this.effects.length - 1];
      if (last && last.kind === 'world.change') break;
    }
    return this.stats;
  };

  global.XJScript = {
    Expr: Expr,
    evalExpr: evalExpr,
    exprVars: exprVars,
    Cond: Cond,
    testConds: testConds,
    Interp: Interp,
    javaQuirks: ['-2^2==4', '-10/3==-3', '-10%3==-1', '2^-1==0',
                 'undefinedVar==0', 'div0 throws', 'per-instance scope']
  };
})(typeof window !== 'undefined' ? window : globalThis);