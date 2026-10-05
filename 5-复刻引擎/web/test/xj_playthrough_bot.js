/* xj_playthrough_bot.js —— 无头通关机（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_playthrough_bot.js [outdir]
 *
 * 目的（2026-10-05）：单元测试全绿≠游戏能玩。本机用真正的 XJScene
 *  （与浏览器同一套主循环：interact/zone/战斗/分支/商店/切图），
 *   机械地把【全部剧情】跑出来：
 *     产物1 剧本.json     —— 每句对话/字幕/分支/战斗/切图，按发生顺序
 *     产物2 覆盖率.json   —— 到访图/NPC对话/触发区/战斗/商店/任务/标记
 *     产物3 断裂点.json   —— 跑不动的地方（组建失败/无队员/异常/分支死角）
 *   分支策略 v1：全部选第 0 项并记录（先拿一条完整主线；v2 再 DFS 穷举）。
 *   战斗策略：最强可用仙术（mp 不够退普攻），血<35% 嗑药，败了也继续（原版如此）。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(WEB, '..', '..', '4-文档', '通关报告');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

global.window = global;
global.Image = function () {
  this.naturalWidth = 16; this.naturalHeight = 16; this.complete = true;
  Object.defineProperty(this, 'src', { set() {} });
  this.addEventListener = function () {};
};
// 无头 canvas：只给构造与数据通路用，不渲染
function stubCtx() {
  return new Proxy({}, {
    get(t, k) { if (k === 'canvas') return null; return function () {}; },
    set() { return true; }
  });
}
const canvasStub = { width: 240, height: 320, getContext: () => stubCtx() };

for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_world.js', 'xj_talk.js',
                 'xj_battle.js', 'xj_battleview.js', 'xj_shop.js', 'xj_view.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}

const T = global.XJTalk;
const script = [];   // 剧本：{t, kind, ...}
const cov = {
  maps: {}, npcs: {}, zones: {}, fights: {}, shops: [], branches: [],
  tasks: {}, items: {}, marks: {}, fees: {}
};
const breaks = [];  // 断裂点
let tick = 0;
function rec(kind, obj) { script.push(Object.assign({ t: tick++, kind: kind }, obj)); }
function say(map, speaker, text) {
  if (!text) return;
  rec('say', { map: map, speaker: speaker || '', text: String(text).slice(0, 120) });
}

const scene = new global.XJScene(canvasStub);

// ---------------- 自动战斗 ----------------
function pickSkill(bv, b, u) {
  const sks = (u.skills && u.skills.spell) || [];
  // mp 够的最强攻击技（kindCode 0 攻击优先高 level），否则治疗/增益兜底
  let best = null;
  for (const sk of sks) {
    const cost = sk.costMp || 0;
    if (u.M < cost) continue;
    const atkKind = (sk.kindCode === 0 || sk.kindCode === 3);
    if (atkKind && (!best || (sk.level || 1) > (best.level || 1))) best = sk;
  }
  if (!best) {
    for (const sk of sks) {
      const cost = sk.costMp || 0;
      if (u.M < cost) continue;
      if (sk.kindCode === 1 && u.hpPct() < 0.7) { best = sk; break; }  // 血不健康先回
    }
  }
  if (!best) best = ((u.skills && u.skills.normal) || [])[0] ||
    { name: '攻击', formula: 'atk', kindCode: 0, all: false, level: 4, costMp: 0, costGas: 0 };
  return best;
}
function autoBattle() {
  const bv = scene.battleView, b = bv && bv.battle;
  if (!b) { breaks.push({ where: scene.mapName, what: '战斗对象为空' }); return 'empty'; }
  const key = b.key;
  cov.fights[key] = cov.fights[key] || { win: 0, lose: 0 };
  let n = 0;
  while (!b.checkOver() && n++ < 30000) {
    const r = b.tick();
    for (const u of r.began) {
      try { b.payMorph(u); } catch (e) {}
      if (u.side === 'hero') {
        // 血危嗑药
        let acted = false;
        if (u.hpPct() < 0.35) {
          try {
            const items = bv.battleItems ? bv.battleItems() : [];
            if (items.length && bv.useBattleItem) { bv.useBattleItem(u, items[0]); acted = true; }
          } catch (e) {}
        }
        if (!acted) {
          const sk = pickSkill(bv, b, u);
          const foes = b.foes.filter(x => !x.isDead());
          const tgt = sk.all ? (foes[0] || null) : (foes[0] || null);
          try { bv.heroAct(u, sk, tgt); } catch (e) {
            breaks.push({ where: scene.mapName, what: 'heroAct抛错', msg: String(e.message).slice(0, 100) });
            return 'error';
          }
        }
      } else {
        try { bv.monsterAct(u); } catch (e) {
          breaks.push({ where: scene.mapName, what: 'monsterAct抛错', msg: String(e.message).slice(0, 100) });
          return 'error';
        }
      }
    }
    for (const u of r.ended) { try { bv.unitAct(u); } catch (e) {} }
  }
  const over = b.checkOver();
  if (!over) { breaks.push({ where: scene.mapName, what: '战斗30000tick未结束 key=' + key }); return 'hang'; }
  try { bv.finish(over); } catch (e) {
    breaks.push({ where: scene.mapName, what: 'finish抛错', msg: String(e.message).slice(0, 100) });
    return 'error';
  }
  const res = over === 1 ? 'win' : 'lose';
  cov.fights[key][res]++;
  rec('fight', { map: scene.mapName, key: key, result: res,
    heroes: b.heroes.map(u => u.name + ':' + u.I + '/' + u.J).join(' ') });
  return res;
}

// ---------------- 推进一切（settle） ----------------
function drainTalk() {
  // scene.talk 由 interact 启动；分支则搬到 scene.branch
  let g = 0, still = 0, lastSig = '';
  while (scene.talk && scene.talk.active && g++ < 2000) {
    const st = scene.talk.state();
    if (st.branch) {
      cov.branches.push({ where: scene.mapName, npc: st.name || st.npcId,
        options: st.branch.options.map(o => o.label + '=>' + (o.file || '') + ':' + (o.line || '')) });
      rec('branch', { map: scene.mapName, npc: st.name || ('NPC' + st.npcId),
        pick: 0, options: st.branch.options.map(o => o.label) });
      scene.branch = { options: st.branch.options, sel: 0, fromTalk: true };
      return;  // 交给 settle 的 branch 分支处理（chooseBranch 走跳转）
    }
    if (st.trade) { scene.openShop(st.trade.items); return; }
    if (st.dialog) say(scene.mapName, st.dialog.speaker, st.dialog.text);
    const sig = st.page + ':' + st.pc + ':' + (st.dialog ? st.dialog.text : '') + ':' + (st.branch ? 'B' : '');
    if (sig === lastSig) {
      if (++still > 30) {
        breaks.push({ where: scene.mapName, what: '对话卡死无进展 npc=' + (st.name || st.npcId) + ' page=' + st.page + ' pc=' + st.pc });
        scene.talk = null; return;
      }
    } else { still = 0; lastSig = sig; }
    try { scene.interact(); } catch (e) {
      breaks.push({ where: scene.mapName, what: 'interact抛错', msg: String(e.message).slice(0, 120) });
      scene.talk = null; return;
    }
  }
  if (g >= 2000) breaks.push({ where: scene.mapName, what: '对话2000步未结束' });
}

function settle(tag) {
  let guard = 0;
  const hits = {};
  const hit = k => { hits[k] = (hits[k] || 0) + 1; };
  while (guard++ < 3000) {
    if (scene.inBattle) { hit('battle'); autoBattle(); continue; }
    if (scene.pendingBattle) {
      hit('pendingBattle');
      // ★ 战前 H2 暂停先播完（preBattle），否则开战；战后暂停由 endBattle 恢复
      let pg = 0;
      while (scene.pausedRunner && scene.pausedRunner.preBattle && pg++ < 500) {
        try { scene.resumeRunner(); } catch (e) { scene.pausedRunner = null; break; }
      }
      const key = scene.pendingBattle.key;
      scene.pendingBattle = null;
      rec('fightQ', { map: scene.mapName, key: key });
      try {
        if (!scene.startBattle(key, scene.mainLevel())) {
          breaks.push({ where: scene.mapName, what: '开战失败 key=' + key });
        }
      } catch (e) {
        breaks.push({ where: scene.mapName, what: '开战抛错 key=' + key, msg: String(e.message).slice(0, 120) });
      }
      continue;
    }
    if (scene.branch) {
      hit('branch');
      const op = scene.branch.options[0];
      cov.branches.push({ where: scene.mapName, npc: '(scene)',
        options: scene.branch.options.map(o => o.label + '=>' + (o.file || '') + ':' + (o.line || '')) });
      rec('branch', { map: scene.mapName, npc: '(scene)', pick: 0,
        options: scene.branch.options.map(o => o.label) });
      try { scene.chooseBranch(0); } catch (e) {
        breaks.push({ where: scene.mapName, what: 'chooseBranch抛错', msg: String(e.message).slice(0, 120) });
        scene.branch = null;
      }
      continue;
    }
    if (scene.talk && scene.talk.active) { hit('talk'); drainTalk(); continue; }
    if (scene.cut || (scene.cutQueue && scene.cutQueue.length)) {
      hit('cut');
      if (scene.cut) say(scene.mapName, scene.cut.speaker, scene.cut.text);
      scene.cut = null;
      try { scene.nextCut(); } catch (e) { scene.cutQueue = []; }
      continue;
    }
    if (scene.pausedRunner) {
      hit('paused');
      // 开战排队中且非战前暂停：先开战（战后自动恢复），否则自旋
      if (scene.pendingBattle && !scene.pausedRunner.preBattle) {
        const key = scene.pendingBattle.key;
        scene.pendingBattle = null;
        rec('fightQ', { map: scene.mapName, key: key });
        try {
          if (!scene.startBattle(key, scene.mainLevel())) {
            breaks.push({ where: scene.mapName, what: '开战失败 key=' + key });
          }
        } catch (e) {
          breaks.push({ where: scene.mapName, what: '开战抛错 key=' + key, msg: String(e.message).slice(0, 120) });
        }
        continue;
      }
      let acted = false;
      try { acted = scene.resumeRunner(); } catch (e) { scene.pausedRunner = null; acted = true; }
      if (acted === false) {
        breaks.push({ where: scene.mapName, what: 'pausedRunner无法恢复（战斗中/排队中）' });
        scene.pausedRunner = null;
      }
      continue;
    }
    if (scene.waitKeys) { hit('waitKeys'); scene.waitKeys = null; continue; }
    if (scene.world.countdown) {
      hit('countdown');
      const cd = scene.world.countdown;
      scene.world.countdown = null;
      rec('countdown', { map: scene.mapName, file: cd.file, line: cd.line });
      try {
        const rr = scene.world.runScriptEntry(cd.file, cd.line);
        scene.playExecTail(rr);
      } catch (e) { breaks.push({ where: scene.mapName, what: 'countdown执行抛错' }); }
      continue;
    }
    if (scene.shop && scene.shop.active) {
      hit('shop');
      const items = scene.shop.options ? scene.shop.options() : [];
      cov.shops.push({ where: scene.mapName, items: items.map(o => o.name) });
      rec('shop', { map: scene.mapName, items: items.map(o => o.name + '/' + o.price) });
      // 买得起的各买 1 件（任务道具不断档）
      for (let i = 0; i < items.length; i++) {
        scene.shop.sel = i;
        try { scene.shop.key('ok'); } catch (e) {}
      }
      try { scene.shop.key('cancel'); } catch (e) { scene.shop = null; }
      continue;
    }
    if (scene.feeMenu) {
      hit('fee');
      const rows = ((global.XJ.data.config.fee || {}).GotoFee) || [];
      if (!rows.length) {
        breaks.push({ where: scene.mapName, what: 'fee意图但GotoFee为空（菜单打不开）' });
        scene.feeMenu = null;
        continue;
      }
      for (let i = 0; i < rows.length; i++) {
        scene.feeMenu.sel = i;
        try { scene.feeKey('ok'); } catch (e) {}
      }
      scene.feeMenu = null;
      rec('fee', { map: scene.mapName, rows: rows.length });
      continue;
    }
    if (scene.menu) {
      hit('menu');
      breaks.push({ where: scene.mapName, what: '菜单意图出现（bot跳过）' });
      scene.menu = null; continue;
    }
    if (scene.moveQueue && scene.moveQueue.length) {
      hit('moveQ');
      const last = scene.moveQueue[scene.moveQueue.length - 1];
      scene.moveQueue = [];
      scene.px = last.x; scene.py = last.y;
      try { scene.checkZones(); } catch (e) {}
      continue;
    }
    if (scene.world.pendingChange) {
      hit('pendingChange');
      const c = scene.world.pendingChange;
      scene.world.pendingChange = null;
      rec('goto', { from: scene.mapName, to: c.map });
      try { scene.goto(c.map, c.x, c.y, c.dir, false); } catch (e) {
        breaks.push({ where: scene.mapName, what: 'goto抛错 to=' + c.map });
      }
      continue;
    }
    return;  // 无事可做：稳定
  }
  breaks.push({ where: scene.mapName, what: 'settle 3000步未收敛 tag=' + tag,
    msg: JSON.stringify(hits).slice(0, 300) });
}

// ---------------- 探索一张图 ----------------
function snapMarks() { return Object.keys(scene.world.events).filter(k => scene.world.events[k] === 1).length; }
function explore(map) {
  if (!scene.goto(map, undefined, undefined, undefined, true)) {
    breaks.push({ where: map, what: 'goto进图失败' });
    return;
  }
  settle('enter:' + map);
  cov.maps[map] = cov.maps[map] || { visits: 0, talks: 0, zones: 0 };
  cov.maps[map].visits++;
  rec('map', { map: map, title: scene.world.mapTitle });

  // 1) 触发区：传送中心点踩一遍（带脚本碰撞盒由 tryMove 触发，bot 另扫）
  for (const z of (scene.world.zones || [])) {
    const key = map + '@' + z.x + ',' + z.y;
    scene.px = z.x + Math.floor((z.w || 16) / 2);
    scene.py = z.y + Math.floor((z.h || 16) / 2);
    const before = snapMarks();
    try { scene.checkZones(); } catch (e) {
      breaks.push({ where: map, what: 'checkZones抛错', msg: String(e.message).slice(0, 100) });
      continue;
    }
    settle('zone:' + key);
    if (!cov.zones[key] && scene.mapName !== map) {
      // 切图了：记录并回来继续
      rec('goto', { from: map, to: scene.mapName });
      cov.zones[key] = 1;
      if (!scene.goto(map, undefined, undefined, undefined, true)) break;
      settle('back:' + map);
    } else if (scene.mapName === map) {
      cov.zones[key] = (cov.zones[key] || 0) + 1;
      if (snapMarks() !== before) rec('marks', { map: map, delta: 'zone', count: snapMarks() });
    } else {
      cov.zones[key] = 1;
      if (!scene.goto(map, undefined, undefined, undefined, true)) break;
      settle('back:' + map);
    }
  }
  if (scene.mapName !== map) scene.goto(map, undefined, undefined, undefined, true);

  // 2) NPC：逐个传到面前对话
  for (const e of (scene.world.elements || []).slice()) {
    if (!e || e.kind !== 'npc' || e.gone) continue;
    let def = null;
    try { def = T.npcDef(e.id); } catch (err) {}
    if (!def || !def.talk || !T.talkScript(e.id)) continue;
    const key = map + '#npc' + e.id;
    let talked = false;
    for (const dir of ['down', 'up', 'left', 'right']) {
      const off = { down: [0, 24], up: [0, -24], left: [-24, 0], right: [24, 0] }[dir];
      scene.px = e.x + off[0]; scene.py = e.y + off[1];
      scene.player.dir = dir === 'down' ? 'up' : dir === 'up' ? 'down' : dir === 'left' ? 'right' : 'left';
      const before = snapMarks();
      try { scene.interact(); } catch (err) {
        breaks.push({ where: map, what: 'interact抛错 npc=' + e.id });
        break;
      }
      if (scene.talk && scene.talk.active) {
        talked = true;
        cov.npcs[key] = cov.npcs[key] || { name: (def && def.name) || '', times: 0 };
        cov.npcs[key].times++;
        settle('npc:' + key);
        if (snapMarks() !== before) rec('marks', { map: map, delta: 'npc' + e.id, count: snapMarks() });
        break;
      }
      if (scene.mapName !== map) break;  // 对话导致切图
    }
    if (!talked) cov.npcs[key] = cov.npcs[key] || { name: (def && def.name) || '', times: 0 };
    if (scene.mapName !== map) { scene.goto(map, undefined, undefined, undefined, true); settle('back:' + map); }
  }

  // 3) 宝箱：传到旁边开
  for (const e of (scene.world.elements || []).slice()) {
    if (!e || e.kind !== 'box' || e.opened) continue;
    scene.px = e.x + 10; scene.py = e.y + 10;
    try { scene.interact(); } catch (err) {}
    settle('box:' + map + '#' + e.id);
  }

  // 4) 明怪：接触全打
  for (const e of (scene.world.elements || []).slice()) {
    if (!e || e.kind !== 'monster' || e.gone) continue;
    scene.px = e.x; scene.py = e.y;
    try { scene.touchMonsters(); } catch (err) {}
    settle('monster:' + map);
    if (scene.mapName !== map) { scene.goto(map, undefined, undefined, undefined, true); settle('back:' + map); }
  }
  cov.maps[map].done = true;
}

// ---------------- 主循环 ----------------
function worldSnap() {
  const w = scene.world;
  return {
    map: scene.mapName,
    marks: Object.keys(w.events).filter(k => w.events[k] === 1).sort().join(','),
    fees: Object.keys(w.fees).filter(k => w.fees[k]).sort().join(','),
    items: Object.keys(w.items || {}).sort().map(k => k + 'x' + w.items[k]).join(','),
    gold: w.gold, tasks: (w.tasks || []).join(','),
    members: (w.members || []).join(',')
  };
}

const allMaps = Object.keys(global.XJ.data.maps.maps).sort();
rec('boot', { maps: allMaps.length });
// 开机：锁妖塔六层（与浏览器一致）
scene.load('ms_syt_1');
settle('boot');
rec('booted', { map: scene.mapName });

let round = 0, lastSnap = '';
const t0 = Date.now();
while (round++ < 12) {
  for (const m of allMaps) {
    console.error('[%ds] round%d %s marks=%d fights=%d talks=%d',
      ((Date.now() - t0) / 1000) | 0, round, m,
      Object.keys(scene.world.events).filter(k => scene.world.events[k] === 1).length,
      script.filter(s => s.kind === 'fight').length,
      script.filter(s => s.kind === 'say').length);
    try { explore(m); } catch (e) {
      breaks.push({ where: m, what: 'explore抛错', msg: String(e && e.message).slice(0, 150) });
    }
  }
  const s = JSON.stringify(worldSnap());
  rec('round', { round: round, snap: s.slice(0, 200) });
  if (s === lastSnap) break;  // 收敛：整轮无变化
  lastSnap = s;
}

// 收尾统计
const w = scene.world;
cov.tasks = w.tasks || [];
cov.items = w.items || {};
cov.marks = w.events || {};
cov.fees = w.fees || {};
cov.gold = w.gold;
cov.rounds = round;
try {
  const P = global.XJParty;
  if (P) {
    const hs = P.heroes(w);
    cov.heroes = Object.keys(hs).map(k => {
      const h = hs[k];
      return h.name + ' Lv' + h.level + ' 精' + h.hp + ' 神' + h.mp + ' 好感' + h.feeling;
    });
  }
} catch (e) {}

fs.writeFileSync(path.join(OUT, '剧本.json'), JSON.stringify(script, null, 1));
fs.writeFileSync(path.join(OUT, '覆盖率.json'), JSON.stringify(cov, null, 1));
fs.writeFileSync(path.join(OUT, '断裂点.json'), JSON.stringify(breaks, null, 1));

// 控制台摘要
const says = script.filter(s => s.kind === 'say').length;
const fights = script.filter(s => s.kind === 'fight');
const branches = script.filter(s => s.kind === 'branch');
console.log('剧本条目', script.length, '对话', says, '战斗', fights.length,
  fights.map(f => f.key + ':' + f.result).join(' '),
  '分支', branches.length, '断裂', breaks.length);
console.log('到访图', Object.keys(cov.maps).length, 'NPC对话', Object.keys(cov.npcs).filter(k => cov.npcs[k].times).length,
  '触发区', Object.keys(cov.zones).length, '轮数', round);
console.log('标记', Object.keys(cov.marks).filter(k => cov.marks[k] === 1).length,
  '任务', (cov.tasks || []).length, '金', cov.gold);
if (breaks.length) {
  console.log('断裂点TOP:');
  breaks.slice(0, 30).forEach(b => console.log(' ', b.where, b.what, b.msg || ''));
}
