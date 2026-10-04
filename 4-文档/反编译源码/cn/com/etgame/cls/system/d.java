/*
 * Decompiled with CFR 0.152.
 */
package cn.com.etgame.cls.system;

import cn.com.etgame.cls.system.a;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.FilterInputStream;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.util.Random;
import java.util.Vector;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Image;
import javax.microedition.rms.RecordStore;

public final class d {
    public static final b[] a = new b[3];
    private static final String[] Z = new String[0];
    private static Image[] aa;
    private static a ab;
    private static t ac;
    private static String[] ad;
    private static int[] ae;
    private static Random af;
    public static int b;
    public static int c;
    public static int d;
    public static int e;
    public static int f;
    public static int g;
    public static int h;
    public static int i;
    public static int j;
    public static int k;
    public static int l;
    public static int m;
    public static int n;
    public static int o;
    public static int p;
    public static int q;
    public static int r;
    public static int s;
    public static int t;
    public static int u;
    public static int v;
    public static int w;
    public static String x;
    public static String y;
    public static String z;
    public static String A;
    public static String B;
    public static String C;
    public static String D;
    public static String E;
    public static String F;
    public static String G;
    public static String H;
    public static String I;
    public static String J;
    public static String K;
    public static String L;
    public static String M;
    public static String N;
    public static String O;
    public static String P;
    public static String[][] Q;
    public static String[][] R;
    public static k[] S;
    public static boolean T;
    private static String[][] ag;
    public static af[] U;
    public static Vector V;
    public static String[][] W;
    public static String[][] X;
    public static bg Y;

    static {
        af = new Random();
    }

    public static void a(int n2, String string) {
        if (ag.a().d() == 1 && n2 == 11) {
            System.out.println(string);
        }
    }

    public static void a(String string) {
        if (ag.a().d() == 1) {
            System.out.println(string);
        }
    }

