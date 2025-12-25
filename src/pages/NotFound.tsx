import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm p-4">
      <div className="text-center max-w-md">
        {/* 404 with decorative elements */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-teal/10 rounded-full blur-3xl scale-150"></div>
          <div className="relative">
            <span className="text-[120px] md:text-[160px] font-bold text-gradient leading-none">404</span>
          </div>
        </div>

        {/* Error icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-3">
          عذراً، الصفحة غير موجودة
        </h1>
        <p className="text-slate mb-8 leading-relaxed">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التحقق من الرابط أو العودة للصفحة الرئيسية.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal to-teal-light text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
