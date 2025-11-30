import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { assignTrainingProgram } from '../../api/assignProgramService';
import { getTraineeProgramHistory, unassignTraineeActiveProgram } from '../../api/traineeProgramService';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Heading, Button, Flex, Input, NativeSelect, Text, SimpleGrid, Card, Alert, Dialog, List } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
    placement: 'top',
    duration: 5000,
});

export default function AssignProgramPage() {
    const [trainees, setTrainees] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedTrainee, setSelectedTrainee] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [traineeSearch, setTraineeSearch] = useState("");
    const [programSearch, setProgramSearch] = useState("");
    const [traineeHistory, setTraineeHistory] = useState([]);
    const [currentProgram, setCurrentProgram] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showTraineeDetails, setShowTraineeDetails] = useState(false);
    const { user } = useAuth();
    const trainerId = user?.id;

    useEffect(() => {
        apiService.get(`/trainer/${trainerId}/trainees`).then(setTrainees).catch(() => setTrainees([]));
        apiService.get('/trainees/programs/all').then(setPrograms).catch(() => setPrograms([]));
    }, [trainerId]);

    useEffect(() => {
        if (!selectedTrainee) {
            setTraineeHistory([]);
            setCurrentProgram(null);
            return;
        }
        getTraineeProgramHistory(selectedTrainee)
            .then(history => {
                setTraineeHistory(history);
                setCurrentProgram(history.find(h => h.is_active));
            })
            .catch(() => {
                setTraineeHistory([]);
                setCurrentProgram(null);
            });
    }, [selectedTrainee]);

    const filteredTrainees = trainees.filter(t =>
        (t.first_name + ' ' + t.last_name).toLowerCase().includes(traineeSearch.toLowerCase())
    );
    const filteredPrograms = programs.filter(p =>
        p.name.toLowerCase().includes(programSearch.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentProgram) {
            setShowConfirm(true);
            return;
        }
        await doAssign();
    };

    const doAssign = async () => {
        try {
            await assignTrainingProgram(trainerId, selectedTrainee, selectedProgram);
            toaster.success({ title: 'התוכנית שויכה בהצלחה' });
            setShowConfirm(false);
            getTraineeProgramHistory(selectedTrainee).then(history => {
                setTraineeHistory(history);
                setCurrentProgram(history.find(h => h.is_active));
            });
        } catch (err) {
            toaster.error({ title: err.message || "שגיאה בשיוך תוכנית" });
        }
    };

    const handleUnassign = async () => {
        try {
            await unassignTraineeActiveProgram(selectedTrainee);
            setCurrentProgram(null);
            toaster.success({ title: 'שיוך התוכנית בוטל בהצלחה' });
            getTraineeProgramHistory(selectedTrainee).then(setTraineeHistory);
        } catch (err) {
            toaster.error({ title: err.message || "שגיאה בביטול שיוך" });
        }
    };

    const selectedTraineeObj = trainees.find(t => String(t.id) === String(selectedTrainee));

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={8} color="brand.500">שיוך תוכנית למתאמן</Heading>

                <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px" mb={8}>
                    <Card.Body>
                        <form onSubmit={handleSubmit}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={6}>
                                <Box>
                                    <Text mb={2} color="gray.300">חפש מתאמן:</Text>
                                    <Input
                                        value={traineeSearch}
                                        onChange={e => setTraineeSearch(e.target.value)}
                                        placeholder="הקלד שם..."
                                        mb={2}
                                        bg="dark.bg"
                                        color="white"
                                        borderColor="dark.border"
                                    />
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            value={selectedTrainee}
                                            onChange={e => setSelectedTrainee(e.target.value)}
                                            required
                                            bg="dark.bg"
                                            color="white"
                                            borderColor="dark.border"
                                        >
                                            <option value="">--בחר--</option>
                                            {filteredTrainees.map(t => (
                                                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                            ))}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                    {selectedTrainee && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            mt={2}
                                            onClick={() => setShowTraineeDetails(true)}
                                        >
                                            פרטי מתאמן
                                        </Button>
                                    )}
                                </Box>

                                <Box>
                                    <Text mb={2} color="gray.300">חפש תוכנית:</Text>
                                    <Input
                                        value={programSearch}
                                        onChange={e => setProgramSearch(e.target.value)}
                                        placeholder="הקלד שם תוכנית..."
                                        mb={2}
                                        bg="dark.bg"
                                        color="white"
                                        borderColor="dark.border"
                                    />
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            value={selectedProgram}
                                            onChange={e => setSelectedProgram(e.target.value)}
                                            required
                                            bg="dark.bg"
                                            color="white"
                                            borderColor="dark.border"
                                        >
                                            <option value="">--בחר--</option>
                                            {filteredPrograms.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Box>
                            </SimpleGrid>

                            <Flex gap={4}>
                                <Button type="submit" colorPalette="brand">שמור</Button>
                                {currentProgram && (
                                    <Button type="button" colorPalette="red" variant="outline" onClick={handleUnassign}>בטל שיוך</Button>
                                )}
                            </Flex>
                        </form>
                    </Card.Body>
                </Card.Root>

                {currentProgram && (
                    <Alert.Root status="info" mb={6} variant="subtle" colorPalette="blue">
                        <Alert.Title>תוכנית נוכחית:</Alert.Title>
                        <Alert.Description>
                            {currentProgram.program_name} (הוקצתה ב-{new Date(currentProgram.assigned_date).toLocaleDateString('he-IL')})
                        </Alert.Description>
                    </Alert.Root>
                )}

                {traineeHistory.length > 0 && (
                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <Heading size="md" mb={4} color="brand.400">היסטוריית תוכניות</Heading>
                            <List.Root spacing={2}>
                                {traineeHistory.map((h, i) => (
                                    <List.Item key={i} color={h.is_active ? 'brand.400' : 'gray.400'} fontWeight={h.is_active ? 'bold' : 'normal'}>
                                        <List.Indicator color={h.is_active ? 'brand.500' : 'gray.500'}>•</List.Indicator>
                                        {h.program_name} ({h.trainer_name}) - {new Date(h.assigned_date).toLocaleDateString('he-IL')} {h.is_active ? '(פעילה)' : ''}
                                    </List.Item>
                                ))}
                            </List.Root>
                        </Card.Body>
                    </Card.Root>
                )}

                {/* Confirm Dialog */}
                <Dialog.Root open={showConfirm} onOpenChange={() => setShowConfirm(false)}>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content bg="dark.card" borderColor="dark.border">
                            <Dialog.CloseTrigger color="gray.400" />
                            <Dialog.Header>
                                <Dialog.Title color="brand.400">אישור החלפת תוכנית</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text color="white">למתאמן כבר משויכת תוכנית פעילה. האם להחליף אותה?</Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="outline" onClick={() => setShowConfirm(false)}>ביטול</Button>
                                <Button colorPalette="brand" onClick={doAssign}>כן, החלף</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Dialog.Root>

                {/* Trainee Details Dialog */}
                <Dialog.Root open={showTraineeDetails} onOpenChange={() => setShowTraineeDetails(false)}>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content bg="dark.card" borderColor="dark.border">
                            <Dialog.CloseTrigger color="gray.400" />
                            <Dialog.Header>
                                <Dialog.Title color="brand.400">פרטי מתאמן</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                {selectedTraineeObj && (
                                    <List.Root spacing={2} color="white">
                                        <List.Item>
                                            <Text as="span" fontWeight="bold" color="brand.400">שם:</Text> {selectedTraineeObj.first_name} {selectedTraineeObj.last_name}
                                        </List.Item>
                                        <List.Item>
                                            <Text as="span" fontWeight="bold" color="brand.400">אימייל:</Text> {selectedTraineeObj.email}
                                        </List.Item>
                                        <List.Item>
                                            <Text as="span" fontWeight="bold" color="brand.400">טלפון:</Text> {selectedTraineeObj.phone}
                                        </List.Item>
                                    </List.Root>
                                )}
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button onClick={() => setShowTraineeDetails(false)} colorPalette="brand">סגור</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Dialog.Root>

            </Container>
        </Box>
    );
}
