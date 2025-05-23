import { Pet } from "@/app/(tabs)/pets";
import { Collapsible } from "@/components/Collapsible";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

type PetFormProps = {
  onSubmit: (petData: Pet) => void;
};

export function PetForm({ onSubmit }: PetFormProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState<"Boy" | "Girl">("Boy");
  const [birthDate, setBirthDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!breed.trim()) {
      newErrors.breed = "Breed is required";
    }
    if (
      weight.trim() &&
      (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)
    ) {
      newErrors.weight = "Please enter a valid weight";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const petData: Pet = {
        id: Date.now().toString(),
        name: name.trim(),
        species,
        breed: breed.trim(),
        gender,
        birthDate: birthDate.toISOString(),
        weightHistory: weight.trim()
          ? [
              {
                date: new Date().toISOString(),
                weight: parseFloat(weight)
              }
            ]
          : [],
        notes: notes.trim()
      };
      onSubmit(petData);
    }
  };

  const SpeciesButton = ({
    value,
    label
  }: {
    value: typeof species;
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.speciesButton,
        species === value && styles.speciesButtonActive
      ]}
      onPress={() => setSpecies(value)}
    >
      <ThemedText
        style={[
          styles.speciesButtonText,
          species === value && styles.speciesButtonTextActive
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Name*</ThemedText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Pet's name"
          placeholderTextColor="#999"
        />
        {errors.name && (
          <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
        )}
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Species*</ThemedText>
        <View style={styles.speciesButtons}>
          <SpeciesButton value="dog" label="Dog" />
          <SpeciesButton value="cat" label="Cat" />
          <SpeciesButton value="other" label="Other" />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Gender*</ThemedText>
        <View style={styles.speciesButtons}>
          <TouchableOpacity
            style={[
              styles.speciesButton,
              gender === "Boy" && styles.speciesButtonActive
            ]}
            onPress={() => setGender("Boy")}
          >
            <IconSymbol
              name="pawprint.circle.fill"
              size={16}
              color={gender === "Boy" ? "#ffffff" : "#666666"}
            />
            <ThemedText
              style={[
                styles.speciesButtonText,
                gender === "Boy" && styles.speciesButtonTextActive
              ]}
            >
              Boy
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.speciesButton,
              gender === "Girl" && styles.speciesButtonActive
            ]}
            onPress={() => setGender("Girl")}
          >
            <IconSymbol
              name="pawprint.circle"
              size={16}
              color={gender === "Girl" ? "#ffffff" : "#666666"}
            />
            <ThemedText
              style={[
                styles.speciesButtonText,
                gender === "Girl" && styles.speciesButtonTextActive
              ]}
            >
              Girl
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Breed*</ThemedText>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Pet's breed"
          placeholderTextColor="#999"
        />
        {errors.breed && (
          <ThemedText style={styles.errorText}>{errors.breed}</ThemedText>
        )}
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Weight (kg)</ThemedText>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter pet's weight"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />
        {errors.weight && (
          <ThemedText style={styles.errorText}>{errors.weight}</ThemedText>
        )}
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Birth Date</ThemedText>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <ThemedText>{birthDate.toLocaleDateString()}</ThemedText>
          <IconSymbol name="calendar" size={20} color="#666" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setBirthDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      <Collapsible title="Additional Notes">
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any additional notes about your pet"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </Collapsible>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <ThemedText style={styles.submitButtonText}>
          Create Pet Profile
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20
  },
  inputGroup: {
    gap: 8
  },
  label: {
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top"
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14
  },
  speciesButtons: {
    flexDirection: "row",
    gap: 10
  },
  speciesButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center"
  },
  speciesButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50"
  },
  speciesButtonText: {
    color: "#666"
  },
  speciesButtonTextActive: {
    color: "#ffffff"
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16
  }
});
