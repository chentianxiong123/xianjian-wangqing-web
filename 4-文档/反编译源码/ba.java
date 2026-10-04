/*
 * Decompiled with CFR 0.152.
 */
import java.io.DataInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public final class ba {
    public final int a;
    public final int b;
    public final int[] c;

    private ba(int n2, int n3, int[] nArray) {
        this.a = n2;
        this.b = n3;
        this.c = nArray;
    }

    public static ba a(InputStream inputStream) {
        ba ba2;
        inputStream = new DataInputStream(new ai(inputStream));
        try {
            if ((((DataInputStream)inputStream).readByte() & 0xFF) != 136 || ((DataInputStream)inputStream).readByte() != 80 || ((DataInputStream)inputStream).readByte() != 73 || ((DataInputStream)inputStream).readByte() != 88 || (((DataInputStream)inputStream).readByte() & 0xFF) != 1) {
                throw new IllegalArgumentException("\u50cf\u7d20\u77e9\u9635\u6570\u636e\u4e0d\u6b63\u786e\u3002");
            }
            int n2 = ((DataInputStream)inputStream).readInt();
            int n3 = ((DataInputStream)inputStream).readInt();
            int[] nArray = new int[n2 * n3];
            int n4 = 0;
            while (n4 < nArray.length) {
                nArray[n4] = ((DataInputStream)inputStream).readInt();
                ++n4;
            }
            ba2 = new ba(n2, n3, nArray);
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
        return ba2;
    }
}

