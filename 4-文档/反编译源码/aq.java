/*
 * Decompiled with CFR 0.152.
 */
public final class aq
extends q
implements aw {
    private d a;
    private e b;
    private boolean c;
    private at d;
    private at e;

    public aq(d d2, e e2, int n2, int n3) {
        super(n2, n3);
        this.a = d2;
        this.b = e2;
        this.c = true;
        boolean bl2 = j.b(1, 2);
        this.d = at.a(d2.b(bl2 ? "\u5c0f\u9e21\u7ad9\u7acb\uff08\u5de6\uff09" : "\u5c0f\u9e21\u7ad9\u7acb\uff08\u53f3\uff09"));
        this.e = at.a(d2.b(bl2 ? "\u5c0f\u9e21\u5544\u7c73\uff08\u5de6\uff09" : "\u5c0f\u9e21\u5544\u7c73\uff08\u53f3\uff09"));
        this.d.a(this);
        this.e.a(this);
        this.c(this.d);
    }

    public final boolean a() {
        ac ac2;
        if (this.c && (ac2 = this.b.k()).c() != 2 && j.a(this.J(), this.K(), ac2.J(), ac2.K(), 10)) {
            this.c = false;
            this.c(this.a.b("\u5c0f\u9e21\uff08\u8e29\uff09"));
        }
        return super.a();
    }

    public final void a(at at2) {
        if (this.c) {
            if (j.b(80, 100)) {
                this.c(this.d);
                return;
            }
            this.c(this.e);
        }
    }

    public final void b(at at2) {
    }
}

