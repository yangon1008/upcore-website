import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface AppPageProps {
  onNavigate: (view: ViewType) => void;
}

const AppPage: React.FC<AppPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <Navbar onNavigate={onNavigate} initialBg="dark" currentView="app" />

      {/* 主内容区域 */}
      <main className="pt-24 pb-16">
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
              {/* Left side: App info */}
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-gray-900">{t('app.title')}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('app.description')}
                </p>
                <div className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                      <span className="text-gray-700">{t('app.feature1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                      <span className="text-gray-700">{t('app.feature2')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                      <span className="text-gray-700">{t('app.feature3')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                      <span className="text-gray-700">{t('app.feature4')}</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a 
                    href="https://apps.apple.com/cn/app/%E7%AC%91%E5%AE%B9%E5%8A%A0-%E6%99%BA%E8%83%BD%E5%8F%A3%E8%85%94%E5%81%A5%E5%BA%B7%E7%AE%A1%E7%90%86-%E5%88%B7%E7%89%99%E6%8A%A4%E9%BD%BF%E5%A5%BD%E7%AE%A1%E5%AE%B6/id1598312530" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5 1H6.5C3.73858 1 1.5 3.23858 1.5 6V18C1.5 20.7614 3.73858 23 6.5 23H17.5C20.2614 23 22.5 20.7614 22.5 18V6C22.5 3.23858 20.2614 1 17.5 1ZM17.5 3C19.1569 3 20.5 4.34315 20.5 6V18C20.5 19.6569 19.1569 21 17.5 21H6.5C4.84315 21 3.5 19.6569 3.5 18V6C3.5 4.34315 4.84315 3 6.5 3H17.5Z" fill="white"/>
                      <path d="M10.5 17L10.3373 16.7307C10.1542 16.4512 9.91104 16.216 9.60581 16.0539C9.30057 15.8919 8.93735 15.8077 8.575 15.8125C8.21265 15.8173 7.85711 15.9142 7.53538 16.0953C7.21365 16.2765 6.92947 16.5392 6.71015 16.8676C6.49083 17.1961 6.34406 17.5807 6.27812 18H7.78125C7.83811 17.7875 7.91436 17.5793 8.00737 17.3836C8.10038 17.1879 8.20963 17.0067 8.33255 16.8467C8.45548 16.6867 8.59109 16.5491 8.73685 16.4389C8.88262 16.3287 9.03709 16.2484 9.2 16.2C9.36291 16.1516 9.52738 16.1313 9.69231 16.1385C9.85724 16.1457 10.0199 16.1797 10.1775 16.239C10.3352 16.2984 10.4852 16.3819 10.6244 16.4877C10.7637 16.5935 10.8895 16.7198 11 16.8625V17H10.5ZM13.5 17L13.3373 16.7307C13.1542 16.4512 12.911 16.216 12.6058 16.0539C12.3006 15.8919 11.9373 15.8077 11.575 15.8125C11.2127 15.8173 10.8571 15.9142 10.5354 16.0953C10.2137 16.2765 9.92947 16.5392 9.71015 16.8676C9.49083 17.1961 9.34406 17.5807 9.27812 18H10.7812C10.8381 17.7875 10.9144 17.5793 11.0074 17.3836C11.1004 17.1879 11.2096 17.0067 11.3325 16.8467C11.4555 16.6867 11.5911 16.5491 11.7368 16.4389C11.8826 16.3287 12.0371 16.2484 12.2 16.2C12.3629 16.1516 12.5274 16.1313 12.6923 16.1385C12.8572 16.1457 13.0199 16.1797 13.1775 16.239C13.3352 16.2984 13.4852 16.3819 13.6244 16.4877C13.7637 16.5935 13.8895 16.7198 14 16.8625V17H13.5Z" fill="white"/>
                      <path d="M15.5 6.5C15.5 7.05229 15.0523 7.5 14.5 7.5C13.9477 7.5 13.5 7.05229 13.5 6.5C13.5 5.94772 13.9477 5.5 14.5 5.5C15.0523 5.5 15.5 5.94772 15.5 6.5Z" fill="white"/>
                      <path d="M14.5 10C15.0523 10 15.5 9.55229 15.5 9C15.5 8.44772 15.0523 8 14.5 8C13.9477 8 13.5 8.44772 13.5 9C13.5 9.55229 13.9477 10 14.5 10Z" fill="white"/>
                      <path d="M14.5 13.5C15.0523 13.5 15.5 13.0523 15.5 12.5C15.5 11.9477 15.0523 11.5 14.5 11.5C13.9477 11.5 13.5 11.9477 13.5 12.5C13.5 13.0523 13.9477 13.5 14.5 13.5Z" fill="white"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <div className="text-xs text-gray-300">Download on the</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </a>
                  <a 
                    href="https://upcore-init.oss-cn-shanghai.aliyuncs.com/appPackage/upcore_debug.apk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5 1H6.5C3.73858 1 1.5 3.23858 1.5 6V18C1.5 20.7614 3.73858 23 6.5 23H17.5C20.2614 23 22.5 20.7614 22.5 18V6C22.5 3.23858 20.2614 1 17.5 1ZM17.5 3C19.1569 3 20.5 4.34315 20.5 6V18C20.5 19.6569 19.1569 21 17.5 21H6.5C4.84315 21 3.5 19.6569 3.5 18V6C3.5 4.34315 4.84315 3 6.5 3H17.5Z" fill="white"/>
                      <path d="M16.5 8.5C16.5 8.08579 16.1142 7.7 15.7 7.7H8.3C7.88579 7.7 7.5 8.08579 7.5 8.5V15.5C7.5 15.9142 7.88579 16.3 8.3 16.3H15.7C16.1142 16.3 16.5 15.9142 16.5 15.5V8.5ZM15.5 15.5H8.5V8.5H15.5V15.5Z" fill="white"/>
                      <path d="M12 10C12.5523 10 13 10.4477 13 11V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V11C11 10.4477 11.4477 10 12 10Z" fill="white"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <div className="text-xs text-gray-300">Download</div>
                      <div className="font-semibold">Android</div>
                    </div>
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{t('app.version')}</span>
                  <span>•</span>
                  <span>{t('app.compatibility')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <button 
                    onClick={() => onNavigate('privacy')}
                    className="hover:text-blue-600 transition-colors duration-300 cursor-pointer"
                  >
                    隐私政策
                  </button>
                </div>
              </div>

              {/* Right side: Advanced App Gallery */}
              <div className="relative w-full max-w-md mx-auto">
                {/* 3D 旋转图片轮播 */}
            <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden">
              {/* 图片容器 */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* 轮播图片 */}
                <div className="relative w-full h-full">
                  {/* 图片列表 */}
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div 
                      key={index}
                      className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-0 transform scale-95"
                      style={{
                        animation: `appSlide ${5 * 2}s infinite ${index * 2}s`,
                        zIndex: 5 - index
                      }}
                    >
                      <img 
                        src={`/images/app/${index}.png`} 
                        alt={`溯洄APP 功能 ${index}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 手机边框效果 */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
            </div>
                
                {/* 装饰性元素 */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-purple-500 rounded-full opacity-20 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 -left-20 w-12 h-12 bg-pink-500 rounded-full opacity-10 blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                {/* 指示器 */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div 
                      key={index}
                      className="w-2 h-2 rounded-full bg-white/50 transition-all duration-500"
                      style={{
                        animation: `indicatorPulse ${5 * 2}s infinite ${index * 2}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AppPage;