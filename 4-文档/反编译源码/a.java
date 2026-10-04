/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;

public final class a
extends bk {
    public int a;
    private int b;
    private int c;
    private int d;
    private int e;
    private int f;

    public a(int n2, int n3, int n4, int n5) {
        super(am.i);
        this.a = n2;
        this.b = n3;
        this.c = n4;
        this.d = n5;
        this.f = am.f;
        super.g();
    }

    public a(int n2, int n3, int n4) {
        super(am.i);
        this.a = n2;
        this.c = n3;
        this.d = n4;
        this.f = am.f;
        super.g();
    }

    public final boolean a() {
        this.e -= this.f;
        this.f -= this.f >> 1;
        this.f = Math.max(0, this.f);
        return this.f == 0;
    }

    public final boolean b() {
        return super.i() || super.f() == 0L;
    }

    public final void a(Graphics graphics, int n2, int n3, aa aa2) {
        at[] atArray;
        Graphics graphics2;
        aa aa3;
        if (this.a == 2) {
            aa2.b(graphics, n2 + this.c, n3 + this.d + this.e);
            return;
        }
        if (this.a == 4) {
            aa2.c(graphics, n2 + this.c, n3 + this.e);
            return;
        }
        if (this.a == 5) {
            aa2.d(graphics, n2 + this.c, n3 + this.e);
            return;
        }
        if (this.a == 6) {
            aa2.e(graphics, n2 + this.c, n3 + this.e);
            return;
        }
        if (this.a == 7) {
            aa2.f(graphics, n2 + this.c, n3 + this.e);
            return;
        }
        if (this.a == 3) {
            aa2.a(graphics, n2 - 2 + this.c, n3 + this.d + this.e);
            aa3 = aa2;
            graphics2 = graphics;
            atArray = aa2.a;
        } else {
            aa3 = aa2;
            graphics2 = graphics;
            atArray = this.a == 0 ? aa2.a : aa2.b;
        }
        aa3.a(graphics2, atArray, this.b, n2 + this.c, n3 + this.d + this.e, 20);
    }
}

