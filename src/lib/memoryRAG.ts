import { Document, VectorStoreIndex } from "llamaindex";

// This is an in-memory vector store singleton for demo purposes
let index: VectorStoreIndex | null = null;
let useFallback = false;

export interface MemoryNode {
  id: string;
  content: string;
  type: "emotional" | "factual" | "skill" | "value" | "moment";
  timestamp: number;
}

const memories: MemoryNode[] = [];

// Initialize or get the index
export async function getVectorIndex() {
  if (!index && !useFallback) {
    try {
      const doc = new Document({ text: "Nova was born today. The user is acting as a parent.", id_: "birth_memory" });
      index = await VectorStoreIndex.fromDocuments([doc]);
    } catch (error) {
      console.warn("LlamaIndex initialization failed, likely due to missing OPENAI_API_KEY. Falling back to simple keyword matching.", error);
      useFallback = true;
    }
  }
  return index;
}

export async function addMemory(memory: MemoryNode) {
  memories.push(memory);
  
  if (!useFallback) {
    try {
      const doc = new Document({ text: `[${memory.type.toUpperCase()}] ${memory.content}`, id_: memory.id });
      if (!index) {
        index = await VectorStoreIndex.fromDocuments([doc]);
      } else {
        index = await VectorStoreIndex.fromDocuments([
          ...memories.map(m => new Document({ text: `[${m.type.toUpperCase()}] ${m.content}`, id_: m.id }))
        ]);
      }
    } catch (error) {
      console.warn("Failed to add to vector index, falling back.", error);
      useFallback = true;
    }
  }
  
  return memory;
}

export async function retrieveRelevantMemories(query: string, topK: number = 3) {
  if (useFallback) {
    // Simple mock retriever based on keywords
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(" ").filter(w => w.length > 3);
    
    // Sort memories by how many keywords they contain
    const scoredMemories = memories.map(m => {
      let score = 0;
      const lowerContent = m.content.toLowerCase();
      keywords.forEach(kw => {
        if (lowerContent.includes(kw)) score++;
      });
      return { memory: m, score };
    });
    
    // If no keyword match, just return random/most recent
    scoredMemories.sort((a, b) => b.score - a.score);
    return scoredMemories.slice(0, topK).map(s => `[${s.memory.type.toUpperCase()}] ${s.memory.content}`);
  }

  try {
    const idx = await getVectorIndex();
    if (!idx) return [];
    const retriever = idx.asRetriever({ similarityTopK: topK });
    const results = await retriever.retrieve(query);
    return results.map(r => (r.node as any).text as string);
  } catch (error) {
    console.error("Error retrieving memories, falling back", error);
    useFallback = true;
    return [];
  }
}

export function getAllMemories() {
  return memories;
}
