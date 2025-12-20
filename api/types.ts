export type DangerZone = {
  dz_id: string;
  latitude: string;
  longitude: string;
  radius: number;
  addr_a: string;
  addr_b: string;
  addr_c: string;
  addr_d: string;
  start_time: string;
  end_time: string;
};

export type NearEvent = {
  latitude: string;
  longitude: string;
  type: string;
  level: number;
  report_id: string;
};

export type NearEvents = {
  results: NearEvent[];
};

export type NewsId = {
  news_id: string;
};

export type Photo = {
  photo: string;
};

export type NewsAbstract = {
  news_id: string;
  press: string;
  title: string;
  photo: string;
  uploaded_at: string;
};

export type NewsDetail = {
  press: string;
  title: string;
  uploaded_at: string;
  content: string;
  addr_a: string;
  addr_b: string;
  addr_c: string;
  addr_d: string;
  photos: Photo[];
};

export type ReportCreate = {
  latitude: number;
  longitude: number;
  type: string;
  level: number;
  title: string;
  place: string;
  description: string;
  addr_a: string;
  addr_b: string;
  addr_c: string;
  addr_d: string;
  photos?: string[]; // 이미지 URI 배열 (선택적)
};

export type ReportId = {
  report_id: string;
};

export type ReportAbstract = {
  report_id: string;
  type: string;
  level: number;
  title: string;
  place: string;
  created_at: string;
  photo: string;
  longitude: number;
  latitude: number;
};

export type ReportDetail = {
  id: number;
  latitude: number;
  longitude: number;
  type: string;
  level: number;
  title: string;
  place: string;
  description: string;
  addr_a: string;
  addr_b: string;
  addr_c: string;
  addr_d: string;
  created_at: string;
  updated_at: string;
  state: boolean;
  photos: Photo[];
};

export type ReportEdit = {
  latitude: number;
  longitude: number;
  type: string;
  level: number;
  title: string;
  place: string;
  description: string;
  addr_a: string;
  addr_b: string;
  addr_c: string;
  addr_d: string;
  state: string;
  photos: Photo[];
};

export type ReportReaction = {
  emoji: string;
  num: number;
};

export type ReactionId = {
  reaction_id: string;
};

export type Emoji = {
  emoji: string;
};

export type FavoriteRegion = {
  type: string;
  addr_a: string;
  addr_b: string;
  addr_c: string;
};

export type FavoriteRegionId = {
  fr_id: string;
};

export type UserInfo = {
  favorite_regions: FavoriteRegion[];
  username: string;
  sns: string;
};

export type LocationSearchResult = {
  result: string;
};
