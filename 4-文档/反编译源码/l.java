/*
 * Decompiled with CFR 0.152.
 */
public final class l {
    public int a;
    public int b;
    public int c;
    public int d;
    public Object e;
    Object f;

    public l(int n2, int n3, int n4, int n5, Object object) {
        this.a = n2;
        this.b = n3;
        this.c = n4;
        this.d = n5;
        this.e = object;
    }

    public final boolean equals(Object object) {
        if (object instanceof l) {
            object = (l)object;
            return this.a == ((l)object).a && this.b == ((l)object).b && this.c == ((l)object).c && this.d == ((l)object).d;
        }
        return false;
    }

    public final l a() {
        return new l(this.a, this.b, this.c, this.d, this.e);
    }
}