    public static void a() {
        int n2;
        String[] stringArray = new bg("/str/config_game.str");
        Integer.parseInt(stringArray.a("\u626d\u66f2\u5ef6\u8fdf"));
        b = Integer.parseInt(stringArray.a("\u955c\u5934\u8ddf\u968f\u901f\u5ea6"));
        c = (int)j.a(stringArray.a("\u5267\u60c5\u9ed1\u8fb9\u989c\u8272"));
        d = Integer.parseInt(stringArray.a("\u5267\u60c5\u9ed1\u8fb9\u901f\u5ea6"));
        e = Integer.parseInt(stringArray.a("\u7cfb\u7edf\u63d0\u793a\u6846\u4e0a\u4e0b\u8fb9\u8ddd"));
        f = Integer.parseInt(stringArray.a("\u7cfb\u7edf\u63d0\u793a\u6846\u5de6\u53f3\u8fb9\u8ddd"));
        g = Integer.parseInt(stringArray.a("\u5bf9\u8bdd\u6846\u6587\u5b57\u884c\u95f4\u8ddd"));
        h = Integer.parseInt(stringArray.a("\u5bf9\u8bdd\u6846\u6587\u5b57\u6eda\u52a8\u901f\u5ea6"));
        i = Integer.parseInt(stringArray.a("\u81ea\u52a8\u7ed5\u8def\u8ddd\u79bb"));
        T = stringArray.a("\u5361\u9a6c\u514b\u5377\u8f74").equals("\u5f00");
        j = Integer.parseInt(stringArray.a("NPC\u6700\u5c0f\u79fb\u52a8\u6b65\u6570"));
        k = Integer.parseInt(stringArray.a("NPC\u6700\u5927\u79fb\u52a8\u6b65\u6570"));
        l = Integer.parseInt(stringArray.a("NPC\u6700\u77ed\u7ad9\u7acb\u65f6\u95f4"));
        m = Integer.parseInt(stringArray.a("NPC\u6700\u957f\u7ad9\u7acb\u65f6\u95f4"));
        n = Integer.parseInt(stringArray.a("\u660e\u602a\u6700\u5c0f\u79fb\u52a8\u6b65\u6570"));
        o = Integer.parseInt(stringArray.a("\u660e\u602a\u6700\u5927\u79fb\u52a8\u6b65\u6570"));
        p = Integer.parseInt(stringArray.a("\u660e\u602a\u6700\u77ed\u7ad9\u7acb\u65f6\u95f4"));
        q = Integer.parseInt(stringArray.a("\u660e\u602a\u6700\u957f\u7ad9\u7acb\u65f6\u95f4"));
        r = Integer.parseInt(stringArray.a("\u660e\u602a\u79fb\u52a8\u901f\u5ea6"));
        s = Integer.parseInt(stringArray.a("\u660e\u602a\u5237\u65b0\u901f\u5ea6"));
        t = Integer.parseInt(stringArray.a("\u660e\u602a\u89c6\u7ebf\u534a\u5f84"));
        u = Integer.parseInt(stringArray.a("\u660e\u602a\u79fb\u52a8\u534a\u5f84"));
        v = Integer.parseInt(stringArray.a("\u660e\u602a\u8ffd\u51fb\u534a\u5f84"));
        w = Integer.parseInt(stringArray.a("\u9e1f\u89c6\u7ebf\u534a\u5f84"));
        x = stringArray.a("MAP\u8d44\u6e90\u76ee\u5f55");
        y = stringArray.a("ANT\u8d44\u6e90\u76ee\u5f55");
        z = stringArray.a("BIN\u8d44\u6e90\u76ee\u5f55");
        A = stringArray.a("STR\u8d44\u6e90\u76ee\u5f55");
        B = stringArray.a("MID\u8d44\u6e90\u76ee\u5f55");
        C = stringArray.a("\u4e3b\u89d2\u914d\u7f6e\u6587\u4ef6");
        D = stringArray.a("\u4e3b\u89d2\u52a8\u753b\u6587\u4ef6");
        E = stringArray.a("\u4e3b\u89d2\u8d44\u6e90\u6587\u4ef6");
        F = stringArray.a("\u4e00\u53f7\u914d\u89d2\u914d\u7f6e\u6587\u4ef6");
        G = stringArray.a("\u4e8c\u53f7\u914d\u89d2\u914d\u7f6e\u6587\u4ef6");
        H = stringArray.a("\u660e\u602a\u52a8\u753b\u6587\u4ef6");
        I = stringArray.a("NPC\u8d44\u6e90\u6587\u4ef6");
        J = stringArray.a("\u5934\u50cf\u8d44\u6e90\u6587\u4ef6");
        K = stringArray.a("\u521d\u59cb\u573a\u666f\u5730\u56fe\u6587\u4ef6");
        L = stringArray.a("\u521d\u59cb\u573a\u666f\u5143\u7d20\u52a8\u753b");
        M = stringArray.a("\u521d\u59cb\u573a\u666f\u5143\u7d20\u8d44\u6e90");
        N = stringArray.a("\u521d\u59cb\u573a\u666f\u5730\u7816\u8d44\u6e90");
        O = stringArray.a("\u5e2e\u52a9");
        P = stringArray.a("\u5173\u4e8e");
        stringArray = j.a(stringArray.a("\u5b9d\u7bb1\u7269\u54c1"), ",");
        ad = new String[stringArray.length];
        ae = new int[stringArray.length];
        int n3 = 0;
        while (n3 < stringArray.length) {
            stringArray[n3] = stringArray[n3].trim();
            if (stringArray[n3].length() > 0) {
                cn.com.etgame.cls.system.d.ad[n3] = cn.com.etgame.cls.system.d.d(stringArray[n3]);
                cn.com.etgame.cls.system.d.ae[n3] = Integer.parseInt(cn.com.etgame.cls.system.d.e(stringArray[n3])[0]);
                if (n3 > 0) {
                    int n4 = n3;
                    ae[n4] = ae[n4] + ae[n3 - 1];
                }
            }
            ++n3;
        }
        cn.com.etgame.cls.system.d.a(2, String.valueOf(A) + "tips_in_loading.str");
        b.a(String.valueOf(A) + "tips_in_loading.str");
        cn.com.etgame.cls.system.d.a(2, String.valueOf(A) + "config_item.str");
        String[] stringArray2 = b.a(String.valueOf(A) + "config_item.str");
        Q = new String[stringArray2.length][];
        int n5 = 0;
        int n6 = 0;
        while (n6 < Q.length) {
            cn.com.etgame.cls.system.d.Q[n6] = j.a(stringArray2[n6], "#");
            if (Q[n6][1].equals("\u836f\u54c1")) {
                ++n5;
            }
            ++n6;
        }
        R = new String[n5][3];
        n6 = 0;
        int n7 = 0;
        while (n6 < Q.length) {
            if (Q[n6][1].equals("\u836f\u54c1")) {
                cn.com.etgame.cls.system.d.R[n7][0] = Q[n6][0];
                cn.com.etgame.cls.system.d.R[n7][1] = Q[n6][12];
                cn.com.etgame.cls.system.d.R[n7][2] = Q[n6][14];
                ++n7;
            }
            ++n6;
        }
        cn.com.etgame.cls.system.d.a(2, String.valueOf(A) + "config_make.str");
        stringArray2 = b.a(String.valueOf(A) + "config_make.str");
        S = new k[stringArray2.length];
        n7 = 0;
        while (n7 < S.length) {
            String[] stringArray3 = j.a(stringArray2[n7], ",");
            cn.com.etgame.cls.system.d.S[n7] = new k(stringArray3[0], stringArray3[2]);
            stringArray3 = j.a(stringArray3[1], "|");
            n2 = 0;
            while (n2 < stringArray3.length) {
                i i2 = new i(cn.com.etgame.cls.system.d.d(stringArray3[n2]), Integer.parseInt(cn.com.etgame.cls.system.d.e(stringArray3[n2])[0]));
                S[n7].a(i2);
                ++n2;
            }
            ++n7;
        }
        cn.com.etgame.cls.system.d.a(2, String.valueOf(A) + "task.str");
        stringArray2 = b.a(String.valueOf(A) + "task.str");
        ag = new String[stringArray2.length][2];
        n7 = 0;
        while (n7 < stringArray2.length) {
            String[] stringArray4 = j.a(stringArray2[n7], "=");
            cn.com.etgame.cls.system.d.ag[n7][0] = stringArray4[0].trim();
            cn.com.etgame.cls.system.d.ag[n7][1] = stringArray4[1];
            ++n7;
        }
        Y = new bg(String.valueOf(A) + "GotoFee.str");
        stringArray2 = b.a(String.valueOf(A) + "GotoFee.str");
        V = new Vector();
        W = new String[stringArray2.length][];
        n2 = 0;
        while (n2 < stringArray2.length) {
            String[] stringArray5 = j.a(stringArray2[n2], "=");
            String[] stringArray6 = j.a(stringArray5[1], "#");
            if (stringArray6.length == 5) {
                i i3 = new i(stringArray5[0]);
                V.addElement(i3);
                cn.com.etgame.cls.system.d.W[n2] = stringArray6;
                Y.a(stringArray5[0], stringArray6[0]);
            } else {
                cn.com.etgame.cls.system.d.a("\u8ba1\u8d39\u70b9\u914d\u7f6e\u6587\u4ef6\u9519\u8bef\uff1a" + stringArray2[n2]);
            }
            ++n2;
        }
        stringArray2 = b.a(String.valueOf(A) + "fee.str");
        X = new String[stringArray2.length][2];
        n2 = 0;
        while (n2 < stringArray2.length) {
            String[] stringArray7 = j.a(stringArray2[n2], "#");
            cn.com.etgame.cls.system.d.X[n2][0] = stringArray7[0];
            cn.com.etgame.cls.system.d.X[n2][1] = stringArray7[1];
            ++n2;
        }
        cn.com.etgame.cls.system.d.e();
        cn.com.etgame.cls.system.d.f();
        cn.com.etgame.cls.system.d.g();
    }

