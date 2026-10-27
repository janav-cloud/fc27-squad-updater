/**
 * RefPack Decompression and EA SPORTS FC Squad Save File Generator
 * 
 * Standalone client-side implementation of:
 * 1. EA RefPack / QFS LZ-based decompression algorithm.
 * 2. EA SPORTS FC / FIFA save file format packaging (FBCHUNKS, main header, BNRY).
 */

// Magic signatures
const T3DB = new Uint8Array([0x44, 0x42, 0x00, 0x08]); // 'DB\0\x08'
const FBCHUNKS = new Uint8Array([0x46, 0x42, 0x43, 0x48, 0x55, 0x4E, 0x4B, 0x53, 0x01, 0x00]); // 'FBCHUNKS\x01\x00'
const BNRY = new Uint8Array([
    0x42, 0x4E, 0x52, 0x59, 0x00, 0x00, 0x00, 0x02,
    0x4C, 0x54, 0x4C, 0x45, 0x01, 0x01, 0x03, 0x00,
    0x00, 0x00, 0x63, 0x64, 0x73, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x01, 0x03, 0x00, 0x00, 0x00, 0x63,
    0x64, 0x73
]);

/**
 * Decompresses an EA RefPack compressed buffer into raw database bytes.
 * 
 * @param {Uint8Array} data - Compressed byte array from .bin file
 * @returns {{ outbuf: Uint8Array, size: number }} Decompressed database buffer and target size
 */
function unpackRefpack(data) {
    if (!data || data.length < 10) {
        throw new Error('Invalid file: buffer is too short for a RefPack header (min 10 bytes).');
    }

    // RefPack command flags
    const SHORT_COPY = 0x80;
    const MEDIUM_COPY = 0x40;
    const LONG_COPY = 0x20;

    // Big-endian 3-byte unpacked size at offsets [2:5]
    const size = (data[2] << 16) | (data[3] << 8) | data[4];
    if (size <= 0 || size > 500 * 1024 * 1024) {
        throw new Error(`Invalid unpacked size header: ${size} bytes.`);
    }

    const outbuf = new Uint8Array(size);
    outbuf.set(T3DB, 0);

    let ipos = 10;           // RefPack data payload starts at index 10
    let opos = T3DB.length;  // 4
    const inLen = data.length;
    const outLen = outbuf.length;
    let lastControl = 0;

    while (ipos < inLen && opos < outLen) {
        const control = data[ipos++];
        lastControl = control;

        // Command 1: Short copy (0x00 - 0x7F)
        if (!(control & SHORT_COPY)) {
            if (ipos >= inLen) break;
            const b1 = data[ipos++];
            const lit = control & 3;
            if (lit) {
                const copyLit = Math.min(lit, inLen - ipos, outLen - opos);
                outbuf.set(data.subarray(ipos, ipos + copyLit), opos);
                ipos += lit;
                opos += copyLit;
            }
            const length = ((control >> 2) & 7) + 3;
            const offset = b1 + ((control & 0x60) << 3) + 1;
            let src = opos - offset;
            for (let i = 0; i < length && opos < outLen; i++) {
                outbuf[opos++] = outbuf[src++];
            }
        }
        // Command 2: Medium copy (0x80 - 0xBF)
        else if (!(control & MEDIUM_COPY)) {
            if (ipos + 1 >= inLen) break;
            const b2 = data[ipos++];
            const b3 = data[ipos++];
            const lit = b2 >> 6;
            if (lit) {
                const copyLit = Math.min(lit, inLen - ipos, outLen - opos);
                outbuf.set(data.subarray(ipos, ipos + copyLit), opos);
                ipos += lit;
                opos += copyLit;
            }
            const length = (control & 0x3F) + 4;
            const offset = (((b2 & 0x3F) << 8) | b3) + 1;
            let src = opos - offset;
            for (let i = 0; i < length && opos < outLen; i++) {
                outbuf[opos++] = outbuf[src++];
            }
        }
        // Command 3: Long copy (0xC0 - 0xDF)
        else if (!(control & LONG_COPY)) {
            if (ipos + 2 >= inLen) break;
            const b2 = data[ipos++];
            const b3 = data[ipos++];
            const b4 = data[ipos++];
            const lit = control & 3;
            if (lit) {
                const copyLit = Math.min(lit, inLen - ipos, outLen - opos);
                outbuf.set(data.subarray(ipos, ipos + copyLit), opos);
                ipos += lit;
                opos += copyLit;
            }
            const length = b4 + ((control & 0x0C) << 6) + 5;
            const offset = (((control & 0x10) << 12) | (b2 << 8) | b3) + 1;
            let src = opos - offset;
            for (let i = 0; i < length && opos < outLen; i++) {
                outbuf[opos++] = outbuf[src++];
            }
        }
        // Command 4: Literal block (0xE0 - 0xFF)
        else {
            const lit = (control & 0x1F) * 4 + 4;
            if (lit > 0x70) {
                break; // End of compressed stream sentinel
            }
            const copyLen = Math.min(lit, inLen - ipos, outLen - opos);
            outbuf.set(data.subarray(ipos, ipos + copyLen), opos);
            ipos += copyLen;
            opos += copyLen;
        }
    }

    // Trailing literal bytes check
    const trailing = lastControl & 3;
    if (trailing && opos < outLen) {
        const copyLen = Math.min(trailing, inLen - ipos, outLen - opos);
        outbuf.set(data.subarray(ipos, ipos + copyLen), opos);
        opos += copyLen;
    }

    return { outbuf, size };
}

