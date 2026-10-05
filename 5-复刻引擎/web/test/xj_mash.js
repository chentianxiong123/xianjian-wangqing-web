/* xj_mash.js —— 空格连点器：用真实引擎从新档开始玩，落实真实剧情
 *   用法：node 5-复刻引擎/web/test/xj_mash.js [maxActions]
 *
 * 不开浏览器：canvas/音频/存档 stub，走跟回车键同一套代码路径
 * （branch→choose / battle→menu+target+frame / cut-talk-wait→interact /
 *   闲置→四向对话+探索移动+出口）。
 * 战斗前自动满级（只为测链子通不断，练度问题另算，报告里记原等级）。
 * 输出：到图数/对话数/标记数/战斗数 + 卡死点 + null 台词告警。
 * 报告写 4-文档/通关报告/mash.json。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const WEB = path.resolve(__dirname, '..');
const REP = path.resolve(__dirname, '../../../4-文档/通关报告/mash.json');
const MAX = parseInt(process.argv[2] || '300000', 10);
const STUCK = 8000;

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
const rep = {
  maps: [], says: 0, sayChars: 0, marks: [], fights: [], branches: [],
  nullTexts: [], stuck: null, actions: 0, exitchain: [], sayLog: []
};
const seenSay = new Set();
const seenMarks = new Set();
const cnt = { wait: 0, dlg: 0, free: 0 };
let lastProgress = 0, actions = 0;

function progress() { lastProgress = actions; }
function noteSay(text) {
  if (!text) return;
  const s = String(text);
  if (seenSay.has(s)) return;
  seenSay.add(s);
  rep.says++; rep.sayChars += s.length;
  rep.sayLog.push(scene.mapName + ' :: ' + s.slice(0, 90));
  if (/null/.test(s) && !/一旦|然后|然而/.test(s)) {
    rep.nullTexts.push({ map: scene.mapName, text: s.slice(0, 120) });
    console.log('  ⚠ null台词 @' + scene.mapName + '：' + s.slice(0, 100));
  }
  progress();
}
function pollText() {
  if (scene.dialogBox && scene.dialogBox.text) noteSay(
    (scene.dialogBox.speaker ? scene.dialogBox.speaker + '：' : '') + scene.dialogBox.text);
  if (scene.dialog && scene.dialog.text) noteSay(scene.dialog.text);
  if (scene.cut && scene.cut.text) noteSay(scene.cut.text);
  (scene.cutQueue || []).slice(0, 3).forEach(c => c.text && noteSay(c.text));
}
function pollMarks() {
  Object.keys(scene.world.events || {}).forEach(k => {
    if (scene.world.events[k] === 1 && !seenMarks.has(k)) {
      seenMarks.add(k); rep.marks.push(+k); progress();
    }
  });
}
const visitCount = {};
function pollMap() {
  visitCount[scene.mapName] = (visitCount[scene.mapName] || 0) + 1;
  if (rep.maps[rep.maps.length - 1] !== scene.mapName) {
    const isNew = rep.maps.indexOf(scene.mapName) < 0;
    rep.maps.push(scene.mapName);
    if (isNew) {
      progress();
      console.log('  → 新图：' + scene.mapName +
        '（标记' + seenMarks.size + ' 对话' + rep.says + '）');
    }
  }
}

// 战斗包装：记录 + 开战前满级（只测链，不断练度）
const realStart = scene.startBattle.bind(scene);
scene.startBattle = function (key, lv) {
  const preLv = {};
  try {
    Object.keys(P.heroes(scene.world)).forEach(n => {
      const h = P.heroes(scene.world)[n];
      preLv[n] = h.level;
      h.level = 45;
      const st = P.statsOf(h);
      h.hp = st.maxHp; h.mp = st.maxMp; h.gas = st.maxGas;
    });
  } catch (e) {}
  const r = realStart(key, lv);
  rep.fights.push({ key: key, preLv: preLv, battleFrames: 0 });
  progress();
  return r;
};
const realEnd = scene.endBattle.bind(scene);
scene.endBattle = function (result, settle) {
  const f = rep.fights[rep.fights.length - 1];
  if (f) f.result = result;
  console.log('  ⚔ ' + (f ? f.key : '?') + ' → ' + result +
    '（' + (f ? f.battleFrames : 0) + '帧，原等级' + JSON.stringify(f ? f.preLv : {}) + '）');
  progress();
  return realEnd(result, setttleFix(settle));
};
function setttleFix(s) { return s; }

// 战斗内自动打：菜单选攻击→目标首怪→frame 推进
function battleStep() {
  const bv = scene.battleView;
  const f = rep.fights[rep.fights.length - 1];
  if (!scene.inBattle || !bv) return;
  if (f && ++f.battleFrames > 30000) {
    console.log('  ✗ 战斗卡死：' + f.key);
    rep.stuck = { where: 'battle:' + f.key, map: scene.mapName };
    actions = MAX; return;
  }
  if (bv.menu) {
    const opts = bv.menu.options || [];
    if (bv.menu.isItem || bv.menu.isSpell) { bv.key('cancel'); return; }
    const ai = opts.indexOf('攻击');
    bv.menu.sel = ai >= 0 ? ai : 0;
    bv.key('ok');
    return;
  }
  if (bv.target) { bv.target.sel = 0; bv.key('ok'); return; }
  for (let i = 0; i < 60 && scene.inBattle && !scene.battleView.menu && !scene.battleView.target; i++) {
    try { scene.battleView.frame(16); } catch (e) { console.log('  ✗ frame炸：' + e.message); actions = MAX; return; }
  }
}

const DIRS = ['up', 'down', 'left', 'right'];
const DXY = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
let dirIdx = 0;
const visited = new Set();
function tileKey(map, x, y, step) {
  return map + ':' + Math.round(x / step) + ',' + Math.round(y / step);
}
// 与 tryMove 同口径的合法性（只读查询，不移动）：落点判 + 线段判
function walkableEdge(fx, fy, nx, ny) {
  if (!scene.m) return false;
  if (nx < 0 || ny < 0 || nx >= scene.mapPxW() || ny >= scene.mapPxH()) return false;
  try {
    if (scene.hitElement(nx, ny)) return false;
    if (scene.world.solidAt && scene.world.solidAt(nx, ny)) return false;
    if (scene.world.solidSeg && scene.world.solidSeg(fx, fy, nx, ny)) return false;
  } catch (e) { return false; }
  return true;
}
// BFS 找路：到最近满足 isGoal 的格
function bfsPath(step, isGoal, maxNodes) {
  const sx = scene.px, sy = scene.py;
  const startK = tileKey(scene.mapName, sx, sy, step);
  const prev = {}; prev[startK] = null;
  const q = [[sx, sy]];
  let n = 0;
  while (q.length && n < (maxNodes || 20000)) {
    const [cx, cy] = q.shift(); n++;
    const ck = tileKey(scene.mapName, cx, cy, step);
    if (ck !== startK && isGoal(cx, cy)) {
      const path = [];
      let k = ck, pk = [cx, cy];
      const posmap = { [ck]: [cx, cy] };
      let cur = ck;
      const chain = [cur];
      while (prev[cur]) { cur = prev[cur]; chain.push(cur); }
      chain.reverse();
      return chain;
    }
    for (const d of DIRS) {
      const nx = cx + DXY[d][0] * step, ny = cy + DXY[d][1] * step;
      const nk = tileKey(scene.mapName, nx, ny, step);
      if (prev[nk] !== undefined) continue;
      if (!walkableEdge(cx, cy, nx, ny)) continue;
      prev[nk] = ck;
      q.push([nx, ny]);
    }
  }
  return null;
}
function stepAlong(chain, step) {
  // chain 是 tileKey 链：走一步（朝下一格方向 tryMove）
  if (!chain || chain.length < 2) return false;
  const parts = chain[1].split(':')[1].split(',');
  const tx = (+parts[0]) * step, ty = (+parts[1]) * step;
  const dx = tx - scene.px, dy = ty - scene.py;
  const d = Math.abs(dx) >= Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  try {
    if (scene.tryMove(d)) { pollMap(); return true; }
  } catch (e) {}
  return false;
}
function exploreStep() {
  // 四向对话（找面前 NPC）
  for (const d of DIRS) {
    scene.player.dir = d;
    pollText();
    try { scene.interact(); } catch (e) {}
    pollText(); pollMarks();
    if (scene.branch || scene.inBattle || scene.cut || scene.waitKeys || scene.pausedRunner) return;
  }
  const step = (scene.m && scene.m.tw) || 16;
  visited.add(tileKey(scene.mapName, scene.px, scene.py, step));
  // 换图绊线：isExit zone + change 目标图（真出口；m.exits 存的是落点坐标不能导航）
  function changeZones() {
    return (scene.world.zones || []).filter(z => z.isExit).map(z => {
      let to = null;
      (z.ast || []).forEach(c => {
        if (!to && c.obj === 'world' && c.cmd === 'change' && c.raw_args && c.raw_args[0])
          to = String(c.raw_args[0]).replace(/\.map$/i, '');
      });
      return { to: to, x: z.x + z.w / 2, y: z.y + z.h / 2, w: z.w, h: z.h };
    }).filter(z => z.to);
  }
  // 缺进展超过 1500 步：去没去过的图；全去过则去访问最少的图（禁刚来的图防打转）
  const starving = (actions - lastProgress) > 1500;
  if (starving) {
    const exits = changeZones();
    const lastMap = rep.maps.length > 1 ? rep.maps[rep.maps.length - 2] : null;
    const fresh = exits.filter(e => rep.maps.indexOf(e.to) < 0);
    let list = fresh.length ? fresh : exits
      .filter(e => e.to !== lastMap)
      .sort((a, b) => (visitCount[a.to] || 0) - (visitCount[b.to] || 0));
    if (!list.length) list = exits;
    if (list.length) {
      // 绊线是细线：走到线外一格再跨过去（引擎线段触发）
      const path = bfsPath(step, (x, y) => list.some(e =>
        Math.abs(e.x - x) < step * 2 && Math.abs(e.y - y) < step * 2));
      if (path && stepAlong(path, step)) return;
      // 走到绊线旁仍没触发 → 直接走出口（同 T 键，记一笔作弊）
      try {
        const ex = scene.world.nearestExit(scene.px, scene.py, scene.player.dir);
        if (ex) {
          rep.exitchain.push(scene.mapName + '→' + ex.to + '(cheat)');
          scene.goto(ex.to, ex.x, ex.y, ex.dir);
          pollMap(); return;
        }
      } catch (e) {}
    }
  }
  // 否则 BFS 去最近未访问格（全图覆盖，保证触发区全踩）
  const path = bfsPath(step, (x, y) =>
    !visited.has(tileKey(scene.mapName, x, y, step)));
  if (path && stepAlong(path, step)) return;
  // 全图走完 → 去访问最少的换图绊线（禁刚来的图），走过去自然触发
  try {
    const exits = changeZones();
    const lastMap = rep.maps.length > 1 ? rep.maps[rep.maps.length - 2] : null;
    const sorted = exits.slice().sort((a, b) => (visitCount[a.to] || 0) - (visitCount[b.to] || 0));
    const pick = sorted.filter(e => e.to !== lastMap)[0] || sorted[0];
    if (pick) {
      const p2 = bfsPath(step, (x, y) =>
        Math.abs(pick.x - x) < step * 2 && Math.abs(pick.y - y) < step * 2);
      if (p2 && stepAlong(p2, step)) return;
      rep.exitchain.push(scene.mapName + '→' + pick.to + '(cheat)');
      scene.goto(pick.to);
      pollMap(); return;
    }
    const ex = scene.world.nearestExit(scene.px, scene.py, scene.player.dir);
    if (ex) {
      rep.exitchain.push(scene.mapName + '→' + ex.to + '(cheat)');
      scene.goto(ex.to, ex.x, ex.y, ex.dir);
      pollMap(); return;
    }
  } catch (e) {}
}

// ---- 开跑
scene.newGame();
pollMap(); pollMarks();
console.log('开局：' + scene.mapName + '，连打开始（上限' + MAX + '）');

while (actions < MAX) {
  actions++;
  if (actions % 20000 === 0) {
    console.log('  …' + actions + ' @' + scene.mapName + '(' + scene.px + ',' + scene.py + ')' +
      ' cut=' + !!scene.cut + ' queue=' + (scene.cutQueue || []).length +
      ' wait=' + !!scene.waitKeys + ' paused=' + !!scene.pausedRunner +
      ' branch=' + !!scene.branch + ' battle=' + !!scene.inBattle +
      ' menu=' + !!(scene.menu && scene.menu.active) +
      ' shop=' + !!(scene.shop && scene.shop.active) + ' fee=' + !!scene.feeMenu +
      ' dlg=' + !!(scene.dialogBox && scene.dialogBox.text) +
      ' talk=' + !!(scene.talk && scene.talk.active) +
      ' marks=' + seenMarks.size + ' says=' + rep.says +
      ' cnt=' + JSON.stringify(cnt));
  }
  if (actions - lastProgress > STUCK) {
    console.log('  ✗ 卡死：' + STUCK + ' 步无进展 @' + scene.mapName);
    rep.stuck = { where: 'noprogress', map: scene.mapName, px: scene.px, py: scene.py,
      events: seenMarks.size, cut: !!scene.cut, waitKeys: !!scene.waitKeys,
      paused: !!scene.pausedRunner, branch: !!scene.branch,
      inBattle: !!scene.inBattle, menu: !!(scene.menu && scene.menu.active) };
    break;
  }
  try { try { scene.update(16); } catch (e) {}
    pollText(); pollMarks(); pollMap();
    if (scene.inBattle) { battleStep(); continue; }
    if (scene.branch) {
      rep.branches.push({ map: scene.mapName, opts: scene.branch.options.map(o => o.label) });
      scene.chooseBranch(0); progress(); continue;
    }
    if (scene.shop && scene.shop.active) { scene.shop.close(); scene.shop = null; continue; }
    if (scene.feeMenu) {
      if (scene.feeKey) scene.feeKey('ok'); else scene.feeMenu = null;
      continue;
    }
    if (scene.menu && scene.menu.active) {
      if (scene.menuKey) scene.menuKey('cancel'); else scene.menu = null;
      continue;
    }
    if (scene.waitKeys) { cnt.wait++; scene.waitKeys = null; continue; }
    if (scene.cut || (scene.cutQueue || []).length || (scene.dialogBox && scene.dialogBox.text) ||
        (scene.talk && scene.talk.active) || scene.pausedRunner) {
      cnt.dlg++; scene.interact(); continue;
    }
    cnt.free++;
    exploreStep();
  } catch (e) {
    console.log('  ✗ 引擎异常 @' + scene.mapName + '：' + (e && e.message));
    rep.stuck = { where: 'exception:' + (e && e.message), map: scene.mapName,
      px: scene.px, py: scene.py, events: seenMarks.size };
    break;
  }
}

rep.actions = actions;
rep.mapsCount = rep.maps.filter((m, i) => rep.maps.indexOf(m) === i).length;
rep.mapVisits = visitCount;
try { fs.writeFileSync(REP, JSON.stringify(rep, null, 1)); } catch (e) {}
console.log('\n===== 连点报告 =====');
console.log('动作 ' + actions + '｜到图 ' + rep.mapsCount + ' /69｜对话 ' + rep.says +
  ' 句（' + rep.sayChars + '字）｜标记 ' + rep.marks.length + '｜战斗 ' +
  rep.fights.length + '｜分支 ' + rep.branches.length);
console.log('图链：' + rep.maps.filter((m, i) => rep.maps.indexOf(m) === i).join(' → '));
console.log('战斗：' + rep.fights.map(f => f.key + '=' + (f.result || '?')).join(' '));
console.log('null台词 ' + rep.nullTexts.length + ' 条');
if (rep.stuck) console.log('卡死点：' + JSON.stringify(rep.stuck));
