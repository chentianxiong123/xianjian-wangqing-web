# MID 音乐格式（SMF / Standard MIDI File）

> 对象：`1-解包产物/解包树/mid/*.mid`（10 首）+ `1-解包产物/解包树/corp/logo.mid`
> 工具：`2-工具/formats/mid.py`
> 数据：`3-数据/05-资源/mid/*.json` + `_index.json`
> 验证：11/11 文件与独立解析器 `mido` 逐事件逐字段对拍 **0 处不一致**（共 24523 事件）

---

## 0. 一句话结论

**jar 里的 `.mid` 就是标准未压缩 SMF 裸字节流，游戏自己完全不解析 MIDI。**

| 判据 | 证据 |
|---|---|
| 前 4 字节 = `4D 54 68 64` (`MThd`) | 11/11 全部命中，**无一例 gzip 头 `1F 8B`** |
| 交给系统解码器而非自研解析 | `ah.java:184` `Manager.createPlayer(getResourceAsStream(path), "audio/midi")` |

所以 MID 层**没有本项目私有的加密/压缩/混淆**（与 ANT/MAP/STR 的 gzip 层不同，见 `00-逆向备忘.md` §1）。
这是全套解包资源里唯一一个可以直接喂给任何标准库的格式。

> ⚠️ 与 §1 压缩层的区别：`.ant/.map/.str` 是 gzip 包裹的裸 DEFLATE；**`.mid` 不压**。
> `mid.py` 的 `analyze()` 会主动检查 `data[:2] == b"\x1f\x8b"` 并直接抛错，防止误用 `gzip.decompress`。

---

## 1. 完整格式技术描述

全程大端（big-endian）。

### 1.1 文件 = chunk 序列

```
<MThd chunk> <MTrk chunk> × ntrks
```

每个 chunk：

```
char[4]  id       'MThd' | 'MTrk' | 厂商私有
uint32   length   负载字节数
byte[]   data
```

规范允许私有 chunk 夹在中间；`mid.py` 的 `_read_chunk()` 会识别并跳过，
但跳过时记 `anomalies[].kind = "unknown_chunk"`，不静默吞。

### 1.2 MThd（文件头，必为第一个）

```
char[4]  'MThd'
uint32   length   = 6 (实测 11/11 全部为 6)
uint16   format   0 = 单轨, 1 = 多轨同步, 2 = 多轨独立
uint16   ntrks    轨数
uint16   division 时间分辨率
```

`length > 6` 时剩余字节规范上未定义，本项目保留在 `header.header_extra_hex`。
实测**全部 `length == 6`，无扩展头**。

#### division 的两种含义

| 值域 | 含义 |
|---|---|
| `0x0000..0x7FFF` | **每四分音符的 tick 数**（ticks per quarter note, TPQN） |
| `0x8000..0xFFFF` | SMPTE：高字节 = 负的帧率（`-fps`），低字节 = 每帧 tick 数 |

**实测 11/11 全部落在第一象限，`smpte == false`**：`96 / 120 / 384 / 480`。
JSON 里同时给出 `division_raw`、`smpte`、`ticks_per_beat`，SMPTE 分支代码已实现但本项目无样本。

### 1.3 MTrk（轨道）

```
char[4]  'MTrk'
uint32   length   本轨事件流字节数
byte[]   事件流
```

事件流 = `(delta-time, event)` 序列，直到 `0xFF 0x2F`（end of track）。

#### 1.3.1 delta time —— 变长量 vlq

```
byte 0..3   每字节低 7 位有效, 高位 = 续位标志(1 = 后面还有)
```

**必须逐字节读，不能假设定长。** 这是最常见的解析崩溃点。
`mid.py` 的 `R.vlq()` 限死 4 字节上限（规范上限），超限抛 `SmfError`。

#### 1.3.2 事件字节

首字节高 4 位 = 事件类型：

