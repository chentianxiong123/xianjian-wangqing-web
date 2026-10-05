/* xj_plot_extract.js —— 静态剧本抽取器（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_plot_extract.js [outdir]
 *
 *  不进浏览器、不模拟战斗 tick、不肉眼看：用解释器原语义机（XJScript.Interp）
 *  符号执行全部脚本，分支全展开（状态分叉），战斗只记录不模拟（奖励按配置近似入账并标注）。
 *  产物（4-文档/通关报告/）：
 *    剧本.json    —— say/branch/fight/goto/shop/fee/subtitle… 按故事顺序
 *    覆盖率.json  —— 到访图/talk块/触发区/战斗/商店/分支选项
 *    卡点.json    —— 缺失引用/未知指令/不可达主线/近似假设
 */
'use strict';
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..');
const OUT = process.argv[2] || '/mnt/shared/仙剑奇侠传忘情篇-逆向工程/4-文档/通关报告';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

global.window = global;
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_battle.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const XS = window.XJScript, B = window.XJBattle, PT = window.XJParty;
const PARTNER_ROLE = { 0: 'liyiru', 1: 'zixuan' };
function SeqRand(seed) { this.s = seed >>> 0; }
SeqRand.prototype.nextInt = function () { this.s = (this.s * 1103515245 + 12345) & 0x7fffffff; return this.s - 0x40000000; };

const maps = window.XJ_MAPS.maps;
const S = window.XJ_SCRIPTS;
const npcPlace = (window.XJ_NPC && (window.XJ_NPC.placement || window.XJ_NPC.total)) || null;

const script = [];
const cov = { maps: {}, talkBlocks: {}, zones: {}, fights: {}, shops: [], branches: [], h2: {} };
const gaps = [];
let seq = 0, steps = 0;
const MAX_STEPS = 1000000;
const T0 = Date.now();
function rec(kind, obj) { script.push(Object.assign({ seq: seq++, kind: kind }, obj)); }
function gap(what, where, extra) {
  gaps.push({ what: what, where: where || '', extra: (extra || '').slice(0, 160) });
}

function newState() {
  return { marks: {}, fees: {}, items: {}, gold: 0, party: ['chonglou'], feeling: {}, tasks: [] };
}
function cloneState(st) { return JSON.parse(JSON.stringify(st)); }
function H(st) {
  const m = Object.keys(st.marks).filter(k => st.marks[k]).sort().join(',');
  const f = Object.keys(st.fees).filter(k => st.fees[k]).sort().join(',');
  const it = Object.keys(st.items).sort().map(k => k + 'x' + st.items[k]).join(',');
  // ★ 任务按集合哈希；任务本身移出 H（条件系统无任务函数，纯显示；firstTask替换语义会导致状态抖动不收敛）
  const t = '';
  return [m, f, it, st.gold, st.party.slice().sort().join(','), t].join('|');
}
function fakeW(st) {
  return {
    mapName: () => st.map || '',
    expr: s => { try { return XS.evalExpr(s, {}); } catch (e) { return 0; } },
    event: n => (st.marks[n] ? 1 : 0),
    fee: n => !!st.fees[n],
    gold: () => st.gold,
    itemCount: n => st.items[n] || 0,
    feeling: n => st.feeling[n] || 0,
    partnerExists: n => st.party.indexOf(PARTNER_ROLE[n] || n) >= 0
  };
}
function condTrue(cond, st) {
  if (cond == null) return true;
  try { return XS.testConds(fakeW(st), cond); }
  catch (e) { gap('条件求值抛错', st.map, JSON.stringify(cond).slice(0, 120)); return false; }
}

// 战斗奖励近似入账（不模拟 tick；等级视为足够并标注假设；每键只入账一次，保证状态收敛）
const rewarded = new Set();
function fightRewards(key, st, where) {
  rec('fight', { map: where, key: key, note: '假设胜利/等级足够（静态近似）' });
  cov.fights[key] = (cov.fights[key] || 0) + 1;
  if (rewarded.has('fight:' + key)) return;
  rewarded.add('fight:' + key);
  try {
    const enc = B.encounter(key, 45, new SeqRand(7), { event: () => 0 });
    if (!enc || !enc.monsters.length) { gap('战斗组建空', where, key); return; }
    st.gold += enc.gold || 0;
    let drops = [];
    try { drops = B.rollDrops(enc.monsters, new SeqRand(9)) || []; } catch (e) {}
    drops.slice(0, 3).forEach(n => { st.items[n] = (st.items[n] || 0) + 1; });
    script[script.length - 1].gold = enc.gold || 0;
    script[script.length - 1].drops = drops.slice(0, 3);
  } catch (e) { gap('战斗奖励计算抛错', where, key + ':' + String(e.message).slice(0, 80)); }
}

