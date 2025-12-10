import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  FadeIn,
  Layout,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useUserPosts, useDeletePost, type Post } from "@/hooks/usePosts";
import { Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const PostItem = ({
  post,
  onDelete,
  isDeleting,
}: {
  post: Post;
  onDelete: () => void;
  isDeleting: boolean;
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
              <Feather name="file-text" size={14} color={categoryColor} />
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
            {formatTimeAgo(post.createdAt)}
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
            <Feather name="message-circle" size={14} color={theme.textSecondary} style={{ marginLeft: 12 }} />
            <ThemedText style={[styles.statsText, { color: theme.textSecondary }]}>
              {post.commentCount}
            </ThemedText>
          </View>
          <Pressable onPress={handleDelete} style={styles.deleteButton} disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={theme.downvote} />
            ) : (
              <Feather name="trash-2" size={16} color={theme.downvote} />
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useUserPosts(user?.id);
  const deletePostMutation = useDeletePost();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const tabBarHeight = 60 + insets.bottom;

  const posts = data?.posts || [];

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    setDeletingId(postId);
    try {
      await deletePostMutation.mutateAsync({ postId, userId: user.id });
      refetch();
    } catch (error) {
      console.error("Failed to delete post:", error);
      Alert.alert("Error", "Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
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
              <ThemedText type="h3">{posts.length}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Posts
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.postsList}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="file-text" size={48} color={theme.textTertiary} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                No posts yet
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                Your anonymous posts will appear here
              </ThemedText>
            </View>
          ) : (
            posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onDelete={() => handleDeletePost(post.id)}
                isDeleting={deletingId === post.id}
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
  postsList: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  postItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
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
  loadingState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
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