| 首字节 | 事件 | 数据字节 | 说明 |
|---|---|---|---|
| `0x8n` | Note Off | note, vel | |
| `0x9n` | Note On | note, vel | **vel == 0 等价于 Note Off** |
| `0xAn` | Poly Aftertouch | note, press | |
| `0xBn` | Control Change | cc, val | |
| `0xCn` | Program Change | program | **只有 1 个数据字节** |
| `0xDn` | Channel Aftertouch | press | **只有 1 个数据字节** |
| `0xEn` | Pitch Bend | lsb, msb | 14bit，**中位 8192**，范围 0..16383 |
| `0xF0` | SysEx | vlq len + data | data **不含**结尾 `F7` |
| `0xF7` | SysEx escape | vlq len + data | data **含**结尾 `F7` |
| `0xFF` | Meta | type + vlq len + data | |

`n` = 通道号 0..15。**通道 9 (0-indexed) 按 GM 约定是打击乐**，本项目 9/11 首曲子用到。

#### 1.3.3 ★ running status

**同一轨内，如果当前字节 `0x80..0xEF` 的数据字节又是 `< 0x80`，则复用上一个状态字节。**
这是 SMF 里最容易漏掉的一条，写错会导致整轨错位。

`mid.py` 的处理：
- 复用时事件记 `"running": true`，原始 `status` 仍展开写进 JSON（便于还原）
- 若某事件**既没有状态字节、又无 running status** → 抛 `SmfError`（这是硬错误，不是异常数据）
- meta 与 sysex **不打断** running status（规范如此）

#### 1.3.4 Meta 事件 `0xFF <type> <vlq len> <data>`

本项目实际出现 8 种：

| type | 名称 | 负载 | 本项目实测 |
|---|---|---|---|
| `0x01` | Text | 文本 | 有（版权/歌词） |
| `0x02` | Copyright | 文本 | 8/11 首 |
| `0x03` | **Track Name** | 文本 | **全部有**，见 §4.1 |
| `0x05` | Lyric | 文本 | 无 |
| `0x06` | Marker | 文本 | 1/11 首（只有 `boss.mid`，7 个） |
| `0x51` | **Set Tempo** | **3 字节大端 = μs/四分音符** | 全部有，详见 §3 |
| `0x58` | Time Signature | `nn, dd, cc, bb` | 9/11 首 |
| `0x59` | Key Signature | `sf, mi` | 8/11 首 |
| `0x2F` | **End of Track** | 0 字节 | **11/11 每轨都有** |

**`0x51` 必须精确按 3 字节大端读**：`us_per_beat = b0<<16 | b1<<8 | b2`，
`bpm = 60000000 / us_per_beat`。实测 BPM 有非整数（xg = 352941 μs → 170.0001 BPM），
说明这些文件是按「先定 BPM 再取整存 μs」生成的，**不要把 BPM 反算回去当权威值**。

`0x58` 的 `dd` 是 **2 的幂**（`2` = 1/4, `3` = 1/8），不是真实分母。
JSON 同时给 `denominator`（原始幂）与 `denominator_real`（真实分母）。

`0x59` 的 `sf` 是 **-7..7 的有符号升降号数**，`mi` = 0 大调 / 1 小调。
★ 注意：调号→主音名必须 `sf + 7` 直接索引，**不能取模**——
`(sf+7) % 12` 会把 sf=7（C# 大调）算成 index 2 → 误报 "Db"。（`mid.py` 的 `_tonic()` 有注释）

### 1.4 时间轴换算

```
seconds(tick) = Σ 逐 tempo 段积分
一拍的秒数     = us_per_beat / 1e6
段内           = Δticks / division × us_per_beat / 1e6
```

`duration_seconds` 取**所有轨 EOT tick 的最大值**，而不是最后一轨的。
实测多轨曲子各轨 EOT tick **差得极远**——`menu.mid` 9 个不同值（13824 ~ 57796），
`sz.mid` 14 个不同值（0 ~ 78336，其中 0 是空轨），`ssm.mid` / `syg.mid` 都有 `end_tick = 0` 的空轨。
**取 max 才是播放器行为**，取「最后一轨」会短掉一大截。

`mid.py` 的 `tick_to_us()` 是标准分段线性积分；`merged[]` 里每个音符都带
`us` / `dur_us`，复刻引擎可以直接按微秒排程，**不必再实现一遍 tempo 积分**。

---

## 2. SMF 语义 ↔ J2ME 播放的对应关系

### 2.1 调用链

