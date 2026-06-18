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

/* ════ STATE ════ */
let SIG_DATA = { climate: null, society: null, economy: null, culture: null };
let PREDICTIONS = [];
let MATCH_RESULTS = { trackA: [], trackB: [] };
let SEL_IDX = -1;
let currentPeriod = '6m';
const PREDICTIONS_CACHE = { '6m': null, '1y': null };
let currentPkgType = '';   /* 현재 선택된 예측의 패키징 타입 */

/* TRACK B 후보 인덱스 접근용 (onclick HTML attribute에서 JSON 직접 전달 방지) */
window._evalCandidates = [];

/* ════ API 키 관리 ════ */
const K = {
  gemini:  () => ls('gemini_key')  || '',
  model:   () => ls('gemini_model') || 'gemini-2.5-flash-lite',
  public:  () => ls('public_key')  || '',
  naverID: () => ls('naver_id')    || '',
  naverSec:() => ls('naver_sec')   || '',
  ecos:    () => ls('ecos_key')    || '',
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
}

function setStatus(id, txt, ok) {
  const el = document.getElementById(id);
  if (el) { el.textContent = txt; el.style.color = ok ? 'var(--grn)' : 'var(--ink3)'; }
}

function loadKeys() {
  if (K.gemini()) { setStatus('st-gemini', '설정됨', true); document.getElementById('k-gemini').value = K.gemini(); }
  if (K.public()) { setStatus('st-public', '설정됨', true); }
  if (K.naverID()) { setStatus('st-naver', '설정됨', true); }
  if (K.ecos())   { setStatus('st-ecos', '설정됨', true); }
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

/* ════ ZONE 0 신호 렌더 ════ */
function renderZ0() {
  const z = document.getElementById('z0');
  const defs = [
    {key:'climate', cls:'sig-cl', name:'기후·환경',  auto:true,  src:'기상청+에어코리아+UV지수'},
    {key:'society', cls:'sig-so', name:'사회·인구',  auto:true,  src:'KOSIS(1인가구·고령화)'},
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
      if (ct.trend16) parts.push(`16일 예보 전반(1~8일) 평균 ${ct.trend16.week1}℃ → 후반(9~16일) 평균 ${ct.trend16.week2}℃ (변화 ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃)`);
      if (parts.length) body += `<div class="gm-block"><div class="gm-block-title">기온 추세 근거</div><ul class="gm-list">${parts.map(p=>`<li>${p}</li>`).join('')}</ul></div>`;
    }
  }
  if (key === 'economy') {
    body += trendListHtml('관세청 수출 모멘텀 (HS코드별 최근 3개월 vs 직전 3개월)', window._exportTrends);
    if (window._exportErr) body += `<div class="gm-note">수출 모멘텀 미수집: ${escHtml(EXPORT_ERR_MSG[window._exportErr] || window._exportErr)}</div>`;
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
function getWxBase() {
  const now = new Date();
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
  const now = new Date();
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
  const isGoodText = (t) => {
    if (!t || t.length < 6) return false;
    const tl = t.toLowerCase().trimStart();
    return !BAD.some(p => tl.startsWith(p) || (p.includes(' ') && tl.includes(p)));
  };

  /* 0. 직접 요청 — CORS 허용 API(에어코리아 등)는 프록시 불필요 */
  try {
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
    const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, { signal: ctrl.signal });
    clearTimeout(tid);
    const t = await r.text();
    if (isGoodText(t)) return t;
  } catch {}

  return null;
}

async function collectClimate() {
  const key = K.public();
  setSdot('sd-climate', 'warn');
  setSdot('sd-air', key ? 'warn' : 'off');
  const today = new Date();
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
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 8000);
    const omUrl = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780' +
      '&current=temperature_2m,relative_humidity_2m,uv_index,weather_code' +
      '&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=16';
    const r = await fetch(omUrl, { signal: ctrl.signal });
    clearTimeout(tid);
    if (r.ok) {
      const j = await r.json();
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
  } catch {}
  setSdot('sd-climate', temp !== '—' ? 'ok' : 'warn');

  /* ── Open-Meteo Archive: 평년(작년 동기간 ±3일) 대비 오늘 최고기온 편차 ── */
  let deviation = null;
  if (omTodayMax !== null) {
    try {
      const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const start = new Date(today); start.setFullYear(start.getFullYear() - 1); start.setDate(start.getDate() - 3);
      const end = new Date(today); end.setFullYear(end.getFullYear() - 1); end.setDate(end.getDate() + 3);
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 8000);
      const histUrl = 'https://archive-api.open-meteo.com/v1/archive?latitude=37.5665&longitude=126.9780' +
        `&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=temperature_2m_max&timezone=Asia%2FSeoul`;
      const r = await fetch(histUrl, { signal: ctrl.signal });
      clearTimeout(tid);
      if (r.ok) {
        const j = await r.json();
        const arr = (j?.daily?.temperature_2m_max || []).filter(v => v !== null && v !== undefined);
        if (arr.length) {
          const normalAvg = arr.reduce((s, x) => s + x, 0) / arr.length;
          deviation = +(omTodayMax - normalAvg).toFixed(1);
        }
      }
    } catch {}
  }
  window._climateTrend = (trend16 || deviation !== null) ? { trend16, deviation } : null;

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
      trend16 ? `16일추세 ${trend16.delta >= 0 ? '+' : ''}${trend16.delta}℃` : ''
    ].filter(Boolean),
    _sample: temp === '—'
  };
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
  if (!isNaN(t) && t > 25) parts.push('고온 지속 → 선케어·쿨링·에어리스 밀폐 패키징 수요 선행 증가');
  else if (!isNaN(t) && t > 15) parts.push('봄철 기온 상승 → 선케어 시즌 진입, UV 차단 제품 수요 상승');
  else parts.push('기온 데이터 기반 계절 선케어·보습 수요 분석');
  if (deviation !== null && !isNaN(deviation)) {
    if (deviation >= 2) parts.push(`평년 대비 +${deviation}℃ → 시즌 조기 진입 가능성`);
    else if (deviation <= -2) parts.push(`평년 대비 ${deviation}℃ → 시즌 지연 가능성`);
  }
  if (trend16) {
    if (trend16.delta >= 2) parts.push(`16일 예보 상승추세(+${trend16.delta}℃) → 단기 수요 증가 신호`);
    else if (trend16.delta <= -2) parts.push(`16일 예보 하강추세(${trend16.delta}℃) → 보습라인 전환 고려`);
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
        const rows = j?.StatisticSearch?.row || [];
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
  SIG_DATA.economy = {
    score,
    interpret: infl !== null
      ? `소비자물가 전년동월비 ${cpiYoY}% — ${infl >= 2.5 ? '가성비+리필 이중 수요, 프리미엄 양극화' : '물가 안정 — 신제품 가격 수용도 양호'}`
      : '물가 데이터 미수집 (ECOS 키 확인) — 가성비·리필 수요 기조 가정',
    chips: [
      cpi !== '—' ? `CPI ${cpi}` : (cpiYoY !== null ? 'ECOS 100대지표' : 'ECOS 연결 필요'),
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
    if (rssData.count > 0) {
      setSdot('sd-datalab', 'ok');
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
  setSdot('sd-datalab', (dlResult.trends || rssData.count > 0) ? 'ok' : 'warn');

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
  let ccsi = '—';
  if (ecosKey) {
    /* 소비자심리지수(CCSI)로 소비 여력 판단 (100 이상 = 낙관) */
    const rows = await fetchEcosKeyStats(ecosKey);
    const hit = rows.find(r => (r.KEYSTAT_NAME || '').includes('소비자심리'));
    if (hit && hit.DATA_VALUE) ccsi = hit.DATA_VALUE;
  }
  setSdot('sd-kosis', ccsi !== '—' ? 'ok' : (ecosKey ? 'warn' : 'off'));
  const c = parseFloat(ccsi);
  SIG_DATA.society = {
    score: !isNaN(c) ? (c >= 100 ? 4.0 : 3.6) : 3.8,
    interpret: `1인가구 35.5%(통계청 2023) · 남성뷰티 성장 → 소용량·편의형 패키징 수요 증가`
      + (ccsi !== '—' ? ` · 소비자심리지수 ${ccsi}${!isNaN(c) ? (c >= 100 ? ' (소비 낙관)' : ' (소비 신중)') : ''}` : ''),
    chips: ['1인가구 35.5%', '남성뷰티↑', ccsi !== '—' ? `CCSI ${ccsi}` : 'ECOS 키 필요'],
    _sample: ccsi === '—'
  };
}

function savePredHistory(predictions, period) {
  try {
    const hist = JSON.parse(ls('m5_history') || '[]');
    const entry = { ts: Date.now(), period, predictions: predictions.map(p => ({rank:p.rank, type:p.type})) };
    hist.unshift(entry);
    /* 최근 12개 항목만 유지 */
    ls('m5_history', JSON.stringify(hist.slice(0, 12)));
  } catch {}
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

async function collectMFDSFunc() {
  const key = K.public();
  if (!key) return { count: 0, ingredients: [], products: [] };
  try {
    const url = `https://apis.data.go.kr/1471000/FntnsCsmtcPrdlstInfoService/getFntnsCsmtcPrdlstInfo?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=30&type=json`;
    const t = await fetchProxy(url, 10000);
    if (!t) return { count: 0, ingredients: [], products: [] };
    const j = JSON.parse(t);
    /* 응답 구조: response→body→items→item (표준) 또는 body→items→item (일부 MFDS API) */
    const items = j?.response?.body?.items?.item
                || j?.body?.items?.item
                || j?.response?.body?.items
                || [];
    const arr = Array.isArray(items) ? items : (items ? [items] : []);
    const ingMap = {}, products = [];
    arr.forEach(i => {
      if (i.ITEM_NAME || i.PRDUCT_NM) products.push(i.ITEM_NAME || i.PRDUCT_NM);
      (i.MTRAL_NM || i.INGR_NM || '').split(/,|\//).forEach(ing => {
        ing = ing.trim().replace(/^\d+\.?\s*/, '');
        if (ing.length > 2 && ing.length < 30) ingMap[ing] = (ingMap[ing]||0)+1;
      });
    });
    const top = Object.entries(ingMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    return { count: arr.length, ingredients: top, products: products.slice(0,5) };
  } catch { return { count: 0, ingredients: [], products: [] }; }
}

/* 식약처 화장품GMP 적합업체 현황 — Track A/B 제조사 DB 보완용 */
async function collectMFDSGMP() {
  const key = K.public();
  if (!key) return [];
  try {
    const url = `https://apis.data.go.kr/1471000/CsmtcsMnfstRegService01/getCsmtcsMnfstRegInfo?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=100&type=json`;
    const t = await fetchProxy(url, 10000);
    if (!t) return [];
    const j = JSON.parse(t);
    const items = j?.response?.body?.items?.item
                || j?.body?.items?.item
                || j?.response?.body?.items
                || [];
    const arr = Array.isArray(items) ? items : (items ? [items] : []);
    return arr.map(i => ({
      name: i.ENTP_NAME || i.BSSH_NM || '',
      addr: i.ADRES || i.ADDR || '',
      gmpDate: i.APRVL_YMD || ''
    })).filter(c => c.name);
  } catch { return []; }
}

/* ════ Gemini 예측 분석 ════ */
async function runGeminiPrediction(period) {
  period = period || currentPeriod;
  const key = K.gemini();
  if (!key) { showToast('Gemini API 키를 설정하세요'); return false; }
  const model = K.model();
  const now = new Date();
  const yr = now.getFullYear();
  const horizon = period === '6m'
    ? `${yr}년 하반기~${yr+1}년 상반기 (약 6개월 후)`
    : `${yr+1}년 전반 (약 12개월 후)`;
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
  const ct = window._climateTrend;
  const climateDetail = ct
    ? `\n[기후 추세 — Open-Meteo 실측]\n`
      + [
          ct.deviation !== null ? `평년(작년 동기) 대비 ${ct.deviation >= 0 ? '+' : ''}${ct.deviation}℃` : '',
          ct.trend16 ? `16일 예보 추세 ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃ (1주차 평균 ${ct.trend16.week1}℃ → 2주차 평균 ${ct.trend16.week2}℃)` : ''
        ].filter(Boolean).join(' · ')
    : '';
  const prompt = `당신은 화장품 OEM/ODM 업계 전문 트렌드 분석가입니다.
아래 4대 외부 요인 데이터를 분석하여 ${horizon}에 유행할 화장품 유형 TOP5를 예측하세요.

[4대 신호 현황]
${sigSummary}${exportDetail}${salesDetail}${dlDetail}${newsDetail}${climateDetail}
분석 기준월: ${yr}년 ${now.getMonth()+1}월

[출력 규칙 엄수]
1. 예측과 사실 분리 — 각 항목에 예측신뢰도(%) 반드시 명시
2. 제형이 아닌 패키징+충진 설비 관점에서 분석
3. packaging 필드에 권장 패키징 형태를 구체적으로 기재 (예: "에어리스 펌프 30~50ml", "스틱 몰딩 15g", "소용량 앰플 2ml×7")
4. 한국콜마·코스맥스·코스메카코리아 절대 언급 금지
5. 스킨케어에 한정하지 말고 색조·향수·맨즈 그루밍·바디케어 등 전 카테고리·전 성별 트렌드를 균형있게 검토
6. JSON만 출력 (설명 텍스트 없음)

[필수 JSON 형식]
{"predictions":[{"rank":1,"type":"정확한 화장품 유형명","packaging":"권장 패키징 형태","confidence":88,"tech":"핵심 기술·설비 요건","channel":["유통채널1","유통채널2"],"season":"출시 적기 (예: 2026 하반기)","signals":{"climate":0.3,"society":0.1,"economy":0.2,"culture":0.4}}]}`;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key.trim())}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{maxOutputTokens:1800,temperature:0.3} }),
        signal: ctrl.signal }
    );
    clearTimeout(tid);
    const data = await r.json();
    if (!r.ok) {
      const errMsg = data?.error?.message || `HTTP ${r.status}`;
      if (r.status === 429 && (errMsg.includes('limit: 0') || errMsg.includes('free_tier'))) {
        showToast('Gemini 쿼터 0 오류 — API 설정에서 모델을 gemini-2.5-flash-lite로 변경하세요 (AQ키 무료 지원)');
      } else if (r.status === 429) {
        showToast(`Gemini 요청 한도 초과 — 잠시 후 재시도하세요`);
      } else {
        showToast(`Gemini 오류 (${r.status}) — 샘플 예측 사용`);
      }
      throw new Error(errMsg);
    }
    const txt = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(txt);
    PREDICTIONS_CACHE[period] = parsed.predictions || [];
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
    PREDICTIONS_CACHE[period] = period === '1y' ? fallback1y : fallback6m;
    PREDICTIONS = PREDICTIONS_CACHE[period];
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
      `<div class="z1-placeholder"><div class="sig-loading" style="justify-content:center">${period === '1y' ? '1년' : '6개월'} 예측 분석 중...</div></div>`;
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
  if (!PREDICTIONS.length) {
    el.innerHTML = '<div class="z1-placeholder">예측 데이터 없음</div>';
    return;
  }
  const model = K.model() || 'gemini-2.0-flash';
  const periodLabel = currentPeriod === '6m' ? '6개월 예측' : '1년 예측';
  const periodCls   = currentPeriod === '6m' ? 'period-6m' : 'period-1y';
  document.getElementById('geminiModelLabel').textContent =
    model + ' · ' + new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}) + ' 생성';
  const sigMap   = { climate:'chip-cl', society:'chip-so', economy:'chip-ec', culture:'chip-cu' };
  const sigLabel = { climate:'기후', society:'사회', economy:'경제', culture:'문화' };
  el.innerHTML = `
    <div style="padding:6px 12px 4px;background:var(--bg2);border-bottom:.5px solid var(--bg3);font-size:10px;color:var(--ink3);display:flex;align-items:center;gap:6px">
      <span class="period-badge ${periodCls}">${periodLabel}</span>
      예측 기준 데이터: ${Object.values(SIG_DATA).filter(v=>v).length}/4 신호 수집됨 · 항목 클릭 시 패키징 적합 업체 자동 조회
    </div>
    <table class="ptable">
    <thead><tr>
      <th style="width:32px">#</th>
      <th>화장품 유형 및 핵심 기술 요건</th>
      <th style="width:160px">권장 패키징</th>
      <th style="width:130px">예측 신뢰도</th>
      <th>근거 신호</th>
      <th>추천 채널</th>
      <th>출시 적기</th>
      <th style="width:24px"></th>
    </tr></thead>
    <tbody>${(() => {
      const changes = getRankChanges(PREDICTIONS, currentPeriod);
      return PREDICTIONS.map((p, i) => {
        const confCls = p.confidence >= 80 ? 'hi' : p.confidence >= 65 ? 'mi' : 'lo';
        const topSig = Object.entries(p.signals || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const chips = topSig.map(([k, v]) =>
          `<span class="pchip ${sigMap[k]}">${sigLabel[k]} ${v >= 0.4 ? '●●●' : v >= 0.3 ? '●●' : '●'}</span>`
        ).join('');
        const rankCls = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
        const delta = changes[p.rank];
        const deltaHtml = delta === 'NEW' ? '<span class="rank-new">NEW</span>'
          : typeof delta === 'number' && delta > 0 ? `<span class="rank-up">▲${delta}</span>`
          : typeof delta === 'number' && delta < 0 ? `<span class="rank-dn">▼${Math.abs(delta)}</span>`
          : '';
        return `<tr class="prow${SEL_IDX === i ? ' sel' : ''}" onclick="selectPred(${i})">
          <td><div class="p-rank ${rankCls}">${String(p.rank).padStart(2, '0')}${deltaHtml}</div></td>
          <td><div class="p-type">${escHtml(p.type)}</div><div class="p-tech">${escHtml(p.tech)}</div></td>
          <td><div class="p-pkg">📦 ${escHtml(p.packaging || '—')}</div></td>
          <td><div class="p-conf"><div class="cbar-bg"><div class="cbar ${confCls}" style="width:${p.confidence}%"></div></div><span class="cnum ${confCls}">${p.confidence}%</span></div></td>
          <td><div class="pchips">${chips}</div></td>
          <td><div class="p-channel">${(p.channel || []).slice(0, 2).map(escHtml).join('<br>')}</div></td>
          <td><div class="p-season">${escHtml(p.season)}</div></td>
          <td><span class="p-arr">${SEL_IDX === i ? '▼' : '▶'}</span></td>
        </tr>`;
      }).join('');
    })()}</tbody></table>`;
}

