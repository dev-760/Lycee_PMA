/**
 * Example: Displaying Multilingual Content
 * 
 * This component demonstrates how to display database content
 * in the user's selected language using the useLanguage() hook.
 * 
 * Key points:
 * - Use getContent() for pure multilingual fields
 * - Use getContentWithFallback() during migration (has legacy + new fields)
 * - No translation API calls happen here - content is pre-translated
 */

import { useLanguage } from '@/i18n';
import { Announcement, Article } from '@/types';

interface AnnouncementDisplayProps {
    announcement: Announcement;
}

/**
 * Example: Display a single announcement
 */
export const AnnouncementCard = ({ announcement }: AnnouncementDisplayProps) => {
    const { getContent, getContentWithFallback } = useLanguage();

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            {/* Title - uses getContentWithFallback for backward compatibility */}
            <h2 className="text-xl font-bold text-charcoal mb-2">
                {getContentWithFallback(announcement.title_translations, announcement.title)}
            </h2>

            {/* Description - optional field */}
            {(announcement.description_translations || announcement.description) && (
                <p className="text-slate">
                    {getContentWithFallback(
                        announcement.description_translations,
                        announcement.description || ''
                    )}
                </p>
            )}

            {/* Date doesn't need translation */}
            <p className="text-xs text-gray-400 mt-4">{announcement.date}</p>
        </div>
    );
};

interface ArticleDisplayProps {
    article: Article;
}

/**
 * Example: Display an article
 */
export const ArticleCard = ({ article }: ArticleDisplayProps) => {
    const { getContent, getContentWithFallback, language } = useLanguage();

    return (
        <article className="bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Image doesn't need translation */}
            {article.image && (
                <img
                    src={article.image}
                    alt={getContentWithFallback(article.title_translations, article.title)}
                    className="w-full h-48 object-cover"
                />
            )}

            <div className="p-6">
                {/* Title */}
                <h2 className="text-xl font-bold text-charcoal mb-2">
                    {getContentWithFallback(article.title_translations, article.title)}
                </h2>

                {/* Excerpt */}
                <p className="text-slate mb-4">
                    {getContentWithFallback(article.excerpt_translations, article.excerpt)}
                </p>

                {/* Content (for full article page) */}
                {article.content_translations && (
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: getContentWithFallback(
                                article.content_translations,
                                article.content || ''
                            ),
                        }}
                    />
                )}

                {/* Meta info - doesn't need translation */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                </div>
            </div>
        </article>
    );
};

/**
 * Example: Using getContent() directly without fallback
 * 
 * Use this pattern when you're confident the data has translations
 * and you don't need legacy field fallback.
 */
export const SimpleContentDisplay = ({ translations }: { translations: { ar: string; en: string; fr: string } }) => {
    const { getContent } = useLanguage();

    return (
        <p>{getContent(translations)}</p>
    );
};

/**
 * Example: Full page with multiple content types
 */
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export const MultilingualHomePage = () => {
    const { language, t, getContentWithFallback } = useLanguage();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        // Fetch data once - no translation calls needed
        const loadData = async () => {
            const [announcementsData, articlesData] = await Promise.all([
                api.announcements.getAll(),
                api.articles.getAll(),
            ]);
            setAnnouncements(announcementsData);
            setArticles(articlesData.slice(0, 3)); // Latest 3
        };

        loadData();
    }, []);

    return (
        <div className="container mx-auto py-8">
            {/* Static UI translation using t() */}
            <h1 className="text-3xl font-bold mb-8">
                {t('common', 'welcome')}
            </h1>

            {/* Announcements Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">
                    {t('announcements', 'title')}
                </h2>
                <div className="grid gap-4">
                    {announcements.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))}
                </div>
            </section>

            {/* Articles Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">
                    {t('articles', 'title')}
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MultilingualHomePage;
