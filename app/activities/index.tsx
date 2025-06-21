import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { PetActivity } from "@/lib/dao/activitiesDao";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchAllUserActivities,
  fetchPetActivities
} from "@/store/activitiesSlice";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ActivityItemProps {
  activity: PetActivity;
  petName?: string;
  onPress: () => void;
}

function ActivityItem({ activity, petName, onPress }: ActivityItemProps) {
  const colorScheme = useColorScheme() ?? "light";

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "walk":
        return "figure.walk";
      case "meal":
        return "fork.knife.circle.fill";
      case "medication":
        return "pills.circle.fill";
      case "vet-visit":
        return "cross.case.fill";
      case "grooming":
        return "scissors";
      case "play":
        return "gamecontroller.fill";
      default:
        return "pawprint.fill";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "walk":
        return "#4CAF50";
      case "meal":
        return "#FF9800";
      case "medication":
        return "#F44336";
      case "vet-visit":
        return "#2196F3";
      case "grooming":
        return "#9C27B0";
      case "play":
        return "#FF5722";
      default:
        return Colors[colorScheme].primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activityDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (activityDate.getTime() === today.getTime()) {
      return "Today";
    } else if (
      activityDate.getTime() ===
      today.getTime() - 24 * 60 * 60 * 1000
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDetails = () => {
    const parts = [];
    if (activity.duration) parts.push(`${activity.duration} mins`);
    if (activity.distance) parts.push(`${activity.distance.toFixed(1)} km`);
    if (activity.calories) parts.push(`${activity.calories} kcal`);
    return parts.join(" • ");
  };

  return (
    <TouchableOpacity
      style={[
        styles.activityItem,
        {
          backgroundColor: Colors[colorScheme].background,
          borderBottomColor: Colors[colorScheme].border
        }
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getActivityColor(activity.type) }
        ]}
      >
        <IconSymbol
          name={getActivityIcon(activity.type)}
          size={20}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <ThemedText style={styles.activityTitle} type="defaultSemiBold">
            {petName ? `${petName}'s ${activity.title}` : activity.title}
          </ThemedText>
          <ThemedText
            style={[styles.activityTime, { color: Colors[colorScheme].icon }]}
          >
            {formatTime(activity.activity_date)}
          </ThemedText>
        </View>

        <View style={styles.activityMeta}>
          <ThemedText
            style={[styles.activityDate, { color: Colors[colorScheme].icon }]}
          >
            {formatDate(activity.activity_date)}
          </ThemedText>
          {formatDetails() && (
            <ThemedText
              style={[
                styles.activityDetails,
                { color: Colors[colorScheme].icon }
              ]}
            >
              {formatDetails()}
            </ThemedText>
          )}
        </View>

        {activity.description && (
          <ThemedText
            style={[styles.activityNotes, { color: Colors[colorScheme].icon }]}
            numberOfLines={1}
          >
            {activity.description}
          </ThemedText>
        )}
      </View>

      <IconSymbol
        name="chevron.right"
        size={16}
        color={Colors[colorScheme].icon}
      />
    </TouchableOpacity>
  );
}

export default function ActivitiesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const dispatch = useAppDispatch();
  const { petId } = useLocalSearchParams<{ petId?: string }>();

  const { pets, selectedPet } = useAppSelector((state) => state.pets);
  const { activities } = useAppSelector((state) => state.activities);

  const [refreshing, setRefreshing] = useState(false);

  // Determine which pet we're showing activities for
  const targetPet = petId ? pets.find((p) => p.id === petId) : selectedPet;
  const isMultiPetView = !petId && !selectedPet;

  useEffect(() => {
    loadActivities();
  }, [petId, selectedPet]);

  const loadActivities = async () => {
    try {
      if (targetPet) {
        await dispatch(fetchPetActivities({ petId: targetPet.id }));
      } else {
        await dispatch(fetchAllUserActivities({}));
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleActivityPress = (activity: PetActivity) => {
    router.navigate({
      pathname: "/activities/[id]",
      params: { id: activity.id }
    });
  };

  const handleAddActivity = () => {
    if (targetPet) {
      router.navigate({
        pathname: "/activities/add",
        params: { petId: targetPet.id }
      });
    } else {
      router.navigate("/activities/add");
    }
  };

  const getPetName = (petId: string) => {
    return pets.find((p) => p.id === petId)?.name || "Unknown Pet";
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol
        name="pawprint.fill"
        size={48}
        color={Colors[colorScheme].icon}
      />
      <ThemedText style={styles.emptyTitle} type="title">
        No activities yet
      </ThemedText>
      <ThemedText
        style={[styles.emptyMessage, { color: Colors[colorScheme].icon }]}
      >
        {isMultiPetView
          ? "Start tracking your pets' activities to see them here."
          : `Start tracking ${
              targetPet?.name || "your pet"
            }'s activities to see them here.`}
      </ThemedText>
      <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
        <ThemedText style={styles.addButtonText}>Add Activity</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background }
      ]}
    >
      {/* Header with add button */}
      <View
        style={[
          styles.header,
          { borderBottomColor: Colors[colorScheme].border }
        ]}
      >
        <View>
          <ThemedText type="title">
            {isMultiPetView
              ? "All Activities"
              : `${targetPet?.name || "Pet"}'s Activities`}
          </ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: Colors[colorScheme].icon }]}
          >
            {activities.length}{" "}
            {activities.length === 1 ? "activity" : "activities"}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleAddActivity}
        >
          <IconSymbol name="plus" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Activities list */}
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            petName={isMultiPetView ? getPetName(item.pet_id) : undefined}
            onPress={() => handleActivityPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4CAF50"
            colors={["#4CAF50"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          activities.length === 0 ? styles.emptyListContainer : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center"
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  activityContent: {
    flex: 1
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  activityTitle: {
    flex: 1,
    fontSize: 16
  },
  activityTime: {
    fontSize: 14,
    marginLeft: 8
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2
  },
  activityDate: {
    fontSize: 13,
    marginRight: 8
  },
  activityDetails: {
    fontSize: 13
  },
  activityNotes: {
    fontSize: 13,
    marginTop: 2
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  }
});
