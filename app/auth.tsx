import { fetchPets } from "@/store/petSlice";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { IconSymbol } from "../components/ui/IconSymbol";
import { RootState, useAppDispatch } from "../store";
import { clearError, loginUser, registerUser } from "../store/authSlice";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async () => {
    if (!email || !password) return;

    try {
      if (isLogin) {
        await dispatch(loginUser({ email, password })).unwrap();
      } else {
        await dispatch(registerUser({ email, password })).unwrap();
      }
      await dispatch(fetchPets());
      router.replace("/(tabs)");
    } catch (err) {
      // Error is handled by the reducer
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="pawprint.circle.fill" size={64} color="#4CAF50" />
        <ThemedText style={styles.title}>
          {isLogin ? "Welcome Back!" : "Create Account"}
        </ThemedText>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            onPress={() => dispatch(clearError())}
            style={styles.errorDismiss}
          >
            <IconSymbol name="xmark.circle.fill" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <IconSymbol name="envelope" size={20} color="#666666" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <IconSymbol name="lock" size={20} color="#666666" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsLogin(!isLogin);
            dispatch(clearError());
          }}
        >
          <ThemedText style={styles.switchButtonText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  header: {
    alignItems: "center",
    marginBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16
  },
  form: {
    gap: 16
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 50
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333333"
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  switchButton: {
    alignItems: "center",
    marginTop: 16
  },
  switchButtonText: {
    color: "#4CAF50",
    fontSize: 14
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    flex: 1,
    color: "#FF5252",
    fontSize: 14
  },
  errorDismiss: {
    marginLeft: 8
  }
});
