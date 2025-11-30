import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Text, Button, Flex, Spinner, Alert, Card } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
  duration: 5000,
});

function ConfirmPurchasePage() {
  const { packageId } = useParams();
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPackage() {
      try {
        const types = await apiService.get('/subscriptions/types');
        const found = types.find((type) => String(type.id) === String(packageId));
        if (!found) throw new Error('חבילה לא נמצאה');
        setPackageInfo(found);
      } catch (err) {
        setError('שגיאה בטעינת החבילה');
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [packageId]);

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      await apiService.post('/subscriptions/purchase', {
        subscriptionTypeId: Number(packageId),
        paymentDetails: {
          transaction_id: `txn_sub_${Date.now()}`,
          status: 'completed',
          notes: ""
        },
      });
      toaster.success({
        title: 'הרכישה בוצעה בהצלחה!',
      });
      navigate('/trainee/subscriptions/manage');
    } catch (err) {
      toaster.error({
        title: 'הרכישה נכשלה',
      });
      setError('הרכישה נכשלה');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
        <Spinner size="xl" color="brand.500" />
        <Text ml={4} color="white">טוען פרטי חבילה...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Container mt={10}>
        <Alert.Root status="error">
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      </Container>
    );
  }

  if (!packageInfo) {
    return (
      <Container mt={10}>
        <Alert.Root status="warning">
          <Alert.Title>לא נמצאה חבילה</Alert.Title>
        </Alert.Root>
      </Container>
    );
  }

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.md">
        <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
          <Card.Body>
            <Flex direction="column" gap={6} align="center" textAlign="center">
              <Heading color="brand.500">אישור רכישת חבילה</Heading>

              <Box>
                <Text fontSize="lg" color="gray.300" mb={2}>
                  האם לאשר רכישת החבילה: <Text as="span" fontWeight="bold" color="brand.400">{packageInfo.name}</Text>?
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  מחיר: ₪{parseFloat(packageInfo.price).toFixed(0)} / {packageInfo.duration_days} ימים
                </Text>
              </Box>

              <Flex gap={4} w="full" justify="center">
                <Button
                  onClick={() => navigate(-1)}
                  disabled={processing}
                  variant="outline"
                  flex={1}
                  maxW="200px"
                >
                  חזור
                </Button>
                <Button
                  onClick={handlePurchase}
                  loading={processing}
                  colorPalette="brand"
                  flex={1}
                  maxW="200px"
                >
                  אשר ושלם
                </Button>
              </Flex>
            </Flex>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
}

export default ConfirmPurchasePage;
