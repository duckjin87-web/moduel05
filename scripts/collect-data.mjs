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

/* ── 글로벌 선행신호 (서버 전용 — 브라우저는 CORS·비공식 API라 직접 수집 불가) ── */

/* Google Trends 비공식 API — explore 토큰 → 타임라인. 비공식이므로 실패 시 null(정상 동작 유지).
   미국(geo=US) 기준 K뷰티 영문 키워드의 최근 4주 vs 직전 8주 평균 비교 = 수출 선행 검색 모멘텀 */
const GTRENDS_KEYWORDS = [
  { en: 'korean sunscreen', kr: '선크림(글로벌)' },
  { en: 'snail mucin',      kr: '달팽이 점액(글로벌)' },
  { en: 'glass skin',       kr: '유리피부(글로벌)' },
  { en: 'korean toner pad', kr: '토너패드(글로벌)' },
  { en: 'pdrn skincare',    kr: 'PDRN(글로벌)' },
  { en: 'cushion foundation', kr: '쿠션(글로벌)' },
  { en: 'korean lip balm',  kr: '립밤(글로벌)' },
  { en: 'rice toner',       kr: '쌀 토너(글로벌)' },
];
async function collectGoogleTrends() {
  const results = [];
  for (const kw of GTRENDS_KEYWORDS) {
    try {
      const exploreReq = JSON.stringify({ comparisonItem: [{ keyword: kw.en, geo: 'US', time: 'today 3-m' }], category: 44, property: '' });
      const expR = await directFetch(
        `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(exploreReq)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, 15000);
      if (!expR.ok) continue;
      const expTxt = (await expR.text()).replace(/^\)\]\}',?\s*/, '');
      const widget = JSON.parse(expTxt).widgets?.find(w => w.id === 'TIMESERIES');
      if (!widget) continue;
      const mlR = await directFetch(
        `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(widget.request))}&token=${encodeURIComponent(widget.token)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, 15000);
      if (!mlR.ok) continue;
      const mlTxt = (await mlR.text()).replace(/^\)\]\}',?\s*/, '');
      const pts = (JSON.parse(mlTxt).default?.timelineData || []).map(p => p.value?.[0] ?? 0);
      if (pts.length < 8) continue;
      const recent = pts.slice(-4), prior = pts.slice(0, -4);
      const avg = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
      const pAvg = avg(prior);
      const delta = pAvg > 0 ? Math.round((avg(recent) - pAvg) / pAvg * 100) : 0;
      results.push({ name: kw.kr, en: kw.en, delta });
      await new Promise(r => setTimeout(r, 1200));   /* 레이트리밋 회피 */
    } catch { /* 키워드 단위 실패 무시 */ }
  }
  return results.length ? results.sort((a, b) => b.delta - a.delta) : null;
}

/* Reddit 해외 K뷰티 커뮤니티 — 공개 JSON(서버는 UA만 붙이면 접근 가능). 최근 1개월 인기글
   제목·본문에서 영문 키워드 언급 빈도 집계 → 한국어 명칭으로 매핑 */
const REDDIT_SUBS = ['AsianBeauty', 'KoreanBeauty', '30PlusSkinCare'];
const REDDIT_KEYWORDS = [
  { en: /sunscreen|spf/i,        kr: '선크림' },
  { en: /snail\s?mucin/i,        kr: '달팽이 점액' },
  { en: /toner\s?pad/i,          kr: '토너패드' },
  { en: /ampoule|serum/i,        kr: '앰플·세럼' },
  { en: /cushion/i,              kr: '쿠션' },
  { en: /pdrn|exosome/i,         kr: 'PDRN·엑소좀' },
  { en: /retinol|retinal/i,      kr: '레티놀' },
  { en: /cica|centella/i,        kr: '시카' },
  { en: /lip\s?(balm|mask)/i,    kr: '립밤·립마스크' },
  { en: /cleansing|cleanser/i,   kr: '클렌징' },
];
async function collectReddit() {
  const counts = {};
  let ok = false;
  for (const sub of REDDIT_SUBS) {
    try {
      const r = await directFetch(`https://www.reddit.com/r/${sub}/top.json?t=month&limit=100`,
        { headers: { 'User-Agent': 'cosmedb-trend-collector/1.0' } }, 15000);
      if (!r.ok) continue;
      const j = await r.json();
      ok = true;
      (j?.data?.children || []).forEach(c => {
        const text = `${c.data?.title || ''} ${c.data?.selftext || ''}`;
        REDDIT_KEYWORDS.forEach(k => { if (k.en.test(text)) counts[k.kr] = (counts[k.kr] || 0) + 1; });
      });
      await new Promise(r2 => setTimeout(r2, 800));
    } catch { /* 서브레딧 단위 실패 무시 */ }
  }
  if (!ok) return null;
  const list = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return list.length ? list : null;
}

console.log('글로벌 선행신호 수집 (Google Trends·Reddit)...');
const gtrendsTrends = await collectGoogleTrends();
const redditTrends = await collectReddit();
console.log(` · Google Trends: ${gtrendsTrends ? gtrendsTrends.length + '건' : '실패(비공식 API — 다음 회차 재시도)'}`);
console.log(` · Reddit: ${redditTrends ? redditTrends.length + '건' : '실패(차단 가능 — 다음 회차 재시도)'}`);

const out = {
  collectedAt: new Date().toISOString(),
  sig: sandbox.SIG_DATA,
  sdots,
  gtrendsTrends,
  redditTrends,
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
