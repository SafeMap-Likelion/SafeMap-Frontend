import React, { useEffect } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";
import { Box } from "@gluestack-ui/themed";
import PostView from "@/components/PostView";
import { ReportDetail } from "@/api/types";

const screenHeight = Dimensions.get("window").height;

export default function PostDetailViewScreen({
  reportDetail, // ✅ props 받아오기
  onClose,
}: {
  reportDetail: ReportDetail;
  onClose: () => void;
}) {
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

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
        {/* ✅ props 전달 */}
        <PostView reportDetail={reportDetail} />
      </Animated.View>
    </>
  );
}
