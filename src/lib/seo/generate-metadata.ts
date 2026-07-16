import { type Locale } from "@/lib/i18n/config";
import { SITE_CONFIG } from "@/lib/utils/constants";

interface GenerateMetadataProps {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  image?: string;
}

export function generateSEOMetadata({
  title,
  description,
  locale,
  path,
  image,
}: GenerateMetadataProps) {
  const url = `${SITE_CONFIG.url}/${locale}${path}`;
  const ogImage = image || SITE_CONFIG.ogImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name[locale],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        ar: `${SITE_CONFIG.url}/ar${path}`,
        fr: `${SITE_CONFIG.url}/fr${path}`,
      },
    },
  };
}
