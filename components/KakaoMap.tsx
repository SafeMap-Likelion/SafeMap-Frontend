import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function KakaoMap() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: "https://kakao-map-web.vercel.app" }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
        onMessage={(event) => {
          console.log("WebView says:", event.nativeEvent.data);
        }}
        onError={(e) => console.log("WebView error:", e.nativeEvent)}
        onHttpError={(e) =>
          console.log("WebView HTTP error:", e.nativeEvent.statusCode)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
