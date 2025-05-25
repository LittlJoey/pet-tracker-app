import { supabase } from "../supabase";
import type { PetTrack } from "./tracksDao";

export interface PetActivity {
  id: string;
  pet_id: string;
  user_id: string;
  type: "walk" | "meal" | "medication" | "vet-visit" | "grooming" | "play";
  title: string;
  description?: string;
  duration?: number; // in minutes
  distance?: number; // in kilometers for walks
  calories?: number; // estimated calories burned/consumed
  activity_date: string; // ISO string
  created_at?: string;
  updated_at?: string;
  metadata?: {
    // Flexible field for activity-specific data
    location?: string;
    medication_name?: string;
    vet_name?: string;
    food_type?: string;
    toy_type?: string;
    notes?: string;
  };
}

export class ActivitiesDao {
  static async saveActivity(
    activity: Omit<PetActivity, "user_id" | "created_at" | "updated_at">
  ): Promise<PetActivity | null> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("pet_activities")
        .insert({
          id: activity.id,
          pet_id: activity.pet_id,
          user_id: user.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          duration: activity.duration,
          distance: activity.distance,
          calories: activity.calories,
          activity_date: activity.activity_date,
          metadata: activity.metadata
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving activity:", error);
        return null;
      }

      return data as PetActivity;
    } catch (error) {
      console.error("Error in saveActivity:", error);
      return null;
    }
  }

  static async updateActivity(
    activity: PetActivity
  ): Promise<PetActivity | null> {
    try {
      const { data, error } = await supabase
        .from("pet_activities")
        .update({
          type: activity.type,
          title: activity.title,
          description: activity.description,
          duration: activity.duration,
          distance: activity.distance,
          calories: activity.calories,
          activity_date: activity.activity_date,
          metadata: activity.metadata,
          updated_at: new Date().toISOString()
        })
        .eq("id", activity.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating activity:", error);
        return null;
      }

      return data as PetActivity;
    } catch (error) {
      console.error("Error in updateActivity:", error);
      return null;
    }
  }

  static async getActivity(id: string): Promise<PetActivity | null> {
    try {
      const { data, error } = await supabase
        .from("pet_activities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching activity:", error);
        return null;
      }

      return data as PetActivity;
    } catch (error) {
      console.error("Error in getActivity:", error);
      return null;
    }
  }

  static async getPetActivities(
    petId: string,
    limit?: number
  ): Promise<PetActivity[]> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("pet_activities")
        .select("*")
        .eq("pet_id", petId)
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching pet activities:", error);
        return [];
      }

      return data as PetActivity[];
    } catch (error) {
      console.error("Error in getPetActivities:", error);
      return [];
    }
  }

  static async getAllUserActivities(limit?: number): Promise<PetActivity[]> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("pet_activities")
        .select(
          `
          *,
          pets!inner(name, species)
        `
        )
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching all user activities:", error);
        return [];
      }

      return data as PetActivity[];
    } catch (error) {
      console.error("Error in getAllUserActivities:", error);
      return [];
    }
  }

  static async getTodayActivities(petId?: string): Promise<PetActivity[]> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      console.log("Getting today activities for user:", user);
      if (!user) return [];

      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ).toISOString();

      let query = supabase
        .from("pet_activities")
        .select(
          `
          *,
          pets!inner(name, species)
        `
        )
        .eq("user_id", user.id)
        .gte("activity_date", startOfDay)
        .lt("activity_date", endOfDay)
        .order("activity_date", { ascending: false });

      if (petId) {
        query = query.eq("pet_id", petId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching today's activities:", error);
        return [];
      }

      return data as PetActivity[];
    } catch (error) {
      console.error("Error in getTodayActivities:", error);
      return [];
    }
  }

  static async getActivityStats(petId?: string): Promise<{
    totalWalks: number;
    totalDistance: number;
    totalMeals: number;
    totalActivities: number;
  }> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user)
        return {
          totalWalks: 0,
          totalDistance: 0,
          totalMeals: 0,
          totalActivities: 0
        };

      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ).toISOString();

      let query = supabase
        .from("pet_activities")
        .select("type, distance")
        .eq("user_id", user.id)
        .gte("activity_date", startOfDay)
        .lt("activity_date", endOfDay);

      if (petId) {
        query = query.eq("pet_id", petId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching activity stats:", error);
        return {
          totalWalks: 0,
          totalDistance: 0,
          totalMeals: 0,
          totalActivities: 0
        };
      }

      const stats = data.reduce(
        (acc, activity) => {
          acc.totalActivities++;
          if (activity.type === "walk") {
            acc.totalWalks++;
            acc.totalDistance += activity.distance || 0;
          } else if (activity.type === "meal") {
            acc.totalMeals++;
          }
          return acc;
        },
        { totalWalks: 0, totalDistance: 0, totalMeals: 0, totalActivities: 0 }
      );

      return stats;
    } catch (error) {
      console.error("Error in getActivityStats:", error);
      return {
        totalWalks: 0,
        totalDistance: 0,
        totalMeals: 0,
        totalActivities: 0
      };
    }
  }

  static async deleteActivity(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("pet_activities")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting activity:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteActivity:", error);
      return false;
    }
  }

  // Helper method to convert PetTrack to PetActivity (for walk activities)
  static convertTrackToActivity(
    track: PetTrack
  ): Omit<PetActivity, "user_id" | "created_at" | "updated_at"> {
    return {
      id: `track_${track.id}`,
      pet_id: track.pet_id,
      type: "walk" as const,
      title: "Walk",
      description: "Tracked walk activity",
      duration: Math.round(track.duration / 60), // Convert seconds to minutes
      distance: track.distance,
      calories: Math.round(track.distance * 50), // Rough estimation
      activity_date: track.track_date,
      metadata: {
        location: "GPS tracked",
        notes: "Automatically recorded from tracking"
      }
    };
  }
}
