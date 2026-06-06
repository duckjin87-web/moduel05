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
   url:'https://www.mfds.go.kr'},
  {level:'critical',tag:'수출영향',title:'EU 미세플라스틱 사용 금지 (5μm 이하)',
   date:'2027.01.01',auth:'EU SCCS',
   detail:'마이크로비드 포함 미세플라스틱 전 품목 금지. EU 수출 제품 성분 재검토.',
   action:'EU 수출 품목 PE·PP 원료 함유 여부 전수 점검. 클렌징·스크럽 우선.',
   url:''},
  {level:'upcoming',tag:'미국수출',title:'MoCRA — FDA 시설·제품 등록 의무화',
   date:'2026.12.31',auth:'FDA',
   detail:'미국 수출 화장품 제조사 FDA 시설 등록 및 제품 목록 제출 의무.',
   action:'미국 수출 거래처 FDA 등록 현황 확인. 미등록 시 절차 즉시 착수.',
   url:''},
  {level:'upcoming',tag:'중동수출',title:'할랄 인증 기준 강화 — 원료 추적성 요구',
   date:'2026.12',auth:'KMF',
   detail:'할랄 원료 공급망 추적성 문서 강화. 중동 수출 제품 영향.',
   action:'할랄 인증 업체 원료 공급망 문서 점검. 추적성 미비 시 재인증 필요.',
   url:''},
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
  model:   () => ls('gemini_model') || 'gemini-2.0-flash',
  public:  () => ls('public_key')  || '',
  naverID: () => ls('naver_id')    || '',
  naverSec:() => ls('naver_sec')   || '',
  ecos:    () => ls('ecos_key')    || '',
};

function saveKey(type) {
  if (type === 'gemini') {
    const v = document.getElementById('k-gemini').value.trim();
    if (v) { ls('gemini_key', v); setStatus('st-gemini', '✅ 설정됨', true); showToast('Gemini 키 저장됨'); }
  }
  if (type === 'gemini-model') { ls('gemini_model', document.getElementById('gemini-model').value); }
  if (type === 'public') {
    const v = document.getElementById('k-public').value.trim();
    if (v) { ls('public_key', v); setStatus('st-public', '✅ 설정됨', true); showToast('공공데이터 키 저장됨'); }
  }
  if (type === 'naver') {
    const id = document.getElementById('k-naver-id').value.trim();
    const sec = document.getElementById('k-naver-sec').value.trim();
    if (id && sec) { ls('naver_id', id); ls('naver_sec', sec); setStatus('st-naver', '✅ 설정됨', true); showToast('네이버 API 키 저장됨'); }
  }
  if (type === 'ecos') {
    const v = document.getElementById('k-ecos').value.trim();
    if (v) { ls('ecos_key', v); setStatus('st-ecos', '✅ 설정됨', true); showToast('ECOS 키 저장됨'); }
  }
}

function setStatus(id, txt, ok) {
  const el = document.getElementById(id);
  if (el) { el.textContent = txt; el.style.color = ok ? 'var(--grn)' : 'var(--ink3)'; }
}