/* ════ 제조사 매칭 ════ */
async function selectPred(idx) {
  if (SEL_IDX === idx) return;
  const p = PREDICTIONS[idx];
  if (!p) return;
  SEL_IDX = idx;
  renderZ1();
  currentPkgType = p.packaging || '';
  const periodLabel = currentPeriod === '6m' ? '6개월' : '1년';
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
}

/* 회사명 정규화 — 법인 표기·공백 제거 (중복 판정·DB 대조용) */
function normCompanyName(n) {
  return String(n || '').replace(/주식회사|\(주\)|㈜|\s/g, '').trim();
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

async function findNewManufacturers(productType, tech) {
  let results = [];
  const nid = K.naverID(), nsec = K.naverSec(), gkey = K.gemini();
  const pubKey = K.public();
  const kw = productType.split(' ')[0];
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
  /* 판매 제품 제조원 역추적 — 실제 판매 중인 제품의 제조사(maker) 필드를 직접 확인 */
  const shopPromise = (nid && nsec)
    ? fetchNaverAPI(`https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(kw)}&display=30&sort=sim`, nid, nsec, 9000)
    : Promise.resolve(null);
  const [mfdsT, gmpList, blogJ, shopJ, ...naverResults] = await Promise.all([mfdsPromise, gmpPromise, blogPromise, shopPromise, ...naverPromises]);
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
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${K.model()}:generateContent?key=${encodeURIComponent(gkey.trim())}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{maxOutputTokens:600,temperature:0} }),
          signal: ctrl.signal }
      );
      clearTimeout(tid);
      const data = await r.json();
      const txt = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json|```/g, '').trim();
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
  const evRank = { mfds: 0, product: 1, news: 2, blog: 3, inferred: 4 };
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
  return top;
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
  const evLink = c.sourceLink || c.homepage || '';
  const detailBtn = evLink
    ? `<button class="btn-mc btn-detail" onclick="window.open('${escJs(evLink)}','_blank')">근거 자료 열기 →</button>`
    : `<button class="btn-mc btn-detail" onclick="alert('홈페이지 또는 KIPRIS에서 확인: ${escJs(c.name)}')">근거 확인</button>`;
  return `<div class="mcard${isInfer ? ' mcard-infer' : ''}">
    <div class="mc-head">
      <div class="mc-name">${escHtml(c.name)}</div>
      <span class="mc-st st-new">신규처 후보</span>
    </div>
    <div class="mc-meta">
      <span class="prod-badge ${prodCls}">${escHtml(prod)}</span>
      ${escHtml(c.region || '지역 확인 필요')} · DB 미등록${c.gmpConfirmed ? ' · 식약처 등록확인' : ''}
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
  const kw = pred ? escHtml(pred.type.split(' ')[0]) : '화장품 제조';
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
      <span class="skw">추측 후보 업체명 + "공식 홈페이지"</span> 웹문서 검색으로 홈페이지 확인
    </div>
    <div class="search-hint" style="margin-top:6px">
      <div style="font-size:9px;font-weight:700;color:var(--ink3);margin-bottom:4px">수동 탐색 기준</div>
      <span class="skw">"${kw}" AND "화장품"</span> KIPRIS 특허 출원인 (plus.kipris.or.kr)<br>
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
  /* 서버 수집 시점의 소스 연결 상태 재생 */
  Object.entries(pre.sdots || {}).forEach(([id, state]) => setSdot(id, state));
}

