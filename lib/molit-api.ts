/**
 * 국토교통부 실거래가 공개 API
 * https://www.data.go.kr → 아파트매매 실거래 상세 자료
 *
 * 필요한 API 키: data.go.kr 에서 발급
 */

const API_KEY = process.env.MOLIT_API_KEY || "";
const BASE_URL = "http://openapi.molit.go.kr";

export interface TradeRecord {
  dealAmount: number;       // 거래금액 (만원)
  buildYear: number;        // 건축년도
  dealYear: number;         // 거래년도
  dealMonth: number;        // 거래월
  dealDay: number;          // 거래일
  aptName: string;          // 아파트명
  area: number;             // 전용면적 (㎡)
  floor: number;            // 층
  regionCode: string;       // 지역코드
  dong: string;             // 법정동
  jibun: string;            // 지번
}

interface RawItem {
  거래금액: string;
  건축년도: string;
  년: string;
  월: string;
  일: string;
  아파트: string;
  전용면적: string;
  층: string;
  법정동: string;
  지번: string;
  지역코드: string;
}

/**
 * 아파트 매매 실거래가 조회
 * @param regionCode 법정동코드 앞 5자리 (예: 11110 = 종로구)
 * @param dealYearMonth YYYYMM (예: 202604)
 */
export async function fetchAptTrades(
  regionCode: string,
  dealYearMonth: string
): Promise<TradeRecord[]> {
  const url = `${BASE_URL}/OpenAPI_ToolInstall498/service/rest/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?serviceKey=${API_KEY}&LAWD_CD=${regionCode}&DEAL_YMD=${dealYearMonth}&pageNo=1&numOfRows=1000`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`MOLIT API error: ${res.status}`);

  const text = await res.text();

  // XML → JSON 파싱 (간단 정규식)
  const items = parseXmlItems(text);

  return items.map((item): TradeRecord => ({
    dealAmount: parseInt(item["거래금액"]?.replace(/,/g, "").trim() || "0"),
    buildYear: parseInt(item["건축년도"] || "0"),
    dealYear: parseInt(item["년"] || "0"),
    dealMonth: parseInt(item["월"] || "0"),
    dealDay: parseInt(item["일"] || "0"),
    aptName: item["아파트"]?.trim() || "",
    area: parseFloat(item["전용면적"] || "0"),
    floor: parseInt(item["층"] || "0"),
    regionCode: item["지역코드"]?.trim() || regionCode,
    dong: item["법정동"]?.trim() || "",
    jibun: item["지번"]?.trim() || "",
  }));
}

function parseXmlItems(xml: string): RawItem[] {
  const items: RawItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const item: Record<string, string> = {};
    const fieldRegex = /<([^>]+)>([^<]*)<\/\1>/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(itemXml)) !== null) {
      item[fieldMatch[1]] = fieldMatch[2];
    }

    items.push(item as unknown as RawItem);
  }

  return items;
}

/**
 * 지역코드 목록 (시군구 단위)
 */
export const REGION_CODES: Record<string, string> = {
  "11110": "종로구", "11140": "중구", "11170": "용산구", "11200": "성동구",
  "11215": "광진구", "11230": "동대문구", "11260": "중랑구", "11290": "성북구",
  "11305": "강북구", "11320": "도봉구", "11350": "노원구", "11380": "은평구",
  "11410": "서대문구", "11440": "마포구", "11470": "양천구", "11500": "강서구",
  "11530": "구로구", "11545": "금천구", "11560": "영등포구", "11590": "동작구",
  "11620": "관악구", "11650": "서초구", "11680": "강남구", "11710": "송파구",
  "11740": "강동구",
  "41111": "수원 장안구", "41113": "수원 권선구", "41115": "수원 팔달구", "41117": "수원 영통구",
  "41131": "성남 수정구", "41133": "성남 중원구", "41135": "성남 분당구",
  "41150": "의정부시", "41170": "안양 만안구", "41173": "안양 동안구",
  "41190": "부천시", "41210": "광명시", "41220": "평택시",
  "41250": "동두천시", "41270": "안산 상록구", "41273": "안산 단원구",
  "41280": "고양 덕양구", "41281": "고양 일산동구", "41285": "고양 일산서구",
  "41290": "과천시", "41310": "구리시", "41360": "남양주시",
  "41370": "오산시", "41390": "시흥시", "41410": "군포시",
  "41430": "의왕시", "41450": "하남시", "41460": "용인 처인구",
  "41461": "용인 기흥구", "41463": "용인 수지구", "41480": "파주시",
  "41500": "이천시", "41550": "안성시", "41570": "김포시",
  "41590": "화성시", "41610": "광주시", "41630": "양주시",
};
