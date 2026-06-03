import {
  Badge,
  Difficulty,
  FinishedQuest,
  Quest,
  TravelerType,
  UserProfile,
} from './types';

export const TRAVELER_TYPES: {
  type: TravelerType;
  title: string;
  tagline: string;
  icon: 'camera-outline' | 'flame-outline' | 'leaf-outline';
}[] = [
  {
    type: 'photographer',
    title: 'The Photographer',
    tagline: 'Focus on sweeping panoramic vistas.',
    icon: 'camera-outline',
  },
  {
    type: 'athlete',
    title: 'The Athlete',
    tagline: 'Focus on routes with serious elevation gain.',
    icon: 'flame-outline',
  },
  {
    type: 'zen',
    title: 'The Zen Explorer',
    tagline: 'Focus on silence and tranquil water basins.',
    icon: 'leaf-outline',
  },
];

export const travelerLabel = (t: TravelerType) =>
  TRAVELER_TYPES.find((x) => x.type === t)?.title ?? 'Explorer';

export const difficultyColor = (d: Difficulty): string => {
  switch (d) {
    case 'Easy':
      return '#5B9A78';
    case 'Moderate':
      return '#C9A24B';
    case 'Hard':
      return '#C77B43';
    case 'Expert':
      return '#B4543C';
  }
};

// A plausible Vitosha-area route near Sofia, Bulgaria.
const kopitotoRoute: [number, number][] = [
  [42.6601, 23.2705],
  [42.6588, 23.2742],
  [42.657, 23.2778],
  [42.6555, 23.281],
  [42.6541, 23.2849],
  [42.6532, 23.2891],
  [42.6529, 23.2935],
];

export const SAMPLE_QUESTS: Quest[] = [
  {
    id: 'q-kopitoto',
    name: 'Kopitoto Summit',
    teaser: 'Kopitoto awaits you',
    region: 'Vitosha Nature Park',
    difficulty: 'Moderate',
    ascentMinutes: 95,
    distanceKm: 6.4,
    elevationGainM: 540,
    calories: 720,
    steps: 9100,
    route: kopitotoRoute,
    userLocation: [42.6977, 23.3219],
    car: {
      route: [
        [42.6977, 23.3219],
        [42.685, 23.305],
        [42.671, 23.288],
        [42.6601, 23.2705],
      ],
      driveMinutes: 28,
    },
    transit: {
      stopName: 'Kopitoto Station',
      stopLocation: [42.6635, 23.2668],
      walkPath: [
        [42.6635, 23.2668],
        [42.6618, 23.2689],
        [42.6601, 23.2705],
      ],
      walkMinutes: 12,
    },
    weather: [
      { time: 'Now', temp: 17, condition: 'sunny' },
      { time: '+1h', temp: 18, condition: 'partly' },
      { time: '+2h', temp: 18, condition: 'partly' },
      { time: '+3h', temp: 16, condition: 'cloudy' },
      { time: '+4h', temp: 15, condition: 'cloudy' },
      { time: '+5h', temp: 14, condition: 'rain' },
      { time: '+6h', temp: 13, condition: 'rain' },
    ],
    outfit: [
      'Light moisture-wicking base layer',
      'Packable rain shell for hour 5+',
      'Trail shoes with grip',
      'Sun hat & SPF for the open ridge',
    ],
  },
  {
    id: 'q-cherni-vrah',
    name: 'Cherni Vrah Peak',
    teaser: 'Cherni Vrah is calling',
    region: 'Vitosha Nature Park',
    difficulty: 'Hard',
    ascentMinutes: 165,
    distanceKm: 11.2,
    elevationGainM: 1080,
    calories: 1340,
    steps: 16800,
    route: [
      [42.5805, 23.2855],
      [42.5862, 23.2871],
      [42.5921, 23.2829],
      [42.5972, 23.2802],
      [42.6018, 23.2776],
    ],
    userLocation: [42.6977, 23.3219],
    car: {
      route: [
        [42.6977, 23.3219],
        [42.66, 23.31],
        [42.62, 23.295],
        [42.5805, 23.2855],
      ],
      driveMinutes: 42,
    },
    transit: {
      stopName: 'Aleko Hut Stop',
      stopLocation: [42.585, 23.292],
      walkPath: [
        [42.585, 23.292],
        [42.5828, 23.2888],
        [42.5805, 23.2855],
      ],
      walkMinutes: 18,
    },
    weather: [
      { time: 'Now', temp: 12, condition: 'partly' },
      { time: '+1h', temp: 12, condition: 'cloudy' },
      { time: '+2h', temp: 11, condition: 'cloudy' },
      { time: '+3h', temp: 10, condition: 'rain' },
      { time: '+4h', temp: 9, condition: 'rain' },
      { time: '+5h', temp: 9, condition: 'cloudy' },
      { time: '+6h', temp: 10, condition: 'partly' },
    ],
    outfit: [
      'Insulating mid layer',
      'Waterproof jacket & trousers',
      'Gloves for the exposed summit',
      'Warm beanie',
    ],
  },
];

