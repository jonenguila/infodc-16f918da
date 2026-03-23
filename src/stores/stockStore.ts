import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Produto {
  id: string;
  nome: string;
  tipologia: string;
  localizacao: string;
  stockAtual: number;
  stockMinimo: number;
  imagemUrl: string;
}

export interface Tipologia {
  id: string;
  nome: string;
  descricao: string;
}

export interface Localizacao {
  id: string;
  nome: string;
  descricao: string;
}

export interface Movimento {
  id: string;
  produtoId: string | null;
  produtoNome: string;
  tipo: "levantamento" | "devolucao" | "pedido" | "cancelamento";
  quantidade: number;
  data: string;
  responsavel: string;
  evento: string;
}

export interface PedidoProduto {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
}

export interface Pedido {
  id: string;
  numero: string;
  dataPedido: string;
  nomeRequisitante: string;
  email: string;
  origem: string;
  destino: string;
  descricaoDestino: string;
  tipoEvento: string;
  nomeEvento: string;
  dataEvento: string;
  dataRecolha: string;
  responsavelLevantamento: string;
  prioridade: "Baixa" | "Média" | "Alta" | "Urgente";
  observacoes: string;
  produtos: PedidoProduto[];
  estado: "Pendente" | "Entregue" | "Cancelado";
  criadoEm: string;
}

export interface PedidoLevantamento {
  id: string;
  produtoId: string | null;
  produtoNome: string;
  quantidadeLevantada: number;
  quantidadeDevolvida: number;
  consumoReal: number;
  responsavel: string;
  evento: string;
  data: string;
  estado: "Ativo" | "Concluído";
}

export interface ProdutoDevolucaoDoc {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
}

export interface DocumentoDevolucao {
  id: string;
  nome: string;
  nomeEvento: string;
  dataEntrega: string;
  responsavel: string;
  produtos: ProdutoDevolucaoDoc[];
  observacoes: string;
}

const DEFAULT_STOCK_MINIMO = 40;

// Module-level cache
let _produtos: Produto[] = [];
let _tipologias: Tipologia[] = [];
let _localizacoes: Localizacao[] = [];
let _movimentos: Movimento[] = [];
let _pedidos: Pedido[] = [];
let _pedidosLevantamento: PedidoLevantamento[] = [];
let _documentosDevolucao: DocumentoDevolucao[] = [];
let _loading = true;
let _initialized = false;
let _listeners: (() => void)[] = [];

function notify() {
  _listeners.forEach((l) => l());
}

