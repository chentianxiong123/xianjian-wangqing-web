/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class v
extends bn {
    private short a;

    public v(short s2, int n2, int n3) {
        super(n2, n3);
        this.a = s2;
    }

    public final boolean a() {
        return true;
    }

    public final boolean a(int n2, int n3, int n4, int n5, int n6, int n7) {
        Image[] imageArray = this.L();
        int n8 = imageArray[this.a].getWidth();
        int n9 = imageArray[this.a].getHeight();
        return j.a(n2 - (n8 >> 1), n8, n4, n6) && j.a(n3 - n9, n9, n5, n7);
    }

    public final void a(Graphics graphics, int n2, int n3, int n4, int n5, int n6, int n7) {
        v v2 = this;
        v2 = null;
        Image[] imageArray = this.L();
        if (v2 == null) {
            graphics.setClip(n4, n5, n6, n7);
            graphics.drawImage(imageArray[this.a], n2, n3, 33);
            return;
        }
        v2.a(graphics, imageArray[this.a], 0, 0, imageArray[this.a].getWidth(), imageArray[this.a].getHeight(), n2, n3, 33);
    }
}