```
脚本 midi.play(yw,-1)                ← 地图脚本（解包后的 map/*）
  └─ e.java:3074-3082
       if (var4_9.equals("play")) {
           if (this.ao.b()) {                       // 音乐总开关 (RMS 持久化)
               ah.e();                              // 停掉上一首
               ah.a(null);                          // 清空路径
               ah.a((int)this.P.a(var3_5[1]));      // ★ 第二参数 → 循环次数
               ah.a(d.B + var3_5[0] + ".mid");      // ★ 第一参数 → 资源路径
               ah.d();                              // 起播
           }
       }
```

```
ah.d()   ah.java:181-199
    a = Manager.createPlayer(c.getClass().getResourceAsStream(c), "audio/midi");
    a.setLoopCount(d);          // ★ d 就是第二参数
    a.start();
    Control control = a.getControl("VolumeControl");
    if (control != null) b = (VolumeControl)control, b.setLevel(e);

ah.a(int)  ah.java:126-128   →  d = n     (循环次数字段)
ah.a(String) ah.java:118-120 →  c = string (资源路径字段)
ah.e()    ah.java:201-214   →  a.stop(); a.close(); a=null; b=null;
```

### 2.2 字段对照表

| `ah` 静态字段 | 含义 | 初值 | 持久化 |
|---|---|---|---|
| `c` | jar 内资源路径 | `null` | 存档 `e.java:1171-1174` `writeUTF(ah.b())` / 读档 `e.java:1732` `readUTF()` |
| `d` | **循环次数** | `-1`（`ah.java:23`） | — |
| `e` | 音量 0..100 | `50` | RMS `"YXVkaW8="` 记录 1 的 byte[1] |
| `f` | 音乐总开关 | `false` | RMS `"YXVkaW8="` 记录 1 的 byte[0] |
| `a` | `Player` 实例 | `null` | — |
| `b` | `VolumeControl` | `null` | — |

`ah.a(...)` 是**重载**：`ah.a(int)` 设循环次数，`ah.a(String)` 设路径。
CFR 反编译后两个方法名都是 `a`，看代码时务必看参数类型。

### 2.3 MIDI 概念 → J2ME API

| SMF 概念 | J2ME 侧落点 | 本项目实测 |
|---|---|---|
| 文件整体 | `Manager.createPlayer(InputStream, "audio/midi")` | `ah.java:184` |
| 循环 | `Player.setLoopCount(int)` | `ah.java:185`，值来自脚本第二参数 |
| 音量 | `Player.getControl("VolumeControl").setLevel(int)` | `ah.java:187-190`，0..100 线性 |
| 播放/停止 | `Player.start()` / `stop()`+`close()` | `ah.java:186` / `ah.java:204-210` |
| 资源定位 | `Class.getResourceAsStream(path)`，**路径必须以 `/` 开头** | `d.B = "/mid/"` |

**J2ME 的 MIDI 合成器是设备内置的，游戏不自带软音源。**
所以复刻引擎要还原音色，只能靠 `3-数据/05-资源/mid/*.json` 里的
`program_change` 事件 + GM 音色表（`mid.py` 的 `GM_PROGRAM` / `PERCUSSION`），
浏览器端得自己用 WebAudio / SoundFont 映射。

---

## 3. `midi.play` 第二参数 = 循环次数（含证据）

### 3.1 结论

**是「循环次数」，直接透传给 `javax.microedition.media.Player.setLoopCount(int)`。**

J2ME/MMA 语义：`setLoopCount(-1)` = 无限循环；`setLoopCount(0)` = 不重播；
`setLoopCount(n>0)` = 总共播 n 遍（含第一遍）。

### 3.2 证据链（文件名:行号）

| # | 位置 | 内容 |
|---|---|---|
| 1 | `4-文档/反编译源码/ah.java:23` | `d = -1;` — 静态字段 `d` 初始化为 -1 |
| 2 | `4-文档/反编译源码/ah.java:126-128` | `public static void a(int n2) { d = n2; }` — 唯一写 `d` 的方法 |
| 3 | `4-文档/反编译源码/ah.java:185` | `a.setLoopCount(d);` — `d` 的**唯一消费点** |
| 4 | `4-文档/反编译源码/e.java:3079` | `ah.a((int)this.P.a(var3_5[1]));` — `var3_5[1]` 即脚本第 2 个参数 |
| 5 | `4-文档/反编译源码/e.java:3080` | `ah.a(d.B + var3_5[0] + ".mid");` — 第 1 个参数只做路径拼接 |
| 6 | `4-文档/反编译源码/f.java:1381-1382` | 战斗脚本同一套：`ah.a((int)this.A.a(var3_5[1])); ah.a("/mid/" + var3_5[0] + ".mid");` |

