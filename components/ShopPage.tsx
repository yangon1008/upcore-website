
import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';

interface ShopPageProps {
  onBack: () => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'unionpay' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (method: 'alipay' | 'unionpay') => {
    setPaymentMethod(method);
    setIsProcessing(true);
    
    // 模拟支付处理
    setTimeout(() => {
      setIsProcessing(false);
      // 这里可以添加支付成功的逻辑
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-32 pb-20 px-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <img 
            src="/images/logo.png" 
            alt="Upcore 溯洄" 
            className="h-8 w-auto cursor-pointer"
            onClick={onBack}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-gray-500 mb-12 hover:text-black transition-all duration-300 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          继续购物
        </button>
        
        <div className="bg-white rounded-[40px] p-12 shadow-sm border border-black/5 transition-all duration-500 hover:shadow-md">
          <h1 className="text-4xl font-bold tracking-tight mb-8 transition-opacity duration-500">结账</h1>
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 border border-gray-100 rounded-3xl bg-gray-50 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
              <div className="group relative overflow-hidden rounded-2xl">
                <img 
                  src="https://picsum.photos/seed/se-pro/100/100" 
                  className="w-20 h-20 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl transition-colors duration-300 hover:text-blue-600">扫振 i2 系列 - 钛金灰</h3>
                <p className="text-gray-500 text-sm">官方大师款套装</p>
              </div>
              <div className="text-xl font-bold">¥1,299.00</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-500 transition-opacity duration-300">
                <span>小计</span>
                <span>¥1,299.00</span>
              </div>
              <div className="flex justify-between text-gray-500 transition-opacity duration-300">
                <span>运费</span>
                <span className="text-green-600 font-medium">免运费</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-4 border-t border-gray-100 transition-all duration-300">
                <span>总计</span>
                <span>¥1,299.00</span>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <h3 className="font-bold text-lg">选择支付方式</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handlePayment('alipay')}
                  disabled={isProcessing}
                  className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold transition-all duration-300 ${paymentMethod === 'alipay' ? 'bg-blue-600 text-white' : 'bg-black text-white hover:bg-gray-800'} ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <CreditCard size={20} className={isProcessing ? 'animate-pulse' : ''} />
                  <span>{isProcessing ? '处理中...' : '支付宝 / 微信支付'}</span>
                </button>
                <button 
                  onClick={() => handlePayment('unionpay')}
                  disabled={isProcessing}
                  className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold transition-all duration-300 ${paymentMethod === 'unionpay' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'} ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <ShoppingBag size={20} className={isProcessing ? 'animate-pulse' : ''} />
                  <span>{isProcessing ? '处理中...' : '银联支付'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
