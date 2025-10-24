import React from "react";
import { ScrollView } from "@gluestack-ui/themed";
import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import InfoBubble from "./components/InfoBubble";
import Header from "./components/Header";

export default function NewsDetailViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const newsData = {
    title: "관악구 봉천동 현대시장 인근 '안심가로등' 확대…주민 밤길 밝힌다",
    source: "헤럴드경제",
    date: "25. 9. 7 (일) 09:38",
    content: `[헤럴드경제=박종일 선임기자]관악구(구청장 박준희)는 사회복지법인 밀알복지재단이 주관, 한국수력원자력(주) 후원하는 ‘2025년 안심가로등 플러스 지원사업’ 공모에 최종 선정됐다.

안심가로등 플러스 사업은 유동인구가 많고 범죄 등 안전사고에 취약한 지역에 ‘첨단 스마트폴 안심가로등’을 조성해 밤길 주민 안전을 강화하는 사업이다. 앞서 구는 지난 2024년 공모사업에도 선정되어 신림역 일대에 안심가로등 20본을 설치했다.
올해 1, 2차 심사와 현장 조사를 거쳐 2년 연속 공모에 선정된 구는 봉천동 현대시장 인근 ‘최대 주거 밀집 지역’에 안심가로등 20본을 추가로 설치할 계획이다.

현대시장 일대 주거 단지에는 약 12,000세대가 거주하고 있고, 4개 학교와 시장이 인접해 있어 학생과 상인들이 실질 활동 인구에 해당한다. 야간에는 유동 인구가 적어 학생, 어르신 등 방범 취약계층의 보행 안전 강화를 위해 구는 해당 지역에 안심가로등 설치를 결정했다.
스마트폴 안심가로등은 밤거리를 밝히는 조명뿐만 아니라 ▲고해상도 폐쇄회로(CCTV) ▲비상벨 ▲이상 음원 감지장치 등 ‘사물인터넷(IoT) 기반 장치’가 탑재되어 있다. 위급 상황이 발생하면 관악구 통합관제센터와 연동된 폐쇄회로(CCTV)가 실시간으로 현장을 확인해 신속하게 대응할 수 있다. 원격 제어가 가능한 점멸기와 홍보용 전광판도 함께 설치된다.
박준희 관악구청장은 “지난해 신림 권역에 이어 올해 봉천 권역에도 주민들이 안심하고 다닐 수 있는 밤길을 만들어줄 안전 인프라를 확대할 예정”이라며 “앞으로도 취약계층을 비롯한 주민들의 생명과 안전을 지키기 위해 첨단 기술을 적극 활용하는 스마트 안전 도시 관악으로 나아가겠다”고 말했다.
`,
  };

  return (
    <Box flex={1} bg="$white">
      <Header title="'봉천동' 뉴스" />
      <InfoBubble location="봉천동" />

      {/* 스크롤 가능한 컨텐츠 */}
      <ScrollView mt={5} showsVerticalScrollIndicator={false}>
        <VStack px="$4" py="$4" space="md">
          {/* 메타 정보 */}
          <VStack space="xs">
            <Text fontFamily="Pretendard" fontSize={12} color="$textDark600">
              헤럴드경제
            </Text>

            {/* 제목 */}
            <Text
              fontFamily="Pretendard"
              fontSize={20}
              fontWeight="$bold"
              color="#000000"
              lineHeight={28}
            >
              {newsData.title}
            </Text>

            {/* 날짜 */}
            <Text fontFamily="Pretendard" fontSize={12} color="$textDark600">
              {newsData.date}
            </Text>
          </VStack>

          {/* 본문 내용 */}
          <Box mt="$4">
            <Text
              fontFamily="Pretendard"
              fontSize={14}
              color="#000000"
              lineHeight={22}
            >
              {newsData.content}
            </Text>
          </Box>
        </VStack>

        {/* 하단 여백 (네비게이션 바를 위한) */}
        <Box height={100} />
      </ScrollView>
    </Box>
  );
}
