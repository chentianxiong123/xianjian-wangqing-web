/*
 * Decompiled with CFR 0.152.
 */
package cn.com.etgame.cls.system;

import cn.com.etgame.cls.system.e;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class a {
    private int a;
    private int b;
    private Image[] c;
    private d d;
    private at[] e;
    private at[] f;
    private at[] g;
    private bj[] h;
    private int[][] i;
    private at j;
    private at[] k;
    private at[] l;
    private at[] m;
    private at[] n;
    private at o;
    private e p;
    private at q;
    private bh[][] r;
    private int s = 0;
    private String t;
    private int u;
    private int v;
    private bk w;
    private String x;

    public a(Image[] imageArray, d d2) {
        this.c = imageArray;
        this.d = d2;
        this.w = new bk(1000L);
        this.q = d2.b("\u7bad\u5934");
        this.m = new at[8];
        this.m[0] = d2.b("xin");
        this.m[1] = d2.b("jingya");
        this.m[2] = d2.b("yihuo");
        this.m[3] = d2.b("tanhao_huang");
        this.m[4] = d2.b("tanhao_hong");
        this.m[5] = d2.b("wenhao_huang");
        this.m[6] = d2.b("webhao_hong");
        this.m[7] = d2.b("duihua");
        this.n = new at[2];
        this.n[0] = d2.b("\u8fdb\u5ea6\u67611");
        this.n[1] = d2.b("\u8fdb\u5ea6\u67612");
        this.e = new at[9];
        this.e[0] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u5de6\u4e0a");
        this.e[1] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u53f3\u4e0a");
        this.e[2] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u5de6\u4e0b");
        this.e[3] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u53f3\u4e0b");
        this.e[4] = d2.b("\u6846\u4e0a");
        this.e[5] = d2.b("\u6846\u4e0b");
        this.e[6] = d2.b("\u6846\u5de6");
        this.e[7] = d2.b("\u6846\u53f3");
        this.e[8] = d2.b("\u6846\u5e95");
        this.g = new at[4];
        this.g[0] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u5de6\u4e0a");
        this.g[1] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u53f3\u4e0a");
        this.g[2] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u5de6\u4e0b");
        this.g[3] = d2.b("\u5bf9\u8bdd\u6846\u8fb9\u89d2\u53f3\u4e0b");
        this.f = new at[5];
        this.f[0] = d2.b("\u5934\u50cf");
        this.f[1] = d2.b("\u8840");
        this.f[2] = d2.b("\u795e");
        this.f[3] = d2.b("\u6c14");
        this.f[4] = d2.b("\u9009\u4e2d\u5934\u50cf");
        this.j = d2.b("\u6218\u6597\u7ed3\u7b97");
        this.o = d2.b("\u80cc\u666f");
        this.h = new bj[3];
        this.k = new at[11];
        this.l = new at[10];
        int n2 = 0;
        while (n2 < 10) {
            this.k[n2] = d2.b("\u6570\u5b57\u767d" + n2);
            this.l[n2] = d2.b("\u6570\u5b57\u84dd" + n2);
            ++n2;
        }
        this.k[10] = d2.b("\u659c\u6760");
        this.p = new e();
        this.q.g();
        n2 = 0;
        while (n2 < this.m.length) {
            this.m[n2].g();
            ++n2;
        }
    }

    public final void a(boolean bl2, int n2, aw aw2) {
        int n3 = 0;
        switch (n2) {
            case 4: {
                n3 = 2;
                break;
            }
            case 8: {
                n3 = 3;
                break;
            }
            case 1: {
                n3 = 1;
                break;
            }
            case 2: {
                n3 = 0;
            }
        }
        cn.com.etgame.cls.system.d.a(2, "**********************\u4eba\u7269\u65b9\u5411\uff1a" + n2 + " \u5207\u6362\u65b9\u5411\uff1a" + n3);
        this.p.a(bl2, n3);
        aw aw3 = aw2;
        e e2 = this.p;
        this.p.a = aw3;
    }

    public final void a() {
        Object var2_1 = null;
        e e2 = this.p;
        this.p.a = var2_1;
    }

    public final boolean b() {
        return this.p.b();
    }

    public final void a(int n2, int n3) {
        this.a = n2;
        this.b = n3;
    }

    public final void c() {
        int n2 = 0;
        while (n2 < this.m.length) {
            this.m[n2].a();
            ++n2;
        }
        this.q.a();
        a a2 = this;
        a2.p.a();
    }

    public final void d() {
        this.p.a();
    }

    public final void a(Graphics graphics) {
        this.p.a(graphics);
    }

    public final void a(Graphics graphics, int n2, int n3) {
        y y2 = this.q.b().a();
        this.q.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, y2.c, y2.d, null);
    }

    public final void a(Graphics graphics, String string, int n2, int n3, int n4, int n5, int n6, int n7) {
        this.d.b(string).a(graphics, this.c, n2, n3, n4, n5, n6, n7, null);
    }

    private void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, boolean bl2) {
        int n7 = n2 + n4;
        int n8 = n3 + n5;
        y y2 = this.e[4].b().a();
        int n9 = 0;
        int n10 = n4 / y2.c + (n4 % y2.c == 0 ? 0 : 1);
        while (n9 < n10) {
            this.e[4].a(graphics, this.c, n2 + n9 * y2.c, n3, n2, n3, n4, n5, null);
            ++n9;
        }
        y2 = this.e[5].b().a();
        n9 = 0;
        n10 = n4 / y2.c + (n4 % y2.c == 0 ? 0 : 1);
        while (n9 < n10) {
            this.e[5].a(graphics, this.c, n2 + n9 * y2.c, n8, n2, n3, n4, n5 + 1, null);
            ++n9;
        }
        if (n6 == 0 || n6 == 2) {
            y2 = this.e[6].b().a();
            n9 = 0;
            n10 = n5 / y2.d + (n5 % y2.d == 0 ? 0 : 1);
            while (n9 < n10) {
                this.e[6].a(graphics, this.c, n2, n3 + n9 * y2.d, n2, n3, n4, n5, null);
                ++n9;
            }
        }
        if (n6 == 0 || n6 == 1) {
            y2 = this.e[7].b().a();
            n9 = 0;
            n10 = n5 / y2.d + (n5 % y2.d == 0 ? 0 : 1);
            while (n9 < n10) {
                this.e[7].a(graphics, this.c, n7, n3 + n9 * y2.d, n2, n3, n4 + 1, n5, null);
                ++n9;
            }
        }
        if (bl2) {
            if (n6 == 0 || n6 == 2) {
                y2 = this.g[0].b().a();
                y2.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
                y2 = this.g[2].b().a();
                y2.a(graphics, this.c, n2, n8, n2 + y2.a, n8 + y2.b, y2.c, y2.d, null, null);
            }
            if (n6 == 0 || n6 == 1) {
                y2 = this.g[1].b().a();
                y2.a(graphics, this.c, n7, n3, n7 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
                y2 = this.g[3].b().a();
                y2.a(graphics, this.c, n7, n8, n7 + y2.a, n8 + y2.b, y2.c, y2.d, null, null);
                return;
            }
        } else {
            if (n6 == 0 || n6 == 2) {
                y2 = this.e[0].b().a();
                y2.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
                y2 = this.e[2].b().a();
                y2.a(graphics, this.c, n2, n8, n2 + y2.a, n8 + y2.b, y2.c, y2.d, null, null);
            }
            if (n6 == 0 || n6 == 1) {
                y2 = this.e[1].b().a();
                y2.a(graphics, this.c, n7, n3, n7 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
                y2 = this.e[3].b().a();
                y2.a(graphics, this.c, n7, n8, n7 + y2.a, n8 + y2.b, y2.c, y2.d, null, null);
            }
        }
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5) {
        y y2 = this.e[8].b().a();
        int n6 = 0;
        int n7 = n5 / y2.d + (n5 % y2.d == 0 ? 0 : 1);
        while (n6 < n7) {
            int n8 = 0;
            int n9 = n4 / y2.c + (n4 % y2.c == 0 ? 0 : 1);
            while (n8 < n9) {
                this.e[8].a(graphics, this.c, n2 + n8 * y2.c, n3 + n6 * y2.d, n2, n3, n4, n5, null);
                ++n8;
            }
            ++n6;
        }
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, boolean bl2) {
        this.a(graphics, n2, n3, n4, n5);
        this.a(graphics, n2, n3, n4, n5, 0, false);
    }

    public final void a(Graphics graphics, String string) {
        this.a(graphics, string, this.a, this.b, ag.b, 3);
    }

    public final void a(Graphics graphics, String string, int n2, int n3, Font font, int n4) {
        int n5 = font.stringWidth(string) + (cn.com.etgame.cls.system.d.f << 1);
        int n6 = font.getHeight() + (cn.com.etgame.cls.system.d.e << 1);
        this.a(graphics, n2 -= (n4 & 8) != 0 ? n5 : ((n4 & 1) != 0 ? n5 >> 1 : 0), n3 -= (n4 & 0x20) != 0 ? n6 : ((n4 & 2) != 0 ? n6 >> 1 : 0), n5, n6, false);
        graphics.setClip(n2, n3, n5, n6);
        graphics.setColor(0xFFFF00);
        graphics.setFont(font);
        ag.b(graphics, 0, string, n2 + cn.com.etgame.cls.system.d.f, n3 + cn.com.etgame.cls.system.d.e, 20);
    }

    public final void a(int n2, String string, long l2) {
        this.u = n2;
        this.v = 80;
        this.x = string;
        this.w.a(l2);
        this.w.c();
        this.w.g();
    }

    public final void a(Graphics graphics, int n2, int n3, Font font, int n4) {
        if (this.x != null && this.w.f() != 0L) {
            n4 = ag.a().c;
            int n5 = font.getHeight() + (cn.com.etgame.cls.system.d.e << 1);
            n2 -= n4 >> 1;
            n3 -= n5 >> 1;
            if (this.u > 0) {
                this.u -= this.v;
                this.v += this.v;
            } else {
                this.u = 0;
            }
            if (this.u <= 0) {
                this.a(graphics, n2, n3, n4, n5);
                this.a(graphics, n2, n3, n4, n5, 0, false);
                graphics.setClip(n2, n3, n4, n5);
                graphics.setColor(0xFFFF00);
                graphics.setFont(font);
                ag.b(graphics, 0, this.x, n4 >> 1, n3 + cn.com.etgame.cls.system.d.e, 17);
                return;
            }
            int n6 = n4 - this.u >> 1;
            n4 = n2 + n6 + this.u;
            graphics.setClip(n2, n3, n6, n5);
            this.a(graphics, n2, n3, n6, n5);
            this.a(graphics, n2, n3, n6, n5, 2, false);
            graphics.setClip(n4, n3, n6, n5);
            this.a(graphics, n4, n3, n6, n5);
            this.a(graphics, n4, n3, n6, n5, 1, false);
        }
    }

    public final int e() {
        return this.j.b().a().d;
    }

    public final void b(Graphics graphics, int n2, int n3) {
        int n4 = 0;
        while (n4 < this.h.length) {
            if (this.h[n4] != null && this.h[n4].I()) {
                this.j.b(n4);
                y y2 = this.j.b().a();
                n3 = 2 + n4 * y2.c;
                y2.a(graphics, this.c, n3, 50, n3 + y2.a, 50 + y2.b, y2.c, y2.d, null, null);
                this.b(graphics, this.h[n4].e(), n3 + 50, 112, 40);
                this.b(graphics, this.h[n4].x(), n3 + 38, 135, 36);
                this.b(graphics, this.h[n4].y(), n3 + 38, 151, 36);
                this.b(graphics, this.h[n4].A(), n3 + 38, 166, 36);
                this.b(graphics, this.h[n4].z(), n3 + 38, 183, 36);
                if (n4 != 0) {
                    this.b(graphics, this.h[n4].k(), n3 + 46, 202, 36);
                }
                this.b(graphics, this.h[n4].f(), n3 + 47, 217, 36);
                this.b(graphics, this.h[n4].h(), n3 + 47, 233, 36);
            }
            ++n4;
        }
    }

    public final boolean a(Graphics graphics, int n2, int n3, aa aa2, boolean bl2) {
        int n4;
        int n5 = this.j.b().a().c;
        int n6 = 0;
        while (n6 < this.h.length) {
            if (this.h[n6] != null && this.h[n6].I()) {
                n4 = 2 + n5 * n6;
                this.j.b(n6);
                y y2 = this.j.b().a();
                y2.a(graphics, this.c, n4, n3, n4 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
            }
            ++n6;
        }
        graphics.setClip(2, n3, n5 * 3, this.j.b().a().d);
        n6 = 0;
        while (n6 < this.h.length) {
            if (this.h[n6] != null && this.h[n6].I()) {
                n4 = 2 + n5 * n6;
                bh bh2 = bl2 ? this.r[n6][Math.min(this.s, 7)] : null;
                if (bh2 != null && 1 == this.s && !bh2.a()) {
                    bh2.a(n4 + 50, n3 + 62);
                } else {
                    this.b(graphics, this.s <= 0 ? this.i[n6][0] : this.h[n6].e(), n4 + 50, n3 + 62, 40);
                }
                if (bh2 != null && 2 == this.s && !bh2.a()) {
                    bh2.a(n4 + 38, n3 + 85);
                } else {
                    this.b(graphics, this.s < 2 ? this.i[n6][1] : this.h[n6].x(), n4 + 38, n3 + 85, 36);
                }
                if (bh2 != null && 3 == this.s && !bh2.a()) {
                    bh2.a(n4 + 38, n3 + 101);
                } else {
                    this.b(graphics, this.s < 3 ? this.i[n6][2] : this.h[n6].y(), n4 + 38, n3 + 101, 36);
                }
                if (bh2 != null && 4 == this.s && !bh2.a()) {
                    bh2.a(n4 + 38, n3 + 116);
                } else {
                    this.b(graphics, this.s < 4 ? this.i[n6][3] : this.h[n6].A(), n4 + 38, n3 + 116, 36);
                }
                if (bh2 != null && 5 == this.s && !bh2.a()) {
                    bh2.a(n4 + 38, n3 + 133);
                } else {
                    this.b(graphics, this.s < 5 ? this.i[n6][4] : this.h[n6].z(), n4 + 38, n3 + 133, 36);
                }
                if (n6 != 0) {
                    if (bh2 != null && 6 == this.s && !bh2.a()) {
                        bh2.a(n4 + 46, n3 + 152);
                    } else {
                        this.b(graphics, this.s < 6 ? this.i[n6][5] : this.h[n6].k(), n4 + 46, n3 + 152, 36);
                    }
                }
                if (bh2 != null && this.s == 0 && !bh2.a()) {
                    bh2.a(n4 + 47, n3 + 167);
                } else {
                    this.b(graphics, this.s <= 0 ? this.i[n6][6] : this.h[n6].f(), n4 + 47, n3 + 167, 36);
                }
                if (bh2 != null && 7 == this.s && !bh2.a()) {
                    bh2.a(n4 + 53, n3 + 183);
                } else {
                    this.b(graphics, this.s < 7 ? this.i[n6][7] : this.h[n6].h(), n4 + 47, n3 + 183, 36);
                }
                if (bl2) {
                    if (bh2 != null && !bh2.a()) {
                        bh2.a(graphics, aa2);
                    }
                    if (this.r[0][Math.min(this.s, 7)] != null && this.r[0][Math.min(this.s, 7)].a() && (this.r[1][0] == null || this.r[1][Math.min(this.s, 7)].a()) && (this.r[2][0] == null || this.r[2][Math.min(this.s, 7)].a())) {
                        ++this.s;
                    }
                }
            }
            ++n6;
        }
        return this.r != null && this.s > 7;
    }

    public final void a(bj[] bjArray, boolean bl2) {
        this.r = bl2 ? new bh[3][8] : null;
        this.s = 0;
        int n2 = 0;
        while (n2 < bjArray.length) {
            if (bjArray[n2].I()) {
                if (bjArray[n2].a.equals("\u91cd\u697c")) {
                    this.h[0] = bjArray[n2];
                    if (bl2) {
                        this.r[0][0] = this.i[0][6] < bjArray[n2].f() ? new bh(this.i[0][6], bjArray[n2].f(), 24, 0, 6, 36) : new bh(bjArray[n2].f(), 6, 36);
                        this.r[0][1] = this.i[0][0] < bjArray[n2].e() ? new bh(this.i[0][0], bjArray[n2].e(), 1, 1, 0, 17) : new bh(bjArray[n2].e(), 0, 17);
                        this.r[0][2] = this.i[0][1] < bjArray[n2].x() ? new bh(this.i[0][1], bjArray[n2].x(), 4, 1, 1, 17) : new bh(bjArray[n2].x(), 1, 17);
                        this.r[0][3] = this.i[0][2] < bjArray[n2].y() ? new bh(this.i[0][2], bjArray[n2].y(), 1, 1, 2, 17) : new bh(bjArray[n2].y(), 2, 17);
                        this.r[0][4] = this.i[0][3] < bjArray[n2].A() ? new bh(this.i[0][3], bjArray[n2].A(), 1, 1, 3, 17) : new bh(bjArray[n2].A(), 3, 17);
                        this.r[0][5] = this.i[0][4] < bjArray[n2].z() ? new bh(this.i[0][4], bjArray[n2].z(), 1, 1, 4, 17) : new bh(bjArray[n2].z(), 4, 17);
                        this.r[0][6] = new bh(0, 5, 17);
                        this.r[0][7] = this.i[0][7] < bjArray[n2].h() ? new bh(this.i[0][7], bjArray[n2].h(), 24, 1, 7, 17) : new bh(bjArray[n2].h(), 7, 17);
                    }
                } else if (bjArray[n2].a.equals("\u6708\u7476")) {
                    this.h[1] = bjArray[n2];
                    if (bl2) {
                        this.r[1][0] = this.i[1][6] < bjArray[n2].f() ? new bh(this.i[1][6], bjArray[n2].f(), 24, 0, 6, 36) : new bh(bjArray[n2].f(), 6, 36);
                        this.r[1][1] = this.i[1][0] < bjArray[n2].e() ? new bh(this.i[1][0], bjArray[n2].e(), 1, 1, 0, 17) : new bh(bjArray[n2].e(), 0, 17);
                        this.r[1][2] = this.i[1][1] < bjArray[n2].x() ? new bh(this.i[1][1], bjArray[n2].x(), 4, 1, 1, 17) : new bh(bjArray[n2].x(), 1, 17);
                        this.r[1][3] = this.i[1][2] < bjArray[n2].y() ? new bh(this.i[1][2], bjArray[n2].y(), 1, 1, 2, 17) : new bh(bjArray[n2].y(), 2, 17);
                        this.r[1][4] = this.i[1][3] < bjArray[n2].A() ? new bh(this.i[1][3], bjArray[n2].A(), 1, 1, 3, 17) : new bh(bjArray[n2].A(), 3, 17);
                        this.r[1][5] = this.i[1][4] < bjArray[n2].z() ? new bh(this.i[1][4], bjArray[n2].z(), 1, 1, 4, 17) : new bh(bjArray[n2].z(), 4, 17);
                        this.r[1][6] = this.i[1][5] < bjArray[n2].k() ? new bh(this.i[1][5], bjArray[n2].k(), 1, 1, 5, 17) : (this.i[1][5] > bjArray[n2].k() ? new bh(this.i[1][5], bjArray[n2].k(), -1, 1, 5, 17) : new bh(bjArray[n2].k(), 5, 17));
                        this.r[1][7] = this.i[1][7] < bjArray[n2].h() ? new bh(this.i[1][7], bjArray[n2].h(), 24, 1, 7, 17) : new bh(bjArray[n2].h(), 7, 17);
                    }
                } else if (bjArray[n2].a.equals("\u7d2b\u8431")) {
                    this.h[2] = bjArray[n2];
                    if (bl2) {
                        this.r[2][0] = this.i[2][6] < bjArray[n2].f() ? new bh(this.i[2][6], bjArray[n2].f(), 24, 0, 6, 36) : new bh(bjArray[n2].f(), 6, 36);
                        this.r[2][1] = this.i[2][0] < bjArray[n2].e() ? new bh(this.i[2][0], bjArray[n2].e(), 1, 1, 0, 17) : new bh(bjArray[n2].e(), 0, 17);
                        this.r[2][2] = this.i[2][1] < bjArray[n2].x() ? new bh(this.i[2][1], bjArray[n2].x(), 4, 1, 1, 17) : new bh(bjArray[n2].x(), 1, 17);
                        this.r[2][3] = this.i[2][2] < bjArray[n2].y() ? new bh(this.i[2][2], bjArray[n2].y(), 1, 1, 2, 17) : new bh(bjArray[n2].y(), 2, 17);
                        this.r[2][4] = this.i[2][3] < bjArray[n2].A() ? new bh(this.i[2][3], bjArray[n2].A(), 1, 1, 3, 17) : new bh(bjArray[n2].A(), 3, 17);
                        this.r[2][5] = this.i[2][4] < bjArray[n2].z() ? new bh(this.i[2][4], bjArray[n2].z(), 1, 1, 4, 17) : new bh(bjArray[n2].z(), 4, 17);
                        this.r[2][6] = this.i[2][5] < bjArray[n2].k() ? new bh(this.i[2][5], bjArray[n2].k(), 1, 1, 5, 17) : (this.i[2][5] > bjArray[n2].k() ? new bh(this.i[2][5], bjArray[n2].k(), -1, 1, 5, 17) : new bh(bjArray[n2].k(), 5, 17));
                        this.r[2][7] = this.i[2][7] < bjArray[n2].h() ? new bh(this.i[2][7], bjArray[n2].h(), 24, 1, 7, 17) : new bh(bjArray[n2].h(), 7, 17);
                    }
                }
            }
            ++n2;
        }
    }

    public final void a(bj[] bjArray) {
        this.i = new int[3][8];
        int n2 = 0;
        while (n2 < bjArray.length) {
            if (bjArray[n2] != null && bjArray[n2].I()) {
                if (bjArray[n2].a.equals("\u91cd\u697c")) {
                    this.i[0][0] = bjArray[n2].e();
                    this.i[0][1] = bjArray[n2].x();
                    this.i[0][2] = bjArray[n2].y();
                    this.i[0][3] = bjArray[n2].A();
                    this.i[0][4] = bjArray[n2].z();
                    this.i[0][5] = 0;
                    this.i[0][6] = bjArray[n2].f();
                    this.i[0][7] = bjArray[n2].h();
                } else if (bjArray[n2].a.equals("\u6708\u7476")) {
                    this.i[1][0] = bjArray[n2].e();
                    this.i[1][1] = bjArray[n2].x();
                    this.i[1][2] = bjArray[n2].y();
                    this.i[1][3] = bjArray[n2].A();
                    this.i[1][4] = bjArray[n2].z();
                    this.i[1][5] = bjArray[n2].k();
                    this.i[1][6] = bjArray[n2].f();
                    this.i[1][7] = bjArray[n2].h();
                } else if (bjArray[n2].a.equals("\u7d2b\u8431")) {
                    this.i[2][0] = bjArray[n2].e();
                    this.i[2][1] = bjArray[n2].x();
                    this.i[2][2] = bjArray[n2].y();
                    this.i[2][3] = bjArray[n2].A();
                    this.i[2][4] = bjArray[n2].z();
                    this.i[2][5] = bjArray[n2].k();
                    this.i[2][6] = bjArray[n2].f();
                    this.i[2][7] = bjArray[n2].h();
                }
            }
            ++n2;
        }
    }

    public final at f() {
        return this.o;
    }

    public final Image[] g() {
        return this.c;
    }

    public final at a(String string) {
        return this.d.b(string);
    }

    public final void b(Graphics graphics, int n2, int n3, int n4, int n5) {
        cn.com.etgame.cls.system.a.a(graphics, this.c, n2, n3, n4, this.l[3].b().a().c + 1, this.l[3].b().a().d, this.l, n5);
    }

    public static int a(Graphics graphics, Image[] imageArray, int n2, int n3, int n4, int n5, int n6, at[] atArray, int n7) {
        int n8 = 1;
        int n9 = j.a((long)n2);
        boolean bl2 = false;
        n3 -= (n7 & 8) != 0 ? n9 * n5 : ((n7 & 1) != 0 ? n9 * n5 >> 1 : 0);
        n4 -= (n7 & 0x20) != 0 ? n6 : ((n7 & 2) != 0 ? n6 >> 1 : 0);
        n7 = 0;
        while (n7 < n9) {
            n8 *= 10;
            ++n7;
        }
        n7 = n8;
        while (n7 > 0) {
            n6 = n2 % (n7 * 10) / n7;
            if (n6 > 0 || bl2 || n7 == 1) {
                bl2 = true;
                y y2 = atArray[n6].b().a();
                y2.a(graphics, imageArray, n3, n4, n3 + y2.a, n4 + y2.b, y2.c, y2.d, null, null);
                n3 += n5;
            }
            n7 /= 10;
        }
        return n3;
    }

    private static void a(Graphics graphics, at[] atArray, Image[] imageArray, int n2, int n3, int n4, int n5) {
        y y2 = atArray[3].b().a();
        int n6 = y2.c;
        int n7 = y2.d;
        n4 = cn.com.etgame.cls.system.a.a(graphics, imageArray, n2 < 9999 ? n2 : 9999, n4, n5, n6, n7, atArray, 20);
        if (n3 > 0) {
            if (atArray[10] != null) {
                y2 = atArray[10].b().a();
                y2.a(graphics, imageArray, n4, n5, n4 + y2.a, n5 + y2.b, y2.c, y2.d, null, null);
            }
            cn.com.etgame.cls.system.a.a(graphics, imageArray, n3 < 9999 ? n3 : 9999, n4 += n6, n5, n6, n7, atArray, 20);
        }
    }

    public final void a(Graphics graphics, bd[] bdArray, int n2, int n3) {
        y y2 = this.f[0].b().a();
        int n4 = y2.c;
        int n5 = y2.d;
        int n6 = (n4 >> 1) - 10;
        int n7 = 0;
        while (n7 < bdArray.length) {
            if (bdArray[n7] != null) {
                this.f[0].b(n7);
                y2 = this.f[0].b().a();
                y2.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
                y2 = this.f[1].b().a();
                int n8 = y2.c * bdArray[n7].w() / bdArray[n7].x();
                y2.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, bdArray[n7].w() > 0 && n8 <= 0 ? 1 : (n8 < 0 ? 0 : n8), y2.d, null, null);
                cn.com.etgame.cls.system.a.a(graphics, this.k, this.c, bdArray[n7].w(), bdArray[n7].x(), n2 + n6, n3 - n5 * 3 / 4);
                y2 = this.f[3].b().a();
                n8 = y2.c * bdArray[n7].s() / bdArray[n7].t();
                y2.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, n8, y2.d, null, null);
                cn.com.etgame.cls.system.a.a(graphics, this.k, this.c, bdArray[n7].s(), bdArray[n7].t(), n2 + n6, n3 - (n5 << 1) / 4);
                y2 = this.f[2].b().a();
                n8 = y2.c * bdArray[n7].u() / bdArray[n7].v();
                y2.a(graphics, this.c, n2, n3, n2 + y2.a, n3 + y2.b, n8, y2.d, null, null);
                cn.com.etgame.cls.system.a.a(graphics, this.k, this.c, bdArray[n7].u(), bdArray[n7].v(), n2 + n6, n3 - n5 / 4);
            }
            n2 += n4;
            ++n7;
        }
    }

    public final void a(Graphics graphics, bj[] bjArray, int n2, int n3, int n4) {
        y y2 = this.f[0].b().a();
        int n5 = y2.c;
        int n6 = y2.d;
        n3 += n6;
        int n7 = (n5 >> 1) - 10;
        int n8 = 0;
        while (n8 < bjArray.length) {
            if (bjArray[n8] != null && bjArray[n8].I()) {
                int n9;
                if (n8 == n4) {
                    this.f[4].b(n8);
                    y2 = this.f[4].b().a();
                    n9 = n3 - 3;
                } else {
                    this.f[0].b(n8);
                    y2 = this.f[0].b().a();
                    n9 = n3;
                }
                y2.a(graphics, this.c, n2, n9, n2 + y2.a, n9 + y2.b, y2.c, y2.d, null, null);
                y2 = this.f[1].b().a();
                int n10 = y2.c * bjArray[n8].j() / bjArray[n8].w();
                y2.a(graphics, this.c, n2, n9, n2 + y2.a, n9 + y2.b, bjArray[n8].j() > 0 && n10 <= 0 ? 1 : (n10 < 0 ? 0 : n10), y2.d, null, null);
                cn.com.etgame.cls.system.a.a(graphics, this.k, this.c, bjArray[n8].j(), bjArray[n8].w(), n2 + n7, n9 - n6 * 3 / 4);
                y2 = this.f[3].b().a();
                n10 = y2.c * bjArray[n8].u() / bjArray[n8].v();
                y2.a(graphics, this.c, n2, n9, n2 + y2.a, n9 + y2.b, n10, y2.d, null, null);
                cn.com.etgame.cls.system.a.a(graphics, this.k, this.c, bjArray[n8].u(), bjArray[n8].v(), n2 + n7, n9 - (n6 << 1) / 4);
                y2 = this.f[2].b().a();
                n10 = y2.c * bjArray[n8].s() / bjArray[n8].t();
                y2.a(graphics, this.c, n2, n9, n2 + y2.a, n9 + y2.b, n10, y2.d, null, null);
                cn.com.etgame.cls.system.a.a(graphics, this.k, this.c, bjArray[n8].s(), bjArray[n8].t(), n2 + n7, n9 - n6 / 4);
            }
            n2 += n5;
            ++n8;
        }
    }

    public final int h() {
        return this.f[0].b().a().c;
    }

    public final void c(Graphics graphics, int n2, int n3, int n4, int n5) {
        graphics.setColor(0);
        graphics.fillRect(0, 0, n4, n5);
        graphics.setFont(ag.b);
        String[] stringArray = j.a(this.t, n4 - 20, ag.b);
        int n6 = ag.b.getHeight() + 2;
        int n7 = n5 - n6 * stringArray.length >> 1;
        graphics.setColor(0xFFFFFF);
        int n8 = 0;
        while (n8 < stringArray.length) {
            ag.a(graphics, 0x5D5D5D, stringArray[n8], 10, n7 + n8 * n6, 20);
            ++n8;
        }
        this.n[1].a(graphics, this.c, n4 >> 1, n5, 0, 0, n4 * n2 / n3, n5, null);
        this.n[0].a(graphics, this.c, n4 * n2 / n3, n5, 0, 0, n4, n5, null);
    }

    public static void a(Graphics graphics, int n2, String string, int n3, int n4, int n5) {
        ag.b(graphics, n2, string, n3, n4 + 3, n5);
    }

    public final void i() {
        String[] stringArray = b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + "tips_in_loading.str");
        this.t = stringArray[j.a(0, stringArray.length - 1)];
    }
}

