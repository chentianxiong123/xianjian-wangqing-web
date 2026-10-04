/*
 * Decompiled with CFR 0.152.
 */
package cn.com.etgame.cls.system;

import cn.com.etgame.cls.system.a;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class b
extends o
implements aw {
    private Image[] a;
    private at[] b;
    private at[] c;
    private at[] d;
    private at[] e;
    private at f;
    private at g;
    private at h;
    private at i;
    private at j;
    private at k;
    private int l;
    private int m;
    private ag n;
    private int o;
    private int p;
    private String[] q;
    private String[] r;
    private String[] s;
    private int t;
    private int u;
    private int v;
    private int w;
    private int x;
    private int y;
    private int z;
    private int A;
    private a B;
    private bk C;

    public b() {
        try {
            this.B = cn.com.etgame.cls.system.d.c();
            this.n = ag.a();
            this.C = new bk(0L);
            this.a = new Image[x.a("/bin/menu.bin")];
            this.b = new at[6];
            this.c = new at[2];
            this.d = new at[5];
            this.e = new at[2];
            this.o = this.n.c;
            this.p = this.n.d;
            this.l = this.n.d() == 1 ? 1 : 0;
            this.u = 2;
            this.v = (this.p - 196 + this.u) / (ag.b.getHeight() + 2);
            return;
        }
        catch (Throwable throwable) {
            this.n.a(throwable, "MenuCanvas()", 1);
            return;
        }
    }

    public final void a() {
        try {
            this.B.i();
            return;
        }
        catch (Exception exception) {
            this.n.a(exception, "FightCanvas.init()", 1);
            return;
        }
    }

    public final void d() {
        ah.a("/mid/menu.mid");
        ah.a(-1);
        ah.e();
        ah.d();
    }

    public final int c() {
        return this.a.length + 1;
    }

    public final boolean a(int n2) {
        try {
            if (n2 == 0) {
                d d2 = d.a("/ant/menu.ant");
                this.b[0] = d2.b("\u65b0\u7684\u5f00\u59cb");
                this.b[1] = d2.b("\u56de\u5fc6");
                this.b[2] = d2.b("\u8bbe\u7f6e");
                this.b[3] = d2.b("\u6e38\u620f\u5e2e\u52a9");
                this.b[4] = d2.b("\u5173\u4e8e");
                this.b[5] = d2.b("\u79bb\u5f00");
                this.e[0] = d2.b("\u592a\u6781\u9ed1");
                this.e[1] = d2.b("\u592a\u6781\u767d");
                this.f = d2.b("\u80cc\u666f");
                this.g = d2.b("\u5c01\u9762\u6846");
                this.h = d2.b("\u540d\u5b57");
                this.j = d2.b("\u6d41\u661f");
                this.k = d2.b("\u8fd4\u56de");
                int n3 = 0;
                while (n3 <= 1) {
                    this.c[n3] = d2.b("\u4e91" + (n3 + 1));
                    ++n3;
                }
                n3 = 0;
                while (n3 < 5) {
                    this.d[n3] = d2.b("\u661f\u661f" + (n3 + 1));
                    this.d[n3].g();
                    this.d[n3].a(this);
                    ++n3;
                }
                this.h.a(1);
                this.h.g();
                this.j.g();
                this.q = j.a(cn.com.etgame.cls.system.d.O, this.o - 124, ag.b);
                this.r = j.a(cn.com.etgame.cls.system.d.P, this.o - 124, ag.b);
            } else {
                int n4 = n2 - 1;
                Object object = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, "menu.bin", n4);
                if (((bf)object).a.endsWith(".png")) {
                    this.a[n4] = Image.createImage((byte[])((bf)object).b, (int)0, (int)((bf)object).b.length);
                } else if (((bf)object).a.endsWith(".pix")) {
                    object = ba.a(j.a(((bf)object).b, 0, ((bf)object).b.length));
                    this.a[n4] = Image.createRGBImage((int[])((ba)object).c, (int)((ba)object).a, (int)((ba)object).b, (boolean)true);
                }
            }
        }
        catch (Throwable throwable) {
            this.n.a(throwable, "MenuCanvas.loadResource(" + n2 + ")", 1);
            System.gc();
            return false;
        }
        return true;
    }

    public final void a(int n2, int n3) {
        if (n2 != 0) {
            n2 = this.n.getGameAction(n2);
            block0 : switch (this.l) {
                case 0: {
                    return;
                }
                case 1: {
                    switch (n2) {
                        case 2: 
                        case 16: {
                            this.m = (this.m + this.b.length - 1) % this.b.length;
                            return;
                        }
                        case 4: 
                        case 8: {
                            this.m = (this.m + 1) % this.b.length;
                            return;
                        }
                        case 1: 
                        case 131072: {
                            switch (this.m) {
                                case 0: {
                                    ah.e();
                                    ah.a(null);
                                    this.n.a(new e(null));
                                    return;
                                }
                                case 1: {
                                    this.m = 0;
                                    this.l = 2;
                                    return;
                                }
                                case 2: {
                                    this.t = ah.a() || ah.c() == 0 ? 0 : ah.c() / 25;
                                    this.l = 3;
                                    return;
                                }
                                case 3: {
                                    this.w = 0;
                                    this.s = this.q;
                                    this.l = 4;
                                    return;
                                }
                                case 4: {
                                    this.w = 0;
                                    this.s = this.r;
                                    this.l = 4;
                                    return;
                                }
                                case 5: {
                                    this.n.h();
                                }
                            }
                        }
                    }
                    return;
                }
                case 2: {
                    switch (n2) {
                        case 2: {
                            this.m = (this.m + 3 - 1) % 3;
                            return;
                        }
                        case 4: {
                            this.m = (this.m + 1) % 3;
                            return;
                        }
                        case 1: 
                        case 131072: {
                            if (cn.com.etgame.cls.system.d.a[this.m] == null) break block0;
                            ah.e();
                            ah.a(null);
                            this.n.a(new e(cn.com.etgame.cls.system.d.a[this.m]));
                            return;
                        }
                        case 262144: {
                            this.m = 1;
                            this.l = 1;
                        }
                    }
                    return;
                }
                case 3: {
                    switch (n2) {
                        case 8: {
                            --this.t;
                            if (this.t <= 0) {
                                this.t = 0;
                                ah.a(true);
                                return;
                            }
                            ah.b(this.t * 25);
                            return;
                        }
                        case 16: {
                            ++this.t;
                            if (this.t > 4) {
                                this.t = 4;
                                return;
                            }
                            if (this.t == 1) {
                                ah.a(false);
                            }
                            ah.b(this.t * 25);
                            return;
                        }
                        case 1: 
                        case 131072: {
                            return;
                        }
                        case 262144: {
                            this.l = 1;
                        }
                    }
                    return;
                }
                case 4: {
                    if (n2 != 262144) break;
                    this.l = 1;
                }
            }
        }
    }

    public final void c(int n2) {
        if (this.l == 4) {
            switch (this.n.getGameAction(n2)) {
                case 2: {
                    this.w = Math.max(this.w - 1, 0);
                    return;
                }
                case 4: {
                    this.w = Math.min(this.w + 1, this.s.length - this.v);
                }
            }
        }
    }

    public final void a(Graphics graphics) {
        switch (this.l) {
            case 0: {
                this.f.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                if (this.i != null) {
                    this.i.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                }
                this.j.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.c[0].a(graphics, this.a, this.n.c - this.z, 0, 0, 0, this.n.c, this.n.d, null);
                this.c[1].a(graphics, this.a, this.A, 0, 0, 0, this.n.c, this.n.d, null);
                this.h.a(graphics, this.a, 0, 0, 0, 0, this.x, this.n.d, null);
                this.e[0].a(graphics, this.a, this.y, 0, 0, 0, this.n.c, this.n.d, null);
                this.e[1].a(graphics, this.a, -this.y, 0, 0, 0, this.n.c, this.n.d, null);
                this.g.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                return;
            }
            case 1: {
                this.f.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                if (this.i != null) {
                    this.i.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                }
                this.j.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.c[0].a(graphics, this.a, this.n.c - this.z, 0, 0, 0, this.n.c, this.n.d, null);
                this.c[1].a(graphics, this.a, this.A, 0, 0, 0, this.n.c, this.n.d, null);
                this.h.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.b[this.m].a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                return;
            }
            case 2: {
                this.f.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                if (this.i != null) {
                    this.i.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                }
                this.j.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.g.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.k.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                int n2 = this.n.f;
                int n3 = this.n.e;
                int n4 = this.m;
                Graphics graphics2 = graphics;
                b b2 = this;
                int n5 = (n3 -= 65) + 5;
                int n6 = (n2 -= 65) + 5;
                graphics2.setFont(ag.b);
                int n7 = 0;
                while (n7 < 3) {
                    if (n7 == n4) {
                        b2.B.a(graphics2, n5 - 2, n6 - 2 + n7 * 40, 134, 35, false);
                    }
                    graphics2.setClip(n3, n2, 130, 130);
                    if (cn.com.etgame.cls.system.d.a[n7] != null) {
                        graphics2.setColor(0xFFFFFF);
                        ag.b(graphics2, 0, cn.com.etgame.cls.system.d.a[n7].b(), n5 + 40, n6 + 10 + n7 * 40, 20);
                        graphics2.setClip(n5 + 3, n6 + n7 * 40 + 3, 30, 30);
                        graphics2.drawRGB(cn.com.etgame.cls.system.d.a[n7].b, 0, 40, n5 - 2, n6 + n7 * 40 + 3, 40, 40, false);
                    } else {
                        graphics2.setColor(0xFFFFFF);
                        ag.b(graphics2, 0, "--/-- --:--", n3 + 65, n6 + 10 + n7 * 40, 17);
                    }
                    ++n7;
                }
                return;
            }
            case 3: {
                this.f.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                if (this.i != null) {
                    this.i.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                }
                this.j.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.g.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.k.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                int n8 = (this.p >> 1) - 25;
                int n9 = this.o >> 1;
                Graphics graphics3 = graphics;
                b b3 = this;
                int n10 = n9 - 24;
                int n11 = n8 + 20;
                graphics3.setClip(0, 0, b3.o, b3.p);
                graphics3.setColor(0xFFFFFF);
                graphics3.setFont(ag.a);
                ag.b(graphics3, 0, "\u97f3\u4e50\u8bbe\u7f6e", n9, n8 + 10, 33);
                int n12 = 1;
                while (n12 < 5) {
                    if (b3.t >= n12) {
                        graphics3.setColor(0, 255, 0);
                        graphics3.fillRect(n10 + (n12 << 3), n11 + 24 - n12 * 6, 4, n12 * 6);
                    }
                    graphics3.setColor(0xFFFFFF);
                    graphics3.drawRect(n10 + (n12 << 3), n11 + 24 - n12 * 6, 4, n12 * 6);
                    ++n12;
                }
                return;
            }
            case 4: {
                this.f.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                if (this.i != null) {
                    this.i.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                }
                this.j.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                graphics.setColor(0xFFFFFF);
                graphics.setClip(0, 0, this.o, this.p);
                Font font = ag.b;
                int n13 = this.u + ag.b.getHeight();
                int n14 = 98;
                int n15 = 58;
                int n16 = Math.min(this.s.length - this.w, this.v);
                int n17 = this.w;
                String[] stringArray = this.s;
                Graphics graphics4 = graphics;
                graphics4.setFont(font);
                n14 = 0;
                int n18 = Math.max(n17, 0);
                n17 = Math.min(n18 + n16, stringArray.length);
                while (n18 < n17) {
                    ag.b(graphics4, 0, stringArray[n18], 58, 98 + n14 * n13, 20);
                    ++n14;
                    ++n18;
                }
                this.g.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
                this.k.a(graphics, this.a, 0, 0, 0, 0, this.n.c, this.n.d, null);
            }
        }
    }

    public final void g() {
        if (this.i == null) {
            if (this.C.f() == 0L) {
                this.i = this.d[j.a(1, this.d.length - 1)];
            }
        } else {
            this.i.a();
        }
        this.j.a();
        switch (this.l) {
            case 0: {
                this.y += 15;
                if (this.y > this.n.c << 1) {
                    if (this.x < this.n.c) {
                        this.x += 5;
                    } else {
                        this.l = 1;
                    }
                }
                this.z += 2;
                if (this.z > this.n.c) {
                    this.z = 0;
                }
                this.A += 2;
                if (this.A <= this.n.c) break;
                this.A = 0;
                break;
            }
            case 1: {
                this.h.a();
                this.z += 5;
                if (this.z > this.n.c) {
                    this.z = 0;
                }
                this.A += 3;
                if (this.A <= this.n.c) break;
                this.A = 0;
            }
        }
        this.n.repaint();
        this.n.serviceRepaints();
    }

    public final void a(Graphics graphics, int n2, int n3) {
        this.B.c(graphics, n2, n3, this.o, this.p);
    }

    public final void a(at at2) {
        this.C.a(j.a(500, 2000));
        this.C.c();
        this.C.g();
        this.i = null;
    }

    public final void b(at at2) {
    }

    public final void n() {
        this.n.f();
    }

    public final void o() {
        this.n.g();
    }

    public final void p() {
        ah.d();
    }

    public final void r() {
        ah.e();
    }
}

