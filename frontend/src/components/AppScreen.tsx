import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import TopBar from './TopBar';

/** Standard logged-in screen scaffold: persistent task bar + themed canvas. */
const AppScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.root}>
    <TopBar />
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
});

export default AppScreen;
