import { NextResponse } from 'next/server';

export async function GET() {
  const { MemoryService } = await import("@/services/memory.service");
  const { supabase } = await import("@/lib/supabase");
  
  const memoryService = new MemoryService();

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ memories: [], isGuest: true });
    }

    const memories = await memoryService.getMemories(session.user.id);
    return NextResponse.json({ memories });
  } catch (error) {
    console.error("GET memories error:", error);
    return NextResponse.json({ memories: [], isGuest: true });
  }
}

export async function POST(req: Request) {
  const { MemoryService } = await import("@/services/memory.service");
  const { supabase } = await import("@/lib/supabase");
  
  const memoryService = new MemoryService();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const memory = await req.json();

    const memoryToSave = {
      ...memory,
      timestamp: memory.timestamp || Date.now(),
      id: memory.id || crypto.randomUUID()
    };

    if (!session) {
      return NextResponse.json({ memory: memoryToSave, isGuest: true });
    }

    const savedMemory = await memoryService.addMemory(memoryToSave);
    return NextResponse.json({ memory: savedMemory });
  } catch (error) {
    console.error("POST memory error:", error);
    return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
  }
}

