/* xj_test.js —— 引擎核心自检（node 直接跑，无需浏览器）
 *   用法：node 5-复刻引擎/web/test/xj_test.js
 *
 * 重点校验：
 *   1. FLAG_TABLE 与 ag.java:241 的 switch 逐项一致（这是「角色渲染是碎的」的根因）
 *   2. 状态名 / 方向解析覆盖
 *   3. 地砖 RLE 解码后行宽 == 地图列数
 *   4. 地图元素 ANT 存在、元素对象 anim 落在状态数内
 *   5. 战斗常量确实来自 07-逻辑而非硬编码
 */
'use strict';
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..');  // 5-复刻引擎/web
const ROOT = path.resolve(WEB, '..', '..'); // 仓库根

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg + (extra ? '  → ' + extra : '')); }
}
function head(t) { console.log('\n[' + t + ']'); }

// ---- 载入数据与引擎 ----
global.window = global;
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
const ctxCalls = { n: 0, stroke: 0 };
const ctx = {
  save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
  drawImage() { ctxCalls.n++; }, strokeRect() { ctxCalls.stroke++; }
};
global.Image = function () {
  this.naturalWidth = 16; this.naturalHeight = 16; this.complete = true;
  Object.defineProperty(this, 'src', { set() {} });
};
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj.js'), 'utf8'));
const XJ = window.XJ;

// ============================================================ 1
head('FLAG_TABLE 反向核对 ag.java:241');
// 源码 switch：case n: n6 = transform;  0 直接 drawImage
const EXPECT = { 0: 0, 1: 2, 10: 2, 2: 1, 9: 1, 4: 5, 3: 3, 8: 3, 16: 6, 5: 4, 18: 4, 6: 7, 17: 7 };
const srcTxt = fs.readFileSync(path.join(ROOT, '4-文档', '反编译源码', 'ag.java'), 'utf8')
  .split('\n').slice(240, 302).join('\n');
// 确认这 13 个 case 都真的出现在源码里（防止 EXPECT 表本身写错）
const missingInSrc = Object.keys(EXPECT).filter(k =>
  !new RegExp('case\\s+' + k + '\\s*:').test(srcTxt));
ok(missingInSrc.length === 0,
  'EXPECT 的 13 个 case 全部出现在 ag.java 的 switch 中',
  missingInSrc.join(','));
let bad = [];
for (const k of Object.keys(EXPECT)) {
  const got = XJ.FLAG_TABLE[k] ? XJ.FLAG_TABLE[k].t : undefined;
  if (got !== EXPECT[k]) bad.push('flags=' + k + ' 源码=' + EXPECT[k] + ' 我的=' + got);
}
ok(bad.length === 0, 'FLAG_TABLE ' + Object.keys(EXPECT).length + ' 项 transform 全对', bad.join(' | '));
// swap 组：源码里用 setClip(n7,n8,n5,n4) 的分支
const swapWant = [4, 16, 5, 6, 17, 18];
const swapSet = swapWant.filter(k => XJ.FLAG_TABLE[k] && XJ.FLAG_TABLE[k].swap);
ok(swapSet.length === swapWant.length,
  'swap（绘制宽高对调）组 = ' + swapWant.join(','), '实际 ' + swapSet.join(','));
// 源码中 setClip 宽高互换的 case 组：4 / 16 / (5,18) / (6,17) 共 4 个分支，
// 对应 6 个 case 关键字（5,18 与 6,17 各自共用一个 setClip）
const swapCases = (srcTxt.match(/setClip\(n7, n8, n5, n4\)/g) || []).length;
ok(swapCases === 4,
  '源码 swap 分支 4 个（case 4 / 16 / (5,18) / (6,17)，覆盖 ' + swapWant.length + ' 个 case 关键字）',
  '实际 ' + swapCases);
// 非 swap 分支用 (n4,n5)，数量应为 13-6=7 个 case 关键字 / 4 个分支
const noswap = (srcTxt.match(/setClip\(n7, n8, n4, n5\)/g) || []).length;
ok(noswap === 4,
  '源码非 swap 分支 4 个（case 0 / (1,10) / (2,9) / (3,8)）', '实际 ' + noswap);