    private static void e() {
        String[] stringArray = b.a(String.valueOf(A) + "config_skill.str");
        U = new af[stringArray.length];
        int n2 = 0;
        while (n2 < stringArray.length) {
            try {
                String[] stringArray2 = j.a(stringArray[n2], "#");
                cn.com.etgame.cls.system.d.U[n2] = n2 == 0 ? new af(n2, "none", "none", "name", "\u653b\u51fb", "\u5426", "0", "0", "\u5426", "0", "0", "atk", null) : new af(n2, stringArray2[0], stringArray2[1], stringArray2[2].trim(), stringArray2[3], stringArray2[4], stringArray2[5], stringArray2[6], stringArray2[7], stringArray2[8], stringArray2[9], stringArray2[10], stringArray2.length > 11 ? stringArray2[11] : null);
            }
            catch (Exception exception) {
                cn.com.etgame.cls.system.d.a(2, "\u6280\u80fd\u52a0\u8f7d\u9519\u8bef\uff1a" + n2);
                ag.a().a(exception, "\u6280\u80fd\u52a0\u8f7d\u9519\u8bef\uff1a" + n2, 1);
            }
            ++n2;
        }
    }

    public static void b() {
        if (ab == null) {
            if (aa == null) {
                bf[] bfArray = String.valueOf(z) + "share.bin";
                bfArray = x.a(bfArray.getClass().getResourceAsStream((String)bfArray));
                aa = new Image[bfArray.length];
                int n2 = 0;
                while (n2 < aa.length) {
                    if (bfArray[n2].a.endsWith(".png")) {
                        cn.com.etgame.cls.system.d.aa[n2] = Image.createImage((byte[])bfArray[n2].b, (int)0, (int)bfArray[n2].b.length);
                    } else if (bfArray[n2].a.endsWith(".pix")) {
                        ba ba2 = ba.a(j.a(bfArray[n2].b, 0, bfArray[n2].b.length));
                        cn.com.etgame.cls.system.d.aa[n2] = Image.createRGBImage((int[])ba2.c, (int)ba2.a, (int)ba2.b, (boolean)true);
                    }
                    ++n2;
                }
            }
            ab = new a(aa, d.a(String.valueOf(y) + "share.ant"));
        }
    }

