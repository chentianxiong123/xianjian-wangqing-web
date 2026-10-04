/*
 * Decompiled with CFR 0.152.
 */
import java.util.Vector;

public final class bj {
    public String a;
    private boolean j = true;
    private int k;
    private int l;
    private int m;
    private int n;
    private int o;
    private int p;
    private int q;
    private int r;
    private int s;
    private int t;
    private int u;
    private int v;
    private int w;
    private int x;
    private String y;
    private int z;
    private int A;
    public String b;
    public String c;
    public String d;
    public String e;
    public String f;
    public String g;
    public String h;
    private int[][] B;
    private int[][] C;
    private i D;
    private i E;
    private i F;
    private i G;
    private i H;
    private i I;
    private av J = new av();
    private Vector K;
    private t L = new t();
    private at M;
    public String i;

    public bj() {
        this.K = new Vector();
    }

    public final void a(String object) {
        String[] stringArray;
        object = new bg((String)object);
        this.i = ((bg)object).a("\u5934\u50cf");
        this.e(this.i);
        this.a = ((bg)object).a("\u540d\u5b57");
        cn.com.etgame.cls.system.d.a(2, "loadConfig()\u914d\u7f6e\u6587\u4ef6\u52a0\u8f7d\uff1a" + this.a);
        int n2 = Integer.parseInt(((bg)object).a("\u79fb\u52a8\u901f\u5ea6"));
        bj bj2 = this;
        this.p = n2;
        this.d(Integer.parseInt(((bg)object).a("\u521d\u59cb\u7b49\u7ea7")));
        n2 = Integer.parseInt(((bg)object).a("\u521d\u59cb\u7ecf\u9a8c"));
        bj2 = this;
        this.n = n2;
        this.h(Integer.parseInt(((bg)object).a("\u521d\u59cb\u91d1\u94b1")));
        if (!"\u65e0".equals(((bg)object).a("\u521d\u59cb\u6b66\u5668"))) {
            i i2 = new i(((bg)object).a("\u521d\u59cb\u6b66\u5668"));
            bj2 = this;
            this.D = i2;
        }
        if (!"\u65e0".equals(((bg)object).a("\u521d\u59cb\u670d\u9970"))) {
            i i3 = new i(((bg)object).a("\u521d\u59cb\u670d\u9970"));
            bj2 = this;
            this.E = i3;
        }
        if (!"\u65e0".equals(((bg)object).a("\u521d\u59cb\u5934\u9970"))) {
            i i4 = new i(((bg)object).a("\u521d\u59cb\u5934\u9970"));
            bj2 = this;
            this.F = i4;
        }
        if (!"\u65e0".equals(((bg)object).a("\u521d\u59cb\u8db3\u9970"))) {
            i i5 = new i(((bg)object).a("\u521d\u59cb\u8db3\u9970"));
            bj2 = this;
            this.G = i5;
        }
        if ((stringArray = j.a(((bg)object).a("\u521d\u59cb\u9970\u54c1"), ",")) != null && stringArray.length >= 2) {
            if (!"\u65e0".equals(stringArray[0])) {
                i i6 = new i(stringArray[0]);
                bj2 = this;
                this.H = i6;
            }
            if (!"\u65e0".equals(stringArray[1])) {
                i i7 = new i(stringArray[1]);
                bj2 = this;
                this.I = i7;
            }
        } else if (stringArray != null && stringArray.length == 1 && !"\u65e0".equals(stringArray[0])) {
            i i8 = new i(stringArray[0]);
            bj2 = this;
            this.H = i8;
        }
        this.b = ((bg)object).a("\u5347\u7ea7\u6240\u9700\u7ecf\u9a8c");
        this.c = ((bg)object).a("\u6700\u5927\u751f\u547d\u503c");
        this.e = ((bg)object).a("\u6700\u5927\u6c14\u503c");
        this.d = ((bg)object).a("\u6700\u5927\u795e\u503c");
        this.f = ((bg)object).a("\u6b66");
        this.g = ((bg)object).a("\u9632");
        this.h = ((bg)object).a("\u901f");
        int n3 = (int)this.L.a(this.h);
        bj2 = this;
        this.x = n3;
        this.a();
        String string = ((bg)object).a("\u4ed9\u672f\u901f\u5ea6");
        bj2 = this;
        this.y = string;
        int n4 = Integer.parseInt(((bg)object).a("\u8fd0"));
        bj2 = this;
        this.z = n4;
        this.k(Integer.parseInt(((bg)object).a("\u597d\u611f\u5ea6")));
        stringArray = j.a(((bg)object).a("\u521d\u59cb\u6280\u80fd"), ",");
        this.B = new int[stringArray.length][2];
        int n5 = 0;
        while (n5 < this.B.length) {
            this.B[n5][0] = af.a((String)stringArray[n5]).a;
            this.B[n5][1] = 1;
            ++n5;
        }
        af[] afArray = cn.com.etgame.cls.system.d.U;
        int n6 = af.a(0, afArray).length;
        this.C = new int[afArray.length - n6][4];
        n4 = 0;
        n6 = 0;
        while (n4 < afArray.length) {
            if (afArray[n4].b != 0) {
                this.C[n6][0] = afArray[n4].b;
                this.C[n6][1] = afArray[n4].a;
                this.C[n6][2] = 0;
                this.C[n6][3] = 0;
                ++n6;
            }
            ++n4;
        }
        String[] stringArray2 = j.a(((bg)object).a("\u521d\u59cb\u4ed9\u672f"), ",");
        n4 = 0;
        while (n4 < stringArray2.length) {
            int n7 = 0;
            while (n7 < this.C.length) {
                if (af.a((String)stringArray2[n4]).a == this.C[n7][1]) {
                    this.C[n7][2] = 1;
                }
                ++n7;
            }
            ++n4;
        }
        this.J.b();
        if (this.a.equals("\u91cd\u697c") && (stringArray2 = j.a(((bg)object).a("\u521d\u59cb\u7269\u54c1"), ",")) != null) {
            n4 = 0;
            while (n4 < stringArray2.length) {
                cn.com.etgame.cls.system.d.a(2, "palyerData-LoadConfig =" + n4 + "--" + stringArray2[n4]);
                this.J.a(new i(stringArray2[n4]));
                ++n4;
            }
        }
        bj bj3 = this;
        this.j(bj3.m);
    }

