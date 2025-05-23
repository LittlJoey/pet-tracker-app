import { Animated, Image, RefreshControl, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { PetInfoCard } from "@/components/PetInfoCard";
import { Activity, RecentActivityCard } from "@/components/RecentActivityCard";
import { SidebarPetList } from "@/components/SidebarPetList";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAppSelector } from "@/store";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";

export default function HomeScreen() {
  const selectedPet = useAppSelector((state) => state.pets.selectedPet);
  const pets = useAppSelector((state) => state.pets.pets);
  const colorScheme = useColorScheme() ?? "light";
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, [selectedPet]);

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].text}
          />
        }
        headerBackgroundColor={{
          light: Colors.light.secondary,
          dark: Colors.dark.secondary
        }}
        headerImage={
          selectedPet?.avatar ? (
            <Animated.View style={{ opacity: fadeAnim }}>
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
          ) : (
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.reactLogo}
            />
          )
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={
              [
                colorScheme === "light"
                  ? selectedPet
                    ? ["rgba(255,255,255,0.9)", "rgba(255,255,255,1)"]
                    : ["rgba(161,206,220,0.9)", "rgba(161,206,220,1)"]
                  : selectedPet
                  ? ["rgba(21,23,24,0.9)", "rgba(21,23,24,1)"]
                  : ["rgba(29,61,71,0.9)", "rgba(29,61,71,1)"]
              ][0]
            }
            style={styles.contentGradient}
          >
            {selectedPet ? (
              <>
                <ThemedView style={styles.section}>
                  <PetInfoCard pet={selectedPet} />
                </ThemedView>

                <ThemedView style={styles.section}>
                  <RecentActivityCard
                    activities={[
                      // Example activities - replace with real data
                      {
                        id: "1",
                        type: "walk",
                        date: new Date(),
                        title: "Morning Walk"
                      },
                      {
                        id: "2",
                        type: "medication",
                        date: new Date(),
                        title: "Daily Medicine"
                      }
                    ]}
                  />
                </ThemedView>
              </>
            ) : (
              <ThemedView style={styles.content}>
                <ThemedView style={styles.section}>
                  <RecentActivityCard
                    activities={pets
                      .flatMap(
                        (pet) =>
                          [
                            {
                              id: `${pet.id}-walk`,
                              type: "walk",
                              date: new Date(),
                              title: `${pet.name}'s Morning Walk`
                            },
                            {
                              id: `${pet.id}-med`,
                              type: "medication",
                              date: new Date(),
                              title: `${pet.name}'s Daily Medicine`
                            }
                          ] as Activity[]
                      )
                      .sort((a, b) => b.date.getTime() - a.date.getTime())}
                  />
                </ThemedView>
              </ThemedView>
            )}
          </LinearGradient>
        </Animated.View>
      </ParallaxScrollView>
      <SidebarPetList />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "transparent",
    minHeight: 500
  },
  section: {
    marginBottom: 16,
    transform: [{ scale: 1 }]
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute"
  },
  petAvatar: {
    height: 200,
    width: 200,
    borderRadius: 100,
    alignSelf: "center",
    marginTop: 20,
    borderWidth: 4,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  petsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16
  },
  gridItem: {
    width: "48%",
    marginBottom: 16
  }
});
