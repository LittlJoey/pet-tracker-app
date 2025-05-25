import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import activitiesReducer from "./activitiesSlice";
import authReducer from "./authSlice";
import petReducer from "./petSlice";
import syncReducer from "./syncSlice";
import trackReducer from "./trackSlice";

const loadState = async () => {
  try {
    const serializedState = await AsyncStorage.getItem("petStore");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading state:", error);
    return undefined;
  }
};

const saveState = async (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    await AsyncStorage.setItem("petStore", serializedState);
  } catch (error) {
    console.error("Error saving state:", error);
  }
};

export const store = configureStore({
  reducer: {
    pets: petReducer,
    auth: authReducer,
    tracks: trackReducer,
    sync: syncReducer,
    activities: activitiesReducer
  }
});

store.subscribe(() => {
  saveState(store.getState());
});

// Initialize store with persisted state
loadState().then((state) => {
  if (state) {
    store.dispatch({ type: "HYDRATE", payload: state });
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
