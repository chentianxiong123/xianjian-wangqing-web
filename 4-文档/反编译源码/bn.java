/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public abstract class bn {
    public Object v;
    private int a;
    private int b;
    private Image[] c;

    public bn(int n2, int n3) {
        this.a = n2;
        this.b = n3;
    }

    public void a_(int n2) {
        this.a = n2;
    }

    public final int J() {
        return this.a;
    }

    public void b_(int n2) {
        this.b = n2;
    }

    public final int K() {
        return this.b;
    }

    public void a(Image[] imageArray) {
        this.c = imageArray;
    }

    public final Image[] L() {
        return this.c;
    }

    public abstract boolean a();

    public abstract boolean a(int var1, int var2, int var3, int var4, int var5, int var6);

    public abstract void a(Graphics var1, int var2, int var3, int var4, int var5, int var6, int var7);
}

