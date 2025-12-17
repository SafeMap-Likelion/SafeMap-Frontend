import React from 'react';
import EventAlarm from '../../components/EventAlarm';
import { Box } from '@gluestack-ui/themed';

/**
 * 게시물 작성 화면입니다.
 */
export default function PostCreateScreen() {
  return (
    <Box flex={1}>
      <EventAlarm />
    </Box>
  );
}
