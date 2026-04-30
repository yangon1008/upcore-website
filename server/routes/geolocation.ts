import express from 'express';
import axios from 'axios';

const router = express.Router();

// 获取用户IP并检测地理位置
router.get('/detect', async (req, res) => {
  try {
    console.log('========== IP地理位置检测 ==========');
    
    // 获取真实的客户端IP
    let clientIp = 
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.headers['x-real-ip']?.toString() ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    
    // 处理IPv6本地地址
    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
      clientIp = '127.0.0.1';
    }
    
    console.log('客户端IP:', clientIp);
    
    // 对于本地开发环境，默认使用中文
    if (clientIp === '127.0.0.1' || clientIp === 'localhost') {
      console.log('本地开发环境，默认中文');
      return res.json({
        ip: clientIp,
        country: 'CN',
        isChina: true,
        language: 'zh',
        fromCache: true,
        message: 'Local development environment'
      });
    }
    
    // 使用免费的IP地理定位API
    try {
      const response = await axios.get(`http://ip-api.com/json/${clientIp}`, {
        timeout: 5000
      });
      
      const data = response.data;
      console.log('IP-API响应:', data);
      
      if (data.status === 'fail') {
        throw new Error(data.message);
      }
      
      const isChina = data.countryCode === 'CN' || data.country === 'China';
      const language = isChina ? 'zh' : 'en';
      
      console.log('检测结果:', {
        country: data.countryCode,
        isChina,
        language
      });
      
      return res.json({
        ip: clientIp,
        country: data.countryCode,
        countryName: data.country,
        region: data.regionName,
        city: data.city,
        isChina,
        language,
        fromCache: false
      });
      
    } catch (apiError) {
      console.warn('IP-API调用失败，使用备用方案:', apiError);
      
      // 备用方案：使用另一个免费API
      try {
        const fallbackResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`, {
          timeout: 5000
        });
        
        const fallbackData = fallbackResponse.data;
        console.log('备用API响应:', fallbackData);
        
        const isChina = fallbackData.country_code === 'CN' || fallbackData.country_name === 'China';
        const language = isChina ? 'zh' : 'en';
        
        return res.json({
          ip: clientIp,
          country: fallbackData.country_code,
          countryName: fallbackData.country_name,
          region: fallbackData.region,
          city: fallbackData.city,
          isChina,
          language,
          fromCache: false
        });
        
      } catch (fallbackError) {
        console.warn('备用API也失败，使用默认中文:', fallbackError);
        
        // 如果所有API都失败，默认使用中文
        return res.json({
          ip: clientIp,
          country: 'CN',
          isChina: true,
          language: 'zh',
          fromCache: true,
          message: 'Geolocation API failed, defaulting to Chinese'
        });
      }
    }
    
  } catch (error) {
    console.error('IP检测错误:', error);
    
    // 出错时默认返回中文
    res.json({
      ip: 'unknown',
      country: 'CN',
      isChina: true,
      language: 'zh',
      fromCache: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 手动设置语言（用于测试）
router.post('/set-language', (req, res) => {
  const { language } = req.body;
  
  if (language !== 'zh' && language !== 'en') {
    return res.status(400).json({ error: 'Invalid language. Use zh or en.' });
  }
  
  res.json({
    success: true,
    language,
    message: `Language set to ${language}`
  });
});

export default router;