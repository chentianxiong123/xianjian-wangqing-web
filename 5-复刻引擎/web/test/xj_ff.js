/* xj_ff.js —— 快进连点器（剧情通关率核算器）
 *   用法：node 5-复刻引擎/web/test/xj_ff.js [maxActions]
 *
 * 干什么：
 *   1. 开 XJ_TRACE，把引擎吐出的每一句上屏文字收进日志（引擎侧钩子，漏不掉）
 *   2. 从新档开始一路"按空格/回车"快进：过场→对话→分支→战斗自动打赢→
 *      菜单/商店/等待→没得播了就走换图绊线（每条都试）→地图级 change 用 goto 模拟再进图
 *   3. 跑完和"全库剧情总清单"（jar 实测 1190 条 / 36348 字）对账，算覆盖率
 *
 * 结论口径：seen = 连点器实际播出的唯一文本条数；total = jar 全库剧情文本条数。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const WEB = path.resolve(__dirname, '..');
const ROOT = path.resolve(__dirname, '../../..');
const MAX = parseInt(process.argv[2] || '2000000', 10);

let pass = 0, fail = 0;
function head(t) { console.log('\n[' + t + ']'); }

const allText = [];      // 引擎吐出的全部台词 {kind,map,text}
global.XJ_TRACE = function (line) { allText.push(line); };
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

const stat = { actions: 0, maps: [], fights: [], branches: 0, marked: 0 };
const DXY = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function battleStep() {
  const bv = scene.battleView;
  if (!scene.inBattle || !bv) return false;
  try {
    Object.keys(P.heroes(scene.world)).forEach(nm => {
      const h = P.heroes(scene.world)[nm];
      h.level = 45;
      const st = P.statsOf(h);
      h.hp = st.maxHp; h.mp = st.maxMp; h.gas = st.maxGas;
    });
  } catch (e) {}
  let f = 0;
  while (scene.inBattle && f++ < 6000) {
    const v = scene.battleView;
    if (!v) break;
    if (v.menu && !v.menu.isItem && !v.menu.isSpell) {
      const o = v.menu.options || [];
      const ai = o.indexOf('攻击');
      v.menu.sel = ai >= 0 ? ai : 0;
      v.key('ok');
    } else if (v.menu) { v.key('cancel'); }
    else if (v.target) { v.target.sel = 0; v.key('ok'); }
    else v.frame(16);
    if (v.menu || v.target) { /* 下一轮吃键 */ }
  }
  if (f >= 6000) { stat.fights.push('STUCK'); scene.inBattle = false; scene.battleView = null; return true; }
  return true;
}
function advance() {
  let n = 0;
  while (n++ < 2000) {
    try { scene.update(16); } catch (e) {}
    if (scene.inBattle) { battleStep(); continue; }
    if (scene.branch) { stat.branches++; scene.chooseBranch(stat.branches % 2); continue; }
    if (scene.shop && scene.shop.active) { scene.shop.close(); scene.shop = null; continue; }
    if (scene.feeMenu) { if (scene.feeKey) scene.feeKey('ok'); else scene.feeMenu = null; continue; }
    if (scene.menu && scene.menu.active) { if (scene.menuKey) scene.menuKey('cancel'); else scene.menu = null; continue; }
    if (scene.waitKeys) { scene.waitKeys = null; continue; }
    if (scene.cut || (scene.cutQueue || []).length || (scene.dialogBox && scene.dialogBox.text) ||
        (scene.talk && scene.talk.active) || scene.pausedRunner) { scene.interact(); continue; }
    return n;
  }
  return n;
}
const visited = new Set();
function changeTargets() {
  const out = [];
  (scene.world.zones || []).forEach(z => {
    (z.ast || []).forEach(c => {
      if (c.obj === 'world' && c.cmd === 'change' && c.raw_args && c.raw_args[0]) {
        const to = String(c.raw_args[0]).replace(/\.map$/i, '');
        if (z.isExit) out.push({ to, x: z.x, y: z.y, w: z.w, h: z.h, kind: 'zone' });
      }
    });
  });
  return out;
}
function mapLevelTargets() {
  const out = [];
  (scene.m && scene.m.script || []).forEach(c => {
    if (c.obj === 'world' && c.cmd === 'change' && c.raw_args && c.raw_args[0]) {
      out.push({ to: String(c.raw_args[0]).replace(/\.map$/i, '') });
    }
  });
  return out;
}
function stepAlong(d) {
  try { return scene.tryMove(d); } catch (e) { return false; }
}
function exploreOnce() {
  // 四向对话
  for (const d of ['up', 'down', 'left', 'right']) {
    scene.player.dir = d;
    try { scene.interact(); } catch (e) {}
    if (scene.branch || scene.inBattle || scene.cut || scene.waitKeys || scene.pausedRunner ||
        (scene.dialogBox && scene.dialogBox.text) || (scene.talk && scene.talk.active)) return true;
  }
  const step = (scene.m && scene.m.tw) || 16;
  // 优先没去过的图
  const zt = changeTargets().filter(t => stat.maps.indexOf(t.to) < 0);
  const pool = zt.length ? zt : changeTargets();
  const from = scene.mapName;
  let budget = 240;   // 单次探索的走格上限（防内层自旋）
  outer:
  for (const t of pool.slice(0, 12)) {
    const horiz = t.w >= t.h;
    const cx = Math.round(t.x + t.w / 2), cy = Math.round(t.y + t.h / 2);
    const cross = horiz ? ['down', 'up'] : ['right', 'left'];
    for (const c of cross) {
      for (const n of [5, 3, 1, 0]) {
        scene.px = cx - DXY[c][0] * step * n;
        scene.py = cy - DXY[c][1] * step * n;
        if (scene.px < 0 || scene.py < 0) continue;
        if (scene.world.solidAt(scene.px, scene.py)) continue;
        for (let i = 0; i < 20 && budget > 0; i++, budget--) {
          const moved = stepAlong(c);
          if (!moved) break;
          if (i % 4 === 3) advance();
          if (scene.mapName !== from) { advance(); visited.add(t.to); return true; }
        }
        advance();
        if (scene.mapName !== from) { visited.add(t.to); return true; }
        if (budget <= 0) break outer;
      }
    }
  }
  // 随机走几步（探触发区）
  const dirs = ['up', 'down', 'left', 'right'];
  let movedAny = false;
  for (let i = 0; i < 4; i++) {
    if (stepAlong(dirs[(Math.random() * 4) | 0])) movedAny = true;
  }
  if (movedAny) { advance(); return true; }
  return false;
}
function pollMap() {
  if (stat.maps[stat.maps.length - 1] !== scene.mapName) {
    if (stat.maps.indexOf(scene.mapName) < 0) {
      stat.maps.push(scene.mapName);
      console.log('  新图#' + stat.maps.length + ' ' + scene.mapName +
        '（台词' + allText.length + ' 标记' + Object.keys(scene.world.events).filter(k => scene.world.events[k] === 1).length + '）');
    }
    stat.maps.push(scene.mapName);
  }
}