// ============================================================ 1.5
head('transform 语义（J2ME 常量，非 0-7 顺序）');
{
  // ★ MIDP 2.0 Sprite 文档值：0=NONE 1=MIRROR_ROT180 2=MIRROR 3=ROT180
  //   4=MIRROR_ROT270 5=ROT90 6=ROT270 7=MIRROR_ROT90。
  //   之前误按顺序理解，flags=1（站立右）被画成倒立。
  //   判定三重锁定：y.java 裁剪数学 / swap 自洽 / 数据实证（站右=站左的水平镜像）。
  const T = XJ.transformToCanvas;
  const cases = [
    [0, 0, false], [1, 180, true], [2, 0, true], [3, 180, false],
    [4, 270, true], [5, 90, false], [6, 270, false], [7, 90, true]
  ];
  let bad = [];
  for (const [t, rot, flip] of cases) {
    const r = T(t);
    if (r.rot !== rot || r.flipX !== flip) bad.push('t=' + t + ' 得' + JSON.stringify(r));
  }
  ok(bad.length === 0, 'transformToCanvas 8 种全对（先镜像后顺时针旋转）', bad.join(' | '));
  // flags=1（站立右各部件）必须走水平镜像
  ok(XJ.FLAG_TABLE[1].t === 2 && T(XJ.FLAG_TABLE[1].t).flipX && T(XJ.FLAG_TABLE[1].t).rot === 0,
    'flags=1 → MIRROR（水平镜像），不是 ROT180');
  // swap 组恰好是全部转置类变换（维度交换），非 swap 组都不交换
  const swapFlags = Object.keys(XJ.FLAG_TABLE).filter(k => XJ.FLAG_TABLE[k].swap).sort();
  ok(JSON.stringify(swapFlags) === JSON.stringify(['16', '17', '18', '4', '5', '6']),
    'swap 组 = 4,5,6,16,17,18（转置类），实际 ' + swapFlags.join(','));
}

// ============================================================ 2
head('ANT 状态与方向解析');
const ants = Object.keys(XJ.data.ant.ants);
const stateNames = new Set();
for (const a of Object.values(XJ.data.ant.ants)) for (const s of a.states) stateNames.add(s.n);
ok(ants.length === XJ.data.ant.count, 'ANT ' + ants.length + ' 个全部载入');
ok(stateNames.size > 500, '状态名 ' + stateNames.size + ' 种');
let okStand = 0; const badStand = [];
for (const a of ants) {
  for (const d of ['up', 'down', 'left', 'right']) {
    if (XJ.resolveState(a, '站立', d)) okStand++; else badStand.push(a + '/' + d);
  }
}
ok(badStand.length <= ants.length * 0.1,
  '「站立」+ 四方向解析成功 ' + okStand + '/' + ants.length * 4
  + '（' + (100 * okStand / (ants.length * 4)).toFixed(1) + '%）',
  badStand.slice(0, 6).join(','));
// 缺方向时能退回无后缀状态
let fb = 0, fbBad = [];
for (const a of ants) {
  if (XJ.resolveState(a, '站立', 'down') || XJ.resolveState(a, '站立')) fb++;
  else fbBad.push(a);
}
ok(fbBad.length === 0, '每个 ANT 至少能解析出一个站立态', fbBad.slice(0, 5).join(','));

// ============================================================ 3
head('动画时长与绘制');
const st = XJ.state('chonglou', '站立下');
let manual = 0; for (const q of st.q) manual += q[3];
ok(st && XJ.stateDuration(st) === manual,
  'chonglou/站立下 帧数=' + st.q.length + ' 时长=' + XJ.stateDuration(st) + 'ms（手算一致）');
ctxCalls.n = 0;
const r1 = XJ.drawState(ctx, 'chonglou', st, 100, 100, 0, true);
ok(r1.done === false && r1.total === manual, 'drawState 首帧 done=false total=' + r1.total);
ctxCalls.n = 0;
XJ.drawState(ctx, 'chonglou', st, 100, 100, manual + 5, true);
ok(ctxCalls.n > 0, '越过总时长后循环仍能绘制（drawImage ' + ctxCalls.n + ' 次）');
ctxCalls.n = 0;
const r3 = XJ.drawState(ctx, 'chonglou', st, 100, 100, manual + 5, false);
ok(r3.done === true, '非循环时越过总时长 done=true');
// 缺贴图走占位框而不是崩
ctxCalls.stroke = 0;
const missing = { clips: [[9999, 0, 0, 8, 8]], layers: [[[0, 0, 0, 1]]], states: [{ n: 'x', t: null, q: [[0, 0, 0, 100, null]] }], bin: 'no_such_bin' };
const saveAnts = XJ.data.ant.ants;
XJ.data.ant.ants.__t = missing;
XJ.drawClip(ctx, 'no_such_bin', missing.clips[0], 0, 0, 0);
ok(ctxCalls.stroke > 0, '贴图缺失时画占位框而非抛错');
delete XJ.data.ant.ants.__t;
XJ.data.ant.ants = saveAnts;

