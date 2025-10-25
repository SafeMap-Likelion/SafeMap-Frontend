import React, { useState, useMemo } from "react";
import { FlatList } from "react-native";
import {
  Box,
  Text,
  Image,
  Heading,
  HStack,
  VStack,
  Icon,
  Pressable,
  CheckCircleIcon,
} from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

// 더미 데이터 (7개)
const MY_POSTS: Event[] = [
  {
    id: "1",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: "2",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: "3",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: "4",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: "5",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: "6",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: "7",
    category: "시설/인프라",
    dangerLevel: "위험도 중",
    title: "서울대학교 정문 가로수 넘어짐",
    location: "서울대학교 관악캠퍼스 정문",
    timestamp: "25. 9. 16 (화) 20:00",
    imageUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
];

// EventCard 컴포넌트 (체크 기능 추가)
const EventCard: React.FC<{
  event: Event;
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
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [pendingSort, setPendingSort] = useState<Set<string>>(new Set());

  // 체크 토글 함수
  const toggleCheck = (id: string) => {
    const isCurrentlyChecked = checkedItems.has(id);

    if (!isCurrentlyChecked) {
      // 체크하는 경우: 즉시 체크 상태로 변경하고 5초 후 정렬
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
    return [...MY_POSTS].sort((a, b) => {
      const aChecked = checkedItems.has(a.id) && !pendingSort.has(a.id);
      const bChecked = checkedItems.has(b.id) && !pendingSort.has(b.id);
      if (aChecked && !bChecked) return 1;
      if (!aChecked && bChecked) return -1;
      return 0;
    });
  }, [checkedItems, pendingSort]);

  return (
    <Box flex={1} bg="$white">
      <FlatList
        data={sortedPosts}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isChecked={checkedItems.has(item.id)}
            onToggleCheck={() => toggleCheck(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text fontSize={10} color="$coolGray600" mb="$2">
            *해결된 사건은 체크 표시를 눌러주세요
          </Text>
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
