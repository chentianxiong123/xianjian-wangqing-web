/*
 * Decompiled with CFR 0.152.
 */
final class au
implements Runnable {
    private boolean a;
    private ag b;

    private au(ag ag2, byte by) {
        this.b = ag2;
        this.a = true;
    }

    public final void run() {
        ag ag2 = this.b;
        ag.a(ag2, ag.a(ag2) + 1);
        while (this.a) {
            ag.b(this.b).c();
            ag.b(this.b).g();
            ag.c(this.b);
            ag.d(this.b);
            if (this.b.c() || ag.e(this.b)) {
                this.b.repaint();
            }
            if (ag.e(this.b)) continue;
            try {
                Thread.sleep(ag.b(this.b).f());
            }
            catch (InterruptedException interruptedException) {
                this.b.a(interruptedException, "FrameCanvas.MainThread.sleep(" + ag.b(this.b).f() + ")", 0);
            }
        }
        ag ag3 = this.b;
        ag.a(ag3, ag.a(ag3) - 1);
        if (ag.f(this.b) && ag.a(this.b) == 0) {
            ag.a(this.b, false);
            this.b.g.notifyDestroyed();
        }
    }

    au(ag ag2) {
        this(ag2, 0);
    }

    static void a(au au2) {
        v0.a = false;
    }
}

