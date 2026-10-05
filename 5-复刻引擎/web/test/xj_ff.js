/* xj_ff.js —— 剧情覆盖率最大化器（跳关/跑图/清屏增强版）
 *   用法：node 5-复刻引擎/web/test/xj_ff.js [passes]
 *
 * 三件事：
 *   1. 引擎台词钩子（xj_world.js XJTrace）：每句上屏文字收进集合，漏不掉。
 *   2. 增强器能力：
 *        · 跳关：直接 goto 任意地图（69 张全覆盖，不靠撞墙）
 *        · 跑图：每张图把未触发触发区全部踩一遍（站到区中心 checkZones）
 *        · 清屏：逐个 NPC 站到面前反复对话（对白书多块按标记逐轮放完）
 *        · 宝箱/倒计时：开箱、到点回调（countdownTimer→xuanze:0）
 *        · 多周目：标记跨周目累积，交互互斥门（r6/r8 二选一那类）
 *        · 分支：每周目交替选 0/1，两条分支都吃到
 *   3. 对账：与《剧情总清单》（jar 实测 1037 条唯一文本）算覆盖率，逐周目打印。
 *
 * 口径诚实：跳关用的是 goto（测试台允许），但所有对话/战斗/触发都走真实引擎路径。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const WEB = path.resolve(__dirname, '..');
const ROOT = path.resolve(__dirname, '../../..');
const MAX_PASSES = parseInt(process.argv[2] || '12', 10);

const seen = new Set();          // 归一化后的唯一文本
const rawLines = [];             // 全部台词原文（引擎吐出）
const norm = s => String(s).replace(/[\s，,。、：:；;！？!?…\.·\-—「」『』"'（）()《》]/g, '');
function note(line) {
  rawLines.push(line);
  const p = String(line).split('|');
  const n = norm(p.slice(3).join('|'));
  if (n) seen.add(n);
}
global.XJ_TRACE = note;          // 引擎钩子：每句上屏文字都过这里

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
const P = window.XJParty, T = window.XJTalk;
let MAPS = Object.keys(window.XJ_MAPS.maps);
if (process.env.FF_ONLY) MAPS = process.env.FF_ONLY.split(',');
if (process.env.FF_SKIP_HONEST) { /* 跳关模式调试用 */ }
const census = JSON.parse(fs.readFileSync(path.join(ROOT, '4-文档/通关报告/剧情总清单.json'), 'utf8'));
const allUniq = new Map();
for (const k of Object.keys(census.items)) {
  for (const t of census.items[k]) { const n = norm(t); if (n && !allUniq.has(n)) allUniq.set(n, k + '｜' + t); }
}

const log = [];
let branchFlip = 0, battles = 0, zonesFired = 0, npcTalks = 0;
function hits() { let n = 0; for (const s of seen) if (allUniq.has(s)) n++; return n; }

