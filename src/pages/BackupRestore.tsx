import { useRef, useState } from "react";
import { Download, Upload, Database, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFullBackup, restoreFromBackup } from "@/stores/stockStore";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { getLastBackupDate, setLastBackupDate, isBackupOverdue } from "@/lib/backupUtils";

const BackupRestore = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const [backupInfo, setBackupInfo] = useState<{ date?: string; produtos?: number; pedidos?: number; users?: number } | null>(null);

  const handleExport = () => {
    const data = getFullBackup();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_infodc_${format(new Date(), "yyyy-MM-dd_HHmm")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackupDate();
    toast.success("Backup exportado com sucesso");
  };

  const lastBackup = getLastBackupDate();
  const overdue = isBackupOverdue();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        setPendingFile(text);
        setBackupInfo({
          date: parsed.date,
          produtos: parsed.stock?.produtos?.length || 0,
          pedidos: parsed.stock?.pedidos?.length || 0,
          users: parsed.users?.length || 0,
        });
        setConfirmRestore(true);
      } catch {
        toast.error("Ficheiro inválido");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRestore = () => {
    if (!pendingFile) return;
    const err = restoreFromBackup(pendingFile);
    if (err) {
      toast.error(err);
    } else {
      toast.success("Dados restaurados com sucesso. A página será recarregada.");
      setTimeout(() => window.location.reload(), 1500);
    }
    setConfirmRestore(false);
    setPendingFile(null);
    setBackupInfo(null);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Backup & Restauro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exporte uma cópia de segurança dos dados ou restaure a partir de um ficheiro anterior.
        </p>
      </div>

      {/* Last backup status */}
      <Card className={`mb-6 max-w-3xl ${overdue ? "border-amber-500/30 bg-amber-50/50" : "border-green-500/20 bg-green-50/30"}`}>
        <CardContent className="p-4 flex items-center gap-3">
          {overdue ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          )}
          <div className="text-sm">
            {lastBackup ? (
              <p>
                <span className="text-muted-foreground">Último backup:</span>{" "}
                <strong>{format(lastBackup, "dd/MM/yyyy 'às' HH:mm")}</strong>{" "}
                <span className="text-muted-foreground">({formatDistanceToNow(lastBackup, { addSuffix: true, locale: pt })})</span>
              </p>
            ) : (
              <p className="font-medium text-amber-700">Nunca foi feito um backup. Recomendamos exportar agora.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Exportar Backup</CardTitle>
                <CardDescription>Descarregar cópia de segurança</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exporta todos os dados do sistema (stock, pedidos, movimentos, utilizadores) num ficheiro JSON.
            </p>
            <Button onClick={handleExport} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Exportar Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Restaurar Backup</CardTitle>
                <CardDescription>Importar dados de um ficheiro</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Restaura os dados a partir de um ficheiro de backup exportado anteriormente. <strong>Os dados atuais serão substituídos.</strong>
            </p>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full gap-2 border-amber-500/30 hover:bg-amber-50">
              <Upload className="w-4 h-4" />
              Selecionar Ficheiro
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 max-w-3xl">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Recomendações:</strong></p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Exporte backups regularmente (idealmente diariamente)</li>
                <li>Guarde os ficheiros num local seguro (disco externo, cloud)</li>
                <li>Antes de restaurar, exporte o estado atual como precaução</li>
                <li>Os dados são automaticamente guardados no navegador</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirmar Restauro
            </DialogTitle>
            <DialogDescription>
              Esta ação vai substituir todos os dados atuais pelos dados do backup. Esta operação não pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          {backupInfo && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              {backupInfo.date && (
                <p><span className="text-muted-foreground">Data do backup:</span> <strong>{format(new Date(backupInfo.date), "dd/MM/yyyy HH:mm")}</strong></p>
              )}
              <p><span className="text-muted-foreground">Produtos:</span> <strong>{backupInfo.produtos}</strong></p>
              <p><span className="text-muted-foreground">Pedidos:</span> <strong>{backupInfo.pedidos}</strong></p>
              <p><span className="text-muted-foreground">Utilizadores:</span> <strong>{backupInfo.users}</strong></p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmRestore(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRestore} className="gap-2">
              <Upload className="w-4 h-4" />
              Restaurar Dados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupRestore;
