import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { usePost, useVote, useDeletePost } from "@/hooks/usePosts";
import { useComments, useCreateComment, type Comment } from "@/hooks/useComments";
import { Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNavigation } from "@react-navigation/native";

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

const CommentItem = ({ comment }: { comment: Comment }) => {
  const { theme } = useTheme();
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes);

  const handleUpvote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (upvoted) {
      setUpvotes((v) => v - 1);
    } else {
      setUpvotes((v) => v + 1);
    }
    setUpvoted(!upvoted);
  };

  return (
    <Animated.View entering={FadeIn}>
      <View style={[styles.commentItem, { backgroundColor: theme.surface }]}>
        <View style={styles.commentHeader}>
          <View style={[styles.commentAvatar, { backgroundColor: theme.primary + "40" }]}>
            <Feather name="user" size={12} color={theme.primary} />
          </View>
          <ThemedText style={[styles.commentAuthor, { color: theme.textSecondary }]}>
            Anonymous
          </ThemedText>
          <ThemedText style={[styles.commentTime, { color: theme.textTertiary }]}>
            {formatTimeAgo(comment.createdAt)}
          </ThemedText>
        </View>
        <ThemedText style={styles.commentContent}>{comment.content}</ThemedText>
        <Pressable onPress={handleUpvote} style={styles.commentUpvote}>
          <Feather
            name="arrow-up"
            size={14}
            color={upvoted ? theme.upvote : theme.textTertiary}
          />
          <ThemedText
            style={[
              styles.commentUpvoteCount,
              { color: upvoted ? theme.upvote : theme.textTertiary },
            ]}
          >
            {upvotes}
          </ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "PostDetail">>();
  const { postId } = route.params;
  const { user } = useAuth();

  const { data: postData, isLoading: postLoading } = usePost(postId);
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useComments(postId);
  const createComment = useCreateComment();
  const voteMutation = useVote();
  const deletePost = useDeletePost();

  const [votes, setVotes] = useState({ up: false, down: false });
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [localDownvotes, setLocalDownvotes] = useState(0);
  const [newComment, setNewComment] = useState("");

  const post = postData?.post;
  const comments = commentsData?.comments || [];
  const categoryColor = post ? (CategoryColors[post.category] || theme.primary) : theme.primary;

  React.useEffect(() => {
    if (post) {
      setLocalUpvotes(post.upvotes);
      setLocalDownvotes(post.downvotes);
    }
  }, [post]);

  const handleUpvote = async () => {
    if (!user || !post) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (votes.up) {
      setVotes({ up: false, down: false });
      setLocalUpvotes((v) => v - 1);
    } else {
      if (votes.down) setLocalDownvotes((v) => v - 1);
      setVotes({ up: true, down: false });
      setLocalUpvotes((v) => v + 1);
    }
    voteMutation.mutate({ userId: user.id, postId: post.id, voteType: 1 });
  };

  const handleDownvote = async () => {
    if (!user || !post) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (votes.down) {
      setVotes({ up: false, down: false });
      setLocalDownvotes((v) => v - 1);
    } else {
      if (votes.up) setLocalUpvotes((v) => v - 1);
      setVotes({ up: false, down: true });
      setLocalDownvotes((v) => v + 1);
    }
    voteMutation.mutate({ userId: user.id, postId: post.id, voteType: -1 });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !post) return;

    try {
      await createComment.mutateAsync({
        userId: user.id,
        postId: post.id,
        content: newComment.trim(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewComment("");
      refetchComments();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !post) return;
    
    try {
      await deletePost.mutateAsync({ postId: post.id, userId: user.id });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (postLoading || !post) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  const renderHeader = () => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={[styles.categoryChip, { backgroundColor: categoryColor + "33" }]}>
          <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timeAgo, { color: theme.textTertiary }]}>
          {formatTimeAgo(post.createdAt)}
        </ThemedText>
      </View>

      <ThemedText style={styles.postContent}>{post.content}</ThemedText>

      <View style={styles.postActions}>
        <Pressable onPress={handleUpvote} style={styles.voteButton}>
          <Feather
            name="arrow-up"
            size={22}
            color={votes.up ? theme.upvote : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.voteCount,
              { color: votes.up ? theme.upvote : theme.textSecondary },
            ]}
          >
            {localUpvotes}
          </ThemedText>
        </Pressable>

        <Pressable onPress={handleDownvote} style={styles.voteButton}>
          <Feather
            name="arrow-down"
            size={22}
            color={votes.down ? theme.downvote : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.voteCount,
              { color: votes.down ? theme.downvote : theme.textSecondary },
            ]}
          >
            {localDownvotes}
          </ThemedText>
        </Pressable>

        <View style={styles.commentCount}>
          <Feather name="message-circle" size={20} color={theme.textSecondary} />
          <ThemedText style={[styles.voteCount, { color: theme.textSecondary }]}>
            {comments.length}
          </ThemedText>
        </View>

        <Pressable style={styles.shareButton}>
          <Feather name="share" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable onPress={handleDeletePost} style={styles.deleteButton} disabled={deletePost.isPending}>
          <Feather name="trash-2" size={20} color={theme.downvote} />
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="h4" style={styles.commentsTitle}>
        Comments
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.md,
            paddingHorizontal: Spacing.md,
            paddingBottom: Spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={() => (
            commentsLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ThemedText style={[styles.noComments, { color: theme.textSecondary }]}>
                No comments yet. Be the first!
              </ThemedText>
            )
          )}
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.backgroundRoot,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom + Spacing.sm,
            },
          ]}
        >
          <TextInput
            style={[
              styles.commentInput,
              { backgroundColor: theme.surface, color: theme.text },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.textTertiary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={300}
          />
          <Pressable
            onPress={handleSubmitComment}
            style={[
              styles.sendButton,
              {
                backgroundColor: newComment.trim()
                  ? theme.primary
                  : theme.surface,
              },
            ]}
            disabled={!newComment.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather
                name="send"
                size={18}
                color={newComment.trim() ? "#FFFFFF" : theme.textTertiary}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
  },
  postContainer: {
    marginBottom: Spacing.md,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 17,
    marginBottom: Spacing.lg,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  voteCount: {
    fontSize: 15,
    fontWeight: "500",
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  shareButton: {
    marginLeft: "auto",
    padding: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  commentsTitle: {
    marginBottom: Spacing.sm,
  },
  commentItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "500",
  },
  commentTime: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  commentUpvote: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  commentUpvoteCount: {
    fontSize: 12,
  },
  noComments: {
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