    public final void a() {
        cn.com.etgame.cls.system.d.a(2, "playerData.loadConfig()----" + this.c);
        cn.com.etgame.cls.system.d.a(2, "playerData.loadConfig()----" + (int)this.L.a(this.c));
        this.q = (int)this.L.a(this.b);
        int n2 = (int)this.L.a(this.c);
        bj bj2 = this;
        this.m = n2;
        this.j((int)this.L.a(this.c));
        n2 = (int)this.L.a(this.e);
        bj2 = this;
        this.u = n2;
        this.n((int)this.L.a(this.e));
        n2 = (int)this.L.a(this.d);
        bj2 = this;
        this.s = n2;
        this.l((int)this.L.a(this.d));
        n2 = (int)this.L.a(this.f);
        bj2 = this;
        this.v = n2;
        n2 = (int)this.L.a(this.g);
        bj2 = this;
        this.w = n2;
    }

    public final at b() {
        return this.M;
    }

    public final boolean a(int n2) {
        boolean bl2 = false;
        int n3 = 0;
        while (n3 < this.C.length) {
            block19: {
                if (this.C[n3][2] != 1 || this.C[n3][1] != n2) break block19;
                n2 = 0;
                while (n2 < this.C.length) {
                    block20: {
                        boolean bl3;
                        block22: {
                            int n4;
                            boolean bl4;
                            bj bj2;
                            int[] nArray;
                            block21: {
                                if (this.C[n2][2] != 1 || this.C[n3][0] != this.C[n2][0]) break block20;
                                int[] nArray2 = this.C[n2];
                                nArray2[3] = nArray2[3] + 1;
                                nArray = this.C[n2];
                                bj2 = this;
                                bl4 = false;
                                if (bj2.b(18) >= 4 && bj2.b(10) >= 3) {
                                    bl4 = false | bj2.u(23);
                                }
                                if (bj2.b(13) >= 3 && bj2.b(19) >= 3) {
                                    bl4 |= bj2.u(24);
                                }
                                if (bj2.b(13) >= 2 && bj2.b(22) >= 4) {
                                    bl4 |= bj2.u(25);
                                }
                                if (bj2.b(12) >= 4 && bj2.b(16) >= 3) {
                                    bl4 |= bj2.u(26);
                                }
                                if (bj2.b(15) >= 4 && bj2.b(22) >= 2) {
                                    bl4 |= bj2.u(27);
                                }
                                if (bj2.b(nArray[1]) == 2) break block21;
                                bl3 = bl4;
                                break block22;
                            }
                            switch (nArray[1]) {
                                case 8: 
                                case 9: {
                                    n4 = nArray[1] + 1;
                                    break;
                                }
                                case 10: {
                                    bl3 = bl4;
                                    break block22;
                                }
                                case 11: 
                                case 12: {
                                    n4 = nArray[1] + 1;
                                    break;
                                }
                                case 13: {
                                    bl3 = bl4;
                                    break block22;
                                }
                                case 14: 
                                case 15: {
                                    n4 = nArray[1] + 1;
                                    break;
                                }
                                case 16: {
                                    bl3 = bl4;
                                    break block22;
                                }
                                case 17: 
                                case 18: {
                                    n4 = nArray[1] + 1;
                                    break;
                                }
                                case 19: {
                                    bl3 = bl4;
                                    break block22;
                                }
                                case 20: 
                                case 21: {
                                    n4 = nArray[1] + 1;
                                    break;
                                }
                                case 22: {
                                    bl3 = bl4;
                                    break block22;
                                }
                                default: {
                                    bl3 = bl4;
                                    break block22;
                                }
                            }
                            bl3 = bl4 | bj2.u(n4);
                        }
                        bl2 |= bl3;
                    }
                    ++n2;
                }
                return bl2;
            }
            ++n3;
        }
        return false;
    }

