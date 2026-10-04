/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;

public abstract class o {
    public void a(int n2, int n3) {
    }

    public void b(int n2) {
    }

    public void c(int n2) {
    }

    public void n() {
    }

    public void o() {
    }

    public void p() {
    }

    public void r() {
    }

    public void a() {
    }

    public void d() {
    }

    public void e() {
    }

    public void g() {
    }

    public abstract int c();

    public abstract boolean a(int var1);

    public abstract void a(Graphics var1);

    public void a(Graphics graphics, int n2, int n3) {
        ag ag2 = ag.a();
        int n4 = ag2.c - (ag2.c >> 2);
        graphics.fillRect(0, 0, ag2.c, ag2.d);
        graphics.setColor(0x808080);
        graphics.drawString(String.valueOf(n2 * 100 / n3) + "%", ag2.e + (n4 >> 1), ag2.f + 3, 24);
        graphics.fillRect(ag2.e - (n4 >> 1) + 2, ag2.f - 3, n4, 5);
        graphics.setColor(0xEEEEEE);
        graphics.fillRect(ag2.e - (n4 >> 1), ag2.f - 5, n4, 5);
        graphics.setColor(0xFF8000);
        graphics.fillRect(ag2.e - ((n4 >> 1) - 1), ag2.f - 4, (n4 - 2) * n2 / n3, 3);
    }
}