async function fetchAll() {
  const [pRes, tRes, lRes, mRes, pedRes, plRes, ddRes] = await Promise.all([
    supabase.from("stock_produtos").select("*").order("nome"),
    supabase.from("stock_tipologias").select("*").order("nome"),
    supabase.from("stock_localizacoes").select("*").order("nome"),
    supabase.from("stock_movimentos").select("*").order("created_at", { ascending: false }),
    supabase.from("stock_pedidos").select("*").order("criado_em", { ascending: false }),
    supabase.from("stock_pedidos_levantamento").select("*").order("created_at", { ascending: false }),
    supabase.from("stock_documentos_devolucao").select("*").order("created_at", { ascending: false }),
  ]);

  _produtos = (pRes.data || []).map((p: any) => ({
    id: p.id, nome: p.nome, tipologia: p.tipologia, localizacao: p.localizacao || "",
    stockAtual: p.stock_atual, stockMinimo: p.stock_minimo, imagemUrl: p.imagem_url || "",
  }));

  _tipologias = (tRes.data || []).map((t: any) => ({
    id: t.id, nome: t.nome, descricao: t.descricao || "",
  }));

  _localizacoes = (lRes.data || []).map((l: any) => ({
    id: l.id, nome: l.nome, descricao: l.descricao || "",
  }));

  _movimentos = (mRes.data || []).map((m: any) => ({
    id: m.id, produtoId: m.produto_id, produtoNome: m.produto_nome,
    tipo: m.tipo as Movimento["tipo"],
    quantidade: m.quantidade, data: m.data, responsavel: m.responsavel || "", evento: m.evento || "",
  }));

  _pedidos = (pedRes.data || []).map((p: any) => ({
    id: p.id, numero: p.numero, dataPedido: p.data_pedido,
    nomeRequisitante: p.nome_requisitante, email: p.email,
    origem: p.origem || "", destino: p.destino || "", descricaoDestino: p.descricao_destino || "",
    tipoEvento: p.tipo_evento || "", nomeEvento: p.nome_evento || "",
    dataEvento: p.data_evento || "", dataRecolha: p.data_recolha || "",
    responsavelLevantamento: p.responsavel_levantamento || "",
    prioridade: p.prioridade as Pedido["prioridade"],
    observacoes: p.observacoes || "",
    produtos: (p.produtos || []) as PedidoProduto[],
    estado: p.estado as Pedido["estado"],
    criadoEm: p.criado_em,
  }));

  _pedidosLevantamento = (plRes.data || []).map((pl: any) => ({
    id: pl.id, produtoId: pl.produto_id, produtoNome: pl.produto_nome,
    quantidadeLevantada: pl.quantidade_levantada, quantidadeDevolvida: pl.quantidade_devolvida,
    consumoReal: pl.consumo_real, responsavel: pl.responsavel || "", evento: pl.evento || "",
    data: pl.data, estado: pl.estado as "Ativo" | "Concluído",
  }));

  _documentosDevolucao = (ddRes.data || []).map((d: any) => ({
    id: d.id, nome: d.nome, nomeEvento: d.nome_evento || "",
    dataEntrega: d.data_entrega, responsavel: d.responsavel || "",
    produtos: (d.produtos || []) as ProdutoDevolucaoDoc[],
    observacoes: d.observacoes || "",
  }));

  _loading = false;
  _initialized = true;
  notify();
}

// Backup functions (now export from DB)
export function getFullBackup(): string {
  return JSON.stringify({
    version: 2,
    date: new Date().toISOString(),
    produtos: _produtos,
    tipologias: _tipologias,
    localizacoes: _localizacoes,
    movimentos: _movimentos,
    pedidos: _pedidos,
    pedidosLevantamento: _pedidosLevantamento,
    documentosDevolucao: _documentosDevolucao,
  }, null, 2);
}

export function restoreFromBackup(_json: string): string | null {
  return "A restauração de backup não está disponível na versão cloud. Os dados são geridos diretamente na base de dados.";
}

