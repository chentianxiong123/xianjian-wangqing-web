/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class bl
extends ay {
    public final String a;
    private e o;
    private bk p;
    private d q;
    private String r;
    public int[][] b;
    public String[] c;
    public String d;
    public int e;
    public int f;
    public boolean g;
    public boolean h;
    private int s;
    private int t;
    private int u;
    private int w;
    private int x;
    private int y;
    private int z;
    private boolean A;
    private boolean B;
    private boolean C;
    public boolean i;
    public boolean j;
    private boolean D;
    private boolean E;
    public final Vector k;
    public final Vector l;
    public final Vector m;
    private final Vector F;
    private at G;
    public String n;
    private a H;
    private String I;

    public bl(String object, String string, d d2, Image[] imageArray, int n2, int n3, int n4, String string2, int n5, boolean bl2, boolean bl3, int[][] nArray, String[] stringArray, a a2) {
        super(null, n2, n3);
        super.a(imageArray);
        this.I = object;
        this.a = string;
        this.q = d2;
        this.e = n4;
        this.d = string2;
        this.f = n5;
        this.i = bl2;
        this.j = bl3;
        this.b = nArray;
        this.c = stringArray;
        this.H = a2;
        this.k = new Vector();
        this.l = new Vector();
        this.m = new Vector();
        this.F = new Vector();
        this.p = new bk(j.a(cn.com.etgame.cls.system.d.l, cn.com.etgame.cls.system.d.m));
        this.k.addElement(new int[]{n2, n3});
        boolean bl4 = true;
        object = this;
        this.B = bl4;
        this.b(true);
    }

    public final boolean a(int n2) {
        return this.q.a(n2);
    }

    public final void a(e e2) {
        this.o = e2;
    }

    public final void b(int n2) {
        if (this.t != n2) {
            switch (n2) {
                case 1: 
                case 2: 
                case 4: 
                case 8: {
                    this.t = n2;
                    this.p();
                }
            }
        }
    }

    public final int b() {
        return this.t;
    }

    public final void c(int n2) {
        if (this.s != n2) {
            switch (n2) {
                case 0: 
                case 1: {
                    this.s = n2;
                    this.p();
                }
            }
        }
    }

    public final void a(String object) {
        object = this.q.b((String)object);
        ((at)object).b(0);
        this.c((at)object);
        this.s = -1;
    }

    public final void a(int n2, int n3) {
        this.a_(n2);
        this.b_(n3);
    }

    public final int c() {
        return this.s;
    }

    public final void b(int n2, int n3) {
        ac ac2 = this.o.k();
        this.a_(n2);
        this.b_(n3);
        if (ac2.a(this, false, null)) {
            this.k.addElement(new int[]{n2, n3});
        }
        int[] nArray = (int[])this.k.elementAt(j.a(0, this.k.size() - 1));
        this.a_(nArray[0]);
        this.b_(nArray[1]);
    }

    public final void a(int n2, int n3, int n4, int n5) {
        this.l.addElement(new int[]{n2, n3, n4, n5});
    }

    public final void c(int n2, int n3) {
        this.m.addElement(new int[]{n2, n3});
    }

    public final void g() {
        this.m.removeAllElements();
        this.y = 0;
        this.z = 0;
        this.x = 0;
        this.E = false;
    }

    public final void a(boolean bl2) {
        if (this.D != bl2) {
            this.D = bl2;
            this.E = true;
            this.q();
        }
    }

    public final void a_(int n2) {
        if (this.A) {
            ac ac2 = this.o.k();
            ac2.a(this.t);
            ac2.a_(ac2.J() + n2 - this.J());
        }
        super.a_(n2);
    }

    public final void b_(int n2) {
        if (this.A) {
            ac ac2 = this.o.k();
            ac2.a(this.t);
            ac2.b_(ac2.K() + n2 - this.K());
        }
        super.b_(n2);
    }

    public final void b(String string) {
        this.r = string;
    }

    public final void f(int n2) {
        this.u = n2;
    }

    public final void b(boolean bl2) {
        if (this.C != bl2) {
            this.C = bl2;
            if (bl2) {
                this.w = 0;
                this.p.c();
                this.p.g();
                return;
            }
            this.c(0);
        }
    }

    public final void c(boolean bl2) {
        this.A = bl2;
    }

    public final void c(String stringArray) {
        if (stringArray != null) {
            this.n = stringArray;
            stringArray = j.a((String)stringArray, ",");
            this.G = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + stringArray[0]).b(stringArray[1]);
        }
    }

    public final at h() {
        return this.G;
    }

    public final void a(Image[] imageArray) {
    }

    public final void d(boolean bl2) {
        this.B = bl2;
    }

    public final boolean i() {
        return this.B;
    }

    public final boolean f() {
        return false;
    }

    public final boolean j() {
        boolean bl2;
        String[] stringArray;
        block8: {
            stringArray = this;
            if (this.c != null && stringArray.c.length > 0) {
                ac ac2 = stringArray.o.k();
                int n2 = ac2.b();
                int n3 = stringArray.J();
                int n4 = stringArray.K();
                if (stringArray.b != null) {
                    int n5 = 0;
                    while (n5 < stringArray.b.length) {
                        int[] nArray = stringArray.b[n5];
                        if (nArray[4] == n2 && j.a(ac2.J(), ac2.K(), n3 + nArray[0], n4 + nArray[1], nArray[2], nArray[3])) {
                            bl2 = true;
                            break block8;
                        }
                        ++n5;
                    }
                }
            }
            bl2 = false;
        }
        if (bl2) {
            int n6 = 0;
            while (n6 < this.c.length) {
                stringArray = j.a(this.c[n6], "#");
                if (this.o.a(j.a(stringArray[0], ","))) {
                    this.F.addElement(stringArray[1].trim());
                }
                ++n6;
            }
            if (this.F.size() > 0) {
                this.o.a(this.F.elementAt(j.a(0, this.F.size() - 1)), null);
                this.F.removeAllElements();
                return true;
            }
        }
        return false;
    }

    private void p() {
        String string;
        Object object;
        switch (this.s) {
            case 0: {
                object = "\u7ad9\u7acb";
                break;
            }
            case 1: {
                object = "\u8d70\u8def";
                break;
            }
            default: {
                return;
            }
        }
        switch (this.t) {
            case 4: {
                string = "\u5de6";
                break;
            }
            case 8: {
                string = "\u53f3";
                break;
            }
            case 1: {
                string = "\u4e0a";
                break;
            }
            case 2: {
                string = "\u4e0b";
                break;
            }
            default: {
                return;
            }
        }
        object = this.q.b(String.valueOf(object) + string);
        ((at)object).b(0);
        ((at)object).e();
        ((at)object).g();
        this.c((at)object);
    }

    private void q() {
        if (this.D) {
            if (this.x > 0) {
                --this.x;
                return;
            }
            this.D = false;
            ++this.x;
            return;
        }
        if (this.x < this.m.size() - 1) {
            ++this.x;
            return;
        }
        this.D = true;
        --this.x;
    }

    /*
     * Unable to fully structure code
     */
    public final boolean a() {
        block48: {
            block50: {
                block49: {
                    if (!this.j && !this.i || this.u <= 0 || !this.C) break block48;
                    if (this.m.size() <= 0) break block49;
                    var1_1 = this.J();
                    var2_4 = this.K();
                    if (this.E || this.y == 0 && this.z == 0) {
                        var3_7 = (int[])this.m.elementAt(this.x);
                        this.E = false;
                        this.y = var3_7[0] - var1_1;
                        this.z = var3_7[1] - var2_4;
                    } else {
                        var3_8 = Math.abs(this.y);
                        var4_20 = Math.abs(this.z);
                        var5_23 = var3_8 * var3_8;
                        var6_25 = var4_20 * var4_20;
                        var7_27 = this.u * this.u;
                        var8_28 = Math.min(j.a(var5_23 * var7_27 / (var5_23 + var6_25)), var3_8);
                        var5_23 = Math.min(j.a(var6_25 * var7_27 / (var5_23 + var6_25)), var4_20);
                        this.c(1);
                        if (var3_8 >= var4_20) {
                            if (var8_28 == 0 && var5_23 == 0) {
                                var8_28 = 1;
                                if (var3_8 == var4_20) {
                                    var5_23 = 1;
                                }
                            }
                            if (this.y > 0) {
                                this.b(8);
                                var3_9 = this;
                                this.a(this.o.l().c[1], 8, var8_28, 0, 0, false, false, var3_9.B);
                            } else if (this.y < 0) {
                                this.b(4);
                                var3_10 = this;
                                this.a(this.o.l().c[1], 4, var8_28, 0, 0, false, false, var3_10.B);
                            }
                            if (this.z > 0) {
                                var3_11 = this;
                                this.a(this.o.l().c[1], 2, var5_23, 0, 0, false, false, var3_11.B);
                            } else if (this.z < 0) {
                                var3_12 = this;
                                this.a(this.o.l().c[1], 1, var5_23, 0, 0, false, false, var3_12.B);
                            }
                        } else {
                            if (var8_28 == 0 && var5_23 == 0) {
                                var5_23 = 1;
                            }
                            if (this.y > 0) {
                                var3_13 = this;
                                this.a(this.o.l().c[1], 8, var8_28, 0, 0, false, false, var3_13.B);
                            } else if (this.y < 0) {
                                var3_14 = this;
                                this.a(this.o.l().c[1], 4, var8_28, 0, 0, false, false, var3_14.B);
                            }
                            if (this.z > 0) {
                                this.b(2);
                                var3_15 = this;
                                this.a(this.o.l().c[1], 2, var5_23, 0, 0, false, false, var3_15.B);
                            } else if (this.z < 0) {
                                this.b(1);
                                var3_16 = this;
                                this.a(this.o.l().c[1], 1, var5_23, 0, 0, false, false, var3_16.B);
                            }
                        }
                        var1_1 = this.J() - var1_1;
                        var2_4 = this.K() - var2_4;
                        if (var1_1 == 0 && var2_4 == 0) {
                            this.a(this.D == false);
                        }
                        this.y -= var1_1;
                        this.z -= var2_4;
                    }
                    if (this.y == 0 && this.z == 0) {
                        this.q();
                    }
                    break block48;
                }
                if (this.w <= 0) break block50;
                var1_2 = false;
                var3_17 = 0;
                var4_21 = this.l.size();
                while (var3_17 < var4_21) {
                    var2_5 = (int[])this.l.elementAt(var3_17);
                    if (j.a(this.J(), this.K(), this.t == 8 ? var2_5[0] - this.u : var2_5[0], this.t == 2 ? var2_5[1] - this.u : var2_5[1], this.t == 4 || this.t == 8 ? var2_5[2] + this.u : var2_5[2], this.t == 1 || this.t == 2 ? var2_5[3] + this.u : var2_5[3])) {
                        var1_2 = true;
                        break;
                    }
                    ++var3_17;
                }
                if (!var1_2) ** GOTO lbl-1000
                var3_18 = this;
                if (this.a(this.o.l().c[1], this.t, this.u, 0, 0, false, false, var3_18.B)) {
                    --this.w;
                } else lbl-1000:
                // 2 sources

                {
                    this.w = 0;
                }
                if (this.w == 0) {
                    this.c(0);
                    this.p.g();
                } else {
                    this.c(1);
                }
                break block48;
            }
            if (this.p.f() == 0L) {
                this.w = j.a(cn.com.etgame.cls.system.d.j, cn.com.etgame.cls.system.d.k);
                var1_3 = this.w % 4;
                var2_6 = this.u * cn.com.etgame.cls.system.d.j;
                var3_19 = false;
                if (this.j != this.i) {
                    if (this.j) {
                        switch (var1_3) {
                            case 2: {
                                var1_3 = 0;
                                break;
                            }
                            case 3: {
                                var1_3 = 1;
                            }
                        }
                    } else {
                        switch (var1_3) {
                            case 0: {
                                var1_3 = 2;
                                break;
                            }
                            case 1: {
                                var1_3 = 3;
                            }
                        }
                    }
                }
                var5_24 = 0;
                var6_26 = this.l.size();
                while (var5_24 < var6_26) {
                    var4_22 = (int[])this.l.elementAt(var5_24);
                    if (j.a(this.J(), this.K(), var1_3 == 3 ? var4_22[0] - var2_6 : var4_22[0], var1_3 == 1 ? var4_22[1] - var2_6 : var4_22[1], var1_3 == 2 || var1_3 == 3 ? var4_22[2] + var2_6 : var4_22[2], var1_3 == 0 || var1_3 == 1 ? var4_22[3] + var2_6 : var4_22[3])) {
                        var3_19 = true;
                        break;
                    }
                    ++var5_24;
                }
                if (var3_19) {
                    switch (var1_3) {
                        case 0: {
                            this.b(1);
                            break;
                        }
                        case 1: {
                            this.b(2);
                            break;
                        }
                        case 2: {
                            this.b(4);
                            break;
                        }
                        case 3: {
                            this.b(8);
                        }
                    }
                    this.p.a(j.a(cn.com.etgame.cls.system.d.l, cn.com.etgame.cls.system.d.m));
                    this.p.c();
                }
            }
        }
        return super.a();
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        super.a(graphics, n2, n3, n4, n5, n6, n7);
        if (this.d != null && this.b != null) {
            ac ac2 = this.o.k();
            int n8 = 0;
            while (n8 < this.b.length) {
                int[] nArray = this.b[n8];
                if (j.a(ac2.J(), ac2.K(), this.J() + nArray[0], this.K() + nArray[1], nArray[2], nArray[3])) {
                    graphics.setClip(n4, n5, n6, n7);
                    graphics.setColor(0xFFFFFF);
                    graphics.setFont(ag.b);
                    ag.b(graphics, 0, this.d, n2, n3 - this.f, 33);
                    break;
                }
                ++n8;
            }
        }
        if (this.r != null) {
            this.H.a(graphics, this.r, n2, n3 - 48, n4, n5, n6, n7);
        }
    }

    public final int k() {
        return this.u;
    }

    public final boolean l() {
        return this.A;
    }

    public final boolean m() {
        return this.C;
    }

    public final boolean n() {
        return this.D;
    }

    public final String o() {
        return this.I;
    }
}

