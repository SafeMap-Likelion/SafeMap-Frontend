//Main 지도 화면
//화면 위에 조건부 PostDetailViewScreen 모달 렌더링(botton-up slide animation)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import KakaoMap from "@/components/KakaoMap";
import Geolocation from '@/components/Geolocation';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <KakaoMap />
      <View style={styles.overlay}>
        <Geolocation />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 60, // Adjust this value as needed
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Added for readability
    padding: 10,
    borderRadius: 5,
  },
});
