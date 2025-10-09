// import { useSignIn } from "@clerk/clerk-expo";
// import { useRouter } from "expo-router";
// import { Text, TextInput, TouchableOpacity, View } from "react-native";
// import React from "react";

// export function SignIn({ onSignUpPress }: { onSignUpPress: () => void }) {
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const router = useRouter();

//   const [emailAddress, setEmailAddress] = React.useState("");
//   const [password, setPassword] = React.useState("");

//   // Handle the submission of the sign-in form
//   const onSignInPress = async () => {
//     if (!isLoaded) return;

//     // Start the sign-in process using the email and password provided
//     try {
//       const signInAttempt = await signIn.create({
//         identifier: emailAddress,
//         password,
//       });

//       // If sign-in process is complete, set the created session as active
//       // and redirect the user
//       if (signInAttempt.status === "complete") {
//         await setActive({ session: signInAttempt.createdSessionId });
//         router.replace("/(main)");
//       } else {
//         // If the status isn't complete, check why. User might need to
//         // complete further steps.
//         console.error(JSON.stringify(signInAttempt, null, 2));
//       }
//     } catch (err) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       console.error(JSON.stringify(err, null, 2));
//     }
//   };

//   return (
//     <View>
//       <Text>Sign in</Text>
//       <TextInput
//         autoCapitalize="none"
//         value={emailAddress}
//         placeholder="Enter email"
//         onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
//       />
//       <TextInput
//         value={password}
//         placeholder="Enter password"
//         secureTextEntry={true}
//         onChangeText={(password) => setPassword(password)}
//       />
//       <TouchableOpacity onPress={onSignInPress}>
//         <Text>Continue</Text>
//       </TouchableOpacity>
//       <View style={{ display: "flex", flexDirection: "row", gap: 3 }}>
//         <Text>Don't have an account?</Text>
//         <TouchableOpacity onPress={onSignUpPress}>
//           <Text>Sign up</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// SignIn.tsx
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Box,
  VStack,
  Input,
  InputField,
  Button,
  ButtonText,
} from "@gluestack-ui/themed";

export function SignIn({ onSignUpPress }: { onSignUpPress: () => void }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(main)");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <VStack w="70%" space="md">
      <Input bg="#f5f5f5" borderWidth={0} borderRadius="$full" px="$4">
        <InputField
          placeholder="ID"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={(text) => setEmailAddress(text)}
          color="#555"
          placeholderTextColor="#999"
        />
      </Input>

      <Input bg="#f5f5f5" borderWidth={0} borderRadius="$full" h={45} px="$4">
        <InputField
          placeholder="PW"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
          color="#555"
          placeholderTextColor="#999"
        />
      </Input>

      {/* 로그인 버튼 */}
      <Button
        bg="#0095ff"
        borderRadius="$full"
        h={45}
        mt="$2"
        onPress={onSignInPress}
        $active-bg="#007ae0"
      >
        <ButtonText color="$white" fontWeight="$semibold">
          로그인
        </ButtonText>
      </Button>

      {/* 회원가입 안내 */}
      <Box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        mt="$3"
      >
        <Text style={{ color: "#666" }}>계정이 없으신가요? </Text>
        <Text
          style={{ color: "#0095ff", fontWeight: "600" }}
          onPress={onSignUpPress}
        >
          회원가입
        </Text>
      </Box>
    </VStack>
  );
}
