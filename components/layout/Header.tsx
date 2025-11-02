import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-linear-to-r from-blue-700 to-blue-800 text-white shadow-xl border-b-2 border-blue-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="p-2 rounded-lg">
                                <Image
                                    src="/images/logo.png"
                                    alt="Etmify Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white drop-shadow-sm font-dana">اتمیفای</h1>
                                <p className="text-xs text-blue-100 font-medium font-dana">سیستم پیش فاکتور</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button className="text-white hover:text-blue-200 transition-colors duration-200 p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
