/* ══════════════════════════════════════════════════════════════
   CosmeDB — AI 전략 분석 대시보드
   app.js  (modular 3-file structure: index.html + styles.css + app.js)
   Bloomberg Terminal / Stripe Dashboard style — information-dense, restrained
══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   1. CONSTANTS & CONFIGURATION
────────────────────────────────────────── */
const PERIOD_CFG = {
  '1m': { growthMul: 0.22, confAdd:  5, label: '1개월 예측', confCap: 97 },
  '6m': { growthMul: 1.0,  confAdd:  0, label: '6개월 예측', confCap: 97 },
  '1y': { growthMul: 2.4,  confAdd: -8, label: '1년 예측',   confCap: 97 },
};

const PORTFOLIO_TYPES = new Set(['앰플','세럼','에센스','마스크팩','스킨케어','선케어','클렌징','토너']);

/* ──────────────────────────────────────────
   2. DB_REAL — 48 companies
────────────────────────────────────────── */
const DB_REAL = [
  {id:1,  code:"1000000565", name:"코스맥스네오 주식회사",        status:"CONFIRMED", region:"인천", addr:"인천광역시 부평구 평천로73번길 14",                          certs:["CGMP","ISO22716","ISO9001","ISO14001","ISO45001","비건"],              industry:"제조",              mgr:{"세종":"김동욱"}},
  {id:3,  code:"1000000582", name:"주식회사 이앤씨",              status:"CONFIRMED", region:"경기", addr:"경기도 용인시 처인구 이동읍 덕성산단2로50번길 21",             certs:["ISO22716","ISO9001","ISO14001","비건"],                               industry:"제조업",            mgr:{"세종":"김현주"}},
  {id:4,  code:"1000000587", name:"주식회사 블리스팩",            status:"SHADOW",    region:"경기", addr:"경기도 시흥시 경기과기대로 171",                               certs:["CGMP","ISO22716","ISO9001"],                                         industry:"제조,도소매",       mgr:{"세종":"양서경"}},
  {id:6,  code:"1000000632", name:"(주)필코 코스팜",              status:"SHADOW",    region:"경기", addr:"경기도 평택시 청북읍 현곡산단로 11",                           certs:["CGMP","ISO22716"],                                                  industry:"화장품및의약외품제조", mgr:{"세종":"이재강"}},
  {id:8,  code:"5000000489", name:"콜마유엑스 주식회사 (세종)",   status:"SHADOW",    region:"세종", addr:"세종특별자치시 전의면 산단길 21-164",                          certs:[],                                                                   industry:"제조업",            mgr:{"세종":"양서경"}},
  {id:10, code:"1000000575", name:"에스에이코스메틱",             status:"SHADOW",    region:"인천", addr:"인천 서구 가좌로29번길 22",                                    certs:["ISO22716","ISO9001","ISO14001"],                                     industry:"화장품 외",         mgr:{"세종":"양서경"}},
  {id:11, code:"1000000606", name:"(주)아리아코스메틱",           status:"SHADOW",    region:"경기", addr:"경기도 부천시 원미구 정주로 84",                               certs:["ISO22716","ISO9001","ISO14001"],                                     industry:"화장품",            mgr:{"세종":"김성희"}},
  {id:12, code:"1000000604", name:"주식회사 인코스",              status:"CONFIRMED", region:"경기", addr:"경기도 부천시 조마루로385번길 92",                             certs:["ISO22716","비건"],                                                  industry:"도매업 외",         mgr:{"세종":"이희석"}},
  {id:18, code:"1000000471", name:"(주)엔에프씨",                status:"SHADOW",    region:"인천", addr:"인천 연수구 갯벌로145번길 15-8",                              certs:["CGMP","ISO22716","ISO9001","ISO14001","ISO45001","비건"],             industry:"제조|도소매",       mgr:{"세종":"홍영표"}},
  {id:20, code:"1000003568", name:"콜마유엑스 주식회사",          status:"SHADOW",    region:"인천", addr:"인천광역시 부평구 가재울로 138",                               certs:["CGMP","ISO22716","ISO9001"],                                         industry:"제조업",            mgr:{"세종":"홍영표"}},
  {id:22, code:"1000003598", name:"(주) 코나드",                 status:"CONFIRMED", region:"인천", addr:"인천광역시 남동구 남동서로 92",                                certs:["ISO22716","OTC DRUG","비건"],                                        industry:"제조,도소매",       mgr:{"세종":"홍영표"}},
  {id:23, code:"1000004514", name:"콜마스크 주식회사",            status:"SHADOW",    region:"인천", addr:"인천광역시 남동구 남동대로 405",                               certs:["CGMP","ISO22716","ISO9001","ISO14001","ISO45001","비건","할랄"],     industry:"화장품 제조업",     mgr:{"세종":"이재강"}},
  {id:24, code:"1000004538", name:"주식회사 에치엔지",            status:"SHADOW",    region:"세종", addr:"세종특별자치시 전의면 산단길 21-164",                          certs:["CGMP","ISO22716","ISO9001"],                                         industry:"제조 외",           mgr:{"세종":"양서경"}},
  {id:25, code:"1000006214", name:"이에스코스메틱",               status:"CONFIRMED", region:"인천", addr:"인천광역시 남동구 남동대로409번길 46",                          certs:["CGMP","ISO22716"],                                                  industry:"화장품",            mgr:{"세종":"장덕진"}},
  {id:34, code:"1000000549", name:"주식회사 피씨엠",              status:"SHADOW",    region:"경기", addr:"경기도 안성시 공도읍 기업단지로 92",                           certs:["CGMP","ISO22716"],                                                  industry:"제조업",            mgr:{"세종":"김수정"}},
  {id:38, code:"1000000553", name:"주식회사 지에스켐",            status:"SHADOW",    region:"충청", addr:"충청북도 진천군 덕산면 신척산단5로 89",                         certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"제조업",            mgr:{"세종":"신원철"}},
  {id:41, code:"1000000559", name:"(주)이미인",                  status:"SHADOW",    region:"경기", addr:"경기도 오산시 가장산업서북로 40-37",                           certs:["CGMP","ISO22716","ISO14001","ISO45001","비건"],                      industry:"제조업",            mgr:{"세종":"이희석"}},
  {id:43, code:"1000000562", name:"윤지양행(주)",                 status:"SHADOW",    region:"경기", addr:"경기도 오산시 가장산업서북로 23",                              certs:["CGMP","ISO22716","비건"],                                           industry:"수지제품,가공인쇄", mgr:{"세종":"김성희"}},
  {id:44, code:"1000000563", name:"씨앤텍주식회사",              status:"CONFIRMED", region:"경기", addr:"경기도 화성시 정남면 귀래리 536-3",                            certs:["CGMP","ISO9001","ISO14001","ISO22716","비건"],                       industry:"제조",              mgr:{"세종":"박단비"}},
  {id:46, code:"1000000567", name:"주식회사 승일",               status:"CONFIRMED", region:"충청", addr:"충청북도 음성군 원남 산단1길 50",                              certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"제조",              mgr:{"세종":"신원철"}},
  {id:47, code:"1000000569", name:"(주)제닉",                   status:"SHADOW",    region:"충청", addr:"충청남도 논산시 성동면 산업단지로5길 5",                        certs:["CGMP","ISO22716","ISO9001","ISO14001","비건"],                       industry:"제조업",            mgr:{"세종":"장덕진"}},
  {id:48, code:"1000000570", name:"미젤라 화장품",               status:"CONFIRMED", region:"인천", addr:"인천시 남동구 남동동로 64번길 77",                             certs:["ISO22716","ISO9001","ISO14001"],                                     industry:"화장품",            mgr:{"세종":"박단비"}},
  {id:52, code:"1000000577", name:"(주)뷰티스킨",               status:"CONFIRMED", region:"인천", addr:"인천광역시 서구 염곡로14번길 27",                              certs:["CGMP","ISO22716","ISO9001","ISO14001","비건"],                       industry:"제조업 외",         mgr:{"세종":"홍영표"}},
  {id:53, code:"1000000578", name:"화이트코스팜(주)",            status:"SHADOW",    region:"충청", addr:"충남 천안시 서북구 성거읍 성거길 194",                          certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"제조업",            mgr:{"세종":"박승흠"}},
  {id:58, code:"1000000586", name:"(주)리얼코스",               status:"SHADOW",    region:"경기", addr:"경기도 안성시 미양면 서운로 673-6",                            certs:["ISO22716","비건"],                                                  industry:"제조업",            mgr:{"세종":"이희석"}},
  {id:60, code:"1000000592", name:"주식회사 한국코스모",          status:"SHADOW",    region:"충청", addr:"충청남도 천안시 동남구 풍세면 풍세산단로 172",                  certs:["CGMP","ISO22716","ISO9001"],                                         industry:"제조, 도소매",      mgr:{"세종":"박승흠"}},
  {id:65, code:"1000000597", name:"(주)제일",                   status:"CONFIRMED", region:"충청", addr:"충청북도 음성군 생극면 차생로 659",                            certs:["CGMP","ISO22716","ISO9001","비건"],                                  industry:"제조업",            mgr:{"세종":"신원철"}},
  {id:66, code:"1000000598", name:"주식회사 정코스",             status:"CONFIRMED", region:"충청", addr:"충청북도 청주시 흥덕구 오송읍 오송생명 14로 118",               certs:["CGMP","ISO22716","ISO9001","ISO14001","비건","할랄"],                industry:"화장품/기타",       mgr:{"세종":"박단비"}},
  {id:68, code:"1000000601", name:"(주)아트스킨",               status:"SHADOW",    region:"경기", addr:"경기도 용인시 처인구 이동읍 덕성산단2로50번길 12-3",            certs:["ISO9001","ISO14001","비건"],                                         industry:"화장품 외",         mgr:{"세종":"김성희"}},
  {id:78, code:"1000000613", name:"(주)진코스텍",               status:"CONFIRMED", region:"경기", addr:"경기도 시흥시 군자천로237번길 31",                             certs:["CGMP","ISO22716","ISO9001","ISO14001","비건","할랄"],                industry:"제조외",            mgr:{"세종":"장덕진"}},
  {id:79, code:"1000000614", name:"(주)엠엘에스",               status:"CONFIRMED", region:"인천", addr:"인천광역시 남동구 남동서로114번길 65",                          certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"제조업",            mgr:{"세종":"장덕진"}},
  {id:82, code:"1000000620", name:"(주)한솔바이오텍",            status:"CONFIRMED", region:"경기", addr:"경기도 화성시 마도면 청원산단5길 45",                          certs:["CGMP","ISO22716"],                                                  industry:"제조업 외",         mgr:{"세종":"구도연"}},
  {id:88, code:"1000000626", name:"시스킨코리아 주식회사",        status:"SHADOW",    region:"경기", addr:"경기도 부천시 부일로809번길 60",                               certs:["ISO22716","ISO9001","ISO14001","비건"],                              industry:"화장품 외",         mgr:{"세종":"전성우"}},
  {id:90, code:"1000000629", name:"주식회사 해피엘엔비",          status:"SHADOW",    region:"경기", addr:"경기도 이천시 부발읍 황무로 2065번길 41",                      certs:["ISO22716","ISO9001"],                                               industry:"화장품제조",        mgr:{"세종":"양서경"}},
  {id:105,code:"1000004173", name:"아이큐어(주)완주공장",         status:"CONFIRMED", region:"기타", addr:"전라북도 완주군 봉동읍 완주산단5로 248",                        certs:["CGMP","ISO22716","ISO9001","ISO14001","비건"],                       industry:"제조업",            mgr:{"세종":"박승흠"}},
  {id:117,code:"1000006622", name:"주식회사 아주화장품",          status:"SHADOW",    region:"인천", addr:"인천광역시 남동구 남동서로113번길 220",                         certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"제조업",            mgr:{"세종":"홍영표"}},
  {id:118,code:"1000006623", name:"이노맥스 인터내셔널",          status:"CONFIRMED", region:"경기", addr:"경기도 평택시 서탄면 서탄로 446-38",                           certs:["ISO22716","비건"],                                                  industry:"제조업",            mgr:{"세종":"김동욱"}},
  {id:121,code:"1000007039", name:"주식회사 그루비코스메틱",       status:"SHADOW",    region:"충청", addr:"충청남도 보령시 웅천읍 웅천산단2길 66",                         certs:["ISO22716","ISO9001","ISO14001","비건"],                              industry:"화장품",            mgr:{"세종":"김수정"}},
  {id:123,code:"1000007080", name:"주식회사 순바이오팜",          status:"CONFIRMED", region:"경기", addr:"경기도 화성시 마도면 청원산단4길 57",                          certs:["CGMP","ISO22716","ISO9001"],                                         industry:"제조업",            mgr:{"세종":"이희석"}},
  {id:126,code:"1000007218", name:"(주)제네웰",                  status:"SHADOW",    region:"경기", addr:"경기도 성남시 중원구 사기막골로62번길 37",                      certs:["ISO22716","ISO9001","ISO13485"],                                     industry:"제조업",            mgr:{"세종":"홍영표"}},
  {id:129,code:"1000007259", name:"주식회사비엔코스",             status:"SHADOW",    region:"충청", addr:"충청북도 청주시 청원구 오창읍 양청송대길 153",                  certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"화장품제조",        mgr:{"세종":"홍영표"}},
  {id:140,code:"1000008798", name:"글로코(주)",                  status:"CONFIRMED", region:"경기", addr:"경기도 평택시 청북읍 청원로 362-23",                           certs:["ISO22716","ISO9001","ISO14001","ISO45001"],                          industry:"제조업",            mgr:{"세종":"한아영"}},
  {id:141,code:"1000008807", name:"삼성메디코스(주)",             status:"CONFIRMED", region:"경기", addr:"경기도 화성시 향남읍 제약공단4길 22",                          certs:["CGMP","ISO22716"],                                                  industry:"화장품",            mgr:{"세종":"김현주"}},
  {id:143,code:"1000009091", name:"(주)뷰티화장품",              status:"CONFIRMED", region:"충청", addr:"충청북도 음성군 원남면 원남산단로 274-14",                      certs:["CGMP","ISO22716","ISO9001","ISO14001"],                              industry:"제조업",            mgr:{"세종":"박승흠"}},
  {id:144,code:"1000009146", name:"파머스그레인코리아",            status:"CONFIRMED", region:"충청", addr:"충청남도 공주시 이인면 남공주산단길 190",                        certs:["ISO22716","비건"],                                                  industry:"제조업",            mgr:{"세종":"신원철"}},
  {id:145,code:"1000009147", name:"네오메디컬솝",                status:"SHADOW",    region:"경기", addr:"경기도 안성시 원곡면 지문로 27",                               certs:["CGMP","ISO22716"],                                                  industry:"제조",              mgr:{"세종":"이재강"}},
  {id:147,code:"1000009347", name:"(주)원앤씨",                  status:"CONFIRMED", region:"충청", addr:"충청북도 청주시 흥덕구 옥산면 과학산업4로 205",                 certs:["CGMP","ISO22716","ISO14001"],                                        industry:"제조업",            mgr:{"세종":"김동욱"}},
];

