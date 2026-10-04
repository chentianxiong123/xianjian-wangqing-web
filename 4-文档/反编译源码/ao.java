/*
 * Decompiled with CFR 0.152.
 */
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class ao {
    public final String a;
    private short d;
    private short e;
    public final short b;
    public final short c;
    private int f;
    private int g;
    private final Vector h;
    private final Vector i;
    private final Vector j;
    private final boolean k;
    private short[][] l;
    private boolean m;
    private bn[] n;
    private int o;
    private int p;
    private int q;
    private int r;
    private int s;
    private int t;
    private int u;
    private Image v;
    private Graphics w;
    private boolean x;

    ao(short[][] sArray, short s2, short s3, short s4, short s5, String string, int n2, boolean bl2) {
        this(s2, s3, s4, s5, string, n2, bl2);
        this.l = sArray;
    }

    ao(short s2, short s3, short s4, short s5, String string, int n2, boolean bl2) {
        this.a = string;
        this.k = bl2;
        this.d = s2;
        this.e = s3;
        this.b = s4;
        this.c = s5;
        this.u = n2;
        this.h = new Vector();
        this.i = new Vector();
        this.j = new Vector();
        this.f = s2 * s4;
        this.g = s3 * s5;
    }

    final synchronized void a(boolean bl2) {
        if (this.l != null) {
            if (bl2) {
                if (!this.x && this.o > 0 && this.p > 0) {
                    this.v = Image.createImage((int)this.q, (int)this.r);
                    this.w = this.v.getGraphics();
                    this.s = -1;
                    this.t = -1;
                }
            } else {
                this.v = null;
                this.w = null;
            }
            this.x = bl2;
        }
    }

    final boolean a() {
        return this.x;
    }

    final synchronized void a(int n2, int n3) {
        if (this.l != null) {
            n2 = Math.max(0, n2);
            n3 = Math.max(0, n3);
            if (this.o != n2 || this.p != n3) {
                this.o = n2;
                this.p = n3;
                this.q = n2 * this.b;
                this.r = n3 * this.c;
                this.v = null;
                this.w = null;
                ao ao2 = this;
                if (ao2.x && n2 > 0 && n3 > 0) {
                    this.v = Image.createImage((int)this.q, (int)this.r);
                    this.w = this.v.getGraphics();
                    this.s = -1;
                    this.t = -1;
                }
            }
        }
    }

    final synchronized void a(Image image) {
        if (this.l != null && image != null) {
            this.o = image.getWidth() / this.b;
            this.p = image.getHeight() / this.c;
            this.q = this.o * this.b;
            this.r = this.p * this.c;
            this.v = image;
            this.w = this.v.getGraphics();
            this.s = -1;
            this.t = -1;
            this.x = true;
        }
    }

    final synchronized Image b() {
        return this.v;
    }

    public final void a(int n2, int n3, short s2) {
        if (this.l == null) {
            this.l = new short[this.e][this.d];
            int n4 = 0;
            while (n4 < this.e) {
                int n5 = 0;
                while (n5 < this.d) {
                    this.l[n4][n5] = -1;
                    ++n5;
                }
                ++n4;
            }
        }
        this.l[n3][n2] = s2;
    }

    public final short[][] c() {
        return this.l;
    }

    public final boolean a(int n2) {
        if (this.l != null) {
            int n3 = 0;
            while (n3 < this.e) {
                int n4 = 0;
                while (n4 < this.d) {
                    if (this.l[n3][n4] == n2) {
                        return true;
                    }
                    ++n4;
                }
                ++n3;
            }
        }
        return false;
    }

    public final void a(bn bn2) {
        this.h.addElement(bn2);
    }

    public final bn b(int n2) {
        return (bn)this.h.elementAt(n2);
    }

    public final int d() {
        return this.h.size();
    }

    public final boolean b(bn bn2) {
        return this.h.removeElement(bn2);
    }

    public final void a(l l2) {
        this.i.addElement(l2);
    }

    public final l c(int n2) {
        return (l)this.i.elementAt(n2);
    }

    public final int e() {
        return this.i.size();
    }

    public final void b(l l2) {
        this.j.addElement(l2);
    }

    public final l d(int n2) {
        return (l)this.j.elementAt(n2);
    }

    public final int f() {
        return this.j.size();
    }

    public final void a(Image[] imageArray) {
        int n2 = 0;
        while (n2 < this.h.size()) {
            ((bn)this.h.elementAt(n2)).a(imageArray);
            ++n2;
        }
    }

    public final synchronized void b(boolean bl2) {
        if (!this.m) {
            this.m = true;
            if (this.m) {
                this.n = new bn[100];
                return;
            }
            this.n = null;
        }
    }

    public final void g() {
        int n2 = 0;
        while (n2 < this.h.size()) {
            if (((bn)this.h.elementAt(n2)).a()) {
                ++n2;
                continue;
            }
            int n3 = n2;
            ao ao2 = this;
            ao2.h.removeElementAt(n3);
        }
    }

    public final synchronized void a(Graphics object, Image[] graphics, int n2, int n3, int n4, int n5, int n6, int n7, boolean n8) {
        int n9 = n8;
        n8 = n7;
        n7 = n6;
        n6 = n5;
        n5 = n4;
        n4 = n3;
        n3 = n2;
        Graphics graphics2 = graphics;
        graphics = object;
        object = this;
        if (object.l != null) {
            n7 = n5 + n7;
            n8 = n6 + n8;
            int n10 = Math.max((n5 - n3) / object.b, 0);
            int n11 = Math.max((n6 - n4) / object.c, 0);
            int n12 = Math.min((n7 - n3 - 1) / object.b, object.d - 1);
            int n13 = Math.min((n8 - n4 - 1) / object.c, object.e - 1);
            if (n13 >= 0 && n12 >= 0 && n11 < object.e && n10 < object.d) {
                if (object.x && object.o > 0 && object.p > 0) {
                    int n14;
                    int n15;
                    int n16;
                    int n17;
                    int n18;
                    int n19;
                    int n20;
                    int n21 = n10 - object.s;
                    int n22 = n11 - object.t;
                    int n23 = n10 % object.o * object.b;
                    int n24 = n11 % object.p * object.c;
                    int n25 = Math.min(n10 + object.o, object.d) - 1;
                    int n26 = Math.min(n11 + object.p, object.e) - 1;
                    int n27 = n3 + n10 * object.b - n23;
                    int n28 = n4 + n11 * object.c - n24;
                    Graphics graphics3 = object.w;
                    graphics3.setColor(object.u);
                    if (object.s == -1 || object.t == -1 || Math.abs(n21) >= object.o || Math.abs(n22) >= object.p) {
                        graphics3.setClip(0, 0, object.q, object.r);
                        graphics3.fillRect(0, 0, object.q, object.r);
                        n21 = n11;
                        n20 = n24;
                        while (n21 <= n26) {
                            n19 = n10;
                            n18 = n23;
                            while (n19 <= n25) {
                                if (object.l[n21][n19] != -1) {
                                    if (n9 != 0) {
                                        graphics3.setClip(n18, n20, (int)object.b, (int)object.c);
                                    }
                                    graphics3.drawImage((Image)graphics2[object.l[n21][n19]], n18, n20, 20);
                                }
                                ++n19;
                                n18 = (n18 + object.b) % object.q;
                            }
                            ++n21;
                            n20 = (n20 + object.c) % object.r;
                        }
                    } else {
                        if (n21 != 0) {
                            n18 = n21 > 0 ? n25 - n21 + 1 : n10;
                            n17 = n21 < 0 ? n10 - n21 - 1 : n25;
                            n16 = n22 < 0 ? n11 - n22 : n11;
                            n15 = n22 > 0 ? n26 - n22 : n26;
                            n14 = (n24 + (n16 - n11) * object.c) % object.r;
                            n19 = n18;
                            n18 = (n23 + (n18 - n10) * object.b) % object.q;
                            while (n19 <= n17) {
                                graphics3.setClip(n18, 0, (int)object.b, object.r);
                                graphics3.fillRect(n18, 0, (int)object.b, object.r);
                                n21 = n16;
                                n20 = n14;
                                while (n21 <= n15) {
                                    if (object.l[n21][n19] != -1) {
                                        if (n9 != 0) {
                                            graphics3.setClip(n18, n20, (int)object.b, (int)object.c);
                                        }
                                        graphics3.drawImage((Image)graphics2[object.l[n21][n19]], n18, n20, 20);
                                    }
                                    ++n21;
                                    n20 = (n20 + object.c) % object.r;
                                }
                                ++n19;
                                n18 = (n18 + object.b) % object.q;
                            }
                        }
                        if (n22 != 0) {
                            n16 = n22 > 0 ? n26 - n22 + 1 : n11;
                            n15 = n22 < 0 ? n11 - n22 - 1 : n26;
                            n21 = n16;
                            n20 = (n24 + (n16 - n11) * object.c) % object.r;
                            while (n21 <= n15) {
                                graphics3.setClip(0, n20, object.q, (int)object.c);
                                graphics3.fillRect(0, n20, object.q, (int)object.c);
                                n19 = n10;
                                n18 = n23;
                                while (n19 <= n25) {
                                    if (object.l[n21][n19] != -1) {
                                        if (n9 != 0) {
                                            graphics3.setClip(n18, n20, (int)object.b, (int)object.c);
                                        }
                                        graphics3.drawImage((Image)graphics2[object.l[n21][n19]], n18, n20, 20);
                                    }
                                    ++n19;
                                    n18 = (n18 + object.b) % object.q;
                                }
                                ++n21;
                                n20 = (n20 + object.c) % object.r;
                            }
                        }
                    }
                    object.s = n10;
                    object.t = n11;
                    int n29 = n3 + object.f;
                    n16 = n4 + object.g;
                    n22 = n3 < n5 ? n5 - n3 : 0;
                    n17 = n4 < n6 ? n6 - n4 : 0;
                    n15 = n29 > n7 ? n29 - n7 : 0;
                    n14 = n16 > n8 ? n16 - n8 : 0;
                    n29 = n3 + n22;
                    n16 = n4 + n17;
                    int n30 = object.f - n22 - n15;
                    int n31 = object.g - n17 - n14;
                    graphics.setColor(object.u);
                    graphics.setClip(n29, n16, n30, n31);
                    graphics.fillRect(n29, n16, n30, n31);
                    n21 = n27 + n23;
                    n19 = n28 + n24;
                    n18 = n21 + object.q;
                    n20 = n19 + object.r;
                    n22 = n21 < n5 ? n5 - n21 : 0;
                    n17 = n19 < n6 ? n6 - n19 : 0;
                    n15 = n18 > n7 ? n18 - n7 : 0;
                    n14 = n20 > n8 ? n20 - n8 : 0;
                    graphics.setClip(n21 + n22, n19 + n17, object.q - n22 - n15, object.r - n17 - n14);
                    graphics.drawImage(object.v, n27, n28, 20);
                    if (n23 > 0) {
                        graphics.drawImage(object.v, n27 + object.q, n28, 20);
                    }
                    if (n24 > 0) {
                        graphics.drawImage(object.v, n27, n28 + object.r, 20);
                    }
                    if (n23 > 0 && n24 > 0) {
                        graphics.drawImage(object.v, n27 + object.q, n28 + object.r, 20);
                    }
                    if (n9 == 0) {
                        graphics.setClip(n29, n16, n30, n31);
                    }
                    if (n25 < n12) {
                        n19 = n25 + 1;
                        n18 = n3 + n19 * object.b;
                        while (n19 <= n12) {
                            n21 = n11;
                            n20 = n4 + n11 * object.c;
                            while (n21 <= n26) {
                                if (object.l[n21][n19] != -1) {
                                    if (n9 != 0) {
                                        n29 = n18 + object.b;
                                        n16 = n20 + object.c;
                                        n22 = n18 < n5 ? n5 - n18 : 0;
                                        n17 = n20 < n6 ? n6 - n20 : 0;
                                        n15 = n29 > n7 ? n29 - n7 : 0;
                                        n14 = n16 > n8 ? n16 - n8 : 0;
                                        graphics.setClip(n18 + n22, n20 + n17, object.b - n22 - n15, object.c - n17 - n14);
                                    }
                                    graphics.drawImage((Image)graphics2[object.l[n21][n19]], n18, n20, 20);
                                }
                                ++n21;
                                n20 += object.c;
                            }
                            ++n19;
                            n18 += object.b;
                        }
                    }
                    if (n26 < n13) {
                        n21 = n26 + 1;
                        n20 = n4 + n21 * object.c;
                        while (n21 <= n13) {
                            n19 = n10;
                            n18 = n3 + n10 * object.b;
                            while (n19 <= n12) {
                                if (object.l[n21][n19] != -1) {
                                    if (n9 != 0) {
                                        n29 = n18 + object.b;
                                        n16 = n20 + object.c;
                                        n22 = n18 < n5 ? n5 - n18 : 0;
                                        n17 = n20 < n6 ? n6 - n20 : 0;
                                        n15 = n29 > n7 ? n29 - n7 : 0;
                                        n14 = n16 > n8 ? n16 - n8 : 0;
                                        graphics.setClip(n18 + n22, n20 + n17, object.b - n22 - n15, object.c - n17 - n14);
                                    }
                                    graphics.drawImage((Image)graphics2[object.l[n21][n19]], n18, n20, 20);
                                }
                                ++n19;
                                n18 += object.b;
                            }
                            ++n21;
                            n20 += object.c;
                        }
                        return;
                    }
                } else {
                    int n32;
                    int n33;
                    int n34;
                    int n35;
                    int n36;
                    int n37;
                    int n38;
                    if (object.k || n9 == 0) {
                        n38 = n3 + object.f;
                        n37 = n4 + object.g;
                        n36 = n3 < n5 ? n5 - n3 : 0;
                        n35 = n4 < n6 ? n6 - n4 : 0;
                        n34 = n38 > n7 ? n38 - n7 : 0;
                        n33 = n37 > n8 ? n37 - n8 : 0;
                        n38 = n3 + n36;
                        n37 = n4 + n35;
                        n32 = object.f - n36 - n34;
                        n36 = object.g - n35 - n33;
                        graphics.setClip(n38, n37, n32, n36);
                        if (object.k) {
                            graphics.setColor(object.u);
                            graphics.fillRect(n38, n37, n32, n36);
                        }
                    }
                    n32 = n11;
                    int n39 = n4 + n11 * object.c;
                    while (n32 <= n13) {
                        int n40 = n10;
                        int n41 = n3 + n10 * object.b;
                        while (n40 <= n12) {
                            if (object.l[n32][n40] != -1) {
                                if (n9 != 0) {
                                    n38 = n41 + object.b;
                                    n37 = n39 + object.c;
                                    n36 = n41 < n5 ? n5 - n41 : 0;
                                    n35 = n39 < n6 ? n6 - n39 : 0;
                                    n34 = n38 > n7 ? n38 - n7 : 0;
                                    n33 = n37 > n8 ? n37 - n8 : 0;
                                    graphics.setClip(n41 + n36, n39 + n35, object.b - n36 - n34, object.c - n35 - n33);
                                }
                                graphics.drawImage((Image)graphics2[object.l[n32][n40]], n41, n39, 20);
                            }
                            ++n40;
                            n41 += object.b;
                        }
                        ++n32;
                        n39 += object.c;
                    }
                }
            }
        }
    }

    public final synchronized void a(Graphics object, int n2, int n3, int n4, int n5, int n6, int n7) {
        int n8 = n7;
        n7 = n6;
        n6 = n5;
        n5 = n4;
        n4 = n3;
        n3 = n2;
        Graphics graphics = object;
        object = this;
        if (object.m) {
            bn bn2;
            int n9 = 0;
            int n10 = 0;
            while (n10 < object.h.size()) {
                bn2 = (bn)object.h.elementAt(n10);
                if (bn2.a(n3 + bn2.J(), n4 + bn2.K(), n5, n6, n7, n8)) {
                    object.n[n9++] = bn2;
                    if (n9 == object.n.length) {
                        bn[] bnArray = new bn[object.n.length + 50];
                        int n11 = 0;
                        while (n11 < object.n.length) {
                            bnArray[n11] = object.n[n11];
                            ++n11;
                        }
                        object.n = bnArray;
                    }
                }
                ++n10;
            }
            n10 = 1;
            while (n10 < n9) {
                int n12 = n10;
                while (n12 > 0) {
                    bn2 = object.n[n12 - 1];
                    bn bn3 = object.n[n12];
                    if (bn2.K() > bn3.K()) {
                        object.n[n12 - 1] = bn3;
                        object.n[n12] = bn2;
                    }
                    --n12;
                }
                ++n10;
            }
            n10 = 0;
            while (n10 < n9) {
                object.n[n10].a(graphics, n3 + object.n[n10].J(), n4 + object.n[n10].K(), n5, n6, n7, n8);
                ++n10;
            }
            n10 = 0;
            while (n10 < object.n.length) {
                object.n[n10] = null;
                ++n10;
            }
            return;
        }
        int n13 = 0;
        while (n13 < object.h.size()) {
            bn bn4 = (bn)object.h.elementAt(n13);
            if (bn4.a(n3 + bn4.J(), n4 + bn4.K(), n5, n6, n7, n8)) {
                bn4.a(graphics, n3 + bn4.J(), n4 + bn4.K(), n5, n6, n7, n8);
            }
            ++n13;
        }
    }
}

