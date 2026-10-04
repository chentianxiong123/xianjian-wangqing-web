/*
 * Decompiled with CFR 0.152.
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class y {
    public final int a;
    public final int b;
    public final int c;
    public final int d;
    private final int[][] e;
    private final int[][] f;

    y(int[][] nArray, int[][] nArray2) {
        this.e = nArray;
        this.f = nArray2;
        if (nArray2.length > 0) {
            int n2 = Integer.MAX_VALUE;
            int n3 = Integer.MAX_VALUE;
            int n4 = Integer.MIN_VALUE;
            int n5 = Integer.MIN_VALUE;
            int n6 = 0;
            int n7 = nArray2.length;
            while (n6 < n7) {
                int n8;
                int n9;
                int[] nArray3 = nArray2[n6];
                int[] nArray4 = nArray[nArray3[0]];
                if (nArray3[1] < n2) {
                    n2 = nArray3[1];
                }
                if (nArray3[2] < n3) {
                    n3 = nArray3[2];
                }
                if ((nArray3[3] & 4) != 0 || (nArray3[3] & 0x10) != 0) {
                    n9 = nArray3[1] + nArray4[4];
                    n8 = nArray3[2] + nArray4[3];
                } else {
                    n9 = nArray3[1] + nArray4[3];
                    n8 = nArray3[2] + nArray4[4];
                }
                if (n9 > n4) {
                    n4 = n9;
                }
                if (n8 > n5) {
                    n5 = n8;
                }
                ++n6;
            }
            this.a = n2;
            this.b = n3;
            this.c = n4 - n2;
            this.d = n5 - n3;
            return;
        }
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
    }

    public final boolean a(int n2, int n3, int n4, int n5, int n6, int n7) {
        if (this.f.length > 0) {
            return j.a(n2 + this.a, this.c, n4, n6) && j.a(n3 + this.b, this.d, n5, n7);
        }
        return false;
    }

    public final void a(Graphics object, Image[] graphics, int n2, int n3, int n4, int n5, int n6, int n7, Object object2, n n8) {
        Graphics graphics2 = object;
        object = object2;
        int n9 = n7;
        n7 = n6;
        n6 = n5;
        n5 = n4;
        n4 = n3;
        n3 = n2;
        Graphics graphics3 = graphics;
        graphics = graphics2;
        object = this;
        if (object.a(n3, n4, n5, n6, n7, n9)) {
            int n10 = n5 + n7;
            int n11 = n6 + n9;
            int n12 = 0;
            while (n12 < object.f.length) {
                int n13;
                int n14;
                int[] nArray = object.f[n12];
                int[] nArray2 = object.e[nArray[0]];
                int n15 = nArray2[3];
                int n16 = nArray2[4];
                int n17 = nArray[3];
                int n18 = n3 + nArray[1];
                int n19 = n4 + nArray[2];
                if ((n17 & 4) != 0 || (n17 & 0x10) != 0) {
                    n14 = n16;
                    n13 = n15;
                } else {
                    n14 = n15;
                    n13 = n16;
                }
                if (j.a(n18, n14, n5, n7) && j.a(n19, n13, n6, n9)) {
                    int n20 = nArray2[1];
                    int n21 = nArray2[2];
                    n14 = n18 + n14;
                    n13 = n19 + n13;
                    int n22 = n18 < n5 ? n5 - n18 : 0;
                    int n23 = n19 < n6 ? n6 - n19 : 0;
                    n14 = n14 > n10 ? n14 - n10 : 0;
                    n13 = n13 > n11 ? n13 - n11 : 0;
                    n18 += n22;
                    n19 += n23;
                    switch (n17) {
                        case 0: {
                            n20 += n22;
                            n21 += n23;
                            n15 = n15 - n22 - n14;
                            n16 = n16 - n23 - n13;
                            break;
                        }
                        case 1: 
                        case 10: {
                            n20 += n14;
                            n21 += n23;
                            n15 = n15 - n22 - n14;
                            n16 = n16 - n23 - n13;
                            break;
                        }
                        case 2: 
                        case 9: {
                            n20 += n22;
                            n21 += n13;
                            n15 = n15 - n22 - n14;
                            n16 = n16 - n23 - n13;
                            break;
                        }
                        case 4: {
                            n20 += n23;
                            n21 += n14;
                            n15 = n15 - n23 - n13;
                            n16 = n16 - n22 - n14;
                            break;
                        }
                        case 3: 
                        case 8: {
                            n20 += n14;
                            n21 += n13;
                            n15 = n15 - n22 - n14;
                            n16 = n16 - n23 - n13;
                            break;
                        }
                        case 16: {
                            n20 += n13;
                            n21 += n22;
                            n15 = n15 - n23 - n13;
                            n16 = n16 - n22 - n14;
                            break;
                        }
                        case 5: 
                        case 18: {
                            n20 += n23;
                            n21 += n22;
                            n15 = n15 - n23 - n13;
                            n16 = n16 - n22 - n14;
                            break;
                        }
                        case 6: 
                        case 17: {
                            n20 += n13;
                            n21 += n14;
                            n15 = n15 - n23 - n13;
                            n16 = n16 - n22 - n14;
                            break;
                        }
                        default: {
                            n20 += n22;
                            n21 += n23;
                            n15 = n15 - n22 - n14;
                            n16 = n16 - n23 - n13;
                        }
                    }
                    if (n8 == null) {
                        ag.a(graphics, (Image)graphics3[nArray2[0]], n20, n21, n15, n16, n17, n18, n19, 20);
                    } else {
                        n8.a(graphics, (Image)graphics3[nArray2[0]], n20, n21, n15, n16, n18, n19, 20);
                    }
                }
                ++n12;
            }
        }
    }

    public final boolean equals(Object object) {
        block8: {
            Object object2 = object;
            object = this;
            if (object2 instanceof y) {
                int n2;
                object2 = (y)object2;
                if (((y)object).a != ((y)object2).a || ((y)object).b != ((y)object2).b || ((y)object).c != ((y)object2).c || ((y)object).d != ((y)object2).d || ((y)object).e.length != ((y)object2).e.length || ((y)object).f.length != ((y)object2).f.length) {
                    return false;
                }
                int n3 = 0;
                while (n3 < ((y)object).e.length) {
                    if (((y)object).e[n3].length != ((y)object2).e[n3].length) break block8;
                    n2 = 0;
                    while (n2 < ((y)object).e[n3].length) {
                        if (((y)object).e[n3][n2] == ((y)object2).e[n3][n2]) {
                            ++n2;
                            continue;
                        }
                        break block8;
                    }
                    ++n3;
                }
                n3 = 0;
                while (n3 < ((y)object).f.length) {
                    if (((y)object).f[n3].length != ((y)object2).f[n3].length) break block8;
                    n2 = 0;
                    while (n2 < ((y)object).f[n3].length) {
                        if (((y)object).f[n3][n2] == ((y)object2).f[n3][n2]) {
                            ++n2;
                            continue;
                        }
                        break block8;
                    }
                    ++n3;
                }
                return true;
            }
        }
        return false;
    }
}

