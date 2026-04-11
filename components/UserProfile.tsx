import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeishuUser } from '../utils/feishu';

interface UserProfileProps {
  user: FeishuUser;
  onUpdate: (updatedUser: FeishuUser) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(user.name);

  const handleSave = () => {
    onUpdate({ ...user, name });
    alert(t('interview.save') + '成功');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <img src={user.avatar_url} alt={user.name} className="h-16 w-16 rounded-full border-2 border-gray-200" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">ID: {user.user_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('interview.name')}</label>
          <div className="mt-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Open ID</label>
          <div className="mt-1">
            <input
              type="text"
              value={user.open_id}
              disabled
              className="block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          onClick={handleSave}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('interview.save')}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
