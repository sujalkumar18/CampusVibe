import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
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

const { width, height } = Dimensions.get("window");

type Reel = {
  id: string;
  category: "confession" | "crush" | "meme" | "rant" | "compliment";
  upvotes: number;
  downvotes: number;
  commentCount: number;
  description: string;
  backgroundColor: string;
};

const MOCK_REELS: Reel[] = [
  {
    id: "1",
    category: "meme",
    upvotes: 1234,
    downvotes: 45,
    commentCount: 234,
    description: "When professor says 'This won't be on the exam' but it's 50% of the paper",
    backgroundColor: "#2D1B69",
  },
  {
    id: "2",
    category: "confession",
    upvotes: 892,
    downvotes: 23,
    commentCount: 156,
    description: "I've been secretly leaving motivational notes in library books for strangers to find",
    backgroundColor: "#1B4332",
  },
  {
    id: "3",
    category: "crush",
    upvotes: 567,
    downvotes: 12,
    commentCount: 89,
    description: "To the person who smiled at me in the cafeteria today - you made my day",
    backgroundColor: "#4A1942",
  },
  {
    id: "4",
    category: "rant",
    upvotes: 2341,
    downvotes: 89,
    commentCount: 445,
    description: "Hostel water heater broke again in winter. Day 5 of cold showers.",
    backgroundColor: "#1A365D",
  },
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

const ReelItem = ({ reel, isActive }: { reel: Reel; isActive: boolean }) => {
  const insets = useSafeAreaInsets();
  const [votes, setVotes] = useState({ up: false, down: false });
  const [upvotes, setUpvotes] = useState(reel.upvotes);
  const [downvotes, setDownvotes] = useState(reel.downvotes);
  const tabBarHeight = 60 + insets.bottom;

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
    <View style={[styles.reelContainer, { backgroundColor: reel.backgroundColor }]}>
      <View style={[styles.categoryBadge, { top: insets.top + Spacing.md }]}>
        <View style={[styles.categoryChip, { backgroundColor: categoryColor + "40" }]}>
          <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
            {categoryLabels[reel.category]}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.contentOverlay, { bottom: tabBarHeight + Spacing.xl }]}>
        <ThemedText style={styles.description}>{reel.description}</ThemedText>
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
          count={reel.commentCount}
          onPress={() => {}}
        />
        <ActionButton icon="share" count={0} onPress={() => {}} />
      </View>
    </View>
  );
};

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabBarHeight = 60 + insets.bottom;

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

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_REELS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} />
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
  reelContainer: {
    width,
    height,
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