由 1+2+3+4 得：`midi.play` 的第二参数 = `setLoopCount` 的循环次数。
由 5 得：第一参数只贡献文件名。

### 3.3 五条播放入口的实际取值

| 入口 | 源码 | 路径来源 | 第二参数 |
|---|---|---|---|
| 地图脚本 | `e.java:3074-3082` | `d.B + name + ".mid"` | 脚本参数 |
| 战斗脚本 | `f.java:1377-1383` | **硬编码** `"/mid/" + name + ".mid"` | 脚本参数 |
| 战斗 BGM（`enemy.str` 第 5 列） | `f.java:358` 取字段 → `f.java:473-477` | `d.B + as` | 硬编码 `-1` |
| 主菜单 | `cn/com/etgame/cls/system/b.java:79-82` | 硬编码 `/mid/menu.mid` | 硬编码 `-1` |
| 片头 Logo | `h.java:37-38`，`h.java:62` 起播 | 硬编码 `/corp/logo.mid` | 硬编码 **`1`** |

**片头是唯一用 `1` 的地方** —— 播一遍就停，逻辑上必然如此。
`h.java:61` 的 `"music.play();".equals(be2.d)` 说明起播时机由 `corp/logo.ant`
里某个帧的脚本事件触发，不是加载即播。

### 3.4 脚本里的实际值（全部 69 张地图 + 全部 fight 脚本）

```
18 × midi.play(yw,-1)
14 × midi.play(ss,-1)
11 × midi.play(sz,-1)
11 × midi.play(syc,-1)
 8 × midi.play(syg,-1)
 5 × midi.play(syt,-1)
 2 × midi.play(ssm,-1)
```

**全部 70 处都是 `-1`，即全部无限循环。** 背景音乐本来就该循环，
这也解释了为什么游戏没有「切歌淡出」逻辑——切歌靠 `ah.e()` 硬停。

`boss.mid` / `xg.mid` / `menu.mid` / `logo.mid` 从不出现在 `midi.play()` 里：
前两个走 `enemy.str` 第 5 列（`f.java:358`），后两个硬编码在 Java 里。

### 3.5 音乐开关

`e.java:3076` 的 `if (this.ao.b())` 是总闸门，`ao.b()` 最终到 `ah.a()`（`ah.java:114-116`）
返回 `f`，即 RMS `"YXVkaW8="` 里持久化的开关。玩家在设置里关掉音乐后，
脚本里的 `midi.play` 会被**整体跳过**，但路径与循环次数仍会被求值（无副作用）。

音量同理：`b.java:176` `this.t = ah.a() || ah.c() == 0 ? 0 : ah.c() / 25;`
`b.java:234` `ah.b(this.t * 25);` —— 设置界面把 0..100 的音量**量化成 0..4 档**。

---

## 4. 11 首曲子统计

### 4.1 总表

