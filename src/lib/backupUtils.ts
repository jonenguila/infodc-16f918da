import { useEffect } from "react";
import { toast } from "sonner";
import { getFullBackup } from "@/stores/stockStore";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

const LAST_BACKUP_KEY = "erp_last_backup";
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const REMINDER_DISMISSED_KEY = "erp_backup_reminder_dismissed";

export function getLastBackupDate(): Date | null {
  const raw = localStorage.getItem(LAST_BACKUP_KEY);
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function setLastBackupDate(date: Date = new Date()) {
  localStorage.setItem(LAST_BACKUP_KEY, date.toISOString());
}

export function isBackupOverdue(): boolean {
  const last = getLastBackupDate();
  if (!last) return true;
  return Date.now() - last.getTime() > BACKUP_INTERVAL_MS;
}

export function performAutoBackup() {
  const data = getFullBackup();
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_auto_infodc_${format(new Date(), "yyyy-MM-dd_HHmm")}.json`;
  a.click();
  URL.revokeObjectURL(url);
  setLastBackupDate();
}

/**
 * Hook that checks on mount if backup is overdue and shows a reminder toast.
 * Only triggers once per session (dismissed for that session).
 */
export function useBackupReminder() {
  useEffect(() => {
    const dismissed = sessionStorage.getItem(REMINDER_DISMISSED_KEY);
    if (dismissed) return;

    // Small delay so it doesn't interfere with page load
    const timer = setTimeout(() => {
      if (isBackupOverdue()) {
        const last = getLastBackupDate();
        const msg = last
          ? `Último backup: ${formatDistanceToNow(last, { addSuffix: true, locale: pt })}`
          : "Nunca foi feito um backup";

        toast.warning("Backup recomendado", {
          description: `${msg}. Recomendamos exportar uma cópia de segurança.`,
          duration: 15000,
          action: {
            label: "Fazer agora",
            onClick: () => {
              performAutoBackup();
              toast.success("Backup exportado automaticamente");
            },
          },
        });
        sessionStorage.setItem(REMINDER_DISMISSED_KEY, "1");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
}
