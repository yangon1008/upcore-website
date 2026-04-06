// 国际化工具

// 定义语言类型
export type Language = 'zh' | 'en';

// 翻译数据
export const translations = {
  zh: {
    // 导航栏
    nav: {
      home: '首页',
      support: '服务支持',
      about: '关于溯洄',
      shop: '商城',
      search: '搜索',
      menu: '菜单',
      close: '关闭'
    },
    // Hero部分
    hero: {
      flagship: '旗舰新品',
      professional: '旗舰新品',
      smart: '旗舰新品',
      hair: '护发科技',
      title1: 'AI智能牙刷',
      subtitle1: '开启口腔清洁3.0',
      description1: '懂刷牙，更懂健康。',
      title2: 'AI智能牙刷',
      subtitle2: '开启口腔清洁3.0',
      description2: '30秒全自动清洁，更是你每天的口腔医生。',
      title3: 'AI智能牙刷',
      subtitle3: '开启口腔清洁3.0',
      description3: '每一次刷牙，都是一次口腔体检',
      learnMore: '进一步了解',
      buyNow: '立即购买'
    },
    // 服务支持
    support: {
      title: '服务支持',
      welcome: '欢迎使用溯洄服务与支持',
      searchPlaceholder: '请输入您的问题或产品型号',
      searchButton: '查询',
      serviceTitle: '服务申请',
      serviceItems: {
        parts: '配件价格',
        partsDesc: '查看常见配件价格及服务',
        policy: '售后服务政策',
        policyDesc: '检测服务条款和维修政策细节',
        progress: '服务进度',
        progressDesc: '获取维修进度，追踪服务详情',
        device: '设备信息',
        deviceDesc: '查看设备信息及保修登记记录'
      },
      contactTitle: '联系我们',
      contactItems: {
        online: '在线客服',
        onlineDesc: '周一至周日 9:00-21:00 在线客服',
        phone: '热线服务',
        phoneDesc: '周一至周日 9:00-21:00 18154771933'
      },
      applyNow: '申请服务',
      contactOnline: '联系在线客服',
      morePhone: '更多客服电话'
    },
    // 产品信息
    products: {
      title: '探索我们的产品',
      description: '创新科技，卓越设计，为您带来无与伦比的使用体验',
      se: {
        name: 'AI 智能牙刷',
        desc: '30秒全自动清洁，更是你每天的口腔医生。',
        price: '¥ 299',
        features: [
          '智能感应技术',
          '3种清洁模式',
          'IPX7防水设计',
          '25天超长续航'
        ],
        specs: {
          size: '尺寸',
          sizeValue: '180 × 40 × 40 mm',
          weight: '重量',
          weightValue: '150 g',
          battery: '电池容量',
          batteryValue: '2000 mAh',
          chargeTime: '充电时间',
          chargeTimeValue: '3 小时'
        }
      },
      swift: {
        name: 'AI 智能牙刷',
        desc: '每一颗牙齿，都值得被读懂。',
        price: '¥ 1,299',
        badge: '旗舰版',
        features: [
          'AI智能分析',
          '5档温度调节',
          '360°旋转刷头',
          '智能恒温系统'
        ]
      },
      featuresTitle: '主要特性',
      specsTitle: '技术规格',
      buyNow: '立即购买',
      learnMore: '了解更多',
      viewDetails: '查看完整详情'
    },
    // 奖项与认可
    awards: {
      title: '备受认可的卓越设计',
      description: '我们的产品设计和技术创新获得了行业权威机构的认可，同时也赢得了用户的广泛赞誉',
      sectionTitle: '奖项与认可',
      testimonials: [
        {
          quote: '推出最紧凑、最智能的便携式洗碗机 LISSOME R1：彻底改变小空间的清洁方式',
          author: 'TechReview',
          role: '科技媒体'
        }
      ]
    },
    // 关于我们
    about: {
      title: '关于溯洄',
      subtitle: '溯洄 探索科技未来',
      description: '让用户在使用产品时体验到舒适便捷的功能，回到生活的本质，让科技服务于生活本身。',
      focus: '专注研发 · 技术 · 专业的高端洗护品类服务',
      values: {
        title: '核心价值观',
        self: '自产自研',
        selfDesc: '我们拥有独立的研发团队，结合专业的人员与设备，利用前沿科技为用户打造高质量的产品。',
        detail: '专注细节',
        detailDesc: '从产品设计到生产工艺，每一个细节都经过精心打磨，确保产品的品质与体验。',
        extreme: '探索极致',
        extremeDesc: '持续研发，不断创新，为用户带来更加智能、高效的产品体验。',
        solution: '提供优解',
        solutionDesc: '深入了解用户需求，提供个性化的解决方案，让科技真正服务于生活。'
      },
      timeline: {
        title: '发展历程',
        2019: '成立研发团队，专注于个人护理产品研发。',
        2020: '推出首款产品，获得市场良好反响。',
        2021: '销售额突破1000万元，用户满意度达98%。',
        2022: '完成A轮融资，金额1500万元。',
        2023: '拓展产品线，进军智能家居领域。',
        2024: '与多家知名企业达成合作，产品远销海外。',
        2025: '推出全新一代智能产品，获得多项技术专利。'
      }
    },
    // LISSOME洗碗机
    lissome: {
      slogan: '极简，更是不凡',
      title: 'LISSOME R1 台面式洗碗机，为现代厨房而生。',
      explore: '探索我们的产品',
      description: '创新科技，卓越设计，为您带来无与伦比的使用体验',
      designTitle: '备受认可的卓越设计',
      designDesc: '我们的产品设计和技术创新获得了行业权威机构的认可，同时也赢得了用户的广泛赞誉',
      awards: '奖项与认可'
    },
    // App下载
    app: {
      title: '溯洄APP',
      description: '溯洄APP是一款专为优化口腔护理体验设计的智能口腔健康管理应用。用户可通过APP连接siim电动牙刷，进行参数设置，查看刷牙数据，得到个性化的口腔建议，获取程度使用知识，构建专属的口腔护理全景图，全新升级的视觉界面，简洁清爽，支持更多型号智能牙刷型号，陪伴日常使用和管理的一站式服务窗口。做你身边的智能口腔健康管家。',
      feature1: '智能健康管理：结合智能牙刷等硬件，全面记录刷牙频次、时长、力度等数据',
      feature2: '健康页全面升级：通过详细的口腔健康数据分析，个性化AI建议实时为您提供口腔护理指引',
      feature3: '发现页全新上线：探索丰富的口腔健康知识、护理技巧和精选资讯',
      feature4: '一站式购物体验：在商城页选购优质的口腔护理产品，满足您日常所需',
      version: 'iOS V8.0.0',
      compatibility: 'Android V8.0.0'
    },
    // 页脚
    footer: {
      company: '关于溯洄',
      support: '服务支持',
      legal: '法律信息',
      social: '关注我们',
      copyright: '© 2025 Upcore 溯洄. 保留所有权利。',
      privacy: '隐私政策',
      terms: '使用条款',
      contact: '联系我们',
      email: 'contact@upcore.com',
      phone: '400-700-0303',
      address: '北京市朝阳区科技园区88号',
      // 页脚菜单项
      sections: {
        products: '热门产品',
        channels: '官方渠道',
        services: '服务支持',
        about: '关于溯洄'
      },
      // 产品链接
      products: {
        i2: 'AI 智能牙刷',
        se: 'AI 智能牙刷',
        swift: 'Swift 4 电吹风',
        lissome: 'LISSOME 洗碗机'
      },
      // 渠道链接
      channels: {
        shop: '溯洄商城',
        tmall: '天猫旗舰店',
        jd: '京东旗舰店'
      },
      // 服务链接
      services: {
        policy: '售后政策',
        authentic: '防伪查询',
        help: '帮助中心',
        download: '软件下载'
      },
      // 关于链接
      aboutLinks: {
        story: '品牌故事',
        join: '加入我们',
        global: '全球业务',
        sustainable: '可持续发展'
      },
      // 其他文本
      slogan: '创新，只为更好的你。',
      intro: '溯洄成立于2021年，致力于通过科技创新重新定义个人护理与家庭生活方式。每一个产品都是对美学与功能的极致追求。',
      // 底部链接
      bottomLinks: {
        privacy: '隐私政策',
        legal: '法律声明',
        icp: '浙ICP备2025216907号-2'
      },
      // 语言选择
      languages: {
        china: 'CHINA (CN)',
        english: 'ENGLISH'
      }
    }
  },
  en: {
    // 导航栏
    nav: {
      home: 'Home',
      support: 'Support',
      about: 'About',
      shop: 'Shop',
      search: 'Search',
      menu: 'Menu',
      close: 'Close'
    },
    // Hero部分
    hero: {
      flagship: 'Flagship Release',
      professional: 'Professional Care',
      smart: 'Smart Technology',
      hair: 'Hair Care Tech',
      title1: 'AI Smart Toothbrush',
      subtitle1: 'Opening Oral Cleaning 3.0',
      description1: 'Know Brushing. Know Health.',
      title2: 'AI Smart Toothbrush',
      subtitle2: 'Opening Oral Cleaning 3.0',
      description2: '30 second fully automatic cleaning is your daily dentist.',
      title3: 'AI Smart Toothbrush',
      subtitle3: 'Opening Oral Cleaning 3.0',
      description3: 'Every time you brush your teeth, it\'s a dental check-uptime.',
      learnMore: 'Learn More',
      buyNow: 'Buy Now'
    },
    // 服务支持
    support: {
      title: 'Support',
      welcome: 'Welcome to Upcore Support',
      searchPlaceholder: 'Please enter your question or product model',
      searchButton: 'Search',
      serviceTitle: 'Service Request',
      serviceItems: {
        parts: 'Parts Price',
        partsDesc: 'Check common parts prices and services',
        policy: 'After-sales Policy',
        policyDesc: 'Check service terms and repair policy details',
        progress: 'Service Progress',
        progressDesc: 'Get repair progress and track service details',
        device: 'Device Info',
        deviceDesc: 'View device information and warranty registration records'
      },
      contactTitle: 'Contact Us',
      contactItems: {
        online: 'Online Support',
        onlineDesc: 'Mon-Sun 9:00-21:00 Online Support',
        phone: 'Hotline Service',
        phoneDesc: 'Mon-Sun 9:00-21:00 400-700-0303'
      },
      applyNow: 'Apply Now',
      contactOnline: 'Contact Online Support',
      morePhone: 'More Phone Support'
    },
    // 产品信息
    products: {
      title: 'Explore Our Products',
      description: 'Innovative technology, exceptional design, bringing you an unparalleled user experience',
      se: {
        name: 'AI Smart Toothbrush',
        desc: '30 second fully automatic cleaning is your daily dentist.',
        price: '¥ 299',
        features: [
          'Intelligent sensing technology',
          '3 cleaning modes',
          'IPX7 waterproof design',
          '25-day long battery life'
        ],
        specs: {
          size: 'Size',
          sizeValue: '180 × 40 × 40 mm',
          weight: 'Weight',
          weightValue: '150 g',
          battery: 'Battery Capacity',
          batteryValue: '2000 mAh',
          chargeTime: 'Charging Time',
          chargeTimeValue: '3 hours'
        }
      },
      swift: {
        name: 'AI Smart Toothbrush',
        desc: 'Every tooth is worth reading.',
        price: '¥ 1,299',
        badge: 'Flagship',
        features: [
          'AI intelligent analysis',
          '5 temperature settings',
          '360° rotating brush head',
          'Intelligent constant temperature system'
        ]
      },
      featuresTitle: 'Key Features',
      specsTitle: 'Technical Specifications',
      buyNow: 'Buy Now',
      learnMore: 'Learn More',
      viewDetails: 'View Full Details'
    },
    // 奖项与认可
    awards: {
      title: 'Acclaimed Exceptional Design',
      description: 'Our product design and technological innovations have been recognized by industry authorities and widely praised by users',
      sectionTitle: 'Awards & Recognition',
      testimonials: [
        {
          quote: 'Introducing the most compact and intelligent portable dishwasher, LISSOME R1: revolutionizing cleaning in small spaces',
          author: 'TechReview',
          role: 'Technology Media'
        }
      ]
    },
    // 关于我们
    about: {
      title: 'About Us',
      subtitle: 'Upcore Exploring Tech Future',
      description: 'Let users experience comfortable and convenient functions when using products, returning to the essence of life, making technology serve life itself.',
      focus: 'Focus on R&D · Technology · Professional high-end care product services',
      values: {
        title: 'Core Values',
        self: 'Self-developed',
        selfDesc: 'We have an independent R&D team, combining professional personnel and equipment, using cutting-edge technology to create high-quality products for users.',
        detail: 'Focus on Details',
        detailDesc: 'Every detail from product design to production process is carefully polished to ensure product quality and experience.',
        extreme: 'Explore Perfection',
        extremeDesc: 'Continuous R&D, constant innovation, bringing users more intelligent and efficient product experiences.',
        solution: 'Provide Optimal Solutions',
        solutionDesc: 'Deeply understand user needs, provide personalized solutions, making technology truly serve life.'
      },
      timeline: {
        title: 'Development History',
        2019: 'Founded R&D team, focusing on personal care product research and development.',
        2020: 'Launched first product, received good market response.',
        2021: 'Sales exceeded 10 million yuan, user satisfaction reached 98%.',
        2022: 'Completed Series A financing of 15 million yuan.',
        2023: 'Expanded product line, entered smart home field.',
        2024: 'Established cooperation with many well-known enterprises, products sold overseas.',
        2025: 'Launched new generation of smart products, obtained multiple technology patents.'
      }
    },
    // LISSOME洗碗机
    lissome: {
      slogan: 'Minimalism Extraordinary',
      title: 'LISSOME R1 Countertop Dishwasher, Born for Modern Kitchens.',
      explore: 'Explore Our Products',
      description: 'Innovative Technology, Exceptional Design, Bringing You an Unparalleled User Experience',
      designTitle: 'Acclaimed Exceptional Design',
      designDesc: 'Our product design and technological innovations have been recognized by industry authorities and widely praised by users',
      awards: 'Awards & Recognition'
    },
    // App下载
    app: {
      title: 'SmilePlus APP',
      description: 'SmilePlus APP is developed by Guangzhou Stars Pulse Co., Ltd. under the Flumie SmilePlus brand. It is an intelligent oral health management application designed to optimize oral care experience. Users can connect to siim electric toothbrushes through the APP, adjust parameters, view brushing data, receive personalized oral care recommendations, acquire usage knowledge, build a comprehensive oral care profile, and enjoy a newly upgraded visual interface that is clean and refreshing. It supports more smart toothbrush models and serves as a one-stop service window for daily use and management. SmilePlus APP, your intelligent oral health companion by your side.',
      feature1: 'Intelligent Health Management: Combined with SmilePlus smart toothbrushes and other hardware, comprehensively records brushing frequency, duration, intensity and other data',
      feature2: 'Health Page Fully Upgraded: Provides real-time oral care guidance through detailed oral health data analysis and personalized AI recommendations',
      feature3: 'Discover Page Newly Launched: Explore rich oral health knowledge, care tips and selected information',
      feature4: 'One-stop Shopping Experience: Purchase high-quality oral care products in the mall page to meet your daily needs',
      version: 'iOS V8.0.0',
      compatibility: 'Android V8.0.0'
    },
    // 页脚
    footer: {
      company: 'About Upcore',
      support: 'Support',
      legal: 'Legal',
      social: 'Follow Us',
      copyright: '© 2025 Upcore. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact Us',
      email: 'contact@upcore.com',
      phone: '400-700-0303',
      address: '88 Technology Park, Chaoyang District, Beijing',
      // 页脚菜单项
      sections: {
        products: 'Hot Products',
        channels: 'Official Channels',
        services: 'Service Support',
        about: 'About Upcore'
      },
      // 产品链接
      products: {
        i2: 'AI Smart Toothbrush',
        se: 'AI Smart Toothbrush',
        swift: 'Swift 4 Hair Dryer',
        lissome: 'LISSOME Dishwasher'
      },
      // 渠道链接
      channels: {
        shop: 'Upcore Shop',
        tmall: 'Tmall Flagship Store',
        jd: 'JD Flagship Store'
      },
      // 服务链接
      services: {
        policy: 'After-sales Policy',
        authentic: 'Anti-counterfeit Query',
        help: 'Help Center',
        download: 'Software Download'
      },
      // 关于链接
      aboutLinks: {
        story: 'Brand Story',
        join: 'Join Us',
        global: 'Global Business',
        sustainable: 'Sustainability'
      },
      // 其他文本
      slogan: 'Innovation, just for a better you.',
      intro: 'Founded in 2021, Upcore is committed to redefining personal care and home lifestyle through technological innovation. Every product is the ultimate pursuit of aesthetics and functionality.',
      // 底部链接
      bottomLinks: {
        privacy: 'Privacy Policy',
        legal: 'Legal Statement',
        icp: 'Zhejiang ICP No. 2025216907-2'
      },
      // 语言选择
      languages: {
        china: 'CHINA (CN)',
        english: 'ENGLISH'
      }
    }
  }
};

// 获取翻译
export const t = (key: string, lang: Language = 'zh'): any => {
  // 分割键路径
  const keys = key.split('.');
  let result: any = translations[lang];
  
  // 遍历键路径获取翻译
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      return key; // 如果找不到翻译，返回原始键
    }
  }
  
  return result;
};

// 翻译工具类
class I18n {
  private lang: Language;
  
  constructor(lang: Language = 'zh') {
    this.lang = lang;
  }
  
  setLanguage(lang: Language) {
    this.lang = lang;
  }
  
  getLanguage() {
    return this.lang;
  }
  
  t(key: string): any {
    return t(key, this.lang);
  }
}

// 创建单例实例
export const i18n = new I18n();