export const FINISHED_QUESTS: FinishedQuest[] = [
  {
    id: 'f-rila',
    name: 'Seven Rila Lakes',
    region: 'Rila Mountains',
    difficulty: 'Moderate',
    completedOn: 'May 18, 2026',
    distanceKm: 9.3,
    calories: 980,
    steps: 13400,
    elevationGainM: 620,
    route: [
      [42.205, 23.317],
      [42.211, 23.321],
      [42.218, 23.319],
      [42.224, 23.324],
      [42.231, 23.322],
    ],
  },
  {
    id: 'f-musala',
    name: 'Musala Ascent',
    region: 'Rila Mountains',
    difficulty: 'Expert',
    completedOn: 'Apr 27, 2026',
    distanceKm: 14.8,
    calories: 1820,
    steps: 21200,
    elevationGainM: 1300,
    route: [
      [42.179, 23.585],
      [42.184, 23.589],
      [42.189, 23.585],
      [42.194, 23.582],
      [42.1985, 23.5853],
    ],
  },
  {
    id: 'f-vitosha',
    name: 'Boyana Waterfall Loop',
    region: 'Vitosha Nature Park',
    difficulty: 'Easy',
    completedOn: 'Apr 9, 2026',
    distanceKm: 5.1,
    calories: 540,
    steps: 7600,
    elevationGainM: 360,
    route: [
      [42.633, 23.265],
      [42.629, 23.268],
      [42.625, 23.266],
      [42.621, 23.27],
      [42.618, 23.273],
    ],
  },
];

export const BADGES: Badge[] = [
  {
    id: 'b-altitude',
    title: 'Altitude Seeker',
    description: 'Climbed over 1,000 m in a single quest.',
    icon: 'trending-up',
    earned: true,
    accent: '#7A604A',
  },
  {
    id: 'b-explorer',
    title: 'Trail Explorer',
    description: 'Finished quests in 3 different regions.',
    icon: 'compass',
    earned: true,
    accent: '#5B9A78',
  },
  {
    id: 'b-marathon',
    title: 'Mountain Marathoner',
    description: 'Walked a cumulative 100 km.',
    icon: 'walk',
    earned: false,
    accent: '#C9A24B',
  },
  {
    id: 'b-zen',
    title: 'Zen Master',
    description: 'Visited 5 alpine water basins.',
    icon: 'water',
    earned: false,
    accent: '#4F8FB0',
  },
  {
    id: 'b-new-adventurer',
    title: 'New Adventurer',
    description: 'Make your first adventure.',
    icon: 'map-outline',
    earned: true,
    accent: '#3D7A5F',
  },
  {
    id: 'b-dawn-dragon',
    title: 'Dawn Dragon',
    description: 'Go on an adventure before 6:00.',
    icon: 'partly-sunny-outline',
    earned: false,
    accent: '#E89A30',
  },
  {
    id: 'b-dark-knight',
    title: 'Dark Knight',
    description: 'Go on an adventure after midnight.',
    icon: 'moon-outline',
    earned: false,
    accent: '#3D3A5C',
  },
  {
    id: 'b-weather-master',
    title: 'Weather Master',
    description: 'Complete a route in bad weather conditions.',
    icon: 'rainy-outline',
    earned: false,
    accent: '#4F7B9A',
  },
  {
    id: 'b-feet-of-iron',
    title: 'Feet of Iron',
    description: 'Walk 25,000 steps in a single day.',
    icon: 'footsteps-outline',
    earned: false,
    accent: '#8A6A50',
  },
  {
    id: 'b-diamond-legs',
    title: 'Diamond Legs',
    description: 'Walk 40,000 steps in a single day.',
    icon: 'diamond-outline',
    earned: false,
    accent: '#5B9ACA',
  },
  {
    id: 'b-goat',
    title: 'The GOAT',
    description: 'Climb a total of 10,000 m of elevation.',
    icon: 'medal-outline',
    earned: false,
    accent: '#B4543C',
  },
  {
    id: 'b-one-true-adventurer',
    title: 'The One True Adventurer',
    description: 'Collect all other badges.',
    icon: 'trophy-outline',
    earned: false,
    accent: '#C9A24B',
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Mila',
  lastName: 'Danailova',
  email: 'mdanileychenko@appolica.com',
  weightKg: 64,
  travelerType: 'photographer',
  totalKm: 132.4,
  totalCalories: 18420,
  totalSteps: 214800,
};
