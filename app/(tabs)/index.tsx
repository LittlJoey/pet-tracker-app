import React from "react";
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
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchActivityStats,
  fetchTodayActivities
} from "@/store/activitiesSlice";
import { useCallback, useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, [selectedPet]);

  // Fetch activities when component mounts or selected pet changes
  useEffect(() => {
    console.log("Fetching activities for petId:", selectedPet?.id);
    if (selectedPet?.id) {
      dispatch(fetchTodayActivities({ petId: selectedPet.id }));
      dispatch(fetchActivityStats({ petId: selectedPet.id }));
    } else {
      console.log("Fetching activities for all pets");
      // Fetch all activities if no pet is selected
      dispatch(fetchTodayActivities({}));
      dispatch(fetchActivityStats({}));
    }
  }, [dispatch, selectedPet?.id]);

  useEffect(() => {
    // Fetch all activities if no pet is selected
    dispatch(fetchTodayActivities({}));
    dispatch(fetchActivityStats({}));
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
              onViewMore={() =>
                console.log("View more activities for", selectedPet.name)
              }
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
              onViewMore={() =>
                console.log("View more activities for all pets")
              }
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
