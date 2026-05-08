"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";

export default function PersistenceService() {
  const { 
    name, 
    level, 
    totalXp, 
    stage, 
    traits, 
    completedLessons 
  } = useUserStore();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    // Skip the first load to prevent overwriting DB with default store values
    // if the InitializationService hasn't finished yet.
    // However, InitializationService calls useUserStore.setState, which triggers this effect.
    // We should only sync if we have a user and we're sure we're in a "dirty" state.
    
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    const syncToSupabase = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Syncing Nova state to Supabase...");
      
      const { error } = await supabase
        .from('ai_children')
        .update({
          name,
          level,
          total_xp: totalXp,
          stage,
          traits,
          completed_lessons: completedLessons,
          stats: useUserStore.getState().stats // Sync the full stats object
        })
        .eq('user_id', user.id);

      if (error) {
        console.error("Failed to sync Nova state:", error.message);
      }
    };

    // Debounce sync
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(syncToSupabase, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [name, level, totalXp, stage, traits, completedLessons]);

  return null;
}
