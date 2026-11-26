import { requireUser } from "@/lib/auth";
import { DOWNLOAD_URL } from "@/lib/constants";
import { ClientShell } from "@/components/client-shell";

export default async function DashboardDownloadsPage() {
  await requireUser();
  return (
    <ClientShell title="Download" subtitle="Instalador oficial e sempre na versão mais recente.">
      <div className="premium-panel px-download">
        <img src="/brand/gpu.webp" alt="" className="px-download-img" />
        <div>
          <div className="px-download-tag">VKS BOOST · Windows 10/11</div>
          <h2>Baixe e ative em minutos.</h2>
          <p className="muted">Instale, entre com a mesma conta do site e a sua key é reconhecida na hora. O app cria um ponto de restauração antes de qualquer ajuste.</p>
          <a className="primary-button" href={DOWNLOAD_URL} target="_blank" rel="noreferrer">Baixar VKS BOOST</a>
        </div>
      </div>
    </ClientShell>
  );
}
