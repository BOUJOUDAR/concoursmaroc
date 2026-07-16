import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SITE_CONFIG } from "@/lib/utils/constants";
import { BookOpen, Users, FileText, Award } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.legal.about,
    description: dict.hero.subtitle,
    locale,
    path: "/a-propos",
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  const features = isAr
    ? [
        { icon: BookOpen, title: "مسابقات مغربية", desc: "معلومات شاملة عن جميع المسابقات الجامعية والوظيفية في المغرب" },
        { icon: FileText, title: "وثائق مجانية", desc: "آلاف الوثائق وامتحانات سابقة للتحضير الفعال" },
        { icon: Users, title: "مجتمع تعليمي", desc: "منصة مفتوحة للجميع بدون تسجيل أو اشتراك" },
        { icon: Award, title: "محتوى موثوق", desc: "معلومات محدثة ودقيقة عن المسابقات والتوظيف" },
      ]
    : [
        { icon: BookOpen, title: "Concours Marocains", desc: "Informations complètes sur tous les concours universitaires et professionnels au Maroc" },
        { icon: FileText, title: "Documents Gratuits", desc: "Des milliers de documents et annales pour une préparation efficace" },
        { icon: Users, title: "Communauté Éducative", desc: "Plateforme ouverte à tous sans inscription ni abonnement" },
        { icon: Award, title: "Contenu Fiable", desc: "Informations actualisées et précises sur les concours et l&apos;emploi" },
      ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.legal.about, href: `/${locale}/a-propos` }]}
        locale={locale}
      />

      <article className="mt-8">
        <h1 className="text-3xl font-bold mb-6">{dict.legal.about}</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-12">
          {isAr ? (
            <>
              <p>
                <strong>{SITE_CONFIG.name.ar}</strong> منصة تعليمية مغربية مجانية تهدف إلى مساعدة الطلاب والخريجين على التحضير للمسابقات الجامعية والوظيفية في المغرب.
              </p>
              <p>
                نؤمن بأن التعليم حق للجميع، لذلك نوفر جميع محتوياتنا مجاناً وبدون تسجيل. نسعى لتوفير أدق المعلومات وأحدثها عن المسابقات والتوظيف في المغرب.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>{SITE_CONFIG.name.fr}</strong> est une plateforme éducative marocaine gratuite qui vise à aider les étudiants et diplômés à se préparer aux concours universitaires et professionnels au Maroc.
              </p>
              <p>
                Nous croyons que l&apos;éducation est un droit pour tous, c&apos;est pourquoi nous fournissons tout notre contenu gratuitement et sans inscription. Nous nous efforçons de fournir les informations les plus précises et à jour sur les concours et l&apos;emploi au Maroc.
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card">
              <f.icon className="h-8 w-8 text-brand-600 mb-3" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4">{isAr ? "مهمتنا" : "Notre Mission"}</h2>
          <p className="text-muted">
            {isAr
              ? "توفير منصة شاملة ومجانية للتحضير للمسابقات المغربية، مع التركيز على جودة المحتوى وسهولة الوصول."
              : "Fournir une plateforme complète et gratuite pour la préparation aux concours marocains, en mettant l&apos;accent sur la qualité du contenu et l&apos;accessibilité."}
          </p>
        </div>
      </article>
    </div>
  );
}
