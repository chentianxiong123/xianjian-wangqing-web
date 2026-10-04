/*
 * Decompiled with CFR 0.152.
 */
import java.io.DataInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Date;

public class b {
    public final int a;
    public int[] b;
    public String c;
    public String d;
    public String e;
    public String f;
    private String g;
    private long h;

    public b(int n2, int[] nArray, long l2, String string, String string2, String string3, String string4) {
        this.a = n2;
        this.b = nArray;
        this.c = string;
        this.d = string2;
        this.e = string3;
        this.f = string4;
        this.a(l2);
    }

    public final void a(long l2) {
        this.h = l2;
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date(l2));
        this.g = String.valueOf(calendar.get(2) + 1) + "/" + calendar.get(5) + " " + (calendar.get(11) < 10 ? "0" : "") + calendar.get(11) + ":" + (calendar.get(12) < 10 ? "0" : "") + calendar.get(12);
    }

    public final long a() {
        return this.h;
    }

    public final String b() {
        return this.g;
    }

    private b() {
    }

    public static String[] a(String string) {
        return b.a(string.getClass().getResourceAsStream(string));
    }

    public static String[] a(InputStream inputStream) {
        String[] stringArray;
        inputStream = new DataInputStream(new ai(inputStream));
        try {
            b.a((DataInputStream)inputStream);
            stringArray = new String[((DataInputStream)inputStream).readShort()];
            int n2 = 0;
            while (n2 < stringArray.length) {
                stringArray[n2] = ((DataInputStream)inputStream).readUTF();
                ++n2;
            }
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
        return stringArray;
    }

    public static String a(String string, int n2) {
        return b.a(string.getClass().getResourceAsStream(string), n2);
    }

    public static String a(InputStream inputStream, int n2) {
        String string;
        int n3;
        inputStream = new DataInputStream(new ai(inputStream));
        try {
            b.a((DataInputStream)inputStream);
            int n4 = ((DataInputStream)inputStream).readShort();
            n3 = 0;
            while (n3 < n4) {
                if (n3 != n2) break block10;
                string = ((DataInputStream)inputStream).readUTF();
            }
        }
        catch (Throwable throwable) {
            try {
                ((FilterInputStream)inputStream).close();
            }
            catch (IOException iOException) {}
            throw throwable;
        }
        {
            block10: {
                try {
                    ((FilterInputStream)inputStream).close();
                }
                catch (IOException iOException) {}
                return string;
            }
            ((FilterInputStream)inputStream).skip(((DataInputStream)inputStream).readUnsignedShort());
            ++n3;
            continue;
        }
        try {
            ((FilterInputStream)inputStream).close();
        }
        catch (IOException iOException) {}
        return null;
    }

    private static void a(DataInputStream dataInputStream) {
        if ((dataInputStream.readByte() & 0xFF) != 136 || dataInputStream.readByte() != 83 || dataInputStream.readByte() != 84 || dataInputStream.readByte() != 82 || (dataInputStream.readByte() & 0xFF) != 6) {
            throw new IllegalArgumentException("\u5b57\u7b26\u4e32\u5305\u6570\u636e\u4e0d\u6b63\u786e\u3002");
        }
    }
}

