import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Comment = {
  id: string;
  content: string;
  upvotes: number;
  timeAgo: string;
};

const MOCK_POST = {
  id: "1",
  content:
    "Finally confessed to my crush in library yesterday. Heart was beating so fast! Waiting for the reply... This has been on my mind for months and I finally gathered the courage. Whatever happens, at least I tried.",
  category: "confession" as const,
  upvotes: 156,
  downvotes: 12,
  commentCount: 45,
  timeAgo: "2h ago",
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    content: "Good luck! Rooting for you!",
    upvotes: 23,
    timeAgo: "1h ago",
  },
  {
    id: "2",
    content: "That takes courage. Proud of you!",
    upvotes: 18,
    timeAgo: "1h ago",
  },
  {
    id: "3",
    content: "Update us when you get the reply!",
    upvotes: 15,
    timeAgo: "45m ago",
  },
  {
    id: "4",
    content: "Been there, done that. It gets easier I promise",
    upvotes: 12,
    timeAgo: "30m ago",
  },
];

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
            {comment.timeAgo}
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
  const route = useRoute<RouteProp<RootStackParamList, "PostDetail">>();

  const [votes, setVotes] = useState({ up: false, down: false });
  const [upvotes, setUpvotes] = useState(MOCK_POST.upvotes);
  const [downvotes, setDownvotes] = useState(MOCK_POST.downvotes);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);

  const categoryColor = CategoryColors[MOCK_POST.category];

  const handleUpvote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (votes.up) {
      setVotes({ up: false, down: false });
      setUpvotes((v) => v - 1);
    } else {
      if (votes.down) setDownvotes((v) => v - 1);
      setVotes({ up: true, down: false });
      setUpvotes((v) => v + 1);
    }
  };

  const handleDownvote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (votes.down) {
      setVotes({ up: false, down: false });
      setDownvotes((v) => v - 1);
    } else {
      if (votes.up) setUpvotes((v) => v - 1);
      setVotes({ up: false, down: true });
      setDownvotes((v) => v + 1);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      upvotes: 0,
      timeAgo: "Just now",
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const renderHeader = () => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={[styles.categoryChip, { backgroundColor: categoryColor + "33" }]}>
          <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
            {MOCK_POST.category.charAt(0).toUpperCase() + MOCK_POST.category.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timeAgo, { color: theme.textTertiary }]}>
          {MOCK_POST.timeAgo}
        </ThemedText>
      </View>

      <ThemedText style={styles.postContent}>{MOCK_POST.content}</ThemedText>

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
            {upvotes}
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
            {downvotes}
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
            disabled={!newComment.trim()}
          >
            <Feather
              name="send"
              size={18}
              color={newComment.trim() ? "#FFFFFF" : theme.textTertiary}
            />
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
