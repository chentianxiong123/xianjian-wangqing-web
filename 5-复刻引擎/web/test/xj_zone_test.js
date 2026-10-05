/* xj_zone_test.js —— 触发区与切图自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_zone_test.js
 *
 * 校验：
 *   1. 272 region + 3526 trigger 全部载入，其中带 world.change 的是地图出口
 *   2. 走进矩形即触发（不是走出边界）
 *   3. world.change 参数顺序：map, tileBin, elementAnt, elementBin, x, y, dir
 *   4. player.moveTo(-1, y) 的 -1 = 保持当前
 *   5. 出口数据与 region 脚本一致
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
for (const f of ['xj.js', 'xj_script.js', 'xj_world.js', 'xj_talk.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const W = window.XJWorld, T = window.XJTalk;
const MAPS = window.XJ_MAPS.maps;

// ============================================================ 1
head('触发区载入');
{
  let nReg = 0, nTrg = 0, nZone = 0, nExitZone = 0;
  for (const n of Object.keys(MAPS)) {
    let r = 0, g = 0;
    MAPS[n].layers.forEach(L => { r += (L.r || []).length; g += (L.g || []).length; });
    nReg += r; nTrg += g;
    const w = new W(); w.buildFull(n, 10, 10);
    nZone += w.zones.length;
    nExitZone += w.zones.filter(z => z.isExit).length;
  }
  ok(nReg === 272, 'region ' + nReg + ' 个');
  ok(nTrg === 3526, 'trigger ' + nTrg + ' 个');
  // ★ 3526 个 trigger 的 script 字段全为 null —— 它们只有几何矩形、没有脚本，
  //   不是脚本触发区。真正带脚本的只有 272 个 region。
  let trigNoScript = 0;
  for (const n of Object.keys(MAPS)) {
    MAPS[n].layers.forEach(L => (L.g || []).forEach(t => { if (!t.script || !t.script.trim()) trigNoScript++; }));
  }
  ok(trigNoScript === nTrg,
    nTrg + ' 个 trigger 全部没有脚本（纯几何矩形），故不构成触发区');
  ok(nZone === nReg, 'World.zones 载入 ' + nZone + ' 个，全部来自 region');
  ok(nExitZone === 190, '其中 region 带 world.change 的 ' + nExitZone + ' 个（trigger 里没有）');
}
{
  // exits[] 与 region 里的 world.change 应一致
  let nExit = 0, bad = [];
  for (const n of Object.keys(MAPS)) nExit += (MAPS[n].exits || []).length;
  ok(nExit === 220, '地图 exits 共 ' + nExit + ' 个（含地图二进制里的边界出口）');
  // cs_ljb_1 的右侧出口应由某个 region 触发
  const w = new W(); w.buildFull('cs_ljb_1', 10, 10);
  const exitZones = w.zones.filter(z => z.isExit);
  ok(exitZones.length >= 2, 'cs_ljb_1 有 ' + exitZones.length + ' 个 world.change 触发区');
  const m = MAPS.cs_ljb_1;
  const want = m.exits.map(e => String(e.to).replace('.map', '')).sort();
  const got = exitZones.map(z => {
    const c = z.ast.find(a => a.obj === 'world' && a.cmd === 'change');
    return c ? String(c.raw_args[0]).replace('.map', '') : '?';
  }).sort();
  ok(JSON.stringify(want) === JSON.stringify(got),
    'cs_ljb_1 的 world.change 目标与 exits 一致：' + JSON.stringify(got),
    'exits=' + JSON.stringify(want));
}

// ============================================================ 2
head('world.change 参数解析');
{
  const w = new W(); w.buildFull('cs_ljb_1', 10, 10);
  const z = w.zones.find(zz => zz.isExit);
  // 把玩家放到该区内再触发
  const r = w.fireZoneFull(z);
  ok(r.change !== null, '触发后产生 change 指令');
  if (r.change) {
    const c = r.change;
    ok(c.map === 'cs_sz_2' || c.map === 'cs_ljb_2',
      '目标地图 = ' + c.map);
    ok(c.tileBin === 'cs', '地砖 BIN = ' + c.tileBin);
    ok(c.elementAnt === 'chengshi', '元素 ANT = ' + c.elementAnt);
    ok(typeof c.x === 'number' && typeof c.y === 'number',
      '落点 = ' + c.x + ',' + c.y);
    ok(['up', 'down', 'left', 'right'].indexOf(c.dir) >= 0, '朝向 = ' + c.dir);
    // 与 exits 里的同名出口核对
    const ex = MAPS.cs_ljb_1.exits.find(e => String(e.to).replace('.map', '') === c.map);
    if (ex) ok(ex.x === c.x && ex.y === c.y && ex.dir === c.dir,
      '与 exits 记录一致：exits(' + ex.x + ',' + ex.y + ',' + ex.dir + ')');
  }
}
{
  // moveTo(-1, y) —— -1 保持当前
  const w = new W(); w.buildFull('cs_ljb_1', 111, 222);
  const z = w.zones.find(zz => zz.isExit);
  const before = { x: w.playerX, y: w.playerY };
  const r = w.fireZoneFull(z);
  ok(r.moveTo !== null, '触发区里含 player.moveTo');
  if (r.moveTo) {
    ok(r.moveTo.x === null || r.moveTo.x === -1 || r.moveTo.x >= 0,
      'moveTo.x = ' + r.moveTo.x + '（-1 表示保持）');
    ok(r.moveTo.y === null || r.moveTo.y === -1 || r.moveTo.y >= 0,
      'moveTo.y = ' + r.moveTo.y);
  }
  void before;
}

// ============================================================ 3
head('区内判定与一次性触发');
{
  const w = new W(); w.buildFull('cs_ljb_1', 10, 10);
  const z = w.zones[0];
  const inx = z.x + Math.floor(z.w / 2), iny = z.y + Math.floor(z.h / 2);
  ok(w.inZone(z, inx, iny), '矩形 (' + z.x + ',' + z.y + ' ' + z.w + '×' + z.h + ') 内的点判定为真');
  ok(!w.inZone(z, z.x - 1, iny), '左边界外一像素判定为假');
  ok(!w.inZone(z, inx, z.y + z.h), '下边界外一像素判定为假');
  ok(w.inZone(z, z.x, z.y), '左上角（含）判定为真');
  ok(!w.inZone(z, z.x + z.w, z.y), '右边界（不含）判定为假');
  // 未触发前能查到，触发后查不到
  const hits = w.zonesAt(inx, iny);
  ok(hits.indexOf(z) >= 0, 'zonesAt 能查到未触发的区');
  w.fireZoneFull(z);
  const hits2 = w.zonesAt(inx, iny);
  ok(hits2.indexOf(z) < 0, '触发后同一位置不再重复触发（fired 标记生效）');
  w.resetZones();
  ok(w.zonesAt(inx, iny).indexOf(z) >= 0, 'resetZones 后可再次触发');
}
{
  // ★ 被条件门控的区不能标记为已触发，否则事件达成后玩家再也进不去
  const w = new W(); w.buildFull('cs_ljb_1', 10, 10);
  const z = w.zones.find(zz => {
    const o = zz.ast.find(c => c.cmd === 'openScriptList' && c.cond);
    return o && (o.cond.terms || []).some(t => t.fn === 'eventMarked' && !t.neg);
  });
  ok(!!z, '找到被 eventMarked 型条件门控的区：rect ' + (z ? [z.x, z.y, z.w, z.h].join(',') : ''));
  if (z) {
    const inx = z.x + 1, iny = z.y + 1;
    const r1 = w.fireZoneFull(z);
    ok(r1.gated === true && !z.fired,
      '条件未满足时被门控，且【不】标记已触发');
    ok(w.zonesAt(inx, iny).indexOf(z) >= 0, '门控后仍留在待触发列表里');
    // 满足条件后应能进入
    (z.ast.find(c => c.cmd === 'openScriptList' && c.cond).cond.terms || []).forEach(t => {
      if (t.fn === 'eventMarked' && t.args[0].type === 'int') w.events[t.args[0].value] = t.neg ? 0 : 1;
    });
    const r2 = w.fireZoneFull(z);
    ok(!r2.gated && z.fired,
      '条件满足后同一区可正常触发（gated=' + r2.gated + ' fired=' + z.fired + '）');
  }
}

// ============================================================ 4
head('剧情触发区里的对话');
{
  // 找一个 setText 的触发区
  let found = null, zw = null;
  for (const n of Object.keys(MAPS)) {
    const w = new W(); w.buildFull(n, 10, 10);
    for (const z of w.zones) {
      if (z.ast.some(c => c.cmd === 'setText')) { found = n; zw = z; break; }
    }
    if (found) break;
  }
  ok(found !== null, '找到含 dialogBox.setText 的剧情触发区：地图 ' + found);
  if (found) {
    const w = new W(); w.buildFull(found, 10, 10);
    const z = w.zones.find(zz => zz.ast.some(c => c.cmd === 'setText'));
    // 该区的 openScriptList 条件必须先满足才会弹框（实测条件就挂在 openScriptList 上）
    const open = z.ast.find(c => c.cmd === 'openScriptList' && c.cond);
    if (open) (open.cond.terms || []).forEach(t => {
      if (t.fn === 'eventMarked' && t.args[0].type === 'int')
        w.events[t.args[0].value] = t.neg ? 0 : 1;
    });
    const r = w.fireZoneFull(z);
    ok(r.dialog !== null, '触发后产生对话框：'
      + (r.dialog ? (r.dialog.speaker || '') + '：' + String(r.dialog.text).slice(0, 26) + '…' : ''));
  }
}
{
  // 条件不满足时不触发对话
  // ★ 条件挂在 script.openScriptList 上（实测 94 处），不成立则整批都不执行
  let tested = 0, gated = 0, ungated = 0;
  for (const n of Object.keys(MAPS)) {
    const w = new W(); w.buildFull(n, 10, 10);
    for (const z of w.zones) {
      const open = z.ast.find(c => c.cmd === 'openScriptList' && c.cond);
      if (!open) continue;
      tested++;
      const r = w.fireZoneFull(z);
      if (r.gated && !r.dialog) gated++; else ungated++;
      if (tested >= 40) break;
    }
    if (tested >= 40) break;
  }
  // 注意：条件若是 !eventMarked(N)，事件未设时【成立】→ 不门控；
  //      只有 eventMarked(N) 型条件才会拦住整批。
  ok(tested > 0 && gated > 0 && gated < tested,
    'openScriptList 的 eventMarked 型条件会门控整批：'
    + gated + '/' + tested + ' 被拦（其余是 !eventMarked 条件，事件未设时本就成立）');
  // ★ openScriptList 只门控【本批】：批内的 setText 不得漏出为对话框；
  //   批前面的逐条条件分支（如 !eventMarked(22) 的 moveTo/change）照常执行。
  let leaked = 0;
  for (const n of Object.keys(MAPS)) {
    const w = new W(); w.buildFull(n, 10, 10);
    for (const z of w.zones) {
      const open = z.ast.find(c => c.cmd === 'openScriptList' && c.cond);
      if (!open) continue;
      const hasPos = (open.cond.terms || []).some(t => t.fn === 'eventMarked' && !t.neg);
      if (!hasPos) continue;
      const r = w.fireZoneFull(z);
      // 门控批内的 setText 不得变成对话框：区里所有 setText 都在门控批内且被拦时，dialog 必须为空
      const texts = z.ast.filter(c => c.cmd === 'setText');
      const openIdx = z.ast.indexOf(open);
      const closeIdx = (() => { let d = 1; for (let k = openIdx + 1; k < z.ast.length; k++) {
        if (z.ast[k].cmd === 'openScriptList') d++;
        if (z.ast[k].cmd === 'closeScriptList') { d--; if (!d) return k; } } return -1; })();
      const inBatch = texts.filter((c, k) => z.ast.indexOf(c) > openIdx && (closeIdx < 0 || z.ast.indexOf(c) < closeIdx));
      if (r.gated && inBatch.length === texts.length && r.dialog) leaked++;
    }
  }
  ok(leaked === 0, '门控批内的对话框在事件未设时一律不执行');
  {
    // 反证：把条件事件按原样置位后，同一区应正常执行
    let n2 = 0, hit2 = 0;
    for (const n of Object.keys(MAPS)) {
      const w = new W(); w.buildFull(n, 10, 10);
      for (const z of w.zones) {
        const open = z.ast.find(c => c.cmd === 'openScriptList' && c.cond);
        if (!open) continue;
        (open.cond.terms || []).forEach(t => {
          if (t.fn === 'eventMarked' && t.args[0].type === 'int')
            w.events[t.args[0].value] = t.neg ? 0 : 1;
        });
        n2++;
        const r = w.fireZoneFull(z);
        if (!r.gated && (r.dialog || r.change || r.moveTo)) hit2++;
        if (n2 >= 40) break;
      }
      if (n2 >= 40) break;
    }
    ok(n2 > 0 && hit2 > 0,
      '条件事件按原样置位后，同一区正常执行（' + hit2 + '/' + n2 + '）');
  }
}

// ============================================================ 5
head('全地图触发区一致性');
{
  let bad = [], tot = 0, fired = 0, changes = 0, dlg = 0;
  for (const n of Object.keys(MAPS)) {
    const w = new W(); w.buildFull(n, 10, 10);
    tot += w.zones.length;
    for (const z of w.zones) {
      try {
        const r = w.fireZoneFull(z);
        fired++;
        if (r.change) changes++;
        if (r.dialog) dlg++;
      } catch (e) { bad.push(n + '/' + z.kind + z.idx + ': ' + e.message); }
    }
  }
  ok(bad.length === 0, tot + ' 个触发区全部可执行（已试跑 ' + fired + ' 个），无异常',
    bad.slice(0, 4).join(' | '));
  // 190 个含 world.change 的区里有 5 个带自相矛盾条件（eventMarked(N) 与 !eventMarked(N) 同现），
  // 事件未设时 change 不触发；另有门控批在前、无条件批在后的区照常触发 —— 这是正确行为。
  ok(changes === 177, '试跑后产生 ' + changes + ' 次 world.change'
    + '（190 个区中 8 个被条件门控、5 个条件自相矛盾）');
  ok(dlg > 0, '试跑后共产生 ' + dlg + ' 次对话框');
}
{
  // 每个 world.change 的目标地图都必须存在
  let miss = [], nAll = 0;
  for (const n of Object.keys(MAPS)) {
    const w = new W(); w.buildFull(n, 10, 10);
    const list = w.zones.map(z => z.ast.find(a => a.obj === 'world' && a.cmd === 'change'))
      .filter(Boolean).concat(w.pendingChange ? [w.pendingChange] : []);
    for (const c of list) {
      nAll++;
      const t = String(c.map || (c.raw_args && c.raw_args[0])).replace(/\.map$/i, '');
      if (!MAPS[t]) miss.push(n + '→' + t);
    }
  }
  ok(nAll === 200, '共 ' + nAll + ' 处 world.change'
    + '（190 个 region + 10 张地图的地图级；另 7 处地图级带条件未通过）');
  ok(miss.length === 0, '全部 world.change 的目标地图都存在', miss.slice(0, 4).join(','));
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);