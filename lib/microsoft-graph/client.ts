import { getAccessToken } from "./auth";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export function encodeDrivePath(...segments: string[]): string {
  return segments
    .map((segment) => encodeURIComponent(segment).replace(/%2F/g, "/"))
    .join("/");
}

export async function graphFetch(
  tenantId: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getAccessToken(tenantId);
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
}
