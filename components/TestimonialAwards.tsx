import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TestimonialAwards: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

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

  // 奖项数据
  const awards = [
    { id: 1, name: '科技中小型', year: '2025' },
  ];

  // 评价数据 - 使用翻译系统
  const testimonials = t('awards.testimonials');

  return (
    <div 
      ref={sectionRef}
      className="min-h-[800px] bg-gradient-to-b from-white to-gray-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden scroll-snap-align start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >


      <div className="max-w-7xl mx-auto relative z-10">
        {/* 标题部分 */}
        <div className="text-center mb-20">
          <h2 className={`
            text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6
            bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent
            animate-gradient-text
            transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
          `}>
            {t('awards.title')}
          </h2>
          <p className={`
            text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto
            transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
          `}>
            {t('awards.description')}
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-3xl mx-auto">
          {/* 奖项展示 */}
          <div className={`
            transition-all duration-700 ease-out delay-300
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-30'}
          `}>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <h3 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('awards.sectionTitle')}
              </h3>
              
              {/* 奖项展示 */}
              <div className="flex justify-center">
                {awards.map((award, index) => (
                  <div
                    key={award.id}
                    className={`
                      bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100
                      hover:border-blue-200 hover:shadow-lg transition-all duration-300 ease-out
                      transform hover:-translate-y-1
                      opacity-0 transition-opacity duration-500 delay-${400 + index * 100}ms
                      ${isVisible ? 'opacity-100' : 'opacity-0'}
                      min-w-[200px]
                    `}
                  >
                    <div className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {award.name}
                    </div>
                    <div className="text-base text-gray-500 text-center">
                      {award.year}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className={`
          mt-20 h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto
          opacity-0 scale-x-0 transition-all duration-700 ease-out delay-800ms
          ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
        `}></div>
      </div>
    </div>
  );
};

export default TestimonialAwards;