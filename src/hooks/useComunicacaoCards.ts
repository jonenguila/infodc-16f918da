import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SeccaoCard = "novos_pedidos" | "newsletter" | "outros_links";

export interface ComunicacaoCard {
  id: string;
  seccao: SeccaoCard;
  titulo: string;
  descricao: string;
  icone: string;
  texto_botao: string;
  link: string;
  abrir_nova_aba: boolean;
  cor: string;
  ordem: number;
  created_at?: string;
  updated_at?: string;
}

export function useComunicacaoCards(seccao: SeccaoCard) {
  const [cards, setCards] = useState<ComunicacaoCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comunicacao_cards")
      .select("*")
      .eq("seccao", seccao)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar cards", description: error.message, variant: "destructive" });
    } else {
      setCards((data ?? []) as ComunicacaoCard[]);
    }
    setLoading(false);
  }, [seccao]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const createCard = async (data: Omit<ComunicacaoCard, "id" | "created_at" | "updated_at" | "ordem">) => {
    const maxOrdem = cards.reduce((m, c) => Math.max(m, c.ordem), 0);
    const { error } = await supabase.from("comunicacao_cards").insert({ ...data, ordem: maxOrdem + 1 });
    if (error) {
      toast({ title: "Erro ao criar card", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Card criado com sucesso" });
    await fetchCards();
  };

  const updateCard = async (id: string, data: Partial<ComunicacaoCard>) => {
    const { error } = await supabase.from("comunicacao_cards").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar card", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Card atualizado" });
    await fetchCards();
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from("comunicacao_cards").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao eliminar card", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Card eliminado" });
    await fetchCards();
  };

  return { cards, loading, createCard, updateCard, deleteCard, refetch: fetchCards };
}
