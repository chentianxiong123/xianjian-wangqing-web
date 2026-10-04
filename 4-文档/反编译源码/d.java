/*
 * Decompiled with CFR 0.152.
 */
import java.io.DataInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public final class d {
    private y[] b;
    public final at[] a;
    private final int[][] c;

    private d(y[] yArray, at[] atArray, int[][] nArray) {
        this.b = yArray;
        this.a = atArray;
        this.c = nArray;
    }

    public static final d a(String string) {
        String string2 = string;
        string = null;
        string = string2;
        return d.a(string2.getClass().getResourceAsStream(string), null);
    }

    private static d a(InputStream inputStream, as object) {
        inputStream = new DataInputStream(new ai(inputStream));
        try {
            int n2;
            at[] atArray;
            if ((((DataInputStream)inputStream).readByte() & 0xFF) != 136 || ((DataInputStream)inputStream).readByte() != 65 || ((DataInputStream)inputStream).readByte() != 78 || ((DataInputStream)inputStream).readByte() != 84 || (((DataInputStream)inputStream).readByte() & 0xFF) != 2) {
                throw new IllegalArgumentException("\u52a8\u753b\u6570\u636e\u4e0d\u6b63\u786e\u3002");
            }
            if (((DataInputStream)inputStream).readBoolean()) {
                ((DataInputStream)inputStream).readShort();
                ((DataInputStream)inputStream).readShort();
            }
            int[][] nArray = new int[((DataInputStream)inputStream).readShort()][5];
            int n3 = 0;
            while (n3 < nArray.length) {
                nArray[n3] = new int[]{((DataInputStream)inputStream).readShort(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt()};
                ++n3;
            }
            y[] yArray = new y[((DataInputStream)inputStream).readShort()];
            n3 = 0;
            while (n3 < yArray.length) {
                atArray = (at[])new int[((DataInputStream)inputStream).readShort()][4];
                n2 = 0;
                while (n2 < atArray.length) {
                    atArray[n2] = new int[]{((DataInputStream)inputStream).readShort(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readByte()};
                    ++n2;
                }
                yArray[n3] = new y(nArray, (int[][])atArray);
                ++n3;
            }
            atArray = new at[((DataInputStream)inputStream).readShort()];
            n3 = 0;
            while (n3 < atArray.length) {
                Object object2;
                String string = ((DataInputStream)inputStream).readUTF();
                if (((DataInputStream)inputStream).readBoolean()) {
                    if (object == null) {
                        object2 = ((DataInputStream)inputStream).readUTF();
                    } else {
                        ((DataInputStream)inputStream).readUTF();
                        object2 = object.a();
                    }
                } else {
                    object2 = null;
                }
                String string2 = object2;
                be[] beArray = new be[((DataInputStream)inputStream).readShort()];
                n2 = 0;
                while (n2 < beArray.length) {
                    Object object3;
                    short s2 = ((DataInputStream)inputStream).readShort();
                    int n4 = ((DataInputStream)inputStream).readInt();
                    int n5 = ((DataInputStream)inputStream).readInt();
                    long l2 = ((DataInputStream)inputStream).readLong();
                    if (((DataInputStream)inputStream).readBoolean()) {
                        if (object == null) {
                            object3 = ((DataInputStream)inputStream).readUTF();
                        } else {
                            ((DataInputStream)inputStream).readUTF();
                            object3 = object.a();
                        }
                    } else {
                        object3 = null;
                    }
                    beArray[n2] = new be(s2, n4, n5, l2, object3, yArray);
                    int n6 = 0;
                    int n7 = ((DataInputStream)inputStream).readShort();
                    while (n6 < n7) {
                        beArray[n2].a(new l(((DataInputStream)inputStream).readInt() + beArray[n2].a, ((DataInputStream)inputStream).readInt() + beArray[n2].b, ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readBoolean() ? ((DataInputStream)inputStream).readUTF() : null));
                        ++n6;
                    }
                    n6 = 0;
                    n7 = ((DataInputStream)inputStream).readShort();
                    while (n6 < n7) {
                        beArray[n2].b(new l(((DataInputStream)inputStream).readInt() + beArray[n2].a, ((DataInputStream)inputStream).readInt() + beArray[n2].b, ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readUTF()));
                        ++n6;
                    }
                    ++n2;
                }
                atArray[n3] = new at(beArray, string, string2, -1, 0, yArray, null);
                ++n3;
            }
            object = new d(yArray, atArray, nArray);
        }
        catch (Throwable throwable) {
            try {
                ((FilterInputStream)inputStream).close();
            }
            catch (IOException iOException) {}
            throw throwable;
        }
        try {
            ((FilterInputStream)inputStream).close();
        }
        catch (IOException iOException) {}
        return object;
    }

    public final at b(String string) {
        int n2 = 0;
        while (n2 < this.a.length) {
            if (this.a[n2].a.equals(string)) {
                return this.a[n2];
            }
            ++n2;
        }
        return null;
    }

    public final boolean a(int n2) {
        int n3 = 0;
        while (n3 < this.c.length) {
            if (this.c[n3][0] == n2) {
                return true;
            }
            ++n3;
        }
        return false;
    }

    public final boolean equals(Object object) {
        block10: {
            Object object2 = object;
            object = this;
            if (object2 instanceof d) {
                object2 = (d)object2;
                if (((d)object).b.length != ((d)object2).b.length || ((d)object).a.length != ((d)object2).a.length) {
                    return false;
                }
                int n2 = 0;
                while (n2 < ((d)object).b.length) {
                    if (((d)object).b[n2].equals(((d)object2).b[n2])) {
                        ++n2;
                        continue;
                    }
                    break block10;
                }
                n2 = 0;
                while (n2 < ((d)object).a.length) {
                    boolean bl2;
                    block11: {
                        at at2 = ((d)object2).a[n2];
                        at at3 = ((d)object).a[n2];
                        if (at3.b.length != at2.b.length) {
                            bl2 = false;
                        } else {
                            int n3 = 0;
                            while (n3 < at3.b.length) {
                                if (!be.a(at3.b[n3], at2.b[n3])) {
                                    bl2 = false;
                                    break block11;
                                }
                                ++n3;
                            }
                            bl2 = true;
                        }
                    }
                    if (bl2) {
                        ++n2;
                        continue;
                    }
                    break block10;
                }
                return true;
            }
        }
        return false;
    }

    public static d a(d d2) {
        at[] atArray = new at[d2.a.length];
        int n2 = 0;
        while (n2 < atArray.length) {
            atArray[n2] = at.a(d2.a[n2]);
            ++n2;
        }
        return new d(d2.b, atArray, d2.c);
    }
}

