import React from 'react';
import { Box, Container, Heading, Text, Flex } from '@chakra-ui/react';

function MessagesPage() {
    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Flex direction="column" align="center" justify="center" minH="60vh" gap={6}>
                    <Heading color="brand.500">הודעות</Heading>
                    <Text fontSize="xl" color="gray.400" textAlign="center">
                        אזור ההודעות נמצא כעת בפיתוח ויהיה זמין בקרוב.
                    </Text>
                </Flex>
            </Container>
        </Box>
    );
}

export default MessagesPage;