import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Category = "confession" | "crush" | "meme" | "rant" | "compliment";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "confession", label: "Confession" },
  { key: "crush", label: "Crush" },
  { key: "meme", label: "Meme" },
  { key: "rant", label: "Rant" },
  { key: "compliment", label: "Compliment" },
];

export default function CreateReelScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");

  const recordScale = useSharedValue(1);
  const recordOpacity = useSharedValue(1);

  const animatedRecordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordScale.value }],
    opacity: recordOpacity.value,
  }));

  const handleStartRecording = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);
    recordScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1
    );
  };

  const handleStopRecording = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(false);
    recordScale.value = withSpring(1);
    setHasVideo(true);
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60,
      quality: 0.8,
    });

    if (!result.canceled) {
      setHasVideo(true);
    }
  };

  const handlePost = async () => {
    if (!hasVideo || !selectedCategory) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert("Posted!", "Your anonymous reel has been shared with the campus.", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleClose = () => {
    if (hasVideo) {
      Alert.alert(
        "Discard Reel?",
        "Are you sure you want to discard this reel?",
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

  if (hasVideo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">Add Details</ThemedText>
          <Pressable
            onPress={handlePost}
            style={[
              styles.postButton,
              {
                backgroundColor:
                  selectedCategory ? theme.primary : theme.surface,
              },
            ]}
            disabled={!selectedCategory}
          >
            <ThemedText
              style={{
                color: selectedCategory ? "#FFFFFF" : theme.textTertiary,
                fontWeight: "600",
              }}
            >
              Post
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.previewContainer}>
          <View style={[styles.videoPreview, { backgroundColor: "#2D1B69" }]}>
            <Feather name="play-circle" size={48} color="rgba(255,255,255,0.5)" />
            <ThemedText style={styles.previewText}>Video Preview</ThemedText>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Category
          </ThemedText>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const color = CategoryColors[cat.key];
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? color : color + "20",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      { color: isSelected ? "#FFFFFF" : color },
                    ]}
                  >
                    {cat.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Description (optional)
          </ThemedText>
          <TextInput
            style={[
              styles.descriptionInput,
              { backgroundColor: theme.surface, color: theme.text },
            ]}
            placeholder="Add a description..."
            placeholderTextColor={theme.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={150}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <View style={[styles.cameraOverlay, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.topControls}>
          <Pressable onPress={handleClose} style={styles.controlButton}>
            <Feather name="x" size={28} color="#FFFFFF" />
          </Pressable>
          <View style={styles.topRight}>
            <Pressable style={styles.controlButton}>
              <Feather name="zap" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.cameraPlaceholder}>
        <Feather name="video" size={64} color="rgba(255,255,255,0.3)" />
        <ThemedText style={styles.placeholderText}>
          {Platform.OS === "web"
            ? "Camera not available on web"
            : "Camera preview"}
        </ThemedText>
        {Platform.OS === "web" && (
          <ThemedText style={styles.placeholderSubtext}>
            Use Expo Go on your phone to record videos
          </ThemedText>
        )}
      </View>

      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable onPress={handlePickVideo} style={styles.sideButton}>
          <Feather name="image" size={28} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPressIn={handleStartRecording}
          onPressOut={handleStopRecording}
          style={styles.recordButtonOuter}
        >
          <Animated.View
            style={[
              styles.recordButtonInner,
              {
                backgroundColor: isRecording ? "#FF3E4D" : "#FFFFFF",
                borderRadius: isRecording ? 8 : 32,
              },
              animatedRecordStyle,
            ]}
          />
        </Pressable>

        <Pressable style={styles.sideButton}>
          <Feather name="refresh-cw" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.timerContainer}>
        <ThemedText style={styles.timerText}>
          {isRecording ? "Recording..." : "Hold to record (max 60s)"}
        </ThemedText>
      </View>
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
    paddingBottom: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  postButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  topRight: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.5)",
    marginTop: Spacing.md,
    fontSize: 16,
  },
  placeholderSubtext: {
    color: "rgba(255,255,255,0.3)",
    marginTop: Spacing.xs,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl * 2,
  },
  sideButton: {
    padding: Spacing.sm,
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonInner: {
    width: 64,
    height: 64,
  },
  timerContainer: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timerText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  previewContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  videoPreview: {
    height: 200,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    color: "rgba(255,255,255,0.5)",
    marginTop: Spacing.sm,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