| 文件 | fmt | 轨数 | div | BPM | 拍号 | 时长(s) | duration_ticks | 事件数 | 音符数 | 通道数 | 鼓ch9 | 字节 | 字节精确耗尽 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `boss.mid` | 1 | 8 | 384 | 90.0 | 4/4 | 42.667 | 24576 | 1846 | 902 | 7 | Y | 8242 | ✅ |
| `menu.mid` | 1 | 12 | 384 | 100.0 | 4/8 | 93.402 | 57796 | 4180 | 1210 | 11 | Y | 14291 | ✅ |
| `ss.mid` | 1 | 14 | 384 | 100.0 | 4/8 | 93.331 | 57794 | 2863 | 1351 | 12 | Y | 10585 | ✅ |
| `ssm.mid` | 1 | 10 | 120 | 85.0 | 4/4 | 83.706 | 14230 | 1766 | 755 | 9 | Y | 5980 | ⚠️ 残留 3B |
| `syc.mid` | 1 | 12 | 384 | 100.0 | 4/4 | 84.000 | 53760 | 1623 | 789 | 11 | Y | 5850 | ✅ |
| `syg.mid` | 1 | 8 | 96 | 53.0 | — | 72.453 | 6144 | 1389 | 566 | 7 | N | 5762 | ⚠️ 残留 1B |
| `syt.mid` | 1 | 9 | 480 | 56.0 | 2/4 | 102.857 | 46080 | 785 | 286 | 15 | Y | 3480 | ✅ |
| `sz.mid` | 1 | 19 | 384 | 120.0 | 4/4 | 102.000 | 78336 | 3930 | 1874 | 15 | Y | 14256 | ✅ |
| `xg.mid` | 1 | 7 | 480 | 170.0 | 4/4 | 96.000 | 130560 | 2348 | 1099 | 11 | Y | 10363 | ✅ |
| `yw.mid` | 0 | 1 | 384 | 118.0 | 4/4 | 126.865 | 95808 | 3451 | 871 | 10 | Y | 12755 | ✅ |
| `corp/logo.mid` | 0 | 1 | 96 | 120.0 | — | 4.120 | 791 | 342 | 50 | 7 | N | 1435 | ✅ |
| **合计** | | **101** | | | | **901.4** | | **24523** | **9753** | | | **92999** | 9/11 |

`format 0` = 单轨（通道靠 program change 复用）；`format 1` = 多轨同步，track 0 是conductor。

### 4.2 曲名（来自 `0x03` track name，GBK 解码）

| 文件 | 轨名 |
|---|---|
| `syc.mid` | **仙剑三安溪音乐** + 12 轨全部命名：`旋律` `旋律` `副旋律` `吉他` `贝司` `摇指和弦` `笛音和弦` `弦乐铺垫` `太科鼓` `鼓点` `铺垫` `铺垫2` |
| `sz.mid` | **仙剑三-景天主题-玉满堂** |
| `yw.mid` | **王小虎主題音樂-水龍吟(幽思版)**（繁体 GBK） |
| `menu.mid` / `ss.mid` | **御剑江湖-** |
| `ssm.mid` | `pal2 (composing)` |
| `syt.mid` / `xg.mid` | 轨 1..N = `音轨 1`…`音轨 7`，末轨 = `打击乐器` |
| `boss.mid` | `untitled`（轨 0），其余 7 轨无名 |
| `logo.mid` | `logo` |
| `syg.mid` | 8 轨都是单字节 `0x00`（无意义名字） |

`syc.mid` 是命名最规范的一首（12 轨逐轨中文命名，`摇指和弦` / `太科鼓` 这类还标出了演奏手法），
是研究「国产 MIDI 音源软件怎么组织多轨」的最佳样本。

### 4.3 tempo map

只有 2 首曲子有多段 tempo：

| 文件 | 段数 | 行为 |
|---|---|---|
| `menu.mid` | 67 | tick 0 = 600000 μs (100 BPM)，**tick 56834 (=88.8 s) 起 66 段连续 ritardando**，tick 57794 收到 4615385 μs（**13.0 BPM**） |
| `ss.mid` | 55 | 同一套渐慢（起点 tick 56834 = 88.8 s），末尾同为 tick 57794 / 4615385 μs |
| 其余 9 首 | 1 | 全曲恒定 tempo |

这两首的渐慢段在**最后 4~5 秒**（menu 总长 93.4 s，渐慢从 88.6 s 开始），
是刻意的「淡出」：把 BPM 拉到近乎 0 而不是直接截断。
复刻引擎要还原这个效果，得实现 tempo ramp，不能只取 tick 0 的 BPM。

### 4.4 ★ note off 的两种写法（本项目两种都出现）

规范允许两种结束一个音：

| 写法 | 字节 | 本项目曲子 |
|---|---|---|
| A. 真 Note Off | `0x8n note vel` | `boss` `logo` `syg` `syt` `xg` —— **5 首，2903 个** |
| B. velocity 0 的 Note On | `0x9n note 0x00` | `menu` `ss` `ssm` `syc` `sz` `yw` —— **6 首，6850 个** |

`0x9n` 里 velocity 为 0 **按规范等价于 note off**。统计：

