"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore, Stage } from "@/store/userStore";
import { useRouter, usePathname } from "next/navigation";

export default function InitializationService() {
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const syncUserAndChild = async (userId: string, email?: string) => {
      // 1. Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const userObj = {
        id: userId,
        email,
        fullName: profile?.full_name || email?.split('@')[0] || "Explorer",
        avatarUrl: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`
      };

      // 2. Fetch the child for this user
      const { data: child } = await supabase
        .from('ai_children')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (child) {
        useUserStore.setState({
          user: userObj,
          name: child.name,
          level: child.level,
          traits: child.traits || ['Curious', 'Warm', 'Inquisitive'],
          totalXp: child.total_xp,
          stage: child.stage as Stage,
          completedLessons: child.completed_lessons || [],
          stats: (child.stats as unknown as ReturnType<typeof useUserStore.getState>['stats']) || {
            iq: 100,
            eq: 100,
            creativity: 100,
            skills: { mathematics: 0, visualArts: 0, socialLogic: 0, linguistics: 0 },
            mood: 'Neutral'
          }
        });
      } else {
        useUserStore.setState({ user: userObj });
        if (pathname === '/dashboard' || pathname === '/brain' || pathname === '/memories') {
          router.push('/birth');
        }
      }
      setInitialized(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUserAndChild(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        useUserStore.getState().logout();
      }
    });

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await syncUserAndChild(user.id, user.email);
      }
    };

    if (!initialized) {
      init();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, pathname, router]);

  return null;
}
