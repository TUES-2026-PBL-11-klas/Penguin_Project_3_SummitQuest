import { Ionicons } from '@expo/vector-icons';
import { WeatherHour } from '../data/types';

export const weatherIcon = (
  c: WeatherHour['condition'],
): { name: keyof typeof Ionicons.glyphMap; color: string; label: string } => {
  switch (c) {
    case 'sunny':
      return { name: 'sunny', color: '#E0A53B', label: 'Sunny' };
    case 'partly':
      return { name: 'partly-sunny', color: '#D69B4A', label: 'Partly cloudy' };
    case 'cloudy':
      return { name: 'cloud', color: '#8A93A0', label: 'Cloudy' };
    case 'rain':
      return { name: 'rainy', color: '#4F8FB0', label: 'Rain' };
  }
};

/** Pick the dominant condition over the forecast window. */
export const summarizeWeather = (hours: WeatherHour[]): WeatherHour['condition'] => {
  const order: WeatherHour['condition'][] = ['rain', 'cloudy', 'partly', 'sunny'];
  const counts: Record<string, number> = {};
  hours.forEach((h) => (counts[h.condition] = (counts[h.condition] ?? 0) + 1));
  return order.find((c) => (counts[c] ?? 0) >= 3) ?? hours[0].condition;
};