```
0x9n (vel>0) 音符总数 = 9753
   ├─ 用 0x8n 结束      = 2903
   └─ 用 0x9n vel=0 结束 = 6850
```

**B 写法占 70%，且这 6 首一个 `0x8n` 都没有。**
任何只认 `0x8n` 的解析器会丢掉这 6 首曲子的**全部结束事件**，
音符永远不释放 → 复刻引擎必然出现「音越叠越多直到爆音」。

`mid.py` 的 `merge_notes()` 两种都认：
`on = ty == "note_on" and ev["velocity"] > 0`，即 velocity 0 自动走 note-off 分支。

> 判定依据是纯字节：`menu.mid` 的 note off 全部是 `9n note 00`（状态字节 `0x9`），
> `boss.mid` 的全部是 `8n note 00`。已用 `mido` 独立复核，两边读出的音符数完全一致。

### 4.5 note off 速度的作者指纹

同一首曲子里 note off 的 velocity 取值分布，暴露了不同的编辑工具：

| 文件 | note off velocity | note off 写法（§4.4） | 判定 |
|---|---|---|---|
| `menu` `ss` `ssm` `syc` `sz` `yw` | 恒 `0` | B（`0x9n vel=0`） | 6 首，velocity 按定义就是 0，**无信息量** |
| `boss` `logo` | 恒 `0` | A（`0x8n`） | 2 首，符合规范惯例 |
| `syt` `xg` | 恒 `80` | A（`0x8n`） | **固定释放速度 80**，另一款工具 |
| `syg` | **恒等于对应 note on 的 velocity**（566/566） | A（`0x8n`） | 又一款工具 |

即：note off velocity 真正有信息量的只有 `syt` / `xg`（80）和 `syg`（回抄 note on）。
另外 `syt` / `xg` 的 note **on** velocity 只有 5~7 个离散值（`xg` 是 5 个），
而 off 恒 80 —— 说明这两首是「固定力度 + 固定释放」的批量生成。

`syg.mid` 还独有两点：**没有打击乐通道**、**没有 time signature**，
却塞了 **28 个 key signature 事件**（在 tick 0 反复横跳 F/Eb/D/C#/B/Bb），
音符短到 8 tick（div=96 → 1/12 音符）。这些特征一致指向
**从 MOD/XM 转换而来**，而非 MIDI 原生编辑。

### 4.6 通道 9（打击乐）用法

| 文件 | ch9 音符数 | 音高范围 | 不同音高 |
|---|---|---|---|
| `yw` | 361 | 33..82 | 8 |
| `boss` | 352 | 35..51 | 5 |
| `menu` / `ss` | 327 | 57..77 | 6 |
| `sz` | 272 | 59..70 | 3 |
| `syc` | 134 | 60..70 | 6 |
| `xg` | 130 | **83..83** | **1**（只有 Jingle Bell） |
| `ssm` | 87 | 36..75 | 7 |
| `syt` | 24 | 35..55 | 3 |
| `syg` `logo` | — | — | 无打击乐 |

---

## 5. 质量验证

### 5.1 字节精确耗尽（`00-逆向备忘.md` §8.2）

`mid.py` 默认 `strict=True`，任何残留立即 `SmfError`。

```
boss / menu / ss / syc / syt / sz / xg / yw / logo   → strict 通过，字节正好耗尽
ssm  → strict 报错：3 字节残留 (偏移 5977) = 0d 0d 0a
syg  → strict 报错：1 字节残留 (偏移 5761) = 0d
```

两处残留**都在最后一个 `MTrk` 完整 EOT（`00 FF 2F 00`）之后**，
不是截断的轨道，是文件末尾多出的字节。
`0D 0D 0A` / `0D` 是 CR / CRLF，典型的 DOS 文本模式尾巴。
本项目 JSON 用 `anomalies[]` 如实记录（`kind: "trailing_bytes"`，带 `offset` 与 `length`），
`_index.json` 里对应 `"byte_exact": false`——**不静默漏，也不假装通过**。

### 5.2 与独立解析器 `mido` 对拍

`mido` 是 Python 生态里独立的、严格按 SMF 规范实现的解析器。

