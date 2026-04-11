import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.server') });

async function fixDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'upcore_website',
    multipleStatements: true
  });

  try {
    console.log('正在删除旧的唯一约束...');
    
    await pool.query(`
      ALTER TABLE bookings DROP INDEX IF EXISTS uk_admin_date_time;
    `).catch(err => console.log('索引 uk_admin_date_time 不存在或已删除'));
    
    await pool.query(`
      ALTER TABLE bookings DROP INDEX IF EXISTS uk_admin_date_time_confirmed;
    `).catch(err => console.log('索引 uk_admin_date_time_confirmed 不存在或已删除'));
    
    console.log('✅ 数据库修复完成！');
    console.log('现在取消预约后的时间段可以被其他用户预约了。');
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase();
