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
  // Sanitizar chave PIX: remover todos os caracteres não numéricos (para CNPJ/CPF)
  const sanitizedKey = key.replace(/\D/g, ''); // Remove tudo que não é dígito

  // Validar chave PIX
  if (!sanitizedKey || sanitizedKey.length === 0) {
    throw new Error('Chave PIX inválida');
  }

  // Determinar tipo de chave (CNPJ tem 14 dígitos, CPF tem 11)
  let gui = 'BR.GOV.BCB.PIX';
  let keyType = '01'; // 01 = CNPJ, 02 = CPF, 03 = Email, 04 = Telefone, 25 = Chave Aleatória

  if (sanitizedKey.length === 14) {
    keyType = '01'; // CNPJ
  } else if (sanitizedKey.length === 11) {
    keyType = '02'; // CPF
  } else {
    // Para outros formatos, assumir CNPJ por padrão
    keyType = '01';
  }

  const sanitizedName = normalize(merchantName, 25);
  const sanitizedCity = normalize(merchantCity, 15) || 'BRASIL';
  // Garantir que txId tenha no máximo 25 caracteres e pelo menos 1
  const sanitizedTxId = normalize(txId || 'SGCI', 25).slice(0, 25) || 'SGCI';
  const amountString = amount > 0 ? amount.toFixed(2) : undefined;

  // Construir merchantAccountInfo (campo 26)
  // Para CNPJ: Campo 00 (GUI) + Campo 01 (chave CNPJ)
  // Para CPF: Campo 00 (GUI) + Campo 02 (chave CPF)
  // Estrutura: 00 + tamanho + GUI + keyType + tamanho + chave
  const guiField = emvField('00', gui);
  const keyField = emvField(keyType, sanitizedKey);
  const merchantAccountInfo = guiField + keyField;

  // Validar tamanho do merchantAccountInfo (máximo 99 caracteres conforme padrão EMV)
  if (merchantAccountInfo.length > 99) {
    throw new Error(`Merchant Account Information muito grande: ${merchantAccountInfo.length} caracteres (máximo 99)`);
  }

  // Validar que a chave tem o tamanho correto
  if (keyType === '01' && sanitizedKey.length !== 14) {
    throw new Error(`CNPJ deve ter 14 dígitos, encontrado: ${sanitizedKey.length}`);
  }
  if (keyType === '02' && sanitizedKey.length !== 11) {
    throw new Error(`CPF deve ter 11 dígitos, encontrado: ${sanitizedKey.length}`);
  }

  // Construir additionalData (campo 62)
  const additionalData = emvField('05', sanitizedTxId);

  // Construir payload principal
  let payload = '';
  payload += emvField('00', '01'); // Payload Format Indicator
  payload += emvField('01', amountString ? '12' : '11'); // Point of Initiation Method (12 = único, 11 = reutilizável)
  payload += emvField('26', merchantAccountInfo); // Merchant Account Information
  payload += emvField('52', '0000'); // Merchant Category Code
  payload += emvField('53', '986'); // Transaction Currency (986 = BRL)

  if (amountString) {
    payload += emvField('54', amountString); // Transaction Amount
  }

  payload += emvField('58', 'BR'); // Country Code
  payload += emvField('59', sanitizedName || 'DUARTE URBANISMO'); // Merchant Name
  payload += emvField('60', sanitizedCity); // Merchant City
  payload += emvField('62', additionalData); // Additional Data Field Template

  // Adicionar CRC
  const payloadWithCRC = `${payload}6304`;
  const crc = crc16(payloadWithCRC);
  return `${payloadWithCRC}${crc}`;
}

export const DEFAULT_PIX_KEY = '47.200.760/0001-06';
