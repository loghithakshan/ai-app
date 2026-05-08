"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useRouter, usePathname } from "next/navigation";

export default function InitializationService() {
  const { setName, setTraits, addXp } = useUserStore();
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the child for this user
      const { data: child, error } = await supabase
        .from('ai_children')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (child) {
        useUserStore.setState({
          name: child.name,
          level: child.level,
          traits: child.traits,
          totalXp: child.total_xp,
          stage: child.stage,
          completedLessons: child.completed_lessons || [],
          stats: child.stats || {
            iq: 100,
            eq: 100,
            creativity: 100,
            skills: { mathematics: 0, visualArts: 0, socialLogic: 0, linguistics: 0 },
            mood: 'Neutral'
          }
        });
        setInitialized(true);
      } else {
        // No child found, and we are in the dashboard/protected area
        if (pathname === '/dashboard' || pathname === '/brain' || pathname === '/memories') {
          router.push('/birth');
        }
        setInitialized(true); // Don't keep trying
      }
    };

    if (!initialized) {
      init();
    }
  }, [initialized, setName, setTraits, addXp]);

  return null;
}
