import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

const filters = [
  'Explore',
  'My Map',
  'Friends',
  'National Parks',
  'Landmarks',
];

export function MapFilterBar() {
  const [selected, setSelected] = useState('Explore');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {filters.map((filter) => (
        <Pressable
          key={filter}
          onPress={() => setSelected(filter)}
          style={[
            styles.filter,
            selected === filter && styles.selected,
          ]}
        >
          <Text
            style={[
              styles.text,
              selected === filter && styles.selectedText,
            ]}
          >
            {filter}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },

  filter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    elevation: 3,
  },

  selected: {
    backgroundColor: '#537A5A',
  },

  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  selectedText: {
    color: '#FFFFFF',
  },
});