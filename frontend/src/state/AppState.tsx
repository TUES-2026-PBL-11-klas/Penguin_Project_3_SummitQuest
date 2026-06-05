import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_PROFILE,
} from '../data/mock';
import { FinishedQuest, Quest, TravelerType, UserProfile } from '../data/types';

interface AppStateValue {
  profile: UserProfile;
  finishedQuests: FinishedQuest[];
  token: string | null;
  userId: string | null;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setTravelerType: (t: TravelerType) => void;
  setWeight: (kg: number) => void;
  completeQuest: (quest: Quest) => void;
  setAuth: (token: string, userId: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [finishedQuests, setFinishedQuests] = useState<FinishedQuest[]>([]);
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const value = useMemo<AppStateValue>(
    () => ({
      profile,
      finishedQuests,
      token,
      userId,
      updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
      setTravelerType: (t) => setProfile((p) => ({ ...p, travelerType: t })),
      setWeight: (kg) =>
        setProfile((p) => ({ ...p, weightKg: Math.max(30, Math.min(200, kg)) })),
      setAuth: (t, uid) => {
        setTokenState(t);
        setUserId(uid);
      },
      completeQuest: (quest) => {
        const entry: FinishedQuest = {
          id: `f-${quest.id}-${finishedQuests.length}`,
          name: quest.name,
          region: quest.region,
          difficulty: quest.difficulty,
          completedOn: 'Today',
          distanceKm: quest.distanceKm,
          calories: quest.calories,
          steps: quest.steps,
          elevationGainM: quest.elevationGainM,
          route: quest.route,
        };
        setFinishedQuests((list) => [entry, ...list]);
        setProfile((p) => ({
          ...p,
          totalKm: +(p.totalKm + quest.distanceKm).toFixed(1),
          totalCalories: p.totalCalories + quest.calories,
          totalSteps: p.totalSteps + quest.steps,
        }));
      },
    }),
    [profile, finishedQuests, token, userId],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};
