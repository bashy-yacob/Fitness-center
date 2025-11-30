import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    SimpleGrid,
    Flex,
    Stack,
    Icon,
    Accordion,
    Spinner,
    VStack,
    HStack,
    Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import PricingSection from '../../components/PricingSection';
import { classService } from '../../api/classService';
import { useAuth } from '../../hooks/useAuth';

// Motion components
const MotionBox = motion.create(Box);
const MotionHeading = motion.create(Heading);
const MotionText = motion.create(Text);

const LandingPage = () => {
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [classesError, setClassesError] = useState(null);
    const { isAuthenticated, setRedirectPath } = useAuth();
    const navigate = useNavigate();

    const features = [
        { icon: '💪', title: 'ציוד מתקדם', description: 'הציוד החדיש והמתקדם ביותר בתעשייה, מותאם לכל רמות האימון' },
        { icon: '👥', title: 'מאמנים מוסמכים', description: 'צוות מאמנים מקצועי עם ניסיון של שנים בליווי אישי' },
        { icon: '🎯', title: 'אימונים מותאמים אישית', description: 'תוכנית אימונים מותאמת למטרות ולקצב ההתקדמות שלך' },
        { icon: '⏰', title: 'פתוח 24/7', description: 'גישה למכון בכל שעה, כל יום, כולל סופי שבוע וחגים' },
        { icon: '📱', title: 'אפליקציה חכמה', description: 'מעקב אחר ההתקדמות והזמנת שיעורים דרך האפליקציה' },
        { icon: '🥤', title: 'בר משקאות בריאות', description: 'שייקים, מיצים טבעיים ותוספי תזונה מותאמים אישית' }
    ];

    const faqs = [
        { question: "איך מתחילים להתאמן?", answer: "פשוט מאוד! נרשמים באתר, קובעים פגישת היכרות עם מאמן אישי שיבנה עבורכם תוכנית אימונים מותאמת אישית, ומתחילים להתאמן. המאמן ילווה אתכם בצעדים הראשונים ויוודא שאתם מבצעים את התרגילים בצורה נכונה ובטוחה." },
        { question: "האם יש חניה במקום?", answer: "כן, יש לנו חניון גדול וחינם ללקוחות המכון. בנוסף, אנחנו ממוקמים במרחק הליכה מתחנת האוטובוס." },
        { question: "מה כוללת החברות במכון?", answer: "החברות כוללת גישה לכל מתקני המכון, כולל אזור המשקולות, אזור הקרדיו, ומלתחות. בחבילת הפרימיום מקבלים גם גישה לכל השיעורים הקבוצתיים וייעוץ תזונה חודשי." },
        { question: "האם אפשר לבטל מנוי?", answer: "כן, ניתן לבטל את המנוי בכל עת עם הודעה מראש של 30 יום. אנחנו מאמינים בגמישות ובשירות ללא התחייבות ארוכת טווח." },
        { question: "האם יש מקלחות ולוקרים?", answer: "כן, המכון מצויד במלתחות מודרניות עם מקלחות, לוקרים אישיים, ומייבשי שיער. הלוקרים מופעלים באמצעות אפליקציית המכון." },
        { question: "האם מתאים למתחילים?", answer: "בהחלט! הצוות שלנו מיומן בעבודה עם מתאמנים בכל הרמות, כולל מתחילים לגמרי. נבנה יחד איתכם תוכנית הדרגתית שתתאים לרמתכם ולמטרות שלכם." }
    ];

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setClassesLoading(true);
                const data = await classService.getAllClasses();
                setClasses(data);
            } catch (err) {
                setClassesError('שגיאה בטעינת החוגים');
            } finally {
                setClassesLoading(false);
            }
        };
        fetchClasses();
    }, []);

    return (
        <Box bg="dark.bg" minH="100vh" overflowX="hidden">
            {/* Hero Section */}
            <Box
                position="relative"
                h={{ base: '500px', md: '800px' }}
                backgroundImage="url('/images/cyril-saulnier-TsVN31Dzyv4-unsplash.jpg')"
                backgroundSize="cover"
                backgroundPosition="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'rgba(0, 0, 0, 0.6)',
                }}
            >
                <Container maxW="container.lg" position="relative" zIndex={1} textAlign="center" color="white">
                    <MotionHeading
                        as="h1"
                        size="4xl"
                        mb={6}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                    >
                        ברוכים הבאים ל-GymFlow
                    </MotionHeading>
                    <MotionText
                        fontSize={{ base: 'xl', md: '2xl' }}
                        mb={8}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                    >
                        הדרך שלך לכושר מושלם מתחילה כאן
                    </MotionText>
                    <Stack direction={{ base: 'column', sm: 'row' }} gap={4} justify="center">
                        <Button
                            as={RouterLink}
                            to="/register"
                            size="lg"
                            colorPalette="brand"
                            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        >
                            הצטרף עכשיו
                        </Button>
                        <Button
                            as={RouterLink}
                            to="/login"
                            size="lg"
                            variant="outline"
                            colorPalette="brand"
                            color="brand.400"
                            borderColor="brand.400"
                            _hover={{ bg: 'brand.400', color: 'gray.900' }}
                        >
                            התחבר
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Features Section */}
            <Box py={20} bg="dark.section">
                <Container maxW="container.xl">
                    <Heading textAlign="center" mb={16} color="brand.500">למה לבחור בנו?</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={10}>
                        {features.map((feature, index) => (
                            <MotionBox
                                key={index}
                                bg="dark.card"
                                p={8}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor="dark.border"
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                                boxShadow="xl"
                            >
                                <Text fontSize="4xl" mb={4}>{feature.icon}</Text>
                                <Heading size="md" mb={4} color="brand.400">{feature.title}</Heading>
                                <Text color="gray.400">{feature.description}</Text>
                            </MotionBox>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Classes Section */}
            <Box py={20} bg="dark.bg">
                <Container maxW="container.xl">
                    <Heading textAlign="center" mb={16} color="brand.500">השיעורים שלנו</Heading>
                    {classesLoading ? (
                        <Flex justify="center"><Spinner size="xl" color="brand.500" /></Flex>
                    ) : classesError ? (
                        <Text color="red.500" textAlign="center">{classesError}</Text>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                            {classes.map((classItem) => (
                                <Box
                                    key={classItem.id}
                                    position="relative"
                                    height="300px"
                                    borderRadius="xl"
                                    overflow="hidden"
                                    role="group"
                                    boxShadow="dark-lg"
                                >
                                    <Box
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        w="100%"
                                        h="100%"
                                        bgImage={`url(/images/${classItem.image || 'fitness-4998981_1280.jpg'})`}
                                        bgSize="cover"
                                        bgPosition="center"
                                        transition="transform 0.3s"
                                        _groupHover={{ transform: 'scale(1.1)' }}
                                    />
                                    <Flex
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        w="100%"
                                        h="100%"
                                        bg="rgba(0,0,0,0.7)"
                                        direction="column"
                                        justify="center"
                                        align="center"
                                        p={6}
                                        textAlign="center"
                                        opacity={0}
                                        transition="opacity 0.3s"
                                        _groupHover={{ opacity: 1 }}
                                    >
                                        <Heading size="lg" color="brand.400" mb={2}>{classItem.name}</Heading>
                                        <Text color="gray.200" mb={4} noOfLines={3}>{classItem.description}</Text>
                                        <Button
                                            colorPalette="brand"
                                            onClick={() => {
                                                if (isAuthenticated) {
                                                    navigate('/trainee/classes');
                                                } else {
                                                    setRedirectPath('/trainee/classes');
                                                    navigate('/login');
                                                }
                                            }}
                                        >
                                            הרשם עכשיו
                                        </Button>
                                    </Flex>
                                </Box>
                            ))}
                        </SimpleGrid>
                    )}
                </Container>
            </Box>

            {/* Pricing Section */}
            <PricingSection />

            {/* Testimonials Section */}
            <Box py={20} bg="dark.section">
                <Container maxW="container.xl">
                    <Heading textAlign="center" mb={16} color="brand.500">מה אומרים המתאמנים שלנו</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
                        <Box bg="dark.card" p={8} borderRadius="xl" border="1px solid" borderColor="dark.border" position="relative">
                            <Text fontSize="lg" fontStyle="italic" mb={4} color="gray.300">
                                "המאמנים המקצועיים והאווירה הנהדרת גורמים לי לרצות להגיע כל יום למכון!"
                            </Text>
                            <Text fontWeight="bold" color="brand.400">- דנה כהן</Text>
                        </Box>
                        <Box bg="dark.card" p={8} borderRadius="xl" border="1px solid" borderColor="dark.border" position="relative">
                            <Text fontSize="lg" fontStyle="italic" mb={4} color="gray.300">
                                "התוצאות שהשגתי ב-GymFlow עולות על כל הציפיות שלי. ממליץ בחום!"
                            </Text>
                            <Text fontWeight="bold" color="brand.400">- יוסי לוי</Text>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* FAQ Section */}
            <Box py={20} bg="dark.bg">
                <Container maxW="container.lg">
                    <Heading textAlign="center" mb={16} color="brand.500">שאלות נפוצות</Heading>
                    <Accordion.Root collapsible>
                        {faqs.map((faq, index) => (
                            <Accordion.Item key={index} value={`faq-${index}`} mb={4} bg="dark.card" borderRadius="lg" border="none">
                                <Accordion.ItemTrigger
                                    _expanded={{ bg: 'brand.900', color: 'brand.400' }}
                                    borderRadius="lg"
                                    cursor="pointer"
                                    px={4}
                                    py={3}
                                >
                                    <Box flex="1" textAlign="right" fontWeight="bold">
                                        {faq.question}
                                    </Box>
                                    <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>
                                <Accordion.ItemContent>
                                    <Accordion.ItemBody pb={4} color="gray.300">
                                        {faq.answer}
                                    </Accordion.ItemBody>
                                </Accordion.ItemContent>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                py={32}
                position="relative"
                backgroundImage="url('/images/workout-5031071_1280.jpg')"
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundAttachment="fixed"
                textAlign="center"
                _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'rgba(0, 0, 0, 0.8)',
                }}
            >
                <Container position="relative" zIndex={1}>
                    <Heading size="2xl" mb={6} color="white">מוכנים להתחיל?</Heading>
                    <Text fontSize="xl" mb={10} color="gray.300">הצטרפו אלינו עוד היום והתחילו את המסע שלכם לחיים בריאים יותר</Text>
                    <Button
                        as={RouterLink}
                        to="/register"
                        size="lg"
                        colorPalette="brand"
                        px={10}
                        py={8}
                        fontSize="xl"
                        _hover={{ transform: 'scale(1.05)' }}
                    >
                        הצטרף עכשיו
                    </Button>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;