import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-900/30',
          iconBorder: 'border-red-600',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: '⚡',
          iconBg: 'bg-yellow-900/30',
          iconBorder: 'border-yellow-600',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-900/30',
          iconBorder: 'border-blue-600',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'success':
        return {
          icon: '✓',
          iconBg: 'bg-green-900/30',
          iconBorder: 'border-green-600',
          confirmBtn: 'bg-green-600 hover:bg-green-700',
        };
      default:
        return {
          icon: '⚡',
          iconBg: 'bg-yellow-900/30',
          iconBorder: 'border-yellow-600',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1a1f2e] rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-700 animate-slideUp">
        {/* Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className={`w-20 h-20 rounded-full ${styles.iconBg} border-2 ${styles.iconBorder} flex items-center justify-center`}>
            <span className="text-4xl">{styles.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-8 pb-8">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 ${styles.confirmBtn} text-white font-semibold rounded-lg transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
