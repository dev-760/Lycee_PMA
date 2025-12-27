import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BookOpen, Newspaper, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n";
import { api } from "@/lib/api";
import type { Article } from "@/lib/api";

type PageData = {
  mainArticle: Article | null;
  weeklyNews: Article | null;
  articles: Article[];
  adminNews: Article[];
};

const Index = () => {
  const { t, language } = useLanguage();

  const [data, setData] = useState<PageData>({
    mainArticle: null,
    weeklyNews: null,
    articles: [],
    adminNews: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allArticles = await api.articles.getAll();

        if (Array.isArray(allArticles) && allArticles.length > 0) {
          const main =
            allArticles.find((a: Article) => a.featured) ?? allArticles[0];

          const weekly =
            allArticles.find(
              (a: Article) =>
                a.category === "رياضة" || a.category === "Sports"
            ) ?? null;

          const regularArticles = allArticles.filter(
            (a: Article) =>
              a.category === "مقالات" || a.category === "Articles"
          );

          const news = allArticles.filter(
            (a: Article) =>
              a.category === "أخبار الإدارة" ||
              a.category === "Administration News"
          );

          setData({
            mainArticle: main,
            weeklyNews: weekly,
            articles: regularArticles,
            adminNews: news,
          });
        } else {
          // Empty database – safe fallback
          setData({
            mainArticle: null,
            weeklyNews: null,
            articles: [],
            adminNews: [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setData({
          mainArticle: null,
          weeklyNews: null,
          articles: [],
          adminNews: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const sections = {
    ar: {
      weeklyNews: {
        title: "خبر الأسبوع",
        desc: "أهم الأخبار المختارة لهذا الأسبوع",
      },
      articles: {
        title: "مقالات",
        desc: "مقالات وآراء متنوعة",
      },
      latestNews: {
        title: "آخر الأخبار",
        desc: "تحديثات يومية من المؤسسة",
      },
    },
    en: {
      weeklyNews: {
        title: "News of the Week",
        desc: "Top selected news for this week",
      },
      articles: {
        title: "Articles",
        desc: "Various articles and opinions",
      },
      latestNews: {
        title: "Latest News",
        desc: "Daily updates from the institution",
      },
    },
    fr: {
      weeklyNews: {
        title: "Actualité de la semaine",
        desc: "Les actualités les plus importantes de la semaine",
      },
      articles: {
        title: "Articles",
        desc: "Articles et opinions diverses",
      },
      latestNews: {
        title: "Dernières actualités",
        desc: "Mises à jour quotidiennes de l'institution",
      },
    },
  };

  const s = sections[language];

  return (
    <>
      <Helmet>
        <title>
          {t("common", "siteName")} - {t("nav", "home")}
        </title>
        <meta
          name="description"
          content={t("common", "siteDescription")}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />

        <main id="main" className="flex-1 py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <Sidebar position="left" />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-12">
                {/* Featured Article */}
                <section className="animate-fade-in">
                  {data.mainArticle && (
                    <ArticleCard
                      article={data.mainArticle}
                      variant="featured"
                    />
                  )}
                </section>

                {/* Weekly News */}
                {data.weeklyNews && (
                  <section className="animate-slide-up">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-10 bg-gradient-to-b from-teal to-teal-light rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-teal" />
                          <h2 className="text-2xl font-bold text-charcoal">
                            {s.weeklyNews.title}
                          </h2>
                        </div>
                        <p className="text-slate text-sm mt-1">
                          {s.weeklyNews.desc}
                        </p>
                      </div>
                    </div>
                    <ArticleCard article={data.weeklyNews} />
                  </section>
                )}

                {/* Articles */}
                {data.articles.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-10 bg-gradient-to-b from-gold to-gold-light rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-gold" />
                          <h2 className="text-2xl font-bold text-charcoal">
                            {s.articles.title}
                          </h2>
                        </div>
                        <p className="text-slate text-sm mt-1">
                          {s.articles.desc}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {data.articles.slice(0, 2).map((article: Article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Latest News */}
                {data.adminNews.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-10 bg-gradient-to-b from-teal to-teal-light rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Newspaper className="w-5 h-5 text-teal" />
                          <h2 className="text-2xl font-bold text-charcoal">
                            {s.latestNews.title}
                          </h2>
                        </div>
                        <p className="text-slate text-sm mt-1">
                          {s.latestNews.desc}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {data.adminNews.map((article: Article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-3 order-3">
                <Sidebar position="right" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
