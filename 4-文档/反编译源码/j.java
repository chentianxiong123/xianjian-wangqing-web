/*
 * Decompiled with CFR 0.152.
 */
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.util.Random;
import java.util.Vector;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Image;

public final class j {
    private static final Random a = new Random();

    private j() {
    }

    public static String[] a(String string, int n2, Font font) {
        Vector<String> vector = new Vector<String>();
        if (font == null) {
            font = ag.a;
        }
        boolean bl2 = false;
        int n3 = string.length();
        int n4 = 0;
        int n5 = 0;
        while (n5 < n3) {
            int n6;
            block7: {
                String string2;
                block6: {
                    do {
                        if (string.charAt(n5 + n4) != '\n') continue;
                        bl2 = true;
                        break;
                    } while (++n4 + n5 < n3 && font.substringWidth(string, n5, n4 + 1) < n2);
                    n6 = n3 - n5 > n4 ? n5 + n4 : n3;
                    string2 = string.substring(n5, n6);
                    if (!bl2) break block6;
                    bl2 = false;
                    ++n6;
                    if (string2.length() == 0) break block7;
                }
                vector.addElement(string2);
            }
            n5 = n6;
            n4 = 0;
        }
        Object[] objectArray = new String[vector.size()];
        vector.copyInto(objectArray);
        return objectArray;
    }

    public static String[] a(String string, String objectArray) {
        if (objectArray.length() == 0) {
            objectArray = new String[string.length()];
            int n2 = 0;
            while (n2 < objectArray.length) {
                objectArray[n2] = String.valueOf(string.charAt(n2));
                ++n2;
            }
        } else {
            Vector<String> vector = new Vector<String>();
            int n3 = 0;
            while (true) {
                int n4;
                if ((n4 = string.indexOf((String)objectArray, n3)) == -1) break;
                vector.addElement(string.substring(n3, n4));
                n3 = n4 + objectArray.length();
            }
            vector.addElement(string.substring(n3));
            int n5 = vector.size() - 1;
            while (n5 >= 0) {
                if (((String)vector.elementAt(n5)).length() > 0) {
                    vector.setSize(n5 + 1);
                    objectArray = new String[vector.size()];
                    vector.copyInto(objectArray);
                    return objectArray;
                }
                --n5;
            }
            objectArray = new String[]{};
        }
        return objectArray;
    }

    public static String a(String string, String string2, String string3) {
        if (string2.length() == 0) {
            return string;
        }
        StringBuffer stringBuffer = new StringBuffer(string.length());
        int n2 = 0;
        while (true) {
            int n3;
            if ((n3 = string.indexOf(string2, n2)) == -1) break;
            stringBuffer.append(string.substring(n2, n3));
            stringBuffer.append(string3);
            n2 = n3 + string2.length();
        }
        stringBuffer.append(string.substring(n2));
        return stringBuffer.toString();
    }

    public static int a(int n2) {
        if (n2 == 0 || n2 == 1) {
            return n2;
        }
        long l2 = n2 * 100;
        long l3 = l2 >> 1;
        while (l3 * l3 - l2 > 1L) {
            l3 = l3 + l2 / l3 >> 1;
        }
        return (int)(l3 % 10L < 5L ? l3 / 10L : l3 / 10L + 1L);
    }

    public static boolean a(int n2, int n3, int n4, int n5) {
        return n2 <= n4 ? n4 <= n2 + n3 : n2 <= n4 + n5;
    }

    public static boolean a(int n2, int n3, int n4, int n5, int n6, int n7) {
        return n2 >= n4 && n2 <= n4 + n6 && n3 >= n5 && n3 <= n5 + n7;
    }

    public static boolean a(int n2, int n3, int n4, int n5, int n6) {
        return (n2 -= n4) * n2 + (n3 -= n5) * n3 <= n6 * n6;
    }

    public static boolean a(int n2, int n3, int n4, int n5, int n6, int n7, int n8, int n9) {
        return (n2 = j.b(n2, n3, 0, 0, 0, n7) + j.b(n2, n3, 0, 0, n8, 0) + j.b(n2, n3, 0, n7, n8, 0)) > 0 && j.b(0, 0, 0, n7, n8, 0) == n2;
    }

    public static int a(int n2, int n3) {
        return j.a(n2, n3, a);
    }

