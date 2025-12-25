import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n";

const Contact = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('common', 'success'),
      description: t('contact', 'messageSent'),
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>{t('contact', 'title')} - {t('common', 'siteName')}</title>
        <meta name="description" content={t('contact', 'description')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />

        <main id="main" className="flex-1 py-12">
          <div className="container">
            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <MessageSquare className="w-4 h-4" />
                {t('contact', 'title')}
              </div>
              <h1 className="text-4xl font-bold text-charcoal mb-4">{t('contact', 'title')}</h1>
              <p className="text-slate max-w-2xl mx-auto">{t('contact', 'description')}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <h2 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                    <Send className="w-5 h-5 text-teal" />
                    {t('contact', 'send')}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">{t('contact', 'name')}</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">{t('contact', 'email')}</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">{t('contact', 'subject')}</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">{t('contact', 'message')}</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={6}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal to-teal-light text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-teal/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      {t('contact', 'send')}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-bold text-charcoal mb-4">{t('contact', 'title')}</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-teal" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{t('contact', 'location')}</p>
                        <p className="text-sm text-slate">{t('footer', 'address')}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-teal" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{t('contact', 'phone')}</p>
                        <p className="text-sm text-slate" dir="ltr">+212 5XX-XXXXXX</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-teal" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{t('contact', 'email')}</p>
                        <p className="text-sm text-slate">info@lycee-pma.ma</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-bold text-charcoal mb-4">{t('contact', 'followUs')}</h3>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all hover:scale-110">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all hover:scale-110">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition-all hover:scale-110">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-110">
                      <Youtube className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal to-teal-dark rounded-2xl p-6 text-white">
                  <Clock className="w-8 h-8 mb-4" />
                  <h3 className="font-bold mb-2">
                    {language === 'ar' ? 'أوقات العمل' : language === 'fr' ? 'Heures de travail' : 'Working Hours'}
                  </h3>
                  <p className="text-sm text-white/80">
                    {language === 'ar' ? 'الإثنين - الجمعة: 08:00 - 17:00' : language === 'fr' ? 'Lundi - Vendredi: 08:00 - 17:00' : 'Monday - Friday: 08:00 - 17:00'}
                  </p>
                  <p className="text-sm text-white/80">
                    {language === 'ar' ? 'السبت: 08:00 - 12:00' : language === 'fr' ? 'Samedi: 08:00 - 12:00' : 'Saturday: 08:00 - 12:00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
