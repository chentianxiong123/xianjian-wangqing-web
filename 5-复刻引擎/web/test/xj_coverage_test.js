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

// ============================================================
console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