async function collectAll() {
  const btn = document.getElementById('btnCollect');
  btn.classList.add('running'); btn.disabled = true;

  /* 캐시 초기화 */
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

  /* 1순위: 서버 사전수집 데이터 (프록시 불필요 — 내부망에서도 동작) */
  setStep('사전수집 데이터 확인 중...', '확인 중');
  const pre = await loadPrecollected();
  if (pre) {
    applyPrecollected(pre);
    renderZ0();
    const ageH = Math.max(0, Math.round((Date.now() - new Date(pre.collectedAt).getTime()) / 36e5));
    showToast(`서버 사전수집 데이터 로드 (${ageH}시간 전 수집) — 프록시 미사용`);
  } else {
    /* 2순위: 브라우저에서 직접 라이브 수집 (외부 프록시 경유) */
    const hasAnyKey = K.gemini() || K.public() || K.naverID() || K.ecos();
    if (!hasAnyKey) {
      showToast('API 키 미설정 — 샘플 데이터로 데모 실행합니다. [API 설정]에서 키를 입력하세요.');
    }

    setStep('① 기후 수집 중...', '수집 1/4');
    await collectClimate(); renderZ0();

    setStep('② 사회 수집 중...', '수집 2/4');
    await collectSociety(); renderZ0();

    setStep('③ 경제 수집 중...', '수집 3/4');
    await collectEconomy(); renderZ0();

    setStep('④ 문화 수집 중...', '수집 4/4');
    await collectCulture(); renderZ0();
  }

  updateStatusSummary();

  const periodLabel = currentPeriod === '6m' ? '6개월' : '1년';
  setStep(`⑤ Gemini ${periodLabel} 분석 중...`, 'AI 분석');
  document.getElementById('z1body').innerHTML =
    `<div class="z1-placeholder"><div class="sig-loading" style="justify-content:center">Gemini ${periodLabel} 예측 분석 중...</div></div>`;
  await runGeminiPrediction(currentPeriod);
  if (PREDICTIONS.length) savePredHistory(PREDICTIONS, currentPeriod);
  renderZ1();
  resetZ2();

  /* IMP-04: 보고서 자동 생성 */
  genReport();

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
    if (ct.trend16) lines.push(`  • 16일 예보 추세: ${ct.trend16.delta >= 0 ? '+' : ''}${ct.trend16.delta}℃ (1주차 ${ct.trend16.week1}℃ → 2주차 ${ct.trend16.week2}℃)`);
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
  lines.push('▶ 즉시 대응 법령·규제');
  REGS.filter(r => r.level === 'critical').forEach(r => lines.push(`  • [${r.tag}] ${r.title} (${r.date})`));
  lines.push('─'.repeat(40));
  lines.push('※ 본 보고서는 AI 예측 기반입니다. 최종 확인 필요.');
  document.getElementById('repText').value = lines.join('\n');
}

