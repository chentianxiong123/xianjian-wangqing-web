// ============================================================
// src/state.js — 游戏全局状态 + XJ API 骨架
// 所有系统通过 window.XJ 暴露统一接口
// 集成者创建；系统层 agent 填充具体实现
// ============================================================

// ---- 全局游戏状态 ----
window.XJ_STATE = {
  // 地图与位置
  mapId: 'cs_ljb_1',
  map: null,
  player: {
    x: 320, y: 240,
    dir: 'down',           // up|down|left|right
    speed: 2,
    frame: 0,
    animTick: 0,
    moving: false
  },
  camera: { x: 0, y: 0 },

  // 队伍（主角 + 配角）
  party: [
    {
      id: 'chonglou',
      name: '重楼',
      level: 1,
      exp: 0,
      hp: 246, maxhp: 246,    // 200+46*1
      sp: 9, maxsp: 9,        // 8+1
      mp: 24, maxmp: 24,      // 20+4*1
      atk: 126, def: 22,      // 100+26*1, 18+4*1
      spd: 21, lck: 10,
      skills: ['心波', '鬼降', '魔尊真身'],
      spells: ['炎咒', '冰咒'],
      equip: {
        weapon: '木剑',
        armor: '布衣',
        head: '头巾',
        foot: null,
        acc: null
      }
    }
  ],

  // 资源
  money: 300,                  // 金钱
  bag: [                       // [{name, count}, ...]
    { name: '止血草', count: 5 },
    { name: '鼠儿果', count: 5 }
  ],

  // 标记系统
  flags: {
    event: {},                 // 剧情事件: {id: true}
    fee: {},                   // fee系统: {id: true}
    quest: {},                 // 任务: {name: 'active'|'done'}
    trade: {},                 // 商店购买记录
    item: {}                   // 道具触发记录
  },

  // 运行时状态（不存档）
  runtime: {
    dialogue: null,            // 当前对话状态
    battle: null,              // 当前战斗状态
    ui: 'map',                 // 当前UI: map|dialog|battle|menu|shop|craft|inventory|quest
    paused: false
  },

  // 引擎内部状态（不存档）
  keys: {},
  dialog: null,
  fps: 0, _frames: 0, _last: 0,
  tileBin: null
};

