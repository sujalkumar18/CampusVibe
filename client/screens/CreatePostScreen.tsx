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
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
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
  const [images, setImages] = useState<string[]>([]);

  const canPost = content.trim().length > 0 && selectedCategory !== null && !createPost.isPending;
  const charsLeft = MAX_CHARS - content.length;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset: { uri: string }) => asset.uri);
      setImages([...images, ...newImages].slice(0, 4));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!canPost || !user || !selectedCategory) return;

    try {
      await createPost.mutateAsync({
        userId: user.id,
        content: content.trim(),
        category: selectedCategory,
        imageUrl: images.length > 0 ? images[0] : undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  const handleCreateReel = () => {
    navigation.replace("CreateReel");
  };

  const handleCreateStory = () => {
    navigation.replace("CreateStory");
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
        <View style={styles.typeSelector}>
          <Pressable
            onPress={handleCreateReel}
            style={[styles.typeButton, { backgroundColor: theme.surface }]}
          >
            <Feather name="film" size={18} color={theme.primary} />
            <ThemedText style={[styles.typeLabel, { color: theme.primary }]}>
              Create Reel
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={handleCreateStory}
            style={[styles.typeButton, { backgroundColor: theme.surface }]}
          >
            <Feather name="clock" size={18} color={theme.primary} />
            <ThemedText style={[styles.typeLabel, { color: theme.primary }]}>
              Add Story
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
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

        {images.length > 0 && (
          <View style={styles.imagesGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <Pressable
                  onPress={() => handleRemoveImage(index)}
                  style={styles.removeImageButton}
                >
                  <Feather name="x" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handlePickImage}
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            disabled={images.length >= 4}
          >
            <Feather
              name="image"
              size={20}
              color={images.length >= 4 ? theme.textTertiary : theme.primary}
            />
            <ThemedText
              style={[
                styles.actionLabel,
                { color: images.length >= 4 ? theme.textTertiary : theme.text },
              ]}
            >
              Add Photo
            </ThemedText>
          </Pressable>
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
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  imageWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.sm,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionLabel: {
    fontSize: 14,
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
});