    public static a c() {
        if (ab == null) {
            cn.com.etgame.cls.system.d.b();
        }
        return ab;
    }

    public static int b(String string) {
        if (string.equals("up")) {
            return 1;
        }
        if (string.equals("down")) {
            return 2;
        }
        if (string.equals("left")) {
            return 4;
        }
        if (string.equals("right")) {
            return 8;
        }
        if (string.equals("keep")) {
            return -1;
        }
        throw new IllegalArgumentException();
    }

    public static String[] c(String string) {
        return j.a(string, ";");
    }

    public static String d(String string) {
        return string.substring(string.indexOf(".") + 1, string.indexOf("("));
    }

    public static String[] e(String string) {
        if ((string = string.substring(string.indexOf("(") + 1, string.indexOf(")"))).trim().length() > 0) {
            return j.a(string, ",");
        }
        return Z;
    }

    public static String[] f(String string) {
        if ((string = string.substring(string.indexOf("(") + 1, string.indexOf(")"))).trim().length() > 0) {
            return j.a(string, "|");
        }
        return Z;
    }

    public static String[] g(String string) {
        int n2 = string.indexOf("[");
        if (n2 == -1) {
            return Z;
        }
        if ((string = string.substring(n2 + 1, string.indexOf("]"))).trim().length() > 0) {
            return j.a(string, ",");
        }
        return Z;
    }

    public static int[][] h(String stringArray) {
        if (stringArray != null && stringArray.startsWith("{") && stringArray.endsWith("}")) {
            stringArray = j.a(stringArray.substring(1, stringArray.length() - 1), "},{");
            int[][] nArray = new int[stringArray.length][];
            try {
                int n2 = 0;
                while (n2 < nArray.length) {
                    String[] stringArray2 = j.a(stringArray[n2], ",");
                    nArray[n2] = new int[]{Integer.parseInt(stringArray2[0]), Integer.parseInt(stringArray2[1]), Integer.parseInt(stringArray2[2]), Integer.parseInt(stringArray2[3]), cn.com.etgame.cls.system.d.b(stringArray2[4])};
                    ++n2;
                }
                return nArray;
            }
            catch (Exception exception) {
                Exception exception2 = exception;
                exception.printStackTrace();
            }
        }
        return null;
    }

