
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

// Props definition
interface MultilingualFormProps {
    formData: any;
    setFormData: (data: any) => void;
    renderSharedFields: () => React.ReactNode;
}

const MultilingualForm = ({ formData, setFormData, renderSharedFields }: MultilingualFormProps) => {
    const [activeTab, setActiveTab] = useState("ar");
    const [isTranslating, setIsTranslating] = useState(false);
    const { toast } = useToast();

    const handleAutoTranslate = async (targetLang: 'en' | 'fr') => {
        const sourceTitle = formData.title;
        const sourceExcerpt = formData.excerpt;
        const sourceContent = formData.content;

        if (!sourceTitle) {
            toast({ title: "العنوان مطلوب", description: "يرجى كتابة العنوان بالعربية أولاً", variant: "destructive" });
            return;
        }

        setIsTranslating(true);
        try {
            // Call our Edge Function
            const { data, error } = await supabase.functions.invoke('translate-text', {
                body: { text: sourceTitle, from: 'ar', to: targetLang }
            });

            if (data?.translatedText) {
                setFormData((prev: any) => ({
                    ...prev,
                    [`title_${targetLang}`]: data.translatedText
                }));
            }

            // Excerpt
            if (sourceExcerpt) {
                const { data: d2 } = await supabase.functions.invoke('translate-text', {
                    body: { text: sourceExcerpt, from: 'ar', to: targetLang }
                });
                if (d2?.translatedText) {
                    setFormData((prev: any) => ({ ...prev, [`excerpt_${targetLang}`]: d2.translatedText }));
                }
            }

            // Content
            if (sourceContent) {
                const { data: d3 } = await supabase.functions.invoke('translate-text', {
                    body: { text: sourceContent, from: 'ar', to: targetLang }
                });
                if (d3?.translatedText) {
                    setFormData((prev: any) => ({ ...prev, [`content_${targetLang}`]: d3.translatedText }));
                }
            }

            toast({ title: "تمت الترجمة بنجاح", description: `تم ترجمة الحقول إلى ${targetLang === 'fr' ? 'الفرنسية' : 'الإنجليزية'}` });

        } catch (e) {
            console.error(e);
            toast({ title: "خطأ", description: "فشل الاتصال بخدمة الترجمة", variant: "destructive" });
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* 1. Shared Fields (Category, Author, Image, etc.) */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                {renderSharedFields()}
            </div>

            {/* 2. Multilingual Tabs */}
            <Tabs dir={activeTab === 'ar' ? 'rtl' : 'ltr'} value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="ar">العربية (الأصل)</TabsTrigger>
                        <TabsTrigger value="fr">Français</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>

                    {/* Auto-Translate Button used when ON non-arabic tabs */}
                    {activeTab !== 'ar' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoTranslate(activeTab as 'en' | 'fr')}
                            disabled={isTranslating}
                            className="gap-2"
                        >
                            <Languages className="w-4 h-4" />
                            {isTranslating ? 'يترجم...' : 'ترجمة من العربية'}
                        </Button>
                    )}
                </div>

                {/* ARABIC CONTENT */}
                <TabsContent value="ar" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">العنوان *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal/20 outline-none"
                            placeholder="عنوان المقال بالعربية"
                            dir="rtl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">ملخص *</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal/20 outline-none"
                            rows={2}
                            dir="rtl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">المحتوى *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal/20 outline-none"
                            rows={8}
                            dir="rtl"
                        />
                    </div>
                </TabsContent>

                {/* FRENCH CONTENT */}
                <TabsContent value="fr" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Titre (Français)</label>
                        <input
                            type="text"
                            value={formData.title_fr || ''}
                            onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 focus:border-teal/50 outline-none bg-gray-50/50"
                            placeholder="Titre en français"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Résumé</label>
                        <textarea
                            value={formData.excerpt_fr || ''}
                            onChange={(e) => setFormData({ ...formData, excerpt_fr: e.target.value })}
                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 outline-none bg-gray-50/50"
                            rows={2}
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Contenu</label>
                        <textarea
                            value={formData.content_fr || ''}
                            onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 outline-none bg-gray-50/50"
                            rows={8}
                            dir="ltr"
                        />
                    </div>
                </TabsContent>

                {/* ENGLISH CONTENT */}
                <TabsContent value="en" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Title (English)</label>
                        <input
                            type="text"
                            value={formData.title_en || ''}
                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 focus:border-teal/50 outline-none bg-gray-50/50"
                            placeholder="Title in English"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Summary</label>
                        <textarea
                            value={formData.excerpt_en || ''}
                            onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 outline-none bg-gray-50/50"
                            rows={2}
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Content</label>
                        <textarea
                            value={formData.content_en || ''}
                            onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 outline-none bg-gray-50/50"
                            rows={8}
                            dir="ltr"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MultilingualForm;