const visited = new Set();
function seen(k) { if (visited.has(k)) return true; visited.add(k); return false; }
// 递归深度追踪（定位无限递归链）
let depth = 0;
const trail = [];
function pushTrail(s) {
  depth++; trail.push(s);
  if (trail.length > 25) trail.shift();
  if (depth === 120) {
    try { fs.writeFileSync('/tmp/opencode/deepchain.txt', trail.join('\n') + '\n'); } catch (e) {}
  }
  if (depth > 2000) {
    throw new Error('STOP:DEEPCHAIN ' + trail.join(' > ').slice(0, 500));
  }
}
function popTrail() { depth--; }

// 条目查找（talk 与 其他）
function findBlock(file, entry) {
  const base = String(file || '').replace(/\.str$/i, '');
  const book = (S.talk && S.talk[base]) || (S['其他'] && S['其他'][base]) || null;
  if (!book) return { err: '无此脚本书:' + file };
  const want = parseInt(entry, 10);
  for (const b of (book.blocks || [])) {
    if (parseInt(b.entry, 10) === want) return { block: b };
  }
  return { err: '无此条目:' + file + '#' + entry };
}

function walkEntry(file, entry, st, ctx) {
  const r = findBlock(file, entry);
  if (r.err) { gap(r.err, ctx, file + '#' + entry); return; }
  if (r.block.cond && !condTrue(r.block.cond, st)) return;
  const id = 'entry:' + file + '#' + entry + '|' + H(st);
  if (seen(id)) return;
  pushTrail('E:' + file + '#' + entry);
  try {
    cov.talkBlocks[file + '#' + entry] = (cov.talkBlocks[file + '#' + entry] || 0) + 1;
    walkNodes(r.block.nodes || [], st, ctx + '>' + file + '#' + entry);
  } finally { popTrail(); }
}

// NPC 在本图的谈话：xj_npc.js 放置表（npcs[id].maps / .talk），逐块按 Dialog 页顺序走
function walkNpcTalks(map, st) {
  const P = window.XJ_NPC || {};
  const all = (P.npcs || {});
  const ids = Object.keys(all).filter(id => {
    const ms = all[id].maps || [];
    return ms.indexOf(map) >= 0 || ms.indexOf(map + '.map') >= 0;
  });
  if (!ids.length) return;  // 本图无 NPC
  for (const id of ids) {
    const t = all[id].talk;
    if (!t) continue;
    const base = String(t).replace(/\.str$/i, '');
    const book = S.talk && S.talk[base];
    if (!book) { gap('NPC谈话书缺失（原版jar无此书）', map, 'npc' + id + '->' + t); continue; }
    for (const b of (book.blocks || [])) {
      if (b.cond && !condTrue(b.cond, st)) continue;
      const bid = 'npcblk:' + base + '#' + (b.entry != null ? b.entry : '?') + '|' + H(st);
      if (seen(bid)) continue;
      cov.talkBlocks[base + '#' + (b.entry != null ? b.entry : '?')] =
        (cov.talkBlocks[base + '#' + (b.entry != null ? b.entry : '?')] || 0) + 1;
      walkNodes(b.nodes || [], st, 'npc' + id + '(' + (all[id].name || '') + '):' + base);
    }
  }
}

function walkNodes(nodes, st, ctx) {
  pushTrail('N:' + ctx.slice(0, 40));
  try {
    walkNodesInner(nodes, st, ctx);
  } finally { popTrail(); }
}
function walkNodesInner(nodes, st, ctx) {
  const ip = new XS.Interp(fakeW(st));
  const work = (ast) => {
    ip.runAll(ast, (cmd, ran) => { if (cmd) onCmd(cmd, !!ran, st, ctx); });
    ip.drainPauses(() => {});
    // drainPauses 里的 onStep 没挂——暂停段内的效果会漏！改用手动循环：
  };
  // 手动跑（含暂停段落的效果收集）：runAll + 循环 resume
  const runFull = (ast) => {
    ip.runAll(ast, (cmd, ran) => { if (cmd) onCmd(cmd, !!ran, st, ctx); });
    let n = 0;
    while (ip.paused && n++ < 100000) {
      const p = ip.paused;
      rec('beat', { map: st.map, ctx: ctx });
      ip.paused = null;
      ip.runAll(p.nodes, (cmd, ran) => { if (cmd) onCmd(cmd, !!ran, st, ctx); }, p.pc);
    }
  };
  runFull(nodes);
  void work;
}

