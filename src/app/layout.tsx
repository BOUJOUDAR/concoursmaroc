import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ConcoursMaroc - منصة التحضير للمسابقات المغربية",
    template: "%s | ConcoursMaroc",
  },
  description:
    "منصة مجانية للتحضير للمسابقات المغربية. آلاف الوثائق والامتحانات السابقة والمقالات التعليمية.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://concoursmaroc.ma"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
