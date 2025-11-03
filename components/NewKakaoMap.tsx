import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type KakaoMapProps = {
  latitude: number;
  longitude: number;
};

const NewKakaoMap = forwardRef(({ latitude, longitude }: KakaoMapProps, ref) => {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    recenter: (lat: number, lon: number) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'recenter', payload: { lat, lon } }));
      }
    },
  }));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY}&libraries=services"></script>
        <style>
          body { margin: 0; padding: 0; height: 100%; }
          html { height: 100%; }
          #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          window.onload = function() {
            console.log('Kakao Map API Loaded');
            if (typeof kakao !== 'undefined' && kakao.maps) {
              console.log('Kakao Maps is available');
              const mapContainer = document.getElementById('map');
              const mapOption = {
                center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                level: 3
              };
              map = new kakao.maps.Map(mapContainer, mapOption);

              const markerPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
              const marker = new kakao.maps.Marker({
                position: markerPosition
              });
              marker.setMap(map);
            } else {
              console.error('Kakao Maps is not available');
            }
          };

          // Event listener for messages from React Native
          document.addEventListener('message', function(event) {
            try {
              const message = JSON.parse(event.data);
              if (message.type === 'recenter' && map) {
                const { lat, lon } = message.payload;
                const moveLatLon = new kakao.maps.LatLng(lat, lon);
                map.setCenter(moveLatLon);
              }
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          });

          // 기존의 console.log를 webview로 전달하는 코드
          window.console.log = function(message) {
            window.ReactNativeWebView.postMessage(message);
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
        onLoad={() => console.log('WebView loaded successfully')}
        onError={(e) => console.error('WebView error: ', e.nativeEvent)}
        onMessage={(event) => {
          // Messages from WebView's console.log
          console.log(event.nativeEvent.data);
        }}
      />
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