// ---------------------------------------------------------- 基础动作
function maxLvl() {
  try {
    Object.keys(P.heroes(scene.world)).forEach(nm => {
      const h = P.heroes(scene.world)[nm];
      h.level = 45;
      const st = P.statsOf(h);
      h.hp = st.maxHp; h.mp = st.maxMp; h.gas = st.maxGas;
    });
  } catch (e) {}
}
function fight() {
  if (!scene.inBattle) return false;
  maxLvl(); battles++;
  let f = 0;
  while (scene.inBattle && f++ < 8000) {
    const v = scene.battleView;
    if (!v) break;
    if (v.menu && !v.menu.isItem && !v.menu.isSpell) {
      const o = v.menu.options || [], ai = o.indexOf('攻击');
      v.menu.sel = ai >= 0 ? ai : 0; v.key('ok');
    } else if (v.menu) v.key('cancel');
    else if (v.target) { v.target.sel = 0; v.key('ok'); }
    else v.frame(16);
  }
  if (f >= 8000) { scene.inBattle = false; scene.battleView = null; return false; }
  return true;
}
/** 播完所有演出（对话/过场/分支/菜单/商店/等待/暂停），战斗自动打赢 */
function drain(maxN) {
  let n = 0;
  while (n++ < (maxN || 4000)) {
    try { scene.update(16); } catch (e) {}
    if (scene.inBattle) { fight(); continue; }
    if (scene.branch) { try { scene.chooseBranch(branchFlip); } catch (e) {} continue; }
    if (scene.shop && scene.shop.active) { try { scene.shop.close(); } catch (e) {} scene.shop = null; continue; }
    if (scene.feeMenu) { if (scene.feeKey) { try { scene.feeKey('ok'); } catch (e) { scene.feeMenu = null; } } else scene.feeMenu = null; continue; }
    if (scene.menu && scene.menu.active) { if (scene.menuKey) { try { scene.menuKey('cancel'); } catch (e) { scene.menu = null; } } else scene.menu = null; continue; }
    if (scene.waitKeys) { scene.waitKeys = null; continue; }
    if (scene.cut || (scene.cutQueue || []).length || (scene.dialogBox && scene.dialogBox.text) ||
        (scene.talk && scene.talk.active) || scene.pausedRunner) { try { scene.interact(); } catch (e) {} continue; }
    // 倒计时到点回调（cs_sz_2: 60s → xuanze:0）
    const cd = scene.world && scene.world.countdown;
    if (cd && cd.file != null) {
      scene.world.countdown = null;
      try { scene.world.runScriptEntryFull(cd.file, cd.line); scene.drainWorldFx(); } catch (e) {}
      continue;
    }
    // ★ 待开战斗：必须真开。放任不管的话 pendingBattle 会把后面所有 goto 吞掉
    //   （goto 见 pendingBattle 就存 afterGoto 直接 return），整轮一张图都进不去。
    if (scene.pendingBattle && !scene.inBattle) {
      const key = scene.pendingBattle.key;
      scene.pendingBattle = null;
      maxLvl();
      try { scene.startBattle(key, scene.mainLevel()); } catch (e) {}
      continue;
    }
    return n;
  }
  return n;
}
function enter(map) {
  scene.pendingBattle = null;
  try { scene.goto(map); } catch (e) { return false; }
  drain();
  return scene.mapName === map;
}
/** 站在图里不跑 change（引擎 warp 入口 load(...,false)）：扫区/清屏必须站在本图，
 *  否则地图脚本的 world.change 会把人传送走，后面的踩区全踩在别的图上（工具坑）。 */
function enterStay(map) {
  scene.pendingBattle = null;
  try { scene.load(map, null, null, false); } catch (e) { return false; }
  drain();
  return scene.mapName === map;
}
// ---------------------------------------------------------- 增强器：跑图/清屏/开箱
/** 把本图所有未触发触发区踩一遍（站到区中心，线段判定穿过即触发） */
function sweepZones() {
  const zs = (scene.world.zones || []).filter(z => !z.fired && z.ast && z.ast.length);
  let fired = 0;
  for (const z of zs) {
    const cx = Math.round(z.x + z.w / 2), cy = Math.round(z.y + z.h / 2);
    scene.px = cx; scene.py = cy;
    try { scene.checkZones(); } catch (e) {}
    drain();
    if (z.fired) fired++;
    // 触发后世界可能重建（图变了/元素动了），刷新列表
    if (scene.mapName && scene.m && scene.world.zones && zs.indexOf(z) < 0) break;
  }
  zonesFired += fired;
  return fired;
}
/** 逐个 NPC 站到面前反复对话（对白书按标记逐块放完） */
function talkAllNpcs() {
  const els = (scene.world.elements || []).slice();
  let n = 0;
  for (const e of els) {
    if (e.kind !== 'npc' || !e.id) continue;
    let book = null;
    try { book = T.talkScript(e.id); } catch (err) {}
    if (!book) continue;
    let rounds = 0, grew = true;
    while (grew && rounds++ < 8) {
      const before = seen.size;
      const sides = [[0, 22, 'up'], [0, -22, 'down'], [22, 0, 'left'], [-22, 0, 'right']];
      for (const [dx, dy, dir] of sides) {
        scene.px = Math.round(e.x + dx); scene.py = Math.round(e.y + dy);
        scene.player.dir = dir;
        try { scene.interact(); } catch (err) {}
        drain();
        if (scene.talk || (scene.dialogBox && scene.dialogBox.text) || seen.size > before) break;
      }
      grew = seen.size > before;
    }
    npcTalks++;
    n++;
  }
  return n;
}
/** 开宝箱 + 碰明怪（触发剧情战斗/掉落） */
function lootAll() {
  const els = (scene.world.elements || []).slice();
  for (const e of els) {
    if (e.kind !== 'box') continue;
    scene.px = Math.round(e.x); scene.py = Math.round(e.y + 22);
    try { scene.interact(); } catch (err) {}
    drain();
  }
  for (const e of els) {
    if (e.kind !== 'monster') continue;
    // 明怪接触开战：只打有剧情的（boss 级），普通明怪不刷（噪音大收益低）
    if (!/boss|liyao|linglong|egui/.test(String(e.key || e.ant || ''))) continue;
    scene.px = Math.round(e.x); scene.py = Math.round(e.y + 22);
    try { scene.touchMonsters(); } catch (err) {}
    drain();
  }
}
// ---------------------------------------------------------- 主循环：多周目
scene.newGame();
drain();
console.log('[新档] 标记=' + Object.keys(scene.world.events).filter(k => scene.world.events[k] === 1).length +
  ' 台词=' + hits());

