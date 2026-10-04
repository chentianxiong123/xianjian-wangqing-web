/*
 * Decompiled with CFR 0.152.
 */
import cn.com.etgame.cls.system.a;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.microedition.lcdui.Graphics;
import javax.microedition.rms.RecordStore;
import javax.wireless.messaging.MessageConnection;

public final class al {
    private MessageConnection c;
    private an d;
    private int e;
    private int f;
    private int g;
    private boolean h;
    private String i;
    private String[] j;
    private int k;
    private bo l;
    private int m;
    private String n;
    private String o;
    private int p;
    private int q;
    private static al r;
    private bb s;
    private String t;
    boolean a = true;
    int b = 0;

    public al() {
        r = this;
        this.p = ag.a().c;
        this.q = ag.a().d;
        this.e = al.c();
        this.s = new bb(this.t);
    }

    public static al a() {
        return r;
    }

    public final void a(Graphics graphics, a a2) {
        al al2 = this;
        if (al2.h) {
            int n2;
            a2.a(graphics, 0, 0, this.p, this.q, false);
            graphics.setClip(0, 0, this.p, this.q);
            graphics.setColor(0);
            graphics.setFont(ag.b);
            int n3 = ag.a.getHeight() + 5;
            int n4 = this.j.length;
            int n5 = ag.b.stringWidth(this.j[0]);
            if (this.j.length >= 3) {
                n2 = 0;
                while (n2 < 3) {
                    n5 = Math.max(n5, ag.b.stringWidth(this.j[n2]));
                    ++n2;
                }
            }
            n2 = this.p - n5 >> 1;
            n5 = this.q - n4 * n3 >> 1;
            int n6 = 0;
            while (n6 < n4) {
                cn.com.etgame.cls.system.a.a(graphics, 0xFFFFFF, this.j[n6], n2, n5 + n6 * n3, 20);
                ++n6;
            }
            switch (this.f) {
                case 0: 
                case 2: {
                    cn.com.etgame.cls.system.a.a(graphics, 0xFFFFFF, this.k == this.l.a() ? "\u786e\u5b9a" : "\u4e0b\u4e00\u9875", 8, this.q - 5, 36);
                    cn.com.etgame.cls.system.a.a(graphics, 0xFFFFFF, "\u53d6\u6d88", this.p - 8, this.q - 5, 40);
                }
            }
        }
    }

    public final void a(int n2) {
        if (n2 == 131072 && this.l != null && this.k < this.l.a()) {
            this.j = this.l.a(++this.k);
            return;
        }
        switch (this.f) {
            case 0: 
            case 2: 
            case 4: {
                if (n2 == 131072) {
                    this.a((byte)1);
                    return;
                }
                if (n2 != 262144) break;
                this.a((byte)4);
            }
        }
    }

    private void a(byte by) {
        this.f = by;
        switch (by) {
            case 0: {
                this.a(this.i == null ? "\u662f\u5426\u6fc0\u6d3b\uff1f" : this.i);
                return;
            }
            case 1: {
                this.a("\u53d1\u9001\u4e2d...");
                al al2 = this;
                if (al2.e < al2.m) {
                    new Thread(new p(al2)).start();
                    break;
                }
                al2.e -= al2.m;
                al.c(al2.e);
                al2.a((byte)3);
                return;
            }
            case 2: {
                this.a("\u5df2\u53d1\u9001&sent\u6761\uff0c\u8fd8\u9700\u53d1\u9001&surplus\u6761\n" + this.s.b());
                return;
            }
            case 4: {
                this.h = false;
                this.d.g(this.g);
                return;
            }
            case 3: {
                this.h = false;
                this.a = true;
                this.d.h(this.g);
            }
        }
    }