/* ──────────────────────────────────────────
   3. TRENDS — 20 items, normalized schema
────────────────────────────────────────── */
const TRENDS = [
  {
    id:1, rank:1, name:"PDRN 진정 앰플",
    tags:["앰플","진정/재생","PDRN"],
    opportunityScore:87,
    scores:{market:22, growth:27, comp:13, prod:12, reg:13},
    growthRate:230, confidence:92,
    drivers:[
      {type:"시장",  txt:"미국 구글트렌드 +340%, 국내 9개월 후행"},
      {type:"규제",  txt:"식약처 PDRN 원료 가이드라인 정비 중"},
      {type:"검색",  txt:"네이버 검색량 MoM +87% 급증"},
    ],
    sources:["네이버 DataLab","구글트렌드","식약처","뷰티누리"],
    soWhat:"미국 9개월 선행 확산 중 — 지금이 국내 선점 마지막 창",
    action:{
      spec:"저자극 PDRN 진정 앰플 (고농도 0.5%↑)",
      channels:["올리브영","TikTok Shop"],
      matchedOemId:23,
    },
    matchedOemIds:[23,41,47,18,52],
    risk:{level:"med", txt:"식약처 PDRN 원료 가이드라인 정비 중"},
  },
  {
    id:2, rank:2, name:"SPF50+ 선크림",
    tags:["선케어","자외선차단","복합필터"],
    opportunityScore:82,
    scores:{market:21, growth:24, comp:11, prod:14, reg:12},
    growthRate:180, confidence:89,
    drivers:[
      {type:"계절",  txt:"봄 시즌 선제 수요 — 네이버 검색량 ▲54%"},
      {type:"글로벌", txt:"TikTok Shop 미국 K뷰티 선케어 ▲320%"},
    ],
    sources:["네이버 DataLab","TikTok","올리브영","뷰티누리"],
    soWhat:"봄 시즌 피크 + TikTok 글로벌 K뷰티 선케어 동반 급성장",
    action:{
      spec:"SPF50+ PA++++ 복합필터 선크림 (경량 텍스처)",
      channels:["올리브영","무신사뷰티"],
      matchedOemId:1,
    },
    matchedOemIds:[1,44,66,52,78],
    risk:{level:"low", txt:"규제 변동 없음 — 계절 수요 예측 정확"},
  },
  {
    id:3, rank:3, name:"비건 마스크팩",
    tags:["마스크팩","수분/진정","식물성원료"],
    opportunityScore:79,
    scores:{market:20, growth:21, comp:13, prod:13, reg:12},
    growthRate:145, confidence:85,
    drivers:[
      {type:"글로벌", txt:"TikTok 비건뷰티 루틴 급확산"},
      {type:"규제",  txt:"EU 클린뷰티 규제 강화 — 비건 수요 구조적 증가"},
    ],
    sources:["TikTok","EU SCCS","올리브영","뷰티누리"],
    soWhat:"EU 규제 강화로 비건 수요 구조적 증가 — DB 내 14개사 즉시 대응",
    action:{
      spec:"비건 인증 시트 마스크팩 (식물성 히알루론산)",
      channels:["쿠팡","올리브영"],
      matchedOemId:23,
    },
    matchedOemIds:[23,41,47,3,121],
    risk:{level:"low", txt:"규제 강화가 오히려 기회 — 비건 인증 OEM 충분"},
  },
  {
    id:4, rank:4, name:"세라마이드 장벽 크림",
    tags:["스킨케어","장벽강화/보습","세라마이드"],
    opportunityScore:76,
    scores:{market:19, growth:20, comp:11, prod:14, reg:12},
    growthRate:122, confidence:84,
    drivers:[
      {type:"규제",  txt:"레티놀 규제 강화에 따른 대체 성분 수요"},
      {type:"시장",  txt:"아토피·민감성 피부 인구 증가"},
    ],
    sources:["네이버 DataLab","식약처"],
    soWhat:"레티놀 규제 직접 수혜 대체 성분 — 구조적 수요 상승 중",
    action:{
      spec:"세라마이드 5종 복합 장벽 크림 (민감성 전용)",
      channels:["올리브영","약국"],
      matchedOemId:18,
    },
    matchedOemIds:[18,47,60,129,143],
    risk:{level:"low", txt:"검증된 성분 — 규제 리스크 없음"},
  },
  {
    id:5, rank:5, name:"발효 나이아신아마이드 세럼",
    tags:["세럼","미백/모공","나이아신아마이드+발효물"],
    opportunityScore:74,
    scores:{market:18, growth:19, comp:12, prod:13, reg:12},
    growthRate:115, confidence:81,
    drivers:[
      {type:"기술",  txt:"발효 공법 흡수율 3배↑ 차별화"},
      {type:"수출",  txt:"중국 미백 세럼 카테고리 2위 성장"},
    ],
    sources:["네이버 DataLab","Tmall"],
    soWhat:"K뷰티 발효 기술로 흡수율 3배 차별화 — 중국 미백 시장 2위",
    action:{
      spec:"발효 나이아신아마이드 세럼 10% (미백 기능성)",
      channels:["올리브영","Tmall"],
      matchedOemId:47,
    },
    matchedOemIds:[47,18,3,121,60],
    risk:{level:"low", txt:"규제 이슈 없음 — 기능성 표준 절차"},
  },
  {
    id:6, rank:6, name:"올인원 멀티케어 크림",
    tags:["스킨케어","복합/멀티","복합활성"],
    opportunityScore:74,
    scores:{market:18, growth:17, comp:11, prod:15, reg:13},
    growthRate:108, confidence:79,
    drivers:[
      {type:"라이프스타일", txt:"스킨케어 루틴 단순화 — 시간 절약형 수요"},
      {type:"시장",        txt:"남성 화장품 시장 확대 주도"},
    ],
    sources:["네이버 DataLab","화해","뷰티누리"],
    soWhat:"루틴 단순화 트렌드 + 남성 화장품 확대 — 생산 범용성 높음",
    action:{
      spec:"올인원 멀티케어 크림 (토너+에센스+크림 3in1)",
      channels:["쿠팡","네이버쇼핑"],
      matchedOemId:1,
    },
    matchedOemIds:[1,8,44,79,143],
    risk:{level:"low", txt:"규제 리스크 없음"},
  },
  {
    id:7, rank:7, name:"글루타치온 미백 앰플",
    tags:["앰플","미백/항산화","글루타치온"],
    opportunityScore:68,
    scores:{market:17, growth:16, comp:12, prod:12, reg:11},
    growthRate:98, confidence:78,
    drivers:[
      {type:"수출",  txt:"동남아 미백 시장 최강 성장 성분"},
      {type:"규제",  txt:"기능성 심사 기간 9월부터 60일로 단축"},
    ],
    sources:["KITA 수출통계","화해","뷰티누리"],
    soWhat:"동남아·일본 K뷰티 앰플 핵심 성분 — 기능성 심사 9월 단축",
    action:{
      spec:"글루타치온 미백 앰플 (기능성 인증)",
      channels:["올리브영","Lazada"],
      matchedOemId:23,
    },
    matchedOemIds:[23,47,18,41,60],
    risk:{level:"med", txt:"기능성 화장품 심사 필요 (9월 60일 단축 예정)"},
  },
  {
    id:8, rank:8, name:"마이크로바이옴 에센스",
    tags:["에센스","장벽/진정","프로바이오틱스"],
    opportunityScore:67,
    scores:{market:16, growth:15, comp:13, prod:11, reg:12},
    growthRate:92, confidence:76,
    drivers:[
      {type:"글로벌", txt:"미국·유럽 선행 트렌드 2년 앞서"},
      {type:"시장",  txt:"BeautyMatter 2026 TOP5 성분"},
    ],
    sources:["BeautyMatter","구글트렌드"],
    soWhat:"미국·유럽 2년 선행 트렌드 국내 진입 — BeautyMatter 2026 TOP5",
    action:{
      spec:"마이크로바이옴 에센스 (프로+프리바이오틱스 복합)",
      channels:["올리브영","Amazon"],
      matchedOemId:47,
    },
    matchedOemIds:[47,18,121,60,129],
    risk:{level:"low", txt:"EU 클린뷰티 기준 적합"},
  },
  {
    id:9, rank:9, name:"바쿠치올 세럼",
    tags:["세럼","재생/항노화","바쿠치올"],
    opportunityScore:70,
    scores:{market:16, growth:14, comp:14, prod:12, reg:14},
    growthRate:88, confidence:80,
    drivers:[
      {type:"규제",  txt:"레티놀 규제 강화(7월) 직접 수혜"},
      {type:"수출",  txt:"Sephora 미국 바쿠치올 세럼 입점 폭증"},
    ],
    sources:["식약처 규제공고","Sephora"],
    soWhat:"레티놀 규제(7월) 직접 수혜 — Sephora 미국 입점 폭증",
    action:{
      spec:"바쿠치올 1% 세럼 (레티놀 대체 항노화)",
      channels:["올리브영","Sephora"],
      matchedOemId:18,
    },
    matchedOemIds:[18,47,41,3,121],
    risk:{level:"low", txt:"규제 강화가 기회 — 대체 성분 포지셔닝"},
  },
  {
    id:10, rank:10, name:"탄산 클렌징 폼",
    tags:["클렌징","딥클렌징/모공","탄산수"],
    opportunityScore:68,
    scores:{market:16, growth:14, comp:12, prod:14, reg:12},
    growthRate:82, confidence:75,
    drivers:[
      {type:"글로벌", txt:"일본 트렌드 국내 6개월 후행 확산"},
      {type:"생산",  txt:"생산 공정 표준화 — 빠른 OEM 대응"},
    ],
    sources:["네이버 DataLab","화해","뷰티누리"],
    soWhat:"일본 → 국내 6개월 후행 확산 — 표준 공정으로 빠른 대응 가능",
    action:{
      spec:"탄산 클렌징 폼 (모공 딥클렌징, 저자극)",
      channels:["올리브영","쿠팡"],
      matchedOemId:1,
    },
    matchedOemIds:[1,44,79,60,143],
    risk:{level:"low", txt:"규제 이슈 없음 — 생산 표준화 가능"},
  },
  {
    id:11, rank:11, name:"저분자 히알루론산 토너",
    tags:["토너","수분/흡수","저분자HA"],
    opportunityScore:65,
    scores:{market:16, growth:13, comp:10, prod:14, reg:12},
    growthRate:78, confidence:77,
    drivers:[
      {type:"시장",  txt:"기초 수분 시장 꾸준한 성장"},
      {type:"기술",  txt:"저분자 기술로 기존 토너 대비 차별화"},
    ],
    sources:["네이버 DataLab","올리브영","뷰티누리"],
    soWhat:"고수요 안정 카테고리 + 저분자 기술 차별화 용이",
    action:{
      spec:"저분자 히알루론산 토너 3종 (분자량 구분)",
      channels:["올리브영","네이버쇼핑"],
      matchedOemId:1,
    },
    matchedOemIds:[1,3,52,79,143],
    risk:{level:"low", txt:"검증된 성분 — 안정적 카테고리"},
  },
  {
    id:12, rank:12, name:"아토피·민감성 보습제",
    tags:["스킨케어","진정/보습","세라마이드+판테놀"],
    opportunityScore:64,
    scores:{market:15, growth:13, comp:11, prod:13, reg:12},
    growthRate:75, confidence:76,
    drivers:[
      {type:"시장",  txt:"국내 아토피 유병률 증가 — 구조적 수요"},
      {type:"글로벌", txt:"라로슈포제·세타필 대체 K뷰티 기회"},
    ],
    sources:["식약처 통계","화해","뷰티누리"],
    soWhat:"국내 아토피 유병률 증가 + 병원 추천 → 소비자 화장품 이동",
    action:{
      spec:"아토피 전용 무향 보습제 (세라마이드+판테놀)",
      channels:["약국","올리브영"],
      matchedOemId:18,
    },
    matchedOemIds:[18,41,47,60,129],
    risk:{level:"low", txt:"일반 화장품 — 기능성 해당 없음"},
  },
  {
    id:13, rank:13, name:"복합 선케어 (선+스킨)",
    tags:["선케어","자외선+스킨케어","SPF+나이아신아마이드"],
    opportunityScore:63,
    scores:{market:15, growth:13, comp:11, prod:13, reg:11},
    growthRate:71, confidence:74,
    drivers:[
      {type:"시장",  txt:"멀티 기능 제품 선호 증가"},
      {type:"규제",  txt:"기능성 심사 9월 단축 예정"},
    ],
    sources:["네이버 DataLab","올리브영"],
    soWhat:"SPF+미백 복합 프리미엄 포지셔닝 — 멀티 기능 선호 증가",
    action:{
      spec:"SPF50+ 나이아신아마이드 복합 선크림 (미백+자외선)",
      channels:["올리브영","무신사뷰티"],
      matchedOemId:1,
    },
    matchedOemIds:[1,44,66,79,52],
    risk:{level:"low", txt:"기능성 심사 9월 단축 예정 — 타이밍 적기"},
  },
  {
    id:14, rank:14, name:"비타민C 유도체 앰플",
    tags:["앰플","미백/항산화","Ascorbyl Glucoside"],
    opportunityScore:61,
    scores:{market:14, growth:12, comp:11, prod:12, reg:12},
    growthRate:67, confidence:73,
    drivers:[
      {type:"기술",  txt:"순 비타민C 대비 안정성 높아 포뮬레이션 용이"},
      {type:"규제",  txt:"미백 기능성 인증 성분"},
    ],
    sources:["화해","식약처"],
    soWhat:"순 비타민C 대비 안정성 高 — 미백 기능성 포뮬레이션 용이",
    action:{
      spec:"비타민C 유도체 앰플 5% (안정화 Ascorbyl Glucoside)",
      channels:["올리브영","Tmall"],
      matchedOemId:47,
    },
    matchedOemIds:[47,18,60,3,121],
    risk:{level:"low", txt:"기능성 심사 필요 — 표준 절차"},
  },
  {
    id:15, rank:15, name:"리포좀 캡슐 수분 크림",
    tags:["스킨케어","수분/전달","리포좀캡슐화"],
    opportunityScore:61,
    scores:{market:14, growth:11, comp:13, prod:11, reg:12},
    growthRate:64, confidence:71,
    drivers:[
      {type:"기술",  txt:"리포좀 캡슐 기술 — 원료 전달 효율 극대화"},
      {type:"시장",  txt:"프리미엄 스킨케어 세그먼트 성장"},
    ],
    sources:["BeautyMatter","화해"],
    soWhat:"기술 차별화로 프리미엄 포지셔닝 — 원료 전달 효율 극대화",
    action:{
      spec:"리포좀 캡슐 수분 크림 (500~1000nm 캡슐화)",
      channels:["올리브영","백화점 온라인몰"],
      matchedOemId:18,
    },
    matchedOemIds:[18,47,126,121,60],
    risk:{level:"low", txt:"식약처 원료 등재 여부 사전 확인 필요"},
  },
  {
    id:16, rank:16, name:"미스트 선스프레이 SPF50",
    tags:["선케어","자외선차단","미스트+선필터"],
    opportunityScore:60,
    scores:{market:13, growth:11, comp:13, prod:13, reg:10},
    growthRate:60, confidence:70,
    drivers:[
      {type:"시장",  txt:"덧바름 선케어 수요 폭증"},
      {type:"채널",  txt:"온·오프라인 채널 동시 성장"},
    ],
    sources:["올리브영","네이버 DataLab"],
    soWhat:"메이크업 위 덧바름 수요 폭증 — 온·오프라인 동시 성장",
    action:{
      spec:"SPF50 미스트형 선스프레이 (메이크업 위 덧바름)",
      channels:["올리브영","쿠팡"],
      matchedOemId:44,
    },
    matchedOemIds:[44,1,66,79,143],
    risk:{level:"low", txt:"규제 이슈 없음 — 계절 수요 의존"},
  },
  {
    id:17, rank:17, name:"펩타이드 아이크림",
    tags:["아이케어","항노화","펩타이드복합체"],
    opportunityScore:57,
    scores:{market:12, growth:10, comp:12, prod:11, reg:12},
    growthRate:57, confidence:68,
    drivers:[
      {type:"시장",  txt:"안티에이징 소비자 연령대 2030으로 확산"},
      {type:"시장",  txt:"눈가 주름 개선 프리미엄 포지셔닝"},
    ],
    sources:["네이버 DataLab","화해"],
    soWhat:"안티에이징 2030세대 진입 + 눈가 주름 프리미엄 세그먼트",
    action:{
      spec:"펩타이드 10종 복합 아이크림 (눈가 주름 집중 케어)",
      channels:["올리브영","백화점"],
      matchedOemId:18,
    },
    matchedOemIds:[18,47,60,129,121],
    risk:{level:"low", txt:"포뮬레이션에 따라 기능성 결정"},
  },
  {
    id:18, rank:18, name:"두피 케어 세럼",
    tags:["헤어케어","두피진정/탈모예방","바이오틴+판테놀"],
    opportunityScore:52,
    scores:{market:12, growth:10, comp:11, prod:10, reg:9},
    growthRate:54, confidence:66,
    drivers:[
      {type:"시장",  txt:"탈모 케어 시장 연간 +18% 성장"},
      {type:"시장",  txt:"두피 화장품 피부과학 영역 확장"},
    ],
    sources:["네이버 DataLab","식약처","뷰티누리"],
    soWhat:"탈모 케어 시장 연간 +18% 구조적 성장 — 피부과학 영역 확장",
    action:{
      spec:"두피 케어 세럼 (바이오틴 1%+ 판테놀 복합)",
      channels:["올리브영","약국"],
      matchedOemId:47,
    },
    matchedOemIds:[47,60,129,121,18],
    risk:{level:"med", txt:"탈모 완화 기능성 표기 시 심사 필요"},
  },
  {
    id:19, rank:19, name:"핵산(DNA) 재생 에센스",
    tags:["에센스","재생/항노화","DNA/RNA유도체"],
    opportunityScore:52,
    scores:{market:11, growth:10, comp:12, prod:9, reg:10},
    growthRate:51, confidence:64,
    drivers:[
      {type:"기술",  txt:"의료 미용 기술의 화장품 전이"},
      {type:"시장",  txt:"고가 프리미엄 세그먼트 진입 가능"},
    ],
    sources:["Cosmetics Design","화해"],
    soWhat:"의료미용 기술의 화장품 전이 — PDRN과 유사 확산 경로 예상",
    action:{
      spec:"핵산 재생 에센스 (DNA 유도체 복합)",
      channels:["올리브영","피부과 채널"],
      matchedOemId:18,
    },
    matchedOemIds:[18,47,23,41,60],
    risk:{level:"med", txt:"원료 안전성 검토 자료 필요 가능성"},
  },
  {
    id:20, rank:20, name:"클린뷰티 미니멀 스킨케어",
    tags:["스킨케어","기초/미니멀","5성분이하포뮬러"],
    opportunityScore:58,
    scores:{market:12, growth:9, comp:10, prod:13, reg:14},
    growthRate:47, confidence:72,
    drivers:[
      {type:"규제",  txt:"EU 클린뷰티 규제 선제 대응"},
      {type:"비용",  txt:"생산 단가 낮음 — OEM 마진 개선"},
    ],
    sources:["EU SCCS","화해","뷰티누리"],
    soWhat:"EU 클린뷰티 규제 선제 대응 — 5성분 포뮬러로 생산단가 절감",
    action:{
      spec:"클린뷰티 미니멀 크림 (5성분 이하 EWG green)",
      channels:["올리브영","이마트몰"],
      matchedOemId:41,
    },
    matchedOemIds:[41,18,44,47,3],
    risk:{level:"low", txt:"EU·FDA 모두 적합 — 규제 리스크 없음"},
  },
];

