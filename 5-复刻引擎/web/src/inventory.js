// ============================================================
// src/inventory.js — 背包/装备系统 (Agent-S2)
// 物品增删、装备、属性加成计算
// ============================================================
(function() {
  var ITEMS = {};  // 从 XJ_DATA_ITEMS 读取

  function getItems() {
    if (!ITEMS || !Object.keys(ITEMS).length) {
      ITEMS = (XJ.data.items && XJ.data.items.items) || {};
    }
    return ITEMS;
  }

  // ---- 物品操作 ----
  XJ.addItem = function(name, count) {
    count = count || 1;
    var bag = XJ_STATE.bag;
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].name === name) {
        bag[i].count += count;
        console.log('[inventory] + ' + name + ' x' + count);
        return true;
      }
    }
    bag.push({ name: name, count: count });
    console.log('[inventory] 新增 ' + name + ' x' + count);
    return true;
  };

  XJ.removeItem = function(name, count) {
    count = count || 1;
    var bag = XJ_STATE.bag;
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].name === name) {
        if (bag[i].count >= count) {
          bag[i].count -= count;
          if (bag[i].count <= 0) bag.splice(i, 1);
          return true;
        }
      }
    }
    return false;
  };

  XJ.hasItem = function(name, count) {
    count = count || 1;
    var bag = XJ_STATE.bag;
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].name === name && bag[i].count >= count) return true;
    }
    return false;
  };

  XJ.getItemCount = function(name) {
    var bag = XJ_STATE.bag;
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].name === name) return bag[i].count;
    }
    return 0;
  };

  XJ.getBag = function() {
    return XJ_STATE.bag.slice();
  };

  // ---- 装备系统 ----
  XJ.equip = function(charId, slot, itemName) {
    var ch = XJ.getChar(charId);
    if (!ch) return false;
    var items = getItems();
    var item = items[itemName];
    if (!item) {
      console.warn('[inventory] 未知物品:', itemName);
      return false;
    }
    // 检查职业限制
    if (item.owner && item.owner !== '所有人') {
      if (item.owner !== ch.name && item.owner !== charId) {
        XJ.dialogue.show(ch.name, '【' + ch.name + '】无法装备【' + itemName + '】—— ' + item.owner + '专用');
        return false;
      }
    }
    // 检查等级要求
    if (item.level && ch.level < item.level) {
      XJ.dialogue.show(ch.name, '【' + itemName + '】需要 ' + item.level + ' 级才能装备');
      return false;
    }
    // 卸下旧装备
    var oldName = ch.equip[slot];
    if (oldName && oldName !== '无') {
      XJ.addItem(oldName, 1);
    }
    // 从背包移除新装备
    if (!XJ.removeItem(itemName, 1)) {
      console.warn('[inventory] 背包中没有 ' + itemName);
      return false;
    }
    ch.equip[slot] = itemName;
    XJ.calcStats(charId);
    console.log('[inventory] ' + ch.name + ' 装备 ' + itemName + ' 到 ' + slot);
    return true;
  };

  XJ.unequip = function(charId, slot) {
    var ch = XJ.getChar(charId);
    if (!ch) return false;
    var itemName = ch.equip[slot];
    if (!itemName || itemName === '无') return false;
    XJ.addItem(itemName, 1);
    ch.equip[slot] = null;
    XJ.calcStats(charId);
    return true;
  };

  // ---- 使用药品 ----
  XJ.useItem = function(name, targetCharId) {
    var ch = XJ.getChar(targetCharId);
    if (!ch) ch = XJ_STATE.party[0];
    var items = getItems();
    var item = items[name];
    if (!item) return false;

    // 药品恢复效果（基于物品属性字段）
    var recovered = false;
    if (item.maxhp > 0) {
      ch.hp = Math.min(ch.maxhp, ch.hp + item.maxhp);
      recovered = true;
    }
    if (item.maxsp > 0) {
      ch.sp = Math.min(ch.maxsp, ch.sp + item.maxsp);
      recovered = true;
    }
    if (item.maxmp > 0) {
      ch.mp = Math.min(ch.maxmp, ch.mp + item.maxmp);
      recovered = true;
    }
    // 特殊药品：描述中的效果
    if (!recovered && item.type === '药品') {
      // 尝试解析描述
      ch.hp = Math.min(ch.maxhp, ch.hp + 50);
      recovered = true;
    }
    if (recovered) {
      XJ.removeItem(name, 1);
      XJ.dialogue.show(ch.name, '【' + ch.name + '】使用【' + name + '】，状态恢复');
      return true;
    }
    XJ.dialogue.show(ch.name, '【' + name + '】无法使用');
    return false;
  };

  // ---- 装备槽位名称 ----
  XJ.equipSlots = {
    weapon: '武器',
    armor: '服饰',
    head: '头饰',
    foot: '足饰',
    acc: '饰品'
  };

  XJ.equipTypeSlot = {
    '武器': 'weapon',
    '服饰': 'armor',
    '头饰': 'head',
    '足饰': 'foot',
    '饰品': 'acc'
  };

  // ---- 获取角色的全部属性（含装备加成） ----
  XJ.getStats = function(charId) {
    var ch = XJ.getChar(charId);
    if (!ch) return null;
    var bonus = XJ.getEquipBonus(charId);
    return {
      id: ch.id,
      name: ch.name,
      level: ch.level,
      exp: ch.exp,
      hp: ch.hp, maxhp: ch.maxhp + (bonus.maxhp || 0),
      sp: ch.sp, maxsp: ch.maxsp + (bonus.maxsp || 0),
      mp: ch.mp, maxmp: ch.maxmp + (bonus.maxmp || 0),
      atk: ch.atk, def: ch.def,
      spd: ch.spd, lck: ch.lck,
      equip: ch.equip
    };
  };

  console.log('[inventory.js] 背包/装备系统加载完成');
})();
