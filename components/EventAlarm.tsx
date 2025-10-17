// app/(main)/report-incident.tsx
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
  Button,
  ButtonText,
  Icon,
} from "@gluestack-ui/themed";
import { ArrowLeftIcon, ImageIcon } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
// import { Image as RNImage } from "react-native";
import MapWrapper from "./MapWrapper";

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

// 정적 지도 대체 이미지
// const MAP_PLACEHOLDER =
//   "https://images.unsplash.com/photo-1526775417991-3f88f10405ff?q=80&w=1200&auto=format&fit=crop";

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
  // bg, txt가 함수면 selected에 따라 동적으로 결정, 아니면 값 그대로 사용
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

//메인 화면 (정적 UI)
export default function EventAlarm() {
  const router = useRouter();

  const [category, setCategory] = useState<string>("⛑️ 시설/인프라");
  const [level, setLevel] = useState<string>("중간");
  const [address, setAddress] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  //필수항목 작성했을 때만 제출 버튼이 눌리도록!
  const canSubmit = title.trim().length > 0 && address.trim().length > 0;

  return (
    <Box flex={1} bg="$white">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <HStack alignItems="center" justifyContent="center" m="$10">
          <Heading size="2xl">🔈사건/사고 알리기</Heading>
          <Box w="$6" /> {/* spacer */}
        </HStack>

        {/* 사고 유형 */}
        {/* 제목 + 빨간 점 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            사고 유형
            <Text color="$red500"> *</Text>
          </Text>
        </HStack>
        {/* 연한 회색 배경 박스 안에 칩들 배치 */}
        <Box bg="$coolGray50" borderRadius="$xl" p="$3" mb="$5">
          <HStack
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center", // 가로기준 가운데 정렬
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
        {/* 제목 + 빨간 점 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            위험도
            <Text color="$red500"> *</Text>
          </Text>
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

        {/* 지도 표시 위치: 정적 이미지로 대체 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            지도 표시 위치
            <Text color="$coolGray800" fontSize={10}>
              *현재 위치로 자동 입력됩니다.
            </Text>
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
          {/* KakaoMap은 보통 WebView 기반이라 부모 높이에 맞춰야 해서 width/height 100%를 줍니다 */}
          <MapWrapper />
        </Box>

        {/* 사고 위치(주소 텍스트) */}

        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            사고 위치
            <Text color="$red500"> *</Text>
          </Text>
        </HStack>
        <Input mb="$5">
          <InputField
            placeholder="사건 위치를 입력해주세요"
            value={address}
            onChangeText={setAddress}
          />
        </Input>

        {/* 제목 */}

        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            제목
            <Text color="$red500"> *</Text>
          </Text>
        </HStack>
        <Input mb="$5">
          <InputField
            placeholder="예) 내가 지나가다 나무가 쓰러져 있었는데, 2층 유리를 밟음"
            value={title}
            onChangeText={setTitle}
          />
        </Input>

        {/* 현장 이미지: 정적 UI(업로드 없음) */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
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
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
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

        {/* 제출: 정적 UI이므로 동작 없음 */}
        <HStack mb="$3" justifyContent="center">
          <Button
            bg="$blue600"
            width="40%"
            opacity={canSubmit ? 1 : 0.5}
            disabled={!canSubmit}
            onPress={() => {}}
          >
            <ButtonText color="$white" fontWeight="$bold">
              사건 알리기
            </ButtonText>
          </Button>
        </HStack>
      </ScrollView>
    </Box>
  );
}
