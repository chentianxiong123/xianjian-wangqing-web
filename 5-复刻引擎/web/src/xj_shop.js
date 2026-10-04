/* xj_shop.js —— 商店界面
 *
 * 由 system.trade(<物品|物品|…>) 触发（e.java:3093 把参数按 | 切分装袋后开商店）。
 * 商品价格与说明全部读 XJ_CONFIG.items（config_item.str），不内嵌数值。
 *
 * 物品表结构（i.java:9-25）：
 *   名称 | 类型(武器0 服饰1 头饰2 足饰3 饰品4 药品5 材料6 特殊7 合成9 默认8)
 *        | 价格 | 限定角色(重楼0 月瑶1 紫萱2 女3 默认4=不限)
 *        | 属性4(i) 属性5(j) 属性6(k) 属性7(l) 属性8(丢弃) 属性9(m)
 *        | 属性10(n) 属性11(o) | 效果值(e) | 效果文本(g) | 说明(h)
 */
(function (global) {
  'use strict';
  var XJ = global.XJ;

  /** 按名取物品行；找不到返回 null */
  function itemRow(name) {
    var T = (XJ.data.config && XJ.data.config.items) || {};
    var rows = T.rows || [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i]['名称'] === name) return rows[i];
    }
    return null;
  }

  function priceOf(name) {
    var r = itemRow(name);
    return r ? (parseInt(r['价格'], 10) || 0) : 0;
  }

  function descOf(name) {
    var r = itemRow(name);
    return r ? (r['说明'] || '') : '';
  }

  function typeOf(name) {
    var r = itemRow(name);
    return r ? (r['类型'] || '') : '';
  }

  /** 买价 = 价格；卖价 = 价格/2 向下取整（与原版 backTo 的回收逻辑一致性待验证） */
  function buyPrice(name) { return priceOf(name); }
  function sellPrice(name) { return Math.floor(priceOf(name) / 2); }

  /**
   * Shop 会话。
   * @param world  World（读写 gold / items）
   * @param items  商品名数组
   */
  function Shop(world, items) {
    this.w = world;
    this.goods = (items || []).filter(Boolean);
    this.sel = 0;
    this.mode = 'buy';            // buy 买入 | sell 卖出
    this.msg = null;
    this.active = true;
    this.trace = [];
  }

  Shop.prototype.close = function () { this.active = false; return true; };

  Shop.prototype.switchMode = function () {
    this.mode = this.mode === 'buy' ? 'sell' : 'buy';
    this.sel = 0;
    return this.mode;
  };

  Shop.prototype.sellable = function () {
    var out = [];
    var items = this.w.items || {};
    for (var k in items) {
      if (items[k] > 0) out.push({ name: k, count: items[k], price: sellPrice(k) });
    }
    return out;
  };

  Shop.prototype.options = function () {
    var self = this;
    if (this.mode === 'sell') return this.sellable();
    return this.goods.map(function (n) {
      return { name: n, price: buyPrice(n), desc: descOf(n), type: typeOf(n) };
    });
  };

  /** 买当前选中（数量 1） */
  Shop.prototype.buy = function () {
    var o = this.options()[this.sel];
    if (!o) { this.msg = '无商品'; return false; }
    if (this.w.gold < o.price) { this.msg = '金钱不足'; return false; }
    this.w.gold -= o.price;
    this.w.addItem(o.name, 1);
    this.msg = '购得 ' + o.name;
    this.trace.push('buy ' + o.name + ' ' + o.price);
    return true;
  };

  /** 卖当前选中（数量 1） */
  Shop.prototype.sell = function () {
    var o = this.options()[this.sel];
    if (!o) { this.msg = '无可卖物品'; return false; }
    if ((this.w.items[o.name] || 0) <= 0) { this.msg = '没有 ' + o.name; return false; }
    this.w.removeItem(o.name, 1);
    this.w.gold += o.price;
    this.msg = '卖出 ' + o.name + ' +' + o.price;
    this.trace.push('sell ' + o.name + ' ' + o.price);
    return true;
  };

  Shop.prototype.act = function () {
    return this.mode === 'buy' ? this.buy() : this.sell();
  };

  /** 键盘：上下移动，左右切换买卖，确认执行，取消关闭 */
  Shop.prototype.key = function (e) {
    var n = this.options().length;
    if (e === 'up') { if (n) this.sel = (this.sel + n - 1) % n; return true; }
    if (e === 'down') { if (n) this.sel = (this.sel + 1) % n; return true; }
    if (e === 'left' || e === 'right') { this.switchMode(); return true; }
    if (e === 'ok') { this.act(); return true; }
    if (e === 'cancel') { this.close(); return true; }
    return false;
  };

  Shop.prototype.state = function () {
    return {
      active: this.active, mode: this.mode, sel: this.sel,
      gold: this.w.gold, msg: this.msg,
      options: this.options(), trace: this.trace.slice()
    };
  };

  /** 渲染：J2ME 风格商品列表 */
  Shop.prototype.render = function (ctx, W, H) {
    if (!this.active) return false;
    var st = this.state();
    ctx.save();
    var bw = W - 40, bh = Math.min(H - 90, 26 + Math.max(st.options.length, 1) * 17 + 30);
    var bx = 20, by = 30;
    ctx.fillStyle = 'rgba(0,0,12,.92)';
    ctx.strokeStyle = '#6a6a8a';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffd76a';
    ctx.fillText((this.mode === 'buy' ? '买入' : '卖出（←→切换）') + '　金 ' + this.w.gold, bx + 8, by + 6);
    var y = by + 26;
    if (!st.options.length) {
      ctx.fillStyle = '#888';
      ctx.fillText(this.mode === 'buy' ? '（无商品）' : '（背包是空的）', bx + 8, y);
    }
    for (var i = 0; i < st.options.length; i++) {
      var o = st.options[i];
      ctx.fillStyle = i === this.sel ? '#ffd76a' : '#c8c8d0';
      var line = (i === this.sel ? '▶ ' : '　') + o.name + '  ' + o.price;
      if (o.count != null) line += ' ×' + o.count;
      if (o.desc) line += '  ' + String(o.desc).slice(0, 18);
      ctx.fillText(line, bx + 8, y);
      y += 17;
      if (y > by + bh - 22) break;
    }
    if (this.msg) {
      ctx.fillStyle = '#8cf';
      ctx.fillText(this.msg, bx + 8, by + bh - 18);
    }
    ctx.restore();
    return true;
  };

  global.XJShop = {
    Shop: Shop, itemRow: itemRow, priceOf: priceOf,
    descOf: descOf, typeOf: typeOf, buyPrice: buyPrice, sellPrice: sellPrice
  };
})(typeof window !== 'undefined' ? window : globalThis);