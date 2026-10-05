// ============================================================
// src/menu.js - Menu System (Agent-S7)
// Bag, Character Status, Save/Load
// ============================================================
(function() {
  function renderMenuTab(tab) {
    var el = document.getElementById('menu-content');
    if (!el) return;
    var html = '';

    if (tab === 'bag') {
      html = renderBag();
    } else if (tab === 'status') {
      html = renderStatus();
    } else if (tab === 'save') {
      html = renderSaveLoad();
    } else {
      html = '<div style="padding:12px;color:#ffe">Settings...</div>';
    }

    el.innerHTML = html;
    bindMenuActions(tab);
  }

  function renderBag() {
    var bag = XJ_STATE.bag;
    if (!bag.length) return '<div style="padding:12px">Inventory is empty</div>';
    var html = '<div style="max-height:400px;overflow:auto">';
    for (var i = 0; i < bag.length; i++) {
      var item = bag[i];
      var desc = '';
      var items = (XJ.data.items && XJ.data.items.items) || {};
      if (items[item.name]) desc = items[item.name].desc || '';
      html += '<div class="xj-item-row" data-name="' + item.name + '">' +
              '<div><b>' + item.name + '</b> x' + item.count +
              '<br><span style="font-size:11px;color:#aaa">' + desc.substring(0,30) + '</span></div></div>';
    }
    html += '</div>';
    return html;
  }

  function renderStatus() {
    var party = XJ_STATE.party;
    var html = '';
    for (var i = 0; i < party.length; i++) {
      var ch = party[i];
      var bonus = XJ.getEquipBonus(ch.id);
      var total_atk = ch.atk + (bonus.atk || 0);
      var total_def = ch.def + (bonus.def || 0);
      html += '<div style="margin:8px 0;padding:8px;background:#234;border-radius:6px">';
      html += '<div style="color:#fc6;font-weight:bold">' + ch.name + ' Lv.' + ch.level + '</div>';
      html += '<div class="xj-status-grid">';
      html += '<span class="label">HP</span><span class="value">' + ch.hp + '/' + ch.maxhp + '</span>';
      html += '<span class="label">SP</span><span class="value">' + ch.sp + '/' + ch.maxsp + '</span>';
      html += '<span class="label">MP</span><span class="value">' + ch.mp + '/' + ch.maxmp + '</span>';
      html += '<span class="label">EXP</span><span class="value">' + ch.exp + '</span>';
      html += '<span class="label">ATK</span><span class="value">' + total_atk + ' <span style="color:#888;font-size:11px">(+' + (bonus.atk||0) + ')</span></span>';
      html += '<span class="label">DEF</span><span class="value">' + total_def + ' <span style="color:#888;font-size:11px">(+' + (bonus.def||0) + ')</span></span>';
      html += '<span class="label">SPD</span><span class="value">' + ch.spd + '</span>';
      html += '<span class="label">LUCK</span><span class="value">' + ch.lck + '</span>';
      html += '</div>';
      html += '<div style="margin-top:6px;font-size:12px;color:#9af">';
      html += 'Weapon:<b style="color:#ffe">' + (ch.equip.weapon || 'None') + '</b> ';
      html += 'Armor:<b style="color:#ffe">' + (ch.equip.armor || 'None') + '</b> ';
      html += 'Acc:<b style="color:#ffe">' + (ch.equip.acc || 'None') + '</b>';
      html += '</div>';
      if (ch.skills && ch.skills.length) {
        html += '<div style="margin-top:4px;font-size:11px;color:#aaa">Skills: ' + ch.skills.join(' / ') + '</div>';
      }
      if (ch.spells && ch.spells.length) {
        html += '<div style="font-size:11px;color:#aaa">Spells: ' + ch.spells.join(' / ') + '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  function renderSaveLoad() {
    var html = '<div style="padding:8px"><b style="color:#fc6">Save Management</b>';
    html += '<div style="margin-top:8px">';
    for (var i = 0; i <= 3; i++) {
      var has = XJ.hasSave(i);
      html += '<div class="xj-item-row ' + (has ? '' : 'disabled') + '" data-slot="' + i + '">' +
              '<span>Slot ' + i + (has ? ' saved' : ' - empty') + '</span>' +
              '<span style="color:#888">' + (has ? 'Has save' : '') + '</span></div>';
    }
    html += '</div>';
    html += '<div style="margin-top:12px">';
    html += '<button id="btnAutoSave" style="background:#06c;color:#fff;border:0;padding:8px 16px;border-radius:4px;cursor:pointer">Auto Save (F9)</button>';
    html += '</div></div>';
    return html;
  }

  function bindMenuActions(tab) {
    if (tab === 'save') {
      var btn = document.getElementById('btnAutoSave');
      if (btn) btn.addEventListener('click', function() {
        if (XJ.save(0)) XJ.dialogue.show('Saved', 'Game saved successfully');
      });
    }
    if (tab === 'bag') {
      var rows = document.querySelectorAll('#menu-content .xj-item-row');
      for (var i = 0; i < rows.length; i++) {
        rows[i].addEventListener('click', function() {
          var name = this.getAttribute('data-name');
          if (!name) return;
          var items = (XJ.data.items && XJ.data.items.items) || {};
          if (items[name] && items[name].type === '药品') {
            if (XJ.useItem(name)) renderMenuTab('bag');
          } else {
            XJ.dialogue.show('Info', name + ' cannot be used directly');
          }
        });
      }
    }
  }

  XJ.openMenu = function(tab) {
    tab = tab || 'bag';
    if (XJ_STATE.runtime.ui !== 'map') return;
    renderMenuTab(tab);
    XJ.showPanel('menu');
  };

  XJ.closeMenu = function() {
    XJ.hidePanel();
    XJ.stopBGM();
  };

  console.log('[menu.js] Menu system loaded');
})();
