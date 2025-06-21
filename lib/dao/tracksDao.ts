import { supabase } from "../supabase";

export interface PetTrack {
  id: string;
  pet_id: string;
  user_id: string;
  track_date: string;
  location: {
    latitude: number;
    longitude: number;
  }[];
  duration: number;
  distance: number;
  created_at?: string;
}

export class TracksDao {
  static async saveTrack(track: PetTrack): Promise<PetTrack | null> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("pet_tracks")
        .insert({
          id: track.id,
          pet_id: track.pet_id,
          user_id: user.id,
          track_date: track.track_date,
          location: track.location,
          duration: track.duration,
          distance: track.distance
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving track:", error);
        return null;
      }

      return data as PetTrack;
    } catch (error) {
      console.error("Error in saveTrack:", error);
      return null;
    }
  }

  static async getTrack(id: string): Promise<PetTrack | null> {
    try {
      const { data, error } = await supabase
        .from("pet_tracks")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching track:", error);
        return null;
      }

      return data as PetTrack;
    } catch (error) {
      console.error("Error in getTrack:", error);
      return null;
    }
  }

  static async getPetTracks(petId: string): Promise<PetTrack[]> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("pet_tracks")
        .select("*")
        .eq("pet_id", petId)
        .eq("user_id", user.id)
        .order("track_date", { ascending: false });

      if (error) {
        console.error("Error fetching tracks:", error);
        return [];
      }

      return data as PetTrack[];
    } catch (error) {
      console.error("Error in getPetTracks:", error);
      return [];
    }
  }

  static async deleteTrack(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("pet_tracks").delete().eq("id", id);

      if (error) {
        console.error("Error deleting track:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteTrack:", error);
      return false;
    }
  }

  static async getAllUserTracks(): Promise<PetTrack[]> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("pet_tracks")
        .select(
          `
          *,
          pets!inner(name, species)
        `
        )
        .eq("user_id", user.id)
        .order("track_date", { ascending: false });

      if (error) {
        console.error("Error fetching all user tracks:", error);
        return [];
      }

      return data as PetTrack[];
    } catch (error) {
      console.error("Error in getAllUserTracks:", error);
      return [];
    }
  }
}
