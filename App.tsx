
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LifestyleSection from './components/LifestyleSection';
import FeatureGrid from './components/FeatureGrid';
import AppleStyleProductDisplay from './components/AppleStyleProductDisplay';
import TestimonialAwards from './components/TestimonialAwards';
import Footer from './components/Footer';
import DetailPage from './components/DetailPage';
import InfoPage from './components/InfoPage';

export type ViewType = 'home' | 'detail' | 'support' | 'about' | 'contact';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [transitioning, setTransitioning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // 页面标题映射
  const pageTitles: Record<ViewType, string> = {
    home: 'Upcore 溯洄 - 科技改变生活',
    detail: '产品详情 - Upcore 溯洄',
    support: '服务支持 - Upcore 溯洄',
    about: '关于我们 - Upcore 溯洄',
    contact: '联系我们 - Upcore 溯洄'
  };

  // 更新页面标题
  useEffect(() => {
    document.title = pageTitles[view];
  }, [view]);

  const navigateTo = (newView: ViewType, productName?: string) => {
    if (view === newView) return;
    
    // 添加过渡动画
    setTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      setView(newView);
      if (productName) {
        setSelectedProduct(productName);
      }
      setTransitioning(false);
    }, 300);
  };

  const renderView = () => {
    switch (view) {
      case 'detail':
        return <DetailPage onBack={() => navigateTo('home')} productName={selectedProduct} />;
      case 'support':
        return <InfoPage type="support" onBack={() => navigateTo('home')} />;
      case 'about':
        return <InfoPage type="about" onBack={() => navigateTo('home')} />;
      case 'contact':
        return <InfoPage type="contact" onBack={() => navigateTo('home')} />;
      default:
        return (
          <>
            <Hero onNavigate={navigateTo} />
            <LifestyleSection />
            <FeatureGrid onNavigate={navigateTo} />
            {/* 苹果风格产品展示功能 */}
            <AppleStyleProductDisplay onNavigate={navigateTo} />
            {/* 奖项与认可和用户评价区块 - 全新设计 */}
            <TestimonialAwards />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 仅在首页显示导航栏，其他页面使用自身的导航 */}
      {view === 'home' && <Navbar onNavigate={navigateTo} />}
      <main 
        className={`transition-opacity duration-300 ease-in-out ${
          transitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {renderView()}
      </main>
      {/* 仅在首页显示页脚 */}
      {view === 'home' && <Footer onNavigate={navigateTo} />}
    </div>
  );
};

export default App;
