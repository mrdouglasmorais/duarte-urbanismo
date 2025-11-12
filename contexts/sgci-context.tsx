'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, startTransition } from 'react';
import type { Cliente, Corretor, Empreendimento, Negociacao, Parcela, SgciState } from '@/types/sgci';
import { format } from 'date-fns';
import seedData from '@/lib/sgci/seed-data';

type Action =
  | { type: 'HYDRATE'; payload: SgciState }
  | { type: 'ADD_EMPREENDIMENTO'; payload: Empreendimento }
  | { type: 'UPDATE_EMPREENDIMENTO'; payload: { id: string; data: Partial<Empreendimento> } }
  | { type: 'DELETE_EMPREENDIMENTO'; payload: string }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: { id: string; data: Partial<Cliente> } }
  | { type: 'DELETE_CLIENTE'; payload: string }
  | { type: 'ADD_NEGOCIACAO'; payload: Negociacao }
  | { type: 'DELETE_NEGOCIACAO'; payload: string }
  | { type: 'ADD_PARCELA'; payload: { negociacaoId: string; parcela: Parcela } }
  | { type: 'UPDATE_PARCELA_STATUS'; payload: { negociacaoId: string; parcelaId: string; status: Parcela['status'] } }
  | {
      type: 'REGISTRAR_RECIBO_PARCELA';
      payload: {
        negociacaoId: string;
        parcelaId: string;
        shareId: string;
        shareUrl?: string;
        numero: string;
        emitidoEm: string;
      };
    }
  | { type: 'ADD_CORRETOR'; payload: Corretor }
  | { type: 'UPDATE_CORRETOR'; payload: { id: string; data: Partial<Corretor> } }
  | { type: 'DELETE_CORRETOR'; payload: string };

const defaultState: SgciState = JSON.parse(JSON.stringify(seedData));

function reducer(state: SgciState, action: Action): SgciState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_EMPREENDIMENTO':
      return { ...state, empreendimentos: [action.payload, ...state.empreendimentos] };
    case 'UPDATE_EMPREENDIMENTO':
      return {
        ...state,
        empreendimentos: state.empreendimentos.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.data } : item
        )
      };
    case 'DELETE_EMPREENDIMENTO':
      return { ...state, empreendimentos: state.empreendimentos.filter(item => item.id !== action.payload) };
    case 'ADD_CLIENTE':
      return { ...state, clientes: [action.payload, ...state.clientes] };
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map(item => (item.id === action.payload.id ? { ...item, ...action.payload.data } : item))
      };
    case 'DELETE_CLIENTE':
      return { ...state, clientes: state.clientes.filter(item => item.id !== action.payload) };
    case 'ADD_NEGOCIACAO':
      return { ...state, negociacoes: [action.payload, ...state.negociacoes] };
    case 'DELETE_NEGOCIACAO':
      return { ...state, negociacoes: state.negociacoes.filter(item => item.id !== action.payload) };
    case 'ADD_PARCELA':
      return {
        ...state,
        negociacoes: state.negociacoes.map(item =>
          item.id === action.payload.negociacaoId
            ? { ...item, parcelas: [...item.parcelas, action.payload.parcela] }
            : item
        )
      };
    case 'UPDATE_PARCELA_STATUS':
      return {
        ...state,
        negociacoes: state.negociacoes.map(item =>
          item.id === action.payload.negociacaoId
            ? {
                ...item,
                parcelas: item.parcelas.map(parcela =>
                  parcela.id === action.payload.parcelaId ? { ...parcela, status: action.payload.status } : parcela
                )
              }
            : item
        )
      };
    case 'REGISTRAR_RECIBO_PARCELA':
      return {
        ...state,
        negociacoes: state.negociacoes.map(item =>
          item.id === action.payload.negociacaoId
            ? {
                ...item,
                parcelas: item.parcelas.map(parcela =>
                  parcela.id === action.payload.parcelaId
                    ? {
                        ...parcela,
                        reciboShareId: action.payload.shareId,
                        reciboShareUrl: action.payload.shareUrl,
                        reciboNumero: action.payload.numero,
                        reciboEmitidoEm: action.payload.emitidoEm
                      }
                    : parcela
                )
              }
            : item
        )
      };
    case 'ADD_CORRETOR':
      return { ...state, corretores: [action.payload, ...state.corretores] };
    case 'UPDATE_CORRETOR':
      return {
        ...state,
        corretores: state.corretores.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        )
      };
    case 'DELETE_CORRETOR':
      return { ...state, corretores: state.corretores.filter(c => c.id !== action.payload) };
    default:
      return state;
  }
}

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

