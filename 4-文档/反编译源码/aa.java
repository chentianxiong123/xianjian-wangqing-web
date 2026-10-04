/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class aa
implements aw,
n {
    private int c = 0;
    private Image[] d;
    private at[] e;
    private at[] f;
    private at g;
    public at[] a;
    public at[] b;
    private at h;
    private at i;
    private at j;
    private at k;
    private int l;
    private int m;
    private int n;
    private int o = 20;
    private a p;
    private av q;
    private bj r;
    private f s;
    private int t;
    private int u;
    private String v;
    private String w;
    private String[] x;
    private String[] y;
    private int z;
    private int A = 5;
    private bk B;
    private bk C;
    private int D;
    private int E;
    private String F;
    private boolean G;
    private i H;
    private af I;
    private int J;

    public aa(d d2, Image[] imageArray, bj bj2, f f2) {
        this.d = imageArray;
        this.s = f2;
        this.m = ag.a().c;
        this.n = ag.a().d;
        this.p = cn.com.etgame.cls.system.d.c();
        this.q = bj2.c();
        this.r = bj2;
        this.B = new bk(8000L);
        this.C = new bk(1000L);
        this.C.h();
        this.h = d2.b("\u6218\u6597\u9009\u6846");
        this.h.b(5);
        this.i = d2.b("\u7070\u8272\u9009\u6846");
        this.i.b(0);
        this.j = d2.b("\u5927\u5b57");
        this.k = d2.b("\u672f");
        this.e = new at[21];
        this.e[0] = d2.b("\u76ee\u6807\u9009\u62e9");
        this.e[5] = d2.b("\u76ee\u6807\u9009\u62e9\u5c0f");
        this.e[1] = d2.b("\u901f\u5ea6\u6761");
        this.e[2] = d2.b("\u5c0f\u7bad\u5934");
        this.e[3] = d2.b("\u5c0f\u7bad\u5934");
        this.e[4] = d2.b("\u4fe1\u606f\u63d0\u793a\u6846");
        this.e[6] = d2.b("\u95ea\u907f");
        this.e[7] = d2.b("\u6b66");
        this.e[8] = d2.b("\u9632");
        this.e[9] = d2.b("\u901f");
        this.e[10] = d2.b("\u5b9a");
        this.e[11] = d2.b("\u7131");
        this.e[13] = d2.b("\u51fb\u7a7a");
        this.e[15] = d2.b("\u5438\u6536");
        this.e[14] = d2.b("\u79d2\u6740");
        this.e[16] = d2.b("\u9707\u6151");
        this.f = new at[4];
        this.f[0] = d2.b("\u91cd\u697c");
        this.f[0].b(this.f[0].b.length - 1);
        this.f[1] = d2.b("\u674e\u5fc6\u5982");
        this.f[1].b(this.f[1].b.length - 1);
        this.f[2] = d2.b("\u7d2b\u8431");
        this.f[2].b(this.f[2].b.length - 1);
        this.f[3] = d2.b("\u602a\u7269");
        this.f[3].b(this.f[3].b.length - 1);
        this.g = at.a(this.f[3]);
        this.g.b(0);
        int n2 = 0;
        while (n2 < this.e.length) {
            if (this.e[n2] != null) {
                this.e[n2].g();
            }
            ++n2;
        }
        this.a = new at[11];
        this.b = new at[10];
        n2 = 0;
        while (n2 < 10) {
            this.a[n2] = d2.b("\u9ec4\u6570\u5b57" + n2);
            this.b[n2] = d2.b("\u7ea2\u6570\u5b57" + n2);
            ++n2;
        }
        this.a[10] = d2.b("\u9ec4\u6570\u5b57+");
    }

    /*
     * Unable to fully structure code
     */
    public final void a(int var1_1) {
        block80: {
            block86: {
                block85: {
                    block84: {
                        block83: {
                            block82: {
                                block81: {
                                    block79: {
                                        var2_8 = this;
                                        if (var2_8.c != 0) break block79;
                                        var2_9 = var1_1;
                                        var1_2 = this;
                                        switch (var2_9) {
                                            case 4: {
                                                switch (var1_2.h.d()) {
                                                    case 0: {
                                                        if (!var1_2.s.q().z()) {
                                                            var1_2.h.b(1);
                                                            break;
                                                        }
                                                        var1_2.h.b(5);
                                                        break;
                                                    }
                                                    case 1: {
                                                        var1_2.h.b(5);
                                                        break;
                                                    }
                                                    default: {
                                                        if (!var1_2.s.q().z()) {
                                                            var1_2.h.b(3);
                                                            break;
                                                        }
                                                        ** GOTO lbl53
                                                    }
                                                }
                                                break block80;
                                            }
                                            case 2: {
                                                switch (var1_2.h.d()) {
                                                    case 3: {
                                                        var1_2.h.b(5);
                                                        break;
                                                    }
                                                    case 2: 
                                                    case 4: 
                                                    case 5: {
                                                        if (!var1_2.s.q().z()) {
                                                            var1_2.h.b(1);
                                                            break;
                                                        }
                                                        var1_2.h.b(0);
                                                        break;
                                                    }
                                                    case 1: {
                                                        var1_2.h.b(0);
                                                    }
                                                }
                                                break block80;
                                            }
                                            case 8: {
                                                if (var1_2.h.d() != 4) ** GOTO lbl41
                                                var1_2.h.b(5);
                                                break block80;
lbl41:
                                                // 1 sources

                                                if (var1_2.s.q().z()) ** GOTO lbl53
                                                var1_2.h.b(2);
                                                break block80;
                                            }
                                            case 16: {
                                                if (var1_2.h.d() != 2) ** GOTO lbl48
                                                var1_2.h.b(5);
                                                break block80;
lbl48:
                                                // 1 sources

                                                if (var1_2.s.q().z()) ** GOTO lbl53
                                                var1_2.h.b(4);
                                                break block80;
                                            }
                                            case 1: {
                                                var1_2.c(var1_2.h.d() + 1);
                                            }
lbl53:
                                            // 5 sources

                                            default: {
                                                return;
                                            }
                                        }
                                    }
                                    var2_8 = this;
                                    if (var2_8.c != 6) break block81;
                                    var2_10 = var1_1;
                                    var1_3 = this;
                                    switch (var2_10) {
                                        case 2: 
                                        case 16: {
                                            if (var1_3.I != null && var1_3.I.c) {
                                                do {
                                                    var1_3.J = (var1_3.J + var1_3.s.a.length - 1) % var1_3.s.a.length;
                                                } while (var1_3.s.a[var1_3.J] == null || var1_3.b());
                                            } else {
                                                do {
                                                    var1_3.J = (var1_3.J + 1) % var1_3.s.b.length;
                                                } while (var1_3.s.b[var1_3.J] == null || var1_3.s.b[var1_3.J].j());
                                            }
                                            break block80;
                                        }
                                        case 4: 
                                        case 8: {
                                            if (var1_3.I != null && var1_3.I.c) {
                                                do {
                                                    var1_3.J = (var1_3.J + 1) % var1_3.s.a.length;
                                                } while (var1_3.s.a[var1_3.J] == null || var1_3.b());
                                            } else {
                                                do {
                                                    var1_3.J = (var1_3.J + var1_3.s.b.length - 1) % var1_3.s.b.length;
                                                } while (var1_3.s.b[var1_3.J] == null || var1_3.s.b[var1_3.J].j());
                                            }
                                            break block80;
                                        }
                                        case 1: 
                                        case 131072: {
                                            if (var1_3.I != null && var1_3.I.c) {
                                                if (var1_3.s.a[var1_3.J] == null) {
                                                    var1_3.e();
                                                }
                                                var1_3.s.q().a(var1_3.I, var1_3.s.a[var1_3.J]);
                                            } else {
                                                if (var1_3.s.b[var1_3.J] == null) {
                                                    var1_3.e();
                                                }
                                                var1_3.s.q().a(var1_3.I, var1_3.s.b[var1_3.J]);
                                            }
                                            var1_3.s.l();
                                            if (var1_3.s.x() && var1_3.s.y()) {
                                                var1_3.s.b();
                                            }
                                            var1_3.s.b(false);
                                        }
                                        case 262144: {
                                            var1_3.g();
                                        }
                                        default: {
                                            return;
                                        }
                                    }
                                }
                                var2_8 = this;
                                if (var2_8.c != 7) break block82;
                                var2_11 = var1_1;
                                var1_4 = this;
                                switch (var2_11) {
                                    case 2: 
                                    case 16: {
                                        if (var1_4.H == null) ** GOTO lbl135
                                        while (true) {
                                            var1_4.J = (var1_4.J + var1_4.s.a.length - 1) % var1_4.s.a.length;
                                            if (var1_4.s.a[var1_4.J] == null) continue;
                                            if (var1_4.G) ** GOTO lbl135
                                            if (!var1_4.s.a[var1_4.J].j()) break;
                                        }
                                        break block80;
                                    }
                                    case 4: 
                                    case 8: {
                                        if (var1_4.H == null) ** GOTO lbl135
                                        while (true) {
                                            var1_4.J = (var1_4.J + 1) % var1_4.s.a.length;
                                            if (var1_4.s.a[var1_4.J] == null) continue;
                                            if (var1_4.G) ** GOTO lbl135
                                            if (!var1_4.s.a[var1_4.J].j()) break;
                                        }
                                        break block80;
                                    }
                                    case 1: 
                                    case 131072: {
                                        if (var1_4.H != null) {
                                            if (var1_4.s.a[var1_4.J] == null) {
                                                var1_4.e();
                                            }
                                            var1_4.H.a(var1_4.s, var1_4.s.a[var1_4.J]);
                                            var1_4.q.a(var1_4.H, 1);
                                            var1_4.s.a("\u4f7f\u7528\uff1a" + var1_4.H.a);
                                            var1_4.s.q().h();
                                            var1_4.s.l();
                                            var1_4.g();
                                        }
                                        var1_4.s.b(false);
                                    }
                                    case 262144: {
                                        var1_4.g();
                                    }
lbl135:
                                    // 6 sources

                                    default: {
                                        return;
                                    }
                                }
                            }
                            var2_8 = this;
                            if (var2_8.c != 2) break block83;
                            var2_12 = var1_1;
                            var1_5 = this;
                            switch (var2_12) {
                                case 2: {
                                    var1_5.c();
                                    break block80;
                                }
                                case 4: {
                                    var1_5.d();
                                    break block80;
                                }
                                case 1: 
                                case 131072: {
                                    if (var1_5.F == null) break;
                                    var2_12 = Integer.parseInt(var1_5.F);
                                    var2_13 = cn.com.etgame.cls.system.d.U[var2_12];
                                    if (var2_13 == null || var2_13.j <= var1_5.s.q().s()) ** GOTO lbl156
                                    var1_5.s.a("\u6c14\u503c\u4e0d\u8db3");
                                    break block80;
lbl156:
                                    // 1 sources

                                    if (!var1_5.s.x() || !var1_5.s.y()) ** GOTO lbl159
                                    if (!"\u5fc3\u6ce2".equals(var2_13.d)) break block80;
                                    var1_5.s.b();
lbl159:
                                    // 2 sources

                                    if (var2_13 == null) break;
                                    var1_5.I = var2_13;
                                    if (!var2_13.f) ** GOTO lbl166
                                    var1_5.s.q().a(var1_5.I, var1_5.s.b[var1_5.J]);
                                    var1_5.s.l();
                                    var1_5.s.b(false);
                                    ** GOTO lbl170
lbl166:
                                    // 1 sources

                                    var1_5.c(6);
                                    break block80;
                                }
                                case 262144: {
                                    if (var1_5.s.x()) break;
lbl170:
                                    // 2 sources

                                    var1_5.g();
                                }
                            }
                            return;
                        }
                        var2_8 = this;
                        if (var2_8.c != 3) break block84;
                        var2_14 = var1_1;
                        var1_6 = this;
                        switch (var2_14) {
                            case 2: {
                                var1_6.c();
                                break block80;
                            }
                            case 4: {
                                var1_6.d();
                                break block80;
                            }
                            case 8: {
                                var1_6.D = 0;
                                var1_6.B.c();
                                var1_6.B.g();
                                var1_6.E = --var1_6.E < 0 ? var1_6.k.b.length - 1 : var1_6.E;
                                var1_6.f();
                                break block80;
                            }
                            case 16: {
                                var1_6.D = 0;
                                var1_6.B.c();
                                var1_6.B.g();
                                var1_6.E = ++var1_6.E > var1_6.k.b.length - 1 ? 0 : var1_6.E;
                                var1_6.f();
                                break block80;
                            }
                            case 1: 
                            case 131072: {
                                if (var1_6.F == null) ** GOTO lbl220
                                var2_14 = Integer.parseInt(var1_6.F);
                                if (var1_6.s.q().u() < cn.com.etgame.cls.system.d.U[var2_14].k) ** GOTO lbl220
                                var2_14 = Integer.parseInt(var1_6.F);
                                var2_15 = cn.com.etgame.cls.system.d.U[var2_14];
                                v0 = var1_6.G = var2_15 != null && var2_15.d.equals("\u70df\u6c34\u8fd8\u9b42") != false;
                                if (!var1_6.s.x() || !var1_6.s.y()) ** GOTO lbl208
                                if (!"\u708e\u5492".equals(var2_15.d)) break block80;
                                var1_6.s.b();
lbl208:
                                // 2 sources

                                if (var2_15 == null) break;
                                var1_6.I = var2_15;
                                if (!var2_15.f) ** GOTO lbl218
                                if (var1_6.I != null && var1_6.I.c) {
                                    var1_6.s.q().a(var1_6.I, var1_6.s.a[var1_6.J]);
                                } else {
                                    var1_6.s.q().a(var1_6.I, var1_6.s.b[var1_6.J]);
                                }
                                var1_6.s.l();
                                var1_6.s.b(false);
                                ** GOTO lbl228
lbl218:
                                // 1 sources

                                var1_6.c(6);
                                break block80;
lbl220:
                                // 2 sources

                                if (var1_6.F != null) {
                                    var1_6.s.a("\u795e\u503c\u4e0d\u8db3");
                                } else {
                                    if (var1_6.F != null) break;
                                    var1_6.s.a("\u6ca1\u6709\u6280\u80fd");
                                }
                                break block80;
                            }
                            case 262144: {
                                if (var1_6.s.x()) break;
lbl228:
                                // 2 sources

                                var1_6.g();
                            }
                        }
                        return;
                    }
                    var2_8 = this;
                    if (var2_8.c == 4) break block85;
                    var2_8 = this;
                    if (var2_8.c != 1) break block86;
                }
                var2_16 = var1_1;
                var1_7 = this;
                switch (var2_16) {
                    case 2: {
                        var1_7.c();
                        break block80;
                    }
                    case 4: {
                        var1_7.d();
                        break block80;
                    }
                    case 8: {
                        break block80;
                    }
                    case 16: {
                        break block80;
                    }
                    case 1: 
                    case 131072: {
                        var2_17 = var1_7;
                        if (var2_17.c != 4) ** GOTO lbl260
                        var2_17 = var1_7.q.a(var1_7.F);
                        if (var2_17 != null) {
                            var1_7.H = var2_17;
                            var1_7.G = var2_17.a.equals("\u8fd8\u9b42\u9999") != false || var2_17.a.equals("\u4e5d\u8f6c\u4e39") != false;
                            var1_7.c(7);
                        } else {
                            var1_7.s.a("\u6ca1\u6709\u7269\u54c1");
                        }
                        break block80;
lbl260:
                        // 1 sources

                        var2_17 = var1_7;
                        if (var2_17.c != 1) ** GOTO lbl274
                        var2_17 = new i(var1_7.F);
                        if (var1_7.r.g() >= var2_17.b()) {
                            var1_7.q.a((i)var2_17);
                            var1_7.r.h(var1_7.r.g() - var2_17.b());
                            var2_17 = var1_7.s;
                            var1_7.v = "$" + var2_17.a[0].n.g();
                            var1_7.s.a("\u8d2d\u4e70\u6210\u529f");
                        } else {
                            var1_7.s.a("\u91d1\u94b1\u4e0d\u8db3");
                        }
                        break block80;
                    }
                    case 262144: {
                        var1_7.g();
                    }
lbl274:
                    // 3 sources

                    default: {
                        return;
                    }
                }
            }
            if (var1_1 == 262144) {
                this.g();
            }
        }
    }

    private boolean b() {
        if (this.I.a == 9) {
            return false;
        }
        return this.s.a[this.J].j();
    }

    private void c() {
        this.D = 0;
        this.B.c();
        this.B.g();
        if (this.x != null) {
            this.z = (this.z + this.x.length - 1) % this.x.length;
        }
    }

    private void d() {
        this.D = 0;
        this.B.c();
        this.B.g();
        if (this.x != null) {
            this.z = (this.z + 1) % this.x.length;
        }
    }

    public final void a(Graphics graphics) {
        aa aa2;
        block15: {
            block14: {
                aa2 = this;
                if (aa2.c == 0) {
                    Graphics graphics2 = graphics;
                    aa2 = this;
                    aa2.h.a(graphics2, aa2.d, aa2.m / 10, aa2.n / 2, 0, 0, aa2.m, aa2.n, null);
                    if (aa2.s.q().z()) {
                        aa2.i.b(3);
                        aa2.i.a(graphics2, aa2.d, aa2.m / 10, aa2.n / 2, 0, 0, aa2.m, aa2.n, null);
                    }
                    this.a(graphics, 0, this.s.q().d, this.s.q().e - this.s.q().g());
                    return;
                }
                aa2 = this;
                if (aa2.c == 3) {
                    this.a(graphics, null, null, this.x, this.y);
                    this.k.a(graphics, this.d, this.t, this.u, 0, 0, this.m, this.n, null);
                    return;
                }
                aa2 = this;
                if (aa2.c == 2) break block14;
                aa2 = this;
                if (aa2.c == 4) break block14;
                aa2 = this;
                if (aa2.c != 1) break block15;
            }
            this.a(graphics, this.v, this.w, this.x, this.y);
            return;
        }
        aa2 = this;
        if (aa2.c == 6) {
            if (this.I != null && this.I.c) {
                if (this.s.a[this.J] == null) {
                    this.e();
                }
                this.a(graphics, 0, this.s.a[this.J].d, this.s.a[this.J].e - this.s.a[this.J].g());
                return;
            }
            if (this.s.b[this.J] == null) {
                this.e();
            }
            g[] gArray = this.s.b;
            Graphics graphics3 = graphics;
            aa2 = this;
            graphics3.setClip(0, 0, aa2.m, aa2.n);
            int n2 = 0;
            while (n2 < gArray.length) {
                if (gArray[n2] != null && !gArray[n2].j()) {
                    int n3 = gArray[n2].d - 25;
                    int n4 = gArray[n2].e - gArray[n2].g() - 3;
                    graphics3.setColor(0xDBDBAB);
                    graphics3.drawLine(n3, n4 - 1, n3 + 50, n4 - 1);
                    graphics3.drawLine(n3, n4 + 3 + 1, n3 + 50, n4 + 3 + 1);
                    graphics3.drawLine(n3 - 1, n4, n3 - 1, n4 + 3);
                    graphics3.drawLine(n3 + 50 + 1, n4, n3 + 50 + 1, n4 + 3);
                    graphics3.setColor(264);
                    graphics3.drawRect(n3, n4, 50, 3);
                    graphics3.setColor(13902080);
                    graphics3.drawLine(n3 + 1, n4 + 1, n3 - 1 + gArray[n2].w() * 50 / gArray[n2].x(), n4 + 1);
                    graphics3.setColor(7217921);
                    graphics3.drawLine(n3 + 1, n4 + 2, n3 - 1 + gArray[n2].w() * 50 / gArray[n2].x(), n4 + 2);
                }
                ++n2;
            }
            this.a(graphics, 0, this.s.b[this.J].d, this.s.b[this.J].e - this.s.b[this.J].g());
            return;
        }
        aa2 = this;
        if (aa2.c == 7) {
            if (this.s.a[this.J] == null) {
                this.e();
            }
            this.a(graphics, 0, this.s.a[this.J].d, this.s.a[this.J].e - this.s.a[this.J].g());
        }
    }

    private void a(Graphics graphics, String string, String stringArray, String[] stringArray2, String[] stringArray3) {
        int n2;
        y y2 = this.p.f().b().a();
        this.t = this.m - y2.c >> 1;
        this.u = this.n - y2.d >> 1;
        this.p.f().a(graphics, this.p.g(), this.t, this.u, 0, 0, this.m, this.n, null);
        int n3 = this.t + 14;
        int n4 = this.u + 7;
        int n5 = -14 + y2.c;
        int n6 = -14 + y2.d;
        int n7 = this.o >> 1;
        graphics.setFont(ag.b);
        graphics.setClip(n3, n4, n5, n6);
        graphics.setColor(0);
        n6 = n3 + (n5 >> 1) + n7;
        if (string != null) {
            graphics.drawString(string, n6 - this.o, n4, 24);
        }
        if (stringArray != null) {
            graphics.drawString((String)stringArray, n6 + n7, n4, 20);
        }
        if (stringArray2 != null) {
            int n8 = this.z / this.A * this.A;
            n2 = this.o + 1;
            n4 += n2;
            int n9 = n8;
            int n10 = 0;
            while (n9 < n8 + this.A) {
                if (n9 < stringArray2.length) {
                    stringArray = j.a(stringArray2[n9], "|");
                    if (n9 == this.z) {
                        this.F = stringArray[2];
                        graphics.setColor(49617);
                        graphics.fillRect(n3 + 1, n4 + n10 * n2, n5 - 2, this.o);
                    }
                    if (stringArray.length > 1) {
                        graphics.setColor(0);
                        graphics.drawString(stringArray[0], n6 - n7, n4 + n10 * n2, 24);
                        graphics.drawString(stringArray[1], n6 + n7, n4 + n10 * n2, 20);
                    }
                }
                graphics.setColor(5078197);
                graphics.drawLine(n3, n4 + n10 * n2 + this.o, n3 + n5, n4 + n10 * n2 + this.o);
                ++n9;
                ++n10;
            }
            n4 += this.A * n2 - n2;
        } else {
            this.F = null;
        }
        if (stringArray3 != null && stringArray3.length != 0) {
            int n11;
            String[] stringArray4 = j.a(stringArray3[this.z], n5 - this.o, ag.b);
            graphics.setClip(n3, n4 += this.o + 3, n5, this.o);
            n2 = 0;
            while (n2 < stringArray4.length) {
                int n12 = this.D + n4 + n2 * this.o;
                if (n12 > n4 - this.o && n12 < n4 + this.o) {
                    graphics.setColor(0);
                    graphics.drawString(stringArray4[n2], n6, n12, 17);
                }
                ++n2;
            }
            if (this.B.f() == 0L) {
                this.D = 0;
                this.B.c();
                this.B.g();
            } else if (this.B.f() < (this.B.e() << 1) / 3L && (n11 = this.D + n4 - this.o + stringArray4.length * this.o) > n4) {
                this.D -= 2;
            }
        }
        this.j.a(graphics, this.d, this.t, this.u, 0, 0, this.m, this.n, null);
    }

    public final void a(Graphics graphics, int n2, int n3) {
        this.a[10].a(graphics, this.d, n2, n3, 0, 0, this.m, this.n, null);
    }

    public final void a(Graphics graphics, at[] atArray, int n2, int n3, int n4, int n5) {
        cn.com.etgame.cls.system.a.a(graphics, this.d, n2, n3, n4, atArray[3].b().a().c, atArray[3].b().a().d, atArray, n5);
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5) {
        this.p.b(graphics, n2, n3, n4, n5);
    }

    public final void a(Graphics graphics, int n2, int n3, int n4) {
        this.e[n2].a(graphics, this.d, n3, n4, 0, 0, this.m, this.n, null);
    }

    public final void b(Graphics graphics, int n2, int n3) {
        this.e[6].a(graphics, this.d, n2, n3, 0, 0, this.m, this.n, null);
    }

    public final void c(Graphics graphics, int n2, int n3) {
        this.e[13].a(graphics, this.d, n2, n3, 0, 0, this.m, this.n, null);
    }

    public final void d(Graphics graphics, int n2, int n3) {
        this.e[15].a(graphics, this.d, n2, n3, 0, 0, this.m, this.n, null);
    }

    public final void e(Graphics graphics, int n2, int n3) {
        this.e[14].a(graphics, this.d, n2, n3, 0, 0, this.m, this.n, null);
    }

    public final void f(Graphics graphics, int n2, int n3) {
        this.e[16].a(graphics, this.d, n2, n3, 0, 0, this.m, this.n, null);
    }

    public final void a(Graphics graphics, ax[] axArray) {
        this.e[1].a(graphics, this.d, 30, 20, 0, 0, this.m, this.n, null);
        int n2 = 0;
        while (n2 < axArray.length) {
            if (axArray[n2] != null) {
                int n3 = axArray[n2].m() * am.j / 1000;
                if (n2 < 3) {
                    this.b(graphics, 3, n2 + 0, n3 + 30, 21);
                } else if (!axArray[n2].j()) {
                    this.b(graphics, 2, 3, n3 + 30, 21);
                }
            }
            ++n2;
        }
        aa aa2 = this;
        if (aa2.c == 6 && this.I != null && !this.I.c && this.s.b[this.J] != null) {
            int n4 = this.s.b[this.J].m() * am.j / 1000;
            this.g.a(graphics, this.d, n4 + 30, 21, 0, 0, this.m, this.n, null);
        }
        if (this.l >= 0) {
            int n5 = axArray[this.l].m() * am.j / 1000;
            if (n5 > am.k + 15) {
                this.l = -1;
                cn.com.etgame.cls.system.d.a(6, "minHead_selected=" + this.l);
                return;
            }
            if (this.l < 3) {
                this.b(graphics, 3, 0 + this.l, n5 + 30, 21);
                return;
            }
            if (!axArray[this.l].j()) {
                this.b(graphics, 2, 3, n5 + 30, 21);
            }
        }
    }

    private void b(Graphics graphics, int n2, int n3, int n4, int n5) {
        if (this.e[n2] != null) {
            this.e[n2].a(graphics, this.d, n4, 21, 0, 0, this.m, this.n, null);
        }
        if (this.f[n3] != null) {
            this.f[n3].a(graphics, this.d, n4, 21, 0, 0, this.m, this.n, null);
        }
    }

    public final boolean a(Graphics graphics, String string) {
        if (string != null && this.C.i()) {
            this.C.c();
            this.C.g();
        } else if (string == null || this.C.f() == 0L) {
            this.C.h();
            return true;
        }
        this.p.a(graphics, string, this.m >> 1, this.n / 3, ag.b, 17);
        return false;
    }

    public final void a() {
        int n2 = 0;
        while (n2 < this.e.length) {
            if (this.e[n2] != null) {
                this.e[n2].a();
            }
            ++n2;
        }
        n2 = 0;
        while (n2 < this.f.length) {
            if (this.f[n2] != null) {
                this.f[n2].a();
            }
            ++n2;
        }
    }

    public final void b(int n2) {
        this.l = n2;
        this.f[n2].b(0);
        this.f[n2].a(1);
        this.f[n2].a(this);
        this.f[n2].g();
    }

    private void c(int n2) {
        this.s.h();
        String string = "";
        switch (n2) {
            case 3: {
                this.j.b(0);
                this.E = 0;
                this.f();
                break;
            }
            case 6: {
                if (this.c != 0) break;
                int n3 = 0;
                this.I = cn.com.etgame.cls.system.d.U[n3];
                break;
            }
            case 7: {
                this.I = null;
                break;
            }
            case 5: {
                this.s.f();
                this.h.b(5);
                this.c = 0;
                this.s.b(false);
                return;
            }
            case 4: {
                this.j.b(3);
                this.v = "\u7269\u54c1";
                this.w = "\u6570\u91cf";
                f f2 = this.s;
                Vector vector = f2.a[0].k.a(0);
                this.y = new String[vector.size()];
                int n4 = 0;
                while (n4 < vector.size()) {
                    i i2 = (i)vector.elementAt(n4);
                    string = String.valueOf(string) + i2.a + "|" + i2.d() + "|" + i2.a + "\n";
                    this.y[n4] = i2.c();
                    ++n4;
                }
                this.x = j.a(string, "\n");
                break;
            }
            case 1: {
                String[][] stringArray = this.s;
                this.v = "$" + this.s.a[0].n.g();
                this.w = "\u4ef7\u683c";
                stringArray = cn.com.etgame.cls.system.d.R;
                this.y = new String[stringArray.length];
                int n5 = 0;
                while (n5 < stringArray.length) {
                    string = String.valueOf(string) + stringArray[n5][0] + "|" + stringArray[n5][1] + "|" + stringArray[n5][0] + "\n";
                    this.y[n5] = stringArray[n5][2];
                    ++n5;
                }
                this.x = j.a(string, "\n");
                this.j.b(2);
                break;
            }
            case 2: {
                this.j.b(1);
                this.B.g();
                this.v = "\u6280\u80fd";
                this.w = "\u6d88\u8017";
                string = "";
                int[][] nArray = this.s.q().t;
                int n6 = 0;
                int n7 = 0;
                while (n7 < nArray.length) {
                    if (nArray[n7][1] == 1) {
                        ++n6;
                    }
                    ++n7;
                }
                this.y = new String[n6];
                n6 = 0;
                int n8 = 0;
                while (n6 < nArray.length) {
                    if (nArray[n6][1] == 1) {
                        int n9 = nArray[n6][0];
                        af af2 = cn.com.etgame.cls.system.d.U[n9];
                        string = String.valueOf(string) + af2.d + "|" + (af2.j > 0 ? String.valueOf(af2.j) + "\u6c14" : "\u4e0d\u6d88\u8017") + "|" + af2.a + "\n";
                        this.y[n8] = af2.l;
                        ++n8;
                    }
                    ++n6;
                }
                this.x = j.a(string, "\n");
            }
        }
        this.e();
        this.c = n2;
    }

    /*
     * Unable to fully structure code
     */
    private void e() {
        block6: {
            block5: {
                var1_1 = 0;
                if (this.H == null) break block5;
                block0: while (this.s.a[this.J] == null) {
                    while (true) {
                        this.J = (this.J + 1) % this.s.a.length;
                        if (++var1_1 <= this.s.a.length) continue block0;
                        ag.a().a(new Throwable(), "\u7269\u54c1\u4f7f\u7528 \u76ee\u6807\u5237\u65b0\u9519\u8bef d=" + var1_1, 1);
                        return;
                    }
                }
                if (!this.G) {
                    if (this.s.a[this.J].j()) ** continue;
                    return;
                }
                break block6;
            }
            if (this.I == null || !this.I.c) ** GOTO lbl25
            while (this.s.a[this.J] == null || this.b()) {
                this.J = (this.J + 1) % this.s.a.length;
                if (++var1_1 <= this.s.a.length) continue;
                ag.a().a(new Throwable(), "\u589e\u76ca\u6280\u80fd \u76ee\u6807\u5237\u65b0\u9519\u8bef d=" + var1_1, 1);
                return;
            }
            return;
lbl-1000:
            // 1 sources

            {
                this.J = (this.J + 1) % this.s.b.length;
                if (++var1_1 <= this.s.b.length) continue;
                ag.a().a(new Throwable(), "\u653b\u51fb\u6280\u80fd \u76ee\u6807\u5237\u65b0\u9519\u8bef d=" + var1_1, 1);
                return;
lbl25:
                // 2 sources

                ** while (this.s.b[this.J] == null)
            }
        }
    }

    private void f() {
        this.k.b(this.E);
        this.B.c();
        this.B.g();
        String string = "";
        this.z = 0;
        int[][] nArray = this.s.q().u;
        int n2 = this.E + 1;
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        while (n5 < nArray.length) {
            if (nArray[n5][2] == 1 && nArray[n5][0] == n2) {
                if (n3 == 0) {
                    n4 = n5;
                }
                ++n3;
            }
            ++n5;
        }
        af[] afArray = n3 > 0 ? new af[n3] : null;
        n5 = n4;
        n4 = 0;
        while (n4 < n3 && n5 < nArray.length) {
            if (nArray[n5][2] == 1 && nArray[n5][0] == n2) {
                int n6 = nArray[n5][1];
                afArray[n4] = cn.com.etgame.cls.system.d.U[n6];
                ++n4;
            }
            ++n5;
        }
        af[] afArray2 = afArray;
        if (afArray != null) {
            this.y = new String[afArray2.length];
            int n7 = 0;
            while (n7 < afArray2.length) {
                string = String.valueOf(string) + afArray2[n7].d + "|" + (afArray2[n7].k > 0 ? String.valueOf(afArray2[n7].k) + "\u795e" : "\u4e0d\u6d88\u8017") + "|" + afArray2[n7].a + "\n";
                this.y[n7] = "\uff08" + this.s.q().a(afArray2[n7].a) + "\u7ea7\uff09" + afArray2[n7].l;
                ++n7;
            }
            this.x = j.a(string, "\n");
            return;
        }
        this.x = null;
        this.y = null;
    }

    private void g() {
        this.D = 0;
        this.z = 0;
        this.c(0);
        this.h.b(5);
        this.F = null;
        this.G = false;
        this.H = null;
        this.I = null;
    }

    public final void a(long l2) {
        this.C.a(l2);
    }

    public final void a(Graphics graphics, Image image, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        ag.a(graphics, image, n2, n3, n4, n5, 1, 0, 0, n6, n7, n8);
    }

    public final void a(at at2) {
    }

    public final void b(at at2) {
        if (at2 != null) {
            at2.b(at2.b.length - 1);
        }
    }
}

