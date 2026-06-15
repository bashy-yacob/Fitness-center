import React, { useState, useEffect } from 'react';
import { fetchAllPayments } from '../../api/paymentService.js';
import { Box, Container, Heading, Table } from '@chakra-ui/react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchAllPayments()
      .then(setPayments)
      .catch(() => setPayments([]));
  }, []);

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.lg">
        <Heading mb={6} color="brand.500">ניהול תשלומים</Heading>
        <Box overflowX="auto">
          <Table.Root variant="outline" bg="dark.card">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader color="brand.400">מתאמן</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">סכום</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">תאריך</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">סטטוס</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {payments.map(payment => (
                <Table.Row key={payment.id}>
                  <Table.Cell color="white">{payment.first_name} {payment.last_name}</Table.Cell>
                  <Table.Cell color="white">{payment.amount}</Table.Cell>
                  <Table.Cell color="white">{new Date(payment.payment_date).toLocaleDateString()}</Table.Cell>
                  <Table.Cell color="white">{payment.status}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Container>
    </Box>
  );
}