    public static bf a(String string, String object, int n2) {
        while (true) {
            object = String.valueOf(string) + (String)object;
            object = x.a(object.getClass().getResourceAsStream((String)object), n2);
            if (object.a.charAt(0) != '#') break;
            object = j.a(object.a.substring(1), ":");
            n2 = Integer.parseInt(object[1]);
            object = object[0];
        }
        return object;
    }

    private static void f() {
        int n2 = 0;
        while (n2 < a.length) {
            Object object;
            RecordStore recordStore;
            block19: {
                recordStore = null;
                object = null;
                try {
                    try {
                        recordStore = RecordStore.openRecordStore((String)("CLS3_TITLE" + n2), (boolean)true);
                        if (recordStore.getNumRecords() == 0) {
                            cn.com.etgame.cls.system.d.a[n2] = null;
                            break block19;
                        }
                        Object[] objectArray = recordStore.getRecord(1);
                        object = j.a(objectArray, 0, objectArray.length);
                        objectArray = new int[((DataInputStream)object).readInt()];
                        int n3 = 0;
                        while (n3 < objectArray.length) {
                            objectArray[n3] = ((DataInputStream)object).readInt();
                            ++n3;
                        }
                        cn.com.etgame.cls.system.d.a[n2] = new b(n2, (int[])objectArray, ((DataInputStream)object).readLong(), ((DataInputStream)object).readUTF(), ((DataInputStream)object).readUTF(), ((DataInputStream)object).readUTF(), ((DataInputStream)object).readUTF());
                    }
                    catch (Exception exception) {
                        ag.a().a(exception, "Share.initRecord()", 1);
                    }
                }
                catch (Throwable throwable) {
                    if (object != null) {
                        try {
                            ((FilterInputStream)object).close();
                        }
                        catch (IOException iOException) {
                            object = iOException;
                            iOException.printStackTrace();
                        }
                    }
                    if (recordStore != null) {
                        try {
                            recordStore.closeRecordStore();
                        }
                        catch (Exception exception) {
                            object = exception;
                            exception.printStackTrace();
                        }
                    }
                    throw throwable;
                }
            }
            if (object != null) {
                try {
                    ((FilterInputStream)object).close();
                }
                catch (IOException iOException) {
                    object = iOException;
                    iOException.printStackTrace();
                }
            }
            if (recordStore != null) {
                try {
                    recordStore.closeRecordStore();
                }
                catch (Exception exception) {
                    object = exception;
                    exception.printStackTrace();
                }
            }
            ++n2;
        }
    }

    public static void a(int n2) {
        ac.a("fee" + n2 + "=1");
        cn.com.etgame.cls.system.d.h();
    }

    public static void b(int n2) {
        ac.a("fee" + n2 + "=0");
        cn.com.etgame.cls.system.d.h();
    }

    public static boolean c(int n2) {
        return ac.a("fee" + n2) == 1L;
    }

    /*
     * Unable to fully structure code
     */
    public static String[] a(String var0, int var1_1, int var2_3, Font var3_5) {
        var2_4 = new Vector<String>();
        if (var3_5 == null) {
            var3_5 = ag.a;
        }
        var3_6 = (var1_1 + 10) / (var3_5.getHeight() + 10);
        var4_7 = false;
        var5_8 = var0.length();
        var1_1 = 0;
        var6_10 = 0;
        while (var6_10 < var5_8) {
            block5: {
                while (++var1_1 + var6_10 < var5_8 && var1_1 <= var3_6) {
                }
                var7_11 = var5_8 - var6_10 > var1_1 ? var6_10 + var1_1 : var5_8;
                var1_2 = var0.substring(var6_10, var7_11);
                if ((var6_10 = var1_2.indexOf(10)) != -1) break block5;
                var4_7 = true;
                ** GOTO lbl24
            }
            var7_11 = var7_11 - (var1_2.length() - var6_10) + 1;
            var1_2 = var1_2.substring(0, var6_10);
            if (var4_7 && var1_2.length() == 0) {
                var4_7 = false;
            } else {
                var4_7 = false;
lbl24:
                // 2 sources

                var2_4.addElement(var1_2);
            }
            var6_10 = var7_11;
            var1_1 = 0;
        }
        var5_9 = new String[var2_4.size()];
        var2_4.copyInto(var5_9);
        return var5_9;
    }

