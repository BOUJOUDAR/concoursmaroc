import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/utils/constants";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSlot } from "@/components/ads/AdSlot";
import "../globals.css";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return {
    title: {
      default: `${SITE_CONFIG.name[locale]} - ${dict.hero.subtitle}`,
      template: `%s | ${SITE_CONFIG.name[locale]}`,
    },
    description: SITE_CONFIG.description[locale],
    keywords: [...SITE_CONFIG.keywords[locale]],
    authors: [{ name: SITE_CONFIG.name[locale] }],
    openGraph: {
      title: SITE_CONFIG.name[locale],
      description: SITE_CONFIG.description[locale],
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name[locale],
      locale: isAr ? "ar_MA" : "fr_MA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_CONFIG.name[locale],
      description: SITE_CONFIG.description[locale],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/${locale}`,
      languages: {
        ar: `${SITE_CONFIG.url}/ar`,
        fr: `${SITE_CONFIG.url}/fr`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <Header dict={dict} locale={locale} />
          <AdSlot placement="header" className="mx-auto max-w-7xl" />
          <main className="min-h-[calc(100vh-180px)]">{children}</main>
          <Footer dict={dict} locale={locale} />
        </ThemeProvider>
      </body>
    </html>
  );
}
