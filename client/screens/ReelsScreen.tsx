import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { useReels, useViewReel, type Reel } from "@/hooks/useReels";

const { width, height } = Dimensions.get("window");

const BACKGROUND_COLORS = [
  "#2D1B69",
  "#1B4332",
  "#4A1942",
  "#1A365D",
  "#6C3483",
  "#0E4D64",
];

const ActionButton = ({
  icon,
  count,
  active,
  activeColor,
  onPress,
}: {
  icon: string;
  count: number;
  active?: boolean;
  activeColor?: string;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    scale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.actionButton, animatedStyle]}>
        <Feather
          name={icon as any}
          size={28}
          color={active && activeColor ? activeColor : "#FFFFFF"}
        />
        <ThemedText style={styles.actionCount}>{formatCount(count)}</ThemedText>
      </Animated.View>
    </Pressable>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
};

const ReelItem = ({ reel, isActive, index }: { reel: Reel; isActive: boolean; index: number }) => {
  const insets = useSafeAreaInsets();
  const viewReel = useViewReel();
  const [votes, setVotes] = useState({ up: false, down: false });
  const [upvotes, setUpvotes] = useState(reel.upvotes);
  const [downvotes, setDownvotes] = useState(reel.downvotes);
  const tabBarHeight = 60 + insets.bottom;
  const backgroundColor = BACKGROUND_COLORS[index % BACKGROUND_COLORS.length];

  React.useEffect(() => {
    if (isActive) {
      viewReel.mutate(reel.id);
    }
  }, [isActive, reel.id]);

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

  const categoryColor = CategoryColors[reel.category];
  const categoryLabels: Record<string, string> = {
    confession: "Confession",
    crush: "Crush",
    meme: "Meme",
    rant: "Rant",
    compliment: "Compliment",
  };

  return (
    <View style={[styles.reelContainer, { backgroundColor }]}>
      <View style={[styles.categoryBadge, { top: insets.top + Spacing.md }]}>
        <View style={[styles.categoryChip, { backgroundColor: categoryColor + "40" }]}>
          <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
            {categoryLabels[reel.category]}
          </ThemedText>
        </View>
      </View>

      <View style={styles.videoPlaceholder}>
        <Feather name="play-circle" size={64} color="rgba(255,255,255,0.3)" />
      </View>

      <View style={[styles.contentOverlay, { bottom: tabBarHeight + Spacing.xl }]}>
        <ThemedText style={styles.description}>{reel.description || "No description"}</ThemedText>
        <ThemedText style={styles.viewCount}>{reel.viewCount} views</ThemedText>
      </View>

      <View style={[styles.actionsContainer, { bottom: tabBarHeight + Spacing.xl }]}>
        <ActionButton
          icon="arrow-up"
          count={upvotes}
          active={votes.up}
          activeColor={Colors.dark.upvote}
          onPress={handleUpvote}
        />
        <ActionButton
          icon="arrow-down"
          count={downvotes}
          active={votes.down}
          activeColor={Colors.dark.downvote}
          onPress={handleDownvote}
        />
        <ActionButton
          icon="message-circle"
          count={0}
          onPress={() => {}}
        />
        <ActionButton icon="share" count={0} onPress={() => {}} />
      </View>
    </View>
  );
};

const EmptyReels = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  return (
    <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
      <Feather name="video-off" size={64} color={theme.textTertiary} />
      <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>No Reels Yet</ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Be the first to share an anonymous video with your campus!
      </ThemedText>
    </View>
  );
};

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, isLoading } = useReels();
  const reels = data?.reels || [];

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (reels.length === 0) {
    return <EmptyReels />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} index={index} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  reelContainer: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    position: "absolute",
    left: Spacing.md,
    zIndex: 10,
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
  contentOverlay: {
    position: "absolute",
    left: Spacing.md,
    right: 80,
  },
  description: {
    color: "#FFFFFF",
    fontSize: 15,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  viewCount: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  actionsContainer: {
    position: "absolute",
    right: Spacing.md,
    alignItems: "center",
    gap: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
