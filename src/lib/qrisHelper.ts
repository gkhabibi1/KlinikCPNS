// Algoritma CRC16-CCITT standar EMVCo
export function calculateCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    crc ^= c << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export const STATIC_QRIS =
  '00020101021126760024ID.CO.SPEEDCASH.MERCHANT01189360081530004988150215ID10260049881540303UKE51440014ID.CO.QRIS.WWW0215ID10265933350800303UKE5204737253033605802ID5921TOKO JUALANDIGITAL ID6008WONOGIRI61055769362330509S4410423601091276948360703A016304BBB6';

export function generateDynamicQRIS(amount: number): string {
  // 1. Potong 8 karakter CRC terakhir (6304BBB6)
  let payload = STATIC_QRIS.slice(0, -8);

  // 2. Ubah tipe dari statis (11) ke dinamis (12)
  payload = payload.replace('010211', '010212');

  // 3. Susun Tag 54 (Nominal)
  const amountStr = Math.round(amount).toString();
  const lenStr = String(amountStr.length).padStart(2, '0');
  const tag54 = `54${lenStr}${amountStr}`;

  // 4. Sisipkan sebelum Tag 5802ID
  const insertIndex = payload.indexOf('5802ID');
  if (insertIndex === -1) {
    throw new Error('Format QRIS statis tidak valid: tag 5802ID tidak ditemukan.');
  }
  payload = payload.slice(0, insertIndex) + tag54 + payload.slice(insertIndex);

  // 5. Tambahkan tag CRC awal dan hitung checksum
  payload += '6304';
  const checksum = calculateCRC16(payload);

  return payload + checksum;
}

/**
 * Generate kode unik 3 digit (100 - 999) yang tidak bentrok
 * dengan pesanan pending yang masih aktif dalam 24 jam terakhir.
 */
export async function getAvailableUniqueCode(
  checkIsCodeActive: (code: number) => Promise<boolean>
): Promise<number> {
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = Math.floor(Math.random() * 900) + 100;
    const isUsed = await checkIsCodeActive(code);
    if (!isUsed) {
      return code;
    }
  }
  // Fallback jika padat
  return Math.floor(Math.random() * 900) + 100;
}
