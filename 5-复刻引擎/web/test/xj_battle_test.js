/* xj_battle_test.js —— 战斗系统自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_battle_test.js
 *
 * 校验重点：
 *   1. 行动条：阈值 750、吸附规则、1000 硬上限、buff 递减窗口
 *   2. 伤害：攻击优势分支、技能公式、随机浮动、至少 1 点
 *   3. 闪避 = 目标运/100；暴击 = 施法者运/200 且 dmg×2
 *   4. 变身：气耗 10、伤害 ×3/5、slv 强制 5
 *   5. buff：(10+5*(lv-1))*施法者攻防/100、时长 lv+2、spd 固定 +1
 *   6. 阵亡扣好感度 5、精强制置 1
 *   7. 遇敌等级缩放 ±1、数量分配表
 *   8. 全部常量溯源到 XJ_LOGIC（不内嵌魔法数）
 */
'use strict';
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..');
let pass = 0, fail = 0; const failures = [];
function ok(c, m, x) {
  if (c) { pass++; console.log('  ✓ ' + m); }
  else { fail++; failures.push(m); console.log('  ✗ ' + m + (x ? '  → ' + x : '')); }
}
function head(t) { console.log('\n[' + t + ']'); }

global.window = global;
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj_script.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj_battle.js'), 'utf8'));
const B = window.XJBattle, XJ = window.XJ;

// 确定性随机：便于复现
function SeqRand(seq) { this.s = seq.slice(); this.k = 0; }
SeqRand.prototype.nextInt = function () {
  if (this.k >= this.s.length) { this.k = 0; }
  return this.s[this.k++];
};

function mkHero(o) {
  return new B.Unit(Object.assign({
    side: 'hero', slot: 0, name: '李逍遥', hp: 300, maxHp: 300,
    atk: 50, def: 20, spd: 30, luk: 40, level: 5, gas: 30, maxGas: 100
  }, o || {}));
}
function mkFoe(o) {
  return new B.Unit(Object.assign({
    side: 'foe', slot: 0, name: '赤练蛇', hp: 200, maxHp: 200,
    atk: 41, def: 0, spd: 15, luk: 10, level: 5
  }, o || {}));
}
function mkBattle(rnd) {
  const b = new B.Battle({ rnd: rnd || new SeqRand([1, 2, 3, 4, 5]) });
  b.add(mkHero()); b.add(mkHero({ slot: 1, name: '林月如' })); b.add(mkHero({ slot: 2, name: '赵灵儿' }));
  b.add(mkFoe()); b.add(mkFoe({ slot: 1, name: '花妖' })); b.add(mkFoe({ slot: 2, name: '邪剑仙' }));
  return b;
}

// ============================================================ 1
head('行动条');
const b = mkBattle();
ok(b.W === 750, '行动阈值 W=' + b.W + '（= 1000×135/180，溯源 XJ_LOGIC）');
ok(b.GAUGE_MAX === 1000, '行动条上限 ' + b.GAUGE_MAX);

