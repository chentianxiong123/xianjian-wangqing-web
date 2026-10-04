/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class h
extends o
implements aw {
    private Image[] a;
    private o b;
    private at c;
    private ag d = ag.a();
    private int e;
    private int f;
    private int g;
    private int h;

    public h(o o2) {
        this.e = this.d.c;
        this.f = this.d.d;
        this.g = this.d.e;
        this.h = this.d.f;
        this.b = o2;
    }

    public final int c() {
        return 1;
    }

    public final boolean a(int n2) {
        try {
            this.a = new Image[]{Image.createImage((String)"/corp/logo.png")};
            this.c = d.a("/corp/logo.ant").b("LOGO");
            this.c.a(this);
            this.c.g();
            ah.a("/corp/logo.mid");
            ah.a(1);
            return true;
        }
        catch (Throwable throwable) {
            this.d.a(throwable, "ETCanvas.loadResource(" + n2 + ")", 0);
            return false;
        }
    }

    public final void a(Graphics graphics) {
        graphics.setColor(0);
        graphics.fillRect(0, 0, this.e, this.f);
        this.c.a(graphics, this.a, this.g, this.h, 0, 0, this.e, this.f, null);
    }

    public final void a(Graphics graphics, int n2, int n3) {
        graphics.setColor(0);
        graphics.fillRect(0, 0, this.e, this.f);
    }

    public final void g() {
        this.c.a();
        be be2 = this.c.b();
        if ("music.play();".equals(be2.d)) {
            ah.d();
            be2.d = null;
        }
        this.d.repaint();
        this.d.serviceRepaints();
    }

    public final void a(at at2) {
        this.d.a(this.b);
    }

    public final void b(at at2) {
    }

    public final void n() {
        this.d.f();
    }

    public final void o() {
        this.d.g();
    }

    public final void r() {
        ah.e();
    }
}

