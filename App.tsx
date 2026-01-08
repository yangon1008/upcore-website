
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LifestyleSection from './components/LifestyleSection';
import FeatureGrid from './components/FeatureGrid';
import ProductGrid from './components/ProductGrid';
import AwardsSection from './components/AwardsSection';
import Testimonial from './components/Testimonial';
import Footer from './components/Footer';
import DetailPage from './components/DetailPage';
import ShopPage from './components/ShopPage';
import InfoPage from './components/InfoPage';

export type ViewType = 'home' | 'detail' | 'shop' | 'support' | 'about' | 'contact';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');

  const navigateTo = (newView: ViewType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case 'detail':
        return <DetailPage onBack={() => navigateTo('home')} onBuy={() => navigateTo('shop')} />;
      case 'shop':
        return <ShopPage onBack={() => navigateTo('home')} />;
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
            <ProductGrid onNavigate={navigateTo} />
            <AwardsSection />
            <Testimonial />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onNavigate={navigateTo} />
      <main>{renderView()}</main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;
