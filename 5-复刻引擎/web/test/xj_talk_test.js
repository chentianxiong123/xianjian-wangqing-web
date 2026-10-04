/* xj_talk_test.js —— NPC 对话系统自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_talk_test.js
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
/** 有内容的对话：脚本存在且至少 1 个块（空 talk_2/16/17/19 视为无对话） */
function hasDialog(id) {
  const sc = window.XJTalk.talkScript(+id);
  return !!(sc && (sc.blocks || []).length);
}
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_world.js', 'xj_talk.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const T = window.XJTalk, W = window.XJWorld;

// ============================================================ 1
head('NPC 定义与对话文件绑定');
{
  const withTalk = Object.keys(window.XJ_NPC.npcs).filter(k => window.XJ_NPC.npcs[k].talk);
  ok(withTalk.length === 34, '34 个 NPC 绑定了对话文件（修复聚合 bug 前只有 17）');
  // ★ 其中 7 个引用的 talk_N.str 在原版 jar 里从未被打包 → 原版缺陷，这些 NPC 是哑的
  const usable = withTalk.filter(k => hasDialog(k));       // 有内容
  const empty = withTalk.filter(k => T.talkScript(k) && !hasDialog(k));  // 文件在但是空的
  const broken = withTalk.filter(k => !T.talkScript(k));   // 原版未打包
  ok(usable.length === 23 && empty.length === 4 && broken.length === 7,
    '34 个绑定 = 23 有内容 + 4 空文件 + 7 原版未打包 = ' + (usable.length + empty.length + broken.length));
  console.log('    空文件: ' + empty.map(k => window.XJ_NPC.npcs[k].name + '→' + window.XJ_NPC.npcs[k].talk).join(' '));
  console.log('    未打包: ' + broken.map(k => window.XJ_NPC.npcs[k].name + '→' + window.XJ_NPC.npcs[k].talk).join(' '));
  let bad = [];
  for (const k of usable) {
    const d = T.npcDef(k);
    if (!d) { bad.push(k + ' 取不到定义'); continue; }
    if (!window.XJ_ANT.ants[String(d.ant || '').replace(/\.ant$/i, '')]) bad.push(k + ' ANT ' + d.ant + ' 不存在');
  }
  ok(bad.length === 0, '全部可用 NPC 的 ANT 均可取到', bad.slice(0, 4).join(' | '));
  const named = usable.filter(k => window.XJ_NPC.npcs[k].name);
  ok(named.length === usable.length, '全部可用 NPC 都有名字');
}
{
  let noRegions = [];
  for (const k of Object.keys(window.XJ_NPC.npcs)) {
    const d = T.npcDef(k);
    if (d && d.talk && !(d.dialogRegions || []).length) noRegions.push(k);
  }
  ok(noRegions.length === 0, '所有带对话的 NPC 都有 dialogRegions（4 个方向矩形）',
    noRegions.join(','));
  const d14 = T.npcDef(14);
  ok(d14.dialogRegions.length === 4, 'NPC 14 有 4 个方向的对话区域');
  const dirs = d14.dialogRegions.map(r => r.dir).sort().join(',');
  ok(dirs === 'down,left,right,up', '四个方向齐全：' + dirs);
}

// ============================================================ 2
head('对话区域判定');
{
  const d = T.npcDef(14);
  const nx = 300, ny = 200;
  // up 区域 {dx:-13, dy:8, w:27, h:7} → 绝对矩形 (287,208,27,7)
  const up = d.dialogRegions.find(r => r.dir === 'up');
  const ax = nx + up.dx, ay = ny + up.dy;
  // 脚点 = (px+8, py+14)，要落在 [ax,ax+w) × [ay,ay+h)
  // 取矩形正中，再反解出 px / py
  const fxWant = ax + Math.floor(up.w / 2);
  const fyWant = ay + Math.floor(up.h / 2);
  const px = fxWant - 8, py = fyWant - 14;
  const fy = py + 14;
  ok(fy >= ay && fy < ay + up.h && px + 8 >= ax && px + 8 < ax + up.w,
    '构造的坐标确实落在 up 区域内（脚点 ' + (px + 8) + ',' + fy + ' ⊂ 矩形 '
    + ax + ',' + ay + ' ' + up.w + '×' + up.h + '）');
  ok(T.inDialogRegion(px, py, nx, ny, 'up', d) === true, '朝向 up 时判定命中');
  ok(T.inDialogRegion(px, py, nx, ny, 'left', d) === true,
    '朝向不符时兜底仍命中（区域无 dir 限制时）');
  ok(T.inDialogRegion(nx + 500, ny + 500, nx, ny, 'up', d) === false, '远处不命中');
  ok(T.inDialogRegion(px, py, nx, ny, 'up', { dialogRegions: [] }) === false, '无区域定义时不命中');
}