/* ──────────────────────────────────────────
   4. APPLICATION STATE
────────────────────────────────────────── */
let state = {
  period: '6m',
  trendShown: 10,
  oemShown: 10,
  expandedTrend: null,
  expandedOem: null,
  highlightedOemId: null,
};

/* ──────────────────────────────────────────
   5. OEM SCORING ENGINE
────────────────────────────────────────── */
function scoreOEM(c) {
  const certs = c.certs || [];
  const ind = (c.industry || '').toLowerCase();
  const isCosm = ind.includes('화장품') || ind.includes('제조');

  let prod = 0, tech = 0, growth = 0, expo = 0, attr = 0;

  if (certs.includes('CGMP'))                        prod += 10;
  if (certs.some(x => x.includes('ISO22716')))       prod += 8;
  if (isCosm)                                        prod += 2;
  prod = Math.min(prod, 20);

  if (certs.includes('ISO9001'))  tech += 5;
  if (certs.includes('ISO14001')) tech += 4;
  if (certs.includes('ISO45001')) tech += 3;
  if (certs.includes('ISO13485')) tech += 5;
  if (certs.length >= 5) tech += 3;
  if (certs.length >= 7) tech += 2;
  tech = Math.min(tech, 20);

  if (c.status === 'SHADOW') growth += 8;
  if (certs.length >= 3) growth += 5;
  if (['세종','충청'].includes(c.region)) growth += 3;
  else if (['인천','경기'].includes(c.region)) growth += 2;
  growth += Math.min(Math.floor(certs.length * 0.6), 4);
  growth = Math.min(Math.round(growth), 20);

  if (certs.includes('할랄'))     expo += 12;
  if (certs.includes('비건'))     expo += 8;
  if (certs.includes('OTC DRUG')) expo += 5;
  expo = Math.min(expo, 20);

  if (c.status === 'SHADOW') attr += 10;
  if (prod >= 16) attr += 6;
  else if (prod >= 8) attr += 3;
  if (isCosm) attr += 4;
  attr = Math.min(attr, 20);

  const total = prod + tech + growth + expo + attr;
  return { ...c, s: { prod, tech, growth, expo, attr }, total };
}

