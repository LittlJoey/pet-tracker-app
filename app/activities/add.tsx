import { Pet } from "@/app/(tabs)/pets";
import { PetSelectionModal } from "@/components/PetSelectionModal";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { PetActivity } from "@/lib/dao/activitiesDao";
import { useAppDispatch, useAppSelector } from "@/store";
import { addActivity, updateActivity } from "@/store/activitiesSlice";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActivityType =
  | "walk"
  | "meal"
  | "medication"
  | "vet-visit"
  | "grooming"
  | "play";

interface ActivityTypeOption {
  type: ActivityType;
  label: string;
  icon:
    | "figure.walk"
    | "fork.knife.circle.fill"
    | "pills.circle.fill"
    | "cross.case.fill"
    | "scissors"
    | "gamecontroller.fill";
}

interface ActivityMetadata {
  // Generic fields that match ActivitiesDao structure
  location?: string;
  medication_name?: string;
  vet_name?: string;
  food_type?: string;
  toy_type?: string;
  notes?: string;

  // Additional fields for our extended functionality
  route?: string;
  amount?: string;
  mealTime?: string;
  dosage?: string;
  frequency?: string;
  reason?: string;
  diagnosis?: string;
  nextAppointment?: string;
  services?: string;
  groomer?: string;
  cost?: number;
  playType?: string;
  toys?: string;
}

const ACTIVITY_TYPES: ActivityTypeOption[] = [
  { type: "walk", label: "Walk", icon: "figure.walk" },
  { type: "meal", label: "Meal", icon: "fork.knife.circle.fill" },
  { type: "medication", label: "Medication", icon: "pills.circle.fill" },
  { type: "vet-visit", label: "Vet Visit", icon: "cross.case.fill" },
  { type: "grooming", label: "Grooming", icon: "scissors" },
  { type: "play", label: "Play Time", icon: "gamecontroller.fill" }
];

// Predefined options for various fields
const MEAL_TIME_OPTIONS = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Snack", value: "snack" },
  { label: "Late Night", value: "late-night" }
];

const FOOD_TYPE_OPTIONS = [
  { label: "Dry Kibble", value: "dry-kibble" },
  { label: "Wet Food", value: "wet-food" },
  { label: "Raw Food", value: "raw-food" },
  { label: "Treats", value: "treats" },
  { label: "Supplements", value: "supplements" },
  { label: "Mixed", value: "mixed" }
];

