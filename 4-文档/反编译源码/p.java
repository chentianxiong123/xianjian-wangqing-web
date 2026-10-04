/*
 * Decompiled with CFR 0.152.
 */
final class p
implements Runnable {
    private al a;

    p(al al2) {
        this.a = al2;
    }

    public final void run() {
        al al2 = this.a;
        al.a(al2, al.f(al2) - al.g(this.a));
        al.b(al.f(this.a));
        al.a(this.a, (byte)3);
    }
}

