/*
 * Decompiled with CFR 0.152.
 */
package cn.com.etgame.cls.system;

import javax.microedition.lcdui.Graphics;

public final class c
extends o {
    private o a;
    private ag b = ag.a();
    private int c;
    private int d;

    public c(o o2) {
        this.c = this.b.c;
        this.d = this.b.d;
        this.a = o2;
    }

    public final int c() {
        return 0;
    }

    public final boolean a(int n2) {
        return true;
    }

    public final void a(Graphics graphics) {
        graphics.setColor(0);
        graphics.fillRect(0, 0, this.c, this.d);
        graphics.setColor(0xFFFFFF);
        graphics.setFont(ag.a);
        graphics.drawString("\u5f00\u542f\u97f3\u4e50", this.c >> 1, this.d >> 1, 33);
        graphics.setFont(ag.b);
        graphics.drawString("\u5f00", 0, this.d, 36);
        graphics.drawString("\u5173", this.c, this.d, 40);
    }

    public final void g() {
        this.b.repaint();
        this.b.serviceRepaints();
    }

    public final void a(int n2, int n3) {
        if (n2 != 0) {
            switch (n2) {
                case 131072: {
                    ah.a(false);
                    this.b.a(this.a);
                    return;
                }
                case 262144: {
                    ah.a(true);
                    this.b.a(this.a);
                }
            }
        }
    }

    public final void n() {
        this.b.f();
    }

    public final void o() {
        this.b.g();
    }
}

