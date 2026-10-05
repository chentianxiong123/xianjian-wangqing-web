// ============================================================
// src/craft.js — 合成系统 (Agent-S5)
// 使用配方合成新物品
// ============================================================
(function() {
  var RECIPES = [];

  function getRecipes() {
    if (RECIPES.length === 0) {
      var d = XJ.data.recipes;
      if (d && d.recipes) RECIPES = d.recipes;
    }
    return RECIPES;
  }

  // 尝试合成某配方
  XJ.craft = function(idx) {
    var recipes = getRecipes();
    var r = recipes[idx];
    if (!r) return { ok: false, msg: '配方不存在' };
    // 检查材料
    for (var i = 0; i < r.materials.length; i++) {
      if (!XJ.hasItem(r.materials[i].name, r.materials[i].count)) {
        return { ok: false, msg: '材料不足: ' + r.materials[i].name };
      }
    }
    // 扣除材料
    for (var i = 0; i < r.materials.length; i++) {
      XJ.removeItem(r.materials[i].name, r.materials[i].count);
    }
    // 添加结果
    XJ.addItem(r.result, 1);
    console.log('[craft] 合成成功: ' + r.result);
    return { ok: true, result: r.result };
  };

  XJ.getRecipeCount = function() { return getRecipes().length; };

  function renderCraftPanel() {
    var el = document.getElementById('craft-content');
    if (!el) return;
    var recipes = getRecipes();
    var html = '<div style="max-height:400px;overflow:auto">';
    for (var i = 0; i < recipes.length; i++) {
      var r = recipes[i];
      var allOk = true;
      var matText = '';
      for (var j = 0; j < r.materials.length; j++) {
        var m = r.materials[j];
        var have = XJ.getItemCount(m.name);
        var need = m.count;
        if (have < need) allOk = false;
        matText += '<span style="color:' + (allOk ? '#ffe' : '#f66') + '">' + m.name + ':' + have + '/' + need + '</span> ';
      }
      html += '<div class="xj-item-row ' + (allOk ? '' : 'disabled') + '" data-idx="' + i + '">';
      html += '<div><b>' + r.result + '</b><br><span style="font-size:11px;color:#aaa">' + matText + '</span></div>';
      html += '<span style="color:#fc6">' + (allOk ? '可合成' : '材料不足') + '</span>';
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;

    // 点击合成
    var rows = el.querySelectorAll('.xj-item-row:not(.disabled)');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var res = XJ.craft(idx);
        if (res.ok) {
          XJ.dialogue.show('合成成功', '【' + res.result + '】合成完成！');
          renderCraftPanel();
        } else {
          XJ.dialogue.show('合成失败', res.msg);
        }
      });
    }
  }

  XJ.openCraft = function() {
    if (XJ_STATE.runtime.ui !== 'map') return;
    renderCraftPanel();
    XJ.showPanel('craft');
    XJ.playBGM('yw.mid');
  };

  XJ.closeCraft = function() {
    XJ.hidePanel();
    XJ.stopBGM();
  };

  console.log('[craft.js] 合成系统加载完成，' + getRecipes().length + ' 配方');
})();