    private static synchronized void c(int n2) {
        Object object;
        RecordStore recordStore;
        block17: {
            recordStore = null;
            object = null;
            try {
                try {
                    recordStore = RecordStore.openRecordStore((String)"CLS3_FEE_SENT", (boolean)true);
                    object = new ByteArrayOutputStream();
                    new DataOutputStream((OutputStream)object).writeInt(n2);
                    byte[] byArray = ((ByteArrayOutputStream)object).toByteArray();
                    if (recordStore.getNumRecords() == 0) {
                        recordStore.addRecord(byArray, 0, byArray.length);
                        break block17;
                    }
                    recordStore.setRecord(1, byArray, 0, byArray.length);
                }
                catch (Exception exception) {
                    Exception exception2 = exception;
                    exception.printStackTrace();
                }
            }
            catch (Throwable throwable) {
                if (object != null) {
                    try {
                        ((ByteArrayOutputStream)object).close();
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
                ((ByteArrayOutputStream)object).close();
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

    /*
     * Enabled aggressive block sorting
     * Enabled unnecessary exception pruning
     * Enabled aggressive exception aggregation
     */
    private static synchronized int c() {
        Object object;
        RecordStore recordStore;
        block18: {
            int n2;
            recordStore = null;
            object = null;
            try {
                recordStore = RecordStore.openRecordStore((String)"CLS3_FEE_SENT", (boolean)true);
                if (recordStore.getNumRecords() <= 0) break block18;
                object = new ByteArrayInputStream(recordStore.getRecord(1));
                n2 = new DataInputStream((InputStream)object).readInt();
            }
            catch (Exception exception) {
                try {
                    Exception exception2 = exception;
                    exception.printStackTrace();
                    break block18;
                }
                catch (Throwable throwable) {
                    if (object != null) {
                        try {
                            ((ByteArrayInputStream)object).close();
                        }
                        catch (IOException iOException) {
                            object = iOException;
                            iOException.printStackTrace();
                        }
                    }
                    if (recordStore == null) throw throwable;
                    try {
                        recordStore.closeRecordStore();
                        throw throwable;
                    }
                    catch (Exception exception2) {
                        object = exception2;
                        exception2.printStackTrace();
                    }
                    throw throwable;
                }
            }
            try {
                ((ByteArrayInputStream)object).close();
            }
            catch (IOException iOException) {
                object = iOException;
                iOException.printStackTrace();
            }
            if (recordStore == null) return n2;
            try {
                recordStore.closeRecordStore();
                return n2;
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
            return n2;
        }
        if (object != null) {
            try {
                ((ByteArrayInputStream)object).close();
            }
            catch (IOException iOException) {
                object = iOException;
                iOException.printStackTrace();
            }
        }
        if (recordStore == null) return 0;
        try {
            recordStore.closeRecordStore();
            return 0;
        }
        catch (Exception exception) {
            object = exception;
            exception.printStackTrace();
        }
        return 0;
    }

    public final boolean b() {
        return this.h;
    }

    private void a(String object) {
        String string = object;
        object = this;
        string = j.a(string, "\b", "");
        string = j.a(string, "&&surplus", "\b");
        string = j.a(string, "&surplus", String.valueOf(Math.max(((al)object).m - ((al)object).e, 0)));
        string = j.a(string, "\b", "&surplus");
        string = j.a(string, "&&sent", "\b");
        string = j.a(string, "&sent", String.valueOf(((al)object).e));
        string = j.a(string, "\b", "&sent");
        string = j.a(string, "&&count", "\b");
        string = j.a(string, "&count", String.valueOf(((al)object).m));
        string = j.a(string, "\b", "&count");
        string = j.a(string, "&&price", "\b");
        string = j.a(string, "&price", String.valueOf(((al)object).t));
        string = j.a(string, "\b", "&price");
        this.l = new bo(string, this.p - 20, this.q - 50, 10, ag.a);
        this.k = 1;
        this.j = this.l.a(this.k);
    }

    public final void a(int n2, String string, String string2, int n3, String string3, an an2) {
        this.h = true;
        this.g = n2;
        this.n = string;
        this.o = string2;
        this.t = String.valueOf(n3);
        this.s.a(this.t);
        n2 = n3 / (this.s.a() ? 1 : 2);
        this.m = n2 + (this.s.c() ? 1 : 0);
        this.i = String.valueOf(string3) + "\n\u4fe1\u606f\u8d39" + (this.s.a() ? "1" : "2") + "\u5143/\u6761\uff0c\u5171" + n2 + "\u6761\uff0c\u5408\u8ba1&price\u5143\uff0c\u4e0d\u542b\u901a\u4fe1\u8d39\u3002\u5ba2\u670d\u7535\u8bdd\uff1a010-63438828\n" + this.s.b() + "\n" + "\u5df2\u53d1\u9001&sent\u6761\uff0c\u8fd8\u9700\u53d1\u9001&surplus\u6761" + (this.s.c() ? "\uff0c\u7b2c\u4e00\u6761\u514d\u8d39\u77ed\u4fe1\u662f\u7528\u6765\u63a5\u6536\u514d\u8d39\u6e38\u620f\u4fe1\u606f\u3002" : "\u3002");
        this.d = an2;
        this.a((byte)0);
    }

    static bb a(al al2) {
        return al2.s;
    }

    static void a(al al2, String string) {
        al2.n = string;
    }

    static void b(al al2, String string) {
        al2.o = string;
    }

    static String b(al al2) {
        return al2.n;
    }

    static void a(al al2, MessageConnection messageConnection) {
        al2.c = messageConnection;
    }

    static MessageConnection c(al al2) {
        return al2.c;
    }

    static String d(al al2) {
        return al2.o;
    }

    static void e(al al2) {
        if (al2.c != null) {
            try {
                al2.c.close();
            }
            catch (IOException iOException) {}
            al2.c = null;
        }
    }

    static void a(al al2, byte by) {
        al2.a(by);
    }

    static int f(al al2) {
        return al2.e;
    }

    static void a(al al2, int n2) {
        al2.e = n2;
    }

    static int g(al al2) {
        return al2.m;
    }

    static void b(int n2) {
        al.c(n2);
    }
}

