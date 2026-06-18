const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export function encodeDrivePath(...segments: string[]): string {
  return segments
    .map((segment) => encodeURIComponent(segment).replace(/%2F/g, "/"))
    .join("/");
}

export async function graphFetch(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
}
