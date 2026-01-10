
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
    { title: "自动开门烘干", desc: "极致能效，更干更净", img: "https://picsum.photos/seed/dish-1/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-white" },
    { title: "全球首创", desc: "扫动式喷淋技术", img: "https://picsum.photos/seed/dish-2/1200/800", span: "md:col-span-2 md:row-span-2", bg: "bg-[#F5F5F7]", isLarge: true },
    { title: "纤薄机身设计", desc: "仅 28cm 厚度", img: "https://picsum.photos/seed/dish-3/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-white" },
    { title: "AI 智慧洗", desc: "自动匹配程序", img: "https://picsum.photos/seed/dish-4/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-white" },
    { title: "极速洗烘", desc: "15分钟高效净洗", img: "https://picsum.photos/seed/dish-5/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-blue-600", dark: true, overlay: "15 MIN" },
    { title: "节省 70% 水资源", desc: "环保生活", img: "https://picsum.photos/seed/dish-6/800/400", span: "md:col-span-2 md:row-span-1", bg: "bg-white", horizontal: true },
    { title: "多重杀菌防护", desc: "UVC + 等离子", img: "https://picsum.photos/seed/dish-7/800/400", span: "md:col-span-2 md:row-span-1", bg: "bg-[#111111]", dark: true, horizontal: true }
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
    <section className="bg-[#FBFBFB] py-32 px-6">
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
          className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8"
        >
          {features.map((f, i) => {
            const isVisible = visibleFeatures.has(i);
            return (
              <div
                key={i}
                data-index={i}
                onClick={() => onNavigate('detail', '扫振 i2')}
                className={`
                  ${f.span} ${f.bg} rounded-[48px] p-8 md:p-10 
                  flex flex-col justify-between overflow-hidden relative group 
                  transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 
                  border border-black/5 cursor-pointer
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                `}
                style={{ 
                  transitionDelay: `${i * 100}ms`,
                  transitionProperty: 'opacity, transform, box-shadow, border-color'
                }}
              >
                {/* 动态背景光晕 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                {/* 玻璃拟态覆盖层 - 悬停时显示 */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* 文字内容 */}
                <div className="relative z-10 space-y-3">
                  {/* 叠加文字（如 15 MIN） */}
                  {f.overlay && (
                    <div className="inline-block bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {f.overlay}
                    </div>
                  )}
                  
                  {/* 渐变标题 - 悬停效果 */}
                  <h3 className={`
                    text-2xl font-bold tracking-tight transition-all duration-500 
                    group-hover:scale-105 ${f.dark ? 'text-white' : 'text-gray-900'}
                  `}>
                    {f.title}
                  </h3>
                  
                  {/* 描述文字 - 淡入效果 */}
                  <p className={`
                    text-sm font-medium opacity-50 transition-all duration-500 
                    group-hover:opacity-80 ${f.dark ? 'text-white/80' : 'text-gray-500'}
                  `}>
                    {f.desc}
                  </p>
                </div>
                
                {/* 图片容器 - 视差和缩放效果 */}
                <div className={`
                  relative z-0 flex items-center justify-center transition-all duration-1000 
                  group-hover:scale-110 group-hover:rotate-1 
                  ${f.isLarge ? 'h-full py-6' : 'mt-8'}
                `}>
                  {/* 图片 */}
                  <img 
                    src={f.img} 
                    alt={f.title} 
                    className={`
                      w-full object-contain max-h-[240px] transition-all duration-700 
                      group-hover:brightness-110 
                      ${f.horizontal ? 'max-h-[160px]' : ''}
                    `}
                  />
                  
                  {/* 图片悬停光晕 */}
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* 装饰性边框 - 玻璃拟态 */}
                <div className="absolute inset-0 border-2 border-white/30 rounded-[48px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
