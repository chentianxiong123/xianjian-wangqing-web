/*
 * Decompiled with CFR 0.152.
 */
import java.io.IOException;
import java.util.Hashtable;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class f
extends o
implements aj {
    public bd[] a;
    public g[] b;
    private ax[] d;
    private int[][] e;
    private bd f;
    private d g;
    private d h;
    private d[] i;
    private d[] j;
    private at k;
    private at l;
    private boolean m;
    private boolean n;
    private d o;
    private ax p;
    private ax q;
    private Image[] r;
    private Image[] s;
    private Image[] t;
    private Image[] u;
    private Vector v;
    private Hashtable w;
    private boolean x;
    private boolean y;
    private e z;
    private t A;
    private aa B;
    private cn.com.etgame.cls.system.a C;
    private ag D;
    private bk E;
    private c F;
    private bj[] G;
    private bm[] H;
    private int I;
    private int J;
    private int K;
    private int L;
    private String M;
    private int N;
    private int O;
    private boolean P;
    private boolean Q;
    private boolean R = true;
    private boolean S;
    private int T;
    private String U;
    private boolean V;
    private String W;
    private bk X;
    private bk Y;
    private int Z;
    private String[][] aa;
    private int ab = 0;
    private bk ac;
    private int ad;
    private int ae;
    private int af;
    private bk ag;
    private int ah;
    private boolean ai;
    private boolean aj = false;
    private String ak;
    private boolean al;
    private int am;
    private int an;
    private int ao = 0;
    private boolean ap;
    private Vector aq;
    private String ar;
    private String as;
    public boolean c;

    public f(e e2, bj[] bjArray, String string, int n2, int n3, int n4) {
        this(e2, bjArray, string);
        this.c = true;
        if (!e2.e(99992)) {
            this.ap = true;
            e2.a(99992, true);
            this.G = new bj[3];
        }
        cn.com.etgame.cls.system.d.a("\u5267\u60c5\u6218\u6597:" + n2 + "," + n3 + "," + n4);
        try {
            this.ak = n2 >= 0 ? b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + "H2.str", n2) : null;
            if (this.ak != null) {
                this.am = n3;
                this.an = n4;
            } else {
                this.am = -1;
                this.an = -1;
            }
            cn.com.etgame.cls.system.d.a(2, "\u5267\u60c5\u6218\u6597\u811a\u672c\uff1a" + this.ak);
            return;
        }
        catch (IOException iOException) {
            this.D.a(iOException, "\u5267\u60c5\u6218\u6597\u914d\u7f6e\u6587\u4ef6\u52a0\u8f7d\u5f02\u5e38", 1);
            return;
        }
    }

    public f(e e2, bj[] bjArray, String string) {
        try {
            this.z = e2;
            this.G = bjArray;
            this.c = false;
            this.W = string;
            cn.com.etgame.cls.system.d.b(99999);
            if (e2.e(99991)) {
                this.ap = false;
            }
            this.X = new bk(1000L);
            this.Y = new bk(1000L);
            this.Y.h();
            this.ac = new bk(500L);
            this.ag = new bk(500L);
            this.D = ag.a();
            this.C = cn.com.etgame.cls.system.d.c();
            this.A = new t();
            this.v = new Vector();
            this.w = new Hashtable();
            this.b = new g[3];
            this.d = new ax[6];
            this.e = new int[this.d.length][2];
            this.H = new bm[3];
            this.j = new d[this.H.length];
            this.u = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + "fight_beijing.bin")];
            this.r = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + "fight_ui.bin")];
            this.s = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + "fight.bin")];
            this.t = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + "fight_skill.bin")];
            this.E = new bk(0L);
            this.F = new c(this.I - 8, this.J >> 2, ag.b, cn.com.etgame.cls.system.d.g);
            this.a = new bd[3];
            this.i = new d[this.a.length];
            this.I = this.D.c;
            this.J = this.D.d;
            this.K = this.D.e;
            this.L = this.D.f;
            this.F.a(this.I - 8, this.J >> 2);
            this.f(0);
            am.a();
            return;
        }
        catch (Throwable throwable) {
            this.D.a(throwable, "FightCanvas(rpg )", 1);
            return;
        }
    }

    public final int c() {
        return this.r.length + this.u.length + this.t.length + this.s.length + 2;
    }

    public final void a() {
        try {
            this.C.i();
            return;
        }
        catch (Exception exception) {
            this.D.a(exception, "FightCanvas.init()", 1);
            return;
        }
    }

    public final boolean a(int n2) {
        block47: {
            try {
                block49: {
                    block48: {
                        int n3;
                        if (n2 == 0) {
                            int n4;
                            this.A.a("screen.width=" + this.I);
                            this.A.a("screen.height=" + this.J);
                            this.h = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "fight_ui.ant");
                            this.i[0] = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "fight_cl.ant");
                            this.i[1] = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "fight_lyr.ant");
                            this.i[2] = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "fight_zx.ant");
                            this.o = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "fight_skill.ant");
                            int n5 = 0;
                            f f2 = this;
                            if (f2.ap && this.z.e(99992)) {
                                n4 = 0;
                                while (n4 < this.G.length) {
                                    this.G[n4] = null;
                                    if (n4 == 0) {
                                        this.G[n4] = new bj();
                                        this.G[n4].a(String.valueOf(cn.com.etgame.cls.system.d.A) + "config_instruction.str");
                                        int n6 = 0;
                                        while (n6 < this.G[n4].H().length) {
                                            this.G[n4].H()[n6][1] = 1;
                                            ++n6;
                                        }
                                        this.G[n4].a(true);
                                        this.a[n4] = new bd(this.i[n4], am.a[n4], am.b[n4], this, this.G[n4]);
                                        this.a[n4].c(true);
                                        ++n5;
                                    }
                                    ++n4;
                                }
                            } else {
                                n4 = 0;
                                while (n4 < this.a.length) {
                                    if (this.G[n4] != null && this.z.f(n4)) {
                                        this.G[n4].a(true);
                                        this.a[n4] = new bd(this.i[n4], am.a[n4], am.b[n4], this, this.G[n4]);
                                        ++n5;
                                    } else {
                                        this.a[n4] = null;
                                        this.G[n4].a(false);
                                    }
                                    ++n4;
                                }
                            }
                            this.f = this.a[0];
                            this.d(n5);
                            this.g = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + this.ar + ".ant");
                            n4 = 0;
                            while (n4 < this.H.length) {
                                if (this.H[n4] != null) {
                                    this.j[n4] = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "fight_" + this.H[n4].n() + ".ant");
                                    this.b[n4] = new g(this.j[n4], n4, am.c[n4], am.d[n4], this, this.H[n4]);
                                }
                                ++n4;
                            }
                            n4 = 0;
                            while (n4 < this.a.length) {
                                this.d[n4] = this.a[n4];
                                ++n4;
                            }
                            n4 = this.a.length;
                            while (n4 < this.b.length + this.a.length) {
                                this.d[n4] = this.b[n4 - this.a.length];
                                ++n4;
                            }
                            n4 = 0;
                            while (n4 < this.d.length) {
                                if (this.d[n4] != null) {
                                    this.e[n4][0] = n4;
                                    this.e[n4][1] = this.d[n4].e;
                                    this.d[n4].a(this.s);
                                } else {
                                    this.e[n4][0] = -1;
                                    this.e[n4][1] = -1;
                                }
                                ++n4;
                            }
                            this.B = new aa(this.h, this.r, this.G[0], this);
                            break block47;
                        }
                        if (n2 <= this.r.length) {
                            int n7 = n2 - 1;
                            if (this.h.a(n7)) {
                                bf bf2 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, "fight_ui.bin", n7);
                                if (bf2.a.endsWith(".png")) {
                                    this.r[n7] = Image.createImage((byte[])bf2.b, (int)0, (int)bf2.b.length);
                                } else if (bf2.a.endsWith(".pix")) {
                                    ba ba2 = ba.a(j.a(bf2.b, 0, bf2.b.length));
                                    this.r[n7] = Image.createRGBImage((int[])ba2.c, (int)ba2.a, (int)ba2.b, (boolean)true);
                                }
                            }
                            break block47;
                        }
                        if (n2 <= this.r.length + this.u.length) {
                            int n8 = n2 - this.r.length - 1;
                            if (this.g.a(n8)) {
                                bf bf3 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, "fight_beijing.bin", n8);
                                if (bf3.a.endsWith(".png")) {
                                    this.u[n8] = Image.createImage((byte[])bf3.b, (int)0, (int)bf3.b.length);
                                } else if (bf3.a.endsWith(".pix")) {
                                    ba ba3 = ba.a(j.a(bf3.b, 0, bf3.b.length));
                                    this.u[n8] = Image.createRGBImage((int[])ba3.c, (int)ba3.a, (int)ba3.b, (boolean)true);
                                }
                            }
                            break block47;
                        }
                        if (n2 <= this.r.length + this.u.length + this.s.length) {
                            int n9 = n2 - this.r.length - this.u.length - 1;
                            if (this.e(n9)) {
                                bf bf4 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, "fight.bin", n9);
                                if (bf4.a.endsWith(".png")) {
                                    this.s[n9] = Image.createImage((byte[])bf4.b, (int)0, (int)bf4.b.length);
                                } else if (bf4.a.endsWith(".pix")) {
                                    ba ba4 = ba.a(j.a(bf4.b, 0, bf4.b.length));
                                    this.s[n9] = Image.createRGBImage((int[])ba4.c, (int)ba4.a, (int)ba4.b, (boolean)true);
                                }
                            }
                            break block47;
                        }
                        if (n2 <= this.r.length + this.u.length + this.s.length + this.t.length) {
                            int n10 = n2 - this.r.length - this.u.length - this.s.length - 1;
                            if (this.o.a(n10)) {
                                bf bf5 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, "fight_skill.bin", n10);
                                if (bf5.a.endsWith(".png")) {
                                    this.t[n10] = Image.createImage((byte[])bf5.b, (int)0, (int)bf5.b.length);
                                } else if (bf5.a.endsWith(".pix")) {
                                    ba ba5 = ba.a(j.a(bf5.b, 0, bf5.b.length));
                                    this.t[n10] = Image.createRGBImage((int[])ba5.c, (int)ba5.a, (int)ba5.b, (boolean)true);
                                }
                            }
                            break block47;
                        }
                        if (!j.b(40, 100)) break block48;
                        this.aq = new Vector();
                        while (this.H[n3 = j.a(0, this.H.length - 1)] == null) {
                        }
                        if (this.H[n3] != null) {
                            String[] stringArray = this.H[n3].h();
                            int n11 = 0;
                            while (n11 < stringArray.length) {
                                String[] stringArray2;
                                int n12;
                                if (this.aq.size() < 3 && j.b(n12 = Integer.parseInt(j.a((stringArray2 = j.a(stringArray[n11], "("))[1], ")")[0]), 100)) {
                                    i i2 = new i(stringArray2[0]);
                                    i2.a(j.a(1, 2));
                                    this.aq.addElement(i2);
                                }
                                ++n11;
                            }
                        }
                        if (this.aq.size() != 0) break block49;
                    }
                    this.aq = null;
                }
                this.C.a(this.G);
            }
            catch (Throwable throwable) {
                this.D.a(throwable, "FightCanvas.loadResource(" + n2 + ")", 1);
                System.gc();
                return false;
            }
        }
        return true;
    }

    private void d(int n2) {
        int n3;
        cn.com.etgame.cls.system.d.a(2, String.valueOf(this.W) + ":");
        int n4 = j.a(0, 100);
        n2 = n2 == 1 ? (n4 < 50 ? 1 : (n4 < 95 ? 2 : 3)) : (n2 == 2 ? (n4 < 50 ? 2 : (n4 < 90 ? 3 : 1)) : (n4 < 5 ? 1 : (n4 < 40 ? 2 : 3)));
        String[] stringArray = new bg(String.valueOf(cn.com.etgame.cls.system.d.A) + "enemy.str");
        stringArray = stringArray.a(this.W);
        cn.com.etgame.cls.system.d.a(2, "->>" + (String)stringArray);
        stringArray = j.a((String)stringArray, ",");
        String[] stringArray2 = j.a(stringArray[0], "-");
        int n5 = Integer.parseInt(stringArray[1]);
        this.ar = stringArray[3];
        this.as = stringArray[4];
        if (stringArray[2].startsWith("#")) {
            String[] stringArray3 = j.a(stringArray[2], "#");
            if (this.z.a((stringArray3 = j.a(stringArray3[1], "?"))[0])) {
                stringArray3 = j.a(stringArray3[1], ":");
                stringArray[2] = stringArray3[0];
            } else {
                stringArray3 = j.a(stringArray3[1], ":");
                stringArray[2] = stringArray3[1];
            }
        }
        int n6 = -1;
        int n7 = 0;
        f f2 = this;
        if (f2.ap && this.z.e(99991) && !this.z.e(99992)) {
            cn.com.etgame.cls.system.d.a("************************\u7b2c\u4e00\u6b21\u9047\u602a\u6559\u5b66*****************************************");
            n5 = Integer.parseInt(stringArray2[0]);
            n3 = 3;
            stringArray[2] = "1";
        } else {
            f2 = this;
            if (f2.ap && this.z.e(99992)) {
                cn.com.etgame.cls.system.d.a("**************************\u7b2c\u4e00\u6b21\u5267\u60c5\u6559\u5b66****************************************");
                n5 = Integer.parseInt(stringArray2[0]);
                if (n5 >= 0) {
                    this.a(stringArray[2], n5, 1);
                }
                return;
            }
            if (n5 == 2) {
                do {
                    if (stringArray2.length < 2) {
                        n6 = n5 = Integer.parseInt(stringArray2[0]);
                        continue;
                    }
                    n5 = Integer.parseInt(stringArray2[j.a(0, stringArray2.length - 1)]);
                    n6 = Integer.parseInt(stringArray2[j.a(0, stringArray2.length - 1)]);
                } while (stringArray2.length != 1 && n5 == n6);
            } else {
                n5 = stringArray2.length < 2 ? Integer.parseInt(stringArray2[0]) : Integer.parseInt(stringArray2[j.a(0, stringArray2.length - 1)]);
                this.a(stringArray[2], n5, 1);
                return;
            }
            do {
                n3 = j.a(0, n2);
                n7 = n2 - n3;
            } while (n3 == 0 && n7 == 0 || n3 + n7 > n2);
        }
        cn.com.etgame.cls.system.d.a(2, "\u602a\u72691\u4e2a\u6570\uff1a" + n3);
        cn.com.etgame.cls.system.d.a(2, "\u602a\u72692\u4e2a\u6570\uff1a" + n7);
        if (n5 >= 0 && n3 > 0) {
            int n8 = 0;
            while (n8 < n3) {
                while (this.H[n2 = j.a(0, this.H.length - 1)] != null) {
                }
                this.a(stringArray[2], n5, n2);
                ++n8;
            }
        }
        if (n6 >= 0 && n7 > 0) {
            int n9 = 0;
            while (n9 < n7) {
                while (this.H[n2 = j.a(0, this.H.length - 1)] != null) {
                }
                this.a(stringArray[2], n6, n2);
                ++n9;
            }
        }
    }

    private void a(String string, int n2, int n3) {
        int n4;
        int n5;
        int n6;
        this.H[n3] = new bm();
        bm bm2 = this.H[n3];
        int n7 = this.G[0].e();
        String[] stringArray = j.a(string, "-");
        if (stringArray.length < 2) {
            n5 = n6 = Integer.parseInt(stringArray[0]);
        } else {
            n6 = Integer.parseInt(stringArray[0]);
            n5 = Integer.parseInt(stringArray[1]);
        }
        cn.com.etgame.cls.system.d.a(2, "lvmin=" + n6 + " lvmax=" + n5 + "  playerlv=" + n7);
        if (n7 <= n6) {
            n4 = n6;
        } else if (n7 >= n5) {
            n4 = n5;
        } else {
            n6 = Math.max(n6, n7 - 1);
            n7 = Math.min(n5, n7 + 1);
            n4 = j.a(n6, n7);
        }
        bm2.a(n4);
        cn.com.etgame.cls.system.d.a(2, "\u602a\u7269\u7b49\u7ea7\uff1a" + this.H[n3].p() + " \u914d\u7f6e\u6587\u4ef6id=" + n2);
        this.H[n3].a(String.valueOf(cn.com.etgame.cls.system.d.A) + "fight_" + n2 + ".str");
    }

    private boolean e(int n2) {
        int n3 = 0;
        while (n3 < this.d.length) {
            if (this.d[n3] != null && this.d[n3].d(n2)) {
                return true;
            }
            ++n3;
        }
        return false;
    }

    public final void a(Graphics graphics, int n2, int n3) {
        this.C.c(graphics, n2, n3, this.I, this.J);
    }

    public final void d() {
        ah.e();
        ah.a(null);
        ah.a(-1);
        ah.a(String.valueOf(cn.com.etgame.cls.system.d.B) + this.as);
        ah.d();
        f f2 = this;
        if (f2.ap) {
            this.a(this.ak, this);
        }
    }

    public final void e() {
        this.C.a();
    }

    /*
     * Unable to fully structure code
     */
    public final void a(Graphics var1_1) {
        try {
            block83: {
                block84: {
                    block82: {
                        var1_1.setFont(ag.b);
                        var3_3 = var1_1;
                        var2_4 = this;
                        if (!var2_4.aj) break block82;
                        var3_3.setColor(0);
                        var3_3.setClip(0, 0, var2_4.I, var2_4.J);
                        var3_3.fillRect(0, 0, var2_4.I, var2_4.J);
                        break block83;
                    }
                    var4_5 = 0;
                    var5_13 = 0;
                    if (var2_4.af == 1) {
                        var4_5 = 0 + var2_4.ad;
                        var5_13 = 0 + var2_4.ad;
                    } else if (var2_4.af == 2) {
                        var5_13 = 0 + var2_4.ad;
                    } else if (var2_4.af == 3) {
                        var4_5 = 0 + var2_4.ad;
                    }
                    var6_15 = var2_4.g.b("\u6218\u6597\u80cc\u666f");
                    var3_3.setColor(0);
                    var3_3.setClip(0, 0, var2_4.I, var2_4.J);
                    var3_3.fillRect(0, 0, var2_4.I, var2_4.J);
                    var6_15.a(var3_3, var2_4.u, -var4_5, -var5_13, 0, 0, var2_4.I, var2_4.J, null);
                    if (var2_4.ac.f() != 0L || var2_4.ac.i()) break block84;
                    var2_4.ac.h();
                    ** GOTO lbl-1000
                }
                if (!var2_4.ac.i()) {
                    ** if (var2_4.ad != 0) goto lbl-1000
lbl-1000:
                    // 1 sources

                    {
                        var2_4.ad = var2_4.ae;
                        ** GOTO lbl37
                    }
                }
                break block83;
lbl-1000:
                // 2 sources

                {
                    var2_4.ad = 0;
                }
            }
            var3_3 = var1_1;
            var2_4 = this;
            var6_16 = 0;
            while (var6_16 < var2_4.e.length) {
                if (var2_4.e[var6_16][0] >= 0 && var2_4.d[var2_4.e[var6_16][0]] != null && var2_4.d[var2_4.e[var6_16][0]].e != var2_4.e[var6_16][1]) {
                    var2_4.e[var6_16][1] = var2_4.d[var2_4.e[var6_16][0]].e;
                }
                ++var6_16;
            }
            var6_16 = 0;
            while (var6_16 < var2_4.e.length) {
                var7_17 = var6_16;
                while (var7_17 < var2_4.e.length) {
                    if (var2_4.e[var6_16][0] >= 0 && var2_4.e[var6_16][1] > var2_4.e[var7_17][1]) {
                        var4_6 = var2_4.e[var7_17];
                        var2_4.e[var7_17] = var2_4.e[var6_16];
                        var2_4.e[var6_16] = var4_6;
                    }
                    ++var7_17;
                }
                ++var6_16;
            }
            var6_16 = 0;
            while (var6_16 < var2_4.e.length) {
                if (var2_4.e[var6_16][0] >= 0 && var2_4.d != null && var2_4.d[var2_4.e[var6_16][0]] != null) {
                    if (var2_4.l != null && !var2_4.l.i()) {
                        if (var2_4.m) {
                            if (var2_4.n) {
                                if (var2_4.e[var6_16][0] < var2_4.a.length) {
                                    var2_4.l.a(var3_3, var2_4.t, var2_4.d[var2_4.e[var6_16][0]].d, var2_4.d[var2_4.e[var6_16][0]].e, 0, 0, var2_4.I, var2_4.J, null);
                                }
                            } else if (var2_4.p.I()) {
                                if (var2_4.e[var6_16][0] < var2_4.a.length) {
                                    var2_4.l.a(var3_3, var2_4.t, var2_4.d[var2_4.e[var6_16][0]].o(), var2_4.d[var2_4.e[var6_16][0]].p(), 0, 0, var2_4.I, var2_4.J, null);
                                }
                            } else if (var2_4.e[var6_16][0] >= var2_4.a.length) {
                                var2_4.l.a(var3_3, var2_4.t, var2_4.d[var2_4.e[var6_16][0]].o(), var2_4.d[var2_4.e[var6_16][0]].p(), 0, 0, var2_4.I, var2_4.J, null);
                            }
                        } else if (var2_4.p == var2_4.d[var2_4.e[var6_16][0]]) {
                            if (var2_4.n) {
                                var2_4.l.a(var3_3, var2_4.t, var2_4.p.d, var2_4.p.e, 0, 0, var2_4.I, var2_4.J, null);
                            } else {
                                var2_4.l.a(var3_3, var2_4.t, var2_4.p.o(), var2_4.p.p(), 0, 0, var2_4.I, var2_4.J, null);
                            }
                        }
                    } else {
                        var2_4.l = null;
                    }
                    var2_4.d[var2_4.e[var6_16][0]].a(var3_3);
                }
                ++var6_16;
            }
            var3_3 = var1_1;
            var2_4 = this;
            if (var2_4.k != null && !var2_4.k.i()) {
                if (var2_4.m) {
                    if (var2_4.n) {
                        var4_7 = 0;
                        while (var4_7 < var2_4.a.length) {
                            if (var2_4.a[var4_7] != null) {
                                var2_4.k.a(var3_3, var2_4.t, var2_4.a[var4_7].d, var2_4.a[var4_7].e, 0, 0, var2_4.I, var2_4.J, null);
                            }
                            ++var4_7;
                        }
                    } else if (var2_4.p.I()) {
                        var4_8 = 0;
                        while (var4_8 < var2_4.a.length) {
                            if (var2_4.a[var4_8] != null) {
                                var2_4.k.a(var3_3, var2_4.t, var2_4.a[var4_8].o(), var2_4.a[var4_8].p(), 0, 0, var2_4.I, var2_4.J, null);
                            }
                            ++var4_8;
                        }
                    } else {
                        var4_9 = 0;
                        while (var4_9 < var2_4.b.length) {
                            if (var2_4.b[var4_9] != null) {
                                var2_4.k.a(var3_3, var2_4.t, var2_4.b[var4_9].o(), var2_4.b[var4_9].p(), 0, 0, var2_4.I, var2_4.J, null);
                            }
                            ++var4_9;
                        }
                    }
                } else if (var2_4.n) {
                    var2_4.k.a(var3_3, var2_4.t, var2_4.p.d, var2_4.p.e, 0, 0, var2_4.I, var2_4.J, null);
                } else {
                    var2_4.k.a(var3_3, var2_4.t, var2_4.p.o(), var2_4.p.p(), 0, 0, var2_4.I, var2_4.J, null);
                }
            }
            if (this.ag.f() != 0L && !this.ag.i()) {
                if (this.ai) {
                    var1_1.setColor(this.ah);
                    var1_1.setClip(0, 0, this.I, this.J);
                    var1_1.fillRect(0, 0, this.I, this.J);
                    this.ai = false;
                } else {
                    this.ai = true;
                }
            }
            if (this.V) {
                var3_3 = var1_1;
                var2_4 = this;
                var3_3.setFont(ag.b);
                var4_10 = var2_4;
                if (var4_10.ap) {
                    var2_4.a(10000L, "\u6218\u6597\u80dc\u5229\uff01");
                    if (var2_4.Y.i() && var2_4.Y.f() != 0L) {
                        var2_4.Y.g();
                    }
                } else {
                    if (var2_4.C.a(var3_3, 2, var2_4.J - var2_4.C.e() >> 1, var2_4.B, var2_4.Z == 3) && var2_4.Y.i()) {
                        var2_4.Y.g();
                    }
                    if (var2_4.aa != null) {
                        var4_11 = ag.a.getHeight() + 3;
                        var5_13 = var2_4.aa[var2_4.ab].length * var4_11;
                        var6_16 = var2_4.J - var5_13 - 10 >> 1;
                        if (var2_4.Z == 0) {
                            var2_4.C.a(var3_3, var2_4.K - 10, var2_4.L - 10, 20, 20, false);
                            var2_4.Z = 1;
                        } else if (var2_4.Z == 1) {
                            var2_4.C.a(var3_3, var2_4.K >> 1, var2_4.L - (var5_13 >> 2), var2_4.K, var5_13 >> 1, false);
                            var2_4.Z = 2;
                        } else if (var2_4.Z == 2) {
                            var2_4.C.a(var3_3, 2, var6_16 - 5, var2_4.I - 4, var5_13 + 10, false);
                            var3_3.setClip(0, var6_16 - 5, var2_4.I, var5_13 + 10);
                            var5_13 = 0;
                            while (var5_13 < var2_4.aa[var2_4.ab].length) {
                                var7_19 = var2_4.aa[var2_4.ab][var5_13];
                                if (var7_19.startsWith("#")) {
                                    var3_3.setColor(0xFF0000);
                                    var7_19 = j.a(var7_19, "#")[1];
                                } else {
                                    var3_3.setColor(0);
                                }
                                ag.b(var3_3, 0xFFFFFF, var7_19, var2_4.K, var6_16, 17);
                                var6_16 += var4_11;
                                ++var5_13;
                            }
                        }
                    }
                    if (var2_4.Z == 3) {
                        var3_3.setClip(0, 0, var2_4.I, var2_4.J);
                        var3_3.setColor(0);
                        ag.b(var3_3, 0xFFFFFF, "\u8df3\u8fc7", var2_4.I - 5, var2_4.J - 5, 40);
                    }
                }
                if (var2_4.V && var2_4.Y.f() == 0L) {
                    var2_4.V = false;
                    var2_4.A();
                }
            } else if (this.T == 2 && this.ak == null) {
                this.a(10000L, "\u4f60\u5931\u8d25\u4e86\uff01\uff01");
            } else {
                var3_3 = var1_1;
                var2_4 = this;
                var2_4.B.a(var3_3, var2_4.d);
                var5_13 = var2_4.J - 5;
                var2_4.C.a(var3_3, var2_4.a, 5, var5_13);
                var7_17 = 0;
                while (var7_17 < var2_4.a.length) {
                    if (var2_4.a[var7_17] != null) {
                        var6_16 = 5 + var2_4.C.h() * var7_17;
                        if (var2_4.a[var7_17].A()) {
                            var2_4.B.a(var3_3, 7, var6_16, var5_13 + 5);
                        }
                        if (var2_4.a[var7_17].B()) {
                            var2_4.B.a(var3_3, 8, var6_16, var5_13 + 5);
                        }
                        if (var2_4.a[var7_17].C()) {
                            var2_4.B.a(var3_3, 9, var6_16, var5_13 + 5);
                        }
                    }
                    ++var7_17;
                }
                var4_12 = var2_4;
                if (!var4_12.R && var2_4.S) {
                    var2_4.B.a(var3_3);
                }
                var3_3 = var1_1;
                var2_4 = this;
                var6_16 = var2_4.d.length - 1;
                while (var6_16 >= 0) {
                    if (var2_4.d[var6_16] != null && (var4_12 = var2_4.d[var6_16].q()).size() > 0) {
                        var7_17 = 0;
                        while (var7_17 < var4_12.size()) {
                            var5_14 = (a)var4_12.elementAt(var7_17);
                            if (var5_14.a == 4) {
                                var5_14.a(var3_3, var2_4.d[var6_16].o(), var2_4.d[var6_16].p(), var2_4.B);
                            } else {
                                var5_14.a(var3_3, var2_4.d[var6_16].d, var2_4.d[var6_16].e, var2_4.B);
                            }
                            ++var7_17;
                        }
                    }
                    --var6_16;
                }
            }
            this.C.a(var1_1, this.K, this.L, ag.b, 3);
            this.F.a(var1_1, this.K, this.J - 4, 33, null);
            if (this.B.a(var1_1, this.U)) {
                this.U = null;
            }
            if (this.Q) {
                this.C.a(var1_1, "\u6309*\u952e\u7ee7\u7eed", this.K, this.L, ag.b, 3);
                return;
            }
            if (this.N != 0) {
                this.C.a(var1_1, this.M, this.K, this.L >> 1, ag.b, 33);
                return;
            }
        }
        catch (Throwable var1_2) {
            this.D.a(var1_2, "FightCanvas.paint(g)", 1);
        }
    }

    public final void a(Graphics graphics, int n2, int n3, int n4) {
        if (n4 == 1) {
            this.B.a(graphics, 10, n2, n3);
            return;
        }
        this.B.a(graphics, 11, n2, n3);
    }

    public final void a(int n2, int n3) {
        if (n2 != 0) {
            if (this.Q) {
                if (n2 == 32768) {
                    this.Q = false;
                    ah.d();
                    return;
                }
            } else {
                f f2 = this;
                if (!f2.R && !this.S && this.j()) {
                    return;
                }
                if (this.D.d() == 1 && n2 == 32768) {
                    this.Z = this.aq == null ? 1 : 0;
                    this.ab = this.aq == null ? 1 : 0;
                    this.f(1);
                    return;
                }
                f2 = this;
                if (f2.ap && this.y() && this.N == 0 && !this.F.a() && this.v.size() > 0) {
                    return;
                }
                if (this.N == 65536) {
                    switch (this.D.getGameAction(n2)) {
                        case 65536: 
                        case 131072: 
                        case 262144: {
                            return;
                        }
                    }
                }
                if ((this.N & n2) != 0) {
                    f2 = this;
                    this.N = 0;
                }
                if (this.N == 65536 || this.N == 0) {
                    this.O = n2;
                    this.P = true;
                }
            }
        }
    }

    public final void b() {
        this.N = 0;
    }

    public final void c(int n2) {
    }

    public final void a(boolean bl2) {
        this.aj = bl2;
    }

    public final void a(long l2, int n2) {
        this.ah = n2;
        this.ag.a(l2);
        this.ag.c();
        this.ag.g();
    }

    public final void a(long l2, int n2, int n3) {
        this.af = n2;
        this.ae = n3;
        this.ac.a(l2);
        this.ac.c();
        this.ac.g();
    }

    public final void f() {
        f f2 = this;
        this.R = true;
        this.f.b(true);
        this.f.h();
    }

    public final void h() {
        this.f.b(false);
    }

    public final bd i() {
        bd bd2 = null;
        if (!f.a(this.a)) {
            int n2 = 0;
            int n3 = j.a(0, this.a.length - 1);
            bd2 = this.a[n3];
            while (bd2 == null || bd2.j()) {
                n3 = (n3 + 1) % this.a.length;
                bd2 = this.a[n3];
                if (++n2 <= 4) continue;
                this.z();
                break;
            }
        }
        return bd2;
    }

    public final void g() {
        try {
            int n2 = this.O;
            f f2 = this;
            if (f2.P) {
                f2.P = false;
                if (f2.F.a()) {
                    if (f2.D.getGameAction(n2) == 1) {
                        f2.F.b();
                    }
                } else if (!f2.j() && f2.V) {
                    if (f2.Z == 2 && f2.ab < 2) {
                        ++f2.ab;
                        f2.Z = 0;
                    } else if (f2.Z == 2 && f2.ab == 2) {
                        f2.Z = 3;
                    } else if (f2.D.getGameAction(n2) == 262144) {
                        f2.Y.d();
                    }
                } else if (!(f2.j() || f2.V || f2.al || f2.ak != null)) {
                    f2.Y.d();
                } else if (!f2.R) {
                    f2.B.a(f2.D.getGameAction(n2));
                }
            }
            this.B.a();
            this.C.d();
            if (this.X.f() == 0L) {
                this.X.c();
            }
            if (!this.Q && this.j() && !this.F.a() && this.N == 0) {
                int n3 = 0;
                while (n3 < this.d.length) {
                    if (this.d[n3] != null) {
                        this.d[n3].a();
                    }
                    ++n3;
                }
            }
            if (this.k != null) {
                this.q.a(this.k.b().d, this.p);
                this.k.b().d = null;
                this.k.a();
            }
            if (this.l != null) {
                this.l.a();
                if (this.l.i() || this.l.f() == 0L) {
                    this.l = null;
                }
            }
            if (this.j() && this.C.b()) {
                this.z();
                if (!this.Q && this.N == 0 && !this.F.a()) {
                    this.B();
                }
            } else if (this.T == 1 && !this.V) {
                if (this.Y.i()) {
                    this.V = true;
                    this.Y.c();
                }
            } else if (this.T == 2) {
                if (this.Y.i()) {
                    if (this.ak != null && !this.al) {
                        this.al = true;
                        cn.com.etgame.cls.system.d.a(99999);
                        this.a(this.ak, this);
                    } else if (this.al && !this.Q && this.N == 0 && !this.F.a()) {
                        this.B();
                    } else if (!this.al) {
                        this.Y.c();
                        this.Y.g();
                    }
                } else if (this.z != null && this.Y.f() == 0L && this.C.b()) {
                    this.z = null;
                    this.A();
                }
            }
            this.D.repaint();
            this.D.serviceRepaints();
            return;
        }
        catch (Throwable throwable) {
            this.D.a(throwable, "FightCanvas.update()", 1);
            return;
        }
    }

    private void z() {
        if (f.a(this.a)) {
            this.f(2);
            return;
        }
        if (f.a(this.b)) {
            this.Z = this.aq == null ? 1 : 0;
            this.ab = this.aq == null ? 1 : 0;
            this.f(1);
            cn.com.etgame.cls.system.d.a(2, "=======Win======");
        }
    }

    public static boolean a(ax[] axArray) {
        int n2 = 0;
        while (n2 < axArray.length) {
            if (axArray[n2] != null && !axArray[n2].j()) {
                return false;
            }
            ++n2;
        }
        return true;
    }

    private void A() {
        ah.e();
        ah.a(null);
        f f2 = this;
        int n2 = 0;
        while (n2 < f2.u.length) {
            f2.u[n2] = null;
            ++n2;
        }
        f2.u = null;
        n2 = 0;
        while (n2 < f2.s.length) {
            f2.s[n2] = null;
            ++n2;
        }
        f2.s = null;
        n2 = 0;
        while (n2 < f2.t.length) {
            f2.t[n2] = null;
            ++n2;
        }
        f2.t = null;
        n2 = 0;
        while (n2 < f2.r.length) {
            f2.r[n2] = null;
            ++n2;
        }
        f2.r = null;
        f2.a = null;
        f2.b = null;
        f2.g = null;
        f2.j = null;
        f2.i = null;
        f2.o = null;
        f2.h = null;
        if (this.z == null) {
            this.D.a(new cn.com.etgame.cls.system.b());
            return;
        }
        this.D.a(this.z);
    }

    public final boolean j() {
        return this.T == 0;
    }

    private void f(int n2) {
        this.T = n2;
        switch (n2) {
            case 1: {
                Object object = this;
                if (!((f)object).ap) {
                    int n3;
                    this.aa = new String[3][];
                    object = "";
                    if (this.aq != null) {
                        n3 = 0;
                        while (n3 < this.aq.size()) {
                            i i2 = (i)this.aq.elementAt(n3);
                            this.G[0].c().a(i2.a, i2.d());
                            object = String.valueOf(object) + i2.a + "  " + i2.d() + "\u4e2a\n";
                            ++n3;
                        }
                    }
                    this.aa[0] = j.a((String)object, this.I - 10, ag.b);
                    object = "";
                    n3 = 0;
                    int n4 = 0;
                    int n5 = 0;
                    while (n5 < this.H.length) {
                        if (this.H[n5] != null) {
                            n3 += this.H[n5].d();
                            n4 += this.H[n5].e();
                        }
                        ++n5;
                    }
                    cn.com.etgame.cls.system.d.a(10, "gold=" + n4 + " exp=" + n3 + " =" + cn.com.etgame.cls.system.d.Y.a("\u56db\u500d\u4fee\u884c"));
                    n5 = 0;
                    if (cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.Y.a("\u56db\u500d\u4fee\u884c")))) {
                        n3 <<= 2;
                        n4 <<= 2;
                    }
                    cn.com.etgame.cls.system.d.a(10, "-->>gold=" + n4 + " exp=" + n3);
                    if (n4 > 0) {
                        this.G[0].h(this.G[0].g() + n4);
                        object = String.valueOf(object) + "\u83b7\u5f97" + n4 + "\u91d1\u5e01\n";
                    }
                    this.aa[1] = j.a((String)object, this.I - 10, ag.b);
                    object = "";
                    n4 = 0;
                    while (n4 < this.a.length) {
                        if (this.a[n4] != null && this.G[n4] != null && this.G[n4].I()) {
                            this.G[n4].n(this.a[n4].s());
                            this.G[n4].l(this.a[n4].u());
                            if (this.a[n4].j()) {
                                this.G[n4].k(this.G[n4].k() - 5);
                                this.G[n4].j(1);
                            } else {
                                this.G[n4].k(this.a[n4].E());
                                this.G[n4].j(this.a[n4].w());
                                if (this.G[n4].g(n3)) {
                                    object = String.valueOf(object) + "#" + this.G[n4].a + "\u5347\u7ea7\u4e86\uff01\uff01\n";
                                } else if (this.G[n4].e() == 45 && !cn.com.etgame.cls.system.d.c(500)) {
                                    object = String.valueOf(object) + "#" + this.G[n4].a + "\u5df2\u5230\u8fbe\u7b49\u7ea7\u4e0a\u9650\n";
                                    n5 = 1;
                                } else {
                                    object = String.valueOf(object) + this.G[n4].a + "\u83b7\u5f97" + n3 + "\u70b9\u7ecf\u9a8c\n";
                                }
                            }
                        }
                        ++n4;
                    }
                    if (n5 != 0) {
                        object = String.valueOf(object) + "#\u5546\u57ce\u201c\u8fde\u5347\u5341\u7ea7\u201d\n";
                        object = String.valueOf(object) + "#\u53ef\u53d6\u6d88\u7b49\u7ea7\u4e0a\u9650\n";
                    }
                    this.aa[2] = j.a((String)object, this.I - 10, ag.b);
                    this.C.a(this.G, true);
                }
                this.V = true;
                this.Y.c();
                return;
            }
            case 2: {
                this.Y.c();
                return;
            }
        }
    }

    /*
     * Unable to fully structure code
     */
    private void B() {
        if (this.E.f() <= 0L && !this.x) ** GOTO lbl15
        return;
lbl-1000:
        // 1 sources

        {
            var1_1 = (Object[])this.v.firstElement();
            var2_2 = (String)var1_1[0];
            var3_3 = cn.com.etgame.cls.system.d.d(var2_2);
            this.v.removeElementAt(0);
            if (var2_2.startsWith("script") && (var3_3.equals("wait") || var3_3.equals("break"))) {
                if (!this.a(cn.com.etgame.cls.system.d.g(var2_2))) continue;
                if (!var3_3.equals("wait")) break;
                this.E.a((int)this.A.a(cn.com.etgame.cls.system.d.e(var2_2)[0]));
                this.E.c();
                this.E.g();
                return;
            }
            this.a(var2_2, var1_1[1]);
lbl15:
            // 3 sources

            ** while (this.v.size() > 0)
        }
lbl16:
        // 2 sources

    }

    private boolean a(String[] stringArray) {
        int n2 = 0;
        while (n2 < stringArray.length) {
            stringArray[n2] = stringArray[n2].trim();
            if (stringArray[n2].length() > 0) {
                if (stringArray[n2].startsWith("eventMarked")) {
                    if (this.A.a("event" + cn.com.etgame.cls.system.d.f(stringArray[n2])[0]) == 0L) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("!eventMarked")) {
                    if (this.A.a("event" + cn.com.etgame.cls.system.d.f(stringArray[n2])[0]) == 1L) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("feeMarked")) {
                    if (!cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.f(stringArray[n2])[0]))) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("!feeMarked")) {
                    if (cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.f(stringArray[n2])[0]))) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            ++n2;
        }
        return true;
    }

    /*
     * Unable to fully structure code
     * Could not resolve type clashes
     */
    public final void a(Object var1_1, Object var2_2) {
        block108: {
            if (var1_1 /* !! */  == null) {
                return;
            }
            var1_1 /* !! */  = (String)var1_1 /* !! */ ;
            if ((var1_1 /* !! */  = var1_1 /* !! */ .trim()).length() <= 0) break block108;
            if (var1_1 /* !! */ .endsWith(";")) {
                var1_1 /* !! */  = var1_1 /* !! */ .substring(0, var1_1 /* !! */ .length() - 1);
            }
            var1_1 /* !! */  = cn.com.etgame.cls.system.d.c((String)var1_1 /* !! */ );
            var5_3 = 0;
            while (var5_3 < var1_1 /* !! */ .length) {
                block107: {
                    block109: {
                        var3_4 = false;
                        var1_1 /* !! */ [var5_3] = var1_1 /* !! */ [var5_3].trim();
                        var4_12 = cn.com.etgame.cls.system.d.d(var1_1 /* !! */ [var5_3]);
                        if (!var1_1 /* !! */ [var5_3].startsWith("script")) ** GOTO lbl-1000
                        if (!var4_12.equals("openScriptList")) break block109;
                        this.x = true;
                        this.y = true;
                        var3_4 = true;
                        ** GOTO lbl-1000
                    }
                    if (var4_12.equals("closeScriptList")) {
                        this.x = false;
                        this.y = false;
                    } else if (this.x && !var3_4) {
                        if (!this.y) {
                            cn.com.etgame.cls.system.d.a("<< " + var1_1 /* !! */ [var5_3]);
                            this.v.addElement(new Object[]{var1_1 /* !! */ [var5_3], var2_2});
                        }
                    } else {
                        var3_5 = cn.com.etgame.cls.system.d.e(var1_1 /* !! */ [var5_3]);
                        cn.com.etgame.cls.system.d.a(var1_1 /* !! */ [var5_3]);
                        if (this.a(cn.com.etgame.cls.system.d.g(var1_1 /* !! */ [var5_3]))) {
                            if (var1_1 /* !! */ [var5_3].startsWith("player")) {
                                if (var4_12.equals("setmetos")) {
                                    this.a[0].c(true);
                                } else if (var2_2 != null && var2_2 instanceof bd) {
                                    var6_13 = (bd)var2_2;
                                    if (var4_12.equals("addspeed")) {
                                        var3_6 = Integer.parseInt(var3_5[0]);
                                        var6_13.n(var6_13.F() + var3_6);
                                        var6_13.n.s(var6_13.n.z() + var3_6);
                                        var6_13.q().addElement(new a(3, var3_6, -am.g, -am.h));
                                        var7_16 = "\u52a0" + var3_6 + "\u70b9\u901f";
                                        var4_12 = this;
                                        this.U = var7_16;
                                        this.v();
                                    } else if (var4_12.equals("addluck")) {
                                        var3_7 = Integer.parseInt(var3_5[0]);
                                        var6_13.p(var6_13.D() + var3_7);
                                        var6_13.n.t(var6_13.n.A() + var3_7);
                                        var6_13.q().addElement(new a(3, var3_7, -am.g, -am.h));
                                        var7_16 = "\u52a0" + var3_7 + "\u70b9\u8fd0";
                                        var4_12 = this;
                                        this.U = var7_16;
                                        this.v();
                                    } else if (var4_12.equals("addgod")) {
                                        var3_8 = Integer.parseInt(var3_5[0]);
                                        var6_13.h(var6_13.u() + var3_8);
                                        var6_13.q().addElement(new a(3, var3_8, -am.g, -am.h));
                                        var7_16 = "\u52a0" + var3_8 + "\u70b9\u795e";
                                        var4_12 = this;
                                        this.U = var7_16;
                                        this.v();
                                    } else if (var4_12.equals("addhp")) {
                                        var3_9 = Integer.parseInt(var3_5[0]);
                                        var6_13.j(var6_13.w() + var3_9);
                                        var6_13.q().addElement(new a(3, var3_9, -am.g, -am.h));
                                        var7_16 = "\u52a0" + var3_9 + "\u70b9\u7cbe";
                                        var4_12 = this;
                                        this.U = var7_16;
                                        this.v();
                                    } else if (var4_12.equals("setnone")) {
                                        var6_13.l();
                                        var7_16 = "\u89e3\u9664\u5f02\u5e38\u72b6\u6001";
                                        var4_12 = this;
                                        this.U = var7_16;
                                    } else if (var4_12.equals("againlife")) {
                                        var3_10 = Integer.parseInt(var3_5[0]);
                                        if (var6_13.j() || var6_13.w() == 0) {
                                            var6_13.j(var3_10);
                                            var6_13.c(0);
                                            var7_16 = "\u590d\u6d3b\u5e76\u52a0" + var3_10 + "\u70b9\u7cbe";
                                            var4_12 = this;
                                            this.U = var7_16;
                                        } else {
                                            var6_13.j(var6_13.w() + var3_10);
                                            var7_16 = "\u52a0" + var3_10 + "\u70b9\u7cbe";
                                            var4_12 = this;
                                            this.U = var7_16;
                                        }
                                        var6_13.q().addElement(new a(3, var3_10, -am.g, -am.h));
                                        this.v();
                                    }
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("dialogBox")) {
                                if (var4_12.equals("setText")) {
                                    this.F.a(var3_5[0]);
                                } else if (var4_12.equals("setType")) {
                                    this.F.a(var3_5[0].equals("type_right"));
                                } else if (var4_12.equals("showDialog")) {
                                    this.F.b(true);
                                } else if (var4_12.equals("hideDialog")) {
                                    this.F.b(false);
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("script")) {
                                if (var4_12.equals("load")) {
                                    try {
                                        this.w.put(var3_5[0], b.a("/str/" + var3_5[0] + ".str"));
                                    }
                                    catch (IOException var6_14) {
                                        this.D.a(var6_14, "RolePlayingCanvas.parse(script,host)", 1);
                                    }
                                } else if (var4_12.equals("include")) {
                                    try {
                                        var6_13 = this.w.get(var3_5[0]);
                                        if (var6_13 == null) {
                                            this.a(b.a("/str/" + var3_5[0] + ".str", (int)this.A.a(var3_5[1])), var2_2);
                                            break block107;
                                        }
                                        this.a(((String[])var6_13)[(int)this.A.a(var3_5[1])], var2_2);
                                    }
                                    catch (IOException var6_15) {
                                        this.D.a(var6_15, "RolePlayingCanvas.parse(script,host)", 1);
                                    }
                                } else if (var4_12.equals("openScriptList")) {
                                    this.y = false;
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("game")) {
                                if (var4_12.equals("markEvent")) {
                                    this.A.a("event" + var3_5[0] + "=1");
                                } else if (var4_12.equals("unmarkEvent")) {
                                    this.A.a("event" + var3_5[0] + "=0");
                                } else if (var4_12.equals("waitForKey")) {
                                    var6_13 = j.a(var3_5[0], "|");
                                    this.M = var3_5[1];
                                    var4_12 = this;
                                    this.N = 0;
                                    var3_11 = 0;
                                    while (var3_11 < ((bd)var6_13).length) {
                                        if (var6_13[var3_11].equals("0")) {
                                            this.N |= 32;
                                        } else if (var6_13[var3_11].equals("1")) {
                                            this.N |= 64;
                                        } else if (var6_13[var3_11].equals("2")) {
                                            this.N |= 128;
                                        } else if (var6_13[var3_11].equals("3")) {
                                            this.N |= 256;
                                        } else if (var6_13[var3_11].equals("4")) {
                                            this.N |= 512;
                                        } else if (var6_13[var3_11].equals("5")) {
                                            this.N |= 1024;
                                        } else if (var6_13[var3_11].equals("6")) {
                                            this.N |= 2048;
                                        } else if (var6_13[var3_11].equals("7")) {
                                            this.N |= 4096;
                                        } else if (var6_13[var3_11].equals("8")) {
                                            this.N |= 8192;
                                        } else if (var6_13[var3_11].equals("9")) {
                                            this.N |= 16384;
                                        } else if (var6_13[var3_11].equals("*")) {
                                            this.N |= 32768;
                                        } else if (var6_13[var3_11].equals("#")) {
                                            this.N |= 65536;
                                        } else if (var6_13[var3_11].equals("left")) {
                                            this.N |= 8;
                                        } else if (var6_13[var3_11].equals("right")) {
                                            this.N |= 16;
                                        } else if (var6_13[var3_11].equals("up")) {
                                            this.N |= 2;
                                        } else if (var6_13[var3_11].equals("down")) {
                                            this.N |= 4;
                                        } else if (var6_13[var3_11].equals("fire")) {
                                            this.N |= 1;
                                        }
                                        ++var3_11;
                                    }
                                } else if (var4_12.equals("backToRPG")) {
                                    if (this.G[1] != null) {
                                        this.G[1].a(false);
                                    }
                                    if (this.G[2] != null) {
                                        this.G[2].a(false);
                                    }
                                    this.G[0].a();
                                    this.z.u();
                                    this.A();
                                } else if (var4_12.equals("backToMenu")) {
                                    this.z = null;
                                    this.A();
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("system")) {
                                if (var4_12.equals("showInfo")) {
                                    this.a(this.A.a(var3_5[1]), var3_5[0]);
                                }
                                if (var4_12.equals("showAsideInfo")) {
                                    this.C.a(this.I, var3_5[0], this.A.a(var3_5[1]));
                                } else if (var4_12.equals("markFee")) {
                                    cn.com.etgame.cls.system.d.a(Integer.parseInt(var3_5[0]));
                                } else if (var4_12.equals("unmarkFee")) {
                                    cn.com.etgame.cls.system.d.b(Integer.parseInt(var3_5[0]));
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("midi")) {
                                if (var4_12.equals("play")) {
                                    ah.e();
                                    ah.a(null);
                                    ah.a((int)this.A.a(var3_5[1]));
                                    ah.a("/mid/" + var3_5[0] + ".mid");
                                    ah.d();
                                } else if (var4_12.equals("stop")) {
                                    ah.e();
                                    ah.a(null);
                                }
                            }
                        }
                    }
                }
                ++var5_3;
            }
        }
    }

    public final void n() {
        this.D.f();
    }

    public final void o() {
        this.D.g();
    }

    public final void p() {
    }

    public final void r() {
        this.Q = true;
        ah.e();
    }

    public final void a(int n2, bj bj2) {
        int n3 = n2;
        if (cn.com.etgame.cls.system.d.U[n3].b != 0) {
            n3 = n2;
            if (cn.com.etgame.cls.system.d.U[n3].b != 7 && bj2.a(n2)) {
                String string = "\u9886\u609f\u4e86\u65b0\u6280\u80fd";
                f f2 = this;
                this.U = string;
            }
        }
    }

    public final void a(af af2, ax ax2, ax ax3) {
        try {
            this.k = at.a(this.o.b(af2.e));
        }
        catch (Exception exception) {
            cn.com.etgame.cls.system.d.a(2, "\u9b54\u6cd5\uff1a" + af2);
            cn.com.etgame.cls.system.d.a(2, "\u9b54\u6cd5\u540d\uff1a" + af2.d);
        }
        try {
            this.l = this.o.b(String.valueOf(af2.e) + "d");
        }
        catch (Exception exception) {
            this.l = null;
        }
        this.m = af2.i;
        this.n = af2.c;
        if (this.k != null) {
            this.p = ax2;
            this.q = ax3;
            this.k.a(ax3);
            this.k.b(0);
            this.k.a(1);
            this.k.g();
        }
        if (this.l != null) {
            this.l.a(ax3);
            this.l.b(0);
            this.l.a(1);
            this.l.g();
        }
    }

    public final void a(ax ax2) {
        int n2 = 0;
        while (n2 < this.b.length) {
            if (this.b[n2] == ax2) {
                this.b[n2] = null;
            }
            ++n2;
        }
        n2 = 0;
        while (n2 < this.d.length) {
            if (this.d[n2] != null && this.d[n2].n() == ax2) {
                return;
            }
            ++n2;
        }
        n2 = 0;
        while (n2 < this.d.length) {
            if (this.d[n2] == ax2) {
                this.d[n2] = null;
            }
            ++n2;
        }
    }

    public final void a(bd bd2) {
        if (bd2.w() > 0) {
            this.f = bd2;
            f f2 = this;
            this.R = false;
            boolean bl2 = true;
            f2 = this;
            this.S = bl2;
            int n2 = 0;
            while (n2 < this.a.length) {
                if (this.a[n2] != null && this.a[n2] == bd2) {
                    this.B.b(n2);
                    break;
                }
                ++n2;
            }
        }
        f f3 = this;
        if (f3.ap) {
            this.a(this.ak, this);
        }
    }

    public final void k() {
        this.R = false;
    }

    public final void l() {
        this.R = true;
    }

    public final boolean m() {
        return this.R;
    }

    public final bd q() {
        return this.f;
    }

    public final int s() {
        return this.J;
    }

    public final int t() {
        return this.I;
    }

    public final void a(String string) {
        this.U = string;
    }

    private void a(long l2, String string) {
        this.B.a(l2);
        this.U = string;
    }

    public final boolean u() {
        return this.X.i();
    }

    public final void v() {
        this.X.c();
        this.X.g();
    }

    public final void w() {
        ++this.ao;
        cn.com.etgame.cls.system.d.a(2, "\u56de\u5408\u6570\u7d2f\u52a0:" + this.ao);
        if (this.ao == this.am || this.ao == this.an) {
            f f2 = this;
            if (!f2.ap) {
                this.a(this.ak, this);
            }
        }
    }

    public final boolean x() {
        return this.ap;
    }

    public final boolean y() {
        return this.A.a("event500") == 0L;
    }

    public final void b(boolean bl2) {
        this.S = bl2;
    }
}

