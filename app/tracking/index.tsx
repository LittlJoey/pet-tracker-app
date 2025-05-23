import { SelectPetModal } from "@/components/SelectPetModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RootState, useAppDispatch } from "@/store";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { captureRef } from "react-native-view-shot";
import { useSelector } from "react-redux";
import { Pet } from "../(tabs)/pets";

type LocationPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type WalkSummary = {
  distance: number;
  time: number;
  routePoints: LocationPoint[];
  date: Date;
};

type WalkSummaryModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedPet: Pet | null;
  routePoints: LocationPoint[];
  currentLocation: Location.LocationObject;
  distance: number;
  elapsedTime: number;
  summaryMapRef: React.RefObject<MapView>;
  handleShare: () => void;
};

const WalkSummaryModal = ({
  visible,
  onClose,
  selectedPet,
  routePoints,
  currentLocation,
  distance,
  elapsedTime,
  summaryMapRef,
  handleShare
}: WalkSummaryModalProps) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <ThemedView style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View>
            <ThemedText type="title">Walk Summary</ThemedText>
            <ThemedText style={styles.petName}>
              {selectedPet?.name}'s Adventure
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark.circle.fill" size={24} color="#999999" />
          </TouchableOpacity>
        </View>

        <MapView
          ref={summaryMapRef}
          style={styles.summaryMap}
          initialRegion={{
            latitude:
              routePoints[0]?.latitude || currentLocation.coords.latitude,
            longitude:
              routePoints[0]?.longitude || currentLocation.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {routePoints.length > 1 && (
            <Polyline
              coordinates={routePoints}
              strokeColor="#4CAF50"
              strokeWidth={3}
            />
          )}
        </MapView>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <ThemedText type="defaultSemiBold">Distance</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {formatDistance(distance)} km
            </ThemedText>
          </View>
          <View style={styles.summaryStat}>
            <ThemedText type="defaultSemiBold">Time</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {formatTime(elapsedTime)}
            </ThemedText>
          </View>
          <View style={styles.summaryStat}>
            <ThemedText type="defaultSemiBold">Pace</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {calculatePace(distance, elapsedTime)} /km
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#FFFFFF" />
          <ThemedText style={styles.shareButtonText}>Share</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  </Modal>
);

type TrackingStatsProps = {
  distance: number;
  elapsedTime: number;
};

const TrackingStats = ({ distance, elapsedTime }: TrackingStatsProps) => (
  <View style={styles.statsContainer}>
    <View style={styles.stat}>
      <ThemedText type="defaultSemiBold">Distance</ThemedText>
      <ThemedText>{formatDistance(distance)} km</ThemedText>
    </View>
    <View style={styles.stat}>
      <ThemedText type="defaultSemiBold">Time</ThemedText>
      <ThemedText>{formatTime(elapsedTime)}</ThemedText>
    </View>
  </View>
);

type TrackingButtonProps = {
  isTracking: boolean;
  onPress: () => void;
};

const TrackingButton = ({ isTracking, onPress }: TrackingButtonProps) => (
  <TouchableOpacity
    style={[styles.trackButton, isTracking && styles.stopButton]}
    onPress={onPress}
  >
    <ThemedText style={styles.buttonText}>
      {isTracking ? "Stop Walk" : "Start Walk"}
    </ThemedText>
  </TouchableOpacity>
);

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

const calculatePace = (distance: number, elapsedTime: number): string => {
  if (distance === 0 || elapsedTime === 0) return "0:00";
  const paceInSeconds = elapsedTime / (distance / 1000);
  const paceMinutes = Math.floor(paceInSeconds / 60);
  const paceSeconds = Math.floor(paceInSeconds % 60);
  return `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}`;
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export default function TrackingScreen() {
  const [locationPermission, setLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routePoints, setRoutePoints] = useState<LocationPoint[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPetSelect, setShowPetSelect] = useState(false);
  const mapRef = useRef<MapView>(null);
  const summaryMapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { selectedPet } = useSelector((state: RootState) => state.pets);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!selectedPet) {
      setShowPetSelect(true);
    } else {
      if (showPetSelect) setShowPetSelect(false);
    }
  }, [selectedPet]);

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initializeLocation = async () => await checkLocationPermission();
    initializeLocation();
  }, []);

  const checkLocationPermission = async () => {
    try {
      // Check both foreground and background permissions
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();

      // If both permissions are already granted
      if (foregroundStatus === "granted" && backgroundStatus === "granted") {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        });
        setCurrentLocation(location);
        return true;
      }

      // Request foreground permission first
      const { status: newForegroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (newForegroundStatus !== "granted") {
        Alert.alert(
          "Location Access Needed",
          "To track your pet's walks and record their routes, we need access to your location. You can enable this in your device settings.",
          [
            { text: "Not Now", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
              style: "default"
            }
          ]
        );
        setLocationPermission(false);
        return false;
      }

      // Request background permission
      const { status: newBackgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (newBackgroundStatus !== "granted") {
        Alert.alert(
          "Background Location Access Needed",
          "To continue tracking your pet's walks even when the app is in the background, we need background location access. You can enable this in your device settings.",
          [
            {
              text: "Continue without background tracking",
              onPress: async () => {
                const location = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.BestForNavigation
                });
                setCurrentLocation(location);
                setLocationPermission(true);
                return true;
              }
            },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
              style: "default"
            }
          ]
        );
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });
      setCurrentLocation(location);
      setLocationPermission(true);
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert(
        "Error",
        "Failed to access location services. Please check your device settings."
      );
      setLocationPermission(false);
      return false;
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTracking(false);
    setShowSummary(true);
    router.back();
  };

  const startTracking = async () => {
    if (!selectedPet) {
      setShowPetSelect(true);
      return;
    }

    const hasPermission = await checkLocationPermission();
    if (!hasPermission) return;

    setIsTracking(true);
    setRoutePoints([]);
    setElapsedTime(0);
    setDistance(0);

    // Start location tracking
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10, // Update every 10 meters
        timeInterval: 5000 // Or every 5 seconds
      },
      (location) => {
        const newPoint = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp
        };

        setRoutePoints((current) => {
          const updated = [...current, newPoint];
          // Calculate new distance
          if (current.length > 0) {
            const lastPoint = current[current.length - 1];
            const newDistance = calculateDistance(
              lastPoint.latitude,
              lastPoint.longitude,
              newPoint.latitude,
              newPoint.longitude
            );
            setDistance((prev) => prev + newDistance);
          }
          return updated;
        });

        setCurrentLocation(location);
      }
    );

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const handleShare = async () => {
    try {
      if (summaryMapRef.current) {
        const uri = await captureRef(summaryMapRef, {
          format: "png",
          quality: 0.8
        });

        const message = `🐾 ${
          selectedPet?.name
        } just had a wonderful walk! 🦮\n🏃‍♂️ Distance: ${formatDistance(
          distance
        )}km\n⏱ Time: ${formatTime(elapsedTime)}\n⚡️ Pace: ${calculatePace(
          distance,
          elapsedTime
        )} min/km\n\n🐕 Proud pet parent moment! 🎉`;

        await Share.share({
          message,
          url: uri
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Could not share your walk");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
      </TouchableOpacity>
      {!locationPermission ? (
        <View style={styles.permissionContainer}>
          <IconSymbol name="location.slash.fill" size={64} color="#FF6B6B" />
          <ThemedText style={styles.permissionText}>
            Location access is required to track your pet's walks.
          </ThemedText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={checkLocationPermission}
          >
            <ThemedText style={styles.permissionButtonText}>
              Enable Location
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {currentLocation && (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02
              }}
            >
              {routePoints.length > 1 && (
                <Polyline
                  coordinates={routePoints}
                  strokeColor="#4CAF50"
                  strokeWidth={3}
                />
              )}
            </MapView>
          )}

          {isTracking && (
            <TrackingStats distance={distance} elapsedTime={elapsedTime} />
          )}

          <TrackingButton
            isTracking={isTracking}
            onPress={isTracking ? stopTracking : startTracking}
          />
        </>
      )}

      <SelectPetModal
        visible={showPetSelect}
        onClose={() => setShowPetSelect(false)}
        onSelect={() => {
          setShowPetSelect(false);
          if (selectedPet) {
            startTracking();
          }
        }}
      />

      {showSummary && currentLocation && (
        <WalkSummaryModal
          visible={showSummary}
          onClose={() => setShowSummary(false)}
          selectedPet={selectedPet}
          routePoints={routePoints}
          currentLocation={currentLocation}
          distance={distance}
          elapsedTime={elapsedTime}
          summaryMapRef={summaryMapRef}
          handleShare={handleShare}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 54,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
      },
      android: {
        elevation: 5
      }
    })
  },
  container: {
    flex: 1
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16
  },
  permissionText: {
    textAlign: "center",
    marginHorizontal: 32
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  map: {
    flex: 1
  },
  statsContainer: {
    position: "absolute",
    top: 44,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
      },
      android: {
        elevation: 5
      }
    })
  },
  stat: {
    alignItems: "center",
    minWidth: 80
  },
  trackButton: {
    position: "absolute",
    bottom: Platform.select({
      ios: 100,
      android: 80
    }),
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
      },
      android: {
        elevation: 5
      }
    })
  },
  stopButton: {
    backgroundColor: "#FF5252"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  closeButton: {
    padding: 5
  },
  petName: {
    marginTop: 4,
    opacity: 0.7
  },
  summaryMap: {
    height: 200,
    marginVertical: 16,
    borderRadius: 12
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16
  },
  summaryStat: {
    alignItems: "center"
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    marginTop: 16
  },
  shareButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "600"
  }
});
