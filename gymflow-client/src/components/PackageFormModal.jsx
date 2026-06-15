import React, { useState, useEffect } from 'react';
import { Dialog, Field, Input, Button, Flex, Portal } from '@chakra-ui/react';

export default function PackageFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(() => initialData || {
    name: '',
    price: '',
    description: '',
    duration_days: '',
    max_classes_per_month: ''
  });

  useEffect(() => {
    setForm(initialData || {
      name: '',
      price: '',
      description: '',
      duration_days: '',
      max_classes_per_month: ''
    });
  }, [initialData, open]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onClose(); }}>
      <Portal>
        <Dialog.Backdrop bg="rgba(26,26,26,0.85)" />
        <Dialog.Positioner>
          <Dialog.Content bg="dark.card" color="white" borderRadius="18px" border="1.5px solid" borderColor="secondary.500" minW="340px" maxW="95vw">
            <Dialog.CloseTrigger color="gray.400" />
            <Dialog.Header>
              <Dialog.Title color="brand.500" fontWeight="900" textTransform="uppercase" textShadow="0 2px 8px rgba(34,219,71,0.15)">
                {initialData ? 'עריכת מנוי' : 'הוספת מנוי חדש'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={3}>
                  <Field.Root required>
                    <Field.Label color="secondary.500" fontWeight="700">שם</Field.Label>
                    <Input name="name" value={form.name} onChange={handleChange} bg="#222" color="white" borderColor="dark.border" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label color="secondary.500" fontWeight="700">מחיר</Field.Label>
                    <Input name="price" type="number" value={form.price} onChange={handleChange} bg="#222" color="white" borderColor="dark.border" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label color="secondary.500" fontWeight="700">תיאור (רשימה מופרדת בפסיקים)</Field.Label>
                    <Input name="description" value={form.description} onChange={handleChange} bg="#222" color="white" borderColor="dark.border" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label color="secondary.500" fontWeight="700">משך (ימים)</Field.Label>
                    <Input name="duration_days" type="number" value={form.duration_days} onChange={handleChange} bg="#222" color="white" borderColor="dark.border" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label color="secondary.500" fontWeight="700">מגבלת חוגים</Field.Label>
                    <Input name="max_classes_per_month" type="number" value={form.max_classes_per_month} onChange={handleChange} bg="#222" color="white" borderColor="dark.border" />
                  </Field.Root>
                  <Flex gap={3} mt={2} justify="flex-end">
                    <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
                    <Button type="submit" colorPalette="brand">{initialData ? 'עדכן' : 'הוסף'}</Button>
                  </Flex>
                </Flex>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
