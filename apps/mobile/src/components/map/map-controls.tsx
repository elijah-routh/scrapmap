import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function MapControls() {
  return (
    <View style={styles.container}>

      <Pressable style={styles.button}>
        <Ionicons
          name="locate-outline"
          size={24}
          color="#333"
        />
      </Pressable>

      <Pressable style={styles.button}>
        <Ionicons
          name="layers-outline"
          size={24}
          color="#333"
        />
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  button: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 5,
  },
});