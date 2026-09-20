/** Workspace model pinning and quota fallback helpers. */

export interface ModelSelectionSettings {
  preferredModelId?: string;
  fallbackModelIds: readonly string[];
}

export function modelSelectionSettings(value: unknown): ModelSelectionSettings {
  if (!value || typeof value !== "object") return { fallbackModelIds: [] };
  const record = value as Record<string, unknown>;
  const preferredModelId = typeof record.preferredModelId === "string" && /^[A-Za-z0-9._:-]+$/.test(record.preferredModelId)
    ? record.preferredModelId
    : undefined;
  const fallbackModelIds = Array.isArray(record.fallbackModelIds)
    ? [...new Set(record.fallbackModelIds.filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9._:-]+$/.test(id)))]
    : [];
  return { preferredModelId, fallbackModelIds };
}

export function orderedModelIds(
  selectedModelId: string,
  settings: ModelSelectionSettings,
  availableModelIds: readonly string[],
): string[] {
  const available = new Set(availableModelIds);
  const isAuto = selectedModelId === "auto" || selectedModelId === "codex-auto";
  const pinned = settings.preferredModelId && available.has(settings.preferredModelId)
    ? [settings.preferredModelId]
    : [];
  const initial = isAuto ? pinned : [selectedModelId];
  const fallbacks = (isAuto || selectedModelId === settings.preferredModelId)
    ? settings.fallbackModelIds
    : [];
  return [...new Set([...initial, ...fallbacks])].filter((id) => available.has(id));
}

export function isQuotaFallbackStatus(status: number): boolean {
  return status === 403 || status === 429;
}
