import { useAppSelector } from "@/store";
import { Stack, useLocalSearchParams } from "expo-router";

export default function PetLayout() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  console.log("pet petid", petId);
  const pet = useAppSelector((state) =>
    state.pets.pets.find((p) => p.id === petId)
  );

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
