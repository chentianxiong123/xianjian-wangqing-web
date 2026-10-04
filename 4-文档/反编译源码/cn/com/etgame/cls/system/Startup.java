/*
 * Decompiled with CFR 0.152.
 */
package cn.com.etgame.cls.system;

import cn.com.etgame.cls.system.b;
import cn.com.etgame.cls.system.c;
import cn.com.etgame.cls.system.d;
import javax.microedition.midlet.MIDlet;

public final class Startup
extends MIDlet {
    private ag a = ag.a(this, 240, 320, -6, -7);

    public Startup() {
        this.a.a(-1);
        this.a.a(true);
        try {
            d.a();
            d.b();
            new al();
        }
        catch (Throwable throwable) {
            this.a.a(throwable, "Startup()", 1);
        }
        if (this.a.d() == 1) {
            this.a.a(new b());
        } else {
            this.a.a(new ab(new String[]{"/logo/sp.png"}, new c(new h(new b()))));
        }
        this.a.e();
        this.a.f();
    }

    protected final void startApp() {
        this.a.f();
    }

    protected final void pauseApp() {
        this.a.g();
    }

    protected final void destroyApp(boolean bl2) {
        this.a.h();
    }
}

