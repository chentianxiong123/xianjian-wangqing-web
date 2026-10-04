/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class ab
extends o {
    private Image[] a;
    private String[] b;
    private int c;
    private boolean d = true;
    private o e;
    private bk f;
    private ag g = ag.a();

    public ab(String[] stringArray, o o2) {
        this.b = stringArray;
        this.e = o2;
    }

    public final void a() {
        this.a = new Image[this.b.length];
        this.f = new bk(2000L);
    }

    public final void d() {
        this.b = null;
        this.f.c();
        this.f.g();
    }

    public final int c() {
        return this.a.length;
    }

    public final boolean a(int n2) {
        try {
            this.a[n2] = Image.createImage((String)this.b[n2]);
            return true;
        }
        catch (Throwable throwable) {
            this.g.a(throwable, "LogoCanvas.loadResource(" + n2 + ")", 0);
            return false;
        }
    }

    public final void a(Graphics graphics) {
        graphics.setColor(0xFFFFFF);
        graphics.fillRect(0, 0, this.g.c, this.g.d);
        graphics.drawImage(this.a[this.c], this.g.c >> 1, this.g.d >> 1, 3);
    }

    public final void a(Graphics graphics, int n2, int n3) {
        graphics.setColor(0xFFFFFF);
        graphics.fillRect(0, 0, this.g.c, this.g.d);
    }

    public final void g() {
        if (this.f.f() == 0L) {
            ab ab2 = this;
            if (ab2.d) {
                ab2.f.c();
                ab2.f.g();
                if (ab2.c < ab2.a.length - 1) {
                    ++ab2.c;
                } else {
                    ab2.d = false;
                    ab2.g.a(ab2.e);
                }
            }
        }
        this.g.repaint();
        this.g.serviceRepaints();
    }

    public final void n() {
        this.g.f();
    }

    public final void o() {
        this.g.g();
    }

    public final void p() {
        this.f.g();
    }

    public final void r() {
        this.f.h();
    }
}

