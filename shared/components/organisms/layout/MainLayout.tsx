"use client";

import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
