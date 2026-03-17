import { requireUser } from "@/lib/auth";
import { DOWNLOAD_URL } from "@/lib/constants";

export default async function DashboardDownloadsPage() {
  await requireUser();
  return (
    <section className="panel">
      <div className="container">
        <div className="card" style={{ maxWidth: 720 }}>
          <h1>Download do aplicativo</h1>
          <p className="muted">Use o link oficial abaixo para baixar a versão mais recente do VKS BOOST.</p>
          <div style={{ marginTop: 20 }}>
            <a className="primary-button" href={DOWNLOAD_URL} target="_blank" rel="noreferrer">Baixar VKS BOOST</a>
          </div>
        </div>
      </div>
    </section>
  );
}
