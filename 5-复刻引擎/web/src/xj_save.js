/* xj_save.js —— 存档（localStorage）
 *
 * 存什么（全部来自 World 的可序列化状态）：
 *   map / px / py / dir / events / fees / gold / items / party / tasks
 *
 * 键名：xj_save_<slot>。提供 3 个槽位。
 * 版本号 SAVE_VERSION，结构变化时递增并拒绝读取旧版。
 */
(function (global) {
  'use strict';

  var PREFIX = 'xj_save_';
  var SAVE_VERSION = 1;

  function slots() { return [0, 1, 2]; }

  function key(slot) { return PREFIX + slot; }

  function snapshot(world, scene) {
    return {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      map: scene ? scene.mapName : (world.mapName || ''),
      px: scene ? scene.px : (world.playerX || 0),
      py: scene ? scene.py : (world.playerY || 0),
      dir: scene ? scene.player.dir : (world.playerDir || 'down'),
      events: world.events || {},
      fees: world.fees || {},
      gold: world.gold || 0,
      items: world.items || {},
      party: world.party || {},
      tasks: world.tasks || []
    };
  }

  function save(world, scene, slot) {
    try {
      localStorage.setItem(key(slot), JSON.stringify(snapshot(world, scene)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load(slot) {
    var raw;
    try { raw = localStorage.getItem(key(slot)); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var d = JSON.parse(raw);
      if (!d || d.version !== SAVE_VERSION) return null;
      return d;
    } catch (e) {
      return null;
    }
  }

  function exists(slot) {
    return load(slot) !== null;
  }

  function erase(slot) {
    try { localStorage.removeItem(key(slot)); return true; } catch (e) { return false; }
  }

  /** 把存档应用到 World + Scene */
  function apply(data, world, scene) {
    if (!data) return false;
    world.events = data.events || {};
    world.fees = data.fees || {};
    world.gold = data.gold || 0;
    world.items = data.items || {};
    world.party = data.party || {};
    world.tasks = data.tasks || [];
    if (scene) {
      scene.load(data.map || 'cs_ljb_1', data.px, data.py);
      scene.player.dir = data.dir || 'down';
    }
    return true;
  }

  function info(slot) {
    var d = load(slot);
    if (!d) return null;
    return {
      slot: slot, map: d.map, px: d.px, py: d.py,
      events: Object.keys(d.events || {}).filter(function (k) { return d.events[k] === 1; }).length,
      gold: d.gold,
      items: Object.keys(d.items || {}).length,
      when: new Date(d.savedAt).toLocaleString()
    };
  }

  global.XJSave = {
    VERSION: SAVE_VERSION, slots: slots, save: save, load: load,
    exists: exists, erase: erase, apply: apply, info: info,
    snapshot: snapshot
  };
})(typeof window !== 'undefined' ? window : globalThis);