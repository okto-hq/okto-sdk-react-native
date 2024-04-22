import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export function Loading() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="lightblue" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
