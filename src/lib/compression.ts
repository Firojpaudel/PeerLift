import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Compresses a string using GZIP and returns a base64 encoded string.
 */
export async function compressString(text: string): Promise<string> {
  if (!text) return '';
  const buffer = Buffer.from(text, 'utf-8');
  const compressed = await gzip(buffer);
  return compressed.toString('base64');
}

/**
 * Decompresses a base64 encoded GZIP string.
 */
export async function decompressString(compressedBase64: string): Promise<string> {
  if (!compressedBase64) return '';
  const buffer = Buffer.from(compressedBase64, 'base64');
  const decompressed = await gunzip(buffer);
  return decompressed.toString('utf-8');
}
