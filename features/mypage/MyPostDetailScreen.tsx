import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Box,
  HStack,
  Heading,
  Pressable,
  Text,
  Icon,
  ArrowLeftIcon,
  ScrollView,
} from "@gluestack-ui/themed";
import { Image as RNImage, View, ActivityIndicator } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import {
  VStack,
  Badge,
  BadgeText,
  CloseIcon,
  Image,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@gluestack-ui/themed";
import { getReportDetail } from "@/api/apis";
import { ReportDetail, Photo } from "@/api/types";

// MinIO 이미지 URL 변환
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL_MinIO || "";
const DEFAULT_IMAGE =
  "https://via.placeholder.com/400x300/cccccc/666666?text=No+Image";

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

// 위험도 레벨을 텍스트로 변환
const getLevelText = (level: number): string => {
  switch (level) {
    case 1:
      return "하";
    case 2:
      return "중";
    case 3:
      return "상";
    default:
      return "중";
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

// 타입에 따른 아이콘 반환
const getTypeIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    "시설/인프라": "⛑️",
    자연재해: "🌊",
    "범죄/치안": "🚨",
    교통: "🚗",
    화재: "🔥",
    기타: "⚠️",
  };
  return iconMap[type] || "⚠️";
};

// 위험도 뱃지 컴포넌트
function RiskBadge({ type, level }: { type: string; level: number }) {
  const levelText = getLevelText(level);
  const levelColor =
    {
      하: "#929292",
      중: "#FF7A05",
      상: "#FF1212",
    }[levelText] || "#FF7A05";

  return (
    <Badge
      borderRadius={100}
      backgroundColor={levelColor}
      style={{ paddingHorizontal: 10, paddingVertical: 10 }}
    >
      <BadgeText color="$white" fontSize={15} fontWeight="$bold">
        {getTypeIcon(type)} {type}-위험도 {levelText}
      </BadgeText>
    </Badge>
  );
}

// 게시물 제목+장소+날짜 컴포넌트 (수정 버튼 포함)
function PostTitle({
  title,
  place,
  createdAt,
  onEditPress,
}: {
  title: string;
  place: string;
  createdAt: string;
  onEditPress?: () => void;
}) {
  return (
    <>
      <HStack
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: 10 }}
      >
        <Heading
          fontSize={24}
          fontWeight="$bold"
          color="$black"
          textAlign="left"
          flex={1}
        >
          {title}
        </Heading>
        {onEditPress && (
          <Pressable
            bg="#1C9DFF"
            px={10}
            py={5}
            borderRadius={20}
            onPress={onEditPress}
          >
            <Text color="$white" fontSize={16} fontWeight="$bold">
              수정
            </Text>
          </Pressable>
        )}
      </HStack>
      <Text fontSize={15} fontWeight="$semibold" style={{ marginBottom: 15 }}>
        📍{place}
        {"\n"}🗓️ {formatDate(createdAt)}
      </Text>
    </>
  );
}

// 자동 높이 조절 이미지 컴포넌트
function AutoHeightImage({ uri, style, ...props }: any) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  React.useEffect(() => {
    RNImage.getSize(
      uri,
      (width, height) => {
        setAspectRatio(width / height);
      },
      (error) => {
        console.error("이미지 로드 실패:", error);
      }
    );
  }, [uri]);

  return (
    <RNImage
      style={[{ width: "100%", aspectRatio }, style]}
      source={{ uri }}
      {...props}
    />
  );
}

