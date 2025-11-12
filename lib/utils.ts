export function numeroParaExtenso(numero: number): string {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenaDez = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const escalaSingular = ['', 'mil', 'milhão', 'bilhão'];
  const escalaPlural = ['', 'mil', 'milhões', 'bilhões'];

  const valorAbsoluto = Math.max(0, numero || 0);
  const reais = Math.floor(valorAbsoluto);
  const centavos = Math.round((valorAbsoluto - reais) * 100);

  if (reais === 0 && centavos === 0) {
    return 'zero reais';
  }

  const partes: string[] = [];
  let restante = reais;
  let escala = 0;

  while (restante > 0 && escala < escalaSingular.length) {
    const grupo = restante % 1000;
    if (grupo > 0) {
      let texto = converterGrupo(grupo);
      if (escala === 1) {
        texto = grupo === 1 ? 'mil' : `${texto} mil`;
      } else if (escala > 1) {
        const sufixo = grupo === 1 ? escalaSingular[escala] : escalaPlural[escala];
        texto = `${texto} ${sufixo}`;
      }
      partes.unshift(texto);
    }
    restante = Math.floor(restante / 1000);
    escala += 1;
  }

  const parteInteira =
    partes.length === 0
      ? 'zero'
      : partes.length === 1
        ? partes[0]
        : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`.replace(', e', ' e');

  let resultado = `${parteInteira} ${reais === 1 ? 'real' : 'reais'}`;

  if (centavos > 0) {
    const textoCentavos = converterGrupo(centavos);
    resultado += ` e ${textoCentavos} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }

  return resultado.trim();

  function converterGrupo(num: number): string {
    if (num === 0) return 'zero';
    if (num === 100) return 'cem';

    const c = Math.floor(num / 100);
    const resto = num % 100;
    const d = Math.floor(resto / 10);
    const u = resto % 10;

    let resultado = '';

    if (c > 0) {
      resultado = centenas[c];
    }

    if (resto >= 10 && resto < 20) {
      if (resultado) resultado += ' e ';
      resultado += dezenaDez[resto - 10];
      return resultado;
    }

    if (d > 0) {
      if (resultado) resultado += ' e ';
      resultado += dezenas[d];
    }

    if (u > 0) {
      if (resultado) resultado += ' e ';
      resultado += unidades[u];
    }

    return resultado || 'zero';
  }
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