// ============================================================ 3
head('对话执行：蜀山弟子(talk_14)');
{
  const w = new W();
  w.build('cs_ss_by', 300, 300);
  // 手工放一个 NPC 14
  w.elements.push({ kind: 'npc', id: 14, ant: 'npc_14', anim: 0, x: 300, y: 300,
                    state: '站立', dir: 'down', velocity: 0, ai: true,
                    showFace: true, portrait: null, t: 0 });
  const dlg = new T.Dialog(w, 14);
  const started = dlg.start();
  ok(started, '对话启动成功');
  const s0 = dlg.state();
  ok(s0.dialog !== null, '首屏已有对话框文本');
  ok(s0.waiting === true, '挂在 script.break 上等按键（waiting=true）');
  ok(s0.dialog.speaker === '蜀山弟子', '说话人 = ' + s0.dialog.speaker);
  ok(s0.dialog.text.length > 0, '文本：' + String(s0.dialog.text).slice(0, 30) + '…');
  console.log('    第 1 页：' + s0.dialog.speaker + '：' + s0.dialog.text);

  dlg.advance();
  const s1 = dlg.state();
  ok(s1.page > s0.page || s1.finished, '按键后推进到下一页（page ' + s0.page + '→' + s1.page + '）');
  if (s1.dialog) console.log('    第 2 页：' + s1.dialog.speaker + '：' + s1.dialog.text);

  // 一路按到底
  let guard = 0, pages = 0;
  while (dlg.active && guard++ < 60) {
    const st = dlg.state();
    if (st.dialog && pages !== st.page) { pages = st.page; }
    if (st.branch || st.trade) break;
    if (!dlg.advance()) break;
  }
  ok(dlg.finished === true || dlg.branch !== null || dlg.trade !== null,
    '对话可推进到结束（按 ' + guard + ' 次，finished=' + dlg.finished + '）');
  ok(pages >= 1, '至少走过 2 页（最高 page=' + pages + '）');
}
{
  // 全部 17 个对话都能跑完不抛错
  const all = Object.keys(window.XJ_NPC.npcs).filter(k => window.XJ_NPC.npcs[k].talk);
  const withTalk = all.filter(k => hasDialog(k));
  const broken = all.filter(k => !T.talkScript(k));
  let errs = [], ran = 0, totalPages = 0;
  // 缺失脚本的 NPC 必须「安静地没有对话」而不是抛错（原版加载失败即无对话）
  let brokenOk = true;
  for (const k of broken.concat(all.filter(k => !hasDialog(k)))) {
    const w0 = new W();
    const d0 = new T.Dialog(w0, +k);
    let threw = false, started = true;
    try { started = d0.start(); } catch (e) { threw = true; }
    if (threw || started) brokenOk = false;
  }
  ok(brokenOk, broken.length + ' 个缺失脚本的 NPC 安静返回「无对话」而不抛错（忠实原版行为）');
  for (const k of withTalk) {
    try {
      const w = new W();
      w.elements.push({ kind: 'npc', id: +k, ant: 'npc_1', anim: 0, x: 0, y: 0,
                        state: '站立', dir: 'down', ai: true, showFace: true, t: 0 });
      const d = new T.Dialog(w, +k);
      if (!d.start()) { errs.push(k + ' 启动失败'); continue; }
      let g = 0;
      while (d.active && g++ < 80) {
        const st = d.state();
        if (st.branch) { d.choose(0); continue; }
        if (st.trade) break;
        if (!d.advance()) break;
      }
      ran++; totalPages += d.page + 1;
    } catch (e) { errs.push(k + ': ' + e.message); }
  }
  ok(errs.length === 0, withTalk.length + ' 个有内容的对话全部可执行无异常',
    errs.slice(0, 4).join(' | '));
  console.log('    累计走过 ' + totalPages + ' 页');
}

