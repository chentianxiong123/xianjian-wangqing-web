// ============================================================
// src/shop.js - Shop System (Agent-S4)
// ============================================================
(function() {
  var CURRENT_SHOP = null;
  var SHOP_ITEMS = [];
  var SELL_RATIO = 0.5;

  function getShopItems(npcId) {
    var shops = XJ.data.shops ? XJ.data.shops.shops : {};
    var shop = shops[npcId];
    if (!shop) return [];
    var items = {};
    var itemsData = XJ.data.items ? XJ.data.items.items : {};
    for (var i = 0; i < shop.items.length; i++) {
      var name = shop.items[i];
      var item = itemsData[name] || {price: 0, name: name};
      items[name] = {name: name, price: item.price || 0, desc: item.desc || ''};
    }
    return items;
  }

  function renderShopPanel(npcId) {
    var el = document.getElementById('shop-content');
    if (!el) return;
    SHOP_ITEMS = getShopItems(npcId);
    var npcName = NPC_CONFIG[npcId] ? NPC_CONFIG[npcId].name : ('NPC ' + npcId);
    CURRENT_SHOP = npcId;
    var html = '<div style="margin-bottom:8px;color:#fc6"><b>' + npcName + '</b></div>';
    html += '<div style="color:#9af;font-size:12px;margin-bottom:8px">Money: ' + XJ_STATE.money + ' gold</div>';
    html += '<div style="color:#fc6;margin:4px 0">BUY</div>';
    for (var name in SHOP_ITEMS) {
      var item = SHOP_ITEMS[name];
      var canBuy = XJ_STATE.money >= item.price;
      html += '<div class="xj-item-row ' + (canBuy ? '' : 'disabled') + '" data-buy="' + name + '">' +
              '<div><b>' + name + '</b>' +
              '<br><span style="font-size:11px;color:#aaa">' + (item.desc||'').substring(0,30) + '</span></div>' +
              '<span class="price">' + item.price + '</span></div>';
    }
    html += '<div style="color:#fc6;margin:8px 0 4px">SELL</div>';
    var bag = XJ_STATE.bag || [];
    var sellable = [];
    for (var i = 0; i < bag.length; i++) {
      if (SHOP_ITEMS[bag[i].name]) sellable.push(bag[i]);
    }
    for (var j = 0; j < sellable.length; j++) {
      var si = sellable[j];
      var sellPrice = Math.floor(SHOP_ITEMS[si.name].price * SELL_RATIO);
      html += '<div class="xj-item-row" data-sell="' + si.name + '">' +
              '<div><b>' + si.name + '</b> x' + si.count + '</div>' +
              '<span class="price">' + sellPrice + '</span></div>';
    }
    if (sellable.length === 0) html += '<div style="padding:4px;color:#666">No sellable items</div>';
    el.innerHTML = html;
    bindShopActions();
  }

  function bindShopActions() {
    var el = document.getElementById('shop-content');
    var buyRows = el.querySelectorAll('[data-buy]');
    for (var i = 0; i < buyRows.length; i++) {
      buyRows[i].addEventListener('click', function() {
        var name = this.getAttribute('data-buy');
        var price = SHOP_ITEMS[name] ? SHOP_ITEMS[name].price : 0;
        if (XJ_STATE.money >= price) {
          XJ_STATE.money -= price;
          XJ.addItem(name, 1);
          updateMoneyDisplay();
          renderShopPanel(CURRENT_SHOP);
        }
      });
    }
    var sellRows = el.querySelectorAll('[data-sell]');
    for (var i = 0; i < sellRows.length; i++) {
      sellRows[i].addEventListener('click', function() {
        var name = this.getAttribute('data-sell');
        var price = Math.floor(SHOP_ITEMS[name] ? SHOP_ITEMS[name].price * SELL_RATIO : 0);
        if (XJ.removeItem(name, 1)) {
          XJ_STATE.money += price;
          updateMoneyDisplay();
          renderShopPanel(CURRENT_SHOP);
        }
      });
    }
  }

  function updateMoneyDisplay() {
    var el = document.getElementById('xj-money');
    if (el) el.textContent = '¥ ' + XJ_STATE.money;
  }

  XJ.openShop = function(npcId) {
    if (XJ_STATE.runtime.ui !== 'map') return;
    if (!XJ.data.shops || !XJ.data.shops.shops[npcId]) return;
    renderShopPanel(npcId);
    XJ.showPanel('shop');
  };

  XJ.closeShop = function() {
    CURRENT_SHOP = null; SHOP_ITEMS = [];
    XJ.hidePanel();
    XJ.stopBGM();
  };

  console.log('[shop.js] Shop system loaded');
})();