    public static int a(int n2, int n3, Random random) {
        if (n3 < n2) {
            throw new IllegalArgumentException();
        }
        return n3 - Math.abs(random.nextInt()) % (n3 - n2 + 1);
    }

    public static boolean b(int n2, int n3) {
        return j.b(n2, n3, a);
    }

    public static boolean b(int n2, int n3, Random random) {
        return n2 * n3 >= 0 && Math.abs(random.nextInt()) % n3 < Math.abs(n2);
    }

    public static int a(long l2) {
        long l3 = 10L;
        int n2 = 1;
        while (n2 < 19) {
            if (l2 < l3) {
                return n2;
            }
            l3 *= 10L;
            ++n2;
        }
        return 19;
    }

    public static long a(String string) {
        int n2 = string.length();
        long l2 = 0L;
        if (n2 < 3 || n2 > 18 || !string.startsWith("0x") && !string.startsWith("0X")) {
            throw new IllegalArgumentException();
        }
        --n2;
        int n3 = 0;
        while (n2 > 1) {
            l2 += (long)Character.digit(string.charAt(n2), 16) << (n3 << 2);
            --n2;
            ++n3;
        }
        return l2;
    }

    public static DataInputStream a(byte[] byArray, int n2, int n3) {
        return new DataInputStream(new ByteArrayInputStream(byArray, 0, n3));
    }

    public static Image b(byte[] byArray, int n2, int n3) {
        int n4;
        int n5 = 0;
        byte[] byArray2 = byArray;
        if (!(byArray.length > 57 && (byArray2[n5] & 0xFF) == 137 && byArray2[n5 + 1] == 80 && byArray2[n5 + 2] == 78 && byArray2[n5 + 3] == 71 && byArray2[n5 + 4] == 13 && byArray2[n5 + 5] == 10 && byArray2[n5 + 6] == 26 && byArray2[n5 + 7] == 10)) {
            throw new IllegalArgumentException("PNG\u56fe\u50cf\u6570\u636e\u4e0d\u6b63\u786e\u3002");
        }
        if (byArray[25] != 3) {
            throw new IllegalArgumentException("PNG\u56fe\u50cf\u6570\u636e\u4e0d\u662f\u7d22\u5f15\u8272\u3002");
        }
        int n6 = 8;
        do {
            n5 = j.a(byArray, n6);
            n4 = j.a(byArray, n6 + 4);
            switch (n4) {
                case 1347179589: {
                    if (n5 > 768 || n5 % 3 != 0) {
                        throw new IllegalArgumentException("\u8c03\u8272\u677f\u6570\u636e\u65e0\u6548\u3002");
                    }
                    int n7 = 0;
                    int n8 = n6 + 8;
                    while (n7 < n5) {
                        byArray[n8] = (byte)((byArray[n8] & 0xFF) * 38 + (byArray[n8 + 1] & 0xFF) * 75 + (byArray[n8 + 2] & 0xFF) * 15 >> 7);
                        byArray[n8 + 1] = byArray[n8];
                        byArray[n8 + 2] = byArray[n8];
                        n7 += 3;
                        n8 += 3;
                    }
                    n7 = m.a(byArray, n6 + 4, n5 + 4);
                    n6 += n5 + 8;
                    byArray[n6++] = n7 >> 24;
                    byArray[n6++] = (byte)(n7 >> 16);
                    byArray[n6++] = (byte)(n7 >> 8);
                    byArray[n6++] = (byte)n7;
                    break;
                }
                default: {
                    n6 += n5 + 12;
                }
            }
        } while (n6 < byArray.length && n6 < n3 + 0 && n4 != 1347179589 && n4 != 1229278788);
        return Image.createImage((byte[])byArray, (int)0, (int)n3);
    }

    private static int a(byte[] byArray, int n2) {
        return (byArray[n2] & 0xFF) << 24 | (byArray[n2 + 1] & 0xFF) << 16 | (byArray[n2 + 2] & 0xFF) << 8 | byArray[n2 + 3] & 0xFF;
    }

    private static int b(int n2, int n3, int n4, int n5, int n6, int n7) {
        return Math.abs(n2 * n5 + n4 * n7 + n6 * n3 - n4 * n3 - n6 * n5 - n2 * n7);
    }
}

