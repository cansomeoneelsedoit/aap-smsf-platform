/** Scope substrings that must appear on the Microsoft account for SharePoint uploads. */
export const REQUIRED_GRAPH_SCOPE_MARKERS = ["Files.ReadWrite", "Sites.ReadWrite.All"] as const;

export function hasRequiredGraphScopes(scope: string | null | undefined): boolean {
  if (!scope) {
    return false;
  }

  const normalised = scope.toLowerCase();
  return REQUIRED_GRAPH_SCOPE_MARKERS.every((marker) =>
    normalised.includes(marker.toLowerCase())
  );
}

export function formatGraphScopesForDisplay(scope: string | null | undefined): string {
  if (!scope?.trim()) {
    return "none";
  }

  return scope.split(" ").filter(Boolean).join(", ");
}
