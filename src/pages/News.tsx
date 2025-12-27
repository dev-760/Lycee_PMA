import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Newspaper } from "lucide-react";
import { useLanguage } from "@/i18n";
import { api } from "@/lib/api";
import type { Article } from "@/lib/api";

const News = () => {
  const { t, language } = useLanguage();
  const [allNews, setAllNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const allArticles = await api.articles.getAll();
        // Filter for all news categories
        const newsCategories = [
          'أخبار المؤسسة',
          'أخبار الإدارة',
          'Institution News',
          'Administration News',
          'Actualités de l\'institution',
          'Actualités de l\'administration'
        ];
        const newsItems = (allArticles || []).filter((item) => {
          const category = item.category || '';
          return newsCategories.includes(category);
        });
        setAllNews(newsItems);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setAllNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const pageContent = {
    ar: {
      tag: "الأخبار",
      title: "أخبار المؤسسة",
      description: "تابع آخر الأخبار والتحديثات من ثانوية الأمير مولاي عبد الله",
      empty: "لا توجد أخبار حالياً",
    },
    en: {
      tag: "News",
      title: "Institution News",
      description:
        "Follow the latest news and updates from Prince Moulay Abdellah High School",
      empty: "No news available at the moment",
    },
    fr: {
      tag: "Actualités",
      title: "Actualités de l'institution",
      description:
        "Suivez les dernières nouvelles et mises à jour du Lycée Prince Moulay Abdellah",
      empty: "Aucune actualité pour le moment",
    },
  };

  const content = pageContent[language];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>
          {t("nav", "news")} - {t("common", "siteName")}
        </title>
        <meta name="description" content={content.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />

        <main id="main" className="flex-1 py-12">
          <div className="container">
            {/* Page Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-12 bg-gradient-to-b from-teal to-teal-light rounded-full"></div>
                <div>
                  <div className="flex items-center gap-2 text-teal mb-1">
                    <Newspaper className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                      {content.tag}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-charcoal">
                    {content.title}
                  </h1>
                </div>
              </div>
              <p className="text-slate mr-6">{content.description}</p>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allNews.length > 0 ? (
                allNews.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <p className="text-slate col-span-full text-center">
                  {content.empty}
                </p>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default News;
