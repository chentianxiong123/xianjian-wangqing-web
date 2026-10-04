/*
 * Decompiled with CFR 0.152.
 */
import java.io.IOException;
import java.io.InputStream;

final class ak {
    static final int[] a;
    static final int[] b;

    static {
        int[] nArray = new int[58];
        nArray[1] = 3;
        nArray[3] = 4;
        nArray[5] = 5;
        nArray[7] = 6;
        nArray[9] = 7;
        nArray[11] = 8;
        nArray[13] = 9;
        nArray[15] = 10;
        nArray[16] = 1;
        nArray[17] = 11;
        nArray[18] = 1;
        nArray[19] = 13;
        nArray[20] = 1;
        nArray[21] = 15;
        nArray[22] = 1;
        nArray[23] = 17;
        nArray[24] = 2;
        nArray[25] = 19;
        nArray[26] = 2;
        nArray[27] = 23;
        nArray[28] = 2;
        nArray[29] = 27;
        nArray[30] = 2;
        nArray[31] = 31;
        nArray[32] = 3;
        nArray[33] = 35;
        nArray[34] = 3;
        nArray[35] = 43;
        nArray[36] = 3;
        nArray[37] = 51;
        nArray[38] = 3;
        nArray[39] = 59;
        nArray[40] = 4;
        nArray[41] = 67;
        nArray[42] = 4;
        nArray[43] = 83;
        nArray[44] = 4;
        nArray[45] = 99;
        nArray[46] = 4;
        nArray[47] = 115;
        nArray[48] = 5;
        nArray[49] = 131;
        nArray[50] = 5;
        nArray[51] = 163;
        nArray[52] = 5;
        nArray[53] = 195;
        nArray[54] = 5;
        nArray[55] = 227;
        nArray[57] = 258;
        a = nArray;
        int[] nArray2 = new int[60];
        nArray2[1] = 1;
        nArray2[3] = 2;
        nArray2[5] = 3;
        nArray2[7] = 4;
        nArray2[8] = 1;
        nArray2[9] = 5;
        nArray2[10] = 1;
        nArray2[11] = 7;
        nArray2[12] = 2;
        nArray2[13] = 9;
        nArray2[14] = 2;
        nArray2[15] = 13;
        nArray2[16] = 3;
        nArray2[17] = 17;
        nArray2[18] = 3;
        nArray2[19] = 25;
        nArray2[20] = 4;
        nArray2[21] = 33;
        nArray2[22] = 4;
        nArray2[23] = 49;
        nArray2[24] = 5;
        nArray2[25] = 65;
        nArray2[26] = 5;
        nArray2[27] = 97;
        nArray2[28] = 6;
        nArray2[29] = 129;
        nArray2[30] = 6;
        nArray2[31] = 193;
        nArray2[32] = 7;
        nArray2[33] = 257;
        nArray2[34] = 7;
        nArray2[35] = 385;
        nArray2[36] = 8;
        nArray2[37] = 513;
        nArray2[38] = 8;
        nArray2[39] = 769;
        nArray2[40] = 9;
        nArray2[41] = 1025;
        nArray2[42] = 9;
        nArray2[43] = 1537;
        nArray2[44] = 10;
        nArray2[45] = 2049;
        nArray2[46] = 10;
        nArray2[47] = 3073;
        nArray2[48] = 11;
        nArray2[49] = 4097;
        nArray2[50] = 11;
        nArray2[51] = 6145;
        nArray2[52] = 12;
        nArray2[53] = 8193;
        nArray2[54] = 12;
        nArray2[55] = 12289;
        nArray2[56] = 13;
        nArray2[57] = 16385;
        nArray2[58] = 13;
        nArray2[59] = 24577;
        b = nArray2;
    }

    ak() {
    }

    static void a(int[] nArray, byte[] byArray) {
        int n2;
        int n3 = 0;
        int n4 = 0;
        while (n4 < byArray.length) {
            n2 = byArray[n4];
            n3 = n3 > n2 ? n3 : n2;
            ++n4;
        }
        short[] sArray = new short[++n3];
        n2 = 0;
        while (n2 < byArray.length) {
            byte by = byArray[n2];
            sArray[by] = (short)(sArray[by] + 1);
            ++n2;
        }
        n2 = 0;
        int[] nArray2 = new int[n3];
        sArray[0] = 0;
        int n5 = 1;
        while (n5 < n3) {
            nArray2[n5] = n2 = n2 + sArray[n5 - 1] << 1;
            ++n5;
        }
        n5 = 0;
        while (n5 < nArray.length) {
            n3 = byArray[n5];
            if (n3 != 0) {
                nArray[n5] = nArray2[n3];
                int n6 = n3;
                nArray2[n6] = nArray2[n6] + 1;
            }
            ++n5;
        }
    }