interface SgciContextValue extends SgciState {
  isHydrated: boolean;
  addEmpreendimento: (data: Omit<Empreendimento, 'id'>) => void;
  updateEmpreendimento: (id: string, data: Partial<Empreendimento>) => void;
  deleteEmpreendimento: (id: string) => void;
  addCliente: (data: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addNegociacao: (data: Omit<Negociacao, 'id' | 'parcelas' | 'criadoEm' | 'shareId'>) => void;
  deleteNegociacao: (id: string) => void;
  addParcela: (negociacaoId: string, data: Omit<Parcela, 'id'>) => void;
  atualizarStatusParcela: (negociacaoId: string, parcelaId: string, status: Parcela['status']) => void;
  registrarReciboParcela: (
    negociacaoId: string,
    parcelaId: string,
    data: { shareId: string; shareUrl?: string; numero: string; emitidoEm: string }
  ) => void;
  addCorretor: (data: Omit<Corretor, 'id'>) => void;
  updateCorretor: (id: string, data: Partial<Corretor>) => void;
  deleteCorretor: (id: string) => void;
}

const SgciContext = createContext<SgciContextValue | undefined>(undefined);

export function SgciProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, dispatch] = useReducer(reducer, defaultState);
  const skipNextSyncRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const response = await fetch('/api/sgci/state', { cache: 'no-store' });
        if (response.ok) {
          const payload: SgciState = await response.json();
          if (!cancelled) {
            dispatch({ type: 'HYDRATE', payload: payload || defaultState });
            skipNextSyncRef.current = true;
            startTransition(() => setIsHydrated(true));
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados SGCI do MongoDB:', error);
      }

      try {
        const seedResponse = await fetch('/api/sgci/seed', { method: 'POST' });
        if (seedResponse.ok) {
          const payload = await seedResponse.json();
          if (!cancelled) {
            const statePayload: SgciState = payload.state ?? defaultState;
            dispatch({ type: 'HYDRATE', payload: statePayload });
            skipNextSyncRef.current = true;
            startTransition(() => setIsHydrated(true));
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao semear dados SGCI:', error);
      }

      if (!cancelled) {
        dispatch({ type: 'HYDRATE', payload: defaultState });
        skipNextSyncRef.current = true;
        startTransition(() => setIsHydrated(true));
      }
    }

    loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    const controller = new AbortController();

    async function syncState() {
      try {
        await fetch('/api/sgci/state', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(state),
          signal: controller.signal
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erro ao sincronizar SGCI com MongoDB:', error);
        }
      }
    }

    syncState();

    return () => controller.abort();
  }, [state, isHydrated]);

  const value = useMemo<SgciContextValue>(() => {
    const addEmpreendimento = (data: Omit<Empreendimento, 'id'>) => {
      dispatch({ type: 'ADD_EMPREENDIMENTO', payload: { ...data, id: generateId('emp') } });
    };

    const updateEmpreendimento = (id: string, data: Partial<Empreendimento>) => {
      dispatch({ type: 'UPDATE_EMPREENDIMENTO', payload: { id, data } });
    };

    const deleteEmpreendimento = (id: string) => {
      dispatch({ type: 'DELETE_EMPREENDIMENTO', payload: id });
    };

    const addCliente = (data: Omit<Cliente, 'id'>) => {
      dispatch({ type: 'ADD_CLIENTE', payload: { ...data, id: generateId('cli') } });
    };

    const updateCliente = (id: string, data: Partial<Cliente>) => {
      dispatch({ type: 'UPDATE_CLIENTE', payload: { id, data } });
    };

    const deleteCliente = (id: string) => {
      dispatch({ type: 'DELETE_CLIENTE', payload: id });
    };

    const addNegociacao = (data: Omit<Negociacao, 'id' | 'parcelas' | 'criadoEm' | 'shareId'>) => {
      dispatch({
        type: 'ADD_NEGOCIACAO',
        payload: {
          ...data,
          status: data.status ?? 'Em prospecção',
          id: generateId('neg'),
          shareId:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : generateId('share'),
          criadoEm: format(new Date(), 'yyyy-MM-dd'),
          parcelas: []
        }
      });
    };

    const deleteNegociacao = (id: string) => {
      dispatch({ type: 'DELETE_NEGOCIACAO', payload: id });
    };

    const addParcela = (negociacaoId: string, data: Omit<Parcela, 'id'>) => {
      dispatch({
        type: 'ADD_PARCELA',
        payload: {
          negociacaoId,
          parcela: {
            ...data,
            id: generateId('par')
          }
        }
      });
    };

    const atualizarStatusParcela = (negociacaoId: string, parcelaId: string, status: Parcela['status']) => {
      dispatch({ type: 'UPDATE_PARCELA_STATUS', payload: { negociacaoId, parcelaId, status } });
    };

    const registrarReciboParcela = (
      negociacaoId: string,
      parcelaId: string,
      data: { shareId: string; shareUrl?: string; numero: string; emitidoEm: string }
    ) => {
      if (!data.shareId) return;
      dispatch({
        type: 'REGISTRAR_RECIBO_PARCELA',
        payload: {
          negociacaoId,
          parcelaId,
          shareId: data.shareId,
          shareUrl: data.shareUrl,
          numero: data.numero,
          emitidoEm: data.emitidoEm
        }
      });
    };

    const addCorretor = (data: Omit<Corretor, 'id'>) => {
      dispatch({ type: 'ADD_CORRETOR', payload: { ...data, id: generateId('cor') } });
    };

    const updateCorretor = (id: string, data: Partial<Corretor>) => {
      dispatch({ type: 'UPDATE_CORRETOR', payload: { id, data } });
    };

    const deleteCorretor = (id: string) => {
      dispatch({ type: 'DELETE_CORRETOR', payload: id });
    };

    return {
      ...state,
      isHydrated,
      addEmpreendimento,
      updateEmpreendimento,
      deleteEmpreendimento,
      addCliente,
      updateCliente,
      deleteCliente,
      addNegociacao,
      deleteNegociacao,
      addParcela,
      atualizarStatusParcela,
      registrarReciboParcela,
      addCorretor,
      updateCorretor,
      deleteCorretor
    };
  }, [state, isHydrated]);

  return <SgciContext.Provider value={value}>{children}</SgciContext.Provider>;
}

export function useSgci() {
  const context = useContext(SgciContext);
  if (!context) {
    throw new Error('useSgci deve ser utilizado dentro de SgciProvider');
  }
  return context;
}
