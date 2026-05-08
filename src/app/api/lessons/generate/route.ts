import { NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';

export async function POST(req: Request) {
  try {
    const { name, stage, level, traits, values, lowestSkill } = await req.json();
    
    const aiService = AIService.getInstance();
    const lesson = await aiService.generateLesson(
      { name, stage, level, traits, values },
      lowestSkill
    );
    
    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Lesson Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
