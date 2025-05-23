/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: "#FFB6C1",
    secondary: "#B6E3FF",
    success: "#4CAF50",
    error: "#FF4444",
    warning: "#FF9800",
    border: "#E0E0E0",
    placeholder: "#999999",
    overlay: "rgba(0, 0, 0, 0.5)",
    trasparent: "transparent"
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primary: "#4A2639",
    secondary: "#1D3D47",
    success: "#45a049",
    error: "#FF6B6B",
    warning: "#FFA726",
    border: "#2D2D2D",
    placeholder: "#666666",
    overlay: "rgba(0, 0, 0, 0.7)",
    transparent: "transparent"
  }
};
