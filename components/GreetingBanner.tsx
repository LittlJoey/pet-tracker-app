import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { SkeletonCard } from "./ui/SkeletonCard";

interface GreetingBannerProps {
  userName?: string | null;
  loading?: boolean;
  error?: string | null;
}

export function GreetingBanner({
  userName,
  loading = false,
  error = null
}: GreetingBannerProps) {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDisplayName = () => {
    if (!userName) return "there";
    // Extract name from email if it's an email format
    if (userName.includes("@")) {
      const namePart = userName.split("@")[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return userName;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.greetingContainer}>
            <SkeletonCard
              width={150}
              height={24}
              style={styles.greetingSkeleton}
            />
            <SkeletonCard width={100} height={20} style={styles.nameSkeleton} />
          </View>
          <View style={styles.dateContainer}>
            <SkeletonCard width={80} height={16} />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.greetingContainer}>
          <ThemedText style={styles.greeting} type="title">
            {getGreeting()},
          </ThemedText>
          <ThemedText style={styles.name} type="title">
            {error ? "there" : getDisplayName()}!
          </ThemedText>
        </View>
        <View style={styles.dateContainer}>
          <ThemedText style={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8
  },
  content: {
    gap: 8
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap"
  },
  greeting: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.light.text
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.light.primary
  },
  dateContainer: {
    marginTop: 4
  },
  date: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    fontWeight: "400"
  },
  greetingSkeleton: {
    marginBottom: 4
  },
  nameSkeleton: {
    marginLeft: 8
  }
});
