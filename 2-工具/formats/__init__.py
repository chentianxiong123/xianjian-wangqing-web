"""《仙剑奇侠传-忘情篇》资源格式解析库

所有解析器遵循同一铁律:
    assert 字节精确耗尽  ——  有残留立即抛 FormatError

这是断言"格式已 100% 破解"的唯一依据。

格式规范文档: 4-文档/格式规范/00-逆向备忘.md
权威来源:     4-文档/反编译源码/ (CFR 0.152 反编译的 74 个 class)
"""
import os

__all__ = ["binary", "ant", "mapfile", "binres", "strfile", "script", "mid"]

TREE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "1-解包产物", "解包树")


class FormatError(Exception):
    """格式错误: magic 不符 / 字节残留 / 版本不符"""


def tree_path(*parts):
    return os.path.join(TREE, *parts)
