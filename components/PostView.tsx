import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage, View } from "react-native";
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
  ArrowLeftIcon,
  CloseIcon,
  Pressable,
  Image,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ScrollView,
} from "@gluestack-ui/themed";

//위험도 뱃지 컴포넌트. 사고 종류랑 위험도에 따라 색&글자 바뀜 설정
function RiskBadge({ category = "⛑️ 시설/인프라", level = "중" }) {
  const levelColor =
    {
      하: "#929292",
      중: "#FF7A05",
      상: "#FF1212",
    }[level] || "#FF7A05";

  return (
    <Badge
      borderRadius={100}
      backgroundColor={levelColor}
      style={{ paddingHorizontal: 10, paddingVertical: 10 }}
    >
      <BadgeText color="$white" fontSize={15} fontWeight="$bold">
        {category}-위험도 {level}
      </BadgeText>
    </Badge>
  );
}

//게시물 페이지의 헤더컴포넌트
function HeaderWithBadge() {
  const router = useRouter();

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Pressable onPress={() => router.back()}>
        <Icon as={ArrowLeftIcon} width={24} height={24} />
      </Pressable>
      <RiskBadge category="⛑️ 시설/인프라" level="중" />
    </HStack>
  );
}

//게시물 제목+장소+날짜 컴포넌트
function PostTitle() {
  return (
    <>
      <Heading
        fontSize={24}
        fontWeight="$bold"
        color="$black"
        textAlign="left"
        style={{ marginBottom: 10 }}
      >
        서울대학교 정문 가로수 넘어짐
      </Heading>
      <Text fontSize={15} fontWeight="$semibold" style={{ marginBottom: 15 }}>
        📍서울대학교 관악캠퍼스 정문{"\n"}🗓️ 25. 9. 16 (화) 20:00
      </Text>
    </>
  );
}

// 자동 높이 조절 이미지 컴포넌트
function AutoHeightImage({ uri, style, ...props }: any) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
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

//게시물 본문 컴포넌트 (제목 + 글 + 이미지)
function PostContent() {
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
      <PostTitle />
      <Text fontSize={14} color="$black" style={{ marginBottom: 18 }}>
        집 가는 길에 정문에서 누워있는 나무 발견.{"\n"}학교 측에서 빨리 조치를
        해야할 것 같은데,, 너무 위험함. 다행히 주변에 사람이 없었는데 빨리
        정리해줬으면 좋겠당.
      </Text>

      {/* 이미지 */}
      <Box style={{ marginBottom: 10 }}>
        <AutoHeightImage
          uri="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          style={{ borderRadius: 15 }}
          resizeMode="cover"
          alt="사고장소 이미지"
        />
      </Box>

      {/* Reaction Display와 + 버튼 (오른쪽 정렬) */}
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

//최종 게시물 페이지
export default function PostPage() {
  return (
    <Box
      backgroundColor="$white"
      borderTopLeftRadius={15}
      borderTopRightRadius={15}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 10,
          paddingHorizontal: 15,
        }}
      >
        <Box style={{ marginBottom: 18 }}>
          <HeaderWithBadge />
        </Box>
        <PostContent />
      </ScrollView>
    </Box>
  );
}
