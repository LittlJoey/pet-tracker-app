import { SelectPetModal } from "@/components/SelectPetModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { AppDispatch, RootState } from "@/store";
import {
  addActivity,
  fetchActivityStats,
  fetchTodayActivities
} from "@/store/activitiesSlice";
import { addTrack, fetchTracks } from "@/store/trackSlice";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Modal,
  Platform,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { captureRef } from "react-native-view-shot";
import { useDispatch, useSelector } from "react-redux";
import { Pet } from "../(tabs)/pets";

type LocationPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type LocationPermissionState =
  | "none"
  | "requesting"
  | "foreground-only"
  | "full"
  | "denied";

type WalkCompletionModalProps = {
  visible: boolean;
  onCancel: () => void;
  onFinish: () => void;
  selectedPet: Pet | null;
  distance: number;
  elapsedTime: number;
  isUploading: boolean;
};

const WalkCompletionModal = ({
  visible,
  onCancel,
  onFinish,
  selectedPet,
  distance,
  elapsedTime,
  isUploading
}: WalkCompletionModalProps) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onCancel}
  >
    <View style={styles.completionModalOverlay}>
      <ThemedView style={styles.completionModalContent}>
        <View style={styles.completionModalHeader}>
          <IconSymbol name="checkmark.circle.fill" size={48} color="#4CAF50" />
          <ThemedText style={styles.completionTitle}>
            Walk Completed!
          </ThemedText>
          <ThemedText style={styles.completionSubtitle}>
            Great job walking with {selectedPet?.name}!
          </ThemedText>
        </View>

        <View style={styles.completionStats}>
          <View style={styles.completionStatItem}>
            <IconSymbol name="figure.walk" size={24} color="#4CAF50" />
            <ThemedText style={styles.completionStatLabel}>Distance</ThemedText>
            <ThemedText style={styles.completionStatValue}>
              {formatDistance(distance)} km
            </ThemedText>
          </View>
          <View style={styles.completionStatItem}>
            <IconSymbol name="clock" size={24} color="#4CAF50" />
            <ThemedText style={styles.completionStatLabel}>Duration</ThemedText>
            <ThemedText style={styles.completionStatValue}>
              {formatTime(elapsedTime)}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.completionMessage}>
          Would you like to save this walk to your pet's activity history?
        </ThemedText>

        <View style={styles.completionButtons}>
          <TouchableOpacity
            style={styles.completionCancelButton}
            onPress={onCancel}
            disabled={isUploading}
          >
            <ThemedText style={styles.completionCancelText}>
              Discard Walk
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completionFinishButton,
              isUploading && styles.uploadingButton
            ]}
            onPress={onFinish}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
            )}
            <ThemedText style={styles.completionFinishText}>
              {isUploading ? "Saving..." : "Save Walk"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </View>
  </Modal>
);

type WalkSummaryModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedPet: Pet | null;
  routePoints: LocationPoint[];
  currentLocation: Location.LocationObject;
  distance: number;
  elapsedTime: number;
  summaryMapRef: React.RefObject<MapView | null>;
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
  isTracking: boolean;
};

const TrackingStats = ({
  distance,
  elapsedTime,
  isTracking
}: TrackingStatsProps) => (
  <View style={styles.statsOverlay}>
    <View style={styles.statsCard}>
      <View style={styles.statGroup}>
        <ThemedText style={styles.statLabel}>Distance</ThemedText>
        <ThemedText style={styles.statValue}>
          {formatDistance(distance)}
        </ThemedText>
        <ThemedText style={styles.statUnit}>km</ThemedText>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statGroup}>
        <ThemedText style={styles.statLabel}>Time</ThemedText>
        <ThemedText style={styles.statValue}>
          {formatTime(elapsedTime)}
        </ThemedText>
        <ThemedText style={styles.statUnit}>min:sec</ThemedText>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statGroup}>
        <ThemedText style={styles.statLabel}>Pace</ThemedText>
        <ThemedText style={styles.statValue}>
          {isTracking
            ? calculatePace(distance, elapsedTime).split(":")[0]
            : "0"}
        </ThemedText>
        <ThemedText style={styles.statUnit}>min/km</ThemedText>
      </View>
    </View>
  </View>
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

