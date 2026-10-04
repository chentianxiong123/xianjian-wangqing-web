/*
 * Decompiled with CFR 0.152.
 */
import java.util.Vector;

public final class be {
    private short e;
    public final int a;
    public final int b;
    public long c;
    public Object d;
    private Vector f;
    private Vector g;
    private y[] h;

    be(short s2, int n2, int n3, long l2, Object object, y[] yArray) {
        this.e = s2;
        this.a = n2;
        this.b = n3;
        this.c = l2;
        this.d = object;
        this.h = yArray;
        this.f = new Vector();
        this.g = new Vector();
    }

    public final y a() {
        return this.h[this.e];
    }

    public final void a(l l2) {
        this.f.addElement(l2);
    }

    public final l a(int n2) {
        return (l)this.f.elementAt(n2);
    }

    public final int b() {
        return this.f.size();
    }

    public final void b(l l2) {
        this.g.addElement(l2);
    }

    public final l b(int n2) {
        return (l)this.g.elementAt(n2);
    }

    public final int c() {
        return this.g.size();
    }

    public final boolean equals(Object object) {
        block8: {
            Object object2 = object;
            object = this;
            if (object2 instanceof be) {
                object2 = (be)object2;
                if (((be)object).e != ((be)object2).e || ((be)object).a != ((be)object2).a || ((be)object).b != ((be)object2).b || ((be)object).c != ((be)object2).c || ((be)object).f.size() != ((be)object2).f.size() || ((be)object).g.size() != ((be)object2).g.size() || ((be)object).h.length != ((be)object2).h.length) {
                    return false;
                }
                int n2 = 0;
                int n3 = ((be)object).f.size();
                while (n2 < n3) {
                    if (((be)object).f.elementAt(n2).equals(((be)object2).f.elementAt(n2))) {
                        ++n2;
                        continue;
                    }
                    break block8;
                }
                n2 = 0;
                n3 = ((be)object).g.size();
                while (n2 < n3) {
                    if (((be)object).g.elementAt(n2).equals(((be)object2).g.elementAt(n2))) {
                        ++n2;
                        continue;
                    }
                    break block8;
                }
                n2 = 0;
                while (n2 < ((be)object).h.length) {
                    if (((be)object).h[n2].equals(((be)object2).h[n2])) {
                        ++n2;
                        continue;
                    }
                    break block8;
                }
                return true;
            }
        }
        return false;
    }

    public static be a(be be2) {
        l l2;
        be be3 = new be(be2.e, be2.a, be2.b, be2.c, be2.d, be2.h);
        int n2 = 0;
        int n3 = be2.f.size();
        while (n2 < n3) {
            l2 = (l)be2.f.elementAt(n2);
            be3.a(l2.a());
            ++n2;
        }
        n2 = 0;
        n3 = be2.g.size();
        while (n2 < n3) {
            l2 = (l)be2.g.elementAt(n2);
            be3.b(l2.a());
            ++n2;
        }
        return be3;
    }

    static boolean a(be be2, be be3) {
        if (be2.e != be3.e || be2.a != be3.a || be2.b != be3.b || be2.c != be3.c || be2.f.size() != be3.f.size() || be2.g.size() != be3.g.size()) {
            return false;
        }
        int n2 = 0;
        int n3 = be2.f.size();
        while (n2 < n3) {
            if (!be2.f.elementAt(n2).equals(be3.f.elementAt(n2))) {
                return false;
            }
            ++n2;
        }
        n2 = 0;
        n3 = be2.g.size();
        while (n2 < n3) {
            if (!be2.g.elementAt(n2).equals(be3.g.elementAt(n2))) {
                return false;
            }
            ++n2;
        }
        return true;
    }
}

