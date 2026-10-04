#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""50-解析逻辑.py —— 把战斗/脚本/表达式逻辑结构化

本脚本不解析新格式，全部结论来自 4-文档/反编译源码/ 的源码逆向，
每个条目都带 source 字段指向 类名 + 行号，可逐条复核。

产出（3-数据/07-逻辑/）：
  表达式引擎.json     t 类的文法与求值规则
  战斗系统.json       行动条、伤害、命中、暴击、buff、结算
  技能公式总表.json   config_skill.str + 所有怪物内联技能的攻击公式
  怪物属性总表.json   fight_*.str 的属性表达式，按参考等级求值
  战斗脚本指令集.json f.java / ax.java 的指令表
  动画脚本总表.json   ANT 序列 tag 中出现的全部脚本实证
"""
from __future__ import annotations

import json
import os
import re
import sys
import glob
import hashlib
import collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from formats import expr as EX  # noqa: E402
from formats import ops as OPS  # noqa: E402

ANT_DIR = os.path.join(ROOT, "3-数据", "01-ant")
SKILL_JSON = os.path.join(ROOT, "3-数据", "06-配置", "config_skill.json")
FIGHT_JSON = os.path.join(ROOT, "3-数据", "06-配置", "_汇总_敌人分布.json")
OUT = os.path.join(ROOT, "3-数据", "07-逻辑")
SRC = "4-文档/反编译源码"

# 战斗常量全部来自 config_fight.str（见 3-数据/06-配置/config_fight.json）
FIGHT_CONST = {
    "战斗背景W": 440,
    "战斗背景H": 400,
    "攻击距离": 25,
    "战斗数值水平最大速度": 8,
    "战斗数值垂直速度": 20,
    "战斗数值垂直加速度": -5,
    "战斗数值的水平偏移量": 10,
    "战斗数值的垂直偏移量": 20,
    "战斗数值的显示时间": 1000,
    "速度条的实际可用长度": 180,
    "速度条的实际技能长度": 135,
    "英雄1的X坐标": 182, "英雄1的Y坐标": 249,
    "英雄2的X坐标": 150, "英雄2的Y坐标": 272,
    "英雄3的X坐标": 210, "英雄3的Y坐标": 219,
    "敌兵1的X坐标": 26, "敌兵1的Y坐标": 164,
    "敌兵2的X坐标": 40, "敌兵2的Y坐标": 128,
    "敌兵3的X坐标": 86, "敌兵3的Y坐标": 113,
}
# W = 1000 * am.k / am.j  →  1000 * 技能长度 / 可用长度
TURN_THRESHOLD = 1000 * FIGHT_CONST["速度条的实际技能长度"] // FIGHT_CONST["速度条的实际可用长度"]

HERO_SLOTS = [(FIGHT_CONST["英雄%d的X坐标" % (i + 1)], FIGHT_CONST["英雄%d的Y坐标" % (i + 1)]) for i in range(3)]
FOE_SLOTS = [(FIGHT_CONST["敌兵%d的X坐标" % (i + 1)], FIGHT_CONST["敌兵%d的Y坐标" % (i + 1)]) for i in range(3)]

# ax.b 技能类型码 → 名称（af.java:24）
SKILL_KIND = {0: "普通", 1: "水系", 2: "雷系", 3: "火系", 4: "风系", 5: "土系", 6: "双系", 7: "变身/其它"}
# ax.c(int) 结算类型 → 语义
HIT_TYPE = {1: "单体结算", 3: "普通攻击", 5: "格挡", 6: "闪避"}
# a.java 飘字类型
POPUP_TYPE = {0: "普通伤害", 1: "暴击伤害", 2: "闪避", 3: "回精", 4: "未命中", 5: "反击", 6: "持续掉血", 7: "行动重置"}
# ax.t 单位状态机
UNIT_STATE = {0: "站立", 1: "消失", 2: "攻击", 3: "(空)", 7: "死亡", 8: "仙术释放", 9: "变身动画"}
# ax 的三元 buff 组
BUFFS = [("C", "D", "武增", "A"), ("E", "F", "防增", "B"), ("a", "G", "速增", "C")]


def sha256_file(p: str) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def dump(name: str, obj) -> str:
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, sort_keys=False)
        f.write("\n")
    return p


def src(cls: str, line: int, note: str = "") -> dict:
    d = {"class": "%s/%s.java" % (SRC, cls), "line": line}
    if note:
        d["note"] = note
    return d


# ---------------------------------------------------------------- 表达式引擎
def build_expr_spec() -> dict:
    return {
        "kind": "logic",
        "name": "表达式求值引擎",
        "source": src("t", 18, "public final synchronized long a(String)"),
        "grammar": {
            "expr": "term (('+' | '-') term)*",
            "term": "unary (('*' | '/' | '%') unary)*",
            "unary": "('+' | '-') unary | primary ('^' unary)?",
            "primary": "'(' expr ')' | operand",
            "operand": "NUMBER | VARIABLE",
            "assignment": "VARIABLE '=' expr",
        },
        "tokens": {
            "operatorChars": "+-*/%^=()",
            "identifierStart": "_ $ a-z A-Z",
            "identifierBody": "除运算符与空格外的任意字符",
            "numberBody": "同上（实际只出现纯数字）",
            "whitespace": "仅空格 ' ' 被跳过",
            "kinds": {"0": "流结束(EOF)", "1": "运算符", "2": "标识符", "3": "数字"},
        },
        "precedence": [["^"], ["*", "/", "%"], ["+", "-"]],
        "associativity": {"^": "右结合（指数侧递归 unary）", "* / % + -": "左结合"},
        "quirks": [
            {
                "id": "unary-minus-vs-pow",
                "rule": "-2^2 == 4",
                "why": "一元负号先作用于底数，再做幂运算（d.java:129-148 先取 l3 再判 ^）",
                "impl": "2-工具/formats/expr.py::_pow",
            },
            {
                "id": "div-trunc-toward-zero",
                "rule": "-10/3 == -3（不是 Python 的 -4）",
                "why": "Java 整数除法向 0 截断",
                "impl": "2-工具/formats/expr.py::_jdiv",
            },
            {
                "id": "mod-sign-follows-dividend",
                "rule": "-10%3 == -1",
                "why": "Java 取模语义",
                "impl": "2-工具/formats/expr.py::_jmod",
            },
            {
                "id": "pow-negative-exponent",
                "rule": "2^-1 == 0；2^0 == 1",
                "why": "原实现用 for 循环连乘，负指数直接落 0（d.java:141-147）",
                "impl": "2-工具/formats/expr.py::_pow",
            },
            {
                "id": "undefined-var-is-zero",
                "rule": "未定义变量取 0",
                "why": "e.java:170 object == null ? 0L",
                "impl": "2-工具/formats/expr.py::_operand",
            },
            {
                "id": "divide-by-zero-throws",
                "rule": "x/0 与 x%0 抛「算术错误。」",
                "why": "c.java:94,100",
                "impl": "2-工具/formats/expr.py::ArithmeticErr",
            },
            {
                "id": "scope-per-instance",
                "rule": "每个 t 实例持有独立 Hashtable<String,Long> 变量表",
                "why": "t.java:13  private Hashtable f",
                "impl": "2-工具/formats/expr.py::Expr",
            },
        ],
        "variableScopes": [
            {"holder": "f.A", "desc": "战斗画面的全局事件/开关存储", "keys": ["event<数字>", "任意脚本变量"],
             "source": src("f", 37, "private t A")},
            {"holder": "ax.m", "desc": "单位自身作用域，技能结算时写入 slv",
             "keys": ["slv"], "source": src("ax", 53, "protected t m")},
            {"holder": "af.m", "desc": "技能自己的作用域，af.a(slv,atk) 写入 slv/atk 后求值伤害公式",
             "keys": ["slv", "atk"], "source": src("af", 7, "private t m")},
            {"holder": "bm.q", "desc": "怪物配置解析作用域，bm.a(int) 写入 lv",
             "keys": ["lv"], "source": src("bm", 23, "private t q")},
            {"holder": "bj.L", "desc": "角色配置解析作用域（无预置变量）",
             "keys": [], "source": src("bj", 43, "private t L")},
        ],
        "pythonPort": "2-工具/formats/expr.py",
        "verifiable": True,
    }


# ---------------------------------------------------------------- 战斗系统
def build_combat() -> dict:
    return {
        "kind": "logic",
        "name": "战斗系统",
        "sources": [src("f", 10), src("ax", 8), src("bd", 4), src("g", 7), src("bm", 6), src("af", 6),
                    src("am", 4), src("j", 9), src("bj", 4)],
        "slots": {
            "heroes": 3, "foes": 3, "total": 6,
            "note": "d[0..2] 为玩家(bd)，d[3..5] 为敌人(g)；a[3] 与 b[3] 各自独立",
            "source": src("f", 13, "public bd[] a; public g[] b; private ax[] d"),
        },
        "unitFieldMap": {
            "note": "ax 的字段语义，由 bd/g 构造器与全部 getter/setter 反推闭合",
            "fields": {
                "I": {"name": "当前精(HP)", "getter": "w()", "setter": "j(int)", "clamp": "0..J"},
                "J": {"name": "最大精", "getter": "x()", "setter": "k(int)", "clamp": ">=1"},
                "K": {"name": "攻击", "getter": "(无)", "setter": "g(int)", "clamp": ">=0"},
                "L": {"name": "防御", "getter": "(无)", "setter": "m(int)", "clamp": "无"},
                "M": {"name": "当前神", "getter": "u()", "setter": "h(int)", "clamp": "0..N"},
                "N": {"name": "最大神", "getter": "v()", "setter": "i(int)", "clamp": ">=1"},
                "O": {"name": "当前气", "getter": "s()", "setter": "e(int)", "clamp": "0..P"},
                "P": {"name": "最大气", "getter": "t()", "setter": "f(int)", "clamp": ">=1"},
                "Q": {"name": "速度", "getter": "F()", "setter": "n(int)", "clamp": ">=0"},
                "S": {"name": "运", "getter": "D()", "setter": "p(int)", "clamp": "无"},
                "R": {"name": "攻击时目标增加的气", "getter": "s()-O 之外的独立字段", "setter": "o(int)"},
                "T": {"name": "好感度(玩家)/经验", "getter": "E()", "setter": "q(int)"},
                "H": {"name": "等级", "getter": "y()", "setter": "l(int)", "clamp": ">=1"},
                "i": {"name": "行动条", "getter": "m()", "range": "0..1000"},
                "c": {"name": "技能速度(行动期增量)", "setter": "由技能表达式求值写入"},
                "t": {"name": "状态机", "values": UNIT_STATE},
                "j": {"name": "本回合已行动", "type": "bool"},
                "ab": {"name": "格挡中", "getter": "r()", "type": "bool"},
                "ac": {"name": "变身中", "getter": "z()", "type": "bool"},
                "B": {"name": "反击(吸血)标记", "type": "bool"},
                "z": {"name": "停止行动(定身)", "type": "bool"},
                "u": {"name": "持续掉血生效", "type": "bool"},
                "C/D": {"name": "武增数值/剩余回合", "clamp": "回合计数递减到 0 时数值清零"},
                "E/F": {"name": "防增数值/剩余回合"},
                "a/G": {"name": "速增数值/剩余回合"},
                "d/e": {"name": "当前显示坐标", "getter": "(protected)"},
                "U/V": {"name": "站位坐标", "getter": "o()/p()"},
            },
            "source": [src("ax", 12, "字段声明"), src("ax", 1218, "getter/setter 全表"),
                       src("bd", 19, "玩家属性映射"), src("g", 26, "怪物属性映射")],
        },
        "turnGauge": {
            "name": "行动条（速度条）",
            "source": src("ax", 49, "private static int W = 1000 * am.k / am.j"),
            "constants": {
                "W": {"expr": "1000 * 速度条的实际技能长度 / 速度条的实际可用长度",
                      "value": TURN_THRESHOLD, "from": "config_fight.str"},
                "max": 1000,
                "availableLength": FIGHT_CONST["速度条的实际可用长度"],
                "skillLength": FIGHT_CONST["速度条的实际技能长度"],
            },
            "tick": {
                "waiting": "i += 速度(Q) + 速增(a)",
                "acting": "i += 技能速度(c) + 速增(a)",
                "gate": "仅当 敌人尚未全灭 且 本单位未定身 时推进（ax.java:122）",
            },
            "snap": {
                "expr": "若 W < i < W + (速度+速增) 且 本单位尚未行动 则 i = W",
                "why": "避免高速单位冲过阈值而无法行动",
                "source": src("ax", 125),
            },
            "cap": {"expr": "i > 1000 时 i = 1000", "source": src("ax", 125)},
            "buffDecay": {
                "window": "当 i 落在 [速度+速增, 2*(速度+速增)) 区间时，三组 buff 各递减一次剩余回合",
                "expire": "剩余回合降到 0 后 buff 数值清零且剩余回合归零",
                "source": src("ax", 127),
            },
            "turnStart": {"expr": "!已行动 && i == W → 调 c()（玩家开菜单 / 怪物 AI 选技能）并置 已行动=true",
                          "source": src("ax", 153)},
            "turnEnd": {"expr": "已行动 && i == 1000 → 调 b()（执行技能结算）", "source": src("ax", 156)},
            "reset": {"expr": "h(): i=0, aa=0, 已行动=false, r=false", "source": src("ax", 238)},
            "death": {"expr": "i<=0 且 处于站立/消失 → 精置 0，播「死亡中」，状态置 7（死亡）",
                      "source": src("ax", 213)},
            "wounded": {"expr": "当前精 < 最大精*2/10 → 精灵切「重伤」帧", "source": src("ax", 577)},
        },
        "damage": {
            "name": "伤害结算",
            "source": src("ax", 494, "protected final void a(String, ax, int, int)"),
            "steps": [
                {"id": "guard", "expr": "目标非空 && 未死亡 && 目标精>0"},
                {"id": "advantage", "expr": "攻击优势 adv = (攻方.K + 武增C) - (目标.L + 防增E)"},
                {"id": "branch", "expr": "adv > 0 走技能公式；adv <= 0 直接固定 1 点", "source": src("ax", 502)},
                {"id": "skillLevel", "expr": "lv = 技能等级(技能)", "source": src("ax", 503)},
                {"id": "base", "expr": "base = 技能.伤害公式(slv=lv, atk=adv)", "source": src("af", 76)},
                {"id": "roll", "expr": "roll = 均匀整数[9,11]  → 0.9x ~ 1.1x", "source": src("ax", 508)},
                {"id": "compute", "expr": "dmg = base * roll / 10（整数除法）", "source": src("ax", 516)},
                {"id": "floor", "expr": "dmg = max(dmg, 1)", "source": src("ax", 517)},
                {"id": "morph", "expr": "若变身中(ac) dmg = dmg * 3 / 5（×0.6）", "source": src("ax", 521)},
                {"id": "postpone", "expr": "结算类型 != 闪避 且 0 < 目标行动条 < W → 目标行动条 -= n3(动画延迟参数)",
                 "source": src("ax", 526)},
            ],
            "byType": {
                "3": {"name": "普通攻击", "rules": [
                    {"id": "dmgToQi", "expr": "若 施法者是怪物 且 当前技能是变身(b==7) → 目标气 += 攻击方R",
                     "src": src("ax", 529)},
                    {"id": "crit", "expr": "若 rand(施法者运 S, 200) 命中 且 dmg != 1 → dmg *= 2；dmg = min(dmg, 目标当前精)",
                     "prob": "S / 200", "popup": "暴击伤害", "src": src("ax", 535)},
                    {"id": "normal", "expr": "否则 dmg = min(dmg, 目标当前精)", "popup": "普通伤害",
                     "src": src("ax", 545)},
                    {"id": "lifesteal", "expr": "若 反击标记B → 回精 = max(1, dmg/4)，施法者精 += 回精",
                     "src": src("ax", 552)},
                ]},
                "5": {"name": "格挡", "rules": [
                    {"id": "halve", "expr": "dmg = (dmg >>= 1) <= 0 ? 1 : dmg；dmg = min(dmg, 目标当前精)",
                     "popup": "普通伤害", "src": src("ax", 559)},
                ]},
                "6": {"name": "闪避", "rules": [
                    {"id": "noop", "expr": "不扣血，仅弹「闪避」飘字", "popup": "闪避", "src": src("ax", 567)},
                ]},
                "1": {"name": "单体结算", "rules": [
                    {"id": "delegate", "expr": "转交 ax 基类 a(int,String,int) 走单目标判定",
                     "src": src("ax", 423)},
                ]},
            },
            "targeting": {
                "playerAttack": {
                    "expr": "遍历全部存活敌人 in l.b；每人独立判定闪避与格挡",
                    "evadeCheck": "!已行动 && 目标精>0 && rand(目标运 S, 100)",
                    "src": src("bd", 160),
                },
                "monsterAttack": {
                    "expr": "遍历全部存活玩家 in l.a；每人独立判定格挡与闪避",
                    "blockCheck": "目标.r() 格挡中",
                    "src": src("g", 143),
                },
                "note": "普通攻击是范围命中，不做单目标骰子；范围内每人各判一次闪避",
            },
        },
        "evade": {
            "name": "闪避",
            "expr": "rand(目标.运 S, 100)  → 概率 = 目标运 / 100",
            "source": src("ax", 486, "return j.b(ax2.S, 100, this.af)"),
            "notes": [
                "仅当攻击者本回合尚未行动(!j)且目标精>0 时才判定",
                "运 >= 100 时必定闪避",
            ],
        },
        "crit": {
            "name": "暴击",
            "expr": "rand(施法者.运 S, 200) → 概率 = 施法者运 / 200；dmg *= 2",
            "source": src("ax", 535),
            "notes": ["dmg 原本等于 1（打不动）时不触发暴击", "暴击后 dmg 不会超过目标当前精"],
        },
        "buffs": {
            "name": "临时增益（技能施加）",
            "source": src("ax", 1021, "player addatk/adddef/addspeed/addAll"),
            "levelVar": "lv = 施法者对该技能的技能等级",
            "rules": [
                {"cmd": "addatk", "target": "单体的施法目标", "amount": "(10 + 5*(lv-1)) * 施法者.攻击 / 100",
                 "duration": "lv + 2", "sets": "C=amount, D=duration", "src": src("ax", 1024)},
                {"cmd": "adddef", "target": "单体的施法目标", "amount": "(10 + 5*(lv-1)) * 施法者.防御 / 100",
                 "duration": "lv + 2", "sets": "E=amount, F=duration", "src": src("ax", 1033)},
                {"cmd": "addspeed", "target": "单体的施法目标", "amount": "1（固定值，与 lv 无关）",
                 "duration": "lv + 2", "sets": "a=amount, G=duration", "src": src("ax", 1043)},
                {"cmd": "addAll", "target": "全部存活队友(含自身)", "amount": "同时施加武增/防增/速增",
                 "duration": "lv + 2", "src": src("ax", 1055)},
            ],
            "quirk": "增益数值取的是【施法者】的攻击/防御，不是目标的",
            "expire": "剩余回合在行动条进入 [速度, 2*速度) 时递减，归零后数值清零",
            "icons": {"A()": "武增生效中(D>0 && C>0)", "B()": "防增生效中(F>0 && E>0)",
                      "C()": "速增生效中(G>0 && a>0)"},
        },
        "morph": {
            "name": "变身",
            "flag": "ax.ac (getter z())",
            "costPerTurn": {"expr": "变身中每回合 气 -= U[7].j", "value": 10,
                            "src": src("bd", 43), "note": "U[7] = config_skill.str 第 7 条 = 魔尊真身，af.j = 10"},
            "insufficient": "气 < 10 → 提示「气值不足」并取消变身",
            "damageScale": "伤害 × 3/5（ax.java:521）",
            "skillLevelForced": {"expr": "变身技能的 slv 强制为 5", "src": src("bd", 73)},
            "specialSlot": {"expr": "U[0] 被硬编码为变身槽：af.b=7，伤害公式 'atk'，MP/气 均为 0",
                            "src": src("cn/com/etgame/cls/system/d", 249)},
        },
        "skillLevel": {
            "name": "技能等级",
            "player": {"expr": "取角色存档里该技能的实际等级", "src": src("bd", 155, "return this.n.b(n2)")},
            "monster": {"expr": "(等级 + 20) / 20（整数除法）", "src": src("g", 139)},
            "forced": {"普通攻击": "固定 slv = 4", "变身": "固定 slv = 5", "src": src("bd", 73)},
            "quirk": {
                "id": "monster-level-hardcoded-1",
                "detail": "g 构造器写死 this.l(1)（g.java:26），所以 ax.H 恒为 1，"
                          "怪物技能等级恒为 (1+20)/20 = 1；真实等级只通过 bm 内部变量 lv "
                          "参与 生命/速度/经验/金钱/仙术速度 的表达式求值。",
                "impact": "所有怪物的技能公式里 slv 恒为 1，atk/3、atk*(5+5)/20 之类。",
                "doNotFix": True,
            },
        },
        "skillSpeed": {
            "name": "技能速度（行动期行动条增量）",
            "player": {"expr": "求值角色配置的「仙术速度」表达式", "src": src("bd", 74)},
            "monster": {"expr": "求值 fight_N.str 的「仙术速度」表达式（作用域只有 slv）", "src": src("g", 134)},
            "note": "变量 slv 在同一作用域内已被设为技能等级，因此 10+4*(slv-1) 对怪物恒为 10",
        },
        "monsterAI": {
            "name": "怪物 AI",
            "source": src("g", 115, "protected final void c()"),
            "steps": [
                {"id": "heal", "expr": "当前精 <= 最大精*3/10 且 rand(当前精,100) 命中 且 携带物品非空 → 随机用 1 个药，中断本回合",
                 "src": src("g", 118)},
                {"id": "pick", "expr": "rand(5 + 等级/2, 100) 命中 → 从仙术技能表随机取 1 个；否则从普通技能表随机取 1 个",
                 "prob": "(5 + 等级/2) / 100", "src": src("g", 126)},
                {"id": "target", "expr": "随机取一个存活玩家（f.i()）", "src": src("f", 846)},
            ],
        },
        "encounter": {
            "name": "遇敌组成",
            "source": src("f", 346, "private void d(int)"),
            "enemyLineFormat": "lvmin-lvmax,count,levelSpec,antName,bgm   （enemy.str）",
            "countSplit": {
                "single": "每种怪的数量：50% 出 1、45% 出 2、5% 出 3",
                "two": "50% 出 2、40% 出 3、10% 出 1",
                "multi": "5% 出 1、35% 出 2、60% 出 3",
                "src": src("f", 350),
            },
            "levelScaling": {
                "expr": "怪物等级 = 玩家等级 ±1，并夹在 [lvmin, lvmax] 内",
                "detail": "plv<=lvmin → lvmin；plv>=lvmax → lvmax；否则在 "
                          "[max(lvmin,plv-1), min(lvmax,plv+1)] 之间均匀取整数",
                "src": src("f", 443),
            },
            "hpRangeRandom": "生命 = 均匀整数[最小生命表达式, 最大生命表达式]（bm.d）",
            "spdRangeRandom": "速度 = 均匀整数[最小速度表达式, 最大速度表达式]（bm.e）",
            "expRangeRandom": "经验 = 均匀整数[最小经验, 最大经验]（bm.i）",
            "goldRangeRandom": "金钱 = 均匀整数[最小金钱, 最大金钱]（bm.j）",
        },
        "settlement": {
            "name": "战斗结算",
            "source": src("f", 1020, "private void f(int)"),
            "win": {
                "state": 1,
                "dropItems": "每条掉落物 item(probPercent)，rand(percent,100) 命中则掉落，最多 3 件",
                "gold": "Σ 各怪物 均匀金钱", "exp": "Σ 各怪物 均匀经验",
                "debugFlag": {"name": "四倍修行", "expr": "命中该 flag 时 exp <<= 2 且 gold <<= 2",
                              "src": src("f", 1052)},
                "perMember": [
                    "存活者：好感度与精按战斗快照恢复（E() / w()）",
                    "存活者：若 g(经验) 返回真 → 提示升级",
                    "阵亡者：好感度 -= 5，且精强制置 1（不死亡，代价是掉好感）",
                    "等级上限 45，除非 debug flag 500 打开",
                ],
                "src": src("f", 1062),
            },
            "lose": {"state": 2, "src": src("f", 1097)},
            "endDetect": {"expr": "全部玩家死亡 → 败；全部敌人死亡 → 胜", "src": src("f", 950)},
        },
        "slotPositions": {"heroes": HERO_SLOTS, "foes": FOE_SLOTS,
                          "attackRange": FIGHT_CONST["攻击距离"]},
        "popupTypes": POPUP_TYPE,
        "randomPrimitives": {
            "j.a(min,max,rnd)": {"expr": "max - |rnd.nextInt()| % (max-min+1)", "semantics": "闭区间 [min,max] 均匀整数",
                                 "src": src("j", 135)},
            "j.b(x,y,rnd)": {"expr": "x*y>=0 && |rnd.nextInt()| % y < |x|", "semantics": "概率 x/y",
                             "src": src("j", 146)},
            "j.a(n)": {"expr": "round(sqrt(n))", "semantics": "整数平方根，用于距离计算",
                       "src": src("j", 103)},
        },
    }


# ---------------------------------------------------------------- 技能公式
SKILL_COLS = ["技能类型", "攻击类型", "名字", "攻击动画", "全体", "目标X", "目标Y", "可变身",
              "神消耗", "气消耗", "伤害公式", "技能介绍"]


def parse_skill_cols(cols):
    c = list(cols) + [None] * 12
    kind = c[0]
    return {
        "index": None,
        "kind": SKILL_KIND.get(kind if kind in SKILL_KIND else 7),
        "kindCode": kind,
        "attackType": c[1],
        "gain": c[1] == "增益",
        "name": c[2],
        "anim": c[3],
        "allTargets": c[4] == "是",
        "targetOffset": [int(c[5] or 0), int(c[6] or 0)],
        "morphable": c[7] == "是",
        "cost神": int(c[8] or 0),
        "cost气": int(c[9] or 0),
        "formula": (c[10] or "").strip(),
        "desc": (c[11] or "").strip() or None,
    }


def eval_formula(f, slv=1, atk=100):
    try:
        return EX.evaluate(f, slv=slv, atk=atk)
    except Exception as e:  # noqa: BLE001
        return {"error": str(e)}


def build_skill_formulas() -> tuple[dict, list]:
    d = json.load(open(SKILL_JSON, encoding="utf-8"))
    player_skills = []
    for t in d["tables"]:
        s = parse_skill_cols(t["cols"])
        s["index"] = t["entry"]
        s["origin"] = "config_skill.str"
        s["isTemplate"] = (t["entry"] == 0)
        if s["isTemplate"]:
            # d.java:249 硬编码覆盖：U[0] = af(0,"none","none","name","攻击","否","0","0","否","0","0","atk",null)
            s.update({"kind": "变身/其它", "kindCode": "none", "attackType": "none", "gain": False,
                      "name": "name", "anim": "攻击", "allTargets": False, "targetOffset": [0, 0],
                      "morphable": False, "cost神": 0, "cost气": 0, "formula": "atk", "desc": None,
                      "hardcodedSlot": True,
                      "note": "d.U[0] 被源码硬编码为变身槽，实际数据行被忽略"})
        if s["formula"]:
            s["vars"] = EX.collect_vars(s["formula"])
            s["samples"] = {f"slv={lv},atk={atk}": eval_formula(s["formula"], lv, atk)
                            for lv, atk in ((1, 100), (4, 100), (10, 100), (1, 500), (5, 300))}
            s["parsable"] = isinstance(s["samples"].get("slv=1,atk=100"), int)
        player_skills.append(s)

    # 怪物内联技能（fight_*.str 的 普通技能 / 仙术技能）
    import zlib
    from formats import strfile as SF
    monster_skills = []
    monsters = []
    for p in sorted(glob.glob(os.path.join(ROOT, "1-解包产物", "解包树", "str", "fight_*.str"))):
        cid = os.path.basename(p)[len("fight_"):-len(".str")]
        if not cid.isdigit():
            continue
        raw = SF.load(p)
        cfg = dict(raw)

        def split_skills(v):
            out = []
            if not v:
                return out
            for part in str(v).split(","):
                f = part.split("#")
                if len(f) < 11:
                    continue
                s = parse_skill_cols(f)
                s["origin"] = "fight_%s.str" % cid
                s["isTemplate"] = False
                if s["formula"]:
                    s["vars"] = EX.collect_vars(s["formula"])
                    s["samples"] = {f"slv={lv},atk={atk}": eval_formula(s["formula"], lv, atk)
                                    for lv, atk in ((1, 100), (4, 100), (10, 100))}
                    s["parsable"] = isinstance(s["samples"].get("slv=1,atk=100"), int)
                out.append(s)
            return out

        normals = split_skills(cfg.get("普通技能"))
        spells = split_skills(cfg.get("仙术技能"))
        for s in normals + spells:
            s["configId"] = int(cid)
            s["configName"] = cfg.get("名字")
            monster_skills.append(s)

        # 属性表达式按参考等级求值
        lv_ref = 5
        env = {"lv": lv_ref}
        stats = {}
        for key, var in (("最小生命", "lv"), ("最大生命", "lv"), ("最小速度", "lv"), ("最大速度", "lv"),
                         ("仙术速度", "slv"), ("攻击值", "lv"), ("运", "lv"),
                         ("攻击时增加的气值", "lv"), ("最小经验", "lv"), ("最大经验", "lv"),
                         ("最小金钱", "lv"), ("最大金钱", "lv"), ("使用药品的概率", "lv")):
            expr = cfg.get(key)
            if expr is None:
                continue
            e = EX.Expr({var: 1 if var == "slv" else lv_ref})
            try:
                stats[key] = {"expr": str(expr), "valueAt": e.eval(str(expr))}
            except Exception as ex:  # noqa: BLE001
                stats[key] = {"expr": str(expr), "error": str(ex)}
        monsters.append({
            "configId": int(cid),
            "name": cfg.get("名字"),
            "id": cfg.get("ID"),
            "moves": not str(cfg.get("ID")) in ("1", "2", "3", "4", "5"),
            "movesNote": "ID 为 1..5 的敌人不会移动（g.java:41-51 置 p=false）",
            "statsAtLv": {"lv": lv_ref if stats else None, "fields": stats},
            "carriedItems": [s for s in str(cfg.get("携带物品") or "").split(",") if s],
            "drops": [s for s in str(cfg.get("掉落物品") or "").split(",") if s],
            "normalSkills": [s["name"] for s in normals],
            "spellSkills": [s["name"] for s in spells],
            "source": {"file": "fight_%s.str" % cid, "sha256": sha256_file(p)},
        })
        _ = (zlib,)

    out = {
        "kind": "logic",
        "name": "技能公式总表",
        "formulaContract": {
            "vars": {"slv": "技能等级，min 1；玩家取存档等级，怪物恒 1，普通攻击强制 4，变身强制 5",
                     "atk": "攻击优势 = (攻方攻击+武增) - (目标防御+防增)"},
            "eval": "int(eval(formula, {slv, atk}))，整数除法向 0 截断",
            "source": src("af", 76, "public final int a(int n2, int n3)"),
            "note": "公式为 0 的增益类技能不造成伤害，只走 buff 分支",
        },
        "playerSkills": player_skills,
        "monsterSkillCount": len(monster_skills),
        "monsterSkills": monster_skills,
    }
    return out, monsters


# ---------------------------------------------------------------- 指令集
BATTLE_SCRIPT_OPS = [
    {"ns": "script", "cmd": "load", "args": "<文件名>", "effect": "把 /str/<文件名>.str 整份读入缓存 w",
     "src": src("f", 1281)},
    {"ns": "script", "cmd": "include", "args": "<文件名> <行号变量>", "effect": "跳到该文件指定行继续执行；未缓存则先按行号读取单行",
     "src": src("f", 1288)},
    {"ns": "script", "cmd": "openScriptList", "args": "", "effect": "x=true, y=true，进入批处理队列模式",
     "src": src("f", 1300)},
    {"ns": "script", "cmd": "closeScriptList", "args": "", "effect": "x=false, y=false，退出批处理",
     "src": src("f", 1196)},
    {"ns": "player", "cmd": "setmetos", "args": "", "effect": "主角进入变身姿态（c(true)）", "src": src("f", 1209)},
    {"ns": "player", "cmd": "addspeed", "args": "<v>", "effect": "速度 += v（同时写回角色存档），飘字「加v点速」",
     "src": src("f", 1213)},
    {"ns": "player", "cmd": "addluck", "args": "<v>", "effect": "运 += v（写回存档），飘字「加v点运」", "src": src("f", 1222)},
    {"ns": "player", "cmd": "addgod", "args": "<v>", "effect": "气 += v，飘字「加v点神」", "src": src("f", 1231)},
    {"ns": "player", "cmd": "addhp", "args": "<v>", "effect": "精 += v，飘字「加v点精」", "src": src("f", 1239)},
    {"ns": "player", "cmd": "setnone", "args": "", "effect": "解除异常状态，提示「解除异常状态」", "src": src("f", 1247)},
    {"ns": "player", "cmd": "againlife", "args": "<v>", "effect": "已死亡则复活并置精=v；否则精 += v", "src": src("f", 1252)},
    {"ns": "dialogBox", "cmd": "setText", "args": "<文本变量>", "effect": "设置对话框文本", "src": src("f", 1271)},
    {"ns": "dialogBox", "cmd": "setType", "args": "<type_right|...>", "effect": "设置对话框对齐类型", "src": src("f", 1273)},
    {"ns": "dialogBox", "cmd": "showDialog", "args": "", "effect": "显示对话框", "src": src("f", 1275)},
    {"ns": "dialogBox", "cmd": "hideDialog", "args": "", "effect": "隐藏对话框", "src": src("f", 1277)},
    {"ns": "game", "cmd": "markEvent", "args": "<编号>", "effect": "event<编号> = 1", "src": src("f", 1304)},
    {"ns": "game", "cmd": "unmarkEvent", "args": "<编号>", "effect": "event<编号> = 0", "src": src("f", 1306)},
    {"ns": "game", "cmd": "waitForKey", "args": "<键位串|提示>", "effect": "等待指定按键；键位串用 | 分隔",
     "keys": {"fire": 1, "up": 2, "down": 4, "left": 8, "right": 16, "0": 32, "1": 64, "2": 128,
              "3": 256, "4": 512, "5": 1024, "6": 2048, "7": 4096, "8": 8192, "9": 16384,
              "*": 32768, "#": 65536}, "src": src("f", 1308)},
    {"ns": "game", "cmd": "backToRPG", "args": "", "effect": "解散队友并返回地图", "src": src("f", 1352)},
    {"ns": "game", "cmd": "backToMenu", "args": "", "effect": "清空战斗并返回主菜单", "src": src("f", 1362)},
    {"ns": "system", "cmd": "showInfo", "args": "<文本变量> <毫秒>", "effect": "屏幕顶部提示", "src": src("f", 1367)},
    {"ns": "system", "cmd": "showAsideInfo", "args": "<文本> <文本变量>", "effect": "侧栏提示", "src": src("f", 1370)},
    {"ns": "system", "cmd": "markFee", "args": "<编号>", "effect": "开启调试 flag", "src": src("f", 1372)},
    {"ns": "system", "cmd": "unmarkFee", "args": "<编号>", "effect": "关闭调试 flag", "src": src("f", 1374)},
    {"ns": "midi", "cmd": "play", "args": "<文件名> <循环次数变量>",
     "effect": "播放 /mid/<文件名>.mid，循环次数直接传给 Player.setLoopCount，-1 为无限",
     "src": src("f", 1378)},
    {"ns": "midi", "cmd": "stop", "args": "", "effect": "停止音乐", "src": src("f", 1384)},
    {"ns": "(队列控制)", "cmd": "wait", "args": "<毫秒变量>", "effect": "战斗脚本队列暂停指定毫秒",
     "src": src("f", 1118)},
    {"ns": "(队列控制)", "cmd": "break", "args": "", "effect": "跳出批处理队列", "src": src("f", 1118)},
]

SKILL_SCRIPT_OPS = [
    {"ns": "attacker", "cmd": "hurt", "args": "<结算类型> <文本> <延迟表达式>",
     "effect": "触发伤害结算；结算类型 1=单体 3=普通攻击 5=格挡 6=闪避",
     "src": src("ax", 807)},
    {"ns": "attacker", "cmd": "blackGround", "args": "<是|否>", "effect": "全屏黑/不黑", "src": src("ax", 819)},
    {"ns": "attacker", "cmd": "splash", "args": "<毫秒> <颜色>", "effect": "全屏染色", "src": src("ax", 821)},
    {"ns": "attacker", "cmd": "shake", "args": "<毫秒> <dx> <dy>", "effect": "震屏", "src": src("ax", 823)},
    {"ns": "attacker", "cmd": "steal", "args": "", "effect": "20% 概率偷取目标 1 个物品", "src": src("ax", 825)},
    {"ns": "skill", "cmd": "dmgoftime", "args": "<掉血时长ms> <间隔ms> <每次掉血量> <命中概率>",
     "effect": "持续掉血；全体技能作用于全部敌人/队友", "src": src("ax", 841)},
    {"ns": "skill", "cmd": "stopspeed", "args": "<定身时长ms> <命中概率>", "effect": "定身，行动条停止推进",
     "src": src("ax", 888)},
    {"ns": "skill", "cmd": "resetspeed", "args": "<命中概率>", "effect": "立即重置行动条并行动", "src": src("ax", 923)},
    {"ns": "skill", "cmd": "kill", "args": "<伤害表达式>",
     "effect": "直接按表达式数值击杀目标", "src": src("ax", 954)},
    {"ns": "skill", "cmd": "dmgtohp", "args": "<命中概率>", "effect": "下次受击按 1/4 伤害回精（反击）",
     "src": src("ax", 997)},
    {"ns": "skill", "cmd": "clear", "args": "", "effect": "清除反击标记", "src": src("ax", 1010)},
    {"ns": "player", "cmd": "addatk", "args": "", "effect": "对目标施加武增（仅玩家单位可用）",
     "src": src("ax", 1021), "onlyPlayer": True},
    {"ns": "player", "cmd": "adddef", "args": "", "effect": "对目标施加防增（仅玩家单位可用）",
     "src": src("ax", 1031), "onlyPlayer": True},
    {"ns": "player", "cmd": "addspeed", "args": "", "effect": "对目标施加速增（仅玩家单位可用）",
     "src": src("ax", 1041), "onlyPlayer": True},
    {"ns": "player", "cmd": "addAll", "args": "", "effect": "对全部队友施加武防速增（仅玩家单位可用）",
     "src": src("ax", 1050), "onlyPlayer": True},
    {"ns": "player", "cmd": "addhp", "args": "<表达式>", "effect": "对目标加精（仅玩家单位可用）",
     "src": src("ax", 1077), "onlyPlayer": True},
    {"ns": "player", "cmd": "addhpall", "args": "<表达式>", "effect": "对全部队友加精（仅玩家单位可用）",
     "src": src("ax", 1089), "onlyPlayer": True},
    {"ns": "player", "cmd": "againlife", "args": "<表达式>", "effect": "复活或加精（仅玩家单位可用）",
     "src": src("ax", 1109), "onlyPlayer": True},
    {"ns": "player", "cmd": "setnone", "args": "", "effect": "解除目标异常状态（仅玩家单位可用）",
     "src": src("ax", 1131), "onlyPlayer": True},
    {"ns": "player", "cmd": "setnoneall", "args": "", "effect": "解除全部异常状态（仅玩家单位可用）",
     "src": src("ax", 1135), "onlyPlayer": True},
]

CONDITIONS = [
    {"expr": "eventMarked <n>", "true": "f.A.a(\"event\"+n) != 0", "src": src("f", 1142)},
    {"expr": "!eventMarked <n>", "true": "f.A.a(\"event\"+n) == 0", "src": src("f", 1146)},
    {"expr": "feeMarked <n>", "true": "d.c(n) 为真", "src": src("f", 1150)},
    {"expr": "!feeMarked <n>", "true": "d.c(n) 为假", "src": src("f", 1154)},
    {"expr": "(其它任何写法)", "true": "恒为 false —— 整条分支被跳过",
     "why": "a(String[]) 的 else 分支直接 return false，未知条件一律不通过",
     "src": src("f", 1158)},
    {"expr": "组合方式", "true": "条件串按空白/换行切分成数组，逐条 AND；任一不满足即整条跳过",
     "src": src("f", 1139)},
]


def build_opcodes() -> dict:
    # 从源码自动提取的权威指令表（e.java = RPG 主解释器，f.java = 战斗解释器）
    auto_rpg = OPS.extract_rpg_ops(os.path.join(ROOT, SRC))
    auto_fight = OPS.extract_fight_ops(os.path.join(ROOT, SRC))
    for junk in ("null", "eventMarked", "feeMarked"):
        auto_rpg["namespaces"].pop(junk, None)
    conds = [c for c in auto_rpg["conditions"]
             if c["cond"] not in ("element", "npc") or c["src"]["line"] < 2300]
    return {
        "kind": "logic",
        "name": "战斗脚本指令集",
        "sources": [src("f", 1171), src("ax", 779), src("d", 1)],
        "parsing": {
            "step1": "整行 trim，去掉结尾的 ';'",
            "step2": "d.c(line) 切分为多行（脚本可内嵌换行，用 ; 或换行分隔）",
            "step3": "d.d(line) 取指令名（第 2 个 token）",
            "step4": "d.e(line) 取参数数组（第 3 个 token 起的括号内容）",
            "step5": "d.g(line) 取条件数组（首 token 若是条件则取其括号内容）",
            "step6": "d.f(line) 取括号内文本",
            "namespace": "首 token 前缀决定命名空间",
        },
        "battleScriptOps": BATTLE_SCRIPT_OPS,
        "skillScriptOps": SKILL_SCRIPT_OPS,
        "conditions": CONDITIONS,
        "queueModel": {
            "note": "openScriptList/closeScriptList 之间收集的指令进入队列 v，战斗主循环 B() 逐条弹出执行",
            "waitBreak": "队列遇到 script wait <ms> 会挂起定时器再继续；script break 直接跳出",
            "src": src("f", 1107),
        },
        "autoExtracted": {
            "note": "以下两节由 2-工具/formats/ops.py 直接扫源码生成，"
                    "不依赖本文件的手工清单，可随反编译结果重新生成并交叉校验",
            "rpg": auto_rpg,
            "fight": auto_fight,
        },
    }


# ---------------------------------------------------------------- RPG 脚本指令集
RPG_NS_SEMANTICS = {
    "script": "脚本控制：批处理队列、跨文件跳转",
    "element": "地图元素实例化：NPC / 怪物 / 落石 / 鸟 / 鱼 / 浪 / 蝴蝶 / 毒 / 宝箱 / 鸡 / 云",
    "npc": "配置上一步实例化的元素（必须跟在 addToXxx 之后）",
    "fee": "调试开关",
    "world": "世界/地图：遮罩、名称、切换、淡出、飞行开关",
    "player": "主角：移动、动画、物品、金钱、任务、技能、属性增减",
    "partner": "队友：好感度增减",
    "item": "物品：从地图元素上摘除",
    "user": "临时用户态加血",
    "camera": "镜头：跟随玩家/NPC、绝对定位、移动",
    "dialogBox": "对话框：文本、对齐、显示隐藏、头像",
    "guide": "指引条：文本与目标",
    "game": "全局：事件标记、菜单、落石、等待按键、分支、战斗、闪屏、震动、黑白字幕",
    "countdownTimer": "倒计时器",
    "midi": "背景音乐",
    "system": "系统：提示、商店、返回主菜单、屏幕边距、调试 flag",
}

RPG_CONDITIONS = [
    {"cond": "eventMarked <n>", "true": "P.a(\"event\"+n) == 1", "src": "e.java:2199"},
    {"cond": "!eventMarked <n>", "true": "P.a(\"event\"+n) != 1", "src": "e.java:2203"},
    {"cond": "feeMarked <n>", "true": "d.c(n)", "src": "e.java:2207"},
    {"cond": "!feeMarked <n>", "true": "!d.c(n)", "src": "e.java:2211"},
    {"cond": "player.itemCountIsGreaterThan <物品> <n>", "src": "e.java:2215"},
    {"cond": "player.itemCountIsLesserThan <物品> <n>", "src": "e.java:2220"},
    {"cond": "player.itemExists <物品>", "src": "e.java:2225"},
    {"cond": "player.goldIsGreaterThan <n>", "src": "e.java:2230"},
    {"cond": "player.goldIsLesserThan <n>", "src": "e.java:2235"},
    {"cond": "partner.feelingIsGreaterThan <队友> <n>", "src": "e.java:2240"},
    {"cond": "partner.feelingIsLesserThan <队友> <n>", "src": "e.java:2245"},
    {"cond": "partner.feelingIsEqualTo <队友> <n>", "src": "e.java:2250"},
    {"cond": "partner.feelingIsGreater <队友> <n>", "src": "e.java:2255"},
    {"cond": "!partner.feelingIsGreater <队友> <n>", "src": "e.java:2260"},
    {"cond": "partner.feelingEqual <队友> <n>", "src": "e.java:2265"},
    {"cond": "partner.exists <队友>", "src": "e.java:2269"},
    {"cond": "!partner.exists <队友>", "src": "e.java:2275"},
    {"cond": "(其它任何写法)", "true": "恒为 false —— 整条分支被跳过",
     "why": "e.java:2281 的 else 直接 return false，未知条件一律不通过", "src": "e.java:2281"},
    {"cond": "组合方式", "true": "条件串切分为数组逐条 AND；任一不满足即跳过整行",
     "src": "e.java:2190"},
]


def build_rpg_ops() -> dict:
    auto = OPS.extract_rpg_ops(os.path.join(ROOT, SRC))
    for junk in ("null", "eventMarked", "feeMarked"):
        auto["namespaces"].pop(junk, None)
    auto["namespaceSemantics"] = RPG_NS_SEMANTICS
    auto["conditionTable"] = RPG_CONDITIONS
    auto["kind"] = "logic"
    auto["name"] = "RPG脚本指令集"
    auto["variableScope"] = {
        "holder": "e.P",
        "desc": "RPG 脚本的表达式变量作用域；每条指令的参数都以它求值",
        "injected": {
            "player.x": "主角当前 X（e.java:2302，每条元素脚本前刷新）",
            "player.y": "主角当前 Y（e.java:2303）",
        },
        "writable": "event<编号> 由 game markEvent / unmarkEvent 写入",
        "src": src("e", 2302),
    }
    auto["scriptHost"] = {
        "bn": "地图元素脚本宿主，v 字段是元素自己的脚本文本",
        "src": src("e", 2298, "public final bn a(bn, ao)"),
    }
    return auto


# ---------------------------------------------------------------- 动画脚本实证
CMD_RE = re.compile(r"^\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\s*(?:\(([^)]*)\))?\s*;?\s*$")


def collect_ant_scripts() -> dict:
    counter = collections.Counter()
    argsamples = collections.defaultdict(list)
    files = 0
    total = 0
    per_file = {}
    for p in sorted(glob.glob(os.path.join(ANT_DIR, "*.json"))):
        try:
            d = json.load(open(p, encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        files += 1
        n = 0
        for st in d.get("states") or []:
            for step in st.get("seq") or []:
                tag = step.get("tag")
                if not tag or not isinstance(tag, str):
                    continue
                for line in tag.replace(";", "\n").split("\n"):
                    line = line.strip()
                    if not line:
                        continue
                    m = CMD_RE.match(line)
                    if not m:
                        counter[("<无法解析>", line[:24], False)] += 1
                        continue
                    full = m.group(1)
                    ns, _, cmd = full.partition(".")
                    key = (ns, cmd if cmd else full, bool(m.group(2)))
                    counter[key] += 1
                    n += 1
                    if len(argsamples[key]) < 3 and m.group(2):
                        argsamples[key].append(m.group(2))
        per_file[os.path.basename(p)] = n
        total += n

    known = {(o["ns"], o["cmd"]) for o in BATTLE_SCRIPT_OPS} | \
            {(o["ns"], o["cmd"]) for o in SKILL_SCRIPT_OPS}
    # 并入源码自动提取的 RPG 指令表（e.java），使 game.flicker 等指令被识别为已覆盖
    auto = OPS.extract_rpg_ops(os.path.join(ROOT, SRC))["namespaces"]
    known |= {(ns, o["cmd"]) for ns, v in auto.items() for o in v["ops"]}

    rows = []
    unknown = []
    for (ns, cmd, has_args), cnt in sorted(counter.items(), key=lambda kv: -kv[1]):
        row = {"ns": ns, "cmd": cmd, "hasArgs": has_args, "count": cnt,
               "argsSamples": argsamples.get((ns, cmd, has_args), []),
               "coveredBySource": (ns, cmd) in known}
        rows.append(row)
        if not row["coveredBySource"]:
            unknown.append(row)

    return {
        "kind": "evidence",
        "name": "ANT 动画脚本实证统计",
        "note": "对 3-数据/01-ant/*.json 的每个 state.seq[].tag 逐行统计，"
                "用于验证从源码逆向出的指令表是否覆盖了游戏实际用到的全部指令",
        "filesScanned": files,
        "scriptLinesTotal": total,
        "filesWithScripts": {k: v for k, v in per_file.items() if v},
        "distinct": len(rows),
        "commands": rows,
        "uncovered": unknown,
        "uncoveredCount": len(unknown),
    }


def main() -> int:
    print("[50] 逻辑层")
    n_expr = dump("表达式引擎.json", build_expr_spec())
    n_fight = dump("战斗系统.json", build_combat())
    skills, monsters = build_skill_formulas()
    n_skill = dump("技能公式总表.json", skills)
    n_mons = dump("怪物属性总表.json", {"kind": "logic", "name": "怪物属性总表",
                                       "referenceLevel": 5, "count": len(monsters), "monsters": monsters})
    n_ops = dump("战斗脚本指令集.json", build_opcodes())
    rpg = build_rpg_ops()
    n_rpg = dump("RPG脚本指令集.json", rpg)
    ev = collect_ant_scripts()
    n_ev = dump("动画脚本总表.json", ev)

    bad = [s["name"] for s in skills["playerSkills"] + skills["monsterSkills"]
           if s.get("formula") and not s.get("parsable")]
    print("  表达式引擎.json / 战斗系统.json / 技能公式总表.json / 怪物属性总表.json / 战斗脚本指令集.json")
    print("  技能: 玩家 %d + 怪物 %d，公式不可解析 %d" %
          (len(skills["playerSkills"]), skills["monsterSkillCount"], len(bad)))
    print("  怪物配置: %d" % len(monsters))
    print("  RPG 指令(源码自动提取): %d 条 / %d 个命名空间；条件 %d 条" %
          (rpg["totalOps"], len(rpg["namespaces"]), len(rpg["conditionTable"])))
    print("  ANT 脚本实证: %d 文件 / %d 行 / %d 种指令，未被源码指令表覆盖 %d 种" %
          (ev["filesScanned"], ev["scriptLinesTotal"], ev["distinct"], ev["uncoveredCount"]))
    if ev["uncovered"]:
        print("  未覆盖:")
        for u in ev["uncovered"][:20]:
            print("    %s.%s(%s) × %d  例: %s" % (u["ns"], u["cmd"], u["hasArgs"], u["count"],
                                                   u["argsSamples"][:1]))
    for p in (n_expr, n_fight, n_skill, n_mons, n_ops, n_rpg, n_ev):
        print("  → %s" % os.path.relpath(p, ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())