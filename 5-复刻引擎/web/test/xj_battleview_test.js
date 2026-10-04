/* xj_battleview_test.js —— 战斗画面自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_battleview_test.js
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
global.Image = function () {
  this.naturalWidth = 16; this.naturalHeight = 16; this.complete = true;
  Object.defineProperty(this, 'src', { set() {} });
  this.addEventListener = function () {};
};
for (const f of ['xj.js', 'xj_script.js', 'xj_world.js', 'xj_battle.js', 'xj_battleview.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const V = window.XJBattleView, B = window.XJBattle, XJ = window.XJ;

function SeqRand(seed) { this.s = seed >>> 0; }
SeqRand.prototype.nextInt = function () { this.s = (this.s * 1103515245 + 12345) & 0x7fffffff; return this.s - 0x40000000; };

// 假 canvas
function fakeCanvas(w, h) {
  const calls = { drawImage: 0, fillRect: 0, strokeRect: 0, fillText: 0, drawState: 0 };
  const ctx = {
    calls: calls,
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
    setLineDash() {},
    setTransform() {},
    clearRect() {},
    fillRect() { calls.fillRect++; }, strokeRect() { calls.strokeRect++; },
    fillText() { calls.fillText++; },
    beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    drawImage() { calls.drawImage++; this.calls.drawImage++; },
    clip() {}, setClip() {},
    measureText(s) { return { width: String(s).length * 12 }; },
    getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
    globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
    font: '', textBaseline: '', textAlign: '',
    imageSmoothingEnabled: false
  };
  return { width: w, height: h, getContext: () => ctx, ctx: ctx };
}

// 模拟 XJ.drawState 计数（跳过实际贴图）
const origDrawState = XJ.drawState;
let drawStateCalls = 0;
XJ.drawState = function () { drawStateCalls++; return { done: false }; };

function mkBattle(key, plv) {
  const enc = B.encounter(key, plv, new SeqRand(7), { event: () => 0 });
  const b = new B.Battle({ rnd: new SeqRand(9) });
  // 3 个英雄
  const HERO = [
    { name: '李逍遥', hp: 300, maxHp: 300, atk: 60, def: 25, spd: 35, luk: 40, level: plv, gas: 50, maxGas: 100 },
    { name: '林月如', hp: 260, maxHp: 260, atk: 55, def: 22, spd: 30, luk: 35, level: plv, gas: 40, maxGas: 100 },
    { name: '赵灵儿', hp: 240, maxHp: 240, atk: 50, def: 20, spd: 28, luk: 45, level: plv, gas: 60, maxGas: 100 }
  ];
  HERO.forEach((h, i) => {
    const u = new B.Unit(Object.assign({ side: 'hero', slot: i }, h));
    // 玩家技能：slv 1 的普通攻击
    u.skills = { normal: [{ name: '攻击', formula: 'atk', kindCode: 0 }], spell: [] };
    b.add(u);
  });
  enc.monsters.forEach((m, i) => {
    m.side = 'foe'; m.slot = i;
    m.skills = m.skills || { normal: [{ name: '攻击', formula: 'atk', kindCode: 0 }], spell: [] };
    b.add(m);
  });
  b.bgAnt = enc.bgAnt; b.bgm = enc.bgm; b.expTotal = enc.exp; b.goldTotal = enc.gold;
  return b;
}

// ============================================================ 1
head('单位→ANT 映射');
{
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, b.bgAnt);
  const heroAnts = b.heroes.map(u => u.ant);
  ok(JSON.stringify(heroAnts) === '["fight_cl","fight_lyr","fight_zx"]',
    '英雄槽位 0/1/2 → fight_cl/fight_lyr/fight_zx：' + heroAnts.join(' '));
  const foeAnts = b.foes.map(u => u.ant + '@' + u.px + ',' + u.py);
  ok(b.foes.every(u => !!XJ.data.ant.ants[u.ant]),
    '怪物 ANT 全部存在：' + foeAnts.join(' '));
  ok(b.foes.every(u => u.px > 0 && u.py > 0), '怪物站位已设置（敌兵槽位）');
  const HS = [[182, 249], [150, 272], [210, 219]];
  ok(b.heroes.every((u, i) => u.px === HS[i][0] && u.py === HS[i][1]),
    '英雄站位 == 配置槽位：' + b.heroes.map(u => u.px + ',' + u.py).join(' '));
}
{
  // 全部 10 个怪物 ID 的 ANT 都存在
  let bad = [];
  for (const id of [1, 2, 3, 4, 5, 9, 10, 11, 12, 13]) {
    if (!XJ.data.ant.ants['fight_' + id]) bad.push('fight_' + id);
  }
  ok(bad.length === 0, '战斗用怪物 ANT fight_<id> 10 个全部存在', bad.join(','));
  // 战斗背景 ANT
  const bgs = ['fight_conglin', 'fight_mishi', 'fight_ssm'];
  const missingBg = bgs.filter(a => !XJ.data.ant.ants[a]);
  ok(missingBg.length === 0, '战斗背景 ANT 3 个全部存在', missingBg.join(','));
}

// ============================================================ 2
head('战斗状态机映射');
{
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, b.bgAnt);
  const u = b.heroes[0];
  u.ac = false; u.t = 0;
  ok(v.unitStateName(u) === '站立', 't=0 → 站立');
  u.t = 2; ok(v.unitStateName(u) === '攻击', 't=2 → 攻击');
  u.t = 8; ok(v.unitStateName(u) === '仙术释放', 't=8 → 仙术释放');
  u.t = 7; ok(v.unitStateName(u) === '死亡', 't=7 → 死亡');
  u.t = 0; u.ac = true; ok(v.unitStateName(u) === '变身站立', '变身 → 变身站立');
  u.t = 2; ok(v.unitStateName(u) === '变身攻击', '变身+t=2 → 变身攻击');
  u.ac = false; u.t = 0;
  u.I = 10; u.J = 1000;
  ok(v.unitStateName(u) === '重伤' || u.isWounded(), '精<20% → 重伤');
}

// ============================================================ 3
head('行动条循环驱动战斗');
{
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('十里坡东', 30);
  v.setBattle(b, b.bgAnt);
  // 全员开打：把技能速度拉满，让 200 帧内必有人动
  b.units.forEach(u => { u.Q = 200; u.c = 200; });
  let menus = 0, monsterActs = 0;
  const origMenu = v.openMenu.bind(v), origM = v.monsterAct.bind(v);
  v.openMenu = function (u) { menus++; return origMenu(u); };
  v.monsterAct = function (u) { monsterActs++; return origM(u); };
  let frames = 0, maxPopups = 0;
  for (frames = 0; frames < 400 && !b.over; frames++) {
    v.frame(16);
    v.render(16);
    maxPopups = Math.max(maxPopups, v.popups.length + b.popups.length);
  }
  ok(menus > 0, '英雄轮到时开了 ' + menus + ' 次指令菜单');
  ok(monsterActs > 0, '怪物执行了 ' + monsterActs + ' 次 AI');
  ok(b.checkOver() !== 0 || frames >= 400, '战斗有胜负或打满 400 帧（phase=' + b.phase + '）');
  console.log('    400 帧后：英雄精 ' + b.heroes.map(u => u.I + '/' + u.J).join(' ')
    + '  敌人精 ' + b.foes.map(u => u.I + '/' + u.J).join(' ')
    + '  日志 ' + b.log.length + ' 行');
}
{
  // 玩家指令完整闭环：开菜单 → 选攻击 → 选目标 → 执行 → 伤害落地
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, b.bgAnt);
  const h = b.heroes[0], f = b.foes[0];
  const hp0 = f.I;
  b.heroes.forEach(u => { u.Q = 500; u.c = 500; });
  b.foes.forEach(u => { u.Q = 1; });
  // 跑到英雄菜单出现
  let t = 0;
  while (!v.menu && t++ < 100) v.frame(16);
  ok(!!v.menu, '英雄菜单出现（' + t + ' 帧）');
  if (v.menu) {
    const idx = v.menu.options.indexOf('攻击');
    v.menu.sel = idx;
    v.key('ok');
    ok(!!v.target, '选「攻击」后进入目标选择');
    v.key('ok');
    ok(!v.target && !v.menu, '选目标后菜单关闭');
    // 跑技能执行
    let n = 0;
    while (f.I === hp0 && n++ < 500) v.frame(16);
    ok(f.I < hp0, '伤害落地：敌人精 ' + hp0 + ' → ' + f.I);
  }
}
{
  // 速度条能反映行动条
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, b.bgAnt);
  b.units[0].i = 750;
  v.render(16);
  ok(cv.ctx.calls.fillRect > 0, '速度条/血条/HUD 有绘制调用（fillRect ' + cv.ctx.calls.fillRect + ' 次）');
}

// ============================================================ 4
head('战斗背景');
{
  // fight_mishi 的「战斗背景」状态布局 + fight_beijing 的图片
  const a = XJ.data.ant.ants.fight_mishi;
  const st = a.states.find(s2 => s2.n === '战斗背景');
  ok(!!st, 'fight_mishi 有「战斗背景」状态');
  const ents = XJ.data.bin.bins.fight_beijing;
  ok(ents.length === 3, 'fight_beijing 有 3 张背景图');
  const rec = (a.layers[st.q[0][0]] || [])[0];
  const c = rec ? a.clips[rec[0]] : null;
  ok(!!c && c[0] >= 0 && c[0] < ents.length,
    '背景帧的 clip.sheet=' + (c && c[0]) + ' 落在 fight_beijing(3) 内 → ' + (c && ents[c[0]].e));
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, 'fight_mishi');
  v.render(16);
  ok(cv.ctx.calls.drawImage > 10, '背景 + 单位有绘制调用（drawImage ' + cv.ctx.calls.drawImage + ' 次）');
}

// ============================================================ 5
head('战斗结束');
{
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, b.bgAnt);
  let result = null;
  v.onEnd = function (r) { result = r; };
  b.foes.forEach(u => u.addHp(0));
  b.tick();
  v.frame(16);
  ok(result === 'win', '全敌人死亡 → win 回调');
  ok(v.msg === '战斗胜利！', '胜利提示：' + v.msg);
}
{
  const cv = fakeCanvas(480, 272);
  const v = new V(cv, {});
  const b = mkBattle('boss1', 60);
  v.setBattle(b, b.bgAnt);
  let result = null;
  v.onEnd = function (r) { result = r; };
  b.heroes.forEach(u => u.addHp(0));
  b.tick();
  v.frame(16);
  ok(result === 'lose', '全玩家死亡 → lose 回调');
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);