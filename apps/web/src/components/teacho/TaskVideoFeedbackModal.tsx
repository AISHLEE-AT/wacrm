import React from 'react';

export const TaskVideoFeedbackModal = ({ isOpen, onClose, taskType, onSubmit }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Submit Video</h3>
        <p className="text-gray-500 mb-6">Video submissions are disabled in the web preview.</p>
        <button onClick={onClose} className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold">
          Close
        </button>
      </div>
    </div>
  );
};
