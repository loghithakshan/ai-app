import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { AIService } = await import("@/services/ai.service");
  const { MemoryService } = await import("@/services/memory.service");
  
  const aiService = AIService.getInstance();
  const memoryService = new MemoryService();
  
  try {
    const { messages, childState } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // 1. Get last user message for RAG
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop()?.content || "";

    // 2. Retrieve context from Memory Service
    const memoryContext = await memoryService.retrieveContext(lastUserMessage);

    // 3. Generate response via AI Service
    const response = await aiService.generateResponse(
      messages,
      childState,
      memoryContext
    );

    const rawContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I am processing that...';

    // 4. Parse for potential memories and mood
    const { cleanText, memoryData, mood } = aiService.parseResponseMetadata(rawContent);

    // 5. If a memory was spawned, save it
    let savedMemory = null;
    if (memoryData) {
      savedMemory = await memoryService.addMemory({
        id: crypto.randomUUID(),
        content: memoryData.content,
        type: memoryData.type || "moment",
        timestamp: Date.now()
      });
    }

    return NextResponse.json({
      message: cleanText,
      memorySpawned: savedMemory,
      mood: mood,
      usage: response.usage
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'An error occurred during communication';
    console.error('API Error:', error);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
