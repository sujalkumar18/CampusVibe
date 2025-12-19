import React from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator, Alert } from "react-native";
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
import { useAuth } from "@/hooks/useAuth";
import { usePolls, useVotePoll, useDeletePoll, type Poll } from "@/hooks/usePolls";
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

const PollOptionItem = ({
  option,
  totalVotes,
  hasVoted,
  isSelected,
  onVote,
}: {
  option: { id: string; optionText: string; voteCount: number };
  totalVotes: number;
  hasVoted: boolean;
  isSelected: boolean;
  onVote: () => void;
}) => {
  const { theme } = useTheme();
  const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    if (hasVoted) return;
    scale.value = withSpring(0.98, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVote();
  };

  return (
    <Pressable onPress={handlePress} disabled={hasVoted}>
      <Animated.View
        style={[
          styles.pollOption,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? Colors.dark.primary : theme.border,
            borderWidth: isSelected ? 2 : 1,
          },
          animatedStyle,
        ]}
      >
        {hasVoted && (
          <View
            style={[
              styles.pollOptionProgress,
              {
                width: `${percentage}%`,
                backgroundColor: isSelected
                  ? Colors.dark.primary + "30"
                  : theme.border + "50",
              },
            ]}
          />
        )}
        <View style={styles.pollOptionContent}>
          <ThemedText style={styles.pollOptionText}>{option.optionText}</ThemedText>
          <ThemedText style={[styles.pollPercentage, { color: theme.textSecondary }]}>
            {percentage}% ({option.voteCount} {option.voteCount === 1 ? "vote" : "votes"})
          </ThemedText>
        </View>
        {isSelected && (
          <Feather name="check-circle" size={18} color={Colors.dark.primary} style={styles.checkIcon} />
        )}
      </Animated.View>
    </Pressable>
  );
};

const PollCard = ({
  poll,
  userId,
  onVote,
  onDelete,
}: {
  poll: Poll;
  userId?: string;
  onVote: (pollId: string, optionId: string) => void;
  onDelete: (pollId: string) => void;
}) => {
  const { theme } = useTheme();
  const hasVoted = !!poll.userVotedOptionId;
  const isOwner = userId && poll.userId === userId;

  return (
    <View style={[styles.pollCard, { backgroundColor: theme.surface }]}>
      <View style={styles.pollHeader}>
        <CategoryChip category={poll.category} />
        <View style={styles.pollHeaderRight}>
          <ThemedText style={[styles.timeAgo, { color: theme.textSecondary }]}>
            {formatTimeAgo(poll.createdAt)}
          </ThemedText>
          {isOwner && (
            <Pressable onPress={() => onDelete(poll.id)} style={styles.pollDeleteButton} hitSlop={8}>
              <Feather name="trash-2" size={16} color="#FF6B6B" />
            </Pressable>
          )}
        </View>
      </View>
      
      <ThemedText style={styles.pollQuestion}>{poll.question}</ThemedText>
      
      <View style={styles.pollOptions}>
        {poll.options.map((option) => (
          <PollOptionItem
            key={option.id}
            option={option}
            totalVotes={poll.totalVotes}
            hasVoted={hasVoted}
            isSelected={poll.userVotedOptionId === option.id}
            onVote={() => userId && onVote(poll.id, option.id)}
          />
        ))}
      </View>
      
      <View style={styles.pollFooter}>
        <ThemedText style={[styles.voteCount, { color: theme.textSecondary }]}>
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
        </ThemedText>
      </View>
    </View>
  );
};

const EmptyPolls = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.emptyContainer}>
      <Feather name="bar-chart-2" size={64} color={theme.textSecondary} />
      <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
        No Polls Yet
      </ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Be the first to create a poll and get opinions from your campus!
      </ThemedText>
      <Pressable
        style={[styles.createButton, { backgroundColor: Colors.dark.primary }]}
        onPress={() => navigation.navigate("CreatePoll")}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <ThemedText style={styles.createButtonText}>Create Poll</ThemedText>
      </Pressable>
    </View>
  );
};

export default function PollsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = usePolls();
  const votePoll = useVotePoll();
  const deletePoll = useDeletePoll();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const polls = data?.polls || [];

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user?.id) return;
    try {
      await votePoll.mutateAsync({
        pollId,
        optionId,
        userId: user.id,
      });
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleDeletePoll = (pollId: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      "Delete Poll",
      "Are you sure you want to delete this poll? All votes will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePoll.mutateAsync({ pollId, userId: user.id });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert("Error", "Failed to delete poll.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText style={styles.headerTitle}>Polls</ThemedText>
        <Pressable
          style={[styles.addButton, { backgroundColor: Colors.dark.primary }]}
          onPress={() => navigation.navigate("CreatePoll")}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {polls.length === 0 ? (
        <EmptyPolls />
      ) : (
        <FlatList
          data={polls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PollCard poll={item} userId={user?.id} onVote={handleVote} onDelete={handleDeletePoll} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.dark.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  pollCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  pollHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pollDeleteButton: {
    padding: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  pollOptions: {
    gap: Spacing.sm,
  },
  pollOption: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  pollOptionProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BorderRadius.md,
  },
  pollOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
  },
  pollOptionText: {
    fontSize: 15,
    flex: 1,
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  checkIcon: {
    position: "absolute",
    right: Spacing.md,
    top: "50%",
    marginTop: -9,
  },
  pollFooter: {
    marginTop: Spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  voteCount: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
