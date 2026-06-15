# GymFlow — שפת עיצוב (Design System)

מסמך זה מתעד את שפת העיצוב של אפליקציית GymFlow. ניתן להזין אותו כקונטקסט לכל
סוכן/כלי AI כדי שייצר מסכים ורכיבים **בסגנון GymFlow** — או לשמש כמדריך למפתחים.

> **בקצרה:** אפליקציית כושר בעברית, **RTL**, **ערכת נושא כהה (dark)**, בנויה על
> **Chakra UI v3** עם ערכת tokens מותאמת (`src/theme.js`). אין CSS ידני ברכיבים
> חדשים — מעצבים דרך props של Chakra ו-tokens.

---

## 1. עקרונות יסוד

- **כהה כברירת מחדל.** הרקע הראשי כהה (`dark.bg`), כרטיסים מעט בהירים יותר, טקסט לבן/אפור בהיר.
- **RTL.** השפה עברית; פריסות מימין לשמאל. כותרות וטבלאות מיושרות בהתאם.
- **מבטא ירוק.** צבע המותג הוא ירוק כושר (`brand`), עם ורוד/סגול (`secondary`) כצבע משני/דגשים.
- **כותרות בולטות.** גופן `Rubik`, משקל 900, אותיות גדולות (uppercase), עם text-shadow ירקרק עדין.
- **Chakra בלבד.** רכיבים חדשים משתמשים ברכיבי Chakra ו-props — לא className/CSS חיצוני.

---

## 2. צבעים (Color Tokens)

מוגדרים ב-`src/theme.js` תחת `tokens.colors`. השתמש בשמות ה-token (לדוגמה `brand.500`),
לא ב-hex גולמי.

### `brand` — ירוק (צבע ראשי)
| Token | Hex | תפקיד |
|---|---|---|
| `brand.50` | `#e3f9e5` | רקע ירוק בהיר מאוד |
| `brand.100` | `#c1eac5` | |
| `brand.200` | `#a3d9a5` | |
| `brand.300` | `#7bc47f` | |
| `brand.400` | `#5ad472` | **Accent** — כותרות טבלה, אייקונים, דגשים |
| `brand.500` | `#22db47` | **כותרות / הצלחה** — `Heading` ראשיים |
| `brand.600` | `#0d6e20` | **Primary** — מצב hover של כפתורים ראשיים |
| `brand.700` | `#065014` | |
| `brand.800` | `#03360b` | |
| `brand.900` | `#012005` | |

### `secondary` — ורוד/סגול (משני)
| Token | Hex | תפקיד |
|---|---|---|
| `secondary.400` | `#d45abc` | **ורוד משני** — דגשים, תוויות |
| `secondary.500` | `#c918a6` | **Accent רך** — מסגרות מודאל, פעולות משניות |

### `dark` — משטחים
| Token | Hex | תפקיד |
|---|---|---|
| `dark.bg` | `#1a1a1a` | רקע ראשי של עמוד (`<Box bg="dark.bg" minH="100vh">`) |
| `dark.section` | `#232323` | רקע סקשן/אזור פנימי |
| `dark.card` | `#22282a` | רקע כרטיסים, טבלאות, מודאלים |
| `dark.border` | `#333333` | מסגרות |

### צבעי טקסט (משתמשים ב-Chakra defaults)
- טקסט ראשי: `white`
- טקסט משני/מעומעם: `gray.400`
- טקסט עדין מאוד / חותמות זמן: `gray.500`
- שגיאה: `red.400`

---

## 3. גופנים (Fonts)

מוגדרים ב-`src/theme.js`:
- **כותרות (`heading`)**: `'Rubik', 'Segoe UI', Arial, sans-serif`
- **גוף (`body`)**: `'Heebo', 'Arial', sans-serif`

סגנון כותרת אופייני: `fontWeight="900"`, `letterSpacing="1px"`, `textTransform="uppercase"`,
`textShadow="0 2px 8px rgba(34,219,71,0.15)"`, `color="brand.500"`.

---

## 4. פריסה (Layout)

עמוד טיפוסי:

```jsx
<Box bg="dark.bg" minH="100vh" py={10}>
  <Container maxW="container.lg">      {/* או container.xl */}
    <Heading mb={6} color="brand.500">כותרת העמוד</Heading>
    {/* תוכן */}
  </Container>
</Box>
```

- מרווח אנכי לעמוד: `py={10}`.
- רוחב תוכן: `Container maxW="container.lg"` / `"container.xl"`.
- מרווח מתחת לכותרת ראשית: `mb={6}`–`mb={8}`.

---

## 5. דפוסי רכיבים (Chakra v3)

> Chakra v3 משתמש ב-namespacing: `Table.Root`, `Card.Root`, `Dialog.Root`,
> `Field.Root`, `NativeSelect.Root` וכו'.

### כותרת
```jsx
<Heading mb={6} color="brand.500">ניהול חוגים</Heading>
```

### כרטיס
```jsx
<Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
  <Card.Body>
    {/* תוכן */}
  </Card.Body>
</Card.Root>
```