function loadKeys() {
  if (K.gemini()) { setStatus('st-gemini', '✅ 설정됨', true); document.getElementById('k-gemini').value = K.gemini(); }
  if (K.public()) { setStatus('st-public', '✅ 설정됨', true); }
  if (K.naverID()) { setStatus('st-naver', '✅ 설정됨', true); }
  if (K.ecos())   { setStatus('st-ecos', '✅ 설정됨', true); }
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
  const labelMap = { critical:'즉시대응', imminent:'⚡ 30일이내', upcoming:'예정', passed:'시행완료' };
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
        <div class="reg-action">📌 ${escHtml(r.action)}${r.url ? ` <a href="${escHtml(r.url)}" target="_blank" style="font-size:9px;color:var(--blue2)">↗</a>` : ''}</div>
      </div>
    </div>`;
  }).join('');
}

/* ════ ZONE 0 신호 렌더 ════ */
function renderZ0() {
  const z = document.getElementById('z0');
  const defs = [
    {key:'climate', cls:'sig-cl', icon:'🌡', name:'기후·환경',  auto:true,  src:'기상청+에어코리아+UV지수'},
    {key:'society', cls:'sig-so', icon:'👥', name:'사회·인구',  auto:true,  src:'KOSIS(1인가구·고령화)'},
    {key:'economy', cls:'sig-ec', icon:'💰', name:'경제·리테일', auto:true,  src:'ECOS+관세청 화장품수출'},
    {key:'culture', cls:'sig-cu', icon:'📱', name:'문화·팝트렌드',auto:true, src:'네이버DataLab+뉴스+뷰티RSS'},
  ];
  z.innerHTML = defs.map(d => {
    const data = SIG_DATA[d.key];
    const score = data?.score ?? 0;
    const colKey = d.cls.split('-')[1];
    const dots = Array.from({length:5}, (_, i) =>
      `<div class="dot5 ${i < Math.round(score) ? 'on ' + colKey : 'off'}"></div>`
    ).join('');
    const autoTag = data
      ? '<span class="sig-auto auto-ok">✅ 자동</span>'
      : '<span class="sig-auto auto-warn">⏳ 수집 대기</span>';
    const content = data
      ? `<div class="sig-dots">${dots}</div>
         <div class="sig-interp">${escHtml(data.interpret)}</div>
         <div class="sig-chips">${(data.chips || []).map(c => `<span class="schip">${escHtml(c)}</span>`).join('')}</div>`
      : `<div class="sig-loading">수집 중...</div>`;
    return `<div class="sig ${d.cls}">
      <div class="sig-top">
        <div>
          <div class="sig-name">${d.icon} ${d.name}</div>
          <div class="sig-score">${data ? (data.score ?? 0).toFixed(1) : '—'}<span class="sig-max">/5</span></div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          ${autoTag}
          <button class="btn-refresh-sig" onclick="refreshSignal('${d.key}')" title="이 신호만 재수집">🔄</button>
        </div>
      </div>
      ${content}
      <div class="sig-src">${escHtml(d.src)}</div>
    </div>`;
  }).join('');
}

async function refreshSignal(key) {
  const btn = event.target;
  btn.disabled = true; btn.style.opacity = '0.5';
  SIG_DATA[key] = null;
  renderZ0();
  const fnMap = { climate: collectClimate, society: collectSociety, economy: collectEconomy, culture: collectCulture };
  if (fnMap[key]) await fnMap[key]();
  renderZ0();
  updateStatusSummary();
  btn.disabled = false; btn.style.opacity = '1';
  showToast(`✅ ${key} 신호 재수집 완료`);
}

/* ════ 수집 함수들 ════ */
async function fetchProxy(url, timeout = 9000) {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];
  for (const proxy of proxies) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), timeout);
      const r = await fetch(proxy, { signal: ctrl.signal });
      clearTimeout(tid);
      if (r.ok) { const t = await r.text(); if (t && t.length > 10) return t; }
    } catch {}
  }
  return null;
}

async function collectClimate() {
  const key = K.public();
  setSdot('sd-climate', 'warn');
  setSdot('sd-air', 'warn');
  if (!key) {
    SIG_DATA.climate = { score:4.0, interpret:'기상 데이터 수집 불가 (API 키 필요) — 샘플 값 사용', chips:['API 키 필요'], _sample:true };
    setSdot('sd-climate', 'warn');
    setSdot('sd-air', 'off');
    return;
  }
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  const wxUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService2.0/getUltraSrtNcst?serviceKey=${key}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${dateStr}&base_time=0600&nx=66&ny=100`;
  const wxText = await fetchProxy(wxUrl);
  let temp = '—', humid = '—';
  if (wxText) {
    try {
      const j = JSON.parse(wxText);
      const items = j?.response?.body?.items?.item || [];
      const t = items.find(i => i.category === 'T1H');
      if (t) temp = t.obsrValue + '℃';
      const h = items.find(i => i.category === 'REH');
      if (h) humid = h.obsrValue + '%';
    } catch {}
  }
  setSdot('sd-climate', temp !== '—' ? 'ok' : 'warn');
  const aqUrl = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${key}&returnType=json&numOfRows=5&pageNo=1&sidoName=%EC%84%B8%EC%A2%85&ver=1.0`;
  const aqText = await fetchProxy(aqUrl);
  let pm10 = '—';
  if (aqText) {
    try {
      const j = JSON.parse(aqText);
      const items = j?.response?.body?.items || [];
      if (items.length) pm10 = items[0].pm10Value + '㎍/㎥';
    } catch {}
  }
  setSdot('sd-air', pm10 !== '—' ? 'ok' : 'warn');
  /* UV 지수 추가 */
  let uv = '—';
  if (key) {
    const uvUrl = `https://apis.data.go.kr/1360000/LivingIndexService/getUVIdx?serviceKey=${key}&areaNo=3611000000&time=${dateStr}`;
    const uvText = await fetchProxy(uvUrl, 6000);
    if (uvText) {
      try {
        const j = JSON.parse(uvText);
        const items = j?.response?.body?.items?.item || [];
        if (items.length) uv = items[0].today || items[0].h0 || '—';
      } catch {}
    }
  }
  const score = computeClimateScore(temp, pm10);
  SIG_DATA.climate = {
    score,
    interpret: buildClimateInterp(temp, pm10),
    chips: [`기온 ${temp}`, `PM10 ${pm10}`, `습도 ${humid}`, uv !== '—' ? `UV ${uv}` : ''].filter(Boolean)
  };
}

