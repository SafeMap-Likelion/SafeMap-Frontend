import React, { useState, useMemo, useCallback } from "react";
import { FlatList, ActivityIndicator } from "react-native";
import {
  Box,
  Text,
  Heading,
  HStack,
  VStack,
  Icon,
  Pressable,
  CheckCircleIcon,
} from "@gluestack-ui/themed";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getUserReportList } from "@/api/apis";
import { ReportAbstract } from "@/api/types";

// 위험도 레벨을 텍스트로 변환
const getLevelText = (level: number): string => {
  switch (level) {
    case 1:
      return "위험도 하";
    case 2:
      return "위험도 중";
    case 3:
      return "위험도 상";
    default:
      return "위험도 중";
  }
};

// 위험도 레벨에 따른 색상 반환
const getLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return "#929292"; // 하 - 회색
    case 2:
      return "#FF7A05"; // 중 - 주황색
    case 3:
      return "#FF1212"; // 상 - 빨간색
    default:
      return "#FF7A05";
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

// MinIO 이미지 URL 변환
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL_MinIO || "";
const DEFAULT_IMAGE =
  "https://via.placeholder.com/80x109/cccccc/666666?text=No+Image";

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

// EventCard 컴포넌트 (체크 기능 추가)
const EventCard: React.FC<{
  event: ReportAbstract;
  isChecked: boolean;
  onToggleCheck: () => void;
}> = ({ event, isChecked, onToggleCheck }) => {
  const router = useRouter();

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
      onPress={() =>
        router.push(`/(main)/mypost-detail?report_id=${event.report_id}`)
      }
    >
      <HStack space="md" alignItems="center">
        {/* 이미지 - expo-image로 캐싱 적용 */}
        <Image
          source={{ uri: getFullImageUrl(event.photo) }}
          alt="Event Image"
          style={{ width: 80, height: 109, borderRadius: 10 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          placeholder={DEFAULT_IMAGE}
          transition={200}
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
              {event.type} - {getLevelText(event.level)}
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

        {/* 체크 아이콘 */}
        <Pressable
          onPress={onToggleCheck}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            as={CheckCircleIcon}
            size="xl"
            color={isChecked ? "#1C9DFF" : "#565656"}
          />
        </Pressable>
      </HStack>
    </Pressable>
  );
};

// 마이 포스트 스크린
const MyPostScreen = () => {
  const [posts, setPosts] = useState<ReportAbstract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [pendingSort, setPendingSort] = useState<Set<string>>(new Set());

  // 화면에 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      const loadPosts = async () => {
        try {
          setIsLoading(true);
          const reportList = await getUserReportList();
          setPosts(reportList);
          console.log("내 신고 목록 로드 완료:", reportList);
        } catch (error) {
          console.error("내 신고 목록 로드 실패:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadPosts();
    }, [])
  );

  // 체크 토글 함수
  const toggleCheck = (id: string) => {
    const isCurrentlyChecked = checkedItems.has(id);

    if (!isCurrentlyChecked) {
      // 체크하는 경우: 즉시 체크 상태로 변경하고 1초 후 정렬
      setCheckedItems((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });

      setPendingSort((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });

      setTimeout(() => {
        setPendingSort((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 1000);
    } else {
      // 체크 해제하는 경우: 즉시 해제
      setCheckedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 체크된 항목을 아래로 정렬 (pendingSort에 있는 항목은 아직 정렬하지 않음)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aChecked =
        checkedItems.has(a.report_id) && !pendingSort.has(a.report_id);
      const bChecked =
        checkedItems.has(b.report_id) && !pendingSort.has(b.report_id);
      if (aChecked && !bChecked) return 1;
      if (!aChecked && bChecked) return -1;
      return 0;
    });
  }, [posts, checkedItems, pendingSort]);

  if (isLoading) {
    return (
      <Box flex={1} bg="$white" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#1C9DFF" />
        <Text mt={10} color="#565656">
          신고 목록 로딩 중...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$white">
      <FlatList
        data={sortedPosts}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isChecked={checkedItems.has(item.report_id)}
            onToggleCheck={() => toggleCheck(item.report_id)}
          />
        )}
        keyExtractor={(item) => item.report_id}
        ListHeaderComponent={
          <Text fontSize={10} color="$coolGray600" mb="$2">
            *해결된 사건은 체크 표시를 눌러주세요
          </Text>
        }
        ListEmptyComponent={
          <Box flex={1} justifyContent="center" alignItems="center" py={50}>
            <Text color="#565656">등록한 신고가 없습니다</Text>
          </Box>
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: 100,
        }}
      />
    </Box>
  );
};

export default MyPostScreen;
