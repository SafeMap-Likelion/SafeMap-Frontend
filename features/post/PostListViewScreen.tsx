//관심지역 모아보기 화면
import React, { useState, useEffect } from "react";
import {
  Box,
  HStack,
  Heading,
  Icon,
  Pressable,
  Text,
  Image,
  VStack,
} from "@gluestack-ui/themed";
import { FlatList, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getUserInfo, getReportList, getReportDetail } from "@/api/apis";
import { FavoriteRegion, ReportAbstract, ReportDetail } from "@/api/types";
import PostDetailViewScreen from "@/features/post/PostDetailViewScreen";

// EventAlarm.tsx에서 참고한 작은 칩 컴포넌트
function SelectChip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Box
        borderRadius="$full"
        px="$3.5"
        py="$2"
        bg={selected ? "$blue600" : "$coolGray100"}
      >
        <Text
          color={selected ? "$white" : "$coolGray800"}
          fontWeight="$semibold"
          fontSize="$sm"
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}

// MinIO 이미지 URL 변환
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL_MinIO || "";
const DEFAULT_IMAGE =
  "https://via.placeholder.com/200x200/cccccc/666666?text=No+Image";

const getFullImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return DEFAULT_IMAGE;
  if (
    photoUrl.includes("localhost:9000") ||
    photoUrl.includes("127.0.0.1:9000")
  ) {
    return photoUrl.replace(
      /https?:\/\/(localhost|127\.0\.0\.1):9000/,
      API_BASE_URL
    );
  }
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }
  return `${API_BASE_URL}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
};

// 위험도 레벨 텍스트 변환
const getLevelText = (level: number): string => {
  switch (level) {
    case 1:
      return "하";
    case 2:
      return "중";
    case 3:
      return "상";
    default:
      return "중";
  }
};

// 날짜 포맷팅
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(2);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}. ${month}. ${day} (${dayOfWeek}) ${hours}:${minutes}`;
};

// 위험도에 따른 뱃지 색상
const getLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return "#929292";
    case 2:
      return "#FF7A05";
    case 3:
      return "#FF1212";
    default:
      return "#FF7A05";
  }
};

// 개별 이벤트 카드 컴포넌트
const EventCard: React.FC<{ event: ReportAbstract; onPress: () => void }> = ({
  event,
  onPress,
}) => {
  return (
    <Pressable
      bg="$white"
      borderRadius="$xl"
      p="$4"
      mb="$4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
      }}
      onPress={onPress}
    >
      <HStack space="md" alignItems="center">
        {/* 이미지 */}
        <Image
          source={{ uri: getFullImageUrl(event.photo) }}
          alt="Event Image"
          w={80}
          h={109}
          borderRadius="$lg"
        />

        {/* 텍스트 컨텐츠 */}
        <VStack flex={1} space="sm">
          {/* 상단 뱃지 */}
          <HStack
            bg={getLevelColor(event.level)}
            borderRadius="$full"
            px="$2"
            py="$1"
            alignSelf="flex-start"
            alignItems="center"
            space="sm"
          >
            <Icon as={Ionicons} name="warning" color="$white" size="xs" />
            <Text color="$white" size="xs" bold>
              {event.type} - 위험도 {getLevelText(event.level)}
            </Text>
          </HStack>

          {/* 제목 */}
          <Heading size="sm">{event.title}</Heading>

          {/* 위치 정보 */}
          <HStack alignItems="center" space="xs">
            <Icon
              as={Ionicons}
              name="location-outline"
              size="sm"
              color="$coolGray500"
            />
            <Text size="sm" color="$coolGray600" isTruncated>
              {event.place}
            </Text>
          </HStack>

          {/* 시간 정보 */}
          <HStack alignItems="center" space="xs">
            <Icon
              as={Ionicons}
              name="calendar-outline"
              size="sm"
              color="$coolGray500"
            />
            <Text size="sm" color="$coolGray600">
              {formatDate(event.created_at)}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
};

/**
 * 게시물 목록을 보여주는 화면입니다.
 * 뒤로가기 버튼과 중앙 정렬된 제목을 포함한 헤더가 있습니다.
 */
export default function PostListViewScreen() {
  const router = useRouter();
  const [favoriteRegions, setFavoriteRegions] = useState<FavoriteRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<FavoriteRegion | null>(
    null
  );
  const [reports, setReports] = useState<ReportAbstract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);

  // 사용자 정보에서 관심지역 가져오기
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setFavoriteRegions(userInfo.favorite_regions);
        // 첫 번째 관심지역을 기본 선택
        if (userInfo.favorite_regions.length > 0) {
          setSelectedRegion(userInfo.favorite_regions[0]);
        }
      } catch (error) {
        console.error("Failed to load user info:", error);
      }
    };
    loadUserInfo();
  }, []);

  // 선택된 관심지역의 신고 목록 가져오기
  useEffect(() => {
    const loadReports = async () => {
      if (!selectedRegion) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const reportList = await getReportList(
          selectedRegion.addr_a,
          selectedRegion.addr_b,
          selectedRegion.addr_c
        );
        setReports(reportList);
      } catch (error) {
        console.error("Failed to load reports:", error);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [selectedRegion]);

  // 신고 카드 클릭 시 상세 정보 가져오기
  const handleReportPress = async (reportId: string) => {
    try {
      const detail = await getReportDetail(reportId);
      setReportDetail(detail);
      setDetailVisible(true);
    } catch (error) {
      console.error("Failed to fetch report detail:", error);
    }
  };

  return (
    <Box flex={1} bg="$white" pt={50}>
      {/* Header - 고정 */}
      <HStack alignItems="center" px="$4" py="$3" bg="$white">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="chevron-left" size={18} color="#374151" />
        </Pressable>
        <Box flex={1} alignItems="center" mr="$6">
          <Text fontSize={24} fontWeight="$bold" color="$textDark900">
            관심지역 모아보기
          </Text>
        </Box>
      </HStack>

      {/* Content - 스크롤 가능 */}
      <FlatList
        data={reports}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => handleReportPress(item.report_id)}
          />
        )}
        keyExtractor={(item) => item.report_id}
        ListHeaderComponent={
          <Box>
            {/* Location Chips - 스크롤됨 */}
            <HStack p="$4" gap="$3" flexWrap="wrap">
              {favoriteRegions.map((region, index) => (
                <SelectChip
                  key={index}
                  label={region.type}
                  selected={selectedRegion === region}
                  onPress={() => setSelectedRegion(region)}
                />
              ))}
            </HStack>
          </Box>
        }
        ListEmptyComponent={
          isLoading ? (
            <Box flex={1} justifyContent="center" alignItems="center" py={50}>
              <ActivityIndicator size="large" color="#1C9DFF" />
              <Text mt={10} color="$coolGray500">
                불러오는 중...
              </Text>
            </Box>
          ) : (
            <Box flex={1} justifyContent="center" alignItems="center" py={50}>
              <Text color="$coolGray500">
                {favoriteRegions.length === 0
                  ? "등록된 관심지역이 없습니다"
                  : "해당 지역의 신고가 없습니다"}
              </Text>
            </Box>
          )
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
        }}
      />

      {/* 상세 뷰 (슬라이드 업) */}
      {isDetailVisible && reportDetail && (
        <PostDetailViewScreen
          reportDetail={reportDetail}
          onClose={() => setDetailVisible(false)}
        />
      )}
    </Box>
  );
}
