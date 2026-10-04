/* xj_menu.js —— 主菜单（game.showMenu / M 键）
 *
 * 页签：道具 / 装备 / 技能 / 状态 / 任务 / 合成 / 系统。
 * 数据全部读 XJ_CONFIG / XJParty，不内嵌数值。
 * 键盘：上下移动，左右切页签，回车确认，Esc 关闭/返回。
 */
(function (global) {
  'use strict';
  var XJ = global.XJ;

  var TABS = ['道具', '装备', '技能', '状态', '任务', '合成', '系统'];

  function Menu(world, scene) {
    this.w = world;
    this.scene = scene || null;
    this.tab = 0;
    this.sel = 0;
    this.sub = null;      // {kind, member, list}
    this.msg = null;
    this.active = true;
    this._saveMsg = null;
  }

  Menu.prototype.close = function () { this.active = false; return true; };

  function P() { return global.XJParty; }

  function members(w) { return P() ? P().activeHeroes(w) : []; }

  Menu.prototype.key = function (k) {
    if (k === 'cancel') {
      if (this.sub) { this.sub = null; this.sel = 0; return true; }
      return this.close();
    }
    if (k === 'left') { this.tab = (this.tab + TABS.length - 1) % TABS.length; this.sel = 0; this.sub = null; return true; }
    if (k === 'right') { this.tab = (this.tab + 1) % TABS.length; this.sel = 0; this.sub = null; return true; }
    var list = this.list();
    if (k === 'up') { if (list.length) this.sel = (this.sel + list.length - 1) % list.length; return true; }
    if (k === 'down') { if (list.length) this.sel = (this.sel + list.length + 1) % list.length; return true; }
    if (k === 'ok') { this.act(); return true; }
    return false;
  };

  /** 当前页的行（字符串），供渲染与选择 */
  Menu.prototype.list = function () {
    var w = this.w, self = this;
    var tab = TABS[this.tab];
    if (this.sub) {
      if (this.sub.kind === 'member') return members(w).map(function (h) { return h.name; });
      if (this.sub.kind === 'equipSlot') return ['武器', '服饰', '头饰', '足饰', '饰品'];
      if (this.sub.kind === 'equipItem') {
        return Object.keys(w.items || {}).filter(function (n) {
          return (w.items[n] > 0) && slotOf(n) === self.sub.slot;
        });
      }
      return [];
    }
    if (tab === '道具') {
      return Object.keys(w.items || {}).filter(function (n) { return w.items[n] > 0; });
    }
    if (tab === '装备' || tab === '技能' || tab === '状态') {
      return members(w).map(function (h) { return h.name; });
    }
    if (tab === '任务') return (w.tasks || []).slice();
    if (tab === '合成') {
      var rows = ((XJ.data.config.recipes || {}).rows) || [];
      return rows.map(function (r) { return r.product; });
    }
    if (tab === '系统') return ['存档 0', '存档 1', '存档 2', '读档 0', '读档 1', '读档 2', '帮助', '关于', '声音开/关'];
    return [];
  };

  function slotOf(itemName) {
    var r = P() ? P().itemRow(itemName) : null;
    if (!r) return null;
    return { '武器': '武器', '服饰': '服饰', '头饰': '头饰', '足饰': '足饰', '饰品': '饰品' }[r['类型']] || null;
  }

  Menu.prototype.act = function () {
    var w = this.w, tab = TABS[this.tab], list = this.list();
    var cur = list[this.sel];
    if (cur == null) return false;
    // ---- 子流程 ----
    if (this.sub) {
      if (this.sub.kind === 'member') {
        if (tab === '道具') {
          var r = P().useItem(w, cur, this.sub.item);
          this.msg = r.msg;
          this.sub = null;
          return true;
        }
        if (tab === '装备') { this.sub = { kind: 'equipSlot', member: cur }; this.sel = 0; return true; }
      }
      if (this.sub.kind === 'equipSlot') {
        this.sub = { kind: 'equipItem', member: this.sub.member, slot: cur };
        this.sel = 0;
        return true;
      }
      if (this.sub.kind === 'equipItem') {
        var r2 = P().equip(w, this.sub.member, cur);
        this.msg = r2.msg;
        this.sub = null;
        return true;
      }
      return false;
    }
    // ---- 主流程 ----
    if (tab === '道具') {
      var row = P().itemRow(cur);
      if (row && row['类型'] === '药品') { this.sub = { kind: 'member', item: cur }; this.sel = 0; }
      else if (row && slotOf(cur)) { this.sub = { kind: 'member', item: cur }; this.sel = 0; this.msg = '选队员装备' + cur; }
      else this.msg = cur + '不能直接使用';
      return true;
    }
    if (tab === '装备') { this.sub = { kind: 'member' }; this.sel = 0; return true; }
    if (tab === '技能' || tab === '状态' || tab === '任务') { this.msg = this.detail(tab, cur); return true; }
    if (tab === '合成') {
      var rows = ((XJ.data.config.recipes || {}).rows) || [];
      var rec = null;
      for (var i = 0; i < rows.length; i++) if (rows[i].product === cur) rec = rows[i];
      if (rec) {
        var r3 = P().craft(w, rec.entry);
        this.msg = r3.msg;
      }
      return true;
    }
    if (tab === '系统') { this.system(cur); return true; }
    return false;
  };

  Menu.prototype.detail = function (tab, name) {
    var w = this.w;
    if (tab === '技能') {
      var h = P().heroByName(w, name);
      if (!h) return null;
      var arts = Object.keys(h.arts).filter(function (n) { return h.arts[n].learned; })
        .map(function (n) { return n + ' Lv' + P().artSlv(w, name, n); });
      return '普通：' + h.normalSkills.join('、') + '｜仙术：' + (arts.join('、') || '无');
    }
    if (tab === '状态') {
      var h2 = P().heroByName(w, name);
      if (!h2) return null;
      var st = P().statsOf(h2);
      return h2.name + ' Lv' + h2.level + ' 精' + h2.hp + '/' + st.maxHp +
        ' 神' + h2.mp + '/' + st.maxMp + ' 气' + h2.gas + '/' + st.maxGas +
        ' 武' + st.atk + ' 防' + st.def + ' 速' + st.spd + ' 运' + st.luk +
        ' 经验' + h2.exp + '/' + st.needExp;
    }
    if (tab === '任务') {
      var rows = ((XJ.data.config.tasks || {}).rows) || [];
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i].name) === String(name)) return rows[i].name + '：' + rows[i].desc;
      }
      return name + '（任务表里没有这个名）';
    }
    return null;
  };

  Menu.prototype.system = function (cur) {
    var SV = global.XJSave;
    if (/^存档/.test(cur)) {
      var slot = parseInt(cur.slice(-1), 10);
      if (SV && this.scene) {
        SV.save(this.w, this.scene, slot);
        this.msg = '已存档到槽 ' + slot;
      }
      return;
    }
    if (/^读档/.test(cur)) {
      var slot2 = parseInt(cur.slice(-1), 10);
      if (SV && this.scene) {
        // ★ apply 里已经 load 过一次，这里不再重复进图
        if (SV.apply(SV.load(slot2), this.w, this.scene)) {
          this.msg = '已读档';
          this.close();
        } else this.msg = '槽 ' + slot2 + ' 为空';
      }
      return;
    }
    if (cur === '帮助') {
      var g = ((XJ.data.config.gameCfg || {}).scalars) || {};
      this.msg = String(g['帮助'] || '无').slice(0, 120);
      return;
    }
    if (cur === '关于') {
      var g2 = ((XJ.data.config.gameCfg || {}).scalars) || {};
      this.msg = String(g2['关于'] || '无').slice(0, 80);
      return;
    }
    if (cur === '声音开/关') {
      if (global.XJAudio) this.msg = global.XJAudio.toggle();
      return;
    }
  };

  Menu.prototype.render = function (ctx, W, H) {
    if (!this.active) return false;
    var list = this.list();
    ctx.save();
    var bw = W - 40, bh = Math.min(H - 60, 30 + Math.max(list.length, 1) * 17 + 44);
    var bx = 20, by = 20;
    ctx.fillStyle = 'rgba(0,0,12,.93)';
    ctx.strokeStyle = '#6a6a8a';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textBaseline = 'top';
    // 页签
    for (var i = 0; i < TABS.length; i++) {
      ctx.fillStyle = i === this.tab ? '#ffd76a' : '#666';
      ctx.fillText(TABS[i], bx + 8 + i * 52, by + 6);
    }
    ctx.fillStyle = '#c8c8d0';
    ctx.fillText('金 ' + this.w.gold + (this.sub ? '（选目标中，Esc 返回）' : ''), bx + 8, by + 24);
    var y = by + 44;
    if (!list.length) {
      ctx.fillStyle = '#888';
      ctx.fillText('（空）', bx + 8, y);
    }
    for (var k = 0; k < list.length; k++) {
      if (y > by + bh - 40) break;
      ctx.fillStyle = k === this.sel ? '#ffd76a' : '#c8c8d0';
      var line = (k === this.sel ? '▶ ' : '　') + list[k];
      if (TABS[this.tab] === '道具' && !this.sub && this.w.items[list[k]] > 1) line += ' ×' + this.w.items[list[k]];
      ctx.fillText(line, bx + 8, y);
      y += 17;
    }
    if (this.msg) {
      ctx.fillStyle = '#8cf';
      ctx.fillText(String(this.msg).slice(0, 44), bx + 8, by + bh - 18);
    }
    ctx.restore();
    return true;
  };

  global.XJMenu = { Menu: Menu, TABS: TABS };
})(typeof window !== 'undefined' ? window : globalThis);
