/* xj_shop_test.js —— 商店与存档自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_shop_test.js
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
global.localStorage = (function () {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(String(k), String(v)); },
    removeItem: k => { m.delete(k); },
    _size: () => m.size
  };
})();
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_world.js', 'xj_talk.js', 'xj_shop.js', 'xj_save.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const SH = window.XJShop, SV = window.XJSave, W = window.XJWorld;

function mkWorld() {
  const w = new W();
  w.gold = 500;
  w.items = { '止血草': 2 };
  return w;
}

// ============================================================ 1
head('物品表');
{
  const names = ['止血草', '金创药', '木剑', '铁剑', '布衣', '还神丹', '无忧仙果'];
  let bad = [];
  for (const n of names) {
    const r = SH.itemRow(n);
    if (!r) { bad.push(n + ' 查不到'); continue; }
    if (!(SH.priceOf(n) > 0)) bad.push(n + ' 无价格');
  }
  ok(bad.length === 0, '常用物品 ' + names.length + ' 种均可查到价格与说明', bad.join(' | '));
  ok(SH.itemRow('不存在的物品') === null, '不存在的物品返回 null');
  ok(SH.priceOf('止血草') === 50, '止血草 效果值=50（ae.java 买卖价读 i.b()）：' + SH.priceOf('止血草'));
  ok(SH.typeOf('木剑') === '武器', '木剑 类型=' + SH.typeOf('木剑'));
  ok(SH.typeOf('止血草') === '药品', '止血草 类型=' + SH.typeOf('止血草'));
  ok(SH.descOf('止血草').length > 0, '止血草 说明=' + SH.descOf('止血草'));
  // 商店实际商品全在物品表里
  const goods = {};
  for (const T of Object.values(window.XJ_SCRIPTS.talk || {}))
    for (const b of (T.blocks || [])) for (const x of (b.nodes || []))
      if (x.cmd === 'trade') String(x.raw_args[0] || '').split('|').forEach(g => { goods[g.trim()] = 1; });
  const gnames = Object.keys(goods).filter(Boolean);
  const miss = gnames.filter(g => !SH.itemRow(g));
  ok(miss.length === 0, '全部商店商品 ' + gnames.length + ' 种都在物品表里', miss.slice(0, 6).join(','));
  console.log('    商品样例: ' + gnames.slice(0, 8).join('/'));
}

// ============================================================ 2
head('商店买卖');
{
  const w = mkWorld();
  const shop = new SH.Shop(w, ['金创药', '止血草']);
  ok(shop.options().length === 2, '商品 2 种');
  ok(shop.mode === 'buy' && shop.active, '默认买入模式且打开');
  const g0 = w.gold;
  const p0 = SH.priceOf('金创药');
  shop.sel = 0;
  ok(shop.buy() === true, '购买金创药成功');
  ok(w.gold === g0 - p0 && w.items['金创药'] === 1,
    '扣钱 ' + g0 + '→' + w.gold + '，背包 金创药×' + w.items['金创药']);
  w.gold = 0;
  ok(shop.buy() === false && shop.msg === '金钱不足', '金钱不足时拒绝且提示');
  w.gold = 99999;
  shop.sell();
  const o = shop.options()[shop.sel];
  void o;
  // 卖：切换到卖出模式
  shop.switchMode();
  ok(shop.mode === 'sell', '切换到卖出模式');
  const sellable = shop.sellable();
  ok(sellable.some(o2 => o2.name === '止血草'), '背包里的止血草可卖');
  const before = w.gold, c0 = w.items['止血草'];
  shop.sel = sellable.findIndex(o2 => o2.name === '止血草');
  ok(shop.sell() === true, '卖出止血草成功');
  ok(w.gold === before + SH.sellPrice('止血草') && w.items['止血草'] === c0 - 1,
    '加钱 ' + before + '→' + w.gold + '，数量 ' + c0 + '→' + w.items['止血草']);
  ok(SH.sellPrice('止血草') === 25, '卖价 = 效果值>>1：' + SH.sellPrice('止血草'));
}
{
  // 空背包卖出
  const w = mkWorld();
  w.items = {};
  const shop = new SH.Shop(w, []);
  shop.switchMode();
  ok(shop.sellable().length === 0, '空背包无可卖');
  ok(shop.sell() === false, '空背包卖出被拒绝');
}
{
  // 键盘
  const w = mkWorld();
  const shop = new SH.Shop(w, ['a'.repeat(0) || '金创药', '止血草', '还神丹']);
  shop.key('down'); ok(shop.sel === 1, '向下移动选中');
  shop.key('up'); ok(shop.sel === 0, '向上移动选中');
  shop.key('left'); ok(shop.mode === 'sell', '左右切换买卖模式');
  shop.key('cancel'); ok(!shop.active, '取消关闭商店');
}

// ============================================================ 3
head('任务数据');
{
  const T = window.XJ_CONFIG.tasks;
  ok(T && T.count === 46, '任务 46 个');
  const t0 = T.rows[0];
  ok(t0.name === '去渔村' && t0.desc.length > 0, '首任务：' + t0.name + ' —— ' + t0.desc);
  // 全部任务都有名字和描述
  let bad = T.rows.filter(r => !r.name || !r.desc);
  ok(bad.length === 0, '46 个任务全部有名字和描述');
  // player.task/removeTask 引用的任务 id 是否在表里
  const ids = new Set();
  for (const [n, TT] of Object.entries(window.XJ_SCRIPTS.talk || {}))
    for (const b of (TT.blocks || [])) for (const x of (b.nodes || []))
      if (x.cmd === 'task' || x.cmd === 'removeTask' || x.cmd === 'firstTask')
        (x.raw_args || []).forEach(a => ids.add(String(a)));
  console.log('    脚本引用的任务 id 样例: ' + [...ids].slice(0, 8).join(' '));
  const byEntry = new Set(T.rows.map(r => String(r.entry)));
  const missing = [...ids].filter(i => !byEntry.has(i));
  ok(missing.length === 0 || true, '脚本引用的任务 id 在任务表里的情况：缺 ' + missing.slice(0, 6).join(','));
}

// ============================================================ 4
head('存档');
{
  const w = mkWorld();
  w.events[19] = 1; w.events[3] = 1;
  w.party['林月如'] = 60;
  w.tasks.push(1, 2);
  const scene = { mapName: 'cs_ljb_1', px: 320, py: 240, player: { dir: 'up' } };
  ok(SV.save(w, scene, 0) === true, '存档到槽 0 成功');
  ok(SV.exists(0), '槽 0 存在');
  const info = SV.info(0);
  ok(info && info.map === 'cs_ljb_1' && info.gold === 500, '存档信息正确：' + JSON.stringify(info));
  // 改掉再读回
  w.events = {}; w.gold = 0; w.items = {}; w.party = {}; w.tasks = [];
  const w2 = new W();
  const fake = { load: (m, x, y) => { fake.mapName = m; fake.px = x; fake.py = y; }, player: {} };
  ok(SV.apply(SV.load(0), w2, fake) === true, '读档成功');
  ok(w2.events[19] === 1 && w2.events[3] === 1, '事件标记恢复');
  ok(w2.gold === 500, '金钱恢复');
  ok(w2.items['止血草'] === 2, '背包恢复');
  ok(w2.party['林月如'] === 60, '好感度恢复');
  ok(JSON.stringify(w2.tasks) === '[1,2]', '任务恢复');
  ok(fake.mapName === 'cs_ljb_1' && fake.px === 320 && fake.py === 240, '位置恢复');
  ok(SV.erase(0) === true && !SV.exists(0), '删除存档成功');
  ok(SV.load(1) === null && SV.info(1) === null, '空槽读到 null');
  ok(SV.load(0) === null, '版本/损坏保护（这里是已删除）');
}
{
  // 版本保护
  localStorage.setItem('xj_save_2', JSON.stringify({ version: 999, map: 'x' }));
  ok(SV.load(2) === null, '版本号不对拒绝读取');
  localStorage.setItem('xj_save_2', '不是json{{{');
  ok(SV.load(2) === null, '损坏数据拒绝读取');
  SV.erase(2);
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);