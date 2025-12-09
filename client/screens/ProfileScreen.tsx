import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  Layout,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

type ContentType = "posts" | "reels" | "stories";

type UserPost = {
  id: string;
  type: "post" | "reel" | "story";
  content: string;
  category: string;
  upvotes: number;
  timeAgo: string;
};

const MOCK_USER_POSTS: UserPost[] = [
  {
    id: "1",
    type: "post",
    content: "Finally confessed to my crush in library yesterday...",
    category: "confession",
    upvotes: 156,
    timeAgo: "2h ago",
  },
  {
    id: "2",
    type: "post",
    content: "WiFi in hostel is slower than my will to attend 8 AM lectures",
    category: "meme",
    upvotes: 342,
    timeAgo: "5h ago",
  },
  {
    id: "3",
    type: "reel",
    content: "When professor says 'This won't be on the exam'...",
    category: "meme",
    upvotes: 1234,
    timeAgo: "1d ago",
  },
  {
    id: "4",
    type: "story",
    content: "I secretly water the plants in the common room...",
    category: "confession",
    upvotes: 89,
    timeAgo: "2d ago",
  },
];

const SegmentedControl = ({
  options,
  selected,
  onChange,
}: {
  options: { key: ContentType; label: string; icon: string }[];
  selected: ContentType;
  onChange: (key: ContentType) => void;
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.segmentedControl, { backgroundColor: theme.surface }]}>
      {options.map((option) => {
        const isSelected = selected === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.segmentOption,
              isSelected && {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Feather
              name={option.icon as any}
              size={18}
              color={isSelected ? "#FFFFFF" : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.segmentLabel,
                { color: isSelected ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

const PostItem = ({
  post,
  onDelete,
}: {
  post: UserPost;
  onDelete: () => void;
}) => {
  const { theme } = useTheme();
  const categoryColor = CategoryColors[post.category] || theme.primary;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete();
          },
        },
      ]
    );
  };

  const typeIcon = post.type === "post" ? "file-text" : post.type === "reel" ? "film" : "clock";

  return (
    <Animated.View
      entering={FadeIn}
      layout={Layout.springify()}
      style={animatedStyle}
    >
      <View style={[styles.postItem, { backgroundColor: theme.surface }]}>
        <View style={styles.postItemHeader}>
          <View style={styles.postItemLeft}>
            <View style={[styles.typeIcon, { backgroundColor: categoryColor + "20" }]}>
              <Feather name={typeIcon} size={14} color={categoryColor} />
            </View>
            <View
              style={[
                styles.miniCategory,
                { backgroundColor: categoryColor + "20" },
              ]}
            >
              <ThemedText
                style={[styles.miniCategoryText, { color: categoryColor }]}
              >
                {post.category}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.postTime, { color: theme.textTertiary }]}>
            {post.timeAgo}
          </ThemedText>
        </View>

        <ThemedText numberOfLines={2} style={styles.postContent}>
          {post.content}
        </ThemedText>

        <View style={styles.postItemFooter}>
          <View style={styles.statsRow}>
            <Feather name="arrow-up" size={14} color={theme.upvote} />
            <ThemedText style={[styles.statsText, { color: theme.textSecondary }]}>
              {post.upvotes}
            </ThemedText>
          </View>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Feather name="trash-2" size={16} color={theme.downvote} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [contentType, setContentType] = useState<ContentType>("posts");
  const [posts, setPosts] = useState(MOCK_USER_POSTS);
  const tabBarHeight = 60 + insets.bottom;

  const filteredPosts = posts.filter((post) => {
    if (contentType === "posts") return post.type === "post";
    if (contentType === "reels") return post.type === "reel";
    return post.type === "story";
  });

  const handleDeletePost = (postId: string) => {
    setPosts((current) => current.filter((p) => p.id !== postId));
  };

  const stats = {
    posts: posts.filter((p) => p.type === "post").length,
    reels: posts.filter((p) => p.type === "reel").length,
    stories: posts.filter((p) => p.type === "story").length,
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText type="h2">Your Posts</ThemedText>
        <Pressable style={styles.settingsButton}>
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Feather name="user" size={32} color="#FFFFFF" />
          </View>
          <ThemedText type="h3" style={styles.username}>
            Anonymous User
          </ThemedText>
          <ThemedText style={[styles.bio, { color: theme.textSecondary }]}>
            Your identity is protected
          </ThemedText>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="h3">{stats.posts}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Posts
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <ThemedText type="h3">{stats.reels}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Reels
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <ThemedText type="h3">{stats.stories}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Stories
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.segmentWrapper}>
          <SegmentedControl
            options={[
              { key: "posts", label: "Posts", icon: "file-text" },
              { key: "reels", label: "Reels", icon: "film" },
              { key: "stories", label: "Stories", icon: "clock" },
            ]}
            selected={contentType}
            onChange={setContentType}
          />
        </View>

        <View style={styles.postsList}>
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather
                name={contentType === "posts" ? "file-text" : contentType === "reels" ? "film" : "clock"}
                size={48}
                color={theme.textTertiary}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                No {contentType} yet
              </ThemedText>
              <ThemedText
                style={[styles.emptySubtext, { color: theme.textTertiary }]}
              >
                Your anonymous {contentType} will appear here
              </ThemedText>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
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
    paddingBottom: Spacing.sm,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  profileCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  username: {
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  segmentWrapper: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  postsList: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  postItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  postItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  postItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCategory: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  miniCategoryText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  postTime: {
    fontSize: 11,
  },
  postContent: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  postItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statsText: {
    fontSize: 13,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
});
