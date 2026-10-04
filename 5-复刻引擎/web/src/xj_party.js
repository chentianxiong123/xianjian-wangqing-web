/* xj_party.js —— 队伍 / 成长 / 物品效果 / 装备 / 合成
 *
 * 全部对应反编译源码，不内嵌数值：
 *   角色基础与成长公式：XJ_CONFIG.roles（config_chonglou/liyiru/zixuan.str）
 *   装备加成：bj.B()/C()/D()/E() —— 武=ΣQ[4] 防=ΣQ[5] 速=ΣQ[7] 运=ΣQ[6]
 *     （bj.java:567-789；i.f()=Q[4] i.g()=Q[5] i.j()=Q[7] i.k()=Q[6]）
 *   升级：bj.g(int) —— 经验>=所需则清零、等级+1（全恢复）、余数递归；
 *     45 级上限除非 fee 500（bj.java:364-397；f.java:1076）
 *   技能消耗：ax.c(8) —— 普通技扣气 af.j，玩家仙术扣神 af.k（ax.java:377-391）
 *     产物 XJ_LOGIC 的 cost神/cost气 标签与源码字段是错位的，这里按源码语义使用：
 *     普通技 costGas=af.j（产物 cost神列），仙术 costMp=af.k（产物 cost气列）
 *   技能等级：玩家取存档 uses 折算（bj.b: <5→1 <15→2 <30→3 否则4；bj.java:313-325）；
 *     普通攻击强制 4、变身强制 5（bd.java:73）；怪物 (H+20)/20 且 H 恒 1（g.java:139/26）
 *   物品效果文本：player.addhp/addgod/againlife/setnone/addspeed/addluck/addlove
 *     （止血草 addhp(400)、鼠儿果 addgod(30) 等，见 config_item.str 效果文本列）
 *   宝箱掉落：config_game.str 宝箱物品列的累积权重随机（system/d.java:142-157,554-564）
 *   队友 id：partner.in/out 的 0=月瑶 1=紫萱（e.java:2786-2799 按 aq[1]/aq[2] 落好感）
 */
