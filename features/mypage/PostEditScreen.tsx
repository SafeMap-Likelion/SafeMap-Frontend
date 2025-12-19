// 사건/사고 수정 화면
import React, { useState, useEffect, useRef, useMemo } from "react";
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
} from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Image as RNImage,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SvgUri } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { getReportDetail, patchReport } from "@/api/apis";
import { ReportDetail, ReportEdit } from "@/api/types";
import NewKakaoMap from "@/components/NewKakaoMap";

// NewKakaoMap 컴포넌트의 ref 타입을 정의합니다.
interface MapRef {
  recenter: (lat: number, lon: number) => void;
}

// 타입/상수
const DangerLevel = ["낮음", "중간", "높음"];
const CATEGORIES = [
  "🚗 교통",
  "🌪️ 자연 재해",
  "🔥 화재/폭발",
  "🏗️ 시설/인프라",
  "🚓 범죄/치안",
  "⚙️ 기타/특수",
];

// 카테고리 매핑 (API type <-> UI 카테고리)
const categoryToType: { [key: string]: string } = {
  "🚗 교통": "교통",
  "🌪️ 자연 재해": "자연 재해",
  "🔥 화재/폭발": "화재/폭발",
  "🏗️ 시설/인프라": "시설/인프라",
  "🚓 범죄/치안": "범죄/치안",
  "⚙️ 기타/특수": "기타/특수",
};

const typeToCategory: { [key: string]: string } = {
  교통: "🚗 교통",
  "자연 재해": "🌪️ 자연 재해",
  "화재/폭발": "🔥 화재/폭발",
  "시설/인프라": "🏗️ 시설/인프라",
  "범죄/치안": "🚓 범죄/치안",
  "기타/특수": "⚙️ 기타/특수",
};

// 위험도 매핑
const levelToText: { [key: number]: string } = {
  1: "낮음",
  2: "중간",
  3: "높음",
};

const textToLevel: { [key: string]: number } = {
  낮음: 1,
  중간: 2,
  높음: 3,
};

// MinIO 이미지 URL 변환
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL_MinIO || "";

const getFullImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return "";
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

