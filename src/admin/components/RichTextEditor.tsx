import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Redo,
    Undo,
    Link as LinkIcon,
    Image as ImageIcon,
    Heading1,
    Heading2,
    Heading3,
    Minus,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/i18n';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
    const { isRTL, language } = useLanguage();
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-teal underline hover:text-teal-dark',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || (language === 'ar' ? 'اكتب المحتوى هنا...' : language === 'fr' ? 'Écrivez le contenu ici...' : 'Write content here...'),
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4 ${isRTL ? 'text-right' : 'text-left'}`,
                dir: isRTL ? 'rtl' : 'ltr',
            },
        },
    });

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const setLink = useCallback(() => {
        if (linkUrl) {
            editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }
        setLinkUrl('');
        setShowLinkInput(false);
    }, [editor, linkUrl]);

    const addImage = useCallback(() => {
        if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl }).run();
        }
        setImageUrl('');
        setShowImageInput(false);
    }, [editor, imageUrl]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-colors ${active ? 'bg-teal text-white' : 'hover:bg-gray-100 text-slate'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                {/* Undo/Redo */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Blockquote and divider */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Divider"
                >
                    <Minus className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Link */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => setShowLinkInput(!showLinkInput)}
                        active={editor.isActive('link')}
                        title="Add Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>
                    {showLinkInput && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-white shadow-lg rounded-lg border z-50 flex gap-2">
                            <input
                                type="url"
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="px-3 py-1 border rounded text-sm w-48"
                                onKeyDown={(e) => e.key === 'Enter' && setLink()}
                            />
                            <button
                                type="button"
                                onClick={setLink}
                                className="px-3 py-1 bg-teal text-white rounded text-sm"
                            >
                                OK
                            </button>
                        </div>
                    )}
                </div>

                {/* Image */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => setShowImageInput(!showImageInput)}
                        title="Add Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </ToolbarButton>
                    {showImageInput && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-white shadow-lg rounded-lg border z-50 flex gap-2">
                            <input
                                type="url"
                                placeholder="Image URL..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="px-3 py-1 border rounded text-sm w-48"
                                onKeyDown={(e) => e.key === 'Enter' && addImage()}
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                className="px-3 py-1 bg-teal text-white rounded text-sm"
                            >
                                OK
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
