
import React from 'react';
import { ArrowLeft, CheckCircle2, ShoppingCart } from 'lucide-react';

interface DetailPageProps {
  onBack: () => void;
  onBuy: () => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ onBack, onBuy }) => {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            返回首页
          </button>
          <button onClick={onBuy} className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <ShoppingCart size={16} /> 立即购买
          </button>
        </div>
      </nav>
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 rounded-[48px] overflow-hidden border border-gray-100">
              <img src="https://picsum.photos/seed/detail-main/800/800" alt="Main View" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl font-extrabold tracking-tighter">扫振 i2 <br/>大师款套装</h1>
              <p className="text-xl text-gray-500 font-light">融合现代美学与顶尖洁齿科技。航空级钛合金机身。</p>
              <div className="text-4xl font-bold">¥ 1,299</div>
            </div>
            <button onClick={onBuy} className="w-full bg-black text-white py-5 rounded-3xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-2xl">
              确认购买并支付
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