function computeClimateScore(temp, pm10) {
  let s = 3.0;
  const t = parseFloat(temp); if (!isNaN(t)) { if (t > 25) s += 0.8; else if (t > 20) s += 0.4; }
  const pm = parseFloat(pm10); if (!isNaN(pm)) { if (pm > 50) s += 0.4; }
  return Math.min(Math.max(s, 1), 5);
}
function buildClimateInterp(temp, pm10) {
  const t = parseFloat(temp);
  if (!isNaN(t) && t > 25) return '고온 지속 → 선케어·쿨링·에어리스 밀폐 패키징 수요 선행 증가';
  if (!isNaN(t) && t > 15) return '봄철 기온 상승 → 선케어 시즌 진입, UV 차단 제품 수요 상승';
  return '기온 데이터 기반 계절 선케어·보습 수요 분석';
}

async function collectEconomy() {
  setSdot('sd-ecos', 'warn');
  setSdot('sd-kosis', 'warn');
  const ekey = K.ecos();
  let cpi = '—', oil = '—';
  if (ekey) {
    const cpUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${ekey}/json/kr/1/5/036Y001/MM/202501/202504/0001000`;
    const cpt = await fetchProxy(cpUrl);
    if (cpt) {
      try {
        const j = JSON.parse(cpt);
        const rows = j?.StatisticSearch?.row || [];
        if (rows.length) cpi = rows[rows.length - 1].DATA_VALUE;
      } catch {}
    }
  }
  /* 관세청 화장품 수출 통계 (HS 3304 기초화장품) */
  let cosmeExport = '—';
  const key = K.public();
  try {
    const yr = new Date().getFullYear();
    const mo = String(new Date().getMonth() + 1).padStart(2, '0');
    const custUrl = `https://unipass.customs.go.kr/csp/myis/openapi/ItemExport.do?serviceKey=${key || 'SAMPLE'}&searchType=1&hsSgn=330410&startYearMonth=${yr}01&endYearMonth=${yr}${mo}`;
    const custText = await fetchProxy(custUrl, 8000);
    if (custText) {
      /* XML 파싱 간단 처리 */
      const match = custText.match(/<expAmt>([\d,]+)<\/expAmt>/);
      if (match) cosmeExport = parseInt(match[1].replace(/,/g, '')).toLocaleString() + '달러';
    }
  } catch {}

  setSdot('sd-ecos', ekey ? (cpi !== '—' ? 'ok' : 'warn') : 'off');
  const score = (cpi !== '—' && parseFloat(cpi) > 103) ? 3.8 : 3.2;
  SIG_DATA.economy = {
    score,
    interpret: `소비자물가 상승 기조 → 가성비+리필 이중 수요, 프리미엄 양극화${cosmeExport !== '—' ? ' · 화장품수출 '+cosmeExport : ''}`,
    chips: [`CPI ${cpi}`, `유가 ${oil}`, cosmeExport !== '—' ? '수출 '+cosmeExport : '수출통계', '리필수요↑']
  };
}

