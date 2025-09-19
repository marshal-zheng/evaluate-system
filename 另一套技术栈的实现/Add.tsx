import React from 'react';
import TaskWizard from './components/TaskWizard';
import { useNavigate } from 'react-router-dom';

const Add: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/evaluation-task/task-management');
  };

  const handleCancel = () => {
    navigate('/evaluation-task/task-management');
  };

  return (
    <div style={{ padding: 24 }}>
      <TaskWizard
        visible={true}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Add;