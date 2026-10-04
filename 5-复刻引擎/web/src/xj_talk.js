/* xj_talk.js —— NPC 对话系统
 *
 * 两部分：
 *   1. 触发判定 —— NPC 定义里的 dialogRegions（4 个带方向的矩形），完全数据驱动
 *   2. 对话执行 —— 按 block 逐页执行，script.break 处挂起等按键
 *
 * ★ 对话块结构（实测 talk_14.str，88 个块 / 1304 条指令）：
 *     script.openScriptList
 *     player.setState(stand)
 *     npc.setAiEnabled(<id>,false)          对话时冻结 NPC AI
 *     npc.setDirection(<id>,up/down/left/right)   四向轮流，模拟对话姿态
 *     dialogBox.setText("/说话人/：文本")     参数自带说话人
 *     dialogBox.showDialog
 *     script.break                          ★ 挂起，等玩家按键
 *     npc.setAiEnabled(<id>,true)           恢复 AI
 *     script.closeScriptList
 *
 * ★ npc.* 系列指令的第一个参数是 NPC 编号（与地图脚本里的裸 npc.* 不同）。
 */
(function (global) {
  'use strict';
  var XJ = global.XJ, XS = global.XJScript;

  // ------------------------------------------------------------ NPC 定义
  /** 按 id 取 NPC 定义（含 talk / dialogRegions / ant / 名字） */
  function npcDef(id) {
    var N = XJ.data.npc || {};
    var key = String(id);
    if (N.defs && N.defs[key]) return N.defs[key];
    var rec = N.npcs && N.npcs[key];
    return rec && rec.talk ? rec : null;
  }

  /** 拿对话脚本（已解析的 AST） */
  function talkScript(id) {
    var d = npcDef(id);
    if (!d || !d.talk) return null;
    var name = String(d.talk).replace(/\.str$/i, '');
    var T = XJ.data.scripts && XJ.data.scripts.talk;
    return (T && T[name]) || null;
  }

  // ------------------------------------------------------------ 触发判定
  /**
   * 玩家是否站在 NPC 的对话区内。
   * 区域是相对 NPC 左上角的矩形 {dx,dy,w,h}，且要求玩家朝向 == dir。
   *
   * @param px,py 玩家左上角坐标（地图像素）
   * @param npcX,npcY NPC 左上角坐标
   * @param dir 玩家朝向
   */
  function inDialogRegion(px, py, npcX, npcY, dir, def) {
    var rs = (def && def.dialogRegions) || [];
    if (!rs.length) return false;
    // 用玩家脚点（中心下方）判定，比左上角更接近原版手感
    var fx = px + 8, fy = py + 14;
    for (var i = 0; i < rs.length; i++) {
      var r = rs[i];
      if (r.dir && dir && r.dir !== dir) continue;
      var x0 = npcX + r.dx, y0 = npcY + r.dy;
      if (fx >= x0 && fx < x0 + r.w && fy >= y0 && fy < y0 + r.h) return true;
    }
    // 不要求朝向时的兜底（区域没标 dir）
    if (dir) {
      for (var j = 0; j < rs.length; j++) {
        var q = rs[j];
        var ax = npcX + q.dx, ay = npcY + q.dy;
        if (fx >= ax && fx < ax + q.w && fy >= ay && fy < ay + q.h) return true;
      }
    }
    return false;
  }

  /** 场景里找出玩家当前面对的 NPC */
  function facingNpc(px, py, dir) {
    var els = (this.world && this.world.elements) || [];
    var best = null, bestD = 1e9;
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.kind !== 'npc') continue;
      if (!npcDef(e.id) || !npcDef(e.id).talk) continue;
      var cx = e.x + 8, cy = e.y;            // NPC 中心
      var fx = px + 8, fy = py + 14;
      var d = Math.abs(cx - fx) + Math.abs(cy - fy);
      if (d > 48) continue;
      if (!inDialogRegion(px, py, e.x, e.y, dir, npcDef(e.id))) continue;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  // ------------------------------------------------------------ 对话执行
  /**
   * Dialog 是一次对话会话。
   * 用法：var dlg = new Dialog(world, npcId); dlg.start(); dlg.advance(); …
   */
  function Dialog(world, npcId) {
    this.w = world;
    this.npcId = npcId;
    this.def = npcDef(npcId) || {};
    this.script = talkScript(npcId);
    this.page = -1;            // 当前块索引
    this.pc = 0;               // 块内指令指针
    this.active = false;
    this.waiting = false;      // 挂在 script.break 上
    this.dialog = null;        // {speaker, text, visible, portrait}
    this.branch = null;        // {options:[...], raw}
    this.trade = null;
    this.timer = 0;
    this.finished = false;
    this.trace = [];           // 执行轨迹，便于测试与回放
    this.aiDisabled = false;
  }

  Dialog.prototype.start = function () {
    if (!this.script || !(this.script.blocks || []).length) return false;
    this.active = true;
    this.finished = false;
    this.page = -1; this.pc = 0;
    this.nextPage();
    return true;
  };

  Dialog.prototype.nextPage = function () {
    var blocks = (this.script && this.script.blocks) || [];
    for (var i = this.page + 1; i < blocks.length; i++) {
      var b = blocks[i];
      if (!this.testBlock(b)) continue;
      this.page = i; this.pc = 0;
      this.trace.push('page' + i);
      this.run(true);            // 立刻跑到第一个挂起点
      if (!this.finished) return true;
    }
    this.finished = true;
    this.active = false;
    this.dialog = null;
    return false;
  };

  Dialog.prototype.testBlock = function (b) {
    if (!b || !b.cond) return true;
    var terms = b.cond.terms || [];
    for (var i = 0; i < terms.length; i++) {
      if (!XS.testConds(this.w, terms[i].raw)) return false;
    }
    return true;
  };

  /** 执行块内指令；stopAtBreak=true 时在 script.break 处停下 */
  Dialog.prototype.run = function (stopAtBreak) {
    var blocks = (this.script && this.script.blocks) || [];
    var b = blocks[this.page];
    if (!b) { this.finished = true; return; }
    while (this.pc < b.nodes.length) {
      var n = b.nodes[this.pc];
      var cmd = n.cmd, ns = n.obj;
      var r = this.exec(ns, cmd, n);
      this.pc++;
      // script.break = 等玩家按键
      if (ns === 'script' && cmd === 'break' && stopAtBreak) {
        this.waiting = true;
        return;
      }
      if (ns === 'script' && cmd === 'closeScriptList') {
        return;                                  // 本页结束
      }
      if (r === 'close') { this.finished = true; this.active = false; return; }
    }
  };

  /** 玩家按一次键 */
  Dialog.prototype.advance = function () {
    if (!this.active) return false;
    if (this.branch) return false;               // 等选分支
    if (!this.waiting) return false;
    this.waiting = false;
    this.dialog = null;
    this.run(true);
    if (this.pc >= ((this.script.blocks[this.page] || {}).nodes || []).length) {
      this.nextPage();
    }
    return true;
  };

  /** 选择分支（game.branch） */
  Dialog.prototype.choose = function (idx) {
    if (!this.branch) return false;
    var o = this.branch.options[idx];
    this.branch = null;
    this.trace.push('choose' + idx);
    // 分支目标是「文件:行」，这里只记录意图，跨文件跳转由 World 接管
    this.w.push('branch', o);
    this.run(true);
    return true;
  };

  /** 指令执行；返回 'close' 表示应结束对话 */
  Dialog.prototype.exec = function (ns, cmd, n) {
    var a = n.raw_args || [];
    var w = this.w;
    function E(i) { try { return w.expr(String(a[i])); } catch (e) { return 0; } }
    function S(i) { return a[i]; }
    // 取第一个参数里的 NPC 编号（npc.* 在对话里都带 id）
    var npcId = (cmd && cmd !== 'showDialog' && cmd !== 'hideDialog' && a.length) ? E(0) : this.npcId;

    switch (ns) {
      case 'script':
        if (cmd === 'openScriptList' || cmd === 'closeScriptList' || cmd === 'break') return null;
        if (cmd === 'wait') { this.timer = E(0); return null; }
        return null;
      case 'player':
        if (cmd === 'setState') { w.playerState = S(0); return null; }
        if (cmd === 'addItem') { w.addItem(S(0), a.length > 1 ? E(1) : 1); return null; }
        if (cmd === 'removeItem') { w.removeItem(S(0), a.length > 1 ? E(1) : 1); return null; }
        if (cmd === 'task') { w.tasks.push(E(0)); return null; }
        if (cmd === 'removeTask') {
          var i = w.tasks.indexOf(E(0)); if (i >= 0) w.tasks.splice(i, 1); return null;
        }
        if (cmd === 'firstTask') { if (!w.tasks.length) w.tasks.push(E(0)); return null; }
        if (cmd === 'showFace') { w.playerFace = true; return null; }
        if (cmd === 'hideFace') { w.playerFace = false; return null; }
        return null;
      case 'npc':
        var el = this.findNpc(npcId);
        if (!el) return null;
        if (cmd === 'setAiEnabled') { el.ai = S(1) === 'true'; return null; }
        if (cmd === 'setDirection') { el.dir = w.dirOf(S(1), el.dir); return null; }
        if (cmd === 'setSequence') { el.seq = S(1); return null; }
        if (cmd === 'setPosition') { el.x = E(1); el.y = E(2); return null; }
        if (cmd === 'showFace') { el.showFace = true; return null; }
        if (cmd === 'hideFace') { el.showFace = false; return null; }
        return null;
      case 'dialogBox':
        if (cmd === 'setText') {
          var darg = (n.args || [])[0] || {};
          this.dialog = {
            speaker: darg.speaker || null,
            text: darg.value != null ? darg.value : String(a[0]),
            visible: true,
            portrait: null,
            type: null
          };
          if (this.def && this.def.name) this.dialog.speaker = this.dialog.speaker || this.def.name;
          return null;
        }
        if (cmd === 'setType') { if (this.dialog) this.dialog.type = S(0); return null; }
        if (cmd === 'showDialog') { if (this.dialog) this.dialog.visible = true; return null; }
        if (cmd === 'hideDialog') { this.dialog = null; return null; }
        if (cmd === 'showPlayerPortrait') { if (this.dialog) this.dialog.portrait = 'player'; return null; }
        if (cmd === 'showNpcPortrait') { if (this.dialog) this.dialog.portrait = 'npc'; return null; }
        if (cmd === 'hidePortrait') { if (this.dialog) this.dialog.portrait = null; return null; }
        return null;
      case 'game':
        if (cmd === 'markEvent') { w.events[E(0)] = 1; return null; }
        if (cmd === 'unmarkEvent') { w.events[E(0)] = 0; return null; }
        if (cmd === 'branch') {
          // branch(选项A, 文件A, 行变量A, 选项B, 文件B, 行变量B)
          this.branch = {
            options: [
              { label: S(0), file: S(1), line: a.length > 2 ? String(a[2]) : null },
              { label: S(3), file: S(4), line: a.length > 5 ? String(a[5]) : null }
            ]
          };
          this.waiting = false;
          return null;
        }
        return null;
      case 'system':
        if (cmd === 'showInfo') { w.push('showInfo', { text: S(0), ms: E(1) }); return null; }
        if (cmd === 'showAsideInfo') { w.push('showAsideInfo', { a: a.slice() }); return null; }
        if (cmd === 'trade') {
          this.trade = { items: String(S(0) || '').split('|').filter(Boolean) };
          this.waiting = false;
          return null;
        }
        if (cmd === 'markFee') { w.fees[E(0)] = true; return null; }
        if (cmd === 'unmarkFee') { w.fees[E(0)] = false; return null; }
        return null;
      case 'countdownTimer':
        return null;
      default:
        // 其余交给通用解释器（会产生 effects）
        w.interp.step({ obj: ns, cmd: cmd, raw_args: a, cond: null });
        return null;
    }
  };

  Dialog.prototype.findNpc = function (id) {
    var els = (this.w.elements) || [];
    for (var i = 0; i < els.length; i++) if (String(els[i].id) === String(id)) return els[i];
    // 只有一个 NPC 时直接用它（对话脚本常只针对一个 NPC）
    return els.length === 1 ? els[0] : null;
  };

  /** 当前状态快照，供渲染与测试 */
  Dialog.prototype.state = function () {
    return {
      active: this.active, waiting: this.waiting, page: this.page, pc: this.pc,
      dialog: this.dialog, branch: this.branch, trade: this.trade,
      finished: this.finished, npcId: this.npcId, name: this.def.name || null,
      trace: this.trace.slice()
    };
  };

  global.XJTalk = {
    Dialog: Dialog,
    npcDef: npcDef,
    talkScript: talkScript,
    inDialogRegion: inDialogRegion,
    facingNpc: facingNpc
  };
})(typeof window !== 'undefined' ? window : globalThis);