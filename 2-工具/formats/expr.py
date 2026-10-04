"""表达式求值器 —— 逆向自 4-文档/反编译源码/t.java

t 类是原游戏通用的表达式引擎，作用域为一个 Hashtable<String,Long>。
支持：+ - * / % ^ ( )、一元正负号、变量、变量赋值。
优先级：^ > * / % > + -；^ 右结合且结合力强于一元负号（-2^2 == 4，是原实现的真实行为）。
除以 0 或取模 0 抛 ArithmeticError（对应原实现的中文异常"算术错误。"）。

Python 的 int 是任意精度，原实现是 64 位 long，超范围会溢出。
此处显式模拟 int32/long 截断，避免复刻时数值行为不一致。
"""

from __future__ import annotations

OPS = "+-*/%^=()"
LONG_MIN = -(2 ** 63)
LONG_MAX = 2 ** 63 - 1
INT_MIN = -(2 ** 31)
INT_MAX = 2 ** 31 - 1


class ExpressionError(ValueError):
    """对应原实现抛出的 IllegalArgumentException("表达式错误。")"""


class ArithmeticErr(ZeroDivisionError):
    """对应原实现抛出的 IllegalArgumentException("算术错误。")"""


def to_long(v: int) -> int:
    """截断到 64 位有符号，并模拟 Java 的溢出回绕。"""
    v &= (2 ** 64) - 1
    return v - 2 ** 64 if v > LONG_MAX else v


def to_int(v: int) -> int:
    """截断到 32 位有符号。"""
    v &= 2 ** 32 - 1
    return v - 2 ** 32 if v > INT_MAX else v


def _ident_start(c: str) -> bool:
    return c == "_" or c == "$" or ("a" <= c <= "z") or ("A" <= c <= "Z")


def _ident_part(c: str) -> bool:
    return c not in OPS and c != " "


EOF = None  # token = None 表示流结束（原实现用 U+FFFD 哨兵）


class _Lexer:
    def __init__(self, src: str):
        self.s = src
        self.i = 0
        self.tok = None      # 当前 token 文本
        self.kind = 0        # 0=EOF 1=运算符 2=标识符 3=数字

    def next(self) -> None:
        self.tok = ""
        self.kind = 0
        while self.i < len(self.s) and self.s[self.i] == " ":
            self.i += 1
        if self.i >= len(self.s):
            self.tok = None
            return
        c = self.s[self.i]
        if c in OPS:
            self.tok = c
            self.i += 1
            self.kind = 1
            return
        if _ident_start(c):
            while self.i < len(self.s) and _ident_part(self.s[self.i]):
                self.tok += self.s[self.i]
                self.i += 1
            self.kind = 2
            return
        if c.isdigit():
            while self.i < len(self.s) and _ident_part(self.s[self.i]):
                self.tok += self.s[self.i]
                self.i += 1
            self.kind = 3
            return
        raise ExpressionError(f"表达式错误。: 非法字符 {c!r} @ {self.i}")