// ---- 全局 API 对象 ----
window.XJ = {
  // 数据访问（批次1 agent 填充后自动可用）
  data: {
    maps: window.MAPS,
    npcs: window.NPC_CONFIG,
    talk: window.TALK_SCRIPTS,
    npcSprites: window.NPC_SPRITE_MAP,
    binIndex: window.BIN_INDEX,
    items: window.XJ_DATA_ITEMS,
    skills: window.XJ_DATA_SKILLS,
    enemies: window.XJ_DATA_ENEMIES,
    recipes: window.XJ_DATA_RECIPES,
    tasks: window.XJ_DATA_TASKS,
    chars: window.XJ_DATA_CHARS,
    fightCfg: window.XJ_DATA_FIGHT_CFG,
    gameCfg: window.XJ_DATA_GAME_CFG,
    ants: window.XJ_DATA_ANTS,
    shops: window.XJ_DATA_SHOPS
  },

  // 状态访问
  state: window.XJ_STATE,

  // ---- 存档（Agent-S1 填充） ----
  save: function(slot) { console.warn('[XJ.save] TODO: Agent-S1'); return false; },
  load: function(slot) { console.warn('[XJ.load] TODO: Agent-S1'); return false; },
  hasSave: function(slot) { return false; },

  // ---- 物品系统（Agent-S2 填充） ----
  addItem: function(name, count) { console.warn('[XJ.addItem] TODO: Agent-S2'); },
  removeItem: function(name, count) { console.warn('[XJ.removeItem] TODO: Agent-S2'); return false; },
  hasItem: function(name, count) {
    count = count || 1;
    var bag = XJ_STATE.bag;
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].name === name) return bag[i].count >= count;
    }
    return false;
  },
  equip: function(charId, slot, itemName) { console.warn('[XJ.equip] TODO: Agent-S2'); },
  unequip: function(charId, slot) { console.warn('[XJ.unequip] TODO: Agent-S2'); },
  getEquipBonus: function(charId) {
    // 基础实现：遍历装备槽累加属性
    var party = XJ_STATE.party;
    var ch = null;
    for (var i = 0; i < party.length; i++) {
      if (party[i].id === charId) { ch = party[i]; break; }
    }
    if (!ch || !ch.equip) return {};
    var bonus = { atk:0, def:0, spd:0, lck:0, maxhp:0, maxsp:0, maxmp:0, regen:0 };
    var items = (window.XJ_DATA_ITEMS && window.XJ_DATA_ITEMS.items) || {};
    var slots = ['weapon','armor','head','foot','acc'];
    for (var s = 0; s < slots.length; s++) {
      var eqName = ch.equip[slots[s]];
      if (eqName && items[eqName]) {
        var it = items[eqName];
        bonus.atk += it.atk || 0;
        bonus.def += it.def || 0;
        bonus.spd += it.spd || 0;
        bonus.lck += it.lck || 0;
        bonus.maxhp += it.maxhp || 0;
        bonus.maxsp += it.maxsp || 0;
        bonus.maxmp += it.maxmp || 0;
        bonus.regen += it.regen || 0;
      }
    }
    return bonus;
  },

  // ---- 战斗系统（Agent-S3 填充） ----
  openBattle: function(encounterKey) { console.warn('[XJ.openBattle] TODO: Agent-S3'); },
  closeBattle: function() { console.warn('[XJ.closeBattle] TODO: Agent-S3'); },

  // ---- 商店系统（Agent-S4 填充） ----
  openShop: function(npcId) { console.warn('[XJ.openShop] TODO: Agent-S4'); },
  closeShop: function() { console.warn('[XJ.closeShop] TODO: Agent-S4'); },

  // ---- 合成系统（Agent-S5 填充） ----
  openCraft: function() { console.warn('[XJ.openCraft] TODO: Agent-S5'); },
  closeCraft: function() { console.warn('[XJ.closeCraft] TODO: Agent-S5'); },
  craft: function(recipeIdx) { console.warn('[XJ.craft] TODO: Agent-S5'); return false; },

  // ---- 任务系统（Agent-S6 填充） ----
  setActiveQuest: function(questName) { console.warn('[XJ.setActiveQuest] TODO: Agent-S6'); },
  completeQuest: function(questName) { console.warn('[XJ.completeQuest] TODO: Agent-S6'); },
  isQuestActive: function(questName) {
    return XJ_STATE.flags.quest[questName] === 'active';
  },
  isQuestDone: function(questName) {
    return XJ_STATE.flags.quest[questName] === 'done';
  },

  // ---- 菜单系统（Agent-S7 填充） ----
  openMenu: function(tab) { console.warn('[XJ.openMenu] TODO: Agent-S7'); },
  closeMenu: function() { console.warn('[XJ.closeMenu] TODO: Agent-S7'); },

  // ---- 音频系统（Agent-S8 填充） ----
  playBGM: function(midName) { console.warn('[XJ.playBGM] TODO: Agent-S8'); },
  stopBGM: function() { console.warn('[XJ.stopBGM] TODO: Agent-S8'); },

  // ---- 事件标记（集成者已实现） ----
  setFlag: function(ns, key, val) {
    XJ_STATE.flags[ns] = XJ_STATE.flags[ns] || {};
    XJ_STATE.flags[ns][key] = (val === undefined) ? true : val;
  },
  getFlag: function(ns, key) {
    return XJ_STATE.flags[ns] ? XJ_STATE.flags[ns][key] : undefined;
  },
  hasFlag: function(ns, key) {
    return !!XJ.getFlag(ns, key);
  },

  // ---- UI 面板管理（集成者已实现） ----
  showPanel: function(id) {
    var panels = document.querySelectorAll('.xj-panel');
    for (var i = 0; i < panels.length; i++) {
      panels[i].classList.add('hidden');
    }
    if (id) {
      var el = document.getElementById('xj-panel-' + id);
      if (el) el.classList.remove('hidden');
      XJ_STATE.runtime.ui = id;
    } else {
      XJ_STATE.runtime.ui = 'map';
    }
  },
  hidePanel: function() {
    var panels = document.querySelectorAll('.xj-panel');
    for (var i = 0; i < panels.length; i++) {
      panels[i].classList.add('hidden');
    }
    XJ_STATE.runtime.ui = 'map';
  },

  // ---- 对话框（桥接主引擎已有的 showDialog） ----
  dialogue: {
    show: function(name, text) {
      if (typeof showDialog === 'function') {
        showDialog(name, text);
      } else {
        console.warn('[XJ.dialogue.show] showDialog not found');
      }
    },
    close: function() {
      if (typeof closeDialog === 'function') {
        closeDialog();
      }
    }
  }
};

