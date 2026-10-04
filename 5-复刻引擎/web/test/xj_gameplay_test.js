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
  w.build('ms_syt_1');
  const fx = w.applyStateEffects(w.takeEffects());
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
  w.build('ms_syt_1');
  const box = (w.elements || []).filter(e => e.kind === 'box' && e.id === 781)[0];
  ok(box && box.opened === true, '事件781已标记 → 宝箱显示开启');
}

// ============================================================ 3 剧情战斗意图
head('剧情战斗意图');
{
  const w = new W();
  w.build('cs_ss_d');
  const fx = w.applyStateEffects(w.takeEffects());
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
  w.build('ms_syt_1', 0, 0);
  ok(w.pendingChange && w.pendingChange.map === 'yw_syc', 'ms_syt_1 首条 change 生效：' + (w.pendingChange && w.pendingChange.map));
  const w2 = new W();
  w2.build('yw_syc', 0, 0, { skipChange: true });
  ok(!w2.pendingChange, 'warp 进 yw_syc 不再连锁切回');
  ok(w2.mapTitle === '渔村', '渔村标题：' + w2.mapTitle);
}

console.log('\n通过 ' + pass + ' / 失败 ' + fail);
if (fail) { console.log('失败项：' + failures.join(' | ')); process.exit(1); }
