import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Schedule from './Schedule';

// עמוד עוטף שמביא את ה-trainerId מה-auth
const TrainerSchedulePage = () => {
  const { user } = useAuth();
  const trainerId = user?.id;

  if (!trainerId) {
    return <div style={{textAlign:'center',marginTop:40}}>לא זוהה מאמן</div>;
  }

  return <Schedule trainerId={trainerId} />;
};

export default TrainerSchedulePage;
