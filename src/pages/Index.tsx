import { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { mainArticle as mockMainArticle, weeklyNews as mockWeeklyNews, articles as mockArticles, adminNews as mockAdminNews } from "@/data/mockData";
import { BookOpen, Newspaper, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n";
import { api } from "@/lib/api";

const Index = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<{
    mainArticle: any;
    weeklyNews: any;
    articles: any[];
    adminNews: any[];
  }>({
    mainArticle: null,
    weeklyNews: null,
    articles: [],
    adminNews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch articles
        const allArticles = await api.articles.getAll();

        if (allArticles && allArticles.length > 0) {
          // Classify articles
          const main = allArticles.find((a: any) => a.featured) || allArticles[0];
          const weekly = allArticles.find((a: any) => a.category === 'رياضة' || a.category === 'Sports') || allArticles[1]; // simplified logic

          // Filter for regular articles (excluding main and weekly if possible, or just slice)
          const regularArticles = allArticles.filter((a: any) => a.category === 'مقالات' || a.category === 'Articles');
          const news = allArticles.filter((a: any) => a.category === 'أخبار الإدارة' || a.category === 'Administration News');

          setData({
            mainArticle: main,
            weeklyNews: weekly,
            articles: regularArticles,
            adminNews: news
          });
        } else {
          // Fallback to mock data if DB is empty so the site doesn't look broken during demo
          setData({
            mainArticle: mockMainArticle,
            weeklyNews: mockWeeklyNews,
            articles: mockArticles,
            adminNews: mockAdminNews
          });
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
        // Fallback
        setData({
          mainArticle: mockMainArticle,
          weeklyNews: mockWeeklyNews,
          articles: mockArticles,
          adminNews: mockAdminNews
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use a helper to translation fields based on language
  // Since we modified Article interface to have title_en, etc. we need a helper or just access directly or use the one in hooks
  // Ideally, ArticleCard handles this? 
  // Let's check ArticleCard. But for now, let's pass data.

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal">Loading...</div>;

  // Section titles and descriptions based on language
  const sections = {
    ar: {
      weeklyNews: { title: 'خبر الأسبوع', desc: 'أهم الأخبار المختارة لهذا الأسبوع' },
      articles: { title: 'مقالات', desc: 'مقالات وآراء متنوعة' },
      latestNews: { title: 'آخر الأخبار', desc: 'تحديثات يومية من المؤسسة' },
    },
    en: {
      weeklyNews: { title: 'News of the Week', desc: 'Top selected news for this week' },
      articles: { title: 'Articles', desc: 'Various articles and opinions' },
      latestNews: { title: 'Latest News', desc: 'Daily updates from the institution' },
    },
    fr: {
      weeklyNews: { title: 'Actualité de la semaine', desc: 'Les actualités les plus importantes de la semaine' },
      articles: { title: 'Articles', desc: 'Articles et opinions diverses' },
      latestNews: { title: 'Dernières actualités', desc: 'Mises à jour quotidiennes de l\'institution' },
    },
  };

  const s = sections[language];

  return (
    <>
      <Helmet>
        <title>{t('common', 'siteName')} - {t('nav', 'home')}</title>
        <meta
          name="description"
          content={t('common', 'siteDescription')}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />

        <main id="main" className="flex-1 py-12">
          <div className="container">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <Sidebar position="left" />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-12">
                {/* Featured Article */}
                <section className="animate-fade-in">
                  {data.mainArticle && <ArticleCard article={data.mainArticle} variant="featured" />}
                </section>

                {/* Weekly News */}
                <section className="animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-10 bg-gradient-to-b from-teal to-teal-light rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal" />
                        <h2 className="text-2xl font-bold text-charcoal">{s.weeklyNews.title}</h2>
                      </div>
                      <p className="text-slate text-sm mt-1">{s.weeklyNews.desc}</p>
                    </div>
                    <div className="hidden sm:block h-px flex-1 bg-gradient-to-l from-teal/30 to-transparent"></div>
                  </div>
                  {data.weeklyNews && <ArticleCard article={data.weeklyNews} />}
                </section>

                {/* Articles */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-10 bg-gradient-to-b from-gold to-gold-light rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-gold" />
                        <h2 className="text-2xl font-bold text-charcoal">{s.articles.title}</h2>
                      </div>
                      <p className="text-slate text-sm mt-1">{s.articles.desc}</p>
                    </div>
                    <div className="hidden sm:block h-px flex-1 bg-gradient-to-l from-gold/30 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data.articles.slice(0, 2).map((article: any) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>

                {/* Latest News */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-10 bg-gradient-to-b from-teal to-teal-light rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-teal" />
                        <h2 className="text-2xl font-bold text-charcoal">{s.latestNews.title}</h2>
                      </div>
                      <p className="text-slate text-sm mt-1">{s.latestNews.desc}</p>
                    </div>
                    <div className="hidden sm:block h-px flex-1 bg-gradient-to-l from-teal/30 to-transparent"></div>
                  </div>
                  <div className="space-y-4">
                    {data.adminNews.map((article: any) => (
                      <ArticleCard key={article.id} article={article} variant="compact" />
                    ))}
                  </div>
                </section>
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