### טבלה
```jsx
<Box overflowX="auto">
  <Table.Root variant="outline" bg="dark.card">
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeader color="brand.400">שם</Table.ColumnHeader>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell color="white">ערך</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table.Root>
</Box>
```
כותרות עמודה תמיד `color="brand.400"`; תאים `color="white"`.

### כפתורים
```jsx
<Button colorPalette="brand">פעולה ראשית</Button>
<Button variant="outline">משני / ביטול</Button>
<Button colorPalette="secondary">פעולה משנית (ורוד)</Button>
<Button size="xs" variant="outline">ערוך</Button>
<Button size="xs" colorPalette="red" variant="ghost">מחק</Button>
```
- ראשי: `colorPalette="brand"`.
- הרסני (מחיקה): `colorPalette="red"` עם `variant="ghost"` או `"solid"`.
- פעולות בשורת טבלה: `size="xs"` עטופות ב-`<Flex gap={2}>`.

### שדות טופס
```jsx
<Field.Root required>
  <Field.Label color="gray.300">שם</Field.Label>
  <Input name="name" value={form.name} onChange={handleChange}
         bg="dark.bg" color="white" borderColor="dark.border" />
</Field.Root>
```
תפריט בחירה:
```jsx
<NativeSelect.Root>
  <NativeSelect.Field value={val} onChange={onChange}
                      bg="dark.bg" color="white" borderColor="dark.border">
    <option value="">בחר…</option>
  </NativeSelect.Field>
</NativeSelect.Root>
```
שדות תמיד: `bg="dark.bg"` (או `#222` במודאלים), `color="white"`, `borderColor="dark.border"`.
תוויות: `color="gray.300"` (טופס) או `color="secondary.500"` (מודאל מנויים).

### מודאל / דיאלוג
```jsx
<Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onClose(); }}>
  <Portal>
    <Dialog.Backdrop bg="rgba(26,26,26,0.85)" />
    <Dialog.Positioner>
      <Dialog.Content bg="dark.card" color="white"
                      borderRadius="18px" border="1.5px solid" borderColor="dark.border">
        <Dialog.CloseTrigger color="gray.400" />
        <Dialog.Header>
          <Dialog.Title color="brand.500">כותרת</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>{/* form */}</Dialog.Body>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
```

### מצב טעינה
```jsx
<Flex justify="center" align="center" minH="200px">
  <Spinner size="xl" color="brand.500" />
  <Text ml={4} color="white">טוען...</Text>
</Flex>
```

### Toast / הודעות מערכת
```jsx
import { createToaster } from '@chakra-ui/react';
const toaster = createToaster({ placement: 'top', duration: 5000 });
toaster.success({ title: 'נשמר בהצלחה' });
toaster.error({ title: 'שגיאה בשמירה' });
```

---

## 6. עיצוב כרטיס מותאם (לדוגמה: כרטיס תמחור)

ראה `src/components/PricingSection.jsx` — דוגמה מלאה לכרטיס מותאם עם hover:
```jsx
<Box
  bg="dark.card" borderRadius="18px" p="2rem"
  border="1.5px solid" borderColor="dark.border"
  boxShadow="0 4px 16px rgba(0, 0, 0, 0.12)"
  transition="transform 0.3s, box-shadow 0.2s, border 0.2s"
  _hover={{
    transform: 'translateY(-10px) scale(1.03)',
    boxShadow: '0 8px 32px 0 rgba(34, 219, 71, 0.1)',
    borderColor: 'brand.400',
  }}
>
  …
</Box>
```
רדיוס סטנדרטי לכרטיסים/מודאלים: `18px`. רדיוס לכפתור "הצטרף": `25px` (גלולה).

---

## 7. רכיבים משותפים בקוד

- `src/components/Navbar.jsx` — ניווט עליון (Chakra `Flex`/`Drawer`, אייקונים מ-`react-icons/fa`).
- `src/components/DataTable.jsx` — טבלה גנרית (`Table.Root`, כותרות `brand.400`).
- `src/components/PackageFormModal.jsx` — תבנית מודאל טופס (`Dialog`).
- `src/components/PricingSection.jsx` — כרטיסי תמחור מותאמים.
- אייקונים: `react-icons` (בעיקר `fa`).
- גרפים: `chart.js` + `react-chartjs-2`.

> רכיבים ישנים שעדיין נשענים על מחלקות CSS גלובליות (`FormField.jsx`, `Alert.jsx`)
> משתמשים בכללים מ-`src/styles/theme.css`. רכיבים **חדשים** צריכים להשתמש ב-Chakra.

---

## 8. היכן נמצאת "האמת"

| מה | קובץ |
|---|---|
| ערכת tokens של Chakra (צבעים, גופנים) | `gymflow-client/src/theme.js` |
| משתני CSS גלובליים + סגנונות בסיס ישנים | `gymflow-client/src/styles/theme.css` |
| ספק Chakra + טעינת theme גלובלי | `gymflow-client/src/main.jsx` |
| רכיבים משותפים | `gymflow-client/src/components/` |

לפני עיצוב מסך חדש — קרא את `theme.js` (לשמות ה-tokens) ואת אחד מעמודי הניהול
(למשל `src/pages/admin/AdminPackagesPage.jsx`) כהפניה חיה לדפוסים.
