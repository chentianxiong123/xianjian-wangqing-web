/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class at {
    public final String a;
    public final be[] b;
    public Object c;
    private y[] d;
    private aw e;
    private short f;
    private int g;
    private bk h;

    at(be[] beArray, String string, Object object, int n2, short s2, y[] yArray, aw aw2) {
        this.b = beArray;
        this.a = string;
        this.c = object;
        this.g = n2;
        this.f = s2;
        this.d = yArray;
        this.e = aw2;
        if (beArray.length > 0) {
            this.h = new bk(beArray[s2].c);
        }
    }

    public final void a(int n2) {
        if (n2 < -1) {
            throw new IllegalArgumentException();
        }
        this.g = n2;
    }

    public final void a(aw aw2) {
        this.e = aw2;
    }

    public final void a() {
        if (this.b.length > 0 && !this.h.i() && this.h.f() == 0L) {
            this.c();
        }
    }

    public final be b() {
        if (this.b.length > 0) {
            return this.b[this.f];
        }
        return null;
    }

    public final void b(int n2) {
        if (n2 < 0 || n2 >= this.b.length) {
            throw new IllegalArgumentException();
        }
        if (this.b.length > 0) {
            boolean bl2 = this.h.i();
            this.f = (short)n2;
            this.h.a(this.b[this.f].c);
            this.h.c();
            if (!bl2) {
                this.h.g();
            }
        }
    }

    public final void c() {
        if (this.b.length > 0 && this.g != 0) {
            boolean bl2 = this.h.i();
            if (this.f < this.b.length - 1) {
                this.f = (short)(this.f + 1);
                this.h.a(this.b[this.f].c);
                this.h.c();
                if (!bl2) {
                    this.h.g();
                    return;
                }
            } else {
                if (this.g == -1) {
                    this.f = 0;
                } else {
                    --this.g;
                    if (this.g > 0) {
                        this.f = 0;
                    }
                }
                this.h.a(this.b[this.f].c);
                this.h.c();
                if (this.g == 0) {
                    if (this.e != null) {
                        this.e.a(this);
                        this.e.b(this);
                        return;
                    }
                } else {
                    if (!bl2) {
                        this.h.g();
                    }
                    if (this.e != null) {
                        this.e.a(this);
                    }
                }
            }
        }
    }

    public final short d() {
        if (this.b.length > 0) {
            return this.f;
        }
        return -1;
    }

    public final void a(Graphics graphics, Image[] imageArray, int n2, int n3, int n4, int n5, int n6, int n7, n n8) {
        if (this.b.length > 0) {
            this.b[this.f].a().a(graphics, imageArray, this.b[this.f].a + n2, this.b[this.f].b + n3, n4, n5, n6, n7, this.b[this.f].d, n8);
        }
    }

    public final void e() {
        if (this.h != null) {
            this.h.c();
        }
    }

    public final long f() {
        if (this.h != null) {
            return this.h.f();
        }
        return 0L;
    }

    public final void g() {
        if (this.h != null) {
            this.h.g();
        }
    }

    public final void h() {
        if (this.h != null) {
            this.h.h();
        }
    }

    public final boolean i() {
        if (this.h != null) {
            return this.h.i();
        }
        return true;
    }

    public final boolean equals(Object object) {
        block6: {
            Object object2 = object;
            object = this;
            if (object2 instanceof at) {
                object2 = (at)object2;
                if (((at)object).d.length != ((at)object2).d.length || ((at)object).b.length != ((at)object2).b.length) {
                    return false;
                }
                int n2 = 0;
                while (n2 < ((at)object).d.length) {
                    if (((at)object).d[n2].equals(((at)object2).d[n2])) {
                        ++n2;
                        continue;
                    }
                    break block6;
                }
                n2 = 0;
                while (n2 < ((at)object).b.length) {
                    if (((at)object).b[n2].equals(((at)object2).b[n2])) {
                        ++n2;
                        continue;
                    }
                    break block6;
                }
                return true;
            }
        }
        return false;
    }

    public static at a(at at2) {
        be[] beArray = new be[at2.b.length];
        int n2 = 0;
        while (n2 < beArray.length) {
            beArray[n2] = be.a(at2.b[n2]);
            ++n2;
        }
        return new at(beArray, at2.a, at2.c, at2.g, at2.f, at2.d, at2.e);
    }
}

