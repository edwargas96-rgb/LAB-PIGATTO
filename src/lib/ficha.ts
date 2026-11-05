import { formatarData, ARCADA_SUPERIOR, ARCADA_INFERIOR } from "@/lib/ordens";

export type OrdemParaFicha = {
  numero: string;
  paciente: string;
  dentista: string | null;
  item: string | null;
  material?: string | null;
  elementos: number[] | null;
  cor: string | null;
  data_entrega: string;
  observacoes: string | null;
  clinics?: { nome: string } | null;
};

function odontogramaHtml(selecionados: number[]): string {
  const dente = (n: number) => {
    const ativo = selecionados.includes(n);
    return `<div class="dente${ativo ? " ativo" : ""}">${n}</div>`;
  };
  return `<div class="odonto">
    <div class="arcada">${ARCADA_SUPERIOR.map(dente).join("")}</div>
    <div class="arcada">${ARCADA_INFERIOR.map(dente).join("")}</div>
  </div>`;
}

function fichaBase(titulo: string, os: OrdemParaFicha, linhas: string[], extra = ""): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo} ${os.numero}</title>
  <style>body{font-family:system-ui,Arial,sans-serif;color:#16232B;padding:32px;max-width:640px;margin:auto}
  h1{font-size:20px;margin:0}.sub{color:#5C6B73;font-size:12px;margin-top:2px}
  .box{border:1px solid #d5dde0;border-radius:10px;padding:16px;margin-top:16px}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eef1f3;font-size:14px}
  .row b{color:#5C6B73;font-weight:500}.tit{color:#0D6E6C;font-weight:700}.foot{margin-top:28px;font-size:12px;color:#5C6B73}
  .odonto{margin-top:12px}.arcada{display:flex;justify-content:center;gap:4px;margin:6px 0}
  .dente{width:26px;height:26px;border:1px solid #d5dde0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#5C6B73}
  .dente.ativo{background:#0D6E6C;border-color:#0D6E6C;color:#fff;font-weight:700}</style>
  </head><body>
  <h1>LAB <span style="color:#0D6E6C">PIGATTO</span></h1><div class="sub">${titulo}</div>
  <div class="box"><div class="row"><b>O.S.</b><span class="tit">${os.numero}</span></div>
  ${linhas.map((l) => `<div class="row">${l}</div>`).join("")}</div>
  ${extra}
  <div class="foot">Emitido em ${new Date().toLocaleString("pt-BR")}</div>
  </body></html>`;
}

export function fichaHtml(os: OrdemParaFicha): string {
  const elementos = os.elementos ?? [];
  return fichaBase(
    "Ficha de Ordem de Serviço",
    os,
    [
      `<b>Paciente</b><span>${os.paciente}</span>`,
      `<b>Clínica</b><span>${os.clinics?.nome ?? "—"}</span>`,
      `<b>Dentista</b><span>${os.dentista ?? "—"}</span>`,
      `<b>Trabalho</b><span>${os.item ?? "—"}</span>`,
      `<b>Material</b><span>${os.material ?? "—"}</span>`,
      `<b>Elementos</b><span>${elementos.join(", ") || "—"}</span>`,
      `<b>Cor</b><span>${os.cor ?? "—"}</span>`,
      `<b>Entrega</b><span>${formatarData(os.data_entrega)}</span>`,
      `<b>Observações</b><span>${os.observacoes ?? "—"}</span>`,
    ],
    elementos.length ? odontogramaHtml(elementos) : "",
  );
}

export function imprimirFicha(os: OrdemParaFicha) {
  const w = window.open("", "_blank", "width=780,height=900");
  if (!w) return;
  w.document.write(fichaHtml(os));
  w.document.close();
  w.focus();
  w.print();
}
