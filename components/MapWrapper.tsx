import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  style?: StyleProp<ViewStyle>; // 부모(Box)에서 style 넘길 수 있게
};

export default function KakaoMap({ style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: "https://kakao-map-web.vercel.app/" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        // 박스 안에서만 스크롤(맵 드래그)되게
        nestedScrollEnabled // (Android) 내부 스크롤 허용
        overScrollMode="never"
        scrollEnabled // 기본 true지만 명시
        style={styles.webview}
        onMessage={(e) => console.log("WebView says:", e.nativeEvent.data)}
        onError={(e) => console.log("WebView error:", e.nativeEvent)}
        onHttpError={(e) =>
          console.log("HTTP error:", e.nativeEvent.statusCode)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%", // 부모(Box)가 주는 높이를 채움
  },
  webview: {
    width: "100%",
    height: "100%", // WebView도 컨테이너를 채움
  },
});
