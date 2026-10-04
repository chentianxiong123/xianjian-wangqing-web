// ANTs 解析器
// 从 ants.js 的原始 hex 数据中解析裁剪表，供渲染层使用
(function () {
  'use strict';
  window.XJ_ANT_CACHE = {}; // 已解析的 ANTs

  /**
   * 解析一个 ANT 文件的裁剪表
   * 返回 {c: [{srcX, srcY, w, h, sheet}], nameAnim}
   * c_table 行格式: [sheetIdx, srcX, srcY, width, height] (5x uint16 BE, 10B/row)
   */
  function parseAnt(antName) {
    if (window.XJ_ANT_CACHE[antName]) return window.XJ_ANT_CACHE[antName];
    const ant = window.XJ_DATA_ANTS && window.XJ_DATA_ANTS[antName];
    if (!ant || !ant.data) {
      window.XJ_ANT_CACHE[antName] = null;
      return null;
    }
    const hex = ant.data;
    const bytes = new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const view = new DataView(bytes.buffer);

    if (bytes[0] !== 0x88 || bytes[1] !== 0x41 || bytes[2] !== 0x4E || bytes[3] !== 0x54) {
      console.warn('[ANT] bad magic', antName);
      window.XJ_ANT_CACHE[antName] = null;
      return null;
    }
    const count = view.getUint16(6, false); // big-endian
    if (count === 0 || 8 + count * 10 > bytes.length) {
      window.XJ_ANT_CACHE[antName] = null;
      return null;
    }

    const c = [];
    let offset = 8;
    for (let i = 0; i < count; i++) {
      const sheet = view.getUint16(offset, false);
      const srcX  = view.getUint16(offset + 2, false);
      const srcY  = view.getUint16(offset + 4, false);
      const w     = view.getUint16(offset + 6, false);
      const h     = view.getUint16(offset + 8, false);
      offset += 10;
      // 只保留有效裁剪（宽高均 > 0）
      if (w > 0 && h > 0) {
        c.push({ sheet, srcX, srcY, w, h });
      }
    }

    const result = { c };
    window.XJ_ANT_CACHE[antName] = result;
    return result;
  }

  /**
   * 获取 NPC 渲染所需的裁剪信息
   * 返回 {sheet, srcX, srcY, w, h} 或 null
   * NPC 使用 renwu.bin sprite 0（181x44 合并精灵图）作为 sprite sheet
   */
  function getNPCFrames(npcId) {
    const cfg = window.NPC_CONFIG && window.NPC_CONFIG[String(npcId)];
    if (!cfg || !cfg.anim_file) return null;
    const parsed = parseAnt(cfg.anim_file);
    if (!parsed || !parsed.c || parsed.c.length === 0) return null;
    return parsed.c[0]; // 第一个有效裁剪帧
  }

  /**
   * 主角渲染：直接使用 chonglou.bin 整张立绘（80x91）
   * 不裁剪，因为 chonglou.ant 的 c_table 只有 16x2 的无效条目
   */
  function getPlayerSprite() {
    return { w: 80, h: 91 }; // chonglou.sprite_0.png 的实际尺寸
  }

  // expose
  window.XJ_PARSE_ANT          = parseAnt;
  window.XJ_GET_NPC_FRAMES     = getNPCFrames;
  window.XJ_GET_PLAYER_SPRITE  = getPlayerSprite;

  console.log('[ant_parser.js] loaded:', Object.keys(window.XJ_DATA_ANTS || {}).length, 'ANT files in cache');
})();
