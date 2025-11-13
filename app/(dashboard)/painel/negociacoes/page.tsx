"use client";

import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useSgci } from "@/contexts/sgci-context";
import { BANCO_AGENCIA, BANCO_CONTA, BANCO_NOME, BANCO_TIPO_CONTA, EMISSOR_CNPJ, EMISSOR_NOME, EMPRESA_CEP, EMPRESA_EMAIL, EMPRESA_ENDERECO, EMPRESA_TELEFONE } from "@/lib/constants";
import { buildStaticPixPayload, DEFAULT_PIX_KEY } from "@/lib/pix";
import { formatarData, numeroParaExtenso } from "@/lib/utils";
import type { ReciboData } from "@/types/recibo";
import type { Negociacao, Parcela, ParcelaStatus } from "@/types/sgci";
import Link from "next/link";
import { useMemo, useState } from "react";

const permutaTipos = ["Veículo", "Imóvel", "Outro Bem"] as const;
const statusOptions = ["Em prospecção", "Em andamento", "Aguardando aprovação", "Fechado"] as const;
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const parcelasOptions = Array.from({ length: 8 }, (_, index) => (index + 1) * 12);

type PermutaItemState = {
  tipo: (typeof permutaTipos)[number];
  valor: string;
  descricao: string;
};

const formatCurrencyInputValue = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const amount = Number(digits) / 100;
  return currencyFormatter.format(amount);
};

const currencyStringToNumber = (value: string) => {
  if (!value) return 0;
  const normalized = value.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
  return Number(normalized) || 0;
};

const formatNumberToCurrency = (value?: number) => {
  if (!value) return "";
  return currencyFormatter.format(value);
};

type NegociacaoFormState = {
  clienteId: string;
  unidadeId: string;
  corretorId: string;
  fase: string;
  numeroLote: string;
  metragem: string;
  valorContrato: string;
  qtdParcelas: string;
  status: (typeof statusOptions)[number];
  descricao: string;
  permutaAtiva: boolean;
};

const initialForm: NegociacaoFormState = {
  clienteId: "",
  unidadeId: "",
  corretorId: "",
  fase: "",
  numeroLote: "",
  metragem: "",
  valorContrato: "",
  qtdParcelas: "",
  status: statusOptions[0],
  descricao: "",
  permutaAtiva: false
};

