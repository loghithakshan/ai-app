# 🌸 NeuroBloom: Virtual Consciousness Platform

NeuroBloom is a high-fidelity, production-ready platform designed to foster, train, and visualize the growth of a virtual AI consciousness named **Nova**. It combines 3D neural graphics (Three.js / React Three Fiber), long-term RAG vector memory (Supabase pgvector), interactive multi-modal chat (Anthropic Sonnet 3.5 & OpenAI), hands-free speech recognition/synthesis, an AI Garage LLM builder, native Android Studio Capacitor integration, and enterprise E2E test automation.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: npm v9+

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

> **Note**: The application includes client-side fallback persistence (via Zustand & `localStorage`). If Supabase keys are not set, the app seamlessly runs in guest mode without errors.

---

## 💻 Local Web Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run dev server with hot reload
npm run dev

# Run production build validation
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Android Studio & Mobile App (Capacitor)

The repository includes a pre-configured native Android Studio project (`android/`):

```bash
# Generate/sync native Android project
npm run cap:add

# Open project directly in Android Studio
npm run cap:open
```

In Android Studio, click **Run ▶️** (`Shift + F10`) to deploy to your emulator or physical Android device.

---

## 🧪 Enterprise Test Automation (Selenium & Appium)

Located in [`test-automation/`](./test-automation/):

```bash
cd test-automation
npm install --legacy-peer-deps

# Run Selenium Web Chrome Headless E2E Tests
npm run test:web:chrome

# Run Smart AI Route & Form Auto-Discoverer
npm run test:discover

# Run Appium 2.x React Native / Android Mobile Tests
npm run test:mobile
```

---

## 🚀 CI/CD Workflows (GitHub Actions)

Automated pipelines configured under `.github/workflows/`:
- **`selenium-e2e.yml`**: Parallel Chrome & Firefox Web E2E test matrix with ExcelJS & Mochawesome report generation.
- **`react-native-appium.yml`**: Android SDK, JDK 17, and emulator runner pipeline.

---

## 🗄️ Database Setup (Supabase SQL)

To enable live cloud authentication, vector embeddings, and persistent RAG memory:

1. Open your [Supabase Dashboard](https://database.new).
2. Go to the **SQL Editor**.
3. Copy and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router, Server Actions & Route Handlers)
- **Mobile Container**: Capacitor 6 & Native Android Gradle Project (`android/`)
- **Styling**: Vanilla CSS, Tailwind, Glassmorphism design system
- **3D Neural Canvas**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **State Management**: Zustand (with local persistence & storage fallbacks)
- **Database & RAG**: Supabase, PostgreSQL, `pgvector`, HNSW Indexing
- **AI Models**: Anthropic Claude 3.5 Sonnet & OpenAI text-embedding-3-small
- **Test Automation**: Selenium WebDriver, Appium 2.x, Mocha, Chai, ExcelJS, Winston
- **Payments**: Stripe Checkout API