function onCmd(cmd, ran, st, ctx) {
  if (++steps > MAX_STEPS) throw new Error('STOP:MAX_STEPS');
  if (!ran) return;
  const a = cmd.raw_args || [];
  const S0 = i => a[i];
  const E0 = i => { const v = parseInt(a[i], 10); return isNaN(v) ? 0 : v; };
  const key = (cmd.obj || '') + '.' + (cmd.cmd || '');
  switch (key) {
    case 'dialogBox.setText': {
      const d0 = (cmd.args || [])[0] || {};
      rec('say', { map: st.map, ctx: ctx, speaker: d0.speaker || '', text: String(d0.value != null ? d0.value : S0(0)).slice(0, 140) });
      return;
    }
    case 'dialogBox.showDialog': case 'dialogBox.hideDialog':
    case 'script.break': case 'script.wait': case 'game.waitForKey':
      return;  // 节奏点（beat 已在暂停处记）
    case 'game.black': case 'game.verse':
      rec('sub', { map: st.map, ctx: ctx, mode: cmd.cmd, text: String(S0(0)).slice(0, 140) });
      return;
    case 'system.showInfo':
      rec('info', { map: st.map, text: String(S0(0)).slice(0, 120) });
      return;
    case 'system.showAsideInfo':
      rec('info', { map: st.map, text: '[旁白] ' + a.slice(0, 3).join(' ').slice(0, 120) });
      return;
    case 'game.markEvent': st.marks[E0(0)] = 1; return;
    case 'game.unmarkEvent': st.marks[E0(0)] = 0; return;
    case 'system.markFee': st.fees[E0(0)] = true; return;
    case 'system.unmarkFee': st.fees[E0(0)] = false; return;
    // 直接 grant（addItem/addGold）：原版重进图会重复刷，静态只入账一次保证收敛
    case 'player.addItem': {
      const gk = 'grant:' + ctx + '|addItem|' + S0(0);
      if (!rewarded.has(gk)) {
        rewarded.add(gk);
        st.items[S0(0)] = (st.items[S0(0)] || 0) + (a.length > 1 ? E0(1) : 1);
      }
      return;
    }
    case 'player.addGold': {
      const gk = 'grant:' + ctx + '|addGold';
      if (!rewarded.has(gk)) { rewarded.add(gk); st.gold = Math.max(0, st.gold + E0(0)); }
      return;
    }
    case 'player.removeItem': st.items[S0(0)] = Math.max(0, (st.items[S0(0)] || 0) - (a.length > 1 ? E0(1) : 1)); return;
    case 'player.reduceGold': st.gold = Math.max(0, st.gold - E0(0)); return;
    case 'player.setGold': st.gold = Math.max(0, E0(0)); return;
    case 'player.task': case 'player.firstTask': {
      // ★ e.java:2646：task 空表垫"无"再追；firstTask 非空替换第0项（与 xj_talk/xj_world 一致）
      const nm = String(S0(0));
      if (cmd.cmd === 'firstTask') {
        if (st.tasks.length) st.tasks[0] = nm;
        else st.tasks.push(nm);
        rec('task', { map: st.map, name: nm, how: 'first' });
      } else {
        if (st.tasks.length) { if (st.tasks.indexOf(nm) < 0) { st.tasks.push(nm); rec('task', { map: st.map, name: nm }); } }
        else { st.tasks.push('无'); st.tasks.push(nm); rec('task', { map: st.map, name: nm, how: 'pad无' }); }
      }
      return;
    }
    case 'player.removeTask': {
      const i = st.tasks.indexOf(String(S0(0)));
      if (i >= 0) st.tasks.splice(i, 1);
      return;
    }
    case 'partner.in': {
      const role = PARTNER_ROLE[parseInt(S0(0), 10)];
      if (role && st.party.indexOf(role) < 0) { st.party.push(role); rec('party', { map: st.map, join: role }); }
      return;
    }
    case 'partner.out': {
      const role = PARTNER_ROLE[parseInt(S0(0), 10)];
      st.party = st.party.filter(k => k !== role);
      if (!st.party.length) st.party = ['chonglou'];
      rec('party', { map: st.map, leave: role });
      return;
    }
    case 'partner.addFeeling': case 'partner.reduceFeeling': {
      const pid = parseInt(S0(0), 10) || 0;
      const d = cmd.cmd === 'partner.addFeeling' ? E0(1) : -E0(1);
      st.feeling[pid] = Math.max(0, Math.min(100, (st.feeling[pid] || 0) + d));
      return;
    }
    case 'game.fight': {
      const fkey = String(S0(0));
      const t1 = E0(1);
      if (t1 >= 0) {
        const hid = 'h2:' + t1 + '|' + H(st);
        if (!seen(hid)) {
          cov.h2[t1] = (cov.h2[t1] || 0) + 1;
          walkEntry('H2.str', t1, st, ctx + '>H2:' + t1);
        }
      }
      fightRewards(fkey, st, st.map);
      return;
    }
    case 'world.change': {
      let tm = String(S0(0)).replace(/\.map$/i, '');
      if (!maps[tm]) { gap('切图目标不存在', st.map, tm); return; }
      rec('goto', { from: st.map, to: tm, ctx: ctx });
      const id = 'map:' + tm + '|' + H(st);
      if (seen(id)) return;
      enterMap(tm, st, true);  // warp：跳 change
      return;  // 原版 change 后续脚本不再执行——调用方 runAll 已 break；跨层 nodes 不再跟
    }
    case 'game.branch': {
      const opts = [
        { label: String(a[0]), file: String(a[1]), line: String(a[2]) },
        { label: String(a[3]), file: String(a[4]), line: String(a[5]) }
      ];
      rec('branch', { map: st.map, ctx: ctx, options: opts.map(o => o.label + '=>' + o.file + '#' + o.line) });
      cov.branches.push({ where: st.map + ' ' + ctx, options: opts.map(o => o.label + '=>' + o.file + '#' + o.line) });
      // DFS 双展开（状态分叉）：两选项都从分支前快照 fork，互不污染，走完再并回
      const pre = cloneState(st);
      for (const o of opts) {
        const st2 = cloneState(pre);
        const id = 'br:' + o.file + '#' + o.line + '|' + H(st2);
        if (seen(id)) continue;
        walkEntry(o.file, o.line, st2, ctx + '>branch:' + o.label);
        mergeBack(st, st2);
      }
      return;
    }
    case 'script.include': {
      walkEntry(String(S0(0)), E0(1), st, ctx + '>include');
      return;
    }
    case 'countdownTimer.setMillis': {
      const f = String(a[1] || ''), ln = String(a[2] || '0');
      rec('countdown', { map: st.map, file: f, line: ln });
      walkEntry(f, ln, st, ctx + '>countdown');
      return;
    }
    case 'system.trade': {
      const items = String(S0(0) || '').split('|').filter(Boolean);
      cov.shops.push({ where: st.map + ' ' + ctx, items: items });
      rec('shop', { map: st.map, items: items });
      // 每店只买一次（全局，保证收敛）：买得起的各买 1 件
      const shk = 'shop:' + st.map + ' ' + ctx + '|' + items.join(',');
      if (rewarded.has(shk)) return;
      rewarded.add(shk);
      try {
        const cfg = window.XJ_CONFIG;
        const rows = (cfg.items && cfg.items.rows) || cfg.items || [];
        for (const nm of items) {
          const r = (Array.isArray(rows) ? rows : []).filter(x => x['名称'] === nm)[0];
          const price = r ? parseInt(r['价格'], 10) : NaN;
          if (!isNaN(price) && st.gold >= price) {
            st.gold -= price;
            st.items[nm] = (st.items[nm] || 0) + 1;
          } else if (isNaN(price)) {
            gap('商店价格未找到，跳过购买', st.map, nm);
          }
        }
      } catch (e) {}
      return;
    }
    case 'game.showFee': {
      rec('fee', { map: st.map, note: '全激活（复刻免费）' });
      for (let i = 0; i <= 10; i++) st.fees[i] = true;
      return;
    }
    case 'game.showMenu': case 'system.returnToMainMenu': {
      rec(key === 'game.showMenu' ? 'menu' : 'END', { map: st.map, ctx: ctx });
      return;
    }
    case 'element.addToNpc': {
      // NPC 出场（id 登记，谈话由 walkNpcTalks 统一展开）
      (st._npcs = st._npcs || {})[E0(0)] = 1;
      return;
    }
    case 'element.addToMonster': {
      rec('明怪', { map: st.map, id: String(S0(0)) });
      // 明怪奖励按本图遭遇近似一次（标注假设；全局一次，保证收敛）
      const mk = 'mob:' + st.map;
      if (!rewarded.has(mk)) {
        rewarded.add(mk);
        try {
          const title = (maps[st.map] && maps[st.map].title) || '';
          if (title && B.enemySpec(title)) {
            const enc = B.encounter(title, 45, new SeqRand(13), { event: () => 0 });
            if (enc && enc.monsters.length) {
              st.gold += enc.gold || 0;
              rec('fight', { map: st.map, key: '(明怪)' + title, gold: enc.gold || 0, note: '假设踩中一次（静态近似）' });
            }
          }
        } catch (e) {}
      }
      return;
    }
    case 'element.addToTreasureBox': {
      rec('box', { map: st.map, id: E0(0) });
      const bk = 'box:' + st.map + '#' + E0(0);
      if (!rewarded.has(bk)) {
        rewarded.add(bk);
        try {
          const got = PT.rollTreasure(null);
          if (got) st.items[got] = (st.items[got] || 0) + 1;
        } catch (e) {}
      }
      return;
    }
    default: {
      // AST 级忽略：演出/渲染/镜头/移动类（剧情无影响）；拼写错误类静默（gameplay §8 已锁数）
      const NS_IGNORE = /^(dialogBox|script|player|npc|element|camera|midi|guide|user|item|fee|world|system|partner|countdownTimer|dialog)\./;
      if (NS_IGNORE.test(key)) {
        // 其中会改状态的已在上面 case 处理；其余忽略。但记录一次出现以备查（采样，不刷屏）：
        return;
      }
      if (/^(scripr\.|dialogBox\.shoDialog|npc\.setAiAction|System\.|undef\.)/.test(key) || key === 'undef.undef') return;
      // game.* 演出类（状态无关，已有语义实现的不在此列）
      if (/^game\.(showNpc|showPlayer|showMonster|hideMonster|clear|gray|flicker|vibrate|dropRock|dropRockClear|waitForKey)$/.test(key)) return;
      gap('未知指令', st.map + ' ' + ctx, key);
      return;
    }
  }
}

