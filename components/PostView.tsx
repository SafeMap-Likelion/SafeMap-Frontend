import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage, Dimensions } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  BadgeText,
  Icon,
  CloseIcon,
  Pressable,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ScrollView,
} from "@gluestack-ui/themed";
import { FontAwesome } from "@expo/vector-icons";
import { ReportDetail } from "@/api/types";

// 백엔드 기본 URL (MinIO 이미지 URL 구성용)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL_MinIO || "http://localhost:8000";

// 이미지 URL을 전체 경로로 변환
const getFullImageUrl = (photoUrl: string): string => {
  console.log("📸 원본 photoUrl:", photoUrl);
  console.log("🌐 API_BASE_URL:", API_BASE_URL);

  if (!photoUrl) return "";

  // localhost:9000 (MinIO 로컬)을 실제 서버 주소로 변환
  if (
    photoUrl.includes("localhost:9000") ||
    photoUrl.includes("127.0.0.1:9000")
  ) {
    const convertedUrl = photoUrl.replace(
      /https?:\/\/(localhost|127\.0\.0\.1):9000/,
      `${API_BASE_URL}`
    );
    console.log("🔄 변환된 URL:", convertedUrl);
    return convertedUrl;
  }

  // 이미 절대 URL인 경우 그대로 반환
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    console.log("✅ 절대 URL 그대로 사용:", photoUrl);
    return photoUrl;
  }

  // 상대 경로인 경우 기본 URL 추가
  const fullUrl = `${API_BASE_URL}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
  console.log("🔗 상대경로 → 전체 URL:", fullUrl);
  return fullUrl;
};

// ✅ 수정됨
function RiskBadge({ category, level }: { category: string; level: number }) {
  const levelMap: Record<number, string> = { 1: "하", 2: "중", 3: "상" };
  const levelName = levelMap[level] || "중";

  const levelColor =
    {
      하: "#929292",
      중: "#FF7A05",
      상: "#FF1212",
    }[levelName] || "#FF7A05";

  return (
    <Badge
      borderRadius={100}
      backgroundColor={levelColor}
      style={{ paddingHorizontal: 10, paddingVertical: 10 }}
    >
      <BadgeText color="$white" fontSize={15} fontWeight="$bold">
        {category}-위험도 {levelName}
      </BadgeText>
    </Badge>
  );
}

// ✅ 수정됨
function HeaderWithBadge({
  reportDetail,
  onBackPress,
}: {
  reportDetail: ReportDetail;
  onBackPress?: () => void;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Pressable
        onPress={handleBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="chevron-left" size={18} color="#374151" />
      </Pressable>
      <RiskBadge category={reportDetail.type} level={reportDetail.level} />
    </HStack>
  );
}

function PostTitle({ reportDetail }: { reportDetail: ReportDetail }) {
  return (
    <>
      <Heading
        fontSize={24}
        fontWeight="$bold"
        color="$black"
        textAlign="left"
        style={{ marginBottom: 10 }}
      >
        {reportDetail.title}
      </Heading>
      <Text fontSize={15} fontWeight="$semibold" style={{ marginBottom: 15 }}>
        📍{reportDetail.place}
        {"\n"}🗓️ {new Date(reportDetail.created_at).toLocaleString()}
      </Text>
    </>
  );
}

function AutoHeightImage({ uri, style, ...props }: any) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  useEffect(() => {
    if (typeof uri === "string" && uri.startsWith("http")) {
      RNImage.getSize(
        uri,
        (width, height) => setAspectRatio(width / height),
        (error) => console.error("이미지 로드 실패:", error)
      );
    }
  }, [uri]);

  return (
    <RNImage
      style={[{ width: "100%", aspectRatio }, style]}
      source={typeof uri === "string" ? { uri } : uri}
      {...props}
    />
  );
}

function PostContent({ reportDetail }: { reportDetail: ReportDetail }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);

  const handleEmojiSelect = (emoji: string) => {
    setModalVisible(false);
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + (userReactions.includes(emoji) ? -1 : 1),
    }));
    setUserReactions((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  return (
    <VStack>
      <PostTitle reportDetail={reportDetail} />
      <Text fontSize={14} color="$black" style={{ marginBottom: 18 }}>
        {reportDetail.description}
      </Text>

      {reportDetail.photos && reportDetail.photos.length > 0 ? (
        <VStack space="sm" style={{ marginBottom: 10 }}>
          {reportDetail.photos.map((photo, index) => (
            <Box key={index}>
              <AutoHeightImage
                uri={getFullImageUrl(photo.photo)}
                style={{ borderRadius: 15 }}
                resizeMode="cover"
              />
            </Box>
          ))}
        </VStack>
      ) : (
        <Box style={{ marginBottom: 10 }}>
          <Text color="#929292" textAlign="center" py={20}>
            등록된 사진이 없습니다
          </Text>
        </Box>
      )}

      <HStack justifyContent="flex-end" flexWrap="wrap" style={{ gap: 8 }}>
        {Object.entries(reactions).map(([emoji, count]) => (
          <Pressable key={emoji} onPress={() => handleEmojiSelect(emoji)}>
            <Badge backgroundColor="#F3F3F3" borderRadius={15}>
              <BadgeText color="#565656" fontSize={11}>
                {emoji} {count}
              </BadgeText>
            </Badge>
          </Pressable>
        ))}
        <Pressable onPress={() => setModalVisible(true)}>
          <Text fontSize={28} color="#929292" fontWeight="300">
            +
          </Text>
        </Pressable>
      </HStack>

      <Modal isOpen={isModalVisible} onClose={() => setModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader justifyContent="flex-end">
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody style={{ padding: 0 }}>
            <Box style={{ height: 400 }}>
              <EmojiSelector
                onEmojiSelected={handleEmojiSelect}
                showSearchBar={false}
                columns={8}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default function PostView({
  reportDetail,
  onBackPress,
}: {
  reportDetail: ReportDetail;
  onBackPress?: () => void;
}) {
  if (!reportDetail) return null;
  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 20,
        paddingBottom: 100,
        paddingHorizontal: 15,
      }}
    >
      <Box style={{ marginBottom: 18 }}>
        <HeaderWithBadge
          reportDetail={reportDetail}
          onBackPress={onBackPress}
        />
      </Box>
      <PostContent reportDetail={reportDetail} />
    </ScrollView>
  );
}
