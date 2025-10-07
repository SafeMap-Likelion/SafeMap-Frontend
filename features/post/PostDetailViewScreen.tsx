//개별 사건 게시물 상세 화면
import React from 'react';
import PostView from '../../components/PostView';
import {
  Box,
  HStack,
  Heading,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';

/**
 * 개별 사건 게시물 상세 화면입니다.
 */
export default function PostDetailViewScreen() {
  return (
    <Box flex={1} bg="$white" pt="$10">
      {/* Header */}
      <HStack
        p="$4"
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderLight200"
      >
        <Heading>집주변</Heading>
        <Button size="sm" action="secondary">
          <ButtonText>'봉천동' 뉴스보러가기</ButtonText>
        </Button>
      </HStack>

      {/* Content */}
      <Box flex={1}>
        <PostView />
      </Box>
    </Box>
  );
}