type MusicApp = {
  name: string;
  icon: string;
  scheme: string;
  fallbackUrl: string;
  color: string;
};

const musicApps: MusicApp[] = [
  {
    name: "Spotify",
    icon: "house.fill",
    scheme: "spotify://",
    fallbackUrl: "https://open.spotify.com",
    color: "#1DB954"
  },
  {
    name: "Apple Music",
    icon: "house.fill",
    scheme: "music://",
    fallbackUrl: "https://music.apple.com",
    color: "#FA243C"
  },
  {
    name: "YouTube Music",
    icon: "house.fill",
    scheme: "youtubemusic://",
    fallbackUrl: "https://music.youtube.com",
    color: "#FF0000"
  },
  {
    name: "Pandora",
    icon: "house.fill",
    scheme: "pandora://",
    fallbackUrl: "https://pandora.com",
    color: "#005483"
  },
  {
    name: "Amazon Music",
    icon: "house.fill",
    scheme: "amazonmusic://",
    fallbackUrl: "https://music.amazon.com",
    color: "#FF9900"
  },
  {
    name: "SoundCloud",
    icon: "house.fill",
    scheme: "soundcloud://",
    fallbackUrl: "https://soundcloud.com",
    color: "#FF5500"
  }
];

const handleMusicAppSelect = async (app: MusicApp) => {
  try {
    // Try the direct URL scheme first (for better app opening)
    const canOpen = await Linking.canOpenURL(app.scheme);

    if (canOpen) {
      await Linking.openURL(app.scheme);
    } else {
      // Use web URL which automatically redirects to app if installed
      await Linking.openURL(app.fallbackUrl);
    }
  } catch (error) {
    console.error("Error opening music app:", error);
    // Fallback to web URL if scheme fails
    try {
      await Linking.openURL(app.fallbackUrl);
    } catch (fallbackError) {
      console.error("Error opening fallback URL:", fallbackError);
      Alert.alert("Error", "Could not open the music app. Please try again.");
    }
  }
};

type MusicAppModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectApp: (app: MusicApp) => void;
};

