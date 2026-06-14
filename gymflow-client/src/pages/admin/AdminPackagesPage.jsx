import React, { useState, useEffect } from 'react';
import { pricingPackageService } from '../../api/pricingPackageService.js';
import PackageFormModal from '../../components/PackageFormModal.jsx';
import { Box, Container, Heading, Button, Flex, Table } from '@chakra-ui/react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);

  useEffect(() => {
    pricingPackageService.fetchAllPackages()
      .then(setPackages)
      .catch(() => setPackages([]));
  }, []);

  function handleDeletePackage(id) {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המנוי?')) return;
    pricingPackageService.deletePackage(id)
      .then(() => setPackages(pkgs => pkgs.filter(pkg => pkg.id !== id)))
      .catch(() => alert('שגיאה במחיקת מנוי'));
  }

  function handleAddNew() {
    setModalInitial(null);
    setModalOpen(true);
  }
  function handleEditPackage(pkg) {
    setModalInitial({
      id: pkg.id,
      name: pkg.name || '',
      price: pkg.price || '',
      description: pkg.features ? pkg.features.join(', ') : (pkg.description || ''),
      duration_days: pkg.duration_days || '',
      max_classes_per_month: pkg.max_classes_per_month !== undefined && pkg.max_classes_per_month !== null ? pkg.max_classes_per_month : ''
    });
    setModalOpen(true);
  }
  function handleModalSubmit(form) {
    const isEdit = !!modalInitial;
    if (isEdit && !modalInitial.id) {
      alert('שגיאה: לא נמצא מזהה מנוי לעריכה');
      return;
    }
    const payload = {
      name: form.name || '',
      price: form.price !== undefined && form.price !== '' ? Number(form.price) : 0,
      description: form.description || '',
      duration_days: form.duration_days !== undefined && form.duration_days !== '' ? Number(form.duration_days) : 0,
      max_classes_per_month:
        form.max_classes_per_month === undefined || form.max_classes_per_month === ''
          ? null
          : Number(form.max_classes_per_month)
    };
    const req = isEdit ? pricingPackageService.updatePackage(modalInitial.id, payload) : pricingPackageService.createPackage(payload);
    req
      .then(data => {
        setModalOpen(false);
        setModalInitial(null);
        if (!isEdit) {
          setPackages(pkgs => [...pkgs, { ...payload, id: data.id }]);
        } else {
          setPackages(pkgs => pkgs.map(p => p.id === modalInitial.id ? { ...p, ...payload } : p));
        }
      })
      .catch(e => alert(e.message || 'שגיאה בשמירת מנוי'));
  }

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.lg">
        <Heading mb={6} color="brand.500">ניהול סוגי מנויים</Heading>
        <Button mb={3} onClick={handleAddNew} colorPalette="brand">הוסף מנוי חדש</Button>
        <Box overflowX="auto">
          <Table.Root variant="outline" bg="dark.card">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader color="brand.400">שם</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">מחיר</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">תיאור</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">משך (ימים)</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">מגבלת חוגים</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">פעולות</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {packages.map(pkg => (
                <Table.Row key={pkg.id}>
                  <Table.Cell color="white">{pkg.name}</Table.Cell>
                  <Table.Cell color="white">{pkg.price}</Table.Cell>
                  <Table.Cell color="white">{pkg.features ? pkg.features.join(', ') : pkg.description}</Table.Cell>
                  <Table.Cell color="white">{pkg.duration_days ?? ''}</Table.Cell>
                  <Table.Cell color="white">{pkg.max_classes_per_month ?? ''}</Table.Cell>
                  <Table.Cell>
                    <Flex gap={2}>
                      <Button size="xs" variant="outline" onClick={() => handleEditPackage(pkg)}>ערוך</Button>
                      <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleDeletePackage(pkg.id)}>מחק</Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
        <PackageFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={modalInitial}
        />
      </Container>
    </Box>
  );
}
