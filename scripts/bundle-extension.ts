import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export interface ZipEntry {
  name: string;
  data: Buffer;
}

export function buildZip(files: ZipEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const filenameBuf = Buffer.from(file.name, "utf-8");
    const dataBuf = file.data;
    const uncompressedSize = dataBuf.length;
    const crc = zlib.crc32(dataBuf);
    const compressedData = zlib.deflateRawSync(dataBuf);
    const compressedSize = compressedData.length;

    // Local File Header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + filenameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed (2.0)
    localHeader.writeUInt16LE(0, 6); // general flags
    localHeader.writeUInt16LE(8, 8); // compression method (deflate)
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14); // crc32
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(filenameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field len
    filenameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, compressedData);

    // Central Directory Header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46 + filenameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(8, 10); // compression method (deflate)
    centralHeader.writeUInt16LE(0, 12); // mod time
    centralHeader.writeUInt16LE(0, 14); // mod date
    centralHeader.writeUInt32LE(crc, 16); // crc32
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(filenameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field len
    centralHeader.writeUInt16LE(0, 32); // comment len
    centralHeader.writeUInt16LE(0, 34); // disk start
    centralHeader.writeUInt16LE(0, 36); // internal attrs
    centralHeader.writeUInt32LE(0, 38); // external attrs
    centralHeader.writeUInt32LE(offset, 42); // relative offset of local header
    filenameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);

    offset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((acc, b) => acc + b.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk num
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(files.length, 8); // entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12); // size of central dir
  eocd.writeUInt32LE(centralDirOffset, 16); // offset of central dir
  eocd.writeUInt16LE(0, 20); // comment len

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export function getExtensionFiles(extensionDir: string): ZipEntry[] {
  const entries: ZipEntry[] = [];

  function walk(currentDir: string, relativePath: string = "") {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      if (item.name === ".DS_Store" || item.name === "_metadata") {
        continue;
      }
      const fullPath = path.join(currentDir, item.name);
      const relItemPath = relativePath ? `${relativePath}/${item.name}` : item.name;

      if (item.isDirectory()) {
        walk(fullPath, relItemPath);
      } else if (item.isFile()) {
        entries.push({
          name: relItemPath,
          data: fs.readFileSync(fullPath),
        });
      }
    }
  }

  walk(extensionDir);
  return entries;
}

// When executed directly, generate public/repopilot-extension.zip
if (process.argv[1]?.includes("bundle-extension")) {
  const projectRoot = path.resolve(__dirname, "..");
  const extDir = path.join(projectRoot, "extension");
  const publicDir = path.join(projectRoot, "public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const files = getExtensionFiles(extDir);
  const zipBuffer = buildZip(files);
  const outPath = path.join(publicDir, "repopilot-extension.zip");
  fs.writeFileSync(outPath, zipBuffer);
  console.log(`Successfully bundled extension: ${outPath} (${zipBuffer.length} bytes, ${files.length} files)`);
}