    /*
     * Unable to fully structure code
     */
    public static String[] a(String var0, int var1_1, Font var2_2) {
        var3_3 = new Vector<String>();
        if (var2_2 == null) {
            var2_2 = ag.a;
        }
        var5_4 = false;
        var6_5 = var0.length();
        var4_7 = 0;
        var7_9 = 0;
        var8_10 = 0;
        while (var7_9 < var6_5) {
            block7: {
                do {
                    if (var0.charAt(var7_9 + var4_7) == '/') {
                        var8_10 += var2_2.charWidth('/');
                        continue;
                    }
                    if (var0.charAt(var7_9 + var4_7) == '{') {
                        var8_10 += var2_2.charWidth('{');
                        continue;
                    }
                    if (var0.charAt(var7_9 + var4_7) != '}') continue;
                    var8_10 += var2_2.charWidth('}');
                } while (++var4_7 + var7_9 < var6_5 && var2_2.substringWidth(var0, var7_9, var4_7 + 1) - var8_10 < var1_1);
                var8_10 = var6_5 - var7_9 > var4_7 ? var7_9 + var4_7 : var6_5;
                var4_8 = var0.substring(var7_9, var8_10);
                if ((var7_9 = var4_8.indexOf(10)) != -1) break block7;
                var5_4 = true;
                ** GOTO lbl32
            }
            var8_10 = var8_10 - (var4_8.length() - var7_9) + 1;
            var4_8 = var4_8.substring(0, var7_9);
            if (var5_4 && var4_8.length() == 0) {
                var5_4 = false;
            } else {
                var5_4 = false;
lbl32:
                // 2 sources

                var3_3.addElement(var4_8);
            }
            var7_9 = var8_10;
            var4_7 = 0;
            var8_10 = 0;
        }
        var6_6 = new String[var3_3.size()];
        var3_3.copyInto(var6_6);
        return var6_6;
    }

    public static i d() {
        int n2 = j.a(1, ae[ae.length - 1], af);
        int n3 = 0;
        while (n3 < ad.length) {
            if (ad[n3] != null && n2 <= ae[n3]) {
                return new i(ad[n3]);
            }
            ++n3;
        }
        return null;
    }

