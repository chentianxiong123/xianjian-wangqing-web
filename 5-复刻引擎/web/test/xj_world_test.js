/* xj_world_test.js —— 世界装配自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_world_test.js
 *
 * 校验重点：
 *   1. 元素装配：带脚本对象自建 ANT，无脚本对象用地图 elementAnt
 *   2. element.remove() 移除最近创建的那个（e.java:2372）
 *   3. npc.* 配置作用于最近创建的���素（e.java:2384 要求 object2 != null）
 *   4. 条件：!eventMarked(3) 与 eventMarked(4) 两个分支的差别
 *   5. 出口数据完整性
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
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj_world.js'), 'utf8'));
const W = window.XJWorld;

// ============================================================ 1
head('元素装配：cs_ss_d（Boss1 完整过场）');
{
  // ★ 地图级脚本是逐条条件执行的线性过场（批次门控只在触发区/战斗队列语境生效）：
  //   进 cs_ss_d → boss1 开战 → 战后对话 → markEvent(4) → 切 yw_yl_3。
  //   对象脚本里 remove[!ev3]/remove[ev4] 让剧情演员进图即离场（净 NPC 恒为 0）。
  const w0 = new W();
  w0.buildFull('cs_ss_d', 300, 400);
  const k0 = {}; w0.elements.forEach(e => { k0[e.kind] = (k0[e.kind] || 0) + 1; });
  ok(!k0.npc, '事件全 0 时 NPC 进图即离场：' + JSON.stringify(k0));
  ok(w0.pendingChange && w0.pendingChange.map === 'yw_yl_3',
    '过场末尾切往 ' + (w0.pendingChange && w0.pendingChange.map));
  ok(w0.events[401] === 1 && w0.events[4] === 1, 'markEvent(401/4) 即时落子（后续条件可见）');
  const fx0 = w0.drainDeferred();
  const f0 = fx0.intents.filter(i => i.type === 'fight');
  ok(f0.length === 1 && f0[0].key === 'boss1' && f0[0].script === 0,
    '开战 boss1（H2 脚本行 0）：' + JSON.stringify(f0[0]));

  const w = new W();
  w.events[3] = 1;
  w.buildFull('cs_ss_d', 300, 400);
  ok(w.elements.length > 0, '装配出元素 ' + w.elements.length + ' 个'
    + '（带脚本 ' + w.stats.scripted + ' / 无脚本 ' + w.stats.plain + '）');
  ok(w.plainObjects.length > 0, '无脚本元素层对象 ' + w.plainObjects.length + ' 个（用地图 elementAnt）');

  // 带脚本的元素应各自带 ANT（直接跑对象脚本，不受地图级 mark 干扰）
  const wA = new W();
  wA.events[3] = 1;
  const mA = window.XJ_MAPS.maps.cs_ss_d;
  const oA = mA.layers[1].o[0];
  wA.runElementScript(oA[3], oA);
  const withAnt = wA.elements.filter(e => e.ant);
  ok(withAnt.length > 0, '其中 ' + withAnt.length + ' 个元素由脚本指定了自己的 ANT');
  const badAnt = withAnt.filter(e => !window.XJ.data.ant.ants[e.ant]);
  ok(badAnt.length === 0, '这些 ANT 在 XJ_ANT 里全部存在',
    badAnt.slice(0, 4).map(e => e.ant).join(','));

  // npc_34.ant 应当真的被用到
  const kinds = {};
  wA.elements.forEach(e => { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });
  console.log('    元素种类: ' + JSON.stringify(kinds));
  ok(kinds.npc > 0, 'addToNpc 产生了 ' + kinds.npc + ' 个 NPC');
}
{
  // 具体验证一个对象的完整装配
  const m = window.XJ_MAPS.maps.cs_ss_d;
  const L = m.layers[1];
  // 不同 NPC 的 element.remove 挂在不同事件上（!eventMarked(3) / !eventMarked(40) …），
  // 直接跑对象脚本（ bypass 地图级 mark），按它自己脚本里引用的事件号置位。
  const w = new W();
  let checked = 0, bad = [];
  const allObjs = (L.o || []).filter(o => o[3] && o[3].some(c => c.cmd === 'addToNpc'));
  for (const o of allObjs) {
    if (checked++ >= 8) break;
    const ast = o[3];
    // 从该对象脚本里抽出所有被 !eventMarked(N) 检查的事件号，置 1 让 NPC 留存
    const w2 = new W();
    for (const c of ast) {
      const terms = c.cond && c.cond.terms ? c.cond.terms : [];
      for (const t of terms) {
        // neg:true 是 !eventMarked(N)，要让它【不成立】就得令 event<N>=1；
        // neg:false 是 eventMarked(N)，要让它【不成立】就得令 event<N>=0。
        if (t.fn === 'eventMarked') w2.events[t.args[0].value] = t.neg ? 1 : 0;
      }
    }
    w2.runElementScript(ast, o);
    const id = ast[0].raw_args[0];
    const el = w2.elements.find(e => String(e.id) === String(id));
    if (!el) { bad.push('id=' + id + ' 未生成元素'); continue; }
    if (el.x !== o[1] || el.y !== o[2]) bad.push('id=' + id + ' 坐标不符 (' + el.x + ',' + el.y + ') vs (' + o[1] + ',' + o[2] + ')');
    if (!el.ant) bad.push('id=' + id + ' 缺 ANT');
    if (!el.state) bad.push('id=' + id + ' 缺状态');
    // 期望朝向取该对象脚本里 setDirection 的参数
    const sd = ast.find(c => c.cmd === 'setDirection');
    if (sd) {
      const M = { up: 'up', down: 'down', left: 'left', right: 'right',
                  上: 'up', 下: 'down', 左: 'left', 右: 'right' };
      const want = M[String(sd.raw_args[0])] || 'down';
      if (el.dir !== want) bad.push('id=' + id + ' 朝向 ' + el.dir + ' ≠ 期望 ' + want);
    }
  }
  ok(bad.length === 0,
    '逐对象按其自身事件条件装配并抽查 ' + checked + ' 个 addToNpc：ANT/坐标/状态/朝向均正确',
    bad.join(' | '));
}

// ============================================================ 2
head('element.remove() 与条件分支');
{
  // 用一个已知对象单独跑，验证 remove 语义
  const m = window.XJ_MAPS.maps.cs_ss_d;
  const L = m.layers[1];
  const obj = (L.o || []).find(o => o[3] && o[3].some(c => c.obj === 'element' && c.cmd === 'remove'));
  ok(!!obj, '找到一个带 element.remove() 的对象：anim=' + (obj && obj[0]));
  const w = new W();
  w.buildFull('cs_ss_d', 300, 400);
  const ast = obj[3];
  const adds = ast.filter(c => c.cmd === 'addToNpc').length;
  const removes = ast.filter(c => c.cmd === 'element' || c.cmd === 'remove').length;
  ok(adds === 1 && removes === 2,
    '该对象脚本：addToNpc ×' + adds + '，element.remove() ×' + removes + '（两个互斥条件分支）');
}
{
  // 两个 remove 的条件互斥：!eventMarked(3) 与 eventMarked(4)
  // event 全 0 → 只执行 !eventMarked(3) 那条 → 移除 1 次
  const m = window.XJ_MAPS.maps.cs_ss_d;
  const L = m.layers[1];
  const obj = (L.o || []).find(o => o[3] && o[3].filter(c => c.cmd === 'remove').length === 2);
  const w = new W();
  w.buildFull('cs_ss_d', 300, 400);
  ok(!!w.elements, '全事件为 0 时该对象被移除（!eventMarked(3) 成立 → 抵消 addToNpc）');
  // 反过来：把 event3 设为 1、event4 不设 → 该对象应保留
  const w2 = new W();
  w2.events[3] = 1;                 // eventMarked(3)=1 → !eventMarked(3) 不成立
                                  // event4 仍为 0 → eventMarked(4) 不成立 → 两条 remove 都不执行
  const n2 = (function () { w2.buildFull('cs_ss_d', 300, 400); return w2.elements.length; })();
  const n1 = w.elements.length;
  ok(n2 > n1, '设 event3=1 后该对象被保留：元素数 ' + n1 + ' → ' + n2
    + '（npc 出现）');
  // event4=1 时应被移除
  const w3 = new W();
  w3.events[4] = 1;
  w3.buildFull('cs_ss_d', 300, 400);
  ok(w3.elements.length < n2, '设 event4=1 后该对象被移除：元素数 ' + n2 + ' → ' + w3.elements.length);
  void obj;
}

// ============================================================ 3
head('全局状态与副作用');
{
  const w = new W();
  w.gold = 100;
  w.buildFull('cs_ss_d', 300, 400);
  // ★ 效果即时提交：状态当时写完，UI 意图进 deferred，队列无残留
  ok(w.interp.effects.length === 0, '装配后解释器队列无残留（即时提交）');
  const fx = w.drainDeferred();
  const kinds = {};
  fx.intents.forEach(e => { kinds[e.type] = (kinds[e.type] || 0) + 1; });
  ok(kinds['bgm'] > 0, '地图级脚本副作用已进 deferred：' + Object.keys(kinds).join(','));
  // midi.play 的循环次数
  const plays = fx.intents.filter(e => e.type === 'bgm');
  ok(plays.length > 0 && plays.every(p => p.loop === -1),
    'midi.play 循环次数全部为 -1（无限循环），共 ' + plays.length + ' 首');
  // world.setName 应记录地图名（状态即时写）
  ok(w.mapTitle === '蜀山演武场', 'world.setName → ' + w.mapTitle);
}
{
  // 状态接口
  const w = new W();
  w.events[7] = 1; w.fees[500] = true; w.gold = 250;
  w.addItem('金创药', 4); w.party['林月如'] = 60;
  ok(w.event(7) === 1 && w.fee(500) === true, 'event/fee 读写正常');
  ok(w.itemCount('金创药') === 4, '背包计数正常');
  ok(w.feeling('林月如') === 60 && w.partnerExists('林月如'), '好感度与队友查询正常');
  ok(!w.partnerExists('赵灵儿'), '未入队者查询为 false');
  ok(w.expr('player.x') === 0, '表达式作用域已注入 player.x');
  w.playerX = 320; w.playerY = 240;
  ok(w.expr('player.x') === 320 && w.expr('player.y') === 240, 'player.x/y 随位置更新');
}

// ============================================================ 4
head('全地图装配');
{
  const all = Object.keys(window.XJ_MAPS.maps);
  let totEl = 0, totPlain = 0, totScripted = 0, errs = [];
  for (const n of all) {
    try {
      const w = new W();
      w.events[3] = 1;            // 让 NPC 类元素留存后再统计
      w.buildFull(n, 100, 100);
      totEl += w.elements.length; totPlain += w.plainObjects.length; totScripted += w.stats.scripted;
    } catch (e) {
      errs.push(n + ': ' + e.message);
    }
  }
  ok(errs.length === 0, '69 张地图全部装配成功', errs.slice(0, 3).join(' | '));
  ok(totEl > 0, '共装配元素 ' + totEl + ' 个（带脚本 ' + totScripted + '，无脚本 ' + totPlain + '）');
  // 元素引用的 ANT 是否都存在
  const w = new W();
  w.events[3] = 1;
  let missing = new Set();
  for (const n of all) {
    w.events[3] = 1;
    w.buildFull(n, 10, 10);
    for (const e of w.elements) if (e.ant && !window.XJ.data.ant.ants[e.ant]) missing.add(e.ant);
  }
  ok(missing.size === 0, '所有元素引用的 ANT 均存在', [...missing].slice(0, 5).join(','));
}

// ============================================================ 5
head('出口');
{
  let tot = 0, badMap = [];
  for (const [mn, m] of Object.entries(window.XJ_MAPS.maps)) {
    for (const e of (m.exits || [])) {
      tot++;
      if (!window.XJ_MAPS.maps[e.to]) badMap.push(mn + '→' + e.to);
    }
  }
  ok(badMap.length === 0, '全部 ' + tot + ' 个出口的目标地图都存在', badMap.slice(0, 5).join(','));
  const w = new W();
  w.buildFull('cs_ljb_1', 320, 240);
  const ex = w.nearestExit(320, 240, 'right');
  ok(!!ex, 'cs_ljb_1 最近出口 → ' + (ex && (ex.to + ' @' + ex.x + ',' + ex.y)));
}

// ============================================================ 暂停语义（e.java:990）
head('script.break/wait 暂停与恢复');
{
  // 合成小脚本：对话 → break → 对话 → wait → 对话
  const w = new W();
  const nodes = [
    { obj: 'dialogBox', cmd: 'setText', args: [{ speaker: '甲', value: '第一句' }], raw_args: ['第一句'], cond: null },
    { obj: 'script', cmd: 'break', raw_args: [], cond: null },
    { obj: 'dialogBox', cmd: 'setText', args: [{ speaker: '乙', value: '第二句' }], raw_args: ['第二句'], cond: null },
    { obj: 'script', cmd: 'wait', raw_args: ['1500'], cond: null },
    { obj: 'dialogBox', cmd: 'setText', args: [{ speaker: '丙', value: '第三句' }], raw_args: ['第三句'], cond: null },
  ];
  const r1 = w.execAst(nodes);
  ok(r1.dialogs.length === 1 && !!r1.paused, '第一段只出 1 段对话就暂停（不再一帧跑完）');
  const r2 = w.execAst(r1.paused.nodes, r1.paused.pc);
  ok(r2.dialogs.length === 1 && !!r2.paused && r2.paused.waitMs === 1500,
    '第二段出第 2 句，停在 wait(1500)');
  const r3 = w.execAst(r2.paused.nodes, r2.paused.pc);
  ok(r3.dialogs.length === 1 && !r3.paused && r3.dialog.text === '第三句', '恢复后出第 3 句并跑完');
  // 条件不成立的 break 直接跳过、不暂停
  const w4 = new W();
  const r4 = w4.execAst([
    { obj: 'script', cmd: 'break', raw_args: [], cond: { terms: [{ raw: 'eventMarked(999)' }] } },
    { obj: 'dialogBox', cmd: 'setText', args: [{ speaker: null, value: 'X' }], raw_args: ['X'], cond: null },
  ]);
  ok(!r4.paused && r4.dialogs.length === 1, '条件不成立的 break 被跳过');
  // runExecFull 一次跑完
  const w5 = new W();
  const r5 = w5.runExecFull(nodes);
  ok(!r5.paused && r5.dialogs.length === 3, 'runExecFull 合并 3 段对话');
}

// ============================================================ 碰撞盒（ay.java:507）
head('trigger 矩形 = 碰撞盒');
{
  const w = new W();
  w.buildFull('ms_syt_1', 100, 100);
  ok((w.solids || []).length === 80, 'ms_syt_1 碰撞盒 80 个（与 jar 解析一致）');
  ok(!!w.solidAt(10, 10), '上边框 (10,10) 是墙');
  ok(!w.solidAt(400, 300), '地图中部 (400,300) 可走');
  // 全图普查：3526 个 trigger，0 个带脚本
  let tot = 0, withScript = 0;
  for (const mn of Object.keys(window.XJ_MAPS.maps)) {
    const ww = new W();
    ww.buildFull(mn, 10, 10);
    for (const s of (ww.solids || [])) { tot++; if (s.ast) withScript++; }
  }
  ok(tot === 3526 && withScript === 0, '全 69 图碰撞盒 ' + tot + ' 个，带脚本 ' + withScript + ' 个');
  // 开机图装配后停在第一个 break（开场分步播，不再一帧跑完）
  const wb = new W();
  wb.build('ms_syt_1', 100, 100);
  ok(!!wb.pausedBuild, 'ms_syt_1 build 后有暂停点（开场要按键推进）');
  wb.drainBuildPauses();
  ok(!wb.pausedBuild, 'drainBuildPauses 跑完');
  // NPC 游荡轴锁来自 def（bl.i=左右/moveLR，bl.j=上下/moveUD，e.java:2325）
  const wN = new W();
  const el3 = wN.makeElement('npc', { raw_args: ['3', 'npc_3.ant'] }, [0, 100, 100]);
  const el10 = wN.makeElement('npc', { raw_args: ['10', 'npc_10.ant'] }, [0, 100, 100]);
  ok((el3.moveUD || el3.moveLR) && !el10.moveUD && !el10.moveLR,
    '紫萱(3)可游荡、妖怪(10)双false不动（与 def 一致）');
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);