    static void b(int[] nArray, byte[] byArray) {
        int n2 = 0;
        while (n2 < nArray.length) {
            int n3 = nArray[n2];
            int n4 = 0;
            int n5 = 0;
            while (n5 < byArray[n2]) {
                n4 = (n4 | n3 >>> n5 & 1) << 1;
                ++n5;
            }
            nArray[n2] = n4 >>> 1;
            ++n2;
        }
    }

    static void a(int[] nArray, byte[] byArray, int[] nArray2, byte[] byArray2) {
        int n2 = 0;
        while (n2 <= 143) {
            nArray[n2] = n2 + 48;
            byArray[n2] = 8;
            ++n2;
        }
        n2 = 144;
        while (n2 <= 255) {
            nArray[n2] = n2 + 256;
            byArray[n2] = 9;
            ++n2;
        }
        n2 = 256;
        while (n2 <= 279) {
            nArray[n2] = n2 - 256;
            byArray[n2] = 7;
            ++n2;
        }
        n2 = 280;
        while (n2 < 286) {
            nArray[n2] = n2 - 88;
            byArray[n2] = 8;
            ++n2;
        }
        ak.b(nArray, byArray);
        int n3 = 0;
        while (n3 < nArray2.length) {
            nArray2[n3] = n3;
            byArray2[n3] = 5;
            ++n3;
        }
        ak.b(nArray2, byArray2);
    }

    static void a(int[] nArray, byte[] byArray, int[] nArray2, short[] sArray) {
        int n2 = 0;
        while (n2 < sArray.length) {
            sArray[n2] = 0;
            ++n2;
        }
        int n3 = 1;
        int n4 = 0;
        while (n4 < nArray.length) {
            if (byArray[n4] != 0) {
                n2 = 0;
                short s2 = 0;
                while (s2 < byArray[n4]) {
                    if (sArray[n2 << 1] == 0) {
                        int n5 = n3;
                        n3 = (short)(n5 + 1);
                        sArray[n2 << 1] = n5;
                        int n6 = n3;
                        n3 = (short)(n6 + 1);
                        sArray[(n2 << 1) + 1] = n6;
                    }
                    n2 = sArray[(n2 << 1) + (nArray[n4] >>> s2 & 1)];
                    s2 = (short)(s2 + 1);
                }
                if (n2 < 0) {
                    throw new IOException();
                }
                sArray[n2 << 1] = -1;
                sArray[(n2 << 1) + 1] = (short)nArray2[n4];
            }
            n4 = (short)(n4 + 1);
        }
    }

    static int a(long[] lArray, short[] sArray) {
        if (lArray[1] < 15L) {
            throw new IOException();
        }
        int n2 = 0;
        while (sArray[n2 << 1] != -1) {
            n2 = sArray[(n2 << 1) + (int)(lArray[0] & 1L)];
            lArray[0] = lArray[0] >>> 1;
            lArray[1] = lArray[1] - 1L;
            if (n2 != 0) continue;
            throw new IOException();
        }
        return sArray[(n2 << 1) + 1];
    }

    static void a(InputStream inputStream) {
        if (inputStream.read() != 31 || inputStream.read() != 139 || inputStream.read() != 8) {
            throw new IOException("\u975e\u6cd5\u7684gzip\u683c\u5f0f\u3002");
        }
        int n2 = inputStream.read();
        inputStream.skip(6L);
        if ((n2 & 4) == 4) {
            inputStream.skip(inputStream.read() | inputStream.read() << 8);
        }
        if ((n2 & 8) == 8) {
            while (inputStream.read() != 0) {
            }
        }
        if ((n2 & 0x10) == 16) {
            while (inputStream.read() != 0) {
            }
        }
        if ((n2 & 2) == 2) {
            inputStream.skip(2L);
        }
    }
}

