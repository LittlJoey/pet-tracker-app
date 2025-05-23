import { Pet } from "@/app/(tabs)/pets";
import { PetsDao } from "@/lib/dao/petsDao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from "./index";

type PetState = {
  pets: Pet[];
  selectedPet: Pet | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: PetState = {
  pets: [],
  selectedPet: null,
  isPremium: false,
  loading: false,
  error: null
};

export const fetchPets = createAsyncThunk("pets/fetchPets", async () => {
  const pets = await PetsDao.getAllPets();
  await AsyncStorage.setItem("pets", JSON.stringify(pets));
  return pets;
});

export const addPet = createAsyncThunk("pets/addPet", async (pet: Pet) => {
  const savedPet = await PetsDao.savePet(pet);
  if (!savedPet) throw new Error("Failed to save pet");

  const localPets = await AsyncStorage.getItem("pets");
  const pets = localPets ? JSON.parse(localPets) : [];
  const updatedPets = [...pets, savedPet];
  await AsyncStorage.setItem("pets", JSON.stringify(updatedPets));

  return savedPet;
});

export const updatePet = createAsyncThunk(
  "pets/updatePet",
  async (pet: Pet) => {
    const updatedPet = await PetsDao.updatePet(pet);
    if (!updatedPet) throw new Error("Failed to update pet");

    const localPets = await AsyncStorage.getItem("pets");
    const pets = localPets ? JSON.parse(localPets) : [];
    const updatedPets = pets.map((p: Pet) =>
      p.id === pet.id ? updatedPet : p
    );
    await AsyncStorage.setItem("pets", JSON.stringify(updatedPets));

    return updatedPet;
  }
);

export const deletePet = createAsyncThunk(
  "pets/deletePet",
  async (id: string) => {
    const success = await PetsDao.deletePet(id);
    if (!success) throw new Error("Failed to delete pet");

    const localPets = await AsyncStorage.getItem("pets");
    if (localPets) {
      const pets = JSON.parse(localPets);
      const updatedPets = pets.filter((p: Pet) => p.id !== id);
      await AsyncStorage.setItem("pets", JSON.stringify(updatedPets));
    }

    return id;
  }
);

const petSlice = createSlice({
  name: "pets",
  initialState,
  reducers: {
    selectPet: (state, action: PayloadAction<Pet>) => {
      state.selectedPet = action.payload;
    },
    setPremium: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addWeight: (
      state,
      action: PayloadAction<{ petId: string; weight: number; date: string }>
    ) => {
      const pet = state.pets.find((p) => p.id === action.payload.petId);
      if (pet) {
        if (!pet.weightHistory) {
          pet.weightHistory = [];
        }
        pet.weightHistory.push({
          date: action.payload.date,
          weight: action.payload.weight
        });
        // Dispatch updatePet thunk instead of directly calling it
        store.dispatch(updatePet(pet));
      }
    },
    addHealthRecord: (
      state,
      action: PayloadAction<{
        petId: string;
        record: {
          id: string;
          type: "vaccination" | "vet-visit" | "medication";
          date: string;
          title: string;
          notes?: string;
          nextDue?: string;
        };
      }>
    ) => {
      const pet = state.pets.find((p) => p.id === action.payload.petId);
      if (pet) {
        if (!pet.healthRecords) {
          pet.healthRecords = [];
        }
        pet.healthRecords.push(action.payload.record);
        // Dispatch updatePet thunk instead of directly calling it
        store.dispatch(updatePet(pet));
      }
    },
    HYDRATE: (state, action: PayloadAction<any>) => {
      return { ...state, ...action.payload.pets };
    }
  },
  extraReducers: (builder) => {
    // Fetch Pets
    builder
      .addCase(fetchPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch pets";
      })
      // Add Pet
      .addCase(addPet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets.push(action.payload);
      })
      .addCase(addPet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add pet";
      })
      // Update Pet
      .addCase(updatePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pets.findIndex(
          (pet) => pet.id === action.payload.id
        );
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update pet";
      })
      // Delete Pet
      .addCase(deletePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = state.pets.filter((pet) => pet.id !== action.payload);
        if (state.selectedPet?.id === action.payload) {
          state.selectedPet = null;
        }
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete pet";
      });
  }
});

export const { selectPet, setPremium, clearError, addWeight, addHealthRecord } =
  petSlice.actions;
export default petSlice.reducer;