// ============================================================ 4
head('地图地砖 RLE');
let badR = 0, nlayer = 0, nrow = 0, ntiles = 0;
for (const m of Object.values(XJ.data.maps.maps)) {
  for (let li = 0; li < m.layers.length; li++) {
    const L = m.layers[li];
    if (!L.t) continue;
    nlayer++;
    for (let r = 0; r < L.t.length; r++) {
      nrow++;
      const row = XJ.tileRow(m, li, r);
      if (!row || row.length !== m.cols) { badR++; continue; }
      for (let c = 0; c < m.cols; c++) {
        if (XJ.tileAt(m, li, c, r) !== row[c]) badR++;
        ntiles++;
      }
    }
  }
}
ok(badR === 0, nlayer + ' 个有网格层 / ' + nrow + ' 行 / ' + ntiles + ' 格：'
  + 'tileAt 与 tileRow 完全一致且行宽=' + 'maps.cols');

// ============================================================ 5
head('地图元素引用');
let badAnt = 0, badAnim = 0, nobj = 0, nobin = 0;
for (const [mn, m] of Object.entries(XJ.data.maps.maps)) {
  if (m.elementAnt && !XJ.data.ant.ants[m.elementAnt]) { badAnt++; console.log('    缺 ANT ' + mn + ' → ' + m.elementAnt); }
  if (m.tileBin && !XJ.data.bin.bins[m.tileBin]) { nobin++; console.log('    缺 BIN ' + mn + ' → ' + m.tileBin); }
  const el = m.elementAnts.find(x => XJ.data.ant.ants[x]) || m.elementAnt;
  const ns = el && XJ.data.ant.ants[el] ? XJ.data.ant.ants[el].states.length : 0;
  for (const L of m.layers) {
    for (const o of L.o) { nobj++; if (ns && !(o[0] >= 0 && o[0] < ns)) badAnim++; }
  }
}
ok(badAnt === 0, '地图元素 ANT 全部存在');
ok(nobin === 0, '地砖 BIN 全部存在');
ok(badAnim === 0, '元素对象 ' + nobj + ' 个的 anim 索引全部落在状态数内');
let sc = 0, withCond = 0;
for (const m of Object.values(XJ.data.maps.maps)) {
  sc += m.script.length;
  for (const c of m.script) if (c.cond) withCond++;
}
ok(sc > 6000, '地图脚本指令 ' + sc + ' 条（其中带条件 ' + withCond + ' 条）');

// ============================================================ 6
head('战斗常量溯源');
const C = XJ.C();
const logicW = XJ.data.logic.combat.turnGauge.constants.W.value;
const fightRaw = XJ.data.config.fightCfg.scalars;
const wantW = 1000 * parseInt(fightRaw['速度条的实际技能长度'], 10)
  / parseInt(fightRaw['速度条的实际可用长度'], 10);
ok(C.W === logicW && logicW === wantW,
  'W=' + C.W + ' == 逻辑层 ' + logicW + ' == 1000×' + fightRaw['速度条的实际技能长度'] + '/'
  + fightRaw['速度条的实际可用长度'] + '=' + wantW);
ok(C.CRIT_DEN === 200 && C.EVADE_DEN === 100,
  '暴击分母=' + C.CRIT_DEN + ' 闪避分母=' + C.EVADE_DEN);
ok(C.MORPH_GAS === 10 && C.MORPH_DMG_NUM === 3 && C.MORPH_DMG_DEN === 5,
  '变身 气耗=' + C.MORPH_GAS + ' 伤害×' + C.MORPH_DMG_NUM + '/' + C.MORPH_DMG_DEN);
ok(C.HERO_SLOTS.length === 3 && C.FOE_SLOTS.length === 3,
  '战斗站位 3 英雄 + 3 敌兵', JSON.stringify(C.HERO_SLOTS));

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
process.exit(fail ? 1 : 0);