/*
 * Decompiled with CFR 0.152.
 */
public final class bd
extends ax {
    public int[][] t;
    public int[][] u;
    private int w;
    private int x;
    private int y;

    public bd(d object, int n2, int n3, f f2, bj bj2) {
        super((d)object, n2, n3, f2);
        this.n = bj2;
        this.b = bj2.a;
        this.t = bj2.H();
        this.u = bj2.G();
        this.l = f2;
        this.l(bj2.e());
        this.k(bj2.w());
        this.j(bj2.j());
        this.n(bj2.z());
        this.g(bj2.x());
        this.m(bj2.y());
        this.i(bj2.t());
        this.h(bj2.s());
        this.f(bj2.v());
        this.e(bj2.u());
        this.p(bj2.A());
        this.q(bj2.k());
        object = bj2;
        this.w = (((bj)object).m() == null ? 0 : ((bj)object).m().i()) + (((bj)object).n() == null ? 0 : ((bj)object).n().i()) + (((bj)object).o() == null ? 0 : ((bj)object).o().i()) + (((bj)object).p() == null ? 0 : ((bj)object).p().i()) + (((bj)object).q() == null ? 0 : ((bj)object).q().i()) + (((bj)object).r() == null ? 0 : ((bj)object).r().i());
        object = bj2;
        this.x = (((bj)object).m() == null ? 0 : ((bj)object).m().e()) + (((bj)object).n() == null ? 0 : ((bj)object).n().e()) + (((bj)object).o() == null ? 0 : ((bj)object).o().e()) + (((bj)object).p() == null ? 0 : ((bj)object).p().e()) + (((bj)object).q() == null ? 0 : ((bj)object).q().e()) + (((bj)object).r() == null ? 0 : ((bj)object).r().e());
        object = bj2;
        this.y = (((bj)object).m() == null ? 0 : ((bj)object).m().h()) + (((bj)object).n() == null ? 0 : ((bj)object).n().h()) + (((bj)object).o() == null ? 0 : ((bj)object).o().h()) + (((bj)object).p() == null ? 0 : ((bj)object).p().h()) + (((bj)object).q() == null ? 0 : ((bj)object).q().h()) + (((bj)object).r() == null ? 0 : ((bj)object).r().h());
        this.k = bj2.c();
    }

    protected final void b() {
        super.b();
        this.a(this.n(), this.s);
        if (this.z()) {
            int n2 = 7;
            if (this.s() >= cn.com.etgame.cls.system.d.U[n2].j) {
                n2 = 7;
                cn.com.etgame.cls.system.d.a(7, "\u53d8\u8eab\u51cf\u6c14\u503c-->" + cn.com.etgame.cls.system.d.U[n2].j);
                n2 = 7;
                this.e(this.s() - cn.com.etgame.cls.system.d.U[n2].j);
            } else {
                this.l.a("\u6c14\u503c\u4e0d\u8db3");
                boolean bl2 = false;
                bd bd2 = this;
                super.c(bl2);
            }
        }
        cn.com.etgame.cls.system.d.a(6, "\u653b\u51fb\u89e6\u53d1\uff01");
    }

    protected final void c() {
        super.c();
        this.r = false;
        this.q = false;
        this.l.a(this);
    }

    public final void a(af object, ax object2) {
        cn.com.etgame.cls.system.d.a(5, "\u653b\u51fbskill=" + ((af)object).d);
        this.s = object;
        this.b((ax)object2);
        object2 = object;
        object = this;
        ((ax)object).m.a("slv=" + (((af)object2).b == 0 ? 4 : (((af)object2).b == 7 ? 5 : ((ax)object).n.b(((af)object2).a))));
        ((ax)object).c = (int)((ax)object).m.a(((ax)object).n.l());
    }

    public final boolean a() {
        int n2;
        if (this.l.u() && this.l.j() && this.l.m() && !this.j() && this.i >= (n2 = this.F() + this.a) && this.i < n2 + this.F() + this.a) {
            f f2 = this.l;
            if (this == f2.a[0]) {
                this.l.w();
            }
            if (this.w > 0) {
                this.j(this.w() + this.w);
            }
            if (this.x > 0) {
                this.e(this.s() + this.x);
            }
            if (this.y > 0) {
                this.h(this.u() + this.y);
            }
        }
        if (this.b(1) && this.s.b == 7) {
            n2 = this.n().o() + am.b() + this.s.g;
            int n3 = this.n().p() + am.b() + this.s.h;
            if (!this.o) {
                if (this.l.m()) {
                    if (this.q) {
                        if (!this.z()) {
                            ++this.h;
                            if (this.d == n2 && this.e == n3) {
                                this.h = 0;
                                this.c(2);
                            } else {
                                this.a(this.o, this.h, n2, n3);
                                this.d = this.o() - this.f;
                                this.e = this.p() - this.g;
                                if (this.d < n2) {
                                    this.d = n2;
                                }
                                if (this.e < n3) {
                                    this.e = n3;
                                }
                            }
                        }
                    } else {
                        cn.com.etgame.cls.system.d.a(6, "\u76ee\u6807\u70b9\uff1a" + this.n().d + "," + this.n().e + "-->" + this.q);
                        if (this.H()) {
                            this.a(false);
                            this.q = true;
                            cn.com.etgame.cls.system.d.a(6, "\u53ef\u653b\u51fb\u8303\u56f4\u5185-->" + this.q);
                        } else if (this.n() == null) {
                            this.q = false;
                        }
                    }
                }
            } else if (!this.z()) {
                ++this.h;
                cn.com.etgame.cls.system.d.a(6, "\u8fd4\u56de\uff1a" + this.d + "," + this.e + "--" + this.h);
                if (this.d == this.o() && this.e == this.p()) {
                    this.h = 0;
                    this.k();
                } else {
                    this.a(this.o, this.h, n2, n3);
                    this.d = n2 + this.f;
                    this.e = n3 + this.g;
                    this.e().c();
                    if (this.d > this.o()) {
                        this.d = this.o();
                    }
                    if (this.e > this.p()) {
                        this.e = this.p();
                    }
                }
            }
        }
        return super.a();
    }

    protected final boolean H() {
        return this.n() != null && j.a(this.n().d, this.n().e, 0, 0, 0, am.d[0] + (this.l.s() >> 1), am.c[2] + (this.l.t() >> 1), 0);
    }

    public final int a(int n2) {
        n2 = this.n.b(n2);
        return n2;
    }

    protected final void a(int n2, String string, int n3) {
        if (n2 == 1) {
            super.a(n2, string, n3);
            return;
        }
        int n4 = 0;
        while (n4 < this.l.b.length) {
            if (this.l.b[n4] != null) {
                g g2 = this.l.b[n4];
                if (g2.G()) {
                    if (!this.j && g2.w() > 0 && this.a(g2)) {
                        this.a("\u95ea\u907f", g2, 6, n3);
                    } else {
                        this.a(string, g2, 3, n3);
                    }
                } else {
                    cn.com.etgame.cls.system.d.a(9, "\u76ee\u6807\uff1a" + g2.b + " \u653b\u51fb\u8005\uff1a" + this.b);
                    g2.q().addElement(new a(4, -am.g, -am.h));
                }
            }
            ++n4;
        }
    }

    public final void c(boolean bl2) {
        super.c(bl2);
    }

    protected final boolean I() {
        return true;
    }
}

