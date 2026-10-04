/*
 * Decompiled with CFR 0.152.
 */
public final class az
extends q
implements aw {
    private e a;
    private boolean b;
    private at c;
    private at d;
    private at e;
    private at f;
    private bk g;
    private int h;
    private boolean i;
    private int j;

    public az(d d2, e e2, int n2, int n3) {
        super(n2, n3);
        this.a = e2;
        this.j = this.J();
        this.g = new bk(8000L);
        this.i = j.b(1, 2);
        this.c = at.a(d2.b(this.i ? "\u9e21\uff08\u5de6\uff09" : "\u9e21\uff08\u53f3\uff09"));
        this.d = at.a(d2.b(this.i ? "\u9e21\u5544\u7c73\uff08\u5de6\uff09" : "\u9e21\u5544\u7c73\uff08\u53f3\uff09"));
        this.e = at.a(d2.b("\u9e21\u884c\u8d70\uff08\u5de6\uff09"));
        this.f = at.a(d2.b("\u9e21\u884c\u8d70\uff08\u53f3\uff09"));
        this.c.a(this);
        this.d.a(this);
        this.c(this.c);
    }

    public final boolean a() {
        if (this.b) {
            if (Math.abs(this.j - this.J()) > 20) {
                this.h = -this.h;
                this.c(this.h < 0 ? this.e : this.f);
            }
            this.a_(this.J() + this.h);
            if (this.g.f() == 0L && this.j == this.J() && this.i == this.h < 0) {
                this.b = false;
                this.c(this.c);
            }
        } else {
            ac ac2 = this.a.k();
            if (ac2.c() != 2 && j.a(this.J(), this.K(), ac2.J(), ac2.K(), 10)) {
                this.b = true;
                this.h = this.K() < ac2.K() ? -5 : 5;
                this.c(this.h < 0 ? this.e : this.f);
                this.g.c();
                this.g.g();
            }
        }
        return super.a();
    }

    public final void a(at at2) {
        if (!this.b) {
            if (j.b(80, 100)) {
                this.c(this.c);
                return;
            }
            this.c(this.d);
        }
    }

    public final void b(at at2) {
    }
}