function mergeBack(dst, src) {
  // 分支走完：把新拿到的 marks/items/tasks 并回主状态（任一分支的进展都保留；冲突取并集）
  for (const k of Object.keys(src.marks)) if (src.marks[k]) dst.marks[k] = 1;
  for (const k of Object.keys(src.fees)) if (src.fees[k]) dst.fees[k] = true;
  for (const k of Object.keys(src.items)) dst.items[k] = Math.max(dst.items[k] || 0, src.items[k] || 0);
  for (const t of src.tasks) if (dst.tasks.indexOf(t) < 0) dst.tasks.push(t);
  for (const p of src.party) if (dst.party.indexOf(p) < 0) dst.party.push(p);
  dst.gold = Math.max(dst.gold, src.gold);
}

function enterMap(map, st, isWarp) {
  pushTrail('M:' + map);
  try {
    enterMapInner(map, st, isWarp);
  } finally { popTrail(); }
}
function enterMapInner(map, st, isWarp) {
  st.map = map;
  cov.maps[map] = cov.maps[map] || { visits: 0 };
  cov.maps[map].visits++;
  if (visitOrder.indexOf(map) < 0) visitOrder.push(map);
  const m = maps[map];
  // ★ warp 进图跳过 change 行（与 World.build skipChange 一致，防乒乓；gameplay §6）
  let mscript = m.script || [];
  if (isWarp) mscript = mscript.filter(c => !(c.obj === 'world' && c.cmd === 'change'));
  // 地图脚本
  walkNodes(mscript, st, 'map:' + map);
  // 触发区（r）+ 带脚本碰撞盒（g）
  for (const L of (m.layers || [])) {
    for (const r of (L.r || [])) {
      if (!r.scriptAst || !r.scriptAst.length) continue;
      const id = 'zone:' + map + '@' + r.x + ',' + r.y + '|' + H(st);
      if (seen(id)) continue;
      cov.zones[map + '@' + r.x + ',' + r.y] = 1;
      walkNodes(r.scriptAst, st, 'zone:' + map);
    }
    for (const g of (L.g || [])) {
      if (!g.scriptAst || !g.scriptAst.length) continue;
      const id = 'solid:' + map + '@' + g.x + ',' + g.y + '|' + H(st);
      if (seen(id)) continue;
      walkNodes(g.scriptAst, st, 'solid:' + map);
    }
    // 对象脚本（NPC/怪/箱装配）
    for (const o of (L.o || [])) {
      if (!o[3] || !o[3].length) continue;
      const id = 'obj:' + map + '#' + o[0] + '|' + H(st);
      if (seen(id)) continue;
      walkNodes(o[3], st, 'obj:' + map);
    }
  }
  // NPC 谈话展开
  walkNpcTalks(map, st);
}