// 작은 컴포넌트들
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
  const { report_id } = useLocalSearchParams<{ report_id: string }>();
  const mapRef = useRef<MapRef>(null);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);

  // 폼 상태
  const [category, setCategory] = useState<string>("🏗️ 시설/인프라");
  const [level, setLevel] = useState<string>("중간");
  const [address, setAddress] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null); // 기존 이미지 URL
  const [newImageUri, setNewImageUri] = useState<string | null>(null); // 새로 선택한 이미지 URI
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);

  // 지도 관련 상태
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 주소 정보
  const [addr_a, setAddr_a] = useState<string>("");
  const [addr_b, setAddr_b] = useState<string>("");
  const [addr_c, setAddr_c] = useState<string>("");

  const markerBaseUrl =
    "https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers";

  const markerTypeKey = (selectedCategory: string) => {
    if (selectedCategory.includes("교통")) return "traffic";
    if (selectedCategory.includes("범죄") || selectedCategory.includes("치안"))
      return "crime";
    if (
      selectedCategory.includes("시설") ||
      selectedCategory.includes("인프라")
    )
      return "infra";
    if (selectedCategory.includes("화재") || selectedCategory.includes("폭발"))
      return "fire";
    if (selectedCategory.includes("자연")) return "nature";
    return "etc";
  };

  const markerLevelKey = (selectedLevel: string) => {
    const levelIndex = DangerLevel.findIndex((lv) => lv === selectedLevel);
    if (levelIndex === 0) return "low";
    if (levelIndex === 2) return "high";
    return "mid";
  };

  const selectedMarkerUrl = useMemo(() => {
    return `${markerBaseUrl}/${markerTypeKey(category)}_${markerLevelKey(level)}.svg`;
  }, [category, level]);

  // 기존 신고 데이터 로드
  useEffect(() => {
    const loadReportDetail = async () => {
      if (!report_id) {
        Alert.alert("오류", "신고 ID가 없습니다.");
        router.back();
        return;
      }

      try {
        setIsLoading(true);
        const detail = await getReportDetail(report_id);
        setReportDetail(detail);

        // 폼에 기존 데이터 채우기
        setCategory(typeToCategory[detail.type] || "🏗️ 시설/인프라");
        setLevel(levelToText[detail.level] || "중간");
        setTitle(detail.title);
        setDesc(detail.description);
        setAddress(detail.place);
        setAddr_a(detail.addr_a);
        setAddr_b(detail.addr_b);
        setAddr_c(detail.addr_c);

        // 지도 위치 설정
        const reportLocation = {
          latitude: detail.latitude,
          longitude: detail.longitude,
        };
        setLocation(reportLocation);
        setMapCenter(reportLocation);

        // 이미지 설정 (첫 번째 이미지만)
        if (detail.photos && detail.photos.length > 0) {
          const imageUrl = getFullImageUrl(detail.photos[0].photo);
          setImage(imageUrl);
          setOriginalImageUrl(imageUrl); // 기존 이미지 URL 저장
        }
      } catch (error) {
        console.error("신고 상세 로드 실패:", error);
        Alert.alert("오류", "신고 정보를 불러오는데 실패했습니다.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadReportDetail();
  }, [report_id]);

  // 지도 로드 후 원래 신고 위치로 중심 이동
  useEffect(() => {
    if (!isLoading && location && mapRef.current) {
      // 지도가 완전히 로드될 시간을 주고 recenter 호출
      const timer = setTimeout(() => {
        mapRef.current?.recenter(location.latitude, location.longitude);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, location]);

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

        // 도로명주소를 표시용으로 사용
        const roadAddress = doc.road_address?.address_name;
        const jibunAddress = doc.address?.address_name;
        setAddress(roadAddress || jibunAddress || "");

        // 지번주소에서 시/도, 구, 동 정보 추출
        const addressData = doc.address || {};
        let addr1 = addressData.region_1depth_name || "";
        const addr2 = addressData.region_2depth_name || "";
        const addr3 = addressData.region_3depth_name || "";

        // 시/도 이름 변환
        if (addr1 === "서울" || addr1 === "서울특별시") {
          addr1 = "서울시";
        } else if (addr1.endsWith("특별시") || addr1.endsWith("광역시")) {
          addr1 = addr1.replace(/특별시$|광역시$/, "시");
        }

        setAddr_a(addr1);
        setAddr_b(addr2);
        setAddr_c(addr3);
      }
    } catch (error) {
      console.error("주소를 가져오는 데 실패했습니다:", error);
    }
  };

  const handleCenterChangeCoordinates = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setMapCenter(coords);
    getAddress(coords.latitude, coords.longitude);
  };

  const canSubmit =
    title.trim().length > 0 &&
    address?.trim().length! > 0 &&
    category.trim().length > 0 &&
    level.trim().length > 0;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImage(selectedUri);
      setNewImageUri(selectedUri); // 새 이미지 URI 저장
    }
  };

  const removeImage = () => {
    setImage(null);
    setNewImageUri(null);
  };

  const handleMapTouchStart = () => setScrollEnabled(false);
  const handleMapTouchEnd = () => setScrollEnabled(true);

  const handleCancel = () => {
    router.back();
  };

  const handleUpdate = async () => {
    if (!canSubmit || !mapCenter || !report_id) return;

    const reportData: ReportEdit = {
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      type: categoryToType[category] || "기타/특수",
      level: textToLevel[level] || 2,
      title: title,
      place: address || "",
      description: desc,
      addr_a: addr_a,
      addr_b: addr_b,
      addr_c: addr_c,
      addr_d: address || "",
      state: "true",
      photos: reportDetail?.photos || [],
    };

    try {
      // 새 이미지가 선택된 경우에만 newImageUri 전달
      await patchReport(report_id, reportData, newImageUri);
      Alert.alert("성공!", "신고가 수정되었습니다.");
      router.back();
    } catch (error) {
      Alert.alert("오류", "신고 수정에 실패했습니다.");
      console.error("Report update error:", error);
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} bg="$white" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#1C9DFF" />
        <Text mt={10} color="#565656">
          신고 정보 로딩 중...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$white" pt={60}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <Box px="$4" pb="$4" bg="$white">
          <Heading size="2xl" fontWeight="$bold" textAlign="center">
            🔈사건/사고 수정하기
          </Heading>
        </Box>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          nestedScrollEnabled={true}
          scrollEnabled={scrollEnabled}
          keyboardShouldPersistTaps="handled"
        >
          {/* 사고 유형 */}
          <HStack mb="$2">
            <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
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
              {DangerLevel.map((lv) => {
                const getLevelColor = (level: string) => {
                  if (level === "낮음") return "#929292";
                  if (level === "중간") return "#FF7A05";
                  if (level === "높음") return "#FF1212";
                  return "#FF7A05";
                };

                return (
                  <Box key={lv} mr="$2" mb="$2">
                    <SelectChip
                      bg={(selected) =>
                        selected ? getLevelColor(lv) : "white"
                      }
                      txt={(selected) => (selected ? "#fff" : "#334155")}
                      label={lv}
                      selected={level === lv}
                      onPress={() => setLevel(lv)}
                    />
                  </Box>
                );
              })}
            </HStack>
          </Box>

          {/* 지도 표시 위치 */}
          <HStack mb="$2">
            <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
              지도 표시 위치
            </Text>
            <Text color="$coolGray800" fontSize={10}>
              *지도를 드래그하여 위치를 변경할 수 있습니다.
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
            width="100%"
            aspectRatio={1}
            borderWidth={1}
            borderColor="$coolGray200"
            borderRadius="$lg"
            mb="$3"
            position="relative"
            overflow="hidden"
            onTouchStart={handleMapTouchStart}
            onTouchEnd={handleMapTouchEnd}
            onTouchCancel={handleMapTouchEnd}
          >
            {location ? (
              <NewKakaoMap
                ref={mapRef}
                latitude={location.latitude}
                longitude={location.longitude}
                onCenterChangeCoordinates={handleCenterChangeCoordinates}
              />
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Text>위치 정보를 불러오는 중...</Text>
              </Box>
            )}
            {selectedMarkerUrl ? (
              <Box
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ translateY: -24 }],
                  },
                ]}
                pointerEvents="none"
              >
                <SvgUri uri={selectedMarkerUrl} width={48} height={48} />
              </Box>
            ) : null}
          </Box>

          {/* 사고 위치 */}
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
            <InputField value={title} onChangeText={setTitle} px="$3" />
          </Input>

          {/* 현장 이미지 */}
          <HStack mb="$2" justifyContent="space-between" alignItems="center">
            <HStack>
              <Text color="$coolGray800" fontWeight="$semibold" fontSize={18}>
                현장 이미지
              </Text>
              {newImageUri && (
                <Text color="$blue500" fontSize={12} ml="$2">
                  (새 이미지 선택됨)
                </Text>
              )}
            </HStack>
            {image && (
              <Pressable onPress={removeImage}>
                <Text color="$red500" fontSize={14}>
                  삭제
                </Text>
              </Pressable>
            )}
          </HStack>
          <Pressable onPress={pickImage}>
            <Box
              width="100%"
              aspectRatio={1}
              borderWidth={1}
              borderStyle="dashed"
              borderColor={newImageUri ? "$blue400" : "$coolGray300"}
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
                  resizeMode="contain"
                />
              ) : (
                <HStack justifyContent="center" alignItems="center">
                  <Text color="$coolGray500">이미지 추가 (터치하여 선택)</Text>
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

          {/* 수정 취소 / 사건 수정 버튼 */}
          <HStack mb="$3" justifyContent="center" gap="$3">
            <Button
              bg="#9B9B9B"
              w={120}
              borderRadius={15}
              onPress={handleCancel}
            >
              <ButtonText color="$white" fontWeight="$bold">
                수정 취소
              </ButtonText>
            </Button>

            <Button
              bg="#3897DF"
              w={120}
              borderRadius={15}
              opacity={canSubmit ? 1 : 0.5}
              disabled={!canSubmit}
              onPress={handleUpdate}
            >
              <ButtonText color="$white" fontWeight="$bold">
                사건 수정
              </ButtonText>
            </Button>
          </HStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
