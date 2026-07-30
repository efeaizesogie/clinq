'use client';

import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import { 
  Search, BookOpen, FileText, LayoutGrid, CheckCircle2, 
  Baby, ShieldCheck, ClipboardCheck, Heading2 
} from 'lucide-react';
import Link from 'next/link';

// Icon mapping helper for resources
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  ShieldCheck,
  ClipboardCheck,
};

function getResourceIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || FileText;
}

export default function ResourcesPage() {
  const { data, isLoading, error } = usePlatformData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const blogs = data?.blogPosts ?? [];
  const resources = data?.resources ?? [];

  // Combine both blog posts and health resources for a unified library experience
  const articlesList = blogs.map(b => ({
    id: b.id,
    title: b.title,
    description: b.description,
    category: b.category, // e.g. Guide, News, Tips
    slug: b.slug,
    image_url: b.image_url,
    type: 'blog',
    published_at: b.published_at,
    icon_name: 'FileText'
  }));

  const resourcesList = resources.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category, // e.g. Guides, Tools
    slug: r.slug,
    image_url: r.image_url,
    type: 'resource',
    published_at: r.created_at,
    icon_name: r.icon_name
  }));

  const allItems = [...articlesList, ...resourcesList];

  // List unique categories for filter pills
  const categories = ['All', ...Array.from(new Set(allItems.map(item => item.category)))];

  const filteredItems = allItems.filter(item => {
    const matchesFilter = selectedFilter === 'All' || item.category === selectedFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col items-center w-full bg-[#F8F9FF] dark:bg-[#0D1C2E] relative min-h-screen font-sans antialiased text-[#42474F] dark:text-[#A7ABB5] transition-colors duration-300">
      
      {/* Navigation Menu */}
      <PublicNavbar />

      {/* Main Container */}
      <main className="w-full flex flex-col justify-start items-center relative pt-[81px]">
        
        {/* =============== HERO SECTION =============== */}
        <section className="w-full bg-[#EFF4FF] dark:bg-[#122338] py-16 md:py-24 px-6 md:px-16 border-b border-[#C2C7D1]/10 dark:border-[#22354A]/30 flex justify-center transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col items-center justify-center gap-6 text-center">
            
            <h1 className="text-3xl sm:text-4xl md:text-[54px] md:leading-[62px] font-[800] text-brand-blue dark:text-white tracking-[-1.2px]">
              Wellness & Health Knowledge
            </h1>
            <p className="max-w-[700px] text-sm sm:text-base md:text-[18px] md:leading-[30px] font-[450] text-[#516161] dark:text-[#A7ABB5]">
              Empowering you with dynamic health guides, specialist advice, wellness calculators, and the latest updates directly from our qualified medical team.
            </p>
          </div>
        </section>

        {/* =============== MAIN PORTAL GRID SECTION =============== */}
        <section className="w-full py-16 px-6 md:px-16 flex justify-center bg-[#F8F9FF] dark:bg-[#0D1C2E] min-h-[600px] transition-colors duration-300">
          <div className="w-full max-w-[1152px] flex flex-col gap-10">
            
            {/* Search and Filters Strip */}
            <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
              
              {/* Search Bar */}
              <div className="w-full md:w-[400px] h-[52px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#727780] dark:text-[#A7ABB5]" />
                <input 
                  type="text" 
                  placeholder="Search articles, guides, HMO matrix..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-white dark:bg-[#122338] border border-[#C2C7D1]/60 dark:border-[#22354A]/30 rounded-xl text-[16px] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-[#5F9EA0]/20 shadow-xs placeholder-[#9CA3AF] transition"
                />
              </div>

              {/* Category Filters (Responsive Scroll) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-4 py-2.5 rounded-full text-xs font-[700] uppercase tracking-wider whitespace-nowrap cursor-pointer transition select-none ${
                      selectedFilter === cat
                        ? "bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] shadow-sm"
                        : "bg-white dark:bg-[#122338] text-[#516161] dark:text-[#A7ABB5] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 hover:bg-[#EFF4FF] dark:hover:bg-[#1E2D4A] hover:text-brand-blue dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Error view */}
            {error && (
              <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-red-600 dark:text-red-400 font-[500] text-sm">
                Error loading resources from database: {error}. Proceeding with placeholders if database columns are missing.
              </div>
            )}

            {/* Dynamic Card Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="w-full h-[400px] bg-white dark:bg-[#122338] border border-[#C2C7D1]/20 dark:border-[#22354A]/30 rounded-xl p-6 flex flex-col gap-4 animate-pulse">
                    <div className="w-full h-[180px] bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {filteredItems.map((item) => {
                  const IconComponent = getResourceIcon(item.icon_name);
                  return (
                    <article 
                      key={item.id}
                      className="bg-white dark:bg-[#122338] border border-[#C2C7D1]/40 dark:border-[#22354A]/30 rounded-xl overflow-hidden flex flex-col gap-4 shadow-xs hover:shadow-md transition duration-300 relative group"
                    >
                      {/* Image Thumbnail or Icon Fallback */}
                      <div className="w-full h-[200px] bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 relative overflow-hidden flex items-center justify-center shrink-0 border-b border-[#C2C7D1]/15 dark:border-[#22354A]/10">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-brand-blue/10 dark:bg-[#5F9EA0]/10 flex items-center justify-center text-brand-blue dark:text-[#5F9EA0]">
                            <IconComponent className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-brand-blue dark:bg-[#5F9EA0] text-white dark:text-[#0D1C2E] text-[10px] font-[800] tracking-[1.2px] uppercase px-3 py-1.5 rounded-full shadow-xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-6 sm:p-8 flex flex-col flex-1 gap-3">
                        <span className="text-xs text-[#727780] dark:text-[#A7ABB5]">
                          {new Date(item.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        
                        <h3 className="text-xl sm:text-[22px] font-[750] leading-7 text-brand-blue dark:text-white tracking-[-0.32px] group-hover:text-brand-blue/90 transition">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm sm:text-base leading-6 text-[#516161] dark:text-[#A7ABB5]">
                          {item.description}
                        </p>

                        <div className="pt-4 mt-auto border-t border-[#C2C7D1]/15 dark:border-[#22354A]/30 flex justify-between items-center w-full">
                          <Link 
                            href={`/resources/${item.id}`}
                            className="text-sm font-[750] text-[#0F4C81] dark:text-[#5F9EA0] hover:underline flex items-center gap-1.5"
                          >
                            Read Full Details
                          </Link>
                          {item.type === 'resource' && (
                            <span className="text-[10px] font-[700] uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded">
                              Health Tool
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center bg-white dark:bg-[#122338] border border-dashed border-[#C2C7D1]/30 dark:border-[#22354A]/30 rounded-xl flex flex-col items-center justify-center gap-3">
                <LayoutGrid className="w-12 h-12 text-[#9CA3AF]" />
                <h3 className="text-lg font-[750] text-[#00355F] dark:text-white">No items found</h3>
                <p className="text-xs sm:text-sm text-[#727780] dark:text-[#A7ABB5] max-w-sm px-4">
                  We couldn't find any resources or articles matching "{searchQuery}" under this category.
                </p>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}