let _cachedOem = null;

function getOemScores() {
  if (!_cachedOem) {
    const filtered = DB_REAL.filter(c => {
      if (c.status !== 'SHADOW') return false; // Hidden OEM = 미거래 업체만
      const certs = c.certs || [];
      const ind = (c.industry || '').toLowerCase();
      const hasCert = certs.some(x =>
        ['CGMP','비건','할랄','OTC DRUG'].includes(x) || x.includes('ISO22716')
      );
      const isMfg = ind.includes('화장품') || ind.includes('제조');
      return (hasCert || isMfg)
        && !ind.includes('용기')
        && !(ind.includes('플라스틱') && !hasCert);
    });
    _cachedOem = filtered.map(scoreOEM).sort((a, b) => b.total - a.total);
  }
  return _cachedOem;
}

/* ──────────────────────────────────────────
   6. SCORE BREAKDOWN — transparent scoring
────────────────────────────────────────── */
function buildScoreBreakdown(c, s) {
  const rows = [];
  const certs = c.certs || [];

  if (certs.includes('CGMP'))
    rows.push({ item: 'CGMP 인증', pts: '+10', note: '국내 GMP 최고 등급' });
  if (certs.some(x => x.includes('ISO22716')))
    rows.push({ item: 'ISO22716', pts: '+8', note: '국제 화장품 GMP' });

  const isCosm = (c.industry || '').toLowerCase().includes('화장품')
               || (c.industry || '').toLowerCase().includes('제조');
  if (isCosm)
    rows.push({ item: '화장품 제조 특화 업체', pts: '+2', note: '전문 생산 경험' });

  if (certs.includes('ISO9001'))  rows.push({ item: 'ISO9001',  pts: '+5', note: '품질경영시스템' });
  if (certs.includes('ISO14001')) rows.push({ item: 'ISO14001', pts: '+4', note: '환경경영시스템' });
  if (certs.includes('ISO45001')) rows.push({ item: 'ISO45001', pts: '+3', note: '안전보건경영' });
  if (certs.includes('ISO13485')) rows.push({ item: 'ISO13485', pts: '+5', note: '의료기기 품질 — 프리미엄' });
  if (certs.includes('할랄'))     rows.push({ item: '할랄 인증', pts: '+12', note: '중동·동남아 즉시 수출' });
  if (certs.includes('비건'))     rows.push({ item: '비건 인증', pts: '+8',  note: '글로벌 클린뷰티 대응' });
  if (certs.includes('OTC DRUG')) rows.push({ item: 'OTC DRUG',  pts: '+5',  note: '의약외품 생산 역량' });
  if (c.status === 'SHADOW')
    rows.push({ item: '미거래 상태 (선점 가점)', pts: '+8~18', note: '거래 확보 시 독점 가능성' });

  const total = s ? (s.total || (s.prod + s.tech + s.growth + s.expo + s.attr)) : (c.total || 0);
  rows.push({ item: '합계', pts: String(total), note: '만점 100점' });
  return rows;
}

