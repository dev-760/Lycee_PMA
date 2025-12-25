import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { articles } from "@/data/mockData";

const Creativity = () => {
  const creativityArticles = articles.filter((a) => a.category === "إبداعات");

  return (
    <>
      <Helmet>
        <title>إبداعات - جريدة ثانوية الأمير مولاي عبد الله</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold text-primary mb-8">إبداعات التلاميذ</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creativityArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Creativity;