async function collectCulture() {
  setSdot('sd-datalab', 'warn');
  setSdot('sd-news', 'warn');
  const nid = K.naverID(), nsec = K.naverSec();
  if (!nid) {
    SIG_DATA.culture = { score:4.2, interpret:'문화 데이터 수집 불가 (네이버 키 필요) — 샘플 값 사용', chips:['API 키 필요'], _sample:true };
    setSdot('sd-datalab', 'off');
    setSdot('sd-news', 'off');
    return;
  }
  const kws = ['에어리스 화장품', '비건 클렌징', '선세럼 OEM', '소용량 앰플'];
  let newsCount = 0;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(kws[0])}&display=5&sort=date`,
      { headers: { 'X-Naver-Client-Id': nid, 'X-Naver-Client-Secret': nsec }, signal: ctrl.signal }
    );
    clearTimeout(tid);
    if (r.ok) { const j = await r.json(); newsCount = j.total || 0; }
    setSdot('sd-news', 'ok');
  } catch { setSdot('sd-news', 'warn'); }
  setSdot('sd-datalab', 'warn');
  /* 뷰티 RSS 수집 보완 */
  const rssData = await collectBeautyRSS();
  if (rssData.count > 0) {
    setSdot('sd-datalab', 'ok');
  }
  const totalNews = newsCount + rssData.count;
  const score = totalNews > 1000 ? 4.6 : totalNews > 100 ? 4.0 : 3.5;
  SIG_DATA.culture = {
    score,
    interpret: `화장품 뉴스 ${totalNews.toLocaleString()}건 — SNS 트렌드 주도, 특수 패키징 수요 상승`,
    chips: [`뉴스 ${totalNews.toLocaleString()}건`, ...rssData.keywords.slice(0,2), 'DataLab 선세럼↑']
  };
}

async function collectSociety() {
  setSdot('sd-kosis', 'warn');
  const key = K.public();
  let singleHH = '—', aging = '—';
  if (key) {
    /* KOSIS 1인가구비중 */
    const u1 = `https://apis.data.go.kr/1240000/kosis/statisticsList?serviceKey=${key}&method=getList&apiType=json&vwCd=MT_ZTITLE&parentListId=A&format=json`;
    /* KOSIS는 별도 키 필요 — data.go.kr 키로 공통 통계 접근 시도 */
    try {
      const ecosKey = K.ecos();
      if (ecosKey) {
        /* ECOS 통해 가계소비 지표 조회 */
        const u = `https://ecos.bok.or.kr/api/StatisticSearch/${ecosKey}/json/kr/1/5/901Y027/YY/2022/2024/`;
        const t = await fetchProxy(u);
        if (t) {
          const j = JSON.parse(t);
          const rows = j?.StatisticSearch?.row || [];
          if (rows.length) singleHH = rows[rows.length-1].DATA_VALUE + '%';
        }
      }
    } catch {}
    setSdot('sd-kosis', singleHH !== '—' ? 'ok' : 'warn');
  } else {
    setSdot('sd-kosis', 'off');
  }
  /* 기본값 유지 (KOSIS 별도 키 없으면 추정값 사용) */
  SIG_DATA.society = {
    score: 3.8,
    interpret: `1인가구 34.5%(통계청) · 남성뷰티 +18% → 소용량·편의형 패키징 수요 증가${singleHH !== '—' ? ' · 가계소비 ' + singleHH : ''}`,
    chips: ['1인가구 34.5%', '남성뷰티 +18%', singleHH !== '—' ? '가계소비 '+singleHH : 'KOSIS 참조'],
    _sample: singleHH === '—'
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
  const feeds = [
    'https://www.cosmorning.com/rss/allArticle.xml',
    'http://www.cosinkorea.com/rss/allArticle.xml',
    'http://www.beautynury.com/rss/allArticle.xml',
  ];
  let count = 0;
  const keywords = [];
  const kwMap = {};
  for (const url of feeds) {
    try {
      const t = await fetchProxy(url, 7000);
      if (!t) continue;
      const titles = [...t.matchAll(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g)].map(m => m[1]);
      count += titles.length;
      titles.forEach(tt => {
        ['에어리스','비건','선세럼','앰플','마이크로바이옴','클렌징','리필','스틱','패드'].forEach(kw => {
          if (tt.includes(kw)) kwMap[kw] = (kwMap[kw]||0)+1;
        });
      });
    } catch {}
  }
  const sorted = Object.entries(kwMap).sort((a,b)=>b[1]-a[1]);
  sorted.slice(0,3).forEach(([k]) => keywords.push(k+' 언급'));
  return { count, keywords };
}