// 게시물 본문 컴포넌트
function PostContent({
  reportDetail,
  onEditPress,
}: {
  reportDetail: ReportDetail;
  onEditPress?: () => void;
}) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);

  const handleEmojiSelect = (emoji: string) => {
    setModalVisible(false);

    if (userReactions.includes(emoji)) {
      setUserReactions((prev) => prev.filter((e) => e !== emoji));
      setReactions((prev) => {
        const newReactions = { ...prev };
        if (newReactions[emoji] > 1) {
          newReactions[emoji] -= 1;
        } else {
          delete newReactions[emoji];
        }
        return newReactions;
      });
    } else {
      setUserReactions((prev) => [...prev, emoji]);
      setReactions((prev) => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1,
      }));
    }
  };

  return (
    <VStack>
      <PostTitle
        title={reportDetail.title}
        place={reportDetail.place}
        createdAt={reportDetail.created_at}
        onEditPress={onEditPress}
      />
      <Text fontSize={14} color="$black" style={{ marginBottom: 18 }}>
        {reportDetail.description}
      </Text>

      {/* 이미지들 */}
      {reportDetail.photos && reportDetail.photos.length > 0 ? (
        reportDetail.photos.map((photo, index) => (
          <Box key={index} style={{ marginBottom: 10 }}>
            <AutoHeightImage
              uri={getFullImageUrl(photo.photo)}
              style={{ borderRadius: 15 }}
              resizeMode="cover"
              alt={`사고장소 이미지 ${index + 1}`}
            />
          </Box>
        ))
      ) : (
        <Box style={{ marginBottom: 10 }}>
          <Text color="#929292" textAlign="center" py={20}>
            등록된 사진이 없습니다
          </Text>
        </Box>
      )}

      {/* Reaction Display와 + 버튼 */}
      <HStack
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {Object.entries(reactions).map(([emoji, count]) => (
          <Pressable key={emoji} onPress={() => handleEmojiSelect(emoji)}>
            <Badge
              backgroundColor="#F3F3F3"
              borderRadius={15}
              style={{
                paddingHorizontal: 5,
                paddingVertical: 5,
              }}
            >
              <BadgeText color="#565656" fontSize={11}>
                {emoji} {count}
              </BadgeText>
            </Badge>
          </Pressable>
        ))}

        {/* + 버튼 */}
        <Pressable onPress={() => setModalVisible(true)}>
          <Text fontSize={28} color="#929292" fontWeight="300">
            +
          </Text>
        </Pressable>
      </HStack>

      {/* Emoji Picker Modal */}
      <Modal
        isOpen={isModalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader style={{ justifyContent: "flex-end" }}>
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
                placeholder="이모지를 선택하세요"
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

// 마이페이지 게시물 상세 화면
export default function MyPostDetailScreen() {
  const router = useRouter();
  const { report_id } = useLocalSearchParams<{ report_id: string }>();
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API에서 신고 상세 정보 가져오기
  useEffect(() => {
    const loadReportDetail = async () => {
      if (!report_id) {
        console.error("report_id가 없습니다");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const detail = await getReportDetail(report_id);
        setReportDetail(detail);
        console.log("신고 상세 정보 로드 완료:", detail);
      } catch (error) {
        console.error("신고 상세 정보 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportDetail();
  }, [report_id]);

  const handleEdit = () => {
    router.push(`/(main)/post-edit?report_id=${report_id}`);
  };

  if (isLoading) {
    return (
      <Box
        flex={1}
        bg="$white"
        pt={60}
        justifyContent="center"
        alignItems="center"
      >
        <ActivityIndicator size="large" color="#1C9DFF" />
        <Text mt={10} color="#565656">
          신고 정보 로딩 중...
        </Text>
      </Box>
    );
  }

  if (!reportDetail) {
    return (
      <Box
        flex={1}
        bg="$white"
        pt={60}
        justifyContent="center"
        alignItems="center"
      >
        <Text color="#565656">신고 정보를 불러올 수 없습니다</Text>
        <Pressable mt={20} onPress={() => router.back()}>
          <Text color="#1C9DFF">돌아가기</Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$white" pt={60}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 100,
          paddingHorizontal: 15,
        }}
      >
        {/* Header with 뒤로가기 + 위험도 뱃지 */}
        <HStack alignItems="center" justifyContent="space-between" mb="$4">
          <Pressable onPress={() => router.back()}>
            <Icon as={ArrowLeftIcon} width={24} height={24} />
          </Pressable>
          <RiskBadge type={reportDetail.type} level={reportDetail.level} />
        </HStack>

        {/* 게시물 내용 (수정 버튼은 제목 옆에) */}
        <PostContent reportDetail={reportDetail} onEditPress={handleEdit} />
      </ScrollView>
    </Box>
  );
}