```
logo   ev=  342  tick/type=OK params=OK dur=OK sha=OK ✓
boss   ev= 1846  tick/type=OK params=OK dur=OK sha=OK ✓
menu   ev= 4180  tick/type=OK params=OK dur=OK sha=OK ✓
ss     ev= 2863  tick/type=OK params=OK dur=OK sha=OK ✓
ssm    ev= 1766  tick/type=OK params=OK dur=OK sha=OK ✓
syc    ev= 1623  tick/type=OK params=OK dur=OK sha=OK ✓
syg    ev= 1389  tick/type=OK params=OK dur=OK sha=OK ✓
syt    ev=  785  tick/type=OK params=OK dur=OK sha=OK ✓
sz     ev= 3930  tick/type=OK params=OK dur=OK sha=OK ✓
xg     ev= 2348  tick/type=OK params=OK dur=OK sha=OK ✓
yw     ev= 3451  tick/type=OK params=OK dur=OK sha=OK ✓

共 24523 事件逐字段对拍, 不一致 0 处 → ALL MATCH mido: True
```

对拍维度：轨道数、事件总数、每个事件的**绝对 tick**、**类型**、
note/velocity、channel、controller/value、program、tempo μs、
pitch bend、time signature、key signature、sysex 原始字节、
总时长（±20 ms）、文件 sha256。

对拍中发现并修掉的本工具 bug：
1. `hi = status & 0xF0` 应为 `status >> 4`（否则 channel≠0 的事件类型全错）
2. 解析完一轨后主游标没跳过整轨（导致只解出 1 轨）
3. 同 `(轨,通道,音高)` 用了单槽而非 **FIFO 队列**（漏掉重叠同音，15 处 note off 变孤儿）
4. 调号→主音 `(sf+7)%12` 错误取模（sf=7 C# 大调误报成 Db）

### 5.3 音符配对规则

| 规则 | 说明 |
|---|---|
| 主路径 | 同 `(轨, 通道, 音高)` 队列 **FIFO**（**必须队列**：实测 `syg.mid` 轨 2 在 tick 1152 / 1160 连续两个 `note_on note=76`，tick 1164 才连发两个 note off） |
| 兜底 | 同 `(通道, 音高)` 跨轨 FIFO，记 `anomalies[].kind = "cross_track_note_pair"` |
| 悬空 | 无 note off → 时长截到本轨末事件 tick，记 `unterminated_note_on` + 音符标 `"unterminated": true` |

修好 FIFO 后，**全 11 首曲子 0 个孤儿 note off、0 个悬空 note on**，
配对率 9753/9753 = 100%（`anomalies[]` 里除 2 条 `trailing_bytes` 外为空）。

> 早期版本用单槽（非队列）配对时，`syg.mid` 报出 15 个孤儿 note off，
> 根因见下：**同一 `(轨, 通道, 音高)` 存在真正重叠的多个 note on**。
> `syg.mid` 轨 2 通道 1：
> ```
> tick 1152  note_on  note=76 vel=96    ← on #1
> tick 1160  note_on  note=76 vel=110   ← on #2（on #1 还没结束！）
> tick 1164  note_off note=96
> tick 1164  note_off note=110
> ```
> 必须按 FIFO 取最早的那个 on，单槽会让 on #2 覆盖 on #1，多出来的 off 就成了孤儿。
> 根因是编辑工具把「同音高连续 re-trigger」写成了真正的叠加。

---

## 6. JSON 输出结构

`3-数据/05-资源/mid/<name>.json`：

