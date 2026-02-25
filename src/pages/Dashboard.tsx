import { useState, useMemo } from "react";
import {
  Wrench, Box, ClipboardList, FolderKanban, BarChart3, TrendingUp,
} from "lucide-react";
import { format, subMonths, subYears, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useStockStore } from "@/stores/stockStore";

const stats = [
  { label: "Serviços", value: "4", icon: Wrench, change: "Ativos" },
  { label: "Projetos Financiados", value: "8", icon: FolderKanban, change: "+2" },
  { label: "Stock Total", value: "8.432", icon: Box, change: "-2%" },
  { label: "Pedidos Pendentes", value: "23", icon: ClipboardList, change: "+5" },
];

type FilterMode = "month" | "year" | "range";
type ChartType = "bar" | "line";
type MetricType = "pedidos" | "unidades";

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
};

const Dashboard = () => {
  const { pedidos } = useStockStore();

  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [metric, setMetric] = useState<MetricType>("pedidos");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const chartData = useMemo(() => {
    const now = new Date();

    if (filterMode === "month") {
      const months: { label: string; value: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(now, i);
        const start = startOfMonth(d);
        const end = endOfMonth(d);
        const filtered = pedidos.filter((p) => {
          const pd = parseISO(p.criadoEm);
          return isWithinInterval(pd, { start, end });
        });
        const val = metric === "pedidos"
          ? filtered.length
          : filtered.reduce((sum, p) => sum + p.produtos.reduce((s, pp) => s + pp.quantidade, 0), 0);
        months.push({ label: format(d, "MMM yy", { locale: pt }), value: val });
      }
      return months;
    }

    if (filterMode === "year") {
      const years: { label: string; value: number }[] = [];
      for (let i = 4; i >= 0; i--) {
        const d = subYears(now, i);
        const start = startOfYear(d);
        const end = endOfYear(d);
        const filtered = pedidos.filter((p) => {
          const pd = parseISO(p.criadoEm);
          return isWithinInterval(pd, { start, end });
        });
        const val = metric === "pedidos"
          ? filtered.length
          : filtered.reduce((sum, p) => sum + p.produtos.reduce((s, pp) => s + pp.quantidade, 0), 0);
        years.push({ label: format(d, "yyyy"), value: val });
      }
      return years;
    }

    // range
    if (dateFrom && dateTo) {
      const filtered = pedidos.filter((p) => {
        const pd = parseISO(p.criadoEm);
        return isWithinInterval(pd, { start: dateFrom, end: dateTo });
      });
      // Group by month within range
      const map = new Map<string, number>();
      filtered.forEach((p) => {
        const key = format(parseISO(p.criadoEm), "MMM yy", { locale: pt });
        if (metric === "pedidos") {
          map.set(key, (map.get(key) || 0) + 1);
        } else {
          const units = p.produtos.reduce((s, pp) => s + pp.quantidade, 0);
          map.set(key, (map.get(key) || 0) + units);
        }
      });
      return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }

    return [];
  }, [pedidos, filterMode, metric, dateFrom, dateTo]);

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral — +INFO Data CoLAB
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md hover:border-primary/20 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Análise de Pedidos */}
      <Card className="mt-8">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Análise de Pedidos
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric toggle */}
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setMetric("pedidos")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  metric === "pedidos" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                Pedidos
              </button>
              <button
                onClick={() => setMetric("unidades")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  metric === "unidades" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                Unidades
              </button>
            </div>

            {/* Chart type toggle */}
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setChartType("bar")}
                className={cn(
                  "px-2.5 py-1.5 text-xs transition-colors",
                  chartType === "bar" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                )}
                title="Barras"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={cn(
                  "px-2.5 py-1.5 text-xs transition-colors",
                  chartType === "line" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                )}
                title="Linha"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter mode */}
            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Últimos 12 Meses</SelectItem>
                <SelectItem value="year">Últimos 5 Anos</SelectItem>
                <SelectItem value="range">Intervalo de Datas</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range pickers */}
            {filterMode === "range" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "De"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <span className="text-xs text-muted-foreground">—</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : "Até"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              Sem dados para o período selecionado.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              )}
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: "Novo pedido #1042 criado", time: "Há 5 min" },
                { text: "Stock atualizado — Categoria Eletrónicos", time: "Há 12 min" },
                { text: "Utilizador João Silva adicionado", time: "Há 1 hora" },
                { text: "Exportação de dados concluída", time: "Há 2 horas" },
                { text: "Novo produto adicionado ao catálogo", time: "Há 3 horas" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{item.text}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "#1042", status: "Pendente", client: "Empresa ABC", value: "€2.340" },
                { id: "#1041", status: "Em Progresso", client: "Tech Solutions", value: "€890" },
                { id: "#1040", status: "Concluído", client: "Global Corp", value: "€5.120" },
                { id: "#1039", status: "Concluído", client: "StartUp Lda", value: "€1.750" },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary">{order.id}</span>
                    <span className="text-sm text-foreground">{order.client}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-[11px] border-0 ${
                      order.status === "Concluído" ? "bg-green-100 text-green-700"
                        : order.status === "Pendente" ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>{order.status}</Badge>
                    <span className="text-sm font-medium text-foreground">{order.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
