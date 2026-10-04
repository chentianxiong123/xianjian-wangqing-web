/*
 * Decompiled with CFR 0.152.
 */
import java.util.Vector;

public final class k {
    public final String a;
    public final Vector b;
    public final String c;

    public k(String string, String string2) {
        this.a = string;
        this.c = string2;
        this.b = new Vector();
    }

    public final void a(i i2) {
        int n2 = 0;
        while (n2 < this.b.size()) {
            i i3 = (i)this.b.elementAt(n2);
            if (i3.a.equals(i2.a)) {
                i3.a(i3.d() + 1);
                return;
            }
            ++n2;
        }
        this.b.addElement(i2);
    }
}

