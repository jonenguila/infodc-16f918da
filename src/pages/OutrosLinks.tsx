import { useState } from "react";
import { Users, Palette, Image, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LinkItem {
  id: number;
  nome: string;
  descricao: string;
  icon: React.ElementType;
  url?: string;
  cor: string;
}

const links: LinkItem[] = [
  {
    id: 1,
    nome: "Recursos Humanos",
    descricao: "Acesso ao portal de recursos humanos",
    icon: Users,
    url: "",
    cor: "bg-blue-500/10 text-blue-600",
  },
  {
    id: 2,
    nome: "Design e Comunicação",
    descricao: "Recursos de design e comunicação",
    icon: Palette,
    url: "",
    cor: "bg-purple-500/10 text-purple-600",
  },
  {
    id: 3,
    nome: "Logos Data CoLAB",
    descricao: "Repositório de logótipos oficiais",
    icon: Image,
    url: "",
    cor: "bg-emerald-500/10 text-emerald-600",
  },
];

const OutrosLinks = () => {
  const { toast } = useToast();

  const handleClick = (link: LinkItem) => {
    if (link.url) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    } else {
      toast({
        title: "Link não disponível",
        description: `O link para "${link.nome}" ainda não foi configurado.`,
      });
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Outros Links Úteis</h1>
        <p className="text-sm text-muted-foreground mt-1">Acesso rápido a recursos internos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {links.map((link) => (
          <Card
            key={link.id}
            className="hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
            onClick={() => handleClick(link)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${link.cor} group-hover:scale-110 transition-transform duration-200`}>
                <link.icon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                {link.nome}
              </h3>
              <p className="text-sm text-muted-foreground">{link.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OutrosLinks;
