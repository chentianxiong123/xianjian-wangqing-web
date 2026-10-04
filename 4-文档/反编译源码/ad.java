/*
 * Decompiled with CFR 0.152.
 */
public final class ad
extends q {
    private d b;
    private e c;
    public final int a;
    private boolean d;

    public ad(d d2, e e2, int n2, int n3, int n4) {
        super(n2, n3);
        this.b = d2;
        this.c = e2;
        this.a = n4;
        this.d = e2.e(n4);
        this.c(this.d ? d2.b("\u5b9d\u7bb1\uff08\u5f00\uff09") : d2.b("\u5b9d\u7bb1\uff08\u5173\uff09"));
    }

    public final boolean a() {
        if (!this.d) {
            Object object = this.c.k();
            if (j.a(this.J(), this.K(), ((bn)object).J(), ((bn)object).K(), 30)) {
                if (!cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.Y.a("\u795e\u79d8\u5b9d\u85cf")))) {
                    this.c.a("\u8bf7\u5230\u5546\u57ce\u6fc0\u6d3b", 1000L);
                } else {
                    this.d = true;
                    this.c(this.b.b("\u5b9d\u7bb1\uff08\u5f00\uff09"));
                    object = cn.com.etgame.cls.system.d.d();
                    if (object == null) {
                        this.c.a("\u8fd9\u662f\u7a7a\u7bb1\u5b50", 1000L);
                    } else {
                        this.c.t()[0].c().a((i)object);
                        this.c.a("\u83b7\u5f97" + ((i)object).a, 1000L);
                    }
                    this.c.a(this.a, true);
                }
            }
        }
        return super.a();
    }
}

