/* ════════════════════════════════════════════════════════════
   CosmeDB TAB05 – 트렌드 예측 & 소싱 검증
   v6 기반 / 아이보리 파스텔 테마
════════════════════════════════════════════════════════════ */

/* ════ 유틸 ════ */
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escJs(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
function ls(k, v) {
  if (v !== undefined) { localStorage.setItem(k, v); return v; }
  return localStorage.getItem(k) || '';
}
/* ════ 접근 제어(비밀번호) ════
   사내 공유용 간이 차단 장치 — 소스코드에 해시가 노출되어 있어 진짜 보안 수단이 아님.
   외부 공개·민감정보 보호가 필요하면 VPN/SSO 등 서버 측 접근 통제를 별도로 적용해야 함. */
const ACCESS_PW_HASH = '119199096d39ab2eb88670c85efa83a2bcff6e34bed1a9b27effac6b7c2b6153'; /* 기본값: cosmedb2026 */
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function checkAuthGate() {
  const gate = document.getElementById('authGate');
  const input = document.getElementById('authPwInput');
  const err = document.getElementById('authErr');
  const submit = async () => {
    const hash = await sha256Hex(input.value);
    if (hash === ACCESS_PW_HASH) {
      sessionStorage.setItem('cosmedb_auth', '1');
      gate.style.display = 'none';
      document.getElementById('appPage').style.display = '';
      init();
    } else {
      err.style.display = '';
      input.value = '';
      input.focus();
    }
  };
  document.getElementById('authSubmitBtn').addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  input.focus();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

/* ════ DB (150개 실데이터) ════ */
const DB = [
  {id:1,code:"1000000565",name:"코스맥스네오 주식회사",status:"CONFIRMED",region:"인천",addr:"인천광역시 부평구 평천로73번길 14",certs:["CGMP","ISO22716","ISO9001","ISO14001","ISO45001","비건"],industry:"제조",mgr:{"세종":"김동욱","부천":"장길호"},forms:{}},
  {id:2,code:"1000000568",name:"주식회사 태익",status:"CONFIRMED",region:"경기",addr:"경기도 부천시 삼작로 107번길 23(삼정동)",certs:[],industry:"화장품용기",mgr:{"세종":"박단비","부천":"장길호"},forms:{}},
  {id:3,code:"1000000582",name:"주식회사 이앤씨",status:"CONFIRMED",region:"경기",addr:"경기도 용인시 처인구 이동읍 덕성산단2로50번길 21",certs:["ISO22716","ISO9001","ISO14001","비건"],industry:"제조업",mgr:{"세종":"김현주","부천":"장길호"},forms:{}},
  {id:4,code:"1000000587",name:"주식회사 블리스팩",status:"SHADOW",region:"경기",addr:"경기도 시흥시 경기과기대로 171 (정왕동)",certs:["CGMP","ISO22716","ISO9001"],industry:"제조,도소매",mgr:{"세종":"양서경","부천":"장길호"},forms:{}},
  {id:6,code:"1000000632",name:"(주)필코 코스팜",status:"SHADOW",region:"경기",addr:"경기도 평택시 청북읍 현곡산단로 11",certs:["CGMP","ISO22716"],industry:"화장품및의약외품제조",mgr:{"세종":"이재강","부천":"장길호"},forms:{}},
  {id:7,code:"1000006991",name:"(주) 유공프라콤",status:"CONFIRMED",region:"경기",addr:"경기도 남양주시 화도읍 재재기로74번길 105-3",certs:[],industry:"포장용 플라스틱 성형용기 제조업",mgr:{"세종":"김민주","부천":"장길호"},forms:{}},
  {id:8,code:"5000000489",name:"콜마유엑스 주식회사 (세종)",status:"SHADOW",region:"세종",addr:"세종특별자치시 전의면 산단길 21-164",certs:[],industry:"제조업, 도매 및 소매업, 부동산",mgr:{"세종":"양서경","부천":"장길호"},forms:{}},
  {id:9,code:"1000000581",name:"에이스팩(주)",status:"SHADOW",region:"경기",addr:"경기도 안성시 미양면 은골길 36-13",certs:["ISO9001","ISO14001","ISO45001"],industry:"제조",mgr:{"세종":"박단비","부천":"이경은"},forms:{}},
  {id:10,code:"1000000575",name:"에스에이코스메틱",status:"SHADOW",region:"인천",addr:"인천 서구 가좌로29번길 22 IBC센터",certs:["ISO22716","ISO9001","ISO14001"],industry:"화장품 외",mgr:{"세종":"양서경","부천":"송재원"},forms:{}},
  {id:11,code:"1000000606",name:"(주)아리아코스메틱",status:"SHADOW",region:"경기",addr:"경기도 부천시 원미구 정주로 84 (도당동)",certs:["ISO22716","ISO9001","ISO14001"],industry:"화장품",mgr:{"세종":"김성희","부천":"송재원"},forms:{}},
  {id:12,code:"1000000604",name:"주식회사 인코스",status:"CONFIRMED",region:"경기",addr:"경기도 부천시 조마루로385번길 92, 1114, 1115호",certs:["ISO22716","비건"],industry:"도매업 외",mgr:{"세종":"이희석","부천":"마루한솔"},forms:{}},
  {id:14,code:"1000000661",name:"주식회사 스킨앤스킨",status:"CONFIRMED",region:"경기",addr:"경기도 파주시 문산읍 돈유2로 14-1, C동",certs:[],industry:"",mgr:{"세종":"장덕진","부천":"마루한솔"},forms:{}},
  {id:15,code:"1000006142",name:"(주)글로벌피앤피",status:"CONFIRMED",region:"경기",addr:"경기도 화성시 양감면 은행나무로62번길 92-60",certs:[],industry:"화장품, 건강기능식품 충진 및 포장",mgr:{"세종":"김현주","부천":"마루한솔"},forms:{}},
  {id:16,code:"1000006633",name:"주식회사 코테온",status:"CONFIRMED",region:"인천",addr:"인천광역시 남동구 청능대로339번길 63(고잔동)",certs:[],industry:"화장품",mgr:{"세종":"전성우","부천":"마루한솔"},forms:{}},
  {id:17,code:"1000006759",name:"주식회사 엠큐브",status:"CONFIRMED",region:"경기",addr:"경기도 화성시 양감면 안요골길 143-14",certs:["ISO9001"],industry:"제조업",mgr:{"세종":"김현주","부천":"마루한솔"},forms:{}},
  {id:18,code:"1000000471",name:"(주)엔에프씨",status:"SHADOW",region:"인천",addr:"인천 연수구 갯벌로145번길 15-8(송도동)",certs:["CGMP","ISO22716","ISO9001","ISO14001","ISO45001","비건"],industry:"도소매|제조|제조업|도매|소매|서비스",mgr:{"세종":"홍영표","부천":"김태인"},forms:{}},
  {id:19,code:"1000000591",name:"조이산업",status:"CONFIRMED",region:"경기",addr:"경기도 부천시 원미구 부천로208번길 77(춘의동)",certs:[],industry:"제조업,도소매 등",mgr:{"세종":"양서경","부천":"김태인"},forms:{}},
  {id:20,code:"1000003568",name:"콜마유엑스 주식회사",status:"SHADOW",region:"인천",addr:"인천광역시 부평구 가재울로 138(십정동)",certs:["CGMP","ISO22716","ISO9001"],industry:"제조업, 도매 및 소매업, 부동산",mgr:{"세종":"홍영표","부천":"김태인"},forms:{}},
  {id:22,code:"1000003598",name:"(주) 코나드",status:"CONFIRMED",region:"인천",addr:"인천광역시 남동구 남동서로 92",certs:["ISO22716","OTC DRUG","비건"],industry:"제조,도소매",mgr:{"세종":"홍영표","부천":"김태인"},forms:{}},
  {id:23,code:"1000004514",name:"콜마스크 주식회사",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 남동대로 405(남촌동)",certs:["CGMP","ISO22716","ISO9001","ISO14001","ISO45001","비건","할랄"],industry:"화장품 제조업",mgr:{"세종":"이재강","부천":"김태인"},forms:{}},
  {id:24,code:"1000004538",name:"주식회사 에치엔지",status:"SHADOW",region:"세종",addr:"세종특별자치시 전의면 산단길 21-164",certs:["CGMP","ISO22716","ISO9001"],industry:"제조 외",mgr:{"세종":"양서경","부천":"김태인"},forms:{}},
  {id:25,code:"1000006214",name:"이에스코스메틱",status:"CONFIRMED",region:"인천",addr:"인천광역시 남동구 남동대로409번길 46, 54, 1층",certs:["CGMP","ISO22716"],industry:"화장품",mgr:{"세종":"장덕진","부천":"김태인"},forms:{}},
  {id:26,code:"1000006425",name:"주식회사 코스나인",status:"CONFIRMED",region:"경기",addr:"경기도 김포시 양촌읍 학운산단2로 27",certs:[],industry:"화장품",mgr:{"세종":"전성우","부천":"김태인"},forms:{}},
  {id:28,code:"1000007576",name:"에스제이바이오(SJ BIO)",status:"CONFIRMED",region:"세종",addr:"세종특별자치시 전의면 관정리 711",certs:[],industry:"도매 및 소매업",mgr:{"세종":"김동욱","부천":"김태인"},forms:{}},
  {id:29,code:"1000009218",name:"오티씨엠(OTCM)",status:"SHADOW",region:"서울",addr:"서울특별시 금천구 가산디지털2로 43-14 (가산동)",certs:["ISO22716"],industry:"제조업",mgr:{"세종":"전성우","부천":"김태인"},forms:{}},
  {id:30,code:"S101084072",name:"에이제이산업",status:"SHADOW",region:"경기",addr:"경기도 평택시 산단로 63-19 (모곡동)",certs:[],industry:"포장",mgr:{"세종":"","부천":""},forms:{}},
  {id:31,code:"S101845064",name:"주식회사 에스에스엠",status:"SHADOW",region:"경기",addr:"경기도 하남시 미사대로 540 (덕풍동)",certs:["비건"],industry:"부직포, 화장품",mgr:{"세종":"","부천":""},forms:{}},
  {id:32,code:"S102854186",name:"(주)더부움",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 남동서로53번길 38 (고잔동)",certs:["ISO22716"],industry:"화장품",mgr:{"세종":"","부천":""},forms:{}},
  {id:33,code:"S102858818",name:"주식회사 네오메디컬",status:"SHADOW",region:"경기",addr:"경기도 안성시 원곡면 지문북길 89",certs:["ISO22716","ISO9001"],industry:"화장품",mgr:{"세종":"","부천":""},forms:{}},
  {id:34,code:"1000000549",name:"주식회사 피씨엠",status:"SHADOW",region:"경기",addr:"경기도 안성시 공도읍 기업단지로 92",certs:["CGMP","ISO22716"],industry:"제조업",mgr:{"세종":"김수정","부천":""},forms:{}},
  {id:35,code:"1000000550",name:"설옥화장품",status:"CONFIRMED",region:"인천",addr:"인천광역시 남동구 남동서로144번길 52 (고잔동)",certs:["ISO22716"],industry:"화장품",mgr:{"세종":"양서경","부천":""},forms:{}},
  {id:36,code:"1000000551",name:"(주)케이알텍",status:"SHADOW",region:"경기",addr:"경기도 안성시 원곡면 기업단지로 293-22, 주1동",certs:[],industry:"화장품",mgr:{"세종":"양서경","부천":""},forms:{}},
  {id:37,code:"1000000552",name:"주식회사 인터코스",status:"CONFIRMED",region:"인천",addr:"인천광역시 남동구 남동서로362번길 62",certs:[],industry:"제조업",mgr:{"세종":"박승흠","부천":""},forms:{}},
  {id:38,code:"1000000553",name:"주식회사 지에스켐",status:"SHADOW",region:"충청",addr:"충청북도 진천군 덕산면 신척산단5로 89",certs:["CGMP","ISO22716","ISO9001","ISO14001"],industry:"제조업",mgr:{"세종":"신원철","부천":""},forms:{}},
  {id:39,code:"1000000554",name:"주식회사 엔비씨",status:"SHADOW",region:"세종",addr:"세종특별자치시 전의면 의당전의로 908, 3층",certs:[],industry:"제조업",mgr:{"세종":"김성희","부천":""},forms:{}},
  {id:40,code:"1000000557",name:"(주)톡앤코",status:"CONFIRMED",region:"충청",addr:"충청북도 음성군 삼성면 대성로 547번길 105",certs:[],industry:"도소매",mgr:{"세종":"구도연","부천":""},forms:{}},
  {id:41,code:"1000000559",name:"(주)이미인",status:"SHADOW",region:"경기",addr:"경기도 오산시 가장산업서북로 40-37(가장동)",certs:["CGMP","ISO22716","ISO14001","ISO45001","비건"],industry:"제조업",mgr:{"세종":"이희석","부천":""},forms:{}},
  {id:42,code:"1000000560",name:"주식회사 제이코스메틱",status:"SHADOW",region:"경기",addr:"경기도 부천시 부천로276번길 23(도당동)",certs:[],industry:"제조업 외",mgr:{"세종":"김동욱","부천":""},forms:{}},
  {id:43,code:"1000000562",name:"윤지양행(주)",status:"SHADOW",region:"경기",addr:"경기도 오산시 가장산업서북로 23,1층(가장동)",certs:["CGMP","ISO22716","비건"],industry:"수지제품,가공인쇄",mgr:{"세종":"김성희","부천":""},forms:{}},
  {id:44,code:"1000000563",name:"씨앤텍주식회사",status:"CONFIRMED",region:"경기",addr:"경기도 화성시 정남면 귀래리 536-3",certs:["CGMP","ISO9001","ISO14001","ISO22716","비건"],industry:"제조",mgr:{"세종":"박단비","부천":""},forms:{}},
  {id:45,code:"1000000564",name:"(주)에이텍",status:"CONFIRMED",region:"기타",addr:"대덕구 대화로52번안길 35(대화동)",certs:[],industry:"산업,가정용플라스틱",mgr:{"세종":"박승흠","부천":""},forms:{}},
  {id:46,code:"1000000567",name:"주식회사 승일",status:"CONFIRMED",region:"충청",addr:"충청북도 음성군 원남 산단1길 50번지",certs:["CGMP","ISO22716","ISO9001","ISO14001"],industry:"제조",mgr:{"세종":"신원철","부천":""},forms:{}},
  {id:47,code:"1000000569",name:"(주)제닉",status:"SHADOW",region:"충청",addr:"충청남도 논산시 성동면 산업단지로5길 5",certs:["CGMP","ISO22716","ISO9001","ISO14001","비건"],industry:"제조업",mgr:{"세종":"장덕진","부천":""},forms:{}},
  {id:48,code:"1000000570",name:"미젤라 화장품",status:"CONFIRMED",region:"인천",addr:"인천시 남동구 남동동로 64번길 77",certs:["ISO22716","ISO9001","ISO14001"],industry:"화장품",mgr:{"세종":"박단비","부천":""},forms:{}},
  {id:49,code:"1000000572",name:"예원코스텍",status:"CONFIRMED",region:"경기",addr:"경기도 안산시 단원구 신길동 1123 안산디지털파크 3051",certs:[],industry:"제조업",mgr:{"세종":"김수정","부천":""},forms:{}},
  {id:50,code:"1000000574",name:"이지팩",status:"CONFIRMED",region:"경기",addr:"경기도 파주시 파주읍 매바위길 7-21",certs:[],industry:"포장자재",mgr:{"세종":"박단비","부천":""},forms:{}},
  {id:51,code:"1000000576",name:"(주)더존코리아",status:"SHADOW",region:"경기",addr:"경기도 광주시 곤지암읍 새재길 266",certs:["비건"],industry:"기타인쇄 외",mgr:{"세종":"김성희","부천":""},forms:{}},
  {id:52,code:"1000000577",name:"(주)뷰티스킨",status:"CONFIRMED",region:"인천",addr:"인천광역시 서구 염곡로14번길 27",certs:["CGMP","ISO22716","ISO9001","ISO14001","비건"],industry:"제조업 외",mgr:{"세종":"홍영표","부천":""},forms:{}},
  {id:53,code:"1000000578",name:"화이트코스팜(주)",status:"SHADOW",region:"충청",addr:"충남 천안시 서북구 성거읍 성거길 194",certs:["CGMP","ISO22716","ISO9001","ISO14001"],industry:"제조업",mgr:{"세종":"박승흠","부천":""},forms:{}},
  {id:54,code:"1000000579",name:"(주)이앤알 랩",status:"SHADOW",region:"기타",addr:"전북 완주군 봉동읍 완주산단6로 197",certs:["CGMP","ISO22716"],industry:"제조업",mgr:{"세종":"박승흠","부천":""},forms:{}},
  {id:55,code:"1000000580",name:"주식회사 필코스메틱",status:"CONFIRMED",region:"충청",addr:"충청북도 음성군 생극면 차생로 659",certs:[],industry:"화장품",mgr:{"세종":"신원철","부천":""},forms:{}},
  {id:56,code:"1000000583",name:"아인코스 주식회사",status:"CONFIRMED",region:"충청",addr:"충청남도 천안시 서북구 백석공단 1로 79",certs:["CGMP","ISO22716"],industry:"도소매",mgr:{"세종":"김동욱","부천":""},forms:{}},
  {id:57,code:"1000000585",name:"주식회사 파우코",status:"CONFIRMED",region:"경기",addr:"경기도 화성시 정남면 정남동로 331",certs:[],industry:"제조업, 도소매",mgr:{"세종":"이희석","부천":""},forms:{}},
  {id:58,code:"1000000586",name:"(주)리얼코스",status:"SHADOW",region:"경기",addr:"경기도 안성시 미양면 서운로 673-6",certs:["ISO22716","비건"],industry:"제조업",mgr:{"세종":"이희석","부천":""},forms:{}},
  {id:60,code:"1000000592",name:"주식회사 한국코스모",status:"SHADOW",region:"충청",addr:"충청남도 천안시 동남구 풍세면 풍세산단로 172",certs:["CGMP","ISO22716","ISO9001"],industry:"제조, 도소매",mgr:{"세종":"박승흠","부천":""},forms:{}},
  {id:62,code:"1000000594",name:"(주)비앤씨화장품",status:"SHADOW",region:"기타",addr:"천안시 동남구 풍세면 풍세산단로 134",certs:["ISO22716","ISO9001","ISO14001"],industry:"제조업",mgr:{"세종":"장덕진","부천":""},forms:{}},
  {id:63,code:"1000000595",name:"주식회사 제일참",status:"CONFIRMED",region:"충청",addr:"충청북도 음성군 삼성면 금일로 700번길 87",certs:["ISO22716","ISO9001","ISO14001"],industry:"제조",mgr:{"세종":"김현성","부천":""},forms:{}},
  {id:65,code:"1000000597",name:"(주)제일",status:"CONFIRMED",region:"충청",addr:"충청북도 음성군 생극면 차생로 659",certs:["CGMP","ISO22716","ISO9001","비건"],industry:"제조업,제조,소매",mgr:{"세종":"신원철","부천":""},forms:{}},
  {id:66,code:"1000000598",name:"주식회사 정코스",status:"CONFIRMED",region:"충청",addr:"충청북도 청주시 흥덕구 오송읍 오송생명 14로 118",certs:["CGMP","ISO22716","ISO9001","ISO14001","비건","할랄"],industry:"화장품/기타",mgr:{"세종":"박단비","부천":""},forms:{}},
  {id:68,code:"1000000601",name:"(주)아트스킨",status:"SHADOW",region:"경기",addr:"경기도 용인시 처인구 이동읍 덕성산단2로50번길 12-3",certs:["ISO9001","ISO14001","비건"],industry:"화장품 외",mgr:{"세종":"김성희","부천":""},forms:{}},
  {id:69,code:"1000000602",name:"에스엔제이코스메틱주식회사",status:"CONFIRMED",region:"충청",addr:"충청남도 천안시 서북구 백석공단3길 27",certs:["ISO22716"],industry:"제조업",mgr:{"세종":"박단비","부천":""},forms:{}},
  {id:72,code:"1000000607",name:"(주)정동산업",status:"SHADOW",region:"경기",addr:"경기도 남양주시 진건읍 독정로231번길 18",certs:["ISO9001","ISO14001"],industry:"스폰지 외",mgr:{"세종":"김민주","부천":""},forms:{}},
  {id:73,code:"1000000608",name:"주식회사 우인코리아",status:"SHADOW",region:"충청",addr:"충청남도 천안시 서북구 백석공단4길 12",certs:["ISO22716"],industry:"화장품",mgr:{"세종":"박단비","부천":""},forms:{}},
  {id:78,code:"1000000613",name:"(주)진코스텍",status:"CONFIRMED",region:"경기",addr:"경기도 시흥시 군자천로237번길 31",certs:["CGMP","ISO22716","ISO9001","ISO14001","비건","할랄"],industry:"제조외",mgr:{"세종":"장덕진","부천":""},forms:{}},
  {id:80,code:"1000000616",name:"소담코스메틱 주식회사",status:"SHADOW",region:"충청",addr:"충청남도 천안시 서북구 성거읍 모전1길 248-30",certs:["ISO22716"],industry:"제조업외",mgr:{"세종":"김수정","부천":""},forms:{}},
  {id:82,code:"1000000620",name:"(주)한솔바이오텍",status:"CONFIRMED",region:"경기",addr:"경기도 화성시 마도면 청원산단5길 45, 1동",certs:["CGMP","ISO22716"],industry:"제조업 외",mgr:{"세종":"구도연","부천":""},forms:{}},
  {id:87,code:"1000000625",name:"케이엠피(KMP)",status:"SHADOW",region:"경기",addr:"경기도 평택시 서탄면 수월암2길 50-6",certs:[],industry:"제조업 외",mgr:{"세종":"구도연","부천":""},forms:{}},
  {id:88,code:"1000000626",name:"시스킨코리아 주식회사",status:"SHADOW",region:"경기",addr:"경기도 부천시 부일로809번길 60(역곡동)",certs:["ISO22716","ISO9001","ISO14001","비건"],industry:"화장품 외",mgr:{"세종":"전성우","부천":""},forms:{}},
  {id:90,code:"1000000629",name:"주식회사 해피엘엔비",status:"SHADOW",region:"경기",addr:"경기도 이천시 부발읍 황무로 2065번길 41",certs:["ISO22716","ISO9001"],industry:"화장품제조",mgr:{"세종":"양서경","부천":""},forms:{}},
  {id:92,code:"1000000631",name:"주식회사 위드맘",status:"SHADOW",region:"경기",addr:"경기도 화성시 향남읍 발안공단로 226-28",certs:["ISO9001","ISO14001"],industry:"제조업",mgr:{"세종":"이재강","부천":""},forms:{}},
  {id:99,code:"1000000639",name:"(주)테라에코",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 청능대로 448번길 149-45",certs:["ISO22716"],industry:"제조업",mgr:{"세종":"김현성","부천":""},forms:{}},
  {id:109,code:"1000005038",name:"필립산업(주)",status:"SHADOW",region:"경기",addr:"경기도 용인시 처인구 원삼면 원양로 218",certs:["ISO22716"],industry:"도매업, 제조업",mgr:{"세종":"이재강","부천":""},forms:{}},
  {id:111,code:"1000005353",name:"주식회사 셀바이오휴먼텍",status:"SHADOW",region:"경기",addr:"경기도 안양시 동안구 시민대로 401",certs:[],industry:"제조업, 도소매",mgr:{"세종":"이희석","부천":""},forms:{}},
  {id:114,code:"1000006141",name:"주식회사 비와이에이치",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 청능대로448번길 149-45",certs:["ISO22716"],industry:"제조업",mgr:{"세종":"양서경","부천":""},forms:{}},
  {id:117,code:"1000006622",name:"주식회사 아주화장품",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 남동서로113번길 220",certs:["CGMP","ISO22716","ISO9001","ISO14001"],industry:"제조업",mgr:{"세종":"홍영표","부천":""},forms:{}},
  {id:121,code:"1000007039",name:"주식회사 그루비코스메틱",status:"SHADOW",region:"충청",addr:"충청남도 보령시 웅천읍 웅천산단2길 66",certs:["ISO22716","ISO9001","ISO14001","비건"],industry:"화장품",mgr:{"세종":"김수정","부천":""},forms:{}},
  {id:126,code:"1000007218",name:"(주)제네웰",status:"SHADOW",region:"경기",addr:"경기도 성남시 중원구 사기막골로62번길 37",certs:["ISO22716","ISO9001","ISO13485"],industry:"제조업",mgr:{"세종":"홍영표","부천":""},forms:{}},
  {id:129,code:"1000007259",name:"주식회사비엔코스",status:"SHADOW",region:"충청",addr:"충청북도 청주시 청원구 오창읍 양청송대길 153",certs:["CGMP","ISO22716","ISO9001","ISO14001"],industry:"화장품제조",mgr:{"세종":"홍영표","부천":""},forms:{}},
  {id:130,code:"1000007583",name:"주식회사 에스엘피코스메틱",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 남동서로362번길 47 (남촌동)",certs:["ISO22716"],industry:"제조업",mgr:{"세종":"구도연","부천":""},forms:{}},
  {id:132,code:"1000007884",name:"(주)가미코스메틱",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 남동동로 180 (고잔동)",certs:["ISO22716"],industry:"화장품",mgr:{"세종":"홍영표","부천":""},forms:{}},
  {id:133,code:"1000007936",name:"주식회사 미스킨",status:"SHADOW",region:"경기",addr:"경기도 양주시 은현면 화합로691번길 30",certs:["ISO22716"],industry:"제조",mgr:{"세종":"양서경","부천":""},forms:{}},
  {id:135,code:"1000008383",name:"제이디아이 코스메틱스지점",status:"SHADOW",region:"경기",addr:"경기도 오산시 동부대로 446 (원동)",certs:["ISO9001"],industry:"제조업",mgr:{"세종":"신원철","부천":""},forms:{}},
  {id:145,code:"1000009147",name:"네오메디컬솝",status:"SHADOW",region:"경기",addr:"경기도 안성시 원곡면 지문로 27",certs:["CGMP","ISO22716"],industry:"제조",mgr:{"세종":"이재강","부천":""},forms:{}},
  {id:150,code:"1000009761",name:"주식회사 제이제이클럽",status:"SHADOW",region:"인천",addr:"인천광역시 남동구 앵고개로 385 (고잔동)",certs:["ISO22716","비건"],industry:"제조업",mgr:{"세종":"김현주","부천":""},forms:{}},
];

/* ════ 법령·규제 데이터 ════ */
const REGS = [
  {level:'critical',tag:'시행',title:'레티놀·레티닐팔미테이트 농도 상한 신설',
   date:'2026.07.01',auth:'식약처',
   detail:'레티놀 0.5% 이하, 레티닐팔미테이트 10% 이하. 기능성 화장품 전 품목.',
   action:'세럼·앰플 전성분 즉시 검토. 규격 초과 시 리포뮬레이션 착수.',
   url:'https://www.mfds.go.kr', srcLabel:'식품의약품안전처 공식 홈페이지'},
  {level:'critical',tag:'수출영향',title:'EU 미세플라스틱 사용 금지 (5μm 이하)',
   date:'2027.01.01',auth:'EU SCCS',
   detail:'마이크로비드 포함 미세플라스틱 전 품목 금지. EU 수출 제품 성분 재검토.',
   action:'EU 수출 품목 PE·PP 원료 함유 여부 전수 점검. 클렌징·스크럽 우선.',
   url:'https://eur-lex.europa.eu', srcLabel:'EU 입법 데이터베이스(EUR-Lex)'},
  {level:'upcoming',tag:'미국수출',title:'MoCRA — FDA 시설·제품 등록 의무화',
   date:'2026.12.31',auth:'FDA',
   detail:'미국 수출 화장품 제조사 FDA 시설 등록 및 제품 목록 제출 의무.',
   action:'미국 수출 거래처 FDA 등록 현황 확인. 미등록 시 절차 즉시 착수.',
   url:'https://www.fda.gov', srcLabel:'美 FDA 공식 홈페이지'},
  {level:'upcoming',tag:'중동수출',title:'할랄 인증 기준 강화 — 원료 추적성 요구',
   date:'2026.12',auth:'KMF',
   detail:'할랄 원료 공급망 추적성 문서 강화. 중동 수출 제품 영향.',
   action:'할랄 인증 업체 원료 공급망 문서 점검. 추적성 미비 시 재인증 필요.',
   url:'https://www.kmf.or.kr', srcLabel:'한국이슬람교 할랄위원회(KMF)'},
];

/* ════ 박람회·전시회 일정 (정적 참조 — 연 단위 갱신 필요) ════
   국내 화장품·뷰티 박람회(B2B) + 리테일 뷰티 기획전 + 설비·패키징전을 트렌드 탐색
   참고용으로 정리한 보기 전용 목록 — 해외 행사는 제외(국내 신규처·국내 소비 트렌드
   탐색 목적에 한정). 해마다 정확한 일자가 매년 초 공지되므로 nextDate는 "통상 개최
   시기" 기준 추정값이며, [전체 수집 실행] 시 verifyExpoSchedules()가 뉴스 검색으로
   확정 일정을 찾으면 화면에 "확정"으로 갱신한다(찾지 못하면 추정 상태 유지). */
/* confirmed: true → 주최측 공식 발표(홈페이지·보도)로 정확한 개최일이 이미 공개된 건
   confirmed: false → 매년/격년 통상 개최 시기 패턴에 근거한 추정일(공식 발표 전) */
const EXPOS = [
  {name:'코스모뷰티 서울(서울국제화장품미용박람회)', type:'expo', org:'대한화장품미용산업대전 사무국', month:'매년 5월경',
   nextDate:'2026.05.27~2026.05.29', confirmed:true, location:'서울 코엑스 A·B홀',
   focus:'국내 최대 규모 화장품·뷰티 종합전 — OEM/ODM·소재사 부스 다수, 국내 신규처 탐색에 유용. 2026년판 820부스 역대 최대 규모로 개최(종료)',
   url:'https://www.cosmobeautyseoul.com', srcLabel:'코스모뷰티 서울 공식 홈페이지'},
  {name:'in-cosmetics Korea', type:'expo', org:'Informa Markets', month:'매년 7월', nextDate:'2026.07.01~2026.07.03',
   confirmed:true, location:'서울 코엑스 C·D·E홀', focus:'화장품 원료·성분 전문 박람회(국내 개최) — 신규 원료·포뮬레이션 트렌드 탐색',
   url:'https://www.in-cosmetics.com/korea', srcLabel:'in-cosmetics Korea 공식 홈페이지'},
  {name:'K-BEAUTY EXPO KOREA', type:'expo', org:'KINTEX·KOTRA', month:'매년 10월', nextDate:'2026.10.15~2026.10.17',
   confirmed:true, location:'경기 고양 킨텍스', focus:'코트라·킨텍스 공동 주관 수출상담회 성격 — 해외 바이어 매칭, 신규 수출처 발굴에 유용',
   url:'https://www.kbeautyexpo.com', srcLabel:'K-BEAUTY EXPO KOREA 공식 홈페이지'},
  {name:'부산국제화장품미용박람회(BICE)', type:'expo', org:'벡스코', month:'매년 9월경', nextDate:'2026.09.10',
   confirmed:false, location:'부산 벡스코', focus:'영남권 화장품·뷰티 종합전 — 지역 OEM/ODM·소재사 탐색. 공식 발표 전(추정 일정)',
   url:'https://www.bexco.co.kr', srcLabel:'벡스코 전시일정 안내'},
  {name:'대구국제뷰티엑스포', type:'expo', org:'엑스코', month:'매년 6월경', nextDate:'2026.06.11',
   confirmed:true, location:'대구 엑스코', focus:'대구·경북권 뷰티 산업 박람회 — 지역 소재·뷰티기기 트렌드 확인(종료)',
   url:'https://www.beautyexpo.kr', srcLabel:'대구국제뷰티엑스포 공식 홈페이지'},
  {name:'올리브영 뷰티 기획전(다이브인페스티벌 등 시즌 세일)', type:'retail', org:'CJ올리브영', month:'연 수회(2~3월/6~7월/10~11월)',
   nextDate:'2026.10.22', confirmed:false, location:'전국 매장·온라인',
   focus:'국내 최대 뷰티 리테일러 시즌 기획전 — 큐레이션 카테고리로 소비 트렌드 선행 포착. 매회 구체 일정은 임박 시점에 공개',
   url:'https://www.oliveyoung.co.kr', srcLabel:'올리브영 공식 홈페이지'},
  {name:'코리아팩(KOREA PACK)', type:'equipment', org:'한국포장기계협회', month:'격년(짝수년) 3~4월',
   nextDate:'2028.03.28', confirmed:false, location:'경기 킨텍스',
   focus:'국내 최대 충진·성형·자동화 설비전 — 2026년부터 ICPI WEEK(국제 제약·화장품위크)와 통합 개최되어 화장품 제조설비 신기술이 가장 먼저 공개되는 자리. 2026년판은 이미 종료(3.31~4.3) — 다음은 2028년 격년 개최(정확한 일정 미발표)',
   url:'https://www.koreapack.org', srcLabel:'KOREA PACK 공식 홈페이지'},
  {name:'한국포장전(H-PACK)', type:'equipment', org:'월간포장타임즈', month:'매년 10월',
   nextDate:'2026.10.27', confirmed:false, location:'경기 킨텍스',
   focus:'포장기계·자재·용기·친환경 패키징 솔루션 전문전(식품·제약·화장품 공통) — 신규 패키징 소재·기술 트렌드 확인. 2025년판은 10.28~31 개최, 2026년판 정확한 일정 미발표(추정)',
   url:'http://hpack.org', srcLabel:'한국포장전(H-PACK) 공식 홈페이지'},
];

/* ════ STATE ════ */
let SIG_DATA = { climate: null, society: null, economy: null, culture: null };
let PREDICTIONS = [];
let MATCH_RESULTS = { trackA: [], trackB: [] };
let SEL_IDX = -1;
let currentPeriod = '6m';
const PREDICTIONS_CACHE = { '3m': null, '6m': null, '1y': null };
/* 예측 기간 라벨 — 1~2개월(즉시대응)·6개월·1년 3구간 공용 */
/* 기획안 기준 3·6·12개월 구간. '2m'은 구버전 원장 이력 호환용 라벨 */
const PERIOD_LABEL = { '3m': '3개월', '6m': '6개월', '1y': '12개월', '2m': '1~2개월' };
let currentPkgType = '';   /* 현재 선택된 예측의 패키징 타입 */

/* TRACK B 후보 인덱스 접근용 (onclick HTML attribute에서 JSON 직접 전달 방지) */
window._evalCandidates = [];

/* ════ API 키 관리 ════ */
/* ════ 백엔드(Vercel) 모드 ════
   API 키를 Vercel 서버리스 함수(api/proxy.js)의 환경변수에 두면, 브라우저는 키 입력
   없이 백엔드를 경유해 모든 API를 쓴다. 키 자리에는 센티널(__BK__)이 들어가고
   서버가 호스트별 실제 키로 치환한다. Vercel 배포 도메인에서는 자동 활성화,
   GitHub Pages 등 다른 호스팅에서는 [API 설정]의 백엔드 URL로 연결. */
const BK = {
  base() {
    const manual = (ls('backend_url') || '').trim().replace(/\/+$/, '');
    if (manual) return manual;
    return /\.vercel\.app$/.test(location.hostname) ? location.origin : '';
  },
  on() { return !!BK.base(); },
};
/* 백엔드 경유 원시 호출 — 대상 URL(센티널 포함 가능)을 서버가 키 치환 후 대신 호출 */
async function bkFetch(targetUrl, opts = {}, timeout = 15000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(`${BK.base()}/api/proxy?url=${encodeURIComponent(targetUrl)}`, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': opts.contentType || 'application/json' } : undefined,
      ...(opts.body ? { body: opts.body } : {}),
      signal: ctrl.signal,
    });
  } finally { clearTimeout(tid); }
}

const K = {
  /* 백엔드 모드에선 미입력 키를 센티널로 대체 — 모든 키 가드를 통과시키고
     실제 값은 서버가 주입한다 */
  gemini:  () => ls('gemini_key')  || (BK.on() ? '__BK__' : ''),
  model:   () => ls('gemini_model') || 'gemini-2.5-flash-lite',
  public:  () => ls('public_key')  || (BK.on() ? '__BK__' : ''),
  naverID: () => ls('naver_id')    || (BK.on() ? '__BK__' : ''),
  naverSec:() => ls('naver_sec')   || (BK.on() ? '__BK__' : ''),
  ecos:    () => ls('ecos_key')    || (BK.on() ? '__BK__' : ''),
  kipris:  () => ls('kipris_key')  || (BK.on() ? '__BK__' : ''),
  youtube: () => ls('youtube_key') || (BK.on() ? '__BK__' : ''),
};

function saveKey(type) {
  if (type === 'gemini') {
    const v = document.getElementById('k-gemini').value.trim();
    if (v) { ls('gemini_key', v); setStatus('st-gemini', '설정됨', true); showToast('Gemini 키 저장됨'); }
  }
  if (type === 'gemini-model') { ls('gemini_model', document.getElementById('gemini-model').value); }
  if (type === 'public') {
    const v = document.getElementById('k-public').value.trim();
    if (v) {
      /* URL 인코딩된 키(%2B, %2F 등)가 붙여넣어지면 디코딩해서 저장 */
      let norm = v;
      try { if (/%[0-9A-Fa-f]{2}/.test(v)) norm = decodeURIComponent(v); } catch {}
      ls('public_key', norm);
      setStatus('st-public', '설정됨', true);
      showToast('공공데이터 키 저장됨');
    }
  }
  if (type === 'naver') {
    const id = document.getElementById('k-naver-id').value.trim();
    const sec = document.getElementById('k-naver-sec').value.trim();
    if (id && sec) { ls('naver_id', id); ls('naver_sec', sec); setStatus('st-naver', '설정됨', true); showToast('네이버 API 키 저장됨'); }
  }
  if (type === 'ecos') {
    const v = document.getElementById('k-ecos').value.trim();
    if (v) { ls('ecos_key', v); setStatus('st-ecos', '설정됨', true); showToast('ECOS 키 저장됨'); }
  }
  if (type === 'kipris') {
    const v = document.getElementById('k-kipris').value.trim();
    if (v) { ls('kipris_key', v); setStatus('st-kipris', '설정됨', true); showToast('KIPRIS 키 저장됨'); }
  }
  if (type === 'youtube') {
    const v = document.getElementById('k-youtube').value.trim();
    if (v) { ls('youtube_key', v); setStatus('st-youtube', '설정됨', true); showToast('YouTube 키 저장됨'); }
  }
  if (type === 'backend') {
    const v = document.getElementById('k-backend').value.trim().replace(/\/+$/, '');
    ls('backend_url', v);   /* 빈 값 저장 = 연결 해제 */
    setStatus('st-backend', v ? '설정됨' : '미연결', !!v);
    showToast(v ? '백엔드 URL 저장됨 — 테스트로 서버 키 현황을 확인하세요' : '백엔드 연결 해제됨');
  }
}

async function testBackend() {
  const el = document.getElementById('r-backend');
  const base = BK.base();
  if (!base) { el.textContent = '백엔드 URL을 입력·저장하거나 Vercel 도메인에서 접속하세요'; el.style.color = 'var(--red)'; return; }
  el.textContent = `백엔드 연결 테스트 중... (${base})`; el.style.color = 'var(--ink3)';
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(`${base}/api/proxy`, { signal: ctrl.signal });
    clearTimeout(tid);
    const j = await r.json();
    if (!j.ok) throw new Error('응답 형식 오류');
    const lbl = { naver: '네이버', public: '공공데이터', ecos: 'ECOS', gemini: 'Gemini', youtube: 'YouTube', kipris: 'KIPRIS' };
    const lines = Object.entries(j.keys).map(([k, on]) => `  · ${lbl[k] || k}: ${on ? '서버 키 등록됨 ✓' : '미등록 — Vercel 환경변수에 추가 필요'}`);
    el.textContent = `백엔드 연결 성공\n${lines.join('\n')}\n※ 등록된 키의 API는 브라우저 키 입력 없이 바로 동작합니다`;
    el.style.color = 'var(--grn)';
    setStatus('st-backend', '연결됨', true);
  } catch (e) {
    el.textContent = `연결 실패: ${e.message}\n\n확인:\n① Vercel에 이 저장소를 배포했는지 (api/proxy.js 포함)\n② URL이 https://프로젝트명.vercel.app 형식인지`;
    el.style.color = 'var(--red)';
  }
}

function setStatus(id, txt, ok) {
  const el = document.getElementById(id);
  if (el) { el.textContent = txt; el.style.color = ok ? 'var(--grn)' : 'var(--ink3)'; }
}

function loadKeys() {
  /* 상태 표시는 브라우저에 직접 저장된 키 기준(ls) — 백엔드 센티널(__BK__)과 구분 */
  const bk = BK.on();
  const st = (id, has) => setStatus(id, has ? '설정됨' : (bk ? '백엔드' : '미설정'), has || bk);
  if (ls('gemini_key')) document.getElementById('k-gemini').value = ls('gemini_key');
  st('st-gemini', !!ls('gemini_key'));
  st('st-public', !!ls('public_key'));
  st('st-naver', !!ls('naver_id'));
  st('st-ecos', !!ls('ecos_key'));
  st('st-kipris', !!ls('kipris_key'));
  st('st-youtube', !!ls('youtube_key'));
  if (BK.base()) { setStatus('st-backend', '연결됨', true); const bi = document.getElementById('k-backend'); if (bi) bi.value = ls('backend_url') || BK.base(); }
  const mSel = document.getElementById('gemini-model');
  if (mSel && K.model()) mSel.value = K.model();
}

function toggleApiPanel() {
  document.getElementById('apiPanel').classList.toggle('open');
  document.getElementById('repPanel').classList.remove('open');
}
function toggleRepPanel() {
  document.getElementById('repPanel').classList.toggle('open');
  document.getElementById('apiPanel').classList.remove('open');
}
function toggleGuidePanel() {
  document.getElementById('guideOverlay').classList.toggle('open');
}
function closeSigDetail() {
  document.getElementById('sigOverlay').classList.remove('open');
}

/* ════ ZONE 3 법령 렌더 ════ */
function renderZ3() {
  const el = document.getElementById('z3');
  const now = new Date();
  const levelOf = r => {
    const parts = r.date.replace(/\./g, '-').split('-');
    const d = new Date(parts[0], (parts[1]||1)-1, parts[2]||1);
    if (isNaN(d)) return r.level;
    const daysLeft = Math.ceil((d - now) / 86400000);
    if (daysLeft < 0) return 'passed';
    if (daysLeft <= 30) return 'imminent';
    return r.level;
  };
  const clsMap = { critical:'rl-crit', imminent:'rl-imm', upcoming:'rl-upco', passed:'rl-pass' };
  const labelMap = { critical:'즉시대응', imminent:'30일 이내', upcoming:'예정', passed:'시행완료' };
  el.innerHTML = REGS.map(r => {
    const lv = levelOf(r);
    return `<div class="reg-card${lv === 'passed' ? ' reg-passed' : ''}">
      <div class="reg-hd">
        <span class="${clsMap[lv] || 'rl-upco'}">${labelMap[lv] || escHtml(r.tag)}</span>
        <div class="reg-name">${escHtml(r.title)}</div>
      </div>
      <div class="reg-body">
        <div class="reg-meta">${escHtml(r.auth)} · ${escHtml(r.date)}</div>
        <div class="reg-detail">${escHtml(r.detail)}</div>
        <div class="reg-action">${escHtml(r.action)}${r.url ? ` <a href="${escHtml(r.url)}" target="_blank" style="font-size:9px;color:var(--blue2)">${escHtml(r.srcLabel || '근거 자료 바로가기')} →</a>` : ''}</div>
      </div>
    </div>`;
  }).join('');
}

/* 담당자 수동 확인(C안) — 휴리스틱 자동 탐지의 한계를 사람이 보완하는 신뢰 계층.
   자동 탐지(A안: 추정/유력/확정 3단계)와 별개로, 담당자가 공식 홈페이지에서 직접
   확인하면 가장 신뢰도가 높은 "담당자 확인" 스탬프로 고정된다. 90일 후 재확인을
   권고(다음 확인 예정일 표시)한다. 브라우저별 localStorage 저장이므로 직원 간
   공유는 되지 않는다 — 공유가 필요하면 서버 저장소로 교체 필요. */
function getExpoManualConfirm() {
  try { return JSON.parse(ls('expo_manual_confirm') || '{}'); } catch { return {}; }
}
function setExpoManualConfirm(name, on) {
  const map = getExpoManualConfirm();
  if (on) {
    const now = Date.now();
    map[name] = { confirmedAt: now, nextCheckDue: now + 90 * 86400000 };
  } else {
    delete map[name];
  }
  ls('expo_manual_confirm', JSON.stringify(map));
  return map;
}
function toggleExpoManualConfirm(name) {
  const map = getExpoManualConfirm();
  setExpoManualConfirm(name, !map[name]);
  renderZ4();
}

/* ════ 국내 박람회 관리 — 편집형 목록(A) + 실행 관리(B) ════
   EXPOS(하드코딩)를 기본 시드로 두고, 사용자 추가/편집/삭제·상태·마감·체크리스트·메모를
   localStorage에 오버레이한다. 코드 수정 없이 운용 가능. 브라우저별 저장이라 팀 공유는
   내보내기/가져오기(JSON)로 처리. */
const EXPO_STATUSES = ['관심', '참가확정', '관람예정', '종료'];
const EXPO_STATUS_CLS = { '관심': 'est-interest', '참가확정': 'est-join', '관람예정': 'est-visit', '종료': 'est-done' };
const EXPO_TYPES = [['expo', 'B2B 박람회'], ['retail', '리테일 기획전'], ['equipment', '설비·패키징전']];

function getExpoCustom() { try { return JSON.parse(ls('expo_custom') || '[]'); } catch { return []; } }
function saveExpoCustom(a) { ls('expo_custom', JSON.stringify(a)); }
function getExpoMeta() { try { return JSON.parse(ls('expo_meta') || '{}'); } catch { return {}; } }
function saveExpoMeta(m) { ls('expo_meta', JSON.stringify(m)); }
function getExpoHidden() { try { return JSON.parse(ls('expo_hidden') || '[]'); } catch { return []; } }
function saveExpoHidden(a) { ls('expo_hidden', JSON.stringify(a)); }
/* 자동 발견(조회 시점 뉴스에서 감지된 국내 행사) — 수집 때마다 갱신, 사용자가 지운 건 제외 */
function getExpoAuto() { try { return JSON.parse(ls('expo_auto') || '[]'); } catch { return []; } }
function saveExpoAuto(a) { ls('expo_auto', JSON.stringify(a)); }
function getExpoAutoDismissed() { try { return JSON.parse(ls('expo_auto_dismissed') || '[]'); } catch { return []; } }
function saveExpoAutoDismissed(a) { ls('expo_auto_dismissed', JSON.stringify(a)); }
/* 중복 판정용 행사명 정규화 (공백·괄호·구분자 제거) */
function normExpoName(n) { return String(n || '').replace(/\s|\(.*?\)|[·\-—_,]/g, '').toLowerCase(); }
/* 시드(숨김 제외) + 사용자 추가 + 자동 발견(중복·삭제분 제외) 병합 */
function getAllExpos() {
  const hidden = new Set(getExpoHidden());
  const seed = EXPOS.filter(x => !hidden.has(x.name)).map(x => ({ ...x, _seed: true }));
  const custom = getExpoCustom().map(x => ({ ...x, _custom: true }));
  const taken = new Set([...seed, ...custom].map(x => normExpoName(x.name)));
  const dismissed = new Set(getExpoAutoDismissed().map(normExpoName));
  const auto = getExpoAuto()
    .filter(x => x.name && !taken.has(normExpoName(x.name)) && !dismissed.has(normExpoName(x.name)))
    .map(x => ({ ...x, _auto: true }));
  return [...seed, ...custom, ...auto];
}
function setExpoMeta(name, patch) { const m = getExpoMeta(); m[name] = { ...(m[name] || {}), ...patch }; saveExpoMeta(m); }
function setExpoStatus(name, val) { setExpoMeta(name, { status: val || '' }); renderZ4(); }
/* 메모는 재렌더 없이 저장(포커스·펼침 유지) */
function saveExpoMemo(name, val) { setExpoMeta(name, { memo: val }); }

function deleteExpo(name, origin) {
  if (!confirm(`"${name}"을(를) 목록에서 삭제할까요?${origin === 'seed' ? ' (기본 제공 행사는 숨김 처리되며, 가져오기 초기화로 복구 가능)' : ''}`)) return;
  if (origin === 'custom') saveExpoCustom(getExpoCustom().filter(x => x.name !== name));
  else if (origin === 'auto') { const d = getExpoAutoDismissed(); if (!d.includes(name)) { d.push(name); saveExpoAutoDismissed(d); } }
  else { const h = getExpoHidden(); if (!h.includes(name)) { h.push(name); saveExpoHidden(h); } }
  const m = getExpoMeta(); delete m[name]; saveExpoMeta(m);
  renderZ4();
}

/* 추가/편집 폼(모달) — name 없으면 신규, 있으면 편집 */
function openExpoForm(name) {
  const editing = name ? getAllExpos().find(x => x.name === name) : null;
  let ov = document.getElementById('expoFormOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'expoFormOverlay'; ov.className = 'guide-overlay';
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
  }
  const g = (v) => escHtml(v || '');
  const typeOpts = EXPO_TYPES.map(([v, l]) => `<option value="${v}"${editing && editing.type === v ? ' selected' : ''}>${l}</option>`).join('');
  ov.innerHTML = `<div class="guide-modal" style="max-width:440px" onclick="event.stopPropagation()">
    <div class="gm-head"><span class="gm-title">${editing ? '박람회 편집' : '박람회 추가'}</span>
      <button class="gm-close" onclick="document.getElementById('expoFormOverlay').classList.remove('open')">×</button></div>
    <div class="gm-body">
      <div class="ef-field"><label>행사명 *</label><input id="ef-name" class="ef-in" value="${g(editing && editing.name)}" placeholder="예: 코스모뷰티 서울"></div>
      <div class="ef-field"><label>유형</label><select id="ef-type" class="ef-in">${typeOpts}</select></div>
      <div class="ef-field"><label>주최</label><input id="ef-org" class="ef-in" value="${g(editing && editing.org)}"></div>
      <div class="ef-field"><label>장소</label><input id="ef-loc" class="ef-in" value="${g(editing && editing.location)}" placeholder="예: 서울 코엑스"></div>
      <div class="ef-field"><label>개최일 (YYYY.MM.DD 또는 YYYY.MM.DD~MM.DD)</label><input id="ef-date" class="ef-in" value="${g(editing && editing.nextDate)}" placeholder="2026.05.27~2026.05.29"></div>
      <div class="ef-field ef-check"><label><input type="checkbox" id="ef-confirmed"${editing && editing.confirmed ? ' checked' : ''}> 공식 발표된 확정 일정</label></div>
      <div class="ef-field"><label>설명·소싱 포인트</label><textarea id="ef-focus" class="ef-in" rows="2">${g(editing && editing.focus)}</textarea></div>
      <div class="ef-field"><label>공식 홈페이지 URL</label><input id="ef-url" class="ef-in" value="${g(editing && editing.url)}" placeholder="https://"></div>
      <div class="ef-actions">
        <button class="ebtn-add" onclick="submitExpoForm(${editing ? `'${escJs(editing.name)}'` : 'null'})">${editing ? '저장' : '추가'}</button>
        <button class="ebtn-tool" onclick="document.getElementById('expoFormOverlay').classList.remove('open')">취소</button>
      </div>
    </div>
  </div>`;
  ov.classList.add('open');
}
function submitExpoForm(originalName) {
  const val = id => (document.getElementById(id).value || '').trim();
  const name = val('ef-name');
  if (!name) { showToast('행사명을 입력하세요'); return; }
  const rec = {
    name, type: val('ef-type') || 'expo', org: val('ef-org'), location: val('ef-loc'),
    nextDate: val('ef-date'), confirmed: document.getElementById('ef-confirmed').checked,
    focus: val('ef-focus'), url: val('ef-url'),
    srcLabel: '공식 홈페이지', month: '',
  };
  const custom = getExpoCustom();
  if (originalName) {
    /* 편집 — 원본 출처에 따라 제거(커스텀 교체 / 시드·자동 발견은 숨김·삭제 후 커스텀 편입) */
    const orig = getAllExpos().find(x => x.name === originalName);
    if (orig && orig._custom) { const i = custom.findIndex(x => x.name === originalName); if (i >= 0) custom.splice(i, 1); }
    else if (orig && orig._auto) { const d = getExpoAutoDismissed(); if (!d.includes(originalName)) { d.push(originalName); saveExpoAutoDismissed(d); } }
    else { const h = getExpoHidden(); if (!h.includes(originalName)) { h.push(originalName); saveExpoHidden(h); } }
    /* 메타(상태·메모) 이름 변경 시 이전(이관) */
    if (originalName !== name) { const m = getExpoMeta(); if (m[originalName]) { m[name] = m[originalName]; delete m[originalName]; saveExpoMeta(m); } }
    custom.push(rec);
  } else {
    if (getAllExpos().some(x => x.name === name)) { showToast('같은 이름의 행사가 이미 있습니다'); return; }
    custom.push(rec);
  }
  saveExpoCustom(custom);
  document.getElementById('expoFormOverlay').classList.remove('open');
  renderZ4();
  showToast(originalName ? '박람회 정보 저장됨' : '박람회 추가됨');
}

/* 내보내기/가져오기 — 사용자 데이터(추가·메타·숨김)를 JSON으로 백업·공유 */
function exportExpos() {
  const data = { _type: 'cosmedb_expos', custom: getExpoCustom(), meta: getExpoMeta(), hidden: getExpoHidden(), ts: Date.now() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const d = new Date();
  a.download = `cosmedb_expos_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  showToast('박람회 관리 데이터 내보냄');
}
function importExpos(file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (d._type !== 'cosmedb_expos') { showToast('형식이 올바르지 않은 파일입니다'); return; }
      if (Array.isArray(d.custom)) saveExpoCustom(d.custom);
      if (d.meta && typeof d.meta === 'object') saveExpoMeta(d.meta);
      if (Array.isArray(d.hidden)) saveExpoHidden(d.hidden);
      renderZ4();
      showToast('박람회 관리 데이터 가져옴');
    } catch { showToast('파일을 읽지 못했습니다'); }
  };
  rd.readAsText(file);
}

/* ════ 조회 시점 국내 화장품·뷰티 행사 자동 발견 ════
   전체 수집 시 네이버 뉴스에서 국내(해외 제외) 화장품·뷰티 박람회/전시회/기획전을 감지해
   ZONE4에 '자동 발견'으로 추가. 뉴스+Gemini 필요(없으면 조용히 생략). 매 수집마다 갱신하되
   사용자가 삭제/편집한 건은 다시 뜨지 않는다(dismissed·중복 필터). */
async function discoverDomesticExpos() {
  const nid = K.naverID(), nsec = K.naverSec(), gkey = K.gemini();
  if (!nid || !nsec || !gkey) return;
  try {
    const queries = ['화장품 박람회 개최', '뷰티 엑스포 일정', '화장품 전시회', '뷰티 페어 개최'];
    const resps = await Promise.all(queries.map(q =>
      fetchNaverAPI(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=15&sort=date`, nid, nsec, 9000)));
    const now = Date.now(), RECENT = 150 * 86400000;
    let corpus = '';
    resps.forEach(j => {
      if (!j || j._error) return;
      (j.items || []).forEach(it => {
        const ts = it.pubDate ? new Date(it.pubDate).getTime() : NaN;
        if (isNaN(ts) || now - ts > RECENT) return;
        corpus += ' ' + `${it.title} ${it.description}`.replace(/<[^>]+>/g, '');
      });
    });
    if (corpus.trim().length < 40) return;
    const known = getAllExpos().map(x => x.name).join(', ');
    const yr = new Date().getFullYear();
    const prompt = `아래 뉴스에서 '국내(대한민국)에서 열리는 화장품·뷰티 관련 박람회/전시회/기획전'만 추출하세요.
[엄수]
- 해외 개최 행사는 절대 제외 — 국내 개최가 명확한 것만.
- 아래 이미 등록된 행사는 제외: ${known}
- 이미 종료돼 다시 열리지 않는 과거 행사는 제외, ${yr}년 이후 예정·진행 행사만.
- 국내 개최·행사 실재가 확실치 않으면 포함하지 마세요(거짓 추가 금지).
[뉴스]
${corpus.slice(0, 5000)}
JSON만 출력: {"expos":[{"name":"정확한 행사명","date":"YYYY.MM.DD 또는 YYYY.MM.DD~MM.DD (불명확하면 빈 문자열)","location":"장소 (불명확하면 빈 문자열)","type":"expo|retail|equipment"}]}`;
    const txt = await geminiGenerate(prompt, { maxTokens: 700, temperature: 0, timeout: 15000 });
    const parsed = JSON.parse(txt);
    const found = (parsed.expos || []).filter(e => e && e.name && e.name.trim().length >= 3).map(e => ({
      name: e.name.trim(),
      type: ['expo', 'retail', 'equipment'].includes(e.type) ? e.type : 'expo',
      org: '', location: (e.location || '').trim(), nextDate: (e.date || '').trim(), confirmed: false,
      focus: '자동 발견(뉴스 기반) — 국내 화장품·뷰티 행사로 감지됨. 공식 홈페이지에서 일정·장소 최종 확인 필요.',
      url: '', srcLabel: '',
    }));
    const taken = new Set(getAllExpos().map(x => normExpoName(x.name)));
    const dismissed = new Set(getExpoAutoDismissed().map(normExpoName));
    const seen = new Set();
    const fresh = found.filter(e => {
      const k = normExpoName(e.name);
      if (!k || taken.has(k) || dismissed.has(k) || seen.has(k)) return false;
      seen.add(k); return true;
    }).slice(0, 12);
    saveExpoAuto(fresh);
  } catch { /* 실패 시 조용히 생략 — 기존 목록 유지 */ }
}

/* ════ ZONE 4 박람회 렌더 (편집형 + 실행 관리) ════ */
function renderZ4() {
  const el = document.getElementById('z4');
  if (!el) return;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const verified = window._expoVerified || {};
  const manual = getExpoManualConfirm();
  const meta = getExpoMeta();
  const fmtAgo = ts => { const days = Math.floor((now - ts) / 86400000); return days <= 0 ? '오늘' : `${days}일 전`; };
  const fmtDate = ts => new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const rows = getAllExpos().map(x => {
    const v = manual[x.name] ? null : verified[x.name];
    const dateStr = (v && v.confirmedDate) ? v.confirmedDate : x.nextDate;
    const parts = String(dateStr || '').split('~')[0].trim().split('.');
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    const daysLeft = isNaN(d) ? null : Math.ceil((d - today) / 86400000);
    const passed = daysLeft !== null && daysLeft < 0;
    return { x, v, dateStr, daysLeft, passed };
  });
  rows.sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
  });

  /* 상단 임박 요약(참고) — 개최 D-30 이내 또는 마감 임박 건수 */
  const soon = rows.filter(r => !r.passed && r.daysLeft !== null && r.daysLeft <= 30).length;

  const toolbar = `<div class="expo-toolbar">
    <button class="ebtn-add" onclick="openExpoForm()">+ 박람회 추가</button>
    <button class="ebtn-tool" onclick="exportExpos()">내보내기</button>
    <button class="ebtn-tool" onclick="document.getElementById('expoImportFile').click()">가져오기</button>
    <input type="file" id="expoImportFile" accept=".json" style="display:none" onchange="importExpos(this.files[0]);this.value=''">
    ${soon ? `<span class="expo-soon">개최 임박(30일 내) ${soon}건</span>` : ''}
  </div>`;

  el.innerHTML = toolbar + rows.map(({ x, v, dateStr, daysLeft, passed }) => {
    const badgeCls = passed ? 'rl-pass' : daysLeft <= 30 ? 'rl-imm' : 'rl-upco';
    const badgeLabel = passed ? '종료' : daysLeft !== null ? `D-${daysLeft}` : '미정';
    const typeTag = (EXPO_TYPES.find(t => t[0] === x.type) || [, 'B2B 박람회'])[1];
    const catLabel = x.type === 'retail' ? '리테일' : x.type === 'equipment' ? '설비' : '뷰티';
    const m = manual[x.name];
    const md = meta[x.name] || {};

    let confirmTag, lastChecked = '';
    if (m) { confirmTag = `<span style="font-size:9px;font-weight:700;color:var(--grn,#15803d)">✓ 담당자 확인</span>`; lastChecked = `담당자 확인: ${fmtDate(m.confirmedAt)} · 재확인 권고: ${fmtDate(m.nextCheckDue)}`; }
    else if (v?.status === 'confirmed') { confirmTag = `<span style="font-size:9px;font-weight:700;color:var(--grn,#15803d)">확정(뉴스)</span>`; lastChecked = `자동 확인: ${fmtAgo(v.checkedAt)}`; }
    else if (v?.status === 'likely') { confirmTag = `<span style="font-size:9px;font-weight:700;color:#92500e">유력</span>`; lastChecked = `관련 기사 발견(날짜 미특정) · 자동 확인: ${fmtAgo(v.checkedAt)}`; }
    else { confirmTag = `<span style="font-size:9px;color:var(--ink3)">추정</span>`; lastChecked = v?.checkedAt ? `자동 확인: ${fmtAgo(v.checkedAt)} (일치 정보 없음)` : (x._custom ? '사용자 추가 행사' : x._auto ? '자동 발견(뉴스 기반) — 공식 홈페이지 확인 필요' : '자동 확인 안 됨(네이버 키 필요)'); }

    const dateConfirmed = !!m || v?.status === 'confirmed' || !!x.confirmed;
    const titleTag = dateConfirmed ? `<span class="exp-confirmed">확정</span>` : `<span class="exp-tentative">예정</span>`;
    const statusBadge = md.status ? `<span class="exp-status ${EXPO_STATUS_CLS[md.status] || ''}">${escHtml(md.status)}</span>` : '';
    const originTag = x._custom ? '<span class="exp-custom-tag">내 추가</span>' : x._auto ? '<span class="exp-auto-tag">자동 발견</span>' : '';
    const nm = escJs(x.name);
    const statusOpts = ['<option value="">상태 없음</option>'].concat(
      EXPO_STATUSES.map(s => `<option value="${s}"${md.status === s ? ' selected' : ''}>${s}</option>`)).join('');

    return `<details class="reg-card expo-card${passed ? ' reg-passed' : ''}">
      <summary class="reg-hd expo-hd">
        <span class="exp-cat">${escHtml(catLabel)}</span>
        <span class="${badgeCls}">${badgeLabel}</span>
        <span class="reg-name" style="margin-top:0">${escHtml(x.name)}</span>
        ${statusBadge}${titleTag}${originTag}
        <span class="exp-chev">▾</span>
      </summary>
      <div class="reg-body">
        <div class="reg-meta">${escHtml(typeTag)} · ${escHtml(x.org || '주최 미상')} · ${escHtml(x.location || '장소 미상')} · ${escHtml(dateStr || '일정 미정')} ${confirmTag}</div>
        <div class="reg-detail">${escHtml(x.focus || '')}</div>
        <div class="reg-meta" style="margin-top:3px;color:var(--ink3)">${escHtml(lastChecked)}</div>

        <div class="expo-mgmt">
          <div class="emg-row">
            <span class="emg-label">상태</span>
            <select class="emg-sel" onchange="setExpoStatus('${nm}',this.value)">${statusOpts}</select>
          </div>
          <textarea class="emg-memo" placeholder="사후 메모 · 발굴한 제조사 · 팔로우업" onchange="saveExpoMemo('${nm}',this.value)">${escHtml(md.memo || '')}</textarea>
        </div>

        <div class="reg-action">
          ${x.url ? `<a href="${escHtml(x.url)}" target="_blank" style="font-size:9px;color:var(--blue2)">${escHtml(x.srcLabel || '공식 홈페이지')} →</a>` : ''}
          ${v?.link ? ` <a href="${escHtml(v.link)}" target="_blank" style="font-size:9px;color:var(--blue2)">근거 기사 →</a>` : ''}
          <button class="exp-confirm-btn" onclick="toggleExpoManualConfirm('${nm}')">${m ? '담당자 확인 취소' : '담당자 확인 처리'}</button>
          <button class="exp-confirm-btn" onclick="openExpoForm('${nm}')">편집</button>
          <button class="exp-confirm-btn exp-del" onclick="deleteExpo('${nm}','${x._custom ? 'custom' : x._auto ? 'auto' : 'seed'}')">삭제</button>
        </div>
      </div>
    </details>`;
  }).join('');
}

/* 박람회 일정 확정 여부 확인(A안 — 3단계 신뢰도) — 공식 API가 없어 네이버 뉴스 검색으로
   구체적 날짜 표현("M월 D일", "M.D~M.D" 등)이 등장하는지 휴리스틱하게 탐지한다.
   날짜까지 특정되면 "확정", 관련 기사는 있으나 날짜가 안 잡히면 "유력", 아무 관련
   기사도 없으면 "추정"으로 3단계 구분 — 어느 경우든 checkedAt(마지막 확인 시각)을
   기록해 화면에 투명하게 노출한다. 네이버 키가 없으면 호출 자체를 생략(추정 유지). */
async function verifyExpoSchedules() {
  const nid = K.naverID(), nsec = K.naverSec();
  if (!nid || !nsec) return {};
  const results = {};
  const checkedAt = Date.now();
  await Promise.all(EXPOS.map(async (x) => {
    const year = x.nextDate.split('.')[0];
    const q = `${x.name} ${year} 일정`;
    const j = await fetchNaverAPI(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=5&sort=date`, nid, nsec, 8000);
    if (!j || j._error) return;
    const items = j.items || [];
    for (const item of items) {
      const text = (item.title + ' ' + item.description).replace(/<[^>]+>/g, '');
      const range = text.match(/(\d{1,2})\.(\d{1,2})\s*[~-]\s*(\d{1,2})\.(\d{1,2})/);
      const single = text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
      let confirmedDate = null;
      if (range) confirmedDate = `${year}.${range[1].padStart(2,'0')}.${range[2].padStart(2,'0')} ~ ${year}.${range[3].padStart(2,'0')}.${range[4].padStart(2,'0')}`;
      else if (single) confirmedDate = `${year}.${single[1].padStart(2,'0')}.${single[2].padStart(2,'0')}`;
      if (confirmedDate) { results[x.name] = { status: 'confirmed', confirmedDate, link: item.link, checkedAt }; break; }
    }
    if (!results[x.name]) {
      results[x.name] = items.length
        ? { status: 'likely', confirmedDate: null, link: items[0].link, checkedAt }
        : { status: 'estimated', confirmedDate: null, link: null, checkedAt };
    }
  }));
  return results;
}

/* ════ ZONE 0 신호 렌더 ════ */
function renderZ0() {
  const z = document.getElementById('z0');
  const defs = [
    {key:'climate', cls:'sig-cl', name:'기후·환경',  auto:true,  src:'기상청+에어코리아+UV지수'},
    {key:'society', cls:'sig-so', name:'사회·인구',  auto:true,  src:'KOSIS(정적참조)+ECOS(CCSI·실업률·소매판매 실시간)'},
    {key:'economy', cls:'sig-ec', name:'경제·리테일', auto:true,  src:'ECOS+관세청 화장품수출'},
    {key:'culture', cls:'sig-cu', name:'문화·팝트렌드',auto:true, src:'네이버DataLab+뉴스+뷰티RSS'},
  ];
  z.innerHTML = defs.map(d => {
    const data = SIG_DATA[d.key];
    const score = data?.score ?? 0;
    const colKey = d.cls.split('-')[1];
    const dots = Array.from({length:5}, (_, i) =>
      `<div class="dot5 ${i < Math.round(score) ? 'on ' + colKey : 'off'}"></div>`
    ).join('');
    const autoTag = data
      ? '<span class="sig-auto auto-ok">자동</span>'
      : '<span class="sig-auto auto-warn">수집 대기</span>';
    const content = data
      ? `<div class="sig-dots">${dots}</div>
         <div class="sig-interp">${escHtml(data.interpret)}</div>
         <div class="sig-chips">${(data.chips || []).map(c => `<span class="schip">${escHtml(c)}</span>`).join('')}</div>`
      : `<div class="sig-loading">수집 중...</div>`;
    return `<div class="sig ${d.cls}" onclick="openSigDetail('${d.key}')" title="클릭하면 분석 근거 자료를 확인할 수 있습니다">
      <div class="sig-top">
        <div>
          <div class="sig-name"><span class="sig-ico ${colKey}"></span>${d.name}</div>
          <div class="sig-score">${data ? (data.score ?? 0).toFixed(1) : '—'}<span class="sig-max">/5</span></div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          ${autoTag}
          <button class="btn-refresh-sig" onclick="event.stopPropagation();refreshSignal('${d.key}', this)" title="이 신호만 재수집">↻</button>
        </div>
      </div>
      ${content}
      <div class="sig-src">${escHtml(d.src)} <span class="sig-detail-hint">· 클릭: 분석 근거 자료 →</span></div>
    </div>`;
  }).join('');
}

/* ════ ZONE 0 카드 클릭 → 분석 근거 자료 모달 ════ */
const SIG_SOURCE_LINKS = {
  climate: [
    {label:'기상청 공공데이터(data.go.kr)', url:'https://www.data.go.kr'},
    {label:'Open-Meteo(16일예보·평년대비)', url:'https://open-meteo.com'},
    {label:'에어코리아(대기질)', url:'https://www.airkorea.or.kr'},
  ],
  society: [
    {label:'KOSIS 국가통계포털', url:'https://kosis.kr'},
    {label:'한국은행 ECOS(소비자심리지수)', url:'https://ecos.bok.or.kr'},
  ],
  economy: [
    {label:'한국은행 ECOS(물가·CPI)', url:'https://ecos.bok.or.kr'},
    {label:'관세청 수출입무역통계(공공데이터포털)', url:'https://www.data.go.kr'},
  ],
  culture: [
    {label:'네이버 데이터랩(검색·쇼핑인사이트)', url:'https://datalab.naver.com'},
    {label:'네이버 뉴스 검색', url:'https://search.naver.com/search.naver?where=news'},
    {label:'뷰티 전문지 RSS(코스인코리아·장업신문·코스모닝·뷰티누리)', url:'https://www.cosinkorea.com'},
  ],
};
const SIG_NAME_KO = {climate:'기후·환경', society:'사회·인구', economy:'경제·리테일', culture:'문화·팝트렌드'};
function sourceLinksHtml(key) {
  const links = SIG_SOURCE_LINKS[key] || [];
  if (!links.length) return '';
  return `<div class="gm-block">
    <div class="gm-block-title">데이터 출처</div>
    <ul class="gm-list">${links.map(l => `<li><a class="gm-link" href="${escHtml(l.url)}" target="_blank">${escHtml(l.label)} →</a></li>`).join('')}</ul>
  </div>`;
}
function chipsHtml(chips) {
  if (!chips || !chips.length) return '<div class="gm-p">수집된 근거 칩이 없습니다.</div>';
  return `<div class="gm-block">
    <div class="gm-block-title">수집된 원시 지표(칩)</div>
    <ul class="gm-list">${chips.map(c => `<li>${escHtml(c)}</li>`).join('')}</ul>
  </div>`;
}
function trendListHtml(title, list, unit) {
  if (!list || !list.length) return '';
  return `<div class="gm-block">
    <div class="gm-block-title">${escHtml(title)}</div>
    <ul class="gm-list">${list.slice(0, 6).map(t => {
      const v = unit === 'count' ? `${t.count}건` : `${t.delta >= 0 ? '+' : ''}${t.delta}%`;
      return `<li>${escHtml(t.name)} — <b>${v}</b></li>`;
    }).join('')}</ul>
  </div>`;
}
function articleListHtml(title, list) {
  if (!list || !list.length) return '';
  return `<div class="gm-block">
    <div class="gm-block-title">${escHtml(title)}</div>
    <ul class="gm-list">${list.slice(0, 10).map(a =>
      a.link
        ? `<li><a class="gm-link" href="${escHtml(a.link)}" target="_blank">${escHtml(a.source ? '[' + a.source + '] ' : '')}${escHtml(a.title)} →</a></li>`
        : `<li>${escHtml(a.source ? '[' + a.source + '] ' : '')}${escHtml(a.title)}</li>`
    ).join('')}</ul>
  </div>`;
}
function buildSigDetailHtml(key) {
  const data = SIG_DATA[key];
  if (!data) {
    return `<div class="gm-p">아직 수집된 데이터가 없습니다. [전체 수집 실행] 또는 ZONE 0 카드의 ↻ 버튼으로 먼저 수집하세요.</div>`;
  }
  let body = `<div class="gm-block">
    <div class="gm-block-title">종합 해석</div>
    <div class="gm-p">${escHtml(data.interpret || '')}</div>
    ${data._sample ? '<div class="gm-note">⚠ 실데이터 수집 실패 또는 키 미설정 — 샘플/추정값이 포함되어 있습니다.</div>' : ''}
  </div>`;
  body += chipsHtml(data.chips);

  if (key === 'climate') {
    if (window._climateTrend) {
      const ct = window._climateTrend;
      const parts = [];
      if (ct.deviation !== null && ct.deviation !== undefined) parts.push(`평년(작년 동기간 ±3일) 대비 오늘 최고기온 편차: <b>${ct.deviation >= 0 ? '+' : ''}${ct.deviation}℃</b>`);
      if (ct.trend16) parts.push(`16일 단기예보(참고용, 장기예측 아님) 전반(1~8일) 평균 ${ct.trend16.week1}℃ → 후반(9~16일) 평균 ${ct.trend16.week2}℃ (변화 ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃)`);
      if (window._seasonalOutlook && window._seasonalOutlook.length) {
        parts.push('평년 기준 계절 전망(1·3·6개월 후, 과거 3년 동일 절기 평균): ' + window._seasonalOutlook.map(o => `${o.monthsAhead}개월 후(${o.targetMonth}월) 평균최고 ${o.avgMaxTemp}℃`).join(' · '));
      }
      if (parts.length) body += `<div class="gm-block"><div class="gm-block-title">기온 추세 근거</div><ul class="gm-list">${parts.map(p=>`<li>${p}</li>`).join('')}</ul></div>`;
    }
  }
  if (key === 'economy') {
    body += trendListHtml('관세청 수출 모멘텀 (HS코드별 최근 3개월 vs 직전 3개월)', window._exportTrends);
    if (window._exportErr) body += `<div class="gm-note">수출 모멘텀 미수집: ${escHtml(EXPORT_ERR_MSG[window._exportErr] || window._exportErr)}</div>`;
  }
  if (key === 'society') {
    /* 투명성 고지 — "1인가구 36.1%/그루밍 확산"은 매 수집마다 자동 호출되는 항목이 아니라
       통계청 KOSIS 정기 통계(인구주택총조사)를 코드에 정적 반영한 참조값(연 1회 수준 갱신)이다.
       실시간 자동 수집은 ECOS 100대 통계지표(소비자심리지수·실업률·소매판매·가계신용)에서
       처리한다 — economy 신호와 같은 API 호출을 1회만 공유해 추가 호출 비용 없이 확장.
       KOSIS 자체 API 연동(혼인율·고령화율 등)은 별도 인증키가 필요해 v1에는 포함하지 않았다. */
    body += `<div class="gm-block">
      <div class="gm-block-title">자동 수집 vs 정적 참조 구분</div>
      <ul class="gm-list">
        <li><b>실시간 자동 수집</b>: 한국은행 ECOS 100대 통계지표 — 소비자심리지수(CCSI)·실업률·소매판매액지수·가계신용(확인된 항목만 반영, 매 수집 시 API 호출)</li>
        <li><b>정적 참조값</b>: "1인가구 36.1%(역대 최대)"·"전 연령·性 그루밍 수요 확산" — 통계청 2024 인구주택총조사를 코드에 반영한 값(연 단위 갱신 필요). KOSIS Open API 실시간 연동은 별도 인증키 발급이 필요해 v1에는 포함하지 않았다.</li>
      </ul>
    </div>`;
  }
  if (key === 'culture') {
    body += trendListHtml('네이버 검색 모멘텀(DataLab)', window._dlTrends);
    body += trendListHtml('네이버 구매(쇼핑클릭) 모멘텀', window._salesTrends);
    body += trendListHtml('뉴스·RSS 최다 언급 키워드', window._newsTrends, 'count');
    body += articleListHtml('네이버 뉴스 분석 근거 기사', window._newsArticles);
    body += articleListHtml('뷰티 전문지 RSS 분석 근거 기사', window._rssArticles);
  }
  body += sourceLinksHtml(key);
  return body;
}
function openSigDetail(key) {
  document.getElementById('sigModalTitle').textContent = `${SIG_NAME_KO[key] || key} — 분석 근거 자료`;
  document.getElementById('sigModalBody').innerHTML = buildSigDetailHtml(key);
  document.getElementById('sigOverlay').classList.add('open');
}

/* ════ 예측 유형별 "신뢰도 분해 + 근거 스냅샷" 모달 ════
   왜 이 유형이 뽑혔는지를 ▲4대 신호 기여도(신뢰도 분해) ▲카테고리별 실제 수집 근거
   ▲예측 전반에 함께 반영된 공급·규제·해외 선행신호로 사용자가 이해할 수 있게 보여준다. */
const PRED_CAT_META = [
  { key:'climate', name:'기후·환경',   cls:'c-cl', why:'계절·기온·자외선·대기질이 이 유형 수요를 끌어올리는 정도' },
  { key:'society', name:'사회·인구',   cls:'c-so', why:'1인가구·그루밍 확산·소비심리 등 인구·생활 변화' },
  { key:'economy', name:'경제·리테일', cls:'c-ec', why:'물가·소비여력·수출 실적 등 구매력·실판매 흐름' },
  { key:'culture', name:'문화·팝트렌드', cls:'c-cu', why:'검색·구매클릭·뉴스·뷰티미디어 트렌드' },
];
function buildPredEvidenceHtml(idx) {
  const p = PREDICTIONS[idx];
  if (!p) return '<div class="gm-p">예측 데이터가 없습니다.</div>';
  const sig = p.signals || {};
  const conf = p.confidence || 0;
  /* ── ① 신뢰도 분해 ── */
  let body = `<div class="gm-block">
    <div class="gm-block-title">예측 신뢰도 분해 — 왜 신뢰도 ${conf}%인가</div>
    <div class="gm-p">이 유형 <b>"${escHtml(p.type)}"</b>은 아래 4대 신호의 가중 합으로 도출됐습니다. 막대가 길수록 그 신호가 이 예측을 더 강하게 뒷받침한다는 뜻입니다.</div>
    <div class="evi-bars">`;
  const ranked = PRED_CAT_META.map(c => ({ ...c, w: Math.max(0, Math.min(1, +sig[c.key] || 0)) }))
    .sort((a, b) => b.w - a.w);
  ranked.forEach(c => {
    const pct = Math.round(c.w * 100);
    const contrib = Math.round(c.w * conf);
    body += `<div class="evi-bar-row">
      <span class="evi-bar-label">${c.name}</span>
      <span class="evi-bar-track"><span class="evi-bar-fill ${c.cls}" style="width:${pct}%"></span></span>
      <span class="evi-bar-val">${pct}% · 기여 ~${contrib}p</span>
    </div>`;
  });
  body += `</div>
    <div class="gm-note2" style="margin-top:6px">기여 점수(p)는 "신호 가중치 × 신뢰도"로 환산한 근사치입니다. 합이 100%가 안 될 수 있습니다(공급·규제·해외 선행신호가 별도로 반영되기 때문 — 아래 참조).</div>
  </div>`;
  /* ── ② 카테고리별 근거 스냅샷 (기여도 높은 순) ── */
  ranked.forEach(c => {
    if (c.w <= 0) return;
    const d = SIG_DATA[c.key];
    body += `<div class="gm-block">
      <div class="gm-block-title">${c.name} 근거 — 이 예측 기여 ${Math.round(c.w * 100)}%</div>
      <div class="gm-note2">${c.why}</div>
      <div class="gm-p">${d ? escHtml(d.interpret || '해석 없음') : '이 신호는 수집되지 않았습니다.'}${d && d._sample ? ' <span style="color:var(--amber,#d97706)">(샘플/추정값 포함)</span>' : ''}</div>`;
    if (d && d.chips) body += chipsHtml(d.chips);
    if (c.key === 'economy') body += trendListHtml('관세청 수출 모멘텀(HS코드별 최근 3개월 vs 직전 3개월)', window._exportTrends);
    if (c.key === 'culture') {
      body += trendListHtml('네이버 검색 모멘텀(DataLab)', window._dlTrends);
      body += trendListHtml('네이버 구매(쇼핑클릭) 모멘텀', window._salesTrends);
      body += trendListHtml('뉴스·RSS 최다 언급 키워드', window._newsTrends, 'count');
    }
    if (c.key === 'climate' && window._climateTrend) {
      const ct = window._climateTrend;
      const parts = [];
      if (ct.deviation !== null && ct.deviation !== undefined) parts.push(`평년(작년 동기간 ±3일) 대비 오늘 최고기온 <b>${ct.deviation >= 0 ? '+' : ''}${ct.deviation}℃</b>`);
      if (window._seasonalOutlook && window._seasonalOutlook.length) parts.push('계절 전망: ' + window._seasonalOutlook.map(o => `${o.monthsAhead}개월 후 ${o.avgMaxTemp}℃`).join(' · '));
      if (parts.length) body += `<ul class="gm-list">${parts.map(x => `<li>${x}</li>`).join('')}</ul>`;
    }
    body += sourceLinksHtml(c.key);
    body += `</div>`;
  });
  /* ── ③ 예측 전반에 함께 반영된 공급·규제·해외 선행신호 (개별 카테고리 밖) ── */
  let lead = '';
  /* 제형 레이더 — 이 예측이 어느 제형에 속하고 그 제형 점수가 무엇인지 */
  {
    const fm = formulationOfPred(p);
    if (fm && fm.score !== undefined && fm.score !== null) {
      lead += `<div class="gm-block"><div class="gm-block-title">제형 트렌드 점수 — ${escHtml(fm.name)} (${escHtml(fm.en)})</div>
        <div class="gm-p"><b>${fm.score}점 · ${escHtml(fm.grade)}</b> (신뢰도 ${fm.coverage}%) — 필요 설비: ${escHtml(fm.capa.join(' · '))}</div>
        <ul class="gm-list">${Object.keys(FORM_WEIGHTS).map(k => {
          const c = fm.comp && fm.comp[k];
          return `<li>${FORM_WLABEL[k]} (가중 ${Math.round(FORM_WEIGHTS[k]*100)}%) — ${c ? `<b>${c.score}점</b> · ${escHtml(c.srcs.join('·'))}` : '<span style="color:var(--ink3)">데이터 없음(가중치 제외)</span>'}</li>`;
        }).join('')}</ul></div>`;
    }
  }
  lead += trendListHtml('공급 규모 — 식약처 등록 화장품 제형별 품목 수', (window._supplyTrends || []).map(t => ({ name: t.name + (t.recent ? `(신규 ${t.recent})` : ''), count: t.count })), 'count');
  lead += trendListHtml('해외 박람회 선행 트렌드(최근 60일 보도 키워드)', (window._expoTrends || []).map(t => ({ name: t.name, count: t.count })), 'count');
  lead += trendListHtml('YouTube 콘텐츠 모멘텀(최근 30일 vs 직전 30일)', window._ytTrends);
  lead += trendListHtml('글로벌 검색 모멘텀(Google Trends·미국)', window._gtrends);
  lead += trendListHtml('해외 K뷰티 커뮤니티 언급(Reddit·최근 1개월)', (window._reddit || []).map(t => ({ name: t.name, count: t.count })), 'count');
  /* 리테일 실측 앵커 — 실구매·실사용 공식 리포트(연간 정적 참조) */
  if (RETAIL_ANCHORS.length) {
    lead += `<div class="gm-block"><div class="gm-block-title">리테일 실측 앵커 (실구매·실사용 공식 리포트 — 연간)</div><ul class="gm-list">${
      RETAIL_ANCHORS.map(a => `<li><b>${escHtml(a.src)}</b> (${escHtml(a.basis)}): ${escHtml(a.themes.join(' · '))} — <a class="gm-link" href="${escHtml(a.url)}" target="_blank">${escHtml(a.srcLabel)} →</a></li>`).join('')
    }</ul></div>`;
  }
  /* 규제 D-day */
  const nowD = new Date();
  const regs = REGS.map(r => {
    const m = String(r.date).match(/(\d{4})[.\-](\d{1,2})(?:[.\-](\d{1,2}))?/);
    const dd = m ? new Date(+m[1], +m[2] - 1, +(m[3] || 1)) : null;
    return { r, dd, months: dd ? Math.round((dd - nowD) / (30 * 86400000)) : null };
  }).filter(x => x.months !== null && x.months >= -3 && x.months <= 18).sort((a, b) => a.dd - b.dd);
  if (regs.length) {
    lead += `<div class="gm-block"><div class="gm-block-title">규제 캘린더(확정 선행신호)</div><ul class="gm-list">${
      regs.map(({ r, months }) => `<li>${escHtml(r.date)} (${months <= 0 ? '시행중/임박' : 'D-' + months + '개월'}) [${escHtml(r.tag)}] ${escHtml(r.title)}</li>`).join('')
    }</ul></div>`;
  }
  body += `<div class="gm-block">
    <div class="gm-block-title">이번 예측 전반에 함께 반영된 선행신호</div>
    <div class="gm-note2">개별 카테고리 막대와 별개로, 모든 예측 유형에 공통 반영된 "공급·규제·해외" 선행신호입니다.</div>
    ${lead || '<div class="gm-p">수집된 선행신호가 없습니다(키 미설정 시 생략됨).</div>'}
  </div>`;
  body += `<div class="gm-note">📸 스냅샷 기준: ${new Date().toLocaleString('ko-KR')} 수집 데이터 · 본 근거는 예측 생성 시점의 신호를 반영합니다.</div>`;
  return body;
}
function openPredEvidence(idx) {
  const p = PREDICTIONS[idx];
  document.getElementById('sigModalTitle').textContent = `${p ? p.rank + '위 ' + p.type : '예측'} — 선정 근거 & 신뢰도 분해`;
  document.getElementById('sigModalBody').innerHTML = buildPredEvidenceHtml(idx);
  document.getElementById('sigOverlay').classList.add('open');
}

async function refreshSignal(key, btn) {
  btn = btn || (typeof event !== 'undefined' ? event.target : null);
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
  SIG_DATA[key] = null;
  renderZ0();
  const fnMap = { climate: collectClimate, society: collectSociety, economy: collectEconomy, culture: collectCulture };
  if (fnMap[key]) await fnMap[key]();
  renderZ0();
  updateStatusSummary();
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  showToast(`${key} 신호 재수집 완료`);
}

/* 기상청 초단기실황 base_date/base_time 계산 (발표까지 ~40분 지연 고려, 1시간 전 사용) */
/* 기상청·환경 API는 모두 한국시간(KST) 기준 파라미터를 요구하는데,
   브라우저의 new Date()는 사용자 로컬 타임존을 따른다 — 해외 접속 시 base_date/time이
   틀어져 조회 실패하는 버그가 있었음. KST로 고정 변환해 시간대 무관하게 정확히 동작하도록 함. */
function nowKST() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}
function getWxBase() {
  const now = nowKST();
  let h = now.getHours() - 1;
  const base = new Date(now);
  if (h < 0) { h = 23; base.setDate(base.getDate() - 1); }
  return {
    date: `${base.getFullYear()}${String(base.getMonth()+1).padStart(2,'0')}${String(base.getDate()).padStart(2,'0')}`,
    time: String(h).padStart(2,'0') + '00'
  };
}
/* 기상청 중기예보 발표시각: 06시·18시, 접근 가능 시각 +1h 고려 */
function getMidFcstTime() {
  const now = nowKST();
  const h = now.getHours();
  const dt = new Date(now);
  let hhmm;
  if (h >= 19) { hhmm = '1800'; }
  else if (h >= 7) { hhmm = '0600'; }
  else { dt.setDate(dt.getDate() - 1); hhmm = '1800'; }
  const ds = `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}`;
  return ds + hhmm; /* YYYYMMDDHHMM 12자리 (hhmm이 이미 4자리) */
}

/* ════ 수집 함수들 ════ */

/* 네이버 API 전용 프록시 — X-Naver-* 헤더 포워딩 필요
   사내망·방화벽 환경에 따라 차단 프록시가 다르므로 4종 순차 시도 */
async function fetchNaverAPI(targetUrl, nid, nsec, timeout = 11000, opts = {}) {
  /* 백엔드 모드 — 서버가 네이버 헤더 키를 환경변수에서 주입해 대신 호출(프록시 4종 불필요) */
  if (BK.on() && (nid === '__BK__' || nsec === '__BK__')) {
    try {
      const r = await bkFetch(targetUrl, opts, timeout);
      if (!r.ok) return { _error: r.status, _body: await r.text().catch(() => '') };
      return await r.json();
    } catch { return null; }
  }
  const hdrs = { 'X-Naver-Client-Id': nid, 'X-Naver-Client-Secret': nsec };
  if (opts.body) hdrs['Content-Type'] = opts.contentType || 'application/json';
  /* referrer 명시 — 프록시가 Referer 헤더를 네이버로 전달해 도메인 검증 통과
     corsproxy.io가 사내망 차단일 때 다른 프록시에서도 Referer 전달을 시도 */
  const fetchOpts = {
    method: opts.method || 'GET',
    headers: hdrs,
    ...(opts.body ? { body: opts.body } : {}),
    referrer: (typeof window !== 'undefined') ? window.location.href : '',
    referrerPolicy: 'origin',
  };
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://proxy.cors.sh/${targetUrl}`,
    `https://corsproxy.org/?${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
  ];
  let lastErr = null;
  for (const proxyUrl of proxies) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), Math.min(timeout, 9000));
      const r = await fetch(proxyUrl, { ...fetchOpts, signal: ctrl.signal });
      clearTimeout(tid);
      if (!r.ok) {
        if (r.status === 401) {
          /* 키 자체가 잘못됨 — 다른 프록시도 동일하므로 즉시 반환 */
          const body = await r.text().catch(() => '');
          return { _error: 401, _body: body };
        }
        if (r.status === 403) {
          /* Referer 미전달로 네이버가 거부 가능 — 다른 프록시로 계속 시도 */
          const body = await r.text().catch(() => '');
          lastErr = { _error: 403, _body: body };
          continue;
        }
        continue;
      }
      const j = await r.json();
      return j;
    } catch {}
  }
  return lastErr; /* 모든 프록시 403 → lastErr 반환, 완전 실패 → null */
}

async function fetchProxy(url, timeout = 9000) {
  /* HTML 에러 페이지 / 프록시 자체 오류 텍스트 걸러냄 */
  const BAD = ['<!doctype', '<html', 'unexpected error', 'something went wrong',
               'bad gateway', '502 bad', '503 service', 'rate limit exceeded', 'too many requests'];
  /* 프록시가 "대상 응답"이 아니라 "프록시 자신의 사용법 오류"를 돌려주는 경우 —
     이걸 정상 응답으로 착각해 호출자에 넘기면 안 됨(codetabs 'Bad request, valid format is …' 등) */
  const PROXY_ERR = ['valid format is', 'codetabs.com/v1', 'please read our docs', 'allorigins', 'cors-anywhere'];
  const isGoodText = (t) => {
    if (!t || t.length < 6) return false;
    const tl = t.toLowerCase().trimStart();
    if (BAD.some(p => tl.startsWith(p) || (p.includes(' ') && tl.includes(p)))) return false;
    /* 짧은 JSON 에러 envelope만 걸러냄(정상 대용량 응답에 우연히 포함되는 오탐 방지) */
    if (t.length < 400 && PROXY_ERR.some(p => tl.includes(p))) return false;
    return true;
  };

  /* -1. 백엔드 모드 — URL 안의 __BK__ 센티널을 서버가 실키로 치환해 대신 호출 */
  if (BK.on()) {
    try {
      const r = await bkFetch(url, {}, timeout);
      const t = await r.text();
      if (isGoodText(t)) return t;
    } catch {}
  }

  /* 0. 직접 요청 — CORS 허용 API(에어코리아 등)는 프록시 불필요 */
  try {
    if (url.includes('__BK__')) throw new Error('backend-only');   /* 센티널 URL은 직접 호출 무의미 */
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), Math.min(timeout, 7000));
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    const t = await r.text();
    if (isGoodText(t)) return t;
  } catch {}

  /* 1. allorigins /get — http_code 포함 구조화 JSON
     code=0 → 연결 실패, code>0 → 실제 응답 (5xx 포함 통과, isGoodText로 HTML 걸러냄) */
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeout);
    const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: ctrl.signal });
    clearTimeout(tid);
    if (r.ok) {
      const j = await r.json();
      const code = j?.status?.http_code || 0;
      const t = j?.contents || '';
      if (code > 0 && isGoodText(t)) return t;   /* 5xx도 통과 — JSON 오류메시지 보존 */
    }
  } catch {}

  /* 2. allorigins /raw — r.ok 체크 제거: data.go.kr 5xx 응답 body도 읽기 */
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeout);
    const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, { signal: ctrl.signal });
    clearTimeout(tid);
    const t = await r.text();
    if (isGoodText(t)) return t;
  } catch {}

  /* 3. thingproxy — r.ok 체크 제거: 5xx body도 읽기 */
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeout);
    const r = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`, { signal: ctrl.signal });
    clearTimeout(tid);
    const t = await r.text();
    if (isGoodText(t)) return t;
  } catch {}

  /* 4. corsproxy.io */
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeout);
    const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { signal: ctrl.signal });
    clearTimeout(tid);
    const t = await r.text();
    if (isGoodText(t)) return t;
  } catch {}

  /* 5. codetabs — 최후 백업 */
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), Math.min(timeout, 8000));
    const r = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`, { signal: ctrl.signal });
    clearTimeout(tid);
    const t = await r.text();
    if (isGoodText(t)) return t;
  } catch {}

  return null;
}

/* Open-Meteo 호출 — 직접 fetch(CORS 지원) 우선, 실패 시 공용 프록시로 폴백.
   일부 사내망·정부망에서 api.open-meteo.com 직접 접속이 막히면 폴백조차 '연결 실패'로
   떴는데, 프록시 경유 한 단계를 더 둬서 가용성을 높인다. JSON 객체를 반환(실패 시 null). */
async function fetchOpenMeteo(url, timeout = 8000) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeout);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (r.ok) return await r.json();
  } catch {}
  /* 직접 실패 → 프록시 폴백 */
  try {
    const txt = await fetchProxy(url, timeout);
    if (txt) return JSON.parse(txt);
  } catch {}
  return null;
}

async function collectClimate() {
  const key = K.public();
  setSdot('sd-climate', 'warn');
  setSdot('sd-air', key ? 'warn' : 'off');
  const today = nowKST();   /* KST 고정 — base_date/UV조회시각/중기예보 발표시각 정확도 보장 */
  const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  const wxBase = getWxBase();

  /* ── 기상 (기온·습도·UV) ────────────────────────────────────────
     1순위: 기상청 초단기실황 (data.go.kr — 공공키 필요)
     2순위: Open-Meteo (무료·CORS 지원·키 불필요 → 키 없거나 기상청 실패 시 자동 사용) */
  let temp = '—', humid = '—', uv = '—', midTempMax = '—', wxSrc = '기상청';
  if (key) {
    const wxUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService2.0/getUltraSrtNcst?serviceKey=${encodeURIComponent(key)}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${wxBase.date}&base_time=${wxBase.time}&nx=60&ny=127`;
    const wxText = await fetchProxy(wxUrl, 10000);
    if (wxText) {
      try {
        const j = JSON.parse(wxText);
        if (j?.response?.header?.resultCode === '00') {
          const items = j.response.body.items.item || [];
          const t = items.find(i => i.category === 'T1H');
          if (t) temp = t.obsrValue + '℃';
          const h = items.find(i => i.category === 'REH');
          if (h) humid = h.obsrValue + '%';
        }
      } catch {}
    }
    /* UV (기상청 생활기상지수 — 역시 /1360000/ 이므로 실패 가능) */
    if (temp !== '—') {
      const uvHH = String(today.getHours()).padStart(2,'0');
      const uvUrl = `https://apis.data.go.kr/1360000/LivingIndexService/getUVIdx?serviceKey=${encodeURIComponent(key)}&areaNo=1100000000&time=${dateStr}${uvHH}`;
      const uvText = await fetchProxy(uvUrl, 6000);
      if (uvText) {
        try {
          const j = JSON.parse(uvText);
          const items = j?.response?.body?.items?.item || [];
          if (items.length) uv = items[0].today || items[0].h0 || '—';
        } catch {}
      }
    }
    /* 기상청 중기예보 (3일 후 최고기온) */
    if (temp !== '—') {
      const midUrl = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa?serviceKey=${encodeURIComponent(key)}&numOfRows=1&pageNo=1&dataType=JSON&regId=11B10101&tmFc=${getMidFcstTime()}`;
      const midText = await fetchProxy(midUrl, 7000);
      if (midText) {
        try {
          const j = JSON.parse(midText);
          const items = j?.response?.body?.items?.item || [];
          if (items.length) midTempMax = items[0].taMax3 ?? items[0].taMax4 ?? '—';
        } catch {}
      }
    }
  }

  /* ── Open-Meteo 16일 예보 (항상 수집) ──────────────────────────
     - 기상청 실패/키 없을 때 현재기온·습도·UV 폴백 데이터 제공
     - 16일 예보 전반부(1~8일) vs 후반부(9~16일) 평균 최고기온으로 단기 추세(trend16) 산출 */
  let trend16 = null, omTodayMax = null;
  {
    const omUrl = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780' +
      '&current=temperature_2m,relative_humidity_2m,uv_index,weather_code' +
      '&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=16';
    const j = await fetchOpenMeteo(omUrl, 8000);
    if (j) {
      const maxArr = j?.daily?.temperature_2m_max || [];
      if (maxArr[0] !== undefined) omTodayMax = maxArr[0];
      if (maxArr.length >= 16) {
        const avg = arr => arr.reduce((s, x) => s + x, 0) / arr.length;
        const w1 = avg(maxArr.slice(0, 8)), w2 = avg(maxArr.slice(8, 16));
        trend16 = { week1: +w1.toFixed(1), week2: +w2.toFixed(1), delta: +(w2 - w1).toFixed(1) };
      }
      if (temp === '—') {
        wxSrc = 'Open-Meteo';
        const c = j?.current || {};
        if (c.temperature_2m !== undefined) temp   = c.temperature_2m + '℃';
        if (c.relative_humidity_2m !== undefined) humid = c.relative_humidity_2m + '%';
        if (c.uv_index !== undefined) uv = c.uv_index;
        if (maxArr[3] !== undefined) midTempMax = maxArr[3];
      }
    }
  }
  setSdot('sd-climate', temp !== '—' ? 'ok' : 'warn');

  /* ── Open-Meteo Archive: 평년(작년 동기간 ±3일) 대비 오늘 최고기온 편차 ── */
  let deviation = null;
  if (omTodayMax !== null) {
    try {
      const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const start = new Date(today); start.setFullYear(start.getFullYear() - 1); start.setDate(start.getDate() - 3);
      const end = new Date(today); end.setFullYear(end.getFullYear() - 1); end.setDate(end.getDate() + 3);
      const histUrl = 'https://archive-api.open-meteo.com/v1/archive?latitude=37.5665&longitude=126.9780' +
        `&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=temperature_2m_max&timezone=Asia%2FSeoul`;
      const j = await fetchOpenMeteo(histUrl, 8000);
      if (j) {
        const arr = (j?.daily?.temperature_2m_max || []).filter(v => v !== null && v !== undefined);
        if (arr.length) {
          const normalAvg = arr.reduce((s, x) => s + x, 0) / arr.length;
          deviation = +(omTodayMax - normalAvg).toFixed(1);
        }
      }
    } catch {}
  }
  window._climateTrend = (trend16 || deviation !== null) ? { trend16, deviation } : null;

  /* ── 평년 기준 계절 전망(1·3·6개월 후) — 16일 예보가 닿지 못하는 구간을 보강 ── */
  const seasonalOutlook = await fetchSeasonalOutlook(today);
  window._seasonalOutlook = seasonalOutlook;

  /* ── 에어코리아 (PM10·PM25) ── CORS 허용, 직접 fetch 성공 (공공키 필요) */
  let pm10 = '—', pm25 = '—';
  if (key) {
    const aqUrl = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${encodeURIComponent(key)}&returnType=json&numOfRows=5&pageNo=1&sidoName=${encodeURIComponent('서울')}&ver=1.0`;
    const aqText = await fetchProxy(aqUrl);
    if (aqText) {
      try {
        const j = JSON.parse(aqText);
        const items = j?.response?.body?.items || [];
        if (items.length) {
          pm10 = items[0].pm10Value + '㎍/㎥';
          if (items[0].pm25Value && items[0].pm25Value !== '-') pm25 = items[0].pm25Value + '㎍/㎥';
        }
      } catch {}
    }
    setSdot('sd-air', pm10 !== '—' ? 'ok' : 'warn');
  }

  const score = computeClimateScore(temp, pm10, deviation, trend16);
  SIG_DATA.climate = {
    score,
    interpret: temp !== '—'
      ? buildClimateInterp(temp, pm10, deviation, trend16)
      : '기상 데이터 수집 실패 — 계절 기본값으로 분석',
    chips: [
      `기온 ${temp}`,
      pm10 !== '—' ? `PM10 ${pm10}` : (key ? 'PM10 —' : '에어코리아: 키 필요'),
      pm25 !== '—' ? `PM2.5 ${pm25}` : `습도 ${humid}`,
      uv !== '—' ? `UV ${uv}` : (midTempMax !== '—' ? `3일후최고 ${midTempMax}℃` : ''),
      deviation !== null ? `평년대비 ${deviation >= 0 ? '+' : ''}${deviation}℃` : '',
      trend16 ? `16일추세 ${trend16.delta >= 0 ? '+' : ''}${trend16.delta}℃` : '',
      seasonalOutlook.length ? `평년전망 ${seasonalOutlook.map(o => `${o.monthsAhead}m ${o.avgMaxTemp}℃`).join('/')}` : ''
    ].filter(Boolean),
    _sample: temp === '—'
  };
}

/* ── 평년 기준 계절 전망(1·3·6개월 후) — Open-Meteo Archive(무료·키 불필요)로 과거 3년치
   동일 절기(±3일) 평균 최고기온을 조회한다. "16일 예보"가 닿지 못하는 1~6개월 구간에서
   실제 미래 기온을 예보하는 게 아니라 평년치 기준 계절 전환 시점을 가늠하는 보조 신호 —
   현재 평년대비 편차(deviation)·16일 단기추세(trend16)와 결합해 해석한다. */
async function fetchSeasonalOutlook(baseDate) {
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const horizons = [1, 3, 6];
  const outlook = [];
  for (const h of horizons) {
    const target = new Date(baseDate); target.setMonth(target.getMonth() + h);
    const yearSamples = await Promise.all([1, 2, 3].map(async y => {
      const start = new Date(target); start.setFullYear(start.getFullYear() - y); start.setDate(start.getDate() - 3);
      const end = new Date(target); end.setFullYear(end.getFullYear() - y); end.setDate(end.getDate() + 3);
      try {
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=37.5665&longitude=126.9780&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=temperature_2m_max&timezone=Asia%2FSeoul`;
        const txt = await fetchProxy(url, 8000);
        if (!txt) return null;
        const j = JSON.parse(txt);
        const arr = (j?.daily?.temperature_2m_max || []).filter(v => v !== null && v !== undefined);
        return arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;
      } catch { return null; }
    }));
    const valid = yearSamples.filter(v => v !== null);
    if (valid.length) {
      const avg = valid.reduce((s, x) => s + x, 0) / valid.length;
      outlook.push({ monthsAhead: h, targetMonth: target.getMonth() + 1, avgMaxTemp: +avg.toFixed(1), sampleYears: valid.length });
    }
  }
  return outlook;
}

function computeClimateScore(temp, pm10, deviation, trend16) {
  let s = 3.0;
  const t = parseFloat(temp); if (!isNaN(t)) { if (t > 25) s += 0.8; else if (t > 20) s += 0.4; }
  const pm = parseFloat(pm10); if (!isNaN(pm)) { if (pm > 50) s += 0.4; }
  if (deviation !== null && !isNaN(deviation)) {
    if (deviation >= 2) s += 0.4;
    else if (deviation <= -2) s -= 0.2;
  }
  if (trend16) {
    if (trend16.delta >= 2) s += 0.2;
    else if (trend16.delta <= -2) s -= 0.1;
  }
  return Math.min(Math.max(s, 1), 5);
}
function buildClimateInterp(temp, pm10, deviation, trend16) {
  const t = parseFloat(temp);
  const parts = [];
  /* 실제 계절(월)을 반영 — 기온대(15~25℃)는 봄·가을 모두 해당하므로 온도 단독 판단 시
     상반기 내내 "봄철"로 잘못 표기되는 문제(예: 7월에도 "봄철 기온 상승")를 방지 */
  const month = new Date().getMonth() + 1;
  const season = (month >= 3 && month <= 5) ? '봄' : (month >= 6 && month <= 8) ? '여름' : (month >= 9 && month <= 11) ? '가을' : '겨울';
  if (!isNaN(t) && t > 25) parts.push(`${season}철 고온(${t}℃) 지속 → 선케어·쿨링·에어리스 밀폐 패키징 수요 증가`);
  else if (!isNaN(t) && t > 15) {
    if (season === '봄') parts.push('봄철 기온 상승 → 선케어 시즌 진입, UV 차단 제품 수요 상승');
    else if (season === '가을') parts.push('가을철 기온 하강 → 선케어 수요 둔화, 보습·리페어 라인 전환 수요 증가');
    else parts.push(`${season}철 온화한 기온(${t}℃) → 선케어·보습 균형 수요`);
  } else parts.push(`${season}철 저온 기조 → 보습·고영양 크림 수요 우위`);
  if (deviation !== null && !isNaN(deviation)) {
    if (deviation >= 2) parts.push(`평년 대비 +${deviation}℃ → 시즌 조기 진입 가능성`);
    else if (deviation <= -2) parts.push(`평년 대비 ${deviation}℃ → 시즌 지연 가능성`);
  }
  if (trend16) {
    if (trend16.delta >= 2) parts.push(`16일 단기예보 상승추세(+${trend16.delta}℃, 참고용) → 단기 수요 증가 신호`);
    else if (trend16.delta <= -2) parts.push(`16일 단기예보 하강추세(${trend16.delta}℃, 참고용) → 보습라인 전환 고려`);
  }
  /* 16일 예보로는 닿지 못하는 1~6개월 구간 — 평년치 기준 계절 전환 시점 전망으로 보강 */
  const outlook = window._seasonalOutlook;
  if (outlook && outlook.length) {
    parts.push('평년 기준 전망: ' + outlook.map(o => `${o.monthsAhead}개월 후(${o.targetMonth}월) 평균최고 ${o.avgMaxTemp}℃`).join(' · '));
  }
  return parts.join(' · ');
}

async function collectEconomy() {
  setSdot('sd-ecos', 'warn');
  const ekey = K.ecos();
  let cpi = '—', cpiYoY = null;
  if (ekey) {
    const now = new Date();
    /* 데이터 지연 고려: 전전월까지만 조회 */
    const toDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const toYM = `${toDate.getFullYear()}${String(toDate.getMonth() + 1).padStart(2,'0')}`;
    const frYM = `${toDate.getFullYear() - 1}${String(toDate.getMonth() + 1).padStart(2,'0')}`;
    /* ECOS 901Y009 소비자물가지수 / 주기 M(월) / 항목코드 0(총지수)
       — 13개월 조회로 첫 행 대비 전년동월비 계산 */
    const cpUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${ekey}/json/kr/1/13/901Y009/M/${frYM}/${toYM}/0`;
    const cpt = await fetchProxy(cpUrl, 12000);
    if (cpt) {
      try {
        const j = JSON.parse(cpt);
        /* TIME(YYYYMM) 오름차순 정렬 — API가 항상 시간순으로 응답한다고 단정하지 않고 방어적으로 정렬 */
        const rows = (j?.StatisticSearch?.row || []).slice().sort((a, b) => (a.TIME || '').localeCompare(b.TIME || ''));
        if (rows.length) {
          cpi = rows[rows.length - 1].DATA_VALUE;
          const base = parseFloat(rows[0].DATA_VALUE), last = parseFloat(cpi);
          if (base > 0 && !isNaN(last)) cpiYoY = ((last - base) / base * 100).toFixed(1);
        }
      } catch {}
    }
    /* 폴백: StatisticSearch 실패 시 100대 통계지표에서 물가상승률 직접 조회 */
    if (cpiYoY === null) {
      const rows = await fetchEcosKeyStats(ekey);
      const hit = rows.find(r => (r.KEYSTAT_NAME || '').includes('소비자물가'));
      const v = hit ? parseFloat(hit.DATA_VALUE) : NaN;
      if (!isNaN(v)) cpiYoY = v.toFixed(1);
    }
  }

  setSdot('sd-ecos', ekey ? (cpiYoY !== null ? 'ok' : 'warn') : 'off');
  const infl = cpiYoY !== null ? parseFloat(cpiYoY) : null;
  const score = infl === null ? 3.2 : infl >= 3 ? 4.0 : infl >= 2 ? 3.6 : 3.2;
  /* 미수집 사유 구분 — 키 미설정 vs 키 있으나 응답 실패(프록시·승인상태 점검 필요) */
  const noDataReason = !ekey
    ? '물가 데이터 미수집 — ECOS 키 미설정 (API 설정에서 키 등록 필요)'
    : '물가 데이터 미수집 — ECOS 키는 있으나 응답 실패(프록시 차단·키 승인상태·StatisticSearch 권한 점검). 가성비·리필 수요 기조 가정';
  SIG_DATA.economy = {
    score,
    interpret: infl !== null
      ? `소비자물가 전년동월비 ${cpiYoY}% — ${infl >= 2.5 ? '가성비+리필 이중 수요, 프리미엄 양극화' : '물가 안정 — 신제품 가격 수용도 양호'}`
      : noDataReason,
    chips: [
      cpi !== '—' ? `CPI ${cpi}` : (cpiYoY !== null ? 'ECOS 100대지표' : (ekey ? 'ECOS 응답실패' : 'ECOS 키 미설정')),
      cpiYoY !== null ? `물가 전년비 ${cpiYoY}%` : '',
      '리필수요↑'
    ].filter(Boolean),
    _sample: cpiYoY === null
  };
}

/* 네이버 DataLab 검색어트렌드 — 최근 3개월 주간 데이터로 카테고리별 상승률 계산
   요청당 키워드그룹 최대 5개 제한 → 15개 카테고리를 3회 병렬 호출
   ※ 스킨케어 편중 방지 — 색조·향수·맨즈그루밍·바디케어 카테고리(3번째 그룹) 포함, 전 성별 트렌드 커버 */
const DATALAB_GROUPS = [
  [ /* 성분·효능 트렌드 */
    { groupName: '선케어',      keywords: ['선세럼', '선스틱', '선크림'] },
    { groupName: '장벽·진정',   keywords: ['시카', '판테놀', '세라마이드'] },
    { groupName: '안티에이징',  keywords: ['레티놀', '콜라겐', '펩타이드'] },
    { groupName: '더마 신성분', keywords: ['PDRN', '엑소좀', '마이크로바이옴'] },
    { groupName: '비건·클린',   keywords: ['비건 화장품', '클린뷰티'] },
  ],
  [ /* 제형·패키징·타깃 트렌드 */
    { groupName: '토너패드',  keywords: ['토너패드', '패드 화장품'] },
    { groupName: '스틱·밤',   keywords: ['멀티밤', '스틱 화장품'] },
    { groupName: '앰플',      keywords: ['앰플', '소용량 앰플'] },
    { groupName: '남성뷰티',  keywords: ['남성 화장품', '올인원 로션'] },
    { groupName: '두피·헤어', keywords: ['두피케어', '헤어세럼'] },
  ],
  [ /* 색조·향수·맨즈·바디 트렌드 — 전 성별 카테고리 확장 */
    { groupName: '색조·메이크업', keywords: ['쿠션', '틴트', '립밤'] },
    { groupName: '향수·퍼퓸',    keywords: ['향수', '미스트'] },
    { groupName: '맨즈그루밍',   keywords: ['쉐이빙', '면도크림'] },
    { groupName: '바디케어',     keywords: ['바디로션', '바디워시'] },
    { groupName: '헤어스타일링', keywords: ['헤어왁스', '헤어에센스'] },
  ],
];

/* 뷰티 트렌드 키워드 — 성분·제형·패키징·타깃 전반 (RSS·뉴스 언급빈도 분석 공용)
   ※ 스킨케어 편중 방지 — 색조·향수·맨즈그루밍·바디케어 키워드 포함, 전 성별·카테고리 커버 */
const TREND_KEYWORDS = [
  '에어리스','비건','클린뷰티','선세럼','선스틱','선케어','앰플','마이크로바이옴','PDRN','엑소좀',
  '펩타이드','콜라겐','레티놀','시카','판테놀','세라마이드','토너패드','패드','멀티밤','스틱',
  '클렌징','리필','수분크림','쿨링','두피','남성','쿠션',
  '메이크업','틴트','립밤','향수','쉐이빙','바디케어','헤어왁스',
];

/* 네이버 데이터랩(검색트렌드/쇼핑인사이트) 호출 실패 사유 — 트렌드 모멘텀 패널·수집결과 보기에 표시 */
const NAVER_ERR_MSG = {
  401: '네이버 API 인증 실패(401) — Client ID/Secret 확인 필요',
  403: '네이버 데이터랩 권한 없음(403) — 애플리케이션에 검색어트렌드·쇼핑인사이트 API 사용 등록 필요',
  network: '네이버 API 응답 없음 — 프록시/네트워크 상태 확인 필요',
  format: '네이버 API 응답 형식 오류',
  empty: '해당 기간 데이터 없음',
};
/* 관세청 수출입무역통계 호출 실패 사유 */
const EXPORT_ERR_MSG = {
  auth: '관세청 무역통계 권한 없음 — data.go.kr에서 "관세청_품목별 국가별 수출입실적(GW)" API 활용신청·승인 필요 (※ "관세청_수출입총괄"과는 별개 API)',
  network: '관세청 무역통계 응답 없음 — 프록시/네트워크 상태 확인 필요',
  empty: '해당 기간 수출 데이터 없음',
};

/* 뷰티 섹터 뉴스 — 단일 키워드(에어리스) 고정 대신 전체 유형 스펙트럼 검색 후
   언급빈도 분석으로 "자주 언급/급상승" 트렌드 키워드 도출 */
const NEWS_TREND_QUERIES = ['화장품 신제품', '뷰티 트렌드', '더마 코스메틱', 'K뷰티 수출'];

/* 해외 뷰티·패키징 박람회 — 참석 목적이 아니라 "거기서 공개된 성분·제형·패키징"을
   국내보다 6~12개월 앞선 선행 트렌드로 활용. 박람회 사이트는 API·CORS가 없어 직접
   수집 불가하므로, 박람회를 다룬 최근 보도(네이버뉴스 최신순)를 검색해 키워드를 추출.
   비수기엔 박람회 직접 보도가 적어 마지막 쿼리(글로벌 일반 트렌드)로 자연 폴백된다. */
/* ════ 리테일 실측 앵커 — 실구매·실사용 데이터 기반 연간 공개 리포트 (정적 참조) ════
   검색·클릭은 '관심'이지만 이 앵커는 '실제 팔리고 쓰인' 데이터의 공식 집계 결과다.
   연 1~2회 발표 시 이 상수만 갱신하면 됨(REGS와 동일 운영 방식). 예측 프롬프트의
   검증 앵커 + 근거 모달 + 보고서에 반영된다. */
const RETAIL_ANCHORS = [
  { src: '올리브영 어워즈 2025', date: '2025.11', basis: '연간 실구매 데이터 1.8억 건 · 40개 부문',
    themes: ['인디 브랜드 강세(수상작 다수가 인디)', '더마·선케어·베이스 부문 세분화', 'K뷰티·웰니스 통합 트렌드'],
    url: 'https://corp.oliveyoung.com/ko/trend/insight-studio/8', srcLabel: '올리브영 인사이트 스튜디오' },
  { src: '화해 2026 뷰티 트렌드 리포트', date: '2025.08', basis: '실사용 리뷰 940만 건 · 제품 38만 개',
    themes: ['하이퍼 감각 케어(사용감·향 중시)', '고기능 미니멀리즘(성분 압축)', '안심 진정뷰티(저자극 검증)'],
    url: 'https://business.hwahae.co.kr/insight/trendreport-2026/', srcLabel: '화해 비즈니스 인사이트' },
];

/* ════ YouTube 콘텐츠 모멘텀 — 뷰티 키워드 영상 업로드 속도 (공식 무료 API·CORS 허용) ════
   최근 30일 vs 직전 30일 검색결과 수 비교 → 콘텐츠 생산 모멘텀. 검색(관심)·클릭(구매의도)
   과 다른 '크리에이터 콘텐츠' 축을 문화 신호에 추가. search.list 100유닛×16회 ≈ 1,600유닛
   (일 한도 10,000 내 여유). */
const YT_KEYWORDS = ['선크림', '선세럼', '앰플', '토너패드', '쿠션', '립밤', '클렌징', '두피케어'];
async function collectYouTubeTrends() {
  window._ytTrends = null;
  window._ytErr = null;
  const key = K.youtube();
  if (!key) { window._ytErr = 'YouTube 키 미설정'; return; }
  try {
    const now = Date.now();
    const iso = ms => new Date(ms).toISOString();
    const cnt = async (q, fromMs, toMs) => {
      const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&q=${encodeURIComponent(q + ' 화장품')}` +
        `&publishedAfter=${encodeURIComponent(iso(fromMs))}&publishedBefore=${encodeURIComponent(iso(toMs))}&key=${encodeURIComponent(key)}`;
      const r = key === '__BK__' ? await bkFetch(url, {}, 12000) : await fetch(url);
      const j = await r.json();
      if (!r.ok) throw Object.assign(new Error(j?.error?.message || `HTTP ${r.status}`), { status: r.status });
      return j?.pageInfo?.totalResults ?? 0;
    };
    const D30 = 30 * 86400000;
    const results = await Promise.all(YT_KEYWORDS.map(async kw => {
      try {
        const [recent, prev] = await Promise.all([cnt(kw, now - D30, now), cnt(kw, now - 2 * D30, now - D30)]);
        const delta = prev > 0 ? Math.round((recent - prev) / prev * 100) : (recent > 0 ? 100 : 0);
        return { name: kw, delta, recent };
      } catch (e) { throw e; }
    })).catch(e => { window._ytErr = e.status === 403 ? '쿼터 초과 또는 키 미승인(403)' : (e.message || '호출 실패'); return null; });
    if (!results) return;
    const trends = results.filter(r => r.recent > 0).sort((a, b) => b.delta - a.delta);
    window._ytTrends = trends.length ? trends : null;
    if (!trends.length) window._ytErr = '영상 검색결과 0건';
  } catch { window._ytErr = '수집 실패'; }
}

/* ════ 서버 수집 선행신호 로더 — Google Trends(글로벌 검색)·Reddit(해외 커뮤니티) ════
   두 소스는 브라우저에서 직접 못 가져온다(비공식 API·CORS 차단) → GitHub Actions가
   data/trends.json에 함께 수집해 두면 여기서 same-origin으로 읽는다. 라이브 수집
   모드에서도 항상 로드(신선도 8일 이내만 채택). */
async function loadServerLeads() {
  window._gtrends = window._gtrends || null;
  window._reddit = window._reddit || null;
  try {
    const r = await fetch('data/trends.json', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    const ageDays = (Date.now() - new Date(j.collectedAt).getTime()) / 86400000;
    if (isNaN(ageDays) || ageDays > 8) return;
    if (Array.isArray(j.gtrendsTrends) && j.gtrendsTrends.length) window._gtrends = j.gtrendsTrends;
    if (Array.isArray(j.redditTrends) && j.redditTrends.length) window._reddit = j.redditTrends;
    if (j.globalRetail && (j.globalRetail.formulations || j.globalRetail.sources)) window._globalRetail = j.globalRetail;
  } catch {}
}

const GLOBAL_EXPO_QUERIES = [
  'Cosmoprof 화장품', '코스모프로프 뷰티', 'in-cosmetics 트렌드',
  'Cosmopack 패키징', '글로벌 화장품 트렌드',
];
const GLOBAL_EXPO_RECENT_DAYS = 60;   /* 최근 N일 이내 보도만 선행신호로 채택 */
async function collectNewsTrends(nid, nsec) {
  const resps = await Promise.all(NEWS_TREND_QUERIES.map(q => {
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=30&sort=date`;
    return fetchNaverAPI(url, nid, nsec, 10000);
  }));
  let total = 0, ok = false;
  const kwMap = {};
  const articles = [];   /* ZONE 0 문화 카드 클릭 시 "분석 근거 자료"로 노출할 기사 제목+링크 */
  resps.forEach(j => {
    if (!j || j._error) return;
    ok = true;
    total += j.total || 0;
    (j.items || []).forEach(it => {
      const title = (it.title || '').replace(/<[^>]+>/g, '');
      const text = `${title} ${it.description}`.replace(/<[^>]+>/g, '');
      TREND_KEYWORDS.forEach(kw => { if (text.includes(kw)) kwMap[kw] = (kwMap[kw]||0) + 1; });
      if (it.link && articles.length < 20) articles.push({ title, link: it.link, source: '네이버뉴스' });
    });
  });
  return { total, kwMap, ok, articles };
}

async function collectDataLab(nid, nsec) {
  const end = new Date(); end.setDate(end.getDate() - 1);
  const start = new Date(end); start.setMonth(start.getMonth() - 3);
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const mkBody = groups => JSON.stringify({
    startDate: fmt(start), endDate: fmt(end), timeUnit: 'week', keywordGroups: groups
  });
  const resps = await Promise.all(DATALAB_GROUPS.map(g =>
    fetchNaverAPI('https://openapi.naver.com/v1/datalab/search', nid, nsec, 10000, { method: 'POST', body: mkBody(g) })
  ));
  /* 기간 전반 평균 대비 후반 평균 → 상승률(%) */
  const avg = arr => arr.reduce((s, x) => s + (x.ratio || 0), 0) / (arr.length || 1);
  const trends = [];
  let err = null;
  for (const j of resps) {
    if (j && j._error) { err = j._error; continue; }
    if (!j) { if (typeof err !== 'number') err = 'network'; continue; }
    if (!Array.isArray(j.results)) { if (typeof err !== 'number') err = 'format'; continue; }
    j.results.forEach(g => {
      const d = g.data || [];
      if (d.length < 4) return;
      if (trends.some(t => t.name === g.title)) return; /* 그룹명 중복 방지 */
      const half = Math.floor(d.length / 2);
      const prev = avg(d.slice(0, half)), recent = avg(d.slice(half));
      trends.push({ name: g.title, delta: prev > 0 ? Math.round((recent - prev) / prev * 100) : 0 });
    });
  }
  trends.sort((a, b) => b.delta - a.delta);
  return { trends: trends.length ? trends : null, err: trends.length ? null : (err || 'empty') };
}

/* ── 실판매(구매의도) 신호 — 네이버 DataLab 쇼핑인사이트 ──────────────
   일반 검색트렌드(/datalab/search)와 달리 "네이버쇼핑 클릭량 추이"라
   구매의도에 직결된 선행 신호. 화장품/미용 카테고리(50000002) 내
   제품 키워드별 클릭 상승률을 계산.
   ※ 올리브영·다이소 직접 랭킹은 공개 API 부재·JS 렌더링·ToS 문제로
     안정적 실데이터 확보 불가 → 제외. 쇼핑인사이트는 기존 네이버 키로
     실데이터 확보 가능하므로 이를 실판매 모멘텀 신호로 채택.
   ※ 키에 쇼핑인사이트 권한이 없으면 _error 반환 → null 처리(샘플 미생성).
   ※ 스킨케어 편중 방지 — 색조·향수·맨즈그루밍·바디케어 키워드(3번째 그룹) 포함, 전 성별 커버. */
const COSMETIC_CATEGORY = '50000002';   /* 네이버쇼핑 화장품/미용 */
const SHOP_KEYWORD_GROUPS = [
  ['선세럼', '토너패드', '멀티밤', '앰플', '비건 화장품'],
  ['시카크림', '레티놀', '콜라겐', '클렌징밤', '수분크림'],
  ['쿠션', '향수', '틴트', '면도크림', '바디로션'],
];
async function collectSalesTrend(nid, nsec) {
  const end = new Date(); end.setDate(end.getDate() - 1);
  const start = new Date(end); start.setMonth(start.getMonth() - 3);
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  /* device/gender/ages는 생략 시 네이버 API가 "전체(전 기기·성별·연령)" 데이터를 반환.
     빈 문자열/빈 배열로 명시하면 일부 환경에서 잘못된 파라미터로 처리되어
     400 오류 → 모든 프록시 실패 → null 반환되는 문제가 있어 필드 자체를 생략. */
  const mkBody = kws => JSON.stringify({
    startDate: fmt(start), endDate: fmt(end), timeUnit: 'week',
    category: COSMETIC_CATEGORY,
    keyword: kws.map(k => ({ name: k, param: [k] })),
  });
  const resps = await Promise.all(SHOP_KEYWORD_GROUPS.map(kws =>
    fetchNaverAPI('https://openapi.naver.com/v1/datalab/shopping/category/keywords', nid, nsec, 10000,
      { method: 'POST', body: mkBody(kws) })
  ));
  const avg = arr => arr.reduce((s, x) => s + (x.ratio || 0), 0) / (arr.length || 1);
  const trends = [];
  let err = null;
  for (const j of resps) {
    if (j && j._error) { err = j._error; continue; }
    if (!j) { if (typeof err !== 'number') err = 'network'; continue; }
    if (!Array.isArray(j.results)) { if (typeof err !== 'number') err = 'format'; continue; }
    j.results.forEach(g => {
      const d = g.data || [];
      if (d.length < 4) return;
      if (trends.some(t => t.name === g.title)) return;
      const half = Math.floor(d.length / 2);
      const prev = avg(d.slice(0, half)), recent = avg(d.slice(half));
      trends.push({ name: g.title, delta: prev > 0 ? Math.round((recent - prev) / prev * 100) : 0 });
    });
  }
  trends.sort((a, b) => b.delta - a.delta);
  /* 실데이터를 못 받았으면 null — 샘플/추정값을 만들지 않음 */
  return { trends: trends.length ? trends : null, err: trends.length ? null : (err || 'empty') };
}

/* ── 수출 모멘텀 신호 — 관세청 수출입무역통계 (data.go.kr 공공키) ──────────
   화장품 HS부호별 월간 수출금액(expDlr, 천달러)의 최근 3개월 vs 직전 3개월
   증감률. 검색·클릭은 "관심"의 선행지표지만, 수출액은 실제 출하·결제된
   "판매 실적" 그 자체 → 가장 강한 실판매 신호이자 K뷰티 수출 목표에 직결.
   HS 4단위는 색조·향수·두발·면도 등 거시 카테고리를 그대로 커버해
   성별·카테고리 편중 없이 전 영역을 본다.
   ※ data.go.kr 공공키(PUBLIC_KEY)에 "관세청_품목별 국가별 수출입실적(GW)"
     (서비스 1220000/nitemtrade, hsSgn=HS코드) 활용신청·승인 필요.
     "관세청_수출입총괄(GW)"은 품목 구분 없는 국가 전체 합계만 제공하는
     별개 API로, hsSgn 등 품목별 조회를 지원하지 않아 본 신호에는 사용 불가.
     응답은 XML — 정규식으로 expDlr 추출(구조 변동에 강건). */
const EXPORT_HS = [
  { hs: '3303', name: '향수·화장수' },
  { hs: '3304', name: '색조·기초화장품' },
  { hs: '3305', name: '두발용 제품' },
  { hs: '3307', name: '면도·데오·목욕용' },
];
async function collectExportTrend(pubKey) {
  const ym = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  /* 무역통계 공표 지연(약 1~2개월) 고려해 기준월을 2개월 전으로 */
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() - 2);
  const mk = (back) => { const d = new Date(base); d.setMonth(d.getMonth() - back); return d; };
  const recentEnd = base, recentStart = mk(2);          /* 최근 3개월 */
  const priorEnd = mk(3), priorStart = mk(5);           /* 직전 3개월 */
  const url = (hs, s, e) =>
    `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?serviceKey=${encodeURIComponent(pubKey)}`
    + `&strtYymm=${ym(s)}&endYymm=${ym(e)}&hsSgn=${hs}`;
  const sumExp = (txt) => {
    if (!txt) return null;
    /* 인증·서비스 오류 식별 — "수출입총괄"만 승인된 키로 nitemtrade(품목별)를
       호출하면 SERVICE_ACCESS_DENIED_ERROR/NO_OPENAPI_SERVICE_ERROR 등
       returnAuthMsg 응답이 오므로 함께 매칭 */
    if (/SERVICE[_ ]?KEY|등록되지 않은|인증키|LIMITED_NUMBER|service key|returnAuthMsg|SERVICE_ACCESS_DENIED|NO_OPENAPI_SERVICE/i.test(txt)) return 'auth';
    const ms = [...txt.matchAll(/<expDlr>\s*([\d.\-]+)\s*<\/expDlr>/g)];
    if (!ms.length) return null;
    return ms.reduce((s, m) => s + (parseFloat(m[1]) || 0), 0);
  };
  const results = await Promise.all(EXPORT_HS.map(async ({ hs, name }) => {
    const [rTxt, pTxt] = await Promise.all([
      fetchProxy(url(hs, recentStart, recentEnd), 12000),
      fetchProxy(url(hs, priorStart, priorEnd), 12000),
    ]);
    const recent = sumExp(rTxt), prior = sumExp(pTxt);
    if (recent === 'auth' || prior === 'auth') return { name, _auth: true };
    if (recent === null || prior === null) return { name, _fail: true };
    const delta = prior > 0 ? Math.round((recent - prior) / prior * 100) : 0;
    return { name, delta, recent };
  }));
  let err = null;
  const trends = [];
  for (const r of results) {
    if (r._auth) { err = 'auth'; continue; }
    if (r._fail) { if (err !== 'auth') err = 'network'; continue; }
    trends.push({ name: r.name, delta: r.delta });
  }
  trends.sort((a, b) => b.delta - a.delta);
  return { trends: trends.length ? trends : null, err: trends.length ? null : (err || 'empty') };
}

async function collectCulture() {
  setSdot('sd-datalab', 'warn');
  setSdot('sd-news', 'warn');
  /* 수출 모멘텀(관세청)은 data.go.kr 공공키만 있으면 네이버 키와 무관하게 수집 */
  const pub = K.public();
  setSdot('sd-export', pub ? 'warn' : 'off');
  const exportPromise = pub ? collectExportTrend(pub) : Promise.resolve({ trends: null, err: null });
  const applyExport = (r) => {
    window._exportTrends = r.trends;
    window._exportErr = r.err;
    setSdot('sd-export', r.trends ? 'ok' : (pub ? 'warn' : 'off'));
  };
  const nid = K.naverID(), nsec = K.naverSec();
  if (!nid) {
    /* RSS는 키 없이도 수집 가능 — 실데이터 우선 */
    const [exportResult, rssData] = await Promise.all([exportPromise, collectBeautyRSS()]);
    applyExport(exportResult);
    window._rssText = rssData.text || '';
    window._rssArticles = rssData.articles || [];
    window._newsArticles = null;   /* 네이버뉴스는 키 필요 */
    window._salesTrends = null;   /* 쇼핑인사이트는 네이버 키 필요 */
    window._dlTrends = null;
    window._salesErr = null;
    window._dlErr = null;
    setSdot('sd-news', 'off');
    /* sd-datalab은 "네이버 DataLab" 전용 표시등 — 네이버 키가 없으면 DataLab은 호출 자체가
       안 되므로 RSS 성공 여부와 무관하게 off로 고정한다(이전엔 RSS 성공만으로 'ok'가 떠
       DataLab이 실제로 연결된 것처럼 보이는 오표시가 있었음) */
    setSdot('sd-datalab', 'off');
    if (rssData.count > 0) {
      const ranked = Object.entries(rssData.kwMap || {}).sort((a,b)=>b[1]-a[1]);
      window._newsTrends = ranked.length ? ranked.slice(0,3).map(([name,count])=>({name,count})) : null;
      SIG_DATA.culture = {
        score: rssData.count > 50 ? 3.8 : 3.4,
        interpret: `뷰티미디어 RSS ${rssData.count}건 수집 — 네이버 키 입력 시 뉴스·DataLab 추가 분석`,
        chips: [`RSS ${rssData.count}건`, ...rssData.keywords.slice(0, 3)]
      };
    } else {
      setSdot('sd-datalab', 'off');
      window._newsTrends = null;
      SIG_DATA.culture = { score:4.2, interpret:'문화 데이터 수집 불가 (네이버 키 필요) — 샘플 값 사용', chips:['API 키 필요'], _sample:true };
    }
    return;
  }
  /* 뉴스·DataLab(검색)·쇼핑인사이트(구매의도)·수출(관세청)·RSS 병렬 수집 */
  const [newsTrends, dlResult, salesResult, exportResult, rssData] = await Promise.all([
    collectNewsTrends(nid, nsec),
    collectDataLab(nid, nsec),
    collectSalesTrend(nid, nsec),
    exportPromise,
    collectBeautyRSS(),
  ]);
  applyExport(exportResult);
  window._rssText = rssData.text || '';
  window._rssArticles = rssData.articles || [];
  window._newsArticles = newsTrends.articles || [];
  window._dlTrends = dlResult.trends;   /* Gemini 프롬프트·보고서·트렌드 모멘텀에서 활용 */
  window._dlErr = dlResult.err;
  window._salesTrends = salesResult.trends;   /* 실판매(구매의도) 모멘텀 — 실데이터 없으면 null */
  window._salesErr = salesResult.err;
  setSdot('sd-news', newsTrends.ok ? 'ok' : 'warn');
  /* DataLab 자체 결과만으로 판정 — RSS 성공을 더해 'ok'로 띄우면 DataLab 미연결인데도
     연결된 것처럼 보이는 오표시가 발생한다 */
  setSdot('sd-datalab', dlResult.trends ? 'ok' : 'warn');

  /* 뉴스 + RSS 키워드 언급빈도 합산 → "자주 언급" 트렌드 (단일 키워드 편향 제거) */
  const combinedKw = {};
  Object.entries(newsTrends.kwMap || {}).forEach(([k,v]) => combinedKw[k] = (combinedKw[k]||0) + v);
  Object.entries(rssData.kwMap || {}).forEach(([k,v]) => combinedKw[k] = (combinedKw[k]||0) + v);
  const topMentioned = Object.entries(combinedKw).sort((a,b)=>b[1]-a[1]).slice(0,3);
  window._newsTrends = topMentioned.length ? topMentioned.map(([name,count])=>({name,count})) : null;

  const totalNews = (newsTrends.total || 0) + rssData.count;
  const top = dlResult.trends?.[0];
  const sTop = salesResult.trends?.[0];
  const xTop = exportResult.trends?.[0];
  const dlChip = top ? `검색 ${top.name} ${top.delta >= 0 ? '+' : ''}${top.delta}%` : null;
  const salesChip = sTop ? `구매 ${sTop.name} ${sTop.delta >= 0 ? '+' : ''}${sTop.delta}%` : null;
  const exportChip = xTop ? `수출 ${xTop.name} ${xTop.delta >= 0 ? '+' : ''}${xTop.delta}%` : null;
  const mentionChip = topMentioned.length ? `최다언급 "${topMentioned[0][0]}"(${topMentioned[0][1]})` : null;
  let score = totalNews > 1000 ? 4.4 : totalNews > 100 ? 3.9 : 3.5;
  if (top && top.delta >= 20) score = Math.min(5, score + 0.3);
  /* 구매의도(쇼핑클릭)·수출(실판매) 급등은 가장 강한 선행 신호 — 추가 가산 */
  if (sTop && sTop.delta >= 20) score = Math.min(5, score + 0.3);
  if (xTop && xTop.delta >= 15) score = Math.min(5, score + 0.3);
  SIG_DATA.culture = {
    score,
    interpret: `화장품 뉴스 ${totalNews.toLocaleString()}건 분석`
      + (topMentioned.length ? ` · 최다 언급 "${topMentioned.map(([n])=>n).join('·')}"` : '')
      + (top ? ` · 검색 급상승 "${top.name}" ${top.delta >= 0 ? '+' : ''}${top.delta}%` : '')
      + (sTop ? ` · 구매(쇼핑클릭) 급상승 "${sTop.name}" ${sTop.delta >= 0 ? '+' : ''}${sTop.delta}%` : '')
      + (xTop ? ` · 수출(실판매) 급상승 "${xTop.name}" ${xTop.delta >= 0 ? '+' : ''}${xTop.delta}%` : '')
      + ' — 전체 유형 트렌드 종합',
    chips: [`뉴스 ${totalNews.toLocaleString()}건`, ...(exportChip ? [exportChip] : []), ...(salesChip ? [salesChip] : []), ...(dlChip ? [dlChip] : []), ...(mentionChip ? [mentionChip] : [])].slice(0, 4),
    _sample: totalNews === 0 && !top && !xTop
  };
}

/* ECOS 100대 통계지표 — 항목코드 불필요·안정적. 세션 내 1회만 조회 (society·economy 공용) */
let _ecosKeyStatCache = null;
async function fetchEcosKeyStats(ekey) {
  if (_ecosKeyStatCache) return _ecosKeyStatCache;
  try {
    const t = await fetchProxy(`https://ecos.bok.or.kr/api/KeyStatisticList/${ekey}/json/kr/1/100/`, 12000);
    if (t) {
      const rows = JSON.parse(t)?.KeyStatisticList?.row || [];
      if (rows.length) { _ecosKeyStatCache = rows; return rows; }
    }
  } catch {}
  return [];
}

async function collectSociety() {
  setSdot('sd-kosis', 'warn');
  const ecosKey = K.ecos();
  let ccsi = '—', unemploy = '—', retailVal = '—', retailName = '', creditVal = '—', creditName = '';
  if (ecosKey) {
    /* ECOS 100대 통계지표 1회 호출(economy 신호와 캐시 공유)에서 소비여력 관련 지표를 함께 추출
       — 소비자심리지수(CCSI) 외에 실업률(고용 안정성)·소매판매(오프라인 구매력)·가계신용(소비 여력
       제약)까지 같은 호출로 뽑아내 "사회" 신호를 CCSI 단일값 의존에서 벗어나게 보강 */
    const rows = await fetchEcosKeyStats(ecosKey);
    const find = (...kws) => rows.find(r => kws.some(kw => (r.KEYSTAT_NAME || '').includes(kw)));
    const ccsiHit = find('소비자심리');
    if (ccsiHit && ccsiHit.DATA_VALUE) ccsi = ccsiHit.DATA_VALUE;
    const unemployHit = find('실업률');
    if (unemployHit && unemployHit.DATA_VALUE) unemploy = unemployHit.DATA_VALUE;
    const retailHit = find('소매판매');
    if (retailHit && retailHit.DATA_VALUE) { retailVal = retailHit.DATA_VALUE; retailName = retailHit.KEYSTAT_NAME; }
    const creditHit = find('가계신용', '가계대출');
    if (creditHit && creditHit.DATA_VALUE) { creditVal = creditHit.DATA_VALUE; creditName = creditHit.KEYSTAT_NAME; }
  }
  setSdot('sd-kosis', ccsi !== '—' ? 'ok' : (ecosKey ? 'warn' : 'off'));
  const c = parseFloat(ccsi), u = parseFloat(unemploy);
  let score = !isNaN(c) ? (c >= 100 ? 4.0 : 3.6) : 3.8;
  /* 실업률 낮음(고용 안정) → 구매력 양호로 소폭 가산, 높으면 가성비 수요 우위로 소폭 감산 */
  if (!isNaN(u)) { if (u <= 2.8) score += 0.1; else if (u >= 4) score -= 0.1; }
  score = Math.min(Math.max(score, 1), 5);

  const parts = ['1인가구 36.1%(통계청 2024, 역대 최대) · 전 연령·性 그루밍 수요 확산 → 소용량·편의형 패키징 수요 증가'];
  if (ccsi !== '—') parts.push(`소비자심리지수 ${ccsi}${!isNaN(c) ? (c >= 100 ? ' (소비 낙관)' : ' (소비 신중)') : ''}`);
  if (unemploy !== '—') parts.push(`실업률 ${unemploy}%${!isNaN(u) ? (u <= 2.8 ? ' (고용 안정 → 구매력 양호)' : u >= 4 ? ' (고용 둔화 → 가성비 수요 우위)' : '') : ''}`);
  if (retailVal !== '—') parts.push(`${retailName || 'ECOS 소매판매 지표'} ${retailVal}`);
  if (creditVal !== '—') parts.push(`${creditName || 'ECOS 가계신용 지표'} ${creditVal}`);

  SIG_DATA.society = {
    score,
    interpret: parts.join(' · '),
    chips: [
      '1인가구 36.1%', '그루밍 수요↑',
      ccsi !== '—' ? `CCSI ${ccsi}` : 'ECOS 키 필요',
      unemploy !== '—' ? `실업률 ${unemploy}%` : '',
      retailVal !== '—' ? `${retailName || '소매판매'} ${retailVal}` : '',
    ].filter(Boolean).slice(0, 5),
    _sample: ccsi === '—'
  };
}

function savePredHistory(predictions, period) {
  try {
    const hist = JSON.parse(ls('m5_history') || '[]');
    /* 같은 날 같은 기간의 재수집은 최신으로 대체(원장 중복 방지) */
    const today = new Date().toDateString();
    const dupIdx = hist.findIndex(h => h.period === period && new Date(h.ts).toDateString() === today && !h.judgments);
    if (dupIdx >= 0) hist.splice(dupIdx, 1);
    const entry = { ts: Date.now(), period, predictions: predictions.map(p => ({rank:p.rank, type:p.type, confidence:p.confidence})) };
    hist.unshift(entry);
    /* 원장 보존을 위해 24개 유지(판정 완료분 우선 보존) */
    ls('m5_history', JSON.stringify(hist.slice(0, 24)));
  } catch {}
}

/* ════ 예측 실적 원장 — 판정(적중/부분/미스)·적중률 집계 ════
   백테스트(자동 신호 재포착)는 보조 증거이고, 최종 판정은 담당자 클릭으로 확정한다.
   판정 결과가 스코어보드의 '누적 예측 적중률' 원천 데이터가 된다. */
function getLedgerHist() {
  try { return JSON.parse(ls('m5_history') || '[]'); } catch { return []; }
}
function judgePrediction(entryTs, idx, verdict) {
  try {
    const hist = getLedgerHist();
    const e = hist.find(h => h.ts === entryTs);
    if (!e) return;
    e.judgments = e.judgments || {};
    e.judgments[idx] = { v: verdict, at: Date.now() };
    ls('m5_history', JSON.stringify(hist));
  } catch {}
  const matured = backtestPredictions();
  renderBacktestDashboard(matured);
  renderScoreboard();
  showToast(verdict === 'hit' ? '적중으로 판정 기록됨' : verdict === 'part' ? '부분 적중으로 기록됨' : '미스로 기록됨');
}
function ledgerStats() {
  const hist = getLedgerHist();
  let hit = 0, part = 0, miss = 0, pending = 0;
  const now = Date.now();
  hist.forEach(e => {
    (e.predictions || []).forEach((p, i) => {
      const j = e.judgments?.[i];
      if (j) { if (j.v === 'hit') hit++; else if (j.v === 'part') part++; else miss++; }
      else if (now - e.ts >= periodMaturityMs(e.period)) pending++;
    });
  });
  const judged = hit + part + miss;
  return { hit, part, miss, judged, pending, rate: judged ? Math.round((hit + part * 0.5) / judged * 100) : null };
}

function getRankChanges(predictions, period) {
  try {
    const hist = JSON.parse(ls('m5_history') || '[]');
    const prev = hist.find(h => h.period === period && h.ts < Date.now() - 60000); // 1분 이전 항목
    if (!prev) return {};
    const changes = {};
    predictions.forEach(p => {
      const old = prev.predictions.find(o => o.type === p.type);
      if (!old) { changes[p.rank] = 'NEW'; }
      else if (old.rank !== p.rank) { changes[p.rank] = old.rank - p.rank; } // 양수 = 상승
    });
    return changes;
  } catch { return {}; }
}

/* ════ 예측 백테스트(사후 검증) ════
   과거 예측이 실제로 맞았는지 확인할 표준 사후 데이터(카테고리별 실매출 등)는 없으므로,
   "예측한 기간이 도래한 시점에 그 유형의 키워드가 실측 모멘텀 신호(수출액·구매클릭·검색량·
   뉴스언급)에서 다시 상승세로 포착되는가"를 적중 여부의 대리 지표(proxy)로 사용한다.
   완벽한 정확도 측정이 아니라 "신호 일치도"이며, 이 한계를 보고서에도 그대로 명시한다.
   히스토리는 기간(6개월=182일/1년=365일)이 도래해야 검증되므로, 운영 누적 기간이 짧으면
   당분간 검증 대상이 없는 것이 정상이다. */
function periodMaturityMs(period) {
  return period === '1y' ? 365 * 86400000 : period === '3m' ? 90 * 86400000 : period === '2m' ? 60 * 86400000 : 182 * 86400000;
}

function backtestPredictions() {
  let hist;
  try { hist = JSON.parse(ls('m5_history') || '[]'); } catch { return []; }
  const now = Date.now();
  const momentum = [
    ...(window._dlTrends || []), ...(window._salesTrends || []),
    ...(window._exportTrends || []), ...(window._newsTrends || []),
  ];
  let changed = false;
  hist.forEach(entry => {
    if (entry.backtested || !entry.predictions) return;
    if (now - entry.ts < periodMaturityMs(entry.period)) return;   /* 기간 미도래 — 아직 검증 대상 아님 */
    const details = entry.predictions.map(p => {
      const kw = (p.type || '').split(' ')[0];
      const hit = momentum.some(m => m.name && kw && (m.name.includes(kw) || kw.includes(m.name)) && ((m.delta ?? 0) > 0 || (m.count ?? 0) > 0));
      return { type: p.type, hit };
    });
    entry.backtested = true;
    entry.backtestAt = now;
    entry.hits = details.filter(d => d.hit).length;
    entry.total = details.length;
    entry.details = details;
    changed = true;
  });
  if (changed) { try { ls('m5_history', JSON.stringify(hist)); } catch {} }
  return hist.filter(h => h.backtested);
}

/* 예측 정확도 대시보드 — 백테스트된(기간 도래) 예측들의 적중률(신호 일치도)을
   요약 카드 + 막대그래프로 시각화. matured는 backtestPredictions()의 반환값(최신순). */
function renderBacktestDashboard(matured) {
  const panel = document.getElementById('btDashPanel');
  if (!panel) return;
  if (!matured.length) { panel.innerHTML = '<div class="bt-empty">아직 검증된(기간 도래) 예측이 없습니다.</div>' + ledgerHtml(); return; }
  const rates = matured.map(h => h.total ? h.hits / h.total : 0);
  const avgRate = rates.reduce((s, x) => s + x, 0) / rates.length;
  const totalHits = matured.reduce((s, h) => s + h.hits, 0);
  const totalAll  = matured.reduce((s, h) => s + h.total, 0);
  const barColor = r => r >= 0.6 ? '#15803d' : r >= 0.4 ? '#92500e' : '#991b1b';
  panel.innerHTML = `
    <div class="bt-cards">
      <div class="bt-card"><div class="bt-card-num">${matured.length}</div><div class="bt-card-lbl">검증된 예측 회차</div></div>
      <div class="bt-card"><div class="bt-card-num">${(avgRate * 100).toFixed(0)}%</div><div class="bt-card-lbl">평균 신호 일치율</div></div>
      <div class="bt-card"><div class="bt-card-num">${totalHits}/${totalAll}</div><div class="bt-card-lbl">전체 적중/검증 항목</div></div>
    </div>
    <div class="bt-list">
      ${matured.slice(0, 10).map(h => {
        const r = h.total ? h.hits / h.total : 0;
        const dateStr = new Date(h.ts).toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' });
        const periodLbl = h.period === '1y' ? '1년 예측' : '6개월 예측';
        return `<div class="bt-row">
          <div class="bt-row-meta">${dateStr} · ${periodLbl}</div>
          <div class="bt-row-bar-wrap"><div class="bt-row-bar" style="width:${(r*100).toFixed(0)}%;background:${barColor(r)}"></div></div>
          <div class="bt-row-pct">${h.hits}/${h.total}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="bt-note">※ "적중"은 실매출 데이터가 아니라, 예측 시점 키워드가 검증 시점 모멘텀 신호(수출·구매·검색·뉴스)에서 다시 포착되는지를 보는 신호 일치도 지표입니다 — 완전한 정확도 측정이 아닙니다.</div>
    ${ledgerHtml()}
  `;
}

/* 원장 렌더 — 회차별 예측 목록 + 자동 신호 재검 결과 + 판정 버튼/배지 */
function ledgerHtml() {
  const hist = getLedgerHist();
  if (!hist.length) return '';
  const now = Date.now();
  const st = ledgerStats();
  const stLine = st.judged
    ? `누적 적중률 <b>${st.rate}%</b> (적중 ${st.hit} · 부분 ${st.part} · 미스 ${st.miss})${st.pending ? ` · <span style="color:var(--acc,#bf7b42)">판정 대기 ${st.pending}건</span>` : ''}`
    : (st.pending ? `<span style="color:var(--acc,#bf7b42)">판정 대기 ${st.pending}건</span> — 아래에서 적중/부분/미스를 확정하면 적중률이 집계됩니다` : '판정 창이 도래한 예측이 아직 없습니다 — 기간이 차면 여기서 판정합니다');
  const rows = hist.slice(0, 8).map(e => {
    const matured = now - e.ts >= periodMaturityMs(e.period);
    const dLeft = Math.ceil((e.ts + periodMaturityMs(e.period) - now) / 86400000);
    const dateStr = new Date(e.ts).toLocaleDateString('ko-KR', { year:'2-digit', month:'2-digit', day:'2-digit' });
    const items = (e.predictions || []).map((p, i) => {
      const j = e.judgments?.[i];
      const auto = e.details?.[i];
      const autoTag = e.backtested
        ? (auto?.hit ? '<span class="lg-auto lg-auto-y">신호 재포착</span>' : '<span class="lg-auto lg-auto-n">신호 무반응</span>')
        : '';
      const radN = (e.radar || []).filter(r => r.rank === p.rank).length;
      const radTag = radN ? `<span class="lg-auto lg-auto-y" title="신제품 레이더가 감지한 관련 출시 보도">출시감지 ${radN}건</span>` : '';
      let right;
      if (j) {
        right = j.v === 'hit' ? '<span class="lg-judge lgj-hit">적중</span>'
              : j.v === 'part' ? '<span class="lg-judge lgj-part">부분</span>'
              : '<span class="lg-judge lgj-miss">미스</span>';
      } else if (matured) {
        right = `<span class="lg-btns">
          <button class="lg-btn lgb-hit" onclick="judgePrediction(${e.ts},${i},'hit')">적중</button>
          <button class="lg-btn lgb-part" onclick="judgePrediction(${e.ts},${i},'part')">부분</button>
          <button class="lg-btn lgb-miss" onclick="judgePrediction(${e.ts},${i},'miss')">미스</button>
        </span>`;
      } else {
        right = `<span class="lg-judge lgj-wait">판정 D-${dLeft}</span>`;
      }
      return `<div class="lg-item">
        <span class="lg-type">${p.rank}위 ${escHtml(p.type)}${p.confidence ? ` <em>${p.confidence}%</em>` : ''}</span>
        ${autoTag}${radTag}${right}
      </div>`;
    }).join('');
    return `<details class="lg-entry"${(matured && !allJudged(e)) ? ' open' : ''}>
      <summary>${dateStr} · ${PERIOD_LABEL[e.period] || e.period} 예측 ${e.predictions?.length || 0}건 ${matured ? (allJudged(e) ? '<span class="lg-done">판정 완료</span>' : '<span class="lg-due">판정 도래</span>') : `<span class="lg-wait">D-${dLeft}</span>`}</summary>
      <div class="lg-items">${items}</div>
    </details>`;
  }).join('');
  return `<div class="ledger-sec">
    <div class="ledger-hd">예측 실적 원장 <span class="ledger-sub">자동 신호 재검은 보조 증거 — 최종 판정은 담당자 확정</span></div>
    <div class="ledger-stat">${stLine}</div>
    ${rows}
  </div>`;
}
function allJudged(e) {
  return (e.predictions || []).every((_, i) => e.judgments?.[i]);
}

/* ════ 예측 스코어보드 — "얼마나 맞혔고, 오늘 데이터는 얼마나 믿을 만한가" 상시 노출 ════ */
function renderScoreboard() {
  const el = document.getElementById('scoreboard');
  if (!el) return;
  const st = ledgerStats();
  const q = computeDataQuality();
  const cap = Math.round(55 + q.ratio * 45);
  const ens = window._ensembleInfo;
  const qColor = q.ratio >= 0.7 ? 'var(--grn)' : q.ratio >= 0.4 ? 'var(--yel)' : 'var(--red)';
  el.innerHTML = `
    <div class="sb-tile">
      <div class="sb-lb">누적 예측 적중률</div>
      <div class="sb-v" style="color:${st.rate !== null ? (st.rate >= 60 ? 'var(--grn)' : st.rate >= 40 ? 'var(--yel)' : 'var(--red)') : 'var(--ink3)'}">${st.rate !== null ? st.rate + '%' : '—'}</div>
      <div class="sb-d">${st.judged ? `판정 ${st.judged}건 · 적중 ${st.hit} · 부분 ${st.part} · 미스 ${st.miss}` : '판정 완료 건 없음 — 원장에서 판정 시 집계'}</div>
    </div>
    <div class="sb-tile">
      <div class="sb-lb">데이터 품질</div>
      <div class="sb-v">${q.real}<span class="sb-vs">/${q.total}</span></div>
      <div class="sb-bar"><b style="width:${Math.round(q.ratio * 100)}%;background:${qColor}"></b></div>
      <div class="sb-d">${q.real < q.total ? `미수집·샘플 ${q.total - q.real}종 → 신뢰도 상한 ${cap}%` : '전 신호 실데이터 — 상한 없음'}</div>
    </div>
    <div class="sb-tile">
      <div class="sb-lb">앙상블 합의</div>
      <div class="sb-v">${ens ? `${ens.agreed}<span class="sb-vs">/${ens.top}</span>` : '—'}</div>
      <div class="sb-d">${ens ? `3관점 독립 분석 중 2회 이상 일치한 유형 (${ens.runs}관점 성공)` : '수집 실행 시 3관점 교차검증 수행'}</div>
    </div>
    <div class="sb-tile${st.pending ? ' sb-click' : ''}"${st.pending ? ` onclick="document.getElementById('btnBtDash')?.click()"` : ''}>
      <div class="sb-lb">판정 대기</div>
      <div class="sb-v" style="color:${st.pending ? 'var(--acc)' : 'var(--ink3)'}">${st.pending}<span class="sb-vs">건</span></div>
      <div class="sb-d">${st.pending ? '기간 도래 — 클릭해서 원장에서 판정하세요' : '판정 창이 도래한 예측 없음'}</div>
    </div>`;
  el.style.display = '';
}

/* ════ 소싱 퍼널 — 예측 → TRACK B 후보 → 등록평가 → 미팅·실사 전환 추적 ════
   "예측이 실제 소싱 성과로 이어지는가"를 숫자로 답한다. 등록평가 항목에는
   단계(평가중→미팅·실사→계약) 순환 버튼을 제공(eval_pending의 stage 필드). */
const EVAL_STAGES = [['eval', '평가중'], ['meet', '미팅·실사'], ['deal', '계약']];
function funnelData() {
  const now = Date.now();
  const types = new Set();
  getLedgerHist().forEach(e => {
    if (now - e.ts <= 90 * 86400000) (e.predictions || []).forEach(p => types.add(extractSearchKw(p.type)));
  });
  let trackb = 0;
  try { trackb = JSON.parse(ls('m5_trackb_seen') || '[]').length; } catch {}
  const evals = getEvalList();
  const meet = evals.filter(e => e.stage === 'meet' || e.stage === 'deal').length;
  return { types: types.size, trackb, evals: evals.length, meet };
}
function cycleEvalStage(name) {
  const list = getEvalList();
  const it = list.find(e => e.name === name);
  if (!it) return;
  const idx = EVAL_STAGES.findIndex(([k]) => k === (it.stage || 'eval'));
  it.stage = EVAL_STAGES[(idx + 1) % EVAL_STAGES.length][0];
  ls('eval_pending', JSON.stringify(list));
  renderFunnel();
}
function removeEvalItem(name) {
  ls('eval_pending', JSON.stringify(getEvalList().filter(e => e.name !== name)));
  renderFunnel();
}
function renderFunnel() {
  const el = document.getElementById('funnelBoard');
  if (!el) return;
  const f = funnelData();
  if (!f.types && !f.trackb && !f.evals) { el.style.display = 'none'; return; }
  const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
  const evals = getEvalList();
  const stageLb = s => (EVAL_STAGES.find(([k]) => k === (s || 'eval')) || [, '평가중'])[1];
  el.innerHTML = `
    <div class="fb-hd">소싱 퍼널 <span class="fb-sub">최근 90일 예측 → 발굴 → 평가 → 미팅·실사 전환</span></div>
    <div class="fb-grid">
      <div class="fb-tile" style="background:var(--acc)"><div class="fb-n">${f.types}</div><div class="fb-l">예측 유형</div><div class="fb-r">최근 90일</div></div>
      <div class="fb-tile" style="background:var(--teal)"><div class="fb-n">${f.trackb}</div><div class="fb-l">TRACK B 후보</div><div class="fb-r">누적 발굴</div></div>
      <div class="fb-tile" style="background:var(--blue)"><div class="fb-n">${f.evals}</div><div class="fb-l">등록평가</div><div class="fb-r">전환 ${pct(f.evals, f.trackb)}</div></div>
      <div class="fb-tile" style="background:var(--pur)"><div class="fb-n">${f.meet}</div><div class="fb-l">미팅·실사+</div><div class="fb-r">전환 ${pct(f.meet, f.evals)}</div></div>
    </div>
    ${evals.length ? `<div class="fb-evals">${evals.slice(0, 10).map(e => `
      <div class="fb-eval">
        <span class="fb-eval-name">${escHtml(e.name)}</span>
        <button class="fb-stage st-${e.stage || 'eval'}" onclick="cycleEvalStage('${escJs(e.name)}')" title="클릭 시 다음 단계로">${stageLb(e.stage)}</button>
        <button class="fb-del" onclick="removeEvalItem('${escJs(e.name)}')" title="목록에서 제거">×</button>
      </div>`).join('')}</div>` : ''}`;
  el.style.display = '';
}

/* ════ 임계값 워치독 — 모멘텀 문턱 초과 시 접속 배너 (서버 없음 → 푸시 아닌 접속 시 알림) ════ */
function checkWatchdog() {
  const el = document.getElementById('watchdogBar');
  if (!el) return;
  const thr = +(ls('m5_watch_threshold') || 25);
  const today = new Date().toISOString().slice(0, 10);
  if (ls('m5_watch_dismiss') === today) { el.style.display = 'none'; return; }
  const hits = [];
  (window._dlTrends || []).forEach(t => { if ((t.delta ?? 0) >= thr) hits.push(`'${t.name}' 검색 +${t.delta}%`); });
  (window._salesTrends || []).forEach(t => { if ((t.delta ?? 0) >= thr) hits.push(`'${t.name}' 구매클릭 +${t.delta}%`); });
  if (!hits.length) { el.style.display = 'none'; return; }
  el.innerHTML = `<b>워치독</b> 모멘텀 문턱(+${thr}%) 초과 ${hits.length}건 — ${hits.slice(0, 3).map(escHtml).join(' · ')}
    <button class="wd-close" onclick="ls('m5_watch_dismiss','${today}');document.getElementById('watchdogBar').style.display='none'">오늘 그만 보기</button>`;
  el.style.display = '';
}

/* ════ 주간 모멘텀 아카이브 — 스냅샷 타임라인(회차별 상위 변동) ════ */
function toggleMomentumArchive() {
  const el = document.getElementById('cyArchive');
  if (!el) return;
  if (el.style.display !== 'none') { el.style.display = 'none'; return; }
  let hist = [];
  try { hist = JSON.parse(ls('m5_momentum_hist') || '[]'); } catch {}
  if (!hist.length) { el.innerHTML = '<div class="cya-empty">아직 축적된 스냅샷이 없습니다 — [전체 수집 실행] 시 자동 축적됩니다.</div>'; el.style.display = ''; return; }
  el.innerHTML = hist.slice(0, 12).map(h => {
    const movers = h.items.filter(i => i.delta !== undefined && i.delta !== null)
      .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0)).slice(0, 4);
    return `<div class="cya-row"><span class="cya-date">${escHtml(h.date)}</span>${
      movers.map(m => `<span class="cya-kw">${escHtml(m.name)} <b class="${m.delta >= 0 ? 'cy-up' : 'cy-dn'}">${m.delta >= 0 ? '+' : ''}${m.delta}%</b></span>`).join('')
    }</div>`;
  }).join('');
  el.style.display = '';
}

async function collectBeautyRSS() {
  /* 한국 뷰티 전문지 — 표준 RSS 경로(/rss/allArticle.xml)는 ndsoft CMS 공통 패턴 */
  const feeds = [
    { url:'https://www.cosinkorea.com/rss/allArticle.xml', name:'코스인코리아' },
    { url:'https://www.jangup.com/rss/allArticle.xml',     name:'장업신문' },
    { url:'https://www.cosmorning.com/rss/allArticle.xml', name:'코스모닝' },
    { url:'https://www.beautynury.com/rss',                name:'뷰티누리' },
  ];
  let count = 0;
  const keywords = [];
  const kwMap = {};
  const companyMentions = [];   /* TRACK B 연동용 업체명 언급 텍스트 */
  const articles = [];          /* ZONE 0 문화 카드 클릭 시 "RSS 분석 근거 자료"로 노출할 기사 제목+링크 */
  /* 병렬 수집 — 순차 수집 시 프록시 체인 누적 지연(피드당 최대 ~40초) 방지 */
  const texts = await Promise.all(feeds.map(f => fetchProxy(f.url, 7000).catch(() => null)));
  texts.forEach((t, fi) => {
    if (!t || !t.includes('<')) return;
    try {
      /* CDATA 방식 + 일반 텍스트 방식 모두 파싱 */
      const titles = [
        ...[...t.matchAll(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g)].map(m => m[1]),
        ...[...t.matchAll(/<title>([^<]{2,})<\/title>/g)].map(m => m[1]).filter(s => !s.includes('<?xml'))
      ];
      const descs = [
        ...[...t.matchAll(/<description><!\[CDATA\[([^\]]{5,500})\]\]><\/description>/g)].map(m => m[1]),
        ...[...t.matchAll(/<description>([^<]{5,500})<\/description>/g)].map(m => m[1])
      ];
      count += titles.length;
      const allText = [...titles, ...descs].join(' ');
      companyMentions.push(allText.slice(0, 2000));
      titles.forEach(tt => {
        TREND_KEYWORDS.forEach(kw => {
          if (tt.includes(kw)) kwMap[kw] = (kwMap[kw]||0)+1;
        });
      });
      /* <item> 단위로 제목+링크를 짝지어 근거 기사 목록 구성 */
      const itemBlocks = [...t.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
      itemBlocks.slice(0, 6).forEach(blk => {
        const tm = blk.match(/<title>(?:<!\[CDATA\[)?([^<\]]+)/);
        const lm = blk.match(/<link>([^<]+)<\/link>/);
        if (tm && lm) articles.push({ title: tm[1].trim(), link: lm[1].trim(), source: feeds[fi].name });
      });
    } catch {}
  });
  const sorted = Object.entries(kwMap).sort((a,b)=>b[1]-a[1]);
  sorted.slice(0,3).forEach(([k]) => keywords.push(k+' 언급'));
  return { count, keywords, kwMap, articles, text: companyMentions.join(' ').slice(0, 4000) };
}

/* 식약처 화장품제조업 등록현황 — Track A/B 제조사 실재성(식약처 등록 여부) 검증용.
   ※ 기존엔 1페이지(100건)만 받아 등록 제조사 수천 곳 중 100곳과만 대조 → 실제 등록
   업체도 "미검증"으로 누락되는 한계가 컸다. 페이지를 끝까지(상한 6000건) 받아 교차검증
   정확도를 끌어올린다. 제품과 무관하게 동일하므로 세션 1회 수집 후 window._gmpCache에 캐시. */
async function collectMFDSGMP() {
  const key = K.public();
  if (!key) return [];
  const ROWS = 1000, MAX_PAGES = 6;   /* 최대 6000건까지 — 등록 제조업 전수에 근접 */
  const all = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `https://apis.data.go.kr/1471000/CsmtcsMnfstRegService01/getCsmtcsMnfstRegInfo?serviceKey=${encodeURIComponent(key)}&pageNo=${page}&numOfRows=${ROWS}&type=json`;
      const t = await fetchProxy(url, 12000);
      if (!t) break;
      let j;
      try { j = JSON.parse(t); } catch { break; }
      const items = j?.response?.body?.items?.item
                  || j?.body?.items?.item
                  || j?.response?.body?.items
                  || [];
      const arr = Array.isArray(items) ? items : (items ? [items] : []);
      if (!arr.length) break;
      arr.forEach(i => {
        const name = i.ENTP_NAME || i.BSSH_NM || '';
        if (name) all.push({ name, addr: i.ADRES || i.ADDR || '', gmpDate: i.APRVL_YMD || '' });
      });
      const total = +(j?.response?.body?.totalCount || j?.body?.totalCount || 0);
      if (arr.length < ROWS || (total && all.length >= total)) break;   /* 마지막 페이지 도달 */
    }
    return all;
  } catch { return all; }
}

/* 식약처 공급 선행신호 — 제형별 '등록 화장품 품목 수' 분포.
   ※ 데이터 소스: 식약처 '화장품 관련 정보'(getCsmtcsPrductInfo) API. 이전엔 '기능성화장품
   보고품목'(getFntnsCsmtcPrdlstInfo)을 썼는데, 이 API는 data.go.kr에서 별도 활용신청이
   필요해 대부분의 키로는 미승인 상태(SERVICE_KEY_NOT_REGISTERED)라 실패했다. '화장품 관련
   정보'는 GMP 업체현황과 함께 널리 승인되는 API이므로 이걸로 전환한다.
   제형 키워드별 totalCount = 그 제형으로 식약처에 등록된 품목 수 = 공급(생산 준비) 규모. */
const SUPPLY_QUERY_FORMS = [
  '앰플', '세럼', '에센스', '크림', '토너', '미스트', '쿠션', '스틱',
  '선크림', '패드', '마스크팩', '클렌징', '밤', '오일',
];

async function collectMFDSSupply() {
  window._supplyTrends = null;
  window._supplyErr = null;
  const key = K.public();
  if (!key) { window._supplyErr = '식약처(공공데이터) 키 미설정'; return; }
  try {
    const results = await Promise.all(SUPPLY_QUERY_FORMS.map(async form => {
      /* numOfRows=1 — totalCount(총 품목 수)만 필요하므로 최소 페이로드 */
      const url = `https://apis.data.go.kr/1471000/CsmtcsPrductInfoService01/getCsmtcsPrductInfo?serviceKey=${encodeURIComponent(key)}&prdlst_nm=${encodeURIComponent(form)}&numOfRows=1&pageNo=1&type=json`;
      const t = await fetchProxy(url, 10000);
      if (!t) return null;
      let j;
      try { j = JSON.parse(t); } catch { return null; }
      const rc = j?.response?.header?.resultCode || j?.header?.resultCode;
      if (rc && rc !== '00') { if (!window._supplyErr) window._supplyErr = `API코드 ${rc}`; return null; }
      const total = +(j?.response?.body?.totalCount || j?.body?.totalCount || 0);
      return { name: form, count: total };
    }));
    const trends = results.filter(r => r && r.count > 0).sort((a, b) => b.count - a.count);
    window._supplyTrends = trends.length ? trends : null;
    if (!trends.length && !window._supplyErr) window._supplyErr = '제형별 등록 품목 0건';
  } catch { window._supplyErr = '수집 실패'; }
}

/* 해외 박람회 선행 트렌드 — 최근 보도에서 성분·제형·패키징 키워드 추출.
   네이버뉴스 최신순 검색 후 기사 발행일(pubDate)을 파싱해 최근 N일 이내 기사만 채택. */
async function collectGlobalExpoTrends() {
  window._expoTrends = null;
  window._expoArticles = null;
  window._expoErr = null;
  const nid = K.naverID(), nsec = K.naverSec();
  if (!nid || !nsec) { window._expoErr = '네이버 API 키 미설정'; return; }
  try {
    const resps = await Promise.all(GLOBAL_EXPO_QUERIES.map(q => {
      const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=20&sort=date`;
      return fetchNaverAPI(url, nid, nsec, 9000);
    }));
    const now = Date.now();
    const maxAge = GLOBAL_EXPO_RECENT_DAYS * 86400000;
    const kwMap = {};
    const articles = [];
    const seenLink = new Set();
    let anyOk = false, recentCount = 0;
    resps.forEach(j => {
      if (!j || j._error) return;
      anyOk = true;
      (j.items || []).forEach(it => {
        /* 최근성 필터 — pubDate(RFC822) 파싱 실패 시 보수적으로 제외 */
        const ts = it.pubDate ? new Date(it.pubDate).getTime() : NaN;
        if (isNaN(ts) || (now - ts) > maxAge || (now - ts) < 0) return;
        recentCount++;
        const title = (it.title || '').replace(/<[^>]+>/g, '');
        const text = `${title} ${it.description || ''}`.replace(/<[^>]+>/g, '');
        TREND_KEYWORDS.forEach(kw => { if (text.includes(kw)) kwMap[kw] = (kwMap[kw] || 0) + 1; });
        if (it.link && !seenLink.has(it.link) && articles.length < 8) {
          seenLink.add(it.link);
          articles.push({ title, link: it.link });
        }
      });
    });
    if (!anyOk) { window._expoErr = '뉴스 응답 없음'; return; }
    if (!recentCount) { window._expoErr = `최근 ${GLOBAL_EXPO_RECENT_DAYS}일 내 관련 보도 없음`; return; }
    const ranked = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    window._expoTrends = ranked.length ? ranked : null;
    window._expoArticles = articles.length ? articles : null;
    if (!ranked.length) window._expoErr = `최근 보도 ${recentCount}건 — 트렌드 키워드 미검출`;
  } catch { window._expoErr = '수집 실패'; }
}

/* ════════════ 제형 트렌드 레이더 (Formulation Trend Radar) ════════════
   기획안 구조 반영 — 성분이 아니라 '제형'을 예측 단위로 삼고,
   성분(Ingredient) → 제형(Formulation) → 패키징(Packaging) → 생산설비(CAPA)로
   이어지는 제조업 관점 조기경보 체계.

   점수 = SNS·콘텐츠 35% + 검색 30% + 신제품 25% + 글로벌 선행 10%
   ※ 수집되지 않은 축은 가중치에서 제외하고 재정규화한다. 없는 데이터를 중립값으로
     채워 점수를 만들어내지 않고, 대신 커버리지를 신뢰도로 함께 표기한다. */
const FORM_WEIGHTS = { sns: 0.35, search: 0.30, launch: 0.25, global: 0.10 };
const FORM_WLABEL  = { sns: 'SNS·콘텐츠', search: '검색', launch: '신제품', global: '글로벌 선행' };

/* 제형 표준 분류 — 기획안 Phase 1 체계. capa=필요 설비, pkg=대표 포장형태, ing=연관 성분 */
const FORMULATIONS = [
  { code:'CRM', name:'크림',        en:'Cream',            group:'스킨케어', re:/크림|cream/i,
    hint:'유화물 전반(수분·영양·선크림 포함)', pkg:['자(Jar)','튜브','에어리스 펌프'],
    capa:['유화 설비(호모믹서)','고점도 충진기','자·튜브 캡핑'], ing:['콜라겐','세라마이드','레티놀'] },
  { code:'AMP', name:'앰플',        en:'Ampoule',          group:'스킨케어', re:/앰플|ampoule/i,
    hint:'고농축 저점도 — 정밀·무균 충진', pkg:['앰플 바이알','드로퍼 보틀','소용량 파우치'],
    capa:['저점도 정밀 충진','저온·무균 라인','드로퍼 조립'], ing:['PDRN','엑소좀','글루타치온'] },
  { code:'TON', name:'토너',        en:'Toner',            group:'스킨케어', re:/토너|toner/i, ex:/패드|pad/i,
    hint:'액상 대용량', pkg:['대용량 보틀','펌프 보틀'],
    capa:['저점도 대용량 충진','인라인 여과'], ing:['판테놀','시카'] },
  { code:'LOT', name:'로션·에멀전', en:'Lotion',           group:'스킨케어', re:/로션|lotion|에멀[전젼]|emulsion/i,
    hint:'중점도 유화물', pkg:['펌프 보틀','튜브'],
    capa:['유화 설비','중점도 충진기'], ing:['세라마이드','콜라겐'] },
  { code:'ESS', name:'에센스·세럼', en:'Essence/Serum',    group:'스킨케어', re:/에센스|essence|세럼|serum/i,
    hint:'가용화·저점도 기능성', pkg:['드로퍼','펌프 보틀','에어리스'],
    capa:['가용화 설비','저점도 충진','산화방지 충진'], ing:['PDRN','레티놀','펩타이드'] },

  { code:'SHT', name:'시트마스크',  en:'Sheet Mask',       group:'마스크',   re:/시트\s?마스크|마스크\s?팩|마스크팩|sheet\s?mask/i, ex:/하이드로겔|바이오|슬리핑|sleeping/i,
    hint:'부직포 시트 함침', pkg:['개별 파우치'],
    capa:['시트 함침 라인','파우치 실링','자동 폴딩'], ing:['히알루론산','시카'] },
  { code:'HYD', name:'하이드로겔 마스크', en:'Hydrogel Mask', group:'마스크', re:/하이드로겔|hydro\s?gel|hydrogel/i,
    hint:'겔 캐스팅·성형 — 트레이 수요 직결', pkg:['개별 트레이','파우치'],
    capa:['겔 캐스팅·성형','저온 경화','트레이 인서트'], ing:['PDRN','콜라겐','스피큘'] },
  { code:'BIO', name:'바이오셀룰로오스', en:'Bio-cellulose', group:'마스크', re:/바이오\s?셀룰로|bio-?cellulose/i,
    hint:'배양 시트 — 고단가 프리미엄', pkg:['개별 파우치+지지필름'],
    capa:['배양시트 취급','습식 함침','클린 실링'], ing:['엑소좀','콜라겐'] },
  { code:'SLP', name:'슬리핑 마스크', en:'Sleeping Mask',  group:'마스크',   re:/슬리핑\s?(마스크|팩)|sleeping\s?(mask|pack)|수면\s?팩/i,
    hint:'고점도 도포형', pkg:['자(Jar)','튜브'],
    capa:['고점도 유화','자 충진'], ing:['레티놀','세라마이드'] },

  { code:'TPD', name:'토너패드',    en:'Toner Pad',        group:'패드',     re:/토너\s?패드|toner\s?pad|패드|pad/i, ex:/아이\s?패치|eye\s?patch|겔\s?패드/i,
    hint:'패드 적층·함침 — 리필 포맷 확대', pkg:['원형 자','리필 파우치'],
    capa:['패드 자동 투입·적층','액 함침 정량','자 실링'], ing:['시카','판테놀','글루타치온'] },
  { code:'GPD', name:'겔패드',      en:'Gel Pad',          group:'패드',     re:/겔\s?패드|gel\s?pad/i,
    hint:'겔 성형 패드', pkg:['트레이','자(Jar)'],
    capa:['겔 성형','패드 적층','트레이 인서트'], ing:['PDRN','히알루론산'] },
  { code:'EYE', name:'아이패치',    en:'Eye Patch',        group:'패드',     re:/아이\s?패치|eye\s?patch|언더아이|under-?eye/i,
    hint:'개별 트레이 자동화 필요 — 설비 투자 핵심', pkg:['개별 트레이','자(Jar)'],
    capa:['겔 커팅·성형','개별 트레이 인서트(자동화)','트레이 실링'], ing:['PDRN','엑소좀','펩타이드'] },

  { code:'STK', name:'스틱·밤',     en:'Stick',            group:'특수 제형', re:/스틱|stick|멀티밤|립밤|밤\s?스틱|balm/i,
    hint:'고형 몰딩 — 휴대 포맷 확산', pkg:['스틱 용기(트위스트업)','회전식 용기'],
    capa:['고형 성형(몰딩)','냉각 라인','스틱 조립'], ing:['세라마이드','펩타이드'] },
  { code:'MST', name:'미스트',      en:'Mist',             group:'특수 제형', re:/미스트|mist|스프레이|spray|분무/i,
    hint:'분무 충진·노즐', pkg:['스프레이 보틀','펌프'],
    capa:['분무 충진','점도대응 노즐 조립','기밀 검사'], ing:['판테놀','히알루론산'] },
  { code:'PWD', name:'파우더',      en:'Powder',           group:'특수 제형', re:/파우더|powder|분말/i,
    hint:'분체 계량·방습', pkg:['병','소분 스틱팩'],
    capa:['분체 계량·충진','방습 포장','제진 설비'], ing:['글루타치온','효소'] },
  { code:'CAP', name:'캡슐',        en:'Capsule',          group:'특수 제형', re:/캡슐|capsule/i,
    hint:'봉입·블리스터', pkg:['블리스터','자(Jar)'],
    capa:['캡슐 성형·봉입','블리스터 실링'], ing:['레티놀','엑소좀'] },
  { code:'POG', name:'필오프겔',    en:'Peel-Off Gel',     group:'특수 제형', re:/필\s?오프|peel-?off|필링\s?겔/i,
    hint:'피막 형성 겔', pkg:['튜브','자(Jar)'],
    capa:['겔 배합','고점도 충진'], ing:['효소','AHA'] },
];

/* 제형 진화 경로 — 트렌드는 단독 발생이 아니라 경로를 따라 이동한다(기획안 8장) */
const EVOLUTION_PATHS = [
  { title: '마스크 → 패치 → 트레이', codes: ['SHT', 'BIO', 'HYD', 'EYE'], end: '개별 트레이 설비 수요' },
  { title: '크림 → 스틱 → 휴대 포맷', codes: ['CRM', 'STK'], end: '휴대형 고형 성형 라인' },
  { title: '액상 → 패드화',           codes: ['TON', 'TPD', 'GPD'], end: '패드 적층·함침 자동화' },
  { title: '고농축 안정화',           codes: ['ESS', 'AMP', 'CAP'], end: '무균·봉입 설비' },
];

/* 핵심 성분(기획안 Phase 2) — 신호에서 언급을 잡아 제형과 연결 */
const KEY_INGREDIENTS = ['PDRN', '엑소좀', '레티놀', '콜라겐', '글루타치온', '스피큘'];

function formMatches(f, name) {
  const n = String(name || '');
  if (!n) return false;
  if (f.ex && f.ex.test(n)) return false;
  return f.re.test(n);
}
const clamp100 = v => Math.max(0, Math.min(100, Math.round(v)));
/* 증감률(%) → 0~100 점수. 0% = 50점, +40% ≈ 98점, -40% ≈ 2점 */
const deltaToScore = d => clamp100(50 + d * 1.2);

/* 4개 축 신호 풀 구성 — 각 항목은 {name, delta?|count?, src} */
function radarPools() {
  const P = { sns: [], search: [], launch: [], global: [] };
  (window._ytTrends || []).forEach(t => P.sns.push({ name: t.name, delta: t.delta, src: 'YouTube' }));
  (window._reddit  || []).forEach(t => P.sns.push({ name: t.name, count: t.count, src: 'Reddit' }));
  (window._dlTrends || []).forEach(t => P.search.push({ name: t.name, delta: t.delta, src: '네이버검색' }));
  (window._salesTrends || []).forEach(t => P.search.push({ name: t.name, delta: t.delta, src: '쇼핑클릭' }));
  (window._supplyTrends || []).forEach(t => P.launch.push({ name: t.name, count: t.count, src: '식약처 등록' }));
  (window._productRadar || []).forEach(t => P.launch.push({ name: t.title, count: 1, src: '출시보도' }));
  (window._newsTrends || []).forEach(t => P.launch.push({ name: t.name, count: t.count, src: '뉴스언급' }));
  (window._gtrends || []).forEach(t => P.global.push({ name: t.name, delta: t.delta, src: 'GTrends' }));
  (window._expoTrends || []).forEach(t => P.global.push({ name: t.name, count: t.count, src: '해외박람회' }));
  /* Layer1 글로벌 리테일(Sephora·Ulta·@cosme·샤오홍슈) — 이미 제형 단위로 집계된 신호 */
  ((window._globalRetail || {}).formulations || []).forEach(f =>
    P.global.push({ name: f.name, count: f.mentions, src: `글로벌리테일(${f.platforms.join('·')})` }));
  return P;
}

/* 제형별 트렌드 점수 산출 — 매칭된 신호만 사용하고 커버리지를 함께 반환 */
function computeFormulationRadar() {
  const P = radarPools();
  if (!Object.values(P).some(a => a.length)) return null;
  /* 1차: 제형별 축별 매칭 수집 */
  const rows = FORMULATIONS.map(f => {
    const m = {};
    Object.keys(P).forEach(k => { m[k] = P[k].filter(it => formMatches(f, it.name)); });
    return { f, m };
  });
  /* count 축은 제형 간 상대 규모로 환산해야 하므로 축별 최대값 확보 */
  const maxCount = {};
  Object.keys(P).forEach(k => {
    maxCount[k] = Math.max(1, ...rows.map(r => r.m[k].reduce((s, x) => s + (x.count || 0), 0)));
  });
  /* 2차: 축 점수 → 가중 합(커버리지 재정규화) */
  const out = rows.map(({ f, m }) => {
    const comp = {}; let wsum = 0, acc = 0;
    Object.keys(P).forEach(k => {
      const hits = m[k];
      if (!hits.length) { comp[k] = null; return; }
      const ds = hits.filter(h => typeof h.delta === 'number').map(h => h.delta);
      const cSum = hits.reduce((s, h) => s + (h.count || 0), 0);
      const byDelta = ds.length ? deltaToScore(ds.reduce((s, x) => s + x, 0) / ds.length) : null;
      const byCount = cSum ? clamp100(40 + 55 * (cSum / maxCount[k])) : null;
      const s = byDelta !== null && byCount !== null ? Math.round((byDelta + byCount) / 2)
              : byDelta !== null ? byDelta : byCount;
      comp[k] = { score: s, hits, srcs: [...new Set(hits.map(h => h.src))] };
      wsum += FORM_WEIGHTS[k]; acc += FORM_WEIGHTS[k] * s;
    });
    const score = wsum ? Math.round(acc / wsum) : null;
    const coverage = Math.round(wsum * 100);
    const srcCount = new Set(Object.values(comp).filter(Boolean).flatMap(c => c.srcs)).size;
    /* 커버리지 50% 미만(4축 중 1축 수준)은 점수가 높아도 '데이터 부족'으로 표기·후순위.
       관측이 얕은 제형이 상위를 차지해 설비 투자 오판을 부르는 것을 막는다. */
    const thin = coverage < 50;
    return { ...f, score, coverage, comp, srcCount, thin,
      grade: score === null ? null : thin ? '데이터 부족'
           : score >= 80 ? '고성장' : score >= 70 ? '관찰' : score >= 60 ? '유지' : '낮음' };
  }).filter(r => r.score !== null);
  out.sort((a, b) => (a.thin - b.thin) || (b.score - a.score) || (b.coverage - a.coverage));
  return out.length ? out : null;
}

/* 신호에서 핵심 성분 언급 집계 — 체인의 '성분' 단계 */
function ingredientSignals() {
  const pool = [...(window._dlTrends || []), ...(window._newsTrends || []), ...(window._reddit || []),
                ...(window._expoTrends || []), ...(window._salesTrends || [])];
  return KEY_INGREDIENTS.map(ing => {
    const hits = pool.filter(t => String(t.name || '').toLowerCase().includes(ing.toLowerCase()));
    return { name: ing, hits: hits.length };
  }).filter(x => x.hits > 0);
}

const gradeCls = g => g === '고성장' ? 'fg-hi' : g === '관찰' ? 'fg-watch' : g === '유지' ? 'fg-keep' : 'fg-low';
/* 제형 레이더 표기 정책: 커버리지 50% 미만은 '데이터 부족'으로 낮음 계열 표시 */

function renderFormulationRadar() {
  const el = document.getElementById('zForm');
  if (!el) return;
  const rows = window._formRadar;
  if (!rows || !rows.length) { el.style.display = 'none'; return; }
  const top = rows.slice(0, 8);
  el.innerHTML = `
    <div class="zone-hd">
      <div class="zone-title">제형 트렌드 레이더 <span class="ztag">성분 → 제형 → 패키징 → 생산설비(CAPA)</span></div>
      <button class="btn-hd btn-bt-toggle" onclick="openEvolutionPaths()">제형 진화 경로</button>
      <span class="zmodel">SNS 35 · 검색 30 · 신제품 25 · 글로벌 10</span>
    </div>
    <div class="fr-grid">${top.map(r => `
      <div class="fr-card" onclick="openFormulationChain('${r.code}')" title="클릭 시 패키징·설비(CAPA)·팀별 액션 확인">
        <div class="fr-top">
          <div>
            <div class="fr-name">${escHtml(r.name)}</div>
            <div class="fr-en">${escHtml(r.en)} · ${escHtml(r.group)}</div>
          </div>
          <div class="fr-score ${gradeCls(r.grade)}">${r.score}</div>
        </div>
        <div class="fr-grade ${gradeCls(r.grade)}">${r.grade}</div>
        <div class="fr-bars">${Object.keys(FORM_WEIGHTS).map(k => {
          const c = r.comp[k];
          return `<div class="fr-bar-row" title="${FORM_WLABEL[k]} ${Math.round(FORM_WEIGHTS[k]*100)}%${c ? ` — ${c.score}점 (${c.srcs.join('·')})` : ' — 데이터 없음'}">
            <span class="fr-bl">${FORM_WLABEL[k]}</span>
            <span class="fr-bt"><b style="width:${c ? c.score : 0}%"></b></span>
            <span class="fr-bv">${c ? c.score : '—'}</span>
          </div>`;
        }).join('')}</div>
        <div class="fr-foot">신뢰도 ${r.coverage}% · ${r.srcCount}개 채널 포착 · 설비: ${escHtml(r.capa[0])}</div>
      </div>`).join('')}</div>
    ${layer1StatusHtml()}
    <div class="fr-note">※ 점수는 수집된 축만으로 가중 재정규화해 산출하며, 미수집 축은 중립값으로 채우지 않고 신뢰도(커버리지)로 표기합니다. 80↑ 고성장 · 70~79 관찰 · 60~69 유지 · 60↓ 낮음 · 신뢰도 50% 미만은 '데이터 부족'으로 후순위 표기</div>`;
  el.style.display = '';
}

/* Layer1 글로벌 선행시장 수집 상태 — 어떤 플랫폼이 '공식 피드 실측'이고 어떤 것이
   '공개 보도 대리'인지 화면에서 구분되게 표기(대리 신호를 실측처럼 보이지 않게). */
function layer1StatusHtml() {
  const gr = window._globalRetail;
  if (!gr || !(gr.sources || []).length) {
    return `<div class="l1-bar l1-off"><b>Layer1 글로벌 선행시장</b> 미수집 — 서버 수집(GitHub Actions) 1회 실행 후 표시됩니다</div>`;
  }
  const chips = gr.sources.map(s => {
    const cls = !s.ok ? 'l1-fail' : s.mode === '공식 피드' ? 'l1-live' : 'l1-proxy';
    const lbl = !s.ok ? '실패' : s.mode === '공식 피드' ? '공식 피드' : '보도 대리';
    return `<span class="l1-chip ${cls}" title="${escHtml(s.mode)}${s.ok ? ` · ${s.items}건` : ` · ${escHtml(s.note || '')}`}">${escHtml(s.platform)} <em>${lbl}</em></span>`;
  }).join('');
  const anyLive = gr.sources.some(s => s.ok && s.mode === '공식 피드');
  return `<div class="l1-bar"><b>Layer1 글로벌 선행시장</b>${chips}
    <span class="l1-note">${anyLive ? '공식 피드는 실측, 보도 대리는 방향성 참고용' : '전부 공개 보도 기반 대리 신호 — 플랫폼 직접수집 아님(정식 피드 등록 시 실측 전환)'}</span></div>`;
}

/* 제형 → 패키징 → 설비 → 팀별 액션 체인 모달 */
function openFormulationChain(code) {
  const r = (window._formRadar || []).find(x => x.code === code) || FORMULATIONS.find(x => x.code === code);
  if (!r) return;
  const ings = ingredientSignals().filter(i => r.ing.some(x => x === i.name));
  const path = EVOLUTION_PATHS.find(p => p.codes.includes(code));
  const nm = n => (FORMULATIONS.find(f => f.code === n) || {}).name || n;
  /* 운영 KPI(기획안 9장) */
  const kpi = r.comp ? [
    ['Trend Acceleration', r.score, '제형 성장 속도 종합'],
    ['Product Launch Rate', r.comp.launch ? r.comp.launch.score : null, '신제품·등록 품목 확산'],
    ['Global Lead Score', r.comp.global ? r.comp.global.score : null, '글로벌 선행시장 신호'],
    ['Adoption(채널 폭)', r.srcCount ? Math.min(100, r.srcCount * 20) : null, `${r.srcCount || 0}개 채널에서 포착`],
    ['Trend Confidence', r.coverage, '데이터 커버리지 기반 신뢰도'],
  ] : [];
  let body = `<div class="gm-block">
    <div class="gm-block-title">${escHtml(r.name)} (${escHtml(r.en)}) — 제조 체인</div>
    <div class="gm-note2">${escHtml(r.hint)}</div>
    <div class="chain">
      <div class="chain-step"><span class="cs-lb">성분</span><span class="cs-v">${(ings.length ? ings.map(i => i.name) : r.ing).map(escHtml).join(' · ')}</span></div>
      <div class="chain-arrow">↓</div>
      <div class="chain-step chain-key"><span class="cs-lb">제형</span><span class="cs-v">${escHtml(r.name)}${r.score !== undefined && r.score !== null ? ` <b>${r.score}점 · ${r.grade}</b>` : ''}</span></div>
      <div class="chain-arrow">↓</div>
      <div class="chain-step"><span class="cs-lb">패키징</span><span class="cs-v">${r.pkg.map(escHtml).join(' · ')}</span></div>
      <div class="chain-arrow">↓</div>
      <div class="chain-step chain-capa"><span class="cs-lb">생산설비</span><span class="cs-v">${r.capa.map(escHtml).join(' · ')}</span></div>
    </div>
  </div>`;
  if (kpi.length) {
    body += `<div class="gm-block"><div class="gm-block-title">운영 KPI</div><div class="kpi-grid">${
      kpi.map(([k, v, d]) => `<div class="kpi-c"><div class="kpi-n">${v === null ? '—' : v}</div><div class="kpi-k">${escHtml(k)}</div><div class="kpi-d">${escHtml(d)}</div></div>`).join('')
    }</div></div>`;
  }
  if (r.comp) {
    body += `<div class="gm-block"><div class="gm-block-title">점수 산출 근거 — 어떤 신호가 이 점수를 만들었나</div><ul class="gm-list">${
      Object.keys(FORM_WEIGHTS).map(k => {
        const c = r.comp[k];
        if (!c) return `<li>${FORM_WLABEL[k]} (가중 ${Math.round(FORM_WEIGHTS[k]*100)}%) — <span style="color:var(--ink3)">수집 데이터 없음 · 가중치에서 제외</span></li>`;
        const ex = c.hits.slice(0, 3).map(h => `${escHtml(h.name)}${typeof h.delta === 'number' ? ` ${h.delta >= 0 ? '+' : ''}${h.delta}%` : ` ${h.count}건`}`).join(', ');
        return `<li>${FORM_WLABEL[k]} (가중 ${Math.round(FORM_WEIGHTS[k]*100)}%) — <b>${c.score}점</b> · ${escHtml(c.srcs.join('·'))} · ${ex}</li>`;
      }).join('')
    }</ul></div>`;
  }
  if (path) {
    body += `<div class="gm-block"><div class="gm-block-title">제형 진화 경로 — ${escHtml(path.title)}</div>
      <div class="evo-line">${path.codes.map(c2 => {
        const s = (window._formRadar || []).find(x => x.code === c2);
        return `<span class="evo-node${c2 === code ? ' evo-cur' : ''}">${escHtml(nm(c2))}${s ? `<em>${s.score}</em>` : ''}</span>`;
      }).join('<span class="evo-arr">→</span>')}<span class="evo-arr">→</span><span class="evo-end">${escHtml(path.end)}</span></div>
      <div class="gm-note2">경로 상 앞 단계가 오르면 뒤 단계와 그 설비 수요가 따라온다 — 선제 CAPA 검토 근거.</div></div>`;
  }
  body += `<div class="gm-block"><div class="gm-block-title">팀별 실행 액션</div><ul class="gm-list">
    <li><b>개발</b> — ${escHtml(r.name)} 처방 선행 개발 (${escHtml(r.ing.join('·'))} 조합 안정성·호환성 검토)</li>
    <li><b>구매</b> — ${escHtml(r.ing[0] || '핵심')} 원료 확보 및 ${escHtml(r.pkg[0])} 부자재 공급처 이원화</li>
    <li><b>생산</b> — ${escHtml(r.capa.join(' → '))} 보유 여부 점검 후 CAPA 산정${r.capa.some(c => /자동화|인서트/.test(c)) ? ' · 자동화 투자 검토' : ''}</li>
    <li><b>경영</b> — ${r.grade === '고성장' ? '설비 투자 우선순위 상위 배치 · 신규 라인 검토' : '분기 재평가 대상으로 관찰'}</li>
  </ul></div>`;
  body += `<div class="gm-note">📸 ${new Date().toLocaleString('ko-KR')} 수집 신호 기준 · 최종 CAPA 결정 전 설비 실사 필요</div>`;
  document.getElementById('sigModalTitle').textContent = `${r.name} — 제형 트렌드 & CAPA 체인`;
  document.getElementById('sigModalBody').innerHTML = body;
  document.getElementById('sigOverlay').classList.add('open');
}

function openEvolutionPaths() {
  const nm = c => (FORMULATIONS.find(f => f.code === c) || {}).name || c;
  const body = EVOLUTION_PATHS.map(p => `<div class="gm-block">
    <div class="gm-block-title">${escHtml(p.title)}</div>
    <div class="evo-line">${p.codes.map(c => {
      const s = (window._formRadar || []).find(x => x.code === c);
      return `<span class="evo-node${s && s.grade === '고성장' ? ' evo-hot' : ''}" onclick="openFormulationChain('${c}')">${escHtml(nm(c))}${s ? `<em>${s.score}</em>` : ''}</span>`;
    }).join('<span class="evo-arr">→</span>')}<span class="evo-arr">→</span><span class="evo-end">${escHtml(p.end)}</span></div>
  </div>`).join('') + `<div class="gm-note">경로 앞 단계의 점수 상승은 뒤 단계 제형·설비 수요의 선행 신호입니다. 제형명을 클릭하면 해당 CAPA 체인이 열립니다.</div>`;
  document.getElementById('sigModalTitle').textContent = '제형 진화 경로 (Formulation Evolution Path)';
  document.getElementById('sigModalBody').innerHTML = body;
  document.getElementById('sigOverlay').classList.add('open');
}

/* 예측 프롬프트용 제형 레이더 블록 */
function formRadarPromptBlock() {
  const rows = window._formRadar;
  if (!rows || !rows.length) return '';
  const top = rows.slice(0, 10);
  return `\n[제형 트렌드 레이더 — 제형별 종합 점수 (SNS35·검색30·신제품25·글로벌10 가중, 실측 신호 기반)]\n`
    + top.map(r => `${r.name}(${r.en}) ${r.score}점/${r.grade} · 신뢰도 ${r.coverage}%${r.thin ? '(관측 얕음 — 참고만)' : ''} · 설비:${r.capa[0]}`).join('\n')
    + `\n※ 이 시스템의 예측 단위는 성분이 아니라 '제형'이다. 위 점수가 높은 제형을 우선 반영하고, 각 예측의 formulation 필드에는 반드시 위 목록의 제형명을 그대로 적어라. packaging·tech는 그 제형의 실제 포장형태·생산설비와 일치해야 한다.`;
}

/* ════ 트렌드 라이프사이클 맵 — 모멘텀 스냅샷 누적 → 태동/성장/성숙/쇠퇴 분류 ════
   수집 때마다 키워드 모멘텀(검색·구매·뉴스·수출)을 날짜별로 localStorage에 누적하고,
   현재 수치(레벨)와 이전 스냅샷 대비 변화(기울기)로 4단계를 분류한다.
   "성장기만 예측 후보, 쇠퇴기는 회피"가 예측 프롬프트에 규칙으로 주입된다. */
function recordMomentumSnapshot() {
  try {
    const items = [];
    (window._dlTrends || []).forEach(t => items.push({ name: t.name, delta: t.delta, src: 'search' }));
    (window._salesTrends || []).forEach(t => items.push({ name: t.name, delta: t.delta, src: 'shop' }));
    (window._exportTrends || []).forEach(t => items.push({ name: t.name, delta: t.delta, src: 'export' }));
    (window._newsTrends || []).forEach(t => items.push({ name: t.name, count: t.count, src: 'news' }));
    (window._ytTrends || []).forEach(t => items.push({ name: t.name, delta: t.delta, src: 'youtube' }));
    (window._gtrends || []).forEach(t => items.push({ name: t.name, delta: t.delta, src: 'gtrends' }));
    (window._reddit || []).forEach(t => items.push({ name: t.name, count: t.count, src: 'reddit' }));
    if (!items.length) return;
    const hist = JSON.parse(ls('m5_momentum_hist') || '[]');
    const today = new Date().toISOString().slice(0, 10);
    const di = hist.findIndex(h => h.date === today);
    if (di >= 0) hist.splice(di, 1);              /* 같은 날 재수집은 최신으로 대체 */
    hist.unshift({ date: today, items });
    ls('m5_momentum_hist', JSON.stringify(hist.slice(0, 30)));   /* 최근 30회 스냅샷 보존 */
  } catch {}
}
function computeLifecycle() {
  /* 현재 스냅샷: 키워드별 대표 delta(최대)·등장 소스 수·뉴스 언급 */
  const cur = {};
  const add = (name, delta, src, count) => {
    if (!name) return;
    const k = cur[name] = cur[name] || { name, delta: null, srcs: new Set(), news: 0 };
    if (delta !== undefined && delta !== null) k.delta = k.delta === null ? delta : Math.max(k.delta, delta);
    if (count) k.news += count;
    k.srcs.add(src);
  };
  (window._dlTrends || []).forEach(t => add(t.name, t.delta, 'search'));
  (window._salesTrends || []).forEach(t => add(t.name, t.delta, 'shop'));
  (window._exportTrends || []).forEach(t => add(t.name, t.delta, 'export'));
  (window._newsTrends || []).forEach(t => add(t.name, null, 'news', t.count));
  (window._ytTrends || []).forEach(t => add(t.name, t.delta, 'youtube'));
  (window._gtrends || []).forEach(t => add(t.name, t.delta, 'gtrends'));
  (window._reddit || []).forEach(t => add(t.name, null, 'reddit', t.count));
  const list = Object.values(cur);
  if (!list.length) return null;
  /* 이전 스냅샷(7일 이상 전)에서 같은 키워드의 delta → 기울기 */
  let prevMap = {};
  try {
    const hist = JSON.parse(ls('m5_momentum_hist') || '[]');
    const weekAgo = Date.now() - 7 * 86400000;
    const prev = hist.find(h => new Date(h.date).getTime() <= weekAgo);
    if (prev) prev.items.forEach(it => { if (it.delta !== undefined) prevMap[it.name] = it.delta; });
  } catch {}
  const stages = { emerge: [], grow: [], mature: [], decline: [] };
  list.forEach(k => {
    const d = k.delta ?? 0;
    const presence = k.srcs.size + (k.news >= 5 ? 1 : 0);
    const slope = prevMap[k.name] !== undefined ? d - prevMap[k.name] : null;
    let stage;
    if (d <= -8) stage = 'decline';
    else if (d < 8) stage = 'mature';
    else if (slope !== null && slope < -5) stage = 'mature';   /* 모멘텀 꺾임 → 성숙 전환 */
    else stage = presence >= 2 ? 'grow' : 'emerge';
    stages[stage].push({ name: k.name, delta: k.delta, news: k.news, slope });
  });
  const byDelta = (a, b) => (b.delta ?? 0) - (a.delta ?? 0);
  Object.values(stages).forEach(a => a.sort(byDelta));
  return stages;
}
function renderLifecycle() {
  const el = document.getElementById('zCycle');
  if (!el) return;
  const st = window._lifecycle;
  if (!st) { el.style.display = 'none'; return; }
  const COLS = [
    ['emerge',  '태동기', '탐색',      ''],
    ['grow',    '성장기', '예측 적기', 'cy-grow'],
    ['mature',  '성숙기', '수주 경쟁', ''],
    ['decline', '쇠퇴기', '회피',      ''],
  ];
  const fmt = k => {
    const v = k.delta !== null && k.delta !== undefined
      ? `<span class="cy-mo ${k.delta >= 8 ? 'cy-up' : k.delta <= -8 ? 'cy-dn' : 'cy-fl'}">${k.delta >= 0 ? '+' : ''}${k.delta}%</span>`
      : `<span class="cy-mo cy-fl">${k.news}건</span>`;
    return `<div class="cy-kw"><span>${escHtml(k.name)}</span>${v}</div>`;
  };
  el.innerHTML = `
    <div class="zone-hd"><div class="zone-title">트렌드 라이프사이클 <span class="ztag">주간 기울기 기반 자동 분류 · 태동·성장만 예측 후보</span></div>
      <button class="btn-hd btn-bt-toggle" onclick="toggleMomentumArchive()">주간 아카이브</button>
      <span class="zmodel">검색+구매+뉴스+수출 모멘텀 교차</span></div>
    <div class="cy-grid">
      ${COLS.map(([key, name, sub, cls]) => `
        <div class="cy-col ${cls}">
          <div class="cy-col-hd">${name} <em>${sub}</em></div>
          ${st[key].slice(0, 5).map(fmt).join('') || '<div class="cy-none">해당 없음</div>'}
        </div>`).join('')}
    </div>
    <div id="cyArchive" class="cy-archive" style="display:none"></div>`;
  el.style.display = '';
}

/* ════ 동년 동월 시즌 앵커 — 작년 같은 시기(±65일) 예측·판정 이력과 대조 ════ */
function seasonAnchorForType(type) {
  try {
    const hist = getLedgerHist();
    const now = Date.now();
    const toks = extractSearchKw(type).split(' ').filter(w => w.length >= 2);
    for (const e of hist) {
      const age = now - e.ts;
      if (age < 300 * 86400000 || age > 430 * 86400000) continue;   /* 약 1년 전 창 */
      for (let i = 0; i < (e.predictions || []).length; i++) {
        const p = e.predictions[i];
        const tb = new Set(extractSearchKw(p.type).split(' ').filter(w => w.length >= 2));
        if (!toks.some(w => tb.has(w))) continue;
        const j = e.judgments?.[i];
        return { type: p.type, verdict: j ? j.v : (e.details?.[i]?.hit ? 'signal' : null) };
      }
    }
  } catch {}
  return null;
}

/* ════ 신제품 레이더 — 뉴스 출시 감지 → 예측 유형 매칭 → 원장 자동 증거 첨부 ════ */
async function collectProductRadar() {
  window._productRadar = null;
  const nid = K.naverID(), nsec = K.naverSec();
  if (!nid || !nsec || !PREDICTIONS.length) return;
  try {
    const resps = await Promise.all(['화장품 신제품 출시', '뷰티 신제품'].map(q =>
      fetchNaverAPI(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=20&sort=date`, nid, nsec, 9000)));
    const now = Date.now(), RECENT = 45 * 86400000;
    const matches = [];
    const seen = new Set();
    resps.forEach(j => {
      if (!j || j._error) return;
      (j.items || []).forEach(it => {
        const ts = it.pubDate ? new Date(it.pubDate).getTime() : NaN;
        if (isNaN(ts) || now - ts > RECENT) return;
        const title = (it.title || '').replace(/<[^>]+>/g, '');
        if (seen.has(title)) return;
        for (const p of PREDICTIONS) {
          if (isRelevantToProductType(title, extractSearchKw(p.type))) {
            seen.add(title);
            matches.push({ rank: p.rank, type: p.type, title, link: it.link || '' });
            break;
          }
        }
      });
    });
    window._productRadar = matches.slice(0, 8);
    /* 오늘 원장 엔트리에 검증 증거로 첨부 — 판정 시 참고 자료가 된다 */
    if (matches.length) {
      const hist = getLedgerHist();
      const today = new Date().toDateString();
      const e = hist.find(h => new Date(h.ts).toDateString() === today);
      if (e) { e.radar = matches.slice(0, 8).map(m => ({ rank: m.rank, title: m.title, link: m.link })); ls('m5_history', JSON.stringify(hist)); }
    }
  } catch {}
}
function renderRadar() {
  const el = document.getElementById('radarStrip');
  if (!el) return;
  const r = window._productRadar;
  if (!r || !r.length) { el.style.display = 'none'; return; }
  el.innerHTML = `<span class="radar-lb">신제품 레이더</span> 최근 45일 출시 보도 중 예측 관련 <b>${r.length}건</b> 감지 — ` +
    r.slice(0, 3).map(m => `<a href="${escHtml(m.link)}" target="_blank" class="radar-item">[${m.rank}위 관련] ${escHtml(m.title.slice(0, 28))}…</a>`).join(' · ') +
    ` <span class="radar-note">→ 원장에 검증 증거로 자동 첨부됨</span>`;
  el.style.display = '';
}

/* ════ 데이터 품질 게이지 + 신뢰도 상한(캡) ════
   12개 신호 소스 중 "실데이터로 수집된" 비율을 산정. 샘플·미수집이 많을수록 예측
   신뢰도에 상한을 걸어, 샘플로 만든 88%가 진짜 88%처럼 보이는 것을 구조적으로 차단. */
function computeDataQuality() {
  const items = [
    ['기후 신호',        !!(SIG_DATA.climate && !SIG_DATA.climate._sample)],
    ['사회 신호',        !!(SIG_DATA.society && !SIG_DATA.society._sample)],
    ['경제 신호',        !!(SIG_DATA.economy && !SIG_DATA.economy._sample)],
    ['문화 신호',        !!(SIG_DATA.culture && !SIG_DATA.culture._sample)],
    ['검색 모멘텀',      !!(window._dlTrends && window._dlTrends.length)],
    ['구매(쇼핑) 모멘텀', !!(window._salesTrends && window._salesTrends.length)],
    ['수출 실적',        !!(window._exportTrends && window._exportTrends.length)],
    ['뉴스 언급',        !!(window._newsTrends && window._newsTrends.length)],
    ['뷰티 RSS',         !!(window._rssText && window._rssText.length > 100)],
    ['식약처 공급',      !!(window._supplyTrends && window._supplyTrends.length)],
    ['해외 박람회',      !!(window._expoTrends && window._expoTrends.length)],
    ['기온 추세',        !!window._climateTrend],
    ['YouTube 모멘텀',   !!(window._ytTrends && window._ytTrends.length)],
    ['글로벌 검색(GTrends)', !!(window._gtrends && window._gtrends.length)],
    ['해외 커뮤니티(Reddit)', !!(window._reddit && window._reddit.length)],
    ['글로벌 리테일(Layer1)', !!((window._globalRetail || {}).formulations || []).length],
  ];
  const real = items.filter(i => i[1]).length;
  return { items, real, total: items.length, ratio: items.length ? real / items.length : 0 };
}
/* 상한식: 품질 100% → 100(무영향) · 50% → 78 · 0%(전부 샘플) → 55 */
function applyQualityCap(preds) {
  const q = computeDataQuality();
  const cap = Math.round(55 + q.ratio * 45);
  (preds || []).forEach(p => {
    if ((p.confidence || 0) > cap) { p.confidence = cap; p._capped = true; }
  });
  window._dataQuality = q;
  window._confCap = cap;
  return preds;
}

/* ════ 앙상블 교차검증 — 3관점 독립 분석 후 합의 병합 ════
   같은 데이터를 '균형/수요 우선/공급·규제 우선' 3가지 관점으로 독립 분석시키고,
   유형명 토큰이 겹치는 예측을 한 군(cluster)으로 묶어 "몇 개 관점이 동의했는가(agree)"를
   산출. 합의 많은 순 → 신뢰도 순으로 TOP5 승격. 단일 호출의 환각·편향을 제거한다. */
function mergeEnsemble(runs) {
  const tokensOf = t => extractSearchKw(t).split(' ').filter(w => w.length >= 2);
  const similar = (a, b) => { const tb = new Set(tokensOf(b)); return tokensOf(a).some(w => tb.has(w)); };
  const clusters = [];
  runs.forEach((preds, ri) => (preds || []).forEach(p => {
    if (!p || !p.type) return;
    const c = clusters.find(c => similar(c.rep.type, p.type));
    if (c) { c.members.push(p); c.runs.add(ri); }
    else clusters.push({ rep: p, members: [p], runs: new Set([ri]) });
  }));
  return clusters.map(c => ({
    ...c.rep,
    confidence: Math.round(c.members.reduce((s, m) => s + (m.confidence || 0), 0) / c.members.length),
    agree: c.runs.size,
    agreeOf: runs.length,
  }))
  .sort((a, b) => (b.agree - a.agree) || (b.confidence - a.confidence))
  .slice(0, 5)
  .map((p, i) => ({ ...p, rank: i + 1 }));
}

/* ════ Gemini 공통 호출 — 모든 호출부(예측·TRACK B·행사 발견·테스트)가 이 하나를 쓴다.
   백엔드 모드면 서버가 키를 주입해 대신 호출. 성공 시 텍스트, 실패 시 status 포함 throw. */
async function geminiGenerate(promptText, { maxTokens = 800, temperature = 0, timeout = 15000 } = {}) {
  const key = K.gemini();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${K.model()}:generateContent?key=${encodeURIComponent(key.trim())}`;
  const body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature } });
  let r;
  if (key === '__BK__') {
    r = await bkFetch(url, { method: 'POST', body }, timeout);
  } else {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeout);
    try {
      r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: ctrl.signal });
    } finally { clearTimeout(tid); }
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data?.error?.message || `HTTP ${r.status}`); e.status = r.status; throw e; }
  return (data.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json|```/g, '').trim();
}

/* Gemini 예측 1회 — predictions 배열 반환, 빈 응답은 throw */
async function callGeminiPredict(fullPrompt) {
  const txt = await geminiGenerate(fullPrompt, { maxTokens: 1800, temperature: 0.3, timeout: 30000 });
  const preds = JSON.parse(txt).predictions || [];
  if (!preds.length) throw new Error('빈 예측 응답');
  return preds;
}

/* ════ Gemini 예측 분석 ════ */
async function runGeminiPrediction(period) {
  period = period || currentPeriod;
  const key = K.gemini();
  if (!key) { showToast('Gemini API 키를 설정하세요'); return false; }
  const model = K.model();
  const now = new Date();
  const yr = now.getFullYear();
  const horizon = period === '3m'
    ? `향후 3개월 이내 (${yr}년 ${now.getMonth()+1}월~${((now.getMonth()+3)%12)+1}월, 즉시 대응·시즌 임박 구간)`
    : period === '6m'
    ? `${yr}년 하반기~${yr+1}년 상반기 (약 6개월 후)`
    : `${yr+1}년 전반 (약 12개월 후)`;
  /* 1~2개월 초단기는 구조적 신호(규제·설비)보다 '이미 움직이는' 빠른 신호(검색·쇼핑클릭·
     뉴스·계절 임박)를 우선한다. 장기(1년)는 반대로 공급·규제 선행신호를 더 크게 본다. */
  const nearTermNote = period === '3m'
    ? `\n[단기(3개월) 예측 지침]\n이 구간은 신제품 개발이 아니라 "이미 출시됐거나 임박한" 품목의 단기 수요 급등을 예측한다. 검색·쇼핑클릭 급상승·뉴스 언급·계절 임박(기온/자외선) 신호를 최우선 가중하고, 리드타임이 긴 규제·신규 설비 신호는 참고로만 반영하라. 출시 적기(season)는 반드시 향후 12주 이내로 제시하라.`
    : '';
  const sigSummary = Object.entries(SIG_DATA)
    .map(([k, v]) => `${k}: ${v?.score || '?'}/5 — ${v?.interpret || '수집 불가'}`)
    .join('\n');
  const dlDetail = (window._dlTrends && window._dlTrends.length)
    ? `\n[네이버 검색트렌드 — 최근 3개월 카테고리별 검색량 상승률 (실측)]\n`
      + window._dlTrends.map(t => `${t.name} ${t.delta >= 0 ? '+' : ''}${t.delta}%`).join(' · ')
    : '';
  const newsDetail = (window._newsTrends && window._newsTrends.length)
    ? `\n[뷰티 뉴스·미디어 최다 언급 키워드 — 실측]\n`
      + window._newsTrends.map(t => `${t.name}(${t.count}건)`).join(' · ')
    : '';
  const salesDetail = (window._salesTrends && window._salesTrends.length)
    ? `\n[네이버쇼핑 클릭 트렌드 — 구매의도 실측 · 선행지표(LEAD) · 검색보다 판매에 근접]\n`
      + window._salesTrends.map(t => `${t.name} ${t.delta >= 0 ? '+' : ''}${t.delta}%`).join(' · ')
      + `\n※ 이 구매의도 신호의 급상승 품목을 예측 가중에 우선 반영할 것`
    : '';
  const exportDetail = (window._exportTrends && window._exportTrends.length)
    ? `\n[관세청 화장품 수출 실적 — HS부호별 최근 3개월 vs 직전 3개월 수출액 증감 (실판매 실측)]\n`
      + window._exportTrends.map(t => `${t.name} ${t.delta >= 0 ? '+' : ''}${t.delta}%`).join(' · ')
      + `\n※ 검색·클릭은 "관심", 수출액은 실제 출하·결제된 "판매 실적"이다. K뷰티 수출 목표상 가장 강한 신호이므로 최우선 가중할 것`
    : '';
  const supplyDetail = (window._supplyTrends && window._supplyTrends.length)
    ? `\n[식약처 등록 화장품 — 제형별 품목 수 (공급 규모 신호·실측)]\n`
      + window._supplyTrends.slice(0, 12).map(t => `${t.name} ${t.count}건`).join(' · ')
      + `\n※ 식약처에 등록된 화장품 품목을 제형별로 집계한 수다. 특정 제형의 등록 품목이 많다는 것은 그 제형을 생산할 설비·공정을 갖춘 제조 기반이 두텁다는 공급측 신호다. 검색·클릭(수요)과 교차해, 공급 기반이 두터우면서 수요가 오르는 제형을 우선 가중하라.`
    : '';
  /* 규제 캘린더 — 예측이 아니라 확정 일정. 강제되는 패키징·성분 변화를 결정론적 가중 */
  const regDetail = (() => {
    const nowD = new Date();
    const within = REGS.map(r => {
      const m = String(r.date).match(/(\d{4})[.\-](\d{1,2})(?:[.\-](\d{1,2}))?/);
      if (!m) return null;
      const d = new Date(+m[1], +m[2] - 1, +(m[3] || 1));
      const months = Math.round((d - nowD) / (30 * 86400000));
      return { r, d, months };
    }).filter(x => x && x.months >= -3 && x.months <= 18).sort((a, b) => a.d - b.d);
    if (!within.length) return '';
    return `\n[규제 캘린더 — 확정 선행신호 (날짜 확정)]\n`
      + within.map(({ r, months }) => `${r.date} (${months <= 0 ? '시행중/임박' : 'D-' + months + '개월'}) [${r.tag}] ${r.title} → ${r.action}`).join('\n')
      + `\n※ 규제는 예측이 아니라 확정된 일정이다. 위 규제가 강제하는 패키징·성분 변화(예: 모노머티리얼·리필 전환, 미세플라스틱·특정성분 대체, 농도상한 리포뮬레이션, 해외 등록 의무)에 직접 해당하는 화장품 유형은 결정론적으로 가중하라.`;
  })();
  const expoDetail = (window._expoTrends && window._expoTrends.length)
    ? `\n[해외 박람회 선행 트렌드 — 최근 ${GLOBAL_EXPO_RECENT_DAYS}일 글로벌 뷰티·패키징 박람회(Cosmoprof·in-cosmetics·Cosmopack 등) 관련 보도 키워드]\n`
      + window._expoTrends.map(t => `${t.name}(${t.count})`).join(' · ')
      + ((window._expoArticles && window._expoArticles.length)
          ? `\n최근 보도 헤드라인: ` + window._expoArticles.slice(0, 5).map(a => `"${a.title}"`).join(' / ')
          : '')
      + `\n※ 해외 선도 박람회에서 공개된 신규 성분·제형·패키징은 국내 출시보다 6~12개월 앞서는 선행 트렌드다. 단 박람회 원본이 아닌 보도 기반 간접 신호이므로, 수요·공급 신호와 교차 검증해 가중하라.`
    : '';
  /* 리테일 실측 앵커 — 실구매·실사용 공식 집계(연간). 관심(검색)이 아닌 '팔린 것' 검증 기준 */
  const retailDetail = RETAIL_ANCHORS.length
    ? `\n[리테일 실측 앵커 — 실구매·실사용 데이터 공식 리포트 (연간 검증 기준)]\n`
      + RETAIL_ANCHORS.map(a => `${a.src}(${a.basis}): ${a.themes.join(' · ')}`).join('\n')
      + `\n※ 위는 검색·관심이 아니라 실제 구매·사용이 검증된 연간 집계다. 예측 유형이 이 실측 트렌드와 정합하면 신뢰도를 높이고, 정면 배치되면 그 이유를 tech에 명시하라.`
    : '';
  const ytDetail = (window._ytTrends && window._ytTrends.length)
    ? `\n[YouTube 콘텐츠 모멘텀 — 최근 30일 vs 직전 30일 영상 수 증감 (실측)]\n`
      + window._ytTrends.slice(0, 8).map(t => `${t.name} ${t.delta >= 0 ? '+' : ''}${t.delta}%`).join(' · ')
      + `\n※ 크리에이터 콘텐츠 생산 속도 — 검색·클릭과 독립된 문화 확산 신호.`
    : '';
  const gtrendsDetail = (window._gtrends && window._gtrends.length)
    ? `\n[글로벌 검색 모멘텀(Google Trends·미국) — 최근 4주 vs 직전 8주 (실측·수출 선행)]\n`
      + window._gtrends.slice(0, 8).map(t => `${t.name} ${t.delta >= 0 ? '+' : ''}${t.delta}%`).join(' · ')
      + `\n※ 해외 소비자 검색 — 수출 실적(후행)보다 앞서는 글로벌 수요 신호로 수출 채널 유형에 가중하라.`
    : '';
  const redditDetail = (window._reddit && window._reddit.length)
    ? `\n[해외 K뷰티 커뮤니티(Reddit) 언급 빈도 — 최근 1개월 (실측)]\n`
      + window._reddit.slice(0, 8).map(t => `${t.name}(${t.count}건)`).join(' · ')
    : '';
  const gr = window._globalRetail;
  const retailFeedDetail = (gr && gr.formulations && gr.formulations.length)
    ? `\n[글로벌 선행시장(Layer1) — Sephora·Ulta·@cosme·샤오홍슈 관련 제형 언급]\n`
      + gr.formulations.slice(0, 8).map(f => `${f.name} ${f.mentions}건 (${f.platforms.join('·')})`).join(' · ')
      + `\n※ 한국보다 먼저 형성되는 해외 제형 트렌드. ${(gr.sources || []).some(s => s.mode === '공식 피드' && s.ok) ? '일부는 공식 상품피드 실측이다.' : '플랫폼 직접수집이 아닌 공개 보도 기반 대리 신호이므로 방향성 참고용으로만 가중하라.'}`
    : '';
  /* 라이프사이클 규칙 — 성장·태동만 후보, 쇠퇴 회피를 명시적 제약으로 주입 */
  const lc = window._lifecycle;
  const lifecycleDetail = lc
    ? `\n[트렌드 라이프사이클 분류 — 주간 모멘텀 기울기 기반 실측]\n`
      + [lc.grow.length ? `성장기(예측 최우선 후보): ${lc.grow.slice(0, 6).map(k => k.name).join(', ')}` : '',
         lc.emerge.length ? `태동기(선제 후보): ${lc.emerge.slice(0, 4).map(k => k.name).join(', ')}` : '',
         lc.mature.length ? `성숙기(신규 예측 지양): ${lc.mature.slice(0, 4).map(k => k.name).join(', ')}` : '',
         lc.decline.length ? `쇠퇴기(회피 — TOP5 금지): ${lc.decline.slice(0, 4).map(k => k.name).join(', ')}` : '']
        .filter(Boolean).join('\n')
      + `\n※ 성장기·태동기 키워드 관련 유형을 우선하고, 쇠퇴기 키워드가 핵심인 유형은 TOP5에 넣지 마라.`
    : '';
  const ct = window._climateTrend;
  const seasonalOutlook = window._seasonalOutlook;
  const climateDetail = ct
    ? `\n[기후 추세 — Open-Meteo 실측]\n`
      + [
          ct.deviation !== null ? `평년(작년 동기) 대비 ${ct.deviation >= 0 ? '+' : ''}${ct.deviation}℃` : '',
          ct.trend16 ? `16일 단기예보 추세(참고용, 장기예측 아님) ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃ (1주차 평균 ${ct.trend16.week1}℃ → 2주차 평균 ${ct.trend16.week2}℃)` : '',
          (seasonalOutlook && seasonalOutlook.length)
            ? `※ ${PERIOD_LABEL[period] || '6개월'} 예측 시 이 항목을 우선 참고 — 평년 기준 계절 전망: ` + seasonalOutlook.map(o => `${o.monthsAhead}개월 후(${o.targetMonth}월) 평균최고 ${o.avgMaxTemp}℃`).join(' · ')
            : ''
        ].filter(Boolean).join(' · ')
    : '';
  const prompt = `당신은 화장품 OEM/ODM 업계 전문 트렌드 분석가입니다.
아래 외부 요인 데이터를 분석하여 ${horizon}에 유행할 화장품 유형 TOP5를 예측하세요.
신호는 '수요(소비자 관심·구매)'와 '공급·규제(제조사 보고·확정 규제)' 두 축으로 구성되며, 공급·규제 신호가 수요보다 선행합니다.

[4대 신호 현황]
${formRadarPromptBlock()}${sigSummary}${exportDetail}${salesDetail}${dlDetail}${newsDetail}${ytDetail}${gtrendsDetail}${redditDetail}${supplyDetail}${regDetail}${expoDetail}${retailFeedDetail}${retailDetail}${lifecycleDetail}${climateDetail}${nearTermNote}
분석 기준월: ${yr}년 ${now.getMonth()+1}월

[출력 규칙 엄수]
1. 예측 단위는 성분이 아니라 '제형(Formulation)'이다. formulation 필드에 위 제형 레이더 목록의 제형명을 그대로 적고, type은 그 제형을 구체화한 품목명으로 작성하라.
2. 예측과 사실 분리 — 각 항목에 예측신뢰도(%) 반드시 명시
3. packaging은 그 제형의 실제 포장형태로, tech는 그 제형에 필요한 생산설비(CAPA) 요건으로 기재 (예: 하이드로겔→"개별 트레이", "겔 캐스팅·성형 + 트레이 인서트")
4. 한국콜마·코스맥스·코스메카코리아 절대 언급 금지
5. 스킨케어에 한정하지 말고 색조·향수·맨즈 그루밍·바디케어 등 전 카테고리·전 성별 트렌드를 균형있게 검토
6. 공급(식약처 보고)·규제 신호는 수요(검색·클릭)보다 선행하므로 더 높게 가중하되, 그 근거를 각 항목의 tech·season에 드러나게 반영
7. JSON만 출력 (설명 텍스트 없음)

[필수 JSON 형식]
{"predictions":[{"rank":1,"type":"정확한 화장품 품목명","formulation":"제형명(제형 레이더 목록 중 하나)","packaging":"그 제형의 포장형태","confidence":88,"tech":"생산설비(CAPA) 요건","channel":["유통채널1","유통채널2"],"season":"출시 적기 (예: 2026 하반기)","signals":{"climate":0.3,"society":0.1,"economy":0.2,"culture":0.4}}]}`;
  try {
    /* 앙상블 3관점 — 동일 데이터를 서로 다른 가중 관점으로 독립 분석시켜 합의를 취한다 */
    const PERSPECTIVES = [
      { key: '균형',   instr: '' },
      { key: '수요',   instr: '\n[관점 지시 — 수요 우선]\n이번 분석은 소비자 수요 신호(검색·구매클릭·뉴스·수출)를 최우선 가중하는 관점으로 수행하라. 공급·규제는 보조 참고.' },
      { key: '공급규제', instr: '\n[관점 지시 — 공급·규제 우선]\n이번 분석은 공급(식약처 등록 제형)·규제 캘린더·설비 관점을 최우선 가중하는 관점으로 수행하라. 소비자 검색·클릭은 보조 참고.' },
    ];
    const settled = await Promise.allSettled(
      PERSPECTIVES.map(p => callGeminiPredict(prompt + p.instr))
    );
    const okRuns = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
    if (!okRuns.length) {
      /* 전 관점 실패 — 대표 오류로 기존 토스트 규칙 유지 */
      const firstErr = settled.find(s => s.status === 'rejected')?.reason;
      const errMsg = firstErr?.message || '';
      if (firstErr?.status === 429 && (errMsg.includes('limit: 0') || errMsg.includes('free_tier'))) {
        showToast('Gemini 쿼터 0 오류 — API 설정에서 모델을 gemini-2.5-flash-lite로 변경하세요 (AQ키 무료 지원)');
      } else if (firstErr?.status === 429) {
        showToast(`Gemini 요청 한도 초과 — 잠시 후 재시도하세요`);
      } else if (firstErr?.status) {
        showToast(`Gemini 오류 (${firstErr.status}) — 샘플 예측 사용`);
      }
      throw (firstErr || new Error('전 관점 호출 실패'));
    }
    const merged = applyQualityCap(mergeEnsemble(okRuns));
    window._ensembleInfo = {
      runs: okRuns.length,
      agreed: merged.filter(p => (p.agree || 0) >= 2).length,
      top: merged.length,
    };
    PREDICTIONS_CACHE[period] = merged;
    PREDICTIONS = PREDICTIONS_CACHE[period];
    return true;
  } catch (e) {
    console.error('Gemini error:', e);
    const fallback6m = [
      {rank:1,type:'에어리스 세럼 SPF50+ (선세럼)',packaging:'에어리스 펌프 30~50ml',confidence:88,tech:'고점도 선세럼 배합 + 에어리스 충진 동시 가능 설비',channel:['올리브영','미국 TikTok Shop'],season:'2026 하반기',signals:{climate:0.35,society:0.1,economy:0.15,culture:0.4}},
      {rank:2,type:'고체형 클렌징 바 (비건 인증)',packaging:'고형 성형 + 종이 슬리브 포장',confidence:82,tech:'고형 성형 + 비건 원료 배합 + 종이 패키징',channel:['다이소','무신사','유럽 수출'],season:'2026 4Q',signals:{climate:0.1,society:0.2,economy:0.3,culture:0.4}},
      {rank:3,type:'소용량 앰플 (2ml×7ea 주간 루틴팩)',packaging:'소용량 앰플 2ml × 7ea 파우치',confidence:76,tech:'소용량(≤3ml) 자동 충진 + 파우치 포장 라인',channel:['올리브영','편의점','아마존'],season:'2026 3Q',signals:{climate:0.1,society:0.4,economy:0.1,culture:0.4}},
      {rank:4,type:'리필 크림 (파우치+전용 용기)',packaging:'리필 파우치 50ml + 재사용 알루미늄 용기',confidence:71,tech:'리필 파우치 충진 + 재사용 알루미늄 용기 설계',channel:['프리미엄 브랜드','백화점'],season:'2027 1Q',signals:{climate:0.1,society:0.1,economy:0.5,culture:0.3}},
      {rank:5,type:'쿨링 젤 선크림 (스틱+튜브)',packaging:'스틱 몰딩 15g 또는 저점도 튜브 75ml',confidence:65,tech:'스틱 몰딩 or 저점도 튜브 충진 + 쿨링 성분 배합',channel:['다이소','편의점','남성 채널'],season:'2026 4Q',signals:{climate:0.5,society:0.1,economy:0.1,culture:0.3}},
    ];
    const fallback1y = [
      {rank:1,type:'프리바이오틱스 스킨케어 라인 (마이크로바이옴)',packaging:'에어리스 포장 30~80ml (산화방지)',confidence:85,tech:'마이크로바이옴 활성 성분 에어리스 패키징 + 저온 충진',channel:['올리브영','피부과 연계','해외 수출'],season:'2027 상반기',signals:{climate:0.1,society:0.3,economy:0.1,culture:0.5}},
      {rank:2,type:'고기능성 UV 패드 (선패드)',packaging:'소용량 틱택 컨테이너 15ml + 패드팩',confidence:80,tech:'패드 자동 투입 + UV 에멀전 충진 동시 라인',channel:['올리브영','드러그스토어','중동 수출'],season:'2027 상반기',signals:{climate:0.45,society:0.1,economy:0.15,culture:0.3}},
      {rank:3,type:'생분해 포장재 스킨케어 (친환경 리뉴얼)',packaging:'퇴비화 가능 바이오 플라스틱 용기 50ml',confidence:74,tech:'바이오 PLA 용기 충진 + 무알코올 보존',channel:['유럽 수출','친환경 PB 브랜드'],season:'2027 2Q',signals:{climate:0.2,society:0.2,economy:0.3,culture:0.3}},
      {rank:4,type:'다기능 세럼 스틱 (올인원 고형)',packaging:'스틱 몰딩 12g 회전식 용기',confidence:70,tech:'고형 세럼 스틱 몰딩 + 활성 성분 안정화',channel:['다이소','무신사','편의점'],season:'2027 1Q',signals:{climate:0.1,society:0.4,economy:0.2,culture:0.3}},
      {rank:5,type:'맞춤형 화장품 키트 (처방 배합)',packaging:'소분 앰플 2ml×5 + 베이스 크림 30ml 세트',confidence:62,tech:'소용량 다품종 혼합 충진 + 개인화 라벨링',channel:['D2C 브랜드','피부과 병원'],season:'2027 2Q',signals:{climate:0.05,society:0.5,economy:0.1,culture:0.35}},
    ];
    /* 단기(3m) 폴백 — 이미 시장에 있고 계절·검색이 즉시 미는 품목 위주 */
    const fallback3m = [
      {rank:1,type:'쿨링 선세럼·선쿠션 (여름 즉시 대응)',packaging:'에어리스/쿠션 15~50ml',confidence:84,tech:'쿨링 배합 + 고SPF 즉시 충진',channel:['올리브영','다이소'],season:'향후 4~8주',signals:{climate:0.55,society:0.05,economy:0.1,culture:0.3}},
      {rank:2,type:'진정·수분 토너패드 (여름 데일리)',packaging:'토너패드 60~80매 리필형',confidence:78,tech:'패드 자동 투입 + 진정 성분',channel:['올리브영','편의점'],season:'향후 6주',signals:{climate:0.35,society:0.1,economy:0.15,culture:0.4}},
      {rank:3,type:'피지·모공 클렌징 (여름 시즌)',packaging:'튜브/펌프 150ml',confidence:72,tech:'저자극 계면활성 배합',channel:['올리브영','드러그스토어'],season:'향후 8주',signals:{climate:0.3,society:0.1,economy:0.2,culture:0.4}},
      {rank:4,type:'남성 올인원·선스틱 (휴가철)',packaging:'스틱 몰딩 15g',confidence:66,tech:'스틱 성형 + 멀티기능',channel:['편의점','남성 채널'],season:'향후 8주',signals:{climate:0.4,society:0.2,economy:0.1,culture:0.3}},
      {rank:5,type:'미스트·픽서 (지속력·쿨링)',packaging:'스프레이 50~100ml',confidence:60,tech:'분무 충진 + 쿨링·픽싱',channel:['올리브영','다이소'],season:'향후 6주',signals:{climate:0.45,society:0.05,economy:0.1,culture:0.4}},
    ];
    /* 폴백도 품질 상한을 그대로 적용 — 샘플 기반 수치가 실측처럼 보이지 않게 */
    PREDICTIONS_CACHE[period] = applyQualityCap(period === '1y' ? fallback1y : period === '3m' ? fallback3m : fallback6m);
    PREDICTIONS = PREDICTIONS_CACHE[period];
    window._ensembleInfo = null;   /* 앙상블 미수행(샘플) */
    showToast('Gemini 연결 실패 — 샘플 예측 사용');
    return true;
  }
}

/* ════ 기간 탭 전환 ════ */
async function switchPredPeriod(period) {
  if (period === currentPeriod) return;
  currentPeriod = period;

  /* 탭 UI 업데이트 */
  document.querySelectorAll('.pred-period-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.period === period);
    t.classList.add('loading');
  });

  SEL_IDX = -1;
  currentPkgType = '';

  if (PREDICTIONS_CACHE[period]) {
    /* 캐시 있음 → 즉시 표시 */
    PREDICTIONS = PREDICTIONS_CACHE[period];
    renderZ1();
    resetZ2();
    document.querySelectorAll('.pred-period-tab').forEach(t => t.classList.remove('loading'));
  } else if (Object.values(SIG_DATA).some(v => v)) {
    /* 신호 데이터 있음 → Gemini 재실행 */
    document.getElementById('z1body').innerHTML =
      `<div class="z1-placeholder"><div class="sig-loading" style="justify-content:center">6개월 예측 분석 중...</div></div>`;
    await runGeminiPrediction(period);
    renderZ1();
    resetZ2();
    document.querySelectorAll('.pred-period-tab').forEach(t => t.classList.remove('loading'));
  } else {
    showToast('[전체 수집 실행] 후 기간 탭을 전환하세요');
    document.querySelectorAll('.pred-period-tab').forEach(t => t.classList.remove('loading'));
  }
}

function resetZ2() {
  document.getElementById('z2subtitle').textContent = '— 위에서 예측 항목을 클릭하세요';
  document.getElementById('z2body').innerHTML = `
    <div class="z2-placeholder">
      TRACK A — 기등록 업체<br>
      <span style="font-size:10px">예측 항목 선택 시 내부 DB에서 즉시 조회</span>
    </div>
    <div class="z2-placeholder-r">
      TRACK B — 신규처 후보<br>
      <span style="font-size:10px">KIPRIS·뉴스·식약처 자동 탐색 후 표시</span>
    </div>`;
}

/* ════ ZONE 1 렌더 ════ */
function renderZ1() {
  const el = document.getElementById('z1body');
  const matured = backtestPredictions();
  const btBtn = document.getElementById('btnBtDash');
  if (btBtn) {
    btBtn.style.display = (matured.length || getLedgerHist().length) ? '' : 'none';
    btBtn.onclick = () => {
      const panel = document.getElementById('btDashPanel');
      const show = panel.style.display === 'none';
      panel.style.display = show ? '' : 'none';
      if (show) renderBacktestDashboard(matured);
    };
  }
  if (!PREDICTIONS.length) {
    el.innerHTML = '<div class="z1-placeholder">예측 데이터 없음</div>';
    return;
  }
  const model = K.model() || 'gemini-2.0-flash';
  const periodLabel = (PERIOD_LABEL[currentPeriod] || '6개월') + ' 예측';
  document.getElementById('geminiModelLabel').textContent =
    model + ' · ' + new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}) + ' 생성';
  const sigLabel = { climate:'기후', society:'사회', economy:'경제', culture:'문화' };
  const btSummary = matured.length
    ? ` · 백테스트 ${matured.slice(0, 3).map(h => `${h.hits}/${h.total}`).join(', ')}`
    : '';
  const q = window._dataQuality || computeDataQuality();
  const changes = getRankChanges(PREDICTIONS, currentPeriod);

  el.innerHTML = `
    <div class="z1-meta">
      <span class="period-badge period-${currentPeriod}">${periodLabel}</span>
      신호 ${q.real}/${q.total} 실데이터 · 카드 클릭 시 제조사 매칭${btSummary}
    </div>
    <div class="pred-list">${PREDICTIONS.map((p, i) => {
      const confCls = p.confidence >= 80 ? 'hi' : p.confidence >= 65 ? 'mi' : 'lo';
      /* "왜 이 결과인가" 한 줄 — 상위 신호 기여를 문장으로 */
      const topSig = Object.entries(p.signals || {}).sort((a, b) => b[1] - a[1]).slice(0, 2)
        .filter(([, v]) => v > 0);
      const why = topSig.length
        ? topSig.map(([k, v]) => `${sigLabel[k]} ${Math.round(v * 100)}%`).join(' · ') + ' 신호 주도'
        : '';
      const delta = changes[p.rank];
      const deltaHtml = delta === 'NEW' ? '<span class="rank-new">NEW</span>'
        : typeof delta === 'number' && delta > 0 ? `<span class="rank-up">▲${delta}</span>`
        : typeof delta === 'number' && delta < 0 ? `<span class="rank-dn">▼${Math.abs(delta)}</span>` : '';
      /* 근거 칩: 합의 · 라이프사이클 단계 · 시즌 앵커 · 품질상한 */
      const chips = [];
      /* 제형 칩 — 클릭 시 성분→제형→패키징→CAPA 체인. 예측을 제조 실행으로 잇는 고리 */
      const fm = formulationOfPred(p);
      if (fm) chips.push(`<span class="pc-chip pcc-form" onclick="event.stopPropagation();openFormulationChain('${fm.code}')" title="제형 ${fm.name} — 클릭 시 패키징·설비(CAPA) 체인">제형 ${escHtml(fm.name)}${fm.score !== undefined && fm.score !== null ? ` ${fm.score}` : ''}</span>`);
      if (p.agree) chips.push(`<span class="pc-chip ${p.agree >= (p.agreeOf || 3) ? 'pcc-strong' : p.agree >= 2 ? 'pcc-mid' : 'pcc-weak'}" title="3관점 독립 분석 중 ${p.agree}개 관점이 같은 유형을 지목">합의 ${p.agree}/${p.agreeOf || 3}</span>`);
      const stg = stageForType(p.type);
      if (stg) chips.push(`<span class="pc-chip ${stg.key === 'grow' || stg.key === 'emerge' ? 'pcc-strong' : stg.key === 'decline' ? 'pcc-bad' : 'pcc-weak'}" title="키워드 모멘텀 기울기 기반 라이프사이클 단계">${stg.label}</span>`);
      const an = seasonAnchorForType(p.type);
      if (an) {
        const lbl = an.verdict === 'hit' ? '작년 동기 적중' : an.verdict === 'part' ? '작년 동기 부분' :
                    an.verdict === 'miss' ? '작년 동기 미스' : an.verdict === 'signal' ? '작년 동기 재포착' : '작년 동기 예측';
        chips.push(`<span class="pc-chip ${an.verdict === 'hit' || an.verdict === 'signal' ? 'pcc-strong' : an.verdict === 'miss' ? 'pcc-bad' : 'pcc-mid'}" title="작년 같은 시기(±65일) 예측 이력 대조">${lbl}</span>`);
      }
      if (p._capped) chips.push(`<span class="pc-chip pcc-bad" title="실데이터 비율에 따른 신뢰도 상한 적용">품질상한▼</span>`);
      return `<div class="pcard${i === 0 ? ' pcard-top' : ''}${SEL_IDX === i ? ' sel' : ''}" onclick="selectPred(${i})">
        <div class="pc-rank">${String(p.rank).padStart(2, '0')}${deltaHtml}</div>
        <div class="pc-main">
          <div class="pc-type">${escHtml(p.type)}</div>
          ${why ? `<div class="pc-why">${why}${p.tech ? ` — ${escHtml(p.tech)}` : ''}</div>` : `<div class="pc-why">${escHtml(p.tech || '')}</div>`}
          ${chips.length ? `<div class="pc-chips">${chips.join('')}</div>` : ''}
          <div class="pc-meta">
            <span>📦 ${escHtml(p.packaging || '—')}</span>
            ${(p.channel || []).length ? `<span>${(p.channel || []).slice(0, 2).map(escHtml).join(' · ')}</span>` : ''}
            <span>${escHtml(p.season || '')}</span>
          </div>
        </div>
        <div class="pc-side">
          <div class="pc-num ${confCls}">${p.confidence}<em>%</em></div>
          <div class="pc-bar"><b class="${confCls}" style="width:${p.confidence}%"></b></div>
          <button class="p-evi-btn" onclick="event.stopPropagation();openPredEvidence(${i})">근거 보기</button>
        </div>
        <span class="pc-arr">${SEL_IDX === i ? '▼' : '›'}</span>
      </div>`;
    }).join('')}</div>`;
}

/* 예측 → 제형 매칭 — Gemini의 formulation 필드 우선, 없으면 type/packaging에서 역추론.
   점수가 있으면(_formRadar) 함께 반환해 카드에 표기한다. */
function formulationOfPred(p) {
  if (!p) return null;
  const cand = FORMULATIONS.find(f => p.formulation && (f.name === p.formulation || f.en === p.formulation))
    || FORMULATIONS.find(f => formMatches(f, `${p.type || ''} ${p.packaging || ''}`));
  if (!cand) return null;
  const scored = (window._formRadar || []).find(r => r.code === cand.code);
  return scored || cand;
}

/* 예측 유형 → 라이프사이클 단계 조회 (키워드 포함 매칭) */
function stageForType(type) {
  const lc = window._lifecycle;
  if (!lc) return null;
  const LB = { emerge: '태동기', grow: '성장기', mature: '성숙기', decline: '쇠퇴기' };
  for (const key of ['grow', 'emerge', 'decline', 'mature']) {
    if ((lc[key] || []).some(k => type.includes(k.name) || k.name.includes(extractSearchKw(type).split(' ')[0])))
      return { key, label: LB[key] };
  }
  return null;
}

/* ════ 제조사 매칭 ════ */
async function selectPred(idx) {
  if (SEL_IDX === idx) return;
  const p = PREDICTIONS[idx];
  if (!p) return;
  SEL_IDX = idx;
  renderZ1();
  currentPkgType = p.packaging || '';
  const periodLabel = PERIOD_LABEL[currentPeriod] || '6개월';
  document.getElementById('z2subtitle').textContent =
    `— ${p.type} · ${periodLabel} 예측 · 신뢰도 ${p.confidence}%`;
  renderZ2Loading();
  await searchManufacturers(p);
  renderZ2(currentPkgType);
}

function renderZ2Loading() {
  document.getElementById('z2body').innerHTML = `
    <div style="border-right:.5px solid var(--bg3)">
      <div class="loading-match">TRACK A 조회 중 — 내부 DB 검색...</div>
    </div>
    <div>
      <div class="loading-match">TRACK B 탐색 중 — 뉴스·식약처 분석...</div>
    </div>`;
}

async function searchManufacturers(pred) {
  const pkgType = pred.packaging || '';
  const mfrDB = DB.filter(d =>
    d.industry && (d.industry.includes('화장품') || d.industry.includes('의약외품'))
  );
  const sorted = pkgType
    ? mfrDB.slice().sort((a, b) => {
        const diff = getPackagingScore(b, pkgType) - getPackagingScore(a, pkgType);
        return diff !== 0 ? diff : (b.certs || []).length - (a.certs || []).length;
      })
    : mfrDB.sort((a, b) => (b.certs || []).length - (a.certs || []).length);
  MATCH_RESULTS.trackA = sorted.slice(0, 6);
  MATCH_RESULTS.trackB = await findNewManufacturers(pred.type, pred.tech);
  renderFunnel();   /* 신규처 발굴 누적이 갱신됐으므로 퍼널 재집계 */
}

/* 회사명 정규화 — 법인 표기·공백 제거 (중복 판정·DB 대조용) */
function normCompanyName(n) {
  return String(n || '').replace(/주식회사|\(주\)|㈜|\s/g, '').trim();
}

/* 예측 품목 → 검색 키워드 추출 — 괄호 패키징 표기("(스틱+튜브)")는 제거하되
   첫 단어만 남기지 않고 핵심 명사구 전체를 사용 (예: "쿨링 젤 선크림 (스틱+튜브)" → "쿨링 젤 선크림")
   첫 단어만 쓰면 "쿨링"처럼 지나치게 일반적인 단어가 되어 전혀 다른 제품으로 검색 결과가 새는 문제가 있었음 */
function extractSearchKw(productType) {
  const cleaned = String(productType || '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || String(productType || '').trim();
}

/* 후보 업체의 실제 판매 제품명이 예측 품목과 무관한지 판별 — 검색어 중 의미있는 토큰(2자 이상)
   중 하나라도 제품명에 포함돼야 관련 후보로 인정 (네이버쇼핑 maker 역추적의 무필터 매칭 방지) */
function isRelevantToProductType(text, kw) {
  const tokens = String(kw || '').split(' ').filter(t => t.length >= 2);
  if (!tokens.length) return true;
  const t = String(text || '');
  return tokens.some(tok => t.includes(tok));
}

/* 텍스트에서 화장품 업체명 패턴 추출 — Gemini 키 없거나 실패 시 폴백 */
function extractCompanyNames(text) {
  const out = new Set();
  const re = /(?:\(주\)\s?|㈜\s?|주식회사\s?)?([가-힣A-Za-z0-9]{2,12}(?:코스메틱스?|코스텍|코스팜|코스랩|화장품|뷰티|바이오텍|랩스|피앤피|케미컬|케미칼))/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1].trim();
    /* 일반명사·대형3사 제외 */
    if (name.length < 4) continue;
    if (/^(기능성|비건|국내|글로벌|중소|신생)?(화장품|코스메틱스?|뷰티)$/.test(name)) continue;
    if (/콜마|코스맥스|코스메카/.test(name)) continue;
    out.add(name);
  }
  return [...out];
}

/* KIPRIS(특허정보원) 출원인 검색 — TRACK B 신규처 발굴에 "특허 출원" 근거를 추가하는 스캐폴드.
   ※ 2026-07-01 재조사: 실키로 호출 시 <successYN>N</successYN> + "INVALID REQUEST PARAMETER
   ERROR"가 반환됨 → 엔드포인트·accessKey 인증은 정상이고(그랬으면 인증오류), 요청 파라미터가
   불완전한 것이 근본 원인. KIPRIS Plus patUtiModInfoSearchSevice/getWordSearch는 word·accessKey만으론
   부족하고 검색 대상 문서종류 플래그(patent·utility)와 페이징·정렬 파라미터가 필수다. 정식 스펙에
   맞춰 patent=true·utility=true·lastvalue(빈값)·pageNo·numOfRows·sortSpec(빈값)·descSort를 모두 채운다.
   실패 시 빈 배열을 반환해 TRACK B 나머지 경로(뉴스·식약처·블로그·네이버쇼핑)는 그대로 동작한다. */
async function searchKiprisApplicants(keyword) {
  const key = K.kipris();
  window._kiprisRaw = null;
  if (!key) return [];
  /* ※ 2026-07-01 최종 확정: 이전 'getWordSearch'는 존재하지 않는(또는 다른) 오퍼레이션이라
     INVALID REQUEST PARAMETER ERROR가 반복됐다. 실동작하는 KIPRIS Plus 구현(오픈소스
     mcp_kipris)에서 자유검색(word) 오퍼레이션은 아래로 확정됨:
       - 엔드포인트: plus.kipris.or.kr/openapi/rest/patUtiModInfoSearchSevice/freeSearchInfo
       - 인증 파라미터: accessKey
       - 필수/기본 파라미터: word·patent=true·utility=true·pageNo·numOfRows·descSort=false·sortSpec=AD
       - 빈 값 파라미터(lastvalue 등)는 아예 보내지 않는다(빈값 전송이 파라미터 오류 유발).
       - 응답 아이템: response.body.items.PatentUtilityInfo, 출원인 필드 <ApplicantName>.
     HTTP 전용이지만 https 프록시를 경유하므로 혼합콘텐츠 문제는 없다. */
  const params = new URLSearchParams({
    word: keyword + ' 화장품',
    patent: 'true',
    utility: 'true',
    pageNo: '1',
    numOfRows: '15',
    descSort: 'false',
    sortSpec: 'AD',
    accessKey: key,
  });
  const url = `http://plus.kipris.or.kr/openapi/rest/patUtiModInfoSearchSevice/freeSearchInfo?${params.toString()}`;
  try {
    const txt = await fetchProxy(url, 10000);
    if (!txt) return [];
    window._kiprisRaw = txt.slice(0, 600);   /* 연결 테스트 진단용 원문 일부 보관 */
    /* XML 응답의 <ApplicantName>홍길동</ApplicantName> (다중 출원인은 | 구분) 추출.
       태그 표기 변형(ApplicantName/applicant) 대소문자 무시로 대응 */
    const names = new Set();
    let m;
    const reA = /<applicant(?:name)?>([^<]+)<\/applicant(?:name)?>/gi;
    while ((m = reA.exec(txt))) {
      m[1].replace(/\|/g, ',').split(',').forEach(n => {
        n = n.trim();
        if (n && n.length >= 2 && !/^\d+$/.test(n)) names.add(n);
      });
    }
    return [...names].slice(0, 8);
  } catch { return []; }
}

async function findNewManufacturers(productType, tech) {
  let results = [];
  const nid = K.naverID(), nsec = K.naverSec(), gkey = K.gemini();
  const pubKey = K.public();
  const kw = extractSearchKw(productType);
  /* 패키징 키워드 — 충진·성형 설비 관점 검색어로 탐색 폭 확대 */
  const pkgKw = (currentPkgType.match(/에어리스|스틱|튜브|파우치|앰플|패드|쿠션|펌프/) || [])[0] || '';

  /* ── ① 수집: 뉴스(3관점) + 식약처 품목 + 식약처 제조업 등록목록 병렬 ──
     생산하는(현재)·생산했던(이력)·생산가능(설비/제형 관점)을 모두 포괄하도록 쿼리 확장 */
  const queries = [
    kw + ' OEM',          /* 생산중 — 현재 수주·생산 */
    kw + ' 제조사 출시',   /* 생산이력 — 출시 기사에 제조사 등장(과거·현재) */
  ];
  if (pkgKw && !kw.includes(pkgKw)) queries.push(pkgKw + ' 충진 OEM');  /* 생산가능 — 동일 충진설비 보유사 */
  else queries.push(kw + ' ODM 제조');
  const naverPromises = (nid && nsec)
    ? queries.map(q => {
        /* sort=sim(관련도) — 최신순보다 OEM 수주·설비 기사 적중률 높음 */
        const targetUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=10&sort=sim`;
        return fetchNaverAPI(targetUrl, nid, nsec, 9000);
      })
    : [];
  const mfdsPromise = pubKey
    ? fetchProxy(`https://apis.data.go.kr/1471000/CsmtcsPrductInfoService01/getCsmtcsPrductInfo?serviceKey=${encodeURIComponent(pubKey)}&prdlst_nm=${encodeURIComponent(kw)}&numOfRows=10&pageNo=1&type=json`)
    : Promise.resolve(null);
  /* 제조업 등록목록은 제품과 무관하게 동일 → 세션 1회 수집 후 캐시 */
  const gmpPromise = (pubKey && !window._gmpCache) ? collectMFDSGMP() : Promise.resolve(window._gmpCache || []);
  /* 블로그내용 추적 — 추측성 후보의 근거 보강용 텍스트 소스 추가 */
  const blogPromise = (nid && nsec)
    ? fetchNaverAPI(`https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(kw + ' OEM 제조')}&display=15&sort=sim`, nid, nsec, 9000)
    : Promise.resolve(null);
  /* KIPRIS 특허 출원인 — "${kw} 화장품" 관련 특허 출원 정황을 생산능력의 간접 근거로 활용
     (evidence_type:'patent'로 분류 — 뉴스보다 신뢰도 높고 식약처 확정근거보다는 낮게 배치) */
  const kiprisPromise = K.kipris() ? searchKiprisApplicants(kw) : Promise.resolve([]);
  /* 판매 제품 제조원 역추적 — 실제 판매 중인 제품의 제조사(maker) 필드를 직접 확인 */
  const shopPromise = (nid && nsec)
    ? fetchNaverAPI(`https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(kw)}&display=30&sort=sim`, nid, nsec, 9000)
    : Promise.resolve(null);
  const [mfdsT, gmpList, blogJ, shopJ, kiprisNames, ...naverResults] = await Promise.all([mfdsPromise, gmpPromise, blogPromise, shopPromise, kiprisPromise, ...naverPromises]);
  if (gmpList.length) window._gmpCache = gmpList;

  let newsTexts = '';
  naverResults.forEach(j => {
    if (j && !j._error) newsTexts += ' ' + (j.items || []).map(i => i.title + ' ' + i.description).join(' ');
  });
  let mfdsTexts = '';
  if (mfdsT) {
    try {
      const j = JSON.parse(mfdsT);
      /* 표준(response.body.items.item)·축약(body.items) 응답 구조 모두 처리 */
      const items = j?.response?.body?.items?.item
                  || j?.body?.items?.item
                  || j?.response?.body?.items
                  || j?.body?.items
                  || [];
      const arr = Array.isArray(items) ? items : (items ? [items] : []);
      mfdsTexts = arr.map(i => i.MFR_STE_NM || i.ENTP_NAME || i.BSSH_NM || '').filter(Boolean).join(' ');
    } catch {}
  }
  /* 블로그내용 추적 텍스트 — Gemini 추출 corpus에 합류 (근거 등급은 blog로 별도 표기) */
  let blogTexts = '';
  if (blogJ && !blogJ._error) {
    blogTexts = (blogJ.items || []).map(i => `${i.title} ${i.description}`.replace(/<[^>]+>/g, '')).join(' ');
  }
  /* 판매 제품 제조원 역추적 — 네이버쇼핑 검색결과의 maker(제조사) 필드를 직접 추출해 확정 근거로 사용 */
  const shopMakerResults = [];
  if (shopJ && !shopJ._error) {
    const seenMaker = new Set();
    (shopJ.items || []).forEach(it => {
      const maker = (it.maker || '').replace(/<[^>]+>/g, '').trim();
      if (!maker) return;
      const cn = normCompanyName(maker);
      if (!cn || seenMaker.has(cn)) return;
      seenMaker.add(cn);
      const product = (it.title || '').replace(/<[^>]+>/g, '');
      /* 검색어가 일반어라 무관한 제품이 섞여 나올 수 있어, 실제 판매 제품명에 예측 품목의
         핵심 단어가 포함되는지 확인 — 무관한 제품의 제조사가 후보로 잘못 연결되는 것을 방지 */
      if (!isRelevantToProductType(product, kw)) return;
      shopMakerResults.push({
        name: maker, evidence_type: 'product', production: '생산중',
        evidence_detail: `네이버쇼핑 판매 제품 "${product.slice(0, 40)}"의 제조사(maker) 정보로 확인 — 실제 판매 중인 제품에서 제조원 역추적`,
        region: '', sourceLink: it.link || ''
      });
    });
  }
  const rssText = window._rssText || '';
  const allText = (newsTexts + ' ' + mfdsTexts + ' ' + rssText + ' ' + blogTexts).slice(0, 6000);

  /* ── ② 추출: Gemini 우선 → 실패·키없음 시 업체명 패턴 추출 폴백 ── */
  if (gkey && allText.trim()) {
    const prompt = `아래 텍스트에서 "${productType}" 제품과 관련된 국내 화장품 OEM/ODM 제조업체를 "세 가지 생산 관점"에서 모두 찾아주세요.
패키징·충진 설비 관점(${currentPkgType || '특수 패키징'})을 핵심 기준으로 삼으세요.
추측되는 업체도 반드시 포함하되, 확인된 업체와 근거를 명확히 구분하세요.

[검색 텍스트 — 네이버뉴스+식약처+뷰티미디어RSS+네이버블로그 통합]
${allText}

[3관점 분류 — production 필드]
1. "생산중"  : 현재 이 제품(또는 동일 유형)을 생산 중인 정황이 텍스트에 있는 업체
2. "생산이력": 과거 이 제품/유사 제품을 생산·출시한 이력이 텍스트에 있는 업체
3. "생산가능(추측)": 직접 언급은 없으나 ▲동일 충진/성형 설비 ▲동일 제형 취급 ▲유사 제품 포트폴리오로 보아 생산 가능하다고 추측되는 업체

[근거 등급 — evidence_type 필드]
- "mfds" : 식약처/제조업 등록 등 공적 근거가 텍스트에 있음
- "news" : 뉴스·RSS에 생산/수주 정황이 직접 언급됨
- "blog" : 블로그 리뷰·체험기 등에서 제조사/OEM 정황이 언급됨 (텍스트 중 블로그 출처 문단)
- "inferred" : 추측(생산가능). 이 경우 evidence_detail을 반드시 "추측: …(추측근거) …이므로 생산 가능"으로 작성

[규칙]
- 한국콜마·코스맥스·코스메카코리아 절대 제외
- 생산중/생산이력은 텍스트에 실제 언급된 업체만, 브랜드사가 아닌 제조사 우선
- 생산가능(추측)은 추측이어도 포함하되 evidence_type을 "inferred"로, 근거를 추측임이 드러나게 1문장 명시
- evidence_detail에는 텍스트의 어떤 내용이 근거인지 구체적으로 기재

JSON만 출력:
{"companies":[{"name":"업체명","evidence_type":"mfds|news|blog|inferred","production":"생산중|생산이력|생산가능(추측)","evidence_detail":"근거 설명","region":"지역(알 경우)"}]}`;
    try {
      const txt = await geminiGenerate(prompt, { maxTokens: 600, temperature: 0, timeout: 15000 });
      const parsed = JSON.parse(txt);
      (parsed.companies || []).forEach(c => { if (c.name) results.push(c); });
    } catch {}
  }
  if (!results.length && allText.trim()) {
    /* Gemini 없이도 동작 — 패턴 추출(업체명만 감지). 생산 여부 미확인 → 추측 후보로 표기 */
    extractCompanyNames(allText).slice(0, 6).forEach(n => {
      results.push({ name: n, evidence_type: 'inferred', production: '생산가능(추측)',
        evidence_detail: '추측: "' + kw + '" OEM·제조 관련 뉴스/RSS 텍스트에서 업체명이 감지됨 — 생산품목 직접 확인 필요', region: '' });
    });
  }
  /* 판매 제품 제조원 역추적 결과 합류 — maker 필드는 확정 근거이므로 항상 포함 */
  results.push(...shopMakerResults);
  /* KIPRIS 특허 출원인 합류 — "이 제품 관련 기술을 출원"한 정황은 생산가능성의 간접 근거 */
  (kiprisNames || []).forEach(name => {
    results.push({ name, evidence_type: 'patent', production: '생산가능(추측)',
      evidence_detail: `KIPRIS 특허 출원인 — "${kw} 화장품" 관련 키워드로 출원 확인(특허 출원은 생산 능력의 간접 근거이며 실제 생산 여부는 별도 확인 필요)`,
      region: '' });
  });

  /* ── ③ 식약처 화장품제조업 등록 교차검증 ──
     등록 확인 시: 업체 실재·제조업 등록은 격상(mfds)하되, "이 제품 생산 여부"는 별개이므로
     production(생산중/이력/추측)은 그대로 유지 → 추측 업체도 "등록 확인된 추측"으로 신뢰도만 보강 */
  results.forEach(c => {
    if (!c.production) c.production = c.evidence_type === 'inferred' ? '생산가능(추측)' : '생산중';
    const cn = normCompanyName(c.name);
    const hit = gmpList.find(g => {
      const gn = normCompanyName(g.name);
      return gn && cn && (gn.includes(cn) || cn.includes(gn));
    });
    if (hit) {
      /* 추측 후보는 evidence_type을 inferred로 두되 등록 확인 사실을 근거에 추가 */
      if (c.evidence_type !== 'inferred') c.evidence_type = 'mfds';
      c.gmpConfirmed = true;
      c.evidence_detail = `✓ 식약처 화장품제조업 등록 확인${hit.addr ? ' (' + hit.addr.split(' ').slice(0, 2).join(' ') + ')' : ''} · ${c.evidence_detail || ''}`;
      if (!c.region && hit.addr) c.region = hit.addr.split(' ')[0];
    }
  });

  /* ── ④ 대형3사·내부 DB 중복 제외 + 정규화 중복 제거 ── */
  const seen = new Set();
  const filtered = results.filter(c => {
    if (!c.name) return false;
    if (/콜마|코스맥스|코스메카/.test(c.name)) return false;
    const cn = normCompanyName(c.name);
    if (!cn || seen.has(cn)) return false;
    seen.add(cn);
    const inDB = DB.some(d => {
      const dn = normCompanyName(d.name);
      return dn.includes(cn) || cn.includes(dn);
    });
    return !inDB;
  });
  /* 근거 신뢰도 우선 정렬 — 확인(mfds>product>news>blog) 업체가 추측에 밀려나지 않도록.
     동급이면 생산중 > 생산이력 > 생산가능(추측) 순 */
  const evRank = { mfds: 0, product: 1, patent: 2, news: 3, blog: 4, inferred: 5 };
  const prodRank = { '생산중': 0, '생산이력': 1, '생산가능(추측)': 2 };
  filtered.sort((a, b) =>
    (evRank[a.evidence_type] ?? 5) - (evRank[b.evidence_type] ?? 5)
    || (prodRank[a.production] ?? 3) - (prodRank[b.production] ?? 3)
  );
  const top = filtered.slice(0, 10);

  /* ── ⑤ 홈페이지 탐색 — 추측(inferred) 근거 보강: 공식 홈페이지 확인 시 evidence_detail에 링크 추가 ── */
  if (nid && nsec) {
    const toLookup = top.filter(c => c.evidence_type === 'inferred' && !c.homepage).slice(0, 5);
    const hps = await Promise.all(toLookup.map(c => lookupCompanyHomepage(c.name, nid, nsec)));
    toLookup.forEach((c, i) => {
      if (hps[i]) {
        c.homepage = hps[i];
        c.evidence_detail += ` · 공식 홈페이지 확인됨: ${hps[i]}`;
      }
    });
  }

  /* ── ⑥ 사업장 실재성 확인 — 사업자등록번호 진위확인 API는 등록번호 입력이 필수라
     식약처/뉴스/블로그 어떤 소스에서도 확보 불가(등록번호 자체가 텍스트에 노출되지 않음).
     실무적 대안으로 네이버 지역검색(local.json)으로 "주소·전화번호가 실재하는 사업장인지"를
     확인 — 등록 진위 자체는 아니지만 유령 업체명 필터링에는 동일하게 유효 ── */
  if (nid && nsec) {
    const toVerify = top.slice(0, 6);
    const locals = await Promise.all(toVerify.map(c => lookupCompanyLocal(c.name, nid, nsec)));
    toVerify.forEach((c, i) => {
      if (locals[i]) {
        c.localVerified = true;
        c.localAddr = locals[i].address;
        c.localTel = locals[i].tel;
        c.evidence_detail += ` · 사업장 실재 확인(네이버지역검색): ${locals[i].address}${locals[i].tel ? ' / ' + locals[i].tel : ''}`;
      }
    });
  }

  /* ── ⑦ 신뢰도 점수 산정 + 최종 정렬 ── */
  top.forEach(c => { c.confidence = computeEvidenceScore(c); });
  top.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

  /* ── ⑧ 사전수집 폴백 보강 — 라이브 탐색 결과가 빈약(3건 미만)할 때만,
     GitHub Actions가 주기적으로 직접수집(non-CORS)한 data/trackb-fallback.json에서
     동일 카테고리 후보를 보충. same-origin 정적 파일이라 CORS 프록시 불필요 ── */
  if (top.length < 3) {
    try {
      const fb = await fetchTrackBFallback();
      const cand = (fb && fb[kw]) ? fb[kw] : [];
      const seenFb = new Set(top.map(c => normCompanyName(c.name)));
      cand.forEach(c => {
        const cn = normCompanyName(c.name);
        if (!cn || seenFb.has(cn)) return;
        seenFb.add(cn);
        top.push({ ...c, _fallback: true, confidence: computeEvidenceScore(c) });
      });
    } catch {}
  }
  /* 소싱 퍼널 집계용 — 이번 탐색에서 발굴된 신규처 후보를 누적 기록(중복 제거) */
  try {
    const seen = new Set(JSON.parse(ls('m5_trackb_seen') || '[]'));
    top.forEach(c => { const n = normCompanyName(c.name); if (n) seen.add(n); });
    ls('m5_trackb_seen', JSON.stringify([...seen].slice(-500)));
  } catch {}
  return top;
}

/* 사업장 실재성 확인 — 네이버 지역검색으로 주소·전화 보유 여부 확인.
   (참고) 사업자등록정보 진위확인 API는 사업자등록번호를 필수 입력값으로 요구하는데,
   식약처 GMP·뉴스·블로그 어떤 수집 경로에서도 등록번호 자체는 확보되지 않아 적용 불가했음.
   대신 실재하는 사업장인지(주소/전화 존재)를 확인하는 이 방식으로 유령 업체를 걸러낸다. */
async function lookupCompanyLocal(name, nid, nsec) {
  if (!name) return null;
  try {
    const j = await fetchNaverAPI(`https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(name)}&display=1`, nid, nsec, 6000);
    if (j && !j._error && Array.isArray(j.items) && j.items.length) {
      const it = j.items[0];
      const addr = (it.address || it.roadAddress || '').replace(/<[^>]+>/g, '');
      if (!addr) return null;
      return { address: addr, tel: (it.telephone || '').trim() };
    }
  } catch {}
  return null;
}

/* 신뢰도 점수(0~100) — 근거 등급 기본점 + 교차검증 보너스 누적.
   mfds(공적 등록) > product(실판매 제품 maker 역추적) > news > blog > inferred(추측) 순으로 기본점을 두고,
   식약처 등록확인·공식 홈페이지 확인·사업장 실재 확인이 추가될수록 가산한다. */
function computeEvidenceScore(c) {
  const base = { mfds: 55, product: 50, patent: 45, news: 35, blog: 25, inferred: 15 }[c.evidence_type] ?? 20;
  let score = base;
  if (c.gmpConfirmed) score += 20;
  if (c.homepage) score += 10;
  if (c.localVerified) score += 15;
  if (c.production === '생산중') score += 5;
  return Math.max(0, Math.min(100, score));
}

/* TRACK B 사전수집 폴백 — GitHub Actions가 주기적으로 collect-data.mjs에서 직접 호출(non-CORS)해
   생성하는 data/trackb-fallback.json을 same-origin으로 읽어온다. 라이브 탐색이 빈약할 때만 사용. */
async function fetchTrackBFallback() {
  if (window._trackBFallback) return window._trackBFallback;
  try {
    const r = await fetch('data/trackb-fallback.json', { cache: 'no-store' });
    if (!r.ok) return null;
    window._trackBFallback = await r.json();
    return window._trackBFallback;
  } catch { return null; }
}

/* 홈페이지 탐색 — 네이버 웹문서 검색으로 업체 공식 홈페이지 URL 추정(추측 근거 보강용) */
async function lookupCompanyHomepage(name, nid, nsec) {
  if (!name) return '';
  try {
    const j = await fetchNaverAPI(`https://openapi.naver.com/v1/search/webkr.json?query=${encodeURIComponent(name + ' 공식 홈페이지')}&display=3`, nid, nsec, 6000);
    if (j && !j._error && Array.isArray(j.items) && j.items.length) {
      const hit = j.items.find(i => /\.co\.kr|\.com|\.kr$/.test((i.link || '').replace(/\/$/, ''))) || j.items[0];
      return hit.link || '';
    }
  } catch {}
  return '';
}

/* ════ 패키징 적합도 점수 ════ */
function getPackagingScore(c, pkgType) {
  if (!pkgType) return 0;
  const certs = c.certs || [];
  const industry = c.industry || '';
  const pkg = pkgType.toLowerCase();

  let score = 0;
  if (certs.includes('CGMP')) score += 3;
  if (certs.includes('ISO22716')) score += 2;
  if (certs.includes('비건') || certs.includes('Vegan')) score += 1;
  if (certs.includes('할랄')) score += 1;

  if (pkg.includes('에어리스') || pkg.includes('펌프')) {
    if (industry.includes('제조')) score += 2;
    if (certs.includes('ISO9001')) score += 1;
  }
  if (pkg.includes('튜브') || pkg.includes('파우치')) {
    if (industry.includes('포장') || industry.includes('충진')) score += 3;
    if (certs.includes('ISO9001')) score += 1;
  }
  if (pkg.includes('병') || pkg.includes('용기') || pkg.includes('플라스틱')) {
    if (industry.includes('용기') || industry.includes('플라스틱') || industry.includes('포장')) score += 3;
  }
  if (pkg.includes('스틱') || pkg.includes('립')) {
    if (certs.includes('CGMP') || certs.includes('ISO22716')) score += 2;
  }
  return score;
}

/* ════ ZONE 2 렌더 ════ */
function renderZ2(pkgType = '') {
  const el = document.getElementById('z2body');
  window._evalCandidates = MATCH_RESULTS.trackB.slice();

  const sorted = pkgType
    ? MATCH_RESULTS.trackA.slice().sort((a, b) => getPackagingScore(b, pkgType) - getPackagingScore(a, pkgType))
    : MATCH_RESULTS.trackA;

  const aHtml = sorted.length
    ? sorted.map(c => mfrCardHtml(c, pkgType)).join('')
    : '<div class="empty-match">내부 DB에서 화장품 제조사를 찾지 못했습니다</div>';
  const bHtml = MATCH_RESULTS.trackB.length
    ? MATCH_RESULTS.trackB.map((c, idx) => newCardHtml(c, idx)).join('')
    : noTrackBHtml();

  el.innerHTML = `
    <div>
      <div class="track-hd track-a-hd">
        <div class="track-label">TRACK A — 기등록 업체<span class="track-cnt ta-cnt">${MATCH_RESULTS.trackA.length}곳</span></div>
        <span class="track-sub ta-sub">즉시 접촉 가능</span>
      </div>
      ${aHtml}
    </div>
    <div>
      <div class="track-hd track-b-hd">
        <div class="track-label" style="color:var(--acc)">TRACK B — 신규처 후보<span class="track-cnt tb-cnt">${MATCH_RESULTS.trackB.length}곳</span></div>
        <span class="track-sub tb-sub">등록평가 리스트 추가 가능</span>
      </div>
      ${bHtml}
    </div>`;
}

function mfrCardHtml(c, pkgType = '') {
  const mgrTxt = [
    c.mgr?.세종 ? '세종:' + c.mgr.세종 : '',
    c.mgr?.부천 ? '부천:' + c.mgr.부천 : ''
  ].filter(Boolean).join(' / ');
  const certHtml = (c.certs || []).slice(0, 4).map(cert => {
    const cls = cert === 'CGMP' ? 'cgmp' : cert.includes('ISO') ? 'iso' : (cert === '비건' || cert === 'Vegan') ? 'vegan' : '';
    return `<span class="cert ${cls}">${escHtml(cert)}</span>`;
  }).join('');
  let pkgBadge = '';
  if (pkgType) {
    const score = getPackagingScore(c, pkgType);
    if (score >= 5) pkgBadge = `<span class="pkg-badge pkg-hi">📦 패키징 적합</span>`;
    else if (score >= 2) pkgBadge = `<span class="pkg-badge pkg-mid">📦 패키징 검토</span>`;
    else pkgBadge = `<span class="pkg-badge pkg-lo">📦 확인 필요</span>`;
  }
  return `<div class="mcard ta">
    <div class="mc-head">
      <div class="mc-name">${escHtml(c.name)}</div>
      <span class="mc-st st-conf">기등록</span>
    </div>
    <div class="mc-meta">${escHtml(c.region)}${mgrTxt ? ' · ' + escHtml(mgrTxt) : ''}</div>
    <div class="mc-certs">${certHtml || '<span class="cert">인증 없음</span>'}${pkgBadge}</div>
    <div class="mc-capa">
      <div class="capa-field">
        <div class="capa-label">월 CAPA</div>
        <div class="capa-val">
          <input class="capa-input" type="text" placeholder="미입력" value="${escHtml(c.capa_monthly || '')}"
            onchange="saveCapa('${escJs(c.code || c.name)}','monthly',this.value)"> 만개
        </div>
      </div>
      <div class="capa-field">
        <div class="capa-label">최소 MOQ</div>
        <div class="capa-val">
          <input class="capa-input" type="text" placeholder="미입력" value="${escHtml(c.moq || '')}"
            onchange="saveCapa('${escJs(c.code || c.name)}','moq',this.value)">
        </div>
      </div>
    </div>
    <div class="mc-actions">
      <button class="btn-mc btn-detail" onclick="alert('TAB02 연동 예정: ${escJs(c.name)}')">TAB02 상세 →</button>
    </div>
  </div>`;
}

function newCardHtml(c, idx) {
  const evTypeCls = c.evidence_type === 'patent'   ? 'ev-patent'   :
                   c.evidence_type === 'news'     ? 'ev-news'     :
                   c.evidence_type === 'mfds'     ? 'ev-mfds'     :
                   c.evidence_type === 'product'  ? 'ev-product'  :
                   c.evidence_type === 'blog'     ? 'ev-blog'     :
                   c.evidence_type === 'inferred' ? 'ev-inferred' : 'ev-search';
  const evLabel = { patent:'특허 근거', news:'뉴스 근거', mfds:'식약처 근거', product:'판매제품 제조원 근거',
                    blog:'블로그 근거', inferred:'추측 근거', search:'검색 근거' }[c.evidence_type] || '근거';
  /* 생산 관점 배지 — 생산중/생산이력/생산가능(추측) */
  const prod = c.production || (c.evidence_type === 'inferred' ? '생산가능(추측)' : '생산중');
  const prodCls = prod === '생산중' ? 'prod-now' : prod === '생산이력' ? 'prod-past' : 'prod-maybe';
  const isInfer = c.evidence_type === 'inferred';
  const evalAdded = isInEvalList(c.name);
  /* 근거 링크 — 무엇이 열리는지 정직하게 라벨링.
     sourceLink(판매 제품/근거 출처 페이지)와 homepage(회사 공식 홈페이지)는 성격이 달라
     예전엔 둘 다 "근거 자료 열기"로 뭉뚱그려 판매 제품을 기대했는데 홈페이지가 열리는
     혼란이 있었음 → 링크 종류별로 버튼 문구를 구분한다. */
  let detailBtn;
  if (c.sourceLink) {
    const srcLabel = c.evidence_type === 'product' ? '판매 제품 페이지 →'
                   : c.evidence_type === 'blog'    ? '근거 블로그 →'
                   : c.evidence_type === 'news'    ? '근거 기사 →'
                   : '근거 출처 →';
    detailBtn = `<button class="btn-mc btn-detail" onclick="window.open('${escJs(c.sourceLink)}','_blank')">${srcLabel}</button>`;
  } else if (c.homepage) {
    detailBtn = `<button class="btn-mc btn-detail" onclick="window.open('${escJs(c.homepage)}','_blank')">공식 홈페이지 →</button>`;
  } else {
    detailBtn = `<button class="btn-mc btn-detail" onclick="alert('홈페이지 또는 KIPRIS에서 확인: ${escJs(c.name)}')">근거 확인</button>`;
  }
  const conf = c.confidence ?? computeEvidenceScore(c);
  const confCls = conf >= 65 ? 'conf-hi' : conf >= 35 ? 'conf-mid' : 'conf-lo';
  return `<div class="mcard${isInfer ? ' mcard-infer' : ''}">
    <div class="mc-head">
      <div class="mc-name">${escHtml(c.name)}</div>
      <span class="mc-st st-new">신규처 후보</span>
    </div>
    <div class="mc-meta">
      <span class="prod-badge ${prodCls}">${escHtml(prod)}</span>
      <span class="conf-badge ${confCls}">신뢰도 ${conf}</span>
      ${escHtml(c.region || '지역 확인 필요')} · DB 미등록${c.gmpConfirmed ? ' · <b style="color:var(--grn,#15803d)">식약처 제조업 등록확인</b>' : ' · <span style="color:var(--amber,#d97706)">식약처 등록 미확인</span>'}${c.localVerified ? ' · 사업장 실재확인' : ''}${c._fallback ? ' · 사전수집(주기적 갱신)' : ''}
    </div>
    <div class="evbox">
      <div class="ev-type ${evTypeCls}">${evLabel}</div>
      <div class="ev-txt">${escHtml(c.evidence_detail || '근거 상세 없음')}</div>
    </div>
    <div class="mc-actions">
      ${detailBtn}
      <button class="btn-mc btn-eval ${evalAdded ? 'added' : ''}" id="eval-btn-${idx}"
        onclick="addToEvalList(${idx})">${evalAdded ? '추가됨' : '+ 등록평가 추가'}</button>
    </div>
  </div>`;
}

function noTrackBHtml() {
  const pred = PREDICTIONS[SEL_IDX];
  const kw = pred ? escHtml(extractSearchKw(pred.type)) : '화장품 제조';
  return `<div class="mcard">
    <div style="font-size:11px;color:var(--ink3);margin-bottom:8px">
      ${!K.naverID() ? '네이버 API 키 미설정 — 키 설정 후 수집 실행하면 자동 탐색됩니다' : '뉴스·식약처 데이터에서 신규처 업체명을 확인하지 못했습니다'}
    </div>
    <div class="search-hint">
      <div style="font-size:9px;font-weight:700;color:var(--ink3);margin-bottom:4px">자동 탐색 경로 (재시도 시)</div>
      <span class="skw">"${kw} OEM"(생산중) / "${kw} 제조사 출시"(생산이력)</span><br>
      <span class="skw">패키징 키워드 + "충진 OEM"</span> 생산가능(설비) 관점 추측 탐색<br>
      <span class="skw">식약처 품목정보 + 제조업 등록목록</span> 교차검증·지역 보강<br>
      <span class="skw">네이버쇼핑 "${kw}" 검색결과 제조사(maker) 필드</span> 판매 제품 제조원 역추적<br>
      <span class="skw">네이버블로그 "${kw} OEM 제조"</span> 블로그 후기·체험기 근거 추적<br>
      <span class="skw">추측 후보 업체명 + "공식 홈페이지"</span> 웹문서 검색으로 홈페이지 확인<br>
      <span class="skw">업체명 네이버 지역검색</span> 사업장 주소·전화 실재성 확인 (신뢰도 가산)<br>
      ${K.kipris() ? `<span class="skw">"${kw} 화장품" KIPRIS 특허 출원인</span> 자동 탐색 (베타 — 실키 미검증)<br>` : ''}
      <span class="skw">data/trackb-fallback.json</span> 라이브 결과 빈약 시 GitHub Actions 사전수집 후보 보충
    </div>
    <div class="search-hint" style="margin-top:6px">
      <div style="font-size:9px;font-weight:700;color:var(--ink3);margin-bottom:4px">수동 탐색 기준</div>
      ${!K.kipris() ? `<span class="skw">"${kw}" AND "화장품"</span> KIPRIS 특허 출원인 (API 설정에서 키 등록 시 자동화) (plus.kipris.or.kr)<br>` : ''}
      <span class="skw">제품명으로 제조업소명 추적</span> 식약처 의약품안전나라
    </div>
  </div>`;
}

/* ════ 등록평가 리스트 관리 ════ */
function getEvalList()      { try { return JSON.parse(ls('eval_pending') || '[]'); } catch { return []; } }
function isInEvalList(name) { return getEvalList().some(e => e.name === name); }

function addToEvalList(idx) {
  const c = window._evalCandidates?.[idx];
  if (!c) { showToast('데이터를 찾을 수 없습니다'); return; }
  const name = c.name;
  if (isInEvalList(name)) { showToast('이미 등록평가 리스트에 있습니다'); return; }
  const list = getEvalList();
  list.push({ name, addedAt: new Date().toISOString(), fromModule: 'trend', ...c });
  ls('eval_pending', JSON.stringify(list));
  const btn = document.getElementById('eval-btn-' + idx);
  if (btn) { btn.textContent = '추가됨'; btn.classList.add('added'); }
  renderFunnel();
  showToast(`"${name}" 등록평가 리스트 추가 (TAB04 연동)`);
}

function saveCapa(code, type, val) {
  ls('capa_' + code + '_' + type, val);
}

/* ════ 전체 수집 실행 ════ */
/* ── 사전수집 데이터 (GitHub Actions 서버사이드 수집) ──────────────
   .github/workflows/collect-trends.yml이 6시간마다 서버에서 4대 신호를
   수집해 data/trends.json으로 커밋 → 프론트는 same-origin 정적 파일만
   읽으므로 내부망에서 외부 CORS 프록시가 차단돼도 실데이터 표시 가능 */
const PRECOLLECT_MAX_AGE_H = 48;   /* 이보다 오래된 사전수집본은 무시하고 라이브 수집 */
async function loadPrecollected() {
  try {
    const r = await fetch(`data/trends.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j || !j.sig || !j.collectedAt) return null;
    const ageH = (Date.now() - new Date(j.collectedAt).getTime()) / 36e5;
    if (isNaN(ageH) || ageH > PRECOLLECT_MAX_AGE_H) return null;
    /* 전 신호가 샘플뿐이면(서버에 Secrets 미등록 등) 라이브 수집이 나을 수 있음 */
    const hasReal = Object.values(j.sig).some(v => v && !v._sample);
    return hasReal ? j : null;
  } catch { return null; }
}
function applyPrecollected(pre) {
  SIG_DATA = { climate: null, society: null, economy: null, culture: null, ...pre.sig };
  window._dlTrends = pre.dlTrends || null;
  window._dlErr = pre.dlErr ?? null;
  window._salesTrends = pre.salesTrends || null;
  window._salesErr = pre.salesErr ?? null;
  window._exportTrends = pre.exportTrends || null;
  window._exportErr = pre.exportErr ?? null;
  window._newsTrends = pre.newsTrends || null;
  window._rssText = pre.rssText || '';
  window._climateTrend = pre.climateTrend || null;
  window._gtrends = pre.gtrendsTrends || null;
  window._reddit = pre.redditTrends || null;
  /* 서버 수집 시점의 소스 연결 상태 재생 */
  Object.entries(pre.sdots || {}).forEach(([id, state]) => setSdot(id, state));
}

async function collectAll() {
  const btn = document.getElementById('btnCollect');
  btn.classList.add('running'); btn.disabled = true;

  /* 캐시 초기화 */
  PREDICTIONS_CACHE['3m'] = null;
  PREDICTIONS_CACHE['6m'] = null;
  PREDICTIONS_CACHE['1y'] = null;
  SEL_IDX = -1; currentPkgType = '';

  ['climate','society','economy','culture'].forEach(k => { SIG_DATA[k] = null; });
  renderZ0();

  const setStep = (txt, pct) => {
    btn.textContent = txt;
    const sm = document.getElementById('statusSummary');
    if (sm) sm.textContent = pct;
  };

  /* 신호 수집 우선순위 — 사용자가 자기 키를 넣었으면 "그 키로 라이브 수집"이 최우선.
     (이전엔 서버 사전수집본이 있으면 무조건 그걸 써서, 사용자가 키를 넣어도 자기 키가
     적용되지 않는 문제가 있었음.) 키가 없을 때만 서버 사전수집본(프록시 불필요·내부망
     동작)을 쓰고, 키는 있으나 라이브가 전부 실패하면 사전수집본으로 폴백한다. */
  const hasOwnKeys = K.public() || K.naverID() || K.ecos();
  let usedPre = false;
  if (!hasOwnKeys) {
    setStep('사전수집 데이터 확인 중...', '확인 중');
    const pre = await loadPrecollected();
    if (pre) {
      applyPrecollected(pre); renderZ0(); usedPre = true;
      const ageH = Math.max(0, Math.round((Date.now() - new Date(pre.collectedAt).getTime()) / 36e5));
      showToast(`API 키 미설정 — 서버 사전수집 데이터 로드 (${ageH}시간 전) · 내 키 입력 시 실시간 수집됩니다`);
    } else {
      showToast('API 키 미설정 — 샘플 데이터로 데모 실행합니다. [API 설정]에서 키를 입력하세요.');
    }
  }
  if (!usedPre) {
    /* 사용자 키로 직접 라이브 수집 — "내 키가 실제 적용되는" 경로 */
    setStep('① 기후 수집 중...', '수집 1/4');
    await collectClimate(); renderZ0();

    setStep('② 사회 수집 중...', '수집 2/4');
    await collectSociety(); renderZ0();

    setStep('③ 경제 수집 중...', '수집 3/4');
    await collectEconomy(); renderZ0();

    setStep('④ 문화 수집 중...', '수집 4/4');
    await collectCulture(); renderZ0();

    /* 키는 있으나 라이브가 전부 실패(사내망 프록시 차단 등 → 전 신호 샘플)하면
       서버 사전수집본으로 폴백해 빈손을 면한다 */
    if (hasOwnKeys && ['climate','society','economy','culture'].every(k => !SIG_DATA[k] || SIG_DATA[k]._sample)) {
      const pre = await loadPrecollected();
      if (pre) {
        applyPrecollected(pre); renderZ0();
        showToast('라이브 수집 실패(프록시 차단 등) — 서버 사전수집 데이터로 대체');
      }
    }
  }

  updateStatusSummary();

  setStep('⑤ 공급·해외박람회·YouTube·글로벌 선행신호 수집 중...', '선행신호');
  await Promise.all([collectMFDSSupply(), collectGlobalExpoTrends(), collectYouTubeTrends(), loadServerLeads()]);

  /* 라이프사이클: 오늘 모멘텀을 스냅샷으로 누적 → 4단계 분류(예측 프롬프트에도 반영) */
  recordMomentumSnapshot();
  window._lifecycle = computeLifecycle();
  renderLifecycle();
  /* 제형 레이더: 신호를 제형 단위로 재집계 → 점수·등급·CAPA 체인 (예측 앵커) */
  window._formRadar = computeFormulationRadar();
  renderFormulationRadar();

  setStep('⑥ 박람회 일정 확인·국내 행사 자동 발견 중...', '일정 확인');
  window._expoVerified = await verifyExpoSchedules();
  await discoverDomesticExpos();
  renderZ4();

  const periodLabel = PERIOD_LABEL[currentPeriod] || '6개월';
  setStep(`⑦ Gemini ${periodLabel} 분석 중...`, 'AI 분석');
  document.getElementById('z1body').innerHTML =
    `<div class="z1-placeholder"><div class="sig-loading" style="justify-content:center">Gemini ${periodLabel} 예측 분석 중...</div></div>`;
  await runGeminiPrediction(currentPeriod);
  if (PREDICTIONS.length) savePredHistory(PREDICTIONS, currentPeriod);
  renderZ1();
  resetZ2();

  setStep('⑧ 신제품 레이더 확인 중...', '출시 감지');
  await collectProductRadar();
  renderRadar();
  /* 출시 보도가 확보됐으므로 신제품 축을 포함해 제형 점수 재산출 */
  window._formRadar = computeFormulationRadar();
  renderFormulationRadar();

  /* IMP-04: 보고서 자동 생성 */
  genReport();
  renderScoreboard();
  renderFunnel();
  checkWatchdog();

  btn.textContent = '전체 수집 실행'; btn.classList.remove('running'); btn.disabled = false;
  showToast('수집 완료 — 예측 TOP5 도출됨 · 보고서 자동 생성됨');
}

function updateStatusSummary() {
  const dotIds = ['sd-climate', 'sd-air', 'sd-ecos', 'sd-datalab', 'sd-news', 'sd-kosis', 'sd-export'];
  const ok = dotIds.filter(id => {
    const el = document.getElementById(id);
    return el && el.classList.contains('ok');
  }).length;
  const el = document.getElementById('statusSummary');
  if (el) {
    el.textContent = `${ok}/${dotIds.length} 소스 연결`;
    el.style.color = ok >= 4 ? 'var(--grn)' : 'var(--yel)';
  }
}

function setSdot(id, state) {
  const el = document.getElementById(id);
  if (el) el.className = 'sdot ' + state;
}

/* ════ 보고서 생성 ════ */
function genReport() {
  const period = document.getElementById('hdPeriod').textContent;
  const lines = [];
  lines.push('[트렌드 예측 & 소싱 검증 보고서]');
  lines.push(period);
  lines.push('─'.repeat(40));
  lines.push('');
  lines.push('▶ 4대 신호 종합');
  Object.entries(SIG_DATA).forEach(([k, v]) => {
    if (v) lines.push(`  ${k}: ${v.score}/5${v._sample ? ' [샘플]' : ' [실데이터]'} — ${v.interpret}`);
  });
  if (window._exportTrends && window._exportTrends.length) {
    lines.push('');
    lines.push('▶ 관세청 화장품 수출 실적 — 실판매 실측 (최근 3개월 vs 직전 3개월)');
    window._exportTrends.forEach(t => lines.push(`  • ${t.name}: ${t.delta >= 0 ? '+' : ''}${t.delta}%`));
  }
  if (window._salesTrends && window._salesTrends.length) {
    lines.push('');
    lines.push('▶ 네이버쇼핑 클릭 트렌드 — 구매의도/판매 선행지표 (최근 3개월)');
    window._salesTrends.forEach(t => lines.push(`  • ${t.name}: ${t.delta >= 0 ? '+' : ''}${t.delta}%`));
  }
  if (window._dlTrends && window._dlTrends.length) {
    lines.push('');
    lines.push('▶ 네이버 검색트렌드 (최근 3개월 카테고리 상승률)');
    window._dlTrends.forEach(t => lines.push(`  • ${t.name}: ${t.delta >= 0 ? '+' : ''}${t.delta}%`));
  }
  if (window._formRadar && window._formRadar.length) {
    lines.push('');
    lines.push('▶ 제형 트렌드 레이더 — 성분→제형→패키징→생산설비(CAPA) [SNS35·검색30·신제품25·글로벌10]');
    window._formRadar.slice(0, 8).forEach(r =>
      lines.push(`  • ${r.name}(${r.en}) ${r.score}점 · ${r.grade} · 신뢰도 ${r.coverage}% · 설비: ${r.capa.join(' / ')}`));
  }
  if (window._globalRetail && (window._globalRetail.formulations || []).length) {
    const gr = window._globalRetail;
    lines.push('');
    lines.push('▶ Layer1 글로벌 선행시장 — Sephora·Ulta·@cosme·샤오홍슈 제형 언급');
    gr.formulations.slice(0, 8).forEach(f => lines.push(`  • ${f.name}: ${f.mentions}건 (${f.platforms.join('·')})`));
    lines.push(`  ※ 수집 방식: ${(gr.sources||[]).map(s => `${s.platform}=${s.ok ? s.mode : '실패'}`).join(', ')}`);
  }
  if (window._supplyTrends && window._supplyTrends.length) {
    lines.push('');
    lines.push('▶ 식약처 등록 화장품 — 제형별 품목 수 (공급 규모 신호)');
    window._supplyTrends.slice(0, 10).forEach(t => lines.push(`  • ${t.name}: ${t.count}건${t.recent ? ` (최근6개월 신규 ${t.recent}건)` : ''}`));
  }
  if (window._expoTrends && window._expoTrends.length) {
    lines.push('');
    lines.push(`▶ 해외 박람회 선행 트렌드 — 최근 ${GLOBAL_EXPO_RECENT_DAYS}일 글로벌 박람회 보도 키워드 (선행신호)`);
    window._expoTrends.slice(0, 10).forEach(t => lines.push(`  • ${t.name}: ${t.count}건 언급`));
  }
  if (window._ytTrends && window._ytTrends.length) {
    lines.push('');
    lines.push('▶ YouTube 콘텐츠 모멘텀 (최근 30일 vs 직전 30일 영상 수)');
    window._ytTrends.slice(0, 8).forEach(t => lines.push(`  • ${t.name}: ${t.delta >= 0 ? '+' : ''}${t.delta}%`));
  }
  if (window._gtrends && window._gtrends.length) {
    lines.push('');
    lines.push('▶ 글로벌 검색 모멘텀 — Google Trends 미국 (수출 선행)');
    window._gtrends.slice(0, 8).forEach(t => lines.push(`  • ${t.name}: ${t.delta >= 0 ? '+' : ''}${t.delta}%`));
  }
  if (window._reddit && window._reddit.length) {
    lines.push('');
    lines.push('▶ 해외 K뷰티 커뮤니티 언급 — Reddit 최근 1개월');
    window._reddit.slice(0, 8).forEach(t => lines.push(`  • ${t.name}: ${t.count}건`));
  }
  lines.push('');
  lines.push('▶ 리테일 실측 앵커 (실구매·실사용 공식 리포트 — 연간)');
  RETAIL_ANCHORS.forEach(a => lines.push(`  • ${a.src} (${a.basis}): ${a.themes.join(' · ')}`));
  if (window._newsTrends && window._newsTrends.length) {
    lines.push('');
    lines.push('▶ 뷰티 뉴스·미디어 최다 언급 키워드');
    window._newsTrends.forEach(t => lines.push(`  • ${t.name}: ${t.count}건`));
  }
  if (window._climateTrend) {
    const ct = window._climateTrend;
    lines.push('');
    lines.push('▶ 기후 추세 (Open-Meteo)');
    if (ct.deviation !== null) lines.push(`  • 평년(작년 동기) 대비: ${ct.deviation >= 0 ? '+' : ''}${ct.deviation}℃`);
    if (ct.trend16) lines.push(`  • 16일 단기예보 추세(참고용): ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃ (1주차 ${ct.trend16.week1}℃ → 2주차 ${ct.trend16.week2}℃)`);
    if (window._seasonalOutlook && window._seasonalOutlook.length) {
      lines.push(`  • 평년 기준 계절 전망(1~6개월): ` + window._seasonalOutlook.map(o => `${o.monthsAhead}개월 후(${o.targetMonth}월) ${o.avgMaxTemp}℃`).join(' · '));
    }
  }
  const matured = backtestPredictions();
  if (matured.length) {
    lines.push('');
    lines.push('▶ 과거 예측 백테스트 (신호 일치도 — 실제 매출 검증 아님, 참고용)');
    matured.slice(0, 5).forEach(h => {
      const dateStr = new Date(h.ts).toLocaleDateString('ko-KR');
      lines.push(`  • ${dateStr} 6개월 예측: ${h.hits}/${h.total} 유형이 검증 시점 모멘텀 신호에서 재포착됨`);
    });
  }
  lines.push('');
  lines.push('▶ 예측 화장품 유형 TOP5');
  PREDICTIONS.forEach(p => lines.push(`  ${p.rank}위. ${p.type} (신뢰도 ${p.confidence}%) — 출시적기: ${p.season}`));
  if (SEL_IDX >= 0 && PREDICTIONS[SEL_IDX]) {
    const p = PREDICTIONS[SEL_IDX];
    lines.push('');
    lines.push(`▶ 선택 유형 제조사 매칭: ${p.type}`);
    lines.push('  [TRACK A — 기등록]');
    MATCH_RESULTS.trackA.forEach(c => lines.push(`    • ${c.name} (${c.region}) 인증: ${(c.certs || []).join('/')}`));
    if (MATCH_RESULTS.trackB.length) {
      lines.push('  [TRACK B — 신규처 후보]');
      MATCH_RESULTS.trackB.forEach(c => lines.push(`    • [${c.production || '생산중'}] ${c.name} — ${c.evidence_detail || '근거 확인 필요'}`));
    }
  }
  lines.push('');
  lines.push('▶ 즉시 대응 법령·규제 (확정 선행신호 · D-day 순)');
  {
    const nowD = new Date();
    REGS.map(r => {
      const m = String(r.date).match(/(\d{4})[.\-](\d{1,2})(?:[.\-](\d{1,2}))?/);
      const d = m ? new Date(+m[1], +m[2] - 1, +(m[3] || 1)) : null;
      return { r, d, months: d ? Math.round((d - nowD) / (30 * 86400000)) : null };
    }).sort((a, b) => (a.d || 0) - (b.d || 0)).forEach(({ r, months }) => {
      const dlabel = months === null ? '' : months <= 0 ? ' [시행중/임박]' : ` [D-${months}개월]`;
      lines.push(`  • [${r.tag}] ${r.title} (${r.date})${dlabel}`);
    });
  }
  lines.push('─'.repeat(40));
  lines.push('※ 본 보고서는 AI 예측 기반입니다. 최종 확인 필요.');
  document.getElementById('repText').value = lines.join('\n');
}

function copyReport() {
  const ta = document.getElementById('repText');
  if (!ta.value) genReport();
  navigator.clipboard.writeText(ta.value).then(() => showToast('보고서 복사 완료'));
}

/* PDF 내보내기 — 별도 라이브러리 없이 브라우저 인쇄(다른 이름으로 저장 → PDF)로 처리 */
function exportReportPDF() {
  const ta = document.getElementById('repText');
  if (!ta.value) genReport();
  document.getElementById('printReport').textContent = ta.value;
  window.print();
}

/* Excel 내보내기 — 네이티브 .xlsx가 아닌 UTF-8 BOM CSV(쉼표분리텍스트) 생성, Excel에서 정상 호환 */
function exportReportCSV() {
  if (!document.getElementById('repText').value) genReport();
  if (!PREDICTIONS.length) { showToast('먼저 [전체 수집 실행] 후 보고서를 생성하세요'); return; }
  const rows = [['구분', '항목', '내용']];
  Object.entries(SIG_DATA).forEach(([k, v]) => {
    if (v) rows.push(['신호', k, `${v.score}/5${v._sample ? ' [샘플]' : ' [실데이터]'} - ${v.interpret}`]);
  });
  PREDICTIONS.forEach(p => rows.push(['예측 TOP5', `${p.rank}위 ${p.type}`, `신뢰도 ${p.confidence}% / 출시적기 ${p.season}`]));
  const matured = backtestPredictions();
  matured.slice(0, 5).forEach(h => {
    const dateStr = new Date(h.ts).toLocaleDateString('ko-KR');
    rows.push(['백테스트', dateStr, `${h.hits}/${h.total} 신호 일치 (`]);
  });
  REGS.filter(r => r.level === 'critical').forEach(r => rows.push(['긴급 법령·규제', r.tag, `${r.title} (${r.date})`]));
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  a.href = url;
  a.download = `cosmedb_weekly_briefing_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV 파일 다운로드 완료');
}

/* ════ API 테스트 함수들 ════ */
async function testGemini() {
  const key = K.gemini();
  if (!key) { showToast('Gemini 키를 먼저 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-gemini');
  el.textContent = '테스트 중...'; el.style.color = 'var(--ink3)';
  try {
    let reply;
    try {
      reply = await geminiGenerate('한 단어로만 답하세요: 화장품', { maxTokens: 10, timeout: 12000 });
    } catch (ge) {
      const errMsg = ge.message || '';
      if (ge.status === 429) {
        const isZeroQuota = errMsg.includes('limit: 0') || errMsg.includes('free_tier');
        el.textContent = isZeroQuota
          ? `쿼터 0 오류 (429)\n\n해결:\n① 모델을 gemini-2.5-flash-lite 로 변경 (AQ키 무료 1,000건)\n② 또는 aistudio.google.com/app/apikey 에서\n   "Create API key in new project" 로 새 키 발급\n③ 또는 Google Cloud Console에서 결제 계정 연결`
          : `요청 한도 초과 (429)\n잠시 후 다시 시도하세요.\n${errMsg}`;
      } else if (ge.status === 400) {
        el.textContent = `잘못된 요청 (400): API 키가 유효하지 않습니다.\n\n해결:\n① 키를 다시 [저장] 후 재테스트\n② AQ 키라면 모델: gemini-2.5-flash-lite 선택\n③ aistudio.google.com/app/apikey → 새 키 재발급\n\n원본 오류: ${errMsg}`;
      } else if (ge.status === 403) {
        el.textContent = `접근 거부 (403): API 키가 유효하지 않거나 Gemini API가 비활성화됐습니다.\n${errMsg}`;
      } else {
        el.textContent = `오류${ge.status ? ` (${ge.status})` : ''}: ${errMsg}`;
      }
      el.style.color = 'var(--red)'; return;
    }
    if (reply) {
      el.textContent = `연결 성공 — 모델: ${K.model()} · 응답: "${reply.trim()}"`;
      el.style.color = 'var(--grn)';
      setStatus('st-gemini', '확인됨', true);
    } else {
      el.textContent = '응답이 비어 있습니다 — 모델·키를 확인하세요';
      el.style.color = 'var(--yel)';
    }
  } catch (e) {
    el.textContent = e.name === 'AbortError' ? '타임아웃 (12초 초과)' : '연결 실패: ' + e.message;
    el.style.color = 'var(--red)';
  }
}

async function testPublic() {
  const key = K.public();
  if (!key) { showToast('공공데이터 키를 먼저 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-public');
  el.innerHTML = ''; el.style.color = 'var(--ink3)';

  /* 진행 표시 */
  const prog = document.createElement('div');
  prog.textContent = '승인 API 3종 동시 테스트 중 (기상청 · 에어코리아 · 식약처)...';
  el.appendChild(prog);

  /* ── API 1: 기상청 초단기실황 ── */
  const wxBase = getWxBase();
  const wxUrl  = `https://apis.data.go.kr/1360000/VilageFcstInfoService2.0/getUltraSrtNcst?serviceKey=${encodeURIComponent(key)}&numOfRows=5&pageNo=1&dataType=JSON&base_date=${wxBase.date}&base_time=${wxBase.time}&nx=60&ny=127`;

  /* ── API 2: 에어코리아 서울 ── */
  const aqUrl  = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${encodeURIComponent(key)}&returnType=json&numOfRows=3&pageNo=1&sidoName=${encodeURIComponent('서울')}&ver=1.0`;

  /* ── API 3: 식약처 화장품 GMP 적합 업체현황 (앱이 실제 의존하는 API로 테스트) ──
     이전엔 '기능성화장품 보고품목'을 테스트했는데 그 API는 별도 활용신청이 필요해 대부분
     미승인 → 늘 실패했다. GMP 업체현황은 널리 승인되고 TRACK B 검증에도 실제 쓰인다. */
  const mfdsUrl = `https://apis.data.go.kr/1471000/CsmtcsMnfstRegService01/getCsmtcsMnfstRegInfo?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=5&type=json`;

  const parseRC = (j) => j?.response?.header?.resultCode || j?.header?.resultCode || null;
  const rcHint = (rc, rm) =>
    rc === '30' ? '키 인증 실패 — 키 재확인' :
    rc === '03' ? '데이터 미발표 — 잠시 후 재시도' :
    rc === '12' ? 'API 활용신청 필요' :
    rc === '22' ? '일일 한도 초과' :
    (rm || `코드 ${rc}`);

  /* 3개 병렬 실행 */
  const [wxRes, aqRes, mfdsRes] = await Promise.all([
    fetchProxy(wxUrl,  14000),
    fetchProxy(aqUrl,  12000),
    fetchProxy(mfdsUrl, 12000),
  ]);

  prog.remove();
  el.style.color = 'inherit';

  const addLine = (icon, label, detail, color) => {
    const d = document.createElement('div');
    d.style.cssText = `color:${color};margin-bottom:4px;font-size:10px;line-height:1.4`;
    /* 상태는 색상으로 구분 — 이모지 대신 단색 점(●) 사용 */
    d.textContent = `● ${label}: ${detail}`;
    el.appendChild(d);
  };

  let anyOk = false;

  /* 실패한 API에 대해 allorigins /get 으로 진단 (http_code 확인) */
  const diagProxy = async (u) => {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 7000);
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!r.ok) return { code: 0, snippet: '' };
      const j = await r.json();
      const code = j?.status?.http_code || 0;
      const snippet = (j?.contents || '').slice(0, 80);
      return { code, snippet };
    } catch { return { code: 0, snippet: '' }; }
  };

  /* snippet에서 data.go.kr resultCode XML 추출 시도 */
  const extractRC = (s) => {
    const m = s?.match(/returnReasonCode[>](\d+)|resultCode[">](\d+)|<CODE>(\w+)/i);
    return m ? (m[1] || m[2] || m[3]) : null;
  };
  const diagMsg = ({ code, snippet }) => {
    if (code === 0) return '모든 프록시 연결 실패 — URL 복사 후 새 탭에서 직접 확인하세요';
    if (code === 401 || code === 403) return `HTTP ${code}: API 키 미승인 또는 접근 거부`;
    if (code >= 500) {
      const rc = extractRC(snippet);
      const detail = rc ? ` (API 코드:${rc})` : (snippet ? ` — 응답: "${snippet.trim().slice(0,60)}"` : '');
      return `HTTP ${code}: 서버 응답${detail}`;
    }
    if (code >= 200 && snippet) {
      const rc = extractRC(snippet);
      return `HTTP ${code}${rc ? ` (API코드:${rc})` : ''} — 응답: "${snippet.trim().slice(0,60)}"`;
    }
    return `HTTP ${code}`;
  };

  /* 결과 1: 기상청 (CORS 미지원 → 프록시 의존) + Open-Meteo 폴백 확인 */
  if (!wxRes) {
    const d = await diagProxy(wxUrl);
    const why = d.code === 0
      ? '기상청 /1360000/ CORS 미지원 + 외부 프록시 IP 차단 (한국 정부 API 정책)'
      : diagMsg(d);
    addLine('','기상청 단기예보', why, 'var(--red)');
    /* Open-Meteo 폴백 동작 여부 확인 */
    try {
      const ctrl2 = new AbortController();
      const tid2 = setTimeout(() => ctrl2.abort(), 6000);
      const omR = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,relative_humidity_2m&timezone=Asia%2FSeoul&forecast_days=1', { signal: ctrl2.signal });
      clearTimeout(tid2);
      if (omR.ok) {
        const omJ = await omR.json();
        const t = omJ?.current?.temperature_2m;
        const h = omJ?.current?.relative_humidity_2m;
        addLine('↩', 'Open-Meteo 폴백', `기온 ${t ?? '—'}℃  습도 ${h ?? '—'}%  (수집실행 시 자동 대체됨)`, 'var(--ink2,#666)');
      }
    } catch { addLine('','Open-Meteo 폴백', '연결 실패', 'var(--red)'); }
  } else {
    try {
      const j = JSON.parse(wxRes);
      const rc = parseRC(j);
      if (rc !== '00') {
        addLine('','기상청 단기예보', rcHint(rc, j?.response?.header?.resultMsg), 'var(--amber,#d97706)');
      } else {
        const it = j?.response?.body?.items?.item || [];
        const temp = it.find(i => i.category === 'T1H')?.obsrValue ?? '—';
        const hum  = it.find(i => i.category === 'REH')?.obsrValue ?? '—';
        addLine('','기상청 단기예보', `기온 ${temp}℃  습도 ${hum}%  (서울 ${wxBase.time})`, 'var(--grn)');
        anyOk = true;
      }
    } catch {
      /* XML 오류 응답 감지 (data.go.kr 일부 오류는 XML로 반환) */
      const xmlRc = wxRes.match(/returnReasonCode[^>]*>(\w+)|resultCode[^>]*>(\w+)/)?.[1];
      const xmlMsg = wxRes.match(/returnAuthMsg[^>]*>([^<]+)|resultMsg[^>]*>([^<]+)/)?.[1];
      if (xmlRc) {
        addLine('','기상청 단기예보', `API코드 ${xmlRc}: ${xmlMsg || rcHint(xmlRc,'')}`, 'var(--amber,#d97706)');
      } else {
        addLine('','기상청 단기예보', `응답 형식 오류: "${wxRes.slice(0,80)}"`, 'var(--red)');
      }
    }
  }

  /* 결과 2: 에어코리아 */
  if (!aqRes) {
    addLine('','에어코리아 대기오염', '응답 없음', 'var(--red)');
  } else {
    try {
      const j = JSON.parse(aqRes);
      const rc = parseRC(j);
      if (rc !== '00') {
        addLine('','에어코리아 대기오염', rcHint(rc, j?.response?.header?.resultMsg), 'var(--amber,#d97706)');
      } else {
        const items = j?.response?.body?.items || [];
        const pm10 = items[0]?.pm10Value ?? '—';
        const pm25 = items[0]?.pm25Value ?? '—';
        addLine('','에어코리아 대기오염', `PM10 ${pm10}㎍/㎥  PM2.5 ${pm25}㎍/㎥  (서울)`, 'var(--grn)');
        anyOk = true;
      }
    } catch { addLine('','에어코리아 대기오염', `파싱 실패: ${aqRes.slice(0,60)}`, 'var(--red)'); }
  }

  /* 결과 3: 식약처 GMP 업체현황 */
  if (!mfdsRes) {
    const d = await diagProxy(mfdsUrl);
    addLine('','식약처 GMP 업체현황', diagMsg(d), 'var(--red)');
  } else {
    try {
      const j = JSON.parse(mfdsRes);
      const rc = parseRC(j);
      if (rc && rc !== '00') {
        addLine('','식약처 GMP 업체현황', rcHint(rc, j?.response?.header?.resultMsg), 'var(--amber,#d97706)');
      } else {
        const items = j?.response?.body?.items?.item || j?.body?.items?.item || j?.response?.body?.items || [];
        const cnt = Array.isArray(items) ? items.length : (items ? 1 : 0);
        const total = j?.response?.body?.totalCount || j?.body?.totalCount || '—';
        addLine('','식약처 GMP 업체현황', `${cnt}건 수신 (전체 ${total}건)`, 'var(--grn)');
        anyOk = true;
      }
    } catch {
      const xmlRc = mfdsRes.match(/returnReasonCode[^>]*>(\w+)|resultCode[^>]*>(\w+)/)?.[1];
      const xmlMsg = mfdsRes.match(/returnAuthMsg[^>]*>([^<]+)|resultMsg[^>]*>([^<]+)/)?.[1];
      if (xmlRc) {
        addLine('','식약처 GMP 업체현황', `API코드 ${xmlRc}: ${xmlMsg || rcHint(xmlRc,'')}`, 'var(--amber,#d97706)');
      } else {
        addLine('','식약처 GMP 업체현황', `응답 형식 오류: "${mfdsRes.slice(0,80)}"`, 'var(--red)');
      }
    }
  }

  /* URL 복사 버튼 */
  const btnDiv = document.createElement('div');
  btnDiv.style.cssText = 'margin-top:6px;display:flex;gap:4px;flex-wrap:wrap';
  [['기상청', wxUrl], ['에어코리아', aqUrl], ['식약처', mfdsUrl]].forEach(([lbl, u]) => {
    const b = document.createElement('button');
    b.className = 'ap-btn ap-test'; b.style.flex = '1';
    b.textContent = `${lbl} URL`;
    b.onclick = () => navigator.clipboard.writeText(u).then(() => showToast(`${lbl} URL 복사됨`));
    btnDiv.appendChild(b);
  });
  el.appendChild(btnDiv);

  if (anyOk) setStatus('st-public', '확인됨', true);
}

async function testNaver() {
  const nid = K.naverID(), nsec = K.naverSec();
  if (!nid || !nsec) { showToast('네이버 Client ID와 Secret을 모두 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-naver');
  el.textContent = '네이버 뉴스 API 테스트 중 (뷰티 전반·최근 60일 / 프록시 4종 순차 시도)...'; el.style.color = 'var(--ink3)';
  /* 단일어(에어리스) 고정 테스트는 "에어리스만 본다"는 오해를 줬다 → 실제 분석처럼
     뷰티 전 카테고리(선케어·색조·기능성·맨즈)를 대표 검색어로 조회하고 최근 60일만 집계 */
  const TEST_QUERIES = ['선크림 신제품', '쿠션 틴트 신상', '앰플 세럼 출시', '남성 그루밍 화장품'];
  const now = Date.now(), RECENT = 60 * 86400000;
  const j = await fetchNaverAPI(
    `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(TEST_QUERIES[0])}&display=3&sort=date`,
    nid, nsec, 14000);
  if (!j) {
    el.innerHTML = '';
    const msg = document.createElement('div');
    msg.style.color = 'var(--red)';
    msg.textContent = '프록시 4종 모두 실패\n\n가능한 원인:\n① 사내망·방화벽이 CORS 프록시 도메인을 차단 (모바일로 재시도)\n② 네트워크 일시 불가 — 수분 후 재시도\n\n※ 기능은 유지됩니다 — 뷰티 RSS(화장품신문 등)로 대체 수집됩니다';
    el.appendChild(msg);
    el.style.color = 'inherit'; return;
  }
  if (j._error) {
    if (j._error === 401) {
      el.textContent = 'HTTP 401: Client ID 또는 Secret 오류\nAPI 키를 다시 확인 후 저장하세요';
    } else if (j._error === 403) {
      el.innerHTML = '';
      const msg = document.createElement('div');
      msg.style.color = 'var(--red)';
      msg.textContent =
        'HTTP 403: 등록된 도메인에서만 호출 가능\n\n' +
        '도메인 등록이 완료된 경우에도 사내망에서 발생하는 원인:\n' +
        '• 사내 프록시/방화벽이 Referer 헤더를 삭제 → 네이버가 미등록 도메인으로 판단\n' +
        '• 사내망이 CORS 프록시 서버 차단\n\n' +
        '해결 방법:\n' +
        '① 모바일(LTE/5G)에서 재시도\n' +
        '② 네이버 앱 설정 → 환경 추가 → "모든 환경(서버)" 추가\n' +
        '③ 또는 URL 제한을 제거하고 IP 제한만 사용';
      el.appendChild(msg);
    } else {
      el.textContent = `HTTP ${j._error}: ${j._body?.slice(0, 80) || ''}`;
    }
    el.style.color = 'var(--red)'; return;
  }
  /* 연결 확인됨 — 나머지 카테고리도 조회해 "뷰티 전반 + 최근성"을 함께 보여준다 */
  const rest = await Promise.all(TEST_QUERIES.slice(1).map(q =>
    fetchNaverAPI(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=10&sort=date`, nid, nsec, 12000)
  ));
  const allResp = [{ q: TEST_QUERIES[0], j }, ...TEST_QUERIES.slice(1).map((q, i) => ({ q, j: rest[i] }))];
  const recentCount = resp => (resp && !resp._error)
    ? (resp.items || []).filter(it => { const t = it.pubDate ? new Date(it.pubDate).getTime() : NaN; return !isNaN(t) && (now - t) <= RECENT; }).length
    : 0;
  const lines = allResp.map(({ q, j }) =>
    `  · "${q}": 총 ${((j && j.total) || 0).toLocaleString()}건 (최근60일 표본 ${recentCount(j)}건)`);
  const sample = (j.items || []).slice(0, 2).map(i => '    - ' + i.title.replace(/<[^>]+>/g, '')).join('\n');
  el.textContent = `네이버 뉴스 연결 성공 — 뷰티 전 카테고리 조회 (선케어·색조·기능성·맨즈)\n${lines.join('\n')}\n예시 기사(선크림):\n${sample || '    (없음)'}`;
  el.style.color = 'var(--grn)';
  setStatus('st-naver', '확인됨', true);
}

async function testEcos() {
  const key = K.ecos();
  if (!key) { showToast('ECOS 키를 먼저 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-ecos');
  el.textContent = 'ECOS (한국은행) 연결 테스트 중...'; el.style.color = 'var(--ink3)';

  /* Step 1: StatisticTableList로 키 유효성 먼저 확인 (항목코드 불필요)
     ※ 서비스명 주의 — 'StatisticList'는 존재하지 않음 (과거 버그 원인) */
  const listUrl = `https://ecos.bok.or.kr/api/StatisticTableList/${key}/json/kr/1/3/`;
  try {
    const t1 = await fetchProxy(listUrl, 14000);
    if (!t1) {
      /* allorigins /get 직접 진단 */
      let diagCode = 0;
      try {
        const diagCtrl = new AbortController();
        const diagTid = setTimeout(() => diagCtrl.abort(), 8000);
        const dr = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(listUrl)}`, { signal: diagCtrl.signal });
        clearTimeout(diagTid);
        if (dr.ok) { const dj = await dr.json(); diagCode = dj?.status?.http_code || 0; }
      } catch {}
      el.textContent = diagCode >= 500
        ? `ECOS 서버 오류 (HTTP ${diagCode})\necos.bok.or.kr 서버가 일시적으로 불가합니다.\n잠시 후 재시도하세요.`
        : `ECOS 응답 없음\n\n점검 순서:\n① ECOS 키는 한국은행(ecos.bok.or.kr) 발급 키입니다 — data.go.kr 키와 다름\n② ecos.bok.or.kr → 마이페이지 → 인증키 발급내역에서 키 상태 확인\n③ 프록시 서버 일시 불가 → 수분 후 재시도\n④ ECOS API는 해외 IP(프록시 포함) 접근이 차단될 수 있습니다`;
      el.style.color = 'var(--red)'; return;
    }
    let j1;
    try { j1 = JSON.parse(t1); }
    catch { el.textContent = `파싱 실패\n응답: ${t1.slice(0, 150)}`; el.style.color = 'var(--red)'; return; }
    if (j1?.RESULT?.CODE && j1.RESULT.CODE !== 'INFO-000') {
      const codeMap = {
        'ERROR-300': '인증키 오류 — ecos.bok.or.kr 에서 키 재확인',
        'ERROR-200': 'API 요청 형식 오류',
        'ERROR-100': '필수 파라미터 누락',
      };
      el.textContent = `ECOS 키 오류: ${j1.RESULT.CODE}\n${codeMap[j1.RESULT.CODE] || j1.RESULT.MESSAGE}\n\necos.bok.or.kr 접속 → 마이페이지 → API 키 확인`;
      el.style.color = 'var(--red)'; return;
    }

    /* Step 2: CPI 조회 — 901Y009 소비자물가지수 / 주기 M / 항목 0(총지수), 데이터 지연 고려해 전전월까지 */
    const now = new Date();
    const toDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const toYM = `${toDate.getFullYear()}${String(toDate.getMonth() + 1).padStart(2,'0')}`;
    const frYM = `${toDate.getFullYear() - 1}${String(toDate.getMonth() + 1).padStart(2,'0')}`;
    const cpiUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/13/901Y009/M/${frYM}/${toYM}/0`;
    const t2 = await fetchProxy(cpiUrl, 12000);
    let cpiLines = '(CPI 데이터는 수집 실행 시 자동 조회됩니다)';
    if (t2) {
      try {
        const j2 = JSON.parse(t2);
        const rows = j2?.StatisticSearch?.row || [];
        if (rows.length) {
          cpiLines = '소비자물가지수 최근 3개월:\n' + rows.slice(-3).map(r => `  ${r.TIME}: ${r.DATA_VALUE}`).join('\n');
        }
      } catch {}
    }
    el.textContent = `ECOS 키 유효 — 연결 성공\n${cpiLines}`;
    el.style.color = 'var(--grn)';
    setStatus('st-ecos', '확인됨', true);
  } catch (e) {
    el.textContent = '오류: ' + e.message;
    el.style.color = 'var(--red)';
  }
}

async function testYoutube() {
  const key = K.youtube();
  if (!key) { showToast('YouTube 키를 먼저 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-youtube');
  el.textContent = 'YouTube Data API 테스트 중 ("선크림 화장품" 최근 30일 영상 검색)...'; el.style.color = 'var(--ink3)';
  try {
    const after = new Date(Date.now() - 30 * 86400000).toISOString();
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent('선크림 화장품')}&publishedAfter=${encodeURIComponent(after)}&key=${encodeURIComponent(key)}`;
    const r = key === '__BK__' ? await bkFetch(ytUrl, {}, 12000) : await fetch(ytUrl);
    const j = await r.json();
    if (!r.ok) {
      const msg = j?.error?.message || `HTTP ${r.status}`;
      el.textContent = r.status === 403
        ? `접근 거부(403): ${msg}\n\n확인:\n① Google Cloud Console에서 "YouTube Data API v3" 활성화\n② API 키 제한(HTTP 리퍼러/API 제한) 설정 점검\n③ 일 쿼터(10,000유닛) 소진 여부`
        : `오류(${r.status}): ${msg}`;
      el.style.color = 'var(--red)'; return;
    }
    const total = j?.pageInfo?.totalResults ?? 0;
    const titles = (j.items || []).map(i => '  · ' + (i.snippet?.title || '').slice(0, 40)).join('\n');
    el.textContent = `YouTube 연결 성공 — 최근 30일 "선크림 화장품" 영상 약 ${total.toLocaleString()}건\n${titles}`;
    el.style.color = 'var(--grn)';
    setStatus('st-youtube', '확인됨', true);
  } catch (e) {
    el.textContent = '연결 실패: ' + e.message;
    el.style.color = 'var(--red)';
  }
}

async function testKipris() {
  const key = K.kipris();
  if (!key) { showToast('KIPRIS 키를 먼저 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-kipris');
  el.textContent = 'KIPRIS 연결 테스트 중 ("선세럼 화장품" 출원인 검색)...'; el.style.color = 'var(--ink3)';
  try {
    const names = await searchKiprisApplicants('선세럼');
    if (names.length) {
      el.textContent = `KIPRIS 연결 성공 — 출원인 ${names.length}건 확인\n${names.slice(0, 5).map(n => '  · ' + n).join('\n')}`;
      el.style.color = 'var(--grn)';
      setStatus('st-kipris', '확인됨', true);
    } else {
      const raw = window._kiprisRaw || '';
      if (!raw) {
        /* fetchProxy가 null → 프록시 4종 모두 KIPRIS HTTP 엔드포인트 중계 실패(키 문제 아님) */
        el.textContent =
          'KIPRIS 응답을 받지 못했습니다 — CORS 프록시 중계 실패 (API 키 문제 아님)\n\n'
          + '원인: KIPRIS Plus(kipo-api.kipi.or.kr)는 HTTP 전용 엔드포인트라 공개 CORS\n'
          + '프록시가 안정적으로 중계하지 못합니다. 직전 오류 "Bad request(codetabs)"도\n'
          + '프록시가 뱉은 것이지 KIPRIS·키 오류가 아니었습니다.\n\n'
          + '권장 복구법:\n'
          + '① KIPRIS는 보조 신호(특허 출원인)일 뿐 — 미설정이어도 TRACK B는 뉴스·식약처·\n'
          + '   블로그·네이버쇼핑으로 정상 동작합니다(있으면 보강, 없으면 생략).\n'
          + '② 정식 활용을 원하면 브라우저 직접호출 대신 서버 수집(GitHub Actions)으로\n'
          + '   KIPRIS를 받아 정적 파일로 커밋하는 방식이 안정적입니다(트렌드 수집과 동일 패턴).\n'
          + '   원하시면 그 파이프라인을 붙여드리겠습니다.';
        el.style.color = 'var(--red)';
        return;
      }
      /* KIPRIS 표준 resultCode로 실제 원인을 정확히 구분:
         00 정상 · 10 파라미터오류 · 20 결과없음 · 30 미등록키 · 31 기한만료 */
      const rc = (raw.match(/<resultCode>(\d+)<\/resultCode>/i) || [])[1];
      const RC_MAP = { '00':'정상', '10':'요청 파라미터 오류', '20':'검색결과 0건(정상 — 해당 출원이 없음)',
                       '30':'미등록 accessKey — 키 재확인/승인상태 점검', '31':'키 사용기한 만료' };
      const errMsg = (raw.match(/<errMsg>([^<]+)<\/errMsg>|<resultMsg>([^<]+)<\/resultMsg>|<returnReasonCode>([^<]+)/i) || [])
        .slice(1).filter(Boolean)[0];
      const totalCount = (raw.match(/<totalCount>(\d+)<\/totalCount>/i) || [])[1];
      el.textContent =
        '응답은 받았으나 출원인을 추출하지 못했습니다.\n'
        + (rc ? `\nKIPRIS resultCode ${rc}: ${RC_MAP[rc] || '알 수 없음'}` : '')
        + (errMsg ? `\nAPI 메시지: ${errMsg}` : (totalCount === '0' ? '\n→ 검색 결과 0건 (해당 출원 자체가 없음 — 정상)' : ''))
        + `\n\n[응답 원문 일부]\n${raw.slice(0, 200)}`
        + '\n\n※ "선세럼"은 연결 테스트용 검색어일 뿐, 실제 분석은 예측 품목 키워드로 검색합니다.\n  resultCode 30이면 키 승인상태를, 20이면 다른 검색어로 재시도하세요.';
      el.style.color = 'var(--red)';
    }
  } catch (e) {
    el.textContent = '오류: ' + e.message;
    el.style.color = 'var(--red)';
  }
}

function showCollectedData() {
  const el = document.getElementById('r-collected');
  const lines = [];
  const sigLabels = { climate:'기후·환경', society:'사회·인구', economy:'경제·리테일', culture:'문화·팝트렌드' };
  Object.entries(SIG_DATA).forEach(([k, v]) => {
    if (v) {
      lines.push(`[${sigLabels[k]}] 점수: ${(v.score ?? 0).toFixed(1)}/5${v._sample ? ' [샘플]' : ' [실데이터]'}`);
      lines.push(`  해석: ${v.interpret}`);
      lines.push(`  칩: ${(v.chips || []).join(' | ')}`);
    } else {
      lines.push(`[${sigLabels[k]}] 미수집`);
    }
    lines.push('');
  });
  if (PREDICTIONS.length) {
    lines.push(`[예측 TOP5 — ${PERIOD_LABEL[currentPeriod] || '6개월'}]`);
    PREDICTIONS.forEach(p => lines.push(`  ${p.rank}위. ${p.type} (신뢰도 ${p.confidence}%) 패키징: ${p.packaging || '—'}`));
    lines.push('');
  }
  const rss = window._rssText ? `[RSS] 수집됨 (${window._rssText.length}자)` : '[RSS] 미수집';
  lines.push(rss);
  if (window._exportTrends && window._exportTrends.length) {
    lines.push(`[수출 모멘텀·관세청 실판매] ` + window._exportTrends.map(t => `${t.name}(${t.delta >= 0 ? '+' : ''}${t.delta}%)`).join(' · '));
  } else if (window._exportErr) {
    lines.push(`[수출 모멘텀] ${EXPORT_ERR_MSG[window._exportErr] || window._exportErr}`);
  }
  if (window._salesTrends && window._salesTrends.length) {
    lines.push(`[구매 모멘텀·쇼핑클릭] ` + window._salesTrends.map(t => `${t.name}(${t.delta >= 0 ? '+' : ''}${t.delta}%)`).join(' · '));
  } else if (window._salesErr) {
    lines.push(`[구매 모멘텀] ${NAVER_ERR_MSG[window._salesErr] || window._salesErr}`);
  }
  if (window._dlTrends && window._dlTrends.length) {
    lines.push(`[검색 모멘텀·DataLab] ` + window._dlTrends.map(t => `${t.name} ${t.delta >= 0 ? '+' : ''}${t.delta}%`).join(' · '));
  } else if (window._dlErr) {
    lines.push(`[검색 모멘텀] ${NAVER_ERR_MSG[window._dlErr] || window._dlErr}`);
  }
  if (window._newsTrends && window._newsTrends.length) {
    lines.push(`[뉴스 최다언급] ` + window._newsTrends.map(t => `${t.name}(${t.count})`).join(' · '));
  }
  if (window._supplyTrends && window._supplyTrends.length) {
    lines.push(`[공급 규모·식약처 등록 품목] ` + window._supplyTrends.slice(0, 10).map(t => `${t.name}(${t.count}${t.recent ? `/신규${t.recent}` : ''})`).join(' · '));
  } else if (window._supplyErr) {
    lines.push(`[공급 규모·식약처 등록 품목] ${window._supplyErr}`);
  }
  if (window._expoTrends && window._expoTrends.length) {
    lines.push(`[해외 박람회 선행·최근${GLOBAL_EXPO_RECENT_DAYS}일] ` + window._expoTrends.slice(0, 10).map(t => `${t.name}(${t.count})`).join(' · '));
  }
  if (window._ytTrends && window._ytTrends.length) {
    lines.push(`[YouTube 모멘텀] ` + window._ytTrends.slice(0, 8).map(t => `${t.name}(${t.delta >= 0 ? '+' : ''}${t.delta}%)`).join(' · '));
  }
  if (window._gtrends && window._gtrends.length) {
    lines.push(`[글로벌 검색·GTrends] ` + window._gtrends.slice(0, 8).map(t => `${t.name}(${t.delta >= 0 ? '+' : ''}${t.delta}%)`).join(' · '));
  }
  if (window._reddit && window._reddit.length) {
    lines.push(`[해외 커뮤니티·Reddit] ` + window._reddit.slice(0, 8).map(t => `${t.name}(${t.count})`).join(' · '));
  } else if (window._expoErr) {
    lines.push(`[해외 박람회 선행] ${window._expoErr}`);
  }
  if (window._climateTrend) {
    const ct = window._climateTrend;
    const parts = [];
    if (ct.deviation !== null) parts.push(`평년대비 ${ct.deviation >= 0 ? '+' : ''}${ct.deviation}℃`);
    if (ct.trend16) parts.push(`16일추세 ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃`);
    if (parts.length) lines.push(`[기후추세] ` + parts.join(' · '));
  }
  el.textContent = lines.join('\n') || '아직 수집된 데이터 없음 — [전체 수집 실행] 먼저 실행하세요';
  el.style.color = 'var(--ink2)';
}

/* ════ INIT ════ */
function init() {
  loadKeys();
  renderZ0();
  renderZ1();
  renderZ3();
  renderZ4();
  renderScoreboard();
  renderFunnel();

  const now = new Date();
  document.getElementById('hdPeriod').textContent = `기준: ${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  /* 버튼 이벤트 */
  document.getElementById('btnApiSet').addEventListener('click', toggleApiPanel);
  document.getElementById('btnRepPanel').addEventListener('click', toggleRepPanel);
  document.getElementById('btnRepClose').addEventListener('click', toggleRepPanel);
  document.getElementById('btnGuide').addEventListener('click', toggleGuidePanel);
  document.getElementById('btnGuideClose').addEventListener('click', toggleGuidePanel);
  document.getElementById('btnCollect').addEventListener('click', collectAll);
  document.getElementById('btnSaveGemini').addEventListener('click', () => saveKey('gemini'));
  document.getElementById('btnTestGemini').addEventListener('click', testGemini);
  document.getElementById('gemini-model').addEventListener('change', () => saveKey('gemini-model'));
  document.getElementById('btnSavePublic').addEventListener('click', () => saveKey('public'));
  document.getElementById('btnTestPublic').addEventListener('click', testPublic);
  document.getElementById('btnSaveNaver').addEventListener('click', () => saveKey('naver'));
  document.getElementById('btnTestNaver').addEventListener('click', testNaver);
  document.getElementById('btnSaveEcos').addEventListener('click', () => saveKey('ecos'));
  document.getElementById('btnTestEcos').addEventListener('click', testEcos);
  document.getElementById('btnSaveKipris').addEventListener('click', () => saveKey('kipris'));
  document.getElementById('btnTestKipris').addEventListener('click', testKipris);
  document.getElementById('btnSaveYoutube').addEventListener('click', () => saveKey('youtube'));
  document.getElementById('btnTestYoutube').addEventListener('click', testYoutube);
  document.getElementById('btnSaveBackend').addEventListener('click', () => saveKey('backend'));
  document.getElementById('btnTestBackend').addEventListener('click', testBackend);
  document.getElementById('btnShowCollected').addEventListener('click', showCollectedData);
  document.getElementById('btnGenReport').addEventListener('click', genReport);
  document.getElementById('btnCopyReport').addEventListener('click', copyReport);
  document.getElementById('btnClearReport').addEventListener('click', () => { document.getElementById('repText').value = ''; });
  document.getElementById('btnExportPdf').addEventListener('click', exportReportPDF);
  document.getElementById('btnExportCsv').addEventListener('click', exportReportCSV);

  /* 기간 탭 */
  document.querySelectorAll('.pred-period-tab').forEach(btn => {
    btn.addEventListener('click', () => switchPredPeriod(btn.dataset.period));
  });

  /* 패널 외부 클릭 닫기 */
  document.addEventListener('click', e => {
    if (!e.target.closest('.api-wrap')) document.getElementById('apiPanel').classList.remove('open');
    if (!e.target.closest('.rep-wrap')) document.getElementById('repPanel').classList.remove('open');
  });

  /* 가이드 모달 — 배경 클릭 시 닫기 */
  document.getElementById('guideOverlay').addEventListener('click', e => {
    if (e.target.id === 'guideOverlay') toggleGuidePanel();
  });

  /* 분석 근거 자료 모달 — 닫기 버튼·배경 클릭 시 닫기 */
  document.getElementById('btnSigClose').addEventListener('click', closeSigDetail);
  document.getElementById('sigOverlay').addEventListener('click', e => {
    if (e.target.id === 'sigOverlay') closeSigDetail();
  });

  /* 24시간 캐시 로드 */
  const cached = ls('m5_cache');
  if (cached) {
    try {
      const d = JSON.parse(cached);
      /* 24시간 이내 캐시만 복원 — 만료 캐시는 신호·예측 모두 무시 */
      if (d.ts && Date.now() - d.ts < 86400000) {
        if (d.signals) SIG_DATA = d.signals;
        if (d.predictions_3m) { PREDICTIONS_CACHE['3m'] = d.predictions_3m; }
        if (d.predictions_6m) { PREDICTIONS_CACHE['6m'] = d.predictions_6m; }
        if (d.predictions_1y) { PREDICTIONS_CACHE['1y'] = d.predictions_1y; }
        /* 현재 기간의 캐시 로드 */
        const p = PREDICTIONS_CACHE[currentPeriod];
        if (p && p.length) {
          PREDICTIONS = p;
          renderZ0();
          renderZ1();
          showToast('캐시 데이터 로드됨 (24시간 이내)');
        } else {
          renderZ0();
        }
        renderScoreboard();   /* 복원된 신호 기준으로 품질 게이지 갱신 */
        checkWatchdog();      /* 복원된 모멘텀 기준으로 문턱 초과 배너 */
      }
    } catch {}
  }
}

/* 24시간 캐시 저장 */
window.addEventListener('beforeunload', () => {
  if (PREDICTIONS_CACHE['3m'] || PREDICTIONS_CACHE['6m'] || PREDICTIONS_CACHE['1y']) {
    ls('m5_cache', JSON.stringify({
      signals: SIG_DATA,
      predictions_3m: PREDICTIONS_CACHE['3m'],
      predictions_6m: PREDICTIONS_CACHE['6m'],
      predictions_1y: PREDICTIONS_CACHE['1y'],
      ts: Date.now()
    }));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('cosmedb_auth') === '1') {
    document.getElementById('authGate').style.display = 'none';
    document.getElementById('appPage').style.display = '';
    init();
  } else {
    checkAuthGate();
  }
});
