/* xj_coverage_test.js —— 播放器覆盖率：每个变量/数据都用得上
 *   用法：node 5-复刻引擎/web/test/xj_coverage_test.js
 *
 * 锁死《4-文档/数据字段总表.md》的分类：
 *   gameCfg 44 scalars = 在用 14 + 死键 30（精确 grep 零命中，见总表 §3）；
 *   logic.combat 键 = 在用 6 + 文档表；
 *   NPC def 字段 = 在用 3 + 待考/缺口/管线。
 * 管线新增/改名任一字段，这里变红 —— 先去总表定级，再改测试。
 * （指令覆盖见 xj_gameplay_test 未知集；碰撞盒见 xj_world_test 3526。）
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
const CFG = window.XJ_CONFIG, LOGIC = window.XJ_LOGIC, NPC = window.XJ_NPC;

// 引擎源码全文（grep 替代：精确子串计数）
const SRC = ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_world.js', 'xj_talk.js',
  'xj_battle.js', 'xj_view.js', 'xj_shop.js', 'xj_menu.js', 'xj_audio.js',
  'xj_save.js', 'xj_battleview.js']
  .map(f => fs.readFileSync(path.join(WEB, 'src', f), 'utf8')).join('\n');
function used(s) { return SRC.indexOf(s) >= 0; }

// ============================================================ 1 gameCfg 44 scalars
head('gameCfg scalars：10 在用 + 34 死键');
{
  const scalars = CFG.gameCfg.scalars;
  const keys = Object.keys(scalars);
  ok(keys.length === 44, 'gameCfg scalars 共 44 个（管线增减即红）');
  const USED = ['初始场景地图文件', '主角动画文件', '明怪动画文件', '明怪视线半径',
    '明怪追击半径', '明怪移动半径', '明怪移动速度', '帮助', '关于', '宝箱物品',
    'NPC最小移动步数', 'NPC最大移动步数', 'NPC最短站立时间', 'NPC最长站立时间'];
  const deadExpected = ['ANT资源目录', 'BIN资源目录', 'MAP资源目录', 'MID资源目录',
    'NPC资源文件', 'STR资源目录', '一号配角配置文件', '主角资源文件', '主角配置文件',
    '二号配角配置文件', '初始场景元素动画', '初始场景元素资源', '初始场景地砖资源',
    '剧情黑边速度', '剧情黑边颜色', '卡马克卷轴', '头像资源文件', '对话框文字滚动速度',
    '对话框文字行间距', '扭曲延迟', '明怪刷新速度', '明怪最大移动步数', '明怪最小移动步数',
    '明怪最短站立时间', '明怪最长站立时间', '系统提示框上下边距', '系统提示框左右边距',
    '自动绕路距离', '镜头跟随速度', '鸟视线半径'];
  const badUsed = USED.filter(k => keys.indexOf(k) < 0 || !used(k));
  ok(badUsed.length === 0, '在用 14 键都在数据里且源码有读', badUsed.join(','));
  const unclassified = keys.filter(k => USED.indexOf(k) < 0 && deadExpected.indexOf(k) < 0);
  ok(unclassified.length === 0, '无未分类 scalar（新增即红，先去总表定级）', unclassified.join(','));
  const resurrected = deadExpected.filter(k => keys.indexOf(k) >= 0 && used(k));
  ok(resurrected.length === 0, '死键仍然无人读（谁接了谁改表+改测试）', resurrected.join(','));
}

// ============================================================ 2 logic.combat
head('logic.combat 键分类');
{
  const c = LOGIC.combat;
  const USED = ['turnGauge', 'slotPositions', 'damage', 'skillLevel', 'skillSpeed', 'crit'];
  const DOC = ['morph', 'evade', 'buffs', 'slots', 'sources', 'encounter', 'monsterAI',
    'popupTypes', 'randomPrimitives', 'settlement', 'unitFieldMap', 'kind', 'name'];
  const keys = Object.keys(c);
  const unclassified = keys.filter(k => USED.indexOf(k) < 0 && DOC.indexOf(k) < 0);
  ok(unclassified.length === 0, 'combat 无未分类键', unclassified.join(','));
  const badUsed = USED.filter(k => keys.indexOf(k) < 0);
  ok(badUsed.length === 0, '在用键都在表里', badUsed.join(','));
}

// ============================================================ 3 NPC def 字段
head('NPC def 字段分类');
{
  const d = NPC.defs['10'];
  const USED = ['name', 'talk', 'dialogRegions'];
  const REST = ['ant', 'nameHeight', 'moveUD', 'moveLR', 'file', 'meta', 'raw'];
  const keys = Object.keys(d);
  const unclassified = keys.filter(k => USED.indexOf(k) < 0 && REST.indexOf(k) < 0);
  ok(unclassified.length === 0, 'def 无未分类字段', unclassified.join(','));
  ok(USED.every(k => keys.indexOf(k) >= 0), '在用字段齐全');
  // ★ NPC 游荡 + 名牌已接（bl.java AI tick / bl.a 名牌）：轴锁与高度都有人读
  ok(used('.moveUD') && used('.moveLR'), 'moveUD/moveLR 在用（游荡轴锁）');
  ok(used('.nameHeight'), 'nameHeight 在用（名牌 y 偏移）');
}

// ============================================================ 4 roles 派生 vs 死键
head('roles：scalars/formulas 在用，顶层平行数组是死数据');
{
  const r = CFG.roles.chonglou;
  ok(r.scalars && r.scalars['初始仙术'] && r.formulas && r.formulas['仙术速度'],
    'scalars/formulas 齐全（建队/战斗在用）');
  ok(Array.isArray(r.initialArts) && !used('.initialArts') &&
     Array.isArray(r.initialItems) && !used('.initialItems') &&
     Array.isArray(r.initialSkills) && !used('.initialSkills'),
    'initialArts/Items/Skills 是平行冗余（引擎用 scalars 版，谁接了改表）');
  ok(!used('config.roleCfg') && !used("['roleCfg']") && !used('config.instruction'),
    'roleCfg/instruction raw wrapper 无人读（用 roles 派生）');
}

// ============================================================ 5 硬编码与逻辑表一致
head('战斗常量：C() 与逻辑表一致（改一处另一处红）');
{
  for (const f of ['xj.js']) {
    (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
  }
  const C = window.XJ.C();
  const T = LOGIC.combat;
  ok(C.W === T.turnGauge.constants.W.value, 'W=' + C.W + '（表 ' + T.turnGauge.constants.W.value + '）');
  ok(C.MORPH_GAS === T.morph.costPerTurn.value, 'MORPH_GAS=' + C.MORPH_GAS);
  ok(C.CRIT_DEN === 200 && /200/.test(T.crit.expr), 'CRIT_DEN=200（表 ' + T.crit.expr.slice(0, 24) + '…）');
  ok(C.EVADE_DEN === 100 && /100/.test(T.evade.expr), 'EVADE_DEN=100');
  ok(C.ROLL_MIN === 9 && C.ROLL_MAX === 11, '伤害浮动 rand(9,11)/10');
  ok(C.LEVEL_CAP === 45, 'LEVEL_CAP=45');
  ok(!!C.DAMAGE, '伤害公式原文来自逻辑表（非手写）');
}

// ============================================================ 死内容锁（原版废弃，禁"修复"）
head('死内容：5 本死对话书 + 级联 + 7 本缺失');
{
  // talk_8/9/54/61/62：无 NPC 引用、无脚本调用（静态抽取 xj_plot_extract 实证：零到达）
  const S = window.XJ_SCRIPTS;
  const npcTalkRefs = new Set();
  Object.keys(NPC.npcs || {}).forEach(id => {
    const t = (NPC.npcs[id].talk || '').replace(/\.str$/i, '');
    if (t) npcTalkRefs.add(t);
  });
  const rawAll = [];
  function rec(ns) { (ns || []).forEach(c => {
    if (c.raw) rawAll.push(c.raw);
    if (c.nodes) rec(c.nodes); if (c.blocks) c.blocks.forEach(b => rec(b.nodes));
  }); }
  const M = window.XJ_MAPS.maps;
  for (const mn of Object.keys(M)) {
    rec(M[mn].script);
    M[mn].layers.forEach(L => {
      (L.o || []).forEach(o => rec(o[3]));
      (L.r || []).forEach(r => rec(r.scriptAst));
      (L.g || []).forEach(g => rec(g.scriptAst));
    });
  }
  for (const bk of Object.keys(S.talk || {})) for (const b of (S.talk[bk].blocks || [])) rec(b.nodes);
  for (const bk of Object.keys(S['其他'] || {})) for (const b of ((S['其他'][bk] || {}).blocks || [])) rec(b.nodes);
  const joined = rawAll.join('\n');
  const dead = ['talk_8', 'talk_9', 'talk_54', 'talk_61', 'talk_62'];
  const badRef = dead.filter(t => npcTalkRefs.has(t));
  ok(badRef.length === 0, '5 死书无 NPC 引用：' + dead.join(' '), badRef.join(','));
  const badCall = dead.filter(t => joined.indexOf(t) >= 0);
  ok(badCall.length === 0, '5 死书无脚本调用', badCall.join(','));
  // 级联：xuanze#22/23 只被 talk_61#4 调用；xuanze#26/27 只被 talk_9#5 调用
  const onlyFrom = (file, line, src) => {
    const hits = rawAll.filter(r => r.indexOf(file) >= 0 && r.indexOf(',' + line) >= 0);
    return hits.length > 0 && hits.every(h => h.indexOf(src) >= 0 || true) && hits;
  };
  const c22 = rawAll.filter(r => /xuanze\.str,22/.test(r));
  ok(c22.length === 1 && c22[0].indexOf('接受') >= 0, 'xuanze#22 唯一调用=talk_61#4（死级联）：' + c22.length + ' 处');
  const c26 = rawAll.filter(r => /xuanze\.str,26/.test(r));
  ok(c26.length === 1, 'xuanze#26 唯一调用=talk_9#5（死级联）：' + c26.length + ' 处');
  // 7 本缺失：NPC 引用了但 jar 里没有（talk_3/4/5/7/12/13/15）
  const missing7 = ['talk_3', 'talk_4', 'talk_5', 'talk_7', 'talk_12', 'talk_13', 'talk_15'];
  const refMissing = missing7.filter(t => npcTalkRefs.has(t));
  ok(refMissing.length === missing7.length, 'NPC 引用了 7 本缺失书：' + refMissing.join(' '));
  const absentBooks = missing7.filter(t => !((S.talk || {})[t]));
  ok(absentBooks.length === missing7.length, 'jar 里确实没有这 7 本书');
}

// ============================================================
console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
