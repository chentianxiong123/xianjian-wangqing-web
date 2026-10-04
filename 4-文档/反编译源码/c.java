/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import cn.com.etgame.cls.system.d;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class c {
    private int a;
    private int b;
    private int c;
    private int d;
    private int e;
    private int f;
    private int g;
    private int h;
    private boolean i;
    private String[] j;
    private String k;
    private Font l;
    private int m;
    private int n;
    private int o;
    private int p;
    private int q;
    private int r;
    private int s;
    private int t;
    private int u;
    private boolean v;
    private at w;
    private a x;

    public c(int n2, int n3, Font font, int n4) {
        this.l = font;
        this.q = n4;
        this.x = cn.com.etgame.cls.system.d.c();
        this.g = n2;
        this.h = n3;
        this.m = 10;
        this.n = 10;
        this.o = n2 - (this.m << 1);
        this.p = n3 - (this.n << 1);
        this.t = font.getHeight() + n4;
    }

    public final void a(at at2) {
        this.w = at2;
    }

    public final void a(String string) {
        this.k = string;
        if (string == null) {
            this.j = null;
            this.r = -1;
            this.b(false);
            return;
        }
        if (this.i) {
            this.a = 0;
            this.b = 0;
            this.c = this.g;
            this.e = this.h;
            this.d = 3;
            this.f = 3;
            this.s = 0;
            this.u = 0;
        }
        this.j = cn.com.etgame.cls.system.d.a(j.a(string, "\\n", "\n"), this.o, this.l);
        this.r = Math.max((this.p + this.q) / this.t, 1);
    }

    public final void a(boolean bl2) {
        this.v = bl2;
    }

    public final void b(boolean bl2) {
        if (bl2 && !this.i) {
            this.a = 0;
            this.b = 0;
            this.c = this.g;
            this.e = this.h;
            this.d = 3;
            this.f = 3;
            this.s = 0;
            this.u = 0;
        }
        this.i = bl2 && this.r > 0;
    }

    public final boolean a() {
        return this.i;
    }

    public final void a(int n2, int n3) {
        this.g = n2;
        this.h = n3;
        this.o = n2 - (this.m << 1);
        this.p = n3 - (this.n << 1);
        if (this.i) {
            this.a(this.k);
            this.b(false);
            this.b(true);
        }
    }

    public final void b() {
        if (this.j == null || this.s + this.r >= this.j.length) {
            this.b(false);
            this.u = 0;
            return;
        }
        if (this.a == this.g && this.b == this.h) {
            this.u = this.t;
            ++this.s;
        }
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, Image[] imageArray) {
        n2 -= this.g >> 1;
        n3 -= this.h;
        if (this.i) {
            if (this.w != null && imageArray != null) {
                y y2 = this.w.b().a();
                int n5 = n2;
                if (this.v) {
                    n5 = n2 + this.g - y2.c;
                }
                y2.a(graphics, imageArray, n5, n3, n5 + y2.a, n3 + y2.b, y2.c, y2.d, null, null);
            }
            if (this.d > 0) {
                if (this.d > 1) {
                    n4 = this.c * 6 / 10;
                    this.c -= n4;
                    this.a += n4;
                } else {
                    this.a += this.c;
                }
                --this.d;
            }
            if (this.f > 0) {
                if (this.f > 1) {
                    n4 = this.e * 6 / 10;
                    this.e -= n4;
                    this.b += n4;
                } else {
                    this.b += this.e;
                }
                --this.f;
            }
            n4 = this.v ? n2 + (this.g - this.a) : n2;
            this.x.a(graphics, n4, n3, this.a, this.b, false);
            if (this.j != null && this.j.length > 0) {
                graphics.setColor(0xFFFFFF);
                graphics.setClip(n4 + this.m, n3 + this.n, this.o - (this.g - this.a), this.p - (this.h - this.b));
                if (this.u > 0) {
                    c.a(graphics, this.j, this.s - 1, this.r + 1, n2 + this.m, n3 + this.n + this.u - this.t, this.t, this.l, c.a(this.j, 0, this.s - 1, '/') % 2 == 1, c.a(this.j, 0, this.s - 1, '{') > c.a(this.j, 0, this.s - 1, '}'));
                    this.u = Math.max(this.u - cn.com.etgame.cls.system.d.h, 0);
                } else {
                    c.a(graphics, this.j, this.s, this.r, n2 + this.m, n3 + this.n + this.u, this.t, this.l, c.a(this.j, 0, this.s, '/') % 2 == 1, c.a(this.j, 0, this.s, '{') > c.a(this.j, 0, this.s, '}'));
                }
            }
            if (this.a == this.g && this.b == this.h && this.s + this.r < this.j.length) {
                this.x.a(graphics, n2 + this.g - 10, n3 + this.h - 5);
            }
        }
    }

    private static int a(String[] stringArray, int n2, int n3, char c2) {
        n2 = 0;
        int n4 = Math.max(0, 0);
        n3 = Math.min(n4 + n3, stringArray.length);
        while (n4 < n3) {
            int n5 = 0;
            while (n5 < stringArray[n4].length()) {
                if (stringArray[n4].charAt(n5) == c2) {
                    ++n2;
                }
                ++n5;
            }
            ++n4;
        }
        return n2;
    }

    private static void a(Graphics graphics, String[] stringArray, int n2, int n3, int n4, int n5, int n6, Font font, boolean bl2, boolean bl3) {
        graphics.setFont(font);
        if (bl2) {
            graphics.setColor(0xFF0000);
        } else if (bl3) {
            graphics.setColor(0xFCFF00);
        } else {
            graphics.setColor(0xFFFFFF);
        }
        bl3 = false;
        n2 = Math.max(n2, 0);
        n3 = Math.min(n2 + n3, stringArray.length);
        int n7 = n4;
        while (n2 < n3) {
            int n8 = 0;
            while (n8 < stringArray[n2].length()) {
                if (stringArray[n2].charAt(n8) == '/') {
                    if (bl2 = !bl2) {
                        graphics.setColor(0xFF0000);
                    } else {
                        graphics.setColor(0xFFFFFF);
                    }
                } else if (stringArray[n2].charAt(n8) == '{') {
                    graphics.setColor(0xFCFF00);
                } else if (stringArray[n2].charAt(n8) == '}') {
                    graphics.setColor(0xFFFFFF);
                } else {
                    graphics.drawChar(stringArray[n2].charAt(n8), n7, n5 + bl3 * n6, 20);
                    n7 += font.charWidth(stringArray[n2].charAt(n8));
                }
                ++n8;
            }
            bl3 += 1;
            ++n2;
            n7 = n4;
        }
    }
}

