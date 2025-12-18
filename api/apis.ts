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

// locsearch 자동 완성 api (프론트엔드 더미 데이터 기반)
export async function getLocationSearch(
  query: string
): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const trimmedQuery = query.trim().toLowerCase();

  // 더미 데이터에서 입력값을 prefix로 갖는 결과를 필터링 (최대 4개)
  const filteredResults = autocomplete_dummy
    .filter((item) => item.result.toLowerCase().includes(trimmedQuery))
    .slice(0, 4);

  return filteredResults;
}

// dangerzone 정보 가져오기 api (연결 완료)
export async function getDangerzoneList(): Promise<DangerZone[]> {
  const URL = "/api/maps/dangerzones/";

  try {
    const response = await api.get<{ dzs: DangerZone[] }>(URL);
    console.log("Danger zones response:", response.data);
    return response.data.dzs ?? [];
  } catch (error) {
    console.error("Failed to fetch danger zones:", error);
    return [];
  }
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
    console.log("Fetching near events with URL:", URL);
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

  try {
    const response = await api.get<{ results: NewsAbstract[] }>(URL);
    console.log("News list response:", response.data);
    return response.data.results ?? [];
  } catch (error) {
    console.error("Failed to fetch news list:", error);
    return [];
  }
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
  console.log("========== postReport 요청 시작 ==========");
  console.log("postReport - Request Body:", JSON.stringify(body, null, 2));

  try {
    // FormData 생성
    const formData = new FormData();

    // 기본 필드 추가
    formData.append("latitude", body.latitude.toString());
    formData.append("longitude", body.longitude.toString());
    formData.append("type", body.type);
    formData.append("level", body.level.toString());
    formData.append("title", body.title);
    formData.append("place", body.place);
    formData.append("description", body.description);
    formData.append("addr_a", body.addr_a);
    formData.append("addr_b", body.addr_b);
    formData.append("addr_c", body.addr_c);
    formData.append("addr_d", body.addr_d);

    // FormData 내용 로그
    console.log("FormData 필드:");
    console.log("  - latitude:", body.latitude.toString());
    console.log("  - longitude:", body.longitude.toString());
    console.log("  - type:", body.type);
    console.log("  - level:", body.level.toString());
    console.log("  - title:", body.title);
    console.log("  - place:", body.place);
    console.log("  - description:", body.description);
    console.log("  - addr_a:", body.addr_a);
    console.log("  - addr_b:", body.addr_b);
    console.log("  - addr_c:", body.addr_c);
    console.log("  - addr_d:", body.addr_d);

    // 사진 파일 추가
    if (body.photos && body.photos.length > 0) {
      for (const photoUri of body.photos) {
        const filename = photoUri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

        // React Native FormData 형식으로 파일 추가
        formData.append("photos", {
          uri: photoUri,
          name: filename,
          type: type,
        } as any);

        console.log("Photo added to FormData:", {
          uri: photoUri,
          name: filename,
          type,
        });
      }
    } else {
      console.log("  - photos: 없음");
    }

    console.log("========== API 호출 중... ==========");

    // Content-Type을 설정하지 않으면 axios가 자동으로 multipart/form-data + boundary 설정
    const response = await api.post<ReportId>(URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data, // FormData를 변환하지 않고 그대로 전송
    });
    console.log("postReport - Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("========== postReport 에러 ==========");
    console.error("Failed to create report:", error);
    if (error.response) {
      console.error("에러 상태 코드:", error.response.status);
      console.error(
        "에러 응답 데이터:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("에러 응답 헤더:", error.response.headers);
    }
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

  try {
    const response = await api.get<{ reports: ReportAbstract[] }>(URL);
    console.log("getReportList - Response:", response.data);
    return response.data.reports ?? [];
  } catch (error) {
    console.error("Failed to fetch report list:", error);
    return [];
  }
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
): Promise<FavoriteRegionId[]> {
  const URL = `/api/users/pois/`;
  const favoriteRegionIds: FavoriteRegionId[] = favorite_region_ids_dummy;
  return favoriteRegionIds;
}

// 사용자 정보 가져오기 api (연결 완료)
export async function getUserInfo(): Promise<UserInfo> {
  const URL = `/api/users/self/info/`;

  try {
    const response = await api.get<UserInfo>(URL);
    console.log("getUserInfo - Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    throw error;
  }
}

// 사용자 정보 수정 api (연결 완료)
export async function patchUserInfo(body: UserInfo): Promise<void> {
  const URL = `/api/users/self/info/`;

  try {
    const response = await api.patch(URL, body);
    console.log("patchUserInfo - Response:", response.data);
  } catch (error) {
    console.error("Failed to update user info:", error);
    throw error;
  }
}

// 현재 사용자 신고 목록 가져오기 api (연결 완료)
export async function getUserReportList(): Promise<ReportAbstract[]> {
  const URL = `/api/users/self/posts/`;

  try {
    const response = await api.get<{ news: ReportAbstract[] }>(URL);
    console.log("getUserReportList - Response:", response.data);
    return response.data.news ?? [];
  } catch (error) {
    console.error("Failed to fetch user report list:", error);
    return [];
  }
}
