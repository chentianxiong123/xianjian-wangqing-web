/*
 * Decompiled with CFR 0.152.
 */
import java.util.Enumeration;
import java.util.Hashtable;

public final class bg {
    private final Hashtable a;

    public bg(String string) {
        this(b.a(string));
    }

    private bg(String[] stringArray) {
        this.a = new Hashtable(stringArray.length);
        int n2 = 0;
        while (n2 < stringArray.length) {
            String string;
            int n3 = stringArray[n2].indexOf(61);
            if (n3 != -1 && (string = stringArray[n2].substring(0, n3).trim()).length() > 0 && string.charAt(0) != '#') {
                this.a.put(string, stringArray[n2].substring(n3 + 1).trim());
            }
            ++n2;
        }
    }

    private String[] a() {
        Enumeration enumeration = this.a.keys();
        String[] stringArray = new String[this.a.size()];
        int n2 = 0;
        while (n2 < stringArray.length) {
            stringArray[n2] = (String)enumeration.nextElement();
            ++n2;
        }
        return stringArray;
    }

    public final String a(String string, String string2) {
        return this.a.put(string, string2);
    }

    public final String a(String string) {
        return (String)this.a.get(string);
    }

    public final boolean equals(Object object) {
        if (object instanceof bg) {
            String[] stringArray;
            object = (bg)object;
            String[] stringArray2 = this.a();
            if (stringArray2.length != (stringArray = super.a()).length) {
                return false;
            }
            int n2 = 0;
            while (n2 < stringArray2.length) {
                if (!stringArray2[n2].equals(stringArray[n2]) || !this.a(stringArray2[n2]).equals(((bg)object).a(stringArray[n2]))) {
                    return false;
                }
                ++n2;
            }
            return true;
        }
        return false;
    }

    public final String toString() {
        return this.a.toString();
    }
}

