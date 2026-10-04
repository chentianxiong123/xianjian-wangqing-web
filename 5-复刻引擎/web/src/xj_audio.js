/* xj_audio.js —— BGM 播放（midi.play <文件> <循环次数> / midi.stop）
 *
 * 对应 ah.java：第二参数直接传 Player.setLoopCount，-1 = 无限循环。
 * 曲子用 `0x9n vel=0` 关音符的占 70%（见 MID格式.md），解析器必须处理：
 *   running status、noteOn vel=0 关音、tempo 变化、多 track 合并。
 * 文件在 web/mid/*.mid，名字可带可不带 .mid。
 */
(function (global) {
  'use strict';

  var ctx = null, timer = null, master = null;
  var current = null;      // 文件名
  var muted = false;
  var FREQ = [];
  for (var n = 0; n < 128; n++) FREQ[n] = 440 * Math.pow(2, (n - 69) / 12);

  function ac() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function norm(name) {
    var s = String(name || '').split('/').pop();
    if (!/\.mid$/i.test(s)) s += '.mid';
    return s;
  }

  // ---- MIDI 解析（SMF，处理 running status） ----
  function parseMIDI(data) {
    var pos = 0;
    function u8() { return data[pos++]; }
    function u16() { var v = (data[pos] << 8) | data[pos + 1]; pos += 2; return v; }
    function u32() { var v = (data[pos] << 24) | (data[pos + 1] << 16) | (data[pos + 2] << 8) | data[pos + 3]; pos += 4; return v >>> 0; }
    function vlen() { var v = 0, b; do { b = data[pos++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; }
    if (u32() !== 0x4d546864) return null;
    u32(); u16();
    var tracks = u16(), division = u16();
    var evs = [], tempos = [{ tick: 0, mpq: 500000 }];
    for (var t = 0; t < tracks; t++) {
      if (u32() !== 0x4d54726b) break;
      var end = pos + u32(), abs = 0, status = 0;
      while (pos < end) {
        abs += vlen();
        var b = u8();
        if (b < 0x80) { pos--; b = status; }
        else status = b;
        if (b === 0xff) {
          var mt = u8(), ml = vlen(), md = [];
          for (var i = 0; i < ml; i++) md.push(u8());
          if (mt === 0x51 && ml === 3) tempos.push({ tick: abs, mpq: (md[0] << 16) | (md[1] << 8) | md[2] });
        } else if (b === 0xf0 || b === 0xf7) {
          var sl = vlen(); pos += sl;
        } else {
          var hi = (b >> 4) & 0xf, ch = b & 0xf;
          var d1 = u8(), d2 = (hi === 0xc || hi === 0xd) ? 0 : u8();
          evs.push({ tick: abs, hi: hi, ch: ch, d1: d1, d2: d2 });
        }
      }
    }
    evs.sort(function (a, b2) { return a.tick - b2.tick; });
    tempos.sort(function (a, b2) { return a.tick - b2.tick; });
    // tick → 秒（含变速）
    var sec = 0, last = 0, mpq = 500000, ti = 0;
    evs.forEach(function (e) {
      while (ti + 1 < tempos.length && tempos[ti + 1].tick <= e.tick) { ti++; }
      mpq = tempos[ti].mpq;
      sec += (e.tick - last) * mpq / division / 1000000;
      last = e.tick;
      e.sec = sec;
    });
    var dur = sec;
    return { events: evs, duration: dur };
  }

  function playNote(when, midi, vel) {
    var c = ac();
    if (!c || muted) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = FREQ[midi] || 440;
    var v = Math.max(0.001, (vel / 127) * 0.22);
    g.gain.setValueAtTime(v, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.6);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + 0.65);
  }

  function schedule(song, loopCount) {
    stop();
    var c = ac();
    if (!c || !song) return;
    var idx = 0, loops = 0, t0 = c.currentTime + 0.15;
    // loopCount：-1 无限，其余为总遍数（ah setLoopCount 语义）
    var total = (loopCount == null || loopCount < 0) ? Infinity : Math.max(1, loopCount);
    timer = setInterval(function () {
      if (muted) { idx = song.events.length; }
      while (idx < song.events.length) {
        var e = song.events[idx];
        if (e.hi !== 0x9 || e.d2 === 0) { idx++; continue; }  // 只发音，关音靠包络
        var when = t0 + e.sec;
        if (when > c.currentTime + 0.25) break;
        playNote(Math.max(when, c.currentTime), e.d1, e.d2);
        idx++;
      }
      if (idx >= song.events.length) {
        loops++;
        if (loops >= total) { stop(); return; }
        idx = 0;
        t0 = c.currentTime + 0.1;
      }
    }, 60);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function play(file, loop) {
    var name = norm(file);
    var lp = loop == null ? -1 : parseInt(loop, 10);
    if (isNaN(lp)) lp = -1;
    if (current === name) return name;
    current = name;
    if (typeof fetch === 'undefined') return name;
    fetch('mid/' + name).then(function (r) { return r.arrayBuffer(); })
      .then(function (buf) {
        if (current !== name) return;
        var song = parseMIDI(new Uint8Array(buf));
        if (song) schedule(song, lp);
      })
      .catch(function () { current = null; });
    return name;
  }

  function toggle() {
    muted = !muted;
    if (muted) stop();
    return muted ? '声音关' : '声音开';
  }

  global.XJAudio = {
    play: play, stop: function () { current = null; stop(); }, toggle: toggle,
    parseMIDI: parseMIDI, norm: norm,
    get muted() { return muted; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