/* ──────────────────────────────────────────
   7. HIDDEN REASON — dynamic per company
────────────────────────────────────────── */
function buildHiddenReason(c) {
  const certs = c.certs || [];
  const isNew    = c.status === 'SHADOW';
  const hasCGMP  = certs.includes('CGMP');
  const hasHalal = certs.includes('할랄');
  const hasVegan = certs.includes('비건');
  const has22716 = certs.some(x => x.includes('ISO22716'));
  const certCount = certs.length;

  if (isNew) {
    if (hasCGMP && hasHalal && hasVegan)
      return 'GMP·할랄·비건 3중 인증 보유 미거래 — 글로벌 클린뷰티 즉시 대응, 선점 접촉 필요';
    if (hasCGMP && hasVegan)
      return 'GMP·비건 인증 보유 미거래 OEM — EU 클린뷰티 수요 대응, 독점 거래선 선점 기회';
    if (hasCGMP && has22716)
      return 'CGMP·ISO22716 이중 인증 미거래 — 고품질 OEM 역량 확인, 접촉 시 경쟁사 선점 리스크';
    if (hasCGMP)
      return 'GMP 기반 생산 역량 보유 미거래 업체 — 독점 거래선 선점 기회';
    if (certCount >= 3)
      return `인증 ${certCount}개 보유 미발굴 OEM — 품질·환경 관리 체계 확인, 신규 거래선 후보`;
    return '내부 DB 등록 미거래 업체 — 신규 발굴 대상, 기본 인증 역량 확인 필요';
  } else {
    if (hasCGMP && (hasHalal || hasVegan))
      return '기 거래 중 — GMP+클린뷰티 인증 미활용 구간 존재, 신제품 라인 확장 제안 가능';
    if (certCount >= 4)
      return `기 거래 중 — 인증 ${certCount}개 고보유 업체, 추가 생산 품목 확장 협의 여지`;
    return '기 거래 중 — 현재 적용 품목 대비 추가 역량 확장 가능성 존재';
  }
}

/* ──────────────────────────────────────────
   8. OEM SUPPORT FUNCTIONS
────────────────────────────────────────── */
function buildOemCats(c) {
  const certs = c.certs || [];
  const ind = (c.industry || '').toLowerCase();
  const cats = [];
  if (ind.includes('화장품') || certs.some(x => x.includes('ISO22716'))) cats.push('스킨케어');
  if (certs.some(x => x.includes('ISO22716'))) cats.push('마스크팩');
  if (certs.includes('CGMP'))                  cats.push('앰플/세럼');
  if (certs.includes('할랄'))                  cats.push('할랄 화장품');
  if (certs.includes('비건'))                  cats.push('비건 화장품');
  return [...new Set(cats)].slice(0, 4);
}

function getGrowthStage(t) {
  if (t >= 85) return { now: '중소 OEM', pred: '중견 OEM 진입', period: '1~2년' };
  if (t >= 70) return { now: '중소 OEM', pred: '중견 준비',      period: '2년' };
  if (t >= 55) return { now: '소규모 OEM', pred: '중소 OEM',     period: '2~3년' };
  return              { now: '소규모 OEM', pred: '안정 성장',     period: '3년' };
}

/* ──────────────────────────────────────────
   9. TOP-REC OEM CALCULATION
────────────────────────────────────────── */
function getTopRecOems() {
  const cnt = {};
  TRENDS.forEach(t => (t.matchedOemIds || []).forEach(id => {
    cnt[id] = (cnt[id] || 0) + 1;
  }));
  const oemScored = getOemScores();
  return Object.entries(cnt)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => {
      const o = oemScored.find(x => x.id == id);
      return o ? { ...o, recCount: count } : null;
    })
    .filter(Boolean);
}

/* ──────────────────────────────────────────
   10. UTILITY / HELPER FUNCTIONS
────────────────────────────────────────── */
function oppScoreClass(s) {
  return s >= 75 ? 'score-hi' : s >= 58 ? 'score-mid' : 'score-lo';
}

function barColor(v, m) {
  const r = v / m;
  return r >= 0.75 ? 'var(--green)' : r >= 0.5 ? 'var(--amber)' : 'var(--red)';
}

function certClass(cert) {
  if (cert.includes('CGMP')) return 'cert-cgmp';
  if (cert.includes('ISO'))  return 'cert-iso';
  if (cert === '비건')        return 'cert-vegan';
  if (cert === '할랄')        return 'cert-halal';
  if (cert.includes('OTC'))  return 'cert-otc';
  return 'cert-iso';
}

function rbClass(r) {
  if (r === 1) return 'rank-1';
  if (r === 2) return 'rank-2';
  if (r === 3) return 'rank-3';
  if (r <= 10) return 'rank-top';
  return 'rank-rest';
}

