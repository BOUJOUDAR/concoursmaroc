import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { ChevronDown } from "lucide-react";

interface FAQProps {
  dict: Dictionary;
}

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

export function FAQ({ dict }: FAQProps) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-10">{dict.faq.title}</h2>
        <div className="space-y-3">
          {faqKeys.map((key, i) => (
            <details
              key={key}
              className="group rounded-xl border border-border overflow-hidden"
            >
              <summary className="flex w-full items-center justify-between px-5 py-4 font-medium cursor-pointer list-none hover:bg-muted/50 transition-colors">
                <span>{dict.faq[`q${i + 1}` as keyof typeof dict.faq]}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted">
                {dict.faq[`a${i + 1}` as keyof typeof dict.faq]}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