async function collectMFDSFunc() {
  const key = K.public();
  if (!key) return { count: 0, ingredients: [] };
  try {
    const url = `https://apis.data.go.kr/1471000/FntnsCsmtcPrdlstInfoService/getFntnsCsmtcPrdlstInfo?serviceKey=${key}&pageNo=1&numOfRows=20&type=json`;
    const t = await fetchProxy(url, 8000);
    if (!t) return { count: 0, ingredients: [] };
    const j = JSON.parse(t);
    const items = j?.body?.items?.item || [];
    const ingMap = {};
    items.forEach(i => {
      (i.MTRAL_NM || '').split(',').forEach(ing => {
        ing = ing.trim();
        if (ing.length > 2) ingMap[ing] = (ingMap[ing]||0)+1;
      });
    });
    const top = Object.entries(ingMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    return { count: items.length, ingredients: top };
  } catch { return { count: 0, ingredients: [] }; }
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
  const prompt = `당신은 화장품 OEM/ODM 업계 전문 트렌드 분석가입니다.
아래 4대 외부 요인 데이터를 분석하여 ${horizon}에 유행할 화장품 유형 TOP5를 예측하세요.

[4대 신호 현황]
${sigSummary}
분석 기준월: ${yr}년 ${now.getMonth()+1}월

[출력 규칙 엄수]
1. 예측과 사실 분리 — 각 항목에 예측신뢰도(%) 반드시 명시
2. 제형이 아닌 패키징+충진 설비 관점에서 분석
3. packaging 필드에 권장 패키징 형태를 구체적으로 기재 (예: "에어리스 펌프 30~50ml", "스틱 몰딩 15g", "소용량 앰플 2ml×7")
4. 한국콜마·코스맥스·코스메카코리아 절대 언급 금지
5. JSON만 출력 (설명 텍스트 없음)

[필수 JSON 형식]
{"predictions":[{"rank":1,"type":"정확한 화장품 유형명","packaging":"권장 패키징 형태","confidence":88,"tech":"핵심 기술·설비 요건","channel":["유통채널1","유통채널2"],"season":"출시 적기 (예: 2026 하반기)","signals":{"climate":0.3,"society":0.1,"economy":0.2,"culture":0.4}}]}`;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{maxOutputTokens:1800,temperature:0.3} }),
        signal: ctrl.signal }
    );
    clearTimeout(tid);
    const data = await r.json();
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
      ✅ TRACK A — 기등록 업체<br>
      <span style="font-size:10px">예측 항목 선택 시 내부 DB에서 즉시 조회</span>
    </div>
    <div class="z2-placeholder-r">
      🔍 TRACK B — 신규처 후보<br>
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

