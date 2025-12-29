import { Calendar, User, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article } from "@/lib/api";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
}

const ArticleCard = ({ article, variant = "default" }: ArticleCardProps) => {
  if (variant === "featured") {
    return (
      <article className="bg-black/40 rounded-2xl overflow-hidden shadow-card card-hover group border border-white/10">
        <Link to={`/article/${article.id}`}>
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />

            {/* Featured badge */}
<<<<<<< HEAD
            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex items-center gap-1 bg-gold text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
=======
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-gold text-charcoal px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
>>>>>>> parent of 25c1865 (;))
              <Sparkles className="w-3 h-3" />
              مقال مميز
            </div>

            <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
              <span className="bg-gradient-to-r from-teal to-teal-light text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block shadow-md">
                {article.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-relaxed text-white">
                {article.title}
              </h2>
              <p className="text-white/85 mb-4 line-clamp-2 text-base leading-relaxed">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <User className="w-4 h-4 text-teal-light" />
                  <span className="text-white/90">{article.author}</span>
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-teal-light" />
                  <span className="text-white/90">{article.date}</span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="bg-black/40 rounded-xl overflow-hidden shadow-card card-hover flex gap-4 p-4 group border border-white/10">
        <Link to={`/article/${article.id}`} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden relative">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-transparent transition-colors"></div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <span className="text-teal text-xs font-bold tracking-wide">{article.category}</span>
          <Link to={`/article/${article.id}`}>
            <h3 className="font-bold text-charcoal mt-1 mb-2 line-clamp-2 leading-relaxed hover:text-teal transition-colors text-sm">
              {article.title}
            </h3>
          </Link>
          <span className="text-slate text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal/70" />
            {article.date}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-black/40 rounded-2xl overflow-hidden shadow-card card-hover group border border-white/10">
      <Link to={`/article/${article.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="absolute top-4 right-4 bg-gradient-to-r from-teal to-teal-light text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
            {article.category}
          </span>
        </div>
      </Link>
      <div className="p-6">
        <Link to={`/article/${article.id}`}>
          <h3 className="font-bold text-lg text-charcoal mb-3 line-clamp-2 leading-relaxed group-hover:text-teal transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-slate text-sm mb-4 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-slate mb-5 pb-4 border-b border-white/10">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal/70" />
            {article.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal/70" />
            {article.date}
          </span>
        </div>
        <Link
          to={`/article/${article.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-teal hover:text-charcoal transition-colors group/link"
        >
          اقرأ المزيد
          <ArrowLeft className="w-4 h-4 transition-transform group-hover/link:-translate-x-1" />
        </Link>
      </div>
    </article>
  );
};

export default ArticleCard;
