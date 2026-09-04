"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteTrainingButton({
  trainingId,
  title,
}: {
  trainingId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        `¿Eliminar la capacitación "${title}" con su material y evaluación? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/trainings/${trainingId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("No se pudo eliminar la capacitación");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl border border-brand-red/30 bg-transparent px-3 py-2 text-xs font-semibold text-red-300 hover:bg-brand-red/10 disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {loading ? "..." : "Borrar"}
    </button>
  );
}
