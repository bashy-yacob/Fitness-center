import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Link,
  Button,
  Image,
  IconButton,
  Drawer,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onLogout }) {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const getHomePath = () => {
    if (!user) return '/home';
    switch (user.user_type) {
      case 'admin':
        return '/admin/dashboard';
      case 'trainer':
        return '/trainer/dashboard';
      case 'trainee':
        return '/trainee/dashboard';
      default:
        return '/home';
    }
  };

  const navLinks = isAuthenticated
    ? [
      { to: getHomePath(), label: 'דף הבית' },
      { to: '/profile', label: 'פרופיל' },
    ]
    : [
      { to: '/home', label: 'דף הבית' },
      { to: '/classes', label: 'שיעורים' },
    ];

  return (
    <Box
      as="nav"
      bg="dark.card"
      px={4}
      py={3}
      borderBottom="1px solid"
      borderColor="dark.border"
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto">
        {/* Logo */}
        <Link as={RouterLink} to={getHomePath()} _hover={{ textDecoration: 'none' }}>
          <Flex alignItems="center" gap={2}>
            <Image src="/images/logo.png" alt="GymFlow Logo" h="40px" fallbackSrc="https://via.placeholder.com/40" />
            <Box fontSize="2xl" fontWeight="bold" color="brand.400">
              GymFlow
            </Box>
          </Flex>
        </Link>

        {/* Desktop Navigation */}
        <Flex display={{ base: 'none', md: 'flex' }} alignItems="center" gap={6}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              as={RouterLink}
              to={link.to}
              px={3}
              py={2}
              rounded="md"
              color="gray.300"
              _hover={{
                textDecoration: 'none',
                bg: 'dark.bg',
                color: 'brand.400',
              }}
              fontWeight="medium"
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link as={RouterLink} to="/profile">
                <Icon as={FaUserCircle} boxSize={6} color="brand.400" _hover={{ color: 'brand.500' }} />
              </Link>
              <Button
                onClick={onLogout}
                variant="outline"
                colorPalette="brand"
                size="sm"
                borderColor="brand.400"
                color="brand.400"
                _hover={{ bg: 'brand.400', color: 'gray.900' }}
              >
                התנתק
              </Button>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                colorPalette="brand"
                size="sm"
                color="brand.400"
                _hover={{ bg: 'dark.bg' }}
              >
                התחבר
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorPalette="brand"
                size="sm"
              >
                הרשם
              </Button>
            </>
          )}
        </Flex>

        {/* Mobile menu button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={() => setIsOpen(true)}
          variant="ghost"
          aria-label="Open menu"
          icon={<Icon as={FaBars} />}
          color="brand.400"
        />
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="right">
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="dark.card" borderLeft="1px solid" borderColor="dark.border">
            <Drawer.Header borderBottom="1px solid" borderColor="dark.border">
              <Drawer.Title color="brand.400">תפריט</Drawer.Title>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap={4} mt={4}>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    as={RouterLink}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    px={3}
                    py={2}
                    rounded="md"
                    color="gray.300"
                    _hover={{
                      textDecoration: 'none',
                      bg: 'dark.bg',
                      color: 'brand.400',
                    }}
                    fontWeight="medium"
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <Link
                      as={RouterLink}
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      px={3}
                      py={2}
                      rounded="md"
                      color="gray.300"
                      _hover={{
                        textDecoration: 'none',
                        bg: 'dark.bg',
                        color: 'brand.400',
                      }}
                      fontWeight="medium"
                    >
                      פרופיל
                    </Link>
                    <Button
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      variant="outline"
                      colorPalette="brand"
                      borderColor="brand.400"
                      color="brand.400"
                      _hover={{ bg: 'brand.400', color: 'gray.900' }}
                    >
                      התנתק
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      as={RouterLink}
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      colorPalette="brand"
                      color="brand.400"
                      _hover={{ bg: 'dark.bg' }}
                    >
                      התחבר
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      colorPalette="brand"
                    >
                      הרשם
                    </Button>
                  </>
                )}
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  );
}