    private static void g() {
        ac = new t();
        RecordStore recordStore = null;
        Object object = null;
        try {
            try {
                recordStore = RecordStore.openRecordStore((String)"CLS3_FEE_SYMBOL", (boolean)true);
                if (recordStore.getNumRecords() > 0) {
                    byte[] byArray = recordStore.getRecord(1);
                    object = j.a(byArray, 0, byArray.length);
                    int n2 = 0;
                    int n3 = ((DataInputStream)object).readInt();
                    while (n2 < n3) {
                        ac.a(String.valueOf(((DataInputStream)object).readUTF()) + "=" + ((DataInputStream)object).readLong());
                        ++n2;
                    }
                }
            }
            catch (Exception exception) {
                ag.a().a(exception, "Share.initFeeSymbol()", 1);
            }
        }
        catch (Throwable throwable) {
            if (object != null) {
                try {
                    ((FilterInputStream)object).close();
                }
                catch (IOException iOException) {
                    object = iOException;
                    iOException.printStackTrace();
                }
            }
            if (recordStore != null) {
                try {
                    recordStore.closeRecordStore();
                }
                catch (Exception exception) {
                    object = exception;
                    exception.printStackTrace();
                }
            }
            throw throwable;
        }
        if (object != null) {
            try {
                ((FilterInputStream)object).close();
            }
            catch (IOException iOException) {
                object = iOException;
                iOException.printStackTrace();
            }
        }
        if (recordStore != null) {
            try {
                recordStore.closeRecordStore();
                return;
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
        }
    }

    private static void h() {
        Object object;
        ByteArrayOutputStream byteArrayOutputStream;
        RecordStore recordStore;
        block24: {
            recordStore = null;
            byteArrayOutputStream = null;
            object = null;
            try {
                try {
                    recordStore = RecordStore.openRecordStore((String)"CLS3_FEE_SYMBOL", (boolean)true);
                    byteArrayOutputStream = new ByteArrayOutputStream();
                    object = new DataOutputStream(byteArrayOutputStream);
                    String[] stringArray = ac.a();
                    ((DataOutputStream)object).writeInt(stringArray.length);
                    int n2 = 0;
                    while (n2 < stringArray.length) {
                        ((DataOutputStream)object).writeUTF(stringArray[n2]);
                        ((DataOutputStream)object).writeLong(ac.a(stringArray[n2]));
                        ++n2;
                    }
                    byte[] byArray = byteArrayOutputStream.toByteArray();
                    if (recordStore.getNumRecords() == 0) {
                        recordStore.addRecord(byArray, 0, byArray.length);
                        break block24;
                    }
                    recordStore.setRecord(1, byArray, 0, byArray.length);
                }
                catch (Throwable throwable) {
                    ag.a().a(throwable, "Share.saveFeeSymbol()", 1);
                }
            }
            catch (Throwable throwable) {
                if (object != null) {
                    try {
                        ((FilterOutputStream)object).close();
                    }
                    catch (IOException iOException) {
                        object = iOException;
                        iOException.printStackTrace();
                    }
                }
                if (byteArrayOutputStream != null) {
                    try {
                        byteArrayOutputStream.close();
                    }
                    catch (IOException iOException) {
                        object = iOException;
                        iOException.printStackTrace();
                    }
                }
                if (recordStore != null) {
                    try {
                        recordStore.closeRecordStore();
                    }
                    catch (Exception exception) {
                        object = exception;
                        exception.printStackTrace();
                    }
                }
                throw throwable;
            }
        }
        if (object != null) {
            try {
                ((FilterOutputStream)object).close();
            }
            catch (IOException iOException) {
                object = iOException;
                iOException.printStackTrace();
            }
        }
        if (byteArrayOutputStream != null) {
            try {
                byteArrayOutputStream.close();
            }
            catch (IOException iOException) {
                object = iOException;
                iOException.printStackTrace();
            }
        }
        if (recordStore != null) {
            try {
                recordStore.closeRecordStore();
                return;
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
        }
    }

    public static String i(String string) {
        int n2 = 0;
        while (n2 < ag.length) {
            if (string.equals(ag[n2][0])) {
                return ag[n2][1];
            }
            ++n2;
        }
        return null;
    }

    public static int a(String object, bj bj2) {
        int n2 = 0;
        while (n2 < S.length) {
            if (((String)object).equals(cn.com.etgame.cls.system.d.S[n2].a)) {
                boolean bl2;
                block7: {
                    object = S[n2];
                    if (!cn.com.etgame.cls.system.d.c(Integer.parseInt(Y.a("\u70b9\u77f3\u6210\u91d1")))) {
                        int n3 = 0;
                        while (n3 < ((k)object).b.size()) {
                            i i2 = (i)((k)object).b.elementAt(n3);
                            if (bj2.c().b(i2) < i2.d()) {
                                bl2 = false;
                                break block7;
                            }
                            ++n3;
                        }
                        n3 = 0;
                        while (n3 < ((k)object).b.size()) {
                            i i3 = (i)((k)object).b.elementAt(n3);
                            bj2.c().a(i3, i3.d());
                            ++n3;
                        }
                    }
                    bj2.c().a(new i(((k)object).a));
                    bl2 = true;
                }
                if (bl2) {
                    return 1;
                }
                return 2;
            }
            ++n2;
        }
        return 0;
    }
}

