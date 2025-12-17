import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/usePosts";
import { Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Category = "confession" | "crush" | "meme" | "rant" | "compliment";

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "confession", label: "Confession", icon: "lock" },
  { key: "crush", label: "Crush", icon: "heart" },
  { key: "meme", label: "Meme", icon: "smile" },
  { key: "rant", label: "Rant", icon: "volume-2" },
  { key: "compliment", label: "Compliment", icon: "thumbs-up" },
];

const MAX_CHARS = 500;

const CategoryChip = ({
  category,
  selected,
  onPress,
}: {
  category: { key: Category; label: string; icon: string };
  selected: boolean;
  onPress: () => void;
}) => {
  const color = CategoryColors[category.key];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    scale.value = withSpring(0.9);
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    await Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.categoryChip,
          {
            backgroundColor: selected ? color : color + "20",
            borderColor: color,
            borderWidth: selected ? 0 : 1,
          },
          animatedStyle,
        ]}
      >
        <Feather
          name={category.icon as any}
          size={14}
          color={selected ? "#FFFFFF" : color}
        />
        <ThemedText
          style={[
            styles.categoryLabel,
            { color: selected ? "#FFFFFF" : color },
          ]}
        >
          {category.label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
};

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const createPost = useCreatePost();

  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [autoDeleteHours, setAutoDeleteHours] = useState<number | null>(null);

  const AUTO_DELETE_OPTIONS = [
    { label: "Never", value: null },
    { label: "1 Hour", value: 1 },
    { label: "6 Hours", value: 6 },
    { label: "12 Hours", value: 12 },
    { label: "24 Hours", value: 24 },
  ];

  const canPost = content.trim().length > 0 && selectedCategory !== null && !createPost.isPending;
  const charsLeft = MAX_CHARS - content.length;

  const handlePost = async () => {
    if (!canPost || !user || !selectedCategory) return;

    try {
      await createPost.mutateAsync({
        userId: user.id,
        content: content.trim(),
        category: selectedCategory,
        expiresInHours: autoDeleteHours || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </Pressable>
        <ThemedText type="h4">New Post</ThemedText>
        <Pressable
          onPress={handlePost}
          style={[
            styles.postButton,
            { backgroundColor: canPost ? theme.primary : theme.surface },
          ]}
          disabled={!canPost}
        >
          {createPost.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText
              style={[
                styles.postButtonText,
                { color: canPost ? "#FFFFFF" : theme.textTertiary },
              ]}
            >
              Post
            </ThemedText>
          )}
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.md }]}>
          Category
        </ThemedText>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category.key}
              category={category}
              selected={selectedCategory === category.key}
              onPress={() => setSelectedCategory(category.key)}
            />
          ))}
        </View>

        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          What's on your mind?
        </ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Share anonymously with your campus..."
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={MAX_CHARS}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
          <View style={styles.charCount}>
            <ThemedText
              style={[
                styles.charCountText,
                { color: charsLeft < 50 ? theme.downvote : theme.textTertiary },
              ]}
            >
              {charsLeft}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Auto-Delete
        </ThemedText>
        <View style={styles.autoDeleteContainer}>
          {AUTO_DELETE_OPTIONS.map((option) => (
            <Pressable
              key={option.label}
              onPress={() => setAutoDeleteHours(option.value)}
              style={[
                styles.autoDeleteOption,
                {
                  backgroundColor: autoDeleteHours === option.value ? theme.primary : theme.surface,
                },
              ]}
            >
              <ThemedText
                style={{
                  color: autoDeleteHours === option.value ? "#FFFFFF" : theme.text,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.anonymousBadge, { backgroundColor: theme.surface }]}>
          <Feather name="eye-off" size={16} color={theme.primary} />
          <ThemedText style={[styles.anonymousText, { color: theme.textSecondary }]}>
            Your identity will remain anonymous
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerButton: {
    padding: Spacing.xs,
  },
  postButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 60,
    alignItems: "center",
  },
  postButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionLabel: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 150,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 120,
  },
  charCount: {
    alignItems: "flex-end",
    marginTop: Spacing.sm,
  },
  charCountText: {
    fontSize: 12,
  },
  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  anonymousText: {
    fontSize: 13,
  },
  autoDeleteContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  autoDeleteOption: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
