export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '');

  if (numeros.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numeros)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digitoVerificador1 = resto >= 10 ? 0 : resto;

  if (digitoVerificador1 !== parseInt(numeros.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digitoVerificador2 = resto >= 10 ? 0 : resto;

  if (digitoVerificador2 !== parseInt(numeros.charAt(10))) return false;

  return true;
}

export function validarCNPJ(cnpj: string): boolean {
  const numeros = cnpj.replace(/\D/g, '');

  if (numeros.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numeros)) return false;

  // Validação do primeiro dígito verificador
  let tamanho = numeros.length - 2;
  let numeros_verificacao = numeros.substring(0, tamanho);
  const digitos = numeros.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros_verificacao.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros_verificacao = numeros.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros_verificacao.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

export function validarCPFouCNPJ(valor: string): { valido: boolean; tipo: 'CPF' | 'CNPJ' | null; mensagem?: string } {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 0) {
    return { valido: false, tipo: null, mensagem: 'Campo obrigatório' };
  }

  if (numeros.length === 11) {
    const valido = validarCPF(valor);
    return {
      valido,
      tipo: 'CPF',
      mensagem: valido ? undefined : 'CPF inválido'
    };
  } else if (numeros.length === 14) {
    const valido = validarCNPJ(valor);
    return {
      valido,
      tipo: 'CNPJ',
      mensagem: valido ? undefined : 'CNPJ inválido'
    };
  } else {
    return {
      valido: false,
      tipo: null,
      mensagem: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos'
    };
  }
}

export function validarEmail(email: string): { valido: boolean; mensagem?: string } {
  if (!email) {
    return { valido: false, mensagem: 'Email obrigatório' };
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valido = regex.test(email);

  return {
    valido,
    mensagem: valido ? undefined : 'Email inválido'
  };
}

export function validarTelefone(telefone: string): { valido: boolean; mensagem?: string } {
  const numeros = telefone.replace(/\D/g, '');

  if (numeros.length === 0) {
    return { valido: false, mensagem: 'Telefone obrigatório' };
  }

  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 na frente)
  if (numeros.length < 10 || numeros.length > 11) {
    return {
      valido: false,
      mensagem: 'Telefone deve ter 10 ou 11 dígitos'
    };
  }

  return { valido: true };
}

export function validarValor(valor: number): { valido: boolean; mensagem?: string } {
  if (valor <= 0) {
    return {
      valido: false,
      mensagem: 'Valor deve ser maior que zero'
    };
  }

  if (valor > 999999999) {
    return {
      valido: false,
      mensagem: 'Valor muito alto'
    };
  }

  return { valido: true };
}

export function validarCampoTexto(valor: string, nomeCampo: string, minLength: number = 3): { valido: boolean; mensagem?: string } {
  if (!valor || valor.trim().length === 0) {
    return {
      valido: false,
      mensagem: `${nomeCampo} é obrigatório`
    };
  }

  if (valor.trim().length < minLength) {
    return {
      valido: false,
      mensagem: `${nomeCampo} deve ter pelo menos ${minLength} caracteres`
    };
  }

  return { valido: true };
}

export function validarData(data: string): { valido: boolean; mensagem?: string } {
  if (!data) {
    return { valido: false, mensagem: 'Data obrigatória' };
  }

  const dataRecibo = new Date(data + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Permitir datas até 1 ano no futuro
  const umAnoFuturo = new Date();
  umAnoFuturo.setFullYear(umAnoFuturo.getFullYear() + 1);

  if (dataRecibo > umAnoFuturo) {
    return {
      valido: false,
      mensagem: 'Data não pode ser mais de 1 ano no futuro'
    };
  }

  // Permitir datas até 10 anos no passado
  const dezAnosPassado = new Date();
  dezAnosPassado.setFullYear(dezAnosPassado.getFullYear() - 10);

  if (dataRecibo < dezAnosPassado) {
    return {
      valido: false,
      mensagem: 'Data muito antiga'
    };
  }

  return { valido: true };
}

