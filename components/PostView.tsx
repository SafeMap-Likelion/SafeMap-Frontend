import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage, Dimensions, Platform } from "react-native";
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
import { ReportDetail, ReportReaction } from "@/api/types";
import {
  getReportReactionList,
  postReportReaction,
  putReportReaction,
  deleteReportReaction,
} from "@/api/apis";

// 간단한 이모지 목록 (Android 폰트 버그 대응)
const SIMPLE_EMOJIS = [
  "👍",
  "👎",
  "❤️",
  "😀",
  "😂",
  "😢",
  "😡",
  "😱",
  "🔥",
  "⚠️",
  "✅",
  "❌",
  "👀",
  "🙏",
  "💪",
  "🚨",
  "🚗",
  "🏗️",
  "🌊",
  "⛑️",
  "🚓",
  "🔔",
  "📍",
  "⭐",
  "💯",
];

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

function PostTitle({
  reportDetail,
  onEditPress,
  onDeletePress,
}: {
  reportDetail: ReportDetail;
  onEditPress?: () => void;
  onDeletePress?: () => void;
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
          {reportDetail.title}
        </Heading>
        {(onEditPress || onDeletePress) && (
          <HStack space="sm">
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
            {onDeletePress && (
              <Pressable
                bg="#FF4444"
                px={10}
                py={5}
                borderRadius={20}
                onPress={onDeletePress}
              >
                <Text color="$white" fontSize={16} fontWeight="$bold">
                  삭제
                </Text>
              </Pressable>
            )}
          </HStack>
        )}
      </HStack>
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

function PostContent({
  reportDetail,
  reportId,
  onEditPress,
  onDeletePress,
}: {
  reportDetail: ReportDetail;
  reportId: string;
  onEditPress?: () => void;
  onDeletePress?: () => void;
}) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [reactions, setReactions] = useState<ReportReaction[]>([]);
  const [myReaction, setMyReaction] = useState<string | null>(null); // 내 반응 (1개만 가능)
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // API 호출 중 상태

  // 초기 반응 목록 가져오기
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const reactionList = await getReportReactionList(reportId);
        setReactions(reactionList);
      } catch (error) {
        console.error("Failed to fetch reactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReactions();
  }, [reportId]);

  // 반응 목록 새로고침
  const refreshReactions = async () => {
    try {
      const reactionList = await getReportReactionList(reportId);
      setReactions(reactionList);
    } catch (error) {
      console.error("Failed to refresh reactions:", error);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (isProcessing) return;
    setModalVisible(false);
    setIsProcessing(true);

    try {
      if (myReaction === emoji) {
        // 같은 이모지 클릭 → 반응 삭제
        await deleteReportReaction(reportId);
        setMyReaction(null);
        // 로컬 상태 업데이트
        setReactions((prev) =>
          prev
            .map((r) => (r.emoji === emoji ? { ...r, num: r.num - 1 } : r))
            .filter((r) => r.num > 0)
        );
      } else if (myReaction) {
        // 이미 다른 반응이 있음 → 반응 수정 (PUT)
        await putReportReaction(reportId, { emoji });
        const oldEmoji = myReaction;
        setMyReaction(emoji);
        // 로컬 상태 업데이트
        setReactions((prev) => {
          let updated = prev
            .map((r) => (r.emoji === oldEmoji ? { ...r, num: r.num - 1 } : r))
            .filter((r) => r.num > 0);

          const existingNew = updated.find((r) => r.emoji === emoji);
          if (existingNew) {
            updated = updated.map((r) =>
              r.emoji === emoji ? { ...r, num: r.num + 1 } : r
            );
          } else {
            updated = [...updated, { emoji, num: 1 }];
          }
          return updated;
        });
      } else {
        // 반응 없음 → 새 반응 생성 (POST)
        await postReportReaction(reportId, { emoji });
        setMyReaction(emoji);
        // 로컬 상태 업데이트
        setReactions((prev) => {
          const existing = prev.find((r) => r.emoji === emoji);
          if (existing) {
            return prev.map((r) =>
              r.emoji === emoji ? { ...r, num: r.num + 1 } : r
            );
          } else {
            return [...prev, { emoji, num: 1 }];
          }
        });
      }
    } catch (error: any) {
      // console.error("Reaction error:", error);
      // 에러 시 서버에서 최신 상태 다시 가져오기
      await refreshReactions();

      // 400 에러 (이미 반응함) → PUT으로 수정 시도
      if (error?.response?.status === 400 && !myReaction) {
        try {
          await putReportReaction(reportId, { emoji });
          setMyReaction(emoji);
          await refreshReactions();
        } catch (putError) {
          // console.error("PUT fallback failed:", putError);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactionPress = (emoji: string) => {
    handleEmojiSelect(emoji);
  };

  return (
    <VStack>
      <PostTitle
        reportDetail={reportDetail}
        onEditPress={onEditPress}
        onDeletePress={onDeletePress}
      />
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

      {/* Slack 스타일 반응 표시 */}
      <HStack flexWrap="wrap" style={{ gap: 8, marginTop: 10 }}>
        {reactions.map((reaction) => {
          const isMyReaction = myReaction === reaction.emoji;
          return (
            <Pressable
              key={reaction.emoji}
              onPress={() => handleReactionPress(reaction.emoji)}
              disabled={isProcessing}
              opacity={isProcessing ? 0.6 : 1}
            >
              <Badge
                backgroundColor={isMyReaction ? "#E3F2FD" : "#F3F3F3"}
                borderRadius={20}
                borderWidth={isMyReaction ? 1 : 0}
                borderColor={isMyReaction ? "#1C9DFF" : "transparent"}
                style={{ paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <HStack alignItems="center" space="xs">
                  <Text fontSize={16}>{reaction.emoji}</Text>
                  <Text
                    fontSize={13}
                    fontWeight={isMyReaction ? "$bold" : "$normal"}
                    color={isMyReaction ? "#1C9DFF" : "#565656"}
                  >
                    {reaction.num}
                  </Text>
                </HStack>
              </Badge>
            </Pressable>
          );
        })}
        {/* 반응 추가 버튼 */}
        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={isProcessing}
        >
          <Badge
            backgroundColor="#F3F3F3"
            borderRadius={20}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <HStack alignItems="center" space="xs">
              <FontAwesome name="smile-o" size={16} color="#929292" />
              <Text fontSize={16} color="#929292">
                +
              </Text>
            </HStack>
          </Badge>
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
          <ModalBody style={{ padding: 10 }}>
            {Platform.OS === "android" ? (
              /* Android: 간단한 이모지 그리드 (FontSize 버그 회피) */
              <HStack
                flexWrap="wrap"
                justifyContent="center"
                style={{ gap: 8 }}
              >
                {SIMPLE_EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => handleEmojiSelect(emoji)}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F5F5F5",
                      borderRadius: 8,
                    }}
                  >
                    <Text fontSize={24}>{emoji}</Text>
                  </Pressable>
                ))}
              </HStack>
            ) : (
              /* iOS: EmojiSelector 사용 */
              <Box style={{ height: 400 }}>
                <EmojiSelector
                  onEmojiSelected={handleEmojiSelect}
                  showSearchBar={false}
                  showHistory={false}
                  showSectionTitles={false}
                  showTabs={false}
                  columns={8}
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default function PostView({
  reportDetail,
  reportId,
  onBackPress,
  onEditPress,
  onDeletePress,
}: {
  reportDetail: ReportDetail;
  reportId: string;
  onBackPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
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
      <PostContent
        reportDetail={reportDetail}
        reportId={reportId}
        onEditPress={onEditPress}
        onDeletePress={onDeletePress}
      />
    </ScrollView>
  );
}
