// ============================================================
// src/battle.js - Turn-based Battle System (Agent-S3)
// ============================================================
(function() {
  var BATTLE = null;
  var BATTLE_STATE = null;
  var TURN_ORDER = [];
  var BATTLE_BG_IMAGE = null;
  var BATTLE_BG_NAME = '';

  function parseFormula(expr, lv, atk, spLevel) {
    try {
      return eval(expr.replace(/lv/g, lv||1).replace(/atk/g, atk||100).replace(/slv/g, spLevel||1));
    } catch(e) { return atk || 100; }
  }

  function calcEnemyHp(enemyTemplate, level) {
    var lv = level || 1;
    return parseFormula(enemyTemplate.hpMin || '(100+26*lv)', lv, 0, 0);
  }

  function calcEnemyAtk(enemyTemplate, level) {
    var lv = level || 1;
    return parseFormula(enemyTemplate.atk || '(40+10*lv)', lv, 0, 0);
  }

  function startBattle(encounterKey) {
    var enemies = XJ.data.enemies;
    if (!enemies || !enemies.encounters[encounterKey]) {
      console.warn('[battle] Unknown encounter:', encounterKey);
      return;
    }
    var enc = enemies.encounters[encounterKey];
    var ids = enc.enemyIds.split('-');
    var enemyTemplates = [];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i].trim();
      var tmpl = enemies.enemyTemplates[id];
      if (tmpl) enemyTemplates.push(tmpl);
    }
    if (enemyTemplates.length === 0) return;

    BATTLE_BG_NAME = enc.battleBg || 'fight_beijing.bin';
    BATTLE_BG_IMAGE = null;

    BATTLE_STATE = {
      mapId: XJ_STATE.mapId,
      turns: 0,
      log: [],
      running: true,
      playerTurn: true,
      players: XJ_STATE.party.map(function(p) {
        return {
          id: p.id,
          name: p.name,
          hp: p.hp, maxHp: p.maxhp,
          sp: p.sp, maxSp: p.maxsp,
          mp: p.mp, maxMp: p.maxmp,
          atk: p.atk, def: p.def,
          skills: p.skills || [],
          spells: p.spells || [],
          active: p.hp > 0
        };
      }),
      enemies: enemyTemplates.map(function(t, idx) {
        var lvl = parseInt(enc.levelRange) || 1;
        return {
          id: t.id,
          name: t.name,
          hp: calcEnemyHp(t, lvl),
          maxHp: calcEnemyHp(t, lvl),
          atk: calcEnemyAtk(t, lvl),
          spd: parseInt(t.spdMin) || 10,
          active: true,
          index: idx
        };
      }),
      encounterKey: encounterKey,
      victory: false,
      defeated: false
    };

    XJ.showPanel('battle');
    renderBattle();
    XJ.playBGM(XJ.mapBGM(XJ_STATE.mapId));
  }

  function renderBattle() {
    var el = document.getElementById('battle-content');
    if (!el || !BATTLE_STATE || !BATTLE_STATE.running) return;

    var bs = BATTLE_STATE;
    var html = '<div id="battle-bg" style="background:#222;border-radius:6px;padding:8px;margin-bottom:8px">';
    html += '<div style="color:#fc6;font-size:13px;margin-bottom:8px">Turn ' + (bs.turns + 1) + '</div>';

    // Enemy status
    html += '<div style="color:#f99;margin:4px 0">Enemies:</div>';
    for (var i = 0; i < bs.enemies.length; i++) {
      var e = bs.enemies[i];
      var hpBar = '<div style="background:#444;height:8px;border-radius:4px;width:100px;display:inline-block"><div style="background:#c44;height:8px;border-radius:4px;width:' + (e.hp/e.maxHp*100) + '%"></div></div>';
      html += '<div style="display:inline-block;margin-right:12px;vertical-align:top">' +
              (e.active ? '<b style="color:#ffe">' + e.name + '</b>' : '<b style="color:#666;text-decoration:line-through">' + e.name + '</b>') +
              '<div style="color:#aaa;font-size:11px">HP ' + hpBar + '</div></div>';
    }

    // Player status
    html += '<div style="color:#9cf;margin:8px 0">Party:</div>';
    for (var j = 0; j < bs.players.length; j++) {
      var p = bs.players[j];
      var hpPct = Math.max(0, p.hp / p.maxHp * 100);
      var mpPct = Math.max(0, p.mp / p.maxMp * 100);
      html += '<div style="display:inline-block;margin-right:16px;vertical-align:top">' +
              (p.active ? '<b style="color:#ffe">' + p.name + '</b>' : '<b style="color:#666;text-decoration:line-through">' + p.name + '</b>') +
              '<div style="color:#aaa;font-size:11px">HP ' +
              '<div style="background:#444;height:6px;border-radius:3px;width:80px;display:inline-block"><div style="background:' + (hpPct > 30 ? '#6c4' : '#c44') + ';height:6px;border-radius:3px;width:' + hpPct + '%"></div></div>' +
              p.hp + '/' + p.maxHp + '</div>' +
              '<div style="color:#aaa;font-size:11px">MP ' +
              '<div style="background:#444;height:6px;border-radius:3px;width:80px;display:inline-block"><div style="background:#46c;height:6px;border-radius:3px;width:' + mpPct + '%"></div></div>' +
              p.mp + '/' + p.maxMp + '</div></div>';
    }
    html += '</div>';

    // Log
    html += '<div id="battle-log" style="max-height:150px;overflow:auto;background:#111;border-radius:4px;padding:6px;font-size:12px;color:#8fa;margin-bottom:8px">';
    var logStart = Math.max(0, bs.log.length - 10);
    for (var k = logStart; k < bs.log.length; k++) {
      html += '<div>' + bs.log[k] + '</div>';
    }
    html += '</div>';

    // Action buttons
    html += '<div id="battle-actions">';
    if (!bs.victory && !bs.defeated) {
      html += '<button class="battle-btn" data-action="attack">Attack</button>';
      for (var s = 0; s < bs.players.length; s++) {
        var p = bs.players[s];
        if (!p.active) continue;
        html += '<div style="color:#fc6;margin:4px 0">' + p.name + '</div>';
        for (var sp2 = 0; sp2 < p.spells.length; sp2++) {
          var spell = p.spells[sp2];
          html += '<button class="battle-btn spell-btn" data-action="spell" data-char="' + s + '" data-spell="' + spell + '">' + spell + '</button> ';
        }
      }
      html += '<button class="battle-btn" data-action="flee">Flee</button>';
    } else if (bs.victory) {
      html += '<div style="color:#6f6;font-size:18px">Victory!</div>';
    } else if (bs.defeated) {
      html += '<div style="color:#f66;font-size:18px">Defeated...</div>';
    }
    html += '</div>';

    el.innerHTML = html;
    bindBattleActions();
    // Scroll log to bottom
    var logEl = document.getElementById('battle-log');
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
  }

  function bindBattleActions() {
    var el = document.getElementById('battle-content');
    var btns = el.querySelectorAll('.battle-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        var charIdx = this.getAttribute('data-char');
        var spell = this.getAttribute('data-spell');
        if (action === 'attack') battleAttack(charIdx);
        else if (action === 'spell') battleSpell(parseInt(charIdx), spell);
        else if (action === 'flee') battleFlee();
      });
    }
  }

  function battleAttack(playerIdx) {
    var p = BATTLE_STATE.players[playerIdx];
    if (!p || !p.active || !BATTLE_STATE.playerTurn) return;
    var target = findAliveEnemy();
    if (!target) return;
    var dmg = Math.max(1, Math.floor(p.atk * (0.8 + Math.random() * 0.4)));
    target.hp = Math.max(0, target.hp - dmg);
    BATTLE_STATE.log.push(p.name + ' attacks ' + target.name + ' for ' + dmg + ' damage!');
    if (target.hp <= 0) {
      target.active = false;
      BATTLE_STATE.log.push(target.name + ' is defeated!');
    }
    renderBattle();
    checkBattleEnd();
  }

  function battleSpell(playerIdx, spellName) {
    var p = BATTLE_STATE.players[playerIdx];
    if (!p || !p.active || !BATTLE_STATE.playerTurn) return;
    var skills = XJ.data.skills ? XJ.data.skills.skills : [];
    var skill = skills.find(function(s) { return s.name === spellName; });
    if (skill && p.mp >= skill.spCost) {
      p.mp -= skill.spCost;
      var dmg = parseFormula(skill.formula, p.level, p.atk, 1);
      var target = findAliveEnemy();
      if (target) {
        target.hp = Math.max(0, target.hp - dmg);
        BATTLE_STATE.log.push(p.name + ' uses ' + spellName + ' on ' + target.name + ' for ' + dmg + '!');
        if (target.hp <= 0) { target.active = false; BATTLE_STATE.log.push(target.name + ' defeated!'); }
      }
      renderBattle();
      checkBattleEnd();
    }
  }

  function battleFlee() {
    if (Math.random() < 0.5) {
      BATTLE_STATE.log.push('Escaped!');
      setTimeout(closeBattle, 500);
    } else {
      BATTLE_STATE.log.push('Failed to escape!');
      renderBattle();
      setTimeout(enemyTurn, 600);
    }
  }

  function enemyTurn() {
    if (!BATTLE_STATE || !BATTLE_STATE.running) return;
    var bs = BATTLE_STATE;
    for (var i = 0; i < bs.enemies.length; i++) {
      var e = bs.enemies[i];
      if (!e.active) continue;
      var targets = bs.players.filter(function(p) { return p.active; });
      if (targets.length === 0) break;
      var target = targets[Math.floor(Math.random() * targets.length)];
      var dmg = Math.max(1, Math.floor(e.atk * (0.7 + Math.random() * 0.6)));
      target.hp = Math.max(0, target.hp - dmg);
      bs.log.push(e.name + ' attacks ' + target.name + ' for ' + dmg + '!');
      if (target.hp <= 0) {
        target.active = false;
        bs.log.push(target.name + ' fainted!');
      }
    }
    bs.turns++;
    bs.playerTurn = true;
    renderBattle();
    checkBattleEnd();
  }

  function checkBattleEnd() {
    if (!BATTLE_STATE) return;
    var bs = BATTLE_STATE;
    var enemiesAlive = bs.enemies.some(function(e) { return e.active; });
    var playersAlive = bs.players.some(function(p) { return p.active; });
    if (!enemiesAlive) {
      bs.victory = true;
      // Rewards
      var xp = Math.floor(Math.random() * 50) + 20;
      var gold = Math.floor(Math.random() * 30) + 10;
      XJ.gainExp('chonglou', xp);
      XJ_STATE.money += gold;
      bs.log.push('Victory! +' + xp + ' EXP, +' + gold + ' gold');
      renderBattle();
      setTimeout(closeBattle, 1500);
    } else if (!playersAlive) {
      bs.defeated = true;
      bs.log.push('...');
      renderBattle();
      setTimeout(function() {
        // Heal all
        bs.players.forEach(function(p) { p.hp = p.maxHp; p.active = true; });
        closeBattle();
      }, 2000);
    }
  }

  function findAliveEnemy() {
    if (!BATTLE_STATE) return null;
    var alive = BATTLE_STATE.enemies.filter(function(e) { return e.active; });
    return alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
  }

  function closeBattle() {
    if (BATTLE_STATE) {
      BATTLE_STATE.running = false;
      BATTLE_STATE = null;
      BATTLE = null;
    }
    XJ.hidePanel();
    XJ.stopBGM();
    // Restore HP after battle (optional)
    XJ_STATE.party.forEach(function(p) {
      p.hp = Math.min(p.hp + Math.floor(p.maxhp * 0.1), p.maxhp);
    });
  }

  XJ.openBattle = function(encounterKey) {
    if (XJ_STATE.runtime.ui !== 'map') return;
    startBattle(encounterKey);
  };

  XJ.closeBattle = closeBattle;

  console.log('[battle.js] Battle system loaded');
})();