{
  // 单独推进一个单位到阈值
  const u = mkHero({ spd: 100 });
  const bb = new B.Battle({ rnd: new SeqRand([7]) });
  bb.add(u); bb.add(mkFoe());
  let began = 0;
  for (let i = 0; i < 20; i++) { const r = bb.tick(); began += r.began.length; if (began) break; }
  ok(began === 1, '速度 100 的单位在第 ' + (u.i) + ' 点时开始行动（750/100 → 8 帧内）');
  ok(u.i === 750, '开始行动时行动条恰为 W=' + u.i + '（阈值吸附生效）');
}
{
  // 吸附：速度 300 时若不吸附会冲过 750
  const u = mkHero({ spd: 300 });
  const bb = new B.Battle({ rnd: new SeqRand([7]) });
  bb.add(u); bb.add(mkFoe());
  let began = false;
  for (let i = 0; i < 20 && !began; i++) began = bb.tick().began.length > 0;
  ok(began && u.i === 750, '速度 300 也能精确停在 W=750（不冲过头）');
}
{
  // 硬上限 1000
  const u = mkHero({ spd: 10 });
  const bb = new B.Battle({ rnd: new SeqRand([7]) });
  bb.add(u); bb.add(mkFoe());
  for (let i = 0; i < 400; i++) bb.tick();
  ok(u.i <= 1000, '行动条不超过上限：' + u.i);
}
{
  // buff 递减：窗口 = [速度+速增, 2*(速度+速增))
  const u = mkHero({ spd: 250, maxHp: 300 });
  const bb = new B.Battle({ rnd: new SeqRand([7]) });
  bb.add(u); bb.add(mkFoe());
  u.C = 10; u.D = 3;
  // 速度 250 时窗口是 [250,500)；走 4 帧到 1000 必经过该窗口多次
  const seen = [];
  u.c = 250;                       // 技能速度（= 速度时行动期与等待期同步推进）
  let frames = 0, started = false;
  while (frames < 40) {
    bb.tick(); frames++;
    if (u.j) started = true;
    if (started) { seen.push(u.i + ':' + u.D); if (u.i >= 1000) break; }
  }
  // 速度 250 → 窗口 [250,500)。一个回合内只会经过一次窗口（250→500→750→1000）
  ok(u.D < 3, 'buff 在行动条经过 [' + (u.Q + u.a) + ',' + 2 * (u.Q + u.a)
    + ') 窗口时递减：剩余 3 → ' + u.D + '，轨迹 ' + seen.join(' '));
  ok(u.i === 1000, '回合结束时行动条到 1000：' + u.i);
}
{
  // 死锁兜底：c 与 a 同时为 0 时不能卡死
  const u = mkHero({ spd: 250 });
  const bb = new B.Battle({ rnd: new SeqRand([7]) });
  bb.add(u); bb.add(mkFoe());
  let began = false;
  for (let i = 0; i < 30 && !began; i++) began = bb.tick().began.length > 0;
  ok(began && u.c > 0,
    '未设技能速度时 onTurnStart 自动兜底为 ' + (u.c) + '，行动条能继续推进（不会死锁）');
}
{
  // setSkillSpeed：按表达式设置行动期增量
  const b = mkBattle();
  const h = b.heroes[0];
  b.setSkillSpeed(h, '10+4*(slv-1)');
  ok(h.c === 10, '技能速度表达式 10+4*(slv-1) @slv=1 → ' + h.c + '（与怪物恒 10 一致）');
  b.setSkillSpeed(h, '20+4*(slv-1)');
  ok(h.c === 20, '技能速度表达式 20+4*(slv-1) → ' + h.c);
}
{
  // 排序
  const bb = mkBattle();
  bb.heroes[0].Q = 10; bb.heroes[1].Q = 99; bb.heroes[2].Q = 50;
  const ord = bb.sortOrder();
  const spds = ord.map(o => bb.units[o[0]].Q);
  let desc = true;
  for (let i = 1; i < spds.length; i++) if (spds[i] > spds[i - 1]) desc = false;
  ok(desc, '按速度【降序】排序（f.java:551）：' + spds.join(' ≥ '));
}

