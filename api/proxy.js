/* ════════════════════════════════════════════════════════════
   CosmeDB API 프록시 (Vercel 서버리스 함수)
   ─────────────────────────────────────────────
   목적: API 키를 브라우저가 아닌 서버 환경변수에 보관 → 사용자는 키 입력 없이 사용.
   동작: 클라이언트가 ?url=<대상 URL>로 호출하면,
     ① 호스트 허용목록 검증(오픈 프록시 방지)
     ② URL 안의 __BK__ 센티널을 호스트별 환경변수 키로 치환
     ③ 네이버는 헤더 키 주입, 나머지는 쿼리/경로 키 치환
     ④ 대상 API를 대신 호출해 본문을 그대로 반환(CORS 허용)

   Vercel 프로젝트 → Settings → Environment Variables 등록:
     NAVER_CLIENT_ID / NAVER_CLIENT_SECRET   (네이버 뉴스·블로그·쇼핑·DataLab)
     PUBLIC_KEY                              (data.go.kr — 기상청·에어코리아·식약처)
     ECOS_KEY                                (한국은행)
     GEMINI_KEY                              (Google AI Studio)
     YOUTUBE_KEY                             (YouTube Data API v3)
     KIPRIS_KEY                              (KIPRIS Plus — 선택)
   미등록 키의 호스트 호출은 502 + 사유를 반환한다(진단 가능).
════════════════════════════════════════════════════════════ */

/* 호스트 → 치환 키 매핑. 값이 null이면 키 불필요(통과만) */
const HOST_RULES = {
  'openapi.naver.com':                  { env: null, naverHeaders: true },
  'apis.data.go.kr':                    { env: 'PUBLIC_KEY' },
  'ecos.bok.or.kr':                     { env: 'ECOS_KEY' },
  'generativelanguage.googleapis.com':  { env: 'GEMINI_KEY' },
  'www.googleapis.com':                 { env: 'YOUTUBE_KEY' },
  'plus.kipris.or.kr':                  { env: 'KIPRIS_KEY' },
  'kipo-api.kipi.or.kr':                { env: 'KIPRIS_KEY' },
  'api.open-meteo.com':                 { env: null },
  'archive-api.open-meteo.com':         { env: null },
};

export default async function handler(req, res) {
  /* CORS — GitHub Pages 등 다른 오리진의 프론트도 이 백엔드를 쓸 수 있게 허용 */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* 헬스체크 — 어떤 키가 서버에 등록돼 있는지(값은 노출하지 않음) */
  if (!req.query.url) {
    return res.status(200).json({
      ok: true,
      service: 'cosmedb-proxy',
      keys: {
        naver:   !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        public:  !!process.env.PUBLIC_KEY,
        ecos:    !!process.env.ECOS_KEY,
        gemini:  !!process.env.GEMINI_KEY,
        youtube: !!process.env.YOUTUBE_KEY,
        kipris:  !!process.env.KIPRIS_KEY,
      },
    });
  }

  let target;
  try { target = new URL(String(req.query.url)); }
  catch { return res.status(400).json({ error: '잘못된 url 파라미터' }); }

  const rule = HOST_RULES[target.hostname];
  if (!rule) return res.status(403).json({ error: `허용되지 않은 호스트: ${target.hostname}` });

  /* 센티널 → 실키 치환 (쿼리·경로 모두 — ECOS는 키가 경로 세그먼트) */
  let urlStr = target.toString();
  if (urlStr.includes('__BK__')) {
    const key = rule.env ? process.env[rule.env] : null;
    if (!key) return res.status(502).json({ error: `서버에 ${rule.env || '해당'} 키가 등록되지 않았습니다 — Vercel 환경변수를 확인하세요` });
    urlStr = urlStr.replace(/__BK__/g, encodeURIComponent(key));
  }

  const headers = {};
  if (rule.naverHeaders) {
    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
      return res.status(502).json({ error: '서버에 NAVER_CLIENT_ID/SECRET이 등록되지 않았습니다' });
    }
    headers['X-Naver-Client-Id'] = process.env.NAVER_CLIENT_ID;
    headers['X-Naver-Client-Secret'] = process.env.NAVER_CLIENT_SECRET;
  }
  if (req.method === 'POST') headers['Content-Type'] = req.headers['content-type'] || 'application/json';

  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 20000);
    const upstream = await fetch(urlStr, {
      method: req.method,
      headers,
      ...(req.method === 'POST' ? { body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body) } : {}),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (e) {
    return res.status(504).json({ error: `대상 API 호출 실패: ${e.name === 'AbortError' ? '타임아웃(20초)' : e.message}` });
  }
}
