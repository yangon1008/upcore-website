
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductGridProps {
  onNavigate: (view: ViewType) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  
  // 产品数据 - 使用useMemo确保语言变化时重新计算
  const products = useMemo(() => [
    {
      name: t('products.se.name'),
      desc: t('products.se.desc'),
      img: "https://picsum.photos/seed/se-pro/800/800",
      color: "bg-[#F5F5F7]",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      name: t('products.swift.name'),
      badge: t('products.swift.badge'),
      desc: t('products.swift.desc'),
      img: "https://picsum.photos/seed/swift-4/800/800",
      color: "bg-[#FAFAFA]",
      gradient: "from-pink-500 to-orange-500"
    }
  ], [t, language]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleProducts, setVisibleProducts] = useState<Set<number>>(new Set());

  // 滚动触发动画 - 使用 Intersection Observer API
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleProducts(prev => new Set(prev).add(index));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
    );

    const productElements = sectionRef.current?.querySelectorAll('[data-index]');
    productElements?.forEach((el) => observer.observe(el));

    return () => {
      productElements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section className="bg-white py-32">
      <div className="container mx-auto px-6 md:px-12">
        <div 
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {products.map((p, i) => {
            const isVisible = visibleProducts.has(i);
            return (
              <div 
                key={i}
                data-index={i}
                className={`
                  flex flex-col justify-between rounded-[48px] ${p.color} 
                  overflow-hidden group hover:shadow-2xl transition-all duration-700
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
                `}
                style={{ 
                  transitionDelay: `${i * 200}ms`,
                  transitionProperty: 'opacity, transform, box-shadow'
                }}
              >
                {/* 动态背景渐变 */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-1000`}
                ></div>
                
                {/* 玻璃拟态覆盖层 */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="p-16 space-y-8 text-center relative z-10">
                  <div className="space-y-4">
                    {/* 渐变文字标题 - 动态色彩 */}
                    <h2 className={`
                      text-5xl font-bold tracking-tight flex items-center justify-center gap-4
                      bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent
                      animate-gradient-text
                    `}>
                      <span>{p.name}</span>
                      {p.badge && (
                        <span className="
                          text-[10px] border border-black/10 px-3 py-1 rounded-full 
                          uppercase text-black/40 font-bold tracking-widest
                          group-hover:bg-white/80 group-hover:text-black/80
                          backdrop-blur-sm transition-all duration-300
                        ">
                          {p.badge}
                        </span>
                      )}
                    </h2>
                    
                    {/* 描述文字 - 淡入效果 */}
                    <p className="
                      text-gray-500 text-lg font-medium transition-all duration-500
                      group-hover:text-gray-800 group-hover:scale-105
                    ">
                      {p.desc}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-6 pt-4">
                    {/* 购买按钮 - 渐变背景 + 悬停效果 */}
                    <button 
                      onClick={() => window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')}
                      className={`
                        bg-gradient-to-r ${p.gradient} text-white px-8 py-3 rounded-full 
                        font-bold text-sm hover:scale-105 transition-all duration-300
                        flex items-center gap-2 shadow-lg hover:shadow-xl
                        active:scale-95 group
                      `}
                    >
                      <span>{t('products.buyNow')}</span>
                      <ArrowRight 
                        size={16} 
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </button>
                    
                    {/* 了解更多按钮 - 下划线动画 */}
                    <button 
                      onClick={() => onNavigate('detail', p.name)}
                      className="
                        text-black font-bold text-sm relative overflow-hidden
                        group
                      "
                    >
                      <span className="relative z-10 transition-all duration-300">{t('products.learnMore')}</span>
                      <span className="
                        absolute bottom-0 left-0 w-0 h-1 bg-black
                        group-hover:w-full transition-all duration-500
                      "></span>
                    </button>
                  </div>
                </div>
                
                {/* 产品图片容器 - 视差和缩放效果 */}
                <div className="relative px-12 pb-12 flex justify-center overflow-hidden">
                  {/* 图片光晕效果 */}
                  <div className={`
                    absolute -inset-1/4 bg-gradient-to-r ${p.gradient} blur-[150px]
                    opacity-0 group-hover:opacity-30 transition-opacity duration-1000
                  `}></div>
                  
                  <img 
                    src={p.img} 
                    alt={p.name} 
                    className="
                      w-full max-w-[500px] h-auto object-contain relative z-10
                      transition-all duration-1000 ease-out
                      group-hover:scale-110 group-hover:-translate-y-8
                      group-hover:rotate-2
                    " 
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

export default ProductGrid;
