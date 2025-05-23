import { HealthRecordModal } from "@/components/HealthRecordModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppDispatch, useAppSelector } from "@/store";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet } from "react-native";

const getSpeciesTheme = (species: string) => {
  switch (species) {
    case "dog":
      return {
        primary: "#FFB6C1",
        secondary: "#FF69B4",
        icon: "pawprint.fill"
      };
    case "cat":
      return {
        primary: "#B6E3FF",
        secondary: "#69B4FF",
        icon: "cat.fill"
      };
    default:
      return {
        primary: "#B6FFB6",
        secondary: "#69FF69",
        icon: "leaf.fill"
      };
  }
};

export default function PetProfileScreen() {
  const dispatch = useAppDispatch();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [isHealthModalVisible, setIsHealthModalVisible] = useState(false);
  console.log("petId: ", petId);
  const pet = useAppSelector((state) =>
    state.pets.pets.find((p) => p.id === petId)
  );

  if (!pet) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Pet not found</ThemedText>
      </ThemedView>
    );
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  };

  const getLatestWeight = () => {
    if (pet.weightHistory.length === 0) return null;
    return pet.weightHistory[pet.weightHistory.length - 1].weight;
  };

  const pickImage = async () => {
    Alert.alert("Change Photo", "Choose a new photo for your pet", [
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Denied",
              "Please allow camera access to take photos."
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
          });
          if (!result.canceled && result.assets[0].uri) {
            // Add action to update pet avatar in your store
            // dispatch(updatePetAvatar({ petId, avatarUri: result.assets[0].uri }));
          }
        }
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
          });
          if (!result.canceled && result.assets[0].uri) {
            // Add action to update pet avatar in your store
            // dispatch(updatePetAvatar({ petId, avatarUri: result.assets[0].uri }));
          }
        }
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]);
  };

  return (
    <ScrollView
      style={[
        styles.scrollView,
        { backgroundColor: getSpeciesTheme(pet.species).primary + "20" }
      ]}
    >
      <ThemedView
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <ThemedView style={styles.header}>
          <Pressable onPress={pickImage}>
            {pet.avatar ? (
              <Pressable onPress={pickImage} style={styles.avatarWrapper}>
                <Image source={{ uri: pet.avatar }} style={styles.avatar} />
                <ThemedView style={styles.cameraIconContainer}>
                  <IconSymbol name="camera.fill" size={20} color="#ffffff" />
                </ThemedView>
              </Pressable>
            ) : (
              <Pressable onPress={pickImage} style={styles.avatarWrapper}>
                <ThemedView style={[styles.avatar, styles.avatarPlaceholder]}>
                  <IconSymbol
                    size={50}
                    name={
                      pet.species === "dog"
                        ? "pawprint.fill"
                        : pet.species === "cat"
                        ? "cat.fill"
                        : "leaf.fill"
                    }
                    color="#808080"
                  />
                </ThemedView>
                <ThemedView style={styles.cameraIconContainer}>
                  <IconSymbol name="camera.fill" size={20} color="#ffffff" />
                </ThemedView>
              </Pressable>
            )}
          </Pressable>
          <ThemedText type="title" style={styles.name}>
            {pet.name}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)} •{" "}
            {pet.gender
              ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) + " • "
              : ""}
            {pet.breed}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {pet.name}'s Information
          </ThemedText>
          <ThemedView style={styles.infoGrid}>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Age</ThemedText>
              <ThemedText style={styles.infoValue}>
                {calculateAge(pet.birthDate)} year/s
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Birth Date</ThemedText>
              <ThemedText style={styles.infoValue}>
                {new Date(pet.birthDate).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Current Weight</ThemedText>
              <ThemedText style={styles.infoValue}>
                {getLatestWeight() ? `${getLatestWeight()} kg` : "Not recorded"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.weightSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Weight History
        </ThemedText>
        {pet.weightHistory.length > 0 ? (
          <ThemedView style={styles.weightHistory}>
            {pet.weightHistory.map((entry, index) => (
              <ThemedView key={index} style={styles.weightEntry}>
                <ThemedText style={styles.weightDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={styles.weightValue}>
                  {entry.weight} kg
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        ) : (
          <ThemedText style={styles.emptyText}>
            No weight records yet.
          </ThemedText>
        )}
        <Pressable
          style={styles.addWeightButton}
          onPress={() => {
            Alert.prompt(
              "Add Weight",
              "Enter weight in kilograms",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Add",
                  onPress: (weight) => {
                    if (weight) {
                      const newWeight = parseFloat(weight);
                      if (!isNaN(newWeight) && newWeight > 0) {
                        dispatch({
                          type: "pets/addWeight",
                          payload: {
                            petId: pet.id,
                            weight: newWeight,
                            date: new Date().toISOString()
                          }
                        });
                      } else {
                        Alert.alert(
                          "Invalid Weight",
                          "Please enter a valid weight value."
                        );
                      }
                    }
                  }
                }
              ],
              "plain-text",
              ""
            );
          }}
        >
          <ThemedView style={styles.addWeightButtonContent}>
            <IconSymbol name="plus.circle.fill" size={20} color="#ffffff" />
            <ThemedText style={styles.addWeightButtonText}>
              Add Weight
            </ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>

      {pet.notes && (
        <ThemedView style={styles.notesSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Notes
          </ThemedText>
          <ThemedText style={styles.notes}>{pet.notes}</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.healthSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Health Records
        </ThemedText>
        {pet.healthRecords && pet.healthRecords.length > 0 ? (
          <ThemedView style={styles.healthRecordsList}>
            {pet.healthRecords.map((record, index) => (
              <ThemedView key={record.id} style={styles.healthRecordItem}>
                <ThemedView style={styles.healthRecordHeader}>
                  <ThemedView style={styles.healthRecordIcon}>
                    <IconSymbol
                      name={
                        record.type === "vaccination"
                          ? "cross.case.fill"
                          : record.type === "vet-visit"
                          ? "heart.text.square.fill"
                          : "pills.circle.fill"
                      }
                      size={24}
                      color="#4CAF50"
                    />
                  </ThemedView>
                  <ThemedView style={styles.healthRecordInfo}>
                    <ThemedText style={styles.healthRecordTitle}>
                      {record.title}
                    </ThemedText>
                    <ThemedText style={styles.healthRecordType}>
                      {record.type
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.healthRecordDetails}>
                  <ThemedView style={styles.healthRecordDateContainer}>
                    <IconSymbol name="calendar" size={16} color="#666666" />
                    <ThemedText style={styles.healthRecordDate}>
                      {new Date(record.date).toLocaleDateString()}
                    </ThemedText>
                  </ThemedView>
                  {record.nextDue && (
                    <ThemedView
                      style={[
                        styles.healthRecordNextDueContainer,
                        new Date(record.nextDue) < new Date() &&
                          styles.healthRecordOverdue
                      ]}
                    >
                      <IconSymbol
                        name={
                          new Date(record.nextDue) < new Date()
                            ? "exclamationmark.circle.fill"
                            : "clock.fill"
                        }
                        size={16}
                        color={
                          new Date(record.nextDue) < new Date()
                            ? "#FF4444"
                            : "#666666"
                        }
                      />
                      <ThemedText
                        style={[
                          styles.healthRecordNextDue,
                          new Date(record.nextDue) < new Date() &&
                            styles.healthRecordNextDueOverdue
                        ]}
                      >
                        {new Date(record.nextDue) < new Date()
                          ? "Overdue"
                          : "Next Due"}
                        : {new Date(record.nextDue).toLocaleDateString()}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
                {record.notes && (
                  <ThemedText style={styles.healthRecordNotes}>
                    {record.notes}
                  </ThemedText>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        ) : (
          <ThemedText style={styles.emptyText}>
            No health records yet.
          </ThemedText>
        )}
        <Pressable
          style={styles.addHealthRecordButton}
          onPress={() => setIsHealthModalVisible(true)}
        >
          <ThemedView style={styles.addHealthRecordButtonContent}>
            <IconSymbol name="plus.circle.fill" size={20} color="#ffffff" />
            <ThemedText style={styles.addHealthRecordButtonText}>
              Add Health Record
            </ThemedText>
          </ThemedView>
        </Pressable>
        <HealthRecordModal
          isVisible={isHealthModalVisible}
          onClose={() => setIsHealthModalVisible(false)}
          onSave={(type, option, date) => {
            const id = Date.now().toString();
            dispatch({
              type: "pets/addHealthRecord",
              payload: {
                petId: pet.id,
                record: {
                  id,
                  type,
                  title: option,
                  date: date.toISOString(),
                  nextDue:
                    type === "vaccination"
                      ? new Date(
                          Date.now() + 365 * 24 * 60 * 60 * 1000
                        ).toISOString()
                      : undefined
                }
              }
            });
          }}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  weightSection: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  weightHistory: {
    marginTop: 8,
    marginBottom: 16
  },
  weightEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  weightDate: {
    fontSize: 14,
    color: "#666666"
  },
  weightValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333"
  },
  addWeightButton: {
    marginTop: 8
  },
  addWeightButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8
  },
  addWeightButtonText: {
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600"
  },
  emptyText: {
    textAlign: "center",
    color: "#666666",
    marginVertical: 16
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20
  },
  container: {
    flex: 1,
    padding: 20
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20
  },
  avatarWrapper: {
    position: "relative",
    borderRadius: 75,
    padding: 3,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center"
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff"
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  infoItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute"
  },
  name: {
    fontSize: 28,
    marginBottom: 8,
    fontWeight: "700",
    marginTop: 12
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    opacity: 0.8
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    width: "100%"
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: "#333333"
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between"
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    opacity: 0.8
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333"
  },
  notesSection: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666"
  },
  healthSection: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8
  },
  healthRecordsList: {
    marginTop: 12,
    gap: 16
  },
  healthRecordItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3
  },
  healthRecordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12
  },
  healthRecordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f9f5",
    justifyContent: "center",
    alignItems: "center"
  },
  healthRecordInfo: {
    flex: 1
  },
  healthRecordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4
  },
  healthRecordType: {
    fontSize: 13,
    color: "#666666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start"
  },
  healthRecordDetails: {
    marginTop: 8,
    gap: 8
  },
  healthRecordDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  healthRecordDate: {
    fontSize: 14,
    color: "#666666"
  },
  healthRecordNextDueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f5f9f5",
    padding: 8,
    borderRadius: 8
  },
  healthRecordOverdue: {
    backgroundColor: "#fff5f5"
  },
  healthRecordNextDue: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500"
  },
  healthRecordNextDueOverdue: {
    color: "#FF4444"
  },
  healthRecordNotes: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 8,
    fontStyle: "italic"
  },
  addHealthRecordButton: {
    marginTop: 20
  },
  addHealthRecordButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  addHealthRecordButtonText: {
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600"
  }
});
