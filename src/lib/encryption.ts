import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// The application-wide master key helps encrypt the DB at rest transparently.
const masterKeyHex = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

function getMasterKey() {
  return Buffer.from(masterKeyHex, 'hex');
}

/**
 * Encrypts a plaintext string into a highly secure AES-GCM ciphertext payload
 * Format: iv.salt.ciphertext.tag (base64 encoded parts)
 */
export function encryptMessage(plaintext: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive a unique key for this specific encryption using PBKDF2
    const key = crypto.pbkdf2Sync(getMasterKey(), salt, 100000, KEY_LENGTH, 'sha512');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('base64')}.${salt.toString('base64')}.${encrypted}.${tag.toString('base64')}`;
  } catch (err) {
    console.error("Encryption failed:", err);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts a payload formatted as iv.salt.ciphertext.tag back to plaintext
 */
export function decryptMessage(encryptedPayload: string): string {
  // If the message is not in the encrypted format (e.g. older messages or system messages), return as is
  if (!encryptedPayload.includes('.')) {
    return encryptedPayload;
  }
  
  try {
    const parts = encryptedPayload.split('.');
    if (parts.length !== 4) return encryptedPayload;
    
    const [ivBase64, saltBase64, ciphertext, tagBase64] = parts;
    
    const iv = Buffer.from(ivBase64, 'base64');
    const salt = Buffer.from(saltBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    
    const key = crypto.pbkdf2Sync(getMasterKey(), salt, 100000, KEY_LENGTH, 'sha512');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    // Return a placeholder so the UI doesn't crash on corrupted messages
    return "This message could not be decrypted.";
  }
}
