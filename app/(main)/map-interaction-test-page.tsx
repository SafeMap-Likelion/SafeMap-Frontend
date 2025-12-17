// RN (React Native) — MapWebView.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapInteractionTestPage() {
  const webref = useRef<WebView>(null);
  const [lastClick, setLastClick] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 브릿지 스크립트: 웹 안에 주입되어 RN↔웹 통신 훅을 만든다
  const injected = useMemo(
    () => `
    (function(){
      if (window.__RN_BRIDGE__) return; window.__RN_BRIDGE__ = true;
      function send(type, payload){ 
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type, payload })
        );
      }

      // 카카오맵 인스턴스가 만들어질 때까지 대기
      function waitForMap(tryCnt=0){
        // 사용 중인 레포의 전역 접근자를 맞춰라(예: window.map, window.__map 등)
        var map = window.__map || window.map || window.kakaoMap || null;
        if (!map && window.kakao && window.kakao.maps && window.kakao.maps.Map) {
          // 앱이 직접 만든 전역 보관소가 없다면, 다음 틱에 다시 확인
        }
        if (map) {
          window.__map = map;
          wireEvents(map);
          send('ready', { center: { 
            lat: map.getCenter().getLat(), lng: map.getCenter().getLng() 
          }});
          return;
        }
        if (tryCnt > 80) { send('error', { msg:'map not found' }); return; }
        setTimeout(function(){ waitForMap(tryCnt+1); }, 150);
      }

      function wireEvents(map){
        // 맵 클릭 → RN으로 좌표 전달
        if (window.kakao && window.kakao.maps && window.kakao.maps.event) {
          window.kakao.maps.event.addListener(map, 'click', function(e){
            var latlng = e.latLng;
            send('map_click', { lat: latlng.getLat(), lng: latlng.getLng() });
          });
        }
      }

      // RN이 호출할 함수들
      window.__callFromRN__ = {
        addMarker: function(lat, lng){
          try{
            var pos = new kakao.maps.LatLng(lat, lng);
            var marker = new kakao.maps.Marker({ position: pos });
            marker.setMap(window.__map);
            send('marker_added', { lat, lng });
            return true;
          }catch(e){ send('error', { msg: String(e) }); return false; }
        },
        panTo: function(lat, lng){
          try{
            window.__map && window.__map.panTo(new kakao.maps.LatLng(lat, lng));
            return true;
          }catch(e){ send('error', { msg: String(e) }); return false; }
        }
      };

      waitForMap();
    })();
  `,
    []
  );

  // WebView에서 오는 메시지 처리
  const onMessage = (e: any) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      console.log("WEB→RN:", msg); // ✅ 모든 메시지 보기
      if (msg.type === "map_click") setLastClick(msg.payload);
    } catch (err) {
      console.log("WEB→RN (non-JSON):", e.nativeEvent.data);
    }
  };

  // RN 버튼 → 웹에 마커 추가 요청
  const addMarkerAtLastClick = () => {
    const loc = lastClick ?? { lat: 37.5665, lng: 126.978 }; // 기본(서울시청)
    webref.current?.injectJavaScript(
      `window.__kakaoBridge__?.addMarker(${loc.lat}, ${loc.lng}); true;`
    );
  };

  const panToSeoul = () => {
    webref.current?.injectJavaScript(
      `window.__kakaoBridge__?.panTo(37.5665, 126.9780); true;`
    );
  };

  //디버깅용
  // const diagnose = () => {
  //   webref.current?.injectJavaScript(`
  //   (function(){
  //     var msg = {
  //       type:'debug',
  //       payload:{
  //         hasKakao: !!(window.kakao && window.kakao.maps),
  //         hasMap: !!window.__map,
  //         hasWebBridge: !!window.__kakaoBridge__,
  //         hasRNBridgeObj: !!window.ReactNativeWebView
  //       }
  //     };
  //     window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  //   })(); true;
  // `);
  // };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webref}
        source={{ uri: "https://kakao-map-web.vercel.app/" }}
        onMessage={onMessage}
        injectedJavaScript={injected}
        onLoadEnd={() => webref.current?.injectJavaScript(injected)}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        style={StyleSheet.absoluteFill} // ✅ 화면 전체 채우기(절대배치)
      />

      {/* 오버레이 버튼들 */}
      <View style={styles.overlay}>
        <Pressable style={styles.btn} onPress={panToSeoul}>
          <Text style={styles.btnText}>Pan to Seoul</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={addMarkerAtLastClick}>
          <Text style={styles.btnText}>Add Marker</Text>
        </Pressable>
        {/* <Pressable style={styles.btn} onPress={diagnose}>
          <Text style={styles.btnText}>Diagnose</Text>
        </Pressable> */}
        <Text style={styles.info}>
          lastClick:{" "}
          {lastClick
            ? `${lastClick.lat.toFixed(5)}, ${lastClick.lng.toFixed(5)}`
            : "tap map"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 1000, // ✅ iOS 쌓임순서
    elevation: 10, // ✅ Android 쌓임순서
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  info: {
    marginLeft: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },

  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
