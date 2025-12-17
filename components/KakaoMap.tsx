import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function KakaoMap({
  onCenterChange,
}: {
  onCenterChange: (payload: any) => void;
}) {
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === "address_changed") {
      onCenterChange(data.payload.dong);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: "https://kakao-map-web.vercel.app" }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
        onMessage={handleMessage}
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