let prevHits = -1, stalls = 0;
const perPass = [];
const SKIP_HONEST = !!process.env.FF_SKIP_HONEST;
for (let pass = 1; pass <= (SKIP_HONEST ? 0 : MAX_PASSES); pass++) {
  branchFlip = pass % 2;
  for (const map of MAPS) {
    enter(map);            // 真实进入（剧情 map 会 world.change 传送走）
    drain();
    enterStay(map);        // 回到目标图站定（跳过 change）
    drain();
    sweepZones();
    talkAllNpcs();
    lootAll();
    sweepZones();          // 第二轮：NPC/开箱可能改了标记，再扫一次区
    drain();
  }
  const h = hits();
  perPass.push({ pass, hits: h, marks: Object.keys(scene.world.events).filter(k => scene.world.events[k] === 1).length });
  console.log('周目' + pass + ' 分支=' + branchFlip + ' → 命中 ' + h + '/' + allUniq.size +
    '（' + (h / allUniq.size * 100).toFixed(1) + '%）标记=' + perPass[perPass.length - 1].marks +
    ' 战斗=' + battles + ' 区=' + zonesFired + ' NPC=' + npcTalks);
  if (h === prevHits) { if (++stalls >= 2) { console.log('（连续两周目零增长，收工）'); break; } }
  else stalls = 0;
  prevHits = h;
}
// ---------------------------------------------------------- 跳关增强器：逐批次解门
// ★ 关键：不能用"全标记置位"当上限——大量批次门是 !eventMarked(N)（首次才播），
//   全置位会把它们全跳过。正确做法是【每个批次只满足它自己那几条门】：
//   正项 eventMarked(n)→1、负项 !eventMarked(n)→0、其余标记清零，进图跑一遍。
//   这样每个批次的正文都会被播到——命中的即"引擎能产出的全部"，剩下的是原版死内容。
function gateSig(cond) {
  const sig = {};
  const terms = (cond && cond.terms) ? cond.terms : (cond ? [{ raw: String(cond), neg: false }] : []);
  terms.forEach(t => {
    const m = /eventMarked\((\d+)\)/.exec(t.raw || '');
    if (m) sig[m[1]] = t.neg ? 0 : 1;
  });
  return sig;
}
function applySig(sig) {
  const w = scene.world;
  for (const k of Object.keys(w.events)) w.events[k] = 0;
  for (const k of Object.keys(sig || {})) w.events[k] = sig[k];
}
function sigsOfAst(ast) {
  const out = [];
  (ast || []).forEach(c => {
    if (c.cmd === 'openScriptList' && c.cond) {
      const s = gateSig(c.cond);
      if (Object.keys(s).length) out.push(s);
    }
  });
  return out;
}
function uniqSigs(list) {
  const seen = {}, out = [];
  list.forEach(s => {
    const k = Object.keys(s).sort((a, b) => a - b).map(x => x + '=' + s[x]).join(',');
    if (!seen[k]) { seen[k] = 1; out.push(s); }
  });
  return out;
}
function mapSigs(map) {
  const m = window.XJ_MAPS.maps[map];
  const list = [{}];
  list.push.apply(list, sigsOfAst(m.script));
  (m.layers || []).forEach(L => {
    (L.o || []).forEach(o => list.push.apply(list, sigsOfAst(o[3])));
    (L.r || []).forEach(r => list.push.apply(list, sigsOfAst(r.scriptAst)));
  });
  return uniqSigs(list);
}
/** 逐个触发区解门触发（每个批次的门都满足一遍） */
function sweepZonesGated() {
  const zs = (scene.world.zones || []).filter(z => z.ast && z.ast.length);
  let fired = 0;
  for (const z of zs) {
    const sigs = uniqSigs([{}].concat(sigsOfAst(z.ast)));
    for (const sig of sigs) {
      applySig(sig);
      z.fired = false;
      scene.px = Math.round(z.x + z.w / 2);
      scene.py = Math.round(z.y + z.h / 2);
      try { scene.checkZones(); } catch (e) {}
      drain();
      if (z.fired) fired++;
    }
  }
  // 也把不带 change 的区（纯剧情区）按默认态补一遍
  const rest = (scene.world.zones || []).filter(z => !z.fired && z.ast && z.ast.length);
  for (const z of rest) {
    scene.px = Math.round(z.x + z.w / 2);
    scene.py = Math.round(z.y + z.h / 2);
    try { scene.checkZones(); } catch (e) {}
    drain();
    if (z.fired) fired++;
  }
  zonesFired += fired;
  return fired;
}
/** 逐个 NPC 按其对白书每个条目的门解门对话 */
function talkNpcsGated() {
  const els = (scene.world.elements || []).slice();
  let n = 0;
  for (const e of els) {
    if (e.kind !== 'npc' || !e.id) continue;
    let book = null;
    try { book = T.talkScript(e.id); } catch (err) {}
    if (!book) continue;
    // 该 NPC 的对白书可能有多个条目（不同门），逐条目解门
    let base = null;
    try { base = String(book).replace(/\.str$/i, ''); } catch (err) {}
    const blocks = (window.XJ_SCRIPTS.talk && window.XJ_SCRIPTS.talk[base] &&
      window.XJ_SCRIPTS.talk[base].blocks) || [];
    const sigs = uniqSigs([{}].concat(blocks.map(b => gateSig(b.cond))));
    for (const sig of sigs) {
      applySig(sig);
      for (let round = 0; round < 4; round++) {
        const before = seen.size;
        for (const [dx, dy, dir] of [[0, 22, 'up'], [0, -22, 'down'], [22, 0, 'left'], [-22, 0, 'right']]) {
          scene.px = Math.round(e.x + dx); scene.py = Math.round(e.y + dy);
          scene.player.dir = dir;
          try { scene.interact(); } catch (err) {}
          drain();
          if (scene.talk || (scene.dialogBox && scene.dialogBox.text) || seen.size > before) break;
        }
        if (seen.size === before) break;
      }
    }
    npcTalks++;
    n++;
  }
  return n;
}
console.log('\n[跳关增强器] 逐批次解门（全 69 图 × 各批次门 × 全区 × 全 NPC 对白条目）');
const honestHits = hits();
for (let pass = 1; pass <= 2; pass++) {
  branchFlip = pass % 2;
  for (const map of MAPS) {
    const sigs = mapSigs(map);
    for (const sig of sigs) {
      if (process.env.FF_VERBOSE) console.log('   ' + map + ' sig=' + JSON.stringify(sig) + ' 前命中=' + hits());
      // ① 站在本图（跳过 change）扫区/清屏
      applySig(sig);
      enterStay(map); drain();
      sweepZonesGated(); talkNpcsGated(); lootAll(); drain();
      // ② 同标记下走正常入口，验证 map级 change / 剧情开场
      //    （必须重新 applySig：① 已经改过标记，不重置会把 ② 的批次门关掉）
      applySig(sig);
      enter(map); drain();
    }
  }
  console.log('  解门周目' + pass + ' → 命中 ' + hits() + '/' + allUniq.size +
    '（' + (hits() / allUniq.size * 100).toFixed(1) + '%）');
  if (hits() === allUniq.size) break;
}
console.log('诚实多周目 ' + honestHits + ' → 逐批次解门后 ' + hits() +
  '（引擎上限 ' + (hits() / allUniq.size * 100).toFixed(1) + '%）');

