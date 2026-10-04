#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""02-Java类解析器v3: 修正JVMS常量池标签映射 + cp_count容错。
用法: python3 02-Java类解析器.py [jar或目录] [输出目录]
"""
import zipfile, struct, os, sys

TAG = {1:"Utf8",2:"Module",3:"Integer",4:"Float",5:"Long",6:"Double",
       7:"Class",8:"String",9:"Fieldref",10:"Methodref",
       11:"InterfaceMethodref",12:"NameAndType",
       13:"ClassIndex",14:"MethodHandle",15:"MethodType",
       16:"Dynamic",17:"InvokeDynamic",18:"Package"}
ACC_CLASS = {1:"public",2:"private",4:"protected",8:"static",16:"final",
             32:"synchronized",64:"bridge",128:"varargs",256:"native",
             512:"interface",1024:"abstract",2048:"strictfp",4096:"synthetic",
             8192:"annotation",16384:"enum"}
ACC_FIELD = {1:"public",2:"private",4:"protected",8:"static",16:"final",
             32:"synchronized",64:"bridge",128:"varargs",256:"native",
             512:"interface",1024:"abstract",2048:"strictfp",4096:"synthetic",
             8192:"volatile",16384:"transient"}
ACC_METHOD = {1:"public",2:"private",4:"protected",8:"static",16:"final",
              32:"synchronized",64:"bridge",128:"varargs",256:"native",
              512:"interface",1024:"abstract",2048:"strictfp",4096:"synthetic"}
TYPE = {'I':'int','J':'long','Z':'boolean','C':'char','B':'byte',
        'S':'short','F':'float','D':'double'}

def acc_str(f, t):
    return " ".join(t[k] for k in sorted(t) if f & k) or "_"

def desc_type(s, p):
    if p >= len(s): return None, p
    c = s[p]
    if c in TYPE: return TYPE[c], p+1
    if c == 'L':
        e = s.find(';', p+1)
        return s[p+1:e].replace('/', '.'), e+1
    if c == '[':
        b, np = desc_type(s, p+1)
        return (b + "[]") if b else "[]", np
    if c == '(':
        ps, p = [], p+1
        while p < len(s) and s[p] != ')':
            t, p = desc_type(s, p)
            ps.append(t)
        p += 1
        r, p = desc_type(s, p)
        return ("method(%s)->%s" % (", ".join(ps), r)), p
    return None, p

def pool_resolve(pool, idx):
    if idx <= 0 or idx >= len(pool) or pool[idx] is None: return "?"
    entry = pool[idx]
    t = entry[0]
    if t == "Utf8": return entry[1]
    if t == "Class": return pool_resolve(pool, entry[1]).replace('/', '.')
    if t == "String": return "#%d" % entry[1]
    if t in ("Fieldref", "Methodref", "InterfaceMethodref"):
        ci, ni = entry[1], entry[2]
        name = pool_resolve(pool, ni); desc = pool_resolve(pool, ni)
        rname = pool_resolve(pool, ci).replace('/', '.')
        if t == "Fieldref": return rname + "." + name + ":" + desc
        if t == "Methodref": return rname + "." + name + "(" + desc + ")"
        if t == "InterfaceMethodref": return rname + "." + name + "(" + desc + ")"
    return "%s#%s" % (TAG.get(pool[idx][0], str(pool[idx][0])), entry[1] if len(entry)>1 else "")

def read_u16(d, p): return struct.unpack(">H", d[p:p+2])[0], p+2
def read_u32(d, p): return struct.unpack(">I", d[p:p+4])[0], p+4
def read_i(d, p): return struct.unpack(">i", d[p:p+4])[0], p+4

def parse_pool(data, pos, count):
    """Parse constant pool with correct JVMS tag mapping.
    Returns (pool, pos, actual_entries_parsed)."""
    pool = [None] * (count + 2)
    i = 1
    while i <= count:
        if pos >= len(data):
            break
        tag = data[pos]; pos += 1
        if tag == 1:  # Utf8
            ln = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('Utf8', data[pos:pos+ln].decode("utf-8","replace")); pos += ln
            i += 1
        elif tag == 3:  # Integer
            val = struct.unpack(">i", data[pos:pos+4])[0]; pos += 4
            pool[i] = ('Integer', val); i += 1
        elif tag == 4:  # Float
            val = struct.unpack(">f", data[pos:pos+4])[0]; pos += 4
            pool[i] = ('Float', val); i += 1
        elif tag == 5:  # Long
            val = struct.unpack(">q", data[pos:pos+8])[0]; pos += 8
            pool[i] = ('Long', val); i += 1
            if i <= count: pool[i] = None; i += 1
        elif tag == 6:  # Double
            val = struct.unpack(">d", data[pos:pos+8])[0]; pos += 8
            pool[i] = ('Double', val); i += 1
            if i <= count: pool[i] = None; i += 1
        elif tag == 7:  # Class
            val = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('Class', val); i += 1
        elif tag == 8:  # String
            val = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('String', val); i += 1
        elif tag == 9:  # Fieldref
            ci = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            ni = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('Fieldref', ci, ni); i += 1
        elif tag == 10:  # Methodref
            ci = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            ni = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('Methodref', ci, ni); i += 1
        elif tag == 11:  # InterfaceMethodref
            ci = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            ni = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('InterfaceMethodref', ci, ni); i += 1
        elif tag == 12:  # NameAndType
            ni_ = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            di = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            pool[i] = ('NameAndType', ni_, di); i += 1
        else:
            break
    return pool, pos, i

def parse_attrs(data, pos, end):
    attrs = []
    while pos < end:
        k = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        ln = struct.unpack(">I", data[pos:pos+4])[0]; pos += 4
        d = data[pos:pos+ln]; pos += ln
        attrs.append({"kind": k, "len": ln, "data": d})
    return attrs

def decode_code(pool, data):
    ms, pos = read_u16(data, 0)
    ml, pos = read_u16(data, pos)
    clen, pos = read_u16(data, pos)
    code = data[pos:pos+clen]; pos += clen
    nel, pos = read_u16(data, pos)
    excs = []
    for _ in range(nel):
        sp, pos = read_u16(code, pos)
        ep, pos = read_u16(code, pos)
        hp, pos = read_u16(code, pos)
        ct, pos = read_u16(code, pos)
        excs.append((sp, ep, hp, ct))
    al, pos = read_u16(data, pos)
    attr_data = data[pos:pos+al]
    return ms, ml, code, excs, attr_data

OP = {
    0x00:(0,"NOP"),0x01:(0,"ACONST_NULL"),0x02:(0,"ICONST_M1"),0x03:(0,"ICONST_0"),
    0x04:(0,"ICONST_1"),0x05:(0,"ICONST_2"),0x06:(0,"ICONST_3"),0x07:(0,"ICONST_4"),
    0x08:(0,"ICONST_5"),0x09:(0,"LCONST_0"),0x0a:(0,"LCONST_1"),0x0b:(0,"FCONST_0"),
    0x0c:(0,"FCONST_1"),0x0d:(0,"FCONST_2"),0x0e:(0,"DCONST_0"),0x0f:(0,"DCONST_1"),
    0x10:(1,"BIPUSH"),0x11:(2,"SIPUSH"),0x12:(1,"LDC"),0x13:(2,"LDC_W"),0x14:(3,"LDC2_W"),
    0x15:(0,"ILOAD_0"),0x16:(0,"ILOAD_1"),0x17:(0,"ILOAD_2"),0x18:(0,"ILOAD_3"),
    0x19:(0,"LLOAD_0"),0x1a:(0,"LLOAD_1"),0x1b:(0,"LLOAD_2"),0x1c:(0,"LLOAD_3"),
    0x1d:(0,"FLOAD_0"),0x1e:(0,"FLOAD_1"),0x1f:(0,"FLOAD_2"),0x20:(0,"FLOAD_3"),
    0x21:(0,"DLOAD_0"),0x22:(0,"DLOAD_1"),0x23:(0,"DLOAD_2"),0x24:(0,"DLOAD_3"),
    0x25:(0,"ALOAD_0"),0x26:(0,"ALOAD_1"),0x27:(0,"ALOAD_2"),0x28:(0,"ALOAD_3"),
    0x2a:(1,"ILOAD"),0x2b:(1,"LLOAD"),0x2c:(1,"FLOAD"),0x2d:(1,"DLOAD"),0x2e:(1,"ALOAD"),
    0x36:(1,"ISTORE"),0x37:(1,"LSTORE"),0x38:(1,"FSTORE"),0x39:(1,"DSTORE"),0x3a:(1,"ASTORE"),
    0x3b:(0,"ISTORE_0"),0x3c:(0,"ISTORE_1"),0x3d:(0,"ISTORE_2"),0x3e:(0,"ISTORE_3"),
    0x3f:(0,"LSTORE_0"),0x40:(0,"LSTORE_1"),0x41:(0,"LSTORE_2"),0x42:(0,"LSTORE_3"),
    0x43:(0,"FSTORE_0"),0x44:(0,"FSTORE_1"),0x45:(0,"FSTORE_2"),0x46:(0,"FSTORE_3"),
    0x47:(0,"DSTORE_0"),0x48:(0,"DSTORE_1"),0x49:(0,"DSTORE_2"),0x4a:(0,"DSTORE_3"),
    0x4b:(0,"ASTORE_0"),0x4c:(0,"ASTORE_1"),0x4d:(0,"ASTORE_2"),0x4e:(0,"ASTORE_3"),
    0x5f:(0,"POP"),0x5e:(0,"POP2"),0x5d:(0,"DUP"),0x5c:(0,"DUP_X1"),0x5b:(0,"DUP_X2"),
    0x5a:(0,"DUP2"),0x59:(0,"DUP2_X1"),0x58:(0,"DUP2_X2"),0x57:(0,"SWAP"),
    0x60:(1,"GETSTATIC"),0x61:(1,"PUTSTATIC"),0x62:(1,"GETFIELD"),0x63:(1,"PUTFIELD"),
    0x64:(3,"INVOKEVIRTUAL"),0x65:(3,"INVOKESPECIAL"),0x66:(3,"INVOKESTATIC"),
    0x67:(3,"INVOKEINTERFACE"),0x68:(5,"INVOKEDYNAMIC"),
    0x69:(1,"INVOKEDYNAMIC_LEGACY"),
    0x6a:(1,"NEW"),0x6b:(1,"NEWARRAY"),0x6c:(2,"ANEWARRAY"),0x6d:(0,"ARRAYlength"),
    0x6e:(1,"INSTANCEOF"),0x6f:(1,"CHECKCAST"),
    0x70:(1,"IF_ICMPEQ"),0x71:(1,"IF_ICMPNE"),0x72:(1,"IF_ICMPLT"),0x73:(1,"IF_ICMPGE"),
    0x74:(1,"IF_ICMPGT"),0x75:(1,"IF_ICMPLE"),0x76:(1,"IF_ACMPEQ"),0x77:(1,"IF_ACMPNE"),
    0x78:(2,"GOTO"),0x79:(1,"JSR"),0x7a:(1,"RET"),
    0x7b:(0,"TABLESWITCH"),0x7c:(0,"LOOKUPSWITCH"),
    0x7d:(0,"IRETURN"),0x7e:(0,"LRETURN"),0x7f:(0,"FRETURN"),0x80:(0,"DRETURN"),
    0x81:(0,"ARETURN"),0x82:(0,"RETURN"),
    0x83:(1,"THROW"),
    0x88:(1,"MONITORENTER"),0x89:(0,"MONITOREXIT"),0x8a:(2,"MULTIANEWARRAY"),
    0x91:(1,"IFNULL"),0x92:(1,"IFNONNULL"),
    0x93:(2,"IF_GOTO_W"),0x94:(2,"IF_ICMPEQ_W"),0x95:(2,"IF_ICMPNE_W"),0x96:(2,"IF_ICMPLT_W"),
    0x97:(2,"IF_ICMPGE_W"),0x98:(2,"IF_ICMPGT_W"),0x99:(2,"IF_ICMPLE_W"),
    0x9a:(2,"IF_ACMPEQ_W"),0x9b:(2,"IF_ACMPNE_W"),0x9c:(2,"IF_GOTO_W"),
    0x9d:(2,"IFNULL_W"),0x9e:(2,"IFNONNULL_W"),
    0xb0:(0,"IADD"),0xb1:(0,"LADD"),0xb2:(0,"FADD"),0xb3:(0,"DADD"),
    0xb4:(0,"ISUB"),0xb5:(0,"LSUB"),0xb6:(0,"FSUB"),0xb7:(0,"DSUB"),
    0xb8:(0,"IMUL"),0xb9:(0,"LMUL"),0xba:(0,"FMUL"),0xbb:(0,"DMUL"),
    0xbc:(0,"IDIV"),0xbd:(0,"LDIV"),0xbe:(0,"FDIV"),0xbf:(0,"DDIV"),
    0xc0:(0,"IREM"),0xc1:(0,"LREM"),0xc2:(0,"FREM"),0xc3:(0,"DREM"),
    0xc4:(0,"INEG"),0xc5:(0,"LNEG"),0xc6:(0,"FNEG"),0xc7:(0,"DNEG"),
    0xc8:(0,"ISHL"),0xc9:(0,"ISHR"),0xca:(0,"IUSHR"),0xcb:(0,"LSHL"),
    0xcc:(0,"LSHR"),0xcd:(0,"LUSHR"),0xce:(0,"IAND"),0xcf:(0,"LAND"),
    0xd0:(0,"IOR"),0xd1:(0,"LOR"),0xd2:(0,"IXOR"),0xd3:(0,"LXOR"),
    0xd4:(2,"IINC"),
    0xd5:(0,"I2L"),0xd6:(0,"I2F"),0xd7:(0,"I2D"),0xd8:(0,"L2I"),
    0xd9:(0,"L2F"),0xda:(0,"L2D"),0xdb:(0,"F2I"),0xdc:(0,"F2L"),
    0xdd:(0,"F2D"),0xde:(0,"D2I"),0xdf:(0,"D2L"),0xe0:(0,"D2F"),
}

def disasm_step(pool, code, pos):
    if pos >= len(code): return pos+1, "END"
    b = code[pos]; pos += 1
    if b in OP:
        sz, name = OP[b]
        if sz == 0: return pos, name
        if sz == 1:
            idx, _ = read_u16(code, pos)
            return pos+2, "%s #%d %s" % (name, idx, pool_resolve(pool, idx))
        if sz == 2:
            if b == 0x11:
                val, _ = struct.unpack(">h", code[pos:pos+2])
                return pos+2, "%s %d" % ("SIPUSH", val)
            if b == 0xd4:
                ln, _ = read_u16(code, pos)
                vd, _ = struct.unpack(">b", code[ln:ln+1])
                return ln+3, "%s #%d %d" % ("IINC", ln, vd)
            off, _ = read_u16(code, pos)
            if b in (0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e):
                return pos+2, "%s %d" % (name, off)
            return pos+2, "%s #%d %s" % (name, off, pool_resolve(pool, off))
        if sz == 3:
            ci, p2 = read_u16(code, pos)
            ni, _ = read_u16(code, p2)
            if b == 0x6b:
                return p2+2, "NEWARRAY %s" % {0:"int",1:"boolean",2:"char",4:"byte",5:"short",6:"float",7:"double",8:"long"}.get(ni, str(ni))
            if b in (0x64,0x65,0x66,0x67):
                tag = "INVOKEVIRTUAL" if b==0x64 else ("INVOKESPECIAL" if b==0x65 else ("INVOKESTATIC" if b==0x66 else "INVOKEINTERFACE"))
                return p2+2, "%s #%d %s" % (tag, ci, pool_resolve(pool, ci))
            return p2+2, "%s" % name
        if sz == 5:
            bmi, p2 = read_u16(code, pos)
            ni, p3 = read_u16(code, p2)
            return p3+2, "%s #%d #%d" % ("INVOKEDYNAMIC", bmi, ni)
        return pos+sz, "%s" % name
    return pos, "BYTE 0x%02X" % b

def disasm(pool, code):
    lines = []; pos = 0; ln = 0
    while pos < len(code):
        op_start = pos
        pos, name = disasm_step(pool, code, pos)
        lines.append((ln, op_start, name)); ln += 1
    return lines

def try_parse_header(data, pos, cp_count):
    """Check if bytes at pos form a valid class header."""
    if pos + 10 > len(data):
        return False
    af = struct.unpack(">H", data[pos:pos+2])[0]
    this_ = struct.unpack(">H", data[pos+2:pos+4])[0]
    super_ = struct.unpack(">H", data[pos+4:pos+6])[0]
    ni = struct.unpack(">H", data[pos+6:pos+8])[0]
    nfields = struct.unpack(">H", data[pos+8:pos+10])[0]
    if af == 0:
        return False
    if this_ == 0 or this_ > cp_count + 1:
        return False
    if super_ == 0 or super_ > cp_count + 1:
        return False
    expected_min = pos + 10 + 2 * ni + 2 * nfields
    if expected_min > len(data):
        return False
    return True

class Parser:
    def __init__(self, data):
        if data[:4] != b'\xCA\xFE\xBA\xBE':
            raise ValueError("非 .class 文件")
        self.major = struct.unpack(">H", data[6:8])[0]
        self.minor = struct.unpack(">H", data[4:6])[0]
        cp_count = struct.unpack(">H", data[8:10])[0]
        # Parse pool, then validate header; fallback by reducing cp_count
        pool, pos, actual = parse_pool(data, 10, cp_count)
        while not try_parse_header(data, pos, cp_count) and cp_count > 0:
            cp_count -= 1
            pool, pos, actual = parse_pool(data, 10, cp_count)
        self.pool = pool
        self.access = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        self.this = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        self.super_ = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        ni = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        self.interfaces = []
        for j in range(ni):
            self.interfaces.append(struct.unpack(">H", data[pos:pos+2])[0]); pos += 2
        nfields = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        self.fields = []
        for _ in range(nfields):
            af = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            ni_ = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            di = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            aa_len = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            aa = parse_attrs(data, pos, pos + aa_len); pos += aa_len
            self.fields.append({"access": af, "name_idx": ni_, "desc_idx": di, "attrs": aa})
        nmethods = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
        self.methods = []
        for _ in range(nmethods):
            af = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            mi = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            di_ = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            aa_len = struct.unpack(">H", data[pos:pos+2])[0]; pos += 2
            aa = parse_attrs(data, pos, pos + aa_len); pos += aa_len
            self.methods.append({"access": af, "name_idx": mi, "desc_idx": di_, "attrs": aa})

    def name(self, idx): return pool_resolve(self.pool, idx)

    def fmt_class(self, out):
        out.append("="*80)
        out.append("类: %s  (super: %s)" % (self.name(self.this).replace('/','.'), self.name(self.super_).replace('/','.')))
        out.append("版本: %d.%d  标志: %s" % (self.major, self.minor, acc_str(self.access, ACC_CLASS)))
        out.append("接口: %s" % ", ".join(self.name(i).replace('/','.') for i in self.interfaces))
        out.append("")
        out.append("--- 字段(%d) ---" % len(self.fields))
        for f in self.fields:
            out.append("  %s %s:%s" % (acc_str(f["access"], ACC_FIELD), self.name(f["name_idx"]), self.name(f["desc_idx"])))
            for a in f["attrs"]:
                out.append("    attr(%d) len=%d" % (a["kind"], a["len"]))
        out.append("")
        out.append("--- 方法(%d) ---" % len(self.methods))
        for m in self.methods:
            out.append("  %s %s%s" % (acc_str(m["access"], ACC_METHOD), self.name(m["name_idx"]), self.name(m["desc_idx"])))
            has_code = False
            for a in m["attrs"]:
                if a["kind"] == 4:
                    has_code = True
                    ms, ml, code, excs, ad = decode_code(self.pool, a["data"])
                    out.append("    [Code] 栈=%d 局=%d 字节=%d 异常=%d" % (ms, ml, len(code), len(excs)))
                    for ln, off, nm in disasm(self.pool, code):
                        out.append("      %4d %5d | %s" % (ln, off, nm))
                    for s,e,h,t in excs:
                        out.append("      [exc %d-%d handler=#%d]" % (s, e, t))
            if not has_code:
                out.append("    [abstract/native/...]")
        out.append("")

def main():
    jar = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "1-解包产物", "类文件")
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "4-文档", "字节码")
    os.makedirs(out, exist_ok=True)
    classes = []
    if os.path.isdir(jar):
        for root, dirs, fs in os.walk(jar):
            for fn in fs:
                if fn.endswith(".class"):
                    classes.append((os.path.join(root, fn), "local"))
    else:
        z = zipfile.ZipFile(jar)
        for n in sorted(z.namelist()):
            if n.endswith(".class"):
                classes.append((n, "zip"))
        z.close()
    ok = bad = 0
    for path, kind in classes:
        try:
            data = open(path, "rb").read() if kind == "local" else zipfile.ZipFile(jar).read(path)
            p = Parser(data)
            out_name = os.path.basename(path).replace(".class", ".txt")
            lines = []
            p.fmt_class(lines)
            with open(os.path.join(out, out_name), "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
            ok += 1
        except Exception as e:
            print("ERR", path, type(e).__name__, e)
            bad += 1
    print("完成: 成功%d 失败%d  总处理%d" % (ok, bad, ok+bad))

if __name__ == "__main__":
    main()
