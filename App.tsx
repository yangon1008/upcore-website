
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LifestyleSection from './components/LifestyleSection';
import FeatureGrid from './components/FeatureGrid';
import AppleStyleProductDisplay from './components/AppleStyleProductDisplay';
import TestimonialAwards from './components/TestimonialAwards';
import AppDownload from './components/AppDownload';
import Footer from './components/Footer';
import DetailPage from './components/DetailPage';
import InfoPage from './components/InfoPage';
import AppPage from './components/AppPage';
import PrivacyPage from './components/PrivacyPage';
import InterviewPage from './components/InterviewPage';

export type ViewType = 'home' | 'detail' | 'support' | 'about' | 'app' | 'privacy' | 'interview';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [transitioning, setTransitioning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // 检查是否有 view 参数，自动跳转到对应界面
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    
    // 检查路径
    const path = window.location.pathname;
    if (path === '/interview') {
      setView('interview');
    } else if (viewParam && ['home', 'detail', 'support', 'about', 'app', 'privacy', 'interview'].includes(viewParam)) {
      setView(viewParam as ViewType);
      // 清除 URL 中的 view 参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 页面标题映射
  const pageTitles: Record<ViewType, string> = {
    home: '溯洄 - 科技改变生活',
    detail: '产品详情 - Upcore 溯洄',
    support: '服务支持 - Upcore 溯洄',
    about: '关于我们 - Upcore 溯洄',
    app: '溯洄APP - Upcore 溯洄',
    privacy: '隐私政策 - Upcore 溯洄',
    interview: '预约面试 - Upcore 溯洄'
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
    }, 600);
  };

  const renderView = () => {
    switch (view) {
      case 'detail':
        return <DetailPage onBack={() => navigateTo('home')} productName={selectedProduct} />;
      case 'support':
        return <InfoPage type="support" onBack={() => navigateTo('home')} onNavigate={navigateTo} />;
      case 'about':
        return <InfoPage type="about" onBack={() => navigateTo('home')} onNavigate={navigateTo} />;
      case 'app':
        return <AppPage onNavigate={navigateTo} />;
      case 'privacy':
        return <PrivacyPage onNavigate={navigateTo} />;
      case 'interview':
        return <InterviewPage onBack={() => navigateTo('home')} />;

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
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white overflow-y-auto scroll-snap-type y mandatory">
          {/* 仅在首页显示导航栏，其他页面使用自身的导航 */}
          {view === 'home' && <Navbar onNavigate={navigateTo} currentView={view} />}
          <main 
            className={`transition-all duration-600 ease-in-out transform ${
              transitioning ? 'opacity-0 translate-y-10 scale-98' : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            {renderView()}
          </main>
          {/* 仅在首页显示页脚 */}
          {view === 'home' && <Footer onNavigate={navigateTo} />}
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
