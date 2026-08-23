import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-clash font-bold text-white mb-4">404</h1>
      <p className="text-xl text-text-muted mb-8">The neural pathway you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">
        <button className="px-6 py-3 bg-accent-neural text-white rounded-xl font-bold">
          Return to Core
        </button>
      </Link>
    </div>
  );
}
