/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Font;

public final class bo {
    private String[] a;
    private int b;
    private int c;

    public bo(String string, int n2, int n3, int n4, Font font) {
        if (font == null) {
            font = ag.a;
        }
        this.a = j.a(string, n2, font);
        this.b = (n3 + 10) / (font.getHeight() + 10);
        if (this.b <= 0) {
            this.c = 0;
            this.a = null;
            return;
        }
        this.c = Math.max(1, (this.a.length - 1) / this.b + 1);
    }

    public final int a() {
        return this.c;
    }

    public final String[] a(int n2) {
        if (n2 <= 0 || n2 > this.c) {
            throw new IllegalArgumentException();
        }
        int n3 = (n2 - 1) * this.b;
        String[] stringArray = new String[Math.min(this.a.length, n2 * this.b) - n3];
        int n4 = 0;
        while (n4 < stringArray.length) {
            stringArray[n4] = this.a[n4 + n3];
            ++n4;
        }
        return stringArray;
    }

    public final boolean equals(Object object) {
        if (object instanceof bo) {
            object = (bo)object;
            if (this.b != ((bo)object).b || this.c != ((bo)object).c || this.a.length != ((bo)object).a.length) {
                return false;
            }
            int n2 = 0;
            while (n2 < this.a.length) {
                if (!this.a[n2].equals(((bo)object).a[n2])) {
                    return false;
                }
                ++n2;
            }
            return true;
        }
        return false;
    }
}

