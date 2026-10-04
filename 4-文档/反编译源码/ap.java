/*
 * Decompiled with CFR 0.152.
 */
public final class ap
extends q {
    private e a;
    private bk b;

    public ap(d d2, e e2) {
        super(d2.b("\u6d6e\u4e91"), -1000, -1000);
        this.a = e2;
        this.b = new bk(0L);
    }

    public final boolean a() {
        ag ag2 = ag.a();
        ac ac2 = this.a.k();
        if (this.J() - ac2.J() >= -ag2.c) {
            this.a_(this.J() - 2);
            this.b.a(j.a(1000, 10000));
            this.b.c();
            this.b.g();
        } else if (this.b.f() == 0L) {
            this.a_(ac2.J() + ag2.c);
            this.b_(j.a(ac2.K() - ag2.f, ac2.K() + ag2.f));
        }
        return super.a();
    }
}