// ============================================================ 2
head('伤害结算');
{
  // 攻击优势 <= 0 → 固定 1 点
  const b = mkBattle(new SeqRand([5]));
  const h = b.heroes[0], f = b.foes[0];
  f.L = 999; h.S = 0;                      // 防御写在 L 上；运置 0 排除暴击干扰
  h.s = { name: '普通攻击', kindCode: 0, formula: 'atk' };
  const r = b.resolveHit(h, f, B.HITTYPE.NORMAL, 0);
  ok(r.adv < 0 && r.dmg === 1,
    '攻击优势 ' + r.adv + ' <= 0 时伤害固定 1（实际 ' + r.dmg + '）');
}
{
  // 正常路径：公式 atk，浮动 9~11
  const b = mkBattle(new SeqRand([0, 0, 0]));   // nextInt=0 → roll=11-0%3=... 见下
  const h = b.heroes[0], f = b.foes[0];
  h.K = 100; f.L = 0; h.S = 0;
  h.s = { name: '心波', kindCode: 0, formula: '(atk*2)/3' };
  const r = b.resolveHit(h, f, B.HITTYPE.NORMAL, 0);
  // adv = 100; 公式 (100*2)/3 = 66; roll∈[9,11]; dmg = floor(66*roll/10)
  ok(r.adv === 100, '攻击优势 = 攻方攻 - 目标防 = ' + r.adv);
  ok(r.slv === 4, '普通攻击 slv 强制为 4（bd.java:73），实际 ' + r.slv);
  ok(r.base === 66, '技能公式 (atk*2)/3 @atk=100 → ' + r.base);
  ok([59, 66, 72].indexOf(r.dmg) >= 0,
    '伤害 = floor(66×roll/10)，roll∈[9,11] → 59/66/72 之一，实际 ' + r.dmg + '（roll=' + r.roll + '）');
}
{
  // 至少 1 点
  const b = mkBattle(new SeqRand([0]));
  const h = b.heroes[0], f = b.foes[0];
  h.K = 2; f.L = 0; h.S = 0;
  h.s = { name: 'x', kindCode: 0, formula: 'atk/1000' };
  const r = b.resolveHit(h, f, B.HITTYPE.NORMAL, 0);
  ok(r.dmg >= 1, '伤害至少 1 点：' + r.dmg);
}
{
  // 变身伤害 ×3/5
  const b = mkBattle(new SeqRand([0, 0, 0]));
  const h = b.heroes[0], f = b.foes[0];
  h.K = 100; f.L = 0; h.S = 0; h.ac = true;
  h.s = { name: '变身技', kindCode: 7, formula: 'atk' };   // ★ kindCode 7 = 变身
  const r = b.resolveHit(h, f, B.HITTYPE.NORMAL, 0);
  ok(r.slv === 5, '变身技能 slv 强制为 5，实际 ' + r.slv);
  ok(r.dmg === Math.floor(Math.floor(100 * r.roll / 10) * 3 / 5),
    '变身中伤害 ×3/5：base→' + Math.floor(100 * r.roll / 10) + ' 最终 ' + r.dmg);
}
{
  // 格挡减半
  const b = mkBattle(new SeqRand([0, 0, 0]));
  const h = b.heroes[0], f = b.foes[0];
  h.K = 100; f.L = 0; h.S = 0;
  h.s = { name: 'x', kindCode: 0, formula: 'atk' };
  const r = b.resolveHit(h, f, B.HITTYPE.BLOCK, 0);
  ok(r.dmg === Math.max(1, Math.floor(Math.floor(100 * r.roll / 10) / 2)),
    '格挡伤害减半：' + Math.floor(100 * r.roll / 10) + ' → ' + r.dmg);
}
{
  // 闪避不掉血
  const b = mkBattle(new SeqRand([0]));
  const h = b.heroes[0], f = b.foes[0];
  const before = f.I;
  h.K = 100; f.L = 0;
  h.s = { name: 'x', kindCode: 0, formula: 'atk' };
  const r = b.resolveHit(h, f, B.HITTYPE.EVADE, 0);
  ok(f.I === before && r.applied === 0 && r.popup === B.POPUP.EVADE,
    '闪避不掉血（精 ' + before + '→' + f.I + '，实际掉血=' + r.applied
    + '，飘字=' + r.popup + '，若命中本会=' + r.wouldBe + '）');
}
{
  // 伤害不超过目标当前精
  const b = mkBattle(new SeqRand([0, 0, 0]));
  const h = b.heroes[0], f = b.foes[0];
  h.K = 99999; f.L = 0; f.I = 30; h.S = 0;
  h.s = { name: 'x', kindCode: 0, formula: 'atk' };
  const r = b.resolveHit(h, f, B.HITTYPE.NORMAL, 0);
  ok(r.dmg === 30 && f.I === 0, '伤害被目标当前精截断：dmg=' + r.dmg + ' 余精=' + f.I);
}

// ============================================================ 3
head('闪避与暴击概率');
{
    // 闪避率 = 目标运/100；运 >= 100 必定闪避
    // ★ 闪避判定在 attack() 里（bd.java:170），resolveHit 不判
    const b = mkBattle(new SeqRand([0]));
    const h = b.heroes[0], f = b.foes[0];
    f.S = 100; h.j = false; h.S = 0; h.K = 60; f.L = 0; f.I = 9999;
    h.s = { name: 'x', kindCode: 0, formula: 'atk' };
    const r = b.attack(h, h.s, [f])[0];
    ok(r.popup === B.POPUP.EVADE && f.I === 9999,
      '目标运=100 时必定闪避（飘字=' + r.popup + '，精未变=' + (f.I === 9999) + '）');
  }
  {
    // 目标运 = 0 → 必定不闪避
    const b = mkBattle(new SeqRand([0]));
    const h = b.heroes[0], f = b.foes[0];
    f.S = 0; h.j = false; h.S = 0; h.K = 60; f.L = 0; f.I = 9999;
    h.s = { name: 'x', kindCode: 0, formula: 'atk' };
    const r = b.attack(h, h.s, [f])[0];
    ok(r.popup === B.POPUP.NORMAL && f.I < 9999,
      '目标运=0 时必定不闪避（飘字=' + r.popup + '，精已扣=' + (f.I < 9999) + '）');
  }
  {
    // 暴击率 = 施法者运/200；dmg=1 时不触发
    const b = mkBattle(new SeqRand([0, 0, 0]));
    const h = b.heroes[0], f = b.foes[0];
    h.S = 200; f.S = 0; f.L = 0; f.I = 5000; h.K = 100; f.def = 0;
    h.s = { name: 'x', kindCode: 0, formula: 'atk' };
    const r = b.resolveHit(h, f, B.HITTYPE.NORMAL, 0);
    ok(r.crit === true, '施法者运=200 时必定暴击');
    ok(r.dmg === Math.floor(Math.floor(100 * r.roll / 10) * 2),
      '暴击伤害 ×2：' + Math.floor(100 * r.roll / 10) + ' → ' + r.dmg);
  }
{
  // 暴击分母 200：运=100 → 50%
  ok(B.Battle.prototype && new B.Battle({}).CRIT_DEN === 200, '暴击分母 = 200（= 施法者运/200）');
  ok(new B.Battle({}).EVADE_DEN === 100, '闪避分母 = 100（= 目标运/100）');
}

