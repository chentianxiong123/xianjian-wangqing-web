/*
 * Decompiled with CFR 0.152.
 */
import java.io.IOException;
import java.io.InputStream;

public final class ai
extends InputStream {
    private static final int[] a;
    private static final int[] b;
    private InputStream c;
    private boolean d;
    private boolean e;
    private boolean f;
    private byte g;
    private int h;
    private int i;
    private int j;
    private int k;
    private int l;
    private int m;
    private int n;
    private long o;
    private long[] p;
    private short[] q;
    private short[] r;
    private byte[] s;
    private byte[] t;
    private byte[] u;

    static {
        int[] nArray = new int[19];
        nArray[0] = 16;
        nArray[1] = 17;
        nArray[2] = 18;
        nArray[4] = 8;
        nArray[5] = 7;
        nArray[6] = 9;
        nArray[7] = 6;
        nArray[8] = 10;
        nArray[9] = 5;
        nArray[10] = 11;
        nArray[11] = 4;
        nArray[12] = 12;
        nArray[13] = 3;
        nArray[14] = 13;
        nArray[15] = 2;
        nArray[16] = 14;
        nArray[17] = 1;
        nArray[18] = 15;
        a = nArray;
        int[] nArray2 = new int[19];
        nArray2[1] = 1;
        nArray2[2] = 2;
        nArray2[3] = 3;
        nArray2[4] = 4;
        nArray2[5] = 5;
        nArray2[6] = 6;
        nArray2[7] = 7;
        nArray2[8] = 8;
        nArray2[9] = 9;
        nArray2[10] = 10;
        nArray2[11] = 11;
        nArray2[12] = 12;
        nArray2[13] = 13;
        nArray2[14] = 14;
        nArray2[15] = 15;
        nArray2[16] = 16;
        nArray2[17] = 17;
        nArray2[18] = 18;
        b = nArray2;
    }

    public ai(InputStream inputStream) {
        this.c = inputStream;
        this.g = 0;
        this.p = new long[2];
        this.q = new short[1152];
        this.r = new short[128];
        this.s = new byte[32768];
        this.t = new byte[1324];
        this.u = new byte[8];
        ak.a(inputStream);
    }

    public final void close() {
        this.c.close();
        this.p = null;
        this.q = null;
        this.r = null;
        this.s = null;
        this.t = null;
        this.u = null;
    }

    public final int available() {
        if (this.j - this.l < this.t.length - 300) {
            this.a();
        }
        return this.j - this.l;
    }

    public final long skip(long l2) {
        long l3 = l2;
        while (l3 > 0L) {
            if (this.read() < 0) break;
            --l3;
        }
        return l2 - l3;
    }

    public final int read() {
        if (this.j - this.l == 0) {
            this.a();
        }
        if (this.j - this.l == 0 || this.d) {
            return -1;
        }
        return this.t[this.l++] + 256 & 0xFF;
    }

    public final int read(byte[] byArray) {
        return this.read(byArray, 0, byArray.length);
    }

    public final int read(byte[] byArray, int n2, int n3) {
        if (byArray == null) {
            throw new NullPointerException();
        }
        if (n2 < 0 || n2 > byArray.length || n3 < 0 || n2 + n3 > byArray.length || n2 + n3 < 0) {
            throw new IndexOutOfBoundsException();
        }
        if (n3 == 0) {
            return 0;
        }
        int n4 = this.read();
        if (n4 == -1) {
            return -1;
        }
        byArray[n2] = (byte)n4;
        int n5 = 1;
        try {
            while (n5 < n3) {
                n4 = this.read();
                if (n4 != -1) {
                    if (byArray != null) {
                        byArray[n2 + n5] = (byte)n4;
                    }
                    ++n5;
                    continue;
                }
                break;
            }
        }
        catch (IOException iOException) {}
        return n5;
    }

    private void a(int n2, int n3, byte[] byArray, int n4) {
        if (n2 + n3 < this.s.length) {
            System.arraycopy(this.s, n2, byArray, n4 + 0, n3);
            return;
        }
        System.arraycopy(this.s, n2, byArray, n4 + 0, this.s.length - n2);
        System.arraycopy(this.s, 0, byArray, this.s.length - n2 + n4, n3 - (this.s.length - n2));
    }

    private void b(int n2, int n3, byte[] byArray, int n4) {
        if (n3 + n2 < this.s.length) {
            System.arraycopy(byArray, n4, this.s, n2, n3);
            return;
        }
        System.arraycopy(byArray, n4, this.s, n2, this.s.length - n2);
        System.arraycopy(byArray, n4 + (this.s.length - n2), this.s, 0, n3 - (this.s.length - n2));
    }

    /*
     * Unable to fully structure code
     */
    private void a() {
        var5_1 = this.s;
        var6_2 = this.t;
        System.arraycopy(this.t, this.l, var6_2, 0, this.j - this.l);
        this.j -= this.l;
        this.l = 0;
        this.k = this.j;
        if (this.m == 0 && this.p[1] < 15L) {
            this.b();
        }
        while (var6_2.length - this.j > 300 && (this.p[1] > 0L || this.m > 0) && this.g != 3) {
            block40: {
                block42: {
                    block43: {
                        block41: {
                            if (this.g != 0) break block40;
                            var1_3 = this;
                            var2_7 = new byte[286];
                            var3_9 = new byte[30];
                            var4_11 = new byte[19];
                            var7_15 = new int[30];
                            var8_18 = new int[30];
                            var9_19 = new int[286];
                            var10_20 = new int[286];
                            var11_21 = new int[19];
                            var12_23 = new short[76];
                            var1_3.e = var1_3.a(1L) == 1;
                            var1_3.h = var1_3.a(2L);
                            if (var1_3.h == 3) {
                                throw new IOException();
                            }
                            if (var1_3.h != 1) break block41;
                            ak.a(var9_19, var2_7, var7_15, var3_9);
                            var16_27 = 0;
                            while (var16_27 < 286) {
                                var10_20[var16_27] = var16_27;
                                ++var16_27;
                            }
                            var16_27 = 0;
                            while (var16_27 < 30) {
                                var8_18[var16_27] = var16_27;
                                ++var16_27;
                            }
                            ak.a(var9_19, var2_7, var10_20, var1_3.q);
                            ak.a(var7_15, var3_9, var8_18, var1_3.r);
                            break block42;
                        }
                        if (var1_3.h != 2) break block43;
                        var13_24 = var1_3.a(5L);
                        var14_25 = var1_3.a(5L);
                        var15_26 = var1_3.a(4L);
                        var16_27 = 0;
                        while (var16_27 < var15_26 + 4) {
                            var4_11[ai.a[var16_27]] = (byte)var1_3.a(3L);
                            ++var16_27;
                        }
                        ak.a(var11_21, var4_11);
                        ak.b(var11_21, var4_11);
                        ak.a(var11_21, var4_11, ai.b, var12_23);
                        var16_27 = 0;
                        while (var16_27 < var2_7.length) {
                            var2_7[var16_27] = 0;
                            ++var16_27;
                        }
                        var16_27 = 0;
                        while (var16_27 < var3_9.length) {
                            var3_9[var16_27] = 0;
                            ++var16_27;
                        }
                        var16_27 = 0;
                        var11_22 = 0;
                        while (var11_22 < var13_24 + 257 + var14_25 + 1) {
                            if (var1_3.p[1] < 15L) {
                                var1_3.b();
                            }
                            if ((var4_12 = ak.a(var1_3.p, var12_23)) < 16) {
                                var16_27 = (byte)var4_12;
                                var4_12 = 1;
                            } else if (var4_12 == 16) {
                                var4_12 = var1_3.a(2L) + 3;
                            } else if (var4_12 == 17) {
                                var16_27 = 0;
                                var4_12 = var1_3.a(3L) + 3;
                            } else if (var4_12 == 18) {
                                var16_27 = 0;
                                var4_12 = var1_3.a(7L) + 11;
                            }
                            var15_26 = 0;
                            while (var15_26 < var4_12) {
                                if (var11_22 < var13_24 + 257) {
                                    var2_7[var11_22] = var16_27;
                                } else {
                                    var3_9[var11_22 - (var13_24 + 257)] = var16_27;
                                }
                                ++var15_26;
                                ++var11_22;
                            }
                        }
                        ak.a(var9_19, var2_7);
                        var11_22 = 0;
                        while (var11_22 < var10_20.length) {
                            var10_20[var11_22] = var11_22;
                            ++var11_22;
                        }
                        ak.b(var9_19, var2_7);
                        ak.a(var9_19, var2_7, var10_20, var1_3.q);
                        var11_22 = 0;
                        while (var11_22 < var7_15.length) {
                            var8_18[var11_22] = var11_22;
                            ++var11_22;
                        }
                        ak.a(var7_15, var3_9);
                        ak.b(var7_15, var3_9);
                        ak.a(var7_15, var3_9, var8_18, var1_3.r);
                        break block42;
                    }
                    var1_3.a(var1_3.p[1] & 7L);
                    var1_3.m = var1_3.a(8L) | var1_3.a(8L) << 8;
                    if (var1_3.p[1] < 15L) {
                        var1_3.b();
                    }
                    if (var1_3.m + (var1_3.a(8L) | var1_3.a(8L) << 8) == 65535) ** GOTO lbl123
                    throw new IOException();
lbl-1000:
                    // 1 sources

                    {
                        var4_13 = var1_3.a(8L);
                        var1_3.s[var1_3.i] = (byte)var4_13;
                        var1_3.i = var1_3.i + 1 & 32767;
                        var1_3.t[var1_3.j] = (byte)var4_13;
                        ++var1_3.j;
                        --var1_3.m;
lbl123:
                        // 2 sources

                        ** while (var1_3.p[1] != 0L && var1_3.m > 0)
                    }
                }
                var1_3.g = 1;
            }
            if (this.g == 1) {
                if (this.h == 0) {
                    if (this.m > 0) {
                        var1_4 = var6_2.length - this.j > this.m ? this.m : var6_2.length - this.j;
                        var1_4 = this.c.read(var6_2, this.j, var1_4);
                        this.b(this.i, var1_4, var6_2, this.j);
                        this.j += var1_4;
                        this.i = this.i + var1_4 & 32767;
                        this.m -= var1_4;
                    } else {
                        this.g = this.e != false ? (byte)2 : 0;
                        if (this.p[1] < 15L) {
                            this.b();
                        }
                    }
                } else {
                    if (this.p[1] < 15L) {
                        this.b();
                    }
                    if ((var1_5 = ak.a(this.p, this.q)) < 256) {
                        var5_1[this.i] = (byte)var1_5;
                        this.i = this.i + 1 & 32767;
                        var6_2[this.j] = (byte)var1_5;
                        ++this.j;
                    } else if (var1_5 != 256) {
                        if (var1_5 > 285) {
                            throw new IOException();
                        }
                        var2_8 = this.a(ak.a[var1_5 - 257 << 1]) + ak.a[(var1_5 - 257 << 1) + 1];
                        if (this.p[1] < 15L) {
                            this.b();
                        }
                        var4_14 += (var4_14 = this.i - (var3_10 = this.a(ak.b[(var1_5 = ak.a(this.p, this.r)) << 1]) + ak.b[(var1_5 << 1) + 1])) < 0 ? var5_1.length : 0;
                        var1_5 = var2_8 / var3_10;
                        var2_8 -= var3_10 * var1_5;
                        var7_16 = 0;
                        while (var7_16 < var1_5) {
                            this.a(var4_14, var3_10, var6_2, this.j);
                            this.b(this.i, var3_10, var6_2, this.j);
                            this.j += var3_10;
                            this.i = this.i + var3_10 & 32767;
                            ++var7_16;
                        }
                        this.a(var4_14, var2_8, var6_2, this.j);
                        this.b(this.i, var2_8, var6_2, this.j);
                        this.j += var2_8;
                        this.i = this.i + var2_8 & 32767;
                    } else {
                        this.g = this.e != false ? (byte)2 : 0;
                    }
                    if (this.p[1] < 15L) {
                        this.b();
                    }
                }
            }
            if (this.g != 2) continue;
            this.g = (byte)3;
            this.o = this.o + (long)this.j - (long)this.k;
            this.n = m.a(var6_2, this.n, this.k, this.j - this.k);
            this.a(this.p[1] & 7L);
            var7_17 = this.a(8L) | this.a(8L) << 8 | this.a(8L) << 16 | this.a(8L) << 24;
            var1_6 = this.a(8L) | this.a(8L) << 8 | this.a(8L) << 16 | this.a(8L) << 24;
            this.f = (long)var1_6 == this.o;
            this.f &= this.n == var7_17;
            if (this.f) continue;
            throw new IOException();
        }
        if (this.g != 3) {
            this.o = this.o + (long)this.j - (long)this.k;
            this.n = m.a(var6_2, this.n, this.k, this.j - this.k);
        }
    }

    private int a(long l2) {
        if (l2 == 0L) {
            return 0;
        }
        if (this.p[1] < l2) {
            this.b();
        }
        int n2 = (int)(this.p[0] & (long)((1 << (int)l2) - 1));
        this.p[0] = this.p[0] >>> (int)l2;
        this.p[1] = this.p[1] - l2;
        return n2;
    }

    private void b() {
        if (!this.d) {
            int n2 = (int)(7L - this.p[1] / 8L);
            if ((n2 = this.c.read(this.u, 0, n2)) == -1) {
                this.d = true;
            }
            int n3 = 0;
            while (n3 < n2) {
                this.p[0] = this.p[0] & (255L << (int)this.p[1] ^ 0xFFFFFFFFFFFFFFFFL);
                this.p[0] = this.u[n3] < 0 ? this.p[0] | (long)(this.u[n3] + 256) << (int)this.p[1] : this.p[0] | (long)this.u[n3] << (int)this.p[1];
                this.p[1] = this.p[1] + 8L;
                ++n3;
            }
        }
    }
}

