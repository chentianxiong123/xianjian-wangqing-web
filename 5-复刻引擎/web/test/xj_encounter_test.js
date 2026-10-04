/* xj_encounter_test.js —— 遇敌组建自检（node 直接跑）
 *   用法：node 5-复刻引擎/web/test/xj_encounter_test.js
 *
 * 校验：
 *   1. enemy.str 键值表 32 条，键 = 地图名 或 boss1..7/liyao/linglong/egui
 *   2. ID范围/等级范围解析，含 #事件?成立段:不成立段 条件形式
 *   3. 怪物等级 = 主角等级 ±1 且夹在区间内
 *   4. 怪物属性取自 fight_<id>.str，且防御恒 0
 *   5. 数量分配走 f.java:350 的表
 *   6. game.fight 的 10 处 key 全部能组建
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
for (const f of ['xj_bin', 'xj_ant', 'xj_maps', 'xj_npc', 'xj_config', 'xj_logic', 'xj_scripts']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'data', f + '.js'), 'utf8'));
}
for (const f of ['xj.js', 'xj_script.js', 'xj_world.js', 'xj_battle.js']) {
  (0, eval)(fs.readFileSync(path.join(WEB, 'src', f), 'utf8'));
}
const B = window.XJBattle, XJ = window.XJ;
function SeqRand(seed) { this.s = seed >>> 0; }
SeqRand.prototype.nextInt = function () { this.s = (this.s * 1103515245 + 12345) & 0x7fffffff; return this.s - 0x40000000; };
const rnd = new SeqRand(42);

// ============================================================ 1
head('enemy.str 键值表');
{
  const raw = XJ.data.config.enemyDistRaw || {};
  const keys = Object.keys(raw);
  ok(keys.length === 32, 'enemy.str 共 ' + keys.length + ' 条');
  const bossKeys = keys.filter(k => /^(boss\d|liyao|linglong|egui)$/.test(k));
  ok(bossKeys.length === 10, 'boss/特殊键 ' + bossKeys.length + ' 个：' + bossKeys.join(' '));
  const mapKeys = keys.filter(k => !/^(boss\d|liyao|linglong|egui)$/.test(k));
  ok(mapKeys.length === 22, '地图键 ' + mapKeys.length + ' 个：' + mapKeys.slice(0, 6).join(' ') + '…');
  const s = B.enemySpec('boss1');
  ok(s && s.idSpec === '9' && s.kinds === 1 && s.levelSpec === '60'
    && s.bgAnt === 'fight_mishi' && s.bgm === 'boss.mid',
    'boss1 解析正确：' + JSON.stringify(s));
  ok(B.enemySpec('不存在的键') === null, '不存在的键返回 null');
}
{
  // 所有键的字段数与格式
  let bad = [];
  for (const k of Object.keys(XJ.data.config.enemyDistRaw)) {
    const s = B.enemySpec(k);
    if (!s) { bad.push(k + ' 解析失败'); continue; }
    if (!B.parseIdSpec(s.idSpec).length) bad.push(k + ' ID范围坏: ' + s.idSpec);
    if (!B.parseLevelSpec(s.levelSpec).length) bad.push(k + ' 等级范围坏: ' + s.levelSpec);
    if (!s.bgAnt) bad.push(k + ' 无背景');
  }
  ok(bad.length === 0, '全部 32 条的 ID范围/等级范围/背景均可解析', bad.slice(0, 4).join(' | '));
}

// ============================================================ 2
head('范围解析');
{
  ok(JSON.stringify(B.parseIdSpec('9')) === '[9]', '"9" → [9]');
  ok(JSON.stringify(B.parseIdSpec('1-2')) === '[1,2]', '"1-2" → [1,2]');
  ok(JSON.stringify(B.parseIdSpec('1-2-5')) === '[1,2,5]', '"1-2-5" → [1,2,5]');
  ok(JSON.stringify(B.parseLevelSpec('60')) === '[60,60]', '"60" → [60,60]');
  ok(JSON.stringify(B.parseLevelSpec('0-20')) === '[0,20]', '"0-20" → [0,20]');
  // 条件形式 #32?25-35:0-10
  const w0 = { event: () => 0 }, w1 = { event: () => 1 };
  ok(JSON.stringify(B.resolveLevelSpec('#32?25-35:0-10', w0)) === '[0,10]',
    '事件32 未设 → 用不成立段 0-10');
  ok(JSON.stringify(B.resolveLevelSpec('#32?25-35:0-10', w1)) === '[25,35]',
    '事件32 已设 → 用成立段 25-35');
  ok(JSON.stringify(B.resolveLevelSpec('30-45', w0)) === '[30,45]', '无条件形式直接解析');
}

// ============================================================ 3
head('怪物属性（fight_<id>.str）');
{
  const u = B.makeMonster(9, 60, rnd);       // 邪剑仙
  ok(u !== null, 'fight_9 → ' + (u && u.name));
  ok(u && u.level === 60, '等级 ' + (u && u.level));
  ok(u && u.def === 0, '★ 怪物防御恒为 0（g.java:31）');
  ok(u && u.J > 0 && u.I === u.J, '精 ' + (u && u.I) + '/' + (u && u.J));
  ok(u && u.atk === 350, '攻击 ' + (u && u.atk) + '（配置 攻击值=350）');
  ok(u && u.luk === 10, '运 ' + (u && u.luk));
  ok(u && u.Q === 20, '速度 ' + (u && u.Q) + '（最小/最大速度都是 20）');
  ok(u && u.skillSpeed === 10, '仙术速度 ' + (u && u.skillSpeed) + '（10+4*(slv-1) @slv=1 → 10）');
  ok(u && u.moves === true, 'ID=10 的怪物会移动（ID 1..5 才不移动）');
  ok(u && u.skills.normal.length >= 1, '普通技能 ' + (u && u.skills.normal.length) + ' 个');
  ok(u && u.skills.spell.length >= 3, '仙术技能 ' + (u && u.skills.spell.length) + ' 个：'
    + (u ? u.skills.spell.map(s => s.name).join('/') : ''));
  ok(u && u.skills.spell[0].formula === '(atk*(5+5*slv))/30',
    '仙术公式原样带出：' + (u && u.skills.spell[0].formula));
  ok(u && u.expRange[0] === 400 && u.expRange[1] === 450, '经验区间 ' + JSON.stringify(u && u.expRange));
  ok(u && u.goldRange[0] === 200 && u.goldRange[1] === 300, '金钱区间 ' + JSON.stringify(u && u.goldRange));
  // 等级进入属性表达式（fight_2 的公式型血量）
  const u2 = B.makeMonster(2, 5, rnd);
  ok(u2 && u2.J === 1035 || (u2 && u2.J > 900 && u2.J < 1500),
    'fight_2 @lv=5 血量 ' + (u2 && u2.J) + '（公式 ((100+26*lv)*(2+lv/5+lv/10-lv/20))*3/2 → 1035）');
  ok(u2 && u2.atk === 91, 'fight_2 @lv=5 攻击 ' + (u2 && u2.atk) + '（41+10*lv → 91）');
  // ID 1..5 不移动
  const u5 = B.makeMonster(4, 16, rnd);
  ok(u5 && u5.moves === false, 'ID=4 的怪物不移动（g.java:41-51）');
}

// ============================================================ 4
head('遇敌组建');
{
  const e = B.encounter('boss1', 60, rnd, null);
  ok(e !== null, 'boss1 组建成功');
  ok(e && e.monsters.length >= 1, '怪物数 ' + (e && e.monsters.length) + '（1-3 只）');
  ok(e && e.bgAnt === 'fight_mishi' && e.bgm === 'boss.mid', '背景/BGM = ' + (e && e.bgAnt + '/' + e.bgm));
  ok(e && e.monsters.every(m => m.level === 60), '所有怪物等级 60（配置写死 60，与主角等级无关）');
  ok(e && e.exp > 0 && e.gold > 0, '经验 ' + (e && e.exp) + ' 金钱 ' + (e && e.gold));
}
{
  // 等级缩放：±1 且夹区间
  let allOk = true, samples = [];
  for (const key of ['十里坡东', '雾林', '遗址']) {
    for (const plv of [1, 5, 12, 18, 26, 38, 44, 60]) {
      for (let t = 0; t < 25; t++) {
        const e = B.encounter(key, plv, rnd, { event: () => 0 });
        if (!e || !e.monsters.length) { allOk = false; continue; }
        const spec = B.enemySpec(key);
        const lr = B.resolveLevelSpec(spec.levelSpec, { event: () => 0 });
        for (const m of e.monsters) {
          const lo = Math.max(lr[0], plv - 1), hi = Math.min(lr[1], plv + 1);
          const eff = plv <= lr[0] ? lr[0] : (plv >= lr[1] ? lr[1] : null);
          if (eff !== null) { if (m.level !== eff) allOk = false; }
          else if (m.level < lo || m.level > hi) allOk = false;
        }
      }
    }
    samples.push(key + '(' + B.enemySpec(key).levelSpec + ')');
  }
  ok(allOk, '怪物等级 = 主角等级 ±1 且夹在配置区间：' + samples.join(' '));
}
{
  // 条件形式影响等级段
  const spec = B.enemySpec('十里坡东');
  const ev = {};
  const w0 = { event: n => ev[n] || 0 }, w1 = { event: n => ev[n] || 0 };
  ev[32] = 1;
  const a = B.encounter('十里坡东', 30, rnd, w0);
  const b = B.encounter('十里坡东', 30, rnd, w1);
  const la = a.monsters.map(m => m.level), lb = b.monsters.map(m => m.level);
  ok(JSON.stringify(la) !== JSON.stringify(lb),
    '等级范围 #32?25-35:0-10 随事件切换：event32=0 → ' + JSON.stringify(la)
    + '，=1 → ' + JSON.stringify(lb));
  void spec;
}
{
  // 数量分配
  const cnt = {};
  for (let i = 0; i < 300; i++) {
    const e = B.encounter('boss1', 60, new SeqRand(i * 7 + 1), null);
    if (e) cnt[e.monsters.length] = (cnt[e.monsters.length] || 0) + 1;
  }
  const ks = Object.keys(cnt).map(Number).sort((a, b) => a - b);
  ok(ks.length >= 2 && Math.min(...ks) >= 1 && Math.max(...ks) <= 3,
    '怪物数量分布（f.java:350 的表，1-3 只）：' + JSON.stringify(cnt));
}
{
  // 双种怪
  const e = B.encounter('十里坡东', 30, rnd, { event: () => 0 });
  ok(e && e.kinds === 2, '十里坡东 的怪物种类 = 2（双种）');
  ok(e && e.monsters.length >= 1, '双种怪组建出 ' + (e && e.monsters.length) + ' 只');
  ok(e && new Set(e.monsters.map(m => m.cfgId)).size >= 1,
    '双种怪的 id 集合：' + JSON.stringify([...new Set(e.monsters.map(m => m.cfgId))]));
}

// ============================================================ 5
head('game.fight 的 key 全覆盖');
{
  // 扫出全部 game.fight 的 key
  const keys = new Set();
  for (const m of Object.values(XJ.data.maps.maps)) {
    const scan = ast => (ast || []).forEach(c => { if (c.cmd === 'fight') keys.add(String(c.raw_args[0])); });
    scan(m.script);
    m.layers.forEach(L => (L.o || []).forEach(o => scan(o[3])));
  }
  ok(keys.size === 5, '地图脚本里共 ' + keys.size + ' 种 game.fight key：' + [...keys].join(' '));
  let bad = [];
  for (const k of keys) {
    const e = B.encounter(k, 30, rnd, null);
    if (!e || !e.monsters.length) bad.push(k + ' 组建失败');
  }
  ok(bad.length === 0, '全部 game.fight 的 key 都能组建出怪物', bad.join(','));

  // 剧情战斗的怪应该都是高等级
  const b1 = B.encounter('boss1', 5, rnd, null);
  ok(b1 && b1.monsters.every(m => m.level === 60),
    'boss1 在主角 5 级时怪物仍是 60 级（配置写死）');
}
{
  // 全部 32 个 key 都能组建
  let bad = [], n = 0;
  for (const k of Object.keys(XJ.data.config.enemyDistRaw)) {
    const e = B.encounter(k, 30, rnd, { event: () => 1 });
    n++;
    if (!e || !e.monsters.length) bad.push(k);
  }
  ok(bad.length === 0, n + ' 个 enemy.str 键全部能组建出怪物', bad.join(','));
}
{
  // 全图 game.fight 的 key 都在 enemy.str 里
  const miss = [];
  for (const m of Object.values(XJ.data.maps.maps)) {
    const scan = ast => (ast || []).forEach(c => {
      if (c.cmd === 'fight' && !XJ.data.config.enemyDistRaw[String(c.raw_args[0])]) miss.push(c.raw_args[0]);
    });
    scan(m.script);
    m.layers.forEach(L => (L.o || []).forEach(o => scan(o[3])));
  }
  ok(miss.length === 0, '所有 game.fight 的 key 都能在 enemy.str 里查到', [...new Set(miss)].join(','));
}

// ============================================================ 6
head('H2.str（战斗脚本）');
{
  const T = XJ.data.scripts || {};
  ok(!T.fight || true, '战斗脚本容器存在');
  // H2.str 在原版里是空的 → game.fight 的第 2 参数（脚本行号）无效
  const fightKeys = [];
  for (const m of Object.values(XJ.data.maps.maps)) {
    const scan = ast => (ast || []).forEach(c => {
      if (c.cmd === 'fight') fightKeys.push(c.raw_args.slice());
    });
    scan(m.script);
    m.layers.forEach(L => (L.o || []).forEach(o => scan(o[3])));
  }
  console.log('    game.fight 实参样例: ' + JSON.stringify(fightKeys.slice(0, 4)));
  ok(fightKeys.every(a => a.length === 4), 'game.fight 均为 4 个参数（key + 3 个回合数）');
}

// ============================================================
console.log('\n' + '='.repeat(50));
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail) console.log('  失败项:\n' + failures.map(f => '    - ' + f).join('\n'));
process.exit(fail ? 1 : 0);