(function (global) {
  'use strict';
  var XJ = global.XJ, XS = global.XJScript;

  var ROLE_ORDER = ['chonglou', 'liyiru', 'zixuan'];
  var PARTNER_ROLE = { 0: 'liyiru', 1: 'zixuan' };
  var KIND_CODE = { '普通': 0, '水系': 1, '雷系': 2, '火系': 3, '风系': 4, '土系': 5, '双系': 6 };
  var LEVEL_CAP = 45;

  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? (d || 0) : n; }

  // ------------------------------------------------------------ 技能表
  function kindCodeOf(sk) {
    if (!sk) return 7;
    if (typeof sk.kindCode === 'number') return sk.kindCode;
    if (KIND_CODE[sk.kindCode] != null) return KIND_CODE[sk.kindCode];
    return 7;
  }

  /** 按名取玩家技能，并按源码语义归一化 kindCode 与消耗 */
  function skillByName(name) {
    var list = (XJ.data.logic.skillFormulas || {}).player || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) {
        var sk = list[i];
        var kc = kindCodeOf(sk);
        return {
          id: sk.index, name: sk.name, kindCode: kc,
          attackType: sk.attackType, gain: !!sk.gain, all: !!sk.allTargets,
          anim: sk.anim, formula: sk.formula, desc: sk.desc,
          // ★ ax.c(8)：普通技扣气 af.j，玩家仙术扣神 af.k
          costGas: kc === 0 ? num(sk['cost神'], 0) : 0,
          costMp: kc === 0 ? 0 : num(sk['cost气'], 0)
        };
      }
    }
    return null;
  }

  function usesToSlv(uses) {
    uses = uses || 0;
    return uses < 5 ? 1 : (uses < 15 ? 2 : (uses < 30 ? 3 : 4));
  }

  // ------------------------------------------------------------ 角色
  function roleCfg(role) { return (XJ.data.config.roles || {})[role] || null; }

  function evalRole(role, key, vars) {
    var cfg = roleCfg(role);
    if (!cfg || !cfg.formulas || !cfg.formulas[key]) return 0;
    try { return new XS.Expr(vars).eval(cfg.formulas[key].expr) | 0; }
    catch (e) { return 0; }
  }

  function itemRow(name) {
    var rows = ((XJ.data.config.items || {}).rows) || [];
    for (var i = 0; i < rows.length; i++) if (rows[i]['名称'] === name) return rows[i];
    return null;
  }

  /** 装备加成 Σ（bj.B/C/D/E） */
  function equipBonus(hero) {
    var b = { atk: 0, def: 0, spd: 0, luk: 0 };
    if (!hero || !hero.equip) return b;
    ['weapon', 'armor', 'head', 'foot', 'acc'].forEach(function (slot) {
      var r = itemRow(hero.equip[slot]);
      if (!r) return;
      b.atk += num(r['属性4']);   // i.f()
      b.def += num(r['属性5']);   // i.g()
      b.luk += num(r['属性6']);   // i.k()
      b.spd += num(r['属性7']);   // i.j()
    });
    return b;
  }

  function splitList(s) {
    return String(s || '').split(',').map(function (x) { return x.trim(); })
      .filter(function (x) { return x && x !== '无'; });
  }

  /** 新建英雄记录（bj 构造器语义：满血满神满气出场） */
  function newHero(role) {
    var cfg = roleCfg(role);
    if (!cfg) return null;
    var sc = cfg.scalars || {};
    var arts = {};
    splitList(sc['初始仙术']).forEach(function (n) { arts[n] = { learned: true, uses: 0 }; });
    return {
      role: role, name: sc['名字'] || role,
      level: num(sc['初始等级'], 1), exp: num(sc['初始经验'], 0),
      hp: 0, mp: 0, gas: 0,
      feeling: num(sc['好感度'], 0),
      equip: {
        weapon: normEquip(sc['初始武器']), armor: normEquip(sc['初始服饰']),
        head: normEquip(sc['初始头饰']), foot: normEquip(sc['初始足饰']),
        acc: normEquip(sc['初始饰品'])
      },
      normalSkills: splitList(sc['初始技能']),
      arts: arts,
      ailments: { frozen: false, dot: null, counter: false }
    };
  }
  function normEquip(n) { return (!n || n === '无') ? null : n; }

  /** 按公式重算并钳制（bj.a 语义；升级时全恢复由调用方处理） */
  function statsOf(hero) {
    var lv = hero.level;
    var b = equipBonus(hero);
    var maxHp = Math.max(1, evalRole(hero.role, '最大生命值', { lv: lv }));
    var maxMp = Math.max(1, evalRole(hero.role, '最大神值', { lv: lv }));
    var maxGas = Math.max(1, evalRole(hero.role, '最大气值', { lv: lv }));
    var atk = Math.max(0, evalRole(hero.role, '武', { lv: lv }) + b.atk);
    var def = evalRole(hero.role, '防', { lv: lv }) + b.def;
    var cfg = roleCfg(hero.role);
    var baseSpd = cfg ? num(cfg.scalars['速'], 0) : 0;
    var baseLuk = cfg ? num(cfg.scalars['运'], 0) : 0;
    return {
      maxHp: maxHp, maxMp: maxMp, maxGas: maxGas,
      atk: atk, def: def, spd: Math.max(0, baseSpd + b.spd), luk: baseLuk + b.luk,
      needExp: Math.max(1, evalRole(hero.role, '升级所需经验', { lv: lv }))
    };
  }

  function clampHero(hero) {
    var st = statsOf(hero);
    hero.hp = Math.max(0, Math.min(hero.hp, st.maxHp));
    hero.mp = Math.max(0, Math.min(hero.mp, st.maxMp));
    hero.gas = Math.max(0, Math.min(hero.gas, st.maxGas));
    return st;
  }

  function fullRestore(hero) {
    var st = statsOf(hero);
    hero.hp = st.maxHp; hero.mp = st.maxMp; hero.gas = st.maxGas;
    hero.ailments = { frozen: false, dot: null, counter: false };
    return st;
  }

  // ------------------------------------------------------------ World 接入
  function heroes(world) { return world.heroes || (world.heroes = {}); }

  /** 开局建队：重楼 + 初始金钱/物品（bj 只给重楼配初始物品） */
  function initParty(world) {
    var hs = heroes(world);
    if (!hs.chonglou) {
      hs.chonglou = newHero('chonglou');
      fullRestore(hs.chonglou);
      var cfg = roleCfg('chonglou');
      if (world.gold == null || world.gold === 0) world.gold = num(cfg.scalars['初始金钱'], 0);
      splitList(cfg.scalars['初始物品']).forEach(function (n) { world.addItem(n, 1); });
    }
    if (!world.members || !world.members.length) world.members = ['chonglou'];
    return world;
  }

  function heroByName(world, name) {
    var hs = heroes(world);
    for (var k in hs) if (hs[k] && hs[k].name === name) return hs[k];
    return null;
  }

  function activeHeroes(world) {
    var hs = heroes(world), out = [];
    (world.members || ['chonglou']).forEach(function (key) {
      var h = hs[key] || heroByName(world, key);
      if (h) out.push(h);
    });
    return out;
  }

  /** partner id → 角色（0=月瑶 1=紫萱）；入队即建记录 */
  function partnerIn(world, pid) {
    var role = PARTNER_ROLE[pid];
    if (!role) return null;
    var hs = heroes(world);
    if (!hs[role]) { hs[role] = newHero(role); fullRestore(hs[role]); }
    if ((world.members || []).indexOf(role) < 0) world.members.push(role);
    return hs[role];
  }

  function partnerOut(world, pid) {
    var role = PARTNER_ROLE[pid];
    if (!role) return;
    world.members = (world.members || []).filter(function (k) { return k !== role; });
    if (!world.members.length) world.members = ['chonglou'];
  }

  /** 好感（e.addFeeling：钳制 0..100；id 0→月瑶 1→紫萱） */
  function addFeeling(world, pid, n) {
    var role = PARTNER_ROLE[pid];
    if (!role) return 0;
    var hs = heroes(world);
    if (!hs[role]) { hs[role] = newHero(role); fullRestore(hs[role]); }
    hs[role].feeling = Math.max(0, Math.min(100, hs[role].feeling + n));
    world.party[hs[role].name] = hs[role].feeling;
    return hs[role].feeling;
  }

  // ------------------------------------------------------------ 升级
  /** bj.g(exp)：满则清零升级（全恢复）余数递归；45 级封顶除非 fee 500 */
  function addExp(world, hero, n) {
    var res = { leveled: false, levels: 0, capped: false };
    var st = statsOf(hero);
    var total = hero.exp + n;
    while (total >= st.needExp) {
      var canLevel = hero.level < LEVEL_CAP || (world.fees && world.fees[500]);
      if (!canLevel) { hero.exp = st.needExp; res.capped = true; return res; }
      total -= st.needExp;
      hero.level += 1;
      hero.exp = 0;
      fullRestore(hero);
      res.leveled = true; res.levels++;
      st = statsOf(hero);
    }
    hero.exp = total;
    return res;
  }

  function levelUp(world, hero, n) {
    for (var i = 0; i < (n || 1); i++) {
      hero.level += 1;
      hero.exp = 0;
      fullRestore(hero);
    }
    return hero.level;
  }

  // ------------------------------------------------------------ 技能学习
  /** startArtSkill：开通指定仙术（e.java:2704） */
  function learnArt(world, heroName, skillName) {
    var h = heroByName(world, heroName) || heroes(world)[heroName];
    if (!h || !skillByName(skillName)) return false;
    if (!h.arts[skillName]) h.arts[skillName] = { learned: false, uses: 0 };
    h.arts[skillName].learned = true;
    return true;
  }

  /** startSkill：魔尊真身开通用（e.java:2665-2676，其余技能走仙术表） */
  function learnSkill(world, heroName, skillName) {
    var h = heroByName(world, heroName) || heroes(world)[heroName];
    if (!h) return false;
    if (skillName === '魔尊真身') {
      if (h.normalSkills.indexOf(skillName) < 0) h.normalSkills.push(skillName);
      return true;
    }
    return learnArt(world, heroName, skillName);
  }

  /** 仙术使用计数→slv 折算 + 五组连招解锁（bj.a/bj.b；bj.java:196-325） */
  function recordArtUse(world, heroName, skillId) {
    var h = heroByName(world, heroName) || heroes(world)[heroName];
    if (!h) return { slv: 1, unlocked: [] };
    var unlocked = [];
    Object.keys(h.arts).forEach(function (n) {
      var sk = skillByName(n);
      if (sk && sk.id === skillId && h.arts[n].learned) h.arts[n].uses++;
    });
    function uses(id) {
      var u = 0;
      Object.keys(h.arts).forEach(function (n) {
        var sk = skillByName(n);
        if (sk && sk.id === id && h.arts[n].learned) u = Math.max(u, h.arts[n].uses);
      });
      return u;
    }
    function slvOf(id) { return usesToSlv(uses(id)); }
    function unlock(id) {
      var sk = null;
      var list = (XJ.data.logic.skillFormulas || {}).player || [];
      for (var i = 0; i < list.length; i++) if (list[i].index === id) sk = list[i];
      if (sk && !h.arts[sk.name]) { h.arts[sk.name] = { learned: true, uses: 0 }; unlocked.push(sk.name); }
    }
    if (slvOf(18) >= 4 && slvOf(10) >= 3) unlock(23);
    if (slvOf(13) >= 3 && slvOf(19) >= 3) unlock(24);
    if (slvOf(13) >= 2 && slvOf(22) >= 4) unlock(25);
    if (slvOf(12) >= 4 && slvOf(16) >= 3) unlock(26);
    if (slvOf(15) >= 4 && slvOf(22) >= 2) unlock(27);
    return { slv: slvOf(skillId), unlocked: unlocked };
  }

  function artSlv(world, heroName, skillName) {
    var h = heroByName(world, heroName) || heroes(world)[heroName];
    var sk = skillByName(skillName);
    if (!h || !sk) return 1;
    var rec = h.arts[skillName];
    return usesToSlv(rec ? rec.uses : 0);
  }

  // ------------------------------------------------------------ 物品
  /** 解析「效果文本」：player.addhp(400);player.addgod(30);… */
  function applyEffectText(world, hero, text) {
    var msgs = [];
    String(text || '').split(';').forEach(function (raw) {
      var s = raw.trim();
      if (!s) return;
      var m = s.match(/^player\.([A-Za-z]+)\((.*)\)$/);
      if (!m) return;
      var cmd = m[1], arg = m[2].trim();
      function E() { try { return XS.evalExpr(arg, {}); } catch (e) { return 0; } }
      var st = statsOf(hero);
      if (cmd === 'addhp') { hero.hp = Math.min(st.maxHp, hero.hp + E()); msgs.push('恢复精' + E() + '点'); }
      else if (cmd === 'addgod') { hero.mp = Math.min(st.maxMp, hero.mp + E()); msgs.push('恢复神' + E() + '点'); }
      else if (cmd === 'againlife') {
        var v = E();
        if (hero.hp <= 0) { hero.hp = Math.min(st.maxHp, v); msgs.push('复活并恢复精' + v + '点'); }
        else { hero.hp = Math.min(st.maxHp, hero.hp + v); msgs.push('恢复精' + v + '点'); }
      }
      else if (cmd === 'setnone') { hero.ailments = { frozen: false, dot: null, counter: false }; msgs.push('解除一切异常状态'); }
      else if (cmd === 'addspeed') { hero.bonusSpd = (hero.bonusSpd || 0) + E(); msgs.push('速+' + E()); }
      else if (cmd === 'addluck') { hero.bonusLuk = (hero.bonusLuk || 0) + E(); msgs.push('运+' + E()); }
      else if (cmd === 'addlove') {
        hero.feeling = Math.max(0, Math.min(100, hero.feeling + E()));
        world.party[hero.name] = hero.feeling;
        msgs.push('好感度+' + E());
      }
    });
    clampHero(hero);
    return msgs;
  }

  /** 背包使用药品（战斗内外通用；装备/材料不可直接使用） */
  function useItem(world, heroName, itemName) {
    var h = heroByName(world, heroName) || heroes(world)[heroName] || activeHeroes(world)[0];
    if (!h) return { ok: false, msg: '无队员' };
    var r = itemRow(itemName);
    if (!r) return { ok: false, msg: '未知物品' };
    if ((world.items[itemName] || 0) <= 0) return { ok: false, msg: '没有' + itemName };
    if (r['类型'] !== '药品') return { ok: false, msg: itemName + '不能直接使用' };
    var msgs = applyEffectText(world, h, r['效果文本']);
    world.removeItem(itemName, 1);
    return { ok: true, msg: h.name + '使用' + itemName + '：' + msgs.join('，'), hero: h.name };
  }

  var SLOT_OF_TYPE = { '武器': 'weapon', '服饰': 'armor', '头饰': 'head', '足饰': 'foot', '饰品': 'acc' };
  /** 装备：槽位/限定角色/等级（i.a/b；i.java:116-140） */
  function equip(world, heroName, itemName) {
    var h = heroByName(world, heroName) || heroes(world)[heroName];
    if (!h) return { ok: false, msg: '无此队员' };
    var r = itemRow(itemName);
    if (!r) return { ok: false, msg: '未知物品' };
    var slot = SLOT_OF_TYPE[r['类型']];
    if (!slot) return { ok: false, msg: itemName + '不可装备' };
    var restr = r['限定角色'];
    var okRole = restr === '通用' || restr === '默认' || restr === h.name ||
      (restr === '女' && (h.name === '月瑶' || h.name === '紫萱'));
    if (!okRole) return { ok: false, msg: h.name + '无法装备' + itemName + '（' + restr + '专用）' };
    // ★ i.b(n)：等级>=价格列（数据里价格与可装备等级一致）
    if (h.level < num(r['价格'], 0)) return { ok: false, msg: itemName + '需要' + r['价格'] + '级' };
    if ((world.items[itemName] || 0) <= 0 && h.equip[slot] !== itemName)
      return { ok: false, msg: '背包里没有' + itemName };
    if (h.equip[slot]) world.addItem(h.equip[slot], 1);
    if (h.equip[slot] !== itemName) world.removeItem(itemName, 1);
    h.equip[slot] = itemName;
    clampHero(h);
    return { ok: true, msg: h.name + '装备' + itemName, stats: statsOf(h) };
  }

  // ------------------------------------------------------------ 合成
  function craft(world, entry) {
    var rows = ((XJ.data.config.recipes || {}).rows) || [];
    var rec = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].entry === entry) rec = rows[i];
    if (!rec) return { ok: false, msg: '无此配方' };
    // ★ 点石成金（fee 6）：无需材料任意合成
    if (world.fees && world.fees[6]) {
      world.addItem(rec.product, 1);
      return { ok: true, msg: '合成' + rec.product + '（点石成金）', product: rec.product };
    }
    var lack = (rec.materials || []).filter(function (m) { return (world.items[m.item] || 0) < m.count; });
    if (lack.length) return { ok: false, msg: '材料不足：' + lack.map(function (m) { return m.item + '×' + m.count; }).join('、') };
    (rec.materials || []).forEach(function (m) { world.removeItem(m.item, m.count); });
    world.addItem(rec.product, 1);
    return { ok: true, msg: '合成' + rec.product, product: rec.product };
  }

  // ------------------------------------------------------------ 商城激活
  /**
   * 激活 fee 项（fee_str 条目：markFee / levelup / addGold / ybdx）。
   * 对应 e.player.levelup（先 mark 500 解锁上限再全员升级）与 fee.ybdx。
   * 复刻版无短信计费，选择即激活；原版走 激活失败 分支（短信失败）在此不会出现。
   */
  function activateFee(world, idx) {
    var F = (XJ.data.config.fee || {});
    var entries = F.fee_str || [];
    var e = null;
    for (var i = 0; i < entries.length; i++) {
      if (parseInt(entries[i].entry, 10) === idx) { e = entries[i]; break; }
    }
    if (!e && !(idx >= 0 && idx <= 7)) return '无此商城项';
    world.fees[idx] = true;
    var msgs = ['激活成功'];
    (e ? (e.markFee || []) : []).forEach(function (n) { world.fees[parseInt(n, 10)] = true; });
    (e ? (e.levelup || []) : []).forEach(function (n) {
      world.fees[500] = true;   // ★ e.levelup 先解锁等级上限
      activeHeroes(world).forEach(function (h) { levelUp(world, h, parseInt(n, 10) || 1); });
      msgs.push('等级提升' + n);
    });
    (e ? (e.addGold || []) : []).forEach(function (n) {
      world.addGold(parseInt(n, 10) || 0);
      msgs.push('得到' + n + '两');
    });
    if (idx === 3) {
      // ★ 一步登仙：fee.ybdx，全员仙术全开直升满级
      Object.keys(heroes(world)).forEach(function (key) {
        var h = heroes(world)[key];
        var list = (XJ.data.logic.skillFormulas || {}).player || [];
        list.forEach(function (sk) {
          if (sk.kindCode !== 0 && !sk.isTemplate && sk.name && sk.name !== 'name')
            h.arts[sk.name] = { learned: true, uses: 30 };
        });
      });
      msgs.push('所有仙术全开');
    }
    return msgs.join('，');
  }

  // ------------------------------------------------------------ 宝箱
  var _boxPool = null;
  /** config_game.str 宝箱物品列 → 累积权重表 */
  function boxPool() {
    if (_boxPool) return _boxPool;
    var raw = ((XJ.data.config.gameCfg || {}).scalars || {})['宝箱物品'] || '';
    var pool = [], acc = 0;
    String(raw).split(',').forEach(function (part) {
      var m = part.trim().match(/^(.*)\((\d+)\)$/);
      if (!m) return;
      acc += parseInt(m[2], 10);
      pool.push({ name: m[1], acc: acc });
    });
    _boxPool = { pool: pool, total: acc };
    return _boxPool;
  }

  /** d()：rand[1,total] 落到累积区间（system/d.java:554-564） */
  function rollTreasure(rnd) {
    var bp = boxPool();
    if (!bp.total) return null;
    var r = rnd ? rnd(1, bp.total) : 1 + Math.floor(Math.random() * bp.total);
    for (var i = 0; i < bp.pool.length; i++) if (r <= bp.pool[i].acc) return bp.pool[i].name;
    return null;
  }

  // ------------------------------------------------------------ 存档形状
  function snapshotHeroes(world) {
    var hs = heroes(world), out = {};
    Object.keys(hs).forEach(function (k) {
      var h = hs[k];
      out[k] = {
        role: h.role, name: h.name, level: h.level, exp: h.exp,
        hp: h.hp, mp: h.mp, gas: h.gas, feeling: h.feeling,
        equip: Object.assign({}, h.equip), normalSkills: h.normalSkills.slice(),
        arts: JSON.parse(JSON.stringify(h.arts)),
        bonusSpd: h.bonusSpd || 0, bonusLuk: h.bonusLuk || 0
      };
    });
    return out;
  }

  function restoreHeroes(world, data) {
    var hs = heroes(world);
    Object.keys(data || {}).forEach(function (k) {
      var d = data[k];
      var h = newHero(d.role || k) || { role: k };
      Object.keys(d).forEach(function (f) { h[f] = d[f]; });
      if (!h.ailments) h.ailments = { frozen: false, dot: null, counter: false };
      clampHero(h);
      hs[k] = h;
    });
    return world;
  }

  global.XJParty = {
    ROLE_ORDER: ROLE_ORDER, PARTNER_ROLE: PARTNER_ROLE, LEVEL_CAP: LEVEL_CAP,
    skillByName: skillByName, usesToSlv: usesToSlv, kindCodeOf: kindCodeOf,
    roleCfg: roleCfg, statsOf: statsOf, equipBonus: equipBonus, itemRow: itemRow,
    newHero: newHero, clampHero: clampHero, fullRestore: fullRestore,
    initParty: initParty, heroes: heroes, heroByName: heroByName, activeHeroes: activeHeroes,
    partnerIn: partnerIn, partnerOut: partnerOut, addFeeling: addFeeling,
    addExp: addExp, levelUp: levelUp,
    learnArt: learnArt, learnSkill: learnSkill, recordArtUse: recordArtUse, artSlv: artSlv,
    useItem: useItem, equip: equip, craft: craft,
    activateFee: activateFee,
    boxPool: boxPool, rollTreasure: rollTreasure,
    snapshotHeroes: snapshotHeroes, restoreHeroes: restoreHeroes
  };
})(typeof window !== 'undefined' ? window : globalThis);
