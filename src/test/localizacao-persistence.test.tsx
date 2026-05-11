import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ---- Mock supabase client ----
type Captured = { table: string; op: string; payload?: any; eq?: [string, any] };
const captured: Captured[] = [];

const seedProdutos = [
  { id: "prod-1", nome: "Caneta", tipologia: "Geral", localizacao: "Sede", stock_atual: 100, stock_minimo: 40, imagem_url: "" },
];
const seedLocalizacoes = [
  { id: "loc-1", nome: "Sede", descricao: "" },
  { id: "loc-2", nome: "Delegação Norte", descricao: "" },
];

const tableData: Record<string, any[]> = {
  stock_produtos: seedProdutos,
  stock_tipologias: [],
  stock_localizacoes: seedLocalizacoes,
  stock_movimentos: [],
  stock_pedidos: [],
  stock_pedidos_levantamento: [],
  stock_documentos_devolucao: [],
};

const fromMock = (table: string) => {
  const api: any = {
    select: () => ({
      order: () => Promise.resolve({ data: tableData[table] ?? [], error: null }),
    }),
    insert: (payload: any) => {
      captured.push({ table, op: "insert", payload });
      return Promise.resolve({ error: null });
    },
    update: (payload: any) => ({
      eq: (col: string, val: any) => {
        captured.push({ table, op: "update", payload, eq: [col, val] });
        return Promise.resolve({ error: null });
      },
    }),
    delete: () => ({
      eq: (col: string, val: any) => {
        captured.push({ table, op: "delete", eq: [col, val] });
        return Promise.resolve({ error: null });
      },
    }),
  };
  return api;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (t: string) => fromMock(t),
    auth: { getUser: () => Promise.resolve({ data: { user: { id: "user-1" } } }) },
  },
}));

import { useStockStore } from "@/stores/stockStore";

async function getStore() {
  const { result } = renderHook(() => useStockStore());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

beforeEach(() => {
  captured.length = 0;
});

describe("Localização persistence", () => {
  it("persists localizacao when creating a pedido", async () => {
    const result = await getStore();
    await act(async () => {
      const err = await result.current.criarPedido({
        dataPedido: "2026-01-01",
        nomeRequisitante: "Ana",
        email: "a@a.pt",
        origem: "", destino: "", descricaoDestino: "",
        tipoEvento: "Workshop", nomeEvento: "WS",
        dataEvento: "2026-02-01", dataRecolha: "2026-02-02",
        responsavelLevantamento: "Ana",
        prioridade: "Média",
        observacoes: "",
        localizacao: "Delegação Norte",
        produtos: [{ produtoId: "prod-1", produtoNome: "Caneta", localizacao: "Sede", quantidade: 2 }],
      });
      expect(err).toBeNull();
    });
    const insert = captured.find((c) => c.table === "stock_pedidos" && c.op === "insert");
    expect(insert).toBeDefined();
    expect(insert!.payload.localizacao).toBe("Delegação Norte");
  });

  it("persists localizacao when editing/re-sending a pedido", async () => {
    const result = await getStore();
    await act(async () => {
      const err = await result.current.editarPedido("ped-123", {
        nomeRequisitante: "Ana",
        localizacao: "Delegação Norte",
      });
      expect(err).toBeNull();
    });
    const update = captured.find((c) => c.table === "stock_pedidos" && c.op === "update");
    expect(update).toBeDefined();
    expect(update!.payload.localizacao).toBe("Delegação Norte");
    expect(update!.eq).toEqual(["id", "ped-123"]);
  });

  it("does not overwrite localizacao when editing without specifying it", async () => {
    const result = await getStore();
    await act(async () => {
      await result.current.editarPedido("ped-123", { observacoes: "nota" });
    });
    const update = captured.find((c) => c.table === "stock_pedidos" && c.op === "update");
    expect(update!.payload).not.toHaveProperty("localizacao");
  });

  it("persists localizacao when registering a devolução document", async () => {
    const result = await getStore();
    await act(async () => {
      await result.current.registarDocumentoDevolucao({
        nome: "DEV-0001",
        nomeEvento: "WS",
        dataEntrega: "2026-02-10",
        responsavel: "Ana",
        localizacao: "Delegação Norte",
        produtos: [{ produtoId: "prod-1", produtoNome: "Caneta", localizacao: "Sede", quantidade: 1 }],
        observacoes: "",
      });
    });
    const insert = captured.find((c) => c.table === "stock_documentos_devolucao" && c.op === "insert");
    expect(insert).toBeDefined();
    expect(insert!.payload.localizacao).toBe("Delegação Norte");
  });

  it("persists localizacao when editing/re-sending a devolução document", async () => {
    const result = await getStore();
    await act(async () => {
      const err = await result.current.editarDocumentoDevolucao("dev-123", {
        localizacao: "Delegação Norte",
        responsavel: "Ana",
      });
      expect(err).toBeNull();
    });
    const update = captured.find((c) => c.table === "stock_documentos_devolucao" && c.op === "update");
    expect(update).toBeDefined();
    expect(update!.payload.localizacao).toBe("Delegação Norte");
    expect(update!.eq).toEqual(["id", "dev-123"]);
  });
});
