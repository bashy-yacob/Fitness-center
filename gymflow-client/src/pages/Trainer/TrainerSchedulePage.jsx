import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Schedule from './Schedule';
import { Flex, Text } from '@chakra-ui/react';

// עמוד עוטף שמביא את ה-trainerId מה-auth
const TrainerSchedulePage = () => {
  const { user } = useAuth();
  const trainerId = user?.id;

  if (!trainerId) {
    return (
      <Flex justify="center" mt={10}>
        <Text color="red.500">לא זוהה מאמן</Text>
      </Flex>
    );
  }

  return <Schedule trainerId={trainerId} />;
};

export default TrainerSchedulePage;
