import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  BackHandler,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Box } from "@gluestack-ui/themed";
import PostView from "@/components/PostView";
import { ReportDetail } from "@/api/types";
import { getUserReportList, deleteReport } from "@/api/apis";

const screenHeight = Dimensions.get("window").height;

export default function PostDetailViewScreen({
  reportDetail, // ✅ props 받아오기
  reportId, // ✅ 실제 report_id
  onClose,
}: {
  reportDetail: ReportDetail;
  reportId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;
  const [isMyPost, setIsMyPost] = useState(false);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // 뒤로가기 버튼 핸들러
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBackdropPress();
        return true; // 이벤트 처리 완료
      }
    );

    // 현재 사용자의 신고인지 확인
    const checkMyPost = async () => {
      try {
        const myReports = await getUserReportList();
        console.log(
          "📋 내 신고 목록:",
          myReports.map((r) => r.report_id)
        );
        console.log("📋 현재 신고 report_id:", reportId);

        // report_id로 비교
        const isOwner = myReports.some(
          (report) => String(report.report_id) === String(reportId)
        );
        console.log("📋 내 신고 여부:", isOwner);
        setIsMyPost(isOwner);
      } catch (error) {
        console.error("내 신고 목록 확인 실패:", error);
        setIsMyPost(false);
      }
    };
    checkMyPost();

    return () => backHandler.remove();
  }, [reportId]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 120) {
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }).start(onClose);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleBackdropPress = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  // 수정 버튼 핸들러
  const handleEdit = () => {
    handleBackdropPress();
    // 모달이 닫힌 후 수정 화면으로 이동
    setTimeout(() => {
      router.push({
        pathname: "/(main)/post-edit",
        params: { report_id: reportId },
      });
    }, 250);
  };

  // 삭제 버튼 핸들러
  const handleDelete = () => {
    Alert.alert("신고 삭제", "정말로 이 신고를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReport(reportId);
            Alert.alert("삭제 완료", "신고가 삭제되었습니다.");
            onClose();
          } catch (error) {
            console.error("삭제 실패:", error);
            Alert.alert("오류", "신고 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  if (!reportDetail) return null; // ✅ 안전장치 추가

  return (
    <>
      {/* 반투명 배경 */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.4)"
        zIndex={30}
        onTouchStart={handleBackdropPress}
      />

      {/* 슬라이드 모달 */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "85%",
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          transform: [{ translateY }],
          zIndex: 40,
        }}
      >
        {/* ✅ props 전달 (자신의 신고인 경우만 수정/삭제 버튼 표시) */}
        <PostView
          reportDetail={reportDetail}
          reportId={reportId}
          onBackPress={handleBackdropPress}
          onEditPress={isMyPost ? handleEdit : undefined}
          onDeletePress={isMyPost ? handleDelete : undefined}
        />
      </Animated.View>
    </>
  );
}