const MusicAppModal = ({
  visible,
  onClose,
  onSelectApp
}: MusicAppModalProps) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.musicModalOverlay}>
      <ThemedView style={styles.musicModalContent}>
        <View style={styles.musicModalHeader}>
          <IconSymbol name="music.note" size={32} color="#4CAF50" />
          <ThemedText style={styles.musicModalTitle}>
            Choose Music App
          </ThemedText>
          <ThemedText style={styles.musicModalSubtitle}>
            Pick your soundtrack for the walk
          </ThemedText>
        </View>

        <View style={styles.musicAppsGrid}>
          {musicApps.map((app) => (
            <TouchableOpacity
              key={app.name}
              style={[styles.musicAppButton, { borderColor: app.color }]}
              onPress={() => {
                onClose();
                onSelectApp(app);
              }}
            >
              <View
                style={[styles.musicAppIcon, { backgroundColor: app.color }]}
              >
                <IconSymbol
                  name={app.icon as "house.fill"}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <ThemedText style={styles.musicAppName}>{app.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.musicModalCloseButton}
          onPress={onClose}
        >
          <ThemedText style={styles.musicModalCloseText}>Cancel</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  </Modal>
);

export default function TrackingScreen() {
  const [locationPermission, setLocationPermission] =
    useState<LocationPermissionState>("none");
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routePoints, setRoutePoints] = useState<LocationPoint[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPetSelect, setShowPetSelect] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);
  const summaryMapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { selectedPet } = useSelector((state: RootState) => state.pets);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isTracking) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ]).start(() => {
          if (isTracking) pulse();
        });
      };
      pulse();
    }
  }, [isTracking, pulseAnim]);

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

  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      setLocationPermission("requesting");

      // Check current permissions
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();

      if (foregroundStatus === "granted") {
        // Check if we also have background permission
        const { status: backgroundStatus } =
          await Location.getBackgroundPermissionsAsync();

        const permissionState =
          backgroundStatus === "granted" ? "full" : "foreground-only";
        setLocationPermission(permissionState);

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        });
        setCurrentLocation(location);
        return true;
      }

      // Need to request foreground permission
      const { status: newForegroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (newForegroundStatus !== "granted") {
        setLocationPermission("denied");
        showLocationDeniedAlert();
        return false;
      }

      // Got foreground permission, now optionally ask for background
      setLocationPermission("foreground-only");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });
      setCurrentLocation(location);

      // Offer background permission for enhanced tracking
      offerBackgroundPermission();

      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setLocationPermission("denied");
      Alert.alert(
        "Location Error",
        "Unable to access location services. Please check your device settings and try again."
      );
      return false;
    }
  };

  const showLocationDeniedAlert = () => {
    Alert.alert(
      "Location Access Required",
      "Pet Tracker needs location access to record your walks with your pet. This helps track distance, route, and duration of your adventures together.",
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
  };

  const offerBackgroundPermission = () => {
    Alert.alert(
      "Enhanced Tracking Available",
      "For the best tracking experience, enable background location access. This allows the app to continue recording your walk even when your phone is locked or you switch to other apps.",
      [
        {
          text: "Continue with Basic Tracking",
          style: "cancel"
        },
        {
          text: "Enable Enhanced Tracking",
          onPress: requestBackgroundPermission,
          style: "default"
        }
      ]
    );
  };

  const requestBackgroundPermission = async () => {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission("full");
      }
      // If denied, we keep foreground-only permission
    } catch (error) {
      console.error("Error requesting background permission:", error);
      // Continue with foreground-only permission
    }
  };

  const saveWalkData = async (): Promise<boolean> => {
    if (!selectedPet || routePoints.length === 0) {
      Alert.alert("Error", "No walk data to save");
      return false;
    }

    try {
      setIsUploading(true);

      // Generate IDs
      const trackId = `track_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const activityId = `activity_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Get the most recent weight for calorie calculation
      const currentWeight =
        selectedPet.weightHistory?.[selectedPet.weightHistory.length - 1]
          ?.weight || 25;

      // 1. Save detailed track data (GPS route, detailed tracking info)
      const trackData = {
        id: trackId,
        pet_id: selectedPet.id,
        user_id: "", // Will be overridden by TracksDao with actual authenticated user
        track_date: new Date(
          routePoints[0]?.timestamp || Date.now()
        ).toISOString(),
        location: routePoints.map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude
        })),
        duration: elapsedTime, // Keep in seconds for tracks
        distance: distance // Keep in meters for tracks
      };

      // 2. Save activity summary (for activity logging and stats)
      const activityData = {
        id: activityId,
        pet_id: selectedPet.id,
        type: "walk" as const,
        title: `Walk with ${selectedPet.name}`,
        description: `Tracked walk covering ${formatDistance(
          distance
        )}km in ${formatTime(elapsedTime)}`,
        duration: Math.round(elapsedTime / 60), // Convert to minutes for activities
        distance: parseFloat(formatDistance(distance)), // Convert to kilometers for activities
        calories: Math.round(distance * 0.05 * currentWeight), // Calorie calculation
        activity_date: new Date(
          routePoints[0]?.timestamp || Date.now()
        ).toISOString(),
        metadata: {
          track_id: trackId, // Reference to the detailed track
          route_points: routePoints, // Also store in metadata for quick access
          start_time: new Date(
            routePoints[0]?.timestamp || Date.now()
          ).toISOString(),
          end_time: new Date(
            routePoints[routePoints.length - 1]?.timestamp || Date.now()
          ).toISOString(),
          pace_per_km: calculatePace(distance, elapsedTime),
          distance_meters: Math.round(distance),
          duration_seconds: elapsedTime,
          location: "GPS tracked",
          notes: "Automatically recorded from tracking session"
        }
      };

      // Save both track and activity in parallel
      const [trackResult, activityResult] = await Promise.all([
        dispatch(addTrack(trackData)),
        dispatch(addActivity(activityData))
      ]);

      // Check if both operations succeeded
      const trackSuccess = addTrack.fulfilled.match(trackResult);
      const activitySuccess = addActivity.fulfilled.match(activityResult);

      if (trackSuccess && activitySuccess) {
        console.log("Track saved successfully:", trackResult.payload);
        console.log("Activity saved successfully:", activityResult.payload);

        // Refresh data
        dispatch(fetchTracks(selectedPet.id));
        dispatch(fetchTodayActivities({ petId: selectedPet.id }));
        dispatch(fetchActivityStats({ petId: selectedPet.id }));

        return true;
      } else {
        const trackError = trackSuccess
          ? null
          : (trackResult.payload as string);
        const activityError = activitySuccess
          ? null
          : (activityResult.payload as string);
        throw new Error(
          `Save failed - Track: ${trackError || "OK"}, Activity: ${
            activityError || "OK"
          }`
        );
      }
    } catch (error) {
      console.error("Error saving walk data:", error);
      Alert.alert(
        "Save Failed",
        "Could not save your walk. Please check your internet connection and try again."
      );
      return false;
    } finally {
      setIsUploading(false);
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

    // Show completion confirmation modal
    setShowCompletionModal(true);
  };

  const handleWalkCompletion = async () => {
    const saveSuccess = await saveWalkData();

    setShowCompletionModal(false);

    if (saveSuccess) {
      // Show success message and then share modal
      setTimeout(() => {
        setShowSummary(true);
      }, 500);
    }
  };

  const handleDiscardWalk = () => {
    setShowCompletionModal(false);
    // Reset all tracking data
    setRoutePoints([]);
    setElapsedTime(0);
    setDistance(0);

    Alert.alert("Walk Discarded", "Your walk data has been discarded.", [
      { text: "OK", onPress: () => router.back() }
    ]);
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

  const renderPermissionScreen = () => {
    const isRequesting = locationPermission === "requesting";
    const isDenied = locationPermission === "denied";

    return (
      <View style={styles.permissionContainer}>
        <IconSymbol
          name={isRequesting ? "location.circle" : "location.slash.fill"}
          size={64}
          color={isRequesting ? "#4CAF50" : "#FF6B6B"}
        />
        <ThemedText style={styles.permissionTitle}>
          {isRequesting ? "Setting up location..." : "Location Access Required"}
        </ThemedText>
        <ThemedText style={styles.permissionText}>
          {isRequesting
            ? "Please wait while we set up location services for tracking your pet's walks."
            : isDenied
            ? "Pet Tracker needs location access to record your walks. You can enable this in your device settings."
            : "Location access is required to track your pet's walks and record their routes."}
        </ThemedText>
        {!isRequesting && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={
              isDenied
                ? () => {
                    if (Platform.OS === "ios") {
                      Linking.openURL("app-settings:");
                    } else {
                      Linking.openSettings();
                    }
                  }
                : checkLocationPermission
            }
          >
            <ThemedText style={styles.permissionButtonText}>
              {isDenied ? "Open Settings" : "Enable Location"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const hasValidPermission =
    locationPermission === "foreground-only" || locationPermission === "full";

  const getMotivationalText = () => {
    if (!selectedPet) return "SELECT A\nPET FIRST";
    if (isTracking) return "WALK IN\nPROGRESS";
    return "ARE YOU\nREADY?";
  };

  const getSubtitle = () => {
    if (!selectedPet) return "Choose your adventure buddy";
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric"
    };
    return today.toLocaleDateString("en-US", options);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {!hasValidPermission ? (
        renderPermissionScreen()
      ) : (
        <>
          {/* Map Background */}
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
              showsUserLocation={true}
              showsMyLocationButton={false}
              toolbarEnabled={false}
            >
              {routePoints.length > 1 && (
                <Polyline
                  coordinates={routePoints}
                  strokeColor="#4CAF50"
                  strokeWidth={4}
                  lineDashPattern={[1]}
                />
              )}
            </MapView>
          )}

          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />

          {/* Header Content */}
          <View style={styles.headerContent}>
            {/* Status Bar Space */}
            <View style={styles.statusBarSpace} />

            {/* Navigation Header */}
            <View style={styles.navigationHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <IconSymbol name="chevron.left" size={24} color="#121212" />
              </TouchableOpacity>

              <View style={styles.titleSection}>
                <ThemedText style={styles.mainTitle}>
                  {isTracking
                    ? "Tracking"
                    : selectedPet
                    ? selectedPet.name
                    : "Walk"}
                </ThemedText>
                <ThemedText style={styles.subtitle}>{getSubtitle()}</ThemedText>
              </View>

              <TouchableOpacity
                style={styles.playlistButton}
                onPress={() => setShowMusicModal(true)}
              >
                <IconSymbol name="music.note" size={20} color="#121212" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Stats Overlay - only show when tracking */}
            {isTracking && (
              <TrackingStats
                distance={distance}
                elapsedTime={elapsedTime}
                isTracking={isTracking}
              />
            )}

            {/* Bottom Content */}
          </View>
          <View style={styles.bottomContent}>
            <ThemedText style={styles.motivationalText}>
              {getMotivationalText()}
            </ThemedText>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionButtonContainer}
              onPress={isTracking ? stopTracking : startTracking}
              disabled={!selectedPet && !isTracking}
            >
              <Animated.View
                style={[
                  styles.actionButton,
                  isTracking && { transform: [{ scale: pulseAnim }] },
                  !selectedPet && !isTracking && styles.disabledButton
                ]}
              >
                <ThemedText style={styles.actionButtonText}>
                  {isTracking ? "STOP" : !selectedPet ? "CHOOSE PET" : "GO!"}
                </ThemedText>
              </Animated.View>
            </TouchableOpacity>
          </View>
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

      <WalkCompletionModal
        visible={showCompletionModal}
        onCancel={handleDiscardWalk}
        onFinish={handleWalkCompletion}
        selectedPet={selectedPet}
        distance={distance}
        elapsedTime={elapsedTime}
        isUploading={isUploading}
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

      <MusicAppModal
        visible={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        onSelectApp={handleMusicAppSelect}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  statusBarSpace: {
    height: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24
  },
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      },
      android: {
        elevation: 3
      }
    })
  },
  titleSection: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#121212",
    letterSpacing: -0.3,
    lineHeight: 70
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#121212",
    opacity: 0.7,
    marginTop: 4
  },
  playlistButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      },
      android: {
        elevation: 3
      }
    })
  },
  mainContent: {
    flex: 1,
    justifyContent: "space-between"
  },
  statsOverlay: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 120 : 100
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12
      },
      android: {
        elevation: 8
      }
    })
  },
  statGroup: {
    alignItems: "center",
    flex: 1
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121212",
    marginTop: 4
  },
  statUnit: {
    fontSize: 10,
    fontWeight: "400",
    color: "#999",
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 15
  },
  bottomContent: {
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
    gap: 60
  },
  motivationalText: {
    fontSize: 70,
    fontWeight: "900",
    color: "#121212",
    textAlign: "center",
    lineHeight: 80,
    letterSpacing: -4
  },
  actionButtonContainer: {
    alignItems: "center"
  },
  actionButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16
      },
      android: {
        elevation: 12
      }
    })
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    ...Platform.select({
      ios: {
        shadowColor: "#CCCCCC"
      }
    })
  },
  actionButtonText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    lineHeight: 80
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    paddingHorizontal: 32,
    backgroundColor: "#F5F6F8"
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#121212"
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    color: "#121212"
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
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
  },
  completionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  completionModalContent: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340
  },
  completionModalHeader: {
    alignItems: "center",
    marginBottom: 24
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    color: "#121212"
  },
  completionSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
    color: "#121212"
  },
  completionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#F5F6F8",
    borderRadius: 12
  },
  completionStatItem: {
    alignItems: "center",
    flex: 1
  },
  completionStatLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    marginTop: 8,
    textTransform: "uppercase"
  },
  completionStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121212",
    marginTop: 4
  },
  completionMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    color: "#121212"
  },
  completionButtons: {
    flexDirection: "row",
    gap: 12
  },
  completionCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "transparent",
    alignItems: "center"
  },
  completionCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666"
  },
  completionFinishButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  uploadingButton: {
    backgroundColor: "#81C784"
  },
  completionFinishText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  musicModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  musicModalContent: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360
  },
  musicModalHeader: {
    alignItems: "center",
    marginBottom: 24
  },
  musicModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    color: "#121212"
  },
  musicModalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
    color: "#121212"
  },
  musicAppsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24
  },
  musicAppButton: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#F8F9FA"
  },
  musicAppIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  musicAppName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#121212"
  },
  musicModalCloseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center"
  },
  musicModalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666"
  }
});
