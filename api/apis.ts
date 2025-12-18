import dangerzone_dummy from "../dummy/dangerzone_dummy.json";
import news_detail_dummy from "../dummy/news_detail_dummy.json";
import news_list_dummy from "../dummy/news_list_dummy.json";
import report_detail_dummy from "../dummy/report_detail_dummy.json";
import report_list_dummy from "../dummy/report_list_dummy.json";
import report_near_events_dummy from "../dummy/report_near_events_dummy.json";
import report_reaction_dummy from "../dummy/report_reaction_dummy.json";
import report_id_dummy from "../dummy/report_id_dummy.json";
import user_info from "../dummy/user_info_dummy.json";
import autocomplete_dummy from "../dummy/autocomplete_dummy.json";
import { api } from "./axios";

import {
  DangerZone,
  NearEvents,
  NearEvent,
  NewsId,
  Photo,
  NewsAbstract,
  NewsDetail,
  ReportCreate,
  ReportId,
  ReportAbstract,
  ReportDetail,
  ReportEdit,
  ReportReaction,
  Emoji,
  FavoriteRegion,
  UserInfo,
  FavoriteRegionId,
  LocationSearchResult,
} from "./types";

const dedupeFavoriteRegions = (pois: FavoriteRegion[]): FavoriteRegion[] => {
  const seen = new Set<string>();
  return pois
    .map(({ type, addr_a, addr_b, addr_c }) => ({
      type: type?.trim() ?? "",
      addr_a: addr_a?.trim() ?? "",
      addr_b: addr_b?.trim() ?? "",
      addr_c: addr_c?.trim() ?? "",
    }))
    .filter(({ type, addr_a, addr_b, addr_c }) => {
      if (!type || !addr_a || !addr_b || !addr_c) return false;
      const key = `${type}|${addr_a}|${addr_b}|${addr_c}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

// locsearch 자동 완성 api (프론트엔드 더미 데이터 기반)
export async function getLocationSearch(
  query: string
): Promise<LocationSearchResult[]> {
  if (!query) {
    return [];
  }

  const URL = `api/maps/loc_search/?location=${query}`;

  try {
    const response = await api.get<LocationSearchResult[]>(URL);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch location search:", error);
    return [];
  }
}

// dangerzone 정보 가져오기 api (연결 완료)
export async function getDangerzoneList(): Promise<DangerZone[]> {
  const URL = "api/maps/dangerzones/";
  const dangerzone: DangerZone[] = dangerzone_dummy;
  return dangerzone;
}

// 특정 위치 주변 이벤트(신고) 목록 가져오기 api (연결 완료)
export async function getNearEventList(
  latitude: number,
  longitude: number,
  map_level: number,
  code: number
): Promise<NearEvent[]> {
  const URL = `/api/near_events/?latitude=${latitude}&longitude=${longitude}&map_level=${map_level}&code=${code}`;

  try {
    const response = await api.get<{ results: NearEvent[] }>(URL);
    return response.data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch near events:", error);
    return [];
  }
}

// 특정 구역 뉴스 목록 가져오기 api (연결 완료)
export async function getNewsList(
  addr_a: string,
  addr_b: string,
  addr_c: string
): Promise<NewsAbstract[]> {
  const URL = `/api/news/list/?addr_a=${addr_a}&addr_b=${addr_b}&addr_c=${addr_c}`;
  const params = {
    addr_a: addr_a,
    addr_b: addr_b,
    addr_c: addr_c,
  };
  const newsList: NewsAbstract[] = news_list_dummy;
  return newsList;
}

// // 특정 뉴스 세부 정보 가져오기 api
// export async function getNewsDetail(news_id: string): Promise<NewsDetail> {
//   const URL = `/api/news/${news_id}/`;
//   const newsDetail: NewsDetail = news_detail_dummy;
//   return newsDetail;
// }

// 특정 뉴스 세부 정보 가져오기 api (연결 완료)
export async function getNewsDetail(news_id: string): Promise<NewsDetail> {
  const URL = `/api/news/${news_id}/`;

  try {
    const response = await api.get<NewsDetail>(URL);
    console.log("News detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch news detail:", error);
    throw error;
  }
}

// 신고 생성 api (연결 완료)
export async function postReport(body: ReportCreate): Promise<ReportId> {
  const URL = `/api/reports/`;
  console.log("postReport - Request Body:", JSON.stringify(body, null, 2));
  try {
    const response = await api.post<ReportId>(URL, body);
    console.log("postReport - Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create report:", error);
    throw error;
  }
}

// 특정 구역 신고 목록 가져오기 api (연결 완료)
export async function getReportList(
  addr_a: string,
  addr_b: string,
  addr_c: string
): Promise<ReportAbstract[]> {
  const URL = `/api/reports/list/?addr_a=${addr_a}&addr_b=${addr_b}&addr_c=${addr_c}`;
  const params = {
    addr_a: addr_a,
    addr_b: addr_b,
    addr_c: addr_c,
  };
  const reportList: ReportAbstract[] = report_list_dummy;
  return reportList;
}

// 특정 신고 세부 정보 가져오기 api (연결 완료)
export async function getReportDetail(
  report_id: string
): Promise<ReportDetail> {
  const URL = `/api/reports/${report_id}/`;
  try {
    const response = await api.get<ReportDetail>(URL);
    console.log("getReportDetail - Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch report detail:", error);
    throw error;
  }
}

// 특정 신고 수정 api (put)
export async function putReport(
  report_id: string,
  body: ReportEdit
): Promise<ReportEdit> {
  const URL = `/api/reports/${report_id}/`;
  const updatedReport: ReportEdit = body;
  return updatedReport;
}

// 특정 신고 부분 수정 api (patch, 사실상 put과 동일하게 구현)
export async function patchReport(
  report_id: string,
  body: ReportEdit
): Promise<ReportEdit> {
  const URL = `/api/reports/${report_id}/`;
  const updatedReport: ReportEdit = body;
  return updatedReport;
}

// 특정 신고 삭제 api
export async function deleteReport(report_id: string): Promise<void> {
  const URL = `/api/reports/${report_id}/`;
  return;
}

// 특정 신고 반응 목록 가져오기 api
export async function getReportReactionList(
  report_id: string
): Promise<ReportReaction[]> {
  const URL = `/api/reports/${report_id}/reactions/`;
  const reportReactions: ReportReaction[] = report_reaction_dummy;
  return reportReactions;
}

// 특정 신고 반응 추가 api
export async function postReportReaction(
  report_id: string,
  body: Emoji
): Promise<void> {
  const URL = `/api/reports/${report_id}/reactions/`;
  return;
}

// 관심지역 (poi: position of interest) 추가 api: 아마 회원가입 직후 최초 설정에서만 쓸 듯?
export async function postPoiList(
  body: FavoriteRegion[]
): Promise<FavoriteRegionId> {
  const URL = `/api/users/pois/`;
  try {
    const response = await api.post<FavoriteRegionId>(URL, {
      pois: dedupeFavoriteRegions(body),
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to add favorite regions:", {
      status: error?.response?.status,
      data: error?.response?.data,
      error,
    });
    throw error;
  }
}

// 사용자 정보 가져오기 api (연결 완료)
export async function getUserInfo(): Promise<UserInfo> {
  const URL = `/api/users/self/info/`;
  try {
    const response = await api.get<UserInfo>(URL);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch user info:", {
      status: error?.response?.status,
      data: error?.response?.data,
      error,
    });
    throw error;
  }
}

// 사용자 정보 수정 api (연결 완료)
export async function patchUserInfo(body: UserInfo): Promise<void> {
  const URL = `/api/users/self/info/`;
  return;
}

// 현재 사용자 신고 목록 가져오기 api (연결 완료)
export async function getUserReportList(): Promise<ReportAbstract[]> {
  const URL = `/api/users/self/posts/`;
  const reportList: ReportAbstract[] = report_list_dummy;
  return reportList;
}