// ---- 便捷函数：计算角色属性（含装备加成） ----
window.XJ.getChar = function(charId) {
  var party = XJ_STATE.party;
  for (var i = 0; i < party.length; i++) {
    if (party[i].id === charId) return party[i];
  }
  return null;
};

// ---- 升级公式计算（从 config_chonglou.str 的公式） ----
window.XJ.calcStats = function(charId) {
  var ch = XJ.getChar(charId);
  if (!ch) return null;
  var chars = (window.XJ_DATA_CHARS) || {};
  var cfg = chars[charId] || chars.chonglou;  // fallback
  if (!cfg || !cfg.formulas) return ch;
  var lv = ch.level;
  var bonus = XJ.getEquipBonus(charId);
  // eval 公式
  try {
    if (cfg.formulas.maxhp) ch.maxhp = eval(cfg.formulas.maxhp.replace(/lv/g, lv));
    if (cfg.formulas.maxsp) ch.maxsp = eval(cfg.formulas.maxsp.replace(/lv/g, lv));
    if (cfg.formulas.maxmp) ch.maxmp = eval(cfg.formulas.maxmp.replace(/lv/g, lv));
    if (typeof cfg.formulas.atk === 'string')
      ch.atk = eval(cfg.formulas.atk.replace(/lv/g, lv)) + (bonus.atk || 0);
    else
      ch.atk = (cfg.formulas.atk || 0) + (bonus.atk || 0);
    if (typeof cfg.formulas.def === 'string')
      ch.def = eval(cfg.formulas.def.replace(/lv/g, lv)) + (bonus.def || 0);
    else
      ch.def = (cfg.formulas.def || 0) + (bonus.def || 0);
    if (typeof cfg.formulas.spd === 'string')
      ch.spd = eval(cfg.formulas.spd.replace(/lv/g, lv));
    else
      ch.spd = cfg.formulas.spd || ch.spd;
    if (typeof cfg.formulas.lck === 'string')
      ch.lck = eval(cfg.formulas.lck.replace(/lv/g, lv));
    else
      ch.lck = cfg.formulas.lck || ch.lck;
    // HP/SP/MP 不超过上限
    if (ch.hp > ch.maxhp) ch.hp = ch.maxhp;
    if (ch.sp > ch.maxsp) ch.sp = ch.maxsp;
    if (ch.mp > ch.maxmp) ch.mp = ch.maxmp;
  } catch (e) {
    console.warn('[XJ.calcStats] eval error:', e);
  }
  return ch;
};

// ---- 经验值/升级 ----
window.XJ.gainExp = function(charId, exp) {
  var ch = XJ.getChar(charId);
  if (!ch) return;
  ch.exp += exp;
  var chars = (window.XJ_DATA_CHARS) || {};
  var cfg = chars[charId] || chars.chonglou;
  if (!cfg || !cfg.formulas || !cfg.formulas.expNeeded) return;
  while (true) {
    var need = eval(cfg.formulas.expNeeded.replace(/lv/g, ch.level));
    if (ch.exp >= need) {
      ch.exp -= need;
      ch.level++;
      XJ.calcStats(charId);
      // 升级回满
      ch.hp = ch.maxhp;
      ch.sp = ch.maxsp;
      ch.mp = ch.maxmp;
      console.log('[XJ] ' + ch.name + ' 升级到 ' + ch.level + ' 级');
    } else {
      break;
    }
  }
};