    private boolean u(int n2) {
        int n3 = 0;
        while (n3 < this.C.length) {
            if (this.C[n3][1] == n2 && this.C[n3][2] != 1) {
                this.C[n3][2] = 1;
                return true;
            }
            ++n3;
        }
        return false;
    }

    public final int b(int n2) {
        int n3 = 0;
        int n4 = 0;
        while (n4 < this.C.length) {
            if (this.C[n4][2] == 1 && this.C[n4][1] == n2) {
                n3 = this.C[n4][3];
                break;
            }
            ++n4;
        }
        n2 = n3 < 5 ? 1 : (n3 < 15 ? 2 : (n3 < 30 ? 3 : 4));
        return n2;
    }

    public final av c() {
        return this.J;
    }

    public final int d() {
        return this.p;
    }

    public final void c(int n2) {
        this.p = n2;
    }

    public final int e() {
        return this.k;
    }

    public final void d(int n2) {
        this.L.a("lv=" + n2);
        this.k = n2;
    }

    public final void e(int n2) {
        bj bj2 = this;
        this.d(bj2.k + n2);
        this.a();
        bj2 = this;
        this.j(bj2.m);
    }

    public final int f() {
        return this.n;
    }

    public final void f(int n2) {
        this.n = n2;
    }

    public final boolean g(int n2) {
        bj bj2 = this;
        int n3 = bj2.q;
        bj2 = this;
        int n4 = bj2.k;
        bj2 = this;
        if ((n2 = bj2.n + n2) >= n3) {
            if (!cn.com.etgame.cls.system.d.c(500)) {
                if (n4 < 45) {
                    n4 = 0;
                    bj2 = this;
                    this.n = n4;
                    this.e(1);
                    this.g(n2 - n3);
                    return true;
                }
            } else {
                n4 = 0;
                bj2 = this;
                this.n = n4;
                this.e(1);
                this.g(n2 - n3);
                return true;
            }
            n4 = n3;
            bj2 = this;
            this.n = n4;
            return false;
        }
        n4 = n2;
        bj2 = this;
        this.n = n4;
        return false;
    }

    public final int g() {
        return this.o;
    }

