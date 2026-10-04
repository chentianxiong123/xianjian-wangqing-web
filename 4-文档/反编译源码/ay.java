/*
 * Decompiled with CFR 0.152.
 */
public class ay
extends q {
    private l[] a = new l[20];
    private l[] b = new l[20];

    public ay(at at2, int n2, int n3) {
        super(at2, n2, n3);
    }

    public final synchronized boolean a(ao object, int n2, int n3, int n4, int n5, boolean n6, boolean n7, boolean n8) {
        int n9 = n8;
        n8 = n7;
        n7 = n6;
        n6 = n5;
        n5 = n4;
        n4 = n3;
        n3 = n2;
        ao ao2 = object;
        object = this;
        if (n4 > 0) {
            l[] lArray;
            aj aj2 = ((q)object).d();
            if (aj2 == null) {
                n9 = 1;
            }
            if (n5 < 0) {
                n5 = 0;
            }
            if (n6 < 0) {
                n6 = 0;
            }
            if ((lArray = ((q)object).e()) != null) {
                boolean bl2;
                bn bn2;
                int n10;
                int n11;
                int n12;
                int n13;
                int n14;
                int n15;
                int n16;
                l l2;
                int n17;
                int n18;
                int n19;
                int n20;
                int n21;
                int n22;
                be be2 = lArray.b();
                int n23 = ((bn)object).J();
                int n24 = ((bn)object).K();
                int n25 = n23;
                int n26 = n24;
                switch (n3) {
                    case 1: {
                        n26 = n24 - n4;
                        break;
                    }
                    case 2: {
                        n26 = n24 + n4;
                        break;
                    }
                    case 4: {
                        n25 = n23 - n4;
                        break;
                    }
                    case 8: {
                        n25 = n23 + n4;
                        break;
                    }
                    default: {
                        return false;
                    }
                }
                if (ao2 == null || be2 == null || be2.b() == 0 || n7 != 0 && n8 != 0 && n9 != 0) {
                    ((bn)object).a_(n25);
                    ((bn)object).b_(n26);
                    return true;
                }
                int n27 = 0;
                if (n7 == 0 || n8 == 0) {
                    n22 = Math.min(n25, n23);
                    n21 = Math.min(n26, n24);
                    n20 = Math.abs(n25 - n23);
                    n19 = Math.abs(n26 - n24);
                    n18 = 0;
                    n17 = be2.b();
                    while (n18 < n17) {
                        int n28;
                        boolean bl3;
                        l2 = be2.a(n18);
                        n16 = n22 + l2.a;
                        n15 = n21 + l2.b;
                        n14 = l2.c + n20;
                        n13 = l2.d + n19;
                        if (n7 == 0) {
                            n12 = 0;
                            n11 = ao2.f();
                            while (n12 < n11) {
                                lArray = ao2.d(n12);
                                if (j.a(n16, n14, lArray.a, lArray.c) && j.a(n15, n13, lArray.b, lArray.d)) {
                                    bl3 = true;
                                    switch (n3) {
                                        case 1: {
                                            n28 = lArray.b + lArray.d + 1 - l2.b;
                                            if (n28 > n26) {
                                                n26 = n28;
                                                n27 = 0;
                                                break;
                                            }
                                            if (n28 == n26) break;
                                            bl3 = false;
                                            break;
                                        }
                                        case 2: {
                                            n28 = lArray.b - 1 - l2.d - l2.b;
                                            if (n28 < n26) {
                                                n26 = n28;
                                                n27 = 0;
                                                break;
                                            }
                                            if (n28 == n26) break;
                                            bl3 = false;
                                            break;
                                        }
                                        case 4: {
                                            n28 = lArray.a + lArray.c + 1 - l2.a;
                                            if (n28 > n25) {
                                                n25 = n28;
                                                n27 = 0;
                                                break;
                                            }
                                            if (n28 == n25) break;
                                            bl3 = false;
                                            break;
                                        }
                                        case 8: {
                                            n28 = lArray.a - 1 - l2.c - l2.a;
                                            if (n28 < n25) {
                                                n25 = n28;
                                                n27 = 0;
                                                break;
                                            }
                                            if (n28 == n25) break;
                                            bl3 = false;
                                        }
                                    }
                                    if (bl3 && n9 == 0) {
                                        lArray.f = ao2;
                                        ((ay)object).a[n27++] = lArray;
                                        if (n27 == ((ay)object).a.length) {
                                            l[] lArray2 = new l[((ay)object).a.length + 50];
                                            n10 = 0;
                                            while (n10 < ((ay)object).a.length) {
                                                lArray2[n10] = ((ay)object).a[n10];
                                                ++n10;
                                            }
                                            ((ay)object).a = lArray2;
                                        }
                                    }
                                }
                                ++n12;
                            }
                        }
                        if (n8 == 0) {
                            n12 = 0;
                            n11 = ao2.d();
                            while (n12 < n11) {
                                Object object2;
                                bn2 = ao2.b(n12);
                                if (bn2 != object && bn2 instanceof q && (lArray = ((q)(object2 = (q)bn2)).e()) != null && (object2 = lArray.b()) != null) {
                                    int n29 = 0;
                                    n10 = ((be)object2).b();
                                    while (n29 < n10) {
                                        lArray = ((be)object2).a(n29);
                                        if (j.a(n16, n14, bn2.J() + lArray.a, lArray.c) && j.a(n15, n13, bn2.K() + lArray.b, lArray.d)) {
                                            bl3 = true;
                                            switch (n3) {
                                                case 1: {
                                                    n28 = bn2.K() + lArray.b + lArray.d + 1 - l2.b;
                                                    if (n28 > n26) {
                                                        n26 = n28;
                                                        n27 = 0;
                                                        break;
                                                    }
                                                    if (n28 == n26) break;
                                                    bl3 = false;
                                                    break;
                                                }
                                                case 2: {
                                                    n28 = bn2.K() + lArray.b - 1 - l2.d - l2.b;
                                                    if (n28 < n26) {
                                                        n26 = n28;
                                                        n27 = 0;
                                                        break;
                                                    }
                                                    if (n28 == n26) break;
                                                    bl3 = false;
                                                    break;
                                                }
                                                case 4: {
                                                    n28 = bn2.J() + lArray.a + lArray.c + 1 - l2.a;
                                                    if (n28 > n25) {
                                                        n25 = n28;
                                                        n27 = 0;
                                                        break;
                                                    }
                                                    if (n28 == n25) break;
                                                    bl3 = false;
                                                    break;
                                                }
                                                case 8: {
                                                    n28 = bn2.J() + lArray.a - 1 - l2.c - l2.a;
                                                    if (n28 < n25) {
                                                        n25 = n28;
                                                        n27 = 0;
                                                        break;
                                                    }
                                                    if (n28 == n25) break;
                                                    bl3 = false;
                                                }
                                            }
                                            if (bl3 && n9 == 0) {
                                                lArray.f = bn2;
                                                ((ay)object).a[n27++] = lArray;
                                                if (n27 == ((ay)object).a.length) {
                                                    lArray = new l[((ay)object).a.length + 50];
                                                    n28 = 0;
                                                    while (n28 < ((ay)object).a.length) {
                                                        lArray[n28] = ((ay)object).a[n28];
                                                        ++n28;
                                                    }
                                                    ((ay)object).a = lArray;
                                                }
                                            }
                                        }
                                        ++n29;
                                    }
                                }
                                ++n12;
                            }
                        }
                        ++n18;
                    }
                }
                if (!((bl2 = n23 != n25 || n24 != n26) || n5 <= 0 || n7 != 0 && n8 != 0)) {
                    switch (n3) {
                        case 1: 
                        case 2: {
                            int n30 = ay.a((ay)object, ao2, be2, n3, 4, n5, n7 != 0, n8 != 0, n23, n24);
                            n5 = ay.a((ay)object, ao2, be2, n3, 8, n5, n7 != 0, n8 != 0, n23, n24);
                            if (n30 > 0) {
                                if (n5 > 0) {
                                    if (n30 < n5) {
                                        n25 -= Math.min(n6, n30);
                                        break;
                                    }
                                    n25 += Math.min(n6, n5);
                                    break;
                                }
                                n25 -= Math.min(n6, n30);
                                break;
                            }
                            if (n5 <= 0) break;
                            n25 += Math.min(n6, n5);
                            break;
                        }
                        case 4: 
                        case 8: {
                            int n31 = ay.a((ay)object, ao2, be2, n3, 1, n5, n7 != 0, n8 != 0, n23, n24);
                            n5 = ay.a((ay)object, ao2, be2, n3, 2, n5, n7 != 0, n8 != 0, n23, n24);
                            if (n31 > 0) {
                                if (n5 > 0) {
                                    if (n31 < n5) {
                                        n26 -= Math.min(n6, n31);
                                        break;
                                    }
                                    n26 += Math.min(n6, n5);
                                    break;
                                }
                                n26 -= Math.min(n6, n31);
                                break;
                            }
                            if (n5 <= 0) break;
                            n26 += Math.min(n6, n5);
                        }
                    }
                }
                ((bn)object).a_(n25);
                ((bn)object).b_(n26);
                if (n9 == 0) {
                    if (n7 == 0 || n8 == 0) {
                        if (bl2 || n23 == n25 && n24 == n26) {
                            n18 = 0;
                            while (n18 < n27) {
                                if (((ay)object).a[n18].e != null) {
                                    aj2.a(((ay)object).a[n18].e, ((ay)object).a[n18].f);
                                }
                                ++n18;
                            }
                        } else {
                            switch (n3) {
                                case 1: {
                                    --n26;
                                    break;
                                }
                                case 2: {
                                    ++n26;
                                    break;
                                }
                                case 4: {
                                    --n25;
                                    break;
                                }
                                case 8: {
                                    ++n25;
                                    break;
                                }
                                default: {
                                    return false;
                                }
                            }
                            n22 = Math.min(n25, n23);
                            n21 = Math.min(n26, n24);
                            n20 = Math.abs(n25 - n23);
                            n19 = Math.abs(n26 - n24);
                            n18 = 0;
                            n17 = be2.b();
                            while (n18 < n17) {
                                l2 = be2.a(n18);
                                n16 = n22 + l2.a;
                                n15 = n21 + l2.b;
                                n14 = l2.c + n20;
                                n13 = l2.d + n19;
                                if (n7 == 0) {
                                    n12 = 0;
                                    n11 = ao2.f();
                                    while (n12 < n11) {
                                        l l3 = ao2.d(n12);
                                        if (j.a(n16, n14, l3.a, l3.c) && j.a(n15, n13, l3.b, l3.d) && l3.e != null) {
                                            aj2.a(l3.e, ao2);
                                        }
                                        ++n12;
                                    }
                                }
                                if (n8 == 0) {
                                    n12 = 0;
                                    n11 = ao2.d();
                                    while (n12 < n11) {
                                        Object object3;
                                        Object object4;
                                        bn2 = ao2.b(n12);
                                        if (bn2 != object && bn2 instanceof q && (object4 = ((q)(object3 = (q)bn2)).e()) != null && (object3 = ((at)object4).b()) != null) {
                                            int n32 = 0;
                                            n10 = ((be)object3).b();
                                            while (n32 < n10) {
                                                object4 = ((be)object3).a(n32);
                                                if (j.a(n16, n14, bn2.J() + ((l)object4).a, ((l)object4).c) && j.a(n15, n13, bn2.K() + ((l)object4).b, ((l)object4).d) && ((l)object4).e != null) {
                                                    aj2.a(((l)object4).e, bn2);
                                                }
                                                ++n32;
                                            }
                                        }
                                        ++n12;
                                    }
                                }
                                ++n18;
                            }
                        }
                    }
                    n22 = Math.min(n25, n23);
                    n21 = Math.min(n26, n24);
                    n20 = Math.abs(n25 - n23);
                    n19 = Math.abs(n26 - n24);
                    n18 = 0;
                    n17 = be2.b();
                    while (n18 < n17) {
                        l2 = be2.a(n18);
                        n16 = n22 + l2.a;
                        n15 = n21 + l2.b;
                        n14 = l2.c + n20;
                        n13 = l2.d + n19;
                        n12 = 0;
                        n11 = ao2.e();
                        while (n12 < n11) {
                            l l4 = ao2.c(n12);
                            if (j.a(n16, n14, l4.a, l4.c) && j.a(n15, n13, l4.b, l4.d) && l4.e != null) {
                                aj2.a(l4.e, ao2);
                            }
                            ++n12;
                        }
                        n12 = 0;
                        n11 = ao2.d();
                        while (n12 < n11) {
                            Object object5;
                            Object object6;
                            bn2 = ao2.b(n12);
                            if (bn2 != object && bn2 instanceof q && (object6 = ((q)(object5 = (q)bn2)).e()) != null && (object5 = ((at)object6).b()) != null) {
                                int n33 = 0;
                                n10 = ((be)object5).c();
                                while (n33 < n10) {
                                    object6 = ((be)object5).b(n33);
                                    if (j.a(n16, n14, bn2.J() + ((l)object6).a, ((l)object6).c) && j.a(n15, n13, bn2.K() + ((l)object6).b, ((l)object6).d) && ((l)object6).e != null) {
                                        aj2.a(((l)object6).e, bn2);
                                    }
                                    ++n33;
                                }
                            }
                            ++n12;
                        }
                        ++n18;
                    }
                }
                n18 = 0;
                while (n18 < ((ay)object).a.length) {
                    if (((ay)object).a[n18] != null) {
                        ((ay)object).a[n18].f = null;
                        ((ay)object).a[n18] = null;
                    }
                    ++n18;
                }
                n18 = 0;
                while (n18 < ((ay)object).b.length) {
                    if (((ay)object).b[n18] != null) {
                        ((ay)object).b[n18].f = null;
                        ((ay)object).b[n18] = null;
                    }
                    ++n18;
                }
                if (n23 != ((bn)object).J() || n24 != ((bn)object).K()) {
                    return true;
                }
            }
        }
        return false;
    }

    private static int a(ay ay2, ao ao2, be be2, int n2, int n3, int n4, boolean bl2, boolean bl3, int n5, int n6) {
        int n7;
        int n8;
        Object object;
        int n9 = 0;
        int n10 = 0;
        int n11 = 0;
        int n12 = 0;
        int n13 = -1;
        int n14 = 0;
        switch (n2) {
            case 1: {
                n10 = n6 - 1;
                n12 = 1;
                break;
            }
            case 2: {
                n10 = n6;
                n12 = 1;
                break;
            }
            case 4: {
                n9 = n5 - 1;
                n11 = 1;
                break;
            }
            case 8: {
                n9 = n5;
                n11 = 1;
                break;
            }
            default: {
                return 0;
            }
        }
        switch (n3) {
            case 1: {
                n10 = n6 - n4;
                n12 = n4;
                break;
            }
            case 2: {
                n10 = n6;
                n12 = n4;
                break;
            }
            case 4: {
                n9 = n5 - n4;
                n11 = n4;
                break;
            }
            case 8: {
                n9 = n5;
                n11 = n4;
                break;
            }
            default: {
                return 0;
            }
        }
        int n15 = 0;
        int n16 = be2.b();
        while (n15 < n16) {
            int n17;
            l[] lArray;
            object = be2.a(n15);
            int n18 = n9 + ((l)object).a;
            int n19 = n10 + ((l)object).b;
            int n20 = ((l)object).c + n11;
            int n21 = ((l)object).d + n12;
            if (!bl2) {
                n8 = 0;
                n7 = ao2.f();
                while (n8 < n7) {
                    lArray = ao2.d(n8);
                    if (j.a(n18, n20, lArray.a, lArray.c) && j.a(n19, n21, lArray.b, lArray.d)) {
                        ay2.b[n14++] = lArray;
                        if (n14 == ay2.b.length) {
                            l[] lArray2 = new l[ay2.b.length + 30];
                            n17 = 0;
                            while (n17 < ay2.b.length) {
                                lArray2[n17] = ay2.b[n17];
                                ++n17;
                            }
                            ay2.b = lArray2;
                        }
                    }
                    ++n8;
                }
            }
            if (!bl3) {
                n8 = 0;
                n7 = ao2.d();
                while (n8 < n7) {
                    bn bn2 = ao2.b(n8);
                    if (bn2 != ay2 && bn2 instanceof q) {
                        object = (q)bn2;
                        if ((object = ((q)object).e()) != null && (object = ((at)object).b()) != null) {
                            int n22 = 0;
                            n17 = ((be)object).b();
                            while (n22 < n17) {
                                lArray = ((be)object).a(n22);
                                if (j.a(n18, n20, bn2.J() + lArray.a, lArray.c) && j.a(n19, n21, bn2.K() + lArray.b, lArray.d)) {
                                    lArray = new l(bn2.J() + lArray.a, bn2.K() + lArray.b, lArray.c, lArray.d, null);
                                    new l(bn2.J() + lArray.a, bn2.K() + lArray.b, lArray.c, lArray.d, null).f = bn2;
                                    ay2.b[n14++] = lArray;
                                    if (n14 == ay2.b.length) {
                                        lArray = new l[ay2.b.length + 30];
                                        int n23 = 0;
                                        while (n23 < ay2.b.length) {
                                            lArray[n23] = ay2.b[n23];
                                            ++n23;
                                        }
                                        ay2.b = lArray;
                                    }
                                }
                                ++n22;
                            }
                        }
                    }
                    ++n8;
                }
            }
            ++n15;
        }
        switch (n2) {
            case 1: {
                n10 = n6 - 1;
                n12 = n6;
                break;
            }
            case 2: {
                n10 = n6 + 1;
                n12 = n6;
                break;
            }
            case 4: {
                n9 = n5 - 1;
                n11 = n5;
                break;
            }
            case 8: {
                n9 = n5 + 1;
                n11 = n5;
            }
        }
        n15 = 1;
        while (n15 <= n4) {
            switch (n3) {
                case 1: {
                    n12 = n10 = n6 - n15;
                    break;
                }
                case 2: {
                    n12 = n10 = n6 + n15;
                    break;
                }
                case 4: {
                    n11 = n9 = n5 - n15;
                    break;
                }
                case 8: {
                    n11 = n9 = n5 + n15;
                }
            }
            boolean bl4 = false;
            n16 = 0;
            n8 = be2.b();
            while (n16 < n8) {
                object = be2.a(n16);
                n7 = 0;
                while (n7 < n14) {
                    if (j.a(n11 + ((l)object).a, ((l)object).c, ay2.b[n7].a, ay2.b[n7].c) && j.a(n12 + ((l)object).b, ((l)object).d, ay2.b[n7].b, ay2.b[n7].d)) {
                        return 0;
                    }
                    if (!bl4 && j.a(n9 + ((l)object).a, ((l)object).c, ay2.b[n7].a, ay2.b[n7].c) && j.a(n10 + ((l)object).b, ((l)object).d, ay2.b[n7].b, ay2.b[n7].d)) {
                        bl4 = true;
                        if (n13 == -1 && ay2.b[n7].f instanceof q && !((q)ay2.b[n7].f).f()) {
                            n13 = n15 - 1;
                        }
                    }
                    ++n7;
                }
                ++n16;
            }
            if (!bl4) {
                if (n13 != -1) {
                    return n13;
                }
                return n15;
            }
            ++n15;
        }
        return 0;
    }
}

