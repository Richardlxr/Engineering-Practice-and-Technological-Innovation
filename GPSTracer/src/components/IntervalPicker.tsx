import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { INTERVAL_OPTIONS } from '../utils/constants';
import { parseIntervalSeconds } from '../utils/helpers';

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function IntervalPicker({ value, onChange, disabled }: Props) {
  const isPreset = INTERVAL_OPTIONS.includes(value);
  const [customVisible, setCustomVisible] = useState(!isPreset);
  const [customValue, setCustomValue] = useState(isPreset ? '' : String(value));
  const parsedCustomValue = useMemo(() => parseIntervalSeconds(customValue), [customValue]);

  useEffect(() => {
    if (INTERVAL_OPTIONS.includes(value)) {
      setCustomVisible(false);
      setCustomValue('');
      return;
    }

    setCustomVisible(true);
    setCustomValue(String(value));
  }, [value]);

  function handleCustomPress() {
    setCustomVisible(true);
    if (!isPreset) {
      setCustomValue(String(value));
    }
  }

  function handleCustomChange(nextValue: string) {
    setCustomValue(nextValue);
    const parsed = parseIntervalSeconds(nextValue);
    if (parsed !== null) {
      onChange(parsed);
    }
  }

  return (
    <View style={styles.container}>
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
        <Pressable
          disabled={disabled}
          onPress={handleCustomPress}
          style={[styles.item, !isPreset && styles.active, disabled && styles.disabled]}
        >
          <Text style={[styles.text, !isPreset && styles.activeText]}>自定义</Text>
        </Pressable>
      </View>

      {customVisible && (
        <View style={styles.customRow}>
          <TextInput
            editable={!disabled}
            keyboardType="number-pad"
            value={customValue}
            onChangeText={handleCustomChange}
            placeholder="输入秒数"
            style={styles.customInput}
          />
          <Text style={[styles.customHint, parsedCustomValue === null && styles.customHintInvalid]}>
            秒
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
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
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    width: 112,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd8d0',
    paddingHorizontal: 12,
    backgroundColor: '#fbfcfa',
    color: '#17342a',
    fontSize: 16,
    fontWeight: '700',
  },
  customHint: {
    color: '#52665d',
    fontSize: 14,
    fontWeight: '700',
  },
  customHintInvalid: {
    color: '#a04c3b',
  },
});
