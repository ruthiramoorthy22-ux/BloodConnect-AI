import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      q: 'Who is eligible to donate blood?',
      a: 'Generally, healthy adults between 18 and 65 years old weighing at least 50 kg (110 lbs) can donate whole blood. Donors must have rested at least 90 days since their last whole blood donation. You can check your preliminary status using our integrated AI Eligibility Screening tool.',
    },
    {
      q: 'Is my exact location exposed to the public?',
      a: 'Never. BloodConnect AI enforces strict privacy standards. Exact donor residential addresses and precise GPS coordinates are never made public. Only approximate neighborhood/city names and approximate radius distance are utilized for matching.',
    },
    {
      q: 'How does Gemini AI Donor Matching work?',
      a: 'When a request is submitted, the system queries compatible donors, calculates geographic proximity, checks safe cooldown intervals, and provides decision-support rankings with an explanation to the hospital transfusion desk. Note: All AI outputs are decision aids and do not replace professional laboratory blood screening.',
    },
    {
      q: 'How do hospitals update their blood stock?',
      a: 'Authorized hospitals log in to the Hospital Portal where they can update units, reserve units for incoming surgeries, set critical replenishment levels, and review urgent patient requests in real time.',
    },
    {
      q: 'What is the difference between Normal, Urgent, and Critical requests?',
      a: 'Normal requests are for scheduled surgeries and ongoing treatments (24-48 hr lead time). Urgent requests are needed within 6-12 hours. Critical requests trigger Level 1 emergency broadcasts across all hospital blood banks and nearby donors immediately.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">
            Common Questions
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Learn more about blood donation protocols, emergency matching, and system security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-rose-600 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-rose-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
