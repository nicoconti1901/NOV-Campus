export function parseMaterialsViewed(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function allMaterialsViewed(materialIds: string[], viewed: string[]): boolean {
  if (materialIds.length === 0) return true;
  return materialIds.every((id) => viewed.includes(id));
}
