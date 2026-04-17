const API_BASE = '/api';
const CODES_BASE = `${API_BASE}/invitation-codes`;
const SLOTS_BASE = `${API_BASE}/slots`;
const BOOKINGS_BASE = `${API_BASE}/bookings`;
const FEISHU_BASE = `${API_BASE}/feishu`;
const JOB_POSITIONS_BASE = `${API_BASE}/job-positions`;
const USERS_BASE = `${API_BASE}/users`;

export interface InvitationCodeData {
  id?: number;
  code: string;
  createdAt: string;
  expiresAt: string;
  isUsed?: boolean;
  usedByName?: string;
}

export interface VerifyResult {
  valid: boolean;
  codeInfo: {
    code: string;
    adminUserId: string;
    adminUserName: string;
    expiresAt: string;
  };
  userId: string;
}

export interface SlotData {
  id?: number;
  slotType: 'regular' | 'specific';
  dayOfWeek?: number;
  slotDate?: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface AvailableSlotData {
  id: number;
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  displayDate: string;
  isBooked?: boolean;
  bookedByName?: string | null;
}

export interface BookingData {
  id: number;
  regularUserName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  feishuMeetingUrl: string | null;
  status: string;
  createdAt: string;
  gender?: string;
  age?: string;
  phone?: string;
  files?: any[];
  introduction?: string;
  jobPositionName?: string;
}

export interface CreateBookingResult {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  feishuEventId: string | null;
  feishuMeetingUrl: string | null;
}

export interface UserBookingData {
  id: number;
  adminUserName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  feishuMeetingUrl: string | null;
  status: string;
  createdAt: string;
}

export interface JobPositionData {
  id: number;
  positionName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserInfoData {
  id?: number;
  userId: string;
  name: string;
  gender?: string;
  age?: string;
  phone?: string;
  jobPositionId?: number;
  jobPositionName?: string;
  introduction?: string;
  files?: any[];
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function generateCode(adminUserId: string, adminUserName: string, expireDays: number = 7): Promise<InvitationCodeData> {
  const res = await fetch(CODES_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminUserId, adminUserName, expireDays })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '生成邀请码失败');
  return data.data;
}

export async function getCodes(adminUserId: string): Promise<InvitationCodeData[]> {
  const res = await fetch(`${CODES_BASE}?adminUserId=${encodeURIComponent(adminUserId)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取邀请码列表失败');
  return data.data;
}

export async function verifyCode(code: string, userName: string): Promise<VerifyResult> {
  const res = await fetch(`${CODES_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, userName })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '邀请码验证失败');
  return data.data;
}

export async function updateInvitationCodeInfo(
  code: string,
  data: {
    jobPositionId?: number;
    jobPositionName?: string;
    usedByFiles?: any[];
    usedByIntroduction?: string;
    usedByGender?: string;
    usedByAge?: string;
    usedByPhone?: string;
  }
): Promise<void> {
  const res = await fetch(`${CODES_BASE}/${code}/info`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || '更新邀请码信息失败');
}

export async function getInvitationCodeUserInfo(code: string): Promise<UserInfoData | null> {
  const res = await fetch(`${CODES_BASE}/${encodeURIComponent(code)}/user-info`);
  const data = await res.json();
  if (!data.success) return null;
  return data.userInfo;
}

export async function getUserInfoFromInvitationCode(userId: string): Promise<UserInfoData | null> {
  const res = await fetch(`${CODES_BASE}/user/${encodeURIComponent(userId)}`);
  const data = await res.json();
  if (!data.success) return null;
  return data.userInfo;
}

export async function getAdminSlots(adminUserId: string): Promise<SlotData[]> {
  const res = await fetch(`${SLOTS_BASE}?adminUserId=${encodeURIComponent(adminUserId)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取时段列表失败');
  return data.data;
}

export async function saveSlot(slot: Omit<SlotData, 'id'> & { adminUserId: string }): Promise<{ id: number }> {
  const res = await fetch(SLOTS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slot)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '保存时段失败');
  return data.data;
}

export async function updateSlot(id: number, slot: Partial<SlotData>): Promise<void> {
  const res = await fetch(`${SLOTS_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slot)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '更新时段失败');
}

