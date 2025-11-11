export function numeroParaExtenso(numero: number): string {
  const unidades = [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'
  ];
  const dezenaDez = [
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze',
    'dezesseis', 'dezessete', 'dezoito', 'dezenove'
  ];
  const dezenas = [
    '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
    'sessenta', 'setenta', 'oitenta', 'noventa'
  ];
  const centenas = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
  ];

  if (numero === 0) return 'zero reais';
  if (numero === 100) return 'cem reais';

  const reais = Math.floor(numero);
  const centavos = Math.round((numero - reais) * 100);

  let extenso = '';

  // Milhares
  const milhares = Math.floor(reais / 1000);
  const restoMilhares = reais % 1000;

  if (milhares > 0) {
    if (milhares === 1) {
      extenso = 'mil';
    } else {
      extenso = converterCentenas(milhares) + ' mil';
    }
  }

  if (restoMilhares > 0) {
    if (extenso !== '') extenso += ' ';
    extenso += converterCentenas(restoMilhares);
  }

  extenso += reais === 1 ? ' real' : ' reais';

  if (centavos > 0) {
    extenso += ' e ' + converterCentenas(centavos);
    extenso += centavos === 1 ? ' centavo' : ' centavos';
  }

  return extenso;

  function converterCentenas(num: number): string {
    if (num === 0) return '';

    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;

    let resultado = '';

    if (c > 0) {
      resultado = centenas[c];
    }

    if (d === 1) {
      if (resultado !== '') resultado += ' e ';
      resultado += dezenaDez[u];
      return resultado;
    }

    if (d > 0) {
      if (resultado !== '') resultado += ' e ';
      resultado += dezenas[d];
    }

    if (u > 0) {
      if (resultado !== '' && d > 0) resultado += ' e ';
      else if (resultado !== '') resultado += ' e ';
      resultado += unidades[u];
    }

    return resultado;
  }
}

export function gerarHash(dados: string): string {
  let hash = 0;
  for (let i = 0; i < dados.length; i++) {
    const char = dados.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function formatarData(data: string): string {
  const d = new Date(data + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatarCPFCNPJ(valor: string): string {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 11) {
    // CPF: 000.000.000-00
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numeros.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return valor;
}