function donutSVG(v, m, col) {
  const radius = 14;
  const circ   = 2 * Math.PI * radius;
  const pct    = Math.min(v / m, 1);
  return `<svg class="s5-svg" viewBox="0 0 34 34"><circle class="s5-bg" cx="17" cy="17" r="${radius}"/><circle class="s5-fg" cx="17" cy="17" r="${radius}" stroke="${col}" stroke-dasharray="${(pct*circ).toFixed(1)} ${circ.toFixed(1)}"/></svg>`;
}

function confBarHTML(conf) {
  const col = conf >= 85 ? 'var(--green)' : conf >= 70 ? 'var(--amber)' : 'var(--red)';
  return `<span class="conf-bar-bg"><span class="conf-bar-fill" style="width:${conf}%;background:${col}"></span></span>`;
}

function driverTypeColor(type) {
  const map = {
    '규제':'var(--red)', '시장':'var(--blue)', '글로벌':'var(--blue)',
    '기술':'var(--green)', '수출':'var(--amber)', '계절':'var(--amber)',
    '검색':'var(--blue)', '라이프스타일':'var(--green)', '생산':'var(--txt-2)',
    '채널':'var(--blue)', '비용':'var(--green)',
  };
  return map[type] || 'var(--txt-3)';
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ──────────────────────────────────────────
   11. PERIOD-ADJUSTED METRIC COMPUTATION
────────────────────────────────────────── */
function computedMetrics(t) {
  const cfg = PERIOD_CFG[state.period];
  return {
    growthRate:  Math.round(t.growthRate * cfg.growthMul),
    confidence:  Math.min(cfg.confCap, Math.max(45, t.confidence + cfg.confAdd)),
  };
}

/* ──────────────────────────────────────────
   12. RENDER: BRIEF SECTION
────────────────────────────────────────── */
function renderBrief() {
  const cfg = PERIOD_CFG[state.period];
  const g   = Math.round(TRENDS[0].growthRate * cfg.growthMul);

  const envChips = [
    `<span class="env-chip">환율 1,380원/USD</span>`,
    `<span class="env-chip">유가 —</span>`,
    `<span class="env-chip">날씨 봄</span>`,
    `<span class="env-chip env-chip-warn">국제정세 미중무역</span>`,
  ].join('');

  const briefs = {
    '1m': `<strong>단기(1개월):</strong> 봄 시즌 선케어 수요 정점. PDRN 성분 <strong>선점 진입 마지막 구간</strong>. 레티놀 규제 시행(7월) 전 대체 성분 기획 즉시 착수 필요.`,
    '6m': `<strong>중기(6개월):</strong> PDRN 진정 앰플이 미국 9개월 선행을 추격하며 최대 성장 카테고리로 부상. <strong>최다 추천 OEM 2개사</strong>가 할랄·비건 이중 인증으로 즉시 글로벌 대응 가능.`,
    '1y': `<strong>장기(1년):</strong> 클린뷰티·마이크로바이옴·의료화장품 3대 메가트렌드가 K뷰티를 재편. EU 미세플라스틱 금지(2027)로 <strong>인증 체계 갖춘 OEM이 구조적 우위</strong> 확보.`,
  };

  const pills = [
    `<span class="bpill bpill-hot">PDRN 앰플 +${g}%</span>`,
    `<span class="bpill bpill-green">Hidden OEM #1 · 95점</span>`,
    `<span class="bpill bpill-warn">레티놀 규제 2026.07</span>`,
    `<span class="bpill bpill-blue">${cfg.label}</span>`,
  ].join('');

  const srcChips = ['뷰티누리','네이버DataLab','화해','TikTok','식약처']
    .map(s => `<span class="src-chip-brief">${esc(s)}</span>`).join('');

  const el = document.getElementById('briefSection');
  if (!el) return;
  el.innerHTML = `<div class="brief-wrap">
    <div class="brief-inner">
      <div class="brief-label">
        <span class="brief-dot"></span>
        AI 전략 브리핑
        <span class="brief-env">${envChips}</span>
      </div>
      <div class="brief-text">${briefs[state.period]}</div>
      <div class="brief-pills">${pills}</div>
      <div class="brief-src-row">${srcChips}</div>
    </div>
  </div>`;
}

/* ──────────────────────────────────────────
   13. RENDER: TOP-REC BANNER
   Label: "추천 빈도 기반 — 전체 트렌드에서 가장 많이 추천된 OEM"
   Shows: rank badge + name + "추천빈도 N회" badge (blue) + trade status
   NOT showing score (to avoid confusion with OEM section's "종합점수 기준")
────────────────────────────────────────── */
function renderTopRec() {
  const tops = getTopRecOems().slice(0, 4);
  const rankLabels = ['1순위','2순위','3순위','4순위'];

  const cardsHtml = tops.map((o, i) => {
    const keyCerts = (o.certs || [])
      .filter(c => ['CGMP','비건','할랄'].includes(c) || c.includes('ISO22716'))
      .slice(0, 3);
    const certsHtml = keyCerts.map(c =>
      `<span class="cert-badge ${certClass(c)}">${esc(c)}</span>`
    ).join('');
    const tradeCls = o.status === 'SHADOW' ? 'shadow' : 'confirmed';
    const tradeLbl = o.status === 'SHADOW' ? '미거래' : '거래중';

    return `<div class="top-rec-card" onclick="highlightOem(${o.id})">
      <div class="trc-badge">${rankLabels[i]} 추천빈도 기반</div>
      <div class="trc-name">${esc(o.name)}</div>
      <div class="trc-row">
        <span class="freq-badge">추천빈도 ${o.recCount}회</span>
        <span class="trade-badge ${tradeCls}">${tradeLbl}</span>
      </div>
      <div class="trc-certs">${certsHtml}</div>
    </div>`;
  }).join('');

  const el = document.getElementById('topRecBanner');
  if (!el) return;
  if (!tops.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="top-rec-section">
    <div class="top-rec-hdr">
      <span class="top-rec-title">트렌드 전반 최다 추천 OEM</span>
      <span class="top-rec-basis">추천 빈도 기반 · 종합점수와 별도 기준</span>
    </div>
    <div class="top-rec-grid">${cardsHtml}</div>
  </div>`;
}

/* ──────────────────────────────────────────
   14. RENDER: TREND CARDS
────────────────────────────────────────── */
function renderTrends() {
  const cfg        = PERIOD_CFG[state.period];
  const oemScored  = getOemScores();
  const items      = TRENDS.slice(0, state.trendShown);

  const metaEl = document.getElementById('trendMeta');
  if (metaEl) metaEl.textContent = cfg.label + ' · TOP ' + TRENDS.length;

  const html = items.map(t => {
    const rank = t.rank;
    const { growthRate: g, confidence: conf } = computedMetrics(t);
    const opp    = t.opportunityScore;
    const oppCls = oppScoreClass(opp);
    const noType = !PORTFOLIO_TYPES.has(t.tags[0]);

    // Primary matched OEM (1 per card)
    const primaryOem  = oemScored.find(x => x.id === t.action.matchedOemId);
    const extraCount  = t.matchedOemIds.length - 1;

    // Action line: [spec] + [channels] + [matched OEM]
    let actionLine;
    if (primaryOem) {
      const channelsTxt = t.action.channels.join(' + ');
      actionLine = `<strong>${esc(t.action.spec)}</strong> · ${esc(channelsTxt)} · 추천 OEM: <span class="action-oem-link" onclick="highlightOem(${primaryOem.id})">${esc(primaryOem.name)}(${primaryOem.total})</span>${extraCount > 0 ? ` <span class="action-more" onclick="toggleTrend(${t.id})">외 ${extraCount}개</span>` : ''}`;
    } else {
      actionLine = `<strong>${esc(t.action.spec)}</strong> · ${esc(t.action.channels.join(' + '))}`;
    }

    // Source chips row
    const srcChips = (t.sources || []).map(s =>
      s === '뷰티누리'
        ? `<span class="src-chip-bn">뷰티누리</span>`
        : `<span class="src-chip">${esc(s)}</span>`
    ).join('');

    // Detail: environment drivers
    const driversHtml = t.drivers.map(d =>
      `<div class="driver-item"><span class="driver-type" style="color:${driverTypeColor(d.type)}">${esc(d.type)}</span><span class="driver-txt">${esc(d.txt)}</span></div>`
    ).join('');

    // Detail: 5-score grid
    const scoreItems = [
      { name:'시장성',  v:t.scores.market, m:25 },
      { name:'성장성',  v:t.scores.growth, m:30 },
      { name:'경쟁강도', v:t.scores.comp,  m:15 },
      { name:'생산용이', v:t.scores.prod,  m:15 },
      { name:'규제안전', v:t.scores.reg,   m:15 },
    ];
    const s5Html = scoreItems.map(si => {
      const col = barColor(si.v, si.m);
      return `<div class="score-cell"><div class="sc-name">${si.name}</div><div class="sc-val" style="color:${col}">${si.v}</div><div class="sc-max">/${si.m}</div></div>`;
    }).join('');

    // Detail: risk
    const riskCls   = t.risk.level==='low' ? 'risk-low' : t.risk.level==='high' ? 'risk-high' : 'risk-med';
    const riskLabel = t.risk.level==='low' ? '낮음' : t.risk.level==='high' ? '높음' : '보통';

    // Detail: all matched OEMs (N companies)
    const matchedOemsHtml = t.matchedOemIds.map((oid, mi) => {
      const mo = oemScored.find(x => x.id === oid);
      if (!mo) return '';
      const moCls    = mo.status === 'SHADOW' ? 'shadow' : 'confirmed';
      const moLbl    = mo.status === 'SHADOW' ? '미거래' : '거래중';
      const isPrimary = oid === t.action.matchedOemId;
      return `<div class="matched-oem-row${isPrimary?' matched-primary':''}" onclick="highlightOem(${mo.id})">
        <span class="matched-oem-num">${mi+1}</span>
        <span class="matched-oem-name">${esc(mo.name)}</span>
        <span class="matched-oem-score">${mo.total}점</span>
        <span class="trade-badge ${moCls}">${moLbl}</span>
        ${isPrimary ? '<span class="primary-badge">추천</span>' : ''}
      </div>`;
    }).join('');

    const isExpanded = state.expandedTrend === t.id;

    return `<div class="trend-card" id="tc-${t.id}">
      <div class="tc-summary">
        <div class="tc-rank ${rbClass(rank)}">${rank}</div>
        <div class="tc-main">
          <div class="tc-name-row">
            <span class="tc-name">${esc(t.name)}</span>
            ${noType ? `<span class="badge-no-type">미보유 유형</span>` : ''}
          </div>
          <div class="tc-tags">
            <span class="tag tag-cat">${esc(t.tags[0])}</span>
            <span class="tag tag-func">${esc(t.tags[1])}</span>
            <span class="tag tag-ingr">${esc(t.tags[2])}</span>
          </div>
        </div>
        <div class="tc-score-block">
          <div class="opp-score-num ${oppCls}">${opp}</div>
          <div class="opp-score-label">/100 기회점수</div>
        </div>
      </div>
      <div class="tc-sub-metrics">
        <span class="sub-label">성장률</span>
        <span class="sub-value up">+${g}%</span>
        <span class="sub-sep">·</span>
        <span class="sub-label">신뢰도</span>
        ${confBarHTML(conf)}
        <span class="sub-value">${conf}%</span>
      </div>
      <div class="tc-action">
        <span class="action-icon">▶</span>
        <span class="action-text">${actionLine}</span>
      </div>
      ${t.sources.length ? `<div class="tc-src-bar"><span class="src-lbl">출처</span>${srcChips}</div>` : ''}
      <button class="tc-expand-btn" onclick="toggleTrend(${t.id})">
        <span>점수 상세 · 이 트렌드 대응 가능 업체 ${t.matchedOemIds.length}개</span>
        <span class="expand-arrow ${isExpanded?'open':''}">▾</span>
      </button>
      <div class="tc-detail ${isExpanded?'open':''}" id="td-${t.id}">
        <div class="detail-block">
          <div class="detail-lbl">환경 드라이버</div>
          <div class="drivers-list">${driversHtml}</div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">점수 구성 (합계 ${opp}/100)</div>
          <div class="score-grid">${s5Html}</div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">핵심 인사이트</div>
          <div class="so-what-box">${esc(t.soWhat)}</div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">리스크 평가 <span class="risk-level-tag risk-${t.risk.level}">${riskLabel}</span></div>
          <div class="risk-box ${riskCls}">${esc(t.risk.txt)}</div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">대응 가능 OEM ${t.matchedOemIds.length}개사</div>
          <div class="matched-oems-list">${matchedOemsHtml}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  const listEl = document.getElementById('trendList');
  if (listEl) listEl.innerHTML = html;

  const wrapEl = document.getElementById('trendMoreWrap');
  if (wrapEl) {
    if (state.trendShown >= TRENDS.length) {
      wrapEl.style.display = 'none';
    } else {
      wrapEl.style.display = '';
      const btn = wrapEl.querySelector('.more-btn');
      if (btn) {
        btn.disabled = false;
        const next = Math.min(10, TRENDS.length - state.trendShown);
        btn.textContent = `+ ${next}개 더 보기 (${state.trendShown+1}~${state.trendShown+next}위)`;
      }
    }
  }
}

/* ──────────────────────────────────────────
   15. RENDER: OEM CARDS
────────────────────────────────────────── */
function renderOEMs() {
  const scored = getOemScores();
  const items  = scored.slice(0, state.oemShown);

  const metaEl = document.getElementById('oemMeta');
  if (metaEl) metaEl.textContent = `DB 중 상위 ${Math.min(state.oemShown, scored.length)}/${scored.length}개`;

  const html = items.map((c, idx) => {
    const rank     = idx + 1;
    const oppCls   = oppScoreClass(c.total);
    const tradeCls = c.status === 'SHADOW' ? 'shadow' : 'confirmed';
    const tradeLbl = c.status === 'SHADOW' ? '미거래' : '거래중';

    const certHtml = (c.certs || []).slice(0, 6).map(cert =>
      `<span class="cert-badge ${certClass(cert)}">${esc(cert)}</span>`
    ).join('') || `<span class="cert-badge cert-iso">인증없음</span>`;

    const hiddenReason = buildHiddenReason(c);
    const stage        = getGrowthStage(c.total);
    const cats         = buildOemCats(c);
    const catsHtml     = cats.map(cat => `<span class="rec-cat">${esc(cat)}</span>`).join('')
                         || '<span style="font-size:10px;color:var(--txt-3)">분류 데이터 부족</span>';

    // Score breakdown table (transparent scoring)
    const breakdown = buildScoreBreakdown(c, c.s);
    const bkdHtml   = breakdown.map(row => {
      const isTotal = row.item === '합계';
      return `<div class="bkd-row${isTotal?' bkd-total':''}">
        <span class="bkd-item">${esc(row.item)}</span>
        <span class="bkd-pts">${esc(row.pts)}</span>
        <span class="bkd-note">${esc(row.note)}</span>
      </div>`;
    }).join('');

    // 5-score grid
    const sItems = [
      { name:'생산력',   v:c.s.prod,   m:20 },
      { name:'기술력',   v:c.s.tech,   m:20 },
      { name:'성장성',   v:c.s.growth, m:20 },
      { name:'수출역량', v:c.s.expo,   m:20 },
      { name:'거래매력', v:c.s.attr,   m:20 },
    ];
    const s5Html = sItems.map(si => {
      const col = barColor(si.v, si.m);
      return `<div class="score-cell"><div class="sc-name">${si.name}</div><div class="sc-val" style="color:${col}">${si.v}</div><div class="sc-max">/${si.m}</div></div>`;
    }).join('');

    const isExpanded   = state.expandedOem   === c.id;
    const isHighlighted = state.highlightedOemId === c.id;

    return `<div class="oem-card ${isHighlighted?'highlighted':''}" id="oc-${c.id}">
      <div class="oc-head">
        <div class="tc-rank ${rbClass(rank)}">${rank}</div>
        <div class="oc-info">
          <div class="oc-name-row">
            <span class="oc-name">${esc(c.name)}</span>
            <span class="trade-badge ${tradeCls}">${tradeLbl}</span>
          </div>
          <div class="oc-meta">${esc(c.region)} · ${esc(c.code)}</div>
          <div class="oc-certs">${certHtml}</div>
        </div>
        <div class="oc-score-block">
          <div class="oc-score-num ${oppCls}">${c.total}</div>
          <div class="oc-score-label">/100</div>
          <div class="oc-score-basis">종합점수 기준</div>
        </div>
      </div>
      <div class="oc-hidden">
        <strong>발굴 이유:</strong> ${esc(hiddenReason)}
      </div>
      <button class="oc-expand-btn" onclick="toggleOem(${c.id})">
        <span>점수 산식 투명화 · 성장단계 · 추천 분야</span>
        <span class="expand-arrow ${isExpanded?'open':''}">▾</span>
      </button>
      <div class="oc-detail ${isExpanded?'open':''}" id="od-${c.id}">
        <div class="detail-block">
          <div class="detail-lbl">점수 구성</div>
          <div class="score-grid">${s5Html}</div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">점수 산식 투명화</div>
          <div class="bkd-table">${bkdHtml}</div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">성장 단계</div>
          <div class="growth-stage">
            <div class="gs-block"><div class="gs-label">현재</div><div class="gs-val">${esc(stage.now)}</div></div>
            <div class="gs-arrow">→</div>
            <div class="gs-block"><div class="gs-label">예상 (${esc(stage.period)})</div><div class="gs-val gs-val future">${esc(stage.pred)}</div></div>
          </div>
        </div>
        <div class="detail-block">
          <div class="detail-lbl">추천 생산 분야</div>
          <div class="rec-cat-list">${catsHtml}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  const listEl = document.getElementById('oemList');
  if (listEl) listEl.innerHTML = html;

  const wrapEl = document.getElementById('oemMoreWrap');
  if (wrapEl) {
    if (state.oemShown >= scored.length || state.oemShown >= 20) {
      wrapEl.style.display = 'none';
    } else {
      wrapEl.style.display = '';
      const btn = wrapEl.querySelector('.more-btn');
      if (btn) {
        btn.disabled = false;
        const next = Math.min(10, scored.length - state.oemShown);
        btn.textContent = `+ ${next}개 더 보기 (${state.oemShown+1}~${Math.min(state.oemShown+next,20)}위)`;
      }
    }
  }
}

/* ──────────────────────────────────────────
   16. RENDER ALL
────────────────────────────────────────── */
function renderAll() {
  renderBrief();
  renderTopRec();
  renderTrends();
  renderOEMs();
}

/* ──────────────────────────────────────────
   17. ACTIONS
────────────────────────────────────────── */

/** Toggle trend card detail expand/collapse */
function toggleTrend(id) {
  const wasOpen = state.expandedTrend === id;
  state.expandedTrend = wasOpen ? null : id;

  const detailEl = document.getElementById('td-' + id);
  const arrowEl  = document.querySelector(`#tc-${id} .tc-expand-btn .expand-arrow`);
  if (detailEl) detailEl.classList.toggle('open', !wasOpen);
  if (arrowEl)  arrowEl.classList.toggle('open',  !wasOpen);
}

/** Toggle OEM card detail expand/collapse */
function toggleOem(id) {
  const wasOpen = state.expandedOem === id;
  state.expandedOem = wasOpen ? null : id;

  const detailEl = document.getElementById('od-' + id);
  const arrowEl  = document.querySelector(`#oc-${id} .oc-expand-btn .expand-arrow`);
  if (detailEl) detailEl.classList.toggle('open', !wasOpen);
  if (arrowEl)  arrowEl.classList.toggle('open',  !wasOpen);
}

/** Highlight an OEM card in the right column, scroll into view */
function highlightOem(id) {
  // Remove previous highlight from DOM
  if (state.highlightedOemId && state.highlightedOemId !== id) {
    const prev = document.getElementById('oc-' + state.highlightedOemId);
    if (prev) prev.classList.remove('highlighted');
  }
  state.highlightedOemId = id;

  // Ensure the target card is rendered (expand oemShown if needed)
  let card = document.getElementById('oc-' + id);
  if (!card) {
    const scored = getOemScores();
    const idx = scored.findIndex(x => x.id === id);
    if (idx !== -1) {
      state.oemShown = Math.max(state.oemShown, idx + 1);
      renderOEMs();
      card = document.getElementById('oc-' + id);
    }
  } else {
    card.classList.add('highlighted');
  }

  // On mobile: switch to OEM tab
  if (window.innerWidth < 900) {
    const trendSec = document.getElementById('trendSection');
    const oemSec   = document.getElementById('oemSection');
    const tTab     = document.getElementById('mobileTabTrend');
    const oTab     = document.getElementById('mobileTabOem');
    if (trendSec) trendSec.style.display = 'none';
    if (oemSec)   oemSec.style.display   = '';
    if (tTab)     tTab.classList.remove('on');
    if (oTab)     oTab.classList.add('on');
  }

  if (card) {
    card.classList.add('highlighted');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Set analysis period and re-render */
function setPeriod(p) {
  if (state.period === p) return;
  state.period      = p;
  state.trendShown  = 10;
  state.oemShown    = 10;

  document.querySelectorAll('.period-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.period === p);
  });

  renderAll();
}

/** Show 10 more trend items */
function showMoreTrend() {
  const btn = document.querySelector('#trendMoreWrap .more-btn');
  if (btn) { btn.textContent = '로딩 중…'; btn.disabled = true; }
  state.trendShown = Math.min(state.trendShown + 10, TRENDS.length);
  setTimeout(renderTrends, 100);
}

/** Show 10 more OEM items */
function showMoreOem() {
  const btn = document.querySelector('#oemMoreWrap .more-btn');
  if (btn) { btn.textContent = '로딩 중…'; btn.disabled = true; }
  const scored = getOemScores();
  state.oemShown = Math.min(state.oemShown + 10, Math.min(scored.length, 20));
  setTimeout(renderOEMs, 100);
}

/** Re-run analysis with skeleton loading animation */
function rerunAnalysis() {
  const btn = document.querySelector('.btn-rerun');
  if (btn) { btn.textContent = '분석 중…'; btn.disabled = true; }

  _cachedOem           = null;
  state.trendShown     = 10;
  state.oemShown       = 10;
  state.expandedTrend  = null;
  state.expandedOem    = null;
  state.highlightedOemId = null;

  renderSkeleton();

  setTimeout(() => {
    renderAll();
    if (btn) { btn.textContent = '↺ 재분석'; btn.disabled = false; }
    const lbl = document.getElementById('updateLbl');
    if (lbl) lbl.textContent = '업데이트: ' + new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' });
  }, 700);
}

/** Toggle dark / light theme via data-theme on <html> */
function toggleTheme() {
  const html  = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const btn = document.querySelector('.btn-theme');
  if (btn) btn.textContent = isDark ? '다크모드' : '라이트모드';
}

/* ──────────────────────────────────────────
   18. SKELETON LOADING (5 cards per column)
────────────────────────────────────────── */
function skeletonCard(type) {
  if (type === 'trend') {
    return `<div class="trend-card skeleton-card">
      <div class="tc-summary">
        <div class="skel skel-rank"></div>
        <div class="tc-main" style="flex:1">
          <div class="skel skel-line" style="width:60%;margin-bottom:6px"></div>
          <div class="skel skel-line" style="width:40%"></div>
        </div>
        <div class="skel skel-score"></div>
      </div>
      <div class="tc-sub-metrics" style="padding:8px 12px">
        <div class="skel skel-line" style="width:55%"></div>
      </div>
      <div class="tc-action" style="padding:6px 12px">
        <div class="skel skel-line" style="width:80%"></div>
      </div>
    </div>`;
  }
  return `<div class="oem-card skeleton-card">
    <div class="oc-head">
      <div class="skel skel-rank"></div>
      <div class="oc-info" style="flex:1">
        <div class="skel skel-line" style="width:65%;margin-bottom:6px"></div>
        <div class="skel skel-line" style="width:40%;margin-bottom:6px"></div>
        <div class="skel skel-line" style="width:55%"></div>
      </div>
      <div class="skel skel-score"></div>
    </div>
    <div class="oc-hidden" style="padding:8px 12px">
      <div class="skel skel-line" style="width:90%"></div>
    </div>
  </div>`;
}

function renderSkeleton() {
  const fives = Array(5).fill(null);
  const trendEl = document.getElementById('trendList');
  const oemEl   = document.getElementById('oemList');
  if (trendEl) trendEl.innerHTML = fives.map(() => skeletonCard('trend')).join('');
  if (oemEl)   oemEl.innerHTML   = fives.map(() => skeletonCard('oem')).join('');
}

/* ──────────────────────────────────────────
   19. MOBILE TAB SWITCHING
────────────────────────────────────────── */
function initMobileTabs() {
  const trendTab = document.getElementById('mobileTabTrend');
  const oemTab   = document.getElementById('mobileTabOem');
  const trendSec = document.getElementById('trendSection');
  const oemSec   = document.getElementById('oemSection');
  if (!trendTab || !oemTab) return;

  function switchTab(active) {
    trendTab.classList.toggle('on', active === 'trend');
    oemTab.classList.toggle('on',   active === 'oem');
    if (trendSec) trendSec.style.display = active === 'trend' ? '' : 'none';
    if (oemSec)   oemSec.style.display   = active === 'oem'   ? '' : 'none';
  }

  trendTab.addEventListener('click', () => switchTab('trend'));
  oemTab.addEventListener('click',   () => switchTab('oem'));

  // On narrow viewport start showing only trend
  if (window.innerWidth < 900) switchTab('trend');

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) {
      if (trendSec) trendSec.style.display = '';
      if (oemSec)   oemSec.style.display   = '';
    } else {
      const active = trendTab.classList.contains('on') ? 'trend' : 'oem';
      switchTab(active);
    }
  });
}

/* ──────────────────────────────────────────
   20. PERIOD TAB INIT
────────────────────────────────────────── */
function initPeriodTabs() {
  document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => setPeriod(tab.dataset.period));
  });
}

/* ──────────────────────────────────────────
   21. BOOTSTRAP
────────────────────────────────────────── */
function init() {
  // Sync initial period tab active state
  document.querySelectorAll('.period-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.period === state.period);
  });

  // Timestamp
  const lbl = document.getElementById('updateLbl');
  if (lbl) lbl.textContent = '업데이트: ' + new Date().toLocaleDateString('ko-KR');

  initPeriodTabs();
  initMobileTabs();
  renderAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
