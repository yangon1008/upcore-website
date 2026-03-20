
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductGridProps {
  onNavigate: (view: ViewType, productName?: string) =&gt; void;
}

const ProductGrid: React.FC&lt;ProductGridProps&gt; = ({ onNavigate }) =&gt; {
  const { t, language } = useLanguage();
  
  const products = useMemo(() =&gt; [
    {
      name: t('products.se.name'),
      desc: t('products.se.desc'),
      img: "/images/tech/Product1.png",
      color: "bg-[#F5F5F7]",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      name: t('products.swift.name'),
      badge: t('products.swift.badge'),
      desc: t('products.swift.desc'),
      img: "/images/tech/Product2.png",
      color: "bg-[#FAFAFA]",
      gradient: "from-pink-500 to-orange-500"
    }
  ], [t, language]);

  const sectionRef = useRef&lt;HTMLDivElement&gt;(null);
  const [visibleProducts, setVisibleProducts] = useState&lt;Set&lt;number&gt;&gt;(new Set());

  useEffect(() =&gt; {
    const observer = new IntersectionObserver(
      (entries) =&gt; {
        entries.forEach((entry) =&gt; {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleProducts(prev =&gt; new Set(prev).add(index));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
    );

    const productElements = sectionRef.current?.querySelectorAll('[data-index]');
    productElements?.forEach((el) =&gt; observer.observe(el));

    return () =&gt; {
      productElements?.forEach((el) =&gt; observer.unobserve(el));
    };
  }, []);

  return (
    &lt;section className="bg-white py-32"&gt;
      &lt;div className="container mx-auto px-6 md:px-12"&gt;
        &lt;div 
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        &gt;
          {products.map((p, i) =&gt; {
            const isVisible = visibleProducts.has(i);
            return (
              &lt;div 
                key={i}
                data-index={i}
                className={`
                  relative overflow-hidden rounded-[48px] transition-all duration-500 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
                `}
                style={{ transitionDelay: `${i * 200}ms` }}
              &gt;
                &lt;div className={`
                  relative bg-white rounded-[48px] overflow-hidden
                  hover:shadow-2xl transition-all duration-500
                  cursor-pointer
                `}&gt;
                  &lt;div className="relative"&gt;
                    &lt;img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-auto object-cover transition-all duration-700 ease-out hover:scale-105"
                    /&gt;
                    &lt;div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"&gt;&lt;/div&gt;
                  &lt;/div&gt;
                  
                  &lt;div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white"&gt;
                    &lt;h3 className="text-2xl md:text-4xl font-bold mb-2"&gt;{p.name}&lt;/h3&gt;
                    &lt;p className="text-gray-200 mb-6"&gt;{p.desc}&lt;/p&gt;
                    
                    &lt;div className="flex items-center gap-6"&gt;
                      &lt;button
                        onClick={() =&gt; onNavigate('detail', p.name)}
                        className="flex items-center gap-2 font-semibold hover:gap-3 transition-all duration-300"
                      &gt;
                        &lt;span&gt;{t('products.learnMore')}&lt;/span&gt;
                        &lt;span className="text-lg"&gt;›&lt;/span&gt;
                      &lt;/button&gt;
                      &lt;button
                        onClick={() =&gt; window.open('https://mall.jd.com/index-1000104683.html?from=pc&amp;spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')}
                        className="flex items-center gap-2 font-semibold hover:gap-3 transition-all duration-300"
                      &gt;
                        &lt;span&gt;{t('products.buyNow')}&lt;/span&gt;
                        &lt;span className="text-lg"&gt;›&lt;/span&gt;
                      &lt;/button&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            );
          })}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/section&gt;
  );
};

export default ProductGrid;