function copyReport() {
  const ta = document.getElementById('repText');
  if (!ta.value) genReport();
  navigator.clipboard.writeText(ta.value).then(() => showToast('보고서 복사 완료'));
}

/* ════ API 테스트 함수들 ════ */
async function testGemini() {
  const key = K.gemini();
  if (!key) { showToast('Gemini 키를 먼저 입력 후 저장하세요'); return; }
  const el = document.getElementById('r-gemini');
  el.textContent = '테스트 중...'; el.style.color = 'var(--ink3)';
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${K.model()}:generateContent?key=${encodeURIComponent(key.trim())}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{role:'user',parts:[{text:'한 단어로만 답하세요: 화장품'}]}], generationConfig:{maxOutputTokens:10} }),
        signal: ctrl.signal }
    );
    clearTimeout(tid);
    let data;
    try { data = await r.json(); } catch { data = {}; }
    if (!r.ok) {
      const errMsg = data?.error?.message || `HTTP ${r.status}`;
      if (r.status === 429) {
        const isZeroQuota = errMsg.includes('limit: 0') || errMsg.includes('free_tier');
        el.innerHTML = isZeroQuota
          ? `쿼터 0 오류 (429)\n\n해결:\n① 모델을 gemini-2.5-flash-lite 로 변경 (AQ키 무료 1,000건)\n② 또는 aistudio.google.com/app/apikey 에서\n   "Create API key in new project" 로 새 키 발급\n③ 또는 Google Cloud Console에서 결제 계정 연결`
          : `요청 한도 초과 (429)\n잠시 후 다시 시도하세요.\n${errMsg}`;
        el.style.color = 'var(--red)';
      } else if (r.status === 400) {
        el.textContent = `잘못된 요청 (400): API 키가 유효하지 않습니다.\n\n해결:\n① 키를 다시 [저장] 후 재테스트 (=, + 등 특수문자 인코딩 자동 처리)\n② AQ 키라면 모델: gemini-2.5-flash-lite 선택\n③ aistudio.google.com/app/apikey → 새 키 재발급\n④ Google Cloud Console → Generative Language API 활성화 확인\n\n원본 오류: ${errMsg}`;
        el.style.color = 'var(--red)';
      } else if (r.status === 403) {
        el.textContent = `접근 거부 (403): API 키가 유효하지 않거나 Gemini API가 비활성화됐습니다.\n${errMsg}`;
        el.style.color = 'var(--red)';
      } else {
        el.textContent = `오류 (${r.status}): ${errMsg}`;
        el.style.color = 'var(--red)';
      }
      return;
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) {
      el.textContent = `연결 성공 — 모델: ${K.model()} · 응답: "${reply.trim()}"`;
      el.style.color = 'var(--grn)';
      setStatus('st-gemini', '확인됨', true);
    } else {
      el.textContent = '응답 형식 오류: ' + JSON.stringify(data).slice(0, 120);
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

  /* ── API 3: 식약처 기능성화장품 보고품목 ── */
  const mfdsUrl = `https://apis.data.go.kr/1471000/FntnsCsmtcPrdlstInfoService/getFntnsCsmtcPrdlstInfo?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=5&type=json`;

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

  /* 결과 3: 식약처 기능성화장품 */
  if (!mfdsRes) {
    const d = await diagProxy(mfdsUrl);
    addLine('','식약처 기능성화장품', diagMsg(d), 'var(--red)');
  } else {
    try {
      const j = JSON.parse(mfdsRes);
      const rc = parseRC(j);
      if (rc && rc !== '00') {
        addLine('','식약처 기능성화장품', rcHint(rc, j?.response?.header?.resultMsg), 'var(--amber,#d97706)');
      } else {
        const items = j?.response?.body?.items?.item || j?.body?.items?.item || j?.response?.body?.items || [];
        const cnt = Array.isArray(items) ? items.length : (items ? 1 : 0);
        const total = j?.response?.body?.totalCount || j?.body?.totalCount || '—';
        addLine('','식약처 기능성화장품', `${cnt}건 수신 (전체 ${total}건)`, 'var(--grn)');
        anyOk = true;
      }
    } catch {
      const xmlRc = mfdsRes.match(/returnReasonCode[^>]*>(\w+)|resultCode[^>]*>(\w+)/)?.[1];
      const xmlMsg = mfdsRes.match(/returnAuthMsg[^>]*>([^<]+)|resultMsg[^>]*>([^<]+)/)?.[1];
      if (xmlRc) {
        addLine('','식약처 기능성화장품', `API코드 ${xmlRc}: ${xmlMsg || rcHint(xmlRc,'')}`, 'var(--amber,#d97706)');
      } else {
        addLine('','식약처 기능성화장품', `응답 형식 오류: "${mfdsRes.slice(0,80)}"`, 'var(--red)');
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
  el.textContent = '네이버 뉴스 API 테스트 중 (프록시 4종 순차 시도)...'; el.style.color = 'var(--ink3)';
  const targetUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent('에어리스 화장품 OEM')}&display=3&sort=date`;
  const j = await fetchNaverAPI(targetUrl, nid, nsec, 14000);
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
  const total = j.total ?? 0;
  const titles = (j.items || []).map(i => '  · ' + i.title.replace(/<[^>]+>/g, '')).join('\n');
  el.textContent = `네이버 뉴스 연결 성공\n"에어리스 화장품 OEM" 총 ${total.toLocaleString()}건\n최신 기사:\n${titles || '  (없음)'}`;
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
    lines.push(`[예측 TOP5 — ${currentPeriod === '6m' ? '6개월' : '1년'}]`);
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
  renderZ3();

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
  document.getElementById('btnShowCollected').addEventListener('click', showCollectedData);
  document.getElementById('btnGenReport').addEventListener('click', genReport);
  document.getElementById('btnCopyReport').addEventListener('click', copyReport);
  document.getElementById('btnClearReport').addEventListener('click', () => { document.getElementById('repText').value = ''; });

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
      }
    } catch {}
  }
}

/* 24시간 캐시 저장 */
window.addEventListener('beforeunload', () => {
  if (PREDICTIONS_CACHE['6m'] || PREDICTIONS_CACHE['1y']) {
    ls('m5_cache', JSON.stringify({
      signals: SIG_DATA,
      predictions_6m: PREDICTIONS_CACHE['6m'],
      predictions_1y: PREDICTIONS_CACHE['1y'],
      ts: Date.now()
    }));
  }
});

document.addEventListener('DOMContentLoaded', init);
