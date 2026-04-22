
import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoPageProps {
  type: 'about' | 'support';
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ type, onBack, onNavigate }) => {
  const { t } = useLanguage();
  
  // 服务支持页面的服务项
  const serviceItems = [
    { title: t('support.serviceItems.parts'), description: t('support.serviceItems.partsDesc'), link: '#', img: '/images/service/配件价格.png' },
    { title: t('support.serviceItems.policy'), description: t('support.serviceItems.policyDesc'), link: '#', img: '/images/service/售后服务政策.png' },
    { title: t('support.serviceItems.progress'), description: t('support.serviceItems.progressDesc'), link: '#', img: '/images/service/服务进度.png' },
    { title: t('support.serviceItems.device'), description: t('support.serviceItems.deviceDesc'), link: '#', img: '/images/service/设备信息.png' }
  ];

  // 联系我们部分的数据
  const contactItems = [
    { type: t('support.contactItems.online'), description: t('support.contactItems.onlineDesc'), img: '/images/service/在线客服.png', link: '#' },
    { type: t('support.contactItems.phone'), description: t('support.contactItems.phoneDesc'), img: '/images/service/热线服务.png', link: '#' }
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 如果是about页面，使用新的设计
  if (type === 'about') {
    return (
      <div className="min-h-screen bg-white overflow-hidden">
        {/* 使用一致的导航栏组件 - 设置深色初始背景以确保在白色页面上可见 */}
        <Navbar onNavigate={onNavigate} initialBg="dark" currentView={type === 'about' ? 'about' : 'support'} />

        {/* 背景粒子效果 */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-blue-500 animate-pulse-slow"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 5 + 5}s`,
              }}
            />
          ))}
        </div>

        {/* 主内容区域 - 增加顶部padding以避免被固定导航栏遮挡 */}
        <main className="pt-24 pb-16 relative z-10">
          {/* 标题区域 */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 animate-fade-in">{t('about.subtitle')}</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {t('about.description')}
            </p>
            <p className="text-sm text-gray-500 mt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>{t('about.focus')}</p>
          </section>

          {/* 实验室视频 */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
            <div className="relative group animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <video 
                src="/images/about/about.mp4" 
                alt="实验室视频" 
                className="w-full max-w-3xl mx-auto h-auto rounded-lg shadow-xl transition-all duration-500 group-hover:shadow-2xl"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </section>

          {/* 核心价值观 */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">{t('about.values.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* 自产自研 */}
              <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{t('about.values.self')}</h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {t('about.values.selfDesc')}
                </p>
              </div>

              {/* 专注细节 */}
              <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in" style={{ animationDelay: '1.0s' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">{t('about.values.detail')}</h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {t('about.values.detailDesc')}
                </p>
              </div>

              {/* 探索极致 */}
              <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in" style={{ animationDelay: '1.2s' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">{t('about.values.extreme')}</h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {t('about.values.extremeDesc')}
                </p>
              </div>

              {/* 提供优解 */}
              <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in" style={{ animationDelay: '1.4s' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">{t('about.values.solution')}</h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {t('about.values.solutionDesc')}
                </p>
              </div>
            </div>
          </section>

          {/* 发展历程 */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* 左侧设计图 */}
              <div className="group animate-fade-in" style={{ animationDelay: '1.6s' }}>
                <img 
                  src="/images/about/about.png" 
                  alt="产品设计图" 
                  className="w-full max-w-md mx-auto h-auto rounded-lg shadow-xl object-cover transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
                />
              </div>

              {/* 右侧时间线 */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 animate-fade-in" style={{ animationDelay: '1.8s' }}>{t('about.timeline.title')}</h2>
                <div className="space-y-6">
                  {/* 2024 */}
                  <div className="flex gap-4 group animate-fade-in" style={{ animationDelay: '2.0s' }}>
                    <div className="text-lg font-bold text-gray-900 w-20 group-hover:text-blue-600 transition-colors duration-300">2024</div>
                    <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{t('about.timeline.2024')}</div>
                  </div>
                  {/* 2025 */}
                  <div className="flex gap-4 group animate-fade-in" style={{ animationDelay: '2.2s' }}>
                    <div className="text-lg font-bold text-gray-900 w-20 group-hover:text-blue-600 transition-colors duration-300">2025</div>
                    <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{t('about.timeline.2025')}</div>
                  </div>
                  {/* 2026 */}
                  <div className="flex gap-4 group animate-fade-in" style={{ animationDelay: '2.4s' }}>
                    <div className="text-lg font-bold text-gray-900 w-20 group-hover:text-blue-600 transition-colors duration-300">2026</div>
                    <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{t('about.timeline.2026')}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* 使用一致的页脚组件 */}
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  // 服务支持页面
  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-hidden">
      {/* 使用一致的导航栏组件 - 设置深色初始背景以确保在白色页面上可见 */}
      <Navbar onNavigate={onNavigate} initialBg="dark" currentView={type === 'about' ? 'about' : 'support'} />

      {/* 背景粒子效果 */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-purple-500 animate-pulse-slow"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
            }}
          />
        ))}
      </div>

      {/* 服务支持主内容 - 增加顶部padding以避免被固定导航栏遮挡 */}
      <main className="pt-24 pb-16 relative z-10">
        {/* 横幅图片 */}
        <div className="relative h-64 md:h-80 bg-gray-200 animate-fade-in">
          <img 
            src="/images/service/服务与支持.png" 
            alt="服务与支持" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in">{t('support.title')}</h1>
            <p className="text-white text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>{t('support.welcome')}</p>
            <div className="mt-4 flex items-center bg-white rounded-full px-4 py-2 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <input 
                type="text" 
                placeholder={t('support.searchPlaceholder')} 
                className="flex-1 outline-none bg-transparent text-gray-800"
              />
              <button className="bg-blue-600 text-white rounded-full px-6 py-2 font-medium hover:bg-blue-700 transition-colors group">
                {t('support.searchButton')}

              </button>
            </div>
          </div>
        </div>

        {/* 服务申请部分 */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">{t('support.serviceTitle')}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >

                <div className="text-3xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {{
                    'Parts Price': '📦',
                    'After-sales Policy': '📄',
                    'Service Progress': '📊',
                    'Device Info': '📱',
                    '配件价格': '📦',
                    '售后服务政策': '📄',
                    '服务进度': '📊',
                    '设备信息': '📱'
                  }[item.title as keyof typeof serviceItems[number]['title']] || '📋'}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 text-center group-hover:text-gray-800 transition-colors duration-300">{item.description}</p>
                <a 
                  href={item.link} 
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300"
                >
                  {t('support.applyNow')} <span className="ml-1">→</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 联系我们部分 */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">{t('support.contactTitle')}</h2>
            
            {/* 联系方式列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contactItems.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg border border-gray-200 p-10 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in"
                  style={{ animationDelay: `${1.0 + index * 0.2}s` }}
                >
  
                  <div className="text-4xl mb-6 text-center group-hover:scale-110 transition-transform duration-300">
                    {{
                      'Online Support': '💬',
                      'Hotline Service': '📞',
                      '在线客服': '💬',
                      '热线服务': '📞'
                    }[item.type as keyof typeof contactItems[number]['type']] || '📋'}
                  </div>
                  <h3 className="text-lg font-semibold mb-4 text-center group-hover:text-purple-600 transition-colors duration-300">{item.type}</h3>
                  <p className="text-sm text-gray-600 mb-6 text-center group-hover:text-gray-800 transition-colors duration-300">{item.description}</p>
                  <div className="text-center">
                    <a 
                      href={item.link} 
                      className="text-purple-600 text-sm font-medium hover:underline inline-block px-6 py-3 rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 group"
                    >
                      {item.type === t('support.contactItems.online') ? t('support.contactOnline') : t('support.morePhone')}
  
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 使用一致的页脚组件 */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default InfoPage;
