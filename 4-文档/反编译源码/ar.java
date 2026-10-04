/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class ar
extends ay {
    private final int b;
    private final int c;
    public final String a;
    private int d;
    private int e;
    private boolean f;
    private boolean g;
    private bk h;
    private bk i;
    private e j;
    private d k;

    public ar(int n2, int n3, String string, d d2, Image[] imageArray, e e2) {
        super(at.a(d2.b(string)), n2, n3);
        super.a(imageArray);
        this.a = string;
        this.k = d2;
        this.h = new bk(cn.com.etgame.cls.system.d.s);
        this.i = new bk(j.a(cn.com.etgame.cls.system.d.p, cn.com.etgame.cls.system.d.q));
        this.j = e2;
        this.b = this.J();
        this.c = this.K();
        this.i.d();
    }

    public final boolean a(int n2) {
        return this.k.a(n2);
    }

    public final boolean a() {
        if (!this.j.h()) {
            this.a_(this.b);
            this.b_(this.c);
            this.g = false;
            this.f = false;
            return true;
        }
        if (!this.j.v()) {
            return super.a();
        }
        if (this.g) {
            if (this.j.i()) {
                return true;
            }
            if (this.h.f() == 0L) {
                this.a_(this.b);
                this.b_(this.c);
                this.g = false;
                this.f = false;
            }
        } else {
            super.a();
            if (this.j.i()) {
                return true;
            }
            ay ay2 = this.j.k();
            if (((ac)ay2).c() != 2 && j.a(ay2.J(), ay2.K(), this.J(), this.K(), cn.com.etgame.cls.system.d.r)) {
                ay2 = this;
                ((ar)ay2).a(true);
                ((ar)ay2).j.s();
            } else if (((ac)ay2).c() != 2 && !this.f && j.a(ay2.J(), ay2.K(), this.J(), this.K(), cn.com.etgame.cls.system.d.t)) {
                if (j.a(this.J(), this.K(), this.b, this.c, cn.com.etgame.cls.system.d.v)) {
                    this.e = 0;
                    this.i.d();
                    if (ay2.J() > this.J()) {
                        this.a(this.j.l().c[1], 8, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                    } else if (ay2.J() < this.J()) {
                        this.a(this.j.l().c[1], 4, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                    }
                    if (ay2.K() > this.K()) {
                        this.a(this.j.l().c[1], 2, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                    } else if (ay2.K() < this.K()) {
                        this.a(this.j.l().c[1], 1, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                    }
                } else {
                    this.f = true;
                }
            } else if (!j.a(this.J(), this.K(), this.b, this.c, cn.com.etgame.cls.system.d.u)) {
                if (this.b > this.J()) {
                    this.a(this.j.l().c[1], 8, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                } else if (this.b < this.J()) {
                    this.a(this.j.l().c[1], 4, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                }
                if (this.c > this.K()) {
                    this.a(this.j.l().c[1], 2, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                } else if (this.c < this.K()) {
                    this.a(this.j.l().c[1], 1, cn.com.etgame.cls.system.d.r, cn.com.etgame.cls.system.d.t, cn.com.etgame.cls.system.d.r, true, true, true);
                }
            } else {
                if (this.f) {
                    this.f = false;
                }
                if (this.e > 0) {
                    this.e = this.a(this.j.l().c[1], this.d, cn.com.etgame.cls.system.d.r, 0, 0, true, true, true) ? --this.e : 0;
                    if (this.e == 0) {
                        this.i.g();
                    }
                } else if (this.i.f() == 0L) {
                    int n2 = j.a(cn.com.etgame.cls.system.d.n, cn.com.etgame.cls.system.d.o);
                    int n3 = j.a(0, 3);
                    int n4 = cn.com.etgame.cls.system.d.r * n2;
                    if (j.a(n3 == 2 ? this.J() - n4 : (n3 == 3 ? this.J() + n4 : this.J()), n3 == 0 ? this.K() - n4 : (n3 == 1 ? this.K() + n4 : this.K()), this.b, this.c, cn.com.etgame.cls.system.d.u)) {
                        this.e = n2;
                        switch (n3) {
                            case 0: {
                                this.d = 1;
                                break;
                            }
                            case 1: {
                                this.d = 2;
                                break;
                            }
                            case 2: {
                                this.d = 4;
                                break;
                            }
                            case 3: {
                                this.d = 8;
                            }
                        }
                        this.i.a(j.a(cn.com.etgame.cls.system.d.p, cn.com.etgame.cls.system.d.q));
                        this.i.c();
                    }
                }
            }
        }
        return true;
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        if (!this.j.h()) {
            return;
        }
        if (!this.g) {
            super.a(graphics, n2, n3, n4, n5, n6, n7);
        }
    }

    public final void b() {
        this.h.g();
    }

    public final void c() {
        this.h.h();
    }

    public final void a(Image[] imageArray) {
    }

    public final boolean g() {
        return this.g;
    }

    public final void a(boolean bl2) {
        this.h.c();
        this.h.g();
        this.g = true;
    }
}

