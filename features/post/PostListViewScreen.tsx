//관심지역 모아보기 화면
import React, { useState } from "react";
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
import { FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

// 데이터 타입
interface Event {
  id: string;
  category: string;
  dangerLevel: string;
  title: string;
  location: string;
  timestamp: string;
  imageUrl: string;
}

const DUMMY_EVENTS: Event[] = [
  {
    id: "1",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl: "https://picsum.photos/id/10/200",
  },
  {
    id: "2",
    category: "자연재해",
    dangerLevel: "위험도 상",
    title: "관악산 인근 국지성 호우",
    location: "서울대학교 후문 등산로",
    timestamp: "25. 9. 16 (화) 18:30",
    imageUrl: "https://picsum.photos/id/20/200",
  },
  {
    id: "3",
    category: "교통",
    dangerLevel: "위험도 하",
    title: "정문 앞 3중 추돌사고",
    location: "서울대학교 정문 앞 교차로",
    timestamp: "25. 9. 16 (화) 17:00",
    imageUrl: "https://picsum.photos/id/30/200",
  },
  {
    id: "4",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "중앙도서관 엘리베이터 고장",
    location: "서울대학교 중앙도서관",
    timestamp: "25. 9. 16 (화) 15:20",
    imageUrl: "https://picsum.photos/id/40/200",
  },
];

// 개별 이벤트 카드 컴포넌트
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
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
      onPress={() => router.push("/(main)/post-detail")}
    >
      <HStack space="md" alignItems="center">
        {/* 이미지 */}
        <Image
          source={{ uri: event.imageUrl }}
          alt="Event Image"
          w={80}
          h={109}
          borderRadius="$lg"
        />

        {/* 텍스트 컨텐츠 */}
        <VStack flex={1} space="sm">
          {/* 상단 뱃지 */}
          <HStack
            bg="$orange500"
            borderRadius="$full"
            px="$2"
            py="$1"
            alignSelf="flex-start"
            alignItems="center"
            space="sm"
          >
            <Icon as={Ionicons} name="construct" color="$white" size="xs" />
            <Text color="$white" size="xs" bold>
              {event.category} - {event.dangerLevel}
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
              {event.location}
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
              {event.timestamp}
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
  const [selectedLocation, setSelectedLocation] = useState("집");

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
        data={DUMMY_EVENTS}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Box>
            {/* Location Chips - 스크롤됨 */}
            <HStack p="$4" gap="$3">
              <SelectChip
                label="집"
                selected={selectedLocation === "집"}
                onPress={() => setSelectedLocation("집")}
              />
              <SelectChip
                label="학교"
                selected={selectedLocation === "학교"}
                onPress={() => setSelectedLocation("학교")}
              />
            </HStack>
          </Box>
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
        }}
      />
    </Box>
  );
}
