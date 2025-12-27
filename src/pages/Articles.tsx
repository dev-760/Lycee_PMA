import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/i18n";
import { api } from "@/lib/api";
import type { Article } from "@/lib/api";

const Articles = () => {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const allArticles = await api.articles.getAll();
        // Filter out news categories to show only articles
        const articlesOnly = (allArticles || []).filter((item) => {
          const category = item.category || '';
          // Include article categories and exclude news categories
          return (
            category === "مقالات" ||
            category === "Articles" ||
            (!category.includes("أخبار") &&
              !category.includes("News") &&
              !category.includes("Actualités"))
          );
        });
        setArticles(articlesOnly);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const pageContent = {
    ar: {
      tag: "المقالات",
      title: "مقالات وآراء متنوعة",
      description: "اكتشف مجموعة متنوعة من المقالات المكتوبة من طرف طلاب المؤسسة",
      empty: "لا توجد مقالات منشورة حالياً",
    },
    en: {
      tag: "Articles",
      title: "Various Articles and Opinions",
      description:
        "Discover a variety of articles written by students of the institution",
      empty: "No articles available at the moment",
    },
    fr: {
      tag: "Articles",
      title: "Articles et opinions diverses",
      description:
        "Découvrez une variété d'articles écrits par les élèves de l'institution",
      empty: "Aucun article disponible pour le moment",
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
          {t("nav", "articles")} - {t("common", "siteName")}
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
                <div className="w-1.5 h-12 bg-gradient-to-b from-gold to-gold-light rounded-full"></div>
                <div>
                  <div className="flex items-center gap-2 text-gold mb-1">
                    <BookOpen className="w-5 h-5" />
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

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <p className="text-center text-slate col-span-full">
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

export default Articles;