// ---------------- 主入口 ----------------
let finalState = null;
const visitOrder = [];
try {
  const st = newState();
  finalState = st;
  rec('boot', { maps: Object.keys(maps).length });
  // Round 0：处女状态扫全部 NPC 谈话（!mark 类早期台词只在无标记时可见，单时间线会漏）
  {
    const st0 = newState();
    st0.map = '(sweep0)';
    for (const m of Object.keys(maps).sort()) walkNpcTalks(m, st0);
    rec('sweep0done', {});
  }
  enterMap('ms_syt_1', st, false);  // 开机直读：全脚本（含首条 change）
  // 没自然到达的图：逐个直达展开（warp 可达性已另锁 69/69）
  for (const m of Object.keys(maps).sort()) {
    if (!cov.maps[m]) {
      const id = 'map:' + m + '|' + H(st);
      if (!seen(id)) {
        const st2 = cloneState(st);
        enterMap(m, st2, true);
        mergeBack(st, st2);
      }
    }
  }
} catch (e) {
  gap('抽取中断', '', String(e.message).slice(0, 200) + ' // ' + String(e.stack || '').split('\n').slice(1, 14).join(' <- ').slice(0, 600));
}

// 开场 81 暂停交叉验证（gameplay §11：World 侧 81 段；此处数 beat）
const bootBeats = script.filter(s => s.kind === 'beat' && s.ctx === 'map:ms_syt_1').length;

