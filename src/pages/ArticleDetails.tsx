/**
 * Article Details Page
 * 
 * Displays article content with multilingual support.
 * Content is displayed in the user's selected language.
 * Supports multiple images (gallery) and videos.
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
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
  X,
} from "lucide-react";

const ArticleDetails = () => {
  const { id } = useParams();
  const { t, language, isRTL, getContentWithFallback } = useLanguage();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

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

  // Get all images (use images array or fallback to single image)
  const images = article.images && article.images.length > 0
    ? article.images
    : (article.image ? [article.image] : []);
  const videos = article.videos || [];

  // Gallery navigation
  const nextImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

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

      {/* Lightbox for full-screen image view */}
      {showLightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <img
            src={images[selectedImageIndex]}
            alt={`${title} - ${selectedImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

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
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="relative">
                  {/* Main Image */}
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img
                      src={images[selectedImageIndex]}
                      alt={title}
                      className="w-full h-64 md:h-[400px] object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent"></div>

                    {/* Image counter badge */}
                    {images.length > 1 && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                        <ImageIcon className="w-4 h-4" />
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} p-2 bg-white/90 hover:bg-white text-charcoal rounded-full shadow-lg transition-all hover:scale-110`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} p-2 bg-white/90 hover:bg-white text-charcoal rounded-full shadow-lg transition-all hover:scale-110`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Thumbnail strip */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.slice(0, 6).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-12 h-8 rounded-md overflow-hidden border-2 transition-all ${idx === selectedImageIndex
                            ? 'border-white shadow-lg scale-110'
                            : 'border-white/50 opacity-70 hover:opacity-100'
                            }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {images.length > 6 && (
                        <div className="w-12 h-8 rounded-md bg-black/50 text-white text-xs flex items-center justify-center border-2 border-white/50">
                          +{images.length - 6}
                        </div>
                      )}
                    </div>
                  )}
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

                {/* Videos Section */}
                {videos.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-charcoal mb-6">
                      <Play className="w-6 h-6 text-teal" />
                      {language === 'ar' ? 'الفيديوهات' : language === 'fr' ? 'Vidéos' : 'Videos'}
                    </h3>
                    <div className="grid gap-4">
                      {videos.map((video, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden bg-gray-900">
                          <video
                            src={video}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                            poster={images[0] || undefined}
                          >
                            Your browser does not support video playback.
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
