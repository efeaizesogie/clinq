'use client';

import React, { use } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { usePlatformData } from '@/lib/hooks/usePlatformData';
import { ArrowLeft, Calendar, User, BookOpen, Clock, HeartPulse } from 'lucide-react';
import Link from 'next/link';

// A simple utility to render basic markdown-style text safely without external dependencies
function renderSimpleMarkdown(content: string) {
  if (!content) return null;

  return content.split('\n\n').map((block, idx) => {
    block = block.trim();
    if (!block) return null;

    // Header 3
    if (block.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-xl sm:text-2xl font-[755] text-brand-blue dark:text-white mt-8 mb-4 tracking-[-0.32px] text-left">
          {block.replace('### ', '')}
        </h3>
      );
    }
    // Header 4
    if (block.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-lg sm:text-xl font-[700] text-[#0F4C81] dark:text-[#5F9EA0] mt-6 mb-3 text-left">
          {block.replace('#### ', '')}
        </h4>
      );
    }
    // List items
    if (block.startsWith('- ') || block.startsWith('* ')) {
      const items = block.split('\n').map(line => line.replace(/^[\-\*]\s+/, '').trim());
      return (
        <ul key={idx} className="list-disc pl-6 my-4 space-y-2 text-[#42474F] dark:text-[#A7ABB5] text-left">
          {items.map((item, i) => (
            <li key={i} className="text-sm sm:text-base leading-6">{item}</li>
          ))}
        </ul>
      );
    }

    // Default Paragraph
    return (
      <p key={idx} className="text-sm sm:text-base leading-7 text-[#42474F] dark:text-[#A7ABB5] mb-4 text-left">
        {block}
      </p>
    );
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleReaderPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading } = usePlatformData();

  const blogs = data?.blogPosts ?? [];
  const resources = data?.resources ?? [];

  // Find inside blogs or resources
  const blogItem = blogs.find(b => b.id === id);
  const resourceItem = resources.find(r => r.id === id);

  const activeItem = blogItem 
    ? {
        title: blogItem.title,
        description: blogItem.description,
        content: blogItem.content || blogItem.description,
        category: blogItem.category,
        image_url: blogItem.image_url,
        published_at: blogItem.published_at,
        type: 'blog'
      }
    : resourceItem 
      ? {
          title: resourceItem.title,
          description: resourceItem.description,
          content: resourceItem.content,
          category: resourceItem.category,
          image_url: resourceItem.image_url,
          published_at: resourceItem.created_at,
          type: 'resource'
        }
      : null;

  // Generate suggested articles
  const otherItems = [...blogs.map(b => ({ id: b.id, title: b.title, type: 'blog' })), ...resources.map(r => ({ id: r.id, title: r.title, type: 'resource' }))]
    .filter(item => item.id !== id)
    .slice(0, 4);

  return (
    <div className="flex flex-col items-center w-full bg-[#F8F9FF] dark:bg-[#0D1C2E] min-h-screen relative font-sans antialiased text-[#42474F] dark:text-[#A7ABB5] transition-colors duration-300">
      
      {/* Header */}
      <PublicNavbar />

      <main className="w-full max-w-[1152px] px-6 md:px-16 pt-[120px] pb-24 flex flex-col gap-8 shrink-0">
        
        {/* Back Link */}
        <Link 
          href="/resources" 
          className="flex items-center gap-2 text-xs font-[700] uppercase tracking-wider text-brand-blue dark:text-[#5F9EA0] hover:text-brand-blue/80 dark:hover:text-[#5F9EA0]/80 self-start transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Resources
        </Link>

        {isLoading ? (
          <div className="w-full flex flex-col gap-6 animate-pulse mt-4">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl mt-4"></div>
          </div>
        ) : activeItem ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full pt-4">
            
            {/* Left Content Area (Columns 1 & 2) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Category Badge & Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-[600] uppercase tracking-wider">
                <span className="bg-[#E6EEFF] dark:bg-[#1E2D4A] text-brand-blue dark:text-[#5F9EA0] px-3 py-1.5 rounded-full font-[800]">
                  {activeItem.category}
                </span>
                <span className="flex items-center gap-1.5 text-[#516161] dark:text-[#A7ABB5]">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(activeItem.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1.5 text-[#516161] dark:text-[#A7ABB5]">
                  <User className="w-3.5 h-3.5" /> Clinq Medical Board
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-[40px] md:leading-[50px] font-[800] text-brand-blue dark:text-white tracking-[-0.96px] text-left">
                {activeItem.title}
              </h1>

              {/* Excerpt */}
              <p className="text-base sm:text-lg leading-7 text-[#516161] dark:text-[#C2C7D1] italic text-left border-l-4 border-brand-blue/30 dark:border-[#5F9EA0]/30 pl-4 py-1">
                {activeItem.description}
              </p>

              {/* Cover Image */}
              {activeItem.image_url && (
                <div className="w-full h-[240px] sm:h-[380px] rounded-xl overflow-hidden shadow-sm relative shrink-0 my-4 border border-[#C2C7D1]/10 dark:border-[#22354A]/30 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeItem.image_url} 
                    alt={activeItem.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Body Text */}
              <div className="prose dark:prose-invert max-w-none pt-4">
                {renderSimpleMarkdown(activeItem.content)}
              </div>

            </div>

            {/* Right Sticky Sidebar (Column 3) */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              
              {/* Specialist Appointment Booking Box */}
              <div className="bg-[#EFF4FF] dark:bg-[#122338] border border-[#C2C7D1]/40 dark:border-[#22354A]/30 rounded-xl p-6 sm:p-8 flex flex-col gap-6 text-left shadow-xs">
                <div className="w-12 h-12 rounded-lg bg-[#E6EEFF] dark:bg-[#0D1C2E]/40 flex items-center justify-center text-brand-blue dark:text-[#5F9EA0]">
                  <HeartPulse className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-[755] text-brand-blue dark:text-white leading-6 tracking-tight">
                    Need Direct Consultation?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#42474F] dark:text-[#A7ABB5] leading-5 mt-2">
                    Consult our board-certified medical coordinators or specialists. Book a secure video session or diagnostic lab check-in online.
                  </p>
                </div>
                <Link 
                  href="/patient/appointments/book"
                  className="w-full py-3 bg-brand-blue dark:bg-[#5F9EA0] hover:bg-brand-blue/90 dark:hover:bg-[#5F9EA0]/95 text-white dark:text-[#0D1C2E] font-[750] text-center rounded-lg shadow-sm text-sm transition"
                >
                  Book Appointment
                </Link>
              </div>

              {/* Other Related Readings */}
              {otherItems.length > 0 && (
                <div className="bg-white dark:bg-[#122338] border border-[#C2C7D1]/40 dark:border-[#22354A]/30 rounded-xl p-6 sm:p-8 flex flex-col gap-4 text-left shadow-xs">
                  <h4 className="text-xs font-[800] uppercase tracking-widest text-[#00355F] dark:text-white/80 pb-2 border-b border-[#C2C7D1]/15 dark:border-[#22354A]/30">
                    Latest Health Articles
                  </h4>
                  <ul className="flex flex-col gap-4">
                    {otherItems.map((item) => (
                      <li key={item.id} className="group">
                        <Link 
                          href={`/resources/${item.id}`}
                          className="text-xs sm:text-sm font-[650] text-[#516161] dark:text-[#A7ABB5] group-hover:text-[#0F4C81] dark:group-hover:text-[#5F9EA0] transition line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[10px] uppercase font-[700] tracking-wider text-brand-muted/70 block mt-1 dark:text-[#A7ABB5]/60">
                          {item.type === 'resource' ? 'Tool' : 'Article'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="py-24 text-center bg-white dark:bg-[#122338] border border-dashed border-[#C2C7D1]/30 dark:border-[#22354A]/30 rounded-xl flex flex-col items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-[#9CA3AF]" />
            <h3 className="text-lg font-[750] text-[#00355F] dark:text-white">Article Not Found</h3>
            <p className="text-xs sm:text-sm text-[#727780] dark:text-[#A7ABB5] max-w-sm px-4">
              We couldn't locate any blog post or health tool matching index ID "{id}". It may have been archived.
            </p>
            <Link 
              href="/resources" 
              className="mt-2 text-sm font-bold text-brand-blue dark:text-[#5F9EA0] underline"
            >
              Browse all library items
            </Link>
          </div>
        )}

      </main>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}
