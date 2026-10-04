/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;

public class q
extends bn {
    private at a;
    private aj b;

    public q(int n2, int n3) {
        super(n2, n3);
    }

    public q(at at2, int n2, int n3) {
        super(n2, n3);
        this.c(at2);
    }

    public final void a(aj aj2) {
        this.b = aj2;
    }

    public final aj d() {
        return this.b;
    }

    public final void c(at at2) {
        this.a = at2;
        if (at2 != null) {
            at2.g();
        }
    }

    public final at e() {
        return this.a;
    }

    public boolean f() {
        return true;
    }

    public boolean a() {
        if (this.a != null) {
            be be2;
            if (this.b != null && (be2 = this.a.b()) != null && be2.d != null) {
                this.b.a(be2.d, this);
            }
            this.a.a();
        }
        return true;
    }

    public boolean a(int n2, int n3, int n4, int n5, int n6, int n7) {
        if (this.a != null) {
            be be2 = this.a.b();
            if (be2 == null) {
                return false;
            }
            return be2.a().a(be2.a + n2, be2.b + n3, n4, n5, n6, n7);
        }
        return false;
    }

    public void a(Graphics object, int n2, int n3, int n4, int n5, int n6, int n7) {
        if (this.a != null) {
            Graphics graphics = object;
            object = this;
            this.a.a(graphics, this.L(), n2, n3, n4, n5, n6, n7, null);
        }
    }

    public final boolean a(ao ao2, boolean bl2, boolean bl3, boolean bl4, aj aj2) {
        boolean bl5;
        block22: {
            l l2;
            int n2;
            int n3;
            int n4;
            int n5;
            q q2;
            ao ao3;
            boolean q3;
            boolean bn2;
            aj aj3;
            block21: {
                l l22;
                int n22;
                int n32;
                aj3 = null;
                bn2 = false;
                q3 = false;
                boolean object = false;
                ao3 = ao2;
                q2 = this;
                n5 = this.K();
                n4 = this.J();
                bl5 = false;
                if (!object) break block21;
                if (!q3) {
                    n32 = 0;
                    n22 = ao3.e();
                    while (n32 < n22) {
                        l22 = ao3.c(n32);
                        if (q2.b(n4, n5, l22.a, l22.b, l22.c, l22.d)) {
                            if (aj3 != null && l22.e != null) {
                                aj3.a(l22.e, ao3);
                            }
                            bl5 = true;
                        }
                        ++n32;
                    }
                }
                if (bn2) break block22;
                n32 = 0;
                n22 = ao3.d();
                while (n32 < n22) {
                    bn bn3 = ao3.b(n32);
                    if (bn3 != q2 && bn3 instanceof q) {
                        q q4 = (q)bn3;
                        Object object2 = q4;
                        object2 = q4.a;
                        if (object2 != null && (object2 = ((at)object2).b()) != null) {
                            int n9 = 0;
                            int n10 = ((be)object2).c();
                            while (n9 < n10) {
                                l22 = ((be)object2).b(n9);
                                if (q2.b(n4, n5, bn3.J() + l22.a, bn3.K() + l22.b, l22.c, l22.d)) {
                                    if (aj3 != null && l22.e != null) {
                                        aj3.a(l22.e, q4);
                                    }
                                    bl5 = true;
                                }
                                ++n9;
                            }
                        }
                    }
                    ++n32;
                }
                break block22;
            }
            if (!q3) {
                n3 = 0;
                n2 = ao3.f();
                while (n3 < n2) {
                    l2 = ao3.d(n3);
                    if (q2.b(n4, n5, l2.a, l2.b, l2.c, l2.d)) {
                        if (aj3 != null && l2.e != null) {
                            aj3.a(l2.e, ao3);
                        }
                        bl5 = true;
                    }
                    ++n3;
                }
            }
            if (!bn2) {
                n3 = 0;
                n2 = ao3.d();
                while (n3 < n2) {
                    bn bn3 = ao3.b(n3);
                    if (bn3 != q2 && bn3 instanceof q) {
                        q q4 = (q)bn3;
                        Object object = q4;
                        object = q4.a;
                        if (object != null && (object = ((at)object).b()) != null) {
                            int n6 = 0;
                            int n7 = ((be)object).b();
                            while (n6 < n7) {
                                l2 = ((be)object).a(n6);
                                if (q2.b(n4, n5, bn3.J() + l2.a, bn3.K() + l2.b, l2.c, l2.d)) {
                                    if (aj3 != null && l2.e != null) {
                                        aj3.a(l2.e, q4);
                                    }
                                    bl5 = true;
                                }
                                ++n6;
                            }
                        }
                    }
                    ++n3;
                }
            }
        }
        return bl5;
    }

    public final boolean a(q q2, boolean bl2, aj object) {
        boolean bl3;
        block9: {
            aj aj2 = null;
            boolean l2 = false;
            q q3 = q2;
            q q4 = this;
            int n2 = this.K();
            int n22 = this.J();
            bl3 = false;
            if (q4.a == null || q4.a.b() == null) break block9;
            Object object2 = q3;
            object2 = ((q)object2).a;
            if (object2 != null && (object2 = ((at)object2).b()) != null) {
                if (l2) {
                    int n5 = 0;
                    int n6 = ((be)object2).c();
                    while (n5 < n6) {
                        l l3 = ((be)object2).b(n5);
                        if (q4.b(n22, n2, q3.J() + l3.a, q3.K() + l3.b, l3.c, l3.d)) {
                            if (aj2 != null && l3.e != null) {
                                aj2.a(l3.e, q3);
                            }
                            bl3 = true;
                        }
                        ++n5;
                    }
                } else {
                    int n3 = 0;
                    int n4 = ((be)object2).b();
                    while (n3 < n4) {
                        l l3 = ((be)object2).a(n3);
                        if (q4.b(n22, n2, q3.J() + l3.a, q3.K() + l3.b, l3.c, l3.d)) {
                            if (aj2 != null && l3.e != null) {
                                aj2.a(l3.e, q3);
                            }
                            bl3 = true;
                        }
                        ++n3;
                    }
                }
            }
        }
        return bl3;
    }

    private boolean b(int n2, int n3, int n4, int n5, int n6, int n7) {
        be be2;
        if (this.a != null && (be2 = this.a.b()) != null) {
            int n8 = 0;
            int n9 = be2.b();
            while (n8 < n9) {
                l l2 = be2.a(n8);
                if (j.a(n2 + l2.a, l2.c, n4, n6) && j.a(n3 + l2.b, l2.d, n5, n7)) {
                    return true;
                }
                ++n8;
            }
        }
        return false;
    }
}

