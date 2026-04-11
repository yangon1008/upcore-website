import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { feishuService, FeishuUser } from '../utils/feishu';
import { generateCode, getCodes, getAdminSlots, saveSlot, updateSlot, deleteSlot, getJobPositions, createJobPosition, updateJobPosition, deleteJobPosition, InvitationCodeData, SlotData, JobPositionData } from '../utils/database';

interface AdminPanelProps {
  user: FeishuUser & { type?: 'feishu' };
  onRefresh?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onRefresh }) => {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCodeData[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPositionData[]>([]);
  const [showAllCodes, setShowAllCodes] = useState(false);
  const [expireDays, setExpireDays] = useState(7);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionDescription, setNewPositionDescription] = useState('');

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [codes, slotsData, positionsData] = await Promise.all([
        getCodes(user.user_id),
        getAdminSlots(user.user_id),
        getJobPositions(user.user_id)
      ]);
      setInvitationCodes(codes);
      setSlots(slotsData);
      setJobPositions(positionsData);
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.user_id]);

  useEffect(() => {
    if (onRefresh) {
      // 保存原始 onRefresh 引用
      const originalOnRefresh = onRefresh;
      // 重写 onRefresh 来调用我们的 loadData
      (window as any).adminPanelRefresh = loadData;
    }
  }, [onRefresh]);

  const regularSlots = slots.filter(s => s.slotType === 'regular');
  const specificSlots = slots.filter(s => s.slotType === 'specific');

  const generateInvitationCode = async () => {
    try {
      const newCode = await generateCode(user.user_id, user.name, expireDays);
      setInvitationCodes([newCode, ...invitationCodes]);
    } catch (err: any) {
      alert('生成邀请码失败: ' + (err.message || '未知错误'));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expire = new Date(expiresAt);
    return Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const slot of slots) {
        if (slot.id) {
          await updateSlot(slot.id, slot);
        } else {
          await saveSlot({ ...slot, adminUserId: user.user_id });
        }
      }
      const fresh = await getAdminSlots(user.user_id);
      setSlots(fresh);
      alert(t('interview.save') + '成功');
    } catch (err: any) {
      alert('保存失败: ' + (err.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const addRegularSlot = () => {
    setSlots([...slots, { slotType: 'regular', dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }]);
  };

  const addSpecificSlot = () => {
    setSlots([...slots, { slotType: 'specific', slotDate: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00' }]);
  };

  const removeSlot = async (slot: SlotData) => {
    if (!slot.id) {
      setSlots(slots.filter(s => s !== slot));
      return;
    }
    try {
      await deleteSlot(slot.id);
      setSlots(slots.filter(s => s.id !== slot.id));
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

  const updateSlotLocal = (index: number, updates: Partial<SlotData>) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], ...updates };
    setSlots(newSlots);
  };

  const displayedCodes = showAllCodes ? invitationCodes : invitationCodes.slice(0, 1);
  const hasMoreCodes = invitationCodes.length > 1;

  const handleAddPosition = async () => {
    if (!newPositionName.trim()) {
      alert('请输入岗位名称');
      return;
    }
    try {
      await createJobPosition(user.user_id, newPositionName, newPositionDescription);
      await loadData();
      setNewPositionName('');
      setNewPositionDescription('');
      alert('岗位添加成功');
    } catch (err: any) {
      alert('添加岗位失败: ' + (err.message || '未知错误'));
    }
  };

  const handleUpdatePosition = async (position: JobPositionData) => {
    try {
      await updateJobPosition(position.id, position.positionName, position.description, position.isActive);
      alert('岗位更新成功');
    } catch (err: any) {
      alert('更新岗位失败: ' + (err.message || '未知错误'));
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (window.confirm('确定要删除这个岗位吗？')) {
      try {
        await deleteJobPosition(positionId);
        setJobPositions(jobPositions.filter(p => p.id !== positionId));
        alert('岗位删除成功');
      } catch (err: any) {
        alert('删除岗位失败: ' + (err.message || '未知错误'));
      }
    }
  };

  const updatePositionLocal = (id: number, updates: Partial<JobPositionData>) => {
    setJobPositions(jobPositions.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 p-4 rounded-md space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">邀请码管理</label>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">过期时间：</label>
            <input type="number" value={expireDays} onChange={(e) => setExpireDays(Math.max(1, parseInt(e.target.value) || 7))} className="w-20 border border-gray-300 rounded-md p-1 text-sm" min="1" />
            <span className="text-sm text-gray-600">天</span>
          </div>
          <button onClick={generateInvitationCode} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">生成邀请码</button>
        </div>

        {invitationCodes.length > 0 && (
          <div className="space-y-3">
            {hasMoreCodes && (
              <button onClick={() => setShowAllCodes(!showAllCodes)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                <svg className={`w-4 h-4 transition-transform ${showAllCodes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                <span>{showAllCodes ? '收起历史邀请码' : `查看更多 ${invitationCodes.length - 1} 个邀请码`}</span>
              </button>
            )}
            {displayedCodes.map((codeItem, index) => (
              <div key={index} className="bg-white p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <code className="text-lg font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">{codeItem.code}</code>
                    <button onClick={() => copyCode(codeItem.code)} className="text-gray-500 hover:text-blue-600 transition-colors">
                      {copiedCode === codeItem.code ? <span className="text-green-600 text-sm">已复制!</span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 00-2-2h-8a2 2 0 002 2z" /></svg>}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {codeItem.isUsed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">已使用</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">未使用</span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>有效时间：{formatDate(codeItem.createdAt)} - {formatDate(codeItem.expiresAt)}</span>
                  <div className="font-medium text-orange-600">剩余 {getRemainingDays(codeItem.expiresAt)} 天</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {invitationCodes.length === 0 && <p className="text-gray-500 text-sm">暂无邀请码，请点击上方按钮生成</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">面试岗位管理</h3>
        </div>
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">添加新岗位</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">岗位名称</label>
              <input 
                type="text" 
                value={newPositionName} 
                onChange={(e) => setNewPositionName(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入岗位名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">岗位描述</label>
              <textarea 
                value={newPositionDescription} 
                onChange={(e) => setNewPositionDescription(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="请输入岗位描述"
              />
            </div>
            <button 
              onClick={handleAddPosition} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              添加岗位
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {jobPositions.length > 0 ? (
            jobPositions.map((position) => (
              <div key={position.id} className="bg-white p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <input 
                    type="text" 
                    value={position.positionName} 
                    onChange={(e) => updatePositionLocal(position.id, { positionName: e.target.value })} 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={position.isActive} 
                        onChange={(e) => updatePositionLocal(position.id, { isActive: e.target.checked })} 
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">启用</span>
                    </label>
                    <button 
                      onClick={() => handleUpdatePosition(position)} 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      保存
                    </button>
                    <button 
                      onClick={() => handleDeletePosition(position.id)} 
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div>
                  <textarea 
                    value={position.description} 
                    onChange={(e) => updatePositionLocal(position.id, { description: e.target.value })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="请输入岗位描述"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">暂无岗位，请添加新岗位</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('interview.常驻时段')}</h3>
          <button onClick={addRegularSlot} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ {t('interview.addSlot')}</button>
        </div>
        <div className="space-y-3">
          {regularSlots.map((slot, idx) => {
            const globalIdx = slots.indexOf(slot);
            return (
              <div key={globalIdx} className="flex items-center justify-between bg-white p-3 border rounded-md shadow-sm">
                <div className="flex items-center space-x-3">
                  <select value={slot.dayOfWeek ?? 1} onChange={(e) => updateSlotLocal(globalIdx, { dayOfWeek: parseInt(e.target.value) })} className="border-gray-300 rounded-md text-sm p-1 border">
                    {[1, 2, 3, 4, 5, 6, 0].map(d => <option key={d} value={d}>{['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d]}</option>)}
                  </select>
                  <input type="time" value={slot.startTime} onChange={(e) => updateSlotLocal(globalIdx, { startTime: e.target.value })} className="border-gray-300 rounded-md text-sm p-1 border" />
                  <span>-</span>
                  <input type="time" value={slot.endTime} onChange={(e) => updateSlotLocal(globalIdx, { endTime: e.target.value })} className="border-gray-300 rounded-md text-sm p-1 border" />
                </div>
                <button onClick={() => removeSlot(slot)} className="text-red-500 hover:text-red-700">删除</button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('interview.临时时段')}</h3>
          <button onClick={addSpecificSlot} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ {t('interview.addSlot')}</button>
        </div>
        <div className="space-y-3">
          {specificSlots.map((slot) => {
            const globalIdx = slots.indexOf(slot);
            return (
              <div key={globalIdx} className="flex items-center justify-between bg-white p-3 border rounded-md shadow-sm">
                <div className="flex items-center space-x-3">
                  <input type="date" value={slot.slotDate || ''} onChange={(e) => updateSlotLocal(globalIdx, { slotDate: e.target.value })} className="border-gray-300 rounded-md text-sm p-1 border" />
                  <input type="time" value={slot.startTime} onChange={(e) => updateSlotLocal(globalIdx, { startTime: e.target.value })} className="border-gray-300 rounded-md text-sm p-1 border" />
                  <span>-</span>
                  <input type="time" value={slot.endTime} onChange={(e) => updateSlotLocal(globalIdx, { endTime: e.target.value })} className="border-gray-300 rounded-md text-sm p-1 border" />
                </div>
                <button onClick={() => removeSlot(slot)} className="text-red-500 hover:text-red-700">删除</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t">
        <button onClick={saveSettings} disabled={saving} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {saving ? '保存中...' : t('interview.save')}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
