import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable } from "react-native";
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

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Post = {
  id: string;
  content: string;
  category: "confession" | "crush" | "meme" | "rant" | "compliment";
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timeAgo: string;
  imageUrl?: string;
};

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    content: "Finally confessed to my crush in library yesterday. Heart was beating so fast! Waiting for the reply...",
    category: "confession",
    upvotes: 156,
    downvotes: 12,
    commentCount: 45,
    timeAgo: "2h ago",
  },
  {
    id: "2",
    content: "That person in CS101 who always sits in the front row... you're amazing and your notes are always perfect!",
    category: "crush",
    upvotes: 89,
    downvotes: 5,
    commentCount: 23,
    timeAgo: "4h ago",
  },
  {
    id: "3",
    content: "WiFi in hostel is slower than my will to attend 8 AM lectures",
    category: "meme",
    upvotes: 342,
    downvotes: 8,
    commentCount: 67,
    timeAgo: "5h ago",
  },
  {
    id: "4",
    content: "Why do professors assign 5 assignments due on the same day? Do they think we're robots?!",
    category: "rant",
    upvotes: 234,
    downvotes: 15,
    commentCount: 89,
    timeAgo: "6h ago",
  },
  {
    id: "5",
    content: "Shoutout to the senior who helped me find my way on the first day. You're a real one!",
    category: "compliment",
    upvotes: 178,
    downvotes: 2,
    commentCount: 12,
    timeAgo: "8h ago",
  },
];

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

const PostCard = ({ post, onPress }: { post: Post; onPress: () => void }) => {
  const { theme } = useTheme();
  const [votes, setVotes] = useState({ up: false, down: false });
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);

  const handleUpvote = () => {
    if (votes.up) {
      setVotes({ up: false, down: false });
      setUpvotes((v) => v - 1);
    } else {
      if (votes.down) setDownvotes((v) => v - 1);
      setVotes({ up: true, down: false });
      setUpvotes((v) => v + 1);
    }
  };

  const handleDownvote = () => {
    if (votes.down) {
      setVotes({ up: false, down: false });
      setDownvotes((v) => v - 1);
    } else {
      if (votes.up) setUpvotes((v) => v - 1);
      setVotes({ up: false, down: true });
      setDownvotes((v) => v + 1);
    }
  };

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.postCard, { backgroundColor: theme.surface }]}>
        <View style={styles.postHeader}>
          <CategoryChip category={post.category} />
          <ThemedText style={[styles.timeAgo, { color: theme.textTertiary }]}>
            {post.timeAgo}
          </ThemedText>
        </View>

        <ThemedText style={styles.postContent}>{post.content}</ThemedText>

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
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(MOCK_POSTS);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handlePostPress = (postId: string) => {
    navigation.navigate("PostDetail", { postId });
  };

  const tabBarHeight = 60 + insets.bottom;

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
          <PostCard post={item} onPress={() => handlePostPress(item.id)} />
        )}
        contentContainerStyle={{
          paddingTop: Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.md,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
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
});