// ============================================================ 4
head('buff 与变身');
{
  const b = mkBattle();
  const h = b.heroes[0], f = b.foes[0];
  h.K = 80; h.L = 40;
  const lv = 3;
  const cAtk = b.applyBuff(h, f, 'atk', lv);
  const cDef = b.applyBuff(h, f, 'def', lv);
  const cSpd = b.applyBuff(h, f, 'spd', lv);
  ok(cAtk === Math.floor((10 + 5 * (lv - 1)) * 80 / 100),
    '武增 = (10+5*(lv-1))*施法者攻/100 = ' + cAtk);
  ok(cDef === Math.floor((10 + 5 * (lv - 1)) * 40 / 100),
    '防增 = (10+5*(lv-1))*施法者防/100 = ' + cDef);
  ok(cSpd === 1, '★ 速增固定为 +1（与技能等级无关），实际 ' + cSpd);
  ok(f.D === lv + 2 && f.F === lv + 2 && f.G === lv + 2,
    '持续时长 = 技能等级+2 = ' + (lv + 2));
}
{
  const b = mkBattle();
  const h = b.heroes[0];
  b.applyBuffAll(h, b.heroes, 2);
  ok(b.heroes.every(u => u.atkBuffOn() && u.defBuffOn() && u.spdBuffOn()),
    'addAll 对全部存活队友同时施加武/防/速增');
}
{
  const b = mkBattle();
  const h = b.heroes[0];
  h.ac = true; h.O = 30;
  const okPay = b.payMorph(h);
  ok(okPay && h.O === 20, '变身每回合扣气 10：30 → ' + h.O);
  h.O = 5;
  const ok2 = b.payMorph(h);
  ok(!ok2 && !h.ac, '气不足时取消变身');
}

// ============================================================ 5
head('结算与遇敌');
{
  const b = mkBattle();
  b.heroes[0].T = 50; b.heroes[1].T = 10;
  b.heroes[0].addHp(0);              // 击杀
  b.heroes[1].addHp(0);
  const r = b.settleWin(100, 50);
  const dead = r.members.filter(m => !m.alive);
  ok(dead.length === 2, '阵亡成员 ' + dead.length + ' 人');
  ok(dead.every(m => m.feelingBefore - m.feeling === 5),
    '★ 阵亡扣好感度 5 点：' + dead.map(m => m.feelingBefore + '→' + m.feeling).join(', '));
  ok(dead.every(m => m.hp === 1), '★ 阵亡后精强制置 1（不死亡）');
  ok(b.LEVEL_CAP === 45, '等级上限 ' + b.LEVEL_CAP);
}
{
  const b = mkBattle();
  // 等级缩放
  const cases = [[1, 1, 5, 1], [10, 1, 5, 5], [3, 1, 5, null], [3, 5, 9, 5], [3, 5, 9, 9]];
  let allOk = true, detail = [];
  for (const [plv, lo, hi] of cases) {
    let v;
    for (let t = 0; t < 60; t++) {
      v = b.rollEnemyLevel(plv, lo, hi);
      if (plv <= lo) { if (v !== lo) allOk = false; }
      else if (plv >= hi) { if (v !== hi) allOk = false; }
      else if (v < Math.max(lo, plv - 1) || v > Math.min(hi, plv + 1)) allOk = false;
    }
    detail.push(plv + '→' + v);
  }
  ok(allOk, '怪物等级 = 主角等级 ±1 且夹在 [lvmin,lvmax]：' + detail.join(' '));
}
{
  const b = mkBattle();
  ok(b.rollCount(1) >= 1 && b.rollCount(1) <= 3, '1 只时每种数量 ∈ [1,3]');
  ok(b.inRange(0, 0, 3, 4, 25), '圆判定：距离 5 ≤ 半径 25 → 命中');
  ok(!b.inRange(0, 0, 30, 40, 25), '圆判定：距离 50 > 半径 25 → 不命中');
}
{
  // 胜负判定
  const b = mkBattle();
  ok(b.checkOver() === 0, '开局未结束');
  b.foes.forEach(u => u.addHp(0));
  ok(b.checkOver() === 1, '全敌人死亡 → 胜');
  const b2 = mkBattle();
  b2.heroes.forEach(u => u.addHp(0));
  ok(b2.checkOver() === 2, '全玩家死亡 → 败');
}

