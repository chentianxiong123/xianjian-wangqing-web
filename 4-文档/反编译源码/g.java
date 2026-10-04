/*
 * Decompiled with CFR 0.152.
 */
import java.util.Random;
import java.util.Vector;

public final class g
extends ax {
    private af[] t;
    private af[] u;
    private int w;
    private bm x;
    private Random y = new Random();

    public g(d stringArray, int n2, int n3, int n4, f f2, bm bm2) {
        super((d)stringArray, n3, n4, f2);
        this.k = new av();
        this.x = bm2;
        this.b = bm2.j();
        n2 = 0;
        while (n2 < bm2.m().length) {
            stringArray = j.a(bm2.m()[n2], "(");
            this.k.a(new i(stringArray[0], Integer.parseInt(j.a(stringArray[1], ")")[0])));
            ++n2;
        }
        this.l(1);
        this.k(bm2.f());
        this.j(bm2.f());
        this.n(bm2.l());
        this.g(bm2.c());
        this.m(0);
        this.i(0);
        this.h(0);
        this.f(0);
        this.e(0);
        this.o(bm2.o());
        this.p(bm2.i());
        this.w = bm2.g();
        this.t = bm2.k();
        this.u = bm2.a();
        switch (bm2.n()) {
            case 1: 
            case 2: 
            case 3: 
            case 4: 
            case 5: {
                this.p = false;
                return;
            }
        }
        this.p = true;
    }

    public final boolean a() {
        if (this.i()) {
            this.h();
            this.l.v();
        }
        if (this.b(1) && this.s.b == 7) {
            int n2 = this.n().o() - am.b() + this.s.g;
            int n3 = this.n().p() - am.b() + this.s.h;
            if (!this.o) {
                if (this.l.m()) {
                    if (this.q) {
                        if (!this.p) {
                            ++this.h;
                            if (this.d == n2 && this.e == n3) {
                                this.h = 0;
                                this.c(2);
                            } else {
                                this.a(this.o, this.h, n2, n3);
                                this.d = this.o() + this.f;
                                this.e = this.p() + this.g;
                                if (this.d > n2) {
                                    this.d = n2;
                                }
                                if (this.e > n3) {
                                    this.e = n3;
                                }
                            }
                        }
                    } else {
                        this.q = true;
                    }
                }
            } else if (!this.p) {
                ++this.h;
                if (this.d == this.o() && this.e == this.p()) {
                    this.h = 0;
                    this.k();
                } else {
                    this.a(this.o, this.h, n2, n3);
                    this.d = n2 - this.f;
                    this.e = n3 - this.g;
                    this.e().c();
                    if (this.d < this.o()) {
                        this.d = this.o();
                    }
                    if (this.e < this.p()) {
                        this.e = this.p();
                    }
                }
            }
        }
        return super.a();
    }

    protected final void b() {
        super.b();
        this.r = false;
        this.a(this.n(), this.s);
        cn.com.etgame.cls.system.d.a(6, "\u654c--\u653b\u51fb\u89e6\u53d1\uff01");
    }

    protected final void c() {
        Object object;
        super.c();
        if (this.w() <= this.x() * 3 / 10 && j.b(this.w, 100, this.y) && (object = this.k.a(0)) != null && ((Vector)object).size() > 0) {
            object = (i)((Vector)object).elementAt(j.a(0, ((Vector)object).size() - 1, this.y));
            ((i)object).a(this.l);
            this.k.a((i)object, 1);
            this.l.a("\u4f7f\u7528\u7269\u54c1\uff1a" + ((i)object).a);
            this.h();
            return;
        }
        this.s = j.b(5 + this.y() / 2, 100, this.y) ? this.u[j.a(0, this.u.length - 1, this.y)] : this.t[j.a(0, this.t.length - 1, this.y)];
        this.b(this.l.i());
        object = this;
        if (((ax)object).s.b == 7) {
            ((ax)object).m.a("slv=5");
        } else {
            ((ax)object).m.a("slv=" + (((ax)object).y() + 20) / 20);
        }
        ((ax)object).c = (int)((ax)object).m.a(((g)object).x.b());
        cn.com.etgame.cls.system.d.a(8, String.valueOf(((g)object).x.b()) + "\u602a\u4ed9\u672f\u901f\u5ea6\uff1a" + ((ax)object).c);
        cn.com.etgame.cls.system.d.a(7, "\u91ca\u653e\u6280\u80fd\uff1a" + this.s.d);
    }

    public final int a(int n2) {
        return (this.y() + 20) / 20;
    }

    protected final void a(int n2, String string, int n3) {
        if (n2 == 1) {
            super.a(n2, string, n3);
            return;
        }
        int n4 = 0;
        while (n4 < this.l.a.length) {
            bd bd2 = this.l.a[n4];
            if (bd2 != null) {
                if (bd2.G()) {
                    if (bd2.r()) {
                        this.a(bd2.z() ? "\u53d8\u8eab\u683c\u6321\u4e2d" : "\u683c\u6321\u4e2d", bd2, 5, n3);
                    } else if (!this.j && bd2.w() > 0 && this.a(bd2)) {
                        this.a(bd2.z() ? "\u53d8\u8eab\u95ea\u907f" : "\u95ea\u907f", bd2, 6, n3);
                    } else {
                        this.a(bd2.z() ? "\u53d8\u8eab" + string : string, bd2, 3, n3);
                    }
                } else {
                    bd2.q().addElement(new a(4, -am.g, -am.h));
                }
            }
            ++n4;
        }
    }
}