    public final void h(int n2) {
        this.o = Math.min(Math.max(n2, 0), 99999);
    }

    public final void i(int n2) {
        bj bj2 = this;
        this.h(bj2.o + n2);
    }

    public final int h() {
        return this.q;
    }

    public final int i() {
        return this.m;
    }

    public final int j() {
        return this.l;
    }

    public final void j(int n2) {
        bj bj2 = this;
        this.l = Math.min(Math.max(n2, 0), bj2.m);
    }

    public final int k() {
        return this.A;
    }

    public final void k(int n2) {
        this.A = Math.min(Math.max(0, n2), 100);
    }

    public final String l() {
        return this.y;
    }

    public final void b(String string) {
        this.y = string;
    }

    public final i m() {
        return this.D;
    }

    public final void a(i i2) {
        this.D = i2;
    }

    public final i n() {
        return this.E;
    }

    public final void b(i i2) {
        this.E = i2;
    }

    public final i o() {
        return this.F;
    }

    public final void c(i i2) {
        this.F = i2;
    }

    public final i p() {
        return this.G;
    }

    public final void d(i i2) {
        this.G = i2;
    }

    public final i q() {
        return this.H;
    }

    public final void e(i i2) {
        this.H = i2;
    }

    public final i r() {
        return this.I;
    }

    public final void f(i i2) {
        this.I = i2;
    }

    public final int s() {
        return this.r;
    }

    public final void l(int n2) {
        bj bj2 = this;
        this.r = Math.min(Math.max(n2, 0), bj2.s);
    }

    public final int t() {
        return this.s;
    }

    public final void m(int n2) {
        this.s = n2;
    }

    public final int u() {
        return this.t;
    }

    public final void n(int n2) {
        bj bj2 = this;
        this.t = Math.min(Math.max(n2, 0), bj2.u);
    }

    public final int v() {
        return this.u;
    }

    public final void o(int n2) {
        this.u = n2;
    }

    public final int w() {
        return this.m;
    }

    public final void p(int n2) {
        this.m = n2;
    }

    public final int x() {
        return this.v + this.B();
    }

    public final void q(int n2) {
        this.v = n2;
    }

    public final int y() {
        return this.w + this.C();
    }

    public final void r(int n2) {
        this.w = n2;
    }

    public final int z() {
        return this.x + this.D();
    }

    public final void s(int n2) {
        this.x = n2;
    }

    public final int A() {
        return this.z + this.E();
    }

    public final void t(int n2) {
        this.z = n2;
    }

    public final int B() {
        int n2;
        int n3;
        int n4;
        int n5;
        int n6;
        int n7;
        bj bj2 = this;
        if (bj2.D == null) {
            n7 = 0;
        } else {
            bj2 = this;
            n7 = bj2.D.f();
        }
        bj2 = this;
        if (bj2.E == null) {
            n6 = 0;
        } else {
            bj2 = this;
            n6 = bj2.E.f();
        }
        int n8 = n7 + n6;
        bj2 = this;
        if (bj2.F == null) {
            n5 = 0;
        } else {
            bj2 = this;
            n5 = bj2.F.f();
        }
        int n9 = n8 + n5;
        bj2 = this;
        if (bj2.G == null) {
            n4 = 0;
        } else {
            bj2 = this;
            n4 = bj2.G.f();
        }
        int n10 = n9 + n4;
        bj2 = this;
        if (bj2.H == null) {
            n3 = 0;
        } else {
            bj2 = this;
            n3 = bj2.H.f();
        }
        int n11 = n10 + n3;
        bj2 = this;
        if (bj2.I == null) {
            n2 = 0;
        } else {
            bj2 = this;
            n2 = bj2.I.f();
        }
        return n11 + n2;
    }

