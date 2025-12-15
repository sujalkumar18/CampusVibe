import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useCreateStory } from "@/hooks/useStories";
import { useAuth } from "@/hooks/useAuth";
import { useUpload } from "@/hooks/useUpload";

type Category = "confession" | "crush" | "meme" | "rant" | "compliment";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "confession", label: "Confession" },
  { key: "crush", label: "Crush" },
  { key: "meme", label: "Meme" },
  { key: "rant", label: "Rant" },
  { key: "compliment", label: "Compliment" },
];

const COLORS = [
  "#6C5CE7",
  "#FF6B9D",
  "#00B894",
  "#FFA502",
  "#00D2D3",
  "#1B4332",
  "#4A1942",
  "#1A365D",
];

export default function CreateStoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const createStory = useCreateStory();
  const uploadFile = useUpload();

  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [backgroundColor, setBackgroundColor] = useState(COLORS[0]);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const textTranslateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const canPost = (text.trim().length > 0 || mediaUri) && selectedCategory !== null && !isPosting;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = savedTranslateY.value + event.translationY;
      const maxY = SCREEN_HEIGHT * 0.3;
      const minY = -SCREEN_HEIGHT * 0.3;
      textTranslateY.value = Math.max(minY, Math.min(maxY, newY));
    })
    .onEnd(() => {
      savedTranslateY.value = textTranslateY.value;
    });

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
  }));

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
      videoMaxDuration: 30,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "image");
    }
  };

  const handlePost = async () => {
    if (!canPost || !user?.id) return;

    setIsPosting(true);
    try {
      let storyMediaUrl: string = backgroundColor;

      if (mediaUri) {
        const isVideo = mediaType === "video";
        const uploadResult = await uploadFile.mutateAsync({
          uri: mediaUri,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
          name: `story-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
        });
        storyMediaUrl = uploadResult.url;
      }

      await createStory.mutateAsync({
        userId: user.id,
        imageUrl: storyMediaUrl,
        caption: text.trim() || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert("Story Posted!", "Your anonymous story will be visible for 24 hours.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to post story. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    if (text.trim().length > 0 || mediaUri) {
      Alert.alert(
        "Discard Story?",
        "Are you sure you want to discard this story?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleClearMedia = () => {
    setMediaUri(null);
    setMediaType(null);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {mediaUri && mediaType === "image" && (
        <Image source={{ uri: mediaUri }} style={styles.backgroundMedia} contentFit="cover" />
      )}
      {mediaUri && mediaType === "video" && (
        <Video
          source={{ uri: mediaUri }}
          style={styles.backgroundMedia}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      )}

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={handleClose} style={styles.headerButton}>
          <Feather name="x" size={28} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={handlePost}
          style={[
            styles.postButton,
            {
              backgroundColor: canPost
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.1)",
            },
          ]}
          disabled={!canPost}
        >
          <ThemedText
            style={{
              color: canPost ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              fontWeight: "600",
            }}
          >
            {isPosting ? "Posting..." : "Share Story"}
          </ThemedText>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.contentContainer, animatedTextStyle]}>
          {selectedCategory && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: CategoryColors[selectedCategory] + "60" },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryBadgeText,
                  { color: CategoryColors[selectedCategory] },
                ]}
              >
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </ThemedText>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            placeholder="Type something..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
            textAlign="center"
          />
          
          <ThemedText style={styles.dragHint}>
            Drag to move text
          </ThemedText>
        </Animated.View>
      </GestureDetector>

      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.colorPicker}>
          {COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                setBackgroundColor(color);
                handleClearMedia();
              }}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                backgroundColor === color && !mediaUri && styles.colorSelected,
              ]}
            />
          ))}
        </View>

        <View style={styles.categoryPicker}>
          <ThemedText style={styles.categoryLabel}>Category:</ThemedText>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setSelectedCategory(cat.key);
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <ThemedText style={styles.categoryChipText}>
                    {cat.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={handlePickMedia} style={styles.actionButton}>
            <Feather name="image" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionText}>Add Photo/Video</ThemedText>
          </Pressable>
          {mediaUri && (
            <Pressable onPress={handleClearMedia} style={styles.clearButton}>
              <Feather name="x-circle" size={20} color="#FF6B6B" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  postButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  textInput: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    maxWidth: "100%",
    minWidth: 200,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dragHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: Spacing.md,
  },
  bottomControls: {
    paddingHorizontal: Spacing.md,
  },
  colorPicker: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  categoryPicker: {
    marginBottom: Spacing.lg,
  },
  categoryLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  clearButton: {
    padding: Spacing.sm,
  },
});