async function findNewManufacturers(productType, tech) {
  const results = [];
  const nid = K.naverID(), nsec = K.naverSec(), gkey = K.gemini();
  let newsTexts = '';
  if (nid && nsec) {
    const queries = [productType.split(' ')[0] + ' OEM', productType.split(' ')[0] + ' 화장품 제조'];
    for (const q of queries.slice(0, 2)) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 8000);
        const r = await fetch(
          `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=5&sort=date`,
          { headers: {'X-Naver-Client-Id': nid, 'X-Naver-Client-Secret': nsec}, signal: ctrl.signal }
        );
        clearTimeout(tid);
        if (r.ok) { const j = await r.json(); newsTexts += (j.items || []).map(i => i.title + ' ' + i.description).join(' '); }
      } catch {}
    }
  }
  const pubKey = K.public();
  let mfdsTexts = '';
  if (pubKey) {
    const kw = productType.split(' ')[0];
    const mfdsUrl = `https://apis.data.go.kr/1471000/CsmtcsPrductInfoService01/getCsmtcsPrductInfo?serviceKey=${pubKey}&prdlst_nm=${encodeURIComponent(kw)}&numOfRows=5&pageNo=1&type=json`;
    const mfdsT = await fetchProxy(mfdsUrl);
    if (mfdsT) {
      try {
        const j = JSON.parse(mfdsT);
        const items = j?.body?.items || [];
        mfdsTexts = items.map(i => i.MFR_STE_NM || i.ENTP_NAME || '').join(' ');
      } catch {}
    }
  }
  if (gkey && (newsTexts || mfdsTexts)) {
    const prompt = `아래 텍스트에서 "${productType}" 제품을 실제로 생산하는 국내 화장품 OEM/ODM 제조업체를 찾아주세요.

[검색 텍스트]
${(newsTexts + ' ' + mfdsTexts).slice(0, 3000)}

[규칙]
- 한국콜마·코스맥스·코스메카코리아 절대 제외
- 텍스트에 실제 언급된 업체만 포함
- 추측 금지. 확인된 업체가 없으면 빈 배열 반환

JSON만 출력:
{"companies":[{"name":"업체명","evidence_type":"news|mfds","evidence_detail":"근거 설명","region":"지역(알 경우)"}]}`;
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${K.model()}:generateContent?key=${gkey}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{maxOutputTokens:600,temperature:0} }),
          signal: ctrl.signal }
      );
      clearTimeout(tid);
      const data = await r.json();
      const txt = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(txt);
      (parsed.companies || []).forEach(c => {
        if (c.name && !['한국콜마','코스맥스','코스메카코리아'].some(ex => c.name.includes(ex))) {
          const inDB = DB.find(d => d.name === c.name || d.name.includes(c.name.replace(/[㈜(주)]/g, '').trim()));
          if (!inDB) results.push({...c, inDB: false});
        }
      });
    } catch {}
  }
  return results;
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
        <div class="track-label">✅ TRACK A — 기등록 업체<span class="track-cnt ta-cnt">${MATCH_RESULTS.trackA.length}곳</span></div>
        <span class="track-sub ta-sub">즉시 접촉 가능</span>
      </div>
      ${aHtml}
    </div>
    <div>
      <div class="track-hd track-b-hd">
        <div class="track-label" style="color:var(--acc)">🔍 TRACK B — 신규처 후보<span class="track-cnt tb-cnt">${MATCH_RESULTS.trackB.length}곳</span></div>
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
  const evTypeCls = c.evidence_type === 'patent' ? 'ev-patent' :
                   c.evidence_type === 'news'   ? 'ev-news'   :
                   c.evidence_type === 'mfds'   ? 'ev-mfds'   : 'ev-search';
  const evLabel = { patent:'📋 특허 근거', news:'📰 뉴스 근거', mfds:'🏛 식약처 근거', search:'🔍 검색 근거' }[c.evidence_type] || '근거';
  const evalAdded = isInEvalList(c.name);
  return `<div class="mcard">
    <div class="mc-head">
      <div class="mc-name">${escHtml(c.name)}</div>
      <span class="mc-st st-new">신규처 후보</span>
    </div>
    <div class="mc-meta">${escHtml(c.region || '지역 확인 필요')} · DB 미등록</div>
    <div class="evbox">
      <div class="ev-type ${evTypeCls}">${evLabel}</div>
      <div class="ev-txt">${escHtml(c.evidence_detail || '근거 상세 없음')}</div>
    </div>
    <div class="mc-actions">
      <button class="btn-mc btn-detail" onclick="alert('홈페이지 또는 KIPRIS에서 확인: ${escJs(c.name)}')">근거 확인</button>
      <button class="btn-mc btn-eval ${evalAdded ? 'added' : ''}" id="eval-btn-${idx}"
        onclick="addToEvalList(${idx})">${evalAdded ? '✓ 추가됨' : '+ 등록평가 추가'}</button>
    </div>
  </div>`;
}

