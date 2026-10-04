/*
 * Decompiled with CFR 0.152.
 */
public final class s
extends q
implements aw {
    private d a;
    private e b;
    private int c;
    private boolean d;
    private at e;
    private at f;
    private int g;
    private int h;

    public s(d d2, e e2, int n2, int n3) {
        super(n2, n3);
        this.a = d2;
        this.b = e2;
        this.d = j.b(1, 2);
        this.c = 0;
        this.e = at.a(d2.b(this.d ? "\u9e1f\u7ad9\u7acb\uff08\u5de6\uff09" : "\u9e1f\u7ad9\u7acb\uff08\u53f3\uff09"));
        this.f = at.a(d2.b(this.d ? "\u9e1f\u5403\u866b\uff08\u5de6\uff09" : "\u9e1f\u5403\u866b\uff08\u53f3\uff09"));
        this.e.a(this);
        this.f.a(this);
        this.c(this.e);
    }

    public final boolean a() {
        if (this.c == 2) {
            return true;
        }
        if (this.c == 1) {
            int n2;
            int n3 = this.J();
            int n4 = this.K();
            int n5 = Math.abs(this.g);
            if (n5 > (n2 = Math.abs(this.h))) {
                int n6 = Math.min(15, n5);
                int n7 = (n2 << 10) * n6 / n5 >> 10;
                if (this.g > 0) {
                    this.a_(n3 + n6);
                } else if (this.g < 0) {
                    this.a_(n3 - n6);
                }
                if (this.h > 0) {
                    this.b_(n4 + n7);
                } else if (this.h < 0) {
                    this.b_(n4 - n7);
                }
            } else {
                int n8 = Math.min(15, n2);
                int n9 = (n5 << 10) * n8 / n2 >> 10;
                if (this.g > 0) {
                    this.a_(n3 + n9);
                } else if (this.g < 0) {
                    this.a_(n3 - n9);
                }
                if (this.h > 0) {
                    this.b_(n4 + n8);
                } else if (this.h < 0) {
                    this.b_(n4 - n8);
                }
            }
            w w2 = this.b.l();
            if (!j.a(this.J(), this.K(), -50, -50, w2.a + 100, w2.b + 100)) {
                this.c = 2;
            }
        } else {
            ac ac2 = this.b.k();
            if (j.a(this.J(), this.K(), ac2.J(), ac2.K(), cn.com.etgame.cls.system.d.w)) {
                this.g = this.J() < ac2.J() ? -j.a(100, 500) : j.a(100, 500);
                this.h = this.K() < ac2.K() ? -j.a(100, 400) : j.a(100, 400);
                this.c = 1;
                at at2 = at.a(this.a.b(this.g <= 0 ? "\u9e1f\u98de\uff08\u5de6\uff09" : "\u9e1f\u98de\uff08\u53f3\uff09"));
                at2.a(1);
                at2.a(this);
                this.c(at2);
            }
        }
        return super.a();
    }

    public final boolean a(int n2, int n3, int n4, int n5, int n6, int n7) {
        return this.c != 2 && super.a(n2, n3, n4, n5, n6, n7);
    }

    public final void a(at at2) {
        if (this.c == 0) {
            if (j.b(80, 100)) {
                this.c(this.e);
                return;
            }
            this.c(this.f);
        }
    }

    public final void b(at at2) {
        this.c(at.a(this.a.b(this.g <= 0 ? "\u9e1f\u9ad8\uff08\u5de6\uff09" : "\u9e1f\u9ad8\uff08\u53f3\uff09")));
    }
}

