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
  gemini_key: process.env.GEMINI_KEY || '',
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
for (const id of ['sd-climate', 'sd-air', 'sd-ecos', 'sd-datalab', 'sd-news', 'sd-kosis', 'sd-export']) {
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
  exportTrends: sandbox.window._exportTrends || null,
  exportErr: sandbox.window._exportErr ?? null,
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
if (out.exportTrends) console.log(` · 수출 모멘텀 ${out.exportTrends.length}건`);
else console.log(` · 수출 모멘텀 없음 (${out.exportErr ?? '-'})`);

/* ════ TRACK B 사전수집 폴백 ════
   브라우저 CORS 프록시 의존을 줄이기 위해, 대표 제품 카테고리에 대해 findNewManufacturers()를
   러너에서 직접(non-CORS) 실행해 data/trackb-fallback.json을 생성한다.
   클라이언트는 라이브 탐색 결과가 빈약할 때(3건 미만) same-origin으로 이 파일을 읽어 보충한다.
   ※ CORS 프록시 의존을 "제거"하는 것은 아니다 — 브라우저에서의 실시간 탐색은 여전히 프록시를
     경유하며, 이 파일은 그 결과가 빈약할 때를 대비한 주기적 갱신 백업일 뿐이다. */
const TRACKB_CATEGORIES = [
  { type: '에어리스 세럼 SPF50+ (선세럼)', packaging: '에어리스 펌프 30~50ml', tech: '고점도 선세럼 배합 + 에어리스 충진 동시 가능 설비' },
  { type: '고체형 클렌징 바 (비건 인증)', packaging: '고형 성형 + 종이 슬리브 포장', tech: '고형 성형 + 비건 원료 배합 + 종이 패키징' },
  { type: '소용량 앰플 (2ml×7ea 주간 루틴팩)', packaging: '소용량 앰플 2ml × 7ea 파우치', tech: '소용량(≤3ml) 자동 충진 + 파우치 포장 라인' },
  { type: '리필 크림 (파우치+전용 용기)', packaging: '리필 파우치 50ml + 재사용 알루미늄 용기', tech: '리필 파우치 충진 + 재사용 알루미늄 용기 설계' },
  { type: '쿨링 젤 선크림 (스틱+튜브)', packaging: '스틱 몰딩 15g 또는 저점도 튜브 75ml', tech: '스틱 몰딩 or 저점도 튜브 충진 + 쿨링 성분 배합' },
  { type: '프리바이오틱스 스킨케어 라인 (마이크로바이옴)', packaging: '에어리스 포장 30~80ml (산화방지)', tech: '마이크로바이옴 활성 성분 에어리스 패키징 + 저온 충진' },
  { type: '고기능성 UV 패드 (선패드)', packaging: '소용량 틱택 컨테이너 15ml + 패드팩', tech: '패드 자동 투입 + UV 에멀전 충진 동시 라인' },
  { type: '생분해 포장재 스킨케어 (친환경 리뉴얼)', packaging: '퇴비화 가능 바이오 플라스틱 용기 50ml', tech: '바이오 PLA 용기 충진 + 무알코올 보존' },
  { type: '다기능 세럼 스틱 (올인원 고형)', packaging: '스틱 몰딩 12g 회전식 용기', tech: '고형 세럼 스틱 몰딩 + 활성 성분 안정화' },
  { type: '맞춤형 화장품 키트 (처방 배합)', packaging: '소분 앰플 2ml×5 + 베이스 크림 30ml 세트', tech: '소용량 다품종 혼합 충진 + 개인화 라벨링' },
];

const trackBFallback = {};
if (lsStore.naver_id && lsStore.naver_sec) {
  console.log('TRACK B 사전수집 시작 —', TRACKB_CATEGORIES.length, '개 대표 카테고리');
  for (const cat of TRACKB_CATEGORIES) {
    sandbox.currentPkgType = cat.packaging;
    const kw = cat.type.split(' ')[0];
    try {
      const top = await sandbox.findNewManufacturers(cat.type, cat.tech);
      trackBFallback[kw] = (top || []).map(c => ({
        name: c.name, evidence_type: c.evidence_type, production: c.production,
        evidence_detail: c.evidence_detail, region: c.region || '',
        sourceLink: c.sourceLink || '', homepage: c.homepage || '',
        gmpConfirmed: !!c.gmpConfirmed, localVerified: !!c.localVerified,
        confidence: c.confidence ?? 0,
      }));
      console.log(` · ${kw}: ${trackBFallback[kw].length}곳`);
    } catch (e) {
      console.log(` · ${kw}: 수집 실패 (${e.message})`);
    }
    await new Promise(r => setTimeout(r, 1500)); /* 네이버 API 레이트리밋 보호 간격 */
  }
} else {
  console.log('TRACK B 사전수집 스킵 — 네이버 API 키 미설정');
}
fs.writeFileSync(path.join(root, 'data', 'trackb-fallback.json'), JSON.stringify(trackBFallback, null, 2));
console.log(`TRACK B 사전수집 완료 — ${Object.keys(trackBFallback).length}개 카테고리`);
