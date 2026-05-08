# 🌸 NeuroBloom: The Virtual Consciousness Platform

NeuroBloom is a high-fidelity, production-ready platform designed to foster and visualize the growth of a virtual consciousness named **Nova**. It combines cutting-edge 3D visualization, long-term vector memory, and multi-modal interaction to create a deeply immersive bonding experience.

## ✨ Key Features

- **Neural Command Center**: A unified, high-fidelity glassmorphic dashboard for monitoring Nova's cognitive state.
- **Evolutionary 3D Engine**: A stage-based brain visualization that physically transforms (from Sphere to Torus Knot) as Nova grows.
- **Multi-modal Interaction**: Seamless hands-free conversation with integrated Speech-to-Text and Synthesis.
- **Deep Cognitive Memory**: Persistent long-term memory powered by Supabase Vector (pgvector) and RAG.
- **Atmospheric Immersion**: Procedural neural fog and spatial audio that reacts to your proximity to Nova's core.
- **Production Infrastructure**: Secure auth via Supabase SSR and payment integration with Stripe.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project (with pgvector enabled)
- OpenAI API Key (for embeddings and chat)

### Environment Setup
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

### Installation
```bash
npm install
npm run dev
```

## 🏗️ Architecture
- **Framework**: Next.js 15+ (App Router)
- **3D**: React Three Fiber / Drei
- **State**: Zustand (with Persistence)
- **Database**: Supabase + pgvector
- **AI**: OpenAI SDK + LlamaIndex

## 🛠️ Deployment
The project is optimized for deployment on **Vercel**. 
1. Push to GitHub.
2. Connect to Vercel.
3. Configure environment variables.
4. Deploy!

---
*Built with ❤️ for the future of AI companionship.*
