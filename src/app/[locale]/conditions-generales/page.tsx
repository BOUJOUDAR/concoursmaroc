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
    title: dict.legal.terms_conditions,
    description: dict.hero.subtitle,
    locale,
    path: "/conditions-generales",
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.legal.terms_conditions, href: `/${locale}/conditions-generales` }]}
        locale={locale}
      />
      <article className="mt-8 prose prose-gray dark:prose-invert max-w-none">
        <h1>{isAr ? "الشروط والأحكام" : "Conditions Générales d&apos;Utilisation"}</h1>
        <p className="text-muted text-sm">
          {isAr ? "آخر تحديث: 15 يوليو 2026" : "Dernière mise à jour : 15 juillet 2026"}
        </p>

        {isAr ? (
          <>
            <h2>١. قبول الشروط</h2>
            <p>باستخدام موقع ConcoursMaroc، أنت توافق على هذه الشروط والأحكام.</p>

            <h2>٢. وصف الخدمة</h2>
            <p> ConcoursMaroc منصة مجانية توفر معلومات عن المسابقات والتحصيل الدراسي في المغرب. جميع المحتويات مجانية ومتاحة للجميع.</p>

            <h2>٣.产权</h2>
            <p>جميع المحتويات على هذا الموقع محمية بحقوق الملكية الفكرية. يُمنع نسخ أو توزيع المحتوى بدون إذن مسبق.</p>

            <h2>٤. مسؤولية المستخدم</h2>
            <p>يتحمل المستخدم المسؤولية عن استخدامه للموقع وتوثيق المعلومات.</p>

            <h2>٥. تعليقات المستخدمين</h2>
            <p>يجب أن تكون التعليقات مهذبة وملائمة. نحتفظ بحق حذف أي محتوى مخالف.</p>

            <h2>٦. تعديلات الشروط</h2>
            <p>نحتفظ بحق تعديل هذه الشروط في أي وقت.</p>

            <h2>٧. القانون الحاكم</h2>
            <p>تخضع هذه الشروط لقوانين المملكة المغربية.</p>
          </>
        ) : (
          <>
            <h2>1. Acceptation des conditions</h2>
            <p>En utilisant le site ConcoursMaroc, vous acceptez ces conditions générales d&apos;utilisation.</p>

            <h2>2. Description du service</h2>
            <p>ConcoursMaroc est une plateforme gratuite fournissant des informations sur les concours et les études au Maroc. Tout le contenu est gratuit et accessible à tous.</p>

            <h2>3. Propriété intellectuelle</h2>
            <p>Tout le contenu de ce site est protégé par le droit d&apos;auteur. La copie ou la distribution du contenu sans autorisation préalable est interdite.</p>

            <h2>4. Responsabilité de l&apos;utilisateur</h2>
            <p>L&apos;utilisateur est responsable de son utilisation du site et de la vérification des informations.</p>

            <h2>5. Commentaires des utilisateurs</h2>
            <p>Les commentaires doivent être respectueux et appropriés. Nous nous réservons le droit de supprimer tout contenu non conforme.</p>

            <h2>6. Modifications des conditions</h2>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment.</p>

            <h2>7. Loi applicable</h2>
            <p>Ces conditions sont régies par les lois du Royaume du Maroc.</p>
          </>
        )}
      </article>
    </div>
  );
}
