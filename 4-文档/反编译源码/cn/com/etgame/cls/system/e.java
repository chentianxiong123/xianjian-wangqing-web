/*
 * Decompiled with CFR 0.152.
 */
package cn.com.etgame.cls.system;

import javax.microedition.lcdui.Graphics;

public final class e {
    private int b;
    aw a;
    private boolean c;
    private boolean d;
    private int e;
    private int f;
    private int g;
    private int h;
    private int i;

    public e() {
        this.e = ag.a().c;
        this.f = ag.a().d;
        this.h = this.f / 15;
        this.i = this.e / 15;
    }

    public final void a(boolean bl2, int n2) {
        this.c = bl2;
        this.d = true;
        this.b = n2;
        if (n2 == 0 || n2 == 3) {
            if (bl2) {
                this.g = 0;
                return;
            }
            this.g = -(n2 == 0 ? this.h : this.i);
            return;
        }
        if (n2 == 1 || n2 == 2) {
            if (bl2) {
                this.g = 15;
                return;
            }
            this.g = 15 + (n2 == 1 ? this.h : this.i);
        }
    }

    public final void a(Graphics graphics) {
        graphics.setClip(0, 0, this.e, this.f);
        graphics.setColor(0);
        int n2 = 0;
        while (n2 < 16) {
            if (this.b == 0) {
                if (this.c ? n2 < this.g : n2 > this.g) {
                    graphics.fillRect(0, this.c ? n2 * this.h : this.h - Math.min(this.h, Math.abs(this.g - n2)) + n2 * this.h, this.e, Math.min(this.h + 10, Math.abs(this.g - n2)));
                }
            } else if (this.b == 1) {
                if (this.c ? n2 > this.g : n2 < this.g) {
                    graphics.fillRect(0, this.c ? this.h - Math.min(this.h, Math.abs(this.g - n2)) + n2 * this.h : n2 * this.h, this.e, Math.min(this.h + 10, Math.abs(this.g - n2)));
                }
            } else if (this.b == 3) {
                if (this.c ? n2 < this.g : n2 > this.g) {
                    graphics.fillRect(this.c ? n2 * this.i : this.i - Math.min(this.i, Math.abs(this.g - n2)) + n2 * this.i, 0, Math.min(this.i + 10, Math.abs(this.g - n2)), this.f);
                }
            } else if (this.b == 2 && (this.c ? n2 > this.g : n2 < this.g)) {
                graphics.fillRect(this.c ? this.i - Math.min(this.i, Math.abs(this.g - n2)) + n2 * this.i : n2 * this.i, 0, Math.min(this.i + 10, Math.abs(this.g - n2)), this.f);
            }
            ++n2;
        }
    }

    public final void a() {
        if (this.d) {
            if (this.b == 1 || this.b == 2) {
                this.g -= 2;
                if (this.c) {
                    if (this.g < -(this.b == 1 ? this.h : this.i)) {
                        this.d = false;
                        this.a.b(null);
                        return;
                    }
                } else if (this.g < 0) {
                    this.d = false;
                    return;
                }
            } else if (this.b == 0 || this.b == 3) {
                this.g += 2;
                if (this.c) {
                    if (this.g >= 15 + (this.b == 0 ? this.h : this.i)) {
                        this.d = false;
                        this.a.b(null);
                        return;
                    }
                } else if (this.g >= 15) {
                    this.d = false;
                }
            }
        }
    }

    public final boolean b() {
        return !this.d;
    }
}

