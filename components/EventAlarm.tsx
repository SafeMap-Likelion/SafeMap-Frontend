// app/(main)/report-incident.tsx
import React, { useState, useEffect, useRef } from "react";
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
import { ArrowLeftIcon } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { Image as RNImage, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import MapWrapper from "./MapWrapper";

import NewKakaoMap from "./NewKakaoMap";
import * as Location from "expo-location";

// NewKakaoMap 컴포넌트의 ref 타입을 정의합니다.
interface MapRef {
  recenter: (lat: number, lon: number) => void;
}


//타입/상수
const DangerLevel = ["낮음", "중간", "높음"];
const CATEGORIES = [
  "🚗 교통",
  "🌪️ 자연 재해",
  "🔥 화재/폭발",
  "🏗️ 시설/인프라",
  "🚓 범죄/치안",
  "⚙️ 기타/특수",
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
  const mapRef = useRef<MapRef>(null);
  const [location, setLocation] = useState<{ 
      latitude: number; longitude: number 
    } | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const router = useRouter();

  const [category, setCategory] = useState<string>("🏗️ 시설/인프라");
  const [level, setLevel] = useState<string>("중간");
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);

  const getAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        const fetchedAddress = doc.road_address.address_name;
        setAddress(fetchedAddress);
      }
    } catch (error) {
      // console.error('주소를 가져오는 데 실패했습니다:', error);
    }
  };

  useEffect(() => {
      const getCurrentLocation = async () => {
        // 현재 위치 가져오기
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          console.log('Current location fetched:', coords);
          setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          getAddress(coords.latitude, coords.longitude);
        } catch (error) {
          console.error('위치 정보를 가져오는 데 실패했습니다:', error);
        }
      };
  
      getCurrentLocation();
    }, []);

  const handleCenterChangeCoordinates = (coords: { latitude: number; longitude: number }) => {
    getAddress(coords.latitude, coords.longitude);
  };

  //필수항목 작성했을 때만 제출 버튼이 눌리도록!
  const canSubmit = title.trim().length > 0 && address?.trim().length! > 0 && category.trim().length > 0 && level.trim().length > 0;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <Box flex={1} bg="$white" pt={60}>
      {/* Header */}
      <Box px="$4" pb="$4" bg="$white">
        <Heading size="2xl" fontWeight="$bold" textAlign="center">
          🔈사건/사고 알리기
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        {/* 사고 유형 */}
        {/* 제목 + 빨간 점 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            사고 유형
          </Text>
          <Text color="$red500"> *</Text>
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

        {/* 지도 표시 위치: 정적 이미지로 대체 */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            지도 표시 위치
          </Text>
          <Text color="$coolGray800" fontSize={10}>
            *현재 위치로 자동 입력됩니다.
          </Text>
        </HStack>
        <Box bg="$coolGray50" borderRadius="$xl" p="$3" mb="$5">
          <HStack style={{ justifyContent: "center" }}>
            <Text color="$coolGray800" fontWeight="$semibold">
              {address ? address : "지도에서 위치를 선택하세요."}
            </Text>
          </HStack>
        </Box>
        <Box
          h={170}
          borderWidth={1}
          borderColor="$coolGray200"
          borderRadius="$lg"
          mb="$3"
          
        >
          {/* <MapWrapper onAddressChange={(addr) => setAddress(addr)} /> */}
          {location ? (
            <NewKakaoMap 
              ref={mapRef}
              latitude={location.latitude} 
              longitude={location.longitude} 
              onCenterChangeCoordinates={handleCenterChangeCoordinates}
            />
          ) : (
            <Text>위치 정보를 불러오는 중...</Text>
          )}
          {/* ★ 수정 */}
        </Box>

        {/* 사고 위치(주소 텍스트) */}

        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
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

        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
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

        {/* 현장 이미지: 정적 UI(업로드 없음) */}
        <HStack mb="$2">
          <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
            현장 이미지
          </Text>
        </HStack>
        <Pressable onPress={pickImage}>
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
            {image ? (
              <RNImage
                source={{ uri: image }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <HStack justifyContent="center" alignItems="center">
                <Text color="$coolGray500">이미지 추가</Text>
              </HStack>
            )}
          </Box>
        </Pressable>

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
            borderRadius={15}
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
