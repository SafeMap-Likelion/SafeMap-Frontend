import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { NearEvent } from "@/api/types";

// 컴포넌트 Props 타입 정의
type KakaoMapProps = {
  latitude: number;
  longitude: number;
  nearEvents?: NearEvent[];
  onCenterChangeCoordinates?: (coords: {
    latitude: number;
    longitude: number;
  }) => void;
  onMarkerClick?: (reportId: string) => void;
};

// 부모 컴포넌트에서 호출할 수 있는 함수 타입 정의
export interface MapRef {
  recenter: (lat: number, lon: number) => void;
}

// forwardRef의 타입 문제를 수정한 컴포넌트 정의
const NewKakaoMap = forwardRef<MapRef, KakaoMapProps>((props, ref) => {
  const {
    latitude,
    longitude,
    nearEvents = [],
    onCenterChangeCoordinates,
    onMarkerClick,
  } = props;
  const webViewRef = useRef<WebView>(null);

  // 부모 컴포넌트에서 ref를 통해 recenter 함수를 호출할 수 있도록 설정
  useImperativeHandle(ref, () => ({
    recenter: (lat: number, lon: number) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: "recenter", payload: { lat, lon } })
        );
      }
    },
  }));

  // nearEvents가 변경될 때 WebView에 업데이트 메시지 전송
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "updateMarkers", payload: nearEvents })
      );
    }
  }, [nearEvents]);

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
            .event-marker {
              width: 40px;
              height: 40px;
              cursor: pointer;
            }
            .event-marker img {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map = null;
            let centerMarker = null;
            let eventMarkers = [];

            // type 매핑
            const typeMapping = {
              '교통': 'traffic',
              '범죄/치안': 'crime',
              '시설/인프라': 'infra',
              '화재/폭발': 'fire',
              '자연 재해': 'nature',
              '기타/특수': 'etc'
            };

            // level 매핑
            const levelMapping = {
              1: 'low',
              2: 'mid',
              3: 'high'
            };

            // GitHub에서 SVG 마커 가져오기
            const markerSvgs = {
              'traffic_low': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/traffic_low.svg',
              'traffic_mid': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/traffic_mid.svg',
              'traffic_high': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/traffic_high.svg',
              'crime_low': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/crime_low.svg',
              'crime_mid': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/crime_mid.svg',
              'crime_high': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/crime_high.svg',
              'infra_low': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/infra_low.svg',
              'infra_mid': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/infra_mid.svg',
              'infra_high': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/infra_high.svg',
              'fire_low': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/fire_low.svg',
              'fire_mid': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/fire_mid.svg',
              'fire_high': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/fire_high.svg',
              'nature_low': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/nature_low.svg',
              'nature_mid': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/nature_mid.svg',
              'nature_high': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/nature_high.svg',
              'etc_low': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/etc_low.svg',
              'etc_mid': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/etc_mid.svg',
              'etc_high': 'https://raw.githubusercontent.com/SafeMap-Likelion/SafeMap-Frontend/hyukjun_wrapup/assets/markers/etc_high.svg'
            };

            function initializeMap() {
              if (typeof kakao === 'undefined' || !kakao.maps) {
                return;
              }

              const mapContainer = document.getElementById('map');
              const mapOption = {
                center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                level: 3,
              };

              map = new kakao.maps.Map(mapContainer, mapOption);

              // 중앙 빨간 마커
              centerMarker = new kakao.maps.CustomOverlay({
                position: map.getCenter(),
                content: '<div class="custom-overlay"></div>',
                xAnchor: 0.5,
                yAnchor: 0.5,
              });
              centerMarker.setMap(map);

              // 초기 이벤트 마커 생성
              const initialEvents = ${JSON.stringify(nearEvents)};
              updateEventMarkers(initialEvents);

              document.addEventListener('message', function(event) {
                try {
                  const message = JSON.parse(event.data);
                  if (message.type === 'recenter' && map) {
                    const { lat, lon } = message.payload;
                    const moveLatLon = new kakao.maps.LatLng(lat, lon);
                    map.setCenter(moveLatLon);
                    centerMarker.setPosition(moveLatLon);
                  }
                  if (message.type === 'updateMarkers') {
                    updateEventMarkers(message.payload);
                  }
                } catch (e) {
                  // Error handling
                }
              });

              // 이벤트 마커 업데이트 함수
              function updateEventMarkers(events) {
                // 기존 마커 제거
                eventMarkers.forEach(marker => marker.setMap(null));
                eventMarkers = [];

                // 새 마커 생성
                events.forEach(event => {
                  const position = new kakao.maps.LatLng(
                    parseFloat(event.latitude),
                    parseFloat(event.longitude)
                  );

                  // type과 level에 따라 마커 아이콘 선택
                  const typeKey = typeMapping[event.type] || 'etc';
                  const levelKey = levelMapping[event.level] || 'mid';
                  const markerKey = \`\${typeKey}_\${levelKey}\`;
                  const markerUrl = markerSvgs[markerKey];

                  // DOM 요소 생성
                  const markerDiv = document.createElement('div');
                  markerDiv.className = 'event-marker';
                  markerDiv.setAttribute('data-report-id', event.report_id);
                  markerDiv.innerHTML = \`<img src="\${markerUrl}" alt="\${event.type} \${event.level}" />\`;

                  // 클릭 이벤트 추가
                  markerDiv.addEventListener('click', function() {
                    const reportId = this.getAttribute('data-report-id');
                    if (reportId && window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: 'marker_clicked', payload: { reportId: reportId } })
                      );
                    }
                  });

                  const marker = new kakao.maps.CustomOverlay({
                    position: position,
                    content: markerDiv,
                    xAnchor: 0.5,
                    yAnchor: 1.0,
                  });

                  marker.setMap(map);
                  eventMarkers.push(marker);
                });
              }

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
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "center_changed" && onCenterChangeCoordinates) {
              onCenterChangeCoordinates(data.payload);
            }
            if (data.type === "marker_clicked" && onMarkerClick) {
              onMarkerClick(data.payload.reportId);
            }
          } catch (e) {
            // console.error is not used to prevent Expo from showing a red screen.
          }
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
