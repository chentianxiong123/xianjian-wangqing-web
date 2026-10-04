/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class u
extends ay
implements aw {
    d a;
    private at[] c;
    private int[][] d;
    private int e;
    private int f;
    boolean b;
    private boolean g;
    private int[] h;

    public u(d d2, Image[] imageArray, boolean bl2) {
        super(at.a(d2.a[0]), 0, 0);
        super.a(imageArray);
        this.a = d2;
        this.c = d2.a;
        this.g = bl2;
    }

    public final void a(int n2, int n3, int n4) {
        this.e = n3;
        this.f = n4;
        this.d = new int[j.a((n2 - 1) * 10, (n2 + 1) * 10)][3];
        if (this.g) {
            this.h = new int[this.d.length];
        }
        int n5 = 0;
        while (n5 < this.d.length) {
            this.d[n5][0] = j.a(0, this.c.length - 1);
            this.d[n5][1] = j.a(0, n3);
            this.d[n5][2] = j.a(0, n4);
            if (this.g) {
                this.h[n5] = this.d[n5][2];
            }
            ++n5;
        }
        n5 = 0;
        while (n5 < this.c.length) {
            this.c[n5].g();
            this.c[n5].a(this);
            ++n5;
        }
        n4 = 1;
        u u2 = this;
        this.b = n4;
        cn.com.etgame.cls.system.d.a(9, "\u843d\u77f3\uff01" + n2);
    }

    public final void a(Image[] imageArray) {
    }

    public final boolean a() {
        if (this.b && this.d != null) {
            int n2 = 0;
            while (n2 < this.c.length) {
                this.c[n2].a();
                ++n2;
            }
            if (this.g) {
                n2 = 0;
                while (n2 < this.d.length) {
                    if (Math.abs(this.h[n2] - this.d[n2][2]) < 300 + n2 / 5) {
                        int[] nArray = this.d[n2];
                        nArray[2] = nArray[2] - Math.max(1, n2 % 7);
                    } else {
                        this.d[n2][1] = j.a(0, this.e);
                        this.d[n2][2] = j.a(0, this.f);
                        this.h[n2] = this.d[n2][2];
                    }
                    ++n2;
                }
            }
        }
        return true;
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        if (this.b && this.d != null) {
            int n8 = 0;
            while (n8 < this.d.length) {
                this.c[n8 % this.c.length].a(graphics, this.L(), this.d[n8][1] + n2, this.d[n8][2] + n3, n4, n5, n6, n7, null);
                ++n8;
            }
        }
    }

    public final void a(at at2) {
        if (!this.g) {
            int n2 = -1;
            int n3 = 0;
            while (n3 < this.c.length) {
                if (at2 == this.c[n3]) {
                    n2 = n3;
                    break;
                }
                ++n3;
            }
            if (n2 >= 0) {
                n3 = 0;
                while (n3 < this.d.length) {
                    if (n2 == this.d[n3][0]) {
                        this.d[n3][1] = j.a(0, this.e);
                        this.d[n3][2] = j.a(0, this.f);
                    }
                    ++n3;
                }
            }
        }
    }

    public final void b(at at2) {
    }
}

