import dangerzone_dummy from "../dummy/dangerzone_dummy.json";
import news_detail_dummy from "../dummy/news_detail_dummy.json";
import news_list_dummy from "../dummy/news_list_dummy.json";
import report_detail_dummy from "../dummy/report_detail_dummy.json";
import report_list_dummy from "../dummy/report_list_dummy.json";
import report_near_events_dummy from "../dummy/report_near_events_dummy.json";
import report_reaction_dummy from "../dummy/report_reaction_dummy.json";
import report_id_dummy from "../dummy/report_id_dummy.json";
import favorite_region_ids_dummy from "../dummy/favorite_region_ids_dummy.json";
import user_info from "../dummy/user_info_dummy.json";
import autocomplete_dummy from "../dummy/autocomplete_dummy.json";

import {
  DangerZone,
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

// locsearch 자동 완성 api
export async function getLocationSearch(): Promise<LocationSearchResult[]> {
  const URL = `/api/maps/loc_search/`;
  const locationSearchResults: LocationSearchResult[] = autocomplete_dummy;
  return locationSearchResults;
}

// dangerzone 정보 가져오기 api
export async function getDangerzoneList(): Promise<DangerZone[]> {
  const URL = "api/maps/dangerzones/";
  const dangerzone: DangerZone[] = dangerzone_dummy;
  return dangerzone;
}

// 특정 위치 근처 신고 가져오기 api
export async function getNearEventList(
  latitude: number,
  longitude: number,
  map_level: number,
  code: number
): Promise<NearEvent[]> {
  const URL = `/api/near_events/?latitude=${latitude}&longitude=${longitude}&map_level=${map_level}&code=${code}`;
  const params = {
    latitude: latitude,
    longitude: longitude,
    level: map_level,
    type: code,
  };
  const nearEvents: NearEvent[] = report_near_events_dummy;
  return nearEvents;
}

// 특정 구역 뉴스 목록 가져오기 api
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

// 특정 뉴스 세부 정보 가져오기 api
export async function getNewsDetail(news_id: string): Promise<NewsDetail> {
  const URL = `/api/news/${news_id}/`;
  const newsDetail: NewsDetail = news_detail_dummy;
  return newsDetail;
}

// 신고 생성 api
export async function postReport(body: ReportCreate): Promise<ReportId> {
  const URL = `/api/reports/`;
  const reportId: ReportId = report_id_dummy;
  return reportId;
}

// 특정 구역 신고 목록 가져오기 api
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

// 특정 신고 세부 정보 가져오기 api
export async function getReportDetail(
  report_id: string
): Promise<ReportDetail> {
  const URL = `/api/reports/${report_id}/`;
  const reportDetail: ReportDetail = report_detail_dummy;
  return reportDetail;
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
): Promise<FavoriteRegionId[]> {
  const URL = `/api/users/pois/`;
  const favoriteRegionIds: FavoriteRegionId[] = favorite_region_ids_dummy;
  return favoriteRegionIds;
}

// 사용자 정보 가져오기 api
export async function getUserInfo(): Promise<UserInfo> {
  const URL = `/api/users/self/info/`;
  const userInfoData: UserInfo = user_info;
  return userInfoData;
}

// 사용자 정보 수정 api
export async function patchUserInfo(body: UserInfo): Promise<void> {
  const URL = `/api/users/self/info/`;
  return;
}

// 현재 사용자 신고 목록 가져오기 api
export async function getUserReportList(): Promise<ReportAbstract[]> {
  const URL = `/api/users/self/posts/`;
  const reportList: ReportAbstract[] = report_list_dummy;
  return reportList;
}
