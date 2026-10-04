/*
 * Decompiled with CFR 0.152.
 */
import java.io.DataInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public final class x {
    public static short a(String string) {
        return x.b(string.getClass().getResourceAsStream(string));
    }

    private static short b(InputStream inputStream) {
        short s2;
        block7: {
            inputStream = inputStream instanceof DataInputStream ? (DataInputStream)inputStream : new DataInputStream(inputStream);
            try {
                x.a((DataInputStream)inputStream);
                s2 = ((DataInputStream)inputStream).readShort();
                if (inputStream == null) break block7;
            }
            catch (Throwable throwable) {
                if (inputStream != null) {
                    try {
                        ((FilterInputStream)inputStream).close();
                    }
                    catch (IOException iOException) {}
                }
                throw throwable;
            }
            try {
                ((FilterInputStream)inputStream).close();
            }
            catch (IOException iOException) {}
        }
        return s2;
    }

    /*
     * Exception decompiling
     */
    public static bf a(InputStream var0, int var1_1) {
        /*
         * This method has failed to decompile.  When submitting a bug report, please provide this stack trace, and (if you hold appropriate legal rights) the relevant class file.
         * 
         * org.benf.cfr.reader.util.ConfusedCFRException: Tried to end blocks [9[WHILELOOP]], but top level block is 2[TRYBLOCK]
         *     at org.benf.cfr.reader.bytecode.analysis.opgraph.Op04StructuredStatement.processEndingBlocks(Op04StructuredStatement.java:435)
         *     at org.benf.cfr.reader.bytecode.analysis.opgraph.Op04StructuredStatement.buildNestedBlocks(Op04StructuredStatement.java:484)
         *     at org.benf.cfr.reader.bytecode.analysis.opgraph.Op03SimpleStatement.createInitialStructuredBlock(Op03SimpleStatement.java:736)
         *     at org.benf.cfr.reader.bytecode.CodeAnalyser.getAnalysisInner(CodeAnalyser.java:850)
         *     at org.benf.cfr.reader.bytecode.CodeAnalyser.getAnalysisOrWrapFail(CodeAnalyser.java:278)
         *     at org.benf.cfr.reader.bytecode.CodeAnalyser.getAnalysis(CodeAnalyser.java:201)
         *     at org.benf.cfr.reader.entities.attributes.AttributeCode.analyse(AttributeCode.java:94)
         *     at org.benf.cfr.reader.entities.Method.analyse(Method.java:531)
         *     at org.benf.cfr.reader.entities.ClassFile.analyseMid(ClassFile.java:1055)
         *     at org.benf.cfr.reader.entities.ClassFile.analyseTop(ClassFile.java:942)
         *     at org.benf.cfr.reader.Driver.doJarVersionTypes(Driver.java:257)
         *     at org.benf.cfr.reader.Driver.doJar(Driver.java:139)
         *     at org.benf.cfr.reader.CfrDriverImpl.analyse(CfrDriverImpl.java:76)
         *     at org.benf.cfr.reader.Main.main(Main.java:54)
         */
        throw new IllegalStateException("Decompilation failed");
    }

    public static bf[] a(InputStream inputStream) {
        bf[] bfArray;
        block8: {
            inputStream = inputStream instanceof DataInputStream ? (DataInputStream)inputStream : new DataInputStream(inputStream);
            try {
                x.a((DataInputStream)inputStream);
                bfArray = new bf[((DataInputStream)inputStream).readShort()];
                int n2 = 0;
                while (n2 < bfArray.length) {
                    String string = ((DataInputStream)inputStream).readUTF();
                    byte[] byArray = new byte[((DataInputStream)inputStream).readInt()];
                    ((DataInputStream)inputStream).read(byArray);
                    bfArray[n2] = new bf(string, byArray);
                    ++n2;
                }
                if (inputStream == null) break block8;
            }
            catch (Throwable throwable) {
                if (inputStream != null) {
                    try {
                        ((FilterInputStream)inputStream).close();
                    }
                    catch (IOException iOException) {}
                }
                throw throwable;
            }
            try {
                ((FilterInputStream)inputStream).close();
            }
            catch (IOException iOException) {}
        }
        return bfArray;
    }

    public final boolean equals(Object object) {
        if (object instanceof x) {
            if ((null).length != (null).length) {
                return false;
            }
            int n2 = 0;
            while (n2 < (null).length) {
                if (!null.a.equals(null.a)) {
                    return false;
                }
                ++n2;
            }
            n2 = 0;
            while (n2 < (null).length) {
                if (null.b.length != null.b.length) {
                    return false;
                }
                int n3 = 0;
                while (n3 < null.b.length) {
                    if (null.b[n3] != null.b[n3]) {
                        return false;
                    }
                    ++n3;
                }
                ++n2;
            }
            return true;
        }
        return false;
    }

    private static void a(DataInputStream dataInputStream) {
        if ((dataInputStream.readByte() & 0xFF) != 136 || dataInputStream.readByte() != 66 || dataInputStream.readByte() != 73 || dataInputStream.readByte() != 78 || (dataInputStream.readByte() & 0xFF) != 9) {
            throw new IllegalArgumentException("\u8d44\u6e90\u5305\u6570\u636e\u4e0d\u6b63\u786e\u3002");
        }
    }
}

