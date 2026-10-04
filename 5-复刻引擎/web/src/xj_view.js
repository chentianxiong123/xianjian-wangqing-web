/* xj_view.js —— 场景渲染：地砖层 + 元素层 + 遮挡层 + 角色
 *
 * 地图三层（mapfile 解析结果）：
 *   layer 0 地砖   —— 有 cols×rows 的地砖网格，值为 tileBin 的条目下标
 *   layer 1 元素   —— 元素对象 [animStateIndex, x, y, script]，用 elementAnt 绘制
 *   layer 2 遮挡   —— 元素对象，画在角色之上（门框、屋檐等）
 *
 * 视口用 XJ.Viewport，元素绘制直接复用 XJ.drawState，
 * 因此 flags 映射与动画时序只在一处实现。
 */
(function (global) {
  'use strict';
  var XJ = global.XJ;

  function Scene(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    // 原版是 1:1 直贴（PIX/PNG 尺寸与裁剪表 w×h 完全一致），
    // 关掉插值既能保证像素级一致，也避免缩放采样带来的 ±1 舍入。
    this.ctx.imageSmoothingEnabled = false;
    this.mapName = null;
    this.m = null;
    this.vp = new XJ.Viewport(canvas.width, canvas.height);
    this.t0 = performance.now();
    this.player = { x: 0, y: 0, dir: 'down', state: '站立', ant: null, t: 0 };
    this.world = new global.XJWorld();
    this.dialog = null;     // 当前对话 {speaker,text,visible}
    this.dialogBox = null;  // {text, speaker, type, visible}
    this.branch = null;     // 分支选项
    this.trade = null;      // 商店
    this.npcs = [];        // {x,y,dir,state,ant}
    this.showGrid = false;
    this.showHitbox = false;
    this.stats = { tiles: 0, objs: 0, elements: 0, frames: 0, miss: 0, pending: 0 };
  }

  Scene.prototype.load = function (mapName, px, py) {
    var m = XJ.map(mapName);
    if (!m) return false;
    this.mapName = mapName;
    this.m = m;
    this.px = px != null ? px : Math.floor(m.cols * m.tw / 2);
    this.py = py != null ? py : Math.floor(m.rows * m.th / 2);
    // ★ 装配世界：跑地图级脚本 + 逐个对象脚本，真正把 NPC/怪物/宝箱等建出来
    this.world.build(mapName, this.px, this.py);
    // 地图级脚本里的 world.change 是进图即切图（可能连锁），限制深度防死循环
    if (this.world.pendingChange && (this._warpDepth || 0) < 4) {
      var c = this.world.pendingChange;
      this._warpDepth = (this._warpDepth || 0) + 1;
      this._warpGuard = mapName + '>' + c.map;
      if (this._warpGuard !== this._lastWarp) {
        this._lastWarp = this._warpGuard;
        this.log('剧情切图 → ' + c.map + ' @' + c.x + ',' + c.y);
        var okWarp = this.goto(c.map, c.x, c.y, c.dir);
        this._warpDepth--;
        return okWarp;
      }
      this._warpDepth--;
    }
    this.checkZones();
    return true;
  };

  /**
   * 切换地图。保留事件标记/背包/队伍等全局状态，只重装地图内容。
   * @param mapName 目标地图
   * @param x,y 落点（像素）；缺省用出口数据里的落点
   */
  Scene.prototype.goto = function (mapName, x, y, dir) {
    var prev = this.mapName;
    var px = x, py = y;
    if (px == null || py == null) {
      var ex = this.world.nearestExit(px || this.px, py || this.py, dir || this.player.dir);
      if (ex) { px = ex.x; py = ex.y; }
    }
    if (!this.load(mapName, px, py)) return false;
    if (dir) this.player.dir = dir;
    this.log('切图 ' + prev + ' → ' + mapName + ' @' + this.px + ',' + this.py);
    return true;
  };

  /** 处理一个触发区；返回是否发生了切图 */
  Scene.prototype.fireZone = function (z) {
    var r = this.world.fireZone(z);
    // player.moveTo(-1, y) —— -1 保持不变
    if (r.moveTo) {
      if (r.moveTo.x != null) this.px = r.moveTo.x;
      if (r.moveTo.y != null) this.py = r.moveTo.y;
    }
    if (r.dialog) {
      this.dialogBox = { text: r.dialog.text, speaker: r.dialog.speaker, type: null, visible: true };
    }
    if (this.world.playerDir) { this.player.dir = this.world.playerDir; }
    if (r.change) {
      var c = r.change;
      if (this.goto(c.map, c.x, c.y, c.dir)) return true;
    }
    return false;
  };

  /** 检查玩家当前位置的触发区 */
  Scene.prototype.checkZones = function () {
    var zs = this.world.zonesAt(this.px, this.py);
    for (var i = 0; i < zs.length; i++) {
      if (this.fireZone(zs[i])) return true;
    }
    return false;
  };

  /** 引擎侧日志（同时打到侧栏日志框） */
  Scene.prototype.log = function (msg) {
    this.messages = this.messages || [];
    this.messages.push(msg);
    if (this.messages.length > 200) this.messages.shift();
    if (this.onLog) this.onLog(msg);
    return msg;
  };

  Scene.prototype.mapPxW = function () { return this.m ? this.m.cols * this.m.tw : 0; };
  Scene.prototype.mapPxH = function () { return this.m ? this.m.rows * this.m.th : 0; };

  // ---------------------------------------------------------- 移动
  var DIRS = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
  };

  /** 尝试移动；返回是否真的移动了（撞边界则 false） */
  Scene.prototype.tryMove = function (dir) {
    if (!this.m) return false;
    var d = DIRS[dir];
    if (!d) return false;
    this.player.dir = dir;
    var nx = this.px + d[0] * this.m.tw;
    var ny = this.py + d[1] * this.m.th;
    if (nx < 0 || ny < 0 ||
        nx >= this.mapPxW() || ny >= this.mapPxH()) return false;
    this.px = nx; this.py = ny;
    this.player.state = '走路';
    this.checkZones();
    return true;
  };

  // ---------------------------------------------------------- 地砖
  Scene.prototype.drawTiles = function () {
    var m = this.m, ctx = this.ctx, vp = this.vp;
    if (!m) return;
    var n = 0;
    for (var li = 0; li < m.layers.length; li++) {
      var L = m.layers[li];
      if (!L.t) continue;                       // 该层无网格
      var c0 = Math.max(0, Math.floor(vp.x / m.tw));
      var c1 = Math.min(m.cols - 1, Math.ceil((vp.x + vp.w) / m.tw));
      var r0 = Math.max(0, Math.floor(vp.y / m.th));
      var r1 = Math.min(L.t.length - 1, Math.ceil((vp.y + vp.h) / m.th));
      for (var r = r0; r <= r1; r++) {
        var row = XJ.tileRow(m, li, r);
        if (!row) continue;
        for (var c = c0; c <= c1; c++) {
          var v = row[c];
          if (v < 0) continue;              // 0xFFFF 读作 -1 = 本格无地砖
          var st = XJ.spriteState(m.tileBin, v);
          if (st === 'missing') { this.stats.miss++; continue; }
          if (st !== 'ok') { this.stats.pending++; continue; }
          var im = XJ.sprite(m.tileBin, v);
          var dx = c * m.tw - vp.x, dy2 = r * m.th - vp.y;
          if (im.naturalWidth === m.tw && im.naturalHeight === m.th) {
            ctx.drawImage(im, dx, dy2);          // 1:1 直贴，零重采样
          } else {
            ctx.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, dx, dy2, m.tw, m.th);
          }
          n++;
        }
      }
    }
    this.stats.tiles = n;
  };

  // ---------------------------------------------------------- 元素层
  Scene.prototype.drawObjects = function (layerIdx) {
    var m = this.m, ctx = this.ctx, vp = this.vp, t = performance.now() - this.t0;
    if (!m) return;
    var L = m.layers[layerIdx];
    if (!L) return;
    // 该地图可能用多个元素 ANT（addToNpc 各自带 ant），这里统一用 elementAnt
    var antName = m.elementAnt;
    var a = antName ? XJ.data.ant.ants[antName] : null;
    var n = 0;
    for (var i = 0; i < L.o.length; i++) {
      var o = L.o[i];
      var x = o[1] - vp.x, y = o[2] - vp.y;
      if (x < -80 || x > vp.w + 80 || y < -120 || y > vp.h + 80) continue;
      if (!a || o[0] < 0 || o[0] >= a.states.length) { this.stats.miss++; continue; }
      // 每个对象用「绝对时间 - 位置哈希」做相位偏移，避免整齐同步
      XJ.drawState(ctx, antName, a.states[o[0]], x, y,
        t + (o[1] * 31 + o[2] * 17) % 1000, true);
      n++;
    }
    this.stats.objs += n;
  };

  /**
   * 绘制脚本装配出来的元素（自带 ANT 的 NPC / 怪物 / 宝箱 / 鸟 / 云 …）。
   * 与 drawObjects 的区别：这些元素有【自己的 ANT】，不用地图的 elementAnt。
   */
  Scene.prototype.drawElements = function () {
    var els = this.world.elements, ctx = this.ctx, vp = this.vp;
    if (!els) return;
    var t = performance.now() - this.t0;
    var n = 0;
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      var x = e.x - vp.x, y = e.y - vp.y;
      if (x < -80 || x > vp.w + 80 || y < -120 || y > vp.h + 80) continue;
      var antName = e.ant || this.m.elementAnt;
      var a = antName ? XJ.data.ant.ants[antName] : null;
      if (!a) { this.stats.miss++; continue; }
      // 有自己 ANT 的用状态名解析；没有的退回 anim 索引
      var st = e.ant ? XJ.resolveState(antName, e.state, e.dir)
                     : (e.anim >= 0 && e.anim < a.states.length ? a.states[e.anim] : null);
      if (!st) { this.stats.miss++; continue; }
      // 每个元素用位置哈希做相位偏移，避免整齐同步
      XJ.drawState(ctx, antName, st, x, y, t + ((e.x * 31 + e.y * 17) % 1000), true);
      n++;
    }
    this.stats.elements = n;
  };

  // ---------------------------------------------------------- 角色
  Scene.prototype.drawActor = function (x, y, dir, baseState, antName, tOffset) {
    var ctx = this.ctx;
    if (!antName || !XJ.data.ant.ants[antName]) { this.stats.miss++; return false; }
    var st = XJ.resolveState(antName, baseState, dir);
    if (!st) { this.stats.miss++; return false; }
    XJ.drawState(ctx, antName, st, x - this.vp.x, y - this.vp.y,
      (performance.now() - this.t0) + (tOffset || 0), true);
    this.stats.frames++;
    return true;
  };

  // ---------------------------------------------------------- 对话框
  /** 画 J2ME 风格的底部对话框 */
  Scene.prototype.drawDialog = function () {
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    var d = this.dialogBox || this.dialog;
    if (!d || d.visible === false || !d.text) return false;
    var pad = 4;
    var boxH = 58, boxY = H - boxH - pad;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.82)';
    ctx.strokeStyle = '#6a6a8a';
    ctx.lineWidth = 1;
    ctx.fillRect(pad, boxY, W - pad * 2, boxH);
    ctx.strokeRect(pad + .5, boxY + .5, W - pad * 2 - 1, boxH - 1);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textBaseline = 'top';
    var tx = pad + 8;
    if (d.speaker) {
      ctx.fillStyle = '#ffd76a';
      var name = String(d.speaker);
      ctx.fillText(name, tx, boxY + 6);
      var nw = ctx.measureText(name).width;
      ctx.fillStyle = '#c8c8d0';
      var body = String(d.text);
      if (body.indexOf(name) === 0) body = body.slice(name.length).replace(/^[：:]/, '');
      wrapText(ctx, body, tx + nw + 8, boxY + 6, W - pad * 2 - nw - 20, 16);
    } else {
      ctx.fillStyle = '#c8c8d0';
      wrapText(ctx, String(d.text), tx, boxY + 6, W - pad * 2 - 16, 16);
    }
    // 右下角提示
    if (this._blink && !this.branch) {
      ctx.fillStyle = '#8a8aa0';
      ctx.font = '11px monospace';
      ctx.fillText('▼', W - pad - 14, boxY + boxH - 15);
    }
    ctx.restore();
    return true;
  };

  function wrapText(ctx, text, x, y, maxW, lh) {
    var line = '', yy = y;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var t = line + ch;
      if (ctx.measureText(t).width > maxW && line) {
        ctx.fillText(line, x, yy); yy += lh; line = ch;
      } else line = t;
    }
    if (line) ctx.fillText(line, x, yy);
    return yy;
  }

  // ---------------------------------------------------------- 主循环
  Scene.prototype.render = function () {
    var ctx = this.ctx, m = this.m;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    if (!m) { this.hud('未加载地图'); return; }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    this.stats.tiles = 0; this.stats.objs = 0;
    this.stats.frames = 0; this.stats.miss = 0; this.stats.pending = 0;
    this.stats.elements = 0;

    this.vp.centerOn(this.px, this.py, this.mapPxW(), this.mapPxH());

    this.drawTiles();
    this.drawObjects(1);                       // 元素层（无脚本对象，用地图 elementAnt）
    this.drawElements();                       // 脚本装配出的元素（自带 ANT）
    // 主角：优先用玩家自己的 ANT（renwu），否则退回地图元素 ANT 的 站立
    this.drawActor(this.px, this.py, this.player.dir, this.player.state,
      this.player.ant || m.elementAnt, 0);
    this.drawObjects(2);                       // 遮挡层盖在角色之上

    // 闪烁提示
    this._blink = ((performance.now() / 500) | 0) % 2 === 0;

    this.drawDialog();
    if (this.showGrid) this.drawGrid();
    this.hud();
  };

  Scene.prototype.drawGrid = function () {
    var m = this.m, ctx = this.ctx, vp = this.vp;
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,255,.25)';
    ctx.beginPath();
    for (var c = 0; c <= m.cols; c++) {
      var x = c * m.tw - vp.x;
      ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, this.cv.height);
    }
    for (var r = 0; r <= m.rows; r++) {
      var y = r * m.th - vp.y;
      ctx.moveTo(0, y + .5); ctx.lineTo(this.cv.width, y + .5);
    }
    ctx.stroke();
    ctx.restore();
  };

  Scene.prototype.hud = function (msg) {
    var ctx = this.ctx;
    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(0, 0, this.cv.width, 42);
    ctx.fillStyle = '#7f7';
    var m = this.m;
    var lines = [
      msg || ('地图 ' + this.mapName + '  ' + (m ? m.cols + '×' + m.rows + ' 格 ' + m.tw + '×' + m.th : '')
        + '  视口 ' + this.vp.x + ',' + this.vp.y),
      '坐标 ' + this.px + ',' + this.py + '  格 '
        + (m ? Math.floor(this.px / m.tw) + ',' + Math.floor(this.py / m.th) : '')
        + '  朝向 ' + this.player.dir + '  状态 ' + this.player.state,
      '本帧 地砖 ' + this.stats.tiles + '  元素 ' + this.stats.objs
        + '  脚本元素 ' + this.stats.elements
        + '  角色帧 ' + this.stats.frames + '  缺资源 ' + this.stats.miss
        + '   [G]网格'
    ];
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], 6, 14 + i * 13);
    ctx.restore();
  };

  // ---------------------------------------------------------- 输入
  Scene.prototype.bindKeys = function () {
    var self = this;
    var KEY = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right'
    };
    global.addEventListener('keydown', function (e) {
      if (e.key === 'g' || e.key === 'G') { self.showGrid = !self.showGrid; return; }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        self.interact();
        return;
      }
      var dir = KEY[e.key];
      if (!dir) return;
      e.preventDefault();
      // 对话进行中不移动
      if (self.talk && self.talk.active) return;
      self.tryMove(dir);
    });
  };

  /**
   * 交互（回车/空格）：
   *   ① 对话进行中 → 推进一步
   *   ② 否则 → 查找面前 NPC 并启动对话
   */
  Scene.prototype.interact = function () {
    var T = global.XJTalk;
    if (this.talk && this.talk.active) {
      var st = this.talk.state();
      if (st.dialog) this.dialogBox = { text: st.dialog.text, speaker: st.dialog.speaker, type: st.dialog.type, visible: true };
      this.talk.advance();
      var st2 = this.talk.state();
      if (st2.dialog) this.dialogBox = { text: st2.dialog.text, speaker: st2.dialog.speaker, type: st2.dialog.type, visible: true };
      else if (!this.talk.active) { this.dialogBox = null; this.talk = null; }
      return true;
    }
    if (!this.talk) {
      var npc = T.facingNpc.call({ world: this.world }, this.px, this.py, this.player.dir);
      if (npc) {
        var d = new T.Dialog(this.world, npc.id);
        if (d.start()) {
          this.talk = d;
          var s0 = d.state();
          if (s0.dialog) this.dialogBox = { text: s0.dialog.text, speaker: s0.dialog.speaker, type: s0.dialog.type, visible: true };
          this.log('与 ' + (s0.name || ('NPC ' + npc.id)) + ' 对话');
          return true;
        }
        this.log((T.npcDef(npc.id) || {}).name + ' 没有对话');
        return false;
      }
    }
    // 没 facingNpc 时退化：找最近的有对话 NPC
    var els = this.world.elements || [];
    var best = null, bd = 1e9;
    for (var i = 0; i < els.length; i++) {
      var e2 = els[i];
      if (e2.kind !== 'npc') continue;
      var dd = T.npcDef(e2.id);
      if (!dd || !T.talkScript(e2.id)) continue;
      var dist = Math.abs(e2.x - this.px) + Math.abs(e2.y - this.py);
      if (dist < 64 && dist < bd) { bd = dist; best = e2; }
    }
    if (best) {
      var d2 = new T.Dialog(this.world, best.id);
      if (d2.start()) {
        this.talk = d2;
        var s1 = d2.state();
        if (s1.dialog) this.dialogBox = { text: s1.dialog.text, speaker: s1.dialog.speaker, type: s1.dialog.type, visible: true };
        return true;
      }
    }
    return false;
  };

  Scene.prototype.start = function () {
    var self = this;
    this.bindKeys();
    (function loop() {
      self.render();
      requestAnimationFrame(loop);
    })();
  };

  global.XJScene = Scene;

  /**
   * 像素级自检：验证地砖网格对齐零漂移。
   * 做法：同一地图渲染两帧，相机精确移动一格(16px)，
   * 逐像素比对「A 的 [shift, w) 列」与「B 的 [0, w-shift) 列」。
   * 必须 100% 相同，否则说明坐标计算有 off-by-one。
   * 注意必须屏蔽 hud()，因为 HUD 会显示坐标文字，位移后本就该不同。
   */
  Scene.prototype.verifyDrift = function (mapName, axis) {
    axis = axis || 'x';
    var ctx = this.ctx, self = this;
    var oDO = this.drawObjects, oDA = this.drawActor, oHUD = this.hud;
    this.drawObjects = function () {}; this.drawActor = function () {};
    this.hud = function () {};
    var grab = function () {
      self.render();
      return ctx.getImageData(0, 0, self.cv.width, self.cv.height).data;
    };
    this.load(mapName || 'cs_ljb_1');
    this.px = this.mapPxW() / 2; this.py = this.mapPxH() / 2;
    this.vp.centerOn(this.px, this.py, this.mapPxW(), this.mapPxH());
    var A = grab().slice();
    var v0 = axis === 'x' ? this.vp.x : this.vp.y;
    if (axis === 'x') this.px += this.m.tw; else this.py += this.m.th;
    this.vp.centerOn(this.px, this.py, this.mapPxW(), this.mapPxH());
    var B = grab();
    var sh = (axis === 'x' ? this.vp.x : this.vp.y) - v0;
    var W = this.cv.width, H = this.cv.height, same = 0, diff = 0, first = null;
    var x0 = axis === 'x' ? sh : 0, x1 = axis === 'x' ? W : W - sh;
    var y0 = axis === 'y' ? sh : 0, y1 = axis === 'y' ? H : H - sh;
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        var ia = (y * W + x) * 4;
        var ib = (axis === 'x' ? (y * W + x - sh) : ((y - sh) * W + x)) * 4;
        if (A[ia] === B[ib] && A[ia + 1] === B[ib + 1] && A[ia + 2] === B[ib + 2]) same++;
        else {
          diff++;
          if (!first) first = { x: x, y: y, a: [A[ia], A[ia + 1], A[ia + 2]], b: [B[ib], B[ib + 1], B[ib + 2]] };
        }
      }
    }
    this.drawObjects = oDO; this.drawActor = oDA; this.hud = oHUD;
    return { map: mapName || 'cs_ljb_1', axis: axis, shift: sh, same: same, diff: diff,
             drift: diff === 0 ? '零漂移' : '有漂移', firstDiff: first };
  };

  /** 一次跑完所有地图的缺资源统计 */
  Scene.prototype.verifyAllMaps = function () {
    var tot = { miss: 0, pending: 0 }, bad = [], tiles = 0, objs = 0;
    for (var n of Object.keys(global.XJ.data.maps.maps).sort()) {
      this.load(n); this.render();
      tot.miss += this.stats.miss; tot.pending += this.stats.pending;
      tiles += this.stats.tiles; objs += this.stats.objs;
      if (this.stats.miss) bad.push(n + ':' + this.stats.miss);
    }
    return { maps: Object.keys(global.XJ.data.maps.maps).length,
             miss: tot.miss, pending: tot.pending,
             tilesDrawn: tiles, objectsDrawn: objs, badMaps: bad };
  };
})(typeof window !== 'undefined' ? window : globalThis);