    public final int C() {
        int n2;
        int n3;
        int n4;
        int n5;
        int n6;
        int n7;
        bj bj2 = this;
        if (bj2.D == null) {
            n7 = 0;
        } else {
            bj2 = this;
            n7 = bj2.D.g();
        }
        bj2 = this;
        if (bj2.E == null) {
            n6 = 0;
        } else {
            bj2 = this;
            n6 = bj2.E.g();
        }
        int n8 = n7 + n6;
        bj2 = this;
        if (bj2.F == null) {
            n5 = 0;
        } else {
            bj2 = this;
            n5 = bj2.F.g();
        }
        int n9 = n8 + n5;
        bj2 = this;
        if (bj2.G == null) {
            n4 = 0;
        } else {
            bj2 = this;
            n4 = bj2.G.g();
        }
        int n10 = n9 + n4;
        bj2 = this;
        if (bj2.H == null) {
            n3 = 0;
        } else {
            bj2 = this;
            n3 = bj2.H.g();
        }
        int n11 = n10 + n3;
        bj2 = this;
        if (bj2.I == null) {
            n2 = 0;
        } else {
            bj2 = this;
            n2 = bj2.I.g();
        }
        return n11 + n2;
    }

    public final int D() {
        int n2;
        int n3;
        int n4;
        int n5;
        int n6;
        int n7;
        bj bj2 = this;
        if (bj2.D == null) {
            n7 = 0;
        } else {
            bj2 = this;
            n7 = bj2.D.k();
        }
        bj2 = this;
        if (bj2.E == null) {
            n6 = 0;
        } else {
            bj2 = this;
            n6 = bj2.E.k();
        }
        int n8 = n7 + n6;
        bj2 = this;
        if (bj2.F == null) {
            n5 = 0;
        } else {
            bj2 = this;
            n5 = bj2.F.k();
        }
        int n9 = n8 + n5;
        bj2 = this;
        if (bj2.G == null) {
            n4 = 0;
        } else {
            bj2 = this;
            n4 = bj2.G.k();
        }
        int n10 = n9 + n4;
        bj2 = this;
        if (bj2.H == null) {
            n3 = 0;
        } else {
            bj2 = this;
            n3 = bj2.H.k();
        }
        int n11 = n10 + n3;
        bj2 = this;
        if (bj2.I == null) {
            n2 = 0;
        } else {
            bj2 = this;
            n2 = bj2.I.k();
        }
        return n11 + n2;
    }

    public final int E() {
        int n2;
        int n3;
        int n4;
        int n5;
        int n6;
        int n7;
        bj bj2 = this;
        if (bj2.D == null) {
            n7 = 0;
        } else {
            bj2 = this;
            n7 = bj2.D.j();
        }
        bj2 = this;
        if (bj2.E == null) {
            n6 = 0;
        } else {
            bj2 = this;
            n6 = bj2.E.j();
        }
        int n8 = n7 + n6;
        bj2 = this;
        if (bj2.F == null) {
            n5 = 0;
        } else {
            bj2 = this;
            n5 = bj2.F.j();
        }
        int n9 = n8 + n5;
        bj2 = this;
        if (bj2.G == null) {
            n4 = 0;
        } else {
            bj2 = this;
            n4 = bj2.G.j();
        }
        int n10 = n9 + n4;
        bj2 = this;
        if (bj2.H == null) {
            n3 = 0;
        } else {
            bj2 = this;
            n3 = bj2.H.j();
        }
        int n11 = n10 + n3;
        bj2 = this;
        if (bj2.I == null) {
            n2 = 0;
        } else {
            bj2 = this;
            n2 = bj2.I.j();
        }
        return n11 + n2;
    }

    public final Vector F() {
        return this.K;
    }

    public final void c(String string) {
        this.K.addElement(string);
    }

    public final void d(String string) {
        this.K.removeElement(string);
    }

    public final void a(int[][] nArray) {
        this.C = nArray;
    }

    public final int[][] G() {
        return this.C;
    }

    public final void b(int[][] nArray) {
        this.B = nArray;
    }

    public final int[][] H() {
        return this.B;
    }

    public final boolean I() {
        return this.j;
    }

    public final void a(boolean bl2) {
        this.j = bl2;
    }

    public final void e(String stringArray) {
        if (!stringArray.equals("\u65e0")) {
            this.i = stringArray;
            stringArray = j.a((String)stringArray, ",");
            this.M = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + stringArray[0]).b(stringArray[1]);
        }
    }
}

