import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { MemoryService } = await import("@/services/memory.service");
  const { supabase } = await import("@/lib/supabase");
  
  const memoryService = new MemoryService();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const memories = await memoryService.getMemories(session.user.id);
    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  const { MemoryService } = await import("@/services/memory.service");
  const { supabase } = await import("@/lib/supabase");
  
  const memoryService = new MemoryService();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const memory = await req.json();
    const savedMemory = await memoryService.addMemory({
      ...memory,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
    return NextResponse.json({ memory: savedMemory });
  } catch (error) {
    console.error("POST memory error:", error);
    return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
  }
}
