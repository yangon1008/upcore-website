import React, { useState, useEffect } from 'react';
import { JobPositionData, updateInvitationCodeInfo } from '../utils/database';

interface UploadedFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

interface UserInfoFormProps {
  jobPositions: JobPositionData[];
  onSubmit: (data: {
    gender: string;
    age: string;
    phone: string;
    jobPositionId: number;
    jobPositionName: string;
    introduction?: string;
    files?: UploadedFile[];
  }) => void;
  onBack?: () => void;
  loading?: boolean;
  initialData?: {
    gender: string;
    age: string;
    phone: string;
    jobPositionId: number;
    jobPositionName: string;
    introduction?: string;
    files?: UploadedFile[];
  };
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ 
  jobPositions, 
  onSubmit, 
  onBack, 
  loading = false,
  initialData
}) => {
  // 从 URL 获取邀请码，用于 localStorage 的 key
  const invitationCode = window.location.search.split('invitationCode=')[1] || 'default';
  const STORAGE_KEY = `userInfoForm_${invitationCode}`;

  // 初始化：先尝试从 localStorage 加载，再使用 initialData
  const getInitialFormData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          gender: parsed.gender || initialData?.gender || 'male',
          age: parsed.age || initialData?.age || '',
          phone: parsed.phone || initialData?.phone || '',
          jobPositionId: parsed.jobPositionId || initialData?.jobPositionId || 0,
          jobPositionName: parsed.jobPositionName || initialData?.jobPositionName || '',
          introduction: parsed.introduction || initialData?.introduction || '',
          files: parsed.files || initialData?.files || [] as UploadedFile[]
        };
      }
    } catch (e) {
      console.log('从 localStorage 加载表单数据失败:', e);
    }
    return {
      gender: initialData?.gender || 'male',
      age: initialData?.age || '',
      phone: initialData?.phone || '',
      jobPositionId: initialData?.jobPositionId || 0,
      jobPositionName: initialData?.jobPositionName || '',
      introduction: initialData?.introduction || '',
      files: initialData?.files || [] as UploadedFile[]
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  
  
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 自动保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.log('保存表单数据到 localStorage 失败:', e);
    }
  }, [formData, STORAGE_KEY]);

  // 提交成功后清除 localStorage
  const clearStoredData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.log('清除 localStorage 数据失败:', e);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.gender) {
      newErrors.gender = '请选择性别';
    }
    
    if (!formData.age) {
      newErrors.age = '请输入年龄';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 65) {
      newErrors.age = '年龄必须在18-65之间';
    }
    
    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }
    
    if (!formData.jobPositionId) {
      newErrors.jobPositionId = '请选择面试岗位';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const invitationCode = window.location.search.split('invitationCode=')[1];
        
        // 保存所有信息到邀请码表
        if (invitationCode) {
          const usedByFiles = formData.files.length > 0 ? formData.files : undefined;
          await updateInvitationCodeInfo(invitationCode, {
            jobPositionId: formData.jobPositionId,
            jobPositionName: formData.jobPositionName,
            usedByFiles: usedByFiles,
            usedByIntroduction: formData.introduction,
            usedByGender: formData.gender,
            usedByAge: formData.age,
            usedByPhone: formData.phone
          });
        }
        
        // 提交成功后清除 localStorage
        clearStoredData();
      } catch (error) {
        console.error('保存用户信息失败:', error);
      }
      
      onSubmit({
        gender: formData.gender,
        age: formData.age,
        phone: formData.phone,
        jobPositionId: formData.jobPositionId,
        jobPositionName: formData.jobPositionName,
        introduction: formData.introduction,
        files: formData.files
      });
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('http://localhost:3001/api/files/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, ...result.files.map((file: any) => ({
            ...file,
            id: Math.random().toString(36).substr(2, 9)
          }))]
        }));
      }
    } catch (error) {
      console.error('文件上传失败:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== id)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleJobPositionChange = (position: JobPositionData) => {
    setFormData(prev => ({
      ...prev,
      jobPositionId: position.id,
      jobPositionName: position.positionName
    }));
    setErrors(prev => ({ ...prev, jobPositionId: '' }));
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">填写个人信息</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            性别 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">男</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">女</span>
            </label>
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* 年龄 */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            年龄 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="age"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="请输入您的年龄"
            min="18"
            max="65"
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>

        {/* 手机号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            手机号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="请输入您的手机号"
            pattern="1[3-9]\d{9}"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* 面试岗位 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            面试岗位 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {jobPositions.filter(p => p.isActive).length > 0 ? (
              jobPositions.filter(p => p.isActive).map((position) => (
                <button
                  key={position.id}
                  type="button"
                  onClick={() => handleJobPositionChange(position)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${ 
                    formData.jobPositionId === position.id 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50' 
                  }`}
                >
                  <div className="text-lg font-semibold text-gray-900">{position.positionName}</div>
                  {position.description && (
                    <div className="text-sm text-gray-500 mt-1">{position.description}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-400">暂无面试岗位</p>
                <p className="text-gray-400 text-sm mt-1">请联系管理员添加面试岗位</p>
              </div>
            )}
          </div>
          {errors.jobPositionId && (
            <p className="mt-1 text-sm text-red-600">{errors.jobPositionId}</p>
          )}
        </div>

        {/* 非必填信息 */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">其他信息（选填）</h3>
          
          {/* 文件上传 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传文件（个人简历、相关视频、图片等）
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => handleFileUpload(e.target.files || new FileList())}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-gray-500">支持图片、PDF、Word、视频等常见文件</p>
                </div>
              </label>
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">上传中...</p>
                </div>
              )}
            </div>
            
            {/* 已上传文件列表 */}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">已上传文件</h4>
                <div className="space-y-2">
                  {formData.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                          {file.mimetype.startsWith('image/') ? (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : file.mimetype === 'application/pdf' ? (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ) : file.mimetype.startsWith('video/') ? (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.originalname}</p>
                          <p className="text-xs text-gray-500">{file.size / 1024 < 1024 ? `${(file.size / 1024).toFixed(2)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(file.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>



          {/* 个人介绍 */}
          <div>
            <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
              个人介绍
            </label>
            <textarea
              id="introduction"
              value={formData.introduction}
              onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="请简要介绍一下自己（200字以内）"
              rows={4}
            />
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                提交中...
              </span>
            ) : (
              '下一步'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInfoForm;