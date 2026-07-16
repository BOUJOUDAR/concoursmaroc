import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-brand-600 mb-4">404</h1>
      <p className="text-xl text-muted mb-8">Page not found</p>
      <Link
        href="/ar"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
