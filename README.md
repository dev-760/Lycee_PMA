# 📰 Lycée PMA - School Newspaper Website

A modern, multilingual school newspaper website for Lycée Prince Moulay Abdellah with an admin dashboard for content management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)

## ✨ Features

### 🌍 Multilingual Support
- **3 Languages**: Arabic (RTL), English, French
- **Auto-Translation**: Content automatically translates to all languages
- Uses Google Translate via Supabase Edge Functions

### 📱 Modern UI/UX
- **Responsive Design**: Desktop, tablet, and mobile
- **Premium Animations**: Smooth transitions and micro-interactions
- **RTL Support**: Full right-to-left support for Arabic
- **Light Theme**: Clean, professional academic design

### 📝 Content Management
- **Articles**: Create and manage articles with rich text editor
- **News**: Institution and administration news
- **Announcements**: School announcements with urgent/important flags
- **Absent Teachers**: Track and display teacher absences

### 🔐 Admin Dashboard
- **Role-Based Access**: Super Admin, Editor, Administrator
- **Secure Login**: JWT authentication via Supabase
- **User Management**: Create, edit, and manage admin users
- **Settings Panel**: Site configuration and preferences

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Translation | Google Translate API via Edge Functions |
| State | React Context, TanStack Query |
| Routing | React Router v6 |

## 📦 Project Structure

```
lycee_pma/
├── src/
│   ├── admin/           # Admin dashboard
│   │   ├── components/  # Admin-specific components
│   │   ├── context/     # Admin context & auth
│   │   └── pages/       # Admin pages
│   ├── components/      # Shared components
│   ├── context/         # App contexts (Theme, Auth)
│   ├── hooks/           # Custom React hooks
│   ├── i18n/            # Internationalization
│   ├── lib/             # API, Supabase, utilities
│   ├── pages/           # Public pages
│   └── types/           # TypeScript types
├── supabase/
│   ├── functions/       # Edge Functions
│   │   ├── translate-text/
│   │   └── secure-login/
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/lycee_pma.git
cd lycee_pma
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_REF=your-project-ref
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

## ⚙️ Supabase Setup

### Database Tables
- `articles` - Articles and news
- `announcements` - School announcements
- `absent_teachers` - Teacher absence tracking
- `users` - Admin users
- `cultural_facts` - Cultural facts sidebar

### Edge Functions
Deploy these functions to your Supabase project:

```bash
supabase functions deploy translate-text
supabase functions deploy secure-login
```

Or deploy via the Supabase Dashboard Editor.

## 🎨 Theme

The website uses a premium academic color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Royal Blue | `#0F2A44` | Primary, headers |
| Gold | `#C6A24A` | Accent, highlights |
| Ivory | `#F4F1EC` | Background |
| Charcoal | `#2B2B2B` | Text |

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| Super Admin | Full access + User management |
| Editor | Manage articles & news |
| Administrator | Manage announcements only |

## 📄 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

## 📝 License

MIT License - feel free to use for your school projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Made with ❤️ for Lycée Prince Moulay Abdellah**
