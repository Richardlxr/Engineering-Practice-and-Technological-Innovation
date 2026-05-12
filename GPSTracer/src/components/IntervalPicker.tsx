import { Pressable, StyleSheet, Text, View } from 'react-native';
import { INTERVAL_OPTIONS } from '../utils/constants';

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function IntervalPicker({ value, onChange, disabled }: Props) {
  return (
    <View style={styles.wrap}>
      {INTERVAL_OPTIONS.map((option) => (
        <Pressable
          key={option}
          disabled={disabled}
          onPress={() => onChange(option)}
          style={[styles.item, value === option && styles.active, disabled && styles.disabled]}
        >
          <Text style={[styles.text, value === option && styles.activeText]}>{option}s</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  item: {
    minWidth: 48,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c7d2c5',
    backgroundColor: '#f8faf6',
  },
  active: {
    backgroundColor: '#1f5f4a',
    borderColor: '#1f5f4a',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#29443a',
    fontWeight: '700',
  },
  activeText: {
    color: '#fff',
  },
});
