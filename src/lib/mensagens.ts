// Indicador de "mensagem nova" na lista de ordens — só na tela, sem
// e-mail nem push. "Visto por último" fica salvo no navegador de cada
// pessoa (não sincroniza entre dispositivos, mas evita criar tabela nova
// no banco só para isso).

type EventoComentario = {
  comentario: string | null;
  status: string | null;
  created_at: string;
};

const AUTO_COMENTARIOS_CLINICA = ["Ordem enviada pela clínica.", "Recebida pelo dentista"];

/**
 * Mensagem mais recente vinda "do outro lado": para quem está vendo como
 * clínica, a última mensagem do laboratório; para quem vê como laboratório,
 * a última mensagem da clínica. Mesmo critério usado na tela da ordem.
 */
export function ultimaMensagemDaOutraParte(eventos: EventoComentario[], isLab: boolean) {
  const relevante = eventos.find((ev) => {
    if (!ev.comentario) return false;
    if (isLab) return ev.status === null;
    return ev.status !== null && !AUTO_COMENTARIOS_CLINICA.includes(ev.comentario);
  });
  return relevante ?? null;
}

function chave(userId: string, orderId: string): string {
  return `lab-pigatto:ordem-vista:${userId}:${orderId}`;
}

export function obterUltimaVisita(userId: string, orderId: string): number {
  try {
    const raw = localStorage.getItem(chave(userId, orderId));
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function marcarOrdemVisitada(userId: string, orderId: string): void {
  try {
    localStorage.setItem(chave(userId, orderId), String(Date.now()));
  } catch {
    // localStorage indisponível (aba privada, etc.) — sem problema, o
    // indicador só fica sempre "novo" para essa pessoa.
  }
}
