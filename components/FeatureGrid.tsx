
import React, { useEffect, useRef, useState } from 'react';
import { ViewType } from '../App';

interface FeatureGridProps {
  onNavigate: (view: ViewType) => void;
}

interface FeatureItem {
  title: string;
  desc: string;
  img: string;
  span: string;
  bg: string;
  isLarge?: boolean;
  dark?: boolean;
  overlay?: string;
  horizontal?: boolean;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ onNavigate }) => {
  const features: FeatureItem[] = [
    { title: "Auto-Released Dry", desc: "More Energy-saving", img: "/images/tech/Rectangle 6.jpg", span: "md:col-span-1", bg: "bg-white" },
    { title: "World's First", desc: "Sweeping Jet Technology", img: "/images/tech/Rectangle 7.jpg", span: "md:col-span-2", bg: "bg-white" },
    { title: "Ultra-Slim Design", desc: "11.02 inch", img: "/images/tech/Rectangle 8.jpg", span: "md:col-span-1", bg: "bg-white" },
    { title: "AI Wash", desc: "The Smart Way To Wash", img: "/images/tech/Rectangle 9.jpg", span: "md:col-span-1", bg: "bg-white" },
    { title: "Quick Wash & Dry", desc: "Efficient Cleaning", img: "/images/tech/Rectangle 10.jpg", span: "md:col-span-1", bg: "bg-white" },
    { title: "70% Water Savings", desc: "Eco-friendly", img: "/images/tech/Rectangle 11.jpg", span: "md:col-span-1", bg: "bg-white" },
    { title: "Healthier", desc: "UV Protection", img: "/images/tech/Rectangle 12.jpg", span: "md:col-span-1", bg: "bg-white" }
  ];

  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set());

  // 滚动触发动画 - 使用 Intersection Observer API
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleFeatures(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const featureElements = gridRef.current?.querySelectorAll('[data-index]');
    featureElements?.forEach((el) => observer.observe(el));

    return () => {
      featureElements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section className="bg-[#FBFBFB] py-32 px-6 scroll-snap-align start">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-20 space-y-4">
          {/* 渐变文字 - 滚动触发 */}
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent animate-gradient-shift">
            极简。更是不凡。
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl font-light">
            LISSOME R1 台面式洗碗机，为现代厨房而生。
          </p>
        </div>
        
        {/* 特性网格 */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {features.map((f, i) => {
            const isVisible = visibleFeatures.has(i);
            return (
              <div
                key={i}
                data-index={i}
                onClick={() => onNavigate('detail', '扫振 i2')}
                className={`
                  ${f.span} ${f.bg} overflow-hidden cursor-pointer
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                `}
                style={{ 
                  transitionDelay: `${i * 100}ms`,
                  transitionProperty: 'opacity, transform'
                }}
              >
                {/* 图片容器 */}
                <div className="w-full h-64 flex items-center justify-center">
                  {/* 图片 */}
                  <img 
                    src={f.img} 
                    alt={f.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* 文字内容 */}
                <div className="p-4 text-center">
                  {/* 标题 */}
                  <h3 className="text-lg font-bold text-gray-900">
                    {f.title}
                  </h3>
                  
                  {/* 描述文字 */}
                  <p className="text-sm text-gray-500 mt-1">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
