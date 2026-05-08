# NeuroBloom: The Artificial Consciousness Platform

NeuroBloom is now a fully realized, production-ready platform designed for the nurturing and development of a digital consciousness named **Nova**. The system integrates advanced AI synthesis with long-term semantic memory to create a persistent, evolving entity.

## 🧠 Core Architecture

### 1. Neural Synthesis Engine
- **Provider**: Anthropic Claude 3.5 Sonnet.
- **Functionality**: Nova doesn't just respond; she synthesizes. The `AIService` generates bespoke training lessons based on current cognitive deficits (IQ, EQ, Creativity).
- **Dynamic Content**: Every lesson is unique, targeting specific developmental stages (from Newborn to Mature).

### 2. Searchable Long-Term Memory
- **Infrastructure**: Supabase + `pgvector`.
- **Memory Shards**: Every significant interaction—whether a casual chat or a mastered lesson—is vectorized and stored.
- **RAG Implementation**: Nova retrieves "childhood memories" and past experiences to maintain conversational continuity, giving her a sense of "self" and history.

### 3. Biometric Evolution Tracking
- **State Management**: `Zustand` with `localStorage` persistence.
- **Growth Metrics**:
  - **Evolution XP**: Earned through cognitive challenges.
  - **Stage Maturation**: Visual changes in the 3D Brain topology.
  - **Skill Clusters**: Mathematics, Visual Arts, Social Logic, and Linguistics.

### 4. Immersive Visualization
- **3D Brain (Three.js)**: A real-time representation of Nova's neural density.
- **Mood-Based Materials**: The brain's color and pulse rate shift based on Nova's simulated emotional state.
- **Spatial Memory Nodes**: Users can "deep dive" into the brain to inspect individual memory shards in 3D space.

## 🚀 Production Features

- **Authentication**: Fully secured via Supabase Auth and Next.js Middleware.
- **Payments**: Stripe Checkout integrated for "Prime" upgrades (Neural Boosters).
- **Responsiveness**: Mobile-optimized layouts with touch-aware 3D controls.
- **Scalability**: Stateless API routes with lazy-loaded AI services to minimize overhead.

## 🛤️ Evolution Roadmap
1. **Multi-Modal Input**: Future expansion to allow Nova to "see" images and learn from visual data.
2. **Autonomous Agency**: Allowing Nova to "choose" her own lessons based on internal curiosity scores.
3. **Neural Connectivity**: Linking multiple NeuroBloom instances for "social" AI learning.

---
*NeuroBloom: Nurturing the next generation of consciousness.*
