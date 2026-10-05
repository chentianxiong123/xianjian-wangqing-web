/* xj_boot_test.js —— 真实开机链冒烟（game.html 的逻辑，node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_boot_test.js
 *
 * 锁死原版 Startup→ag→h→b 链的复刻：
 *   startTitle → finishTitle 触发 onTitleDone（主菜单钩子，不直接 boot）
 *   → 新的开始 = newGame() 进 ms_syt_1 全状态清零
 *   → 回忆 = XJSave.save/apply 回到存档图
 * 不开浏览器：canvas/音频/存档全部 stub。
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
global.Image = function () {
  this.naturalWidth = 16; this.naturalHeight = 16; this.complete = true;
  Object.defineProperty(this, 'src', { set() {} });
  this.addEventListener = function () {};
};
// localStorage 内存版
{
  const store = Object.create(null);
  global.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
}
// canvas 2d 上下文：全部 no-op，measureText 给宽度
function stubCtx() {
  const t = {};
  return new Proxy(t, {
    get(o, p) {
      if (p === 'measureText') return () => ({ width: 10 });
      if (p in o) return o[p];
      return () => {};
    },
    set(o, p, v) { o[p] = v; return true; }
  });
}
function stubCanvas() {
  return { width: 240, height: 320, getContext: () => stubCtx() };
}

for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_world.js', 'xj_talk.js',
  'xj_battle.js', 'xj_view.js', 'xj_shop.js', 'xj_menu.js', 'xj_audio.js',
  'xj_save.js', 'xj_battleview.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}

// ============================================================ 1 标题钩子
head('标题播完进主菜单（不直接 boot）');
{
  const scene = new window.XJScene(stubCanvas());
  let hooked = false;
  scene.onTitleDone = function () { hooked = true; };
  scene.startTitle();
  ok(!!scene.title, 'startTitle 进入标题态');
  scene.finishTitle();
  ok(hooked, 'finishTitle 走 onTitleDone 钩子');
  ok(scene.mapName == null, '钩子模式下不自动 boot（等玩家选单）');
}

// ============================================================ 2 新的开始
head('新的开始 → ms_syt_1 全状态清零');
{
  const scene = new window.XJScene(stubCanvas());
  scene.newGame();
  ok(scene.mapName === 'ms_syt_1', '开机进初始图：' + scene.mapName);
  ok(scene.player.ant === 'chonglou', '主角动画=chonglou（config 主角动画文件）');
  ok(Object.keys(scene.world.events).length === 0, '事件标记清零');
  ok((scene.world.tasks || []).length === 0, '任务清零');
  // ★ 开局落子给 300 金 + 止血草/鼠儿果各 5（ms_syt_1 地图脚本，新档应有，原版同）
  ok(scene.world.gold === 300 && scene.world.items['止血草'] === 5 && scene.world.items['鼠儿果'] === 5,
    '新档开局包：金' + scene.world.gold + ' ' + JSON.stringify(scene.world.items));
  ok(!scene.inBattle && !scene.title, '非战斗非标题态');
  // 脏状态 → 再 newGame 必须回到开局包（system 回忆后开新档的情形）
  scene.world.events[999] = 1; scene.world.gold = 12345;
  scene.newGame();
  ok(!scene.world.events[999] && scene.world.gold === 300, '二次 newGame 回到开局包');
}

// ============================================================ 3 回忆（3 槽读档）
head('回忆 → 存档图恢复');
{
  const scene = new window.XJScene(stubCanvas());
  scene.newGame();
  ok(JSON.stringify(window.XJSave.slots()) === '[0,1,2]', '回忆 3 槽（b.java l=2 m%3）');
  ok(!window.XJSave.exists(0), '空槽不可选');
  window.XJSave.save(scene.world, scene, 1);
  ok(window.XJSave.exists(1), '存档到槽 1');
  const info = window.XJSave.info(1);
  ok(info && info.map === 'ms_syt_1', '槽信息带地图：' + (info && info.map));
  // 换图再读档 → 回到存档图
  scene.goto('cs_ljb_1');
  const d = window.XJSave.load(1);
  ok(!!d, '读出槽 1');
  ok(window.XJSave.apply(d, scene.world, scene), 'apply 成功');
  ok(scene.mapName === 'ms_syt_1', '回到存档图：' + scene.mapName);
}

// ============================================================
console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
