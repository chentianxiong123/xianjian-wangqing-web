/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;

public final class bh {
    private int a;
    private int b;
    private int c;
    private int d;
    private int e;
    private int f;
    private int g;
    private bk h;
    private boolean i = false;

    public bh(int n2, int n3, int n4, int n5, int n6, int n7) {
        this.a = n5;
        this.b = n2;
        this.c = n4;
        this.d = n3;
        this.g = n7;
        this.h = new bk(200L);
        this.h.h();
        this.i = false;
    }

    public bh(int n2, int n3, int n4) {
        this.g = n4;
        this.d = n2;
        this.i = true;
    }

    public final void a(int n2, int n3) {
        this.e = n2;
        this.f = n3;
    }

    public final boolean a() {
        return this.i;
    }

    public final void a(Graphics graphics, aa aa2) {
        if (this.i) {
            aa2.a(graphics, this.d, this.e, this.f, this.g);
            return;
        }
        if (this.c > 0) {
            this.b = Math.min(this.b + this.c, this.d);
        } else if (this.c < 0) {
            this.b = Math.max(this.b + this.c, this.d);
        }
        if (this.a == 0) {
            aa2.a(graphics, this.b, this.e, this.f, this.g);
        } else if (this.a == 1) {
            aa2.a(graphics, aa2.b, this.b, this.e, this.f, this.g);
        }
        if (this.b == this.d) {
            if (this.h.i()) {
                this.h.c();
                this.h.g();
                return;
            }
            if (this.h.f() == 0L) {
                this.i = true;
            }
        }
    }
}

