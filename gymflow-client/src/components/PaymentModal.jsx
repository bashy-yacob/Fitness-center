import React, { useState } from 'react';
import { Box, Button, Input, Flex, Text, Dialog, Field, SimpleGrid } from '@chakra-ui/react';

function PaymentModal({ gymClass, onClose, onConfirm }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '', expiryDate: '', cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        if (onConfirm) {
            onConfirm(gymClass.id);
        }
    };

    if (!gymClass) {
        return null;
    }

    return (
        <Dialog.Root open={!!gymClass} onOpenChange={onClose}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content bg="dark.card" borderColor="dark.border">
                    <Dialog.CloseTrigger color="gray.400" />
                    <Dialog.Header>
                        <Dialog.Title color="brand.400">הרשמה לחוג: {gymClass.name}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Flex direction="column" gap={4}>
                            <Box>
                                <Text color="gray.300">
                                    <Text as="span" fontWeight="bold" color="brand.400">מאמן/ה:</Text> {gymClass.trainerName}
                                </Text>
                                <Text color="white" fontWeight="bold" fontSize="lg" mt={2}>
                                    מחיר: 50.00 ₪
                                </Text>
                            </Box>

                            <Box as="hr" borderColor="gray.700" my={2} />

                            <form onSubmit={handleSubmit}>
                                <Flex direction="column" gap={4}>
                                    <Text fontWeight="bold" color="brand.400">פרטי תשלום</Text>

                                    <Field.Root>
                                        <Field.Label color="gray.300">מספר כרטיס</Field.Label>
                                        <Input
                                            name="cardNumber"
                                            value={paymentDetails.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="1234 5678 1234 5678"
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            color="white"
                                            _focus={{ borderColor: 'brand.400' }}
                                            required
                                        />
                                    </Field.Root>

                                    <SimpleGrid columns={2} gap={4}>
                                        <Field.Root>
                                            <Field.Label color="gray.300">תוקף</Field.Label>
                                            <Input
                                                name="expiryDate"
                                                value={paymentDetails.expiryDate}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                                _focus={{ borderColor: 'brand.400' }}
                                                required
                                            />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label color="gray.300">CVV</Field.Label>
                                            <Input
                                                name="cvv"
                                                value={paymentDetails.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                                _focus={{ borderColor: 'brand.400' }}
                                                required
                                            />
                                        </Field.Root>
                                    </SimpleGrid>

                                    <Button
                                        type="submit"
                                        colorPalette="brand"
                                        w="full"
                                        loading={isProcessing}
                                        mt={4}
                                    >
                                        {isProcessing ? 'מעבד...' : 'שלם עכשיו והירשם'}
                                    </Button>
                                </Flex>
                            </form>
                        </Flex>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

export default PaymentModal;