export function useStockStore() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    _listeners.push(rerender);
    if (!_initialized) fetchAll();
    return () => {
      _listeners = _listeners.filter((l) => l !== rerender);
    };
  }, [rerender]);

  const refresh = () => fetchAll();

  const getEstado = (p: Produto): "OK" | "Abaixo do mínimo" | "Esgotado" => {
    if (p.stockAtual === 0) return "Esgotado";
    if (p.stockAtual < p.stockMinimo) return "Abaixo do mínimo";
    return "OK";
  };

  const importarExcel = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) { resolve(); return; }
          const lines = text.split("\n").filter((l) => l.trim());
          if (lines.length < 2) { resolve(); return; }
          const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
          const nomeIdx = headers.findIndex((h) => h.includes("nome") || h.includes("produto") || h.includes("product"));
          const tipoIdx = headers.findIndex((h) => h.includes("tipologia") || h.includes("tipo") || h.includes("type") || h.includes("categoria"));
          const stockIdx = headers.findIndex((h) => h.includes("quantidade") || h.includes("stock atual") || h.includes("qty") || h.includes("stock"));
          const minIdx = headers.findIndex((h) => h.includes("mínimo") || h.includes("minimo") || h.includes("min"));
          const locIdx = headers.findIndex((h) => h.includes("localização") || h.includes("localizacao") || h.includes("localiza") || h.includes("location"));

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(/[,;\t]/).map((c) => c.trim());
            const nome = nomeIdx >= 0 ? cols[nomeIdx] : "";
            if (!nome) continue;
            const tipologia = tipoIdx >= 0 ? cols[tipoIdx] || "Geral" : "Geral";
            const stockAtual = stockIdx >= 0 ? parseInt(cols[stockIdx]) || 0 : 0;
            const stockMinimo = minIdx >= 0 ? parseInt(cols[minIdx]) || DEFAULT_STOCK_MINIMO : DEFAULT_STOCK_MINIMO;
            const localizacao = locIdx >= 0 ? cols[locIdx] || "" : "";

            const existing = _produtos.find((p) => p.nome.toLowerCase() === nome.toLowerCase());
            if (existing) {
              await supabase.from("stock_produtos").update({
                stock_atual: stockAtual, tipologia, localizacao: localizacao || existing.localizacao,
                stock_minimo: minIdx >= 0 ? stockMinimo : existing.stockMinimo,
              }).eq("id", existing.id);
            } else {
              await supabase.from("stock_produtos").insert({
                nome, tipologia, localizacao, stock_atual: stockAtual, stock_minimo: stockMinimo,
              });
            }
          }
          await fetchAll();
        } catch { /* silent */ }
        resolve();
      };
      reader.readAsText(file);
    });
  };

  const adicionarProduto = async (nome: string, tipologia: string, localizacao: string, stockAtual: number, stockMinimo: number, imagemUrl?: string): Promise<string | null> => {
    if (!nome.trim()) return "Nome do produto é obrigatório.";
    const existing = _produtos.find((p) => p.nome.toLowerCase() === nome.toLowerCase());
    if (existing) return `Produto "${nome}" já existe.`;
    const { error } = await supabase.from("stock_produtos").insert({
      nome: nome.trim(), tipologia: tipologia || "Geral", localizacao: localizacao || "",
      stock_atual: stockAtual || 0, stock_minimo: stockMinimo || DEFAULT_STOCK_MINIMO,
      imagem_url: imagemUrl || "",
    });
    if (error) return error.message;
    await fetchAll();
    return null;
  };

  const editarProduto = async (id: string, nome: string, tipologia: string, localizacao: string, stockAtual: number, stockMinimo: number, imagemUrl?: string) => {
    await supabase.from("stock_produtos").update({
      nome: nome.trim(), tipologia, localizacao, stock_atual: stockAtual, stock_minimo: stockMinimo,
      imagem_url: imagemUrl || "",
    }).eq("id", id);
    await fetchAll();
  };

  const eliminarProduto = async (id: string) => {
    await supabase.from("stock_produtos").delete().eq("id", id);
    await fetchAll();
  };

  const getNextPedidoNumber = (): string => {
    const maxNum = _pedidos.reduce((max, p) => {
      const match = p.numero.match(/PED-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `PED-${String(maxNum + 1).padStart(4, "0")}`;
  };

  const exportarTemplate = () => {
    const headers = ["Nome do Produto *", "Tipologia *", "Localização", "Quantidade / Stock Atual *", "Stock Mínimo"];
    const example = ["Exemplo Produto", "Escritório", "Sede", "100", "40"];
    const bom = "\uFEFF";
    const csv = [headers.join(";"), example.join(";"), ";;;; (apagar estas linhas de exemplo)"].join("\n");
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_produtos_stock.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tipologias CRUD
  const adicionarTipologia = async (nome: string, descricao: string): Promise<string | null> => {
    if (!nome.trim()) return "Nome é obrigatório.";
    if (_tipologias.find((t) => t.nome.toLowerCase() === nome.toLowerCase())) return `Tipologia "${nome}" já existe.`;
    const { error } = await supabase.from("stock_tipologias").insert({ nome: nome.trim(), descricao: descricao.trim() });
    if (error) return error.message;
    await fetchAll();
    return null;
  };

  const editarTipologia = async (id: string, nome: string, descricao: string) => {
    await supabase.from("stock_tipologias").update({ nome: nome.trim(), descricao: descricao.trim() }).eq("id", id);
    await fetchAll();
  };

  const eliminarTipologia = async (id: string) => {
    await supabase.from("stock_tipologias").delete().eq("id", id);
    await fetchAll();
  };

  // Localizações CRUD
  const adicionarLocalizacao = async (nome: string, descricao: string): Promise<string | null> => {
    if (!nome.trim()) return "Nome é obrigatório.";
    if (_localizacoes.find((l) => l.nome.toLowerCase() === nome.toLowerCase())) return `Localização "${nome}" já existe.`;
    const { error } = await supabase.from("stock_localizacoes").insert({ nome: nome.trim(), descricao: descricao.trim() });
    if (error) return error.message;
    await fetchAll();
    return null;
  };

  const editarLocalizacao = async (id: string, nome: string, descricao: string) => {
    await supabase.from("stock_localizacoes").update({ nome: nome.trim(), descricao: descricao.trim() }).eq("id", id);
    await fetchAll();
  };

  const eliminarLocalizacao = async (id: string) => {
    await supabase.from("stock_localizacoes").delete().eq("id", id);
    await fetchAll();
  };

  const criarPedido = async (pedidoData: Omit<Pedido, "id" | "estado" | "criadoEm" | "numero">): Promise<string | null> => {
    // Validate stock
    for (const pp of pedidoData.produtos) {
      const prod = _produtos.find((p) => p.id === pp.produtoId);
      if (!prod) return `Produto "${pp.produtoNome}" não encontrado.`;
      if (pp.quantidade > prod.stockAtual) return `Stock insuficiente para "${pp.produtoNome}" (disponível: ${prod.stockAtual}).`;
    }

    // Deduct stock
    for (const pp of pedidoData.produtos) {
      const prod = _produtos.find((p) => p.id === pp.produtoId)!;
      await supabase.from("stock_produtos").update({
        stock_atual: prod.stockAtual - pp.quantidade,
      }).eq("id", pp.produtoId);
    }

    const numero = getNextPedidoNumber();
    const { error } = await supabase.from("stock_pedidos").insert({
      numero,
      data_pedido: pedidoData.dataPedido,
      nome_requisitante: pedidoData.nomeRequisitante,
      email: pedidoData.email,
      origem: pedidoData.origem,
      destino: pedidoData.destino,
      descricao_destino: pedidoData.descricaoDestino,
      tipo_evento: pedidoData.tipoEvento,
      nome_evento: pedidoData.nomeEvento,
      data_evento: pedidoData.dataEvento,
      data_recolha: pedidoData.dataRecolha,
      responsavel_levantamento: pedidoData.responsavelLevantamento,
      prioridade: pedidoData.prioridade,
      observacoes: pedidoData.observacoes,
      produtos: pedidoData.produtos as any,
      estado: "Pendente",
    });

    if (error) return error.message;
    await fetchAll();
    return null;
  };

  const atualizarEstadoPedido = async (pedidoId: string, estado: Pedido["estado"]) => {
    const pedido = _pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;

    if (estado === "Cancelado") {
      for (const pp of pedido.produtos) {
        const prod = _produtos.find((p) => p.id === pp.produtoId);
        if (prod) {
          await supabase.from("stock_produtos").update({
            stock_atual: prod.stockAtual + pp.quantidade,
          }).eq("id", pp.produtoId);
        }
      }
    }

    await supabase.from("stock_pedidos").update({ estado }).eq("id", pedidoId);
    await fetchAll();
  };

  const criarLevantamento = async (produtoId: string, quantidade: number, responsavel: string, evento: string, data: string): Promise<string | null> => {
    const produto = _produtos.find((p) => p.id === produtoId);
    if (!produto) return "Produto não encontrado";
    if (quantidade <= 0) return "Quantidade inválida";
    if (quantidade > produto.stockAtual) return "Stock insuficiente";

    // Deduct stock
    await supabase.from("stock_produtos").update({
      stock_atual: produto.stockAtual - quantidade,
    }).eq("id", produtoId);

    // Create levantamento record
    await supabase.from("stock_pedidos_levantamento").insert({
      produto_id: produtoId, produto_nome: produto.nome,
      quantidade_levantada: quantidade, quantidade_devolvida: 0, consumo_real: quantidade,
      responsavel, evento, data, estado: "Ativo",
    });

    // Create movement record
    await supabase.from("stock_movimentos").insert({
      produto_id: produtoId, produto_nome: produto.nome,
      tipo: "levantamento", quantidade, data, responsavel, evento,
    });

    await fetchAll();
    return null;
  };

  const registarDevolucao = async (pedidoId: string, quantidadeDevolvida: number, dataDevolucao: string): Promise<string | null> => {
    const pedido = _pedidosLevantamento.find((p) => p.id === pedidoId);
    if (!pedido) return "Pedido não encontrado";
    if (pedido.estado === "Concluído") return "Pedido já concluído";
    if (quantidadeDevolvida <= 0) return "Quantidade inválida";
    if (quantidadeDevolvida > (pedido.quantidadeLevantada - pedido.quantidadeDevolvida)) return "Quantidade superior ao levantado";

    const newDevolvida = pedido.quantidadeDevolvida + quantidadeDevolvida;
    const newConsumo = pedido.quantidadeLevantada - newDevolvida;

    await supabase.from("stock_pedidos_levantamento").update({
      quantidade_devolvida: newDevolvida,
      consumo_real: newConsumo,
      estado: "Concluído",
    }).eq("id", pedidoId);

    // Restore stock
    if (pedido.produtoId) {
      const produto = _produtos.find((p) => p.id === pedido.produtoId);
      if (produto) {
        await supabase.from("stock_produtos").update({
          stock_atual: produto.stockAtual + quantidadeDevolvida,
        }).eq("id", pedido.produtoId);
      }
    }

    // Movement record
    await supabase.from("stock_movimentos").insert({
      produto_id: pedido.produtoId, produto_nome: pedido.produtoNome,
      tipo: "devolucao", quantidade: quantidadeDevolvida, data: dataDevolucao,
      responsavel: pedido.responsavel, evento: pedido.evento,
    });

    await fetchAll();
    return null;
  };

  const registarDocumentoDevolucao = async (doc: Omit<DocumentoDevolucao, "id">): Promise<void> => {
    // Insert document
    await supabase.from("stock_documentos_devolucao").insert({
      nome: doc.nome, nome_evento: doc.nomeEvento, data_entrega: doc.dataEntrega,
      responsavel: doc.responsavel, produtos: doc.produtos as any, observacoes: doc.observacoes,
    });

    // Restore stock and create movements
    for (const pp of doc.produtos) {
      const produto = _produtos.find((p) => p.id === pp.produtoId);
      if (produto) {
        await supabase.from("stock_produtos").update({
          stock_atual: produto.stockAtual + pp.quantidade,
        }).eq("id", pp.produtoId);
      }
      await supabase.from("stock_movimentos").insert({
        produto_id: pp.produtoId, produto_nome: pp.produtoNome,
        tipo: "devolucao", quantidade: pp.quantidade, data: doc.dataEntrega,
        responsavel: doc.responsavel, evento: doc.nomeEvento,
      });
    }

    await fetchAll();
  };

  return {
    produtos: _produtos,
    tipologias: _tipologias,
    localizacoes: _localizacoes,
    movimentos: _movimentos,
    pedidos: _pedidos,
    pedidosLevantamento: _pedidosLevantamento,
    documentosDevolucao: _documentosDevolucao,
    loading: _loading,
    refresh,
    getEstado, importarExcel, adicionarProduto, editarProduto, eliminarProduto, exportarTemplate, getNextPedidoNumber,
    criarPedido, atualizarEstadoPedido, criarLevantamento, registarDevolucao, registarDocumentoDevolucao,
    adicionarTipologia, editarTipologia, eliminarTipologia,
    adicionarLocalizacao, editarLocalizacao, eliminarLocalizacao,
    DEFAULT_STOCK_MINIMO,
  };
}
