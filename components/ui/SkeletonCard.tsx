import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

interface SkeletonCardProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonCard({
  width = "100%",
  height = 60,
  borderRadius = 8,
  style
}: SkeletonCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      Colors[colorScheme].tabIconDefault,
      Colors[colorScheme].background
    ]
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor
        },
        style
      ]}
    />
  );
}

export function ActivityCardSkeleton() {
  return (
    <View style={styles.activityCardSkeleton}>
      {/* Header skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonCard width={80} height={20} />
        <SkeletonCard width={60} height={16} />
      </View>

      {/* Stats skeleton */}
      <View style={styles.statsSkeleton}>
        <View style={styles.statItem}>
          <SkeletonCard width={40} height={40} borderRadius={20} />
          <SkeletonCard width={60} height={16} style={{ marginTop: 8 }} />
          <SkeletonCard width={40} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <SkeletonCard width={40} height={40} borderRadius={20} />
          <SkeletonCard width={60} height={16} style={{ marginTop: 8 }} />
          <SkeletonCard width={40} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Activity items skeleton */}
      <View style={styles.activitiesSkeleton}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.activityItemSkeleton}>
            <SkeletonCard width={40} height={40} borderRadius={20} />
            <View style={styles.activityTextSkeleton}>
              <SkeletonCard width={120} height={16} />
              <SkeletonCard width={80} height={14} style={{ marginTop: 4 }} />
            </View>
            <SkeletonCard width={50} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    opacity: 0.7
  },
  activityCardSkeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  headerSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  statsSkeleton: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12
  },
  statItem: {
    alignItems: "center"
  },
  activitiesSkeleton: {
    gap: 12
  },
  activityItemSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12
  },
  activityTextSkeleton: {
    flex: 1
  }
});
