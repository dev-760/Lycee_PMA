import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { allArticles } from "@/data/mockData";
import { Calendar, User, ArrowRight, Share2, BookOpen, Home } from "lucide-react";

const ArticleDetails = () => {
  const { id } = useParams();
  const article = allArticles.find((a) => a.id === Number(id));

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />
        <main id="main" className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal/10 mb-6">
              <BookOpen className="w-10 h-10 text-teal" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-4">المقال غير موجود</h1>
            <p className="text-slate mb-6">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal to-teal-light text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - جريدة ثانوية الأمير مولاي عبد الله</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />

        <main id="main" className="flex-1 py-12">
          <div className="container max-w-4xl">
            {/* Breadcrumb */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-teal hover:text-charcoal mb-8 transition-colors font-medium group"
            >
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              العودة للرئيسية
            </Link>

            <article className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100/80">
              {/* Hero Image */}
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 md:h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent"></div>
              </div>

              <div className="p-6 md:p-10">
                {/* Category Badge */}
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal to-teal-light text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {article.category}
                </span>

                {/* Title */}
                <h1 className="text-2xl md:text-4xl font-bold text-charcoal mt-5 mb-5 leading-relaxed">
                  {article.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-8 border-b border-gray-100">
                  <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                    <User className="w-4 h-4 text-teal" />
                    <span className="text-charcoal font-medium">{article.author}</span>
                  </span>
                  <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4 text-teal" />
                    <span className="text-charcoal font-medium">{article.date}</span>
                  </span>
                  <button className="mr-auto flex items-center gap-2 text-teal hover:text-charcoal transition-colors font-medium px-4 py-2 rounded-full border border-teal/30 hover:bg-teal/5">
                    <Share2 className="w-4 h-4" />
                    مشاركة
                  </button>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none text-charcoal leading-[2] whitespace-pre-line">
                  {article.content || article.excerpt}
                </div>

                {/* Tags/Related section could go here */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 text-teal hover:text-charcoal transition-colors font-semibold"
                  >
                    <BookOpen className="w-5 h-5" />
                    تصفح المزيد من المقالات
                    <ArrowRight className="w-4 h-4" />
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
