import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

// 扩展产品数据结构，添加苹果风格所需的详细信息
interface Product {
  id: number;
  name: string;
  desc: string;
  img: string;
  detailedImg: string;
  color: string;
  gradient: string;
  badge?: string;
  price: string;
  features: string[];
  specs?: {
    size: string;
    sizeValue: string;
    weight: string;
    weightValue: string;
    battery: string;
    batteryValue: string;
    chargeTime: string;
    chargeTimeValue: string;
  };
}

interface AppleStyleProductDisplayProps {
  onNavigate: (view: ViewType, productName?: string) => void;
}

const AppleStyleProductDisplay: React.FC<AppleStyleProductDisplayProps> = ({ onNavigate }) => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // 产品数据 - 使用useMemo确保语言变化时重新计算
  const products: Product[] = useMemo(() => [
    {
      id: 1,
      name: t('products.se.name'),
      desc: t('products.se.desc'),
      img: "https://picsum.photos/seed/se-pro/800/800",
      detailedImg: "https://picsum.photos/seed/se-pro-detailed/1200/1200",
      color: "bg-[#F5F5F7]",
      gradient: "from-blue-600 to-purple-600",
      price: t('products.se.price'),
      features: t('products.se.features'),
      specs: {
        size: t('products.se.specs.size'),
        sizeValue: t('products.se.specs.sizeValue'),
        weight: t('products.se.specs.weight'),
        weightValue: t('products.se.specs.weightValue'),
        battery: t('products.se.specs.battery'),
        batteryValue: t('products.se.specs.batteryValue'),
        chargeTime: t('products.se.specs.chargeTime'),
        chargeTimeValue: t('products.se.specs.chargeTimeValue')
      }
    },
    {
      id: 2,
      name: t('products.swift.name'),
      desc: t('products.swift.desc'),
      img: "https://picsum.photos/seed/swift-4/800/800",
      detailedImg: "https://picsum.photos/seed/swift-4-detailed/1200/1200",
      color: "bg-[#FAFAFA]",
      gradient: "from-pink-500 to-orange-500",
      badge: t('products.swift.badge'),
      price: t('products.swift.price'),
      features: t('products.swift.features')
    }
  ], [t, language]);

  // 滚动触发动画
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="bg-white py-32 overflow-hidden relative scroll-snap-align start"
    >
      {/* 背景装饰 - 苹果风格的简洁设计 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="container mx-auto px-6 md:px-12">
        {/* 标题 - 苹果风格的简洁设计 */}
        <div className="text-center mb-16">
          <h2 className={`
            text-5xl md:text-6xl font-bold tracking-tight mb-4
            transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
          `}>
            {t('products.title')}
          </h2>
          <p className={`
            text-xl text-gray-600 max-w-3xl mx-auto
            transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
          `}>
            {t('products.description')}
          </p>
        </div>

        {/* 产品展示区域 - 苹果风格的网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className={`
                relative overflow-hidden rounded-3xl transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
              `}
              style={{ transitionDelay: `${index * 200}ms` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* 产品卡片 */}
              <div className={`
                bg-white border border-gray-200 rounded-3xl overflow-hidden
                hover:border-gray-300 hover:shadow-xl transition-all duration-300
                cursor-pointer
              `}>
                {/* 产品图片区域 */}
                <div className="p-10 flex justify-center items-center min-h-[300px]">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-w-full max-h-[300px] object-contain transition-all duration-500 ease-out hover:scale-105"
                  />
                </div>

                {/* 产品信息区域 */}
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold tracking-tight">{product.name}</h3>
                    {product.badge && (
                      <span className="
                        bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full
                        font-medium uppercase tracking-wider
                      ">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{product.desc}</p>
                  <div className="text-xl font-semibold mb-6">{product.price}</div>
                  
                  {/* 特性列表 - 简洁展示 */}
                  <div className="grid grid-cols-2 gap-2 mb-8">
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="text-sm text-gray-500 flex items-center justify-center">
                        • {feature}
                      </div>
                    ))}
                  </div>

                  {/* 操作按钮 - 苹果风格的简洁设计 */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')}
                      className="
                        bg-black text-white px-8 py-3 rounded-full font-medium
                        hover:bg-gray-800 transition-colors duration-300
                      "
                    >
                      {t('products.buyNow')}
                    </button>
                    <button
                      onClick={() => onNavigate('detail', product.name)}
                      className="
                        bg-white text-black px-8 py-3 rounded-full font-medium
                        border border-gray-300
                        hover:bg-gray-50 transition-colors duration-300
                      "
                    >
                      {t('products.learnMore')}
                    </button>
                  </div>
                </div>
              </div>

              {/* 悬停弹出层 - 苹果风格的详细信息展示 */}
              {hoveredProduct === product.id && (
                <div className="
                  absolute inset-0 bg-white border-2 border-gray-300 rounded-3xl
                  shadow-2xl z-50 overflow-hidden
                  transition-all duration-300 ease-out
                  transform scale-105
                ">
                  {/* 弹出层内容 - 左右分栏布局 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                    {/* 左侧：高清图片 */}
                    <div className="relative flex items-center justify-center p-10 bg-gray-50">
                      <img
                        src={product.detailedImg}
                        alt={product.name}
                        className="max-w-full max-h-[500px] object-contain"
                      />
                      {/* 关闭按钮 - 只在移动端显示 */}
                      <button
                        className="lg:hidden absolute top-4 right-4 bg-white rounded-full p-2 shadow-md"
                        onClick={() => setHoveredProduct(null)}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* 右侧：详细信息 */}
                    <div className="p-10 overflow-y-auto">
                      <div className="space-y-8">
                        {/* 产品标题和价格 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-4xl font-bold tracking-tight">{product.name}</h3>
                            {product.badge && (
                              <span className="
                                bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full
                                font-medium uppercase tracking-wider
                              ">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-lg mb-4">{product.desc}</p>
                          <div className="text-2xl font-semibold">{product.price}</div>
                        </div>

                        {/* 主要特性 */}
                        <div>
                          <h4 className="text-xl font-semibold mb-4">{t('products.featuresTitle')}</h4>
                          <ul className="space-y-4">
                            {product.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-blue-600 mt-1">✓</span>
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 技术规格概览 */}
                        {product.specs && (
                          <div>
                            <h4 className="text-xl font-semibold mb-4">{t('products.specsTitle')}</h4>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-sm text-gray-500 mb-2">{product.specs.size}</div>
                                <div className="font-medium">{product.specs.sizeValue}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-2">{product.specs.weight}</div>
                                <div className="font-medium">{product.specs.weightValue}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-2">{product.specs.battery}</div>
                                <div className="font-medium">{product.specs.batteryValue}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-2">{product.specs.chargeTime}</div>
                                <div className="font-medium">{product.specs.chargeTimeValue}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="pt-4">
                          <div className="flex flex-col gap-4">
                            <button
                              onClick={() => window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')}
                              className="
                                bg-black text-white py-4 rounded-full font-medium text-lg
                                hover:bg-gray-800 transition-colors duration-300
                                flex items-center justify-center gap-2
                              "
                            >
                              <span>{t('products.buyNow')}</span>
                              <span>→</span>
                            </button>
                            <button
                              onClick={() => {
                                setHoveredProduct(null);
                                onNavigate('detail', product.name);
                              }}
                              className="
                                bg-white text-black py-4 rounded-full font-medium text-lg
                                border border-gray-300
                                hover:bg-gray-50 transition-colors duration-300
                              "
                            >
                              {t('products.viewDetails')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppleStyleProductDisplay;