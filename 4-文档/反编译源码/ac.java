/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class ac
extends ay {
    private d a;
    private int b;
    private int c;
    private String d;
    private bk e;
    private ag f;
    private e g;
    private boolean h;
    private a i;
    private boolean j;

    public ac(d d2, int n2, int n3, a a2, e e2) {
        super(d2.a[0], n2, n3);
        this.a = d.a(d2);
        this.i = a2;
        this.g = e2;
        this.f = ag.a();
        this.e = new bk(this.f.b() << 1);
        this.e.g();
        this.e.d();
        this.a(2);
        this.a(0, false, true);
    }

    public final void a(String string) {
        this.d = string;
    }

    public final void a(int n2) {
        if (this.c != n2) {
            switch (n2) {
                case 1: 
                case 2: 
                case 4: 
                case 8: {
                    this.c = n2;
                    this.i();
                }
            }
        }
    }

    public final int b() {
        return this.c;
    }

    public final synchronized boolean a(int n2, boolean bl2, boolean bl3) {
        if (this.b == -1 && !bl3) {
            return false;
        }
        if (bl2 || this.b != n2) {
            if (this.g.l() != null) {
                if (n2 == 2) {
                    if (!this.g.j()) {
                        this.g.a("\u65e0\u6cd5\u98de\u884c", 1000L);
                        return false;
                    }
                    if (!cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.Y.a("\u795e\u884c\u98de\u5251")))) {
                        this.g.a("\u8bf7\u5230\u5546\u57ce\u6fc0\u6d3b", 1000L);
                        return false;
                    }
                    this.g.l().c[1].b(this);
                    this.g.l().c[2].a(this);
                } else if (this.b == 2) {
                    if (this.a(this.g.l().c[1], false, false, false, null)) {
                        this.g.a("\u65e0\u6cd5\u964d\u843d", 1000L);
                        return false;
                    }
                    cn.com.etgame.cls.system.d.a(2, "\u964d\u843d----");
                    this.g.l().c[2].b(this);
                    this.g.l().c[1].a(this);
                }
            }
            this.b = n2;
            this.i();
            return true;
        }
        return false;
    }

    public final int c() {
        return this.b;
    }

    private void i() {
        String string;
        Object object;
        switch (this.b) {
            case 0: {
                object = "\u7ad9\u7acb";
                break;
            }
            case 1: {
                object = "\u8d70\u8def";
                break;
            }
            case 2: {
                object = "\u98de\u884c";
                break;
            }
            default: {
                return;
            }
        }
        switch (this.c) {
            case 4: {
                string = "\u5de6";
                break;
            }
            case 8: {
                string = "\u53f3";
                break;
            }
            case 1: {
                string = "\u4e0a";
                break;
            }
            case 2: {
                string = "\u4e0b";
                break;
            }
            default: {
                return;
            }
        }
        object = this.a.b(String.valueOf(object) + string);
        ((at)object).b(0);
        ((at)object).e();
        ((at)object).g();
        this.c((at)object);
    }

    public final void g() {
        if (this.e.f() == 0L) {
            this.e.c();
            this.e.g();
        }
    }

    public final void b(String object) {
        this.h = true;
        object = this.a.b((String)object);
        ((at)object).b(0);
        this.c((at)object);
    }

    public final void a(String object, int n2) {
        object = this.a.b((String)object);
        ((at)object).b(0);
        ((at)object).a(n2);
        this.c((at)object);
        this.b = -1;
    }

    public final boolean h() {
        return this.h;
    }

    public final void a(int n2, int n3) {
        super.a_(n2);
        super.b_(n3);
    }

    public final void a(Image[] imageArray) {
        if (!this.j) {
            this.j = true;
            super.a(imageArray);
        }
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        super.a(graphics, n2, this.e.f() >= this.e.e() >> 1 ? n3 - 3 : n3, n4, n5, n6, n7);
        if (this.d != null) {
            this.i.a(graphics, this.d, n2, n3 - 48, n4, n5, n6, n7);
        }
    }
}

