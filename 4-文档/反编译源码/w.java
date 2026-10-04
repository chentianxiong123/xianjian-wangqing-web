/*
 * Decompiled with CFR 0.152.
 */
import java.io.DataInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class w {
    public final int a;
    public final int b;
    public final ao[] c;
    public Object d;

    private w(Object object, short s2, short s3, short s4, short s5, int n2, ao[] aoArray) {
        this.d = object;
        this.c = aoArray;
        this.a = s2 * s4;
        this.b = s3 * s5;
    }

    public static final w a(String string, d d2, bi bi2) {
        String string2 = string;
        string = null;
        string = string2;
        return w.a(string2.getClass().getResourceAsStream(string), d2, bi2, null);
    }

    private static w a(InputStream inputStream, d object, bi bi2, as as2) {
        inputStream = new DataInputStream(new ai(inputStream));
        try {
            Object object2;
            if ((((DataInputStream)inputStream).readByte() & 0xFF) != 136 || ((DataInputStream)inputStream).readByte() != 77 || ((DataInputStream)inputStream).readByte() != 65 || ((DataInputStream)inputStream).readByte() != 80 || (((DataInputStream)inputStream).readByte() & 0xFF) != 5) {
                throw new IllegalArgumentException("\u573a\u666f\u6570\u636e\u4e0d\u6b63\u786e\u3002");
            }
            ((DataInputStream)inputStream).readBoolean();
            int n2 = ((DataInputStream)inputStream).readInt();
            short s2 = ((DataInputStream)inputStream).readShort();
            short s3 = ((DataInputStream)inputStream).readShort();
            if (as2 == null) {
                object2 = ((DataInputStream)inputStream).readUTF();
            } else {
                ((DataInputStream)inputStream).readUTF();
                object2 = as2.a();
            }
            String string = object2;
            ao[] aoArray = new ao[((DataInputStream)inputStream).readByte() & 0xFF];
            short s4 = ((DataInputStream)inputStream).readShort();
            int n3 = ((DataInputStream)inputStream).readShort();
            int n4 = 0;
            while (n4 < aoArray.length) {
                int n5;
                int n6;
                Object object3 = ((DataInputStream)inputStream).readUTF();
                Object object4 = ((DataInputStream)inputStream).readBoolean() ? new short[n3][s4] : null;
                if ((short[][])object4 == null) {
                    object3 = new ao(s4, (short)n3, s2, s3, (String)object3, n2, n4 == 0);
                } else {
                    object3 = new ao((short[][])object4, s4, (short)n3, s2, s3, (String)object3, n2, n4 == 0);
                    n6 = 0;
                    while (n6 < n3) {
                        n5 = 0;
                        while (n5 < s4) {
                            ((ao)object3).a(n5, n6, ((DataInputStream)inputStream).readShort());
                            ++n5;
                        }
                        ++n6;
                    }
                }
                n6 = 0;
                n5 = ((DataInputStream)inputStream).readShort();
                while (n6 < n5) {
                    block31: {
                        block30: {
                            Object object5;
                            object4 = object == null ? (Object)new v(((DataInputStream)inputStream).readShort(), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt()) : (Object)new q(at.a(((d)object).a[((DataInputStream)inputStream).readShort()]), ((DataInputStream)inputStream).readInt(), ((DataInputStream)inputStream).readInt());
                            if (((DataInputStream)inputStream).readBoolean()) {
                                if (as2 == null) {
                                    object5 = ((DataInputStream)inputStream).readUTF();
                                } else {
                                    ((DataInputStream)inputStream).readUTF();
                                    object5 = as2.a();
                                }
                            } else {
                                object5 = object4.v = null;
                            }
                            if (bi2 == null) break block30;
                            bn bn2 = bi2.a((bn)object4, (ao)object3);
                            object4 = bn2;
                            if (bn2 == null) break block31;
                        }
                        ((ao)object3).a((bn)object4);
                    }
                    ++n6;
                }
                n6 = 0;
                n5 = ((DataInputStream)inputStream).readShort();
                while (n6 < n5) {
                    Object object6;
                    int n7 = ((DataInputStream)inputStream).readInt();
                    int n8 = ((DataInputStream)inputStream).readInt();
                    int n9 = ((DataInputStream)inputStream).readInt();
                    int n10 = ((DataInputStream)inputStream).readInt();
                    if (as2 == null) {
                        object6 = ((DataInputStream)inputStream).readUTF();
                    } else {
                        ((DataInputStream)inputStream).readUTF();
                        object6 = as2.a();
                    }
                    ((ao)object3).a(new l(n7, n8, n9, n10, object6));
                    ++n6;
                }
                n6 = 0;
                n5 = ((DataInputStream)inputStream).readShort();
                while (n6 < n5) {
                    Object object7;
                    int n11 = ((DataInputStream)inputStream).readInt();
                    int n12 = ((DataInputStream)inputStream).readInt();
                    int n13 = ((DataInputStream)inputStream).readInt();
                    int n14 = ((DataInputStream)inputStream).readInt();
                    if (((DataInputStream)inputStream).readBoolean()) {
                        if (as2 == null) {
                            object7 = ((DataInputStream)inputStream).readUTF();
                        } else {
                            ((DataInputStream)inputStream).readUTF();
                            object7 = as2.a();
                        }
                    } else {
                        object7 = null;
                    }
                    ((ao)object3).b(new l(n11, n12, n13, n14, object7));
                    ++n6;
                }
                aoArray[n4] = object3;
                ++n4;
            }
            object = new w(string, s4, (short)n3, s2, s3, n2, aoArray);
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

    public final void a(Image[] imageArray) {
        int n2 = 0;
        while (n2 < this.c.length) {
            this.c[n2].a(imageArray);
            ++n2;
        }
    }

    public final boolean a(int n2) {
        int n3 = 0;
        while (n3 < this.c.length) {
            if (this.c[n3].a(n2)) {
                return true;
            }
            ++n3;
        }
        return false;
    }

    public final void a(Graphics graphics, Image[] imageArray, int n2, int n3, int n4, int n5, int n6, int n7, boolean n8) {
        n8 = 0;
        while (n8 < this.c.length) {
            this.c[n8].a(graphics, imageArray, n2, n3, n4, n5, n6, n7, false);
            this.c[n8].a(graphics, n2, n3, n4, n5, n6, n7);
            ++n8;
        }
    }

    public final void a(boolean bl2) {
        if (this.c.length > 0) {
            this.c[0].a(bl2);
        }
    }

    public final boolean a() {
        return this.c.length > 0 && this.c[0].a();
    }

    public final void a(int n2, int n3) {
        if (this.c.length > 0) {
            int n4 = n3;
            n3 = n2;
            ao ao2 = this.c[0];
            ao2.a((n3 + ao2.b - 1) / ao2.b + 1, (n4 + ao2.c - 1) / ao2.c + 1);
        }
    }

    public final void a(Image image) {
        if (this.c.length > 0) {
            this.c[0].a(image);
        }
    }

    public final Image b() {
        if (this.c.length > 0) {
            return this.c[0].b();
        }
        return null;
    }
}

