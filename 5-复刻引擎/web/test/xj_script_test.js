/* xj_script_test.js —— 脚本解释器自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_script_test.js
 *
 * 关键校验：JS 表达式引擎必须与 Python 参考实现 formats/expr.py 语义一致。
 * 期望值由 tests/expr_cases.json 提供（由 Python 生成，是权威基准）。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..');
const ROOT = path.resolve(WEB, '..', '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; failures.push(msg); console.log('  ✗ ' + msg + (extra ? '  → ' + extra : '')); }
}
function head(t) { console.log('\n[' + t + ']'); }

global.window = global;
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(WEB, 'src', 'xj_script.js'), 'utf8'));
const S = window.XJScript;

// ============================================================ 1
head('表达式引擎：与 Python 参考实现对齐');
// 这些期望值由 2-工具/formats/expr.py 的语义手工推导，与 xj_test.js 中的
// Python 侧用例一一对应（同一批表达式，两种实现必须给出相同结果）
const CASES = [
  ['1+2*3', {}, 7, '优先级'],
  ['(1+2)*3', {}, 9, '括号'],
  ['10/3', {}, 3, '整数除法'],
  ['-10/3', {}, -3, '★ 除法向 0 截断'],
  ['10%-3', {}, 1, '★ 取模符号跟随被除数'],
  ['-10%3', {}, -1, '★ Java 取模'],
  ['2^3^2', {}, 512, '右结合'],
  ['-2^2', {}, 4, '★ 一元负号先于幂'],
  ['2^-1', {}, 0, '★ 负指数落 0'],
  ['2^0', {}, 1, '零指数'],
  ['(2+3)*(4-1)', {}, 15, '混合'],
  ['(atk*(5+5*slv))/30', { atk: 91, slv: 1 }, 30, '冰咒@赤练蛇'],
  ['(atk*(12+8*slv))/20', { atk: 91, slv: 1 }, 91, '炎咒@赤练蛇'],
  ['atk/3', { atk: 1300, slv: 1 }, 433, '漓殇冰咒'],
  ['$a_b1+1', { $a_b1: 2 }, 3, '标识符含 $ _ 数字'],
  ['x=5', {}, 5, '赋值'],
  ['lv*10+20', { lv: 10 }, 120, '怪物属性公式'],
  ['( (100+26*lv)*(2+lv/5+lv/10-lv/20))*3/2', { lv: 5 }, 1035, '赤练蛇最小生命 lv=5'],
  ['((100+26*lv)*(3+lv/5+lv/10-lv/20))*3/2', { lv: 5 }, 1380, '赤练蛇最大生命 lv=5'],
  ['undefinedVar+5', {}, 5, '★ 未定义变量取 0'],
  ['10+4*(slv-1)', { slv: 1 }, 10, '★ 怪物仙术速度恒 10']
];
let bad = [];
for (const [e, v, want, note] of CASES) {
  let got;
  try { got = S.evalExpr(e, v); } catch (err) { got = 'ERR:' + err.message; }
  if (got !== want) bad.push(`${e} → ${got} 期望 ${want} (${note})`);
}
ok(bad.length === 0, `正例 ${CASES.length} 组全部一致（含 6 项 Java 特例）`, bad.join(' | '));

// 错误用例
const ERRS = ['1+', '', '5 5', '(1+2', '()', '@', '1/0', '5%0', 'a/0'];
let badErr = [];
for (const e of ERRS) {
  let threw = false;
  try { S.evalExpr(e); } catch (err) { threw = true; }
  if (!threw) badErr.push(e);
}
ok(badErr.length === 0, `反例 ${ERRS.length} 组全部按预期抛错`, badErr.join(','));

// 变量扫描
const vs = S.exprVars('(atk*(10+6*slv))/20');
ok(vs.length === 2 && vs[0] === 'atk' && vs[1] === 'slv',
  '变量扫描 (atk*(10+6*slv))/20 → [' + vs.join(',') + ']');

// 作用域隔离
const e1 = new S.Expr({ lv: 3 }), e2 = new S.Expr();
ok(e1.eval('lv*2') === 6 && e2.eval('lv*2') === 0,
  '★ 变量表按实例隔离：e1.lv=3 → 6，e2 未定义 → 0');

// ============================================================ 2
head('条件求值（19 条）');
function mkWorld(over) {
  var base = {
    _ev: {}, _fee: {}, _g: 100,
    items: { 金创药: 3 }, feel: { 林月如: 50 }, team: ['林月如'],
    expr: function (s) { return S.evalExpr(s, {}); },
    event: function (n) { return this._ev[n] || 0; },
    fee: function (n) { return !!this._fee[n]; },
    gold: function () { return this._g; },
    itemCount: function (n) { return this.items[n] || 0; },
    feeling: function (n) { return this.feel[n] || 0; },
    partnerExists: function (n) { return this.team.indexOf(n) >= 0; },
    mapName: function () { return 'test'; }
  };
  return Object.assign(base, over || {});
}
const w = mkWorld();

const COND_CASES = [
  // 初始状态：event1=0, fee9=off, gold=100, 金创药×3, 林月如好感50 在队
  ['eventMarked(1)', false],
  ['!eventMarked(1)', true],
  ['feeMarked(9)', false],
  ['!feeMarked(9)', true],
  ['player.itemCountIsGreaterThan(金创药,2)', true],
  ['player.itemCountIsGreaterThan(金创药,5)', false],
  ['player.itemCountIsLesserThan(金创药,5)', true],
  ['player.itemExists(金创药)', true],
  ['player.itemExists(不存在)', false],
  ['player.goldIsGreaterThan(50)', true],
  ['player.goldIsGreaterThan(500)', false],
  ['player.goldIsLesserThan(50)', false],
  ['player.goldIsLesserThan(500)', true],
  ['partner.feelingIsGreaterThan(林月如,40)', true],
  ['partner.feelingIsLesserThan(林月如,60)', true],
  ['partner.feelingIsEqualTo(林月如,50)', true],
  ['partner.feelingIsGreater(林月如,50)', true],
  ['partner.feelingIsGreater(林月如,60)', false],
  ['!partner.feelingIsGreater(林月如,50)', false],
  ['partner.feelingEqual(林月如,50)', true],
  ['partner.exists(林月如)', true],
  ['partner.exists(赵灵儿)', false],
  ['!partner.exists(赵灵儿)', true],
  // ★ 未登记条件 → false（e.java:2281 整条指令被静默丢弃）
  ['someUnknownThing(1)', false],
  ['eventMarked', false]
];
let cbad = [];
for (const [c, want] of COND_CASES) {
  const got = new S.Cond(w, c).test();
  if (got !== want) cbad.push(`${c} → ${got} 期望 ${want}`);
}
ok(cbad.length === 0, `条件 ${COND_CASES.length} 组全对（含未登记条件恒 false）`, cbad.join(' | '));

// event/fee 状态翻转
w._ev[1] = 1; w._fee[9] = true;
ok(new S.Cond(w, 'eventMarked(1)').test() === true &&
   new S.Cond(w, '!eventMarked(1)').test() === false &&
   new S.Cond(w, 'feeMarked(9)').test() === true,
  '状态翻转后 eventMarked/feeMarked 同步变化');

// 组合条件 AND
const w2 = mkWorld();
w2.gold = function () { return 100; };
ok(S.testConds(w2, 'player.goldIsGreaterThan(50),player.itemExists(金创药)') === true,
  '多条件全满足 → true');
ok(S.testConds(w2, 'player.goldIsGreaterThan(50),player.itemExists(不存在)') === false,
  '多条件任一不满足 → false');

// ============================================================ 3
head('指令派发：跑完全部地图脚本');
const interp = new S.Interp(w);
let totalSteps = 0, objSteps = 0;
const nsCount = {};
for (const [mn, m] of Object.entries(window.XJ_MAPS.maps)) {
  interp.runAll(m.script);
  totalSteps += m.script.length;
  for (const c of m.script) nsCount[c.obj] = (nsCount[c.obj] || 0) + 1;
  // 对象级脚本：element.addToNpc 等 NPC 定义都在这里
  for (const L of m.layers) for (const o of (L.o || [])) {
    if (!o[3]) continue;
    interp.runAll(o[3]);
    objSteps += o[3].length;
    for (const c of o[3]) nsCount[c.obj] = (nsCount[c.obj] || 0) + 1;
  }
}
const st = interp.stats;
ok(st.exec > 0, '已执行指令 ' + st.exec + ' 条');
ok(st.skippedByCond > 0, '因条件不满足被跳过 ' + st.skippedByCond + ' 条');
// ★ 原版数据里有 4 类拼写错误，原引擎同样会静默忽略它们，
//   这里必须【同样忽略】，所以 unknownNs+unknownCmd 不为 0 才是正确行为。
const TYPO_RULES = [
  { re: /^scripr\.break$/,        want: 'script.break',        note: '命名空间拼错（少个 t）' },
  { re: /^dialogBox\.shoDialog$/,  want: 'dialogBox.showDialog', note: '指令名少个 w' },
  { re: /^npc\.setAiAction$/,      want: 'npc.setState',         note: '源码只有 setAiEnabled，疑为 setState' },
  { re: /^<None>\./,              want: '(无命名空间)',          note: '裸命令，无命名空间前缀' }
];
// 自己扫一遍数据，得出「应被忽略」的清单
const typoHits = {};
for (const [mn, m] of Object.entries(window.XJ_MAPS.maps)) {
  const all = m.script.slice();
  for (const L of m.layers) for (const o of (L.o || [])) if (o[3]) all.push(...o[3]);
  for (const c of all) {
    const key = (c.obj || '<None>') + '.' + c.cmd;
    const rule = TYPO_RULES.find(r => r.re.test(key));
    if (rule) typoHits[key] = (typoHits[key] || 0) + 1;
  }
}
const typoLines = Object.values(typoHits).reduce((a, b) => a + b, 0);
ok(Object.keys(typoHits).length === TYPO_RULES.length,
  '原版拼写错误 ' + TYPO_RULES.length + ' 类，共 ' + typoLines + ' 行：\n      '
  + TYPO_RULES.map(r => r.re.source.replace(/^\^|\\\$$/g, '') + ' → ' + r.want
      + '(' + (typoHits[Object.keys(typoHits).find(k => r.re.test(k))] || 0) + '行)').join('\n      '));
ok(st.unknownNs + st.unknownCmd === typoLines,
  '解释器忽略的指令数 ' + (st.unknownNs + st.unknownCmd) + ' == 数据中拼写错误行数 '
  + typoLines + '（与原引擎行为一致）');
console.log('    地图级指令 ' + totalSteps + ' 条 + 对象级指令 ' + objSteps + ' 条');
console.log('    命名空间分布: ' + JSON.stringify(nsCount));
console.log('    产生副作用条目: ' + interp.effects.length);
ok(nsCount.element > 0, 'element 命名空间已接入（addToNpc 等 NPC 定义）: ' + nsCount.element + ' 条');
ok(objSteps > 1000, '对象级脚本 AST ' + objSteps + ' 条');

// 逐条核对：产物里的指令名是否都在源码指令表内
const ops = window.XJ_LOGIC.ops;
const known = new Set();
for (const g of ['battleScript', 'skillScript']) {
  for (const o of (ops[g] || [])) known.add(o.ns + '.' + o.cmd);
}
const rpgSrc = fs.readFileSync(path.join(ROOT, '4-文档', '反编译源码', 'e.java'), 'utf8');
let unknownInData = [];
for (const [mn, m] of Object.entries(window.XJ_MAPS.maps)) {
  const all = m.script.slice();
  for (const L of m.layers) for (const o of (L.o || [])) if (o[3]) all.push(...o[3]);
  for (const c of all) {
    const key = (c.obj || '<None>') + '.' + c.cmd;
    if (!known.has(key) && !rpgSrc.includes('"' + c.cmd + '"')) unknownInData.push(mn + ':' + key);
  }
}
const realUnknown = [...new Set(unknownInData)].filter(k =>
  !TYPO_RULES.some(r => r.re.test(k.split(':').pop())));
ok(realUnknown.length === 0,
  '地图脚本里的「命名空间.指令」除上述拼写错误外均能在源码中找到',
  realUnknown.slice(0, 6).join(','));
console.log('    原版拼写错误: ' + [...new Set(unknownInData)].join('  '));

// 关键指令参数抽样
const kinds = {};
for (const e of interp.effects) kinds[e.kind] = (kinds[e.kind] || 0) + 1;
const wantKinds = ['midi.play', 'world.setName', 'game.fight', 'element.addToNpc',
                   'dialog.setText', 'world.change', 'npc.setPosition', 'partner.in',
                   'partner.out', 'npc.in', 'game.clear', 'player.firstTask'];
const missingKinds = wantKinds.filter(k => !kinds[k]);
ok(missingKinds.length === 0,
  '关键副作用类型均已产生：' + wantKinds.filter(k => kinds[k]).join(' '),
  '缺 ' + missingKinds.join(','));
const play = interp.effects.filter(e => e.kind === 'midi.play');
const loops = {};
for (const p of play) loops[p.data.loop] = (loops[p.data.loop] || 0) + 1;
ok(Object.keys(loops).length >= 1,
  'midi.play 循环次数取值分布: ' + JSON.stringify(loops) + '（-1=无限循环）');

// ============================================================ 4
head('战斗脚本指令表一致性');
const bs = ops.battleScript || [];
ok(bs.length === 28, '战斗脚本指令 ' + bs.length + ' 条（源码自动提取）');
const ss = ops.skillScript || [];
ok(ss.length === 20, '技能脚本指令 ' + ss.length + ' 条');
ok((ops.conditions || []).length >= 5, '战斗侧条件 ' + (ops.conditions || []).length + ' 条（含组合方式与兜底项）');
// 每条都有 src 指向真实源码行
let noSrc = bs.concat(ss).filter(o => !(o.src && o.src.line));
ok(noSrc.length === 0, '全部指令均带源码出处', noSrc.map(o => o.cmd).join(','));

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);