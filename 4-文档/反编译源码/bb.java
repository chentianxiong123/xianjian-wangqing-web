/*
 * Decompiled with CFR 0.152.
 */
import java.io.InputStream;
import java.util.Vector;

public final class bb {
    private String a;
    private String b;
    private boolean c;
    private String[] d;
    private String[] e;
    private boolean f;
    private String g;
    private String h;
    private String i;
    private String j;
    private String k;
    private String l;
    private String m;
    private String n;
    private String o;
    private String p;

    public bb(String stringArray) {
        this.a((String)stringArray);
        stringArray = this.e();
        stringArray = bb.b((String)stringArray, "\n");
        int n2 = 0;
        while (n2 < stringArray.length) {
            System.out.println(String.valueOf(n2) + "=" + stringArray[n2].trim());
            ++n2;
        }
        System.out.println("----------------------");
        this.a(stringArray);
    }

    private void a(String[] object) {
        int n2 = 0;
        while (n2 < ((String[])object).length) {
            String string = object[n2].trim();
            if (bb.b(string, "DJSMSCode1:").length > 1) {
                this.i = bb.c(bb.b(string, "DJSMSCode1:")[1].trim());
            } else if (bb.b(string, "DJSMSDest1:").length > 1) {
                this.j = bb.c(bb.b(string, "DJSMSDest1:")[1].trim());
            } else if (bb.b(string, "DJSMSDesc1:").length > 1) {
                this.k = bb.b(string, "DJSMSDesc1:")[1].trim();
            } else if (bb.b(string, "DJSMSCode2:").length > 1) {
                this.l = bb.c(bb.b(string, "DJSMSCode2:")[1].trim());
            } else if (bb.b(string, "DJSMSDest2:").length > 1) {
                this.m = bb.c(bb.b(string, "DJSMSDest2:")[1].trim());
            } else if (bb.b(string, "DJSMSDesc2:").length > 1) {
                this.n = bb.b(string, "DJSMSDesc2:")[1].trim();
            } else if (bb.b(string, "DJFreeCode:").length > 1) {
                this.o = bb.c(bb.b(string, "DJFreeCode:")[1].trim());
            } else if (bb.b(string, "DJFreeDest:").length > 1) {
                this.p = bb.c(bb.b(string, "DJFreeDest:")[1].trim());
            }
            ++n2;
        }
        System.out.println("Code1:" + this.i);
        System.out.println("Dest1:" + this.j);
        System.out.println("Desc1:" + this.k);
        System.out.println("Code2:" + this.l);
        System.out.println("Dest2:" + this.m);
        System.out.println("Desc2:" + this.n);
        System.out.println("FreeCode:" + this.o);
        System.out.println("FreeDest:" + this.p);
        object = this;
        if (bb.b(((bb)object).l) || bb.b(((bb)object).m)) {
            System.out.println("\u4e00\u5143\u6307\u4ee4\uff01");
            ((bb)object).f = true;
            super.a(((bb)object).j, ((bb)object).i);
            ((bb)object).g = ((bb)object).k;
            return;
        }
        super.a(((bb)object).m, ((bb)object).l);
        ((bb)object).g = ((bb)object).n;
    }

    private void a(String string, String string2) {
        string = bb.b(string, ";")[0].trim();
        string2 = bb.b(string2, ";")[0].trim();
        if (bb.b(string, "X").length > 1) {
            this.c = true;
            string = bb.b(string, "X")[1].trim();
            string2 = bb.b(string2, "|")[0].trim();
            this.d();
        } else {
            string = string.trim();
            String[] stringArray = bb.b(string2, "|");
            if (stringArray.length > 1) {
                string2 = String.valueOf(stringArray[0].trim()) + "43403100000" + stringArray[1].trim();
            }
        }
        this.a = string;
        this.b = string2;
    }

    private void d() {
        this.d = bb.b(this.p, ";");
        String[] stringArray = bb.b(this.o, ";");
        this.e = new String[stringArray.length];
        int n2 = 0;
        while (n2 < stringArray.length) {
            String[] stringArray2 = bb.b(stringArray[n2], "|");
            this.e[n2] = String.valueOf(stringArray2[0].trim()) + "43403100000" + stringArray2[1].trim() + "-" + this.h;
            ++n2;
        }
    }

    private static boolean b(String string) {
        return string == null || string.equalsIgnoreCase("null") || string.equals("") || string == "";
    }

    private static String c(String object) {
        object = ((String)object).substring(0, ((String)object).length() - 1);
        byte[] byArray = ((String)object).getBytes();
        object = byArray;
        byte[] byArray2 = new byte[byArray.length];
        int n2 = 0;
        while (n2 < ((Object)object).length) {
            Object object2 = object[n2];
            if (object2 >= 48 && object2 <= 57) {
                object2 = (byte)(object2 + (object2 <= 50 ? 7 : -3));
            } else if (object2 >= 65 && object2 <= 90) {
                object2 = (byte)(object2 + (object2 <= 67 ? 23 : -3));
            }
            byArray2[n2] = (byte)object2;
            ++n2;
        }
        return new String(byArray2);
    }

    private static String[] b(String string, String objectArray) {
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

    private String e() {
        String string = "";
        try {
            InputStream inputStream = this.getClass().getResourceAsStream("/dcn.bin");
            byte[] byArray = new byte[1024];
            inputStream.read(byArray);
            string = new String(byArray, "UTF-8").trim();
            inputStream.close();
        }
        catch (Exception exception) {
            ag.a().a(exception, "\u5f53\u4e50\u6e20\u9053\u6587\u4ef6\u52a0\u8f7d\u9519\u8bef", 1);
        }
        return string;
    }

    public final void a(String string) {
        System.out.println("\u4ef7\u683c\uff1a" + string);
        this.h = string;
        if (this.c) {
            this.d();
        }
    }

    public final boolean a() {
        return this.f;
    }

    public final String b() {
        return this.g;
    }

    public final boolean c() {
        return this.c;
    }

    public final String a(boolean bl2, int n2) {
        bb bb2 = this;
        if (bb2.c && bl2) {
            return this.d[(n2 + this.d.length) % this.d.length];
        }
        return this.a;
    }

    public final String b(boolean bl2, int n2) {
        bb bb2 = this;
        if (bb2.c && bl2) {
            return this.e[(n2 + this.e.length) % this.e.length];
        }
        return this.b;
    }
}