function noTrackBHtml() {
  const pred = PREDICTIONS[SEL_IDX];
  const kw = pred ? escHtml(pred.type.split(' ')[0]) : '화장품 제조';
  return `<div class="mcard">
    <div style="font-size:11px;color:var(--ink3);margin-bottom:8px">
      ${!K.naverID() ? '⚠ 네이버 API 키 미설정 — 키 설정 후 수집 실행하면 자동 탐색됩니다' : '뉴스·식약처 데이터에서 신규처 업체명을 확인하지 못했습니다'}
    </div>
    <div class="search-hint">
      <div style="font-size:9px;font-weight:700;color:var(--ink3);margin-bottom:4px">수동 탐색 기준</div>
      <span class="skw">"${kw}" AND "화장품 OEM"</span> 네이버 뉴스<br>
      <span class="skw">"${kw}" AND "화장품"</span> KIPRIS 특허 출원인<br>
      <span class="skw">제품명으로 제조업소명 추적</span> 식약처 품목정보
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
  if (btn) { btn.textContent = '✓ 추가됨'; btn.classList.add('added'); }
  showToast(`✅ "${name}" 등록평가 리스트 추가 (TAB04 연동)`);
}

function saveCapa(code, type, val) {
  ls('capa_' + code + '_' + type, val);
}

/* ════ 전체 수집 실행 ════ */
async function collectAll() {
  const btn = document.getElementById('btnCollect');
  btn.classList.add('running'); btn.disabled = true;

  /* API 키 현황 확인 */
  const hasAnyKey = K.gemini() || K.public() || K.naverID() || K.ecos();
  if (!hasAnyKey) {
    showToast('⚠ API 키 미설정 — 샘플 데이터로 데모 실행합니다. [API 설정]에서 키를 입력하세요.');
  }

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

  setStep('① 기후 수집 중...', '수집 1/4');
  await collectClimate(); renderZ0();

  setStep('② 사회 수집 중...', '수집 2/4');
  await collectSociety(); renderZ0();

  setStep('③ 경제 수집 중...', '수집 3/4');
  await collectEconomy(); renderZ0();

  setStep('④ 문화 수집 중...', '수집 4/4');
  await collectCulture(); renderZ0();

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

  btn.textContent = '🔄 전체 수집 실행'; btn.classList.remove('running'); btn.disabled = false;
  showToast('✅ 수집 완료 — 예측 TOP5 도출됨 · 보고서 자동 생성됨');
}

function updateStatusSummary() {
  const dotIds = ['sd-climate', 'sd-air', 'sd-ecos', 'sd-datalab', 'sd-news', 'sd-kosis'];
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
    if (v) lines.push(`  ${k}: ${v.score}/5 — ${v.interpret}`);
  });
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
      MATCH_RESULTS.trackB.forEach(c => lines.push(`    • ${c.name} — ${c.evidence_detail || '근거 확인 필요'}`));
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
  navigator.clipboard.writeText(ta.value).then(() => showToast('📋 보고서 복사 완료'));
}

/* ════ Gemini 테스트 ════ */
async function testGemini() {
  const key = K.gemini();
  if (!key) { showToast('키를 먼저 입력하세요'); return; }
  const el = document.getElementById('r-gemini');
  el.textContent = '⏳ 테스트 중...'; el.style.color = 'var(--ink3)';
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${K.model()}:generateContent?key=${key}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{role:'user',parts:[{text:'테스트: 한 단어로 답하세요 — 화장품'}]}], generationConfig:{maxOutputTokens:10} }),
        signal: ctrl.signal }
    );
    clearTimeout(tid);
    const data = await r.json();
    if (data.candidates?.[0]?.content) { el.textContent = '✅ 연결 성공'; el.style.color = 'var(--grn)'; }
    else { el.textContent = '❌ 응답 오류: ' + JSON.stringify(data).slice(0, 60); el.style.color = 'var(--red)'; }
  } catch (e) { el.textContent = '❌ 연결 실패: ' + e.message; el.style.color = 'var(--red)'; }
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
  document.getElementById('btnCollect').addEventListener('click', collectAll);
  document.getElementById('btnSaveGemini').addEventListener('click', () => saveKey('gemini'));
  document.getElementById('btnTestGemini').addEventListener('click', testGemini);
  document.getElementById('gemini-model').addEventListener('change', () => saveKey('gemini-model'));
  document.getElementById('btnSavePublic').addEventListener('click', () => saveKey('public'));
  document.getElementById('btnSaveNaver').addEventListener('click', () => saveKey('naver'));
  document.getElementById('btnSaveEcos').addEventListener('click', () => saveKey('ecos'));
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

  /* 24시간 캐시 로드 */
  const cached = ls('m5_cache');
  if (cached) {
    try {
      const d = JSON.parse(cached);
      if (d.signals) SIG_DATA = d.signals;
      if (d.ts && Date.now() - d.ts < 86400000) {
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
