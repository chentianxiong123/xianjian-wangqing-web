/*
 * Decompiled with CFR 0.152.
 */
public final class am {
    public static int[] a = new int[3];
    public static int[] b = new int[3];
    public static int[] c = new int[3];
    public static int[] d = new int[3];
    private static int l;
    public static int e;
    public static int f;
    public static int g;
    public static int h;
    public static long i;
    public static int j;
    public static int k;

    static {
        e = 10;
    }

    public static void a() {
        try {
            bg bg2 = new bg("/str/config_fight.str");
            int n2 = 0;
            while (n2 < a.length) {
                am.a[n2] = Integer.parseInt(bg2.a("\u82f1\u96c4" + (n2 + 1) + "\u7684X\u5750\u6807"));
                am.b[n2] = Integer.parseInt(bg2.a("\u82f1\u96c4" + (n2 + 1) + "\u7684Y\u5750\u6807"));
                ++n2;
            }
            n2 = 0;
            while (n2 < c.length) {
                am.c[n2] = Integer.parseInt(bg2.a("\u654c\u5175" + (n2 + 1) + "\u7684X\u5750\u6807"));
                am.d[n2] = Integer.parseInt(bg2.a("\u654c\u5175" + (n2 + 1) + "\u7684Y\u5750\u6807"));
                ++n2;
            }
            l = Integer.parseInt(bg2.a("\u653b\u51fb\u8ddd\u79bb"));
            Integer.parseInt(bg2.a("\u6218\u6597\u6570\u503c\u6c34\u5e73\u6700\u5927\u901f\u5ea6"));
            f = Integer.parseInt(bg2.a("\u6218\u6597\u6570\u503c\u5782\u76f4\u901f\u5ea6"));
            Integer.parseInt(bg2.a("\u6218\u6597\u6570\u503c\u5782\u76f4\u52a0\u901f\u5ea6"));
            g = Integer.parseInt(bg2.a("\u6218\u6597\u6570\u503c\u7684\u6c34\u5e73\u504f\u79fb\u91cf"));
            h = Integer.parseInt(bg2.a("\u6218\u6597\u6570\u503c\u7684\u5782\u76f4\u504f\u79fb\u91cf"));
            i = Integer.parseInt(bg2.a("\u6218\u6597\u6570\u503c\u7684\u663e\u793a\u65f6\u95f4"));
            Integer.parseInt(bg2.a("\u6218\u6597\u80cc\u666fW"));
            Integer.parseInt(bg2.a("\u6218\u6597\u80cc\u666fH"));
            j = Integer.parseInt(bg2.a("\u901f\u5ea6\u6761\u7684\u5b9e\u9645\u53ef\u7528\u957f\u5ea6"));
            k = Integer.parseInt(bg2.a("\u901f\u5ea6\u6761\u7684\u5b9e\u9645\u6280\u80fd\u957f\u5ea6"));
            return;
        }
        catch (Exception exception) {
            ag.a().a(exception, "\u6218\u6597\u914d\u7f6e\u6587\u4ef6\u52a0\u8f7d", 1);
            return;
        }
    }

    public static int b() {
        return l;
    }
}

