#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════
   data/history.json 백필 — 저장소에 쌓인 trends.json 커밋에서 일자별 지표를 복원한다.
   누적 이력 적재는 수집기(collect-data.mjs)가 매일 이어서 하고, 이 스크립트는
   그 이전 기간을 한 번 채워 넣는 용도다. 같은 날짜가 여러 번 있으면 그날의 마지막
   커밋을 채택한다. 재실행해도 기존 기록을 덮어쓰지 않고 없는 날짜만 채운다.

   사용: node scripts/backfill-history.mjs
════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REL = 'data/trends.json';

/* collect-data.mjs의 레코드 형식과 동일하게 맞춘다 */
function buildRecord(o, dateISO, ts) {
  const sig = o.sig || {};
  const num = v => (typeof v === 'number' && isFinite(v) ? Math.round(v * 100) / 100 : null);
  const rssItems = (o.rssFeedStatus || []).reduce((n, f) => n + (f.items || 0), 0);
  return {
    date: dateISO,
    ts,
    sig: {
      climate: num(sig.climate?.score), society: num(sig.society?.score),
      economy: num(sig.economy?.score), culture: num(sig.culture?.score),
    },
    real: ['climate', 'society', 'economy', 'culture'].filter(k => sig[k] && !sig[k]._sample).length,
    /* 신호별 샘플 여부 — 차트에서 샘플 구간을 점선으로 구분해 실데이터와 섞이지 않게 한다 */
    sample: {
      climate: !!sig.climate?._sample, society: !!sig.society?._sample,
      economy: !!sig.economy?._sample, culture: !!sig.culture?._sample,
    },
    volume: {
      rss: rssItems,
      rssFeeds: (o.rssFeedStatus || []).filter(f => f.ok).length,
      news: (o.newsTrends || []).length,
      layer1: ((o.globalRetail || {}).formulations || []).length,
      reports: ((o.trendReports || {}).items || []).length,
    },
    topKeywords: (o.kwVolume || o.newsTrends || []).slice(0, 5).map(k => ({ n: k.name, c: k.count })),
    surge: (o.kwSurge || []).slice(0, 5).map(k => ({ n: k.name, d: k.delta })),
    export: (o.exportTrends || []).slice(0, 3).map(t => ({ n: t.name, d: t.delta })),
    search: (o.dlTrends || []).slice(0, 3).map(t => ({ n: t.name, d: t.delta })),
  };
}

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const lines = git('log', '--format=%H %cI', '--', REL).trim().split('\n').filter(Boolean);
console.log(`trends.json 커밋 ${lines.length}건 발견`);

/* 날짜별로 마지막(가장 늦은) 커밋만 채택 — git log는 최신순이므로 처음 만난 것이 그날의 마지막 */
const perDay = new Map();
for (const line of lines) {
  const [sha, iso] = line.split(' ');
  const day = iso.slice(0, 10);
  if (!perDay.has(day)) perDay.set(day, { sha, iso });
}
console.log(`일자 ${perDay.size}일치로 정리`);

const histPath = path.join(root, 'data', 'history.json');
let history = [];
try { history = JSON.parse(fs.readFileSync(histPath, 'utf8')); if (!Array.isArray(history)) history = []; } catch {}
const have = new Set(history.map(h => h.date));

let added = 0, skipped = 0, failed = 0;
for (const [day, { sha, iso }] of [...perDay.entries()].sort()) {
  if (have.has(day)) { skipped++; continue; }
  try {
    const json = git('show', `${sha}:${REL}`);
    history.push(buildRecord(JSON.parse(json), day, new Date(iso).getTime()));
    added++;
  } catch { failed++; }
}
history.sort((a, b) => (a.date < b.date ? -1 : 1));
fs.writeFileSync(histPath, JSON.stringify(history));
console.log(`백필 완료 — 추가 ${added}일 · 기존 유지 ${skipped}일 · 실패 ${failed}일 · 총 ${history.length}일치`);
if (history.length) console.log(`기간: ${history[0].date} ~ ${history[history.length - 1].date}`);
