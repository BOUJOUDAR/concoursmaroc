import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { SITE_CONFIG } from "@/lib/utils/constants";
import { AdSlot } from "@/components/ads/AdSlot";
import { GraduationCap } from "lucide-react";

interface FooterProps {
  dict: Dictionary;
  locale: Locale;
}

export function Footer({ dict, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <AdSlot placement="footer" className="mx-auto max-w-7xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 font-bold text-xl mb-4"
            >
              <GraduationCap className="h-6 w-6 text-brand-600" />
              <span>
                <span className="text-brand-600">Concours</span>Maroc
              </span>
            </Link>
            <p className="text-sm text-muted">{dict.common.footer_desc}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{dict.common.quick_links}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/concours`} className="hover:text-brand-600 transition-colors">
                  {dict.nav.concours}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/bibliotheque`} className="hover:text-brand-600 transition-colors">
                  {dict.nav.library}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/annales`} className="hover:text-brand-600 transition-colors">
                  {dict.nav.exams}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-brand-600 transition-colors">
                  {dict.nav.blog}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{dict.nav.categories}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/categories/ensa`} className="hover:text-brand-600 transition-colors">
                  ENSA
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/categories/ensam`} className="hover:text-brand-600 transition-colors">
                  ENSAM
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/categories/medecine`} className="hover:text-brand-600 transition-colors">
                  {locale === "ar" ? "طب" : "Médecine"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/categories/encg`} className="hover:text-brand-600 transition-colors">
                  ENCG
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{dict.common.contact}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-brand-600">✉</span>
                <span>stagegep@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>
            © {currentYear} ConcoursMaroc. {dict.common.all_rights}.
          </p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/a-propos`} className="hover:text-brand-600 transition-colors">
              {dict.legal.about}
            </Link>
            <Link href={`/${locale}/politique-de-confidentialite`} className="hover:text-brand-600 transition-colors">
              {dict.legal.privacy_policy}
            </Link>
            <Link href={`/${locale}/conditions-generales`} className="hover:text-brand-600 transition-colors">
              {dict.legal.terms_conditions}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-brand-600 transition-colors">
              {dict.legal.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
