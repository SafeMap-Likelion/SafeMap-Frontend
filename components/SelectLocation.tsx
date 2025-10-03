import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ListRenderItemInfo, // FlatList의 item 타입을 위해 import
} from 'react-native';

// 검색에 사용될 더미 데이터 (실제로는 API를 통해 가져옵니다)
const DUMMY_DATA: string[] = [
  '서울특별시 종로구 부암동',
  '서울특별시 종로구 평창동',
  '서울특별시 종로구 숭인동',
  '서울특별시 종로구 창신동',
  '서울특별시 강남구 역삼동',
  '서울특별시 강남구 논현동',
  '서울특별시 마포구 서교동',
  '서울특별시 마포구 합정동',
  '부산광역시 해운대구 우동',
  '부산광역시 해운대구 좌동',
];

const AddressSearch: React.FC = () => {
  // 1. 상태 관리 (State) 타입 지정
  const [searchQuery, setSearchQuery] = useState<string>('서울특별시');
  const [filteredData, setFilteredData] = useState<string[]>([]);

  // 2. 핵심 로직: 함수의 매개변수 타입 지정
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = DUMMY_DATA.filter((item: string) => {
        return item.includes(text);
      });
      setFilteredData(newData);
    } else {
      setFilteredData([]);
    }
  };

  const handleSelectItem = (item: string) => {
    setSearchQuery(item);
    setFilteredData([]);
    console.log('선택된 주소:', item);
  };
  
  useEffect(() => {
    handleSearch('서울특별시');
  }, []);
  
  // FlatList의 renderItem 함수 타입 지정
  const renderItem = ({ item }: ListRenderItemInfo<string | null>) => {
    if (!item) {
      return <View style={styles.listItem} />;
    }
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleSelectItem(item)}
      >
        <Text style={styles.listText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  let displayData: (string | null)[];

  if (filteredData.length < 4) {
    const padded: (string | null)[] = [...filteredData];
    while (padded.length < 4) {
      padded.push(null);
    }
    displayData = padded;
  } else {
    displayData = filteredData;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.componentContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={handleSearch}
          value={searchQuery}
          placeholder="주소를 입력하세요..."
        />

        <View style={styles.listContainer}>
          <FlatList
            data={displayData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// 3. 스타일링 (StyleSheet)
const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  componentContainer: {
    width: '100%',
    padding: 20,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    height: 50,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  listText: {
    fontSize: 16,
  },
});

export default AddressSearch;