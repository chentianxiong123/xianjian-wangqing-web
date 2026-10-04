/*
 * Decompiled with CFR 0.152.
 */
import java.io.InputStream;
import javax.microedition.media.Control;
import javax.microedition.media.Manager;
import javax.microedition.media.Player;
import javax.microedition.media.control.VolumeControl;
import javax.microedition.rms.RecordStore;

public final class ah {
    private static Player a;
    private static VolumeControl b;
    private static String c;
    private static int d;
    private static int e;
    private static boolean f;

    static {
        Object object;
        block11: {
            d = -1;
            object = null;
            try {
                try {
                    object = RecordStore.openRecordStore((String)"YXVkaW8=", (boolean)true);
                    if (object.getNumRecords() > 0) {
                        byte[] byArray = object.getRecord(1);
                        f = byArray[0] == 1;
                        e = byArray[1];
                        break block11;
                    }
                    f = false;
                    e = 50;
                }
                catch (Exception exception) {
                    Exception exception2 = exception;
                    exception.printStackTrace();
                }
            }
            catch (Throwable throwable) {
                if (object != null) {
                    try {
                        object.closeRecordStore();
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
                object.closeRecordStore();
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
        }
    }

    public static void a(boolean bl2) {
        Object object;
        block12: {
            f = bl2;
            object = null;
            try {
                try {
                    object = RecordStore.openRecordStore((String)"YXVkaW8=", (boolean)true);
                    byte[] byArray = new byte[]{(byte)(bl2 ? 1 : 0), (byte)e};
                    if (object.getNumRecords() == 0) {
                        object.addRecord(byArray, 0, byArray.length);
                        break block12;
                    }
                    object.setRecord(1, byArray, 0, byArray.length);
                }
                catch (Exception exception) {
                    Exception exception2 = exception;
                    exception.printStackTrace();
                }
            }
            catch (Throwable throwable) {
                if (object != null) {
                    try {
                        object.closeRecordStore();
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
                object.closeRecordStore();
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
        }
        if (bl2) {
            ah.e();
            return;
        }
        ah.d();
    }

    public static boolean a() {
        return f;
    }

    public static void a(String string) {
        c = string;
    }

    public static String b() {
        return c;
    }

    public static void a(int n2) {
        d = n2;
    }

    public static void b(int n2) {
        Object object;
        block12: {
            e = n2 = Math.max(0, Math.min(100, n2));
            object = null;
            try {
                try {
                    object = RecordStore.openRecordStore((String)"YXVkaW8=", (boolean)true);
                    byte[] byArray = new byte[]{(byte)(f ? 1 : 0), (byte)n2};
                    if (object.getNumRecords() == 0) {
                        object.addRecord(byArray, 0, byArray.length);
                        break block12;
                    }
                    object.setRecord(1, byArray, 0, byArray.length);
                }
                catch (Exception exception) {
                    Exception exception2 = exception;
                    exception.printStackTrace();
                }
            }
            catch (Throwable throwable) {
                if (object != null) {
                    try {
                        object.closeRecordStore();
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
                object.closeRecordStore();
            }
            catch (Exception exception) {
                object = exception;
                exception.printStackTrace();
            }
        }
        if (b != null) {
            b.setLevel(n2);
        }
    }

    public static int c() {
        return e;
    }

    public static void d() {
        if (!f && a == null && c != null) {
            try {
                a = Manager.createPlayer((InputStream)c.getClass().getResourceAsStream(c), (String)"audio/midi");
                a.setLoopCount(d);
                a.start();
                Control control = a.getControl("VolumeControl");
                if (control != null) {
                    b = (VolumeControl)control;
                    b.setLevel(e);
                    return;
                }
            }
            catch (Exception exception) {
                Exception exception2 = exception;
                exception.printStackTrace();
            }
        }
    }

    public static void e() {
        if (a != null) {
            try {
                a.stop();
            }
            catch (Exception exception) {
                Exception exception2 = exception;
                exception.printStackTrace();
            }
            a.close();
            a = null;
            b = null;
        }
    }
}

