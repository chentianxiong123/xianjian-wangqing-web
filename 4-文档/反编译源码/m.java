/*
 * Decompiled with CFR 0.152.
 */
public final class m {
    private static final int[] a = new int[256];

    static {
        int n2 = 0;
        while (n2 < 256) {
            int n3 = n2;
            int n4 = 8;
            while (--n4 >= 0) {
                if ((n3 & 1) != 0) {
                    n3 = 0xEDB88320 ^ n3 >>> 1;
                    continue;
                }
                n3 >>>= 1;
            }
            m.a[n2] = n3;
            ++n2;
        }
    }

    public static int a(byte[] byArray, int n2, int n3) {
        n3 = Math.min(n2 + n3, byArray.length);
        int n4 = -1;
        while (n2 < n3) {
            n4 = a[(n4 ^ byArray[n2++]) & 0xFF] ^ n4 >>> 8;
        }
        return ~n4;
    }

    static int a(byte[] byArray, int n2, int n3, int n4) {
        n4 = Math.min(n3 + n4, byArray.length);
        n2 ^= 0xFFFFFFFF;
        while (n3 < n4) {
            n2 = a[(n2 ^ byArray[n3++]) & 0xFF] ^ n2 >>> 8;
        }
        return ~n2;
    }
}

