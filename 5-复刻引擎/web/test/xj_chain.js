/* xj_chain.js —— 主线链式验收：沿主线标记图一步步走，断在哪报哪
 *   用法：node 5-复刻引擎/web/test/xj_chain.js
 *
 * 不是随机漫游，是确定性链条：newGame → 每站 advance（播完）→ 断言标记/地图 →
 * 战斗自动打赢（满级，只验链子不断）→ 下一站。每一步都是"前一个的输出是后一个的输入"，
 * 断了立刻精确报站（对比：xj_mash 随机游荡只能报"哪里没去过"）。
 * 当前链（主线标记图+数据实测）：
 *   ms_syt_1(开场→1→yw_syc) → yw_syc(到达→2) → ms_syt_1(重返→3→cs_ss_d)
 *   → cs_ss_d(boss1→4→yw_yl_3) → …
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

global.window = global;
global.Image = function () {
  this.naturalWidth = 16; this.naturalHeight = 16; this.complete = true;
  Object.defineProperty(this, 'src', { set() {} });
  this.addEventListener = function () {};
};
{
  const store = Object.create(null);
  global.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
}
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
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_world.js', 'xj_talk.js',
  'xj_battle.js', 'xj_view.js', 'xj_shop.js', 'xj_menu.js', 'xj_audio.js',
  'xj_save.js', 'xj_battleview.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}

const scene = new window.XJScene({ width: 240, height: 320, getContext: () => stubCtx() });
const P = window.XJParty;
const says = [];
const seenSay = new Set();
function noteSay(t, tag) {
  const raw = (t && t.text !== undefined) ? t.text : t;
  if (raw === null || raw === undefined || raw === 'null') {
    console.log('  ⚠ NULL源 @' + scene.mapName + ' [' + (tag || '?') + '] ' +
      JSON.stringify(t && { speaker: t.speaker, text: t.text, mode: t.mode, type: t.type }));
  }
  const str = String(raw);
  if (seenSay.has(str)) return;
  seenSay.add(str); says.push(scene.mapName + ' :: ' + str.slice(0, 80));
}
// 播完当前所有演出（对话/过场/等待/暂停），返回推进次数
function advance(maxSteps) {
  let n = 0;
  for (let i = 0; i < (maxSteps || 5000); i++) {
    try { scene.update(16); } catch (e) {}
    if (scene.dialogBox && scene.dialogBox.text != null) noteSay(
      { speaker: scene.dialogBox.speaker, text: (scene.dialogBox.speaker ? scene.dialogBox.speaker + '：' : '') + scene.dialogBox.text }, 'dialogBox');
    if (scene.dialog && scene.dialog.text != null) noteSay({ text: scene.dialog.text }, 'dialog');
    if (scene.cut) noteSay({ text: scene.cut.text, mode: scene.cut.mode }, 'cut');
    if (scene.inBattle) return n; // 战斗交给 battleWin
    if (scene.branch) {
      (scene.branch.options || []).forEach(o => { if (!o.label) console.log('  ⚠ NULL分支选项 @' + scene.mapName + ' ' + JSON.stringify(o)); });
      scene.chooseBranch(0); n++; continue; }
    if (scene.shop && scene.shop.active) { scene.shop.close(); scene.shop = null; n++; continue; }
    if (scene.feeMenu) { if (scene.feeKey) scene.feeKey('ok'); else scene.feeMenu = null; n++; continue; }
    if (scene.menu && scene.menu.active) { if (scene.menuKey) scene.menuKey('cancel'); else scene.menu = null; n++; continue; }
    if (scene.waitKeys) { scene.waitKeys = null; n++; continue; }
    if (scene.cut || (scene.cutQueue || []).length || (scene.dialogBox && scene.dialogBox.text) ||
        (scene.talk && scene.talk.active) || scene.pausedRunner) {
      scene.interact(); n++; continue;
    }
    break;
  }
  return n;
}
// 自动打赢当前战斗（开战前满级，只验链子）
function battleWin() {
  if (!scene.inBattle) return 'n battle';
  try {
    Object.keys(P.heroes(scene.world)).forEach(nm => {
      const h = P.heroes(scene.world)[nm];
      h.level = 45;
      const st = P.statsOf(h);
      h.hp = st.maxHp; h.mp = st.maxMp; h.gas = st.maxGas;
    });
  } catch (e) {}
  const bv = scene.battleView;
  let frames = 0;
  while (scene.inBattle && frames++ < 30000) {
    const v = scene.battleView;
    if (!v) break;
    if (v.menu && !v.menu.isItem && !v.menu.isSpell) {
      const opts = v.menu.options || [];
      const ai = opts.indexOf('攻击');
      v.menu.sel = ai >= 0 ? ai : 0;
      v.key('ok');
    } else if (v.menu) { v.key('cancel'); }
    else if (v.target) { v.target.sel = 0; v.key('ok'); }
    else {
      for (let i = 0; i < 60 && scene.inBattle; i++) {
        const vv = scene.battleView;
        if (!vv || vv.menu || vv.target) break;
        vv.frame(16);
      }
    }
  }
  return scene.inBattle ? 'STUCK' : 'done(' + frames + 'f)';
}
function marks() {
  return Object.keys(scene.world.events || {}).filter(k => scene.world.events[k] === 1).map(Number).sort((a, b) => a - b);
}
// 播完+打完（链上若有战斗就打赢），直到彻底空闲；返回战斗次数
const fought = [];
function settle(maxRounds) {
  let fights = 0;
  for (let r = 0; r < (maxRounds || 6); r++) {
    advance();
    if (scene.inBattle) {
      fights++;
      try { fought.push(scene.battleView.battle.key); } catch (e) {}
      battleWin(); advance();
    }
    else break;
  }
  return fights;
}

// 真走绊线去 target 图：站到线外沿法向侧多试几格，逐格走直到切图。
// 不用 goto 作弊——真实玩家就是这么走过去的。
const DXY = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function walkZoneTo(target) {
  const step = (scene.m && scene.m.tw) || 16;
  const from = scene.mapName;
  const zs = (scene.world.zones || []).filter(z => z.isExit &&
    (z.ast || []).some(c => c.obj === 'world' && c.cmd === 'change' &&
      String((c.raw_args || [])[0] || '').replace(/\.map$/i, '') === target));
  if (!zs.length) { console.log('  本图无 →' + target + ' 的绊线'); return false; }
  for (const z of zs) {
    const horiz = z.w >= z.h;
    const cx = Math.round(z.x + z.w / 2), cy = Math.round(z.y + z.h / 2);
    // 穿线方向：横线竖穿、竖线横穿；两侧都试
    const crossDirs = horiz ? ['down', 'up'] : ['right', 'left'];
    for (const cross of crossDirs) {
      for (const startN of [6, 4, 2, 1, 0]) {
        const d = DXY[cross];
        scene.px = cx - d[0] * step * startN;
        scene.py = cy - d[1] * step * startN;
        if (scene.px < 0 || scene.py < 0) continue;
        if (scene.world.solidAt(scene.px, scene.py)) continue;
        for (let i = 0; i < 24; i++) {
          let moved = false;
          try { moved = scene.tryMove(cross); } catch (e) {}
          settle(1);
          if (scene.mapName !== from) {
            console.log('  绊线 ' + from + '→' + target + ' 走通（' + cross + '，' + (i + 1) + ' 步）');
            return scene.mapName === target;
          }
          if (!moved) break;
        }
      }
    }
  }
  console.log('  绊线 ' + from + '→' + target + ' 走不通（' + zs.length + ' 条都试过）');
  return false;
}
// 地图级 world.change（yw_syc#197 → ms_syt_1 这类无条件切图）：进图即触发，
// 不是玩家走的绊线，所以要 goto 才算"再进图"（真实玩家从渔村另一出口绕回锁妖塔）
function mapLevelChangeTo(target) {
  const hit = (scene.m.script || []).some(c => c.obj === 'world' && c.cmd === 'change' &&
    String((c.raw_args || [])[0] || '').replace(/\.map$/i, '') === target);
  if (!hit) return false;
  scene.goto(target);
  console.log('  地图级 change ' + scene.mapName + '→' + target + '（进图即切，goto 模拟再进图）');
  return scene.mapName === target;
}
// ============================================================ 链
console.log('[开场 ms_syt_1]');
scene.newGame();
settle();
ok(scene.mapName === 'yw_syc', '开场播完切往渔村：' + scene.mapName);
ok(marks().indexOf(1) >= 0, '立标记 1：' + JSON.stringify(marks()));

console.log('[渔村到达 yw_syc（重楼/景天/紫萱重逢）]');
settle();
ok(marks().indexOf(2) >= 0, '立标记 2：' + JSON.stringify(marks()));

console.log('[近郊：r8 绊线→6/601，sn_mj_1→602]');
// ★ r8 门 = !6 && 5（mark5 来自 cs_ss_d 战后 yw_yl_3#191，与 r6 一对互斥）
//   ⇒ 第一次玩（还没打 boss1）本线不可能开，原版如此。作弊 goto 到 sn_mj_1 验证内容。
void walkZoneTo('sn_mj_1');
scene.goto('sn_mj_1'); settle();
ok(scene.mapName === 'sn_mj_1', 'sn_mj_1 到场：' + scene.mapName);
console.log('  602 门 = !602 && 601，601 只由 r8（门 !6 && 5）产出；此链未打 boss1 ⇒ 601 不可达 ⇒ 602 不立（原版门控）');
ok(walkZoneTo('yw_syc'), 'sn_mj_1 回渔村');

console.log('[重返锁妖塔 ms_syt_1（漓殇/邪剑仙，!3 && 2）]');
// 走 ms_syt_1↔yw_syc 的换图绊线验证 mark2 门；首次到场时 mapName=yw_syc，
// 先回锁妖塔再让锁妖塔批次推进（真实玩家就是走出渔村再进门）。
ok(mapLevelChangeTo('ms_syt_1'), 'yw_syc 回锁妖塔（地图级 change#197）');
settle();
ok(marks().indexOf(3) >= 0, '立标记 3：' + JSON.stringify(marks()));
ok(scene.mapName === 'cs_ss_d', '重返播完切往蜀山：' + scene.mapName);

console.log('[蜀山 boss1（H2:0 开场一次立 1-8，原版如此）]');
settle();
ok(fought.indexOf('boss1') >= 0, 'boss1 开战且打赢：' + JSON.stringify(fought));
ok(marks().indexOf(4) >= 0, '立标记 4：' + JSON.stringify(marks()));
console.log('  战后图：' + scene.mapName);

console.log('[渔村灭妖批（!7 && 602）→7]');
// ★ cs_ss_d 无 yw_syc 出口；战后本来就没路（回不去渔村），玩家从蜀山出口走
ok(walkZoneTo('yw_yl_3'), 'cs_ss_d→yw_yl_3（出口）');
settle();
ok(marks().indexOf(5) >= 0, '立标记 5（!5 && 4）：' + JSON.stringify(marks()));
ok(walkZoneTo('yw_yl_2'), 'yw_yl_3→yw_yl_2');
// yw_yl_2 是商城图（无剧情），回渔村直接 goto 模拟走 yw_yl_1 出口（链在测试范围外）
scene.goto('yw_syc');
settle();
ok(marks().indexOf(7) >= 0 || marks().indexOf(602) >= 0 || marks().indexOf(1403) >= 0,
  '渔村二次到场，剧情批按门控推进：' + JSON.stringify(marks()));
ok(marks().indexOf(7) >= 0, '立标记 7（万民灭妖，!7 && 602）：' + JSON.stringify(marks()));

console.log('[r9 绊线（!8 && 7）→8，sn_yhkz→801]');
// 8 是 r9 绊线自己产的（进渔村即触发），sn_yhkz#40 批门 = !801 && 8
ok(walkZoneTo('sn_yhkz'), 'r9 绊线走通到 sn_yhkz');
settle();
ok(marks().indexOf(8) >= 0, '立标记 8：' + JSON.stringify(marks()));
ok(marks().indexOf(801) >= 0, '立标记 801：' + JSON.stringify(marks()));
ok(walkZoneTo('yw_syc'), 'sn_yhkz→渔村');

console.log('[收尾：当前图与标记快照]');
console.log('  当前图：' + scene.mapName);

// ============================================================
console.log('\n--- 本轮台词（' + says.length + ' 句）---');
says.slice(0, 12).forEach(s => console.log('  ' + s));
if (says.length > 12) console.log('  …（共' + says.length + '句）');
console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
