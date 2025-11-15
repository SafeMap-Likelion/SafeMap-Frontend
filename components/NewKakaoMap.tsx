import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// 컴포넌트 Props 타입 정의
type KakaoMapProps = {
  latitude: number;
  longitude: number;
  onCenterChangeCoordinates?: (coords: { latitude: number; longitude: number }) => void;
};

// 부모 컴포넌트에서 호출할 수 있는 함수 타입 정의
export interface MapRef {
  recenter: (lat: number, lon: number) => void;
}

// forwardRef의 타입 문제를 수정한 컴포넌트 정의
const NewKakaoMap = forwardRef<MapRef, KakaoMapProps>((props, ref) => {
  const { latitude, longitude, onCenterChangeCoordinates } = props;
  const webViewRef = useRef<WebView>(null);

  // 부모 컴포넌트에서 ref를 통해 recenter 함수를 호출할 수 있도록 설정
  useImperativeHandle(ref, () => ({
    recenter: (lat: number, lon: number) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'recenter', payload: { lat, lon } })
        );
      }
    },
  }));

  // WebView에 삽입될 HTML 및 JavaScript 코드
  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY}&libraries=services"></script>
          <style>
            html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
            .custom-overlay {
              width: 20px; height: 20px; background-color: red;
              border-radius: 50%; border: 2px solid white;
              box-shadow: 0 0 5px red; animation: blink 1s infinite;
            }
            @keyframes blink {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.5; }
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initializeMap() {
              if (typeof kakao === 'undefined' || !kakao.maps) {
                // console.error is not used to prevent Expo from showing a red screen.
                return;
              }

              const mapContainer = document.getElementById('map');
              const mapOption = {
                center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                level: 3,
              };

              const map = new kakao.maps.Map(mapContainer, mapOption);

              const customOverlay = new kakao.maps.CustomOverlay({
                position: map.getCenter(),
                content: '<div class="custom-overlay"></div>',
                xAnchor: 0.5,
                yAnchor: 0.5,
              });
              customOverlay.setMap(map);

              document.addEventListener('message', function(event) {
                try {
                  const message = JSON.parse(event.data);
                  if (message.type === 'recenter' && map) {
                    const { lat, lon } = message.payload;
                    const moveLatLon = new kakao.maps.LatLng(lat, lon);
                    map.setCenter(moveLatLon);
                    customOverlay.setPosition(moveLatLon);
                  }
                } catch (e) {
                  // console.error is not used to prevent Expo from showing a red screen.
                }
              });

              kakao.maps.event.addListener(map, 'idle', function() {
                const center = map.getCenter();
                const payload = {
                    latitude: center.getLat(),
                    longitude: center.getLng()
                };
                window.ReactNativeWebView.postMessage(
                    JSON.stringify({ type: 'center_changed', payload: payload })
                );
              });
            }

            if (typeof kakao !== 'undefined' && kakao.maps) {
                kakao.maps.load(initializeMap);
            }
          </script>
        </body>
      </html>
    `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'center_changed' && onCenterChangeCoordinates) {
              onCenterChangeCoordinates(data.payload);
            }
          } catch (e) {
            // console.error is not used to prevent Expo from showing a red screen.
          }
        }}      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default NewKakaoMap;