export default function NegociacoesPage() {
  const {
    clientes,
    empreendimentos,
    corretores,
    negociacoes,
    addNegociacao,
    deleteNegociacao,
    addParcela,
    atualizarStatusParcela,
    registrarReciboParcela
  } = useSgci();
  const { user, profile } = useFirebaseAuth();

  const [form, setForm] = useState<NegociacaoFormState>({ ...initialForm });
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [parcelasForms, setParcelasForms] = useState<Record<string, { valor: string; vencimento: string }>>({});
  const [permutaItens, setPermutaItens] = useState<PermutaItemState[]>([
    { tipo: permutaTipos[0], valor: "", descricao: "" }
  ]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"negociacoes" | "recibos">("negociacoes");
  const [reciboLoadingId, setReciboLoadingId] = useState<string | null>(null);

  const handleUnidadeChange = (unidadeId: string) => {
    setForm(prev => {
      const unidade = empreendimentos.find(item => item.id === unidadeId);
      return {
        ...prev,
        unidadeId,
        numeroLote: unidade?.unidade ?? prev.numeroLote,
        metragem: unidade ? String(unidade.metragem ?? "") : prev.metragem,
        fase: unidade ? unidade.nome : prev.fase,
        valorContrato: unidade?.valorBase ? formatNumberToCurrency(unidade.valorBase) : prev.valorContrato
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.clienteId || !form.unidadeId || !form.descricao.trim() || !form.corretorId) {
      setMensagem("Preencha cliente, unidade, corretor e descrição da negociação.");
      return;
    }

    const permutaLista = form.permutaAtiva
      ? permutaItens
        .filter(item => item.valor && item.descricao)
        .map(item => ({
          tipo: item.tipo,
          valor: currencyStringToNumber(item.valor),
          descricao: item.descricao.trim() || "Bem em permuta"
        }))
        .filter(item => item.valor > 0)
      : [];

    const valorContratoNumber = currencyStringToNumber(form.valorContrato);
    const qtdParcelasNumber = Math.min(100, Math.max(Number(form.qtdParcelas) || 0, 0));

    addNegociacao({
      clienteId: form.clienteId,
      unidadeId: form.unidadeId,
      corretorId: form.corretorId,
      fase: form.fase.trim() || undefined,
      numeroLote: form.numeroLote.trim() || undefined,
      metragem: form.metragem ? Number(form.metragem) : undefined,
      valorContrato: valorContratoNumber || undefined,
      qtdParcelas: qtdParcelasNumber || undefined,
      status: form.status as (typeof statusOptions)[number],
      descricao: form.descricao.trim(),
      permuta: permutaLista[0],
      permutaLista
    });

    setForm({ ...initialForm });
    setPermutaItens([{ tipo: permutaTipos[0], valor: "", descricao: "" }]);
    setMensagem("Negociação registrada com sucesso.");
  };

  const handleAddParcela = (negociacaoId: string) => {
    const formParcela = parcelasForms[negociacaoId];
    const negociacaoAtual = negociacoes.find(item => item.id === negociacaoId);
    if (negociacaoAtual && negociacaoAtual.parcelas.length >= 100) {
      setMensagem("Limite de 100 parcelas por negociação atingido.");
      return;
    }
    if (!formParcela || !formParcela.valor || !formParcela.vencimento) return;

    const valorParcela = currencyStringToNumber(formParcela.valor);
    if (valorParcela <= 0) {
      setMensagem("Informe um valor válido para a parcela.");
      return;
    }

    addParcela(negociacaoId, {
      numero: (negociacaoAtual?.parcelas.length ?? 0) + 1,
      valor: valorParcela,
      vencimento: formParcela.vencimento,
      status: "Pendente"
    });

    setParcelasForms(prev => ({ ...prev, [negociacaoId]: { valor: "", vencimento: "" } }));
  };

  const toggleStatus = (negociacaoId: string, parcelaId: string, status: ParcelaStatus) => {
    const nextStatus = status === "Paga" ? "Pendente" : "Paga";
    atualizarStatusParcela(negociacaoId, parcelaId, nextStatus);
  };

  const handleGerarReciboParcela = async (negociacao: Negociacao, parcela: Parcela, parcelaIndex: number) => {
    try {
      if (!negociacao || !parcela) {
        setMensagem("Dados da negociação ou parcela inválidos.");
        return;
      }

      if (!clientes || !Array.isArray(clientes)) {
        setMensagem("Erro ao carregar lista de clientes.");
        return;
      }

      const cliente = clientes.find(item => item && item.id === negociacao.clienteId);
      if (!cliente) {
        setMensagem("Cadastre o cliente para emitir recibos desta negociação.");
        return;
      }
      if (!cliente.documento || typeof cliente.documento !== 'string' || cliente.documento.trim().length === 0) {
        setMensagem("O cliente precisa ter CPF ou CNPJ cadastrado para gerar recibos.");
        return;
      }
      if (!parcela.valor || typeof parcela.valor !== 'number' || parcela.valor <= 0 || !isFinite(parcela.valor)) {
        setMensagem("Informe um valor válido para a parcela antes de gerar o recibo.");
        return;
      }
      if (!parcela.vencimento || typeof parcela.vencimento !== 'string' || parcela.vencimento.trim().length === 0) {
        setMensagem("Defina a data de vencimento da parcela para gerar o recibo.");
        return;
      }

      const unidade = empreendimentos.find(item => item && item.id === negociacao.unidadeId);
      const corretor = negociacao.corretorId ? corretores.find(item => item && item.id === negociacao.corretorId) : undefined;
      const identificador = negociacao.id.split("-").pop()?.toUpperCase() ?? negociacao.id.toUpperCase();
      const numeroRecibo = `NEG-${identificador}-PAR-${String(parcelaIndex + 1).padStart(3, "0")}`;
      const totalParcelasPlanejado = (negociacao.qtdParcelas ?? negociacao.parcelas.length) || parcelaIndex + 1;
      const permutasDescricao =
        negociacao.permutaLista && negociacao.permutaLista.length > 0
          ? negociacao.permutaLista
            .map(item => `${item.tipo} (${currencyFormatter.format(item.valor ?? 0)})`)
            .join(", ")
          : undefined;

      const referentePartes = [
        unidade ? `${unidade.nome}${unidade.unidade ? ` · ${unidade.unidade}` : ""}` : null,
        negociacao.numeroLote ? `Lote ${negociacao.numeroLote}` : null,
        negociacao.metragem ? `${negociacao.metragem} m²` : null,
        `Parcela ${parcelaIndex + 1} de ${totalParcelasPlanejado}`,
        negociacao.fase ? `Fase ${negociacao.fase}` : null,
        `Status: ${negociacao.status}`,
        permutasDescricao ? `Permutas integradas: ${permutasDescricao}` : null,
        corretor ? `Corretor: ${corretor.nome} · CRECI ${corretor.creci}` : null
      ].filter(Boolean) as string[];

      const referenteDescricao = `${referentePartes.length > 0 ? referentePartes.join(" | ") : `Parcela ${parcelaIndex + 1} do contrato imobiliário`
        } • Condições financeiras com correção IPCA + 0,85% a.m. direto com a incorporadora.`;

      const payload: ReciboData = {
        numero: numeroRecibo,
        valor: parcela.valor,
        valorExtenso: numeroParaExtenso(parcela.valor),
        recebidoDe: cliente.nome,
        cpfCnpj: cliente.documento,
        referente: referenteDescricao,
        data: parcela.vencimento, // Data de pagamento/vencimento
        dataEmissao: new Date().toISOString().split('T')[0], // Data de emissão do recibo
        formaPagamento: `Parcelamento direto · Parcela ${parcelaIndex + 1}/${totalParcelasPlanejado}`,
        emitidoPor: EMISSOR_NOME,
        emitidoPorNome: profile?.name || user?.displayName || 'Usuário', // Nome do usuário que emitiu
        cpfEmitente: EMISSOR_CNPJ,
        cepEmitente: EMPRESA_CEP,
        enderecoEmitente: EMPRESA_ENDERECO,
        telefoneEmitente: EMPRESA_TELEFONE,
        emailEmitente: EMPRESA_EMAIL,
        // Informações do empreendimento
        empreendimentoNome: unidade?.nome,
        empreendimentoUnidade: unidade?.unidade,
        empreendimentoMetragem: negociacao.metragem ?? unidade?.metragem,
        empreendimentoFase: negociacao.fase,
        // Informações do lote
        numeroLote: negociacao.numeroLote,
        // Informações da parcela
        numeroParcela: parcelaIndex + 1,
        totalParcelas: totalParcelasPlanejado,
        // Informações do corretor
        corretorNome: corretor?.nome,
        corretorCreci: corretor?.creci,
        // Status da parcela
        status: parcela.status,
        // Se está em aberto (Pendente), conta para crédito
        contaParaCredito: parcela.status === "Pendente",
        // Informações bancárias (apenas para recibos pendentes)
        ...(parcela.status === "Pendente" ? {
          bancoNome: BANCO_NOME,
          bancoAgencia: BANCO_AGENCIA,
          bancoConta: BANCO_CONTA,
          bancoTipoConta: BANCO_TIPO_CONTA
        } : {})
      };

      const pixKey = DEFAULT_PIX_KEY;

      // Criar mensagem PIX com lote, número e corretor (máximo 25 caracteres)
      let pixTxId = numeroRecibo;
      if (negociacao.numeroLote || corretor) {
        const loteInfo = negociacao.numeroLote ? `L${negociacao.numeroLote}` : '';
        const corretorInfo = corretor ? `${corretor.nome.split(' ')[0]}${corretor.creci ? `-${corretor.creci}` : ''}` : '';
        const separador = loteInfo && corretorInfo ? '/' : '';
        const infoAdicional = `${loteInfo}${separador}${corretorInfo}`.slice(0, 10); // Limitar a 10 caracteres
        pixTxId = `${numeroRecibo}-${infoAdicional}`.slice(0, 25); // Limitar total a 25 caracteres
      }

      const qrOptions = parcela.status !== "Paga"
        ? {
          pixKey,
          pixPayload: buildStaticPixPayload({
            key: pixKey,
            amount: parcela.valor,
            merchantName: EMISSOR_NOME,
            merchantCity: "Florianopolis",
            txId: pixTxId.length > 25 ? pixTxId.slice(-25) : pixTxId.padStart(25, '0')
          })
        }
        : undefined;

      if (qrOptions?.pixPayload) {
        payload.pixPayload = qrOptions.pixPayload;
        payload.pixKey = qrOptions.pixKey;
      }
      setReciboLoadingId(parcela.id);
      setMensagem(null);

      let response: Response;
      try {
        response = await fetch("/api/gerar-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, qrOptions })
        });
      } catch (fetchError) {
        console.error("Erro de rede ao fazer requisição:", fetchError);
        throw new Error(`Erro de conexão: ${fetchError instanceof Error ? fetchError.message : 'Não foi possível conectar ao servidor'}`);
      }

      if (!response.ok) {
        let errorBody: any = null;
        let errorText = '';
        const contentType = response.headers.get('content-type');
        const responseStatus = response.status;
        const responseStatusText = response.statusText;

        try {
          // Clonar resposta ANTES de tentar ler (para poder ler múltiplas vezes se necessário)
          const clonedResponse = response.clone();

          // Tentar ler como texto primeiro (mais seguro)
          try {
            errorText = await clonedResponse.text();

            if (errorText && errorText.trim().length > 0) {
              // Tentar parsear como JSON
              if (contentType?.includes('application/json')) {
                try {
                  errorBody = JSON.parse(errorText);
                } catch (parseError) {
                  // Se não for JSON válido, manter como texto
                  errorBody = { rawText: errorText, parseError: parseError instanceof Error ? parseError.message : String(parseError) };
                }
              } else {
                // Se não for JSON, tentar parsear mesmo assim
                try {
                  errorBody = JSON.parse(errorText);
                } catch {
                  errorBody = { rawText: errorText };
                }
              }
            } else {
              errorBody = { empty: true, contentType: contentType || 'unknown' };
              errorText = '(Resposta vazia)';
            }
          } catch (textError) {
            console.error("Erro ao ler resposta como texto:", textError);
            errorText = `Erro ao ler resposta: ${textError instanceof Error ? textError.message : String(textError)}`;
            errorBody = {
              readError: errorText,
              errorType: textError instanceof Error ? textError.name : 'UnknownError'
            };
          }
        } catch (readError) {
          console.error("Erro geral ao processar resposta:", readError);
          errorText = `Erro ao processar resposta: ${readError instanceof Error ? readError.message : String(readError)}`;
          errorBody = {
            readError: errorText,
            errorType: readError instanceof Error ? readError.name : 'UnknownError',
            errorStack: readError instanceof Error ? readError.stack : undefined
          };
        }

        // Construir mensagem de erro detalhada
        const errorMessageParts: string[] = [];

        // Adicionar informações do erro em ordem de prioridade
        if (errorBody?.error) {
          errorMessageParts.push(`Erro: ${String(errorBody.error)}`);
        }
        if (errorBody?.errorType) {
          errorMessageParts.push(`Tipo: ${String(errorBody.errorType)}`);
        }
        if (errorBody?.errorString) {
          errorMessageParts.push(`String: ${String(errorBody.errorString)}`);
        }
        if (errorBody?.message) {
          errorMessageParts.push(`Mensagem: ${String(errorBody.message)}`);
        }
        if (Array.isArray(errorBody?.errors) && errorBody.errors.length > 0) {
          errorMessageParts.push(`Validações: ${errorBody.errors.join(", ")}`);
        }
        if (errorBody?.rawText) {
          const rawTextPreview = String(errorBody.rawText).substring(0, 200);
          errorMessageParts.push(`Resposta: ${rawTextPreview}${rawTextPreview.length >= 200 ? '...' : ''}`);
        }
        if (errorBody?.readError) {
          errorMessageParts.push(`Erro de leitura: ${String(errorBody.readError)}`);
        }
        if (errorBody?.empty) {
          errorMessageParts.push('Resposta vazia do servidor');
        }

        // Se não encontrou nenhuma mensagem específica, usar informações básicas
        if (errorMessageParts.length === 0) {
          errorMessageParts.push(`Erro HTTP ${responseStatus}: ${responseStatusText || 'Erro desconhecido'}`);
          if (errorText && errorText !== '(Resposta vazia)') {
            const preview = errorText.substring(0, 200);
            errorMessageParts.push(`Detalhes: ${preview}${preview.length >= 200 ? '...' : ''}`);
          }
        }

        const errorMessage = errorMessageParts.join(" | ");

        // Log detalhado com informações serializáveis
        const errorDetails = {
          status: responseStatus,
          statusText: responseStatusText,
          contentType: contentType || '(não especificado)',
          errorBody: errorBody ? (typeof errorBody === 'object' ? JSON.stringify(errorBody, null, 2) : String(errorBody)) : '(null)',
          errorText: errorText || '(vazio)',
          url: response.url || '(não disponível)',
          ok: response.ok,
          redirected: response.redirected,
          type: response.type,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        };

        console.error("Erro ao gerar recibo - Detalhes completos:", errorDetails);

        // Log adicional para debug
        console.error("Erro ao gerar recibo - Raw response:", {
          status: responseStatus,
          statusText: responseStatusText,
          contentType,
          hasBody: !!errorBody,
          bodyType: errorBody ? typeof errorBody : 'null',
          textLength: errorText?.length || 0
        });

        throw new Error(errorMessage);
      }

      const shareId = response.headers.get("x-recibo-share-id") ?? undefined;
      const shareUrl = response.headers.get("x-recibo-share-url") ?? undefined;

      if (shareId) {
        try {
          registrarReciboParcela(negociacao.id, parcela.id, {
            shareId,
            shareUrl,
            numero: payload.numero,
            emitidoEm: payload.data
          });
        } catch (error) {
          console.error('Erro ao registrar recibo:', error);
          // Não bloqueia o fluxo se o registro falhar
        }
      }

      try {
        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          throw new Error('PDF vazio recebido');
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `recibo-${payload.numero || 'recibo'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (blobError) {
        console.error('Erro ao processar PDF:', blobError);
        throw new Error('Erro ao processar arquivo PDF');
      }

      setMensagem("Recibo gerado com sucesso. O link público já está disponível na parcela.");
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível gerar o recibo desta parcela.";
      setMensagem(errorMessage);
    } finally {
      setReciboLoadingId(null);
    }
  };

  const handleCopyShareLink = (shareId?: string, shareUrl?: string) => {
    const urlParaCopiar =
      shareUrl ?? (typeof window !== "undefined" && shareId ? `${window.location.origin}/recibos/share/${shareId}` : "");

    if (!urlParaCopiar) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setMensagem(`Copie manualmente: ${urlParaCopiar}`);
      return;
    }

    navigator.clipboard
      .writeText(urlParaCopiar)
      .then(() => setMensagem("Link público copiado para a área de transferência."))
      .catch(() => setMensagem(`Copie manualmente: ${urlParaCopiar}`));
  };

  const resumo = useMemo(
    () =>
      negociacoes.map(negociacao => {
        const parcelasPagas = negociacao.parcelas.filter(parcela => parcela.status === "Paga");
        const totalPago = parcelasPagas.reduce((sum, parcela) => sum + parcela.valor, 0);
        const totalParcelado = negociacao.parcelas.reduce((sum, parcela) => sum + parcela.valor, 0);
        return {
          id: negociacao.id,
          parcelasPagas: parcelasPagas.length,
          totalParcelas: negociacao.parcelas.length,
          totalPago,
          totalParcelado,
          proximaParcela: negociacao.parcelas.find(parcela => parcela.status === "Pendente")?.vencimento ? formatarData(negociacao.parcelas.find(parcela => parcela.status === "Pendente")!.vencimento) : "—"
        };
      }),
    [negociacoes]
  );

  const negociacoesFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return negociacoes;
    return negociacoes.filter(negociacao => {
      const cliente = clientes.find(item => item.id === negociacao.clienteId);
      const corretor = negociacao.corretorId ? corretores.find(item => item.id === negociacao.corretorId) : undefined;
      const unidade = empreendimentos.find(item => item.id === negociacao.unidadeId);
      const alvo = [
        cliente?.nome,
        corretor?.nome,
        unidade?.nome,
        unidade?.unidade,
        negociacao.numeroLote,
        negociacao.fase,
        negociacao.status,
        negociacao.descricao
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return alvo.includes(termo);
    });
  }, [search, negociacoes, clientes, corretores, empreendimentos]);

  const negociacoesFechadas = useMemo(
    () =>
      negociacoes.filter(negociacao => (negociacao.status ?? "").toLowerCase() === "fechado"),
    [negociacoes]
  );

  const recibosPainel = useMemo(() => {
    const itens = negociacoesFechadas.map(negociacao => {
      const resumoItem = resumo.find(item => item.id === negociacao.id);
      const pagas = negociacao.parcelas.filter(parcela => parcela.status === "Paga");
      const pendentes = negociacao.parcelas.filter(parcela => parcela.status !== "Paga");
      const totalPago = pagas.reduce((sum, parcela) => sum + parcela.valor, 0);
      const totalPendente = pendentes.reduce((sum, parcela) => sum + parcela.valor, 0);
      const proximaParcela = [...pendentes].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0] ?? null;

      return {
        negociacao,
        resumoItem,
        totalPago,
        totalPendente,
        parcelasPagas: pagas.length,
        totalParcelas: negociacao.parcelas.length,
        proximaParcela
      };
    });

    const totais = itens.reduce(
      (acc, item) => {
        acc.totalPago += item.totalPago;
        acc.totalPendente += item.totalPendente;
        acc.parcelasPagas += item.parcelasPagas;
        acc.totalParcelas += item.totalParcelas;
        return acc;
      },
      { totalPago: 0, totalPendente: 0, parcelasPagas: 0, totalParcelas: 0 }
    );

    return { itens, totais };
  }, [negociacoesFechadas, resumo]);

  const saudacao = useMemo(() => {
    const scNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const hour = scNow.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const primeiroNome = useMemo(() => {
    if (!profile?.name && !user?.displayName) return "Convidado";
    const nome = profile?.name || user?.displayName || '';
    const [primeiro] = nome.trim().split(" ");
    return primeiro || nome;
  }, [profile?.name, user?.displayName]);

  const valorContratoPreview = currencyStringToNumber(form.valorContrato);
  const permutaFormTotal = form.permutaAtiva
    ? permutaItens.reduce((sum, item) => sum + currencyStringToNumber(item.valor), 0)
    : 0;
  const qtdParcelasPreview = Math.min(100, Math.max(Number(form.qtdParcelas) || 0, 0));
  const baseParaParcelar = Math.max(valorContratoPreview - permutaFormTotal, 0);
  const valorParcelaPreview = qtdParcelasPreview ? baseParaParcelar / qtdParcelasPreview : 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Negociação e financeiro</p>
        <h1 className="text-3xl font-semibold text-slate-900">Contratos e acompanhamento de parcelas</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          {saudacao}, {primeiroNome}! Todos os horários consideram o fuso de Santa Catarina (GMT-3).
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Associe o cliente à unidade negociada, detalhe permutas, simule condições e monitore pagamentos com indicadores
          em evidência.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("negociacoes")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${activeTab === "negociacoes"
            ? "bg-white text-slate-900 shadow"
            : "text-slate-500 hover:text-slate-700"
            }`}
        >
          Negociações
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recibos")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${activeTab === "recibos"
            ? "bg-white text-slate-900 shadow"
            : "text-slate-500 hover:text-slate-700"
            }`}
        >
          Recibos
        </button>
      </div>

      {activeTab === "negociacoes" ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Cliente</label>
                <select
                  value={form.clienteId}
                  onChange={event => setForm(prev => ({ ...prev, clienteId: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  required
                >
                  <option value="">Selecione...</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
                {clientes.length === 0 && <p className="text-xs text-slate-500">Cadastre clientes antes de negociar.</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Unidade / Lote</label>
                <select
                  value={form.unidadeId}
                  onChange={event => handleUnidadeChange(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  required
                >
                  <option value="">Selecione...</option>
                  {empreendimentos.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nome} · {item.unidade}
                    </option>
                  ))}
                </select>
                {empreendimentos.length === 0 && (
                  <p className="text-xs text-slate-500">Cadastre empreendimentos para habilitar negociações.</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Corretor responsável</label>
                <select
                  value={form.corretorId}
                  onChange={event => setForm(prev => ({ ...prev, corretorId: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  required
                >
                  <option value="">Selecionar...</option>
                  {corretores.map(corretor => (
                    <option key={corretor.id} value={corretor.id}>
                      {corretor.nome} · CRECI {corretor.creci}
                    </option>
                  ))}
                </select>
                {corretores.length === 0 && (
                  <p className="text-xs text-slate-500">Cadastre corretores para vinculá-los às negociações.</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Fase do empreendimento</label>
                <input
                  type="text"
                  value={form.fase}
                  onChange={event => setForm(prev => ({ ...prev, fase: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Ex: Fase 1 - Lançamento"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Número / Identificação do lote</label>
                <input
                  type="text"
                  value={form.numeroLote}
                  onChange={event => setForm(prev => ({ ...prev, numeroLote: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Ex: Lote 12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Metragem (m²)</label>
                <input
                  type="number"
                  min={0}
                  value={form.metragem}
                  onChange={event => setForm(prev => ({ ...prev, metragem: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Ex: 1200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Valor contratual</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.valorContrato}
                  onChange={event =>
                    setForm(prev => ({
                      ...prev,
                      valorContrato: formatCurrencyInputValue(event.target.value)
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Quantidade de parcelas (máx. 100)</label>
                <select
                  value={form.qtdParcelas}
                  onChange={event => setForm(prev => ({ ...prev, qtdParcelas: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  <option value="">Selecione...</option>
                  {parcelasOptions.map(option => (
                    <option key={option} value={String(option)}>
                      {option} parcelas
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Selecionamos automaticamente múltiplos de 12 parcelas, respeitando o limite de 100.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Status da negociação</label>
                <select
                  value={form.status}
                  onChange={event =>
                    setForm(prev => ({
                      ...prev,
                      status: event.target.value as (typeof statusOptions)[number]
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Termos contratuais</label>
                <textarea
                  value={form.descricao}
                  onChange={event => setForm(prev => ({ ...prev, descricao: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  rows={3}
                  placeholder="Descreva condições comerciais, cronograma de obra, penalidades etc."
                />
              </div>
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={form.permutaAtiva}
                    onChange={event => {
                      setForm(prev => ({ ...prev, permutaAtiva: event.target.checked }));
                      if (!event.target.checked) {
                        setPermutaItens([{ tipo: permutaTipos[0], valor: "", descricao: "" }]);
                      }
                    }}
                    className="h-4 w-4"
                  />
                  Registrar permutas como parte do pagamento
                </label>
                {form.permutaAtiva && (
                  <div className="mt-4 space-y-3">
                    {permutaItens.map((item, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200/80 bg-white/60 p-3">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <label className="text-xs font-medium text-slate-600">Tipo do bem</label>
                            <select
                              value={item.tipo}
                              onChange={event => {
                                setPermutaItens(prev => {
                                  const clone = [...prev];
                                  clone[index].tipo = event.target.value as (typeof permutaTipos)[number];
                                  return clone;
                                });
                              }}
                              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                            >
                              {permutaTipos.map(tipo => (
                                <option key={tipo} value={tipo}>
                                  {tipo}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600">Valor avaliado (R$)</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={item.valor}
                              onChange={event => {
                                setPermutaItens(prev => {
                                  const clone = [...prev];
                                  clone[index].valor = formatCurrencyInputValue(event.target.value);
                                  return clone;
                                });
                              }}
                              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                              placeholder="R$ 0,00"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600">Descrição do bem</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.descricao}
                                onChange={event => {
                                  setPermutaItens(prev => {
                                    const clone = [...prev];
                                    clone[index].descricao = event.target.value;
                                    return clone;
                                  });
                                }}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                                placeholder="Ex: SUV 2022"
                              />
                              {permutaItens.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setPermutaItens(prev => prev.filter((_, idx) => idx !== index))}
                                  className="mt-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600"
                                >
                                  X
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPermutaItens(prev => [...prev, { tipo: permutaTipos[0], valor: "", descricao: "" }])}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600"
                    >
                      Adicionar bem em permuta
                    </button>
                  </div>
                )}
              </div>

              {valorContratoPreview > 0 && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Simulação instantânea</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Valor contratual</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {valorContratoPreview.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Permuta integrada</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {permutaFormTotal > 0
                          ? permutaFormTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Qtd. parcelas planejada</p>
                      <p className="text-lg font-semibold text-slate-900">{qtdParcelasPreview || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Parcela simulada</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {valorParcelaPreview.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <p className="text-[0.65rem] text-slate-500">
                        Base líquida: {baseParaParcelar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white"
                >
                  Registrar negociação
                </button>
                {mensagem && <p className="mt-2 text-sm text-slate-500">{mensagem}</p>}
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="flex-1 rounded-xl border border-slate-100 px-4 py-2 text-sm"
                placeholder="Buscar por cliente, corretor, status, lote ou descrição"
              />
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
                {negociacoesFiltradas.length} negociação(ões)
              </span>
            </div>

            {negociacoesFiltradas.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                {search.trim()
                  ? "Nenhuma negociação coincide com a pesquisa informada."
                  : "Nenhuma negociação registrada até o momento."}
              </div>
            ) : (
              negociacoesFiltradas.map((negociacao, index) => {
                const cliente = clientes.find(item => item.id === negociacao.clienteId);
                const unidade = empreendimentos.find(item => item.id === negociacao.unidadeId);
                const corretor = negociacao.corretorId ? corretores.find(item => item.id === negociacao.corretorId) : undefined;
                const resumoItem = resumo.find(item => item.id === negociacao.id);
                const permutas = negociacao.permutaLista && negociacao.permutaLista.length > 0
                  ? negociacao.permutaLista
                  : negociacao.permuta
                    ? [negociacao.permuta]
                    : [];
                const totalPermuta = permutas.reduce((sum, p) => sum + (p.valor ?? 0), 0);
                const totalParcelado = resumoItem?.totalParcelado ?? 0;
                const totalPago = resumoItem?.totalPago ?? 0;
                const contratoBase = negociacao.valorContrato ?? totalParcelado;
                const saldoAberto = Math.max(contratoBase - totalPago, 0);
                const saldoParcelado = Math.max(contratoBase - totalPermuta, 0);
                const qtdPrevista = Math.min(negociacao.qtdParcelas ?? negociacao.parcelas.length, 100);
                const valorParcelaSimulada = qtdPrevista ? saldoParcelado / qtdPrevista : 0;
                const proximosPagamentos = negociacao.parcelas
                  .filter(parcela => parcela.status !== "Paga")
                  .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
                  .slice(0, 3);

                const limiteParcelasAtingido = negociacao.parcelas.length >= 100;

                return (
                  <div key={negociacao.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Negociação #{index + 1}</p>
                        <h2 className="text-2xl font-semibold text-slate-900">{cliente?.nome ?? "Cliente removido"}</h2>
                        <p className="text-sm text-slate-500">{unidade ? `${unidade.nome} · ${unidade.unidade}` : "Unidade não disponível"}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          {negociacao.fase && <span className="rounded-full bg-slate-100 px-3 py-1">Fase: {negociacao.fase}</span>}
                          {negociacao.numeroLote && <span className="rounded-full bg-slate-100 px-3 py-1">Lote: {negociacao.numeroLote}</span>}
                          {negociacao.metragem && <span className="rounded-full bg-slate-100 px-3 py-1">Metragem: {negociacao.metragem} m²</span>}
                          {negociacao.valorContrato && (
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              Contrato: {negociacao.valorContrato.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          )}
                        </div>
                        {corretor && (
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Corretor: {corretor.nome} · CRECI {corretor.creci}
                          </p>
                        )}
                      </div>
                      <button onClick={() => deleteNegociacao(negociacao.id)} className="text-sm text-rose-600 underline">
                        Remover negociação
                      </button>
                    </div>

                    <p className="mt-4 text-sm text-slate-600 whitespace-pre-line">{negociacao.descricao}</p>

                    {permutas.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="text-xs uppercase tracking-[0.35em] text-amber-600">Permutas</p>
                        <div className="mt-2 space-y-2">
                          {permutas.map((permuta, idx) => (
                            <div key={idx} className="rounded-lg border border-amber-100 bg-white/70 p-3 text-amber-900">
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                                Bem {idx + 1}: {permuta.tipo}
                              </p>
                              <p>Valor: {permuta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                              <p>Descrição: {permuta.descricao}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid gap-4 sm:grid-cols-6">
                      <ResumoCard label="Status" value={negociacao.status ?? "Em prospecção"} />
                      <ResumoCard
                        label="Valor contratual"
                        value={contratoBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      />
                      <ResumoCard label="Parcelas pagas" value={`${resumoItem?.parcelasPagas ?? 0}/${resumoItem?.totalParcelas ?? 0}`} />
                      <ResumoCard
                        label="Saldo em aberto"
                        value={saldoAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      />
                      <ResumoCard label="Próximo vencimento" value={resumoItem?.proximaParcela ?? "—"} />
                      <ResumoCard label="Corretor" value={corretor?.nome ?? "Não informado"} />
                    </div>
                    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Simulações financeiras</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total em permutas</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {totalPermuta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Saldo parcelado</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {saldoParcelado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Saldo em aberto</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {saldoAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Qtd. parcelas (prevista)</p>
                          <p className="text-lg font-semibold text-slate-900">{qtdPrevista || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Parcela simulada</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {valorParcelaSimulada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      </div>
                      {proximosPagamentos.length > 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                          Próximos pagamentos: {proximosPagamentos
                            .map(parcela => `${formatarData(parcela.vencimento)} (${parcela.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-slate-900">Parcelas</h3>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-xs uppercase tracking-[0.35em] text-slate-500">
                              <th className="py-2">Número</th>
                              <th>Valor</th>
                              <th>Vencimento</th>
                              <th>Status</th>
                              <th>Recibo</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {negociacao.parcelas.map((parcela, idx) => (
                              <tr key={parcela.id} className="border-t border-slate-100">
                                <td className="py-2 text-slate-600">{idx + 1}</td>
                                <td className="py-2">
                                  {parcela.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                                <td className="py-2">{formatarData(parcela.vencimento)}</td>
                                <td className="py-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${parcela.status === "Paga"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-700"
                                      }`}
                                  >
                                    {parcela.status}
                                  </span>
                                </td>
                                <td className="py-2">
                                  {parcela.reciboShareId ? (
                                    <div className="flex flex-col gap-1">
                                      <Link
                                        href={`/recibos/share/${parcela.reciboShareId}`}
                                        target="_blank"
                                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 hover:bg-emerald-100"
                                      >
                                        Ver recibo
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyShareLink(parcela.reciboShareId, parcela.reciboShareUrl)}
                                        className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 underline"
                                      >
                                        Copiar link
                                      </button>
                                      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400">
                                        {parcela.reciboNumero ?? "Recibo emitido"}
                                      </p>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleGerarReciboParcela(negociacao, parcela, idx)}
                                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed"
                                      disabled={reciboLoadingId === parcela.id}
                                    >
                                      {reciboLoadingId === parcela.id ? "Gerando..." : "Gerar recibo"}
                                    </button>
                                  )}
                                </td>
                                <td className="py-2">
                                  <button
                                    onClick={() => toggleStatus(negociacao.id, parcela.id, parcela.status)}
                                    className="text-xs text-slate-600 underline"
                                  >
                                    Marcar como {parcela.status === "Paga" ? "pendente" : "paga"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {negociacao.parcelas.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-4 text-center text-slate-500">
                                  Nenhuma parcela registrada.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={parcelasForms[negociacao.id]?.valor ?? ""}
                          onChange={event => {
                            const formatted = formatCurrencyInputValue(event.target.value);
                            setParcelasForms(prev => {
                              const atual = prev[negociacao.id] ?? { valor: "", vencimento: "" };
                              return {
                                ...prev,
                                [negociacao.id]: { ...atual, valor: formatted }
                              };
                            });
                          }}
                          className="rounded-xl border border-slate-200 px-4 py-2.5"
                          disabled={limiteParcelasAtingido}
                        />
                        <input
                          type="date"
                          value={parcelasForms[negociacao.id]?.vencimento ?? ""}
                          onChange={event =>
                            setParcelasForms(prev => ({
                              ...prev,
                              [negociacao.id]: { ...prev[negociacao.id], vencimento: event.target.value }
                            }))
                          }
                          className="rounded-xl border border-slate-200 px-4 py-2.5"
                          disabled={limiteParcelasAtingido}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddParcela(negociacao.id)}
                          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.35em] text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                          disabled={limiteParcelasAtingido}
                        >
                          {limiteParcelasAtingido ? "Limite atingido" : "Adicionar parcela"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Máximo de 100 parcelas por negociação.</p>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </>
      ) : (
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {recibosPainel.itens.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
              Nenhuma negociação fechada disponível para emissão de recibos.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-4">
                <ResumoCard label="Negociações fechadas" value={`${recibosPainel.itens.length}`} />
                <ResumoCard
                  label="Recebido até o momento"
                  value={recibosPainel.totais.totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                />
                <ResumoCard
                  label="Saldo pendente"
                  value={recibosPainel.totais.totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                />
                <ResumoCard
                  label="Parcelas quitadas"
                  value={`${recibosPainel.totais.parcelasPagas}/${recibosPainel.totais.totalParcelas}`}
                />
              </div>

              {recibosPainel.itens.map((item, index) => {
                const { negociacao, resumoItem, totalPago, totalPendente, proximaParcela } = item;
                const cliente = clientes.find(clienteItem => clienteItem.id === negociacao.clienteId);
                const unidade = empreendimentos.find(unidadeItem => unidadeItem.id === negociacao.unidadeId);
                const corretor = negociacao.corretorId
                  ? corretores.find(corretorItem => corretorItem.id === negociacao.corretorId)
                  : undefined;
                const contratoBase =
                  negociacao.valorContrato ??
                  resumoItem?.totalParcelado ??
                  negociacao.parcelas.reduce((sum, parcela) => sum + parcela.valor, 0);

                return (
                  <div key={negociacao.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Recibo #{index + 1}</p>
                        <h2 className="text-2xl font-semibold text-slate-900">{cliente?.nome ?? "Cliente removido"}</h2>
                        <p className="text-sm text-slate-500">
                          {unidade
                            ? `${unidade.nome}${unidade.unidade ? ` · ${unidade.unidade}` : ""}`
                            : "Unidade não disponível"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {negociacao.status ?? "Fechado"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-4">
                      <ResumoCard
                        label="Total pago"
                        value={totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      />
                      <ResumoCard
                        label="Saldo pendente"
                        value={totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      />
                      <ResumoCard
                        label="Parcelas quitadas"
                        value={`${item.parcelasPagas}/${item.totalParcelas}`}
                      />
                      <ResumoCard
                        label="Pagamento atual"
                        value={
                          proximaParcela
                            ? proximaParcela.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "Quitado"
                        }
                      />
                    </div>

                    <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Resumo financeiro</p>
                      <p className="mt-2">
                        Contrato base: {contratoBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · Já
                        recebido: {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · Restante:
                        {" "}
                        {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        {proximaParcela
                          ? ` · Próximo vencimento em ${formatarData(proximaParcela.vencimento)}`
                          : " · Todas as parcelas foram quitadas."}
                      </p>
                      {corretor && (
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Corretor responsável: {corretor.nome} · CRECI {corretor.creci}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-[0.35em] text-slate-500">
                            <th className="py-2">Número</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th>Recibo</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {negociacao.parcelas.map((parcela, idx) => (
                            <tr key={parcela.id} className="border-t border-slate-100">
                              <td className="py-2 text-slate-600">{idx + 1}</td>
                              <td className="py-2">
                                {parcela.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </td>
                              <td className="py-2">{formatarData(parcela.vencimento)}</td>
                              <td className="py-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${parcela.status === "Paga"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-700"
                                    }`}
                                >
                                  {parcela.status}
                                </span>
                              </td>
                              <td className="py-2">
                                {parcela.reciboShareId ? (
                                  <div className="flex flex-col gap-1">
                                    <Link
                                      href={`/recibos/share/${parcela.reciboShareId}`}
                                      target="_blank"
                                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 hover:bg-emerald-100"
                                    >
                                      Ver recibo
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyShareLink(parcela.reciboShareId, parcela.reciboShareUrl)}
                                      className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 underline"
                                    >
                                      Copiar link
                                    </button>
                                    <p className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400">
                                      {parcela.reciboNumero ?? "Recibo emitido"}
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleGerarReciboParcela(negociacao, parcela, idx)}
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed"
                                    disabled={reciboLoadingId === parcela.id}
                                  >
                                    {reciboLoadingId === parcela.id ? "Gerando..." : "Gerar recibo"}
                                  </button>
                                )}
                              </td>
                              <td className="py-2">
                                <button
                                  onClick={() => toggleStatus(negociacao.id, parcela.id, parcela.status)}
                                  className="text-xs text-slate-600 underline"
                                >
                                  Marcar como {parcela.status === "Paga" ? "pendente" : "paga"}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {negociacao.parcelas.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-slate-500">
                                Nenhuma parcela registrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </section>
      )}
    </div>
  );
}

function ResumoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
