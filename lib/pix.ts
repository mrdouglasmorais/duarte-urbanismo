interface PixPayloadOptions {
  key: string;
  amount: number;
  merchantName: string;
  merchantCity: string;
  txId: string;
}

const POLYNOMIAL = 0x1021;

const normalize = (value: string, maxLength: number): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/gi, '')
    .trim()
    .toUpperCase()
    .slice(0, maxLength);

const emvField = (id: string, value: string): string => {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
};

const crc16 = (payload: string): string => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ POLYNOMIAL;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

export function buildStaticPixPayload({ key, amount, merchantName, merchantCity, txId }: PixPayloadOptions): string {
  const sanitizedKey = key.replace(/\s+/g, '').replace(/[.-]/g, '');
  const sanitizedName = normalize(merchantName, 25);
  const sanitizedCity = normalize(merchantCity, 15) || 'BRASIL';
  // Garantir que txId tenha no máximo 25 caracteres e pelo menos 1
  const sanitizedTxId = normalize(txId || 'SGCI', 25).slice(0, 25) || 'SGCI';
  const amountString = amount > 0 ? amount.toFixed(2) : undefined;

  const merchantAccountInfo = emvField('00', 'BR.GOV.BCB.PIX') + emvField('01', sanitizedKey);
  const additionalData = emvField('05', sanitizedTxId);

  let payload = '';
  payload += emvField('00', '01');
  payload += emvField('01', amountString ? '12' : '11');
  payload += emvField('26', merchantAccountInfo);
  payload += emvField('52', '0000');
  payload += emvField('53', '986');
  if (amountString) {
    payload += emvField('54', amountString);
  }
  payload += emvField('58', 'BR');
  payload += emvField('59', sanitizedName || 'DUARTE URBANISMO');
  payload += emvField('60', sanitizedCity);
  payload += emvField('62', additionalData);

  const payloadWithCRC = `${payload}6304`;
  const crc = crc16(payloadWithCRC);
  return `${payloadWithCRC}${crc}`;
}

export const DEFAULT_PIX_KEY = '47.200.760/0001-06';