class Expr:
    """一个 t 实例 = 一个独立变量作用域。可重复调用 eval。"""

    def __init__(self, vars_: dict | None = None):
        self.v: dict[str, int] = {}
        if vars_:
            for k, val in vars_.items():
                self.set(k, val)
        self._lx: _Lexer | None = None

    # ---- 变量存取 ----
    def set(self, name: str, value: int) -> None:
        """等价于 t 内部 a("name=value") 的赋值分支。"""
        self.v[name] = to_long(int(value))

    def get(self, name: str) -> int:
        return self.v.get(name, 0)

    def keys(self) -> list[str]:
        return list(self.v.keys())

    # ---- 求值 ----
    def eval(self, expr: str) -> int:
        lx = _Lexer(expr)
        self._lx = lx
        lx.next()
        if lx.tok is None:
            raise ExpressionError("表达式错误。: 空表达式")

        value = None
        if lx.kind == 2:                       # 首 token 是标识符 → 可能是赋值
            name = lx.tok
            lx.next()
            if lx.tok == "=":
                lx.next()
                value = self._add()
                self.set(name, value)
            else:
                if lx.tok is not None:          # 回退：把 token 推回去重解析
                    lx.i -= len(lx.tok)
                lx.tok = name                   # 恢复首 token（对应原实现 c = new String(name)）
                lx.kind = 2
                value = self._add()
        else:
            value = self._add()

        if lx.tok is not None:
            raise ExpressionError(f"表达式错误。: {expr!r} 尾部残留 {lx.tok!r}")
        return to_long(value)

    # expr := term (('+'|'-') term)*        对应 b()
    def _add(self) -> int:
        v = self._mul()
        while self._lx.tok in ("+", "-"):
            op = self._lx.tok
            self._lx.next()
            r = self._mul()
            v = to_long(v + r) if op == "+" else to_long(v - r)
        return v

    # term := unary (('*'|'/'|'%') unary)*  对应 c()
    def _mul(self) -> int:
        v = self._pow()
        while self._lx.tok in ("*", "/", "%"):
            op = self._lx.tok
            self._lx.next()
            r = self._pow()
            if op == "*":
                v = to_long(v * r)
            elif op == "/":
                if r == 0:
                    raise ArithmeticErr("算术错误。")
                v = to_long(_jdiv(v, r))
            else:
                if r == 0:
                    raise ArithmeticErr("算术错误。")
                v = to_long(_jmod(v, r))
        return v

    # unary := ('+'|'-') unary | primary ['^' unary]   对应 d()
    def _pow(self) -> int:
        sign = ""
        if self._lx.kind == 1 and self._lx.tok in ("+", "-"):
            sign = self._lx.tok
            self._lx.next()
        if self._lx.tok == "(":
            self._lx.next()
            v = self._add()
            if self._lx.tok != ")":
                raise ExpressionError("表达式错误。: 缺少右括号")
            self._lx.next()
        else:
            v = self._operand()
        v = -v if sign == "-" else v

        if self._lx.tok == "^":
            self._lx.next()
            e = self._pow()                    # 右结合
            base = v
            if e < 0:
                v = 0
            elif e == 0:
                v = 1
            else:
                for _ in range(e - 1):
                    v = to_long(v * base)      # 原实现是 l4 *= l6，即乘底数而非平方
        return v

    # primary := LONG | VARIABLE                   对应 e()
    def _operand(self) -> int:
        k, tok = self._lx.kind, self._lx.tok
        if tok is None:
            raise ExpressionError("表达式错误。: 缺少操作数")
        if k == 3:
            if not tok.isdigit():
                raise ExpressionError(f"表达式错误。: 非法数字 {tok!r}")
            v = to_long(int(tok))
        elif k == 2:
            v = self.v.get(tok, 0)             # 未定义变量取 0，与原实现一致
        else:
            raise ExpressionError(f"表达式错误。: 非法 token {tok!r}")
        self._lx.next()
        return v


def _jdiv(a: int, b: int) -> int:
    """Java 整数除法：向 0 截断，而非 Python 的向 -inf 截断。"""
    q = abs(a) // abs(b)
    return -q if (a < 0) != (b < 0) else q


def _jmod(a: int, b: int) -> int:
    """Java 取模：结果符号跟随被除数。"""
    return a - _jdiv(a, b) * b


def evaluate(expr: str, **vars_) -> int:
    """一次性求值便捷函数。"""
    return Expr(vars_).eval(expr)


def collect_vars(expr: str) -> list[str]:
    """静态扫描出表达式引用的变量名（按首次出现顺序）。"""
    lx = _Lexer(expr)
    names: list[str] = []
    while True:
        lx.next()
        if lx.tok is None:
            break
        if lx.kind == 2 and lx.tok not in names:
            names.append(lx.tok)
    return names


def uses(expr: str, name: str) -> bool:
    return name in collect_vars(expr)


def tokenize(expr: str) -> list[tuple[int, str]]:
    """导出词法切分，用于校验器核对原实现可接受的表达式集合。"""
    lx = _Lexer(expr)
    out: list[tuple[int, str]] = []
    while True:
        lx.next()
        if lx.tok is None:
            break
        out.append((lx.kind, lx.tok))
    return out