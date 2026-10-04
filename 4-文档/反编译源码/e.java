/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.FilterInputStream;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.util.Hashtable;
import java.util.Vector;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;
import javax.microedition.rms.RecordStore;

public final class e
extends o
implements aj,
an,
aw,
bi {
    private Image a;
    private Graphics b;
    private Image c;
    private Image[] d;
    private Image[] e;
    private Image[] f;
    private Image[] g;
    private Image[] h;
    private Image[] i;
    private d j;
    private d k;
    private d l;
    private d m;
    private ac n;
    private bl[] o;
    private ay p;
    private w q;
    private Vector r;
    private Vector s;
    private Vector t;
    private Vector u;
    private Vector v;
    private Hashtable w;
    private String x;
    private String y;
    private String z;
    private String A;
    private String B;
    private int C;
    private int D;
    private int E;
    private int F;
    private int G;
    private String H;
    private String I;
    private bk J;
    private bk K;
    private bk L;
    private bk M;
    private bk N;
    private ag O;
    private t P;
    private boolean Q;
    private boolean R;
    private boolean S;
    private boolean T;
    private boolean U;
    private boolean V;
    private int W;
    private int X;
    private ay[] Y;
    private int[] Z;
    private int[] aa;
    private int[] ab;
    private ay ac;
    private int ad;
    private int ae;
    private int af;
    private int ag;
    private int ah;
    private int ai;
    private int aj;
    private int ak;
    private int al;
    private boolean am;
    private ae an;
    private a ao;
    private c ap;
    private bj[] aq;
    private bj ar;
    private int as;
    private int at;
    private int au;
    private int av;
    private b aw;
    private int ax;
    private int ay;
    private int az;
    private int aA;
    private boolean aB;
    private int[] aC;
    private boolean aD;
    private boolean aE;
    private boolean aF;
    private boolean aG;
    private String[] aH;
    private String[] aI;
    private int aJ;
    private int aK;
    private int aL;
    private int aM;
    private boolean aN;
    private int aO;
    private String aP;
    private Vector aQ;
    private boolean aR = true;
    private String aS;
    private int aT;
    private bk aU;
    private boolean aV;

    public e(b b2) {
        try {
            this.aw = b2;
            this.O = ag.a();
            this.ao = cn.com.etgame.cls.system.d.c();
            this.ap = new c(this.as - 8, this.at >> 2, ag.b, cn.com.etgame.cls.system.d.g);
            this.aq = new bj[3];
            this.P = new t();
            this.K = new bk(1000L);
            this.J = new bk(1000L);
            this.L = new bk(200L);
            this.M = new bk(3000L);
            this.N = new bk(0L);
            this.aU = new bk(300L);
            this.r = new Vector();
            this.v = new Vector();
            this.s = new Vector();
            this.t = new Vector();
            this.u = new Vector();
            this.aQ = new Vector();
            this.w = new Hashtable();
            this.d = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + cn.com.etgame.cls.system.d.E)];
            this.e = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + cn.com.etgame.cls.system.d.I)];
            this.h = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + cn.com.etgame.cls.system.d.J)];
            this.aC = new int[2];
            this.o = new bl[2];
            this.i = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + "ui.bin")];
            this.Y = new ay[12];
            this.Z = new int[12];
            this.aa = new int[12];
            this.ab = new int[12];
            this.as = this.O.c;
            this.at = this.O.d;
            this.au = this.O.e;
            this.av = this.O.f;
            this.X = this.as + 20;
            this.af = this.as >> 3;
            this.ag = this.at >> 3;
            this.ak = this.at / 6;
            this.ap.a(this.as - 8, this.at >> 2);
            this.x = cn.com.etgame.cls.system.d.K;
            this.y = cn.com.etgame.cls.system.d.L;
            this.z = cn.com.etgame.cls.system.d.M;
            this.A = cn.com.etgame.cls.system.d.N;
            this.R = true;
            return;
        }
        catch (Throwable throwable) {
            this.O.a(throwable, "RolePlayingCanvas()", 1);
            return;
        }
    }

    public final void a() {
        this.F = -1;
        this.G = -1;
        if (this.aw != null) {
            this.x = this.aw.c;
            this.y = this.aw.d;
            this.z = this.aw.e;
            this.A = this.aw.f;
        }
        try {
            this.ao.i();
            this.f = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + this.A)];
            if (this.aR) {
                this.g = new Image[x.a(String.valueOf(cn.com.etgame.cls.system.d.z) + this.z)];
                return;
            }
        }
        catch (Throwable throwable) {
            this.O.a(throwable, "RolePlayingCanvas.init()", 1);
        }
    }

    public final void b() {
        this.c = this.q.b();
        this.s.removeAllElements();
        this.t.removeAllElements();
        this.u.removeAllElements();
        this.aQ.removeAllElements();
        int n2 = 0;
        while (n2 < this.e.length) {
            this.e[n2] = null;
            ++n2;
        }
        n2 = 0;
        while (n2 < this.f.length) {
            this.f[n2] = null;
            ++n2;
        }
        this.f = null;
        if (this.aR) {
            n2 = 0;
            while (n2 < this.g.length) {
                this.g[n2] = null;
                ++n2;
            }
            this.g = null;
        }
        this.l = null;
        int n3 = 0;
        while (n3 < this.q.c.length) {
            short[][] sArray = this.q.c[n3].c();
            int n4 = 0;
            while (sArray != null && n4 < sArray.length) {
                sArray[n4] = null;
                ++n4;
            }
            ++n3;
        }
        n3 = 0;
        while (n3 < 12) {
            this.Y[n3] = null;
            ++n3;
        }
        this.q = null;
        this.I = null;
        this.ap.a((at)null);
        this.ap.a((String)null);
        this.r.removeAllElements();
        this.v.removeAllElements();
        this.w.clear();
        System.gc();
    }

    public final int c() {
        return this.d.length + this.e.length + this.f.length + this.g.length + this.h.length + this.i.length + 2;
    }

    public final boolean a(int n2) {
        try {
            if (n2 == 0) {
                if (!this.Q) {
                    this.P.a("screen.width=" + this.as);
                    this.P.a("screen.height=" + this.at);
                    this.k = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + cn.com.etgame.cls.system.d.D);
                    this.m = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + cn.com.etgame.cls.system.d.H);
                    this.j = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "ui.ant");
                    this.an = new ae(this, this.ao, this.j, this.i);
                    cn.com.etgame.cls.system.d.a(2, "\u7b2c\u4e00\u6b21\u52a0\u8f7d:" + cn.com.etgame.cls.system.d.D);
                    this.n = new ac(this.k, this.C, this.D, this.ao, this);
                    this.n.a(0, true, true);
                    this.n.a(this.d);
                    this.n.a(this);
                }
                if (!this.aD) {
                    this.aF = true;
                    this.ao.a(this.au, this.av);
                    if (this.aw == null) {
                        this.n.a_(this.C);
                        this.n.b_(this.D);
                        if (this.E != -1) {
                            this.n.a(this.E);
                        }
                    }
                    this.l = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + this.y);
                    if (this.aw == null) {
                        this.q = w.a(String.valueOf(cn.com.etgame.cls.system.d.x) + this.x, this.l, this);
                    }
                    if (!this.Q) {
                        this.aq[0] = new bj();
                        this.aq[1] = new bj();
                        this.aq[2] = new bj();
                        this.ar = this.aq[0];
                        if (this.aw != null) {
                            this.A();
                        } else {
                            this.aq[0].a(String.valueOf(cn.com.etgame.cls.system.d.A) + cn.com.etgame.cls.system.d.C);
                            this.aq[1].a(String.valueOf(cn.com.etgame.cls.system.d.A) + cn.com.etgame.cls.system.d.F);
                            this.aq[2].a(String.valueOf(cn.com.etgame.cls.system.d.A) + cn.com.etgame.cls.system.d.G);
                        }
                    }
                    if (this.aw != null) {
                        int n3 = 1;
                        int n4 = 0;
                        int n5 = this.s.size();
                        while (n4 < n5) {
                            bl bl2 = (bl)this.s.elementAt(n4);
                            int n6 = 0;
                            while (n6 < this.q.c.length) {
                                if (bl2.o().equals(this.q.c[n6].a)) {
                                    n3 = n6;
                                    break;
                                }
                                ++n6;
                            }
                            this.q.c[n3].a(bl2);
                            ++n4;
                        }
                        n4 = 0;
                        n5 = this.r.size();
                        while (n4 < n5) {
                            this.q.c[2].a((r)this.r.elementAt(n4));
                            ++n4;
                        }
                    }
                    if (cn.com.etgame.cls.system.d.T) {
                        this.q.a(this.c);
                        if (!this.q.a()) {
                            this.q.a(this.O.c, this.O.d);
                            this.q.a(true);
                        }
                    }
                } else if (cn.com.etgame.cls.system.d.T) {
                    this.q.a(true);
                }
                this.q.a(this.g);
            } else if (n2 <= this.d.length) {
                int n7 = n2 - 1;
                cn.com.etgame.cls.system.d.a(4, "(isFighting || !initialized)=" + (this.aD || !this.Q));
                if ((this.aD || !this.Q) && this.k.a(n7)) {
                    cn.com.etgame.cls.system.d.a(4, "imgPlayer=" + n2);
                    bf bf2 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, cn.com.etgame.cls.system.d.E, n7);
                    if (bf2.a.endsWith(".png")) {
                        this.d[n7] = this.S && n7 != 0 && n7 != 1 && n7 != 11 ? j.b(bf2.b, 0, bf2.b.length) : Image.createImage((byte[])bf2.b, (int)0, (int)bf2.b.length);
                    } else if (bf2.a.endsWith(".pix")) {
                        ba ba2 = ba.a(j.a(bf2.b, 0, bf2.b.length));
                        this.d[n7] = Image.createRGBImage((int[])ba2.c, (int)ba2.a, (int)ba2.b, (boolean)true);
                    }
                }
            } else if (n2 <= this.d.length + this.e.length) {
                int n8 = n2 - this.d.length - 1;
                bf bf3 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, cn.com.etgame.cls.system.d.I, n8);
                if (this.i(n8)) {
                    cn.com.etgame.cls.system.d.a(4, "imgNpc=" + n2);
                    if (bf3.a.endsWith(".png")) {
                        this.e[n8] = this.S && n8 != 0 && n8 != 1 && n8 != 11 ? j.b(bf3.b, 0, bf3.b.length) : Image.createImage((byte[])bf3.b, (int)0, (int)bf3.b.length);
                    } else if (bf3.a.endsWith(".pix")) {
                        ba ba3 = ba.a(j.a(bf3.b, 0, bf3.b.length));
                        this.e[n8] = Image.createRGBImage((int[])ba3.c, (int)ba3.a, (int)ba3.b, (boolean)true);
                    }
                }
            } else if (n2 <= this.d.length + this.e.length + this.f.length) {
                int n9 = n2 - this.d.length - this.e.length - 1;
                if (this.q.a(n9)) {
                    cn.com.etgame.cls.system.d.a(4, "imgTile=" + n2);
                    bf bf4 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, this.A, n9);
                    if (bf4.a.endsWith(".png")) {
                        this.f[n9] = this.S ? j.b(bf4.b, 0, bf4.b.length) : Image.createImage((byte[])bf4.b, (int)0, (int)bf4.b.length);
                    } else if (bf4.a.endsWith(".pix")) {
                        ba ba4 = ba.a(j.a(bf4.b, 0, bf4.b.length));
                        this.f[n9] = Image.createRGBImage((int[])ba4.c, (int)ba4.a, (int)ba4.b, (boolean)true);
                    }
                }
            } else if (n2 <= this.d.length + this.e.length + this.f.length + this.g.length) {
                int n10 = n2 - this.d.length - this.e.length - this.f.length - 1;
                if (this.aR && this.l.a(n10)) {
                    cn.com.etgame.cls.system.d.a(4, "imgElement=" + n2);
                    bf bf5 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, this.z, n10);
                    if (bf5.a.endsWith(".png")) {
                        this.g[n10] = this.S ? j.b(bf5.b, 0, bf5.b.length) : Image.createImage((byte[])bf5.b, (int)0, (int)bf5.b.length);
                    } else if (bf5.a.endsWith(".pix")) {
                        ba ba5 = ba.a(j.a(bf5.b, 0, bf5.b.length));
                        this.g[n10] = Image.createRGBImage((int[])ba5.c, (int)ba5.a, (int)ba5.b, (boolean)true);
                    }
                }
            } else if (n2 <= this.d.length + this.e.length + this.f.length + this.g.length + this.i.length) {
                int n11 = n2 - this.d.length - this.e.length - this.f.length - this.g.length - 1;
                if ((this.aD || !this.Q) && this.j.a(n11)) {
                    cn.com.etgame.cls.system.d.a(4, "imgUI=" + n2);
                    bf bf6 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, "ui.bin", n11);
                    if (bf6.a.endsWith(".png")) {
                        this.i[n11] = Image.createImage((byte[])bf6.b, (int)0, (int)bf6.b.length);
                    } else if (bf6.a.endsWith(".pix")) {
                        ba ba6 = ba.a(j.a(bf6.b, 0, bf6.b.length));
                        this.i[n11] = Image.createRGBImage((int[])ba6.c, (int)ba6.a, (int)ba6.b, (boolean)true);
                    }
                }
            } else if (n2 <= this.d.length + this.e.length + this.f.length + this.g.length + this.i.length + this.h.length) {
                int n12 = n2 - this.d.length - this.e.length - this.f.length - this.g.length - this.i.length - 1;
                bf bf7 = cn.com.etgame.cls.system.d.a(cn.com.etgame.cls.system.d.z, cn.com.etgame.cls.system.d.J, n12);
                if (this.aD || !this.Q) {
                    cn.com.etgame.cls.system.d.a(4, "imgPortrait=" + n2);
                    if (bf7.a.endsWith(".png")) {
                        this.h[n12] = Image.createImage((byte[])bf7.b, (int)0, (int)bf7.b.length);
                    } else if (bf7.a.endsWith(".pix")) {
                        ba ba7 = ba.a(j.a(bf7.b, 0, bf7.b.length));
                        this.h[n12] = Image.createRGBImage((int[])ba7.c, (int)ba7.a, (int)ba7.b, (boolean)true);
                    }
                }
            } else {
                if (!this.Q) {
                    this.a = Image.createImage((int)40, (int)40);
                    this.b = this.a.getGraphics();
                    this.Q = true;
                }
                this.ap.b(false);
                this.ah = -1;
                this.ai = -1;
                this.al = 0;
                this.am = false;
                this.U = false;
                this.V = false;
                this.ac = this.n;
                this.ad = this.ac.J();
                this.ae = this.ac.K();
                this.J.a(0L);
                this.q.c[1].b(true);
                if (!(this.aD || this.n.c() == 2 && this.aw != null)) {
                    this.q.c[this.n.c() == 2 ? 2 : 1].a(this.n);
                }
                if (this.aw != null) {
                    ah.a(-1);
                    ah.d();
                    this.aw = null;
                } else {
                    this.a(this.q.d, this.q);
                }
                this.ax = -1;
                this.ay = -1;
                this.W = 0;
                this.x();
                if (cn.com.etgame.cls.system.d.c(Integer.parseInt(cn.com.etgame.cls.system.d.Y.a("\u4e00\u6b65\u767b\u4ed9")))) {
                    int n13 = 0;
                    while (n13 < this.aq.length) {
                        int n14 = 0;
                        while (n14 < this.aq[n13].G().length) {
                            this.aq[n13].G()[n14][2] = 1;
                            this.aq[n13].G()[n14][3] = 1000;
                            ++n14;
                        }
                        ++n13;
                    }
                }
            }
        }
        catch (Throwable throwable) {
            this.O.a(throwable, "RolePlayingCanvas.loadResource(" + n2 + ")", 1);
            System.gc();
            return false;
        }
        return true;
    }

    private boolean i(int n2) {
        int n3 = 0;
        while (n3 < this.s.size()) {
            if (((bl)this.s.elementAt(n3)).a(n2)) {
                return true;
            }
            ++n3;
        }
        n3 = 0;
        while (n3 < this.t.size()) {
            if (((ar)this.t.elementAt(n3)).a(n2)) {
                return true;
            }
            ++n3;
        }
        n3 = 0;
        while (n3 < this.o.length) {
            if (this.o[n3] != null && this.o[n3].a(n2)) {
                return true;
            }
            ++n3;
        }
        if (this.aQ != null && this.aQ.size() > 0) {
            n3 = 0;
            while (n3 < this.aQ.size()) {
                int n4 = n2;
                u u2 = (u)this.aQ.elementAt(n3);
                if (u2.a.a(n4)) {
                    return true;
                }
                ++n3;
            }
        }
        return false;
    }

    public final void d() {
        if (this.aD) {
            this.f();
            this.aD = false;
        }
        this.aR = true;
        this.ao.a(false, this.E, null);
    }

    public final void e() {
        this.ao.a();
    }

    public final void a(int n2, int n3) {
        if (this.aB) {
            if (n2 == 32768) {
                this.aB = false;
                ah.d();
            }
            return;
        }
        if (this.O.d() == 1 && (n2 == 65536 || n3 == 55)) {
            return;
        }
        if (al.a().b()) {
            al.a().a(this.O.getGameAction(n2));
            return;
        }
        if (this.an.b) {
            if (this.aU.f() > 0L) {
                return;
            }
            this.aU.c();
            this.aU.g();
        }
        if (this.aT == 65536) {
            switch (this.O.getGameAction(n2)) {
                case 65536: 
                case 262144: {
                    return;
                }
            }
        }
        if ((this.aT & this.O.getGameAction(n2)) != 0) {
            this.m();
        }
        if (this.aT == 65536 || this.aT == 0) {
            if (this.ap.a()) {
                if (this.O.getGameAction(n2) == 1) {
                    this.ap.b();
                    return;
                }
            } else {
                if (this.an.a() || this.an.b() || this.an.c()) {
                    this.an.a(n2);
                    return;
                }
                if (n2 != 0 && this.az == 0 && !this.ap.a()) {
                    if (this.aI != null) {
                        if (this.aJ == this.aI.length - 1 && this.aK == this.aI[this.aJ].length() - 1) {
                            this.aI = null;
                            return;
                        }
                    } else if (this.aH != null) {
                        if (this.aJ == this.aH.length - 1 && this.aK == this.aH[this.aJ].length() - 1) {
                            this.aH = null;
                            return;
                        }
                    } else if (!this.z() && this.al == 0 && this.v.size() == 0 && this.ao.b()) {
                        block3 : switch (n2) {
                            case 131072: {
                                this.an.d();
                                this.w();
                                this.W = 0;
                                return;
                            }
                            case 262144: {
                                if (this.H != null) {
                                    this.ap.a(this.H);
                                    this.ap.a(true);
                                    this.ap.b(true);
                                    this.n.a(0, false, true);
                                    return;
                                }
                                this.an.a = 0;
                                this.aV = false;
                                this.an.e();
                                this.w();
                                this.W = 0;
                                return;
                            }
                            case 64: {
                                this.W |= 2;
                                this.W |= 8;
                                break;
                            }
                            case 256: {
                                this.W |= 2;
                                this.W |= 0x10;
                                break;
                            }
                            case 4096: {
                                this.W |= 4;
                                this.W |= 8;
                                break;
                            }
                            case 16384: {
                                this.W |= 4;
                                this.W |= 0x10;
                                break;
                            }
                            case 32768: {
                                if (this.n.c() == 2) {
                                    this.n.a(0, false, true);
                                    break;
                                }
                                this.n.a(2, false, true);
                                break;
                            }
                            default: {
                                n2 = this.O.getGameAction(n2);
                                switch (n2) {
                                    case 2: 
                                    case 4: 
                                    case 8: 
                                    case 16: {
                                        this.W |= n2;
                                        break block3;
                                    }
                                    case 1: {
                                        n2 = 0;
                                        n3 = this.s.size();
                                        while (n2 < n3) {
                                            if (((bl)this.s.elementAt(n2)).j()) {
                                                return;
                                            }
                                            ++n2;
                                        }
                                        break;
                                    }
                                }
                                return;
                            }
                        }
                        if (this.n.c() == 0) {
                            if ((this.W & 8) != 0) {
                                this.n.a(1, false, true);
                                return;
                            }
                            if ((this.W & 0x10) != 0) {
                                this.n.a(1, false, true);
                                return;
                            }
                            if ((this.W & 2) != 0) {
                                this.n.a(1, false, true);
                                return;
                            }
                            if ((this.W & 4) != 0) {
                                this.n.a(1, false, true);
                            }
                        }
                    }
                }
            }
        }
    }

    public final void b(int n2) {
        if (n2 != 0) {
            switch (n2) {
                case 64: {
                    this.W &= 0xFFFFFFFD;
                    this.W &= 0xFFFFFFF7;
                    return;
                }
                case 256: {
                    this.W &= 0xFFFFFFFD;
                    this.W &= 0xFFFFFFEF;
                    return;
                }
                case 4096: {
                    this.W &= 0xFFFFFFFB;
                    this.W &= 0xFFFFFFF7;
                    return;
                }
                case 16384: {
                    this.W &= 0xFFFFFFFB;
                    this.W &= 0xFFFFFFEF;
                    return;
                }
            }
            this.W &= ~this.O.getGameAction(n2);
        }
    }

    private void w() {
        int n2 = 0;
        while (n2 < this.t.size()) {
            ((ar)this.t.elementAt(n2)).c();
            ++n2;
        }
        if (this.aP != null) {
            this.N.h();
        }
    }

    public final void f() {
        int n2 = 0;
        while (n2 < this.t.size()) {
            ((ar)this.t.elementAt(n2)).b();
            ++n2;
        }
        if (this.aP != null) {
            this.N.g();
        }
    }

    public final void a(int n2, boolean bl2) {
        this.P.a("event" + n2 + "=1");
    }

    private void a(String string, boolean bl2) {
        this.P.a("event" + string + (bl2 ? "=1" : "=0"));
    }

    public final void c(int n2) {
    }

    private void a(int n2, int n3, int n4, boolean bl2, boolean bl3) {
        this.n.a(this.q.c[this.n.c() == 2 ? 2 : 1], n2, n3, n4, n3, false, false, bl3);
        if (this.ax != -1 && this.ay != -1) {
            n2 = this.n.b();
            if (n2 != 4 && n2 != 8) {
                this.n.a_(this.ax);
            }
            if (n2 != 1 && n2 != 2) {
                this.n.b_(this.ay);
            }
            this.ax = -1;
            this.ay = -1;
        }
    }

    private void a(ay ay2, int n2, int n3, int n4, boolean bl2, boolean bl3) {
        ay2.a(this.q.c[1], n2, n3, n4, n3, bl2, bl2, bl3);
        if (this.ax != -1 && this.ay != -1) {
            n2 = this.n.b();
            if (n2 != 4 && n2 != 8) {
                ay2.a_(this.ax);
            }
            if (n2 != 1 && n2 != 2) {
                ay2.b_(this.ay);
            }
            this.ax = -1;
            this.ay = -1;
        }
    }

    private void x() {
        if (this.ah != -1 && this.ai != -1) {
            int n2;
            int n3;
            int n4;
            int n5 = this.ad - this.ah;
            int n6 = this.ae - this.ai;
            int n7 = Math.abs(n5);
            if (n7 > (n4 = Math.abs(n6))) {
                n3 = Math.min(this.aj, n7);
                n2 = n7 == n3 ? n4 : (n4 << 10) / n7 * n3 >> 10;
            } else {
                n2 = Math.min(this.aj, n4);
                int n8 = n3 = n4 == n2 ? n7 : (n7 << 10) / n4 * n2 >> 10;
            }
            int n9 = this.q.a > this.as ? this.ad + (n5 > 0 ? -n3 : n3) : (this.ad = this.q.a >> 1);
            int n10 = this.q.b > this.at ? this.ae + (n6 > 0 ? -n2 : n2) : (this.ae = this.q.b >> 1);
            if (this.ad == this.ah && this.ae == this.ai) {
                this.ah = -1;
                this.ai = -1;
                return;
            }
        } else if (this.ac != null) {
            int n11 = this.ad - this.ac.J();
            int n12 = this.ae - this.ac.K();
            int n13 = Math.min(cn.com.etgame.cls.system.d.b, Math.abs(n11));
            int n14 = Math.min(cn.com.etgame.cls.system.d.b, Math.abs(n12));
            int n15 = this.q.a > this.as ? Math.max(Math.min(this.ad + (n11 > 0 ? -n13 : n13), this.ac.J() + this.af), this.ac.J() - this.af) : (this.ad = this.q.a >> 1);
            this.ae = this.q.b > this.at ? Math.max(Math.min(this.ae + (n12 > 0 ? -n14 : n14), this.ac.K() + this.ag), this.ac.K() - this.ag) : this.q.b >> 1;
        }
    }

    public final void g() {
        try {
            block172: {
                block170: {
                    Object object;
                    block173: {
                        int n2;
                        int n3;
                        int n4;
                        block174: {
                            block171: {
                                if (this.az != 0) break block170;
                                if (this.aI == null) break block171;
                                if (this.L.f() == 0L) {
                                    if (this.aJ < this.aI.length - 1) {
                                        if (this.aK < this.aI[this.aJ].length() - 1) {
                                            ++this.aK;
                                        } else {
                                            this.aK = 0;
                                            ++this.aJ;
                                        }
                                        this.M.c();
                                        this.M.g();
                                    } else if (this.aK < this.aI[this.aJ].length() - 1) {
                                        ++this.aK;
                                        this.M.c();
                                        this.M.g();
                                    }
                                    this.L.c();
                                    this.L.g();
                                }
                                if (this.M.f() == 0L) {
                                    this.aI = null;
                                }
                                break block172;
                            }
                            if (this.ao.b()) {
                                this.aG = this.v.size() <= 0 && !this.ap.a();
                                object = this;
                                if (!al.a().b() && ((e)object).aT == 0 && ((e)object).aI == null && ((e)object).aH == null && ((e)object).J.f() <= 0L && !((e)object).U) {
                                    if (super.z()) {
                                        int n5 = 0;
                                        while (n5 < 12) {
                                            if (((e)object).Y[n5] != null) {
                                                bl bl2;
                                                int n6;
                                                if (((e)object).Z[n5] != -1) {
                                                    n6 = ((e)object).Z[n5] - ((e)object).Y[n5].J();
                                                    if (n6 == 0) {
                                                        if (((e)object).Y[n5] == ((e)object).n) {
                                                            if (((e)object).aa[n5] == -1) {
                                                                if (((e)object).n.c() == 1) {
                                                                    ((e)object).n.a(0, false, true);
                                                                }
                                                                ((e)object).Y[n5] = null;
                                                            } else if (((e)object).aa[n5] == ((e)object).n.K()) {
                                                                if (((e)object).n.c() == 1) {
                                                                    ((e)object).n.a(0, false, true);
                                                                }
                                                                ((e)object).aa[n5] = -1;
                                                                ((e)object).Y[n5] = null;
                                                            }
                                                        } else if (((e)object).Y[n5] instanceof bl) {
                                                            bl bl3 = (bl)((e)object).Y[n5];
                                                            if (((e)object).aa[n5] == -1) {
                                                                bl3.c(0);
                                                                ((e)object).Y[n5] = null;
                                                                if (bl3.g) {
                                                                    bl3.g = false;
                                                                    ((e)object).s.removeElement(bl3);
                                                                    ((e)object).q.c[1].b(bl3);
                                                                    bl3.h = true;
                                                                }
                                                            } else if (((e)object).aa[n5] == bl3.K()) {
                                                                bl3.c(0);
                                                                ((e)object).aa[n5] = -1;
                                                                ((e)object).Y[n5] = null;
                                                                if (bl3.g) {
                                                                    bl3.g = false;
                                                                    ((e)object).s.removeElement(bl3);
                                                                    ((e)object).q.c[1].b(bl3);
                                                                    bl3.h = true;
                                                                }
                                                            }
                                                        }
                                                        ((e)object).Z[n5] = -1;
                                                    } else {
                                                        int n7;
                                                        int n8 = n7 = n6 < 0 ? 4 : 8;
                                                        if (((e)object).Y[n5] == ((e)object).n) {
                                                            if (((e)object).n.c() == 0) {
                                                                ((e)object).n.a(1, false, true);
                                                            }
                                                            n4 = ((e)object).ar.d();
                                                            ((e)object).n.a(n7);
                                                            n6 = Math.abs(n6);
                                                            if (n6 > n4) {
                                                                super.a(((e)object).n, n7, n4, 0, true, !((e)object).T);
                                                            } else {
                                                                super.a(((e)object).n, n7, n6, 0, true, !((e)object).T);
                                                                ((e)object).Z[n5] = -1;
                                                                if (((e)object).aa[n5] == -1) {
                                                                    if (((e)object).n.c() == 1) {
                                                                        ((e)object).n.a(0, false, true);
                                                                    }
                                                                    ((e)object).Y[n5] = null;
                                                                }
                                                            }
                                                        } else if (((e)object).Y[n5] instanceof bl) {
                                                            bl2 = (bl)((e)object).Y[n5];
                                                            bl2.c(1);
                                                            bl2.b(n7);
                                                            n4 = ((e)object).ab[n5];
                                                            n6 = Math.abs(n6);
                                                            if (n6 > n4) {
                                                                super.a(bl2, n7, n4, 0, true, true);
                                                            } else {
                                                                super.a(bl2, n7, n6, 0, true, true);
                                                                ((e)object).Z[n5] = -1;
                                                                if (((e)object).aa[n5] == -1) {
                                                                    bl2.c(0);
                                                                    ((e)object).Y[n5] = null;
                                                                    if (bl2.g) {
                                                                        bl2.g = false;
                                                                        ((e)object).s.removeElement(bl2);
                                                                        ((e)object).q.c[1].b(bl2);
                                                                        bl2.h = true;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else if (((e)object).aa[n5] != -1) {
                                                    n6 = ((e)object).aa[n5] - ((e)object).Y[n5].K();
                                                    if (n6 == 0) {
                                                        if (((e)object).Y[n5] == ((e)object).n) {
                                                            if (((e)object).n.c() == 1) {
                                                                ((e)object).n.a(0, false, true);
                                                            }
                                                            ((e)object).Y[n5] = null;
                                                        } else if (((e)object).Y[n5] instanceof bl) {
                                                            bl bl4 = (bl)((e)object).Y[n5];
                                                            bl4.c(0);
                                                            ((e)object).Y[n5] = null;
                                                            if (bl4.g) {
                                                                bl4.g = false;
                                                                ((e)object).s.removeElement(bl4);
                                                                ((e)object).q.c[1].b(bl4);
                                                                bl4.h = true;
                                                            }
                                                        }
                                                        ((e)object).aa[n5] = -1;
                                                    } else {
                                                        int n9;
                                                        int n10 = n9 = n6 < 0 ? 1 : 2;
                                                        if (((e)object).Y[n5] == ((e)object).n) {
                                                            if (((e)object).n.c() == 0) {
                                                                ((e)object).n.a(1, false, true);
                                                            }
                                                            n4 = ((e)object).ar.d();
                                                            ((e)object).n.a(n9);
                                                            n6 = Math.abs(n6);
                                                            if (n6 > n4) {
                                                                super.a(((e)object).n, n9, n4, 0, true, !((e)object).T);
                                                            } else {
                                                                super.a(((e)object).n, n9, n6, 0, true, !((e)object).T);
                                                                if (((e)object).n.c() == 1) {
                                                                    ((e)object).n.a(0, false, true);
                                                                }
                                                                ((e)object).aa[n5] = -1;
                                                                ((e)object).Y[n5] = null;
                                                            }
                                                        } else if (((e)object).Y[n5] instanceof bl) {
                                                            bl2 = (bl)((e)object).Y[n5];
                                                            bl2.c(1);
                                                            bl2.b(n9);
                                                            n4 = ((e)object).ab[n5];
                                                            n6 = Math.abs(n6);
                                                            if (n6 > n4) {
                                                                super.a(bl2, n9, n4, 0, true, true);
                                                            } else {
                                                                super.a(bl2, n9, n6, 0, true, true);
                                                                bl2.c(0);
                                                                ((e)object).aa[n5] = -1;
                                                                ((e)object).Y[n5] = null;
                                                                if (bl2.g) {
                                                                    bl2.g = false;
                                                                    ((e)object).s.removeElement(bl2);
                                                                    ((e)object).q.c[1].b(bl2);
                                                                    bl2.h = true;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            ++n5;
                                        }
                                    } else if (((e)object).ah == -1 && ((e)object).ai == -1 && !((e)object).ap.a() && !((e)object).n.h()) {
                                        while (((e)object).v.size() > 0) {
                                            Object[] objectArray = (Object[])((e)object).v.firstElement();
                                            String string = (String)objectArray[0];
                                            String string2 = cn.com.etgame.cls.system.d.d(string);
                                            ((e)object).v.removeElementAt(0);
                                            if (string.startsWith("script") && (string2.equals("wait") || string2.equals("break"))) {
                                                cn.com.etgame.cls.system.d.a(string);
                                                if (!((e)object).a(cn.com.etgame.cls.system.d.g(string))) continue;
                                                if (!string2.equals("wait")) break;
                                                ((e)object).J.a((int)((e)object).P.a(cn.com.etgame.cls.system.d.e(string)[0]));
                                                ((e)object).J.c();
                                                ((e)object).J.g();
                                                break;
                                            }
                                            ((e)object).a((Object)string, objectArray[1]);
                                        }
                                    }
                                }
                            }
                            if (this.aB) break block172;
                            if (this.q != null) {
                                this.x();
                            }
                            if (this.am) {
                                if (this.al < this.ak) {
                                    this.al = Math.min(this.al + cn.com.etgame.cls.system.d.d, this.ak);
                                }
                            } else if (this.al > 0) {
                                this.al = Math.max(this.al - cn.com.etgame.cls.system.d.d, 0);
                            }
                            if (this.z() || this.al != 0 || this.v.size() != 0 || this.ap.a() || !this.ao.b() || this.an.b()) break block173;
                            if (this.aP != null && this.N.f() == 0L) {
                                object = this.aP;
                                this.aP = null;
                                this.a(object, this);
                            }
                            if (this.W != 0 || this.n.c() == 2) break block174;
                            this.n.a(0, false, true);
                            break block173;
                        }
                        object = this;
                        int n11 = ((e)object).n.J();
                        n4 = ((e)object).n.K();
                        switch (((e)object).n.c()) {
                            case 0: {
                                ((e)object).n.a(1, false, true);
                            }
                            case 1: {
                                n3 = ((e)object).ar.d();
                                n2 = cn.com.etgame.cls.system.d.i;
                                break;
                            }
                            case 2: {
                                n3 = 12;
                                n2 = cn.com.etgame.cls.system.d.i;
                                break;
                            }
                            default: {
                                break block173;
                            }
                        }
                        switch (((e)object).W) {
                            case 2: {
                                super.a(1, n3, n2, false, false);
                                break;
                            }
                            case 4: {
                                super.a(2, n3, n2, false, false);
                                break;
                            }
                            case 8: {
                                super.a(4, n3, n2, false, false);
                                break;
                            }
                            case 16: {
                                super.a(8, n3, n2, false, false);
                                break;
                            }
                            case 10: {
                                n3 = n3 * 7 / 10;
                                super.a(1, n3, 0, false, true);
                                super.a(4, n3, 0, false, false);
                                break;
                            }
                            case 12: {
                                n3 = n3 * 7 / 10;
                                super.a(2, n3, 0, false, true);
                                super.a(4, n3, 0, false, false);
                                break;
                            }
                            case 18: {
                                n3 = n3 * 7 / 10;
                                super.a(1, n3, 0, false, true);
                                super.a(8, n3, 0, false, false);
                                break;
                            }
                            case 20: {
                                n3 = n3 * 7 / 10;
                                super.a(2, n3, 0, false, true);
                                super.a(8, n3, 0, false, false);
                            }
                        }
                        if (((e)object).n.J() <= n11 - n3) {
                            ((e)object).n.a(4);
                        } else if (((e)object).n.J() >= n11 + n3) {
                            ((e)object).n.a(8);
                        } else if (((e)object).n.K() <= n4 - n3) {
                            ((e)object).n.a(1);
                        } else if (((e)object).n.K() >= n4 + n3) {
                            ((e)object).n.a(2);
                        } else if ((((e)object).W & 8) != 0) {
                            ((e)object).n.a(4);
                        } else if ((((e)object).W & 0x10) != 0) {
                            ((e)object).n.a(8);
                        } else if ((((e)object).W & 2) != 0) {
                            ((e)object).n.a(1);
                        } else if ((((e)object).W & 4) != 0) {
                            ((e)object).n.a(2);
                        }
                    }
                    if (!(this.an.b() || this.an.a() || this.an.c())) {
                        object = this.q;
                        int n12 = 0;
                        while (n12 < ((w)object).c.length) {
                            ((w)object).c[n12].g();
                            ++n12;
                        }
                    }
                    break block172;
                }
                if (this.az == 1) {
                    this.az = 2;
                } else if (this.az == 2) {
                    Object object;
                    ByteArrayOutputStream byteArrayOutputStream;
                    RecordStore recordStore;
                    block169: {
                        e e2 = this;
                        recordStore = null;
                        byteArrayOutputStream = null;
                        object = null;
                        try {
                            try {
                                int[] nArray = new int[1600];
                                e2.a.getRGB(nArray, 0, 40, 0, 0, 40, 40);
                                if (cn.com.etgame.cls.system.d.a[e2.aA] == null) {
                                    cn.com.etgame.cls.system.d.a[e2.aA] = new b(e2.aA, nArray, System.currentTimeMillis(), e2.x, e2.y, e2.z, e2.A);
                                } else {
                                    cn.com.etgame.cls.system.d.a[e2.aA].b = nArray;
                                    cn.com.etgame.cls.system.d.a[e2.aA].c = e2.x;
                                    cn.com.etgame.cls.system.d.a[e2.aA].d = e2.y;
                                    cn.com.etgame.cls.system.d.a[e2.aA].e = e2.z;
                                    cn.com.etgame.cls.system.d.a[e2.aA].f = e2.A;
                                    cn.com.etgame.cls.system.d.a[e2.aA].a(System.currentTimeMillis());
                                }
                                recordStore = RecordStore.openRecordStore((String)("CLS3_TITLE" + e2.aA), (boolean)true);
                                byteArrayOutputStream = new ByteArrayOutputStream();
                                object = new DataOutputStream(byteArrayOutputStream);
                                ((DataOutputStream)object).writeInt(cn.com.etgame.cls.system.d.a[e2.aA].b.length);
                                int n13 = 0;
                                int n14 = cn.com.etgame.cls.system.d.a[e2.aA].b.length;
                                while (n13 < n14) {
                                    ((DataOutputStream)object).writeInt(cn.com.etgame.cls.system.d.a[e2.aA].b[n13]);
                                    ++n13;
                                }
                                ((DataOutputStream)object).writeLong(cn.com.etgame.cls.system.d.a[e2.aA].a());
                                ((DataOutputStream)object).writeUTF(cn.com.etgame.cls.system.d.a[e2.aA].c);
                                ((DataOutputStream)object).writeUTF(cn.com.etgame.cls.system.d.a[e2.aA].d);
                                ((DataOutputStream)object).writeUTF(cn.com.etgame.cls.system.d.a[e2.aA].e);
                                ((DataOutputStream)object).writeUTF(cn.com.etgame.cls.system.d.a[e2.aA].f);
                                byte[] byArray = byteArrayOutputStream.toByteArray();
                                if (recordStore.getNumRecords() == 0) {
                                    recordStore.addRecord(byArray, 0, byArray.length);
                                } else {
                                    recordStore.setRecord(1, byArray, 0, byArray.length);
                                }
                                ((FilterOutputStream)object).close();
                                byteArrayOutputStream.close();
                                recordStore.closeRecordStore();
                                object = null;
                                byteArrayOutputStream = null;
                                recordStore = null;
                                recordStore = RecordStore.openRecordStore((String)("CLS3_DATA" + e2.aA), (boolean)true);
                                byteArrayOutputStream = new ByteArrayOutputStream();
                                object = new DataOutputStream(byteArrayOutputStream);
                                cn.com.etgame.cls.system.d.a(1, "---write----" + 1);
                                if (ah.b() != null) {
                                    ((DataOutputStream)object).writeBoolean(true);
                                    ((DataOutputStream)object).writeUTF(ah.b());
                                } else {
                                    ((DataOutputStream)object).writeBoolean(false);
                                }
                                ((DataOutputStream)object).writeUTF(e2.B);
                                ((DataOutputStream)object).writeInt(e2.ad);
                                ((DataOutputStream)object).writeInt(e2.ae);
                                ((DataOutputStream)object).writeBoolean(e2.S);
                                String[] stringArray = e2.P.a();
                                ((DataOutputStream)object).writeInt(stringArray.length);
                                int n15 = 0;
                                while (n15 < stringArray.length) {
                                    ((DataOutputStream)object).writeUTF(stringArray[n15]);
                                    ((DataOutputStream)object).writeLong(e2.P.a(stringArray[n15]));
                                    ++n15;
                                }
                                ((DataOutputStream)object).writeInt(e2.n.J());
                                ((DataOutputStream)object).writeInt(e2.n.K());
                                ((DataOutputStream)object).writeInt(e2.n.c());
                                ((DataOutputStream)object).writeInt(e2.n.b());
                                ((DataOutputStream)object).writeInt(e2.F);
                                ((DataOutputStream)object).writeInt(e2.G);
                                if (e2.H != null) {
                                    ((DataOutputStream)object).writeBoolean(true);
                                    ((DataOutputStream)object).writeUTF(e2.H);
                                } else {
                                    ((DataOutputStream)object).writeBoolean(false);
                                }
                                cn.com.etgame.cls.system.d.a(1, "---write----" + 2);
                                ((DataOutputStream)object).writeInt(e2.r.size());
                                int n16 = 0;
                                int n17 = e2.r.size();
                                while (n16 < n17) {
                                    r r2 = (r)e2.r.elementAt(n16);
                                    ((DataOutputStream)object).writeInt(r2.J());
                                    ((DataOutputStream)object).writeInt(r2.K());
                                    ((DataOutputStream)object).writeInt(r2.a);
                                    ((DataOutputStream)object).writeInt(r2.b);
                                    ((DataOutputStream)object).writeBoolean(r2.c);
                                    ++n16;
                                }
                                cn.com.etgame.cls.system.d.a(1, "---write----" + 3);
                                if (e2.aP != null) {
                                    ((DataOutputStream)object).writeBoolean(true);
                                    ((DataOutputStream)object).writeLong(e2.N.f());
                                    ((DataOutputStream)object).writeUTF(e2.aP);
                                } else {
                                    ((DataOutputStream)object).writeBoolean(false);
                                }
                                ((DataOutputStream)object).writeBoolean(e2.R);
                                n16 = 0;
                                while (n16 < e2.aC.length) {
                                    ((DataOutputStream)object).writeInt(e2.aC[n16]);
                                    ++n16;
                                }
                                n16 = 0;
                                while (n16 < e2.aq.length) {
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].a);
                                    cn.com.etgame.cls.system.d.a(1, e2.aq[n16].a);
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].d());
                                    if (e2.aq[n16].i != null) {
                                        ((DataOutputStream)object).writeBoolean(true);
                                        ((DataOutputStream)object).writeUTF(e2.aq[n16].i);
                                    } else {
                                        ((DataOutputStream)object).writeBoolean(false);
                                    }
                                    ((DataOutputStream)object).writeBoolean(e2.aq[n16].I());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].e());
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].b);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].c);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].e);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].d);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].f);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].g);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].h);
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].w());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].j());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].x() - e2.aq[n16].B());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].y() - e2.aq[n16].C());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].v());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].u());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].t());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].s());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].f());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].g());
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].m() == null ? "null" : e2.aq[n16].m().a);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].n() == null ? "null" : e2.aq[n16].n().a);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].o() == null ? "null" : e2.aq[n16].o().a);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].p() == null ? "null" : e2.aq[n16].p().a);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].q() == null ? "null" : e2.aq[n16].q().a);
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].r() == null ? "null" : e2.aq[n16].r().a);
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].z() - e2.aq[n16].D());
                                    ((DataOutputStream)object).writeUTF(e2.aq[n16].l());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].A() - e2.aq[n16].E());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].k());
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].H().length);
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].H()[0].length);
                                    n17 = 0;
                                    while (n17 < e2.aq[n16].H().length) {
                                        int n18 = 0;
                                        while (n18 < e2.aq[n16].H()[0].length) {
                                            ((DataOutputStream)object).writeInt(e2.aq[n16].H()[n17][n18]);
                                            ++n18;
                                        }
                                        ++n17;
                                    }
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].G().length);
                                    ((DataOutputStream)object).writeInt(e2.aq[n16].G()[0].length);
                                    n17 = 0;
                                    while (n17 < e2.aq[n16].G().length) {
                                        int n19 = 0;
                                        while (n19 < e2.aq[n16].G()[0].length) {
                                            ((DataOutputStream)object).writeInt(e2.aq[n16].G()[n17][n19]);
                                            ++n19;
                                        }
                                        ++n17;
                                    }
                                    cn.com.etgame.cls.system.d.a(1, String.valueOf(e2.aq[n16].a) + "--end");
                                    ++n16;
                                }
                                cn.com.etgame.cls.system.d.a(1, "---write----" + 4);
                                Vector vector = e2.ar.F();
                                ((DataOutputStream)object).writeInt(vector.size());
                                int n20 = 0;
                                int n21 = vector.size();
                                while (n20 < n21) {
                                    ((DataOutputStream)object).writeUTF((String)vector.elementAt(n20));
                                    ++n20;
                                }
                                vector = e2.ar.c().a(0);
                                ((DataOutputStream)object).writeInt(vector.size());
                                n20 = 0;
                                n21 = vector.size();
                                while (n20 < n21) {
                                    i i2 = (i)vector.elementAt(n20);
                                    ((DataOutputStream)object).writeUTF(i2.a);
                                    ((DataOutputStream)object).writeInt(i2.d());
                                    ++n20;
                                }
                                vector = e2.ar.c().a(1);
                                ((DataOutputStream)object).writeInt(vector.size());
                                n20 = 0;
                                n21 = vector.size();
                                while (n20 < n21) {
                                    i i3 = (i)vector.elementAt(n20);
                                    ((DataOutputStream)object).writeUTF(i3.a);
                                    ((DataOutputStream)object).writeInt(i3.d());
                                    ++n20;
                                }
                                vector = e2.ar.c().a(2);
                                ((DataOutputStream)object).writeInt(vector.size());
                                n20 = 0;
                                n21 = vector.size();
                                while (n20 < n21) {
                                    i i4 = (i)vector.elementAt(n20);
                                    ((DataOutputStream)object).writeUTF(i4.a);
                                    ((DataOutputStream)object).writeInt(i4.d());
                                    ++n20;
                                }
                                vector = e2.ar.c().a(3);
                                ((DataOutputStream)object).writeInt(vector.size());
                                n20 = 0;
                                n21 = vector.size();
                                while (n20 < n21) {
                                    i i5 = (i)vector.elementAt(n20);
                                    ((DataOutputStream)object).writeUTF(i5.a);
                                    ((DataOutputStream)object).writeInt(i5.d());
                                    ++n20;
                                }
                                vector = e2.ar.c().a(4);
                                ((DataOutputStream)object).writeInt(vector.size());
                                n20 = 0;
                                n21 = vector.size();
                                while (n20 < n21) {
                                    i i6 = (i)vector.elementAt(n20);
                                    ((DataOutputStream)object).writeUTF(i6.a);
                                    ((DataOutputStream)object).writeInt(i6.d());
                                    ++n20;
                                }
                                cn.com.etgame.cls.system.d.a(1, "---write----" + 5);
                                n21 = 0;
                                while (n21 < e2.o.length) {
                                    e.a((DataOutputStream)object, e2.o[n21]);
                                    ++n21;
                                }
                                cn.com.etgame.cls.system.d.a(1, "---write----" + 6);
                                ((DataOutputStream)object).writeInt(e2.s.size());
                                n21 = 0;
                                while (n21 < e2.s.size()) {
                                    bl bl5 = (bl)e2.s.elementAt(n21);
                                    e.a((DataOutputStream)object, bl5);
                                    ++n21;
                                }
                                ((DataOutputStream)object).writeInt(e2.t.size());
                                int n22 = 0;
                                while (n22 < e2.t.size()) {
                                    ar ar2 = (ar)e2.t.elementAt(n22);
                                    ((DataOutputStream)object).writeInt(ar2.J());
                                    ((DataOutputStream)object).writeInt(ar2.K());
                                    ((DataOutputStream)object).writeUTF(ar2.a);
                                    ((DataOutputStream)object).writeBoolean(ar2.g());
                                    ++n22;
                                }
                                ((DataOutputStream)object).writeInt(e2.u.size());
                                n22 = 0;
                                while (n22 < e2.u.size()) {
                                    ad ad2 = (ad)e2.u.elementAt(n22);
                                    ((DataOutputStream)object).writeInt(ad2.J());
                                    ((DataOutputStream)object).writeInt(ad2.K());
                                    ((DataOutputStream)object).writeInt(ad2.a);
                                    ++n22;
                                }
                                cn.com.etgame.cls.system.d.a(1, "---write---end-" + 7);
                                byte[] byArray2 = byteArrayOutputStream.toByteArray();
                                if (recordStore.getNumRecords() == 0) {
                                    recordStore.addRecord(byArray2, 0, byArray2.length);
                                    break block169;
                                }
                                recordStore.setRecord(1, byArray2, 0, byArray2.length);
                            }
                            catch (Throwable throwable) {
                                e2.O.a(throwable, "RolePlayingCanvas.save()", 1);
                            }
                        }
                        catch (Throwable throwable) {
                            if (object != null) {
                                try {
                                    ((FilterOutputStream)object).close();
                                }
                                catch (IOException iOException) {
                                    object = iOException;
                                    iOException.printStackTrace();
                                }
                            }
                            if (byteArrayOutputStream != null) {
                                try {
                                    byteArrayOutputStream.close();
                                }
                                catch (IOException iOException) {
                                    object = iOException;
                                    iOException.printStackTrace();
                                }
                            }
                            if (recordStore != null) {
                                try {
                                    recordStore.closeRecordStore();
                                }
                                catch (Exception exception) {
                                    object = exception;
                                    exception.printStackTrace();
                                }
                            }
                            e2.az = 0;
                            throw throwable;
                        }
                    }
                    if (object != null) {
                        try {
                            ((FilterOutputStream)object).close();
                        }
                        catch (IOException iOException) {
                            object = iOException;
                            iOException.printStackTrace();
                        }
                    }
                    if (byteArrayOutputStream != null) {
                        try {
                            byteArrayOutputStream.close();
                        }
                        catch (IOException iOException) {
                            object = iOException;
                            iOException.printStackTrace();
                        }
                    }
                    if (recordStore != null) {
                        try {
                            recordStore.closeRecordStore();
                        }
                        catch (Exception exception) {
                            object = exception;
                            exception.printStackTrace();
                        }
                    }
                    e2.az = 0;
                }
            }
            if (this.aH != null) {
                if (this.L.f() == 0L) {
                    if (this.aJ < this.aH.length - 1) {
                        if (this.aK < this.aH[this.aJ].length() - 1) {
                            ++this.aK;
                        } else {
                            this.aK = 0;
                            ++this.aJ;
                        }
                        this.M.c();
                        this.M.g();
                    } else if (this.aK < this.aH[this.aJ].length() - 1) {
                        ++this.aK;
                        this.M.c();
                        this.M.g();
                    }
                    this.L.c();
                    this.L.g();
                }
                if (this.M.f() == 0L) {
                    this.aH = null;
                }
            }
            this.ao.c();
            this.O.repaint();
            this.O.serviceRepaints();
            return;
        }
        catch (Throwable throwable) {
            this.O.a(throwable, "RolePlayingCanvas.update()", 1);
            return;
        }
    }

    public final void a(Graphics graphics) {
        try {
            int n2;
            int n3;
            int n4;
            int n5;
            graphics.setFont(ag.b);
            if (this.aI != null) {
                graphics.setColor(0);
                graphics.setClip(0, 0, this.as, this.at);
                graphics.fillRect(0, 0, this.as, this.at);
                if (!this.aI[0].startsWith("null")) {
                    graphics.setColor(0xFFFFFF);
                    Font font = ag.b;
                    int n6 = 30;
                    int n7 = this.O.f;
                    int n8 = this.O.e;
                    int n9 = this.aK;
                    int n10 = this.aJ + 1;
                    String[] stringArray = this.aI;
                    Graphics graphics2 = graphics;
                    n7 -= stringArray.length * 30 >> 1;
                    graphics2.setFont(font);
                    int n11 = 0;
                    int n12 = 0;
                    int n13 = Math.min(n10, stringArray.length);
                    while (n12 < n13) {
                        if (n12 == n10 - 1) {
                            int n14 = font.stringWidth(stringArray[n12]);
                            graphics2.drawSubstring(stringArray[n12], 0, n9 + 1, n8 - (n14 >> 1), n7 + n11 * 30, 20);
                        } else {
                            graphics2.drawString(stringArray[n12], n8, n7 + n11 * 30, 17);
                        }
                        ++n11;
                        ++n12;
                    }
                }
                return;
            }
            if (this.aL > 0) {
                if (this.aN) {
                    this.aN = false;
                    graphics.setColor(this.aM);
                    graphics.setClip(0, 0, this.as, this.at);
                    graphics.fillRect(0, 0, this.as, this.at);
                    return;
                }
                this.aN = true;
                --this.aL;
            }
            e e2 = this;
            int n15 = e2.q.a > e2.as ? Math.max(Math.min(e2.ad - e2.au, e2.q.a - e2.as), 0) : (e2.q.a >> 1) - e2.au;
            e2 = this;
            int n16 = e2.q.b > e2.at ? Math.max(Math.min(e2.ae - e2.av - 15, e2.q.b - e2.at), 0) : (e2.q.b >> 1) - e2.av;
            int n17 = this.as;
            if (this.q.a < n17) {
                n5 = n17 - this.q.a >> 1;
                n17 = this.q.a;
            } else {
                n5 = 0;
            }
            if (this.q.b < this.at) {
                n4 = this.at - this.q.b >> 1;
                n3 = this.q.b;
            } else {
                n4 = 0;
                n3 = this.at;
            }
            if (this.aE) {
                graphics.setClip(0, 0, this.X, this.at);
                graphics.setColor(0);
                graphics.fillRect(0, 0, this.X, this.at);
                if (this.aO < 2) {
                    this.q.a(graphics, this.f, (this.aO == 0 ? -10 : 10) - n15, -n16, 0, 0, this.as, this.at, false);
                } else {
                    this.q.a(graphics, this.f, -n15, -n16 + (this.aO == 2 ? -10 : 10), 0, 0, this.as, this.at, false);
                }
                this.aO = (this.aO + 1) % 4;
            } else if (this.az == 0) {
                graphics.setClip(0, 0, this.X, this.at);
                graphics.setColor(0);
                graphics.fillRect(0, 0, this.X, this.at);
                if (this.p != null) {
                    this.p.a(graphics, 0 - n15 + this.p.J(), -n16 + this.p.K(), n5, n4, n17, n3);
                } else {
                    this.q.a(graphics, this.f, 0 - n15, -n16, n5, n4, n17, n3, false);
                }
            }
            if (this.aQ != null && this.aQ.size() > 0) {
                n2 = 0;
                while (n2 < this.aQ.size()) {
                    ((u)this.aQ.elementAt(n2)).a(graphics, -n15, -n16, n5, n4, n17, n3);
                    ++n2;
                }
            }
            if (this.aP != null) {
                graphics.setFont(ag.b);
                graphics.setColor(0xFFFFFF);
                graphics.setClip(0, 0, this.as, this.at);
                ag.b(graphics, 0, String.valueOf(this.N.f() / 1000L), 10, 10, 20);
            }
            if (this.B != null) {
                graphics.setFont(ag.b);
                graphics.setColor(0xFFFFFF);
                graphics.setClip(0, 0, this.as, this.at);
                ag.b(graphics, 0, this.B, this.O.c, 0, 24);
            }
            if (this.aH != null) {
                this.ao.a(graphics, 0, 0, this.O.c, this.O.d);
                graphics.setColor(0xFFFFFF);
                graphics.setClip(0, 0, this.as, this.at);
                n2 = 0;
                while (n2 <= this.aJ) {
                    if (n2 == this.aJ) {
                        n15 = 0;
                        while (n15 <= this.aK && n15 < this.aH[n2].length()) {
                            graphics.drawChar(this.aH[n2].charAt(n15), this.O.c - 10 - n2 * 25, 30 + n15 * (ag.b.getHeight() + 10), 24);
                            ++n15;
                        }
                    } else {
                        n15 = 0;
                        while (n15 < this.aH[n2].length()) {
                            graphics.drawChar(this.aH[n2].charAt(n15), this.O.c - 10 - n2 * 25, 30 + n15 * (ag.b.getHeight() + 10), 24);
                            ++n15;
                        }
                    }
                    ++n2;
                }
            }
            this.ao.a(graphics);
            if (this.al > 0) {
                graphics.setClip(0, 0, this.as, this.at);
                graphics.setColor(cn.com.etgame.cls.system.d.c);
                graphics.fillRect(0, 0, this.as, this.al);
                graphics.fillRect(0, this.at - this.al, this.as, this.al);
            }
            if (this.aH == null && !this.z() && this.al == 0 && this.ao.b()) {
                if (this.an.a()) {
                    this.an.c(graphics);
                } else if (this.an.c()) {
                    this.an.d(graphics);
                } else if (this.an.b()) {
                    this.an.b(graphics);
                } else if (this.v.size() == 0) {
                    this.an.a(graphics);
                }
            }
            this.ap.a(graphics, this.au, this.at - 4, 33, this.h);
            this.ao.a(graphics, this.au, this.av, ag.b, 3);
            al.a().a(graphics, this.ao);
            if (this.az != 0) {
                n2 = this.n.J() - 20;
                n15 = this.n.K() - (this.n.c() == 2 ? 65 : 45);
                this.q.a(this.b, this.f, -n2, -n15, 0, 0, 40, 40, false);
                this.ao.a(graphics, "\u6b63\u5728\u5b58\u50a8", this.au, this.av, ag.b, 3);
            }
            if (this.aB) {
                this.ao.a(graphics, "\u6309*\u952e\u7ee7\u7eed", this.au, this.av, ag.b, 3);
                return;
            }
            if (this.aT != 0) {
                this.ao.a(graphics, this.aS, this.au, this.av >> 1, ag.b, 33);
                return;
            }
            if (this.I != null) {
                if (this.K.f() > 0L) {
                    this.ao.a(graphics, this.I);
                    return;
                }
                this.I = null;
                return;
            }
        }
        catch (Throwable throwable) {
            this.O.a(throwable, "RolePlayingCanvas.paint(g)", 1);
        }
    }

    private void y() {
        if (this.n.c() != 2) {
            this.n.a(0, false, true);
            return;
        }
        this.n.a(2, false, true);
    }

    private void a(boolean bl2) {
        this.ao.a(true, this.E, bl2 ? this : null);
    }

    private bl j(int n2) {
        int n3 = 0;
        int n4 = this.s.size();
        while (n3 < n4) {
            bl bl2 = (bl)this.s.elementAt(n3);
            if (bl2.e == n2) {
                return bl2;
            }
            ++n3;
        }
        return null;
    }

    private boolean z() {
        int n2 = 0;
        while (n2 < 12) {
            if (this.Y[n2] != null) {
                return true;
            }
            ++n2;
        }
        return false;
    }

    public final boolean h() {
        return this.aF;
    }

    public final boolean i() {
        return this.an.b() || this.an.c() || al.a().b();
    }

    public final void d(int n2) {
        this.az = 1;
        this.aA = n2;
    }

    private void A() {
        RecordStore recordStore = null;
        Object object = null;
        try {
            try {
                recordStore = RecordStore.openRecordStore((String)("CLS3_DATA" + this.aw.a), (boolean)true);
                if (recordStore.getNumRecords() > 0) {
                    int n2;
                    byte[] byArray = recordStore.getRecord(1);
                    object = j.a(byArray, 0, byArray.length);
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 1);
                    if (((DataInputStream)object).readBoolean()) {
                        ah.a(((DataInputStream)object).readUTF());
                    }
                    this.B = ((DataInputStream)object).readUTF();
                    this.ad = ((DataInputStream)object).readInt();
                    this.ae = ((DataInputStream)object).readInt();
                    this.S = ((DataInputStream)object).readBoolean();
                    this.l = d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + this.y);
                    int n3 = ((DataInputStream)object).readInt();
                    int n4 = 0;
                    while (n4 < n3) {
                        this.P.a(String.valueOf(((DataInputStream)object).readUTF()) + "=" + ((DataInputStream)object).readLong());
                        ++n4;
                    }
                    this.q = w.a(String.valueOf(cn.com.etgame.cls.system.d.x) + this.x, this.l, this);
                    this.n.a_(((DataInputStream)object).readInt());
                    this.n.b_(((DataInputStream)object).readInt());
                    this.n.a(((DataInputStream)object).readInt(), false, true);
                    this.n.a(((DataInputStream)object).readInt());
                    this.F = ((DataInputStream)object).readInt();
                    this.G = ((DataInputStream)object).readInt();
                    if (((DataInputStream)object).readBoolean()) {
                        this.H = ((DataInputStream)object).readUTF();
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 2);
                    n3 = 0;
                    int n5 = ((DataInputStream)object).readInt();
                    while (n3 < n5) {
                        r r2 = new r(((DataInputStream)object).readInt(), ((DataInputStream)object).readInt(), ((DataInputStream)object).readInt(), ((DataInputStream)object).readInt());
                        new r(((DataInputStream)object).readInt(), ((DataInputStream)object).readInt(), ((DataInputStream)object).readInt(), ((DataInputStream)object).readInt()).c = ((DataInputStream)object).readBoolean();
                        this.r.addElement(r2);
                        ++n3;
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 3);
                    if (((DataInputStream)object).readBoolean()) {
                        this.N.a(((DataInputStream)object).readLong());
                        this.aP = ((DataInputStream)object).readUTF();
                        this.N.c();
                        this.N.g();
                    }
                    this.R = ((DataInputStream)object).readBoolean();
                    n3 = 0;
                    while (n3 < this.aC.length) {
                        this.aC[n3] = ((DataInputStream)object).readInt();
                        ++n3;
                    }
                    int n6 = 0;
                    while (n6 < this.aq.length) {
                        this.aq[n6].a = ((DataInputStream)object).readUTF();
                        cn.com.etgame.cls.system.d.a(1, this.aq[n6].a);
                        this.aq[n6].c(((DataInputStream)object).readInt());
                        if (((DataInputStream)object).readBoolean()) {
                            this.aq[n6].e(((DataInputStream)object).readUTF());
                        }
                        this.aq[n6].a(((DataInputStream)object).readBoolean());
                        this.aq[n6].d(((DataInputStream)object).readInt());
                        this.aq[n6].b = ((DataInputStream)object).readUTF();
                        this.aq[n6].c = ((DataInputStream)object).readUTF();
                        this.aq[n6].e = ((DataInputStream)object).readUTF();
                        this.aq[n6].d = ((DataInputStream)object).readUTF();
                        this.aq[n6].f = ((DataInputStream)object).readUTF();
                        this.aq[n6].g = ((DataInputStream)object).readUTF();
                        this.aq[n6].h = ((DataInputStream)object).readUTF();
                        this.aq[n6].a();
                        this.aq[n6].p(((DataInputStream)object).readInt());
                        this.aq[n6].j(((DataInputStream)object).readInt());
                        this.aq[n6].q(((DataInputStream)object).readInt());
                        this.aq[n6].r(((DataInputStream)object).readInt());
                        this.aq[n6].o(((DataInputStream)object).readInt());
                        this.aq[n6].n(((DataInputStream)object).readInt());
                        this.aq[n6].m(((DataInputStream)object).readInt());
                        this.aq[n6].l(((DataInputStream)object).readInt());
                        this.aq[n6].f(((DataInputStream)object).readInt());
                        this.aq[n6].h(((DataInputStream)object).readInt());
                        String string = ((DataInputStream)object).readUTF();
                        if (!string.equals("null")) {
                            this.aq[n6].a(new i(string));
                        }
                        if (!(string = ((DataInputStream)object).readUTF()).equals("null")) {
                            this.aq[n6].b(new i(string));
                        }
                        if (!(string = ((DataInputStream)object).readUTF()).equals("null")) {
                            this.aq[n6].c(new i(string));
                        }
                        if (!(string = ((DataInputStream)object).readUTF()).equals("null")) {
                            this.aq[n6].d(new i(string));
                        }
                        if (!(string = ((DataInputStream)object).readUTF()).equals("null")) {
                            this.aq[n6].e(new i(string));
                        }
                        if (!(string = ((DataInputStream)object).readUTF()).equals("null")) {
                            this.aq[n6].f(new i(string));
                        }
                        this.aq[n6].s(((DataInputStream)object).readInt());
                        this.aq[n6].b(((DataInputStream)object).readUTF());
                        this.aq[n6].t(((DataInputStream)object).readInt());
                        this.aq[n6].k(((DataInputStream)object).readInt());
                        int[][] nArray = new int[((DataInputStream)object).readInt()][((DataInputStream)object).readInt()];
                        n3 = 0;
                        while (n3 < nArray.length) {
                            n2 = 0;
                            while (n2 < nArray[0].length) {
                                nArray[n3][n2] = ((DataInputStream)object).readInt();
                                ++n2;
                            }
                            ++n3;
                        }
                        this.aq[n6].b(nArray);
                        nArray = new int[((DataInputStream)object).readInt()][((DataInputStream)object).readInt()];
                        n3 = 0;
                        while (n3 < nArray.length) {
                            n2 = 0;
                            while (n2 < nArray[0].length) {
                                nArray[n3][n2] = ((DataInputStream)object).readInt();
                                ++n2;
                            }
                            ++n3;
                        }
                        this.aq[n6].a(nArray);
                        cn.com.etgame.cls.system.d.a(1, String.valueOf(this.aq[n6].a) + "--end");
                        ++n6;
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 4);
                    Vector vector = this.ar.F();
                    n3 = 0;
                    n2 = ((DataInputStream)object).readInt();
                    while (n3 < n2) {
                        vector.addElement(new String(((DataInputStream)object).readUTF()));
                        ++n3;
                    }
                    vector = this.ar.c().a(0);
                    n3 = 0;
                    n2 = ((DataInputStream)object).readInt();
                    while (n3 < n2) {
                        vector.addElement(new i(((DataInputStream)object).readUTF(), ((DataInputStream)object).readInt()));
                        ++n3;
                    }
                    vector = this.ar.c().a(1);
                    n3 = 0;
                    n2 = ((DataInputStream)object).readInt();
                    while (n3 < n2) {
                        vector.addElement(new i(((DataInputStream)object).readUTF(), ((DataInputStream)object).readInt()));
                        ++n3;
                    }
                    vector = this.ar.c().a(2);
                    n3 = 0;
                    n2 = ((DataInputStream)object).readInt();
                    while (n3 < n2) {
                        vector.addElement(new i(((DataInputStream)object).readUTF(), ((DataInputStream)object).readInt()));
                        ++n3;
                    }
                    vector = this.ar.c().a(3);
                    n3 = 0;
                    n2 = ((DataInputStream)object).readInt();
                    while (n3 < n2) {
                        vector.addElement(new i(((DataInputStream)object).readUTF(), ((DataInputStream)object).readInt()));
                        ++n3;
                    }
                    vector = this.ar.c().a(4);
                    n3 = 0;
                    n2 = ((DataInputStream)object).readInt();
                    while (n3 < n2) {
                        vector.addElement(new i(((DataInputStream)object).readUTF(), ((DataInputStream)object).readInt()));
                        ++n3;
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 5);
                    n2 = 0;
                    while (n2 < this.o.length) {
                        this.o[n2] = this.a((DataInputStream)object);
                        ++n2;
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 6);
                    n2 = 0;
                    int n7 = ((DataInputStream)object).readInt();
                    while (n2 < n7) {
                        bl bl2 = this.a((DataInputStream)object);
                        this.s.addElement(bl2);
                        ++n2;
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read----" + 7 + " ==" + this.m);
                    n5 = 0;
                    int n8 = ((DataInputStream)object).readInt();
                    while (n5 < n8) {
                        n2 = ((DataInputStream)object).readInt();
                        n7 = ((DataInputStream)object).readInt();
                        Object object2 = ((DataInputStream)object).readUTF();
                        object2 = new ar(n2, n7, (String)object2, this.m, this.e, this);
                        if (((DataInputStream)object).readBoolean()) {
                            ((ar)object2).a(true);
                        }
                        this.q.c[1].a((bn)object2);
                        this.t.addElement(object2);
                        ++n5;
                    }
                    n7 = 0;
                    int n9 = ((DataInputStream)object).readInt();
                    while (n7 < n9) {
                        ad ad2 = new ad(this.l, this, ((DataInputStream)object).readInt(), ((DataInputStream)object).readInt(), ((DataInputStream)object).readInt());
                        this.u.addElement(ad2);
                        this.q.c[1].a(ad2);
                        ++n7;
                    }
                    cn.com.etgame.cls.system.d.a(1, "---read--end--" + 8);
                }
            }
            catch (Throwable throwable) {
                this.O.a(throwable, "RolePlayingCanvas.load()", 1);
            }
        }
        catch (Throwable throwable) {
            if (object != null) {
                try {
                    ((FilterInputStream)object).close();
                }
                catch (IOException iOException) {
                    object = iOException;
                    iOException.printStackTrace();
                }
            }
            if (recordStore != null) {
                try {
                    recordStore.closeRecordStore();
                }
                catch (Exception exception) {
                    object = exception;
                    exception.printStackTrace();
                }
            }
            throw throwable;
        }
        if (object != null) {
            try {
                ((FilterInputStream)object).close();
            }
            catch (IOException iOException) {
                object = iOException;
                iOException.printStackTrace();
            }
        }
        if (recordStore != null) {
            try {
                recordStore.closeRecordStore();
                return;
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
        }
    }

    private bl a(DataInputStream dataInputStream) {
        if (dataInputStream.readBoolean()) {
            String[] stringArray;
            int n2;
            int[][] nArray;
            String string = null;
            Object object = dataInputStream.readUTF();
            String string2 = dataInputStream.readUTF();
            if (dataInputStream.readBoolean()) {
                string = dataInputStream.readUTF();
            }
            int n3 = dataInputStream.readInt();
            int n4 = dataInputStream.readInt();
            int n5 = dataInputStream.readInt();
            String string3 = dataInputStream.readUTF();
            int n6 = dataInputStream.readInt();
            boolean bl2 = dataInputStream.readBoolean();
            boolean bl3 = dataInputStream.readBoolean();
            if (dataInputStream.readBoolean()) {
                nArray = new int[dataInputStream.readInt()][dataInputStream.readInt()];
                n2 = 0;
                while (n2 < nArray.length) {
                    int n7 = 0;
                    while (n7 < nArray[0].length) {
                        nArray[n2][n7] = dataInputStream.readInt();
                        ++n7;
                    }
                    ++n2;
                }
            } else {
                nArray = null;
            }
            if (dataInputStream.readBoolean()) {
                stringArray = new String[dataInputStream.readInt()];
                n2 = 0;
                while (n2 < stringArray.length) {
                    stringArray[n2] = dataInputStream.readUTF();
                    ++n2;
                }
            } else {
                stringArray = null;
            }
            object = new bl((String)object, string2, d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + string2), this.e, n3, n4, n5, string3.equals("null") ? null : string3, n6, bl2, bl3, nArray, stringArray, this.ao);
            v0.g = dataInputStream.readBoolean();
            ((bl)object).h = dataInputStream.readBoolean();
            ((bl)object).c(dataInputStream.readInt());
            ((bl)object).b(dataInputStream.readInt());
            if (((bl)object).c() == -1) {
                ((bl)object).a(dataInputStream.readUTF());
            }
            ((bl)object).f(dataInputStream.readInt());
            ((bl)object).c(dataInputStream.readBoolean());
            ((bl)object).d(dataInputStream.readBoolean());
            ((bl)object).b(dataInputStream.readBoolean());
            ((bl)object).a(dataInputStream.readBoolean());
            ((bl)object).a(this);
            ((q)object).a(this);
            ((bl)object).c(string);
            n2 = 0;
            int n8 = dataInputStream.readInt();
            while (n2 < n8) {
                ((bl)object).b(dataInputStream.readInt(), dataInputStream.readInt());
                ++n2;
            }
            n2 = 0;
            n8 = dataInputStream.readInt();
            while (n2 < n8) {
                ((bl)object).a(dataInputStream.readInt(), dataInputStream.readInt(), dataInputStream.readInt(), dataInputStream.readInt());
                ++n2;
            }
            n2 = 0;
            n8 = dataInputStream.readInt();
            while (n2 < n8) {
                ((bl)object).c(dataInputStream.readInt(), dataInputStream.readInt());
                ++n2;
            }
            return object;
        }
        return null;
    }

    public final boolean j() {
        return this.R;
    }

    private static void a(DataOutputStream dataOutputStream, bl bl2) {
        if (bl2 != null) {
            int n2;
            dataOutputStream.writeBoolean(true);
            dataOutputStream.writeUTF(bl2.o());
            dataOutputStream.writeUTF(bl2.a);
            if (bl2.n != null) {
                dataOutputStream.writeBoolean(true);
                dataOutputStream.writeUTF(bl2.n);
            } else {
                dataOutputStream.writeBoolean(false);
            }
            dataOutputStream.writeInt(bl2.J());
            dataOutputStream.writeInt(bl2.K());
            dataOutputStream.writeInt(bl2.e);
            dataOutputStream.writeUTF(bl2.d != null ? bl2.d : "null");
            dataOutputStream.writeInt(bl2.f);
            dataOutputStream.writeBoolean(bl2.i);
            dataOutputStream.writeBoolean(bl2.j);
            if (bl2.b != null) {
                dataOutputStream.writeBoolean(true);
                dataOutputStream.writeInt(bl2.b.length);
                dataOutputStream.writeInt(bl2.b[0].length);
                n2 = 0;
                while (n2 < bl2.b.length) {
                    int n3 = 0;
                    while (n3 < bl2.b[0].length) {
                        dataOutputStream.writeInt(bl2.b[n2][n3]);
                        ++n3;
                    }
                    ++n2;
                }
            } else {
                dataOutputStream.writeBoolean(false);
            }
            if (bl2.c != null) {
                dataOutputStream.writeBoolean(true);
                dataOutputStream.writeInt(bl2.c.length);
                n2 = 0;
                while (n2 < bl2.c.length) {
                    dataOutputStream.writeUTF(bl2.c[n2]);
                    ++n2;
                }
            } else {
                dataOutputStream.writeBoolean(false);
            }
            dataOutputStream.writeBoolean(bl2.g);
            dataOutputStream.writeBoolean(bl2.h);
            dataOutputStream.writeInt(bl2.c());
            dataOutputStream.writeInt(bl2.b());
            if (bl2.c() == -1) {
                dataOutputStream.writeUTF(bl2.e().a);
            }
            dataOutputStream.writeInt(bl2.k());
            dataOutputStream.writeBoolean(bl2.l());
            dataOutputStream.writeBoolean(bl2.i());
            dataOutputStream.writeBoolean(bl2.m());
            dataOutputStream.writeBoolean(bl2.n());
            dataOutputStream.writeInt(bl2.k.size());
            n2 = 0;
            while (n2 < bl2.k.size()) {
                int[] nArray = (int[])bl2.k.elementAt(n2);
                dataOutputStream.writeInt(nArray[0]);
                dataOutputStream.writeInt(nArray[1]);
                ++n2;
            }
            dataOutputStream.writeInt(bl2.l.size());
            n2 = 0;
            while (n2 < bl2.l.size()) {
                int[] nArray = (int[])bl2.l.elementAt(n2);
                dataOutputStream.writeInt(nArray[0]);
                dataOutputStream.writeInt(nArray[1]);
                dataOutputStream.writeInt(nArray[2]);
                dataOutputStream.writeInt(nArray[3]);
                ++n2;
            }
            dataOutputStream.writeInt(bl2.m.size());
            n2 = 0;
            while (n2 < bl2.m.size()) {
                int[] nArray = (int[])bl2.m.elementAt(n2);
                dataOutputStream.writeInt(nArray[0]);
                dataOutputStream.writeInt(nArray[1]);
                ++n2;
            }
            return;
        }
        dataOutputStream.writeBoolean(false);
    }

    public final ac k() {
        return this.n;
    }

    public final w l() {
        return this.q;
    }

    private void a(boolean bl2, boolean bl3) {
        this.am = bl2;
        if (bl3) {
            if (!this.am) {
                this.al = this.ak;
                return;
            }
        } else if (this.am) {
            this.al = this.ak;
            return;
        }
        this.al = 0;
    }

    public final boolean a(String[] stringArray) {
        int n2 = 0;
        while (n2 < stringArray.length) {
            stringArray[n2] = stringArray[n2].trim();
            if (stringArray[n2].length() > 0) {
                if (stringArray[n2].equals("player.dir==up")) {
                    if (this.n.b() != 1) {
                        return false;
                    }
                } else if (stringArray[n2].equals("player.dir==down")) {
                    if (this.n.b() != 2) {
                        return false;
                    }
                } else if (stringArray[n2].equals("player.dir==left")) {
                    if (this.n.b() != 4) {
                        return false;
                    }
                } else if (stringArray[n2].equals("player.dir==right")) {
                    if (this.n.b() != 8) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("eventMarked")) {
                    if (!this.a(cn.com.etgame.cls.system.d.f(stringArray[n2])[0])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("!eventMarked")) {
                    if (this.P.a("event" + cn.com.etgame.cls.system.d.f(stringArray[n2])[0]) == 1L) {
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
                } else if (stringArray[n2].startsWith("player.itemCountIsGreaterThan")) {
                    String[] stringArray2 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.ar.c().b(new i(stringArray2[0])) <= (int)this.P.a(stringArray2[1])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("player.itemCountIsLesserThan")) {
                    String[] stringArray3 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.ar.c().b(new i(stringArray3[0])) >= (int)this.P.a(stringArray3[1])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("player.itemExists")) {
                    String[] stringArray4 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.ar.c().b(new i(stringArray4[0])) == 0) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("player.goldIsGreaterThan")) {
                    String[] stringArray5 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.ar.g() <= (int)this.P.a(stringArray5[0])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("player.goldIsLesserThan")) {
                    String[] stringArray6 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.ar.g() >= (int)this.P.a(stringArray6[0])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("partner.feelingIsGreaterThan")) {
                    String[] stringArray7 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.aC[(int)this.P.a(stringArray7[0])] < (int)this.P.a(stringArray7[1])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("partner.feelingIsLesserThan")) {
                    String[] stringArray8 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.aC[(int)this.P.a(stringArray8[0])] >= (int)this.P.a(stringArray8[1])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("partner.feelingIsEqualTo")) {
                    String[] stringArray9 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.aC[(int)this.P.a(stringArray9[0])] != (int)this.P.a(stringArray9[1])) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("partner.feelingIsGreater")) {
                    String[] stringArray10 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.aC[(int)this.P.a(stringArray10[0])] < this.aC[(int)this.P.a(stringArray10[1])]) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("!partner.feelingIsGreater")) {
                    String[] stringArray11 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    if (this.aC[(int)this.P.a(stringArray11[0])] >= this.aC[(int)this.P.a(stringArray11[1])]) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("partner.feelingEqual")) {
                    if (this.aC[0] != this.aC[1]) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("partner.exists")) {
                    String[] stringArray12 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    int n3 = (int)this.P.a(stringArray12[0]);
                    if (this.o[n3] != null && !this.o[n3].h) {
                        return false;
                    }
                } else if (stringArray[n2].startsWith("!partner.exists")) {
                    String[] stringArray13 = cn.com.etgame.cls.system.d.f(stringArray[n2]);
                    int n4 = (int)this.P.a(stringArray13[0]);
                    if (this.o[n4] != null && this.o[n4].h) {
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

    public final boolean a(String string) {
        return this.P.a("event" + string) == 1L;
    }

    public final boolean e(int n2) {
        return this.P.a("event" + n2) == 1L;
    }

    public final bn a(bn object, ao ao2) {
        Object object2;
        Object object3;
        if (((bn)object).v != null && (object3 = ((String)((bn)object).v).trim()).length() > 0) {
            this.P.a("player.x=" + this.n.J());
            this.P.a("player.y=" + this.n.K());
            if (object3.endsWith(";")) {
                object3 = object3.substring(0, object3.length() - 1);
            }
            object2 = null;
            object3 = cn.com.etgame.cls.system.d.c((String)object3);
            int n2 = 0;
            while (n2 < ((String[])object3).length) {
                object3[n2] = object3[n2].trim();
                String string = cn.com.etgame.cls.system.d.d(object3[n2]);
                Object object4 = cn.com.etgame.cls.system.d.e(object3[n2]);
                cn.com.etgame.cls.system.d.a("# " + object3[n2]);
                if (this.a(cn.com.etgame.cls.system.d.g(object3[n2]))) {
                    if (object3[n2].startsWith("element")) {
                        if (string.equals("addToNpc")) {
                            if (this.aw != null) {
                                return null;
                            }
                            int n3 = (int)this.P.a(object4[0]);
                            try {
                                if (object4[1].endsWith(".str")) {
                                    object4 = new bg(String.valueOf(cn.com.etgame.cls.system.d.A) + object4[1]);
                                    object2 = new bl(ao2.a, ((bg)object4).a("\u52a8\u753b\u6587\u4ef6"), d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + ((bg)object4).a("\u52a8\u753b\u6587\u4ef6")), this.e, ((bn)object).J(), ((bn)object).K(), n3, ((bg)object4).a("\u540d\u5b57"), Integer.parseInt(((bg)object4).a("\u540d\u5b57\u9ad8\u5ea6")), ((bg)object4).a("\u5de6\u53f3\u79fb\u52a8").equals("\u662f"), ((bg)object4).a("\u4e0a\u4e0b\u79fb\u52a8").equals("\u662f"), cn.com.etgame.cls.system.d.h(((bg)object4).a("\u5bf9\u8bdd\u533a\u57df")), b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + ((bg)object4).a("\u5bf9\u8bdd\u6587\u4ef6")), this.ao);
                                } else {
                                    object2 = new bl(ao2.a, object4[1], d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + object4[1]), this.e, ((bn)object).J(), ((bn)object).K(), n3, null, 0, false, false, null, null, this.ao);
                                }
                                ((bl)object2).a(this);
                                ((q)object2).a(this);
                                this.s.addElement(object2);
                            }
                            catch (IOException iOException) {
                                this.O.a(iOException, "RolePlayingCanvas.initElement(" + object + ")", 1);
                            }
                            object = object2;
                        } else if (string.equals("addToMonster")) {
                            if (this.aw != null) {
                                return null;
                            }
                            object = new ar(((bn)object).J(), ((bn)object).K(), object4[0], this.m, this.e, this);
                            this.t.addElement(object);
                        } else if (string.equals("addToDropRock")) {
                            try {
                                cn.com.etgame.cls.system.d.a(9, "\u52a0\u8f7d\u843d\u77f3");
                                object = new u(d.a(String.valueOf(cn.com.etgame.cls.system.d.y) + "npc_" + (int)this.P.a(object4[0]) + ".ant"), this.e, (int)this.P.a((String)object4[0]) == 10);
                                this.aQ.addElement(object);
                            }
                            catch (IOException iOException) {
                                this.O.a(iOException, "\u843d\u77f3\u6587\u4ef6\u52a0\u8f7d\u5f02\u5e38", 1);
                            }
                        } else if (string.equals("addToBird")) {
                            object = new s(this.l, this, ((bn)object).J(), ((bn)object).K());
                        } else if (string.equals("addToFish")) {
                            object = new bc(this.l, ((bn)object).J(), ((bn)object).K(), true);
                        } else if (string.equals("addToWave")) {
                            object = new bc(this.l, ((bn)object).J(), ((bn)object).K(), false);
                        } else if (string.equals("addToButterfly")) {
                            object = new z(this.l, ((bn)object).J(), ((bn)object).K());
                        } else if (string.equals("addToPoult")) {
                            object = new aq(this.l, this, ((bn)object).J(), ((bn)object).K());
                        } else if (string.equals("addToTreasureBox")) {
                            if (this.aw != null) {
                                return null;
                            }
                            object = new ad(this.l, this, ((bn)object).J(), ((bn)object).K(), (int)this.P.a((String)object4[0]));
                            this.u.addElement(object);
                        } else if (string.equals("addToCock")) {
                            object = new az(this.l, this, ((bn)object).J(), ((bn)object).K());
                        } else if (string.equals("addToCloud")) {
                            object = new ap(this.l, this);
                        } else if (string.equals("remove")) {
                            if (object instanceof bl) {
                                this.s.removeElement(object);
                            } else if (object instanceof ar) {
                                this.t.removeElement(object);
                            } else if (object instanceof ad) {
                                this.u.removeElement(object);
                            } else if (object instanceof u) {
                                this.aQ.removeElement(object);
                            }
                            return null;
                        }
                    } else if (object3[n2].startsWith("npc") && object2 != null) {
                        if (string.equals("addInitialPosition")) {
                            ((bl)object2).b((int)this.P.a(object4[0]), (int)this.P.a(object4[1]));
                        } else if (string.equals("addActivityRegion")) {
                            ((bl)object2).a((int)this.P.a(object4[0]), (int)this.P.a(object4[1]), (int)this.P.a(object4[2]), (int)this.P.a((String)object4[3]));
                        } else if (string.equals("addNode")) {
                            ((bl)object2).c((int)this.P.a(object4[0]), (int)this.P.a(object4[1]));
                        } else if (string.equals("setVelocity")) {
                            ((bl)object2).f((int)this.P.a(object4[0]));
                        } else if (string.equals("setState")) {
                            if (object4[0].equals("walk")) {
                                ((bl)object2).c(1);
                            } else if (object4[0].equals("stand")) {
                                ((bl)object2).c(0);
                            }
                        } else if (string.equals("setDirection")) {
                            ((bl)object2).b(cn.com.etgame.cls.system.d.b(object4[0]));
                        } else if (string.equals("setSequence")) {
                            ((bl)object2).a(object4[0]);
                        } else if (string.equals("setPosition")) {
                            ((bl)object2).a((int)this.P.a((String)object4[0]), (int)this.P.a((String)object4[1]));
                        } else if (string.equals("setAiEnabled")) {
                            if (((String)object4[0]).equals("true")) {
                                ((bl)object2).b(true);
                            } else {
                                ((bl)object2).b(false);
                            }
                        } else if (string.equals("removeNode")) {
                            ((bl)object2).g();
                        } else if (string.equals("setIgnoreEvent")) {
                            ((bl)object2).d(((String)object4[0]).equals("true"));
                        } else if (string.equals("setPortrait")) {
                            try {
                                ((bl)object2).c(String.valueOf(object4[0]) + "," + (String)object4[1]);
                            }
                            catch (Exception exception) {
                                this.O.a(exception, "RolePlayingCanvas.initElement(" + object + ")", 1);
                            }
                        }
                    }
                }
                ++n2;
            }
        }
        if (object instanceof q && (object2 = ((q)object).e()) != null) {
            if (((at)object2).a.startsWith("\u6e38\u9c7c")) {
                ((q)object).c(this.l.b("\u6e38\u9c7c" + j.a(0, 3)));
            }
            if (((at)object2).b.length > 0) {
                ((at)object2).b(j.a(1, ((at)object2).b.length) - 1);
            }
        }
        return object;
    }

    public final void a(String string, long l2) {
        this.I = string;
        this.K.a(l2);
        this.K.c();
        this.K.g();
    }

    /*
     * Unable to fully structure code
     * Could not resolve type clashes
     */
    public final void a(Object var1_1, Object var2_2) {
        block334: {
            if (var1_1 /* !! */  == null) {
                return;
            }
            if ((var1_1 /* !! */  = ((String)var1_1 /* !! */ ).trim()).length() <= 0) break block334;
            this.P.a("player.x=" + this.n.J());
            this.P.a("player.y=" + this.n.K());
            if (var1_1 /* !! */ .endsWith(";")) {
                var1_1 /* !! */  = var1_1 /* !! */ .substring(0, var1_1 /* !! */ .length() - 1);
            }
            var1_1 /* !! */  = cn.com.etgame.cls.system.d.c((String)var1_1 /* !! */ );
            var5_3 = 0;
            while (var5_3 < var1_1 /* !! */ .length) {
                block333: {
                    block335: {
                        var3_4 = false;
                        var1_1 /* !! */ [var5_3] = var1_1 /* !! */ [var5_3].trim();
                        var4_9 = cn.com.etgame.cls.system.d.d(var1_1 /* !! */ [var5_3]);
                        if (!var1_1 /* !! */ [var5_3].startsWith("script")) ** GOTO lbl-1000
                        if (!var4_9.equals("openScriptList")) break block335;
                        this.U = true;
                        this.V = true;
                        var3_4 = true;
                        ** GOTO lbl-1000
                    }
                    if (var4_9.equals("closeScriptList")) {
                        cn.com.etgame.cls.system.d.a(var1_1 /* !! */ [var5_3]);
                        this.U = false;
                        this.V = false;
                    } else if (this.U && !var3_4) {
                        if (!this.V) {
                            cn.com.etgame.cls.system.d.a("<< " + var1_1 /* !! */ [var5_3]);
                            this.v.addElement(new Object[]{var1_1 /* !! */ [var5_3], var2_2});
                        }
                    } else {
                        var3_5 /* !! */  = cn.com.etgame.cls.system.d.e(var1_1 /* !! */ [var5_3]);
                        cn.com.etgame.cls.system.d.a(var1_1 /* !! */ [var5_3]);
                        if (this.a(cn.com.etgame.cls.system.d.g(var1_1 /* !! */ [var5_3]))) {
                            if (var1_1 /* !! */ [var5_3].startsWith("element")) {
                                if (var4_9.equals("setSequence") && var2_2 instanceof q) {
                                    var6_16 = at.a(this.l.b(var3_5 /* !! */ [0]));
                                    var6_16.a((int)this.P.a(var3_5 /* !! */ [1]));
                                    var6_16.e();
                                    var6_16.g();
                                    ((q)var2_2).c(var6_16);
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("fee")) {
                                if (var4_9.equals("ybdx")) {
                                    var6_17 = 0;
                                    while (var6_17 < this.aq.length) {
                                        var7_39 = 0;
                                        while (var7_39 < this.aq[var6_17].G().length) {
                                            this.aq[var6_17].G()[var7_39][2] = 1;
                                            this.aq[var6_17].G()[var7_39][3] = 1000;
                                            ++var7_39;
                                        }
                                        ++var6_17;
                                    }
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("world")) {
                                if (var4_9.equals("addMask")) {
                                    var6_18 = (int)this.P.a(var3_5 /* !! */ [0]);
                                    var7_40 = (int)this.P.a(var3_5 /* !! */ [1]);
                                    var4_10 = (int)this.P.a(var3_5 /* !! */ [2]);
                                    var3_6 = (int)this.P.a(var3_5 /* !! */ [3]);
                                    var8_56 = false;
                                    var10_58 = 0;
                                    var11_59 = this.r.size();
                                    while (var10_58 < var11_59) {
                                        var9_57 = (r)this.r.elementAt(var10_58);
                                        var16_67 = var3_6;
                                        var15_65 = var4_10;
                                        var14_63 = var7_40;
                                        var13_61 = var6_18;
                                        var12_60 = var9_57;
                                        if (var9_57.J() == var13_61 && var12_60.K() == var14_63 && var12_60.a == var15_65 && var12_60.b == var16_67) {
                                            var9_57.c = true;
                                            var8_56 = true;
                                            break;
                                        }
                                        ++var10_58;
                                    }
                                    if (!var8_56) {
                                        var9_57 = new r(var6_18, var7_40, var4_10, var3_6);
                                        this.q.c[2].a(var9_57);
                                        this.r.addElement(var9_57);
                                    }
                                } else if (var4_9.equals("setName")) {
                                    this.B = var3_5 /* !! */ [0];
                                } else if (var4_9.equals("removeAllMask")) {
                                    var6_19 = 0;
                                    var7_41 = this.r.size();
                                    while (var6_19 < var7_41) {
                                        ((r)this.r.elementAt((int)var6_19)).c = false;
                                        ++var6_19;
                                    }
                                } else if (var4_9.equals("change")) {
                                    var6_20 = cn.com.etgame.cls.system.d.b(var3_5 /* !! */ [6]);
                                    var4_11 = (int)this.P.a(var3_5 /* !! */ [5]);
                                    var3_7 = (int)this.P.a(var3_5 /* !! */ [4]);
                                    var16_68 = var3_5 /* !! */ [3];
                                    var15_66 = var3_5 /* !! */ [2];
                                    var14_64 = var3_5 /* !! */ [1];
                                    var13_62 = var3_5 /* !! */ [0];
                                    var12_60 = this;
                                    if (var12_60.x != null) {
                                        if (j.a(var12_60.x, "_")[0].startsWith(j.a(var13_62, "_")[0])) {
                                            cn.com.etgame.cls.system.d.a(2, "*****************\u56fe\u7247\u4e0d\u91ca\u653e********************");
                                            var12_60.aR = false;
                                        } else {
                                            var12_60.aR = true;
                                        }
                                    } else {
                                        var12_60.aR = true;
                                    }
                                    var12_60.x = var13_62;
                                    var12_60.y = var15_66;
                                    var12_60.z = var16_68;
                                    var12_60.A = var14_64;
                                    var12_60.C = var3_7;
                                    var12_60.D = var4_11;
                                    var12_60.E = var6_20;
                                    super.a(true);
                                    super.y();
                                } else if (var4_9.equals("fadeOut")) {
                                    this.a(false);
                                } else if (var4_9.equals("setFlyEnabled")) {
                                    this.R = var3_5 /* !! */ [0].equals("true");
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("player")) {
                                if (var4_9.equals("moveTo")) {
                                    this.T = var3_5 /* !! */ [2].equals("true");
                                    this.Y[0] = this.n;
                                    this.Z[0] = (int)this.P.a(var3_5 /* !! */ [0]);
                                    this.aa[0] = (int)this.P.a(var3_5 /* !! */ [1]);
                                } else if (var4_9.equals("move")) {
                                    if (var3_5 /* !! */ .length == 0) {
                                        this.a(this.n, this.n.b(), this.ar.d(), cn.com.etgame.cls.system.d.i, true, var3_5 /* !! */ [0].equals("true") == false);
                                    } else {
                                        this.a(this.n, cn.com.etgame.cls.system.d.b(var3_5 /* !! */ [0]), (int)this.P.a(var3_5 /* !! */ [1]), 0, true, var3_5 /* !! */ [2].equals("true") == false);
                                    }
                                    this.ax = this.n.J();
                                    this.ay = this.n.K();
                                    this.P.a("player.x=" + this.ax);
                                    this.P.a("player.y=" + this.ay);
                                } else if (var4_9.equals("takeTheStairs")) {
                                    this.n.g();
                                    this.a(this.n, cn.com.etgame.cls.system.d.b(var3_5 /* !! */ [0]), this.ar.d() >> 1, 0, false, true);
                                    this.ax = this.n.J();
                                    this.ay = this.n.K();
                                } else if (var4_9.equals("playAnimation")) {
                                    this.n.b(var3_5 /* !! */ [0]);
                                } else if (var4_9.equals("setSequence")) {
                                    this.n.a(var3_5 /* !! */ [0], var3_5 /* !! */ [1].equals("true") != false ? -1 : 1);
                                } else if (var4_9.equals("setState")) {
                                    if (var3_5 /* !! */ [0].equals("stand")) {
                                        this.n.a(0, false, true);
                                    } else if (var3_5 /* !! */ [0].equals("move")) {
                                        this.n.a(1, false, true);
                                    } else if (var3_5 /* !! */ [0].equals("fly")) {
                                        this.n.a(2, false, true);
                                    }
                                } else if (var4_9.equals("setVelocity")) {
                                    this.ar.c((int)this.P.a(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("setDirection")) {
                                    this.n.a(cn.com.etgame.cls.system.d.b(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("setPosition")) {
                                    this.n.a((int)this.P.a(var3_5 /* !! */ [0]), (int)this.P.a(var3_5 /* !! */ [1]));
                                    this.P.a("player.x=" + this.n.J());
                                    this.P.a("player.y=" + this.n.K());
                                } else if (var4_9.equals("addItem")) {
                                    this.ar.c().a(new i(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("removeItem")) {
                                    this.ar.c().a(new i(var3_5 /* !! */ [0]), 1);
                                } else if (var4_9.equals("addGold")) {
                                    this.ar.i((int)this.P.a(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("reduceGold")) {
                                    this.ar.h(this.ar.g() - (int)this.P.a(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("setGold")) {
                                    this.ar.h((int)this.P.a(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("healing")) {
                                    this.ar.j(this.ar.i());
                                } else if (var4_9.equals("levelup")) {
                                    cn.com.etgame.cls.system.d.a(500);
                                    var6_21 = 0;
                                    while (var6_21 < this.aq.length) {
                                        if (this.aq[var6_21].I()) {
                                            this.aq[var6_21].e((int)this.P.a(var3_5 /* !! */ [0]));
                                        }
                                        ++var6_21;
                                    }
                                } else if (var4_9.equals("showFace")) {
                                    this.n.a(var3_5 /* !! */ [0]);
                                } else if (var4_9.equals("hideFace")) {
                                    this.n.a((String)null);
                                } else if (var4_9.equals("firstTask")) {
                                    var6_22 = this.ar.F();
                                    if (var6_22.size() > 0) {
                                        var6_22.setElementAt(var3_5 /* !! */ [0], 0);
                                    } else {
                                        this.ar.c(var3_5 /* !! */ [0]);
                                    }
                                } else if (var4_9.equals("task")) {
                                    var6_23 = this.ar.F();
                                    if (var6_23.size() > 0) {
                                        this.ar.c(var3_5 /* !! */ [0]);
                                    } else {
                                        this.ar.c("\u65e0");
                                        this.ar.c(var3_5 /* !! */ [0]);
                                    }
                                } else if (var4_9.equals("removeTask")) {
                                    if (this.ar.F().size() > 0) {
                                        this.ar.d(var3_5 /* !! */ [0]);
                                    }
                                } else if (var4_9.equals("startSkill")) {
                                    var6_24 = var3_5 /* !! */ [0];
                                    if (var6_24.equals("\u9b54\u5c0a\u771f\u8eab")) {
                                        var7_42 = 0;
                                        while (var7_42 < this.ar.H().length) {
                                            if (this.ar.H()[var7_42][0] == 7) {
                                                this.ar.H()[var7_42][1] = 1;
                                            }
                                            ++var7_42;
                                        }
                                        this.a("\u5f00\u901a\u6280\u80fd" + var6_24, 2000L);
                                    }
                                } else if (var2_2 != null && var2_2 instanceof bj) {
                                    var6_25 = (bj)var2_2;
                                    if (var4_9.equals("addspeed")) {
                                        var7_43 = Integer.parseInt(var3_5 /* !! */ [0]);
                                        var6_25.s(var6_25.z() + var7_43);
                                        this.a("\u52a0" + var7_43 + "\u70b9\u901f", 2000L);
                                    } else if (var4_9.equals("addluck")) {
                                        var7_44 = Integer.parseInt(var3_5 /* !! */ [0]);
                                        var6_25.t(var6_25.A() + var7_44);
                                        this.a("\u52a0" + var7_44 + "\u70b9\u8fd0", 2000L);
                                    } else if (var4_9.equals("addgod")) {
                                        var7_45 = Integer.parseInt(var3_5 /* !! */ [0]);
                                        var6_25.l(var6_25.s() + var7_45);
                                        this.a("\u52a0" + var7_45 + "\u70b9\u795e", 2000L);
                                    } else if (var4_9.equals("addhp")) {
                                        var7_46 = Integer.parseInt(var3_5 /* !! */ [0]);
                                        var6_25.j(var6_25.j() + var7_46);
                                        this.a("\u52a0" + var7_46 + "\u70b9\u8840", 2000L);
                                    } else if (var4_9.equals("addlove")) {
                                        var7_47 = Integer.parseInt(var3_5 /* !! */ [0]);
                                        var6_25.k(var6_25.k() + var7_47);
                                        if (var6_25.a.equals("\u6708\u7476")) {
                                            this.aC[0] = var6_25.k();
                                        } else {
                                            this.aC[1] = var6_25.k();
                                        }
                                        this.a("\u52a0" + var7_47 + "\u70b9\u597d\u611f\u5ea6", 2000L);
                                    } else if (var4_9.equals("startArtSkill")) {
                                        var7_48 = var3_5 /* !! */ [0];
                                        var4_9 = af.a(var7_48);
                                        var3_8 = 0;
                                        while (var3_8 < var6_25.G().length) {
                                            if (var4_9.a == var6_25.G()[var3_8][1]) {
                                                var6_25.G()[var3_8][2] = 1;
                                            }
                                            ++var3_8;
                                        }
                                        this.a("\u5f00\u901a\u6280\u80fd" + var7_48, 2000L);
                                    }
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("npc")) {
                                if (var4_9.equals("reverse") && var3_5 /* !! */ .length == 1) {
                                    if (var2_2 instanceof bl) {
                                        ((bl)var2_2).a(var3_5 /* !! */ [0].equals("true"));
                                    }
                                } else {
                                    var6_26 = (int)this.P.a(var3_5 /* !! */ [0]);
                                    var7_49 = this.j(var6_26);
                                    if (var7_49 != null) {
                                        if (var4_9.equals("moveTo")) {
                                            var4_12 = 0;
                                            while (var4_12 < 12) {
                                                if (this.Y[var4_12] == null) {
                                                    this.Y[var4_12] = var7_49;
                                                    this.Z[var4_12] = (int)this.P.a(var3_5 /* !! */ [1]);
                                                    this.aa[var4_12] = (int)this.P.a(var3_5 /* !! */ [2]);
                                                    this.ab[var4_12] = (int)this.P.a(var3_5 /* !! */ [3]);
                                                    break;
                                                }
                                                ++var4_12;
                                            }
                                        } else if (var4_9.equals("setState")) {
                                            if (var3_5 /* !! */ [1].equals("walk")) {
                                                var7_49.c(1);
                                            } else if (var3_5 /* !! */ [1].equals("stand")) {
                                                var7_49.c(0);
                                            }
                                        } else if (var4_9.equals("setDirection")) {
                                            var7_49.b(cn.com.etgame.cls.system.d.b(var3_5 /* !! */ [1]));
                                        } else if (var4_9.equals("setPosition")) {
                                            var7_49.a((int)this.P.a(var3_5 /* !! */ [1]), (int)this.P.a(var3_5 /* !! */ [2]));
                                        } else if (var4_9.equals("setSequence")) {
                                            var7_49.a(var3_5 /* !! */ [1]);
                                        } else if (var4_9.equals("setAiEnabled")) {
                                            if (var3_5 /* !! */ [1].equals("true")) {
                                                var7_49.b(true);
                                            } else {
                                                var7_49.b(false);
                                            }
                                        } else if (var4_9.equals("reverse")) {
                                            var7_49.a(var3_5 /* !! */ [1].equals("true"));
                                        } else if (var4_9.equals("setIgnoreEvent")) {
                                            var7_49.d(var3_5 /* !! */ [1].equals("true"));
                                        } else if (var4_9.equals("in")) {
                                            var7_49.g = true;
                                            var4_13 = 0;
                                            while (var4_13 < 12) {
                                                if (this.Y[var4_13] == null) {
                                                    this.Y[var4_13] = var7_49;
                                                    this.Z[var4_13] = this.n.J();
                                                    this.aa[var4_13] = this.n.K();
                                                    this.ab[var4_13] = (int)this.P.a(var3_5 /* !! */ [1]);
                                                    break;
                                                }
                                                ++var4_13;
                                            }
                                        } else if (var4_9.equals("showFace")) {
                                            var7_49.b(var3_5 /* !! */ [1]);
                                        } else if (var4_9.equals("hideFace")) {
                                            var7_49.b(null);
                                        } else if (var4_9.equals("bindPlayer")) {
                                            var7_49.c(true);
                                        } else if (var4_9.equals("unbindPlayer")) {
                                            var7_49.c(false);
                                        }
                                    }
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("partner")) {
                                var6_27 = (int)this.P.a(var3_5 /* !! */ [0]);
                                if (var4_9.equals("addFeeling")) {
                                    this.aC[var6_27] = Math.min(this.aC[var6_27] + (int)this.P.a(var3_5 /* !! */ [1]), 100);
                                    if (var6_27 == 0) {
                                        this.aq[1].k(this.aC[var6_27]);
                                    } else {
                                        this.aq[2].k(this.aC[var6_27]);
                                    }
                                } else if (var4_9.equals("reduceFeeling")) {
                                    this.aC[var6_27] = Math.max(this.aC[var6_27] - (int)this.P.a(var3_5 /* !! */ [1]), 0);
                                    if (var6_27 == 0) {
                                        this.aq[1].k(this.aC[var6_27]);
                                    } else {
                                        this.aq[2].k(this.aC[var6_27]);
                                    }
                                } else if (var4_9.equals("in")) {
                                    this.o[var6_27] = this.j((int)this.P.a(var3_5 /* !! */ [1]));
                                    this.o[var6_27].g = true;
                                    var7_50 = 0;
                                    while (var7_50 < 12) {
                                        if (this.Y[var7_50] == null) {
                                            this.Y[var7_50] = this.o[var6_27];
                                            this.Z[var7_50] = this.n.J();
                                            this.aa[var7_50] = this.n.K();
                                            this.ab[var7_50] = (int)this.P.a(var3_5 /* !! */ [2]);
                                            break;
                                        }
                                        ++var7_50;
                                    }
                                } else if (var4_9.equals("out") && this.o[var6_27] != null && this.o[var6_27].h) {
                                    this.o[var6_27].e = (int)this.P.a(var3_5 /* !! */ [1]);
                                    this.o[var6_27].a_(this.n.J());
                                    this.o[var6_27].b_(this.n.K());
                                    try {
                                        this.o[var6_27].c(this.aq[var6_27 + 1].i);
                                    }
                                    catch (IOException var7_51) {
                                        this.O.a(var7_51, "partner.out() partner[id].setPortrait()", 1);
                                    }
                                    this.o[var6_27].h = false;
                                    this.s.addElement(this.o[var6_27]);
                                    this.q.c[1].a(this.o[var6_27]);
                                    var7_52 = 0;
                                    while (var7_52 < 12) {
                                        if (this.Y[var7_52] == null) {
                                            this.Y[var7_52] = this.o[var6_27];
                                            this.Z[var7_52] = (int)this.P.a(var3_5 /* !! */ [2]);
                                            this.aa[var7_52] = (int)this.P.a(var3_5 /* !! */ [3]);
                                            this.ab[var7_52] = (int)this.P.a(var3_5 /* !! */ [4]);
                                            break;
                                        }
                                        ++var7_52;
                                    }
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("item")) {
                                if (var2_2 instanceof i && var4_9.equals("remove")) {
                                    var6_28 = (i)var2_2;
                                    if (var6_28.d() > 1) {
                                        var6_28.a(var6_28.d() - 1);
                                    } else {
                                        this.ar.c().a(var6_28, 1);
                                    }
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("user")) {
                                if (var4_9.equals("addHP")) {
                                    this.ar.j(this.ar.j() + (int)this.P.a(var3_5 /* !! */ [0]));
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("camera")) {
                                if (var4_9.equals("setFocusOnPlayer")) {
                                    this.ac = this.n;
                                    this.ad = this.ac.J();
                                    this.ae = this.ac.K();
                                    this.ah = -1;
                                    this.ai = -1;
                                } else if (var4_9.equals("setFocusOnNpc")) {
                                    var6_29 = (int)this.P.a(var3_5 /* !! */ [0]);
                                    var7_53 = this.j(var6_29);
                                    if (var7_53 != null) {
                                        this.ac = var7_53;
                                        this.ad = this.ac.J();
                                        this.ae = this.ac.K();
                                        this.ah = -1;
                                        this.ai = -1;
                                    }
                                } else if (var4_9.equals("setPosition")) {
                                    this.ac = null;
                                    this.ad = (int)this.P.a(var3_5 /* !! */ [0]);
                                    this.ae = (int)this.P.a(var3_5 /* !! */ [1]);
                                    this.ah = -1;
                                    this.ai = -1;
                                } else if (var4_9.equals("moveTo")) {
                                    this.ac = null;
                                    this.ah = (int)this.P.a(var3_5 /* !! */ [0]);
                                    this.ai = (int)this.P.a(var3_5 /* !! */ [1]);
                                    this.aj = (int)this.P.a(var3_5 /* !! */ [2]);
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("dialogBox")) {
                                if (var4_9.equals("setText")) {
                                    this.ap.a(var3_5 /* !! */ [0]);
                                } else if (var4_9.equals("setType")) {
                                    this.ap.a(var3_5 /* !! */ [0].equals("type_right"));
                                } else if (var4_9.equals("showDialog")) {
                                    this.n.a(0, false, false);
                                    this.ap.b(true);
                                } else if (var4_9.equals("hideDialog")) {
                                    this.ap.b(false);
                                } else if (var4_9.equals("showPlayerPortrait")) {
                                    this.ap.a(this.ar.b());
                                } else if (var4_9.equals("showNpcPortrait")) {
                                    this.ap.a(this.j((int)this.P.a(var3_5 /* !! */ [0])).h());
                                } else if (var4_9.equals("hidePortrait")) {
                                    this.ap.a((at)null);
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("guide")) {
                                if (var4_9.equals("setText")) {
                                    this.H = var3_5 /* !! */ [0];
                                    if (this.H != null && this.H.trim().length() == 0) {
                                        this.H = null;
                                    }
                                } else if (var4_9.equals("setTarget")) {
                                    this.F = (int)this.P.a(var3_5 /* !! */ [0]);
                                    this.G = (int)this.P.a(var3_5 /* !! */ [1]);
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("script")) {
                                if (var4_9.equals("load")) {
                                    try {
                                        this.w.put(var3_5 /* !! */ [0], b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + var3_5 /* !! */ [0] + ".str"));
                                    }
                                    catch (IOException var6_30) {
                                        this.O.a(var6_30, "RolePlayingCanvas.parse(script,host)", 1);
                                    }
                                } else if (var4_9.equals("include")) {
                                    try {
                                        var6_31 = this.w.get(var3_5 /* !! */ [0]);
                                        if (var6_31 == null) {
                                            this.a((Object)b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + var3_5 /* !! */ [0] + ".str", (int)this.P.a(var3_5 /* !! */ [1])), var2_2);
                                            break block333;
                                        }
                                        this.a((Object)((String[])var6_31)[(int)this.P.a(var3_5 /* !! */ [1])], var2_2);
                                    }
                                    catch (IOException var6_32) {
                                        this.O.a(var6_32, "RolePlayingCanvas.parse(script,host)", 1);
                                    }
                                } else if (var4_9.equals("openScriptList")) {
                                    this.V = false;
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("game")) {
                                if (var4_9.equals("markEvent")) {
                                    this.a(var3_5 /* !! */ [0], true);
                                } else if (var4_9.equals("unmarkEvent")) {
                                    this.a(var3_5 /* !! */ [0], false);
                                } else if (var4_9.equals("showMenu")) {
                                    this.an.b = true;
                                    this.aU.c();
                                    this.aU.g();
                                    this.an.d();
                                } else if (var4_9.equals("showFee")) {
                                    this.aV = true;
                                    al.a().a((int)this.P.a(var3_5 /* !! */ [0]), var3_5 /* !! */ [1], var3_5 /* !! */ [2], (int)this.P.a(var3_5 /* !! */ [3]), var3_5 /* !! */ [4], this);
                                    this.w();
                                    this.n.a(0, false, true);
                                    this.W = 0;
                                } else if (var4_9.equals("dropRock")) {
                                    ((u)this.aQ.elementAt((int)this.P.a(var3_5 /* !! */ [0]))).a((int)this.P.a(var3_5 /* !! */ [1]), this.q.a, this.q.b);
                                } else if (var4_9.equals("dropRockClear")) {
                                    var4_14 = false;
                                    var3_5 /* !! */  = (u)this.aQ.elementAt((int)this.P.a(var3_5 /* !! */ [0]));
                                    v0.b = var4_14;
                                } else if (var4_9.equals("waitForKey")) {
                                    var6_33 = j.a(var3_5 /* !! */ [0], "|");
                                    this.aS = var3_5 /* !! */ [1];
                                    this.m();
                                    var7_54 = 0;
                                    while (var7_54 < var6_33.length) {
                                        if (var6_33[var7_54].equals("0")) {
                                            this.aT |= 32;
                                        } else if (var6_33[var7_54].equals("1")) {
                                            this.aT |= 64;
                                        } else if (var6_33[var7_54].equals("2")) {
                                            this.aT |= 128;
                                        } else if (var6_33[var7_54].equals("3")) {
                                            this.aT |= 256;
                                        } else if (var6_33[var7_54].equals("4")) {
                                            this.aT |= 512;
                                        } else if (var6_33[var7_54].equals("5")) {
                                            this.aT |= 1024;
                                        } else if (var6_33[var7_54].equals("6")) {
                                            this.aT |= 2048;
                                        } else if (var6_33[var7_54].equals("7")) {
                                            this.aT |= 4096;
                                        } else if (var6_33[var7_54].equals("8")) {
                                            this.aT |= 8192;
                                        } else if (var6_33[var7_54].equals("9")) {
                                            this.aT |= 16384;
                                        } else if (var6_33[var7_54].equals("*")) {
                                            this.aT |= 32768;
                                        } else if (var6_33[var7_54].equals("#")) {
                                            this.aT |= 65536;
                                        } else if (var6_33[var7_54].equals("left")) {
                                            this.aT |= 8;
                                        } else if (var6_33[var7_54].equals("right")) {
                                            this.aT |= 16;
                                        } else if (var6_33[var7_54].equals("up")) {
                                            this.aT |= 2;
                                        } else if (var6_33[var7_54].equals("down")) {
                                            this.aT |= 4;
                                        } else if (var6_33[var7_54].equals("fire")) {
                                            this.aT |= 1;
                                        }
                                        ++var7_54;
                                    }
                                } else if (var4_9.equals("branch")) {
                                    try {
                                        this.W = 0;
                                        this.an.a(var3_5 /* !! */ [0], b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + var3_5 /* !! */ [1], (int)this.P.a(var3_5 /* !! */ [2])), var3_5 /* !! */ [3], b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + var3_5 /* !! */ [4], (int)this.P.a(var3_5 /* !! */ [5])));
                                    }
                                    catch (IllegalArgumentException v1) {
                                        var6_34 = v1;
                                        v1.printStackTrace();
                                    }
                                    catch (IOException v2) {
                                        var6_35 = v2;
                                        v2.printStackTrace();
                                    }
                                } else if (var4_9.equals("gray")) {
                                    this.S = var3_5 /* !! */ [0].equals("true");
                                } else if (var4_9.equals("fight")) {
                                    ah.e();
                                    ah.a(null);
                                    this.w();
                                    this.aD = true;
                                    this.y();
                                    this.B();
                                    ag.a().a(new f(this, this.aq, var3_5 /* !! */ [0], (int)this.P.a(var3_5 /* !! */ [1]), (int)this.P.a(var3_5 /* !! */ [2]), (int)this.P.a(var3_5 /* !! */ [3])));
                                } else if (var4_9.equals("flicker")) {
                                    this.aL = (int)this.P.a(var3_5 /* !! */ [0]);
                                    this.aM = (int)this.P.a(var3_5 /* !! */ [1]);
                                    this.aN = true;
                                } else if (var4_9.equals("vibrate")) {
                                    this.aE = true;
                                    this.aO = 0;
                                } else if (var4_9.equals("black")) {
                                    this.aI = j.a(j.a(var3_5 /* !! */ [0], "\\n", "\n"), this.O.c - 30, ag.a);
                                    this.aJ = 0;
                                    this.aK = 0;
                                    this.L.c();
                                    this.L.g();
                                    this.M.c();
                                    this.M.g();
                                } else if (var4_9.equals("showNpc")) {
                                    this.p = this.j((int)this.P.a(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("showPlayer")) {
                                    this.p = this.n;
                                } else if (var4_9.equals("clear")) {
                                    this.aL = 0;
                                    this.aE = false;
                                    this.p = null;
                                } else if (var4_9.equals("showMonster")) {
                                    this.aF = true;
                                } else if (var4_9.equals("hideMonster")) {
                                    this.aF = false;
                                } else if (var4_9.equals("verse")) {
                                    this.aH = cn.com.etgame.cls.system.d.a(j.a(var3_5 /* !! */ [0], "\\n", "\n"), this.O.d * 3 >> 2, 10, ag.a);
                                    this.aJ = 0;
                                    this.aK = 0;
                                    this.L.c();
                                    this.L.g();
                                    this.M.c();
                                    this.M.g();
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("countdownTimer")) {
                                if (var4_9.equals("setMillis")) {
                                    this.N.a(this.P.a(var3_5 /* !! */ [0]));
                                    this.N.c();
                                    this.N.g();
                                    try {
                                        this.aP = b.a(String.valueOf(cn.com.etgame.cls.system.d.A) + var3_5 /* !! */ [1], (int)this.P.a(var3_5 /* !! */ [2]));
                                    }
                                    catch (IllegalArgumentException v3) {
                                        var6_36 = v3;
                                        v3.printStackTrace();
                                    }
                                    catch (IOException v4) {
                                        var6_37 = v4;
                                        v4.printStackTrace();
                                    }
                                } else if (var4_9.equals("stop")) {
                                    this.aP = null;
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("midi")) {
                                if (var4_9.equals("play")) {
                                    if (this.ao.b()) {
                                        ah.e();
                                        ah.a(null);
                                        ah.a((int)this.P.a(var3_5 /* !! */ [1]));
                                        ah.a(String.valueOf(cn.com.etgame.cls.system.d.B) + var3_5 /* !! */ [0] + ".mid");
                                        ah.d();
                                    }
                                } else if (var4_9.equals("stop")) {
                                    ah.e();
                                    ah.a(null);
                                }
                            } else if (var1_1 /* !! */ [var5_3].startsWith("system")) {
                                if (var4_9.equals("showInfo")) {
                                    this.a(var3_5 /* !! */ [0], this.P.a(var3_5 /* !! */ [1]));
                                }
                                if (var4_9.equals("showAsideInfo")) {
                                    this.ao.a(this.as, var3_5 /* !! */ [0], this.P.a(var3_5 /* !! */ [1]));
                                } else if (var4_9.equals("trade")) {
                                    var6_38 = j.a(var3_5 /* !! */ [0], "|");
                                    var7_55 = new av();
                                    var4_15 = 0;
                                    while (var4_15 < var6_38.length) {
                                        var7_55.a(new i(var6_38[var4_15]));
                                        ++var4_15;
                                    }
                                    this.W = 0;
                                    this.an.a(var7_55, true);
                                } else if (var4_9.equals("returnToMainMenu")) {
                                    this.q();
                                } else if (var4_9.equals("showScreenMargin")) {
                                    this.n.a(0, false, false);
                                    this.a(true, var3_5 /* !! */ [0].equals("true"));
                                } else if (var4_9.equals("hideScreenMargin")) {
                                    this.a(false, var3_5 /* !! */ [0].equals("true"));
                                } else if (var4_9.equals("markFee")) {
                                    cn.com.etgame.cls.system.d.a(Integer.parseInt(var3_5 /* !! */ [0]));
                                } else if (var4_9.equals("unmarkFee")) {
                                    cn.com.etgame.cls.system.d.b(Integer.parseInt(var3_5 /* !! */ [0]));
                                }
                            }
                        }
                    }
                }
                ++var5_3;
            }
        }
    }

    public final void m() {
        cn.com.etgame.cls.system.d.a(2, "\u6559\u5b66\u952e\u6e05\u9664");
        this.aT = 0;
    }

    public final void a(at at2) {
    }

    public final void b(at at2) {
        ah.e();
        ah.a(null);
        this.b();
        this.O.a(this);
    }

    public final void n() {
        this.O.f();
    }

    public final void o() {
        this.O.g();
    }

    public final void p() {
    }

    public final void q() {
        ah.e();
        ah.a(null);
        this.O.a(new cn.com.etgame.cls.system.b());
    }

    public final void a(Graphics graphics, int n2, int n3) {
        this.ao.c(graphics, n2, n3, this.as, this.at);
    }

    public final void r() {
        if (!al.a().b()) {
            this.aB = true;
        }
        this.W = 0;
        ah.e();
    }

    public final void s() {
        ah.e();
        ah.a(null);
        this.w();
        this.aD = true;
        this.y();
        this.B();
        ag.a().a(new f(this, this.aq, this.B));
    }

    private void B() {
        int n2 = 0;
        while (n2 < this.d.length) {
            this.d[n2] = null;
            ++n2;
        }
        n2 = 0;
        while (n2 < this.i.length) {
            this.i[n2] = null;
            ++n2;
        }
        n2 = 0;
        while (n2 < this.h.length) {
            this.h[n2] = null;
            ++n2;
        }
        n2 = 0;
        while (n2 < this.f.length) {
            this.f[n2] = null;
            ++n2;
        }
        n2 = 0;
        while (n2 < this.g.length) {
            this.g[n2] = null;
            ++n2;
        }
        n2 = 0;
        while (n2 < this.e.length) {
            this.e[n2] = null;
            ++n2;
        }
        this.aR = true;
        this.q.a(false);
        this.c = null;
    }

    public final bj[] t() {
        return this.aq;
    }

    public final boolean f(int n2) {
        switch (n2) {
            case 1: {
                return this.o[0] != null && this.o[0].h;
            }
            case 2: {
                return this.o[1] != null && this.o[1].h;
            }
        }
        return true;
    }

    public final void u() {
        if (this.o[0] != null) {
            this.o[0].h = false;
        }
        if (this.o[1] != null) {
            this.o[1].h = false;
        }
    }

    public final boolean v() {
        return this.aG;
    }

    public final void g(int n2) {
        this.a((Object)cn.com.etgame.cls.system.d.X[n2][1], this);
        if (!this.aV) {
            this.an.e();
        }
        this.f();
    }

    public final void h(int n2) {
        this.a((Object)cn.com.etgame.cls.system.d.X[n2][0], this);
        if (!this.aV) {
            this.an.e();
        }
        this.f();
    }
}

