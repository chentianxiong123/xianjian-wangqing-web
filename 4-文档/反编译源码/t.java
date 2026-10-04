/*
 * Decompiled with CFR 0.152.
 */
import java.util.Hashtable;
import java.util.Vector;

public final class t {
    private static final String[] a = new String[]{"\u8868\u8fbe\u5f0f\u9519\u8bef\u3002", "\u7b97\u672f\u9519\u8bef\u3002"};
    private String b;
    private String c;
    private int d;
    private int e;
    private Hashtable f = new Hashtable();

    /*
     * Unable to fully structure code
     */
    public final synchronized long a(String var1_1) {
        this.b = var1_1;
        this.e = 0;
        this.f();
        if (this.c.equals("\ufffd\ufffd")) {
            throw new IllegalArgumentException(t.a[0]);
        }
        var1_1 = this;
        if (var1_1.d != 2) ** GOTO lbl22
        var2_2 = new String(var1_1.c);
        var3_4 = var1_1.d;
        super.f();
        if (var1_1.c.equals("=")) {
            super.f();
            var7_5 = super.b();
            var1_1.f.put(var2_2, new Long(var7_5));
            v0 = var7_5;
        } else {
            if (var1_1.c != "\ufffd\ufffd") {
                var1_1.e -= var1_1.c.length();
            }
            var1_1.c = new String(var2_2);
            var1_1.d = var3_4;
lbl22:
            // 2 sources

            v0 = var2_3 = super.b();
        }
        if (!this.c.equals("\ufffd\ufffd")) {
            throw new IllegalArgumentException(t.a[0]);
        }
        return var2_3;
    }

    public final String[] a() {
        Object[] objectArray = this.f.keys();
        Vector vector = new Vector();
        while (objectArray.hasMoreElements()) {
            vector.addElement(objectArray.nextElement());
        }
        objectArray = new String[vector.size()];
        vector.copyInto(objectArray);
        return objectArray;
    }

    private long b() {
        char c2;
        long l2 = this.c();
        while ((c2 = this.c.charAt(0)) == '+' || c2 == '-') {
            this.f();
            long l3 = this.c();
            switch (c2) {
                case '-': {
                    l2 -= l3;
                    break;
                }
                case '+': {
                    l2 += l3;
                }
            }
        }
        return l2;
    }

    private long c() {
        char c2;
        long l2 = this.d();
        while ((c2 = this.c.charAt(0)) == '*' || c2 == '/' || c2 == '%') {
            this.f();
            long l3 = this.d();
            switch (c2) {
                case '*': {
                    l2 *= l3;
                    break;
                }
                case '/': {
                    if (l3 == 0L) {
                        throw new IllegalArgumentException(a[1]);
                    }
                    l2 /= l3;
                    break;
                }
                case '%': {
                    if (l3 == 0L) {
                        throw new IllegalArgumentException(a[1]);
                    }
                    l2 %= l3;
                }
            }
        }
        return l2;
    }

    private long d() {
        long l2;
        t t2 = this;
        String string = "";
        if (t2.d == 1 && (t2.c.equals("+") || t2.c.equals("-"))) {
            string = t2.c;
            t2.f();
        }
        if (t2.c.equals("(")) {
            t2.f();
            l2 = t2.b();
            if (!t2.c.equals(")")) {
                throw new IllegalArgumentException(a[0]);
            }
            t2.f();
        } else {
            l2 = t2.e();
        }
        long l3 = l2;
        if (string.equals("-")) {
            l3 = -l3;
        }
        long l4 = l3;
        if (this.c.equals("^")) {
            this.f();
            long l5 = this.d();
            long l6 = l4;
            if (l5 < 0L) {
                l4 = 0L;
            } else if (l5 == 0L) {
                l4 = 1L;
            } else {
                long l7 = l5 - 1L;
                while (l7 > 0L) {
                    l4 *= l6;
                    --l7;
                }
            }
        }
        return l4;
    }

    private long e() {
        long l2;
        switch (this.d) {
            case 3: {
                try {
                    l2 = Long.parseLong(this.c);
                }
                catch (NumberFormatException numberFormatException) {
                    throw new IllegalArgumentException(a[0]);
                }
                this.f();
                break;
            }
            case 2: {
                String string = this.c;
                Object object = this;
                object = (Long)((t)object).f.get(string);
                l2 = object == null ? 0L : (Long)object;
                this.f();
                break;
            }
            default: {
                throw new IllegalArgumentException(a[0]);
            }
        }
        return l2;
    }

    private void f() {
        this.c = "";
        this.d = 0;
        while (this.e < this.b.length() && this.b.charAt(this.e) == ' ') {
            ++this.e;
        }
        if (this.e == this.b.length()) {
            this.c = "\ufffd\ufffd";
            return;
        }
        char c2 = this.b.charAt(this.e);
        if (t.a(c2)) {
            this.c = String.valueOf(this.c) + c2;
            ++this.e;
            this.d = 1;
            return;
        }
        if (c2 == '_' || c2 == '$' || c2 >= 'a' && c2 <= 'z' || c2 >= 'A' && c2 <= 'Z') {
            do {
                this.c = String.valueOf(this.c) + c2;
                ++this.e;
            } while (this.e < this.b.length() && !t.a(c2 = this.b.charAt(this.e)) && c2 != ' ');
            this.d = 2;
            return;
        }
        if (Character.isDigit(c2)) {
            do {
                this.c = String.valueOf(this.c) + c2;
                ++this.e;
            } while (this.e < this.b.length() && !t.a(c2 = this.b.charAt(this.e)) && c2 != ' ');
            this.d = 3;
            return;
        }
        throw new IllegalArgumentException(a[0]);
    }

    private static boolean a(char c2) {
        return "+-*/%^=()".indexOf(c2) != -1;
    }
}

