import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

interface RegistoPayload {
  user_id?: string;
  nome: string;
  email: string;
  cargo?: string;
}

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(data: RegistoPayload, dataHora: string): string {
  return `
  <!DOCTYPE html>
  <html lang="pt">
    <head><meta charset="utf-8" /><title>Novo registo de utilizador</title></head>
    <body style="font-family: Arial, sans-serif; background:#f5f6f8; margin:0; padding:24px; color:#1f2937;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td style="background:#1E3A5F;color:#ffffff;padding:20px 24px;">
            <h1 style="margin:0;font-size:20px;">Novo registo de utilizador</h1>
            <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">+ INFO · Data CoLAB</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;font-size:14px;">Foi criada uma nova conta na plataforma.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;width:180px;font-weight:600;">Nome</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;">${escapeHtml(data.nome)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">Email</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;">${escapeHtml(data.email)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">Cargo</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;">${escapeHtml(data.cargo)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">Data e hora</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;">${escapeHtml(dataHora)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;">ID do utilizador</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;font-family:monospace;font-size:12px;">${escapeHtml(data.user_id)}</td>
              </tr>
            </table>
            <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">Esta é uma notificação automática enviada pela plataforma + INFO.</p>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurada");

    const body = (await req.json()) as RegistoPayload;
    if (!body?.email || !body?.nome) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios em falta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tentar enriquecer com user_id a partir do profile (se não vier)
    if (!body.user_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const admin = createClient(supabaseUrl, serviceRoleKey);
        const { data: profile } = await admin
          .from("profiles")
          .select("user_id, cargo")
          .eq("email", body.email)
          .maybeSingle();
        if (profile) {
          body.user_id = profile.user_id;
          if (!body.cargo) body.cargo = profile.cargo ?? undefined;
        }
      } catch (_e) {
        // não bloqueia o envio
      }
    }

    const dataHora = new Date().toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" });
    const html = buildHtml(body, dataHora);

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "+ INFO Data CoLAB <onboarding@resend.dev>",
        to: ["jorge.pinto@datacolab.pt"],
        reply_to: body.email,
        subject: `Novo registo de utilizador — ${body.nome}`,
        html,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Resend error", response.status, result);
      return new Response(JSON.stringify({ success: false, error: result }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("send-registo-notification error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
