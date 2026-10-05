// ============================================================
// src/save.js — 存档系统 (Agent-S1)
// localStorage 持久化 XJ_STATE（不含 runtime）
// ============================================================
(function() {
  var SAVE_PREFIX = 'xj_save_slot_';
  var AUTO_SLOT = 0;
  var MAX_SLOTS = 3;

  function serialize() {
    var s = XJ_STATE;
    return JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      mapId: s.mapId,
      player: { x: s.player.x, y: s.player.y, dir: s.player.dir },
      camera: { x: s.camera.x, y: s.camera.y },
      party: s.party,
      money: s.money,
      bag: s.bag,
      flags: s.flags
    });
  }

  function deserialize(json) {
    var data = JSON.parse(json);
    var s = XJ_STATE;
    s.mapId = data.mapId;
    s.player.x = data.player.x;
    s.player.y = data.player.y;
    s.player.dir = data.player.dir;
    s.camera.x = data.camera.x;
    s.camera.y = data.camera.y;
    s.party = data.party;
    s.money = data.money;
    s.bag = data.bag;
    s.flags = data.flags;
  }

  XJ.save = function(slot) {
    slot = (slot === undefined) ? AUTO_SLOT : slot;
    try {
      var json = serialize();
      localStorage.setItem(SAVE_PREFIX + slot, json);
      console.log('[XJ.save] 存档成功 slot=' + slot + ' (' + json.length + 'B)');
      return true;
    } catch (e) {
      console.error('[XJ.save] 存档失败:', e);
      return false;
    }
  };

  XJ.load = function(slot) {
    slot = (slot === undefined) ? AUTO_SLOT : slot;
    var json = localStorage.getItem(SAVE_PREFIX + slot);
    if (!json) {
      console.warn('[XJ.load] 无存档 slot=' + slot);
      return false;
    }
    try {
      deserialize(json);
      console.log('[XJ.load] 读档成功 slot=' + slot);
      if (typeof loadMap === 'function') loadMap(XJ_STATE.mapId);
      return true;
    } catch (e) {
      console.error('[XJ.load] 读档失败:', e);
      return false;
    }
  };

  XJ.hasSave = function(slot) {
    slot = (slot === undefined) ? AUTO_SLOT : slot;
    return !!localStorage.getItem(SAVE_PREFIX + slot);
  };

  XJ.listSaves = function() {
    var saves = [];
    for (var i = 0; i <= MAX_SLOTS; i++) {
      var json = localStorage.getItem(SAVE_PREFIX + i);
      if (json) {
        try {
          var d = JSON.parse(json);
          saves.push({
            slot: i,
            timestamp: d.timestamp,
            mapId: d.mapId,
            money: d.money,
            level: d.party && d.party[0] ? d.party[0].level : 1
          });
        } catch (e) {}
      }
    }
    return saves;
  };

  XJ.deleteSave = function(slot) {
    localStorage.removeItem(SAVE_PREFIX + slot);
  };

  // 自动保存（页面关闭时）
  window.addEventListener('beforeunload', function() {
    XJ.save(AUTO_SLOT);
  });

  console.log('[save.js] 存档系统加载完成');
})();
