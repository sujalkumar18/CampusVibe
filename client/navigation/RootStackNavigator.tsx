import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import CreatePostScreen from "@/screens/CreatePostScreen";
import CreatePollScreen from "@/screens/CreatePollScreen";
import CreateStoryScreen from "@/screens/CreateStoryScreen";
import PostDetailScreen from "@/screens/PostDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  CreatePost: undefined;
  CreatePoll: undefined;
  CreateStory: undefined;
  PostDetail: { postId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreatePoll"
        component={CreatePollScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateStory"
        component={CreateStoryScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerTitle: "Post",
        }}
      />
    </Stack.Navigator>
  );
}
