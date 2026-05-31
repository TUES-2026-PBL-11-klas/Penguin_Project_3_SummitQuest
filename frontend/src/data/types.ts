export type TravelerType = 'photographer' | 'athlete' | 'zen';

export interface TravelerProfileMeta {
  type: TravelerType;
  title: string;
  tagline: string;
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
}

export type Difficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert';
export type TransportMode = 'car' | 'transit';

/** [latitude, longitude] */
export type LatLng = [number, number];

export interface WeatherHour {
  time: string;
  temp: number; // °C
  condition: 'sunny' | 'cloudy' | 'partly' | 'rain';
}

export interface Quest {
  id: string;
  name: string;
  teaser: string; // e.g. "Kopitoto awaits you"
  region: string;
  difficulty: Difficulty;
  ascentMinutes: number; // time to summit
  distanceKm: number;
  elevationGainM: number;
  calories: number;
  steps: number;
  route: LatLng[]; // start -> end, full outline
  userLocation: LatLng;
  // Approach details
  car: { route: LatLng[]; driveMinutes: number };
  transit: {
    stopName: string;
    stopLocation: LatLng;
    walkPath: LatLng[];
    walkMinutes: number;
  };
  weather: WeatherHour[];
  outfit: string[];
}

export interface FinishedQuest {
  id: string;
  name: string;
  region: string;
  difficulty: Difficulty;
  completedOn: string;
  distanceKm: number;
  calories: number;
  steps: number;
  elevationGainM: number;
  route: LatLng[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  accent: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  weightKg: number;
  travelerType: TravelerType;
  totalKm: number;
  totalCalories: number;
  totalSteps: number;
}
