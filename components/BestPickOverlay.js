import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BestPickOverlay() {
  return (
    <View style={styles.overlay}>
      <Text style={styles.label}>Best Pick</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 200,
    left: 120,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'limegreen',
    backgroundColor: 'rgba(0,255,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
