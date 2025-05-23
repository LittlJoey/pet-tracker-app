import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  MEDICATION_OPTIONS,
  VACCINATION_OPTIONS,
  VET_VISIT_OPTIONS
} from "../constants/HealthOptions";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

type HealthRecordType = "vaccination" | "vetVisit" | "medication";

type HealthRecordModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (
    type: HealthRecordType,
    option: string,
    date: Date,
    notes?: string,
    nextDueDate?: Date
  ) => void;
};

export function HealthRecordModal({
  isVisible,
  onClose,
  onSave
}: HealthRecordModalProps) {
  const [selectedType, setSelectedType] =
    useState<HealthRecordType>("vaccination");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [enableReminder, setEnableReminder] = useState(true);
  const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>();
  const [recurrenceType, setRecurrenceType] = useState<
    "none" | "custom" | "auto"
  >("auto");

  const getOptionsForType = (type: HealthRecordType) => {
    switch (type) {
      case "vaccination":
        return VACCINATION_OPTIONS;
      case "vetVisit":
        return VET_VISIT_OPTIONS;
      case "medication":
        return MEDICATION_OPTIONS;
      default:
        return [];
    }
  };

  const calculateNextDueDate = (type: HealthRecordType, option: string) => {
    const now = new Date();
    switch (type) {
      case "vaccination":
        // Comprehensive vaccination schedules based on veterinary guidelines
        if (option.includes("Rabies")) {
          return new Date(now.setFullYear(now.getFullYear() + 3)); // Rabies: 3-year protocol after initial series
        } else if (option.includes("Bordetella")) {
          return new Date(now.setMonth(now.getMonth() + 6)); // Bordetella: Every 6 months for high-risk dogs
        } else if (option.includes("Distemper")) {
          return new Date(now.setFullYear(now.getFullYear() + 3)); // DHPP: 3-year protocol after initial series
        } else if (option.includes("Parvovirus")) {
          return new Date(now.setFullYear(now.getFullYear() + 3)); // Part of DHPP: 3-year protocol
        } else if (option.includes("Leptospirosis")) {
          return new Date(now.setFullYear(now.getFullYear() + 1)); // Annual booster required
        } else if (option.includes("FVRCP")) {
          return new Date(now.setFullYear(now.getFullYear() + 3)); // FVRCP for cats: 3-year protocol after initial series
        } else if (option.includes("FeLV")) {
          return new Date(now.setFullYear(now.getFullYear() + 1)); // FeLV for cats: Annual booster
        }
        return new Date(now.setFullYear(now.getFullYear() + 1)); // Default to annual for other vaccinations

      case "vetVisit":
        if (option.includes("Annual")) {
          return new Date(now.setFullYear(now.getFullYear() + 1)); // Standard annual check-up
        } else if (option.includes("Dental")) {
          return new Date(now.setFullYear(now.getFullYear() + 1)); // Annual dental cleaning recommended
        } else if (option.includes("Grooming")) {
          return new Date(now.setMonth(now.getMonth() + 2)); // Typical grooming interval: 6-8 weeks
        }
        return undefined; // No automatic scheduling for emergency or specific treatments

      case "medication":
        if (option.includes("Flea & Tick")) {
          return new Date(now.setMonth(now.getMonth() + 1)); // Monthly flea and tick prevention
        } else if (option.includes("Heartworm")) {
          return new Date(now.setMonth(now.getMonth() + 1)); // Monthly heartworm prevention
        } else if (option.includes("Antibiotics")) {
          return new Date(now.setDate(now.getDate() + 14)); // Typical antibiotic course: 14 days
        } else if (option.includes("Allergy")) {
          return new Date(now.setMonth(now.getMonth() + 1)); // Monthly allergy medication
        }
        return undefined; // No automatic scheduling for other medications

      default:
        return undefined;
    }
  };

  const handleSave = () => {
    if (selectedOption) {
      const finalNextDueDate = enableReminder
        ? recurrenceType === "auto"
          ? calculateNextDueDate(selectedType, selectedOption)
          : nextDueDate
        : undefined;
      onSave(
        selectedType,
        selectedOption,
        date,
        showNotesInput ? notes : undefined,
        finalNextDueDate
      );
      onClose();
    }
  };

  const TabButton = ({
    type,
    label,
    icon
  }: {
    type: HealthRecordType;
    label: string;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedType === type && styles.tabButtonActive
      ]}
      onPress={() => {
        setSelectedType(type);
        setSelectedOption("");
        setNotes("");
        setShowNotesInput(false);
        setDate(new Date());
        setShowDatePicker(false);
        setEnableReminder(true);
        setShowNextDueDatePicker(false);
        setNextDueDate(undefined);
        setRecurrenceType("auto");
      }}
    >
      <IconSymbol
        name={icon}
        size={24}
        color={selectedType === type ? "#4CAF50" : "#666666"}
      />
      <ThemedText
        style={[
          styles.tabButtonText,
          selectedType === type && styles.tabButtonTextActive
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const OptionCard = ({ option }: { option: string }) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.optionCard,
        selectedOption === option && styles.optionCardActive
      ]}
      onPress={() => {
        setSelectedOption(option);
        setShowNotesInput(option === "Other");
        if (option !== "Other") {
          setNotes("");
        }
      }}
    >
      <View style={styles.optionCardContent}>
        <IconSymbol
          name={selectedOption === option ? "checkmark.circle.fill" : "circle"}
          size={20}
          color={selectedOption === option ? "#FFFFFF" : "#666666"}
          style={styles.optionIcon}
        />
        <ThemedText
          style={[
            styles.optionText,
            selectedOption === option && styles.optionTextActive
          ]}
        >
          {option}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Add Health Record</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TabButton
              type="vaccination"
              label="Vaccination"
              icon="cross.case.fill"
            />
            <TabButton
              type="vetVisit"
              label="Vet Visit"
              icon="heart.text.square.fill"
            />
            <TabButton
              type="medication"
              label="Medication"
              icon="pills.circle.fill"
            />
          </View>

          <ScrollView
            style={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.optionsGrid}>
              {getOptionsForType(selectedType).map((option) => (
                <OptionCard key={option} option={option} />
              ))}
            </View>
          </ScrollView>

          {selectedOption && (
            <View style={styles.dateContainer}>
              <ThemedText style={styles.dateLabel}>Date</ThemedText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText>{date.toLocaleDateString()}</ThemedText>
                <IconSymbol name="calendar" size={20} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          )}

          {showNotesInput && (
            <View style={styles.notesContainer}>
              <ThemedText style={styles.notesLabel}>
                Additional Notes
              </ThemedText>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter additional details..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>
          )}

          {selectedOption && (
            <View style={styles.reminderContainer}>
              <View style={styles.reminderToggle}>
                <ThemedText style={styles.reminderLabel}>
                  Enable Reminder
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    enableReminder && styles.toggleButtonActive
                  ]}
                  onPress={() => setEnableReminder(!enableReminder)}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      enableReminder && styles.toggleKnobActive
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {enableReminder && (
                <View style={styles.reminderSettings}>
                  <View style={styles.recurrenceSelector}>
                    <TouchableOpacity
                      style={[
                        styles.recurrenceOption,
                        recurrenceType === "auto" &&
                          styles.recurrenceOptionActive
                      ]}
                      onPress={() => {
                        setRecurrenceType("auto");
                        setNextDueDate(
                          calculateNextDueDate(selectedType, selectedOption)
                        );
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.recurrenceText,
                          recurrenceType === "auto" &&
                            styles.recurrenceTextActive
                        ]}
                      >
                        Auto
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.recurrenceOption,
                        recurrenceType === "custom" &&
                          styles.recurrenceOptionActive
                      ]}
                      onPress={() => {
                        setRecurrenceType("custom");
                        setShowNextDueDatePicker(true);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.recurrenceText,
                          recurrenceType === "custom" &&
                            styles.recurrenceTextActive
                        ]}
                      >
                        Custom
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.recurrenceOption,
                        recurrenceType === "none" &&
                          styles.recurrenceOptionActive
                      ]}
                      onPress={() => {
                        setRecurrenceType("none");
                        setNextDueDate(undefined);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.recurrenceText,
                          recurrenceType === "none" &&
                            styles.recurrenceTextActive
                        ]}
                      >
                        None
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {recurrenceType === "custom" && (
                    <View style={styles.nextDueDateContainer}>
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowNextDueDatePicker(true)}
                      >
                        <ThemedText>
                          {nextDueDate
                            ? nextDueDate.toLocaleDateString()
                            : "Select next due date"}
                        </ThemedText>
                        <IconSymbol name="calendar" size={20} color="#666" />
                      </TouchableOpacity>
                      {showNextDueDatePicker && (
                        <DateTimePicker
                          value={nextDueDate || new Date()}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            setShowNextDueDatePicker(false);
                            if (selectedDate) {
                              setNextDueDate(selectedDate);
                            }
                          }}
                        />
                      )}
                    </View>
                  )}

                  {recurrenceType === "auto" && (
                    <ThemedText style={styles.reminderText}>
                      ℹ️ Next due date will be set automatically based on the
                      type
                    </ThemedText>
                  )}
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              !selectedOption && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!selectedOption}
          >
            <ThemedText style={styles.saveButtonText}>Save Record</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  closeButton: {
    padding: 5
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5
  },
  tabButtonActive: {
    backgroundColor: "rgba(76, 175, 80, 0.1)"
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666666",
    marginTop: 4
  },
  tabButtonTextActive: {
    color: "#4CAF50"
  },
  optionsContainer: {
    maxHeight: 400,
    marginBottom: 16
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 16
  },
  optionCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff"
  },
  optionCardActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50"
  },
  optionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  optionIcon: {
    marginRight: 4
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap"
  },
  optionTextActive: {
    color: "#FFFFFF"
  },
  dateContainer: {
    marginBottom: 16
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff"
  },
  notesContainer: {
    marginBottom: 16
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#ffffff"
  },
  reminderContainer: {
    marginBottom: 16
  },
  reminderToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: "600"
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    padding: 2
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50"
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffffff"
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }]
  },
  reminderSettings: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    padding: 16
  },
  recurrenceSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  recurrenceOption: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  recurrenceOptionActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50"
  },
  recurrenceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666"
  },
  recurrenceTextActive: {
    color: "#ffffff"
  },
  nextDueDateContainer: {
    marginTop: 12
  },
  reminderText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16
  },
  saveButtonDisabled: {
    backgroundColor: "#e0e0e0"
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  }
});
