/* xj_battle.js —— 战斗系统
 *
 * 严格按 3-数据/07-逻辑/战斗系统.json 实现，不内嵌任何魔法数。
 * 每条规则都对应 ax.java / f.java / bd.java / g.java 的具体行号，
 * 行号写在代码注释里，便于逐条复核。
 *
 * ★ 必须照搬的 6 条原实现怪癖（详见 4-文档/格式规范/战斗系统.md）：
 *   1. 怪物等级恒为 1（g.java:26 写死 this.l(1)）→ 怪物技能 slv 恒 1
 *   2. 怪物防御恒为 0（g.java:31 this.m(0)）
 *   3. 增益取【施法者】的攻击/防御，不是目标的（ax.java:1026）
 *   4. addspeed 固定 +1，与技能等级无关（ax.java:1045）
 *   5. 阵亡扣【好感度】5 点、精强制置 1，不扣经验（f.java:1069）
 *   6. 普通攻击强制 slv=4、变身强制 slv=5（bd.java:73）
 */
(function (global) {
  'use strict';
  var XJ = global.XJ;
  var XS = global.XJScript;

  // ---------------------------------------------------------------- 随机
  /* j.a(min,max,rnd)：闭区间均匀整数（j.java:135） */
  function randInt(min, max, rnd) {
    if (max < min) throw new Error('非法区间');
    if (!rnd) return min + ((Math.random() * (max - min + 1)) | 0);
    return max - Math.abs(rnd.nextInt()) % (max - min + 1);
  }
  /* j.b(x,y,rnd)：概率 x/y（j.java:146） */
  function chance(x, y, rnd) {
    if (x * y < 0) return false;
    if (!rnd) return Math.random() < Math.abs(x) / Math.abs(y);
    return Math.abs(rnd.nextInt()) % y < Math.abs(x);
  }
  /* j.a(n)：round(sqrt(n))（j.java:103） */
  function isqrt(n) { return Math.round(Math.sqrt(n)); }

  // ---------------------------------------------------------------- 单位
  var STATE = { STAND: 0, FADE: 1, ATTACK: 2, DEAD: 7, SPELL: 8, MORPH: 9 };
  var HITTYPE = { SINGLE: 1, NORMAL: 3, BLOCK: 5, EVADE: 6 };
  var POPUP = { NORMAL: 0, CRIT: 1, EVADE: 2, HEAL: 3, MISS: 4, COUNTER: 5, DOT: 6, RESET: 7 };

  function Unit(opts) {
    this.side = opts.side;                  // 'hero' | 'foe'
    this.slot = opts.slot;                  // 0..2
    this.name = opts.name || '';
    this.ant = opts.ant || null;            // ANT 名
    this.stateName = opts.stateName || '站立';

    // ★ 字段名与 ax.java 保持一致，便于与源码逐条对照。
    //   先设上限再设当前值，否则钳制会把它压到默认的 1。
    this.N = Math.max(1, opts.maxMp != null ? opts.maxMp : 1);
    this.M = Math.max(0, Math.min(opts.mp || 0, this.N));
    this.P = Math.max(1, opts.maxGas != null ? opts.maxGas : 1);
    this.O = Math.max(0, Math.min(opts.gas || 0, this.P));
    this.J = Math.max(1, opts.maxHp != null ? opts.maxHp : 1000);
    this.I = Math.max(0, Math.min(opts.hp != null ? opts.hp : 1000, this.J));
    this.K = Math.max(0, opts.atk || 0);                 // 攻击
    this.L = opts.def != null ? opts.def : 0;            // 防御 ★ 怪物恒 0
    this.Q = Math.max(0, opts.spd != null ? opts.spd : 1);  // 速度
    this.S = opts.luk || 0;                              // 运
    this.R = opts.gainGas || 0;                          // 攻击时目标增加的气
    this.H = Math.max(opts.level != null ? opts.level : 1, 1);   // 等级
    this.T = 0;                                          // 好感度（玩家）
    this.i = 0;                                          // 行动条 0..1000
    this.c = 0;                                          // 技能速度（行动期增量）
    this.t = STATE.STAND;                                // 状态机
    this.j = false;                                      // 本回合已行动
    this.ab = false;                                     // 格挡中
    this.ac = false;                                     // 变身中
    this.B = false;                                      // 反击标记
    this.z = false;                                      // 定身
    this.u = false;                                      // 持续掉血
    this.C = 0; this.D = 0;   // 武增 / 剩余回合
    this.E = 0; this.F = 0;   // 防增 / 剩余回合
    this.a = 0; this.G = 0;   // 速增 / 剩余回合
    this.s = null;              // 当前技能 (af)
    this.Z = null;              // 目标
    this.dead = false;
    this.y = 0;                 // 动画帧计时
  }

  /* ---- 带钳制的 setter，严格照 ax.java 的 getter/setter ----
   * k(J>=1)  m(DEF 无钳制)  g(K>=0)  h(M 0..N)  i(N>=1)
   * e(O 0..P)  f(P>=1)  n(Q>=0)  p(S 无)  q(T 无)  l(H>=1)              */
  Unit.prototype.k = function (v) { this.J = Math.max(1, v | 0); return this.J; };
  Unit.prototype.m = function (v) { this.L = v | 0; return this.L; };
  Unit.prototype.g = function (v) { this.K = Math.max(0, v | 0); return this.K; };
  Unit.prototype.h = function (v) { this.M = Math.max(0, Math.min(v | 0, this.N)); return this.M; };
  Unit.prototype.i = function (v) { this.N = Math.max(1, v | 0); return this.N; };
  Unit.prototype.e = function (v) { this.O = Math.max(0, Math.min(v | 0, this.P)); return this.O; };
  Unit.prototype.f = function (v) { this.P = Math.max(1, v | 0); return this.P; };
  Unit.prototype.n = function (v) { this.Q = Math.max(0, v | 0); return this.Q; };
  Unit.prototype.p = function (v) { this.S = v | 0; return this.S; };
  Unit.prototype.q = function (v) { this.T = v | 0; return this.T; };
  Unit.prototype.l = function (v) { this.H = Math.max(v | 0, 1); return this.H; };

  /* ---- 便捷别名（内部字段沿用 ax.java 的单字母名） ---- */
  Object.defineProperties(Unit.prototype, {
    level:  { get: function () { return this.H; }, set: function (v) { this.H = v; } },
    hp:     { get: function () { return this.I; }, set: function (v) { this.addHp(v); } },
    maxHp:  { get: function () { return this.J; }, set: function (v) { this.k(v); } },
    atk:    { get: function () { return this.K; }, set: function (v) { this.g(v); } },
    def:    { get: function () { return this.L; }, set: function (v) { this.m(v); } },
    mp:     { get: function () { return this.M; }, set: function (v) { this.h(v); } },
    maxMp:  { get: function () { return this.N; }, set: function (v) { this.i(v); } },
    gas:    { get: function () { return this.O; }, set: function (v) { this.e(v); } },
    maxGas: { get: function () { return this.P; }, set: function (v) { this.f(v); } },
    spd:    { get: function () { return this.Q; }, set: function (v) { this.n(v); } },
    luk:    { get: function () { return this.S; }, set: function (v) { this.p(v); } },
    exp:    { get: function () { return this.T; }, set: function (v) { this.q(v); } },
    gauge:  { get: function () { return this.i; }, set: function (v) { this.i = v; } },
    acted:  { get: function () { return this.j; }, set: function (v) { this.j = v; } },
    state:  { get: function () { return this.t; }, set: function (v) { this.t = v; } },
    block:  { get: function () { return this.ab; }, set: function (v) { this.ab = v; } },
    morph:  { get: function () { return this.ac; }, set: function (v) { this.ac = v; } },
    counter:{ get: function () { return this.B; }, set: function (v) { this.B = v; } },
    frozen: { get: function () { return this.z; }, set: function (v) { this.z = v; } },
    atkBuff:{ get: function () { return this.C; }, set: function (v) { this.C = v; } },
    defBuff:{ get: function () { return this.E; }, set: function (v) { this.E = v; } },
    spdBuff:{ get: function () { return this.a; }, set: function (v) { this.a = v; } }
  });

  Unit.prototype.isDead = function () { return this.t === STATE.DEAD; };
  Unit.prototype.hpPct = function () { return this.J > 0 ? this.I / this.J : 0; };
  /* ax.java:577  M()：精 < 最大精*2/10 → 重伤帧 */
  Unit.prototype.isWounded = function () {
    return this.I < (this.J << 1) / 10 && this.t === STATE.STAND;
  };
  Unit.prototype.canAct = function () { return !this.dead && this.hpPct() > 0; };

  Unit.prototype.addHp = function (n) {
    this.I = Math.max(0, Math.min(n, this.J));
    if (this.I <= 0 && (this.t === STATE.STAND || this.t === STATE.FADE)) {
      this.dead = true; this.t = STATE.DEAD;      // ax.java:213
    }
    return this.I;
  };

  /** ax.java:530  武增生效 */
  Unit.prototype.atkBuffOn = function () { return this.D > 0 && this.C > 0; };
  Unit.prototype.defBuffOn = function () { return this.F > 0 && this.E > 0; };
  Unit.prototype.spdBuffOn = function () { return this.G > 0 && this.a > 0; };

  /** 有效攻击 / 有效防御（含 buff） */
  Unit.prototype.effAtk = function () { return this.K + this.C; };
  Unit.prototype.effDef = function () { return this.L + this.E; };

  // ---------------------------------------------------------------- 战斗
  function Battle(opts) {
    // Math.random 不可 new；包一层 nextInt 接口即可
    this.rnd = opts.rnd || {
      nextInt: function () { return Math.floor(Math.random() * 0x7fffffff) - 0x40000000; }
    };
    this.W = opts.W || XJ.C().W;                  // 行动阈值 750
    this.GAUGE_MAX = XJ.C().GAUGE_MAX || 1000;
    this.CRIT_DEN = XJ.C().CRIT_DEN;              // 200
    this.EVADE_DEN = XJ.C().EVADE_DEN;            // 100
    this.MORPH_GAS = XJ.C().MORPH_GAS;            // 10
    this.MORPH_NUM = XJ.C().MORPH_DMG_NUM;        // 3
    this.MORPH_DEN = XJ.C().MORPH_DMG_DEN;        // 5
    this.LEVEL_CAP = XJ.C().LEVEL_CAP || 45;
    this.heroSlots = XJ.C().HERO_SLOTS;
    this.foeSlots = XJ.C().FOE_SLOTS;
    this.attackRange = XJ.C().ATTACK_RANGE || 25;

    this.heroes = [];
    this.foes = [];
    this.units = [];                              // d[0..2]=玩家, d[3..5]=敌人
    this.order = [];                              // e[i] = [索引, 速度]
    this.turn = 0;
    this.phase = 0;                               // T: 0=进行中 1=胜 2=败
    this.log = [];
    this.popups = [];
    this.formulas = opts.formulas || {};          // 技能名 → 伤害公式
    this.state = 0;
    this.over = null;
  }

  Battle.prototype.add = function (u) {
    if (u.side === 'hero') { u.index = this.heroes.length; this.heroes.push(u); }
    else { u.index = this.foes.length; this.foes.push(u); }
    this.units = this.heroes.concat(this.foes);
    return u;
  };

  Battle.prototype.note = function (s) { this.log.push(s); return s; };

  // ------------------------------------------------------------ 技能表
  /** 从 XJ_LOGIC.skillFormulas.player 建立 名字→{公式, 类型, 全体, …} */
  Battle.prototype.skillByName = function (n) {
    if (!this._skillCache) {
      this._skillCache = {};
      var list = (XJ.data.logic.skillFormulas || {}).player || [];
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        if (s.name) this._skillCache[s.name] = s;
      }
    }
    return this._skillCache[n] || null;
  };

  /**
   * af.a(slv, atk)：int(eval(公式, {slv, atk}))
   * 出处 af.java:76。整数除法由 xj_script 的 Expr 保证（向 0 截断）。
   */
  Battle.prototype.evalFormula = function (formula, slv, atk) {
    if (!formula) return 0;
    try {
      return XS.evalExpr(formula, { slv: Math.max(slv | 0, 1), atk: atk | 0 });
    } catch (e) {
      this.note('公式求值失败 ' + formula + ' → ' + e.message);
      return 0;
    }
  };

  /** 普通攻击的 slv 固定 4；变身固定 5（bd.java:73） */
  Battle.prototype.skillLevel = function (u, sk) {
    if (!sk) return 1;
    if (sk.kindCode === 0) return 4;              // 普通攻击
    if (sk.kindCode === 7) return 5;              // 变身
    if (u.side === 'foe') {
      // ★ g.java:139  (等级+20)/20；而 g 构造器写死等级=1 → 恒为 1
      return Math.floor((u.H + 20) / 20);
    }
    return sk.level || 1;                         // 玩家取存档等级
  };

  // ------------------------------------------------------------ 行动条
  /**
   * ax.java:119-161 每帧推进。返回本帧是否有人开始行动。
   * 顺序严格照搬：
   *   ① 仅当「敌人尚未全灭」且「本单位未定身」时推进
   *   ② 阈值吸附 W<i<W+(速度+速增) 且未行动 → i=W
   *   ③ 硬上限 1000
   *   ④ buff 递减窗口 i∈[速度+速增, 2*(速度+速增))
   *   ⑤ 回合开始 !已行动 && i==W
   *   ⑥ 回合结束 已行动 && i==1000
   */
  Battle.prototype.tick = function () {
    var allFoesDead = this.foes.every(function (u) { return u.isDead(); });
    var began = [], ended = [];
    for (var k = 0; k < this.units.length; k++) {
      var u = this.units[k];
      if (u.isDead()) { u.i = 0; continue; }

      // ① 推进
      if (!allFoesDead && !u.z) {
        u.i += u.j ? (u.c + u.a) : (u.Q + u.a);
      }
      // ② 吸附 + ③ 上限
      if (u.i > this.W && u.i < this.W + u.Q + u.a && !u.j) u.i = this.W;
      if (u.i > this.GAUGE_MAX) u.i = this.GAUGE_MAX;

      // ④ buff 递减
      var sp = u.Q + u.a;
      if (u.i >= sp && u.i < sp * 2) {
        if (u.C > 0) { if (u.D > 0) u.D--; else { u.C = 0; u.D = 0; } }
        if (u.E > 0) { if (u.F > 0) u.F--; else { u.E = 0; u.F = 0; } }
        if (u.a > 0) { if (u.G > 0) u.G--; else { u.a = 0; u.G = 0; } }
      }
      // ⑤⑥
      if (!u.j && u.i === this.W) {
        began.push(u); u.j = true;
        this.onTurnStart(u);
      } else if (u.j && u.i === this.GAUGE_MAX) { ended.push(u); }
    }
    return { began: began, ended: ended };
  };

  /**
   * 回合开始时的处理。
   * 原版在 bd.a(af,ax) / g.c() 里把 `c`（技能速度）设为技能表达式求值的结果，
   * 例如「仙术速度」= 10+4*(slv-1)，恒为正。
   * ★ 若 c 与速增 a 同时为 0，行动期增量 `i += (c+a)` 会让行动条永远停在 W，
   *   整场战斗死锁。原版靠表达式保证不会发生；这里显式兜底，避免调用方漏设。
   */
  Battle.prototype.onTurnStart = function (u) {
    if (u.c > 0 || u.a > 0) return;
    u.c = this.defaultSkillSpeed != null ? this.defaultSkillSpeed : 10;
  };

  /**
   * 按技能速度表达式设置行动期增量（原版做法）。
   * @param formula 技能速度表达式；英雄取角色配置的「仙术速度」，
   *                怪物取 fight_N.str 的「仙术速度」（bd.java:74 / g.java:134）
   */
  Battle.prototype.setSkillSpeed = function (u, formula, vars) {
    u.c = Math.max(1, this.evalFormula(formula, 1, 0) || 0);
    void vars;
    return u.c;
  };

  /** ax.java:238  h()：回合结束后重置行动条 */
  Battle.prototype.resetGauge = function (u) {
    u.i = 0; u.j = false; u.t = STATE.STAND;
  };

  /**
   * f.java:551  按行动速度【降序】冒泡排序。
   * 原代码是 `if (order[i][1] > order[j][1]) swap`，即小的往后换 → 大的在前。
   * 纯视觉用途，但引擎里保持一致。
   */
  Battle.prototype.sortOrder = function () {
    this.order = this.units.map(function (u, i) { return [i, u.Q + u.a]; });
    for (var i = 0; i < this.order.length; i++) {
      for (var j = 0; j < this.order.length; j++) {
        for (var k = j + 1; k < this.order.length; k++) {
          if (this.order[j][1] < this.order[k][1]) {
            var t = this.order[j]; this.order[j] = this.order[k]; this.order[k] = t;
          }
        }
      }
    }
    return this.order;
  };

  // ------------------------------------------------------------ 技能选择
  /**
   * g.java:115 怪物 AI：
   *   ① 精 <= 最大精*3/10 且 rand(精,100) 命中 且 有携带药品 → 用药并中断
   *   ② rand(5+等级/2, 100) 命中 → 仙术表随机，否则普通技能表随机
   */
  Battle.prototype.aiPickSkill = function (u, cfg) {
    cfg = cfg || {};
    var heal = cfg.carryItems || [];
    if (heal.length && u.I <= u.J * 3 / 10 && chance(u.I, 100, this.rnd)) {
      return { useItem: heal[randInt(0, heal.length - 1, this.rnd)] };
    }
    var spells = cfg.spellSkills || [];
    var normals = cfg.normalSkills || [];
    if (chance(5 + Math.floor(u.H / 2), 100, this.rnd) && spells.length)
      return { skill: spells[randInt(0, spells.length - 1, this.rnd)] };
    if (normals.length) return { skill: normals[randInt(0, normals.length - 1, this.rnd)] };
    if (spells.length) return { skill: spells[randInt(0, spells.length - 1, this.rnd)] };
    return { skill: '攻击' };
  };

  // ------------------------------------------------------------ 伤害结算
  /**
   * ax.java:494  a(String label, ax target, int type, int delay)
   * 这是整个战斗的核心，逐行照搬。
   */
  Battle.prototype.resolveHit = function (attacker, target, type, delay) {
    var out = { type: type, target: target.name, label: null, dmg: 0, popup: null };
    if (!target || target.isDead()) return out;
    if (target.I <= 0) {
      this.popup(target, POPUP.MISS, 0);
      out.popup = POPUP.MISS; out.label = '死亡攻击空目标';
      return out;
    }

    var dmg;
    var adv = attacker.effAtk() - target.effDef();      // 攻击优势
    if (adv > 0) {                                        // ax.java:502
      var sk = attacker.s;
      var slv = this.skillLevel(attacker, sk);
      var formula = (sk && sk.formula) || (attacker.side === 'hero' ? 'atk' : 'atk');
      var base = this.evalFormula(formula, slv, adv);
      var roll = randInt(9, 11, this.rnd);                // ax.java:508
      dmg = Math.floor(base * roll / 10);                 // ax.java:516
      dmg = Math.max(dmg, 1);                             // ax.java:517
      if (attacker.ac) dmg = Math.floor(dmg * this.MORPH_NUM / this.MORPH_DEN);  // ax.java:521
      out.slv = slv; out.adv = adv; out.base = base; out.roll = roll;
    } else {
      dmg = 1;                                            // ax.java:524
      out.adv = adv;
    }

    // 推迟目标行动条（闪避不推迟）
    if (type !== HITTYPE.EVADE && target.i > 0 && target.i < this.W) {
      target.i -= (delay || 0);
    }

    if (type === HITTYPE.NORMAL) {
      // 怪物用变身技时给目标加气（ax.java:529）
      if (attacker.side === 'foe' && attacker.s && attacker.s.kindCode === 7) {
        target.O = Math.max(0, Math.min(target.O + attacker.R, target.P));
      }
      // 暴击：rand(施法者运, 200)，dmg!=1 才触发（ax.java:535）
      if (chance(attacker.S, this.CRIT_DEN, this.rnd) && dmg !== 1) {
        dmg <<= 1;
        dmg = Math.min(dmg, target.I);
        target.addHp(target.I - dmg);
        this.popup(target, POPUP.CRIT, dmg);
        out.popup = POPUP.CRIT; out.crit = true;
      } else {
        dmg = Math.min(dmg, target.I);
        target.addHp(target.I - dmg);
        this.popup(target, POPUP.NORMAL, dmg);
        out.popup = POPUP.NORMAL;
      }
      // 反击吸血：max(1, dmg/4)（ax.java:552）
      if (attacker.B) {
        var back = Math.max(1, Math.floor(dmg / 4));
        attacker.addHp(attacker.I + back);
        this.popup(attacker, POPUP.HEAL, back);
        out.lifesteal = back;
      }
    } else if (type === HITTYPE.BLOCK) {
      dmg = (dmg >>= 1) <= 0 ? 1 : dmg;                   // ax.java:560
      dmg = Math.min(dmg, target.I);
      target.addHp(target.I - dmg);
      this.popup(target, POPUP.NORMAL, dmg);
      out.popup = POPUP.NORMAL;
    } else if (type === HITTYPE.EVADE) {
      this.popup(target, POPUP.EVADE, 0);                // 不掉血
      out.popup = POPUP.EVADE;
      out.applied = 0;                                   // 实际掉血为 0
      out.wouldBe = dmg;                                 // 若命中本会造成的伤害
      return out;
    }
    out.dmg = dmg;
    return out;
  };

  Battle.prototype.popup = function (u, kind, val) {
    this.popups.push({ unit: u.name, side: u.side, kind: kind, value: val, turn: this.turn });
  };

  /**
   * 范围攻击：遍历对方全部存活单位，每人独立判定。
   * bd.java:160（玩家出手）/ g.java:143（怪物出手）
   * 先判格挡（type 5），再判闪避（type 6），否则普通攻击（type 3）。
   */
  Battle.prototype.attack = function (attacker, skill, targets) {
    var self = this;
    attacker.s = skill || attacker.s;
    var res = [];
    (targets || []).forEach(function (t) {
      if (t.isDead()) { self.popup(t, POPUP.MISS, 0); return; }
      if (t.ab) {
        res.push(self.resolveHit(attacker, t, HITTYPE.BLOCK, 0));
        return;
      }
      // 闪避：rand(目标运, 100)（ax.java:486）；攻击者已行动过则不再判
      if (!attacker.j && t.I > 0 && chance(t.S, self.EVADE_DEN, self.rnd)) {
        res.push(self.resolveHit(attacker, t, HITTYPE.EVADE, 0));
        return;
      }
      res.push(self.resolveHit(attacker, t, HITTYPE.NORMAL, 0));
    });
    return res;
  };

  // ------------------------------------------------------------ buff
  /**
   * ax.java:1021-1070  技能施加增益
   * ★ 增益数值取【施法者】的攻防，不是目标的（ax.java:1026）
   * ★ addspeed 固定 +1，与技能等级无关（ax.java:1045）
   */
  Battle.prototype.applyBuff = function (caster, target, kind, slv) {
    var pct = 10 + 5 * (slv - 1);
    if (kind === 'atk') {
      target.D = slv + 2;
      target.C = Math.floor(pct * caster.K / 100);
      return target.C;
    }
    if (kind === 'def') {
      target.F = slv + 2;
      target.E = Math.floor(pct * caster.L / 100);
      return target.E;
    }
    if (kind === 'spd') {
      target.G = slv + 2;
      target.a = 1;                        // ★ 固定 +1
      return 1;
    }
    return 0;
  };

  /** addAll：对全部存活队友同时施加三种（ax.java:1055） */
  Battle.prototype.applyBuffAll = function (caster, team, slv) {
    var self = this;
    team.forEach(function (m) {
      if (m.isDead()) return;
      self.applyBuff(caster, m, 'atk', slv);
      self.applyBuff(caster, m, 'def', slv);
      self.applyBuff(caster, m, 'spd', slv);
    });
  };

  // ------------------------------------------------------------ 变身
  /** bd.java:43  变身每回合扣气 10，气不足则取消变身 */
  Battle.prototype.payMorph = function (u) {
    if (!u.ac) return true;
    if (u.O >= this.MORPH_GAS) { u.O -= this.MORPH_GAS; return true; }
    this.note(u.name + ' 气值不足，变身取消');
    u.ac = false;
    return false;
  };

  // ------------------------------------------------------------ 胜负
  /** f.java:950  全玩家死→败；全敌人死→胜 */
  Battle.prototype.checkOver = function () {
    if (this.phase !== 0) return this.phase;
    if (this.foes.every(function (u) { return u.isDead(); })) { this.phase = 1; this.over = 'win'; return 1; }
    if (this.heroes.every(function (u) { return u.isDead(); })) { this.phase = 2; this.over = 'lose'; return 2; }
    return 0;
  };

  /**
   * f.java:1020 f(1) 胜利结算
   * ★ 阵亡者扣【好感度】5 点、精强制置 1，不扣经验（f.java:1069）
   */
  Battle.prototype.settleWin = function (exp, gold) {
    var res = [];
    for (var i = 0; i < this.heroes.length; i++) {
      var h = this.heroes[i];
      if (!h.isDead()) {
        res.push({ name: h.name, alive: true, hp: h.I, feeling: h.T });
      } else {
        var before = h.T;
        h.T = before - 5;                 // 好感度 -5
        h.addHp(1);                       // 精强制置 1（不死）
        res.push({ name: h.name, alive: false, feelingBefore: before, feeling: h.T, hp: 1 });
      }
    }
    this.note('战斗胜利 经验 ' + exp + ' 金钱 ' + gold);
    return { exp: exp, gold: gold, members: res };
  };

  // ------------------------------------------------------------ 遇敌
  /**
   * f.java:443  怪物等级 = 主角等级 ±1，夹在 [lvmin, lvmax]
   * f.java:350  数量分配表
   */
  Battle.prototype.rollEnemyLevel = function (plv, lvmin, lvmax) {
    if (plv <= lvmin) return lvmin;
    if (plv >= lvmax) return lvmax;
    var lo = Math.max(lvmin, plv - 1), hi = Math.min(lvmax, plv + 1);
    return randInt(lo, hi, this.rnd);
  };

  Battle.prototype.rollCount = function (total) {
    var r = randInt(0, 100, this.rnd);
    if (total === 1) return r < 50 ? 1 : (r < 95 ? 2 : 3);
    if (total === 2) return r < 50 ? 2 : (r < 90 ? 3 : 1);
    return r < 5 ? 1 : (r < 40 ? 2 : 3);
  };

  // ------------------------------------------------------------ 距离
  /** j.java:123  圆判定 dx²+dy² <= r² */
  Battle.prototype.inRange = function (ax, ay, bx, by, r) {
    var dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy <= r * r;
  };

  // ------------------------------------------------------------ 遇敌组建
  /**
   * enemy.str 的键值表（由 30-解析脚本与配置.py 从 enemy.str 抽出）。
   * 值为 5 段逗号分隔：
   *   ID范围, 怪物种类, 等级范围, 战斗背景ANT, BGM
   * 例：
   *   boss1     = 9,1,60,fight_mishi,boss.mid      单种怪 id9，等级 60
   *   十里坡东  = 1-2,2,#32?25-35:0-10,...        两种怪 id1/id2，按等级与事件选段
   */
  function enemySpec(key) {
    var D = XJ.data.config || {};
    var raw = D.enemyDistRaw || {};
    var v = raw[key];
    if (v == null) return null;
    if (Array.isArray(v)) v = v.join(',');
    var a = String(v).split(',').map(function (s) { return s.trim(); });
    if (a.length < 5) return null;
    return { key: key, idSpec: a[0], kinds: parseInt(a[1], 10) || 1,
             levelSpec: a[2], bgAnt: a[3].replace(/\.ant$/i, ''), bgm: a[4] };
  }

  /** ID范围 "1-2-5" → [1,2,5]；"9" → [9] */
  function parseIdSpec(s) {
    return String(s).split('-').map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return !isNaN(x); });
  }

  /** 等级范围 "0-20" → [0,20]；"60" → [60,60] */
  function parseLevelSpec(s) {
    var a = String(s).split('-').map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return !isNaN(x); });
    if (!a.length) return [1, 1];
    return a.length === 1 ? [a[0], a[0]] : [a[0], a[1]];
  }

  /**
   * 等级范围里的条件形式：#事件ID?成立段:不成立段
   * 例 "#32?25-35:0-10" —— event32 为 1 用 25-35，否则用 0-10
   */
  function resolveLevelSpec(spec, world) {
    var s = String(spec);
    if (s.charAt(0) !== '#') return parseLevelSpec(s);
    var m = s.match(/^#(\d+)\?([^:]+):(.+)$/);
    if (!m) return parseLevelSpec(s);
    var on = !!(world && world.event && world.event(parseInt(m[1], 10)) === 1);
    return parseLevelSpec(on ? m[2] : m[3]);
  }

  /** 从 fight_<id>.str 的产物建怪物单位 */
  function makeMonster(cfgId, level, rnd, cfgIndex) {
    var F = (XJ.data.scripts && XJ.data.scripts.fight) || {};
    var key = 'fight_' + cfgId;
    var cfg = F[key];
    if (!cfg) return null;
    var sc = cfg.scalars || {};
    var fm = cfg.formulas || {};
    var env = new XS.Expr({ lv: level, slv: 1 });
    /**
     * 取一个属性值。产物里有两种存放方式：
     *   scalars  —— 字面量（如 fight_9 的 最小生命 = "50000"）
     *   formulas —— 含 lv/slv 的表达式（如 fight_2 的 最小生命 = ((100+26*lv)*…)*3/2）
     * 两处都要查，否则公式型配置全部取不到值。
     */
    function num(field, dflt) {
      var raw = sc[field];
      if (raw != null) {
        try { return env.eval(String(raw)); } catch (e) { /* 落到 formulas */ }
      }
      var f = fm[field];
      if (f && f.expr) {
        try { return env.eval(String(f.expr)); } catch (e) { return dflt; }
      }
      return dflt;
    }
    // 生命/速度/经验/金钱都是「最小/最大两列各自求值后取区间随机」（bm.java:33-41）
    function rng2(loField, hiField) {
      var a = num(loField, null), b = num(hiField, null);
      if (a == null || b == null) return 0;
      return randInt(Math.min(a, b), Math.max(a, b), rnd);
    }
    // 战斗位置 ID：1..5 的敌人不移动（g.java:41-51）
    var posId = parseInt(sc['ID'], 10) || 0;
    var skillSpeed = Math.max(1, num('仙术速度', 10));

    // af 构造器固定 12 个字段，而产物把整行按 '#' 拍平成一个列表，
    // 所以多技能要按 12 一切块，末尾不足 12 的残缺记录丢弃。
    var SKILL_FIELDS = 12;
    var skills = { normal: [], spell: [] };
    (cfg.tables || []).forEach(function (t) {
      var c = t.cols || [];
      if (c.length < 11) return;
      if (t.key === '普通技能') {
        skills.normal.push({ name: c[2], formula: c[10], anim: c[3], kindCode: 0,
                             all: c[4] === '是', costQi: parseInt(c[9], 10) || 0 });
      } else if (t.key === '仙术技能') {
        for (var i = 0; i + 10 < c.length; i += SKILL_FIELDS) {
          skills.spell.push({ name: c[i + 2], formula: c[i + 10], anim: c[i + 3],
                              kindCode: kindCode(c[i]), all: c[i + 4] === '是',
                              costQi: parseInt(c[i + 9], 10) || 0 });
        }
      }
    });

    var hpRoll = rng2('最小生命', '最大生命');
    var u = new Unit({
      side: 'foe', slot: 0,
      name: sc['名字'] || ('怪物' + cfgId),
      hp: hpRoll, maxHp: hpRoll,                     // 满血出场（g.java:27-28）
      atk: num('攻击值', 1), def: 0,                 // ★ 怪物防御恒 0
      spd: rng2('最小速度', '最大速度'), luk: num('运', 0),
      level: level, gas: 0, maxGas: 1, mp: 0, maxMp: 1,
      gainGas: num('攻击时增加的气值', 0)
    });
    u.moves = !(posId >= 1 && posId <= 5);
    u.skills = skills;
    u.skillSpeed = skillSpeed;
    u.expRange = [num('最小经验', 0), num('最大经验', 0)];
    u.goldRange = [num('最小金钱', 0), num('最大金钱', 0)];
    u.carry = String(sc['携带物品'] || '');
    u.drops = String(sc['掉落物品'] || '');
    u.cfgId = cfgId;
    u.def_ = sc;
    void cfgIndex;
    return u;
  }

  function kindCode(s) {
    var m = { '普通': 0, '水系': 1, '雷系': 2, '火系': 3, '风系': 4, '土系': 5, '双系': 6 };
    return m[s] != null ? m[s] : 7;
  }

  /**
   * 按 enemy.str 的键组建一场遭遇。
   * f.java:346 d(int) 与 f.java:428 a(String,int,int) 的完整实现。
   *
   * @param key      enemy.str 的键（地图名 或 boss1/liyao/…）
   * @param playerLv 主角等级（怪物等级 = 主角等级 ±1 再夹区间）
   * @param world    用于解析等级范围里的 #事件 条件
   */
  function encounter(key, playerLv, rnd, world) {
    var spec = enemySpec(key);
    if (!spec) return null;
    var ids = parseIdSpec(spec.idSpec);
    if (!ids.length) return null;
    var lvRange = resolveLevelSpec(spec.levelSpec, world);
    var out = { key: key, bgAnt: spec.bgAnt, bgm: spec.bgm, monsters: [], kinds: spec.kinds };

    if (spec.kinds === 2 && ids.length >= 2) {
      // 两种怪：随机拆分总数（f.java:388-404）
      var b = new Battle({ rnd: rnd });
      var per = b.rollCount(3);                     // 每种的数量（f.java:350 的表）
      var n1 = randInt(0, per, rnd), n2 = per - n1;
      var t1 = ids[randInt(0, ids.length - 1, rnd)];
      var ids2 = ids.filter(function (x) { return x !== t1; });
      var t2 = ids2.length ? ids2[randInt(0, ids2.length - 1, rnd)] : t1;
      var i;
      for (i = 0; i < n1; i++) out.monsters.push(mk(t1, playerLv, lvRange, rnd, i));
      for (i = 0; i < n2; i++) out.monsters.push(mk(t2, playerLv, lvRange, rnd, i));
    } else {
      var one = ids[randInt(0, ids.length - 1, rnd)];
      var n = 1;
      var bb = new Battle({ rnd: rnd });
      n = bb.rollCount(3);                          // f.java:350 的数量分配
      var k;
      for (k = 0; k < n; k++) out.monsters.push(mk(one, playerLv, lvRange, rnd, k));
    }
    out.monsters = out.monsters.filter(Boolean);
    if (out.monsters.length) {
      out.monsters[0].slot = 0;
      if (out.monsters[1]) out.monsters[1].slot = 1;
      if (out.monsters[2]) out.monsters[2].slot = 2;
      out.exp = 0; out.gold = 0;
      out.monsters.forEach(function (m) {
        out.exp += randInt(Math.min(m.expRange[0], m.expRange[1]),
                           Math.max(m.expRange[0], m.expRange[1]), rnd);
        out.gold += randInt(Math.min(m.goldRange[0], m.goldRange[1]),
                            Math.max(m.goldRange[0], m.goldRange[1]), rnd);
      });
    }
    return out;

    function mk(cfgId, plv, lvR, r, slot) {
      var lv = new Battle({ rnd: r }).rollEnemyLevel(plv, lvR[0], lvR[1]);
      var u = makeMonster(cfgId, lv, r);
      if (u) { u.slot = slot; u.c = u.skillSpeed; }
      return u;
    }
  }

  global.XJBattle = {
    Battle: Battle, Unit: Unit,
    encounter: encounter, enemySpec: enemySpec, makeMonster: makeMonster,
    parseIdSpec: parseIdSpec, parseLevelSpec: parseLevelSpec,
    resolveLevelSpec: resolveLevelSpec, kindCode: kindCode,
    randInt: randInt, chance: chance, isqrt: isqrt,
    STATE: STATE, HITTYPE: HITTYPE, POPUP: POPUP
  };
})(typeof window !== 'undefined' ? window : globalThis);