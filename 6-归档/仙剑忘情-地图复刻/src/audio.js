// ============================================================
// src/audio.js — 音频系统 (Agent-S8)
// 方案: 简单 MIDI 解析 + Web Audio API 合成
// ============================================================
(function() {
  var audioCtx = null;
  var currentBGM = null;
  var activeNotes = [];
  var schedulerTimer = null;
  var currentTrack = null;
  var trackIndex = 0;
  var nextNoteTime = 0;
  var tempo = 500000;  // microseconds per quarter note (default 120 BPM)
  var division = 480;  // ticks per quarter note

  function ensureCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('[audio] Web Audio 不可用');
        return null;
      }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // ---- 简单 MIDI 解析 ----
  function parseMIDI(data) {
    var pos = 0;
    function readVar() {
      var v = 0;
      do {
        var b = data[pos++];
        v = (v << 7) | (b & 0x7f);
      } while (b & 0x80);
      return v;
    }
    function read32() { return (data[pos]<<24)|(data[pos+1]<<16)|(data[pos+2]<<8)|data[pos+3]; pos+=4; }
    function read16() { var v=(data[pos]<<8)|data[pos+1]; pos+=2; return v; }

    if (read32() !== 0x4d546864) return null;  // MThd
    var hdrlen = read32();
    var format = read16();
    var tracks = read16();
    division = read16();

    var result = { tracks: [], division: division };
    for (var t = 0; t < tracks; t++) {
      if (read32() !== 0x4d54726b) break;  // MTrk
      var tklen = read32();
      var end = pos + tklen;
      var events = [];
      var absTime = 0;
      var lastStatus = 0;
      while (pos < end) {
        var dt = readVar();
        absTime += dt;
        var status = data[pos++];
        if (status < 0x80) { pos--; status = lastStatus; }  // running status
        lastStatus = status;
        if (status === 0xff) {
          var metaType = data[pos++];
          var metaLen = readVar();
          var metaData = data.slice(pos, pos + metaLen);
          pos += metaLen;
          if (metaType === 0x51) {  // tempo
            tempo = (metaData[0]<<16)|(metaData[1]<<8)|metaData[2];
          }
          events.push({ time: absTime, meta: metaType, data: metaData });
        } else {
          var channel = status & 0x0f;
          var type = (status >> 4) & 0x07;
          var d1 = data[pos++];
          var d2 = (type === 0x0c || type === 0x05 || type === 0x06) ? 0 : data[pos++];
          events.push({ time: absTime, type: type, channel: channel, d1: d1, d2: d2 });
        }
      }
      result.tracks.push({ events: events });
    }
    return result;
  }

  // ---- 音符频率表 ----
  var noteFreq = [];
  for (var n = 0; n < 128; n++) {
    noteFreq[n] = 440 * Math.pow(2, (n - 69) / 12);
  }

  function tickToSeconds(tick) {
    return (tick * tempo) / (division * 1000000);
  }

  // ---- 调度器：用 oscillator 合成 ----
  function scheduleNotes(midi) {
    var ctx = ensureCtx();
    if (!ctx || !midi) return;
    if (currentTrack === midi) return;
    stopBGM();
    currentTrack = midi;
    trackIndex = 0;
    nextNoteTime = ctx.currentTime + 0.1;

    // 合并所有 track 的事件
    var allEvents = [];
    for (var t = 0; t < midi.tracks.length; t++) {
      for (var e of midi.tracks[t].events) {
        allEvents.push(e);
      }
    }
    allEvents.sort(function(a, b) { return a.time - b.time; });
    currentTrack._events = allEvents;

    schedulerTimer = setInterval(function() {
      if (!currentTrack) return;
      var ctx2 = ensureCtx();
      if (!ctx2) return;
      while (trackIndex < currentTrack._events.length) {
        var ev = currentTrack._events[trackIndex];
        var evTime = tickToSeconds(ev.time);
        if (evTime > ctx2.currentTime - (currentTrack._startTime || 0) + 0.2) break;
        playEvent(ev, ctx2.currentTime - (currentTrack._startTime || 0));
        trackIndex++;
      }
      if (trackIndex >= currentTrack._events.length) {
        // 循环播放
        trackIndex = 0;
        currentTrack._startTime = ctx2.currentTime;
      }
    }, 50);
    currentTrack._startTime = ctx.currentTime;
  }

  function playEvent(ev, offset) {
    if (ev.meta !== undefined) return;
    var ctx = ensureCtx();
    if (!ctx) return;
    if (ev.type === 0x09 && ev.d2 > 0) {  // noteOn
      var freq = noteFreq[ev.d1];
      if (!freq) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'square';  // 简化音色
      osc.frequency.value = freq;
      var vol = (ev.d2 / 127) * 0.15;
      gain.gain.setValueAtTime(vol, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.5);
    }
  }

  // ---- 加载 MIDI 文件 ----
  function loadMIDI(name) {
    var url = 'mid/' + name;
    return fetch(url).then(function(r) { return r.arrayBuffer(); }).then(function(buf) {
      return parseMIDI(new Uint8Array(buf));
    }).catch(function(e) {
      console.warn('[audio] MIDI 加载失败:', name, e);
      return null;
    });
  }

  // ---- 公开 API ----
  XJ.playBGM = function(midName) {
    if (currentBGM === midName) return;
    currentBGM = midName;
    loadMIDI(midName).then(function(midi) {
      if (midi && currentBGM === midName) {
        scheduleNotes(midi);
        console.log('[audio] 播放:', midName);
      }
    });
  };

  XJ.stopBGM = function() {
    if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
    currentTrack = null;
    currentBGM = null;
    trackIndex = 0;
  };

  XJ.setVolume = function(v) {
    // TODO: 主音量控制
    console.log('[audio] 音量:', v);
  };

  // 地图→BGM 映射（从 enemy.str 和 config_game.str 推断）
  XJ.mapBGM = function(mapId) {
    var bgmMap = {
      'cs_': 'ss.mid',      // 城市默认
      'yw_': 'yw.mid',       // 余杭
      'sn_': 'ssm.mid',     // 蜀山
      'ms_': 'syg.mid',     // 蜀山？
      'fight': 'xg.mid'     // 战斗
    };
    for (var prefix in bgmMap) {
      if (mapId.indexOf(prefix) === 0) return bgmMap[prefix];
    }
    return 'menu.mid';
  };

  console.log('[audio.js] 音频系统加载完成 (MIDI→WebAudio 合成)');
})();
