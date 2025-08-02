import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  Animated,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useWatermelon } from "@/context/WatermelonContext";
import ExplanationPopup from "@/components/ExplanationPopup";

const { width, height } = Dimensions.get("window");

// Simple hash function to create consistent results for similar camera views
const createViewHash = (timestamp: number): string => {
  // Use a time-based seed that changes every 30 seconds to simulate "same batch"
  const timeSeed = Math.floor(timestamp / 30000);
  return timeSeed.toString();
};

// Generate consistent watermelon position based on hash
const generateConsistentPosition = (hash: string) => {
  // Use hash to seed random number generation for consistency
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed = ((seed << 5) - seed + hash.charCodeAt(i)) & 0xffffffff;
  }
  
  // Convert seed to 0-1 range
  const random1 = Math.abs(seed % 1000) / 1000;
  const random2 = Math.abs((seed >> 10) % 1000) / 1000;
  
  // Use safe positioning that ensures visibility
  // Keep circle fully within screen bounds (180px circle + 20px margin)
  const margin = 110; // Half circle size + safety margin
  const minX = margin;
  const maxX = width - margin;
  const minY = 150; // Below status bar and back button
  const maxY = height - 200; // Above bottom buttons
  
  const x = minX + random1 * (maxX - minX);
  const y = minY + random2 * (maxY - minY);
  
  console.log('Generated position:', { x, y, width, height, minX, maxX, minY, maxY });
  
  return { x, y };
};

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentViewHash, setCurrentViewHash] = useState<string | null>(null);
  const scanningOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const { selectedWatermelon, selectWatermelon, resetSelection } = useWatermelon();

  // Debug logging
  useEffect(() => {
    console.log('Camera state:', { scanning, selectedWatermelon: !!selectedWatermelon });
    if (selectedWatermelon) {
      console.log('Selected watermelon position:', selectedWatermelon);
      console.log('Circle should be at:', {
        left: selectedWatermelon.x - 90,
        top: selectedWatermelon.y - 90,
        screenWidth: width,
        screenHeight: height
      });
    }
  }, [scanning, selectedWatermelon]);

  // Start pulse animation when watermelon is selected
  useEffect(() => {
    if (selectedWatermelon && !scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [selectedWatermelon, scanning, pulseAnimation]);

  useEffect(() => {
    if (scanning) {
      // Fade in "Scanning..." text
      Animated.timing(scanningOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // Simulate scan completion after 2 seconds
      const timer = setTimeout(() => {
        setScanning(false);
        
        // Create a hash for this "batch" of watermelons
        const viewHash = createViewHash(Date.now());
        setCurrentViewHash(viewHash);
        
        // Generate consistent position based on the hash
        const position = generateConsistentPosition(viewHash);
        
        console.log('Setting watermelon position:', position);
        
        selectWatermelon({
          x: position.x,
          y: position.y,
          reasons: [
            "Yellow field spot",
            "Good surface webbing",
            "Round shape"
          ]
        });
        
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // Fade out "Scanning..." text
      Animated.timing(scanningOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [scanning, scanningOpacity, selectWatermelon]);



  const handleBackPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleScan = () => {
    // Check if we should use the same hash (same batch) or create a new one
    const now = Date.now();
    const newViewHash = createViewHash(now);
    
    // If the hash is the same as current, reuse the same position
    if (currentViewHash === newViewHash && selectedWatermelon) {
      // Same batch - keep the same selection, just show scanning animation
      setScanning(true);
      setShowPopup(false);
      
      // Show scanning animation but return to same result
      setTimeout(() => {
        setScanning(false);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 2000);
    } else {
      // New batch or first scan - reset and scan normally
      resetSelection();
      setScanning(true);
      setShowPopup(false);
    }
  };

  const handleBestPickPress = () => {
    if (selectedWatermelon) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setShowPopup(true);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need camera permission to help you pick the best watermelon
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <CameraView
        style={styles.camera}
        facing="back"
        testID="camera-view"
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            testID="back-button"
          >
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>

          {!scanning && !selectedWatermelon && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Point at the watermelons and hold still
              </Text>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScan}
                testID="scan-button"
              >
                <Text style={styles.scanButtonText}>Scan Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <Animated.Text
            style={[
              styles.scanningText,
              { opacity: scanningOpacity }
            ]}
          >
            Scanning...
          </Animated.Text>

          {selectedWatermelon && !scanning && (
            <View style={styles.bestPickOverlay}>
              {/* Best Pick Circle with Content */}
              <TouchableOpacity
                onPress={handleBestPickPress}
                style={[
                  styles.bestPickContainer,
                  {
                    left: selectedWatermelon.x - 90,
                    top: selectedWatermelon.y - 90,
                  }
                ]}
                testID="best-pick-button"
                activeOpacity={0.8}
              >
                {Platform.OS === 'web' ? (
                  <View style={[styles.bestPickCircle, styles.webCircle]}>
                    <View style={styles.circleContent}>
                      <Text style={styles.watermelonIcon}>🍉</Text>
                      <Text style={styles.bestPickText}>Best Pick</Text>
                    </View>
                  </View>
                ) : (
                  <Animated.View
                    style={[
                      styles.bestPickCircle,
                      {
                        transform: [{ scale: pulseAnimation }],
                      },
                    ]}
                  >
                    <View style={styles.circleContent}>
                      <Text style={styles.watermelonIcon}>🍉</Text>
                      <Text style={styles.bestPickText}>Best Pick</Text>
                    </View>
                  </Animated.View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!scanning && selectedWatermelon && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={handleScan}
              testID="rescan-button"
            >
              <Text style={styles.rescanButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>

      {showPopup && selectedWatermelon && (
        <ExplanationPopup
          reasons={selectedWatermelon.reasons}
          onClose={() => setShowPopup(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scanningText: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  bestPickOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "box-none",
    backgroundColor: "transparent",
  },
  bestPickContainer: {
    position: "absolute",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    pointerEvents: "auto",
  },
  bestPickCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: "#00FF41",
    backgroundColor: "rgba(0, 255, 65, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00FF41",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  webCircle: {
    borderColor: "#00FF41",
    backgroundColor: "rgba(0, 255, 65, 0.4)",
    borderWidth: 6,
    shadowColor: "#00FF41",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    boxShadow: "0 0 25px rgba(0, 255, 65, 1)",
  },
  circleContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  watermelonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  bestPickText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rescanButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  rescanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e8f5e9",
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#388E3C",
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

});