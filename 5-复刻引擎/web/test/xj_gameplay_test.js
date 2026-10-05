/* xj_gameplay_test.js —— 世界落子/遭遇/技能执行/掉落（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_gameplay_test.js
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
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_party.js', 'xj_world.js', 'xj_battle.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const W = window.XJWorld, B = window.XJBattle, PT = window.XJParty, XS = window.XJScript;

function SeqRand(seed) { this.s = seed >>> 0; }
SeqRand.prototype.nextInt = function () { this.s = (this.s * 1103515245 + 12345) & 0x7fffffff; return this.s - 0x40000000; };

// ============================================================ 1 落子
head('地图脚本落子');
{
  const w = new W();
  w.buildFull('ms_syt_1');
  const fx = w.drainDeferred();
  ok(w.mapTitle === '锁妖塔六层', '地图中文名：' + w.mapTitle);
  const bgm = (fx.intents || []).filter(i => i.type === 'bgm');
  ok(bgm.length === 1 && bgm[0].file === 'ss', 'BGM ss：' + JSON.stringify(bgm[0]));
  ok(w.fly === false, 'setFlyEnabled(false)');
  const poss = (fx.intents || []).filter(i => i.type === 'playerPos');
  ok(poss.length >= 1, 'player.setPosition 落子 ' + poss.length + ' 条');
  // 触发区脚本的条件里 partner.feeling 用 | 分隔参数
  ok(XS.testConds(w, 'partner.feelingIsGreaterThan(0|40)') === false, '月瑶好感0 <40 → false');
  PT.addFeeling(w, 0, 50);
  ok(XS.testConds(w, 'partner.feelingIsGreaterThan(0|40)') === true, '月瑶好感50 >40 → true');
}

// ============================================================ 2 队友与宝箱事件
head('队友与宝箱事件');
{
  const w = new W();
  // 合成一条 partner.in 效果走落子（形状与 Interp.log 一致：data.raw）
  const fx = w.applyStateEffects([{ kind: 'partner.in', data: { raw: ['0', '2', '6'] } }]);
  ok(w.members.indexOf('liyiru') >= 0 && w.followers[0] === 2, 'partner.in(0,2)：月瑶入队+NCP2跟随');
  w.applyStateEffects([{ kind: 'partner.out', data: { raw: ['0', '2', '170', '250', '6'] } }]);
  ok(w.members.indexOf('liyiru') < 0 && w.followers[0] === undefined, 'partner.out(0)：离队+取消跟随');
  // 宝箱事件标记 → 开箱状态
  w.events[781] = 1;
  w.buildFull('ms_syt_1');
  const box = (w.elements || []).filter(e => e.kind === 'box' && e.id === 781)[0];
  ok(box && box.opened === true, '事件781已标记 → 宝箱显示开启');
}

// ============================================================ 3 剧情战斗意图
head('剧情战斗意图');
{
  // ★ 门控批（cs_ss_d#7：!401 && 3）：备好 mark 3 再进图，否则整批跳过
  const w = new W();
  w.events[3] = 1;
  w.buildFull('cs_ss_d');
  const fx = w.drainDeferred();
  const fights = (fx.intents || []).filter(i => i.type === 'fight');
  ok(fights.length >= 1 && fights[0].key === 'boss1', 'cs_ss_d 进图即战 boss1：' + JSON.stringify(fights.map(f => f.key)));
}

// ============================================================ 4 技能执行
head('技能执行（消耗/增益/治疗）');
{
  const b = new B.Battle({ rnd: new SeqRand(3) });
  const hero = new B.Unit({ side: 'hero', slot: 0, name: '重楼', hp: 246, maxHp: 246, mp: 24, maxMp: 24, gas: 9, maxGas: 9, atk: 176, def: 31, spd: 21, luk: 0, level: 1 });
  const foe = new B.Unit({ side: 'foe', slot: 0, name: '怪', hp: 500, maxHp: 500, atk: 50, def: 0, spd: 10, luk: 0, level: 16 });
  foe.S = 0; hero.S = 0;
  b.add(hero); b.add(foe);
  const msgs = [];
  const fx = { msg: s => { if (s) msgs.push(s); } };
  const ctx = { allies: [hero], foes: [foe] };
  // 炎咒：耗神12
  const fire = { name: '炎咒', formula: '(atk*(10+6*slv))/20', kindCode: 3, all: false, anim: '炎咒', costGas: 0, costMp: 12, level: 1 };
  const hp0 = foe.I;
  const r = b.execSkill(hero, fire, foe, ctx, fx);
  ok(r.ok && hero.M === 12, '炎咒耗神 24→12');
  ok(foe.I < hp0, '炎咒打掉血 ' + hp0 + '→' + foe.I);
  // 神不足
  hero.M = 5;
  const r2 = b.execSkill(hero, fire, foe, ctx, fx);
  ok(!r2.ok, '神不足放不出');
  hero.M = 24;
  // 天罡战气：单体武增
  const gas = { name: '天罡战气', formula: '0', kindCode: 2, all: false, gain: true, anim: '天罡战气', costGas: 0, costMp: 14, level: 1 };
  hero.M = 24;
  const r3 = b.execSkill(hero, gas, hero, ctx, fx);
  ok(r3.ok && hero.C > 0 && hero.D > 0, '天罡战气武增 ' + hero.C + ' 回合 ' + hero.D);
  // 五气连波：全体回精 200*1+400=600
  hero.I = 100;
  const heal = { name: '五气连波', formula: '400', kindCode: 1, all: true, gain: true, anim: '五气连波', costGas: 0, costMp: 26, level: 1 };
  hero.M = 30; hero.N = 100;
  const r4 = b.execSkill(hero, heal, hero, ctx, fx);
  ok(r4.ok && hero.I === 246, '五气连波回满 100→246（600 封顶）');
}

// ============================================================ 5 掉落与偷窃表
head('掉落与携带表');
{
  const drops = B.parseDropList('止血草(50),鼠儿果(50)');
  ok(drops.length === 2 && drops[0].pct === 50, '掉落表解析');
  const fake = { drops: 'a(100),b(100),c(100),d(100)' };
  const got = B.rollDrops([fake], { nextInt: () => 0 });
  ok(got.length === 3, '全中也最多 3 件：' + got.join(','));
  const enc = B.encounter('十里坡东', 5, new SeqRand(11), { event: () => 0 });
  ok(enc.monsters.length > 0 && enc.monsters[0].carryList.length > 0,
    '遭遇怪物带 carryList：' + JSON.stringify(enc.monsters[0].carryList));
}

// ============================================================ 6 切图不连锁
head('切图不连锁');
{
  // ms_syt_1(174)→yw_syc，yw_syc(197)→ms_syt_1：直接连锁会无限乒乓。
  // warp 进图跳过 change 行，第一条生效一次即停。
  const w = new W();
  w.buildFull('ms_syt_1', 0, 0);
  ok(w.pendingChange && w.pendingChange.map === 'yw_syc', 'ms_syt_1 首条 change 生效：' + (w.pendingChange && w.pendingChange.map));
  const w2 = new W();
  w2.buildFull('yw_syc', 0, 0, { skipChange: true });
  ok(!w2.pendingChange, 'warp 进 yw_syc 不再连锁切回');
  ok(w2.mapTitle === '渔村', '渔村标题：' + w2.mapTitle);
}

// ============================================================ 7 外部脚本行
head('外部脚本行（branch/倒计时）');
{
  // xuanze.str 条目 8：短对话批（给月瑶/给紫萱的后续之一）
  const w = new W();
  const r = w.runScriptEntryFull('xuanze.str', 8);
  ok(r && r.dialog && r.dialog.text, 'xuanze.str:8 执行出对话框：' + (r && r.dialog && String(r.dialog.text).slice(0, 18)));
  ok(r && r.dialogs && r.dialogs.length >= 1, '多段对话全部收集：' + (r && r.dialogs.length) + ' 段');
  const fx = w.drainDeferred();
  const kinds = (fx.intents || []).map(i => i.type);
  ok(kinds.indexOf('dlgShow') >= 0, '落子出 dlgShow：' + kinds.slice(0, 6).join(','));
  // 不存在的条目
  ok(w.runScriptEntry('xuanze.str', 999) === null, '不存在的条目返回 null');
  ok(w.runScriptEntry('不存在.str', 0) === null, '不存在的文件返回 null');
  // cs_sz_2 地图级 countdownTimer.setMillis(60000,xuanze.str,0)
  // ★ 在门控批内（cs_sz_2#10：2204 && !2205），备好前置标记
  const w2 = new W();
  w2.events[2204] = 1;
  w2.buildFull('cs_sz_2', 0, 0);
  const fx2 = w2.drainDeferred();
  const cd = (fx2.intents || []).filter(i => i.type === 'countdown')[0];
  ok(cd && cd.ms === 60000 && cd.file === 'xuanze.str' && cd.line === 0,
    '倒计时 60s→xuanze.str:0：' + JSON.stringify(cd));
  // npc.in(id, 延迟)：入场并跟随（e.java:2760 Y 槽登记）。
  // 注：数据里 3 处 map 级 npc.in 的目标 NPC 都不存在，原版同样空操作；
  // 这里用合成效果验证语义本身。
  const w3 = new W();
  w3.buildFull('yw_wl_2', 0, 0);
  w3.drainDeferred();
  ok(w3.findElement(31) !== null, 'yw_wl_2 有 NPC31');
  w3.applyStateEffects([{ kind: 'npc.in', data: { raw: ['31', '4'] } }]);
  ok(w3.findElement(31).follow === 4, 'npc.in(31,4) 让 NPC31 跟随：follow=' + w3.findElement(31).follow);
  w3.applyStateEffects([{ kind: 'npc.unbindPlayer', data: { raw: ['31'] } }]);
  ok(w3.findElement(31).follow === null, 'unbindPlayer 解除跟随');
}

// ============================================================ 8 未知指令集锁定
head('未知指令集锁定');
{
  // 全量扫描：解释器不认的指令必须恰好是已知忽略类
  // （拼写错误/解析残留/大小写敏感，原版同样静默丢弃）：
  //   scripr.break / npc.setAiAction / dialogBox.shoDialog /
  //   System.*（大写）/ setSequence(24,xs)（无命名空间）
  const XS2 = window.XJScript;
  const w0 = { expr: s => { try { return XS2.evalExpr(s, {}); } catch (e) { return 0; } },
    event: () => 0, fee: () => false, gold: () => 0, itemCount: () => 0, feeling: () => 0, partnerExists: () => false };
  const ip = new XS2.Interp(w0);
  const unk = {};
  function snap() { return ip.stats.unknownNs + ',' + ip.stats.unknownCmd; }
  function walk(cmds) {
    (cmds || []).forEach(c => {
      const a = snap();
      ip.step(Object.assign({}, c, { cond: null }));
      if (snap() !== a) { const k = (c.obj || 'undef') + '.' + (c.cmd || 'undef'); unk[k] = (unk[k] || 0) + 1; }
      if (c.nodes) walk(c.nodes);
      if (c.blocks) c.blocks.forEach(b => walk(b.nodes));
    });
  }
  const MM = window.XJ_MAPS.maps;
  for (const k of Object.keys(MM)) {
    const m = MM[k];
    walk(m.script);
    (m.layers || []).forEach(L => {
      (L.o || []).forEach(o => walk(o[3]));
      (L.r || []).forEach(r => walk(r.scriptAst));
      (L.g || []).forEach(g => walk(g.scriptAst));
    });
  }
  const keys = Object.keys(unk).sort();
  const allowed = ['System.showAsideInfo', 'System.showInfo', 'dialogBox.shoDialog',
    'npc.setAiAction', 'scripr.break', 'undef.undef'];
  const bad = keys.filter(k => allowed.indexOf(k) < 0);
  ok(bad.length === 0, '未知指令只有已知忽略类：' + keys.map(k => k + '×' + unk[k]).join(' '), bad.join(','));
  // ★ 数量锁定（jar 原始字节 grep 实数）：scripr 5 / shoDialog 1 / setAiAction 16 / 无命名空间残留 1
  ok((unk['scripr.break'] || 0) === 5 && (unk['dialogBox.shoDialog'] || 0) === 1 &&
     (unk['npc.setAiAction'] || 0) === 16 && (unk['undef.undef'] || 0) === 1,
    '忽略类数量精确：scripr×5 shoDialog×1 setAiAction×16 无命名空间×1');
}

// ============================================================ 9 变身
head('变身（魔尊真身 id7）');
{
  const b = new B.Battle({ rnd: new SeqRand(5) });
  const hero = new B.Unit({ side: 'hero', slot: 0, name: '重楼', hp: 246, maxHp: 246, mp: 24, maxMp: 24, gas: 20, maxGas: 20, atk: 176, def: 31, spd: 21, luk: 0, level: 1 });
  const foe = new B.Unit({ side: 'foe', slot: 0, name: '怪', hp: 500, maxHp: 500, atk: 50, def: 0, spd: 10, luk: 0, level: 16 });
  b.add(hero); b.add(foe);
  const msgs = [];
  const r = b.execSkill(hero,
    { id: 7, name: '魔尊真身', formula: 'atk', kindCode: 0, all: false, costGas: 10, costMp: 0, level: 1 },
    null, { allies: [hero], foes: [foe] }, { msg: s => { if (s) msgs.push(s); } });
  ok(r.ok && r.morph && hero.ac === true && hero.t === 9, '变身开：ac/t=9 [' + msgs.join(',') + ']');
  ok(hero.gas === 10, '变身扣气 20→10');
  // 变身伤害 ×3/5：打一发对比
  const b2 = new B.Battle({ rnd: new SeqRand(5) });
  const h2 = new B.Unit({ side: 'hero', slot: 0, name: '重楼', hp: 246, maxHp: 246, mp: 24, maxMp: 24, gas: 50, maxGas: 50, atk: 176, def: 31, spd: 21, luk: 0, level: 1 });
  const f2 = new B.Unit({ side: 'foe', slot: 0, name: '怪', hp: 5000, maxHp: 5000, atk: 50, def: 0, spd: 10, luk: 0, level: 16 });
  b2.add(h2); b2.add(f2);
  h2.ac = true;
  const atk = { name: '攻击', formula: 'atk', kindCode: 0, all: false, costGas: 0, costMp: 0, level: 4 };
  // 直接结算对比：取 resolveHit 两次（随机种子相同看比例≈0.6）
  const outs = [];
  for (let k = 0; k < 2; k++) {
    const bb = new B.Battle({ rnd: new SeqRand(77) });
    const hh = new B.Unit({ side: 'hero', slot: 0, name: 'h', hp: 500, maxHp: 500, mp: 0, maxMp: 1, gas: 0, maxGas: 1, atk: 176, def: 0, spd: 1, luk: -1000, level: 1 });
    const ff = new B.Unit({ side: 'foe', slot: 0, name: 'f', hp: 5000, maxHp: 5000, atk: 0, def: 0, spd: 1, luk: -1000, level: 1 });
    bb.add(hh); bb.add(ff);
    if (k === 1) hh.ac = true;
    const o = bb.resolveHit(hh, ff, 3, 0);
    outs.push(o.dmg);
  }
  ok(outs[1] === Math.floor(outs[0] * 3 / 5), '变身伤害×3/5：' + outs[0] + '→' + outs[1]);
}

// ============================================================ 10 Boss战开场
head('Boss战开场（H2.str）');
{
  // H2.str 有 7 条目：条目0=boss1开场+新手教程，条目3=第一次战斗教程
  const w = new W();
  const r = w.runScriptEntryFull('H2.str', 0);
  ok(r && r.dialogs && r.dialogs.length > 5, 'H2:0 开场对话 ' + (r && r.dialogs.length) + ' 段');
  ok(r.dialogs[0].speaker === '邪剑仙', '首句是邪剑仙：' + String(r.dialogs[0].text).slice(0, 18));
  ok(w.events[1] === 1, '开场 markEvent(1) 即时落子（后续批次可见）');
  const w3 = new W();
  const r3 = w3.runScriptEntryFull('H2.str', 3);
  ok(r3 && r3.dialogs && r3.dialogs.length > 3, 'H2:3 战斗教程 ' + (r3 && r3.dialogs.length) + ' 段');
  ok(/可恶|偷袭/.test(r3.dialogs[0].text), '首句是被偷袭：' + String(r3.dialogs[0].text).slice(0, 16));
}

// ============================================================ 11 开场顺序（防乱跳）
head('开机开场：81 段暂停、7 拍文本、顺序与 jar 一致');
{
  // ms_syt_1 开机脚本分 81 段播完（每段一 break/wait），文本 7 拍，末尾切 yw_syc。
  // 顺序即 jar 字节顺序；任一错位/丢失即红。
  const w = new W();
  w.build('ms_syt_1', 100, 100);
  const seq = [];
  let n = 0;
  while (n++ < 500) {
    const d = w.drainDeferred();
    for (const it of (d.intents || [])) {
      if (it.type === 'dlgText') seq.push('D:' + String(it.text).slice(0, 12));
      else if (it.type === 'subtitle' && it.text) seq.push('S:' + String(it.text).slice(0, 12));
    }
    if (!w.pausedBuild) break;
    w.continueBuild();
  }
  ok(n === 81, '开场分 81 段（暂停点全在）');
  // ★ 第 7 拍是 jar 原文 game.black(null)：全数据唯一一处字面 null。
  //   原版 e.java:3026 把 null 直接进 drawString 会 NPE 崩溃 —— 真机不崩 ⇒ 原版必有空
  //   guard ⇒ 那一拍是"无文本黑屏"（节奏/按键保留），不显示 "null" 四个字母。
  //   按熵增原则（编译不可逆，我们看不到那个 guard），取"游戏能跑"这一侧。
  const want = ['S:不老不死', 'D:/紫萱/：这就是', 'D:/紫萱/：苍生为重', 'D:/紫萱/：青儿', 'D:/紫萱/：重楼', 'S:重楼耗尽魔力'];
  ok(seq.length === want.length && seq.every((s, i) => s.indexOf(want[i]) === 0),
    '文本顺序与 jar 一致（black(null) 按原版空 guard → 空拍不落字）：' + seq.join(' → '));
  ok(seq.filter(s => /null/i.test(s)).length === 0, '无任何 "null" 字样漏到屏幕');
  ok(w.pendingChange && w.pendingChange.map === 'yw_syc', '末尾切往 yw_syc');
}

// ============================================================ 12 主线标记图（防主线断裂）
head('事件标记：生产/消费闭合，孤儿标记锁死');
{
  // 全量 AST 扫 markEvent/markFee（生产）与 eventMarked（消费）。
  // 孤儿（只消费不生产）= 原版废弃内容：47-50/411/412 门控 ms_ylk_3/5 的 NPC 出场，
  // jar 里无任何生产者——原版里这些 NPC 同样永不出现，如实复刻。
  const maps = window.XJ_MAPS.maps;
  const prod = {}, cons = {};
  function scan(nodes) {
    for (const c of (nodes || [])) {
      const raw = (c.raw || '') + ' ' + JSON.stringify(c.cond || '');
      let m;
      const re1 = /(markEvent|markFee)\((\d+)\)/g;
      while ((m = re1.exec(raw))) { const k = parseInt(m[2], 10); prod[k] = (prod[k] || 0) + 1; }
      const re2 = /eventMarked\((\d+)\)/g;
      while ((m = re2.exec(raw))) { const k = parseInt(m[1], 10); cons[k] = (cons[k] || 0) + 1; }
    }
  }
  for (const mn of Object.keys(maps)) {
    const m = maps[mn];
    scan(m.script);
    for (const L of m.layers) {
      for (const o of (L.o || [])) scan(o[3]);
      for (const r of (L.r || [])) scan(r.scriptAst);
    }
  }
  const S = window.XJ_SCRIPTS;
  for (const bk of Object.keys(S.talk || {})) for (const b of (S.talk[bk].blocks || [])) scan(b.nodes);
  for (const bk of Object.keys(S['其他'] || {})) for (const b of ((S['其他'][bk] || {}).blocks || [])) scan(b.nodes);
  const all = [...new Set([...Object.keys(prod), ...Object.keys(cons)])].map(Number);
  ok(all.length >= 125 && all.length <= 140, '标记总数 ' + all.length + '（130 左右，漂移即查）');
  const orphans = all.filter(k => !prod[k]).sort((a, b) => a - b);
  ok(JSON.stringify(orphans) === JSON.stringify([47, 48, 49, 50, 411, 412]),
    '孤儿标记 = 47/48/49/50/411/412（原版废弃，多一个少一个都红）', orphans.join(','));
}

console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
