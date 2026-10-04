/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.d;

public final class af {
    private t m = new t();
    public final int a;
    public final int b;
    public final boolean c;
    public final String d;
    public final String e;
    public final boolean f;
    public final int g;
    public final int h;
    public final boolean i;
    public final int j;
    public final int k;
    private final String n;
    public final String l;

    public af(int n2, String string, String string2, String string3, String string4, String string5, String string6, String string7, String string8, String string9, String string10, String string11, String string12) {
        this.a = n2;
        this.b = string.equals("\u666e\u901a") ? 0 : (string.equals("\u6c34\u7cfb") ? 1 : (string.equals("\u96f7\u7cfb") ? 2 : (string.equals("\u706b\u7cfb") ? 3 : (string.equals("\u98ce\u7cfb") ? 4 : (string.equals("\u571f\u7cfb") ? 5 : (string.equals("\u53cc\u7cfb") ? 6 : 7))))));
        this.c = string2.equals("\u589e\u76ca");
        this.d = string3;
        this.e = string4;
        this.f = string5.equals("\u662f");
        this.g = Integer.parseInt(string6);
        this.h = Integer.parseInt(string7);
        this.i = string8.equals("\u662f");
        this.j = Integer.parseInt(string9);
        this.k = Integer.parseInt(string10);
        this.n = string11;
        this.l = string12;
    }

    public static af a(String string) {
        string = string.trim();
        int n2 = 0;
        while (n2 < cn.com.etgame.cls.system.d.U.length) {
            if (string.equals(cn.com.etgame.cls.system.d.U[n2].d)) {
                return cn.com.etgame.cls.system.d.U[n2];
            }
            ++n2;
        }
        return null;
    }

    public static af[] a(int n2, af[] afArray) {
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        while (n5 < afArray.length) {
            if (afArray[n5].b == 0) {
                if (n3 == 0) {
                    n4 = n5;
                }
                ++n3;
            }
            ++n5;
        }
        af[] afArray2 = n3 > 0 ? new af[n3] : null;
        n5 = n4;
        n4 = 0;
        while (n4 < n3 && n5 < afArray.length) {
            if (afArray[n5].b == 0) {
                afArray2[n4] = afArray[n5];
                ++n4;
            }
            ++n5;
        }
        return afArray2;
    }

    public final int a(int n2, int n3) {
        this.m.a("slv=" + Math.max(n2, 1));
        this.m.a("atk=" + n3);
        cn.com.etgame.cls.system.d.a(5, "atk_adj=" + this.n);
        return (int)this.m.a(this.n);
    }
}

