/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Alert;
import javax.microedition.lcdui.AlertType;
import javax.microedition.lcdui.Canvas;
import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;
import javax.microedition.midlet.MIDlet;

public final class ag
extends Canvas {
    public static final Font a;
    public static final Font b;
    public final int c;
    public final int d;
    public final int e;
    public final int f;
    private int h;
    private int i;
    public final MIDlet g;
    private Display j;
    private static ag k;
    private au l;
    private bk m;
    private o n;
    private int o;
    private int p;
    private int q;
    private int r;
    private int s;
    private Image t;
    private Graphics u;
    private boolean v;
    private boolean w;
    private boolean x;
    private boolean y;
    private boolean z;
    private boolean A;
    private boolean B;

    static {
        int[] nArray = new int[10];
        nArray[1] = 178;
        nArray[2] = 350;
        nArray[3] = 512;
        nArray[4] = 658;
        nArray[5] = 784;
        nArray[6] = 887;
        nArray[7] = 962;
        nArray[8] = 1008;
        nArray[9] = 1024;
        a = Font.getDefaultFont();
        b = Font.getFont((int)0, (int)0, (int)8);
        Font.getFont((int)0, (int)0, (int)16);
    }

    private ag(MIDlet mIDlet, int n2, int n3, int n4, int n5) {
        this.setFullScreenMode(true);
        this.h = n4;
        this.i = n5;
        this.c = n2;
        this.d = n3;
        this.e = n2 >> 1;
        this.f = n3 >> 1;
        this.g = mIDlet;
        this.j = Display.getDisplay((MIDlet)this.g);
        this.m = new bk(100L);
        this.o = 0;
        boolean bl2 = this.v = !this.isDoubleBuffered();
        if (this.v) {
            boolean bl3 = false;
            ag ag2 = this;
            if (ag2.v) {
                ag2.t = null;
                ag2.u = null;
                ag2.w = false;
            }
        } else {
            this.w = true;
        }
        this.A = true;
        k = this;
    }

    public final void paint(Graphics graphics) {
        ++this.r;
        if (this.v && this.w) {
            this.a(this.u);
            graphics.drawImage(this.t, 0, 0, 20);
        } else {
            this.a(graphics);
        }
        --this.r;
        if (this.B && this.r == 0) {
            this.B = false;
            this.g.notifyDestroyed();
        }
    }

    protected final void keyPressed(int n2) {
        if (!this.y) {
            int n3 = this.b(n2);
            try {
                if (n3 != 0) {
                    ag ag2 = this;
                    this.o = ag2.x ? (this.o |= n3) : n3;
                }
                if (this.n != null) {
                    this.n.a(n3, n2);
                    return;
                }
            }
            catch (Throwable throwable) {
                this.a(throwable, "FrameCanvas.keyPressed(" + n2 + ")", 0);
            }
        }
    }

    protected final void keyReleased(int n2) {
        if (!this.y) {
            int n3 = this.b(n2);
            try {
                if (n3 != 0) {
                    this.o &= ~n3;
                }
                if (this.n != null) {
                    this.n.b(n3);
                    return;
                }
            }
            catch (Throwable throwable) {
                this.a(throwable, "FrameCanvas.keyReleased(" + n2 + ")", 0);
            }
        }
    }

    protected final void pointerDragged(int n2, int n3) {
        if (this.n != null && !this.y) {
            return;
        }
    }

    protected final void pointerPressed(int n2, int n3) {
        if (this.n != null && !this.y) {
            return;
        }
    }

    protected final void pointerReleased(int n2, int n3) {
        if (this.n != null && !this.y) {
            return;
        }
    }

    protected final void showNotify() {
        if (this.n != null) {
            try {
                this.n.n();
                return;
            }
            catch (Throwable throwable) {
                this.a(throwable, "FrameCanvas.showNotify(),0", 0);
            }
        }
    }

    protected final void hideNotify() {
        if (this.n != null) {
            try {
                this.n.o();
                return;
            }
            catch (Throwable throwable) {
                this.a(throwable, "FrameCanvas.hideNotify()", 0);
            }
        }
    }

    private void a(Graphics graphics) {
        graphics.setColor(0xFFFFFF);
        graphics.fillRect(0, 0, this.c, this.d);
        if (this.n != null) {
            graphics.setColor(0);
            try {
                if (this.y) {
                    this.n.a(graphics, this.p, this.q);
                } else {
                    this.n.a(graphics);
                }
            }
            catch (Throwable throwable) {
                this.a(throwable, "FrameCanvas.paint(g)", 0);
            }
            graphics.setClip(0, 0, this.c, this.d);
            graphics.setFont(a);
            graphics.setGrayScale(0);
            graphics.setStrokeStyle(0);
            graphics.translate(-graphics.getTranslateX(), -graphics.getTranslateY());
        }
    }

    public static ag a(MIDlet mIDlet, int n2, int n3, int n4, int n5) {
        if (k != null) {
            k.g();
        }
        k = new ag(mIDlet, 240, 320, -6, -7);
        return k;
    }

    public static ag a() {
        return k;
    }

    public static void a(Graphics graphics, int n2, String string, int n3, int n4, int n5) {
        int n6 = graphics.getColor();
        graphics.setColor(n2);
        graphics.drawString(string, n3 + 1, n4 + 1, n5);
        graphics.setColor(n6);
        graphics.drawString(string, n3, n4, n5);
    }

    public static void b(Graphics graphics, int n2, String string, int n3, int n4, int n5) {
        int n6 = graphics.getColor();
        graphics.setColor(n2);
        graphics.drawString(string, n3, n4 - 1, n5);
        graphics.drawString(string, n3, n4 + 1, n5);
        graphics.drawString(string, n3 - 1, n4, n5);
        graphics.drawString(string, n3 - 1, n4 - 1, n5);
        graphics.drawString(string, n3 - 1, n4 + 1, n5);
        graphics.drawString(string, n3 + 1, n4, n5);
        graphics.drawString(string, n3 + 1, n4 - 1, n5);
        graphics.drawString(string, n3 + 1, n4 + 1, n5);
        graphics.setColor(n6);
        graphics.drawString(string, n3, n4, n5);
    }

    public static void a(Graphics graphics, Image image, int n2, int n3, int n4, int n5, int n6, int n7, int n8, int n9) {
        n9 = image.getWidth();
        int n10 = image.getHeight();
        if (n2 < 0 || n3 < 0 || n4 < 0 || n5 < 0 || n2 + n4 > n9 || n3 + n5 > n10) {
            throw new IllegalArgumentException();
        }
        if ((n6 & 4) == 0 && (n6 & 0x10) == 0) {
            // empty if block
        }
        switch (n6) {
            case 0: {
                graphics.setClip(n7, n8, n4, n5);
                graphics.drawImage(image, n7 - n2, n8 - n3, 20);
                return;
            }
            case 1: 
            case 10: {
                n6 = 2;
                graphics.setClip(n7, n8, n4, n5);
                break;
            }
            case 2: 
            case 9: {
                n6 = 1;
                graphics.setClip(n7, n8, n4, n5);
                break;
            }
            case 4: {
                n6 = 5;
                graphics.setClip(n7, n8, n5, n4);
                break;
            }
            case 3: 
            case 8: {
                n6 = 3;
                graphics.setClip(n7, n8, n4, n5);
                break;
            }
            case 16: {
                n6 = 6;
                graphics.setClip(n7, n8, n5, n4);
                break;
            }
            case 5: 
            case 18: {
                n6 = 4;
                graphics.setClip(n7, n8, n5, n4);
                break;
            }
            case 6: 
            case 17: {
                n6 = 7;
                graphics.setClip(n7, n8, n5, n4);
                break;
            }
            default: {
                throw new IllegalArgumentException();
            }
        }
        graphics.drawRegion(image, n2, n3, n4, n5, n6, n7, n8, 20);
    }

    public static void a(Graphics graphics, Image image, int n2, int n3, int n4, int n5, int n6, int n7, int n8, int n9, int n10, int n11) {
        n6 = 0;
        if (n2 < 0 || n3 < 0 || n4 < 0 || n5 < 0 || n2 + n4 > image.getWidth() || n3 + n5 > image.getHeight()) {
            throw new IllegalArgumentException();
        }
        switch (n11) {
            case 0: 
            case 20: {
                break;
            }
            case 24: {
                n9 -= n4;
                break;
            }
            case 17: {
                n9 -= n4 >> 1;
                break;
            }
            case 36: {
                n9 -= n8;
                break;
            }
            case 40: {
                n9 -= n4 + n8;
                break;
            }
            case 33: {
                n9 -= (n4 >> 1) + n8;
                break;
            }
            case 6: {
                n9 -= n8 >> 1;
                break;
            }
            case 10: {
                n9 -= n4 + (n8 >> 1);
                break;
            }
            case 3: {
                n9 -= (n4 >> 1) + (n8 >> 1);
                break;
            }
            default: {
                throw new IllegalArgumentException();
            }
        }
        n7 = n5 + 0;
        if (n7 == 0) {
            return;
        }
        if (n7 < 0) {
            n6 = 1;
            n8 = -n8;
            n9 -= n8;
            n7 = Math.abs(n7);
        }
        n10 -= (n11 & 0x20) != 0 ? n7 : ((n11 & 2) != 0 ? n7 >> 1 : 0);
        long l2 = ((long)n8 << 32) / (long)n7;
        long l3 = l2 >> 1;
        long l4 = ((long)n5 << 32) / (long)n7;
        long l5 = l4 >> 1;
        n11 = 0;
        while (n11 < n7) {
            n8 = (int)(l3 >> 32);
            if (n6 != 0) {
                graphics.setClip(n9 + n8, n10 + n11, n4, 1);
                graphics.drawImage(image, n9 + n8 - n2, n10 + n11 - n5 + 1 + (int)(l5 >> 32) - n3, 20);
            } else {
                graphics.setClip(n9 + n8, n10 + n11, n4, 1);
                graphics.drawImage(image, n9 + n8 - n2, n10 + n11 - (int)(l5 >> 32) - n3, 20);
            }
            ++n11;
            l5 += l4;
            l3 += l2;
        }
    }

    public final void a(o o2) {
        this.a(o2, true, true);
    }

    private synchronized void a(o o2, boolean bl2, boolean bl3) {
        if (this.y) {
            return;
        }
        if (o2 != null) {
            o2.a();
            this.p = 0;
            this.q = o2.c();
            if (this.q > 0) {
                this.z = false;
                this.y = true;
            } else {
                this.o = 0;
                o2.d();
            }
        }
        o o3 = this.n;
        this.n = o2;
        if (o3 != null) {
            o3.e();
        }
        System.gc();
    }

    public final long b() {
        return this.m.e();
    }

    private int b(int n2) {
        if (n2 == this.h) {
            return 131072;
        }
        if (n2 == this.i) {
            return 262144;
        }
        switch (n2) {
            case 48: {
                return 32;
            }
            case 49: {
                return 64;
            }
            case 50: {
                return 128;
            }
            case 51: {
                return 256;
            }
            case 52: {
                return 512;
            }
            case 53: {
                return 1024;
            }
            case 54: {
                return 2048;
            }
            case 55: {
                return 4096;
            }
            case 56: {
                return 8192;
            }
            case 57: {
                return 16384;
            }
            case 42: {
                return 32768;
            }
            case 35: {
                return 65536;
            }
        }
        switch (super.getGameAction(n2)) {
            case 8: {
                return 1;
            }
            case 1: {
                return 2;
            }
            case 6: {
                return 4;
            }
            case 2: {
                return 8;
            }
            case 5: {
                return 16;
            }
        }
        return 0;
    }

    public final int getGameAction(int n2) {
        switch (n2) {
            case 128: {
                return 2;
            }
            case 512: {
                return 8;
            }
            case 1024: {
                return 1;
            }
            case 2048: {
                return 16;
            }
            case 8192: {
                return 4;
            }
        }
        return n2;
    }

    public final boolean c() {
        return false;
    }

    public final void a(boolean bl2) {
        this.x = true;
    }

    public final void a(int n2) {
        this.s = -1;
    }

    public final int d() {
        return this.s;
    }

    public final void e() {
        this.a((Displayable)this);
    }

    private void a(Displayable displayable) {
        this.j.setCurrent(displayable);
        this.o = 0;
    }

    public final void a(Throwable throwable, String string, int n2) {
        if (throwable != null) {
            throwable.printStackTrace();
        }
        if (this.s >= n2 && !(this.j.getCurrent() instanceof Alert)) {
            throwable = new Alert("\u8c03\u8bd5\u4fe1\u606f", "\u5f02\u5e38:" + (throwable == null ? "" : throwable.toString()) + (string == null ? "" : "\n\u6765\u6e90:" + string) + "\n\u7b49\u7ea7:" + n2, null, AlertType.ERROR);
            throwable.setTimeout(-2);
            this.a((Displayable)throwable);
        }
    }

    public final void f() {
        ag ag2 = this;
        if (ag2.A) {
            this.A = false;
            this.l = new au(this);
            if (this.n != null && !this.y) {
                this.n.p();
            }
            new Thread(this.l).start();
        }
    }

    public final void g() {
        ag ag2 = this;
        if (!ag2.A) {
            if (this.l != null) {
                au.a(this.l);
                this.l = null;
            }
            this.A = true;
            if (this.n != null && !this.y) {
                this.n.r();
            }
        }
    }

    public final void h() {
        this.g();
        if (this.r > 0) {
            this.B = true;
            return;
        }
        this.g.notifyDestroyed();
    }

    static int a(ag ag2) {
        return ag2.r;
    }

    static void a(ag ag2, int n2) {
        ag2.r = n2;
    }

    static bk b(ag ag2) {
        return ag2.m;
    }

    static void c(ag ag2) {
        if (!ag2.y && ag2.n != null) {
            try {
                if ((ag2.o & 1) != 0) {
                    ag2.n.c(1);
                }
                if ((ag2.o & 2) != 0) {
                    ag2.n.c(2);
                }
                if ((ag2.o & 4) != 0) {
                    ag2.n.c(4);
                }
                if ((ag2.o & 8) != 0) {
                    ag2.n.c(8);
                }
                if ((ag2.o & 0x10) != 0) {
                    ag2.n.c(16);
                }
                if ((ag2.o & 0x20) != 0) {
                    ag2.n.c(32);
                }
                if ((ag2.o & 0x40) != 0) {
                    ag2.n.c(64);
                }
                if ((ag2.o & 0x80) != 0) {
                    ag2.n.c(128);
                }
                if ((ag2.o & 0x100) != 0) {
                    ag2.n.c(256);
                }
                if ((ag2.o & 0x200) != 0) {
                    ag2.n.c(512);
                }
                if ((ag2.o & 0x400) != 0) {
                    ag2.n.c(1024);
                }
                if ((ag2.o & 0x800) != 0) {
                    ag2.n.c(2048);
                }
                if ((ag2.o & 0x1000) != 0) {
                    ag2.n.c(4096);
                }
                if ((ag2.o & 0x2000) != 0) {
                    ag2.n.c(8192);
                }
                if ((ag2.o & 0x4000) != 0) {
                    ag2.n.c(16384);
                }
                if ((ag2.o & 0x8000) != 0) {
                    ag2.n.c(32768);
                }
                if ((ag2.o & 0x10000) != 0) {
                    ag2.n.c(65536);
                    return;
                }
            }
            catch (Throwable throwable) {
                ag2.a(throwable, "FrameCanvas.callKeyRepeated()", 0);
            }
        }
    }

    static void d(ag ag2) {
        block11: {
            if (ag2.n != null) {
                if (ag2.y) {
                    if (ag2.p < ag2.q) {
                        try {
                            if (ag2.n.a(ag2.p)) {
                                ++ag2.p;
                                return;
                            }
                            break block11;
                        }
                        catch (Throwable throwable) {
                            ag2.a(throwable, "FrameCanvas.update()", 0);
                            return;
                        }
                    }
                    if (!ag2.z) {
                        ag2.z = true;
                        return;
                    }
                    ag2.o = 0;
                    try {
                        ag2.n.d();
                        System.gc();
                    }
                    catch (Throwable throwable) {
                        ag2.a(throwable, "FrameCanvas.update()", 0);
                    }
                    ag2.y = false;
                    return;
                }
                try {
                    ag2.n.g();
                    return;
                }
                catch (Throwable throwable) {
                    ag2.a(throwable, "FrameCanvas.update()", 0);
                }
            }
        }
    }

    static boolean e(ag ag2) {
        return ag2.y;
    }

    static boolean f(ag ag2) {
        return ag2.B;
    }

    static void a(ag ag2, boolean bl2) {
        ag2.B = false;
    }
}

