import { Pet } from "@/app/(tabs)/pets";
import { supabase } from "../supabase";

export class PetsDao {
  static async savePet(pet: Pet): Promise<Pet | null> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("pets")
        .insert({
          id: pet.id,
          user_id: user.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          gender: pet.gender,
          birthDate: pet.birthDate,
          weightHistory: pet.weightHistory,
          notes: pet.notes,
          avatar: pet.avatar,
          healthRecords: pet.healthRecords
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving pet:", error);
        return null;
      }

      return data as Pet;
    } catch (error) {
      console.error("Error in savePet:", error);
      return null;
    }
  }

  static async updatePet(pet: Pet): Promise<Pet | null> {
    try {
      const { data, error } = await supabase
        .from("pets")
        .update({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          gender: pet.gender,
          birthDate: pet.birthDate,
          weightHistory: pet.weightHistory,
          notes: pet.notes,
          avatar: pet.avatar,
          healthRecords: pet.healthRecords
        })
        .eq("id", pet.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating pet:", error);
        return null;
      }

      return data as Pet;
    } catch (error) {
      console.error("Error in updatePet:", error);
      return null;
    }
  }

  static async getPet(id: string): Promise<Pet | null> {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching pet:", error);
        return null;
      }

      return data as Pet;
    } catch (error) {
      console.error("Error in getPet:", error);
      return null;
    }
  }

  static async getAllPets(): Promise<Pet[]> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return [];
      }

      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pets:", error);
        return [];
      }

      if (!data) {
        console.log("No pets found for user:", user.id);
        return [];
      }

      console.log("Fetched pets:", data);
      return data.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender,
        birthDate: pet.birthDate,
        weightHistory: pet.weightHistory || [],
        notes: pet.notes || "",
        avatar: pet.avatar,
        healthRecords: pet.healthRecords || []
      })) as Pet[];
    } catch (error) {
      console.error("Error in getAllPets:", error);
      return [];
    }
  }

  static async deletePet(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("pets").delete().eq("id", id);

      if (error) {
        console.error("Error deleting pet:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deletePet:", error);
      return false;
    }
  }
}
