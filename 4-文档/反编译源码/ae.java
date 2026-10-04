/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class ae {
    private int c;
    private e d;
    private a e;
    private ag f;
    private String[] g;
    private String h;
    private String i;
    private int j;
    private int k;
    private int l;
    private int m;
    private int n;
    private boolean o;
    private bj[] p;
    private av q;
    private d r;
    private Image[] s;
    private at[] t;
    private int u;
    private int v;
    private boolean w;
    private int x;
    private int y;
    private int z;
    private int A;
    private bk B;
    private int C;
    private int D;
    private String[] E;
    private String F;
    private String G;
    private int H;
    private int I = 0;
    private int J = 15;
    private int K = 0;
    private int L = 0;
    private int M = 0;
    private av N;
    private boolean O;
    private boolean P;
    private boolean Q;
    private boolean R;
    private Vector[] S;
    private int T;
    public int a;
    private i U;
    private String[] V;
    private int W;
    private int X = 30;
    private bk Y;
    public boolean b;

    public ae(e e2, a a2, d d2, Image[] imageArray) {
        this.d = e2;
        this.e = a2;
        this.r = d2;
        this.s = imageArray;
        this.B = new bk(1000L);
        this.Y = new bk(1000L);
        this.Y.h();
        this.t = new at[15];
        this.t[0] = d2.b("ui\u80cc\u666f\u6846");
        this.t[1] = d2.b("\u4e00\u7ea7\u83dc\u5355");
        this.t[2] = d2.b("\u9053\u5177\u4e8c\u7ea7\u83dc\u5355");
        this.t[3] = d2.b("\u4ed9\u672f\u4e8c\u7ea7\u83dc\u5355");
        this.t[4] = d2.b("\u88c5\u5907\u4e8c\u7ea7\u83dc\u5355");
        this.t[5] = d2.b("\u88c5\u5907\u56fe\u6807");
        this.t[6] = d2.b("\u7279\u6280\u4e8c\u7ea7\u83dc\u5355");
        this.t[7] = d2.b("\u4efb\u52a1\u4e8c\u7ea7\u83dc\u5355");
        this.t[9] = d2.b("\u83dc\u5355\u56fe\u6807");
        this.t[10] = d2.b("\u7cfb\u7edf\u4e8c\u7ea7\u83dc\u5355");
        this.t[11] = d2.b("\u4e09\u7ea7\u5de6\u8fb9\u6846");
        this.t[12] = d2.b("\u4e09\u7ea7\u53f3\u8fb9\u6846");
        this.t[13] = d2.b("\u9009\u62e9\u5934\u50cf");
        this.f = ag.a();
        this.u = this.f.c;
        this.v = this.f.d;
    }

    public final void a(Graphics graphics) {
        this.t[9].a(graphics, this.s, 0, this.v, 0, 0, this.u, this.v, null);
        this.r.b("\u5546\u57ce").a(graphics, this.s, this.u, this.v, 0, 0, this.u, this.v, null);
    }

    public final void b(Graphics object) {
        ae ae2 = this;
        if (ae2.c == 0) {
            this.t[1].b(this.x);
            this.t[1].a((Graphics)object, this.s, 0, this.I, 0, 0, this.u, this.v, null);
            if (this.I != 0) {
                int n2 = Math.abs(this.I);
                if (n2 > 3) {
                    this.I -= (n2 << 2) / 5;
                    return;
                }
                this.I = 0;
                return;
            }
        } else {
            int n3;
            this.t[0].b(0);
            this.t[0].a((Graphics)object, this.s, 0, 0, 0, 0, this.u, this.v, null);
            if (this.x != 0 && this.x != 6 && this.x != 5) {
                this.y = Math.max(0, Math.min(this.y, this.p.length - 1));
                this.e.a((Graphics)object, this.p, 12, this.J, this.y);
                if (this.J != 15) {
                    n3 = Math.abs(this.J - 15);
                    this.J = n3 > 3 ? (this.J += (n3 << 1) / 3) : 15;
                }
                ae2 = this;
                if (ae2.c == 1) {
                    this.t[13].a((Graphics)object, this.s, this.K, 45, 0, 0, this.u, this.v, null);
                    n3 = 15 + this.y * this.e.a((String)"\u5934\u50cf").b().a().c;
                    int n4 = Math.abs(this.K - n3);
                    this.K = n4 > 3 ? (this.K < n3 ? (this.K += (n4 << 2) / 5) : (this.K -= (n4 << 2) / 5)) : n3;
                }
                ae ae3 = this;
                if (ae3.c != 1 && this.x != 6 && this.x != 0) {
                    int n5 = this.p[this.y].x();
                    int n6 = this.p[this.y].y();
                    n3 = this.p[this.y].z();
                    int n7 = this.p[this.y].A();
                    int n8 = this.p[0].g();
                    if (this.y != 0) {
                        this.e.b((Graphics)object, this.p[this.y].k(), 218, 101, 36);
                    }
                    this.e.b((Graphics)object, n5, 170, 121, 36);
                    this.e.b((Graphics)object, n6, 170, 137, 36);
                    this.e.b((Graphics)object, n3, 216, 121, 36);
                    this.e.b((Graphics)object, n7, 216, 137, 36);
                    this.e.b((Graphics)object, n8, 177, 270, 36);
                    this.e.a("\u5c5e\u6027").b(this.y);
                    this.e.a("\u5c5e\u6027").a((Graphics)object, this.e.g(), 0, 0, 0, 0, this.u, this.v, null);
                }
            }
            this.y = Math.max(0, Math.min(this.y, this.p.length - 1));
            n3 = this.t[0].b().a().d - 23;
            int n9 = this.u >> 1;
            String string = "";
            switch (this.x) {
                case 1: {
                    string = String.valueOf(this.p[this.y].a) + "\u4f7f\u7528\u9053\u5177";
                    break;
                }
                case 2: {
                    string = String.valueOf(this.p[this.y].a) + "\u7684\u4ed9\u672f";
                    break;
                }
                case 4: {
                    string = String.valueOf(this.p[this.y].a) + "\u7684\u88c5\u5907";
                    break;
                }
                case 3: {
                    string = String.valueOf(this.p[this.y].a) + "\u7684\u7279\u6280";
                    break;
                }
                case 5: {
                    string = "\u4efb\u52a1";
                    break;
                }
                case 0: {
                    string = "\u72b6\u6001";
                    break;
                }
                case 6: {
                    string = "\u7cfb\u7edf";
                }
            }
            object.setClip(30, 0, 180, this.v);
            object.setFont(ag.b);
            object.setColor(0xFFFFFF);
            ag.b((Graphics)object, 0, string, n9, n3, 33);
            Object object2 = this;
            if (((ae)object2).c != 1) {
                Graphics graphics = object;
                object = this;
                switch (((ae)object).x) {
                    case 1: 
                    case 2: {
                        ((ae)object).e.a("ui\u80cc\u666f\u5de6\u8fb9\u6846").b(0);
                        ((ae)object).e.a("ui\u80cc\u666f\u5de6\u8fb9\u6846").a(graphics, ((ae)object).e.g(), ((ae)object).L, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        ((ae)object).e.a("ui\u80cc\u666f\u53f3\u8fb9\u6846").a(graphics, ((ae)object).e.g(), ((ae)object).M, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        ((ae)object).t[11].b(0);
                        ((ae)object).t[11].a(graphics, ((ae)object).s, ((ae)object).L, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        ((ae)object).t[12].a(graphics, ((ae)object).s, ((ae)object).M, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        break;
                    }
                    case 3: 
                    case 4: 
                    case 5: {
                        ((ae)object).e.a("ui\u80cc\u666f\u5de6\u8fb9\u6846").b(1);
                        ((ae)object).e.a("ui\u80cc\u666f\u5de6\u8fb9\u6846").a(graphics, ((ae)object).e.g(), ((ae)object).L, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        ((ae)object).e.a("ui\u80cc\u666f\u53f3\u8fb9\u6846").a(graphics, ((ae)object).e.g(), ((ae)object).M, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        ((ae)object).t[11].b(1);
                        ((ae)object).t[11].a(graphics, ((ae)object).s, ((ae)object).L, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        ((ae)object).t[12].a(graphics, ((ae)object).s, ((ae)object).M, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                    }
                }
                if (((ae)object).L != 0 || ((ae)object).M != 0) {
                    int n10 = Math.abs(((ae)object).L);
                    int n11 = Math.abs(((ae)object).M);
                    ((ae)object).L = n10 > 3 ? (((ae)object).L += (n10 << 1) / 3) : 0;
                    if (n11 > 3) {
                        ((ae)object).M -= (n11 << 1) / 3;
                        return;
                    }
                    ((ae)object).M = 0;
                    return;
                }
                switch (((ae)object).x) {
                    case 0: {
                        ((ae)object).e.a(graphics, ((ae)object).p, 12, 15, -1);
                        ((ae)object).e.b(graphics, 2, 50);
                        return;
                    }
                    case 1: {
                        ((ae)object).z = Math.max(0, Math.min(((ae)object).z, ((ae)object).t[2].b.length - 1));
                        object2 = object;
                        if (((ae)object2).c == 2) {
                            ((ae)object).t[2].b(((ae)object).z);
                            ((ae)object).t[2].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        }
                        if (((ae)object).E != null) {
                            ((ae)object).C = ((ae)object).C < 0 ? ((ae)object).E.length - 1 : (((ae)object).C < ((ae)object).E.length ? ((ae)object).C : 0);
                            super.a(graphics, ((ae)object).E, 5, ((ae)object).C);
                        }
                        super.a(graphics, ((ae)object).F);
                        return;
                    }
                    case 2: {
                        ((ae)object).z = Math.max(0, Math.min(((ae)object).z, ((ae)object).t[3].b.length - 1));
                        object2 = object;
                        if (((ae)object2).c == 2) {
                            ((ae)object).t[3].b(((ae)object).z);
                            ((ae)object).t[3].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        }
                        if (((ae)object).E != null) {
                            ((ae)object).C = ((ae)object).C < 0 ? ((ae)object).E.length - 1 : (((ae)object).C < ((ae)object).E.length ? ((ae)object).C : 0);
                            super.a(graphics, ((ae)object).E, 5, ((ae)object).C);
                        }
                        super.a(graphics, ((ae)object).F);
                        return;
                    }
                    case 3: {
                        ((ae)object).t[6].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        if (((ae)object).E != null) {
                            ((ae)object).C = ((ae)object).C < 0 ? ((ae)object).E.length - 1 : (((ae)object).C < ((ae)object).E.length ? ((ae)object).C : 0);
                            super.a(graphics, ((ae)object).E, 6, ((ae)object).C);
                        }
                        super.a(graphics, ((ae)object).F);
                        return;
                    }
                    case 4: {
                        object2 = object;
                        if (((ae)object2).c != 3) {
                            ((ae)object).t[4].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                            ((ae)object).t[5].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                            ((ae)object).C = ((ae)object).C < 0 ? 5 : (((ae)object).C < 6 ? ((ae)object).C : 0);
                            super.f(graphics);
                        } else if (((ae)object).E != null) {
                            ((ae)object).D = ((ae)object).D < 0 ? ((ae)object).E.length - 1 : (((ae)object).D < ((ae)object).E.length ? ((ae)object).D : 0);
                            super.a(graphics, ((ae)object).E, 6, ((ae)object).D);
                        }
                        super.a(graphics, ((ae)object).F);
                        return;
                    }
                    case 5: {
                        ((ae)object).e.a(graphics, ((ae)object).p, 12, 15, -1);
                        ((ae)object).t[7].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                        if (((ae)object).E != null) {
                            ((ae)object).C = ((ae)object).C < 0 ? ((ae)object).E.length - 1 : (((ae)object).C < ((ae)object).E.length ? ((ae)object).C : 0);
                            super.a(graphics, ((ae)object).E, 6, ((ae)object).C);
                        }
                        super.a(graphics, ((ae)object).F);
                        return;
                    }
                    case 6: {
                        object2 = object;
                        if (((ae)object2).c == 2) {
                            ((ae)object).C = ((ae)object).C < 0 ? ((ae)object).t[10].b.length - 1 : (((ae)object).C < ((ae)object).t[10].b.length ? ((ae)object).C : 0);
                            ((ae)object).t[10].b(((ae)object).C);
                            ((ae)object).t[10].a(graphics, ((ae)object).s, 0, 0, 0, 0, ((ae)object).u, ((ae)object).v, null);
                            return;
                        }
                        object2 = object;
                        if (((ae)object2).c != 3) break;
                        switch (((ae)object).C) {
                            case 0: 
                            case 1: {
                                ((ae)object).D = ((ae)object).D < 0 ? 2 : (((ae)object).D < 3 ? ((ae)object).D : 0);
                                super.a(graphics, ((ae)object).D, ((ae)object).u >> 1, ((ae)object).v >> 1);
                                return;
                            }
                            case 2: {
                                ((ae)object).D = ((ae)object).D < 0 ? 0 : (((ae)object).D < ((ae)object).E.length - 3 ? ((ae)object).D : ((ae)object).E.length - 3);
                                super.a(graphics, ((ae)object).D);
                                return;
                            }
                            case 3: {
                                super.e(graphics);
                            }
                        }
                    }
                }
            }
        }
    }

    private void e(Graphics graphics) {
        int n2 = (this.u - 50) / 2;
        int n3 = this.v >> 1;
        int n4 = 10;
        graphics.setClip(0, 0, this.u, this.v);
        graphics.setColor(0xFFFFFF);
        graphics.setFont(ag.b);
        ag.b(graphics, 0, "\u97f3\u4e50\u8bbe\u7f6e", this.u >> 1, this.v / 3, 33);
        int n5 = 0;
        while (n5 < 4) {
            graphics.setColor(0);
            graphics.drawRect(n2, n3 - n4, 6, n4 + 1);
            if (n5 < this.H) {
                graphics.setColor(65280);
                graphics.fillRect(n2 + 1, n3 + 1 - n4, 5, n4);
            }
            n2 += 10;
            n4 += 10;
            ++n5;
        }
    }

    private void a(Graphics graphics, int n2, int n3, int n4) {
        int n5 = (n3 -= 88) + 15;
        int n6 = (n4 -= 102) + 10;
        graphics.setFont(ag.b);
        int n7 = 0;
        while (n7 < 3) {
            if (n7 == n2) {
                this.e.a(graphics, n3 + 5, n6 - 5 + n7 * 56, 166, 51, false);
            }
            graphics.setClip(n3, n4, 176, 204);
            if (cn.com.etgame.cls.system.d.a[n7] != null) {
                graphics.setColor(0xFFFFFF);
                ag.b(graphics, 0, cn.com.etgame.cls.system.d.a[n7].b(), n5 + 55, n6 + 10 + n7 * 56, 20);
                graphics.drawRGB(cn.com.etgame.cls.system.d.a[n7].b, 0, 40, n5 + 3, n6 + n7 * 56 + 3, 40, 40, false);
            } else {
                graphics.setColor(0xFFFFFF);
                ag.b(graphics, 0, "--/-- --:--", n3 + 88, n6 + 10 + n7 * 56, 17);
            }
            ++n7;
        }
    }

    private void a(Graphics graphics, int n2) {
        graphics.setFont(ag.b);
        graphics.setClip(0, 0, this.u, this.v);
        int n3 = 0;
        while (n2 < this.E.length) {
            if (n3 <= 10) {
                graphics.setColor(0xFFFFFF);
                ag.b(graphics, 0, this.E[n2], this.u >> 1, 22 + n3 * 22, 17);
                ++n3;
            }
            ++n2;
        }
    }

    /*
     * Unable to fully structure code
     */
    private void f(Graphics var1_1) {
        var2_2 = 122;
        var1_1.setColor(0);
        var1_1.setClip(0, 0, this.u, this.v);
        var1_1.setFont(ag.b);
        var4_3 = 0;
        while (var4_3 < 6) {
            block12: {
                block11: {
                    switch (var4_3) {
                        case 0: {
                            var3_4 = this.p[this.y].m() != null ? this.p[this.y].m().a : "\u65e0";
                            break;
                        }
                        case 1: {
                            var3_4 = this.p[this.y].n() != null ? this.p[this.y].n().a : "\u65e0";
                            break;
                        }
                        case 2: {
                            var3_4 = this.p[this.y].o() != null ? this.p[this.y].o().a : "\u65e0";
                            break;
                        }
                        case 3: {
                            var3_4 = this.p[this.y].p() != null ? this.p[this.y].p().a : "\u65e0";
                            break;
                        }
                        case 4: {
                            var3_4 = this.p[this.y].q() != null ? this.p[this.y].q().a : "\u65e0";
                            break;
                        }
                        case 5: {
                            var3_4 = this.p[this.y].r() != null ? this.p[this.y].r().a : "\u65e0";
                            break;
                        }
                        default: {
                            var3_4 = "\u65e0";
                        }
                    }
                    if (this.C != var4_3) break block11;
                    var5_5 = this;
                    if (var5_5.c != 2) break block11;
                    var1_1.setColor(16769631);
                    break block12;
                }
                if (this.D != var4_3) ** GOTO lbl-1000
                var5_5 = this;
                if (var5_5.c == 3) {
                    var1_1.setColor(16769631);
                } else lbl-1000:
                // 2 sources

                {
                    var1_1.setColor(3752266);
                }
            }
            var1_1.drawString(var3_4, 50, var2_2, 36);
            var1_1.setColor(5078197);
            var1_1.drawLine(45, var2_2, 135, var2_2);
            var2_2 += 25;
            ++var4_3;
        }
    }

    /*
     * Unable to fully structure code
     */
    private void a(Graphics var1_1, String[] var2_2, int var3_3, int var4_4) {
        var5_5 = var4_4 / var3_3;
        var1_1.setColor(0);
        var1_1.setClip(0, 0, this.u, this.v);
        var1_1.setFont(ag.b);
        var6_6 = (var5_5 *= var3_3) + var3_3 - 1;
        var6_6 = Math.min(var6_6, var2_2.length - 1);
        var3_3 = 250 - (var3_3 - Math.abs(var6_6 + 1 - var5_5)) * 25;
        var7_8 = var6_6;
        while (var7_8 >= var5_5) {
            var6_7 = j.a(var2_2[var7_8], "|");
            if (var7_8 != var4_4) ** GOTO lbl-1000
            var8_9 = this;
            if (var8_9.c == 2) ** GOTO lbl-1000
            var8_9 = this;
            if (var8_9.c == 3) lbl-1000:
            // 2 sources

            {
                var1_1.setColor(16769631);
                this.G = var6_7[0];
            } else lbl-1000:
            // 2 sources

            {
                var1_1.setColor(3752266);
            }
            if (var6_7.length == 2) {
                var1_1.drawString(var6_7[0], 86, var3_3, 40);
                var1_1.drawString(var6_7[1], 96, var3_3, 36);
            } else {
                var1_1.drawString(var6_7[0], 76, var3_3, 33);
            }
            var1_1.setColor(5078197);
            var1_1.drawLine(16, var3_3, 136, var3_3);
            var3_3 -= 25;
            --var7_8;
        }
    }

    private void a(Graphics graphics, String stringArray) {
        if (stringArray != null) {
            int n2 = 164;
            stringArray = j.a((String)stringArray, 75, ag.b);
            graphics.setClip(154, 144, 75, 105);
            graphics.setColor(3752266);
            graphics.setFont(ag.b);
            int n3 = 0;
            while (n3 < stringArray.length) {
                if (n2 + this.A > 124 && n2 + this.A < 249) {
                    graphics.drawString(stringArray[n3], 154, n2 + this.A, 20);
                }
                n2 += 20;
                ++n3;
            }
            if (this.B.i() && this.A + 20 * stringArray.length < -55) {
                this.f();
                return;
            }
            if (20 + stringArray.length * 20 > 105 && this.B.f() == 0L) {
                this.B.h();
                this.A -= 2;
                this.Y.h();
                return;
            }
            if (this.Y.i()) {
                this.Y.c();
                this.Y.g();
                return;
            }
            if (this.Y.f() == 0L) {
                this.A = 0;
                this.Y.c();
                this.Y.h();
            }
        }
    }

    private void f() {
        this.B.c();
        this.B.g();
        this.A = 0;
    }

    /*
     * Exception decompiling
     */
    public final void a(int var1_1) {
        /*
         * This method has failed to decompile.  When submitting a bug report, please provide this stack trace, and (if you hold appropriate legal rights) the relevant class file.
         * 
         * org.benf.cfr.reader.util.ConfusedCFRException: Tried to end blocks [50[CASE]], but top level block is 60[SWITCH]
         *     at org.benf.cfr.reader.bytecode.analysis.opgraph.Op04StructuredStatement.processEndingBlocks(Op04StructuredStatement.java:435)
         *     at org.benf.cfr.reader.bytecode.analysis.opgraph.Op04StructuredStatement.buildNestedBlocks(Op04StructuredStatement.java:484)
         *     at org.benf.cfr.reader.bytecode.analysis.opgraph.Op03SimpleStatement.createInitialStructuredBlock(Op03SimpleStatement.java:736)
         *     at org.benf.cfr.reader.bytecode.CodeAnalyser.getAnalysisInner(CodeAnalyser.java:850)
         *     at org.benf.cfr.reader.bytecode.CodeAnalyser.getAnalysisOrWrapFail(CodeAnalyser.java:278)
         *     at org.benf.cfr.reader.bytecode.CodeAnalyser.getAnalysis(CodeAnalyser.java:201)
         *     at org.benf.cfr.reader.entities.attributes.AttributeCode.analyse(AttributeCode.java:94)
         *     at org.benf.cfr.reader.entities.Method.analyse(Method.java:531)
         *     at org.benf.cfr.reader.entities.ClassFile.analyseMid(ClassFile.java:1055)
         *     at org.benf.cfr.reader.entities.ClassFile.analyseTop(ClassFile.java:942)
         *     at org.benf.cfr.reader.Driver.doJarVersionTypes(Driver.java:257)
         *     at org.benf.cfr.reader.Driver.doJar(Driver.java:139)
         *     at org.benf.cfr.reader.CfrDriverImpl.analyse(CfrDriverImpl.java:76)
         *     at org.benf.cfr.reader.Main.main(Main.java:54)
         */
        throw new IllegalStateException("Decompilation failed");
    }

    private void g() {
        this.y = Math.max(0, Math.min(this.y, this.p.length - 1));
        switch (this.x) {
            case 0: {
                return;
            }
            case 2: {
                int n2;
                this.z = this.z < 0 ? this.t[3].b.length - 1 : (this.z < this.t[3].b.length ? this.z : 0);
                int[][] nArray = this.p[this.y].G();
                switch (this.z) {
                    case 0: {
                        n2 = 1;
                        break;
                    }
                    case 1: {
                        n2 = 3;
                        break;
                    }
                    case 2: {
                        n2 = 2;
                        break;
                    }
                    case 3: {
                        n2 = 4;
                        break;
                    }
                    case 4: {
                        n2 = 5;
                        break;
                    }
                    case 5: {
                        n2 = 6;
                        break;
                    }
                    default: {
                        n2 = -1;
                    }
                }
                int n3 = 0;
                int n4 = 0;
                while (n4 < nArray.length) {
                    if (nArray[n4][2] == 1 && nArray[n4][0] == n2) {
                        ++n3;
                    }
                    ++n4;
                }
                if (n3 > 0) {
                    int n5;
                    this.E = new String[n3];
                    n4 = 0;
                    this.C = this.C < 0 ? this.E.length - 1 : (this.C < this.E.length ? this.C : 0);
                    n3 = 0;
                    int n6 = 0;
                    while (n3 < nArray.length) {
                        if (nArray[n3][2] == 1 && nArray[n3][0] == n2) {
                            if (n6 == this.C) {
                                n4 = nArray[n3][1];
                            }
                            n5 = nArray[n3][1];
                            this.E[n6] = cn.com.etgame.cls.system.d.U[n5].d;
                            ++n6;
                        }
                        ++n3;
                    }
                    n5 = n4;
                    n5 = n4;
                    this.F = "\uff08" + this.p[this.y].b(cn.com.etgame.cls.system.d.U[n5].a) + "\u7ea7\uff09" + cn.com.etgame.cls.system.d.U[n5].l;
                } else {
                    this.E = null;
                    this.F = null;
                }
                this.f();
                return;
            }
            case 4: {
                ae ae2 = this;
                if (ae2.c == 3) {
                    i[] iArray = null;
                    switch (this.C) {
                        case 0: {
                            iArray = this.q.b(0);
                            break;
                        }
                        case 1: {
                            iArray = this.q.b(1);
                            break;
                        }
                        case 2: {
                            iArray = this.q.b(2);
                            break;
                        }
                        case 3: {
                            iArray = this.q.b(3);
                            break;
                        }
                        case 4: 
                        case 5: {
                            iArray = this.q.b(4);
                        }
                    }
                    if (iArray != null) {
                        this.E = new String[iArray.length];
                        int n7 = 0;
                        while (n7 < iArray.length) {
                            this.E[n7] = iArray[n7].a;
                            if (this.D == n7) {
                                this.F = iArray[n7].c();
                            }
                            ++n7;
                        }
                    } else {
                        this.E = null;
                        this.F = null;
                        this.c(2);
                        this.d.a("\u6ca1\u6709\u53ef\u7528\u88c5\u5907", 2000L);
                    }
                } else {
                    this.C = this.C < 0 ? 5 : (this.C < 6 ? this.C : 0);
                    switch (this.C) {
                        case 0: {
                            this.F = this.p[this.y].m() != null ? this.p[this.y].m().c() : null;
                            break;
                        }
                        case 1: {
                            this.F = this.p[this.y].n() != null ? this.p[this.y].n().c() : null;
                            break;
                        }
                        case 2: {
                            this.F = this.p[this.y].o() != null ? this.p[this.y].o().c() : null;
                            break;
                        }
                        case 3: {
                            this.F = this.p[this.y].p() != null ? this.p[this.y].p().c() : null;
                            break;
                        }
                        case 4: {
                            this.F = this.p[this.y].q() != null ? this.p[this.y].q().c() : null;
                            break;
                        }
                        case 5: {
                            this.F = this.p[this.y].r() != null ? this.p[this.y].r().c() : null;
                            break;
                        }
                        default: {
                            this.F = null;
                        }
                    }
                }
                this.f();
                return;
            }
            case 3: {
                int n8;
                int[][] nArray = this.p[this.y].H();
                int n9 = 0;
                int n10 = 0;
                while (n10 < nArray.length) {
                    if (nArray[n10][1] == 1) {
                        ++n9;
                    }
                    ++n10;
                }
                this.E = new String[n9];
                n10 = 0;
                while (n10 < nArray.length) {
                    if (nArray[n10][1] == 1) {
                        n8 = nArray[n10][0];
                        this.E[n10] = cn.com.etgame.cls.system.d.U[n8].d;
                    }
                    ++n10;
                }
                this.C = this.C < 0 ? this.E.length - 1 : (this.C < this.E.length ? this.C : 0);
                n8 = nArray[this.C][0];
                this.F = cn.com.etgame.cls.system.d.U[n8].l;
                this.f();
                return;
            }
            case 5: {
                Vector vector = this.p[0].F();
                if (vector.size() > 0) {
                    this.E = new String[vector.size()];
                    int n11 = 0;
                    while (n11 < this.E.length) {
                        this.E[n11] = (String)vector.elementAt(n11);
                        if (n11 == this.C) {
                            this.F = cn.com.etgame.cls.system.d.i(this.E[this.C]);
                        }
                        if (n11 == 0 && this.E[n11] != null) {
                            int n12 = n11;
                            this.E[n12] = String.valueOf(this.E[n12]) + "-\u4e3b";
                        }
                        ++n11;
                    }
                } else {
                    this.E = null;
                    this.F = null;
                }
                this.f();
                return;
            }
            case 1: {
                ae ae3 = this;
                if (ae3.c == 2) {
                    int n13 = this.z < 0 ? this.t[2].b.length - 1 : (this.z = this.z < this.t[2].b.length ? this.z : 0);
                    if (this.b) {
                        if (this.d.a("0001") && !this.d.a("0002")) {
                            if (this.z == 2) {
                                this.d.m();
                            }
                        } else if (this.d.a("0002") && !this.d.a("0003")) {
                            if (this.z == 3) {
                                this.d.m();
                            }
                        } else if (this.d.a("0003") && !this.d.a("0004")) {
                            if (this.z == 3 && this.C == 3) {
                                this.d.m();
                            }
                        } else if (this.d.a("0004") && !this.d.a("0020") && this.z == 4) {
                            this.d.m();
                        }
                    }
                }
                if (this.z == 3) {
                    this.E = new String[cn.com.etgame.cls.system.d.S.length];
                    int n14 = 0;
                    while (n14 < this.E.length) {
                        this.E[n14] = cn.com.etgame.cls.system.d.S[n14].a;
                        ++n14;
                    }
                    this.C = this.C < 0 ? this.E.length - 1 : (this.C < this.E.length ? this.C : 0);
                    this.F = cn.com.etgame.cls.system.d.S[this.C].c;
                } else {
                    Vector vector = this.q.a(this.z);
                    if (vector != null && vector.size() > 0) {
                        this.E = new String[vector.size()];
                        int n15 = 0;
                        while (n15 < vector.size()) {
                            i i2 = (i)vector.elementAt(n15);
                            this.E[n15] = String.valueOf(i2.a) + "|x" + i2.d();
                            ++n15;
                        }
                        this.C = this.C < 0 ? this.E.length - 1 : (this.C < this.E.length ? this.C : 0);
                        this.F = ((i)vector.elementAt(this.C)).c();
                    } else {
                        this.E = null;
                        this.F = null;
                    }
                }
                this.f();
                return;
            }
            case 6: {
                this.C = this.C < 0 ? this.t[10].b.length - 1 : (this.C < this.t[10].b.length ? this.C : 0);
            }
        }
    }

    public final void c(Graphics graphics) {
        this.e.a(graphics, this.k, this.l, this.m, this.n, false);
        graphics.setClip(this.k, this.l, this.m, this.n);
        graphics.setFont(ag.b);
        int n2 = 0;
        while (n2 < 2) {
            if (n2 == this.j) {
                graphics.setColor(0xFF0000);
            } else {
                graphics.setColor(0xFFFFFF);
            }
            cn.com.etgame.cls.system.a.a(graphics, 0, this.g[n2], this.f.e, this.l + 10 + n2 * 30, 17);
            ++n2;
        }
    }

    public final void a(String string, String string2, String string3, String string4) {
        this.h = string2;
        this.i = string4;
        this.g = new String[]{string, string3};
        this.j = 0;
        this.m = Math.max(ag.a.stringWidth(string), ag.a.stringWidth(string3)) + 20;
        this.n = 80;
        this.k = this.f.c - this.m >> 1;
        this.l = this.f.d - this.n >> 1;
        this.o = true;
    }

    public final boolean a() {
        return this.o;
    }

    public final boolean b() {
        return this.w;
    }

    public final boolean c() {
        return this.O;
    }

    public final void d() {
        this.w = true;
        this.c = 0;
        this.p = this.d.t();
        int n2 = 0;
        while (n2 < this.p.length) {
            if (!this.d.f(n2)) {
                this.p[n2].a(false);
            } else {
                this.p[n2].a(true);
                cn.com.etgame.cls.system.d.a(8, "\u540d\u5b57\uff1a" + this.p[n2].a);
            }
            ++n2;
        }
        this.q = this.p[0].c();
        this.e.a(this.p, false);
        this.x = 0;
        this.I = 60;
        this.y = 0;
        this.z = 0;
        this.C = 0;
        this.D = 0;
        this.A = 0;
    }

    private void b(int n2) {
        block36: {
            block35: {
                if (!this.Q) break block35;
                switch (this.f.getGameAction(n2)) {
                    case 2: {
                        this.j = (this.j + this.g.length - 1) % this.g.length;
                        return;
                    }
                    case 4: {
                        this.j = (this.j + 1) % this.g.length;
                        return;
                    }
                    case 1: 
                    case 131072: {
                        av av2 = null;
                        switch (this.j) {
                            case 0: {
                                av2 = this.N;
                                this.Q = false;
                                this.R = true;
                                break;
                            }
                            case 1: {
                                av2 = this.d.t()[0].c();
                                this.Q = false;
                                this.R = false;
                            }
                        }
                        this.S = new Vector[]{new Vector()};
                        int n3 = 0;
                        while (n3 < 3) {
                            int n4 = 0;
                            while (n4 < av2.a(n3).size()) {
                                this.S[0].addElement(av2.a(n3).elementAt(n4));
                                ++n4;
                            }
                            ++n3;
                        }
                        this.T = 0;
                        this.a = 0;
                        this.m = this.u - 20;
                        this.n = this.v - 20;
                        this.k = this.u - this.m >> 1;
                        this.l = this.v - this.n >> 1;
                        if (this.S[this.T].size() > 0) {
                            this.V = j.a(((i)this.S[this.T].elementAt(this.a)).c(), this.W, ag.b);
                            return;
                        }
                        break block36;
                    }
                    case 262144: {
                        this.O = false;
                    }
                    default: {
                        return;
                    }
                }
            }
            switch (this.f.getGameAction(n2)) {
                case 2: {
                    if (this.S[this.T] == null || this.S[this.T].size() == 0) break;
                    this.a = (this.a + this.S[this.T].size() - 1) % this.S[this.T].size();
                    if (this.P) {
                        this.V = j.a(cn.com.etgame.cls.system.d.W[this.a][4], this.W, ag.b);
                        break;
                    }
                    this.V = j.a(((i)this.S[this.T].elementAt(this.a)).c(), this.W, ag.b);
                    break;
                }
                case 4: {
                    if (this.S[this.T] == null || this.S[this.T].size() == 0) break;
                    this.a = (this.a + 1) % this.S[this.T].size();
                    if (this.P) {
                        this.V = j.a(cn.com.etgame.cls.system.d.W[this.a][4], this.W, ag.b);
                        break;
                    }
                    this.V = j.a(((i)this.S[this.T].elementAt(this.a)).c(), this.W, ag.b);
                    break;
                }
                case 8: {
                    this.a = 0;
                    this.T = (this.T + this.S.length - 1) % this.S.length;
                    if (this.P) {
                        this.V = j.a(cn.com.etgame.cls.system.d.W[this.a][4], this.W, ag.b);
                        break;
                    }
                    this.V = j.a(((i)this.S[this.T].elementAt(this.a)).c(), this.W, ag.b);
                    break;
                }
                case 16: {
                    this.a = 0;
                    this.T = (this.T + 1) % this.S.length;
                    if (this.P) {
                        this.V = j.a(cn.com.etgame.cls.system.d.W[this.a][4], this.W, ag.b);
                        break;
                    }
                    this.V = j.a(((i)this.S[this.T].elementAt(this.a)).c(), this.W, ag.b);
                    break;
                }
                case 1: 
                case 131072: {
                    if (this.U == null || this.S[0] == null || this.S[0].size() == 0) break;
                    if (this.P) {
                        if (cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.W[this.a][0]))) {
                            this.d.a("\u5df2\u6fc0\u6d3b", 2000L);
                            break;
                        }
                        this.O = false;
                        al.a().a(Integer.parseInt(cn.com.etgame.cls.system.d.W[this.a][0]), cn.com.etgame.cls.system.d.W[this.a][1], cn.com.etgame.cls.system.d.W[this.a][2], Integer.parseInt(cn.com.etgame.cls.system.d.W[this.a][3]), cn.com.etgame.cls.system.d.W[this.a][4], this.d);
                        break;
                    }
                    if (this.R) {
                        if (this.d.t()[0].g() >= this.U.b()) {
                            this.d.t()[0].c().a(this.U);
                            this.d.t()[0].i(-this.U.b());
                            this.d.a("\u8d2d\u4e70" + this.U.a + "\u6210\u529f", 2000L);
                        } else {
                            this.d.a("\u91d1\u94b1\u4e0d\u8db3", 2000L);
                        }
                    } else if (this.U != null && this.S[0] != null && this.S[0].size() != 0) {
                        if (this.U.d() == 1) {
                            this.S[0].removeElement(this.U);
                            this.a = 0;
                        }
                        this.d.t()[0].c().a(this.U, 1);
                        this.d.t()[0].i(this.U.b() >> 1);
                        this.d.a(this.U.a + "\u5356\u51fa\u6210\u529f", 2000L);
                    }
                    if (this.P) {
                        this.V = j.a(cn.com.etgame.cls.system.d.W[this.a][4], this.W, ag.b);
                        break;
                    }
                    if (this.S[this.T].size() <= 0) break;
                    this.V = j.a(((i)this.S[this.T].elementAt(this.a)).c(), this.W, ag.b);
                    break;
                }
                case 262144: {
                    if (this.P) {
                        this.O = false;
                        this.d.f();
                        break;
                    }
                    this.Q = true;
                    this.m = Math.max(ag.a.stringWidth("\u8d2d\u4e70"), ag.a.stringWidth("\u5356\u51fa")) + 20;
                    this.n = 80;
                    this.k = this.f.c - this.m >> 1;
                    this.l = this.f.d - this.n >> 1;
                }
            }
            this.X = 30;
        }
    }

    public final void e() {
        this.w = false;
        this.o = false;
        this.O = true;
        this.Q = false;
        this.R = true;
        this.P = true;
        this.j = 0;
        this.T = 0;
        this.X = 30;
        this.m = this.u - 20;
        this.n = this.v - 20;
        this.k = this.u - this.m >> 1;
        this.l = this.v - this.n >> 1;
        this.S = new Vector[]{cn.com.etgame.cls.system.d.V};
        this.p = this.d.t();
        int n2 = 0;
        while (n2 < this.p.length) {
            if (!this.d.f(n2)) {
                this.p[n2].a(false);
            } else {
                this.p[n2].a(true);
            }
            ++n2;
        }
        this.V = j.a(cn.com.etgame.cls.system.d.W[this.a][4], this.e.a((String)"\u8d2d\u4e70").b().a().c - 20, ag.b);
    }

    public final void a(av av2, boolean bl2) {
        this.N = av2;
        this.g = new String[]{"\u8d2d\u4e70", "\u5356\u51fa"};
        this.w = false;
        this.o = false;
        this.O = true;
        this.Q = true;
        this.P = false;
        this.j = 0;
        this.m = Math.max(ag.a.stringWidth("\u8d2d\u4e70"), ag.a.stringWidth("\u5356\u51fa")) + 20;
        this.n = 80;
        this.k = this.f.c - this.m >> 1;
        this.l = this.f.d - this.n >> 1;
        this.T = 0;
        this.a = 0;
        this.X = 30;
    }

    public final void d(Graphics graphics) {
        graphics.setFont(ag.b);
        if (this.Q) {
            this.c(graphics);
            return;
        }
        at at2 = this.e.a(this.P ? "\u5546\u57ce\u754c\u9762" : (this.R ? "\u8d2d\u4e70" : "\u51fa\u552e"));
        y y2 = at2.b().a();
        int n2 = this.u - y2.c >> 1;
        int n3 = this.v - y2.d >> 1;
        int n4 = this.a / 5 * 5;
        int n5 = this.u >> 1;
        int n6 = y2.c;
        at2.a(graphics, this.e.g(), n2, n3, n2, n3, y2.c, y2.d, null);
        graphics.setClip(n2, n3, n6, 115);
        graphics.setColor(0xFFFFFF);
        int n7 = this.S[this.T] == null || this.S[this.T].size() == 0 ? 0 : this.a + 1;
        ag.b(graphics, 0, String.valueOf(n7) + "/" + this.S[this.T].size(), n5, n3 + 23 + 5, 33);
        if (!this.P) {
            ag.a(graphics, 0, "" + this.d.t()[0].g(), n2 + n6 - 60, n3 + 23 + 5, 36);
        }
        n3 = n3 + 23 + 2;
        graphics.setClip(n2, n3, n6, 115);
        int n8 = n4;
        int n9 = 0;
        while (n8 < n4 + 5) {
            if (n8 < this.S[this.T].size()) {
                i i2 = (i)this.S[this.T].elementAt(n8);
                if (n8 == this.a) {
                    this.U = i2;
                    graphics.setColor(49617);
                    graphics.fillRect(n2 + 10, n3 + n9 * 23 + 4, n6 - 20, 18);
                }
                graphics.setColor(0xFFFFFF);
                if (this.P) {
                    ag.a(graphics, 0, i2.a, n5, n3 + 23 + n9 * 23 - 1, 33);
                } else {
                    ag.a(graphics, 0, String.valueOf(i2.a) + (this.R ? "" : " x " + i2.d()), n2 + 14, n3 + 23 + n9 * 23 - 1, 36);
                    ag.a(graphics, 0, "$ " + (this.R ? i2.b() : i2.b() / 2), n5 + 32, n3 + 23 + n9 * 23 - 1, 36);
                }
            }
            graphics.setColor(1036031);
            graphics.drawLine(n2 + 10, n3 + 23 + n9 * 23, n2 + n6 - 20, n3 + 23 + n9 * 23);
            ++n8;
            ++n9;
        }
        if (this.S[this.T].size() == 0 || (i)this.S[this.T].elementAt(this.a) == null) {
            this.U = null;
        }
        if (this.U != null && this.V != null) {
            this.W = y2.c - 23;
            graphics.setClip(n2, (n3 += 115) + 2, y2.c, 41);
            graphics.setColor(0xFFFFFF);
            n8 = 0;
            while (n8 < this.V.length) {
                if (this.X + n8 * 23 > -11 && this.X + n8 * 23 < 46) {
                    ag.a(graphics, 0, this.V[n8], n5, this.X + n3 + n8 * 23, 17);
                }
                ++n8;
            }
            if (this.X + n3 + this.V.length * 23 > (this.v - y2.d >> 1) + y2.d - 23) {
                this.X -= 2;
                this.Y.h();
                return;
            }
            if (this.Y.i()) {
                this.Y.c();
                this.Y.g();
                return;
            }
            if (this.Y.f() == 0L) {
                this.X = 30;
                this.Y.c();
                this.Y.h();
            }
        }
    }

    private void c(int n2) {
        if (this.c != n2) {
            switch (n2) {
                case 0: {
                    this.I = 60;
                    this.y = 0;
                    this.K = 0;
                }
            }
            this.c = n2;
        }
        this.g();
    }
}

