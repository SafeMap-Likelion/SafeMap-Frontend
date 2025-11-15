import React from "react";
import { Button } from "@gluestack-ui/themed";
import { MaterialIcons } from "@expo/vector-icons";

interface MyLocationButtonProps {
  onPress: () => void;
}

const MyLocationButton: React.FC<MyLocationButtonProps> = ({ onPress }) => {
  return (
    <Button
      onPress={onPress}
      position="absolute"
      bottom={120}
      right={20}
      zIndex={10}
      width={50}
      height={50}
      borderRadius={"$full"}
      bg="$white"
      shadowColor="#000"
      shadowOpacity={0.1}
      shadowRadius={3}
    >
      <MaterialIcons name="my-location" size={24} color="#333" />
    </Button>
  );
};

export default MyLocationButton;
