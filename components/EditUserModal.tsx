import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { UI_TEXT } from '../constants';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: (user: Omit<User, 'id'>) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    username: '',
    role: UserRole.STAFF,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        username: '',
        role: UserRole.STAFF,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {user ? UI_TEXT.editUser : UI_TEXT.addUser}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {UI_TEXT.userName}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {UI_TEXT.userEmail}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {UI_TEXT.userRole}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="form-select"
                required
              >
                <option value={UserRole.ADMINISTRATOR}>Administrator</option>
                <option value={UserRole.STAFF}>Staff</option>
              </select>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {UI_TEXT.cancel}
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {UI_TEXT.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