// ============================================================ 6
head('常量溯源（不内嵌魔法数）');
{
  const C = XJ.C();
  ok(C.W === 750 && C.CRIT_DEN === 200 && C.EVADE_DEN === 100
     && C.MORPH_GAS === 10 && C.MORPH_DMG_NUM === 3 && C.MORPH_DMG_DEN === 5
     && C.LEVEL_CAP === 45,
    '战斗常量全部来自 XJ_LOGIC（源自 07-逻辑）：W=' + C.W
    + ' 暴击/闪避=' + C.CRIT_DEN + '/' + C.EVADE_DEN
    + ' 变身=' + C.MORPH_GAS + '气耗 ' + C.MORPH_DMG_NUM + '/' + C.MORPH_DMG_DEN + '伤害');
  const L = XJ.data.logic.combat;
  ok(L.turnGauge.constants.W.value === C.W, 'XJ_LOGIC.turnGauge.W == XJ.C().W');
  ok(L.damage.steps.length >= 9, '伤害步骤已结构化：' + L.damage.steps.length + ' 步');
  ok(L.buffs.rules.length === 4, 'buff 规则 ' + L.buffs.rules.length + ' 条');
  ok(L.morph.costPerTurn.value === 10, '变身气耗在 07-逻辑 中记录为 ' + L.morph.costPerTurn.value);
  ok(L.skillLevel.quirk.doNotFix === true, '★ 怪物等级恒 1 的怪癖已标记 doNotFix');
  // 怪物技能 slv 恒 1
  const b = mkBattle();
  const f = b.foes[0];
  ok(b.skillLevel(f, { kindCode: 1, formula: '(atk*(5+5*slv))/30' }) === 1,
    '★ 怪物技能 slv 恒为 1（g.java:139 + g.java:26 写死等级）');
  ok(b.skillLevel(b.heroes[0], { kindCode: 0, formula: 'atk' }) === 4, '普通攻击 slv=4');
  ok(b.skillLevel(b.heroes[0], { kindCode: 7, formula: 'atk' }) === 5, '变身 slv=5');
}

// ============================================================ 7
head('范围攻击');
{
  const b = mkBattle(new SeqRand([0]));
  const h = b.heroes[0];
  h.K = 60; h.j = false; h.S = 0;
  b.foes.forEach(f => { f.L = 0; f.S = 0; f.I = 1000; });
  h.s = { name: '万蛊蚀天', kindCode: 0, formula: 'atk' };
  const res = b.attack(h, h.s, b.foes);
  ok(res.length === 3, '范围攻击命中 3 个敌人，返回 ' + res.length + ' 条结算');
  ok(res.every(r => r.target), '每条结算都带目标名：' + res.map(r => r.target).join(','));
}
{
  // 施法者已行动过则不再判闪避（ax.java:535 条件 !j）
  const b = mkBattle(new SeqRand([0]));
  const h = b.heroes[0], f = b.foes[0];
  f.S = 100; h.j = true; h.K = 60; f.L = 0; h.S = 0;
  h.s = { name: 'x', kindCode: 0, formula: 'atk' };
  const res = b.attack(h, h.s, [f]);
  ok(res[0].popup !== B.POPUP.EVADE, '攻击者本回合已行动过时不判闪避（弹=' + res[0].popup + '）');
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);