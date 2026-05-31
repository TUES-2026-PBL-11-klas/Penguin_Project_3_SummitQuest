import { FinishedQuest } from '../data/types';

export type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  LogIn: undefined;
  FindQuest: undefined;
  FinishedQuests: undefined;
  FinishedQuestDetail: { quest: FinishedQuest };
  Profile: undefined;
  Badges: undefined;
};

export type AppRoute = keyof RootStackParamList;
