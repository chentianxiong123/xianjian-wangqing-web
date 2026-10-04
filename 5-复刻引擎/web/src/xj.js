/* xj.js —— 仙剑奇侠传-忘情篇 Web 复刻引擎核心
 *
 * 数据全部来自 xj_*.js（由 2-工具/60-生成web数据.py 从 3-数据/ 生成），
 * 本文件不内嵌任何魔法数：战斗常量等一律读 window.XJ_LOGIC。
 *
 * ★ 关键实现：精灵裁剪绘制（逆向自 y.java + ag.java，用 javap 逐项核对字节码）：
 *   - 图层组正序绘制，后画的在上（y.java:86）
 *   - 目标点 = base + 偏移，不做居中（y.java:94-95）
 *   - flags → J2ME transform（ag.a 10 参）：
 *       0=NONE；1/10=MIRROR；2/9=MIRROR_ROT180；3/8=ROT180；
 *       4=ROT90；16=ROT270；5/18=MIRROR_ROT270；6/17=MIRROR_ROT90
 *   - J2ME 常量不是 0-7 顺序（ROT90=5, ROT180=3, MIRROR=2…），之前理解错
 *     导致朝右人物被画成倒立；swap 组恰好是全部转置类变换（自洽）。
 */
(function (global) {
  'use strict';

  // ------------------------------------------------------------ 数据注册
  var D = {
    bin: global.XJ_BIN, ant: global.XJ_ANT, maps: global.XJ_MAPS,
    npc: global.XJ_NPC, config: global.XJ_CONFIG, logic: global.XJ_LOGIC,
    scripts: global.XJ_SCRIPTS
  };

  // ------------------------------------------------------------ flags 映射
  // ag.java 10 参重载的 switch（字节码 javap 逐项核对，CFR 反编译一致）：
  //   raw flags → drawRegion transform 编号；swap 表示目标宽高对调。
  // ★ J2ME 变换常量（MIDP 2.0 Sprite 文档，_ORDERED_ 不是 0-7）：
  //   0=NONE, 1=MIRROR_ROT180, 2=MIRROR, 3=ROT180,
  //   4=MIRROR_ROT270, 5=ROT90, 6=ROT270, 7=MIRROR_ROT90
  var TRANS_NONE = 0, TRANS_MIRRORROT180 = 1, TRANS_MIRROR = 2, TRANS_ROT180 = 3;
  var TRANS_MIRRORROT270 = 4, TRANS_ROT90 = 5, TRANS_ROT270 = 6,
      TRANS_MIRRORROT90 = 7;

  var FLAG_TABLE = {
    0:  { t: TRANS_NONE,         swap: false },
    1:  { t: TRANS_MIRROR,       swap: false },
    2:  { t: TRANS_MIRRORROT180, swap: false },
    3:  { t: TRANS_ROT180,       swap: false },
    4:  { t: TRANS_ROT90,        swap: true  },
    5:  { t: TRANS_MIRRORROT270, swap: true  },
    6:  { t: TRANS_MIRRORROT90,  swap: true  },
    8:  { t: TRANS_ROT180,       swap: false },
    9:  { t: TRANS_MIRRORROT180, swap: false },
    10: { t: TRANS_MIRROR,       swap: false },
    16: { t: TRANS_ROT270,       swap: true  },
    17: { t: TRANS_MIRRORROT90,  swap: true  },
    18: { t: TRANS_MIRRORROT270, swap: true  }
  };

  // 等价的「先镜像后旋转」拆解，便于用 Canvas 的 scale 实现。
  // ★ J2ME 常量不是 0-7 顺序！以 MIDP 2.0 Sprite 文档为准：
  //   0=NONE, 1=MIRROR_ROT180, 2=MIRROR, 3=ROT180,
  //   4=MIRROR_ROT270, 5=ROT90, 6=ROT270, 7=MIRROR_ROT90
  //   （之前误按 1=ROT90… 解，朝右人物全被转成倒立）
  function transformToCanvas(t) {
    // 返回 {rot: 0|90|180|270, flipX: bool}，语义是先镜像后顺时针旋转
    switch (t) {
      case TRANS_NONE:         return { rot: 0,   flipX: false };
      case TRANS_ROT90:        return { rot: 90,  flipX: false };
      case TRANS_ROT180:       return { rot: 180, flipX: false };
      case TRANS_ROT270:       return { rot: 270, flipX: false };
      case TRANS_MIRROR:       return { rot: 0,   flipX: true  };
      case TRANS_MIRRORROT90:  return { rot: 90,  flipX: true  };
      case TRANS_MIRRORROT180: return { rot: 180, flipX: true  };
      case TRANS_MIRRORROT270: return { rot: 270, flipX: true  };
      default:                 return { rot: 0,   flipX: false };
    }
  }

  // ------------------------------------------------------------ 精灵图
  var imgCache = {};   // binName -> [Image|null]
  var imgFailed = {};

  function binEntries(bin) {
    return (D.bin && D.bin.bins && D.bin.bins[bin]) || null;
  }

  /** 取某个 BIN 包的单张精灵图；缺失返回 null，不抛错。 */
  function sprite(bin, idx) {
    var arr = imgCache[bin];
    if (!arr) {
      var ents = binEntries(bin);
      arr = imgCache[bin] = new Array(ents ? ents.length : 0);
    }
    if (arr[idx] !== undefined) return arr[idx];
    var ents = binEntries(bin);
    if (!ents || idx < 0 || idx >= ents.length || !ents[idx].u) {
      arr[idx] = null;
      return null;
    }
    var im = new Image();
    im.onload = function () { arr[idx] = im; if (XJ._onSpriteLoad) XJ._onSpriteLoad(); };
    im.onerror = function () { arr[idx] = null; imgFailed[bin + ':' + idx] = 1; };
    im.src = ents[idx].u;
    arr[idx] = null;               // 加载中
    arr[idx] = im;
    return im;
  }

  /**
   * 精灵图四态：
   *   'idle'     尚未请求加载
   *   'pending'  请求了但还没解码完
   *   'ok'       已就绪
   *   'missing'  索引越界 / 无 URL / onerror（真的没有）
   * 渲染统计必须区分 pending 与 missing，否则首屏会把「还没加载完」
   * 误报成「资源缺失」。
   */
  function spriteState(bin, idx) {
    var ents = binEntries(bin);
    if (!ents || idx < 0 || idx >= ents.length || !ents[idx].u) return 'missing';
    if (imgFailed[bin + ':' + idx]) return 'missing';
    var arr = imgCache[bin];
    if (!arr || arr[idx] === undefined || arr[idx] === null) return 'idle';
    var im = arr[idx];
    if (im.complete && im.naturalWidth) return 'ok';
    return 'pending';
  }

  /** 统计整个包的状态分布 */
  function binStats(bin) {
    var ents = binEntries(bin) || [], r = { ok: 0, pending: 0, idle: 0, missing: 0 };
    for (var i = 0; i < ents.length; i++) r[spriteState(bin, i)]++;
    return r;
  }

  /** 全库状态汇总 */
  function allStats() {
    var r = { ok: 0, pending: 0, idle: 0, missing: 0, bins: 0, total: 0 };
    for (var b of Object.keys(D.bin.bins)) {
      r.bins++;
      var s = binStats(b);
      r.ok += s.ok; r.pending += s.pending; r.idle += s.idle; r.missing += s.missing;
      r.total += s.ok + s.pending + s.idle + s.missing;
    }
    return r;
  }

  /**
   * 并发受限地预载整个库（浏览器对同域并发连接数有限，
   * 一次发 461 个请求会互相排队甚至被丢弃）。
   */
  function preloadAll(concurrency, onProgress) {
    var jobs = [];
    for (var b of Object.keys(D.bin.bins)) {
      var ents = binEntries(b) || [];
      for (var i = 0; i < ents.length; i++) jobs.push([b, i]);
    }
    var idx = 0, done = 0, total = jobs.length;
    var limit = concurrency || 12;
    function next() {
      if (idx >= jobs.length) { onProgress && onProgress(done, total, true); return; }
      var j = jobs[idx++];
      var st = spriteState(j[0], j[1]);
      if (st === 'ok' || st === 'missing') { done++; next(); return; }
      sprite(j[0], j[1]);
      var arr = imgCache[j[0]];
      var im = arr[j[1]];
      if (!im) { done++; next(); return; }
      var settled = function () {
        if (im.__xjDone) return;
        im.__xjDone = true;
        done++;
        onProgress && onProgress(done, total, false);
        next();
      };
      im.addEventListener('load', settled, { once: true });
      im.addEventListener('error', settled, { once: true });
    }
    for (var k = 0; k < limit; k++) next();
    return { total: total, done: function () { return done; } };
  }

  /** 预载整个包 */
  function preloadBin(bin, done) {
    var ents = binEntries(bin) || [];
    var n = ents.length, left = n;
    if (!n) { done && done(); return; }
    for (var i = 0; i < n; i++) {
      var im = sprite(bin, i);
      if (im && im.complete && im.naturalWidth) { if (--left === 0) done && done(); continue; }
      (function (i) {
        var check = function () {
          var a = imgCache[bin];
          if (!a || a[i] === null || (a[i].complete && a[i].naturalWidth)) {
            if (--left === 0) done && done();
          } else setTimeout(check, 30);
        };
        check();
      })(i);
    }
  }

  // ------------------------------------------------------------ 裁剪绘制
  /**
   * 按 y.java 的规则绘制一条裁剪记录。
   * @param c 裁剪表条目 [sheet, srcX, srcY, w, h]
   * @param bin 所属 BIN 包名
   * @param flags 变换标志
   * @param dx,dy 目标左上角
   */
  function drawClip(ctx, bin, c, flags, dx, dy) {
    var sheet = c[0], sx = c[1], sy = c[2], w = c[3], h = c[4];
    if (!(w > 0 && h > 0)) return;
    var ft = FLAG_TABLE[flags] || FLAG_TABLE[0];
    var im = sprite(bin, sheet);
    var dw = ft.swap ? h : w;
    var dh = ft.swap ? w : h;
    if (!im || !im.naturalWidth) {
      // 贴图未就绪：画出占位框，便于定位缺失资源
      ctx.save();
      ctx.strokeStyle = 'rgba(255,0,255,.5)';
      ctx.strokeRect(dx + .5, dy + .5, dw - 1, dh - 1);
      ctx.restore();
      return;
    }
    if (!ft.t) {
      // 1:1 时走无缩放路径，避免任何重采样
      if (dw === w && dh === h) ctx.drawImage(im, sx, sy, w, h, dx, dy, w, h);
      else ctx.drawImage(im, sx, sy, w, h, dx, dy, dw, dh);
      return;
    }

    var tf = transformToCanvas(ft.t);
    ctx.save();
    ctx.translate(dx + dw / 2, dy + dh / 2);
    if (tf.flipX) ctx.scale(-1, 1);
    if (tf.rot) ctx.rotate(tf.rot * Math.PI / 180);
    // ★ 9 参数形式：源矩形 (sx,sy,w,h) 必须带上（之前误用 3 参数画了整张图）
    ctx.drawImage(im, sx, sy, w, h, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // ------------------------------------------------------------ ANT 动画
  var DIRS = { up: '上', down: '下', left: '左', right: '右' };

  /** 取 ANT 的某个状态对象；找不到返回 null */
  function state(antName, st) {
    var a = D.ant && D.ant.ants && D.ant.ants[antName];
    if (!a) return null;
    for (var i = 0; i < a.states.length; i++) if (a.states[i].n === st) return a.states[i];
    return null;
  }

  /**
   * 按「基名 + 方向」解析状态：优先 `站立下` 这类带方向的，
   * 再退回 `站立`、状态 0。
   */
  function resolveState(antName, base, dir) {
    var a = D.ant && D.ant.ants && D.ant.ants[antName];
    if (!a) return null;
    var suf = DIRS[dir];
    if (base && suf) {
      var s = state(antName, base + suf);
      if (s) return s;
    }
    if (base) {
      var s2 = state(antName, base);
      if (s2) return s2;
    }
    // 再试带方向的其它基名（有些 ANT 只有 走路上 没有 站立上）
    if (suf) {
      var pre = suf + '走', pre2 = '走' + suf;
      if (base === '站立') {
        var s3 = state(antName, '走路' + suf);
        if (s3) return s3;
      }
      _ = [pre, pre2];
    }
    return a.states.length ? a.states[0] : null;
  }

  /** 状态总时长（ms） */
  function stateDuration(st) {
    var t = 0;
    for (var i = 0; i < st.q.length; i++) t += (st.q[i][3] || 0);
    return t || 200;
  }

  /**
   * 推进动画并绘制。
   * @param tNow 当前时间戳(ms)
   * @param loop true=循环 false=停在最后一帧
   * @return {done, frame, frameNo, total}
   */
  function drawState(ctx, antName, st, x, y, tNow, loop) {
    if (!st) return { done: true };
    var a = D.ant.ants[antName];
    var total = stateDuration(st);
    var dur = loop ? ((tNow % total) + total) % total : Math.min(tNow, total - 1);
    var acc = 0, frame = 0;
    for (var i = 0; i < st.q.length; i++) {
      var d = st.q[i][3] || 0;
      if (dur < acc + d) { frame = i; break; }
      acc += d;
      frame = i;
    }
    var seq = st.q[frame];
    var part = a.layers[seq[0]] || [];
    // ★ 正序绘制：后画的在上层（y.java:86 while(n12 < f.length) 正序）
    for (var k = 0; k < part.length; k++) {
      var q = part[k];
      var flags = q[3];
      var ft = FLAG_TABLE[flags] || FLAG_TABLE[0];
      var c = a.clips[q[0]];
      if (!c) continue;
      var w = ft.swap ? c[4] : c[3];
      var h = ft.swap ? c[3] : c[4];
      // ★ 目标点就是 base+offset，不做居中（y.java:94-95 n18=n3+offX, n19=n4+offY）
      var cx = x + q[1] + seq[1];
      var cy = y + q[2] + seq[2];
      drawClip(ctx, a.bin, c, flags, cx, cy);
    }
    return { done: !loop && tNow >= total, frame: frame, frameNo: st.q.length, total: total };
  }

  /** 收集某一帧里所有脚本 tag（技能/动画脚本触发点） */
  function stateScripts(antName, st, frame) {
    var out = [];
    if (!st || !st.q[frame]) return out;
    var tag = st.q[frame][4];
    if (!tag) return out;
    var lines = String(tag).split(/[;\n]/);
    for (var i = 0; i < lines.length; i++) {
      var s = lines[i].trim();
      if (s) out.push(s);
    }
    return out;
  }

  // ------------------------------------------------------------ 地图
  function map(name) {
    return (D.maps && D.maps.maps && D.maps.maps[name]) || null;
  }

  /** RLE 解码一行地砖 */
  function tileRow(m, layer, row) {
    var t = m.layers[layer].t;
    if (!t || row < 0 || row >= t.length) return null;
    var rle = t[row], out = new Array(m.cols), c = 0;
    for (var i = 0; i < rle.length; i += 2) {
      var v = rle[i], n = rle[i + 1];
      while (n-- > 0 && c < m.cols) out[c++] = v;
    }
    return out;
  }

  /** 取某层某格的地砖值；-1 表示无网格 */
  function tileAt(m, layer, col, row) {
    var t = m.layers[layer].t;
    if (!t) return -1;
    if (col < 0 || col >= m.cols || row < 0 || row >= t.length) return -1;
    var rle = t[row], c = 0;
    for (var i = 0; i < rle.length; i += 2) {
      var n = rle[i + 1];
      if (col < c + n) return rle[i];
      c += n;
    }
    return -1;
  }

  // ------------------------------------------------------------ 视口
  function Viewport(w, h) {
    this.w = w; this.h = h;
    this.x = 0; this.y = 0;
    this.scale = 1;
  }
  Viewport.prototype.centerOn = function (x, y, mapW, mapH) {
    this.x = Math.round(x - this.w / 2);
    this.y = Math.round(y - this.h / 2);
    if (mapW) this.x = Math.max(0, Math.min(this.x, Math.max(0, mapW - this.w)));
    if (mapH) this.y = Math.max(0, Math.min(this.y, Math.max(0, mapH - this.h)));
    return this;
  };

  // ------------------------------------------------------------ 战斗常量
  function C() {
    var c = (D.logic && D.logic.combat) || {};
    var k = (c.turnGauge && c.turnGauge.constants) || {};
    return {
      W: k.W ? k.W.value : 750,
      GAUGE_MAX: k.max || 1000,
      HERO_SLOTS: (c.slotPositions && c.slotPositions.heroes) || [],
      FOE_SLOTS: (c.slotPositions && c.slotPositions.foes) || [],
      ATTACK_RANGE: (c.slotPositions && c.slotPositions.attackRange) || 25,
      ROLL_MIN: 9, ROLL_MAX: 11,
      CRIT_DEN: 200, EVADE_DEN: 100,
      MORPH_GAS: 10, MORPH_DMG_NUM: 3, MORPH_DMG_DEN: 5,
      LEVEL_CAP: 45,
      DEADLY_HP_RATIO: 0.2, WOUNDED_RATIO: 0.2,
      DAMAGE: (c.damage && c.damage.source) || null
    };
  }

  var _ = 0;   // 占位，避免 lint 报未使用

  // ------------------------------------------------------------ 导出
  var XJ = {
    data: D,
    FLAG_TABLE: FLAG_TABLE,
    transformToCanvas: transformToCanvas,
    sprite: sprite,
    spriteState: spriteState,
    preloadAll: preloadAll,
    binStats: binStats,
    allStats: allStats,
    preloadBin: preloadBin,
    binEntries: binEntries,
    drawClip: drawClip,
    state: state,
    resolveState: resolveState,
    stateDuration: stateDuration,
    drawState: drawState,
    stateScripts: stateScripts,
    map: map,
    tileAt: tileAt,
    tileRow: tileRow,
    Viewport: Viewport,
    C: C,
    imgCache: imgCache,
    imgFailed: imgFailed,
    _onSpriteLoad: null
  };
  _ = _; global.XJ = XJ;
})(typeof window !== 'undefined' ? window : globalThis);