// ============================================================ 开跑
head('快进（真引擎 + 真键路）');
scene.newGame();
pollMap();
let lastN = 0, lastMaps = 0, stagnant = 0;
while (stat.actions < MAX) {
  stat.actions++;
  try {
    advance();
    pollMap();
    if (scene.mapName === 'ms_syt_3' || (scene.world.events && scene.world.events['9999'])) break;
  } catch (e) {
    console.log('  ✗ 异常 @' + scene.mapName + '：' + (e && e.message));
    break;
  }
  if (allText.length === lastN && stat.maps.length === lastMaps) {
    stagnant++;
    // 400 步没进展 → 换图（地图级 change 用 goto 模拟再进图）
    if (stagnant === 400) {
      const ml = mapLevelTargets().filter(t => t.to !== scene.mapName);
      const from = scene.mapName;
      if (ml.length) { scene.goto(ml[0].to); advance(); pollMap(); }
      else if (!exploreOnce()) {
        const zt = changeTargets();
        if (zt.length) { const from2 = scene.mapName; void from2; scene.goto(zt[(Math.random() * zt.length) | 0].to); advance(); pollMap(); }
      }
      stagnant = 0;
      lastN = allText.length; lastMaps = stat.maps.length;
    }
  } else { stagnant = 0; lastN = allText.length; lastMaps = stat.maps.length; }
}

// ============================================================ 对账
const census = JSON.parse(fs.readFileSync(path.join(ROOT, '4-文档/通关报告/剧情总清单.json'), 'utf8'));
// ★ 归一化对比：引擎吐出的台词与 jar 原文在分隔符/空白上有差异（aside 的毫秒、
//   尾部逗号），按字符集归一后再比，否则会低估自己的覆盖率。
const norm = s => String(s).replace(/[\s，,。、：:；;！？!?…\.\-—「」『』"'（）()]/g, '');
const allUniq = new Map();
for (const k of Object.keys(census.items)) {
  for (const t of census.items[k]) { const n = norm(t); if (n && !allUniq.has(n)) allUniq.set(n, t); }
}
const seenNorm = new Map();
for (const l of allText) {
  const p = l.split('|');
  const n = norm(p.slice(3).join('|'));
  if (n && !seenNorm.has(n)) seenNorm.set(n, p.slice(3).join('|'));
}
let hit = 0; const hitList = [];
for (const [n] of seenNorm) if (allUniq.has(n)) { hit++; hitList.push(n); }
const totalU = allUniq.size;
const cov = hit / totalU * 100;
const uniqMaps = [...new Set(stat.maps)];
console.log('\n===== 剧情通关率核算（唯一文本口径）=====');
console.log('动作 ' + stat.actions + '｜到过图 ' + uniqMaps.length + ' 张｜引擎吐出 ' +
  allText.length + ' 条（唯一 ' + seenNorm.size + '）');
console.log('原版全库剧情 ' + census.lines + ' 条指令 / ' + totalU + ' 条唯一文本 / ' + census.chars + ' 字');
console.log('命中 ' + hit + ' 条 = ' + cov.toFixed(1) + '%　未播出 ' + (totalU - hit) +
  ' 条 = ' + (100 - cov).toFixed(1) + '%');
fs.writeFileSync(path.join(ROOT, '4-文档/通关报告/快进覆盖率.json'),
  JSON.stringify({ actions: stat.actions, maps: uniqMaps, texts: allText,
    hit, totalUnique: totalU, pct: cov, missingSample: [...allUniq.keys()]
      .filter(n => !seenNorm.has(n)).slice(0, 40).map(n => allUniq.get(n)) }, null, 1));
console.log('明细：4-文档/通关报告/快进覆盖率.json（含全部台词原文 + 未播出样本）');