export async function deleteSlot(id: number): Promise<void> {
  const res = await fetch(`${SLOTS_BASE}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '删除时段失败');
}

export async function getAvailableSlots(adminUserId: string): Promise<AvailableSlotData[]> {
  const res = await fetch(`${SLOTS_BASE}/available?adminUserId=${encodeURIComponent(adminUserId)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取可用时段失败');
  return data.data;
}

export async function createBooking(booking: {
  adminUserId: string;
  adminUserName?: string;
  regularUserId: string;
  regularUserName: string;
  invitationCode: string;
  jobPositionId?: number;
  jobPositionName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  calendarId?: string;
  color?: string;
  files?: any[];
}): Promise<CreateBookingResult> {
  const res = await fetch(BOOKINGS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '创建预约失败');
  return data.data;
}

export async function getBookings(adminUserId: string): Promise<BookingData[]> {
  const res = await fetch(`${BOOKINGS_BASE}?adminUserId=${encodeURIComponent(adminUserId)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取预约列表失败');
  return data.data;
}

export async function cancelBooking(bookingId: number): Promise<void> {
  const res = await fetch(`${BOOKINGS_BASE}/${bookingId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '取消预约失败');
}

export async function getUserBooking(regularUserId: string): Promise<UserBookingData | null> {
  const res = await fetch(`${BOOKINGS_BASE}?regularUserId=${encodeURIComponent(regularUserId)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取预约信息失败');
  const bookings = data.data as UserBookingData[];
  return bookings.length > 0 ? bookings[0] : null;
}

export async function getJobPositions(adminUserId: string): Promise<JobPositionData[]> {
  const res = await fetch(`${JOB_POSITIONS_BASE}?adminUserId=${encodeURIComponent(adminUserId)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取岗位列表失败');
  return data.data;
}

export async function createJobPosition(adminUserId: string, positionName: string, description: string = ''): Promise<JobPositionData> {
  const res = await fetch(JOB_POSITIONS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminUserId, positionName, description })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '创建岗位失败');
  return data.data;
}

export async function updateJobPosition(id: number, positionName: string, description: string = '', isActive: boolean = true): Promise<void> {
  const res = await fetch(`${JOB_POSITIONS_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positionName, description, isActive })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '更新岗位失败');
}

export async function deleteJobPosition(id: number): Promise<void> {
  const res = await fetch(`${JOB_POSITIONS_BASE}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '删除岗位失败');
}

export interface CalendarData {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: {
    access_role: string;
  };
}

export interface AttendeeData {
  id: string;
  type: 'user' | 'room';
  status: 'needs_action' | 'accepted' | 'declined' | 'tentative';
}

export async function createCalendar(name: string, description: string = '', color: string = '#52c41a'): Promise<CalendarData> {
  const res = await fetch(`${FEISHU_BASE}/calendars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, color })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '创建日历失败');
  return data.data;
}

export async function getCalendars(): Promise<CalendarData[]> {
  const res = await fetch(`${FEISHU_BASE}/calendars`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取日历列表失败');
  return data.data;
}

export async function updateCalendar(calendarId: string, updates: Partial<CalendarData>): Promise<CalendarData> {
  const res = await fetch(`${FEISHU_BASE}/calendars/${calendarId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '更新日历失败');
  return data.data;
}

export async function deleteCalendar(calendarId: string): Promise<void> {
  const res = await fetch(`${FEISHU_BASE}/calendars/${calendarId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '删除日历失败');
}

export async function addEventAttendees(eventId: string, calendarId: string, attendees: Array<{
  id: string;
  type: 'user' | 'room';
  status?: 'needs_action' | 'accepted' | 'declined' | 'tentative';
}>): Promise<AttendeeData[]> {
  const res = await fetch(`${FEISHU_BASE}/events/${eventId}/attendees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendarId, attendees })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '添加日程参与人失败');
  return data.data;
}

// 用户信息相关 API
export async function getUserInfo(userId: string): Promise<UserInfoData | null> {
  const res = await fetch(`${USERS_BASE}/${encodeURIComponent(userId)}`);
  const data = await res.json();
  if (!data.success) return null;
  return data.userInfo;
}

export async function saveUserInfo(userInfo: UserInfoData): Promise<void> {
  const res = await fetch(`${USERS_BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userInfo.userId,
      name: userInfo.name,
      gender: userInfo.gender,
      age: userInfo.age,
      phone: userInfo.phone,
      avatarUrl: userInfo.avatarUrl
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '保存用户信息失败');
}

export async function saveFeishuToken(userId: string, accessToken: string, refreshToken?: string, expiresIn?: number, name?: string, avatarUrl?: string, mobile?: string, email?: string): Promise<void> {
  const res = await fetch(`${USERS_BASE}/save-feishu-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      accessToken,
      refreshToken,
      expiresIn,
      name,
      avatarUrl,
      mobile,
      email
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '保存飞书令牌失败');
}

export async function getFeishuToken(userId: string): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
} | null> {
  const res = await fetch(`${USERS_BASE}/${encodeURIComponent(userId)}/feishu-token`);
  const data = await res.json();
  if (!data.success) return null;
  return data.tokenInfo;
}
