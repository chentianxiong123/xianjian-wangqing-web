/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.d;

public final class i {
    public final String a;
    private int b;
    private int c;
    private int d;
    private int e;
    private int f;
    private String g;
    private String h;
    private int i;
    private int j;
    private int k;
    private int l;
    private int m;
    private int n;
    private int o;

    public i(String string) {
        this(string, 1);
    }

    public i(String object, int n2) {
        this.a = object;
        int n3 = 0;
        while (n3 < cn.com.etgame.cls.system.d.Q.length) {
            if (cn.com.etgame.cls.system.d.Q[n3][0].equals(object)) {
                object = cn.com.etgame.cls.system.d.Q[n3][1];
                this.b = ((String)object).equals("\u6b66\u5668") ? 0 : (((String)object).equals("\u670d\u9970") ? 1 : (((String)object).equals("\u5934\u9970") ? 2 : (((String)object).equals("\u8db3\u9970") ? 3 : (((String)object).equals("\u9970\u54c1") ? 4 : (((String)object).equals("\u836f\u54c1") ? 5 : (((String)object).equals("\u6750\u6599") ? 6 : (((String)object).equals("\u7279\u6b8a") ? 7 : (((String)object).equals("\u5408\u6210") ? 9 : 8))))))));
                this.c = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][2]);
                object = cn.com.etgame.cls.system.d.Q[n3][3];
                this.d = ((String)object).equals("\u91cd\u697c") ? 0 : (((String)object).equals("\u6708\u7476") ? 1 : (((String)object).equals("\u7d2b\u8431") ? 2 : (((String)object).equals("\u5973") ? 3 : 4)));
                this.i = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][4]);
                this.j = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][5]);
                this.k = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][6]);
                this.l = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][7]);
                Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][8]);
                this.m = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][9]);
                this.n = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][10]);
                this.o = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][11]);
                this.e = Integer.parseInt(cn.com.etgame.cls.system.d.Q[n3][12]);
                this.g = cn.com.etgame.cls.system.d.Q[n3][13];
                this.h = cn.com.etgame.cls.system.d.Q[n3][14];
                break;
            }
            ++n3;
        }
        object = this;
        this.f = n2;
    }

    public final int a() {
        return this.b;
    }

    public final int b() {
        return this.e;
    }

    public final String c() {
        return this.h;
    }

    public final void a(int n2) {
        this.f = n2;
    }

    public final int d() {
        return this.f;
    }

    public final void a(aj aj2) {
        aj2.a(this.g, this);
    }

    public final void a(aj aj2, Object object) {
        aj2.a(this.g, object);
    }

    public final int e() {
        return this.n;
    }

    public final int f() {
        return this.i;
    }

    public final int g() {
        return this.j;
    }

    public final int h() {
        return this.o;
    }

    public final int i() {
        return this.m;
    }

    public final int j() {
        return this.l;
    }

    public final int k() {
        return this.k;
    }

    public final String l() {
        return this.g;
    }

    public final boolean a(String string) {
        switch (this.d) {
            case 0: {
                return string.equals("\u91cd\u697c");
            }
            case 1: {
                return string.equals("\u6708\u7476");
            }
            case 2: {
                return string.equals("\u7d2b\u8431");
            }
            case 3: {
                return string.equals("\u6708\u7476") || string.equals("\u7d2b\u8431");
            }
            case 4: {
                return true;
            }
        }
        return false;
    }

    public final boolean b(int n2) {
        return n2 >= this.c;
    }
}

