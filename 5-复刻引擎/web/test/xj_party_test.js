/* xj_party_test.js —— 队伍/成长/物品/装备/合成/宝箱（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_party_test.js
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
for (const f of ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_world.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const PT = window.XJParty, W = window.XJWorld;

// ============================================================ 1 开局
head('开局建队');
{
  const w = new W();
  const h = PT.heroes(w).chonglou;
  ok(h && h.name === '重楼', '主角是重楼');
  const st = PT.statsOf(h);
  ok(st.maxHp === 246 && st.maxGas === 9 && st.maxMp === 24,
    'lv1 三围 246/9/24：' + st.maxHp + '/' + st.maxGas + '/' + st.maxMp);
  ok(st.atk === 176 && st.def === 31 && st.spd === 21 && st.luk === 10,
    'lv1 武176 防31 速21 运10（含木剑+50/布衣+5/头巾+4）：' + st.atk + '/' + st.def + '/' + st.spd + '/' + st.luk);
  ok(h.hp === 246 && h.mp === 24 && h.gas === 9, '满血满神满气出场');
  ok(w.gold === 300, '初始金钱 300');
  ok(w.items['止血草'] === 5 && w.items['鼠儿果'] === 5, '初始物品 止血草×5 鼠儿果×5');
  ok(JSON.stringify(w.members) === '["chonglou"]', '出战只有重楼');
  ok(h.normalSkills.join(',') === '心波,鬼降,魔尊真身', '初始技能：' + h.normalSkills.join(','));
  ok(h.arts['炎咒'] && h.arts['炎咒'].learned && h.arts['冰咒'].learned, '初始仙术炎咒/冰咒已学');
}

// ============================================================ 2 升级
head('升级（bj.g 语义）');
{
  const w = new W();
  const h = PT.heroes(w).chonglou;
  h.hp = 100;
  const r = PT.addExp(w, h, 20);
  ok(r.leveled && h.level === 2 && h.exp === 0, '20 经验升到 2 级且清零');
  ok(h.hp === PT.statsOf(h).maxHp, '升级全恢复：' + h.hp);
  ok(PT.statsOf(h).needExp === 50, 'lv2 所需 50');
  const r2 = PT.addExp(w, h, 49);
  ok(!r2.leveled && h.exp === 49, '49 经验不够升级');
  // 45 级封顶
  h.level = 45; h.exp = 0;
  const st = PT.statsOf(h);
  const r3 = PT.addExp(w, h, st.needExp + 100);
  ok(!r3.leveled && r3.capped && h.level === 45 && h.exp === st.needExp, '45 级封顶，经验卡上限');
  w.fees[500] = true;
  const r4 = PT.addExp(w, h, st.needExp);
  ok(r4.leveled && h.level === 46, 'fee 500 解锁上限后可继续升级');
}

// ============================================================ 3 技能
head('技能表与消耗');
{
  const ghost = PT.skillByName('鬼降');
  ok(ghost && ghost.kindCode === 0 && ghost.costGas === 7 && ghost.costMp === 0,
    '鬼降 普通/耗气7：' + JSON.stringify([ghost.kindCode, ghost.costGas, ghost.costMp]));
  const fire = PT.skillByName('炎咒');
  ok(fire && fire.kindCode === 3 && fire.costGas === 0 && fire.costMp === 12,
    '炎咒 火系/耗神12：' + JSON.stringify([fire.kindCode, fire.costGas, fire.costMp]));
  ok(PT.usesToSlv(0) === 1 && PT.usesToSlv(5) === 2 && PT.usesToSlv(15) === 3 && PT.usesToSlv(30) === 4,
    'uses→slv 折算 1/2/3/4');
  const w = new W();
  ok(PT.learnArt(w, '重楼', '雷咒') === true && PT.heroes(w).chonglou.arts['雷咒'].learned, 'startArtSkill 开通雷咒');
  ok(PT.learnSkill(w, '重楼', '魔尊真身') === true, 'startSkill 开通魔尊真身');
}

// ============================================================ 4 物品与装备
head('物品效果与装备');
{
  const w = new W();
  const h = PT.heroes(w).chonglou;
  h.hp = 100;
  const r = PT.useItem(w, '重楼', '止血草');
  ok(r.ok && h.hp === 246 && w.items['止血草'] === 4, '止血草 +400 到满：' + r.msg);
  h.mp = 0;
  PT.useItem(w, '重楼', '鼠儿果');
  ok(h.mp === 24, '鼠儿果 +神30 到满（24 封顶）');
  const bad = PT.useItem(w, '重楼', '木剑');
  ok(!bad.ok, '武器不能直接使用');
  // 装备限制
  w.addItem('太极伞', 1);
  const r2 = PT.equip(w, '重楼', '太极伞');
  ok(!r2.ok, '重楼不能装月瑶专用太极伞：' + r2.msg);
  w.addItem('铁剑', 1);
  const r3 = PT.equip(w, '重楼', '铁剑');
  ok(!r3.ok, '1 级装不上铁剑（要 5 级）：' + r3.msg);
  PT.levelUp(w, h, 4);
  const atk0 = PT.statsOf(h).atk;
  const r4 = PT.equip(w, '重楼', '铁剑');
  const atk1 = PT.statsOf(h).atk;
  ok(r4.ok && atk1 - atk0 === 42, '5 级换铁剑，武 +42（92-50）：' + atk0 + '→' + atk1);
  ok(w.items['木剑'] === 1, '换下的木剑回背包');
}

// ============================================================ 5 合成与宝箱
head('合成与宝箱');
{
  const w = new W();
  const r0 = PT.craft(w, 0);
  ok(!r0.ok, '没材料合成失败：' + r0.msg);
  w.addItem('妖树刺', 1); w.addItem('蓝幽羽', 2);
  const r = PT.craft(w, 0);
  ok(r.ok && w.items['竹蜻蜓'] === 1 && !w.items['妖树刺'] && !w.items['蓝幽羽'], '竹蜻蜓合成成功，材料扣光');
  const bp = PT.boxPool();
  ok(bp.total > 0 && bp.pool.length > 0, '宝箱权重表共 ' + bp.total + ' 份 ' + bp.pool.length + ' 种');
  const seen = {};
  for (let i = 0; i < 200; i++) {
    const g = PT.rollTreasure((a, b2) => a + Math.floor(Math.random() * (b2 - a + 1)));
    if (g) seen[g] = 1;
  }
  const rows = (window.XJ_CONFIG.items.rows || []).map(x => x['名称']);
  const bad = Object.keys(seen).filter(n => rows.indexOf(n) < 0);
  ok(bad.length === 0, '200 次宝箱roll 全部是合法物品：' + Object.keys(seen).slice(0, 6).join('、'));
}

// ============================================================ 6 队友
head('队友入队与好感');
{
  const w = new W();
  PT.partnerIn(w, 0);
  ok(w.members.indexOf('liyiru') >= 0, 'partner.in(0) 月瑶入队');
  ok(PT.activeHeroes(w).length === 2, '出战 2 人');
  PT.addFeeling(w, 0, 30);
  ok(PT.heroes(w).liyiru.feeling === 30 && w.party['月瑶'] === 30, '月瑶好感 30');
  PT.partnerOut(w, 0);
  ok(w.members.indexOf('liyiru') < 0, 'partner.out(0) 月瑶离队');
}

// ============================================================ 7 商城激活
head('商城激活');
{
  const w = new W();
  const m4 = PT.activateFee(w, 5);
  ok(w.fees[5] && w.gold === 300 + 10000, '无中生有：金钱 300→' + w.gold + '（' + m4 + '）');
  const lv0 = PT.heroes(w).chonglou.level;
  PT.activateFee(w, 4);
  ok(PT.heroes(w).chonglou.level === lv0 + 10 && w.fees[500], '连升十级：' + lv0 + '→' + PT.heroes(w).chonglou.level + '，上限解锁');
  PT.activateFee(w, 3);
  ok(PT.heroes(w).chonglou.arts['雷咒'].learned, '一步登仙：雷咒已开');
  const r = PT.craft(w, 0);
  ok(!r.ok, '没材料也合成不了（未激活点石成金）');
  PT.activateFee(w, 6);
  const r2 = PT.craft(w, 0);
  ok(r2.ok && w.items['竹蜻蜓'] === 1, '点石成金：无材料合成成功');
}

console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