const FREQUENCY_OPTIONS = [
  { label: "Once Daily", value: "once-daily" },
  { label: "Twice Daily", value: "twice-daily" },
  { label: "Three Times Daily", value: "three-times-daily" },
  { label: "As Needed", value: "as-needed" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" }
];

const PLAY_TYPE_OPTIONS = [
  { label: "Fetch", value: "fetch" },
  { label: "Tug of War", value: "tug-of-war" },
  { label: "Chase", value: "chase" },
  { label: "Hide and Seek", value: "hide-and-seek" },
  { label: "Training", value: "training" },
  { label: "Free Play", value: "free-play" },
  { label: "Interactive Toys", value: "interactive-toys" }
];

const LOCATION_OPTIONS = [
  { label: "Park", value: "park" },
  { label: "Backyard", value: "backyard" },
  { label: "Indoors", value: "indoors" },
  { label: "Beach", value: "beach" },
  { label: "Dog Park", value: "dog-park" },
  { label: "Trail", value: "trail" },
  { label: "Street", value: "street" }
];

const GROOMING_SERVICES_OPTIONS = [
  { label: "Full Grooming", value: "full-grooming" },
  { label: "Bath Only", value: "bath-only" },
  { label: "Haircut", value: "haircut" },
  { label: "Nail Trim", value: "nail-trim" },
  { label: "Ear Cleaning", value: "ear-cleaning" },
  { label: "Teeth Cleaning", value: "teeth-cleaning" },
  { label: "Brush Out", value: "brush-out" }
];

const VISIT_REASON_OPTIONS = [
  { label: "Annual Checkup", value: "annual-checkup" },
  { label: "Vaccination", value: "vaccination" },
  { label: "Illness", value: "illness" },
  { label: "Injury", value: "injury" },
  { label: "Follow-up", value: "follow-up" },
  { label: "Emergency", value: "emergency" },
  { label: "Dental Care", value: "dental-care" },
  { label: "Surgery", value: "surgery" }
];

export default function AddActivityScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { petId, editId, editMode } = useLocalSearchParams<{
    petId?: string;
    editId?: string;
    editMode?: string;
  }>();
  const dispatch = useAppDispatch();

  const { pets, selectedPet } = useAppSelector((state) => state.pets);
  const { activities, loading } = useAppSelector((state) => state.activities);

  // Determine if we're in edit mode
  const isEditMode = editMode === "true" && editId;
  const existingActivity = isEditMode
    ? activities.find((a) => a.id === editId)
    : null;

  // Pet selection state - when no petId is provided
  const [selectedPetForActivity, setSelectedPetForActivity] = useState<
    string | null
  >(petId || existingActivity?.pet_id || selectedPet?.id || null);
  const [showPetModal, setShowPetModal] = useState(false);

  // Determine which pet to use
  const targetPet = selectedPetForActivity
    ? pets.find((p) => p.id === selectedPetForActivity)
    : null;

  // Activity-specific state
  const [selectedType, setSelectedType] = useState<ActivityType>("walk");
  const [title, setTitle] = useState("Morning Walk");
  const [description, setDescription] = useState("");

  // Walk-specific fields
  const [duration, setDuration] = useState("30");
  const [distance, setDistance] = useState("2.0");
  const [calories, setCalories] = useState("75");
  const [route, setRoute] = useState("");

  // Meal-specific fields
  const [foodType, setFoodType] = useState("");
  const [amount, setAmount] = useState("");
  const [mealTime, setMealTime] = useState("breakfast");

  // Medication-specific fields
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("once-daily");

  // Vet visit-specific fields
  const [reason, setReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");
  const [vetName, setVetName] = useState("");

  // Grooming-specific fields
  const [services, setServices] = useState("");
  const [groomer, setGroomer] = useState("");
  const [cost, setCost] = useState("");

  // Play-specific fields
  const [playType, setPlayType] = useState("");
  const [location, setLocation] = useState("");
  const [toys, setToys] = useState("");

  // Load existing activity data when in edit mode
  useEffect(() => {
    if (isEditMode && existingActivity) {
      console.log("Loading existing activity for edit:", existingActivity);

      setSelectedType(existingActivity.type as ActivityType);
      setTitle(existingActivity.title);
      setDescription(existingActivity.description || "");

      // Load common fields
      setDuration(existingActivity.duration?.toString() || "");
      setDistance(existingActivity.distance?.toString() || "");
      setCalories(existingActivity.calories?.toString() || "");

      // Load metadata-specific fields
      const metadata = existingActivity.metadata || {};

      // Walk fields
      setRoute(metadata.route || "");

      // Meal fields
      setFoodType(metadata.food_type || "");
      setAmount(metadata.amount || "");
      setMealTime(metadata.mealTime || "breakfast");

      // Medication fields
      setMedicineName(metadata.medication_name || "");
      setDosage(metadata.dosage || "");
      setFrequency(metadata.frequency || "once-daily");

      // Vet visit fields
      setReason(metadata.reason || "");
      setDiagnosis(metadata.diagnosis || "");
      setNextAppointment(metadata.nextAppointment || "");
      setVetName(metadata.vet_name || "");

      // Grooming fields
      setServices(metadata.services || "");
      setGroomer(metadata.groomer || "");
      setCost(metadata.cost?.toString() || "");

      // Play fields
      setPlayType(metadata.playType || "");
      setLocation(metadata.location || "");
      setToys(metadata.toy_type || "");
    }
  }, [isEditMode, existingActivity]);

  // Helper function to show option picker
  const showOptionPicker = (
    title: string,
    options: { label: string; value: string }[],
    currentValue: string,
    onSelect: (value: string) => void,
    allowCustom = false
  ) => {
    if (Platform.OS === "ios") {
      const actionOptions = options.map((option) => option.label);
      if (allowCustom) {
        actionOptions.push("Custom...");
      }
      actionOptions.push("Cancel");

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: actionOptions,
          cancelButtonIndex: actionOptions.length - 1
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            onSelect(options[buttonIndex].value);
          } else if (allowCustom && buttonIndex === options.length - 1) {
            // Handle custom input if needed
            Alert.prompt(
              "Custom Value",
              `Enter custom ${title.toLowerCase()}:`,
              (text) => {
                if (text && text.trim()) {
                  onSelect(text.trim());
                }
              }
            );
          }
        }
      );
    } else {
      // For Android, use Alert with buttons (simplified version)
      const buttons = options.map((option) => ({
        text: option.label,
        onPress: () => onSelect(option.value)
      }));

      if (allowCustom) {
        buttons.push({
          text: "Custom...",
          onPress: () => {
            Alert.prompt(
              "Custom Value",
              `Enter custom ${title.toLowerCase()}:`,
              (text) => {
                if (text && text.trim()) {
                  onSelect(text.trim());
                }
              }
            );
          }
        });
      }

      buttons.push({ text: "Cancel", onPress: () => {} });

      Alert.alert(title, "Select an option:", buttons);
    }
  };

  // Pet selection picker
  const showPetPicker = () => {
    setShowPetModal(true);
  };

  const handlePetSelect = (pet: Pet) => {
    setSelectedPetForActivity(pet.id);
  };

  // Helper function to get display label for a value
  const getDisplayLabel = (
    value: string,
    options: { label: string; value: string }[]
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const getActivityColor = (type: ActivityType) => {
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

  const getDefaultTitle = (type: ActivityType) => {
    switch (type) {
      case "walk":
        return "Morning Walk";
      case "meal":
        return "Breakfast";
      case "medication":
        return "Daily Medication";
      case "vet-visit":
        return "Vet Checkup";
      case "grooming":
        return "Grooming Session";
      case "play":
        return "Play Time";
      default:
        return "";
    }
  };

  const handleTypeChange = (type: ActivityType) => {
    setSelectedType(type);

    // Always update title to the default for the selected type
    setTitle(getDefaultTitle(type));

    // Reset all fields to defaults
    setDescription("");

    // Reset activity-specific fields
    if (type === "walk") {
      setDuration("30");
      setDistance("2.0");
      setCalories("75");
      setRoute("");
    } else if (type === "meal") {
      setDuration("15");
      setFoodType("");
      setAmount("");
      setMealTime("breakfast");
    } else if (type === "medication") {
      setDuration("5");
      setMedicineName("");
      setDosage("");
      setFrequency("once-daily");
    } else if (type === "vet-visit") {
      setDuration("60");
      setReason("");
      setDiagnosis("");
      setNextAppointment("");
      setVetName("");
    } else if (type === "grooming") {
      setDuration("45");
      setServices("");
      setGroomer("");
      setCost("");
    } else if (type === "play") {
      setDuration("20");
      setPlayType("");
      setLocation("");
      setToys("");
    }

    // Clear non-relevant fields
    if (type !== "walk") {
      setDistance("");
      setCalories("");
      setRoute("");
    }
    if (type !== "meal") {
      setFoodType("");
      setAmount("");
      setMealTime("breakfast");
    }
    if (type !== "medication") {
      setMedicineName("");
      setDosage("");
      setFrequency("once-daily");
    }
    if (type !== "vet-visit") {
      setReason("");
      setDiagnosis("");
      setNextAppointment("");
      setVetName("");
    }
    if (type !== "grooming") {
      setServices("");
      setGroomer("");
      setCost("");
    }
    if (type !== "play") {
      setPlayType("");
      setLocation("");
      setToys("");
    }
  };

  const renderActivitySpecificFields = () => {
    switch (selectedType) {
      case "walk":
        return (
          <>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Duration (mins)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="30"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Distance (km)</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="2.0"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Calories</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="75"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Route (Optional)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={route}
                  onChangeText={setRoute}
                  placeholder="Park trail"
                  placeholderTextColor={Colors[colorScheme].icon}
                />
              </View>
            </View>
          </>
        );

      case "meal":
        return (
          <>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Meal Time</ThemedText>
                <TouchableOpacity
                  style={[styles.textInput, styles.picker]}
                  onPress={() => {
                    showOptionPicker(
                      "Meal Time",
                      MEAL_TIME_OPTIONS,
                      mealTime,
                      setMealTime
                    );
                  }}
                >
                  <ThemedText style={{ color: Colors[colorScheme].text }}>
                    {getDisplayLabel(mealTime, MEAL_TIME_OPTIONS)}
                  </ThemedText>
                  <IconSymbol
                    name="chevron.down"
                    size={16}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Duration (mins)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="15"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Food Type</ThemedText>
              <TouchableOpacity
                style={[styles.textInput, styles.picker]}
                onPress={() =>
                  showOptionPicker(
                    "Food Type",
                    FOOD_TYPE_OPTIONS,
                    foodType,
                    setFoodType,
                    true
                  )
                }
              >
                <ThemedText style={{ color: Colors[colorScheme].text }}>
                  {foodType
                    ? getDisplayLabel(foodType, FOOD_TYPE_OPTIONS)
                    : "Select food type"}
                </ThemedText>
                <IconSymbol
                  name="chevron.down"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Amount</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={amount}
                onChangeText={setAmount}
                placeholder="1 cup, 200g..."
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </View>
          </>
        );

      case "medication":
        return (
          <>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Medicine Name</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={medicineName}
                onChangeText={setMedicineName}
                placeholder="Medicine name"
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Dosage</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="10mg, 1 tablet..."
                  placeholderTextColor={Colors[colorScheme].icon}
                />
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Frequency</ThemedText>
                <TouchableOpacity
                  style={[styles.textInput, styles.picker]}
                  onPress={() => {
                    showOptionPicker(
                      "Frequency",
                      FREQUENCY_OPTIONS,
                      frequency,
                      setFrequency
                    );
                  }}
                >
                  <ThemedText style={{ color: Colors[colorScheme].text }}>
                    {getDisplayLabel(frequency, FREQUENCY_OPTIONS)}
                  </ThemedText>
                  <IconSymbol
                    name="chevron.down"
                    size={16}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Duration (mins)</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={duration}
                onChangeText={setDuration}
                placeholder="5"
                placeholderTextColor={Colors[colorScheme].icon}
                keyboardType="numeric"
              />
            </View>
          </>
        );

      case "vet-visit":
        return (
          <>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Vet Name</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={vetName}
                onChangeText={setVetName}
                placeholder="Dr. Smith"
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Duration (mins)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="60"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Next Appointment
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={nextAppointment}
                  onChangeText={setNextAppointment}
                  placeholder="6 months"
                  placeholderTextColor={Colors[colorScheme].icon}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                Reason for Visit
              </ThemedText>
              <TouchableOpacity
                style={[styles.textInput, styles.picker]}
                onPress={() =>
                  showOptionPicker(
                    "Visit Reason",
                    VISIT_REASON_OPTIONS,
                    reason,
                    setReason,
                    true
                  )
                }
              >
                <ThemedText style={{ color: Colors[colorScheme].text }}>
                  {reason
                    ? getDisplayLabel(reason, VISIT_REASON_OPTIONS)
                    : "Select visit reason"}
                </ThemedText>
                <IconSymbol
                  name="chevron.down"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Diagnosis/Notes</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={diagnosis}
                onChangeText={setDiagnosis}
                placeholder="Vet findings and recommendations"
                placeholderTextColor={Colors[colorScheme].icon}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case "grooming":
        return (
          <>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Duration (mins)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="45"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Cost ($)</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={cost}
                  onChangeText={setCost}
                  placeholder="50"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Groomer</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={groomer}
                onChangeText={setGroomer}
                placeholder="Groomer name or 'Self'"
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Services</ThemedText>
              <TouchableOpacity
                style={[styles.textInput, styles.picker]}
                onPress={() =>
                  showOptionPicker(
                    "Grooming Services",
                    GROOMING_SERVICES_OPTIONS,
                    services,
                    setServices,
                    true
                  )
                }
              >
                <ThemedText style={{ color: Colors[colorScheme].text }}>
                  {services
                    ? getDisplayLabel(services, GROOMING_SERVICES_OPTIONS)
                    : "Select grooming services"}
                </ThemedText>
                <IconSymbol
                  name="chevron.down"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            </View>
          </>
        );

      case "play":
        return (
          <>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>
                  Duration (mins)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="20"
                  placeholderTextColor={Colors[colorScheme].icon}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldHalf}>
                <ThemedText style={styles.inputLabel}>Location</ThemedText>
                <TouchableOpacity
                  style={[styles.textInput, styles.picker]}
                  onPress={() =>
                    showOptionPicker(
                      "Location",
                      LOCATION_OPTIONS,
                      location,
                      setLocation,
                      true
                    )
                  }
                >
                  <ThemedText style={{ color: Colors[colorScheme].text }}>
                    {location
                      ? getDisplayLabel(location, LOCATION_OPTIONS)
                      : "Select location"}
                  </ThemedText>
                  <IconSymbol
                    name="chevron.down"
                    size={16}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Play Type</ThemedText>
              <TouchableOpacity
                style={[styles.textInput, styles.picker]}
                onPress={() =>
                  showOptionPicker(
                    "Play Type",
                    PLAY_TYPE_OPTIONS,
                    playType,
                    setPlayType,
                    true
                  )
                }
              >
                <ThemedText style={{ color: Colors[colorScheme].text }}>
                  {playType
                    ? getDisplayLabel(playType, PLAY_TYPE_OPTIONS)
                    : "Select play type"}
                </ThemedText>
                <IconSymbol
                  name="chevron.down"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Toys Used</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: Colors[colorScheme].border,
                    color: Colors[colorScheme].text
                  }
                ]}
                value={toys}
                onChangeText={setToys}
                placeholder="Ball, rope toy, frisbee..."
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const handleSave = async () => {
    console.log("handleSave called, isEditMode:", isEditMode);
    console.log("targetPet:", targetPet);
    console.log("title:", title);

    if (!targetPet) {
      Alert.alert("Error", "Please select a pet first");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter an activity title");
      return;
    }

    try {
      console.log("Building activity data...");

      // Check authentication first
      const { supabase } = await import("@/lib/supabase");
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      console.log("Current user:", user);
      console.log("Auth error:", authError);

      if (!user) {
        Alert.alert("Error", "You must be logged in to save activities");
        return;
      }

      // Collect activity-specific metadata
      const metadata: ActivityMetadata = {};

      switch (selectedType) {
        case "walk":
          metadata.route = route || undefined;
          break;
        case "meal":
          metadata.food_type = foodType || undefined;
          metadata.amount = amount || undefined;
          metadata.mealTime = mealTime;
          break;
        case "medication":
          metadata.medication_name = medicineName || undefined;
          metadata.dosage = dosage || undefined;
          metadata.frequency = frequency;
          break;
        case "vet-visit":
          metadata.vet_name = vetName || undefined;
          metadata.reason = reason || undefined;
          metadata.diagnosis = diagnosis || undefined;
          metadata.nextAppointment = nextAppointment || undefined;
          break;
        case "grooming":
          metadata.services = services || undefined;
          metadata.groomer = groomer || undefined;
          metadata.cost = cost ? parseFloat(cost) : undefined;
          break;
        case "play":
          metadata.playType = playType || undefined;
          metadata.location = location || undefined;
          metadata.toy_type = toys || undefined;
          break;
      }

      if (isEditMode && existingActivity) {
        // Update existing activity
        const updatedActivity: PetActivity = {
          ...existingActivity,
          pet_id: targetPet.id,
          type: selectedType,
          title: title.trim(),
          description: description.trim() || undefined,
          duration: duration ? parseInt(duration) : undefined,
          distance: distance ? parseFloat(distance) : undefined,
          calories: calories ? parseInt(calories) : undefined,
          metadata,
          updated_at: new Date().toISOString()
        };

        console.log("Activity data to update:", updatedActivity);
        console.log("Dispatching updateActivity...");

        const result = await dispatch(updateActivity(updatedActivity)).unwrap();
        console.log("updateActivity result:", result);

        Alert.alert("Success", "Activity updated successfully!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        // Create new activity
        const activityData: Omit<
          PetActivity,
          "user_id" | "created_at" | "updated_at"
        > = {
          id: `activity_${Date.now()}`,
          pet_id: targetPet.id,
          type: selectedType,
          title: title.trim(),
          description: description.trim() || undefined,
          duration: duration ? parseInt(duration) : undefined,
          distance: distance ? parseFloat(distance) : undefined,
          calories: calories ? parseInt(calories) : undefined,
          activity_date: new Date().toISOString(),
          metadata
        };

        console.log("Activity data to save:", activityData);
        console.log("Dispatching addActivity...");

        const result = await dispatch(addActivity(activityData)).unwrap();
        console.log("addActivity result:", result);

        Alert.alert("Success", "Activity added successfully!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${
              isEditMode ? "update" : "add"
            } activity. Please try again.`;
      Alert.alert("Error", errorMessage);
    }
  };

  if (!targetPet && pets.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background }
        ]}
      >
        <View style={styles.emptyContainer}>
          <IconSymbol
            name="pawprint.fill"
            size={48}
            color={Colors[colorScheme].icon}
          />
          <ThemedText style={styles.emptyTitle} type="title">
            No Pets Found
          </ThemedText>
          <ThemedText
            style={[styles.emptyMessage, { color: Colors[colorScheme].icon }]}
          >
            Please add a pet first to track activities.
          </ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background }
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: Colors[colorScheme].border }
          ]}
        >
          <ThemedText style={styles.headerTitle} type="title">
            {isEditMode ? "Edit Activity" : "Add Activity"}
            {targetPet ? ` for ${targetPet.name}` : ""}
          </ThemedText>
        </View>

        {/* Pet Selection (when no specific pet is pre-selected) */}
        {!petId && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type="subtitle">
              Select Pet
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.petSelector,
                {
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: targetPet
                    ? "#4CAF50"
                    : Colors[colorScheme].border
                }
              ]}
              onPress={showPetPicker}
            >
              <View style={styles.petSelectorContent}>
                {targetPet ? (
                  <>
                    <IconSymbol
                      name="pawprint.fill"
                      size={20}
                      color="#4CAF50"
                    />
                    <ThemedText style={styles.petSelectorText}>
                      {targetPet.name} ({targetPet.species})
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <IconSymbol
                      name="plus.circle.fill"
                      size={20}
                      color={Colors[colorScheme].icon}
                    />
                    <ThemedText
                      style={[
                        styles.petSelectorText,
                        { color: Colors[colorScheme].icon }
                      ]}
                    >
                      Select a pet for this activity
                    </ThemedText>
                  </>
                )}
                <IconSymbol
                  name="chevron.down"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Show activity form only when a pet is selected */}
        {targetPet && (
          <>
            {/* Activity Type Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type="subtitle">
                Activity Type
              </ThemedText>
              <View style={styles.typeGrid}>
                {ACTIVITY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeCard,
                      selectedType === type.type && {
                        backgroundColor: getActivityColor(type.type),
                        borderColor: getActivityColor(type.type)
                      }
                    ]}
                    onPress={() => handleTypeChange(type.type)}
                  >
                    <IconSymbol
                      name={type.icon}
                      size={24}
                      color={
                        selectedType === type.type
                          ? "#FFFFFF"
                          : Colors[colorScheme].icon
                      }
                    />
                    <ThemedText
                      style={[
                        styles.typeLabel,
                        selectedType === type.type && { color: "#FFFFFF" }
                      ]}
                    >
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Activity Details */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} type="subtitle">
                Details
              </ThemedText>

              {/* Activity Type Context */}
              <View style={styles.contextContainer}>
                <ThemedText
                  style={[
                    styles.contextText,
                    { color: Colors[colorScheme].icon }
                  ]}
                >
                  {selectedType === "walk" &&
                    "Track distance, duration, and calories burned"}
                  {selectedType === "meal" && "Record feeding time and notes"}
                  {selectedType === "medication" &&
                    "Log medication given and dosage"}
                  {selectedType === "vet-visit" &&
                    "Document vet appointment details"}
                  {selectedType === "grooming" &&
                    "Track grooming session details"}
                  {selectedType === "play" && "Record play time and activities"}
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Title</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={`Enter ${selectedType} title`}
                  placeholderTextColor={Colors[colorScheme].icon}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>
                  Notes (Optional)
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text
                    }
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add any notes about this activity"
                  placeholderTextColor={Colors[colorScheme].icon}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {renderActivitySpecificFields()}
            </View>
          </>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: getActivityColor(selectedType) },
            (loading || !targetPet) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={loading || !targetPet}
        >
          <ThemedText style={styles.saveButtonText}>
            {loading
              ? `${isEditMode ? "Updating" : "Saving"}...`
              : !targetPet
              ? "Select a Pet First"
              : `${isEditMode ? "Update" : "Save"} Activity`}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Pet Selection Modal */}
      <PetSelectionModal
        visible={showPetModal}
        pets={pets}
        selectedPetId={selectedPetForActivity || undefined}
        onSelectPet={handlePetSelect}
        onClose={() => setShowPetModal(false)}
        title="Select Pet for Activity"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 24
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  typeCard: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    gap: 8
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center"
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top"
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12
  },
  metricInput: {
    flex: 1
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5"
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600"
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40
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
  backButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  contextContainer: {
    marginBottom: 16
  },
  contextText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center"
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12
  },
  fieldHalf: {
    flex: 1
  },
  picker: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  petSelector: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    alignItems: "center"
  },
  petSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  petSelectorText: {
    fontSize: 16,
    fontWeight: "500"
  }
});
