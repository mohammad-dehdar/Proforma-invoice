import { Heart, Github, Mail, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white border-t-2 border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-white">Etmify</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            سیستم پیش فاکتور پیشرفته برای مدیریت فروش و خدمات با قابلیت‌های کامل
                        </p>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-medium">ساخته شده با عشق در ایران</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-white">تماس با ما</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 space-x-reverse text-gray-300">
                                <Phone className="h-5 w-5 text-blue-400" />
                                <span className="font-medium">+98 21 1234 5678</span>
                            </div>
                            <div className="flex items-center space-x-3 space-x-reverse text-gray-300">
                                <Mail className="h-5 w-5 text-blue-400" />
                                <span className="font-medium">info@etmify.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-white">لینک‌های مفید</h3>
                        <div className="space-y-3">
                            <a href="#" className="block text-gray-300 hover:text-white transition-colors font-medium">
                                📖 راهنمای استفاده
                            </a>
                            <a href="#" className="block text-gray-300 hover:text-white transition-colors font-medium">
                                🛠️ پشتیبانی فنی
                            </a>
                            <a href="#" className="block text-gray-300 hover:text-white transition-colors font-medium">
                                📋 قوانین و مقررات
                            </a>
                            <a href="#" className="flex items-center space-x-2 space-x-reverse text-gray-300 hover:text-white transition-colors font-medium">
                                <Github className="h-5 w-5" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm font-medium">
                            © ۱۴۰۳ Etmify. تمامی حقوق محفوظ است.
                        </p>
                        <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                                حریم خصوصی
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                                شرایط استفاده
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