/**
 * Encapsulates decompressed database bytes into EA SPORTS FC Squad Save format (.squad file).
 * 
 * @param {Uint8Array} decompressedBuf - Raw decompressed DB bytes
 * @param {string} filename - Target filename (e.g., 'Squads20261027000000')
 * @param {string} author - Author tag signature (default: 'JanavDua7')
 * @param {boolean} isFut - Force FUT save format or infer from filename
 * @returns {Uint8Array} Complete save file ready to place into the FC settings directory
 */
function buildSquadFile(decompressedBuf, filename, author = "JanavDua7", isFut = false) {
    if (!decompressedBuf || !(decompressedBuf instanceof Uint8Array)) {
        throw new Error('Decompressed buffer must be a valid Uint8Array.');
    }

    const isFutSquad = isFut || filename.toLowerCase().includes("fut");
    const dbSize = decompressedBuf.length;

    const encoder = new TextEncoder();
    const saveTypeSquads = encoder.encode("SaveType_Squads\0");
    const saveTypeFut = encoder.encode("SaveType_FUTSqu\0");
    const authorSign = encoder.encode(author || "JanavDua7");

    const prefixHeaderSize = 1126;
    const mainHeaderSize = 48;
    const bnrySize = isFutSquad ? 0 : 45985;
    const fileSize = mainHeaderSize + 4 + dbSize + bnrySize;

    // 1. Construct Prefix Header (1126 bytes)
    const prefixHeader = new Uint8Array(prefixHeaderSize);
    let pos = 0;

    // FBCHUNKS magic
    prefixHeader.set(FBCHUNKS, pos);
    pos += FBCHUNKS.length;

    // Main header offset (little-endian 32-bit int)
    const mainHeaderOffset = prefixHeaderSize - pos - 8;
    const viewPrefix = new DataView(prefixHeader.buffer);
    viewPrefix.setUint32(pos, mainHeaderOffset, true);
    pos += 4;

    // File size excluding prefix header (little-endian 32-bit int)
    viewPrefix.setUint32(pos, fileSize, true);
    pos += 4;

    // In-game name string (max 40 bytes)
    const ingameNameStr = `EA_${filename}`.slice(0, 40);
    const ingameNameBytes = encoder.encode(ingameNameStr);
    prefixHeader.set(ingameNameBytes, pos);
    pos += ingameNameBytes.length;

    // Author signature offset
    const signSize = isFutSquad ? 4 : 7;
    pos += signSize;
    if (pos + authorSign.length <= prefixHeaderSize) {
        prefixHeader.set(authorSign, pos);
    }

    // 2. Construct Main Header (48 bytes)
    const mainHeader = new Uint8Array(mainHeaderSize);
    const saveType = isFutSquad ? saveTypeFut : saveTypeSquads;
    mainHeader.set(saveType, 0);

    // CRC32 location placeholder (zeros as in original python tool)
    const crcPos = saveType.length;
    const viewMain = new DataView(mainHeader.buffer);
    viewMain.setUint32(crcPos, 0, true);

    // 3. Data section size (little-endian 32-bit int)
    const dataSizeBuf = new Uint8Array(4);
    const viewDataSize = new DataView(dataSizeBuf.buffer);
    const dataSize = isFutSquad ? 0 : (dbSize + bnrySize);
    viewDataSize.setUint32(0, dataSize, true);

    // 4. BNRY section (45,985 bytes for regular squads)
    let bnrySection = null;
    if (!isFutSquad) {
        bnrySection = new Uint8Array(bnrySize);
        bnrySection.set(BNRY, 0);
    }

    // Combine all sections into the final save file buffer
    const totalLength = prefixHeaderSize + mainHeaderSize + 4 + dbSize + (bnrySection ? bnrySize : 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    result.set(prefixHeader, offset);
    offset += prefixHeaderSize;

    result.set(mainHeader, offset);
    offset += mainHeaderSize;

    result.set(dataSizeBuf, offset);
    offset += 4;

    result.set(decompressedBuf, offset);
    offset += dbSize;

    if (bnrySection) {
        result.set(bnrySection, offset);
        offset += bnrySize;
    }

    return result;
}

// Global browser window export for non-module usage
if (typeof window !== 'undefined') {
    window.unpackRefpack = unpackRefpack;
    window.buildSquadFile = buildSquadFile;
    window.T3DB = T3DB;
    window.FBCHUNKS = FBCHUNKS;
    window.BNRY = BNRY;
}

