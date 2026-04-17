import { corsHeaders } from '@supabase/supabase-js/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

interface ProdutoPedido {
  produtoNome: string;
  quantidade: number;
}

interface PedidoPayload {
  numero?: string;
  dataPedido: string;
  nomeRequisitante: string;
  email: string;
  tipoEvento: string;
  nomeEvento: string;
  dataEvento: string;
  dataRecolha: string;
  responsavelLevantamento: string;
  prioridade: string;
  observacoes?: string;
  produtos: ProdutoPedido[];
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const escapeHtml = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildHtml = (p: PedidoPayload) => {
  const submittedAt = new Date().toLocaleString('pt-PT', {
    dateStyle: 'short', timeStyle: 'short',
  });

  const produtosRows = p.produtos
    .map(
      (pr) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(pr.produtoNome)}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right;">${pr.quantidade}</td>
        </tr>`
    )
    .join('');

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 12px;color:#6b7280;font-size:13px;width:200px;">${label}</td>
      <td style="padding:6px 12px;color:#111827;font-size:14px;font-weight:500;">${escapeHtml(value || '—')}</td>
    </tr>`;

  return `
  <!DOCTYPE html>
  <html lang="pt">
    <body style="margin:0;padding:0;background:#f5f7fa;font-family:Inter,Arial,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#1E3A5F;color:#ffffff;padding:20px 24px;">
          <h1 style="margin:0;font-size:18px;font-weight:600;">Novo pedido submetido${p.numero ? ` — ${escapeHtml(p.numero)}` : ''}</h1>
          <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">Data CoLAB · Plataforma de Stock</p>
        </div>

        <div style="padding:20px 24px;">
          <p style="margin:0 0 16px;font-size:14px;color:#374151;">
            Foi submetido um novo pedido em <strong>${escapeHtml(submittedAt)}</strong>.
          </p>

          <h2 style="margin:18px 0 8px;font-size:14px;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.5px;">Requisitante</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${row('Nome', p.nomeRequisitante)}
            ${row('Email', p.email)}
            ${row('Data do pedido', formatDate(p.dataPedido))}
          </table>

          <h2 style="margin:24px 0 8px;font-size:14px;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.5px;">Evento</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${row('Nome do evento', p.nomeEvento)}
            ${row('Tipo de evento', p.tipoEvento)}
            ${row('Data do evento', formatDate(p.dataEvento))}
            ${row('Data de recolha', formatDate(p.dataRecolha))}
            ${row('Responsável levantamento', p.responsavelLevantamento)}
            ${row('Prioridade', p.prioridade)}
          </table>

          <h2 style="margin:24px 0 8px;font-size:14px;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.5px;">Produtos pedidos</h2>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;font-size:14px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;font-size:12px;color:#6b7280;">Produto</th>
                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right;font-size:12px;color:#6b7280;width:100px;">Quantidade</th>
              </tr>
            </thead>
            <tbody>${produtosRows}</tbody>
          </table>

          ${
            p.observacoes
              ? `<h2 style="margin:24px 0 8px;font-size:14px;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.5px;">Observações</h2>
                 <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;font-size:14px;color:#374151;white-space:pre-wrap;">${escapeHtml(p.observacoes)}</div>`
              : ''
          }

          <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;">
            Esta é uma notificação automática enviada pela plataforma +InfoDataCoLAB.
          </p>
        </div>
      </div>
    </body>
  </html>`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');

    const body = (await req.json()) as PedidoPayload;
    if (!body || !body.nomeRequisitante || !body.email || !Array.isArray(body.produtos)) {
      return new Response(JSON.stringify({ error: 'Payload inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = `Novo pedido submetido${body.numero ? ` — ${body.numero}` : ''} (${body.nomeEvento})`;
    const html = buildHtml(body);

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Plataforma Data CoLAB <noreply@datacolab.pt>',
        to: ['jorge.rodrigues@datacolab.pt'],
        cc: ['paula.sampaio@datacolab.pt'],
        reply_to: body.email,
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend error:', response.status, data);
      return new Response(
        JSON.stringify({ error: `Resend [${response.status}]`, details: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, id: data?.id ?? null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-pedido-notification error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
