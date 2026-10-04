// ============================================================
// src/quest.js — 任务系统 (Agent-S6)
// 任务激活/完成/追踪显示
// ============================================================
(function() {
  var TASKS = {};  // 从 XJ_DATA_TASKS 读取

  function getTasks() {
    if (!TASKS || !Object.keys(TASKS).length) {
      var t = XJ.data.tasks;
      if (t && t.tasks) {
        for (var i = 0; i < t.tasks.length; i++) {
          TASKS[t.tasks[i].name] = t.tasks[i];
        }
      }
    }
    return TASKS;
  }

  // ---- 任务操作 ----
  XJ.setActiveQuest = function(questName) {
    var tasks = getTasks();
    if (!tasks[questName]) {
      console.warn('[quest] 未知任务:', questName);
      return false;
    }
    XJ_STATE.flags.quest[questName] = 'active';
    console.log('[quest] 激活任务:', questName);
    showQuestPanel();
    return true;
  };

  XJ.completeQuest = function(questName) {
    if (!XJ_STATE.flags.quest[questName]) return false;
    XJ_STATE.flags.quest[questName] = 'done';
    console.log('[quest] 完成任务:', questName);
    XJ.dialogue.show('任务完成', '【' + questName + '】已完成');
    return true;
  };

  XJ.isQuestActive = function(questName) {
    return XJ_STATE.flags.quest[questName] === 'active';
  };

  XJ.isQuestDone = function(questName) {
    return XJ_STATE.flags.quest[questName] === 'done';
  };

  XJ.getActiveQuest = function() {
    var quest = XJ_STATE.flags.quest;
    for (var name in quest) {
      if (quest[name] === 'active') return name;
    }
    return null;
  };

  XJ.getQuestStats = function() {
    var quest = XJ_STATE.flags.quest;
    var active = 0, done = 0;
    for (var name in quest) {
      if (quest[name] === 'active') active++;
      else if (quest[name] === 'done') done++;
    }
    return { active: active, done: done, total: active + done };
  };

  // ---- 任务面板显示 ----
  function renderQuestList() {
    var el = document.getElementById('quest-content');
    if (!el) return;
    var tasks = getTasks();
    var html = '';

    // 当前活跃任务
    var activeQuest = XJ.getActiveQuest();
    if (activeQuest) {
      var task = tasks[activeQuest];
      html += '<div style="background:#246;padding:8px 12px;border-radius:6px;margin-bottom:12px">';
      html += '<div style="color:#fc6;font-weight:bold">▶ ' + activeQuest + '</div>';
      html += '<div style="color:#cce;font-size:13px;margin-top:4px">' + (task ? task.desc : '') + '</div>';
      html += '</div>';
    } else {
      html += '<div style="color:#999;padding:8px 12px">当前无活跃任务</div>';
    }

    // 所有任务列表
    html += '<div style="color:#9af;margin:12px 0 6px">全部任务 (' + Object.keys(tasks).length + ')</div>';
    html += '<div style="max-height:300px;overflow:auto">';
    for (var name in tasks) {
      var status = XJ_STATE.flags.quest[name];
      var icon = status === 'done' ? '✓' : (status === 'active' ? '▶' : '○');
      var color = status === 'done' ? '#6c6' : (status === 'active' ? '#fc6' : '#888');
      html += '<div style="padding:3px 8px;color:' + color + '">';
      html += icon + ' ' + name;
      html += '</div>';
    }
    html += '</div>';

    el.innerHTML = html;
  }

  function showQuestPanel() {
    renderQuestList();
    XJ.showPanel('quest');
  }

  // 键盘 Tab 打开任务
  XJ.openQuest = function() {
    showQuestPanel();
  };

  console.log('[quest.js] 任务系统加载完成');
})();
