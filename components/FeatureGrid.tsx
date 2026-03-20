
import React, { useEffect, useRef, useState } from 'react';
import { ViewType } from '../App';

interface FeatureGridProps {
  onNavigate: any;
}

interface FeatureItem {
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
    { img: "/images/tech/Rectangle 6.png", span: "md:col-span-1", bg: "bg-white" },
    { img: "/images/tech/Rectangle 7.png", span: "md:col-span-2", bg: "bg-white" },
    { img: "/images/tech/Rectangle 8.png", span: "md:col-span-1", bg: "bg-white" },
    { img: "/images/tech/Rectangle 9.jpg", span: "md:col-span-1", bg: "bg-white" },
    { img: "/images/tech/Rectangle 10.png", span: "md:col-span-1", bg: "bg-white" },
    { img: "/images/tech/Rectangle 11.jpg", span: "md:col-span-1", bg: "bg-white" },
    { img: "/images/tech/Rectangle 12.png", span: "md:col-span-1", bg: "bg-white" }
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
            极简，更是不凡
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
                <div className="w-full h-81 flex items-center justify-center">
                  {/* 图片 */}
                  <img 
                    src={f.img} 
                    className="w-full h-full object-contain"
                  />
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