// ============================================================ 4
head('对话中的条件与副作用');
{
  const withTalk = Object.keys(window.XJ_NPC.npcs).filter(k => hasDialog(k));
  let condBlocks = 0, effKinds = {}, trades = 0, branches = 0;
  for (const k of withTalk) {
    const sc = T.talkScript(+k);
    if (!sc) continue;
    for (const b of (sc.blocks || [])) {
      if (b.cond) condBlocks++;
      for (const n of (b.nodes || [])) {
        const key = n.obj + '.' + n.cmd;
        effKinds[key] = (effKinds[key] || 0) + 1;
        if (n.cmd === 'trade') trades++;
        if (n.cmd === 'branch') branches++;
      }
    }
  }
  ok(condBlocks > 0, '对话块里有 ' + condBlocks + ' 个带条件的块');
  ok(trades > 0, 'system.trade 出现 ' + trades + ' 次（商店）');
  ok(branches > 0, 'game.branch 出现 ' + branches + ' 次（分支选择）');
  console.log('    指令分布: ' + Object.entries(effKinds)
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + '×' + v).join(' '));
}
{
  // 事件标记应真的写进 World
  // 挑一个含 game.markEvent 的对话，并记下是哪个块
  const withTalk = Object.keys(window.XJ_NPC.npcs).filter(k => hasDialog(k));
  let markId = null, markBlock = null;
  for (const k of withTalk) {
    const sc = T.talkScript(+k);
    const bi = sc ? sc.blocks.findIndex(b => (b.nodes || []).some(n => n.cmd === 'markEvent')) : -1;
    if (bi >= 0) { markId = +k; markBlock = sc.blocks[bi]; break; }
  }
  const w = new W();
  w.elements.push({ kind: 'npc', id: markId, ant: 'npc_1', anim: 0, x: 0, y: 0,
                    state: '站立', dir: 'down', ai: true, showFace: true, t: 0 });
  // markEvent 在条件块里，条件形如 !eventMarked(9),eventMarked(8)：
  // 只按【含 markEvent 的那一个块】的条件来设置 ——
  // eventMarked 的事件置 1，!eventMarked 的事件置 0。
  // （若把全部块的条件都设一遍，后面的块会覆盖前面的，导致目标块反而进不去）
  if (markBlock && markBlock.cond && markBlock.cond.terms) {
    markBlock.cond.terms.forEach(t => {
      if (t.fn === 'eventMarked' && t.args[0].type === 'int')
        w.events[t.args[0].value] = t.neg ? 0 : 1;
    });
  }
  // 数「已置位的事件」，而不是键数（事件 9 虽存在但值为 0）
  const setCount = () => Object.keys(w.events).filter(k => w.events[k] === 1).length;
  const before = setCount();
  const d = new T.Dialog(w, markId);
  d.start();
  let g = 0;
  while (d.active && g++ < 80) { if (d.branch) d.choose(0); else if (!d.advance()) break; }
  const after = setCount();
  ok(markId !== null && after > before,
    'NPC ' + markId + ' 的对话在条件 [' + (markBlock && markBlock.cond ? markBlock.cond.raw : '')
    + '] 满足后把事件标记 ' + before + ' → ' + after + ' 写入 World');
}
{
  // 商店：trade 产生 trade 状态
  let found = null;
  const withTalk = Object.keys(window.XJ_NPC.npcs).filter(k => hasDialog(k));
  for (const k of withTalk) {
    const sc = T.talkScript(+k);
    if (sc && sc.blocks.some(b => (b.nodes || []).some(n => n.cmd === 'trade'))) { found = +k; break; }
  }
  ok(found !== null, '找到含商店的 NPC：id=' + found);
  if (found !== null) {
    const w = new W();
    w.elements.push({ kind: 'npc', id: found, ant: 'npc_1', anim: 0, x: 0, y: 0,
                      state: '站立', dir: 'down', ai: true, showFace: true, t: 0 });
    const d = new T.Dialog(w, found);
    d.start();
    let g = 0;
    while (d.active && g++ < 80 && !d.trade) { if (d.branch) d.choose(0); else if (!d.advance()) break; }
    ok(d.trade !== null && Array.isArray(d.trade.items) && d.trade.items.length > 0,
      '商店触发，商品 ' + (d.trade ? d.trade.items.length : 0) + ' 项：'
      + (d.trade ? d.trade.items.slice(0, 4).join('/') : ''));
  }
}

// ============================================================ 5
head('facingNpc');
{
  const w = new W();
  w.build('cs_ss_by', 300, 300);
  // 放两个 NPC，一个有对话一个没有
  w.elements.push({ kind: 'npc', id: 14, ant: 'npc_14', anim: 0, x: 300, y: 300,
                    state: '站立', dir: 'down', ai: true, showFace: true, t: 0 });
  w.elements.push({ kind: 'npc', id: 1, ant: 'npc_1', anim: 0, x: 380, y: 300,
                    state: '站立', dir: 'down', ai: true, showFace: true, t: 0 });
  const d = T.npcDef(14);
  const up = d.dialogRegions.find(r => r.dir === 'up');
  // 把玩家放到 NPC 正上方的对话区里
  const px = 300 + up.dx + 4, py = 300 + up.dy + 2 - 14;
  const got = T.facingNpc.call({ world: w }, px, py, 'up');
  ok(got && String(got.id) === '14', 'facingNpc 找到 NPC 14（无对话的 NPC 1 被正确跳过）');
  const got2 = T.facingNpc.call({ world: w }, 900, 900, 'up');
  ok(got2 === null, '远离时不返回任何 NPC');
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);