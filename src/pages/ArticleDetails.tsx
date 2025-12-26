/**
 * Article Details Page
 * 
 * Displays article content with multilingual support.
 * Content is displayed in the user's selected language.
 */

import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { Article } from "@/types";
import { useLanguage } from "@/i18n";
import {
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  Share2,
  BookOpen,
  Home,
  Loader2,
} from "lucide-react";

const ArticleDetails = () => {
  const { id } = useParams();
  const { t, language, isRTL, getContentWithFallback } = useLanguage();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const translations = {
    ar: {
      notFound: "المقال غير موجود",
      notFoundDesc: "عذراً، لم نتمكن من العثور على المقال المطلوب.",
      backHome: "العودة للرئيسية",
      backArticles: "تصفح المزيد من المقالات",
      share: "مشاركة",
      loading: "جاري التحميل...",
      siteName: "جريدة ثانوية الأمير مولاي عبد الله"
    },
    fr: {
      notFound: "Article introuvable",
      notFoundDesc: "Désolé, nous n'avons pas pu trouver l'article demandé.",
      backHome: "Retour à l'accueil",
      backArticles: "Parcourir plus d'articles",
      share: "Partager",
      loading: "Chargement...",
      siteName: "Journal du Lycée Prince Moulay Abdellah"
    },
    en: {
      notFound: "Article Not Found",
      notFoundDesc: "Sorry, we couldn't find the requested article.",
      backHome: "Back to Home",
      backArticles: "Browse More Articles",
      share: "Share",
      loading: "Loading...",
      siteName: "Prince Moulay Abdellah High School Journal"
    }
  };

  const localT = translations[language as keyof typeof translations] || translations.en;
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  // Fetch article from Supabase
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await api.articles.getById(parseInt(id));
        if (data) {
          setArticle(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-warm" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main id="main" className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal animate-spin mx-auto mb-4" />
            <p className="text-slate">{localT.loading}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------- Article not found ----------
  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-warm" dir={isRTL ? "rtl" : "ltr"}>
        <Header />

        <main id="main" className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal/10 mb-6">
              <BookOpen className="w-10 h-10 text-teal" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-4">
              {localT.notFound}
            </h1>
            <p className="text-slate mb-6">
              {localT.notFoundDesc}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal to-teal-light text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Home className="w-5 h-5" />
              {localT.backHome}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Get localized content
  const title = getContentWithFallback(article.title_translations, article.title);
  const excerpt = getContentWithFallback(article.excerpt_translations, article.excerpt);
  const content = getContentWithFallback(article.content_translations, article.content || '');

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: title,
      text: excerpt || title,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // ---------- Article view ----------
  return (
    <>
      <Helmet>
        <title>
          {title} - {localT.siteName}
        </title>
        <meta
          name="description"
          content={excerpt || title}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm" dir={isRTL ? "rtl" : "ltr"}>
        <Header />

        <main id="main" className="flex-1 py-12">
          <div className="container max-w-4xl">
            {/* Breadcrumb */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-teal hover:text-charcoal mb-8 transition-colors font-medium group"
            >
              <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              {localT.backHome}
            </Link>

            <article className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100/80">
              {/* Hero Image */}
              {article.image && (
                <div className="relative">
                  <img
                    src={article.image}
                    alt={title}
                    className="w-full h-64 md:h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent"></div>
                </div>
              )}

              <div className="p-6 md:p-10">
                {/* Category */}
                {article.category && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal to-teal-light text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                    {article.category}
                  </span>
                )}

                {/* Title - Multilingual */}
                <h1 className="text-2xl md:text-4xl font-bold text-charcoal mt-5 mb-5 leading-relaxed">
                  {title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-8 border-b border-gray-100">
                  {article.author && (
                    <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                      <User className="w-4 h-4 text-teal" />
                      <span className="text-charcoal font-medium">
                        {article.author}
                      </span>
                    </span>
                  )}

                  {article.date && (
                    <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                      <Calendar className="w-4 h-4 text-teal" />
                      <span className="text-charcoal font-medium">
                        {article.date}
                      </span>
                    </span>
                  )}

                  <button
                    onClick={handleShare}
                    className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex items-center gap-2 text-teal hover:text-charcoal transition-colors font-medium px-4 py-2 rounded-full border border-teal/30 hover:bg-teal/5`}
                  >
                    <Share2 className="w-4 h-4" />
                    {localT.share}
                  </button>
                </div>

                {/* Content - Multilingual - Render as HTML */}
                <div
                  className="article-content prose prose-lg max-w-none text-charcoal leading-[2]"
                  dangerouslySetInnerHTML={{ __html: content || excerpt || '' }}
                />

                {/* Back to articles */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 text-teal hover:text-charcoal transition-colors font-semibold"
                  >
                    <BookOpen className="w-5 h-5" />
                    {localT.backArticles}
                    <ArrowIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArticleDetails;
