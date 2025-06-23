import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MessagesRedirector = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    switch (user.user_type) {
      case 'admin':
        navigate('/admin/broadcast-messages', { replace: true });
        break;
      case 'trainer':
        navigate('/trainer/messages', { replace: true });
        break;
      case 'trainee':
        navigate('/trainee/messages', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return null;
};

export default MessagesRedirector;
