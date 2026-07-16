import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.legal.privacy_policy,
    description: dict.hero.subtitle,
    locale,
    path: "/politique-de-confidentialite",
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.legal.privacy_policy, href: `/${locale}/politique-de-confidentialite` }]}
        locale={locale}
      />
      <article className="mt-8 prose prose-gray dark:prose-invert max-w-none">
        <h1>{isAr ? "سياسة الخصوصية" : "Politique de Confidentialité"}</h1>
        <p className="text-muted text-sm">
          {isAr ? "آخر تحديث: 15 يوليو 2026" : "Dernière mise à jour : 15 juillet 2026"}
        </p>

        {isAr ? (
          <>
            <h2>١. مقدمة</h2>
            <p>مرحباً بكم في ConcoursMaroc. نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. تصف هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتكم.</p>

            <h2>٢. المعلومات التي نجمعها</h2>
            <p>نقوم فقط بجمع عنوان البريد الإلكتروني عند الاشتراك في نشرتنا الإخبارية. لا نجمع أي معلومات شخصية أخرى.</p>

            <h2>٣. كيف نستخدم المعلومات</h2>
            <p>نستخدم عنوان البريد الإلكتروني فقط لإرسال النشرة الإخبارية المتعلقة بالمسابقات والتحصيل الدراسي.</p>

            <h2>٤. حماية البيانات</h2>
            <p>نستخدم تقنيات الحماية المناسبة لحماية معلوماتكم من الوصول غير المصرح به.</p>

            <h2>٥. ملفات تعريف الارتباط</h2>
            <p>قد نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح على موقعنا.</p>

            <h2>٦. مشاركة البيانات</h2>
            <p>لا نقوم ببيع أو مشاركة بياناتكم مع أطراف ثالثة.</p>

            <h2>٧. حقوقك</h2>
            <p>لك الحق في الوصول إلى بياناتك وحذفها في أي وقت.</p>

            <h2>٨. الاتصال بنا</h2>
            <p>لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة الاتصال.</p>
          </>
        ) : (
          <>
            <h2>1. Introduction</h2>
            <p>Bienvenue sur ConcoursMaroc. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.</p>

            <h2>2. Informations collectées</h2>
            <p>Nous collectons uniquement votre adresse e-mail lorsque vous vous abonnez à notre newsletter. Nous ne collectons aucune autre information personnelle.</p>

            <h2>3. Utilisation des informations</h2>
            <p>Nous utilisons votre adresse e-mail uniquement pour vous envoyer la newsletter relative aux concours et aux études.</p>

            <h2>4. Protection des données</h2>
            <p>Nous utilisons des technologies de protection appropriées pour protéger vos informations contre tout accès non autorisé.</p>

            <h2>5. Cookies</h2>
            <p>Nous pouvons utiliser des cookies pour améliorer votre expérience de navigation sur notre site.</p>

            <h2>6. Partage des données</h2>
            <p>Nous ne vendons ni ne partageons vos données avec des tiers.</p>

            <h2>7. Vos droits</h2>
            <p>Vous avez le droit d&apos;accéder à vos données et de les supprimer à tout moment.</p>

            <h2>8. Nous contacter</h2>
            <p>Pour toute question concernant la politique de confidentialité, veuillez nous contacter via la page de contact.</p>
          </>
        )}
      </article>
    </div>
  );
}
