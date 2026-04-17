# upcore_website 数据库表结构说明

## 数据库概述
- 数据库名：upcore_website
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci

## 表列表

### 1. invitation_codes - 邀请码表
用于存储管理员生成的邀请码信息，以及邀请码的使用情况，包括职位信息和文件信息。

| 字段名 | 类型 | 空 | 键 | 默认值 | 说明 |
|--------|------|----|----|--------|------|
| id | int | NO | PRI | auto_increment | 主键ID |
| code | varchar(20) | NO | UNI | | 邀请码 |
| admin_user_id | varchar(100) | NO | MUL | | 生成该邀请码的管理员ID |
| admin_user_name | varchar(100) | NO | | | 管理员名称 |
| created_at | datetime | NO | | CURRENT_TIMESTAMP | 创建时间 |
| expires_at | datetime | NO | MUL | | 过期时间 |
| is_used | tinyint(1) | YES | | 0 | 是否已使用 |
| used_by | varchar(100) | YES | | | 使用者用户ID |
| used_by_name | varchar(100) | YES | | | 使用者姓名 |
| used_at | datetime | YES | | | 使用时间 |
| used_by_gender | varchar(10) | YES | | | 使用者性别 |
| used_by_age | varchar(10) | YES | | | 使用者年龄 |
| used_by_phone | varchar(20) | YES | | | 使用者手机号 |
| used_by_introduction | text | YES | | | 使用者个人介绍 |
| used_by_file | varchar(500) | YES | | | 使用者文件 |
| job_position_id | int | YES | | | 面试岗位ID |
| job_position_name | varchar(100) | YES | | | 面试岗位名称 |

**索引：**
- idx_code (code)
- idx_admin (admin_user_id)
- idx_expires (expires_at)

---

### 2. admin_slots - 管理员可预约时段表
用于存储管理员设置的可预约时间段，支持每周重复和特定日期两种类型。

| 字段名 | 类型 | 空 | 键 | 默认值 | 说明 |
|--------|------|----|----|--------|------|
| id | int | NO | PRI | auto_increment | 主键ID |
| admin_user_id | varchar(100) | NO | MUL | | 管理员ID |
| slot_type | enum('regular','specific') | NO | | | regular=每周重复, specific=特定日期 |
| day_of_week | tinyint | YES | | | 周几 0-6 (仅regular类型) |
| slot_date | date | YES | MUL | | 具体日期 (仅specific类型) |
| start_time | time | NO | | | 开始时间 HH:mm |
| end_time | time | NO | | | 结束时间 HH:mm |
| is_active | tinyint(1) | YES | | 1 | 是否启用 |
| created_at | datetime | YES | | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- idx_admin (admin_user_id)
- idx_date (slot_date)

---

### 3. job_positions - 面试岗位表
用于存储面试岗位信息。

| 字段名 | 类型 | 空 | 键 | 默认值 | 说明 |
|--------|------|----|----|--------|------|
| id | int | NO | PRI | auto_increment | 主键ID |
| admin_user_id | varchar(100) | NO | MUL | | 管理员ID |
| position_name | varchar(100) | NO | | | 岗位名称 |
| description | text | YES | | | 岗位描述 |
| is_active | tinyint(1) | YES | | 1 | 是否启用 |
| created_at | datetime | YES | | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- idx_admin (admin_user_id)

---

### 4. bookings - 预约记录表
用于存储用户与管理员的预约记录，包含飞书会议链接等信息。

| 字段名 | 类型 | 空 | 键 | 默认值 | 说明 |
|--------|------|----|----|--------|------|
| id | int | NO | PRI | auto_increment | 主键ID |
| admin_user_id | varchar(100) | NO | MUL | | 管理员ID |
| admin_user_name | varchar(100) | NO | | | 管理员名称 |
| regular_user_id | varchar(100) | NO | MUL | | 普通用户ID |
| regular_user_name | varchar(100) | NO | | | 普通用户姓名 |
| invitation_code | varchar(20) | NO | | | 使用的邀请码 |
| job_position_id | int | YES | MUL | | 面试岗位ID |
| job_position_name | varchar(100) | YES | | | 面试岗位名称 |
| booking_date | date | NO | MUL | | 预约日期 |
| start_time | time | NO | | | 开始时间 |
| end_time | time | NO | | | 结束时间 |
| feishu_event_id | varchar(100) | YES | | | 飞书日程ID |
| feishu_meeting_url | varchar(500) | YES | | | 飞书会议链接 |
| status | enum('confirmed','cancelled') | YES | | confirmed | 状态 |
| created_at | datetime | YES | | CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- idx_admin (admin_user_id)
- idx_regular (regular_user_id)
- idx_date (booking_date)
- idx_job_position (job_position_id)

---

### 5. user_info - 用户信息表
用于存储所有用户的基本信息（登录类型只有飞书一种）。

| 字段名 | 类型 | 空 | 键 | 默认值 | 说明 |
|--------|------|----|----|--------|------|
| id | int | NO | PRI | auto_increment | 主键ID |
| user_id | varchar(100) | NO | UNI | | 用户ID |
| name | varchar(100) | NO | | | 用户姓名 |
| gender | varchar(10) | YES | | | 性别 |
| age | varchar(10) | YES | | | 年龄 |
| phone | varchar(20) | YES | | | 手机号 |
| avatar_url | varchar(500) | YES | | | 头像URL |
| created_at | datetime | YES | | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | datetime | YES | | CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP | 更新时间 |
| feishu_user_access_token | text | YES | | | 飞书用户访问令牌 |
| feishu_user_refresh_token | text | YES | | | 飞书用户刷新令牌 |
| feishu_token_expires_at | datetime | YES | | | 飞书令牌过期时间 |

**索引：**
- idx_user_id (user_id)

---

## 表关系图

```
invitation_codes
    └── admin_user_id (关联 admin_slots, job_positions, bookings, user_info)

admin_slots
    └── admin_user_id

job_positions
    └── admin_user_id

bookings
    ├── admin_user_id
    ├── regular_user_id (关联 user_info)
    ├── invitation_code (关联 invitation_codes)
    └── job_position_id (关联 job_positions)

user_info
    └── user_id (被其他表引用)
```

## 数据结构变更说明

### invitation_codes 表变更
- ✅ 将 `used_by_resume`、`used_by_video`、`used_by_website` 合并为 `used_by_file`
- ✅ 添加 `job_position_id` 字段
- ✅ 添加 `job_position_name` 字段

### user_info 表变更
- ✅ 删除 `user_type` 字段（登录类型只有飞书一种）
- ✅ 删除 `job_position_id` 字段
- ✅ 删除 `job_position_name` 字段
- ✅ 删除 `introduction` 字段
- ✅ 删除 `files` 字段

### 数据迁移说明
- 职位信息、文件信息、个人介绍现在存储在 `invitation_codes` 表中
- `user_info` 表只存储用户基本信息
- 新增 API：`PUT /api/invitation-codes/:code/info` 用于更新邀请码的详细信息
