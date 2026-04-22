
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

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
  onNavigate: any;
}

const AppleStyleProductDisplay: React.FC<AppleStyleProductDisplayProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const products: Product[] = useMemo(() => [
    {
      id: 1,
      name: t('products.se.name'),
      desc: t('products.se.desc'),
      img: "/images/tech/Product1.png",
      detailedImg: "/images/tech/Product1.png",
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
      img: "/images/tech/Product2.png",
      detailedImg: "/images/tech/Product2.png",
      color: "bg-[#FAFAFA]",
      gradient: "from-pink-500 to-orange-500",
      badge: t('products.swift.badge'),
      price: t('products.swift.price'),
      features: t('products.swift.features')
    }
  ], [t, language]);

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
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="container mx-auto px-6 md:px-12">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className={`
                relative overflow-hidden rounded-[48px] transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
              `}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className={`
                relative bg-white rounded-[48px] overflow-hidden
                hover:shadow-2xl transition-all duration-500
                cursor-pointer
              `}>
                <div className="relative">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-auto object-cover transition-all duration-700 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-center">
                  <h3 className="text-2xl md:text-4xl font-bold mb-2 text-black">{product.name}</h3>
                  <p className="text-gray-600 mb-6">{product.desc}</p>
                  
                  <div className="flex items-center justify-center gap-10">
                    <button
                      onClick={() => onNavigate('detail', product.name)}
                      className="flex items-center gap-2 font-semibold hover:gap-3 transition-all duration-300 text-black"
                    >
                      <span>{t('products.learnMore')}</span>
                      <span className="text-lg">›</span>
                    </button>
                    <button
                      onClick={() => alert('敬请期待！')}
                      className="flex items-center gap-2 font-semibold hover:gap-3 transition-all duration-300 text-black"
                    >
                      <span>{t('products.buyNow')}</span>
                      <span className="text-lg">›</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppleStyleProductDisplay;