```jsonc
{
  "source":  { "file", "path", "size", "sha256", "container" },
  "header":  { "format", "ntrks", "division_raw", "smpte",
               "ticks_per_beat", "smpte_fps", "smpte_tpf",
               "header_bytes", "header_extra_hex" },

  "tracks": [{
    "index", "name", "offset", "declared_length", "parsed_length",
    "has_eot", "end_tick", "event_count",
    "events": [{
      "tick",          // 轨内绝对 tick（每轨独立从 0 起算）
      "abs_tick",      // 同 tick；多轨共用一条时间轴
      "offset",        // ★ 事件在文件中的字节偏移，可回溯原始字节
      "delta",         // 与前一事件的 vlq 增量
      "type",          // note_on/note_off/control_change/program_change/
                       // pitch_bend/meta/sysex/poly_aftertouch/channel_aftertouch
      // meta 额外: meta_type, meta_name, length, text, text_encoding,
      //             us_per_beat, bpm, numerator, denominator, denominator_real,
      //             sf, mi, major, key, key_tonic
      // 通道事件额外: status, channel, running,
      //             note, velocity, note_name,
      //             controller, controller_name, value, sustain,
      //             program, instrument,
      //             lsb, msb, bend, semitones, pressure
      // sysex 额外: kind(F0/F7), length, trailing_f7, data_hex
    }]
  }],

  "merged": [{                 // ★ 按 tick 排序, 可直接演奏
    "tick", "dur_ticks", "us", "dur_us",   // us/dur_us 已按 tempo_map 积分好
    "channel", "note", "note_name", "velocity",
    "track", "off_velocity", "off_tick", "paired", "unterminated"?
  }],

  "tempo_map": [{ "tick", "us_per_beat" }],
  "duration_ticks":    24576,
  "duration_seconds":  42.6667,
  "duration_us":       42666667,
  "anomalies":  [{ "kind", "detail", "offset"?, "track"?, "length"? }],
  "_stats":     { /* 每轨统计 / 全局 channel·program·controller 汇总 */ }
}
```

`3-数据/05-资源/mid/_index.json`：11 首汇总 + `player` 段
（`createPlayer` / `setLoopCount` / `d.B="/mid/"` 的源码出处 + 五条播放入口的循环次数实测值）。

复刻引擎直接吃 `merged[]`：每个音符已带 `us` / `dur_us`，按 `us` 排序丢给 WebAudio 即可，
**不需要再实现 tempo 积分**。

---

## 7. 未确认 / 待解

1. **`ssm.mid` / `syg.mid` 尾部残留字节的来源**：`0D 0D 0A` / `0D`。CR/CRLF 形态
   强烈指向 DOS 文本模式写入，但**无法证明**是原始 MID 就这样、还是 jar 打包 /
   资源下载环节引入的。不影响播放（真实 MIDI 播放器读完 EOT 就停）。
   待解：比对原始素材（`0-原始素材/`）里若有未打包的同名文件可直接定案。

2. **`syc.mid` / `sz.mid` / `yw.mid` 的 track name 混编码**：
   部分字节是合法 GBK，部分是孤立高位字节，`utf-8 / gbk / big5 / shift_jis` 全部解不出。
   已按 `raw-latin1` 原样输出并标 `text_encoding`，**不猜原文**。
   `syc.mid` 大部分轨名能解出（「旋律」「贝司」…），说明**同一文件里也有部分字节坏了**，
   像是编辑时字符集切换导致的残留。

3. **`syg.mid` 的 28 个 key signature**：全部在 tick 0，且大小调来回跳（F / Eb / D / C# / B / Bb）。
   无实际听觉意义，几乎确定是 MOD/XM 转换工具的产物，但**具体来源工具未确认**。

4. **SMPTE division 分支代码已实现但无样本**：11/11 全是 TPQN。
   `header.smpte_*` 与 `tick_to_us()` 的 SMPTE 分支属于「按规范实现但未经本项目数据验证」。

5. **延音踏板（CC64）与 `merged` 的关系**：
   `ssm.mid` 有 39 次 down + 39 次 up，`syc.mid` 各 1 次。
   `merged[]` 的 `dur_ticks` 截止在 **note off**，**没有把踏板延续的时间算进去**。
   严格还原需要给音符加 `sustain_until_tick`。当前按「note off 即停」处理——
   对 `syc.mid`（1 次）影响可忽略，对 `ssm.mid`（39 次）可能有可听差异。**未实现，待确认是否需要。**

6. **`menu.mid` / `ss.mid` 的 66 段渐慢**：确认是文件里真实存在的 66 个 `0x51` 事件，
   但**设计意图**（淡出 vs. 曲末 ritardando）无从证明，只能从位置推断。

7. **设备合成器差异**：`setLoopCount` 的边界行为、`setLevel(0..100)` 的实际音量曲线、
   GM 音色的具体音色，在真机上由厂商合成器决定，**无法从 jar 里挖出**。
   复刻引擎的音色只能逼近。