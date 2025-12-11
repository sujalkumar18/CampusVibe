import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useStories, Story as APIStory } from "@/hooks/useStories";

const { width, height } = Dimensions.get("window");

type Story = {
  id: string;
  category: "confession" | "crush" | "meme" | "rant" | "compliment";
  content: string;
  timeRemaining: string;
  backgroundColor: string;
  viewed: boolean;
};

const BACKGROUND_COLORS = [
  "#6C5CE7", "#FF6B9D", "#00B894", "#FFA502", "#00D2D3", "#1B4332", "#4A1942", "#1A365D"
];

const getTimeRemaining = (expiresAt: string): string => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h left`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m left`;
};

const mapAPIStoryToStory = (apiStory: APIStory, index: number): Story => ({
  id: apiStory.id,
  category: "confession",
  content: apiStory.caption || "Story",
  timeRemaining: getTimeRemaining(apiStory.expiresAt),
  backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
  viewed: false,
});

const StoryRing = ({
  story,
  onPress,
}: {
  story: Story;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const categoryColor = CategoryColors[story.category];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.storyRing,
            {
              borderColor: story.viewed ? theme.textTertiary : categoryColor,
            },
          ]}
        >
          <View
            style={[
              styles.storyInner,
              { backgroundColor: story.backgroundColor },
            ]}
          >
            <Feather name="user" size={24} color="#FFFFFF" />
          </View>
        </View>
        <ThemedText
          style={[styles.storyLabel, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          Anonymous
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
};

const StoryViewer = ({
  stories,
  initialIndex,
  visible,
  onClose,
}: {
  stories: Story[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progress = useSharedValue(0);
  const translateX = useSharedValue(0);

  const currentStory = stories[currentIndex];
  const categoryColor = CategoryColors[currentStory?.category] || Colors.dark.primary;

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      progress.value = 0;
      progress.value = withTiming(1, { duration: 5000 });
    }
  }, [visible, initialIndex]);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 5000 });
  }, [currentIndex]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTap = (x: number) => {
    if (x < width / 3) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  const tap = Gesture.Tap().onEnd((event) => {
    runOnJS(handleTap)(event.x);
  });

  if (!currentStory) return null;

  const categoryLabels: Record<string, string> = {
    confession: "Confession",
    crush: "Crush",
    meme: "Meme",
    rant: "Rant",
    compliment: "Compliment",
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <GestureDetector gesture={tap}>
        <View
          style={[
            styles.storyViewer,
            { backgroundColor: currentStory.backgroundColor },
          ]}
        >
          <View style={[styles.storyHeader, { top: insets.top + Spacing.sm }]}>
            <View style={styles.progressContainer}>
              {stories.map((_, index) => (
                <View key={index} style={styles.progressBackground}>
                  {index === currentIndex ? (
                    <Animated.View
                      style={[styles.progressFill, progressStyle]}
                    />
                  ) : index < currentIndex ? (
                    <View style={[styles.progressFill, { width: "100%" }]} />
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.storyHeaderRow}>
              <View style={styles.storyUserInfo}>
                <View
                  style={[
                    styles.storyAvatar,
                    { backgroundColor: categoryColor + "60" },
                  ]}
                >
                  <Feather name="user" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <ThemedText style={styles.storyUsername}>Anonymous</ThemedText>
                  <ThemedText style={styles.storyTime}>
                    {currentStory.timeRemaining}
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.storyContent}>
            <View
              style={[
                styles.storyCategoryBadge,
                { backgroundColor: categoryColor + "40" },
              ]}
            >
              <ThemedText style={[styles.storyCategoryText, { color: categoryColor }]}>
                {categoryLabels[currentStory.category]}
              </ThemedText>
            </View>
            <ThemedText style={styles.storyText}>{currentStory.content}</ThemedText>
          </View>
        </View>
      </GestureDetector>
    </Modal>
  );
};

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabBarHeight = 60 + insets.bottom;

  const { data, isLoading, refetch } = useStories();
  const stories: Story[] = (data?.stories || []).map(mapAPIStoryToStory);

  const handleStoryPress = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };

  const handleAddStory = () => {
    navigation.navigate("CreateStory");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText type="h2">Stories</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesRow}
        >
          <Pressable onPress={handleAddStory}>
            <View style={[styles.addStoryButton, { borderColor: theme.primary }]}>
              <View style={[styles.addStoryInner, { backgroundColor: theme.surface }]}>
                <Feather name="plus" size={24} color={theme.primary} />
              </View>
            </View>
            <ThemedText style={[styles.storyLabel, { color: theme.primary }]}>
              Add Story
            </ThemedText>
          </Pressable>

          {isLoading ? (
            <ThemedText style={{ color: theme.textSecondary, marginLeft: Spacing.md }}>
              Loading...
            </ThemedText>
          ) : stories.length === 0 ? (
            <ThemedText style={{ color: theme.textSecondary, marginLeft: Spacing.md }}>
              No stories yet. Be the first!
            </ThemedText>
          ) : (
            stories.map((story, index) => (
              <StoryRing
                key={story.id}
                story={story}
                onPress={() => handleStoryPress(index)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.recentSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Stories
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Tap on a story to view before it disappears
          </ThemedText>
        </View>

        {isLoading ? (
          <ThemedText style={{ color: theme.textSecondary, textAlign: 'center', padding: Spacing.lg }}>
            Loading stories...
          </ThemedText>
        ) : stories.length === 0 ? (
          <ThemedText style={{ color: theme.textSecondary, textAlign: 'center', padding: Spacing.lg }}>
            No stories yet. Create the first story!
          </ThemedText>
        ) : (
          stories.map((story, index) => (
            <Pressable
              key={story.id}
              onPress={() => handleStoryPress(index)}
              style={({ pressed }) => [
                styles.storyListItem,
                {
                  backgroundColor: theme.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.storyListAvatar,
                  { backgroundColor: story.backgroundColor },
                ]}
              >
                <Feather name="user" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.storyListContent}>
                <View style={styles.storyListHeader}>
                  <View
                    style={[
                      styles.miniCategoryChip,
                      { backgroundColor: CategoryColors[story.category] + "33" },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.miniCategoryText,
                        { color: CategoryColors[story.category] },
                      ]}
                    >
                      {story.category}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.timeRemaining, { color: theme.textTertiary }]}>
                    {story.timeRemaining}
                  </ThemedText>
                </View>
                <ThemedText numberOfLines={2} style={styles.storyPreview}>
                  {story.content}
                </ThemedText>
              </View>
              {!story.viewed && (
                <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
              )}
            </Pressable>
          ))
        )}
      </ScrollView>

      <StoryViewer
        stories={stories}
        initialIndex={selectedIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  storiesRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  storyInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  storyLabel: {
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.xs,
    width: 68,
  },
  addStoryButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addStoryInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  recentSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  storyListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  storyListAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  storyListContent: {
    flex: 1,
  },
  storyListHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  miniCategoryChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  miniCategoryText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  timeRemaining: {
    fontSize: 11,
  },
  storyPreview: {
    fontSize: 13,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storyViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storyHeader: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  storyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  storyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  storyUsername: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  storyTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  storyContent: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  storyCategoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  storyCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  storyText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
