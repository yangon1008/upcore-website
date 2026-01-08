
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LifestyleSection from './components/LifestyleSection';
import FeatureGrid from './components/FeatureGrid';
import ProductGrid from './components/ProductGrid';
import AwardsSection from './components/AwardsSection';
import Testimonial from './components/Testimonial';
import Footer from './components/Footer';
import DetailPage from './components/DetailPage';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'detail'>('home');

  const navigateTo = (newView: 'home' | 'detail') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  if (view === 'detail') {
    return <DetailPage onBack={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onNavigate={() => navigateTo('detail')} />
      <main>
        <Hero onNavigate={() => navigateTo('detail')} />
        <LifestyleSection />
        <FeatureGrid onNavigate={() => navigateTo('detail')} />
        <ProductGrid onNavigate={() => navigateTo('detail')} />
        <AwardsSection />
        <Testimonial />
      </main>
      <Footer onNavigate={() => navigateTo('detail')} />
    </div>
  );
};

export default App;
