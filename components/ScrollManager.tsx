import React, { useEffect, useRef, useState } from 'react';

interface ScrollManagerProps {
  children: React.ReactNode;
}

const ScrollManager: React.FC<ScrollManagerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  // 监听鼠标滚轮事件
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      
      const direction = e.deltaY > 0 ? 'down' : 'up';
      scrollToSection(direction);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, isScrolling]);

  // 滚动到指定区块
  const scrollToSection = (direction: 'up' | 'down') => {
    const sections = sectionsRef.current;
    if (sections.length === 0) return;

    setIsScrolling(true);

    const nextIndex = direction === 'down' 
      ? Math.min(currentIndex + 1, sections.length - 1) 
      : Math.max(currentIndex - 1, 0);

    const container = containerRef.current;
    if (container) {
      // 计算目标位置
      const targetPosition = nextIndex * window.innerHeight;
      
      // 使用requestAnimationFrame实现平滑滚动
      const startPosition = container.scrollTop;
      const distance = targetPosition - startPosition;
      const duration = 800; // 滚动动画持续时间
      let startTime: number | null = null;

      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);
        
        container.scrollTop = startPosition + distance * easeProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          setCurrentIndex(nextIndex);
          setIsScrolling(false);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  // 将子元素包装成可滚动的区块
  const renderSections = () => {
    return React.Children.map(children, (child, index) => {
      return (
        <div
          ref={(el) => {
            if (el) sectionsRef.current[index] = el;
          }}
          className="h-screen w-full flex-shrink-0"
          style={{
            overflow: 'hidden',
          }}
        >
          {child}
        </div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto overflow-x-hidden"
      style={{
        scrollBehavior: 'smooth',
      }}
    >
      <div className="flex flex-col">
        {renderSections()}
      </div>
    </div>
  );
};

export default ScrollManager;