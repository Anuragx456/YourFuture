# FutureMe - AI-Powered Habit Tracker

FutureMe is a production-ready React Native / Expo mobile application that tracks your daily habits and uses AI (Anthropic Claude) to predict your future life trajectory based on your consistency.

## ✨ Features

- **Onboarding:** Personalized setup for your name, age, and top life goals.
- **Habit Tracking:** Full CRUD for daily/weekly habits with categories and streaks.
- **Dashboard:** Visual summary of daily progress with an interactive progress ring and weekly activity charts.
- **AI Prediction Engine:** Generates detailed 3-month, 1-year, and 5-year forecasts using Claude AI.
- **Profile & Settings:** Manage goals, view statistics, and toggle dark/light mode.

## 🚀 Tech Stack

- **Framework:** Expo SDK 55 (Managed Workflow)
- **Navigation:** Expo Router (File-based)
- **State Management:** Zustand with AsyncStorage persistence
- **AI:** Google Gemini API
- **Styling:** React Native StyleSheet
- **Charts:** react-native-gifted-charts
- **Animations:** React Native Reanimated

## 🛠️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd YourFuture
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npx expo start
   ```

The app stores your Gemini API key securely on-device via iOS Keychain / Android Keystore (through `expo-secure-store`). Add your key in **Profile → Gemini AI**.

See [PRIVACY.md](PRIVACY.md) for details on local data storage and security.

## 📁 Project Structure

- `src/app/`: File-based routing (Tabs, Onboarding, Layout)
- `src/components/`: Reusable UI components (HabitCard, ProgressRing, etc.)
- `src/store/`: Zustand state management for user and habits
- `src/lib/`: API integrations and prediction logic
- `src/constants/`: App constants and configuration
- `src/types/`: TypeScript definitions

## 🎨 UI/UX Design

- **Dark Mode First:** Deep purple and slate palette for a modern, focused experience.
- **Responsive:** Optimized for both iOS and Android.
- **Interactive:** Smooth transitions and feedback for all user actions.
