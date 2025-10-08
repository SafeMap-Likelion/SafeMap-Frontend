//관심지역 모아보기 화면
import React, { useState } from 'react';
import {
  Box,
  HStack,
  Heading,
  Icon,
  Pressable,
  Text,
} from '@gluestack-ui/themed';
import EventCardList from './components/EventCardList';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
        bg={selected ? '$blue600' : '$coolGray100'}
      >
        <Text
          color={selected ? '$white' : '$coolGray800'}
          fontWeight="$semibold"
          fontSize="$sm"
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}

/**
 * 게시물 목록을 보여주는 화면입니다.
 * 뒤로가기 버튼과 중앙 정렬된 제목을 포함한 헤더가 있습니다.
 */
export default function PostListViewScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('집');

  return (
    <Box flex={1} bg="$white" pt="$10">
      {/* Header */}
      <HStack
        px="$4"
        pb="$2"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$borderLight200"
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          w="$8"
          alignItems="flex-start"
        >
          <Icon as={FontAwesome} name="chevron-left" size="lg" />
        </Pressable>

        <Heading flex={1} textAlign="center">
          관심지역 모아보기
        </Heading>

        {/* Invisible placeholder to balance the title */}
        <Box w="$8" />
      </HStack>

      {/* Location Chips */}
      <HStack p="$4" gap="$3">
        <SelectChip
          label="집"
          selected={selectedLocation === '집'}
          onPress={() => setSelectedLocation('집')}
        />
        <SelectChip
          label="학교"
          selected={selectedLocation === '학교'}
          onPress={() => setSelectedLocation('학교')}
        />
      </HStack>

      {/* Content */}
      <Box flex={1}>
        <EventCardList />
      </Box>
    </Box>
  );
}