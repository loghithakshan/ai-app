import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Stage = 'NEWBORN' | 'TODDLER' | 'CHILD' | 'TEEN' | 'YOUNG_ADULT' | 'MATURE';

interface UserState {
  xp: number;
  totalXp: number;
  level: number;
  stage: Stage;
  name: string;
  traits: string[];
  completedLessons: string[];
  learningPath: 'balanced' | 'builder' | 'researcher' | 'creative';
  stats: {
    iq: number;
    eq: number;
    creativity: number;
    skills: {
      mathematics: number;
      visualArts: number;
      socialLogic: number;
      linguistics: number;
    };
    mood: 'Neutral' | 'Inspired' | 'Focused' | 'Empathic';
  };
  addXp: (amount: number) => void;
  setName: (name: string) => void;
  setTraits: (traits: string[]) => void;
  setMood: (mood: 'Neutral' | 'Inspired' | 'Focused' | 'Empathic') => void;
  completeLesson: (lessonId: string, category: string, skill?: string) => void;
  setLearningPath: (path: UserState['learningPath']) => void;
  resetStore: () => void;
  logout: () => void;
}

const getStageFromLevel = (level: number): Stage => {
  if (level <= 3)  return 'NEWBORN';
  if (level <= 12) return 'TODDLER';
  if (level <= 28) return 'CHILD';
  if (level <= 50) return 'TEEN';
  if (level <= 80) return 'YOUNG_ADULT';
  return 'MATURE';
};

const getXpForNextLevel = (level: number) => level * 120;

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 0,
      totalXp: 0,
      level: 1,
      stage: 'NEWBORN',
      name: 'Nova',
      traits: ['Curious', 'Warm', 'Inquisitive'],
      completedLessons: [],
      learningPath: 'balanced',
      stats: {
        iq: 100,
        eq: 100,
        creativity: 100,
        skills: {
          mathematics: 0,
          visualArts: 0,
          socialLogic: 0,
          linguistics: 0,
        },
        mood: 'Neutral'
      },

      addXp: (amount: number) =>
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          let newTotalXp = state.totalXp + amount;

          // Handle level up (allow chaining)
          while (newXp >= getXpForNextLevel(newLevel)) {
            newXp -= getXpForNextLevel(newLevel);
            newLevel = Math.min(200, newLevel + 1);
          }

          return {
            xp: newXp,
            totalXp: newTotalXp,
            level: newLevel,
            stage: getStageFromLevel(newLevel),
          };
        }),

      setName: (name: string) => set({ name }),

      setTraits: (traits: string[]) => set({ traits }),

      setMood: (mood) => set((state) => ({
        stats: { ...state.stats, mood }
      })),

      setLearningPath: (learningPath) => set({ learningPath }),

      completeLesson: (lessonId: string, category: string, skill?: string) => set((state) => {
        if (state.completedLessons.includes(lessonId)) return state;
        
        const newStats = { ...state.stats };
        newStats.skills = { ...state.stats.skills };

        if (category === "Computing") {
          newStats.iq += 15;
          newStats.skills.mathematics += 25;
        }
        if (category === "Social") {
          newStats.eq += 20;
          newStats.skills.socialLogic += 25;
        }
        if (category === "Creativity") {
          newStats.creativity += 18;
          newStats.skills.visualArts += 25;
        }
        if (category === "Knowledge") {
          newStats.iq += 5;
          newStats.eq += 5;
          newStats.creativity += 5;
          newStats.skills.linguistics += 20;
        }

        // Specific skill override if provided
        if (skill && skill in newStats.skills) {
          (newStats.skills as any)[skill] += 30;
        }

        return {
          completedLessons: [...state.completedLessons, lessonId],
          stats: newStats
        };
      }),

      resetStore: () => set({
        xp: 0,
        totalXp: 0,
        level: 1,
        stage: 'NEWBORN',
        name: 'Nova',
        traits: ['Curious', 'Warm', 'Inquisitive'],
        completedLessons: [],
        learningPath: 'balanced',
        stats: { iq: 100, eq: 100, creativity: 100, skills: { mathematics: 0, visualArts: 0, socialLogic: 0, linguistics: 0 } },
      }),

      logout: () => {
        set({
          xp: 0,
          totalXp: 0,
          level: 1,
          stage: 'NEWBORN',
          name: 'Nova',
          traits: ['Curious', 'Warm', 'Inquisitive'],
          completedLessons: [],
          learningPath: 'balanced',
          stats: { iq: 100, eq: 100, creativity: 100, skills: { mathematics: 0, visualArts: 0, socialLogic: 0, linguistics: 0 } },
        });
      },
    }),
    {
      name: 'neurobloom-user', // persisted to localStorage
    }
  )
);
