import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RootState } from "@/store";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

type TrackHistory = {
  id: string;
  date: Date;
  distance: number;
  duration: number;
  routePoints: any[];
  petId: string;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

export default function TrackScreen() {
  const { selectedPet } = useSelector((state: RootState) => state.pets);

  // Mock track history data
  const trackHistory: TrackHistory[] = [
    {
      id: "1",
      date: new Date(),
      distance: 2500, // meters
      duration: 1800, // seconds
      routePoints: [],
      petId: "1"
    },
    {
      id: "2",
      date: new Date(),
      distance: 1800, // meters
      duration: 1200, // seconds
      routePoints: [],
      petId: "1"
    },
    {
      id: "3",
      date: new Date(),
      distance: 3000, // meters
      duration: 1500, // seconds
      routePoints: [],
      petId: "1"
    },
    {
      id: "4",
      date: new Date(),
      distance: 2200, // meters
      duration: 1400, // seconds
      routePoints: [],
      petId: "1"
    }
  ];

  const startNewTrack = () => {
    router.push("/tracking");
  };

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#FFB6C1", dark: "#4A2639" }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="pawprint.fill"
            style={styles.headerImage}
          />
        }
      >
        <View style={styles.contentContainer}>
          <View style={styles.infoSection}>
            <ThemedText type="title" style={styles.infoTitle}>
              Track Your Pet's Adventure
            </ThemedText>
            <ThemedText style={styles.infoDescription}>
              Record your walks with your furry friend! Select your pet, tap
              'Start Walk', and we'll track your route, distance, and time.
              Perfect for monitoring exercise and creating memories together.
            </ThemedText>
          </View>

          {trackHistory.length > 0 && (
            <View style={styles.historySection}>
              <ThemedText type="subtitle" style={styles.historyTitle}>
                Recent Walks
              </ThemedText>
              {trackHistory.map((track) => (
                <View key={track.id} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <ThemedText type="defaultSemiBold">
                      {new Date(track.date).toLocaleDateString()}
                    </ThemedText>
                    <ThemedText>
                      {formatDistance(track.distance)} km •{" "}
                      {formatTime(track.duration)}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#999999" />
                </View>
              ))}
            </View>
          )}
        </View>
      </ParallaxScrollView>
      <TouchableOpacity style={styles.startButton} onPress={startNewTrack}>
        <IconSymbol name="plus.circle.fill" size={24} color="#ffffff" />
        <ThemedText style={styles.buttonText}>Start New Walk</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    backgroundColor: "#FFFFFF"
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 100
  },
  infoSection: {
    marginBottom: 32
  },
  infoTitle: {
    fontSize: 28,
    marginBottom: 12
  },
  infoDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    color: "#666666"
  },
  historySection: {
    flex: 1
  },
  historyTitle: {
    fontSize: 20,
    marginBottom: 16
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0"
  },
  historyInfo: {
    gap: 6
  },
  startButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600"
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute"
  }
});
