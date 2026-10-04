/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.d;

public final class bm {
    private int a;
    private int b;
    private String c;
    private int d;
    private int e;
    private String f;
    private int g;
    private int h;
    private int i;
    private int j;
    private int k;
    private int l;
    private af[] m;
    private af[] n;
    private String[] o;
    private String[] p;
    private t q = new t();

    public final void a(String object) {
        String[] stringArray;
        object = new bg((String)object);
        this.c = ((bg)object).a("\u540d\u5b57");
        this.a = Integer.parseInt(((bg)object).a("ID"));
        cn.com.etgame.cls.system.d.a(2, "loadConfig()\u602a\u7269\u7684\u914d\u7f6e\u6587\u4ef6\uff1a" + this.c + " antID=" + this.a);
        Integer.parseInt(((bg)object).a("\u6218\u6597\u4f4d\u7f6e"));
        this.l = (int)this.q.a(((bg)object).a("\u4f7f\u7528\u836f\u54c1\u7684\u6982\u7387"));
        this.d = j.a((int)this.q.a(((bg)object).a("\u6700\u5c0f\u751f\u547d")), (int)this.q.a(((bg)object).a("\u6700\u5927\u751f\u547d")));
        cn.com.etgame.cls.system.d.a(2, "loadConfig()\u602a\u7269\u7684\u8840\u91cf\uff1a" + this.d);
        this.e = j.a((int)this.q.a(((bg)object).a("\u6700\u5c0f\u901f\u5ea6")), (int)this.q.a(((bg)object).a("\u6700\u5927\u901f\u5ea6")));
        this.f = ((bg)object).a("\u4ed9\u672f\u901f\u5ea6");
        this.g = (int)this.q.a(((bg)object).a("\u653b\u51fb\u503c"));
        this.h = (int)this.q.a(((bg)object).a("\u8fd0"));
        this.k = (int)this.q.a(((bg)object).a("\u653b\u51fb\u65f6\u589e\u52a0\u7684\u6c14\u503c"));
        this.i = j.a((int)this.q.a(((bg)object).a("\u6700\u5c0f\u7ecf\u9a8c")), (int)this.q.a(((bg)object).a("\u6700\u5927\u7ecf\u9a8c")));
        this.j = j.a((int)this.q.a(((bg)object).a("\u6700\u5c0f\u91d1\u94b1")), (int)this.q.a(((bg)object).a("\u6700\u5927\u91d1\u94b1")));
        String[] stringArray2 = j.a(((bg)object).a("\u666e\u901a\u6280\u80fd"), ",");
        this.m = new af[stringArray2.length];
        int n2 = 0;
        while (n2 < this.m.length) {
            stringArray = j.a(stringArray2[n2], "#");
            this.m[n2] = new af(n2, stringArray[0], stringArray[1], stringArray[2].trim(), stringArray[3], stringArray[4], stringArray[5], stringArray[6], stringArray[7], stringArray[8], stringArray[9], stringArray[10], stringArray.length > 11 ? stringArray[11] : null);
            ++n2;
        }
        stringArray2 = j.a(((bg)object).a("\u4ed9\u672f\u6280\u80fd"), ",");
        this.n = new af[stringArray2.length];
        n2 = 0;
        while (n2 < this.n.length) {
            stringArray = j.a(stringArray2[n2], "#");
            this.n[n2] = new af(n2, stringArray[0], stringArray[1], stringArray[2].trim(), stringArray[3], stringArray[4], stringArray[5], stringArray[6], stringArray[7], stringArray[8], stringArray[9], stringArray[10], stringArray.length > 11 ? stringArray[11] : null);
            ++n2;
        }
        stringArray2 = j.a(((bg)object).a("\u643a\u5e26\u7269\u54c1"), ",");
        this.p = new String[stringArray2.length];
        n2 = 0;
        while (n2 < this.p.length) {
            this.p[n2] = stringArray2[n2];
            ++n2;
        }
        stringArray2 = j.a(((bg)object).a("\u6389\u843d\u7269\u54c1"), ",");
        this.o = new String[stringArray2.length];
        n2 = 0;
        while (n2 < this.o.length) {
            this.o[n2] = stringArray2[n2];
            ++n2;
        }
    }

    public final af[] a() {
        return this.n;
    }

    public final String b() {
        return this.f;
    }

    public final int c() {
        return this.g;
    }

    public final int d() {
        return this.i;
    }

    public final int e() {
        return this.j;
    }

    public final int f() {
        return this.d;
    }

    public final int g() {
        return this.l;
    }

    public final String[] h() {
        return this.o;
    }

    public final int i() {
        return this.h;
    }

    public final String j() {
        return this.c;
    }

    public final af[] k() {
        return this.m;
    }

    public final int l() {
        return this.e;
    }

    public final String[] m() {
        return this.p;
    }

    public final int n() {
        return this.a;
    }

    public final int o() {
        return this.k;
    }

    public final int p() {
        return this.b;
    }

    public final void a(int n2) {
        this.q.a("lv=" + n2);
        this.b = n2;
    }
}

