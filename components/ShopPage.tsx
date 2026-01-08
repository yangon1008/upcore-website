
import React from 'react';
import { ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';

interface ShopPageProps {
  onBack: () => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-12 hover:text-black transition-colors">
          <ArrowLeft size={18} /> 继续购物
        </button>
        
        <div className="bg-white rounded-[40px] p-12 shadow-sm border border-black/5">
          <h1 className="text-4xl font-bold tracking-tight mb-8">结账</h1>
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 border border-gray-100 rounded-3xl bg-gray-50">
              <img src="https://picsum.photos/seed/se-pro/100/100" className="w-20 h-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-xl">扫振 i2 系列 - 钛金灰</h3>
                <p className="text-gray-500 text-sm">官方大师款套装</p>
              </div>
              <div className="text-xl font-bold">¥1,299.00</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-500">
                <span>小计</span>
                <span>¥1,299.00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>运费</span>
                <span className="text-green-600">免运费</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-4 border-t border-gray-100">
                <span>总计</span>
                <span>¥1,299.00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              <button className="flex items-center justify-center gap-3 bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all">
                <CreditCard size={20} /> 支付宝 / 微信支付
              </button>
              <button className="flex items-center justify-center gap-3 bg-gray-100 text-black py-5 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                <ShoppingBag size={20} /> 银联支付
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
