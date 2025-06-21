import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";

import { GreetingBanner } from "@/components/GreetingBanner";
import {
  convertToDisplayActivity,
  PetActivityCard
} from "@/components/PetActivityCard";
import { SidebarPetList } from "@/components/SidebarPetList";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchActivityStats,
  fetchAllUserActivities,
  fetchTodayActivities
} from "@/store/activitiesSlice";

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const selectedPet = useAppSelector((state) => state.pets.selectedPet);
  const pets = useAppSelector((state) => state.pets.pets);
  const user = useAppSelector((state) => state.auth.user);
  const userLoading = useAppSelector((state) => state.auth.loading);
  const activities = useAppSelector(
    (state) => state.activities.todayActivities
  );
  const activityStats = useAppSelector((state) => state.activities.stats);
  const activityLoading = useAppSelector((state) => state.activities.loading);
  const activityError = useAppSelector((state) => state.activities.error);
  const colorScheme = useColorScheme() ?? "light";
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleRetry = useCallback(() => {
    const fetchParams = selectedPet?.id ? { petId: selectedPet.id } : {};
    dispatch(fetchTodayActivities(fetchParams));
    dispatch(fetchActivityStats(fetchParams));
  }, [dispatch, selectedPet?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Fetch real data on refresh
    const fetchParams = selectedPet?.id ? { petId: selectedPet.id } : {};
    dispatch(fetchTodayActivities(fetchParams))
      .then(() => dispatch(fetchActivityStats(fetchParams)))
      .finally(() => setRefreshing(false));
  }, [dispatch, selectedPet?.id]);

  const handleViewMoreActivities = useCallback(() => {
    if (selectedPet) {
      // Navigate to activities with specific pet
      router.push("/activities");
    } else {
      // Navigate to all activities
      router.push("/activities");
    }
  }, [selectedPet]);

  const handleActivityPress = useCallback((activityId: string) => {
    // Navigate to activity detail
    console.log("Navigate to activity detail:", activityId);
    router.navigate({
      pathname: "/activities/[id]",
      params: { id: activityId }
    });
  }, []);

  const handleAddActivity = useCallback(() => {
    if (selectedPet) {
      router.navigate({
        pathname: "/activities/add",
        params: { petId: selectedPet.id }
      });
    } else {
      router.navigate("/activities/add");
    }
  }, [selectedPet]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, [selectedPet]);

  // Fetch activities when component mounts or selected pet changes
  useEffect(() => {
    console.log("🔍 Home: Effect triggered - selectedPet:", selectedPet?.id);
    console.log("🔍 Home: Current activities count:", activities.length);

    const fetchParams = selectedPet?.id ? { petId: selectedPet.id } : {};
    console.log("🔍 Home: Fetching with params:", fetchParams);

    dispatch(fetchTodayActivities(fetchParams))
      .unwrap()
      .then((result) => {
        console.log(
          "✅ Home: fetchTodayActivities successful, count:",
          result.length
        );
      })
      .catch((error) => {
        console.error("❌ Home: fetchTodayActivities failed:", error);
      });

    dispatch(fetchActivityStats(fetchParams))
      .unwrap()
      .then((result) => {
        console.log("✅ Home: fetchActivityStats successful:", result);
      })
      .catch((error) => {
        console.error("❌ Home: fetchActivityStats failed:", error);
      });
  }, [dispatch, selectedPet?.id]);

  useEffect(() => {
    dispatch(fetchAllUserActivities({}));
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme].text}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Banner */}
          <GreetingBanner userName={user?.email} loading={userLoading} />

          {/* Debug Panel - Remove this after fixing */}
          {/* <ActivitiesDebugger /> */}

          {/* Pet Activity Card */}
          {selectedPet ? (
            <PetActivityCard
              pet={selectedPet}
              activities={
                activities
                  .filter((activity) => activity.pet_id === selectedPet.id)
                  .map((activity) => convertToDisplayActivity(activity))
                  .slice(0, 10) // Limit to recent activities
              }
              totalWalks={activityStats.totalWalks}
              totalDistance={activityStats.totalDistance.toFixed(1)}
              loading={activityLoading}
              error={activityError}
              onRetry={handleRetry}
              onViewMore={handleViewMoreActivities}
              onActivityPress={handleActivityPress}
              onAddActivity={handleAddActivity}
            />
          ) : (
            <PetActivityCard
              activities={
                activities
                  .map((activity) => {
                    // Find pet name for multi-pet view
                    const pet = pets.find((p) => p.id === activity.pet_id);
                    return convertToDisplayActivity(activity, pet?.name);
                  })
                  .slice(0, 10) // Limit to recent activities
              }
              totalWalks={activityStats.totalWalks}
              totalDistance={activityStats.totalDistance.toFixed(1)}
              isMultiPetView={true}
              loading={activityLoading}
              error={activityError}
              onRetry={handleRetry}
              onViewMore={handleViewMoreActivities}
              onActivityPress={handleActivityPress}
              onAddActivity={handleAddActivity}
            />
          )}

          {/* Pet Avatar Section */}
          {selectedPet?.avatar && (
            <Animated.View
              style={[styles.avatarSection, { opacity: fadeAnim }]}
            >
              <Image
                source={{ uri: selectedPet.avatar }}
                style={[
                  styles.petAvatar,
                  {
                    borderColor:
                      selectedPet.species === "dog"
                        ? Colors[colorScheme].primary
                        : Colors[colorScheme].secondary
                  }
                ]}
              />
            </Animated.View>
          )}
        </ScrollView>
        <SidebarPetList />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100 // Account for tab bar
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20
  },
  petAvatar: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 4,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  content: {
    padding: 16,
    gap: 16,
    backgroundColor: "transparent",
    minHeight: 400
  },
  contentGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  section: {
    marginBottom: 16,
    transform: [{ scale: 1 }]
  }
});
