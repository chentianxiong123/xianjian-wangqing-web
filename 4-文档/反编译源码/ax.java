/*
 * Decompiled with CFR 0.152.
 */
import java.util.Random;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;

public class ax
extends q
implements aj,
aw {
    private int t;
    private boolean u;
    private bk w;
    private bk x;
    private int y;
    private boolean z;
    private bk A;
    private boolean B;
    private int C;
    private int D;
    private int E;
    private int F;
    protected int a;
    private int G;
    protected String b;
    private int H;
    private int I = 1000;
    private int J = 1000;
    private int K;
    private int L;
    private int M;
    private int N = 1;
    private int O;
    private int P = 1;
    private int Q = 1;
    protected int c;
    private int R;
    private int S;
    private int T;
    protected int d;
    protected int e;
    private int U;
    private int V;
    protected int f;
    protected int g;
    protected int h;
    protected int i;
    private static int W = 1000 * am.k / am.j;
    protected boolean j;
    protected av k;
    protected f l;
    protected t m;
    private d X;
    private Vector Y;
    private ax Z;
    protected bj n;
    protected boolean o;
    protected boolean p;
    protected boolean q;
    protected boolean r;
    private int aa = 0;
    private boolean ab;
    private boolean ac;
    protected af s;
    private boolean ad;
    private Random ae;
    private Random af;

    public ax(d object, int n2, int n3, f f2) {
        super(((d)object).b("\u7ad9\u7acb"), 0, 0);
        this.l = f2;
        this.X = object;
        this.m = new t();
        this.Y = new Vector();
        object = this;
        this.U = n2;
        n2 = n3;
        object = this;
        this.V = n2;
        object = this;
        this.d = ((ax)object).U;
        object = this;
        this.e = ((ax)object).V;
        this.w = new bk(100L);
        this.x = new bk(100L);
        this.A = new bk(100L);
        this.ae = new Random();
        this.af = new Random();
        object = this;
        ((ax)object).c(0);
        this.a((aj)this);
    }

    public final int g() {
        return this.X.b((String)"\u7ad9\u7acb").b[0].a().d;
    }

    public final void a(Graphics graphics) {
        int n2 = this.d;
        int n3 = this.e;
        if (this.e() != null) {
            this.a(graphics, n2, n3, 0, 0, this.l.t(), this.l.s());
        }
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        super.a(graphics, n2, n3, n4, n5, n6, n7);
        if (!this.j()) {
            if (this.u) {
                this.l.a(graphics, n2, n3, 2);
            }
            if (this.z) {
                this.l.a(graphics, n2, n3, 1);
            }
        }
    }

    public boolean a() {
        if (this.l.u() && this.l.j() && this.l.m()) {
            if (!this.j()) {
                if (!f.a(this.l.b) && !this.z) {
                    this.i += this.j ? this.c + this.a : this.Q + this.a;
                }
                this.i = this.i > W && this.i < W + this.Q + this.a && !this.j ? W : (this.i > 1000 ? 1000 : this.i);
                int n2 = this.Q + this.a;
                if (this.i >= n2 && this.i < n2 + this.Q + this.a) {
                    if (this.C > 0) {
                        if (this.D > 0) {
                            --this.D;
                        } else {
                            this.C = 0;
                            this.D = 0;
                        }
                    }
                    if (this.E > 0) {
                        if (this.F > 0) {
                            --this.F;
                        } else {
                            this.E = 0;
                            this.F = 0;
                        }
                    }
                    if (this.a > 0) {
                        if (this.G > 0) {
                            --this.G;
                        } else {
                            this.a = 0;
                            this.G = 0;
                        }
                    }
                }
                if (!this.j && this.i == W) {
                    this.c();
                    this.j = true;
                } else if (this.j && this.i == 1000) {
                    this.b();
                }
            } else if (this.j()) {
                this.i = 0;
            }
        }
        if (this.l.u() && this.l.j() && this.l.m() && !this.j()) {
            if (this.u) {
                if (this.w.i()) {
                    this.w.g();
                }
                if (this.x.i()) {
                    this.x.g();
                }
                if (this.w.f() == 0L) {
                    this.u = false;
                } else if (this.x.f() == 0L) {
                    ax ax2 = this;
                    this.j(ax2.I - this.y);
                    ax2 = this;
                    ax2.Y.addElement(new a(0, this.y, -am.g, -am.h));
                    this.x.c();
                    this.x.g();
                }
            }
            if (this.z) {
                cn.com.etgame.cls.system.d.a(7, "ex_stopTime==" + this.A.f());
                if (this.A.i()) {
                    this.A.g();
                }
                if (this.A.f() == 0L) {
                    this.z = false;
                }
            }
        } else {
            if (this.u) {
                this.w.h();
                this.x.h();
            }
            if (this.z) {
                this.A.h();
            }
        }
        if (this.Y.size() > 0) {
            int n3 = 0;
            while (n3 < this.Y.size()) {
                a a2 = (a)this.Y.elementAt(n3);
                if (a2.a()) {
                    this.Y.removeElementAt(n3);
                } else if (a2.b()) {
                    this.Y.removeElementAt(n3);
                }
                ++n3;
            }
        }
        ax ax3 = this;
        if (ax3.I <= 0 && (this.b(0) || this.b(1))) {
            this.j(0);
            this.a("\u6b7b\u4ea1\u4e2d");
            this.c(7);
        }
        if (this.l.m()) {
            if (this.r) {
                return true;
            }
            return super.a();
        }
        ax3 = this;
        if (ax3.t == 1) {
            ax3 = this;
            if (ax3.ac) {
                return super.a();
            }
            if (this.p) {
                return super.a();
            }
            return true;
        }
        return super.a();
    }

    public final void h() {
        this.i = 0;
        ax ax2 = this;
        this.aa = 0;
        this.j = false;
        this.r = false;
    }

    protected void b() {
    }

    protected void c() {
    }

    protected final boolean i() {
        if (this.aa == 2) {
            ax ax2 = this;
            if (ax2.t == 0) {
                return true;
            }
        }
        return false;
    }

    public final boolean j() {
        return this.t == 7;
    }

    protected final boolean b(int n2) {
        return this.t == n2;
    }

    protected final void a(boolean bl2) {
        this.o = bl2;
        this.q = false;
        if (this.p) {
            this.a("\u6d88\u5931");
        } else if (this.s.b == 7) {
            this.h = 0;
            cn.com.etgame.cls.system.d.a(5, "\u662f\u5426\u8fd4\u56de:" + bl2);
            ax ax2 = this;
            if (ax2.ac) {
                this.a("\u53d8\u8eab\u6d88\u5931");
            } else {
                ax ax3 = this.Z;
                ax2 = ax3;
                ax2 = this.Z;
                this.a(bl2, this.h, ax3.U, ax2.V);
                if (this.H()) {
                    if (bl2) {
                        this.a("\u8df3\u8dc3");
                    } else {
                        this.a("\u8dd1\u52a8");
                    }
                }
                if (this.e().i()) {
                    this.e().g();
                }
            }
        }
        this.c(1);
    }

    /*
     * WARNING - void declaration
     */
    protected final void a(boolean bl2, int n2, int n3, int n4) {
        void var2_3;
        int n5;
        int n6;
        ax ax2 = this;
        n6 = Math.abs(ax2.U - n6);
        ax2 = this;
        n5 = Math.abs(ax2.V - n5);
        if (bl2) {
            this.f = n6 * var2_3 / this.X.b((String)"\u8df3\u8dc3").b.length;
            this.g = n5 * var2_3 / this.X.b((String)"\u8df3\u8dc3").b.length;
            return;
        }
        int n7 = j.a(n6 * n6 + n5 * n5);
        this.f = n6 * am.e * var2_3 / n7;
        this.g = n5 * am.e * var2_3 / n7;
    }

    protected final void k() {
        this.c(0);
    }

    protected final void a(ax ax2, af af2) {
        this.s = af2;
        this.j = false;
        ax ax3 = ax2;
        ax2 = this;
        this.Z = ax3;
        cn.com.etgame.cls.system.d.a(5, "\u653b\u51fb\u89e6\u53d1 :" + af2.d + "-" + af2.e);
        if (af2.a == 7) {
            this.c(true);
            return;
        }
        if (af2 != null && af2.b == 7) {
            this.a(false);
            return;
        }
        this.c(8);
    }

    protected final void c(int n2) {
        if (this.t != n2) {
            switch (n2) {
                case 0: {
                    String string;
                    ax ax2 = this;
                    if (ax2.ab) {
                        ax2 = this;
                        string = ax2.ac ? "\u53d8\u8eab\u683c\u6321" : "\u683c\u6321";
                    } else {
                        ax2 = this;
                        string = ax2.ac ? "\u53d8\u8eab\u7ad9\u7acb" : "\u7ad9\u7acb";
                    }
                    this.a(string);
                    if (this.aa != 1) break;
                    this.aa = 2;
                    break;
                }
                case 1: {
                    ax ax3 = this;
                    if (ax3.ac) {
                        this.l.k();
                        break;
                    }
                    if (!this.p) break;
                    this.l.k();
                    break;
                }
                case 9: {
                    this.l.k();
                    this.a("\u53d8\u8eab\u52a8\u753b");
                    break;
                }
                case 8: {
                    this.l.k();
                    if (this.s.b == 0) {
                        this.a(this.s.e);
                        ax ax4 = this;
                        af af2 = this.s;
                        ax ax5 = ax4;
                        ax4.e(ax5.O - af2.j);
                    } else {
                        this.a("\u4ed9\u672f\u91ca\u653e");
                        af af3 = this.s;
                        ax ax6 = this;
                        ax6.l.a(af3.a, ax6.n);
                        ax6.h(ax6.M - af3.k);
                    }
                    this.aa = 1;
                    break;
                }
                case 2: {
                    ax ax7 = this;
                    if (ax7.ac) {
                        this.a("\u53d8\u8eab\u653b\u51fb");
                    } else {
                        this.l.k();
                        this.a(this.s.e);
                    }
                    this.aa = 1;
                    break;
                }
                case 3: {
                    break;
                }
                case 7: {
                    this.h();
                    this.u = false;
                    this.B = false;
                    this.z = false;
                }
            }
            this.t = n2;
        }
    }

    /*
     * Unable to fully structure code
     */
    protected void a(int var1_1, String var2_3, int var3_4) {
        block2: {
            block3: {
                block4: {
                    block6: {
                        block5: {
                            if (var1_1 != 1) break block2;
                            var1_2 = this;
                            if (var1_2.Z == null) break block3;
                            var1_2 = this;
                            if (!var1_2.Z.G()) break block4;
                            var1_2 = this;
                            var1_2 = var1_2.Z;
                            if (!var1_2.ab) break block5;
                            var1_2 = this;
                            var1_2 = var1_2.Z;
                            var1_2 = this;
                            this.a(var1_2.ac != false ? "\u53d8\u8eab\u683c\u6321\u4e2d" : "\u683c\u6321\u4e2d", var1_2.Z, 5, var3_4);
                            break block3;
                        }
                        if (this.j) break block6;
                        var1_2 = this;
                        var1_2 = var1_2.Z;
                        if (var1_2.I <= 0) break block6;
                        var1_2 = this;
                        if (!this.a(var1_2.Z)) break block6;
                        var1_2 = this;
                        var1_2 = var1_2.Z;
                        var1_2 = this;
                        this.a(var1_2.ac != false ? "\u53d8\u8eab\u95ea\u907f" : "\u95ea\u907f", var1_2.Z, 6, var3_4);
                        break block3;
                    }
                    var1_2 = this;
                    if (var1_2.Z.j()) ** GOTO lbl-1000
                    var1_2 = this;
                    var1_2 = var1_2.Z;
                    if (var1_2.I == 0) lbl-1000:
                    // 2 sources

                    {
                        cn.com.etgame.cls.system.d.a(9, "\u6b7b\u4ea1\u51fb\u7a7a\u76ee\u6807\uff1a" + this.b);
                        var1_2 = this;
                        var1_2 = var1_2.Z;
                        var1_2.Y.addElement(new a(4, -am.g, -am.h));
                    } else {
                        var1_2 = this;
                        var1_2 = var1_2.Z;
                        var1_2 = this;
                        this.a(var1_2.ac != false ? "\u53d8\u8eab" + var2_3 : var2_3, var1_2.Z, 3, var3_4);
                    }
                    break block3;
                }
                var1_2 = this;
                cn.com.etgame.cls.system.d.a(9, "\u666e\u901a\u653b\u51fb\u76ee\u6807\uff1a" + var1_2.Z.b + " \u653b\u51fb\u8005\uff1a" + this.b);
                var1_2 = this;
                var1_2 = var1_2.Z;
                var1_2.Y.addElement(new a(4, -am.g, -am.h));
            }
            var1_2 = this;
            cn.com.etgame.cls.system.d.a(9, " \u653b\u51fb\u8005\uff1a" + this.b + "  getTarget=" + var1_2.Z);
        }
    }

    protected final boolean a(ax ax2) {
        return j.b(ax2.S, 100, this.af);
    }

    public int a(int n2) {
        return 1;
    }

    protected final void a(String string, ax ax2, int n2, int n3) {
        if (ax2 != null && !ax2.j()) {
            ax ax3 = ax2;
            if (ax3.I > 0) {
                int n4;
                ax ax4 = this;
                ax3 = ax4;
                ax3 = ax2;
                if (ax4.K + this.C > ax3.L + ax2.E) {
                    n4 = this.a(this.s.a);
                    ax ax5 = this;
                    ax3 = ax5;
                    ax3 = ax2;
                    int n5 = this.s.a(n4, ax5.K + this.C - ax3.L - ax2.E);
                    int n6 = j.a(9, 11);
                    cn.com.etgame.cls.system.d.a(5, "\u4eba\u7269\u540d\u5b57\uff1a" + this.b);
                    cn.com.etgame.cls.system.d.a(5, "\u6280\u80fd\u540d\u79f0\uff1a" + this.s.d + "  slv=" + n4);
                    ax ax6 = this;
                    ax3 = ax6;
                    ax3 = ax2;
                    cn.com.etgame.cls.system.d.a(5, "\u653b\u51fb\u8ba1\u7b97:(" + ax6.K + "+" + this.C + "-" + ax3.L + "-" + ax2.E + ")");
                    cn.com.etgame.cls.system.d.a(5, "\u653b\u51fb\u8ba1\u7b97:(" + n5 + ")*" + n6 + "/10");
                    n4 = n5 * n6 / 10;
                    n4 = Math.max(n4, 1);
                    ax3 = this;
                    if (ax3.ac) {
                        cn.com.etgame.cls.system.d.a(5, "\u53d8\u8eab\u7ffb\u500d:" + n4 + "*4");
                        n4 = n4 * 3 / 5;
                    }
                } else {
                    n4 = 1;
                }
                if (n2 != 6 && ax2.i > 0 && ax2.i < W) {
                    ax2.i -= n3;
                }
                if (n2 == 3) {
                    if (!this.I() && this.s.b == 7) {
                        ax3 = ax2;
                        ax2.e(ax3.O + this.R);
                    }
                    ax3 = this;
                    if (j.b(ax3.S, 200, this.ae) && n4 != 1) {
                        cn.com.etgame.cls.system.d.a(2, "\u66b4\u51fb\u7ffb\u500d:" + n4 + "*2");
                        n4 <<= 1;
                        ax3 = ax2;
                        n4 = Math.min(n4, ax3.I);
                        ax3 = ax2;
                        ax2.j(ax3.I - n4);
                        ax3 = ax2;
                        ax3.Y.addElement(new a(1, n4, -am.g, -am.h));
                    } else {
                        ax3 = ax2;
                        n4 = Math.min(n4, ax3.I);
                        ax3 = ax2;
                        ax2.j(ax3.I - n4);
                        ax3 = ax2;
                        ax3.Y.addElement(new a(0, n4, -am.g, -am.h));
                    }
                    if (this.B) {
                        n4 = Math.max(1, n4 / 4);
                        ax3 = this;
                        ax3.Y.addElement(new a(3, n4, -am.g, -am.h));
                        ax3 = this;
                        this.j(ax3.I + n4);
                    }
                } else if (n2 == 5) {
                    n4 = (n4 >>= 1) <= 0 ? 1 : n4;
                    ax3 = ax2;
                    n4 = Math.min(n4, ax3.I);
                    ax3 = ax2;
                    ax2.j(ax3.I - n4);
                    ax3 = ax2;
                    ax3.Y.addElement(new a(0, n4, -am.g, -am.h));
                } else if (n2 == 6) {
                    ax3 = ax2;
                    ax3.Y.addElement(new a(2, -am.g, -am.h));
                }
            }
            ax2.a(string);
            ax2.c(n2);
        }
    }

    private boolean M() {
        ax ax2 = this;
        ax ax3 = ax2;
        ax3 = this;
        if (ax2.I < (ax3.J << 1) / 10 && this.b(0)) {
            ax3 = this;
            if (!ax3.ab) {
                ax3 = this;
                if (!ax3.ac) {
                    return true;
                }
            }
        }
        return false;
    }

    /*
     * Unable to fully structure code
     */
    public final void a(at var1_1) {
        block35: {
            block38: {
                block37: {
                    block36: {
                        block34: {
                            var1_1 = this;
                            if (!var1_1.b(0)) break block34;
                            var2_2 = var1_1;
                            if (var2_2.ab && !super.b("\u683c\u6321")) {
                                super.a("\u683c\u6321");
                                return;
                            }
                            if (var1_1.I()) {
                                if (super.M() && !super.b("\u91cd\u4f24")) {
                                    super.a("\u91cd\u4f24");
                                    return;
                                }
                                if (!super.M() && super.b("\u91cd\u4f24")) {
                                    super.a("\u7ad9\u7acb");
                                    return;
                                }
                                if (!super.M() && super.b("\u6b7b\u4ea1")) {
                                    super.a("\u7ad9\u7acb");
                                    return;
                                }
                            }
                            break block35;
                        }
                        if (var1_1.b(9)) {
                            var1_1.l.l();
                            var1_1.h();
                            var2_3 = var1_1;
                            var2_3.c(0);
                            return;
                        }
                        if (!var1_1.b(8)) break block36;
                        if (!var1_1.r) {
                            var2_4 = var1_1;
                            var1_1.l.a(var1_1.s, var2_4.Z, (ax)var1_1);
                            var1_1.e().h();
                            var1_1.e().b(var1_1.e().b.length - 1);
                            var1_1.r = true;
                            cn.com.etgame.cls.system.d.a(8, "\u6682\u505c\u9b54\u6cd5\u52a8\u753b " + var1_1.b);
                            return;
                        }
                        break block35;
                    }
                    if (!var1_1.b(1)) break block37;
                    var2_5 = var1_1;
                    if (var2_5.ac) {
                        if (var1_1.o) {
                            if (super.b("\u53d8\u8eab\u6d88\u5931")) {
                                var2_5 = var1_1;
                                var1_1.d = var2_5.U;
                                var2_5 = var1_1;
                                var1_1.e = var2_5.V;
                                super.a("\u53d8\u8eab\u51fa\u73b0");
                                return;
                            }
                            if (super.b("\u53d8\u8eab\u51fa\u73b0")) {
                                var1_1.h();
                                var2_5 = var1_1;
                                if (var2_5.ac) {
                                    cn.com.etgame.cls.system.d.a(8, "\u72b6\u6001\u4e2d\u6062\u590d-->" + var1_1.b);
                                    var1_1.l.l();
                                }
                                var2_5 = var1_1;
                                var2_5.c(0);
                                return;
                            }
                        } else {
                            if (super.b("\u53d8\u8eab\u6d88\u5931")) {
                                var2_5 = var1_1;
                                var2_5 = var2_5.Z;
                                var1_1.d = var2_5.U + am.b() + var1_1.s.g;
                                var2_5 = var1_1;
                                var2_5 = var2_5.Z;
                                var1_1.e = var2_5.V + am.b() + var1_1.s.h;
                                super.a("\u53d8\u8eab\u51fa\u73b0");
                                return;
                            }
                            if (super.b("\u53d8\u8eab\u51fa\u73b0")) {
                                var1_1.c(2);
                                return;
                            }
                        }
                    } else if (var1_1.p) {
                        if (var1_1.o) {
                            if (super.b("\u6d88\u5931")) {
                                var2_5 = var1_1;
                                var1_1.d = var2_5.U;
                                var2_5 = var1_1;
                                var1_1.e = var2_5.V;
                                super.a("\u51fa\u73b0");
                                return;
                            }
                            if (super.b("\u51fa\u73b0")) {
                                var1_1.h();
                                if (var1_1.p) {
                                    cn.com.etgame.cls.system.d.a(8, "\u72b6\u6001\u4e2d\u8df3\u8dc3\u6062\u590d-->" + var1_1.b);
                                    var1_1.l.l();
                                }
                                var2_5 = var1_1;
                                var2_5.c(0);
                                return;
                            }
                        } else {
                            if (super.b("\u6d88\u5931")) {
                                var2_5 = var1_1;
                                var2_5 = var2_5.Z;
                                var1_1.d = var2_5.U - am.b() + var1_1.s.g;
                                var2_5 = var1_1;
                                var2_5 = var2_5.Z;
                                var1_1.e = var2_5.V - am.b() + var1_1.s.h;
                                super.a("\u51fa\u73b0");
                                return;
                            }
                            if (super.b("\u51fa\u73b0")) {
                                var1_1.c(2);
                                return;
                            }
                        }
                    }
                    break block35;
                }
                if (!var1_1.b(2)) break block38;
                if (!var1_1.I()) ** GOTO lbl-1000
                var2_6 = var1_1;
                if (!var2_6.ac) {
                    cn.com.etgame.cls.system.d.a(8, "\u653b\u51fb\u4e2d\u6062\u590d-->" + var1_1.b);
                    var1_1.l.l();
                } else if (!var1_1.I() && !var1_1.p) {
                    cn.com.etgame.cls.system.d.a(8, "\u653b\u51fb\u4e2d\u8df3\u8dc3\u6062\u590d-->" + var1_1.b);
                    var1_1.l.l();
                }
                var1_1.h();
                var1_1.a(true);
                return;
            }
            if (var1_1.b(3) || var1_1.b(5) || var1_1.b(6)) {
                if (var1_1.i < 1000) {
                    var2_7 = var1_1;
                    var2_7.c(0);
                    return;
                }
                if (!var1_1.o) {
                    var1_1.a(false);
                    return;
                }
                var2_8 = var1_1;
                var2_8.c(0);
                return;
            }
            if (var1_1.b(7)) {
                if (super.b("\u6b7b\u4ea1\u4e2d")) {
                    super.a("\u6b7b\u4ea1");
                    return;
                }
                if (super.b("\u6b7b\u4ea1") && !var1_1.ad) {
                    var1_1.ad = true;
                    if (!var1_1.I()) {
                        var1_1.l.a((ax)var1_1);
                    }
                }
            }
        }
    }

    public final void b(at object) {
        if (this.r) {
            cn.com.etgame.cls.system.d.a("\u9b54\u6cd5\u91ca\u653e\u5b8c\u6bd5\u7684\u5904\u7406");
            this.l.l();
            this.h();
            object = this;
            ((ax)object).c(0);
        }
    }

    /*
     * Unable to fully structure code
     * Could not resolve type clashes
     */
    public final void a(Object var1_1, Object var2_2) {
        block86: {
            if (var1_1 /* !! */  == null) {
                return;
            }
            var1_1 /* !! */  = (String)var1_1 /* !! */ ;
            if ((var1_1 /* !! */  = var1_1 /* !! */ .trim()).length() <= 0) break block86;
            if (var1_1 /* !! */ .endsWith(";")) {
                var1_1 /* !! */  = var1_1 /* !! */ .substring(0, var1_1 /* !! */ .length() - 1);
            }
            var1_1 /* !! */  = cn.com.etgame.cls.system.d.c((String)var1_1 /* !! */ );
            var5_3 = 0;
            while (var5_3 < var1_1 /* !! */ .length) {
                block88: {
                    block96: {
                        block95: {
                            block94: {
                                block93: {
                                    block92: {
                                        block91: {
                                            block90: {
                                                block89: {
                                                    block87: {
                                                        var1_1 /* !! */ [var5_3] = var1_1 /* !! */ [var5_3].trim();
                                                        var4_7 = cn.com.etgame.cls.system.d.d(var1_1 /* !! */ [var5_3]);
                                                        var3_4 = cn.com.etgame.cls.system.d.e(var1_1 /* !! */ [var5_3]);
                                                        cn.com.etgame.cls.system.d.a(String.valueOf(var1_1 /* !! */ [var5_3]) + "-->" + this.b);
                                                        if (!var1_1 /* !! */ [var5_3].startsWith("attacker")) break block87;
                                                        if (var4_7.equals("hurt")) {
                                                            if (this.I()) {
                                                                this.m.a("slv=" + ((bd)this).n.b(this.s.a));
                                                            } else {
                                                                var8_29 /* !! */  = this;
                                                                this.m.a("slv=" + (var8_29 /* !! */ .H + 20) / 20);
                                                            }
                                                            var8_29 /* !! */  = this;
                                                            if (var8_29 /* !! */ .Z != null) {
                                                                cn.com.etgame.cls.system.d.a(9, "-->" + var3_4[0] + "," + var3_4[1]);
                                                                this.a(Integer.parseInt(var3_4[0]), var3_4[1], (int)this.m.a(var3_4[2]));
                                                            }
                                                        } else if (var4_7.equals("blackGround")) {
                                                            this.l.a(var3_4[0].equals("\u662f") != false);
                                                        } else if (var4_7.equals("splash")) {
                                                            this.l.a(Long.parseLong(var3_4[0]), Integer.parseInt(var3_4[1]));
                                                        } else if (var4_7.equals("shake")) {
                                                            this.l.a(Long.parseLong(var3_4[0]), Integer.parseInt(var3_4[1]), Integer.parseInt(var3_4[2]));
                                                        } else if (var4_7.equals("steal")) {
                                                            var8_29 /* !! */  = this;
                                                            var6_16 = var8_29 /* !! */ .Z.k.a();
                                                            if (var6_16 != null && j.b(20, 100)) {
                                                                var8_29 /* !! */  = this.l;
                                                                var8_29 /* !! */ .a[0].k.a(var6_16);
                                                                var8_29 /* !! */  = this;
                                                                var8_29 /* !! */ .Z.k.a(var6_16, 1);
                                                                this.l.a("\u83b7\u5f97\u7269\u54c1:" + var6_16.a);
                                                            } else {
                                                                this.l.a("\u7269\u54c1\u83b7\u53d6\u5931\u8d25\uff01");
                                                            }
                                                        }
                                                        break block88;
                                                    }
                                                    if (!var1_1 /* !! */ [var5_3].startsWith("skill")) break block89;
                                                    if (var4_7.equals("dmgoftime")) {
                                                        if (this.I()) {
                                                            this.m.a("slv=" + ((bd)this).n.b(this.s.a));
                                                        } else {
                                                            var8_29 /* !! */  = this;
                                                            this.m.a("slv=" + (var8_29 /* !! */ .H + 20) / 20);
                                                        }
                                                        if (this.s.f) {
                                                            var6_17 = this.I() != false ? this.l.b : this.l.a;
                                                            var7_24 = 0;
                                                            while (var7_24 < var6_17.length) {
                                                                if ((j.b((int)this.m.a(var3_4[3]), 100) || this.l.x()) && var6_17[var7_24] != null && var6_17[var7_24].G()) {
                                                                    var6_17[var7_24].u = true;
                                                                    var6_17[var7_24].w.a(this.m.a(var3_4[0]) * 1000L);
                                                                    var6_17[var7_24].x.a(this.m.a(var3_4[1]) * 1000L);
                                                                    var6_17[var7_24].y = (int)this.m.a(var3_4[2]);
                                                                    var6_17[var7_24].w.c();
                                                                    var6_17[var7_24].w.g();
                                                                    var6_17[var7_24].x.c();
                                                                    var6_17[var7_24].x.g();
                                                                }
                                                                ++var7_24;
                                                            }
                                                        } else if (j.b((int)this.m.a(var3_4[3]), 100) || this.l.x()) {
                                                            var8_29 /* !! */  = this;
                                                            if (var8_29 /* !! */ .Z != null) {
                                                                var8_29 /* !! */  = this;
                                                                if (var8_29 /* !! */ .Z.G()) {
                                                                    var8_29 /* !! */  = this;
                                                                    this.Z.u = true;
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.w.a(this.m.a(var3_4[0]) * 1000L);
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.x.a(this.m.a(var3_4[1]) * 1000L);
                                                                    var8_29 /* !! */  = this;
                                                                    this.Z.y = (int)this.m.a(var3_4[2]);
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.w.c();
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.w.g();
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.x.c();
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.x.g();
                                                                }
                                                            }
                                                        }
                                                    } else if (var4_7.equals("stopspeed")) {
                                                        if (this.I()) {
                                                            this.m.a("slv=" + ((bd)this).n.b(this.s.a));
                                                        } else {
                                                            var8_29 /* !! */  = this;
                                                            this.m.a("slv=" + (var8_29 /* !! */ .H + 20) / 20);
                                                        }
                                                        if (this.s.f) {
                                                            var6_18 = this.I() != false ? this.l.b : this.l.a;
                                                            var7_25 = 0;
                                                            while (var7_25 < var6_18.length) {
                                                                if ((j.b((int)this.m.a(var3_4[1]), 100) || this.l.x()) && var6_18[var7_25] != null && var6_18[var7_25].G()) {
                                                                    var6_18[var7_25].z = true;
                                                                    var6_18[var7_25].A.a(this.m.a(var3_4[0]) * 1000L);
                                                                    var6_18[var7_25].A.c();
                                                                    var6_18[var7_25].A.g();
                                                                }
                                                                ++var7_25;
                                                            }
                                                        } else if (j.b((int)this.m.a(var3_4[1]), 100) || this.l.x()) {
                                                            var8_29 /* !! */  = this;
                                                            if (var8_29 /* !! */ .Z != null) {
                                                                var8_29 /* !! */  = this;
                                                                if (var8_29 /* !! */ .Z.G()) {
                                                                    var8_29 /* !! */  = this;
                                                                    this.Z.z = true;
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.A.a(this.m.a(var3_4[0]) * 1000L);
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.A.c();
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.A.g();
                                                                }
                                                            }
                                                        }
                                                    } else if (var4_7.equals("resetspeed")) {
                                                        if (this.I()) {
                                                            this.m.a("slv=" + ((bd)this).n.b(this.s.a));
                                                        } else {
                                                            var8_29 /* !! */  = this;
                                                            this.m.a("slv=" + (var8_29 /* !! */ .H + 20) / 20);
                                                        }
                                                        if (this.s.f) {
                                                            var6_19 = this.I() != false ? this.l.b : this.l.a;
                                                            var7_26 = 0;
                                                            while (var7_26 < var6_19.length) {
                                                                if ((j.b((int)this.m.a(var3_4[0]), 100) || this.l.x()) && var6_19[var7_26] != null && var6_19[var7_26].G()) {
                                                                    var6_19[var7_26].h();
                                                                    var8_29 /* !! */  = var6_19[var7_26];
                                                                    var8_29 /* !! */ .Y.addElement(new a(7, -am.g, -am.h));
                                                                }
                                                                ++var7_26;
                                                            }
                                                        } else if (j.b((int)this.m.a(var3_4[0]), 100) || this.l.x()) {
                                                            var8_29 /* !! */  = this;
                                                            if (var8_29 /* !! */ .Z != null) {
                                                                var8_29 /* !! */  = this;
                                                                if (var8_29 /* !! */ .Z.G()) {
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */ .Z.h();
                                                                    var8_29 /* !! */  = this;
                                                                    var8_29 /* !! */  = var8_29 /* !! */ .Z;
                                                                    var8_29 /* !! */ .Y.addElement(new a(7, -am.g, -am.h));
                                                                }
                                                            }
                                                        }
                                                    } else if (var4_7.equals("kill")) {
                                                        if (!this.l.c) {
                                                            if (this.I()) {
                                                                this.m.a("slv=" + ((bd)this).n.b(this.s.a));
                                                            } else {
                                                                var8_29 /* !! */  = this;
                                                                this.m.a("slv=" + (var8_29 /* !! */ .H + 20) / 20);
                                                            }
                                                            if (this.s.f) {
                                                                var7_27 = this.I() != false ? this.l.b : this.l.a;
                                                                var4_8 = 0;
                                                                while (var4_8 < var7_27.length) {
                                                                    if (j.b((int)this.m.a(var3_4[0]), 100) && var7_27[var4_8] != null && var7_27[var4_8].G()) {
                                                                        var8_29 /* !! */  = var7_27[var4_8];
                                                                        var6_20 = Math.min(var8_29 /* !! */ .I, 999999);
                                                                        var8_29 /* !! */  = var7_27[var4_8];
                                                                        var7_27[var4_8].j(var8_29 /* !! */ .I - var6_20);
                                                                        var8_29 /* !! */  = var7_27[var4_8];
                                                                        var8_29 /* !! */ .Y.addElement(new a(6, -am.g, -am.h));
                                                                    }
                                                                    ++var4_8;
                                                                }
                                                            } else if (j.b((int)this.m.a(var3_4[0]), 100)) {
                                                                var8_29 /* !! */  = this;
                                                                if (var8_29 /* !! */ .Z != null) {
                                                                    var8_29 /* !! */  = this;
                                                                    if (var8_29 /* !! */ .Z.G()) {
                                                                        var8_29 /* !! */  = this;
                                                                        var8_29 /* !! */  = var8_29 /* !! */ .Z;
                                                                        var6_21 = Math.min(var8_29 /* !! */ .I, 999999);
                                                                        v0 = this;
                                                                        var8_29 /* !! */  = v0;
                                                                        var8_29 /* !! */  = this;
                                                                        var8_29 /* !! */  = var8_29 /* !! */ .Z;
                                                                        v0.Z.j(var8_29 /* !! */ .I - var6_21);
                                                                        var8_29 /* !! */  = this;
                                                                        var8_29 /* !! */  = var8_29 /* !! */ .Z;
                                                                        var8_29 /* !! */ .Y.addElement(new a(6, -am.g, -am.h));
                                                                        ** GOTO lbl333
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } else if (var4_7.equals("dmgtohp")) {
                                                        if (this.I()) {
                                                            this.m.a("slv=" + ((bd)this).n.b(this.s.a));
                                                        } else {
                                                            var8_29 /* !! */  = this;
                                                            this.m.a("slv=" + (var8_29 /* !! */ .H + 20) / 20);
                                                        }
                                                        if (j.b((int)this.m.a(var3_4[0]), 100) || this.l.x()) {
                                                            this.B = true;
                                                            var8_29 /* !! */  = this;
                                                            var8_29 /* !! */  = var8_29 /* !! */ .Z;
                                                            var8_29 /* !! */ .Y.addElement(new a(5, -am.g, -am.h));
                                                        }
                                                    } else if (var4_7.equals("clear")) {
                                                        this.B = false;
                                                    }
                                                    break block88;
                                                }
                                                if (!var1_1 /* !! */ [var5_3].startsWith("player") || !this.I()) break block88;
                                                var6_22 = (bd)this;
                                                var7_28 = null;
                                                if (var2_2 != null && var2_2 instanceof ax) {
                                                    var7_28 = (ax)var2_2;
                                                }
                                                if (!var4_7.equals("addatk")) break block90;
                                                if (var7_28 != null && !var7_28.j()) {
                                                    var4_9 = var6_22.a(var6_22.s.a);
                                                    var7_28.D = var4_9 + 2;
                                                    var8_29 /* !! */  = this;
                                                    var7_28.C = (10 + 5 * (var4_9 - 1)) * var8_29 /* !! */ .K / 100;
                                                    this.l.a("\u6b66\u589e\u52a0" + var7_28.C);
                                                }
                                                break block88;
                                            }
                                            if (!var4_7.equals("adddef")) break block91;
                                            if (var7_28 != null && !var7_28.j()) {
                                                var4_10 = var6_22.a(var6_22.s.a);
                                                var7_28.F = var4_10 + 2;
                                                var8_29 /* !! */  = this;
                                                var7_28.E = (10 + 5 * (var4_10 - 1)) * var8_29 /* !! */ .L / 100;
                                                this.l.a("\u9632\u589e\u52a0" + var7_28.E);
                                            }
                                            break block88;
                                        }
                                        if (!var4_7.equals("addspeed")) break block92;
                                        if (var7_28 != null && !var7_28.j()) {
                                            var4_11 = var6_22.a(var6_22.s.a);
                                            var7_28.G = var4_11 + 2;
                                            var7_28.a = 1;
                                            this.l.a("\u901f\u589e\u52a0" + var7_28.a);
                                        }
                                        break block88;
                                    }
                                    if (!var4_7.equals("addAll")) break block93;
                                    cn.com.etgame.cls.system.d.a(11, "this=" + this);
                                    cn.com.etgame.cls.system.d.a(11, "host=" + var2_2);
                                    cn.com.etgame.cls.system.d.a(11, "currentSkill=" + this.s);
                                    try {
                                        var4_12 = var6_22.a(var6_22.s.a);
                                        var3_5 = 0;
                                        while (var3_5 < this.l.a.length) {
                                            if (this.l.a[var3_5] != null && !this.l.a[var3_5].j()) {
                                                this.l.a[var3_5].D = var4_12 + 2;
                                                var8_29 /* !! */  = this;
                                                this.l.a[var3_5].C = (10 + 5 * (var4_12 - 1)) * var8_29 /* !! */ .K / 100;
                                                this.l.a[var3_5].F = var4_12 + 2;
                                                var8_29 /* !! */  = this;
                                                this.l.a[var3_5].E = (10 + 5 * (var4_12 - 1)) * var8_29 /* !! */ .L / 100;
                                                this.l.a[var3_5].G = var4_12 + 2;
                                                this.l.a[var3_5].a = 1;
                                            }
                                            ++var3_5;
                                        }
                                        this.l.a("\u6b66\u9632\u901f\u589e\u52a0");
                                    }
                                    catch (Exception var4_13) {
                                        ag.a().a(var4_13, "plyaer.addAll", 1);
                                    }
                                    break block88;
                                }
                                if (!var4_7.equals("addhp")) break block94;
                                if (var2_2 != null && var2_2 instanceof bd && var7_28 != null && !var7_28.j()) {
                                    this.m.a("slv=" + (var6_22.s == null ? 1 : var6_22.a(var6_22.s.a)));
                                    var4_14 = (int)this.m.a(var3_4[0]);
                                    var8_29 /* !! */  = var7_28;
                                    var7_28.j(var8_29 /* !! */ .I + var4_14);
                                    var8_29 /* !! */  = var7_28;
                                    var8_29 /* !! */ .Y.addElement(new a(3, var4_14, -am.g, -am.h));
                                    this.l.a("\u7cbe\u589e\u52a0" + var4_14 + "\u70b9");
                                }
                                break block88;
                            }
                            if (!var4_7.equals("addhpall")) break block95;
                            cn.com.etgame.cls.system.d.a(11, "this=" + this);
                            cn.com.etgame.cls.system.d.a(11, "host=" + var2_2);
                            cn.com.etgame.cls.system.d.a(11, "currentSkill=" + this.s);
                            var4_7 = this.l.a;
                            this.m.a("slv=" + (var6_22.s == null ? 1 : var6_22.a(var6_22.s.a)));
                            var3_6 = (int)this.m.a(var3_4[0]);
                            var6_23 = 0;
                            while (var6_23 < var4_7.length) {
                                if (var4_7[var6_23] != null && !var4_7[var6_23].j()) {
                                    var8_29 /* !! */  = var4_7[var6_23];
                                    var4_7[var6_23].j(var8_29 /* !! */ .I + var3_6);
                                    var8_29 /* !! */  = var4_7[var6_23];
                                    var8_29 /* !! */ .Y.addElement(new a(3, var3_6, -am.g, -am.h));
                                }
                                ++var6_23;
                            }
                            this.l.a("\u5168\u4f53\u589e\u52a0" + var3_6 + "\u70b9\u7cbe");
                            break block88;
                        }
                        if (!var4_7.equals("againlife")) break block96;
                        if (var7_28 == null) break block88;
                        this.m.a("slv=" + var6_22.a(var6_22.s.a));
                        var4_15 = (int)this.m.a(var3_4[0]);
                        if (var7_28.j()) ** GOTO lbl-1000
                        var8_29 /* !! */  = var7_28;
                        if (var8_29 /* !! */ .I == 0) lbl-1000:
                        // 2 sources

                        {
                            var7_28.j(var4_15);
                            var7_28.c(0);
                            this.l.a("\u590d\u6d3b\u5e76\u52a0" + var4_15 + "\u70b9\u7cbe");
                        } else {
                            var8_29 /* !! */  = var7_28;
                            var7_28.j(var8_29 /* !! */ .I + var4_15);
                            this.l.a("\u52a0" + var4_15 + "\u70b9\u7cbe");
                        }
                        var8_29 /* !! */  = var7_28;
                        var8_29 /* !! */ .Y.addElement(new a(3, var4_15, -am.g, -am.h));
                        break block88;
                    }
                    if (var4_7.equals("setnone")) {
                        if (var7_28 != null && !var7_28.j()) {
                            this.l.a("\u89e3\u9664\u5f02\u5e38\u72b6\u6001");
                        }
                    } else if (var4_7.equals("setnoneall")) {
                        this.l.a("\u5168\u4f53\u89e3\u9664\u5f02\u5e38\u72b6\u6001");
                    }
                }
                ++var5_3;
            }
            if (var2_2 != null) {
                ((q)var2_2).e().b().d = null;
            }
        }
    }

    public final void l() {
        this.u = false;
        this.z = false;
    }

    public final int m() {
        return this.i;
    }

    public final boolean d(int n2) {
        return this.X.a(n2);
    }

    private void a(String string) {
        try {
            cn.com.etgame.cls.system.d.a(7, "\u64ad\u653e\u5e8f\u5217\uff1a" + string + "  (= =)" + this.b);
            at at2 = at.a(this.X.b(string));
            this.c(at2);
            at2.a(this);
            return;
        }
        catch (Throwable throwable) {
            ag.a().a(throwable, "\u64ad\u653e\u52a8\u753b\u5e8f\u5217\uff1a" + string, 1);
            return;
        }
    }

    private boolean b(String string) {
        if (this.e().c != null) {
            return this.X.b(string) != null && this.X.b((String)string).c != null && (int)this.m.a((String)this.e().c) == (int)this.m.a((String)this.X.b((String)string).c);
        }
        return string.equals(this.e().a);
    }

    public final void b(ax ax2) {
        this.Z = ax2;
    }

    public final ax n() {
        return this.Z;
    }

    public final int o() {
        return this.U;
    }

    public final int p() {
        return this.V;
    }

    public final Vector q() {
        return this.Y;
    }

    public final boolean r() {
        return this.ab;
    }

    public final void b(boolean bl2) {
        if (bl2) {
            this.a("\u683c\u6321");
        } else if (this.b("\u683c\u6321")) {
            this.a("\u7ad9\u7acb");
        }
        this.ab = bl2;
    }

    public final int s() {
        return this.O;
    }

    public final void e(int n2) {
        ax ax2 = this;
        this.O = Math.max(0, Math.min(n2, ax2.P));
    }

    public final int t() {
        return this.P;
    }

    public final void f(int n2) {
        this.P = Math.max(1, n2);
    }

    public final void g(int n2) {
        this.K = Math.max(0, n2);
    }

    public final int u() {
        return this.M;
    }

    public final void h(int n2) {
        ax ax2 = this;
        this.M = Math.max(0, Math.min(n2, ax2.N));
    }

    public final int v() {
        return this.N;
    }

    public final void i(int n2) {
        this.N = Math.max(1, n2);
    }

    public final int w() {
        return this.I;
    }

    public final void j(int n2) {
        if (n2 > 0 && this.ad) {
            this.ad = false;
        }
        ax ax2 = this;
        this.I = Math.max(0, Math.min(n2, ax2.J));
    }

    public final int x() {
        return this.J;
    }

    public final void k(int n2) {
        this.J = Math.max(1, n2);
    }

    public final int y() {
        return this.H;
    }

    public final void l(int n2) {
        this.H = Math.max(n2, 1);
    }

    public final void m(int n2) {
        this.L = n2;
    }

    public final void n(int n2) {
        this.Q = Math.max(0, n2);
    }

    public final void o(int n2) {
        this.R = n2;
    }

    public final boolean z() {
        return this.ac;
    }

    public void c(boolean bl2) {
        this.c(9);
        this.ac = bl2;
    }

    public final boolean A() {
        return this.D > 0 && this.C > 0;
    }

    public final boolean B() {
        return this.F > 0 && this.E > 0;
    }

    public final boolean C() {
        return this.G > 0 && this.a > 0;
    }

    public final int D() {
        return this.S;
    }

    public final void p(int n2) {
        this.S = n2;
    }

    public final int E() {
        return this.T;
    }

    public final void q(int n2) {
        this.T = n2;
    }

    public final int F() {
        return this.Q;
    }

    public final boolean G() {
        ax ax2 = this;
        if (this.d == ax2.U) {
            ax2 = this;
            if (this.e == ax2.V) {
                return true;
            }
        }
        return false;
    }

    protected boolean H() {
        return true;
    }

    protected boolean I() {
        return false;
    }
}

