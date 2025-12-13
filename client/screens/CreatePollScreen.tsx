import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePoll } from "@/hooks/usePolls";
import { Colors, Spacing, BorderRadius, CategoryColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Category } from "../../shared/schema";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "confession", label: "Confession" },
  { value: "crush", label: "Crush" },
  { value: "meme", label: "Meme" },
  { value: "rant", label: "Rant" },
  { value: "compliment", label: "Compliment" },
];

export default function CreatePollScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const createPoll = useCreatePoll();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const canAddOption = options.length < 6;
  const canRemoveOption = options.length > 2;
  const isValid = question.trim().length > 0 && 
    options.filter(o => o.trim().length > 0).length >= 2 && 
    selectedCategory !== null;

  const handleAddOption = () => {
    if (canAddOption) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (canRemoveOption) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handlePost = async () => {
    if (!isValid || !user?.id) return;

    setIsPosting(true);
    try {
      const validOptions = options.filter(o => o.trim().length > 0);
      
      await createPoll.mutateAsync({
        userId: user.id,
        question: question.trim(),
        category: selectedCategory!,
        options: validOptions,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert("Poll Created!", "Your anonymous poll is now live.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Create poll error:", error);
      Alert.alert("Error", "Failed to create poll. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Create Poll</ThemedText>
        <Pressable
          onPress={handlePost}
          disabled={!isValid || isPosting}
          style={[
            styles.postButton,
            {
              backgroundColor: isValid ? Colors.dark.primary : theme.border,
              opacity: isPosting ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={styles.postButtonText}>
            {isPosting ? "Posting..." : "Post"}
          </ThemedText>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Question
            </ThemedText>
            <TextInput
              style={[
                styles.questionInput,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Ask something interesting..."
              placeholderTextColor={theme.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Options ({options.length}/6)
              </ThemedText>
              {canAddOption && (
                <Pressable onPress={handleAddOption} style={styles.addOptionButton}>
                  <Feather name="plus" size={18} color={Colors.dark.primary} />
                  <ThemedText style={[styles.addOptionText, { color: Colors.dark.primary }]}>
                    Add
                  </ThemedText>
                </Pressable>
              )}
            </View>
            
            {options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  style={[
                    styles.optionInput,
                    {
                      backgroundColor: theme.cardBackground,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.textSecondary}
                  value={option}
                  onChangeText={(value) => handleOptionChange(index, value)}
                  maxLength={100}
                />
                {canRemoveOption && (
                  <Pressable
                    onPress={() => handleRemoveOption(index)}
                    style={styles.removeOptionButton}
                  >
                    <Feather name="trash-2" size={18} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Category
            </ThemedText>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                const color = CategoryColors[cat.value] || Colors.dark.primary;
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => {
                      setSelectedCategory(cat.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: isSelected ? color + "33" : theme.cardBackground,
                        borderColor: isSelected ? color : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryButtonText,
                        { color: isSelected ? color : theme.text },
                      ]}
                    >
                      {cat.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  postButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  questionInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  optionInput: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    borderWidth: 1,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeOptionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
