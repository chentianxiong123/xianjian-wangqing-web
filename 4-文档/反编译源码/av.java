/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.d;
import java.util.Vector;

public final class av {
    private Vector[] a = new Vector[]{new Vector(), new Vector(), new Vector(), new Vector(), new Vector()};

    private static int c(int n2) {
        switch (n2) {
            case 5: {
                return 0;
            }
            case 0: 
            case 1: 
            case 2: 
            case 3: 
            case 4: {
                return 1;
            }
            case 6: {
                return 2;
            }
            case 7: 
            case 8: {
                return 4;
            }
        }
        return 3;
    }

    public final i a() {
        Object object;
        i i2 = null;
        int n2 = 0;
        int n3 = 0;
        while (n3 < this.a.length) {
            if (this.a[n3].size() == 0) {
                ++n2;
            }
            ++n3;
        }
        if (n2 >= this.a.length) {
            return null;
        }
        do {
            d.a(2, "\u5077\u4e1c\u897f:" + n2);
            int n4 = j.a(0, this.a.length - 1);
            object = this;
            object = ((av)object).a[n4];
            if (((Vector)object).size() <= 0) continue;
            i2 = (i)((Vector)object).elementAt(j.a(0, ((Vector)object).size() - 1));
        } while (object == null || ((Vector)object).size() == 0 || i2 == null);
        return i2;
    }

    public final void a(String object, int n2) {
        object = new i((String)object);
        Vector vector = this.a[av.c(((i)object).a())];
        int n3 = 0;
        while (n3 < vector.size()) {
            i i2 = (i)vector.elementAt(n3);
            if (i2.a.equals(((i)object).a)) {
                i2.a(i2.d() + n2);
                return;
            }
            ++n3;
        }
        ((i)object).a(n2);
        vector.addElement(object);
    }

    public final void a(i i2) {
        Vector vector = this.a[av.c(i2.a())];
        int n2 = 0;
        while (n2 < vector.size()) {
            i i3 = (i)vector.elementAt(n2);
            if (i3.a.equals(i2.a)) {
                i3.a(i3.d() + 1);
                return;
            }
            ++n2;
        }
        vector.addElement(i2);
    }

    public final void a(i i2, int n2) {
        Vector vector = this.a[av.c(i2.a())];
        int n3 = 0;
        while (n3 < vector.size()) {
            i i3 = (i)vector.elementAt(n3);
            if (i3.a.equals(i2.a)) {
                if (i3.d() > n2) {
                    i3.a(i3.d() - n2);
                    return;
                }
                vector.removeElementAt(n3);
                return;
            }
            ++n3;
        }
    }

    public final i a(String string) {
        int n2 = 0;
        while (n2 < this.a.length) {
            Vector vector = this.a[n2];
            int n3 = 0;
            while (n3 < vector.size()) {
                i i2 = (i)vector.elementAt(n3);
                if (i2.a.equals(string)) {
                    return i2;
                }
                ++n3;
            }
            ++n2;
        }
        return null;
    }

    public final Vector a(int n2) {
        return this.a[n2];
    }

    public final int b(i i2) {
        Vector vector = this.a[av.c(i2.a())];
        int n2 = 0;
        while (n2 < vector.size()) {
            i i3 = (i)vector.elementAt(n2);
            if (i3.a.equals(i2.a)) {
                return i3.d();
            }
            ++n2;
        }
        return 0;
    }

    public final i[] b(int n2) {
        int n3 = av.c(n2);
        Object object = this;
        object = ((av)object).a[n3];
        if (object != null) {
            i i2;
            n3 = 0;
            int n4 = 0;
            while (n4 < ((Vector)object).size()) {
                i2 = (i)((Vector)object).elementAt(n4);
                if (i2.a() == n2) {
                    ++n3;
                }
                ++n4;
            }
            if (n3 > 0) {
                i[] iArray = new i[n3];
                n4 = 0;
                int n5 = 0;
                while (n4 < ((Vector)object).size()) {
                    i2 = (i)((Vector)object).elementAt(n4);
                    if (i2.a() == n2) {
                        iArray[n5] = i2;
                        ++n5;
                    }
                    ++n4;
                }
                return iArray;
            }
            return null;
        }
        return null;
    }

    public final void b() {
        int n2 = 0;
        while (n2 < this.a.length) {
            this.a[n2].removeAllElements();
            ++n2;
        }
    }
}

