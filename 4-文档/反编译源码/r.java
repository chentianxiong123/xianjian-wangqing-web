/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;

public final class r
extends bn {
    public final int a;
    public final int b;
    public boolean c;

    public r(int n2, int n3, int n4, int n5) {
        super(n2, n3);
        this.a = n4;
        this.b = n5;
        this.c = true;
    }

    public final boolean a(int n2, int n3, int n4, int n5, int n6, int n7) {
        return this.c && j.a(n2, this.a, n4, n6) && j.a(n3, this.b, n5, n7);
    }

    public final boolean a() {
        return true;
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        graphics.setClip(n4, n5, n6, n7);
        graphics.setColor(0);
        graphics.fillRect(n2, n3, this.a, this.b);
    }
}

