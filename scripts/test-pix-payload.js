// Script para testar a geração do payload PIX
const { buildStaticPixPayload } = require('../lib/pix.ts');

const testCases = [
  {
    key: '47.200.760/0001-06',
    amount: 100.50,
    merchantName: 'DUARTE URBANISMO',
    merchantCity: 'Florianopolis',
    txId: 'TEST123'
  }
];

console.log('🧪 Testando geração de payload PIX...\n');

testCases.forEach((testCase, index) => {
  try {
    console.log(`Teste ${index + 1}:`);
    console.log('  Chave:', testCase.key);
    console.log('  Valor:', testCase.amount);
    console.log('  Nome:', testCase.merchantName);
    console.log('  Cidade:', testCase.merchantCity);
    console.log('  TX ID:', testCase.txId);

    const payload = buildStaticPixPayload(testCase);
    console.log('  ✅ Payload gerado:', payload);
    console.log('  Tamanho:', payload.length);
    console.log('');
  } catch (error) {
    console.error(`  ❌ Erro:`, error.message);
    console.error('  Stack:', error.stack);
    console.log('');
  }
});

