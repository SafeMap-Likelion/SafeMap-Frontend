import React from 'react';
import { FlatList, StatusBar } from 'react-native';
import {
  Box,
  Text,
  Image,
  Heading,
  HStack,
  VStack,
  Icon,
  Pressable,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. useRouter 임포트

// --- 1. 데이터 타입 및 더미 데이터 정의 ---
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
    id: '1',
    category: '시설/인프라',
    dangerLevel: '위험도 중',
    title: '서울대학교 정문 가로수 넘어짐',
    location: '서울대학교 관악캠퍼스 정문',
    timestamp: '25. 9. 16 (화) 20:00',
    imageUrl: 'https://picsum.photos/id/10/200',
  },
  {
    id: '2',
    category: '자연재해',
    dangerLevel: '위험도 상',
    title: '관악산 인근 국지성 호우',
    location: '서울대학교 후문 등산로',
    timestamp: '25. 9. 16 (화) 18:30',
    imageUrl: 'https://picsum.photos/id/20/200',
  },
  {
    id: '3',
    category: '교통',
    dangerLevel: '위험도 하',
    title: '정문 앞 3중 추돌사고',
    location: '서울대학교 정문 앞 교차로',
    timestamp: '25. 9. 16 (화) 17:00',
    imageUrl: 'https://picsum.photos/id/30/200',
  },
  {
    id: '4',
    category: '시설/인프라',
    dangerLevel: '위험도 중',
    title: '중앙도서관 엘리베이터 고장',
    location: '서울대학교 중앙도서관',
    timestamp: '25. 9. 16 (화) 15:20',
    imageUrl: 'https://picsum.photos/id/40/200',
  },
];

// --- 2. 개별 이벤트 카드 UI 컴포넌트 ---
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const router = useRouter(); // 2. router 인스턴스 생성

  return (
    <Pressable
      bg="$white"
      borderRadius="$xl"
      p="$4"
      mb="$4"
      hardShadow="2" // 그림자 효과
      onPress={() => router.push('/(main)/post-detail')} // 3. onPress 이벤트 추가
    >
      <HStack space="md" alignItems="center">
        {/* 이미지 */}
        <Image
          source={{ uri: event.imageUrl }}
          alt="Event Image"
          w="$20"
          h="$20"
          borderRadius="$lg"
        />

        {/* 텍스트 컨텐츠 (VStack으로 수직 정렬) */}
        <VStack flex={1} space="sm">
          {/* 상단 뱃지 (HStack으로 수평 정렬) */}
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

// --- 3. 이벤트 리스트 메인 컴포넌트 ---
const EventList = () => {
  return (
    <Box flex={1} bg="$coolGray100" pt={StatusBar.currentHeight}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={DUMMY_EVENTS}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}
      />
    </Box>
  );
};

export default EventList;