fs.writeFileSync(path.join(OUT, '剧本.json'), JSON.stringify(script, null, 1));
fs.writeFileSync(path.join(OUT, '覆盖率.json'), JSON.stringify({
  maps: cov.maps, talkBlocks: cov.talkBlocks, zones: cov.zones, fights: cov.fights,
  shops: cov.shops, branches: cov.branches, h2: cov.h2,
  finalMarks: finalState ? Object.keys(finalState.marks).filter(k => finalState.marks[k]).map(Number).sort((a, b) => a - b) : [],
  finalItems: finalState ? finalState.items : {},
  finalTasks: finalState ? finalState.tasks : [],
  finalParty: finalState ? finalState.party : [],
  finalGold: finalState ? finalState.gold : 0,
  visitOrder: visitOrder
}, null, 1));
fs.writeFileSync(path.join(OUT, '卡点.json'), JSON.stringify(gaps, null, 1));

const says = script.filter(s => s.kind === 'say');
console.log('条目', script.length, '对话', says.length, '开场beat', bootBeats,
  '战斗', Object.keys(cov.fights).map(k => k + 'x' + cov.fights[k]).join(' '));
console.log('到访图', Object.keys(cov.maps).length, 'talk块', Object.keys(cov.talkBlocks).length,
  '触发区', Object.keys(cov.zones).length, '分支点', cov.branches.length,
  '商店', cov.shops.length, '卡点', gaps.length, '步数', steps);
const byWhat = {};
gaps.forEach(g => { byWhat[g.what] = (byWhat[g.what] || 0) + 1; });
console.log('卡点分类:', JSON.stringify(byWhat).slice(0, 800));
console.log('去重访问点', visited.size, '用时', (((Date.now() - T0) / 1000) | 0) + 's');
