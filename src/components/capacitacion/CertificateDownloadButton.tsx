"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type Props = {
  trainingId: string;
  trainingTitle: string;
  className?: string;
  label?: string;
};

export function CertificateDownloadButton({
  trainingId,
  trainingTitle,
  className,
  label = "Descargar certificado PDF",
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setDownloading(true);
    setError("");
    try {
      const res = await fetch(`/api/campus/trainings/${trainingId}/certificate`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo generar el certificado");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${trainingTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo descargar el certificado. Intentá nuevamente.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={downloading}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        }
      >
        <Download className="h-4 w-4" />
        {downloading ? "Generando..." : label}
      </button>
      {error && <p className="mt-2 text-sm text-brand-red">{error}</p>}
    </div>
  );
}
