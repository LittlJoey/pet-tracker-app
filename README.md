# Pet Tracker App

Pet Tracker is a mobile application built with React Native and Expo that helps pet owners monitor their pets' activities, health, and well-being. Users can manage multiple pets, track their walks in real-time, log activities like meals and vet visits, and view detailed statistics.

## ✨ Features

*   **Pet Management**: Add and manage profiles for multiple pets, including details like species, breed, age, and photos.
*   **Activity Logging**: Record various activities such as meals, walks, medication, grooming, and vet visits.
*   **GPS Walk Tracking**: Track walks in real-time, recording the route on a map, distance, and duration.
*   **Dashboard**: Get a quick overview of your pet's recent activities and daily stats on the home screen.
*   **Health Records**: Keep a log of important health events like vaccinations and vet appointments.
*   **Cross-Platform**: Runs on iOS, Android, and the web thanks to Expo.

## 🛠️ Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
*   **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
*   **Backend & Auth**: [Supabase](https://supabase.io/)
*   **Maps**: [react-native-maps](https://github.com/react-native-maps/react-native-maps)
*   **Styling**: Custom UI components with light/dark mode support.
*   **Language**: TypeScript

## 🚀 Get Started

1.  **Install dependencies**

    ```bash
    npm install
    ```

2.  **Set up Supabase**

    This project requires a Supabase backend.
    - Go to [supabase.com](https://supabase.com), create a project.
    - Use the `supabase_schema.sql` file in the root directory to set up your database tables.
    - Create a `.env` file in the root of the project and add your Supabase URL and Anon Key:
      ```
      EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
      EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```
    - Update the Supabase client initialization in `lib/supabase.ts` if you are not using `.env` files.

3.  **Start the app**

    ```bash
    npx expo start
    ```

In the output, you'll find options to open the app in a:

-   [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
-   [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
-   [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
-   [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory.

## Learn More

To learn more about developing your project with Expo, look at the following resources:

-   [Expo Documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
-   [Expo Tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the Community

-   [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
-   [Discord Community](https://chat.expo.dev): Chat with Expo users and ask questions.