const hit = hits();
const pct = hit / allUniq.size * 100;
const missing = [];
for (const [n, label] of allUniq) if (!seen.has(n)) missing.push(label);
console.log('\n===== 剧情覆盖率（多周目 + 跳关 + 跑图 + 清屏）=====');
console.log('到过图 ' + new Set(perPass.length ? MAPS : []).size + ' 张（全表遍历）｜战斗 ' + battles +
  ' 场｜触发区 ' + zonesFired + ' 次｜NPC 对话 ' + npcTalks + ' 个');
console.log('诚实多周目 ' + honestHits + ' = ' + (honestHits / allUniq.size * 100).toFixed(1) + '%');
console.log('原版全库 ' + census.lines + ' 条指令 / ' + allUniq.size + ' 条唯一文本 / ' + census.chars + ' 字');
console.log('命中 ' + hit + ' = ' + pct.toFixed(1) + '%　未播出 ' + missing.length + ' = ' +
  (100 - pct).toFixed(1) + '%');
fs.writeFileSync(path.join(ROOT, '4-文档/通关报告/快进覆盖率.json'), JSON.stringify({
  passes: perPass, allMarks: AM.length, honestHits,
  engineCeiling: hit, battles, zonesFired, npcTalks,
  hit, total: allUniq.size, pct, missingSample: missing.slice(0, 80),
  texts: rawLines
}, null, 1));
console.log('明细：4-文档/通关报告/快进覆盖率.json（含未播出样本 ' + Math.min(60, missing.length) + ' 条）');