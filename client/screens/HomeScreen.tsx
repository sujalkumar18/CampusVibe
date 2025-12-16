import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { usePosts, useVote, type Post } from "@/hooks/usePosts";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

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

const CategoryChip = ({ category }: { category: string }) => {
  const color = CategoryColors[category] || Colors.dark.primary;
  const labels: Record<string, string> = {
    confession: "Confession",
    crush: "Crush",
    meme: "Meme",
    rant: "Rant",
    compliment: "Compliment",
  };

  return (
    <View style={[styles.categoryChip, { backgroundColor: color + "33" }]}>
      <ThemedText style={[styles.categoryText, { color }]}>
        {labels[category] || category}
      </ThemedText>
    </View>
  );
};

const VoteButton = ({
  type,
  count,
  active,
  onPress,
}: {
  type: "up" | "down";
  count: number;
  active: boolean;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const color = type === "up" ? theme.upvote : theme.downvote;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    scale.value = withSpring(1.2, { damping: 10 });
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.voteButton, animatedStyle]}>
        <Feather
          name={type === "up" ? "arrow-up" : "arrow-down"}
          size={20}
          color={active ? color : theme.textSecondary}
        />
        <ThemedText
          style={[
            styles.voteCount,
            { color: active ? color : theme.textSecondary },
          ]}
        >
          {count}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
};

const PostCard = ({ 
  post, 
  onPress,
  userId,
  onVote,
}: { 
  post: Post; 
  onPress: () => void;
  userId?: string;
  onVote: (postId: string, voteType: 1 | -1) => void;
}) => {
  const { theme } = useTheme();
  const [votes, setVotes] = useState({ up: false, down: false });
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);

  const handleUpvote = () => {
    if (!userId) return;
    if (votes.up) {
      setVotes({ up: false, down: false });
      setUpvotes((v) => v - 1);
    } else {
      if (votes.down) setDownvotes((v) => v - 1);
      setVotes({ up: true, down: false });
      setUpvotes((v) => v + 1);
    }
    onVote(post.id, 1);
  };

  const handleDownvote = () => {
    if (!userId) return;
    if (votes.down) {
      setVotes({ up: false, down: false });
      setDownvotes((v) => v - 1);
    } else {
      if (votes.up) setUpvotes((v) => v - 1);
      setVotes({ up: false, down: true });
      setDownvotes((v) => v + 1);
    }
    onVote(post.id, -1);
  };

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.postCard, { backgroundColor: theme.surface }]}>
        <View style={styles.postHeader}>
          <CategoryChip category={post.category} />
          <ThemedText style={[styles.timeAgo, { color: theme.textTertiary }]}>
            {formatTimeAgo(post.createdAt)}
          </ThemedText>
        </View>

        <ThemedText style={styles.postContent}>{post.content}</ThemedText>

        {post.imageUrl && (
          <View style={styles.postMedia}>
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={200}
              onError={(e) => console.log('Image load error:', post.imageUrl, e)}
            />
          </View>
        )}

        {post.videoUrl && (
          <View style={[styles.postMedia, styles.videoContainer]}>
            <View style={[styles.videoPlaceholder, { backgroundColor: theme.surface }]}>
              <Feather name="play-circle" size={40} color={theme.primary} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                Video
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.postFooter}>
          <View style={styles.voteContainer}>
            <VoteButton
              type="up"
              count={upvotes}
              active={votes.up}
              onPress={handleUpvote}
            />
            <VoteButton
              type="down"
              count={downvotes}
              active={votes.down}
              onPress={handleDownvote}
            />
          </View>

          <Pressable style={styles.commentButton}>
            <Feather name="message-circle" size={18} color={theme.textSecondary} />
            <ThemedText style={[styles.commentCount, { color: theme.textSecondary }]}>
              {post.commentCount}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = usePosts();
  const voteMutation = useVote();

  const handlePostPress = (postId: string) => {
    navigation.navigate("PostDetail", { postId });
  };

  const handleVote = (postId: string, voteType: 1 | -1) => {
    if (!user) return;
    voteMutation.mutate({ userId: user.id, postId, voteType });
  };

  const tabBarHeight = 60 + insets.bottom;

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  const posts = data?.posts || [];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerContent}>
          <ThemedText type="h2">CampusVibe</ThemedText>
          <Pressable style={styles.filterButton}>
            <Feather name="filter" size={22} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onPress={() => handlePostPress(item.id)}
            userId={user?.id}
            onVote={handleVote}
          />
        )}
        contentContainerStyle={{
          paddingTop: Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.md,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="message-square" size={48} color={theme.textTertiary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No posts yet. Be the first to share!
            </ThemedText>
          </View>
        )}
      />
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    padding: Spacing.sm,
  },
  postCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
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
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  postMedia: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.sm,
  },
  videoContainer: {
    height: 150,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voteContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  commentCount: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
