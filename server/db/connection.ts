import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env.server') });

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'upcore_website',
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initializeDatabase() {
  const dbName = process.env.DB_NAME || 'upcore_website';
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${dbName}\``);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS invitation_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE COMMENT '邀请码',
        admin_user_id VARCHAR(100) NOT NULL COMMENT '生成该邀请码的管理员ID',
        admin_user_name VARCHAR(100) NOT NULL COMMENT '管理员名称',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        expires_at DATETIME NOT NULL COMMENT '过期时间',
        is_used TINYINT(1) DEFAULT 0 COMMENT '是否已使用',
        used_by VARCHAR(100) DEFAULT NULL COMMENT '使用者用户ID',
        used_by_name VARCHAR(100) DEFAULT NULL COMMENT '使用者姓名',
        used_by_gender VARCHAR(10) DEFAULT NULL COMMENT '使用者性别',
        used_by_age VARCHAR(10) DEFAULT NULL COMMENT '使用者年龄',
        used_by_phone VARCHAR(20) DEFAULT NULL COMMENT '使用者手机号',
        used_at DATETIME DEFAULT NULL COMMENT '使用时间',
        INDEX idx_code (code),
        INDEX idx_admin (admin_user_id),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邀请码表'
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_user_id VARCHAR(100) NOT NULL COMMENT '管理员ID',
        slot_type ENUM('regular', 'specific') NOT NULL COMMENT 'regular=每周重复, specific=特定日期',
        day_of_week TINYINT DEFAULT NULL COMMENT '周几 0-6 (仅regular类型)',
        slot_date DATE DEFAULT NULL COMMENT '具体日期 (仅specific类型)',
        start_time TIME NOT NULL COMMENT '开始时间 HH:mm',
        end_time TIME NOT NULL COMMENT '结束时间 HH:mm',
        is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin (admin_user_id),
        INDEX idx_date (slot_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员可预约时段表'
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS job_positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_user_id VARCHAR(100) NOT NULL COMMENT '管理员ID',
        position_name VARCHAR(100) NOT NULL COMMENT '岗位名称',
        description TEXT DEFAULT NULL COMMENT '岗位描述',
        is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin (admin_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面试岗位表'
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_user_id VARCHAR(100) NOT NULL COMMENT '管理员ID',
        admin_user_name VARCHAR(100) NOT NULL COMMENT '管理员名称',
        regular_user_id VARCHAR(100) NOT NULL COMMENT '普通用户ID',
        regular_user_name VARCHAR(100) NOT NULL COMMENT '普通用户姓名',
        invitation_code VARCHAR(20) NOT NULL COMMENT '使用的邀请码',
        job_position_id INT DEFAULT NULL COMMENT '面试岗位ID',
        job_position_name VARCHAR(100) DEFAULT NULL COMMENT '面试岗位名称',
        booking_date DATE NOT NULL COMMENT '预约日期',
        start_time TIME NOT NULL COMMENT '开始时间',
        end_time TIME NOT NULL COMMENT '结束时间',
        feishu_event_id VARCHAR(100) DEFAULT NULL COMMENT '飞书日程ID',
        feishu_meeting_url VARCHAR(500) DEFAULT NULL COMMENT '飞书会议链接',
        status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed' COMMENT '状态',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin (admin_user_id),
        INDEX idx_regular (regular_user_id),
        INDEX idx_date (booking_date),
        INDEX idx_job_position (job_position_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约记录表'
    `);
    await conn.query(
      'ALTER TABLE bookings DROP INDEX IF EXISTS uk_admin_date_time'
    ).catch(() => {});
    await conn.query(
      'ALTER TABLE bookings DROP INDEX IF EXISTS uk_admin_date_time_confirmed'
    ).catch(() => {});
    console.log(`✅ 数据库 ${dbName} 初始化完成`);
  } finally {
    conn.release();
  }
}
