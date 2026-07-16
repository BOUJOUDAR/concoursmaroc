import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Mail, MessageCircle } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.legal.contact,
    description: dict.hero.subtitle,
    locale,
    path: "/contact",
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.legal.contact, href: `/${locale}/contact` }]}
        locale={locale}
      />

      <div className="mt-8">
        <h1 className="text-3xl font-bold mb-6">{dict.legal.contact}</h1>

        <p className="text-muted mb-8 max-w-2xl">
          {isAr
            ? "لديك سؤال أو اقتراح؟ لا تتردد في التواصل معنا. نحن نسعى للرد على جميع رسائلكم في أقرب وقت ممكن."
            : "Vous avez une question ou une suggestion ? N&apos;hésitez pas à nous contacter. Nous nous efforçons de répondre à tous vos messages dans les plus brefs délais."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card">
            <Mail className="h-8 w-8 text-brand-600 mb-3" />
            <h2 className="font-semibold mb-2">{isAr ? "البريد الإلكتروني" : "Email"}</h2>
            <p className="text-sm text-muted mb-3">
              {isAr ? "أرسل لنا رسالة بريد إلكتروني" : "Envoyez-nous un email"}
            </p>
            <a
              href="mailto:contact@concoursmaroc.ma"
              className="text-brand-600 hover:underline text-sm font-medium"
            >
              contact@concoursmaroc.ma
            </a>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <MessageCircle className="h-8 w-8 text-green-600 mb-3" />
            <h2 className="font-semibold mb-2">{isAr ? "النشرة الإخبارية" : "Newsletter"}</h2>
            <p className="text-sm text-muted mb-3">
              {isAr ? "اشترك للحصول على آخر أخبار المسابقات" : "Abonnez-vous pour recevoir les dernières nouvelles"}
            </p>
            <a
              href={`/${locale}#newsletter`}
              className="text-brand-600 hover:underline text-sm font-medium"
            >
              {isAr ? "اشترك الآن" : "S&apos;abonner maintenant"}
            </a>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold mb-3">{isAr ? "الأسئلة الشائعة" : "Questions Fréquentes"}</h2>
          <p className="text-sm text-muted">
            {isAr
              ? "قبل التواصل معنا، تحقق من صفحة الأسئلة الشائعة قد نجد إجابة سؤالك هناك."
              : "Avant de nous contacter, consultez notre page FAQ - vous y trouverez peut-être la réponse à votre question."}
          </p>
          <a href={`/${locale}#faq`} className="text-brand-600 hover:underline text-sm font-medium mt-2 inline-block">
            {isAr ? "عرض الأسئلة الشائعة" : "Voir la FAQ"}
          </a>
        </div>
      </div>
    </div>
  );
}
