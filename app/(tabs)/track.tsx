import ParallaxScrollView from "@/components/ParallaxScrollView";
import { PetSelectionModal } from "@/components/PetSelectionModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { PetTrack } from "@/lib/dao/tracksDao";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectPet } from "@/store/petSlice";
import { fetchAllTracks, fetchTracks } from "@/store/trackSlice";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Pet } from "./pets";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

export default function TrackScreen() {
  const dispatch = useAppDispatch();
  const { selectedPet, pets } = useAppSelector((state) => state.pets);
  console.log("🔍 Track: selectedPet", selectedPet);
  const { tracks, loading, error } = useAppSelector((state) => state.tracks);

  const [showPetModal, setShowPetModal] = useState(false);

  // Filter tracks for the active pet or show all tracks if no pet selected
  const displayTracks = selectedPet?.id
    ? tracks.filter((track) => track.pet_id === selectedPet.id)
    : tracks;

  // Fetch tracks when component mounts or active pet changes
  useEffect(() => {
    console.log("🔍 Track: selectedPet - useEffect", selectedPet);
    if (selectedPet) {
      console.log("🔍 Track: Fetching tracks for pet:", selectedPet.name);
      dispatch(fetchTracks(selectedPet.id))
        .unwrap()
        .then((result) => {
          console.log(
            "✅ Track: Successfully fetched",
            result.length,
            "tracks for",
            selectedPet.name
          );
        })
        .catch((error) => {
          console.error("❌ Track: Failed to fetch tracks:", error);
        });
    } else {
      console.log("🔍 Track: Fetching all user tracks (no pet selected)");
      dispatch(fetchAllTracks())
        .unwrap()
        .then((result) => {
          console.log(
            "✅ Track: Successfully fetched",
            result.length,
            "tracks for all pets"
          );
        })
        .catch((error) => {
          console.error("❌ Track: Failed to fetch all tracks:", error);
        });
    }
  }, [dispatch, selectedPet]);

  // Pet selection handlers
  const showPetPicker = () => {
    setShowPetModal(true);
  };

  const handlePetSelect = (pet: Pet) => {
    dispatch(selectPet(pet));

    // Update global selectedPet state
    const selectedPetObj = pets.find((p) => p.id === pet.id);
    if (selectedPetObj) {
      console.log(
        "🎯 Track: Setting global selectedPet to:",
        selectedPetObj.name
      );
      dispatch(selectPet(selectedPetObj));
    }
  };

  const clearPetSelection = () => {
    dispatch(selectPet(null));
    // Clear global selectedPet state as well
    console.log("🎯 Track: Clearing global selectedPet");
    dispatch(selectPet(null));
  };

  const handleTrackPress = useCallback((track: PetTrack) => {
    // Navigate to track detail view (implement this route later)
    console.log("Navigate to track detail:", track.id);
    // router.navigate({
    //   pathname: "/tracks/[id]",
    //   params: { id: track.id }
    // });
  }, []);

  const startNewTrack = () => {
    if (!selectedPet) {
      Alert.alert("No Pet Selected", "Please select a pet to start tracking");
      return;
    }
    router.push("/tracking");
  };

  const renderTrackItem = (track: PetTrack) => {
    const pet = pets.find((p) => p.id === track.pet_id);
    const trackDate = new Date(track.track_date);

    return (
      <TouchableOpacity
        key={track.id}
        style={styles.historyItem}
        onPress={() => handleTrackPress(track)}
      >
        <View style={styles.historyInfo}>
          <ThemedText type="defaultSemiBold">
            {trackDate.toLocaleDateString()}
          </ThemedText>
          <View style={styles.trackDetails}>
            <ThemedText>
              {formatDistance(track.distance)} km • {formatTime(track.duration)}
            </ThemedText>
            {!selectedPet && pet && (
              <ThemedText style={styles.petName}>{pet.name}</ThemedText>
            )}
          </View>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#999999" />
      </TouchableOpacity>
    );
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
              Record your walks with your furry friend!
              {selectedPet
                ? ` Currently showing tracks for ${selectedPet.name}.`
                : " Select a pet to see their tracks."}{" "}
              Tap 'Start Walk' to begin tracking your route, distance, and time.
            </ThemedText>
          </View>

          {/* Pet Selection */}
          <View style={styles.petSelectionSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Select Pet
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.petSelector,
                {
                  borderColor: selectedPet ? "#4CAF50" : "#E5E5E5"
                }
              ]}
              onPress={showPetPicker}
            >
              <View style={styles.petSelectorContent}>
                {selectedPet ? (
                  <>
                    <IconSymbol
                      name="pawprint.fill"
                      size={20}
                      color="#4CAF50"
                    />
                    <ThemedText style={styles.petSelectorText}>
                      {selectedPet.name} ({selectedPet.species})
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <IconSymbol
                      name="plus.circle.fill"
                      size={20}
                      color="#999999"
                    />
                    <ThemedText
                      style={[styles.petSelectorText, { color: "#999999" }]}
                    >
                      Select a pet to view tracks
                    </ThemedText>
                  </>
                )}
                <View style={styles.petSelectorActions}>
                  {selectedPet && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearPetSelection}
                    >
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={16}
                        color="#999999"
                      />
                    </TouchableOpacity>
                  )}
                  <IconSymbol name="chevron.down" size={16} color="#999999" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Track History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <ThemedText type="subtitle" style={styles.historyTitle}>
                {selectedPet
                  ? `${selectedPet.name}'s Recent Walks`
                  : "Recent Walks"}
              </ThemedText>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <ThemedText style={styles.loadingText}>
                  Loading tracks...
                </ThemedText>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <IconSymbol
                  name="exclamationmark.triangle"
                  size={24}
                  color="#FF6B6B"
                />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : displayTracks.length > 0 ? (
              displayTracks.map(renderTrackItem)
            ) : selectedPet ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="location" size={48} color="#999999" />
                <ThemedText style={styles.emptyTitle}>No tracks yet</ThemedText>
                <ThemedText style={styles.emptyMessage}>
                  Start your first walk with {selectedPet.name} to see tracks
                  here
                </ThemedText>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <IconSymbol name="pawprint" size={48} color="#999999" />
                <ThemedText style={styles.emptyTitle}>Select a pet</ThemedText>
                <ThemedText style={styles.emptyMessage}>
                  Choose a pet from the sidebar to view their walking history
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ParallaxScrollView>

      <TouchableOpacity
        style={[styles.startButton, !selectedPet && styles.startButtonDisabled]}
        onPress={startNewTrack}
        disabled={!selectedPet}
      >
        <IconSymbol name="plus.circle.fill" size={24} color="#ffffff" />
        <ThemedText style={styles.buttonText}>
          {selectedPet ? "Start New Walk" : "Select Pet First"}
        </ThemedText>
      </TouchableOpacity>

      {/* Pet Selection Modal */}
      <PetSelectionModal
        visible={showPetModal}
        pets={pets}
        selectedPetId={selectedPet?.id}
        onSelectPet={handlePetSelect}
        onClose={() => setShowPetModal(false)}
        title="Select Pet for Track Viewing"
      />
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
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
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
  trackDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  petName: {
    fontSize: 14,
    color: "#666666"
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    color: "#4CAF50",
    fontSize: 16,
    marginTop: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyTitle: {
    color: "#666666",
    fontSize: 20,
    marginBottom: 8
  },
  emptyMessage: {
    color: "#999999",
    fontSize: 16,
    textAlign: "center"
  },
  startButtonDisabled: {
    backgroundColor: "#CCCCCC"
  },
  petSelectionSection: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12
  },
  petSelector: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 16
  },
  petSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  petSelectorText: {
    fontSize: 16,
    marginRight: 8
  },
  petSelectorActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  clearButton: {
    padding: 4
  }
});
