import React, { useState } from "react";
import {
  Box,
  HStack,
  Text,
  Heading,
  Pressable,
  ScrollView,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Icon,
} from "@gluestack-ui/themed";
import { ImageIcon } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import MapWrapper from "../../components/MapWrapper";

//타입/상수
const DangerLevel = ["낮음", "중간", "높음"];
const CATEGORIES = [
  "🚦 교통",
  "🌪️ 자연 재해",
  "🧍 치안/폭력",
  "⛑️ 시설/인프라",
  "🖥️ 장애/오류",
  "📌 기타/특수",
];

//작은 컴포넌트들
function SelectChip({
  label,
  selected = false,
  onPress,
  bg,
  txt,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  bg?: string | ((selected: boolean) => string);
  txt?: string | ((selected: boolean) => string);
}) {
  const background =
    typeof bg === "function"
      ? bg(selected)
      : (bg ?? (selected ? "#2563eb" : "#f1f5f9"));
  const text =
    typeof txt === "function"
      ? txt(selected)
      : (txt ?? (selected ? "#fff" : "#334155"));

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Box borderRadius="$full" px="$3.5" py="$2" bg={background}>
        <Text color={text} fontWeight="$semibold" fontSize="$sm">
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}

// 게시물 수정 화면
export default function PostEditScreen() {
  const router = useRouter();

  // 기존 게시물 정보로 초기화 (나중에 props나 route params로 받아올 수 있음)
  const [category, setCategory] = useState<string>("⛑️ 시설/인프라");
  const [level, setLevel] = useState<string>("중간");
  const [address, setAddress] = useState<string>("서울대학교 관악캠퍼스 정문");
  const [title, setTitle] = useState<string>("서울대학교 정문 가로수 넘어짐");
  const [desc, setDesc] = useState<string>(
    "집 가는 길에 정문에서 누워있는 나무 발견.\n학교 측에서 빨리 조치를 해야할 것 같은데,, 너무 위험함. 다행히 주변에 사람이 없었는데 빨리 정리해줬으면 좋겠당."
  );

  const canSubmit = title.trim().length > 0 && address.trim().length > 0;

  const handleCancel = () => {
    router.back();
  };

  const handleUpdate = () => {
    // TODO: 수정 로직 구현
    console.log("게시물 수정");
    router.back();
  };

  return (
    <Box flex={1} bg="$white">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <HStack alignItems="center" justifyContent="center" m="$10">
          <Heading size="2xl">🔈사건/사고 수정하기</Heading>
          <Box w="$6" />
        </HStack>

        {/* 사고 유형 */}
        <HStack mb="$2" alignItems="center">
          <Text color="$coolGray800" fontWeight="$semibold">
            사고 유형
          </Text>
          <Text color="$red500"> *</Text>
        </HStack>
        <Box bg="$coolGray50" borderRadius="$xl" p="$3" mb="$5">
          <HStack
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {CATEGORIES.map((c) => (
              <Box key={c} mr="$2" mb="$2">
                <SelectChip
                  label={c}
                  selected={category === c}
                  onPress={() => setCategory(c)}
                  bg={(selected) => (selected ? "#FBDADA" : "white")}
                  txt={(selected) => (selected ? "black" : "black")}
                />
              </Box>
            ))}
          </HStack>
        </Box>

        {/* 위험도 */}
        <HStack mb="$2" alignItems="center">
          <Text color="$coolGray800" fontWeight="$semibold">
            위험도
          </Text>
          <Text color="$red500"> *</Text>
        </HStack>
        <Box bg="$coolGray50" borderRadius="$xl" p="$3" mb="$5">
          <HStack
            style={{
              justifyContent: "center",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {DangerLevel.map((lv) => (
              <Box key={lv} mr="$2" mb="$2">
                <SelectChip
                  bg={(selected) => (selected ? "#FF7A05" : "white")}
                  txt={(selected) => (selected ? "#fff" : "#334155")}
                  label={lv}
                  selected={level === lv}
                  onPress={() => setLevel(lv)}
                />
              </Box>
            ))}
          </HStack>
        </Box>

        {/* 지도 표시 위치 */}
        <HStack mb="$2" alignItems="flex-end">
          <Text color="$coolGray800" fontWeight="$semibold">
            지도 표시 위치
          </Text>
          <Text color="$coolGray800" fontSize={8} ml="$1">
            현재 위치로 자동 입력됩니다.
          </Text>
        </HStack>
        <Box bg="$coolGray50" borderRadius="$xl" p="$3" mb="$5">
          <HStack
            style={{
              justifyContent: "center",
            }}
          >
            <Text color="$coolGray800" fontWeight="$semibold">
              서울 관악구 관악로 1
            </Text>
          </HStack>
        </Box>
        <Box
          h={170}
          borderWidth={1}
          borderColor="$coolGray200"
          borderRadius="$lg"
          overflow="hidden"
          mb="$3"
          justifyContent="center"
          alignItems="center"
        >
          <MapWrapper />
        </Box>

        {/* 사고 위치 */}
        <HStack mb="$2" alignItems="center">
          <Text color="$coolGray800" fontWeight="$semibold">
            사고 위치
          </Text>
          <Text color="$red500"> *</Text>
        </HStack>
        <Input mb="$5">
          <InputField
            placeholder="사건 위치를 입력해주세요"
            value={address}
            onChangeText={setAddress}
          />
        </Input>

        {/* 제목 */}
        <HStack mb="$2" alignItems="center">
          <Text color="$coolGray800" fontWeight="$semibold">
            제목
          </Text>
          <Text color="$red500"> *</Text>
        </HStack>
        <Input mb="$5">
          <InputField
            placeholder="예) 내가 지나가다 나무가 쓰러져 있었는데, 2층 유리를 밟음"
            value={title}
            onChangeText={setTitle}
          />
        </Input>

        {/* 현장 이미지 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold">
            현장 이미지
          </Text>
        </HStack>
        <Box
          h={120}
          borderWidth={1}
          borderStyle="dashed"
          borderColor="$coolGray300"
          borderRadius="$lg"
          mb="$5"
          alignItems="center"
          justifyContent="center"
          bg="$coolGray50"
          overflow="hidden"
        >
          <HStack justifyContent="center" alignItems="center">
            <Icon as={ImageIcon} />
            <Text color="$coolGray500">이미지 추가</Text>
          </HStack>
        </Box>

        {/* 설명 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold">
            설명
          </Text>
        </HStack>
        <Textarea mb="$6">
          <TextareaInput
            placeholder="상황을 더 자세히 적어주세요"
            value={desc}
            onChangeText={setDesc}
            multiline
          />
        </Textarea>

        {/* 수정 취소 / 사건 수정 버튼 */}
        <HStack mb="$3" justifyContent="center" gap="$3">
          <Pressable
            bg="#9B9B9B"
            w={88}
            h={42}
            borderRadius={15}
            justifyContent="center"
            alignItems="center"
            onPress={handleCancel}
          >
            <Text color="$white" fontSize={16} fontWeight="$bold">
              수정 취소
            </Text>
          </Pressable>

          <Pressable
            bg="#3897DF"
            w={88}
            h={42}
            borderRadius={15}
            justifyContent="center"
            alignItems="center"
            opacity={canSubmit ? 1 : 0.5}
            disabled={!canSubmit}
            onPress={handleUpdate}
          >
            <Text color="$white" fontSize={16} fontWeight="$bold">
              사건 수정
            </Text>
          </Pressable>
        </HStack>
      </ScrollView>
    </Box>
  );
}
