import React, { useEffect, useRef, useState } from 'react';

const TestimonialAwards: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    { id: 1, name: 'YD', year: '2023' },
    { id: 2, name: 'AsiaOne', year: '2023' },
    { id: 3, name: 'WGN9', year: '2023' },
    { id: 4, name: 'Macworld', year: '2023' },
    { id: 5, name: 'TechHive', year: '2023' },
    { id: 6, name: 'Yahoo!', year: '2023' },
    { id: 7, name: 'AP', year: '2023' },
  ];

  // 评价数据
  const testimonials = [
    {
      id: 1,
      quote: '推出最紧凑、最智能的便携式洗碗机 LISSOME R1：彻底改变小空间的清洁方式',
      author: 'TechReview',
      role: '科技媒体',
    },
  ];

  return (
    <div 
      ref={sectionRef}
      className="min-h-[800px] bg-gradient-to-b from-white to-gray-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 动态背景效果 */}
      <div className={`
        absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent
        opacity-0 transition-opacity duration-1000
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}></div>
      
      {/* 背景光晕 */}
      <div className={`
        absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]
        transition-transform duration-2000 ease-out
        ${isHovered ? 'scale-110 translate-x-10 translate-y-10' : 'scale-100'}
      `}></div>
      <div className={`
        absolute -bottom-60 -left-60 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]
        transition-transform duration-2000 ease-out
        ${isHovered ? 'scale-110 -translate-x-10 -translate-y-10' : 'scale-100'}
      `}></div>

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
            备受认可的卓越设计
          </h2>
          <p className={`
            text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto
            transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
          `}>
            我们的产品设计和技术创新获得了行业权威机构的认可，同时也赢得了用户的广泛赞誉
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧：奖项展示 */}
          <div className={`
            transition-all duration-700 ease-out delay-300
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-30'}
          `}>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <h3 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                奖项与认可
              </h3>
              
              {/* 奖项网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {awards.map((award, index) => (
                  <div
                    key={award.id}
                    className={`
                      bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100
                      hover:border-blue-200 hover:shadow-lg transition-all duration-300 ease-out
                      transform hover:-translate-y-1
                      opacity-0 transition-opacity duration-500 delay-${400 + index * 100}ms
                      ${isVisible ? 'opacity-100' : 'opacity-0'}
                    `}
                  >
                    <div className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {award.name}
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      {award.year}
                    </div>
                    {/* 悬停光晕效果 */}
                    <div className="absolute inset-0 bg-blue-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：评价展示 */}
          <div className={`
            transition-all duration-700 ease-out delay-400
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-30'}
          `}>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              {/* 装饰性背景 */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70"></div>
              
              <h3 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent relative z-10">
                用户评价
              </h3>
              
              {/* 评价内容 */}
              <div className="relative z-10">
                {/* 引用符号 */}
                <div className={`
                  text-8xl text-gray-200 mb-6 text-center
                  opacity-0 scale-50 transition-all duration-500 ease-out delay-500ms
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                `}>
                  “
                </div>
                
                {/* 评价文字 */}
                <p className={`
                  text-xl sm:text-2xl font-medium leading-relaxed mb-8 text-center text-gray-700
                  opacity-0 translate-y-20 transition-all duration-700 ease-out delay-600ms
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                `}>
                  推出最紧凑、最智能的便携式洗碗机 LISSOME R1：彻底改变小空间的清洁方式
                </p>
                
                {/* 评价者信息 */}
                <div className={`
                  flex flex-col items-center opacity-0 translate-y-10 transition-all duration-700 ease-out delay-700ms
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                    TR
                  </div>
                  <div className="font-semibold text-gray-900">TechReview</div>
                  <div className="text-gray-500 text-sm">科技媒体</div>
                </div>
              </div>
              
              {/* 装饰性边框 */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-3xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
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