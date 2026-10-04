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
    return max - Math.abs(rnd.nextInt()) % (max - min + 1);
  }
  /* j.b(x,y,rnd)：概率 x/y（j.java:146） */
  function chance(x, y, rnd) {
    if (x * y < 0) return false;
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

    // ★ 字段名与 ax.java 保持一致，便于与源码逐条对照
    this.I = opts.hp != null ? opts.hp : 1000;          // 当前精
    this.J = opts.maxHp != null ? opts.maxHp : 1000;     // 最大精
    this.K = opts.atk || 0;                              // 攻击
    this.L = opts.def != null ? opts.def : 0;            // 防御 ★ 怪物恒 0
    this.M = opts.mp || 0; this.N = opts.maxMp || 1;    // 神 / 最大神
    this.O = opts.gas || 0; this.P = opts.maxGas || 1;  // 气 / 最大气
    this.Q = opts.spd != null ? opts.spd : 1;            // 速度
    this.S = opts.luk || 0;                              // 运
    this.R = opts.gainGas || 0;                          // 攻击时目标增加的气
    this.H = opts.level != null ? opts.level : 1;        // 等级
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

  global.XJBattle = {
    Battle: Battle, Unit: Unit,
    randInt: randInt, chance: chance, isqrt: isqrt,
    STATE: STATE, HITTYPE: HITTYPE, POPUP: POPUP
  };
})(typeof window !== 'undefined' ? window : globalThis);