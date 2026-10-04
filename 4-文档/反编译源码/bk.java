/*
 * Decompiled with CFR 0.152.
 */
public class bk {
    private long a;
    private long b;
    private long c;
    private boolean d;

    public bk(long l2) {
        long l3 = l2;
        bk bk2 = this;
        this.a = l3;
        this.c();
    }

    public final void c() {
        this.d = true;
        this.b = this.c = System.currentTimeMillis();
    }

    public final void d() {
        this.b = 0L;
    }

    public final void a(long l2) {
        this.a = l2;
    }

    public final long e() {
        return this.a;
    }

    public final long f() {
        long l2 = System.currentTimeMillis();
        long l3 = this.b + this.a - l2 + (this.d ? l2 - this.c : 0L);
        if (l3 > 0L) {
            return l3;
        }
        return 0L;
    }

    public final void g() {
        if (this.d) {
            this.d = false;
            this.b += System.currentTimeMillis() - this.c;
        }
    }

    public final void h() {
        if (!this.d) {
            this.d = true;
            this.c = System.currentTimeMillis();
        }
    }

    public final boolean i() {
        return this.d;
    }
}

