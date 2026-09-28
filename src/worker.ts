import { DOCS } from "./docs";

interface Env {
  ASSETS: Fetcher;
}

const DISCLAIMER = "Independent concept by Ayo Ahmed; not affiliated with Fyxer.";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "x-disclaimer": DISCLAIMER },
  });

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method !== "GET" && pathname.startsWith("/api/")) return json({ error: "method not allowed" }, 405);

    if (pathname === "/api/health") return json({ ok: true, disclaimer: DISCLAIMER, data: "synthetic", backendAi: false });
    if (pathname === "/api/docs") return json(DOCS.map(({ slug, title }) => ({ slug, title })));

    const m = pathname.match(/^\/api\/docs\/([a-z0-9-]+)$/);
    if (m) {
      const doc = DOCS.find((d) => d.slug === m[1]);
      return doc ? json(doc) : json({ error: "doc not found" }, 404);
    }
    if (pathname.startsWith("/api/")) return json({ error: "not found" }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
