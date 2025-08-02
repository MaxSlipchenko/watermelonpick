import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useWatermelon } from "@/context/WatermelonContext";

export default function SplashScreen() {
  const router = useRouter();
  const { resetSelection } = useWatermelon();

  useEffect(() => {
    // Reset any previous selection when returning to splash
    resetSelection();
  }, [resetSelection]);

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/camera");
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#e8f5e9"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1563114773-84221bd62daa?q=80&w=500&auto=format&fit=crop" }} 
          style={styles.watermelonImage}
        />
        <View style={styles.scanLines}>
          <View style={styles.scanLine} />
          <View style={styles.scanLine} />
          <View style={styles.scanLine} />
        </View>
      </View>
      
      <Text style={styles.title}>WatermelonPick</Text>
      <Text style={styles.subtitle}>Pick the Sweetest Watermelon — Every Time</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleStart}
        activeOpacity={0.8}
        testID="start-button"
      >
        <Text style={styles.buttonText}>Let&apos;s Go</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  watermelonImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  scanLines: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "rgba(76, 175, 80, 0.5)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    color: "#388E3C",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});