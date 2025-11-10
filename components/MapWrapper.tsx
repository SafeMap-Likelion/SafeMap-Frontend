import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  style?: StyleProp<ViewStyle>;
  onAddressChange?: (address: string) => void; // ★ 추가
};

export default function MapWrapper({ style, onAddressChange }: Props) {
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "address_changed" && data.payload?.fullAddress) {
        onAddressChange?.(data.payload.fullAddress);
      }
    } catch (e) {
      console.log("Invalid message from WebView:", e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: "https://kakao-map-web.vercel.app/" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        overScrollMode="never"
        scrollEnabled
        style={styles.webview}
        onMessage={handleMessage} // ★ 수정
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
    height: "100%",
  },
  webview: {
    width: "100%",
    height: "100%",
  },
});
