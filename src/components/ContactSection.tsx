import React, { useState } from 'react';
import { TRANSLATIONS } from '../data/portfolioData';
import { validateContactForm, type ContactFormData } from '../utils/portfolioLogic';

interface ContactSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onOpenCvModal: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  currentLang,
  onOpenCvModal,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateContactForm(formData);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 8000);
    }, 600);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('zaki200615@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  return (
    <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden" id="contact">
      <div className="mb-8 sm:mb-12 pb-4 sm:pb-6 border-b-2 border-black/80">
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
          <span>GET IN TOUCH</span>
          <span>·</span>
          <span>COLLABORATION</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tighter text-black uppercase break-words">
          {t.letsCreate}
        </h2>
        <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
          {t.contactDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-black p-6 shadow-[5px_5px_0px_#000]">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mb-4">
              {t.connectWithMe}
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 border border-black/10">
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 uppercase block">Email</span>
                  <a
                    href="mailto:zaki200615@gmail.com"
                    className="font-mono text-xs sm:text-sm font-bold text-black hover:text-red-600 transition-colors"
                  >
                    zaki200615@gmail.com
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 text-[11px] font-mono bg-black text-white hover:bg-neutral-800 transition-colors"
                  aria-label="Copy email address"
                >
                  {copiedEmail ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/_d_zekoo"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-neutral-50 border border-black/10 hover:border-black transition-colors group"
              >
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 uppercase block">Instagram</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-black group-hover:text-red-600 transition-colors">
                    @_d_zekoo
                  </span>
                </div>
                <span className="text-neutral-400 group-hover:text-black font-mono text-xs">↗</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/zakaria-boubkeraoui-2a55a13a9"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-neutral-50 border border-black/10 hover:border-black transition-colors group"
              >
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 uppercase block">LinkedIn</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-black group-hover:text-red-600 transition-colors">
                    /in/zakaria-boubkeraoui
                  </span>
                </div>
                <span className="text-neutral-400 group-hover:text-black font-mono text-xs">↗</span>
              </a>
            </div>

            {/* Download CV CTA */}
            <div className="mt-6 pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={onOpenCvModal}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_#dc2626] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>{t.downloadCv}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-5"
            noValidate
          >
            {isSubmitted && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-mono text-xs font-bold flex items-center gap-2">
                <span>✓</span>
                <span>{t.messageSentSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-mono font-bold uppercase text-black mb-1">
                  {t.name}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                    errors.name ? 'border-red-600 bg-red-50/30' : 'border-black/30'
                  } text-xs font-mono focus:outline-none focus:border-black transition-colors`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 font-mono mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-mono font-bold uppercase text-black mb-1">
                  {t.email}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                    errors.email ? 'border-red-600 bg-red-50/30' : 'border-black/30'
                  } text-xs font-mono focus:outline-none focus:border-black transition-colors`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-mono mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-mono font-bold uppercase text-black mb-1">
                {t.subject}
              </label>
              <input
                id="contact-subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Video Editing for YouTube Series"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/30 text-xs font-mono focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-mono font-bold uppercase text-black mb-1">
                {t.message}
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell me about your project, goals, and timeline..."
                className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${
                  errors.message ? 'border-red-600 bg-red-50/30' : 'border-black/30'
                } text-xs font-mono focus:outline-none focus:border-black transition-colors`}
              ></textarea>
              {errors.message && (
                <p className="text-[11px] text-red-600 font-mono mt-1">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-neutral-400 text-white font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Sending...' : t.sendMessage}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
