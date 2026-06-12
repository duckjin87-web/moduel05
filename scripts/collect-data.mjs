#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════
   GitHub Actions 서버사이드 트렌드 수집기
   ─────────────────────────────────────────────────────────────
   app.js의 수집 함수(collectClimate/Society/Economy/Culture)를
   vm 샌드박스에서 그대로 실행해 data/trends.json을 생성한다.
   서버(러너)에는 CORS 제약이 없으므로 fetchProxy/fetchNaverAPI를
   "직접 호출" 구현으로 교체 — 외부 CORS 프록시를 전혀 쓰지 않는다.
   → 내부망 등에서 프록시 도메인이 차단된 사용자도 same-origin의
     data/trends.json만 읽으면 실데이터를 볼 수 있다.

   필요 환경변수(GitHub Secrets):
     NAVER_CLIENT_ID / NAVER_CLIENT_SECRET — 네이버 뉴스·DataLab·쇼핑인사이트
     ECOS_KEY    — 한국은행 CPI·CCSI
     PUBLIC_KEY  — data.go.kr (기상청·에어코리아)
   미설정 시 해당 신호는 키 없이 수집 가능한 범위(Open-Meteo·RSS)만 채워진다.
════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

/* 최상위 let/const 상태를 샌드박스 컨텍스트 속성으로 노출 (스크립트 전용 변환) */
for (const name of ['SIG_DATA', 'PREDICTIONS', 'MATCH_RESULTS', 'SEL_IDX', 'currentPeriod', 'currentPkgType']) {
  src = src.replace(new RegExp(`^let ${name}\\b`, 'm'), `var ${name}`);
}
src = src.replace(/^const PREDICTIONS_CACHE/m, 'var PREDICTIONS_CACHE');

/* ── DOM·localStorage 스텁 ── */
function makeEl(id) {
  return {
    id, className: '', textContent: '', innerHTML: '', value: '', hidden: false,
    style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, querySelectorAll() { return []; }, appendChild() {},
  };
}
const els = {};
const lsStore = {
  public_key: process.env.PUBLIC_KEY || '',
  naver_id: process.env.NAVER_CLIENT_ID || '',
  naver_sec: process.env.NAVER_CLIENT_SECRET || '',
  ecos_key: process.env.ECOS_KEY || '',
};

async function directFetch(url, opts = {}, timeout = 15000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeout);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(tid); }
}

const sandbox = {
  console, setTimeout, clearTimeout, AbortController, URL, URLSearchParams,
  document: {
    getElementById: id => (els[id] ||= makeEl(id)),
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => makeEl('tmp'),
  },
  localStorage: {
    getItem: k => (k in lsStore ? lsStore[k] : null),
    setItem: (k, v) => { lsStore[k] = String(v); },
    removeItem: k => { delete lsStore[k]; },
  },
  navigator: {},
  /* Open-Meteo 등 app.js 내 직접 fetch — referrer 옵션은 undici가 무시해도 무해 */
  fetch: (url, opts) => directFetch(url, opts, 15000),
};
sandbox.window = sandbox;
sandbox.window.addEventListener = () => {};
sandbox.window.location = { href: 'https://duckjin87-web.github.io/moduel05/' };

vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'app.js' });

/* ── 프록시 체인 → 직접 호출로 교체 (서버사이드는 CORS 무관) ── */
sandbox.fetchProxy = async (url, timeout = 9000) => {
  try {
    const r = await directFetch(url, {}, Math.max(timeout, 10000));
    const t = await r.text();
    return t && t.length >= 6 ? t : null;   /* 5xx body도 통과 — 호출측이 JSON 파싱으로 검증 */
  } catch { return null; }
};
sandbox.fetchNaverAPI = async (targetUrl, nid, nsec, timeout = 11000, opts = {}) => {
  const hdrs = { 'X-Naver-Client-Id': nid, 'X-Naver-Client-Secret': nsec };
  if (opts.body) hdrs['Content-Type'] = opts.contentType || 'application/json';
  try {
    const r = await directFetch(targetUrl, {
      method: opts.method || 'GET',
      headers: hdrs,
      ...(opts.body ? { body: opts.body } : {}),
    }, timeout);
    if (!r.ok) return { _error: r.status, _body: await r.text().catch(() => '') };
    return await r.json();
  } catch { return null; }
};

/* ── 4대 신호 수집 실행 ── */
console.log('수집 시작:', new Date().toISOString());
console.log('키 현황: 네이버', lsStore.naver_id ? 'O' : 'X',
  '/ ECOS', lsStore.ecos_key ? 'O' : 'X', '/ 공공데이터', lsStore.public_key ? 'O' : 'X');

await sandbox.collectClimate();
await sandbox.collectSociety();
await sandbox.collectEconomy();
await sandbox.collectCulture();

/* 수집 상태 점(sdot) 결과 캡처 — 클라이언트에서 그대로 재생 */
const sdots = {};
for (const id of ['sd-climate', 'sd-air', 'sd-ecos', 'sd-datalab', 'sd-news', 'sd-kosis']) {
  sdots[id] = els[id] ? (els[id].className.replace('sdot', '').trim() || 'off') : 'off';
}

const out = {
  collectedAt: new Date().toISOString(),
  sig: sandbox.SIG_DATA,
  sdots,
  dlTrends: sandbox.window._dlTrends || null,
  dlErr: sandbox.window._dlErr ?? null,
  salesTrends: sandbox.window._salesTrends || null,
  salesErr: sandbox.window._salesErr ?? null,
  newsTrends: sandbox.window._newsTrends || null,
  rssText: sandbox.window._rssText || '',
  climateTrend: sandbox.window._climateTrend || null,
};

fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'trends.json'), JSON.stringify(out, null, 2));

const realCount = Object.values(out.sig).filter(v => v && !v._sample).length;
console.log(`수집 완료 — 실데이터 신호 ${realCount}/4`);
Object.entries(out.sig).forEach(([k, v]) => {
  console.log(` · ${k}: ${v ? `${v.score}/5${v._sample ? ' [샘플]' : ' [실데이터]'}` : '미수집'}`);
});
if (out.salesTrends) console.log(` · 구매 모멘텀 ${out.salesTrends.length}건`);
else console.log(` · 구매 모멘텀 없음 (${out.salesErr ?? '-'})`);
if (out.dlTrends) console.log(` · 검색 모멘텀 ${out.dlTrends.length}건`);
else console.log(` · 검색 모멘텀 없음 (${out.dlErr ?? '-'})`);
