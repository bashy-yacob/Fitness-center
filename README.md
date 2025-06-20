# Fitness-center

בטח, בשמחה. הכנתי לך סיכום מפורט ומסודר של כל הראוטים (Routes) במערכת שלך.

הסיכום מחולק לפי קבצי ה-Routes, ובכל חלק תמצא טבלה שמפרטת:

שיטה (Method): הפעולה שמתבצעת (GET, POST, PUT, DELETE, PATCH).

נתיב (Route): כתובת ה-API המלאה.

מטרה (Purpose): מה הראוט עושה, כולל הרשאות נדרשות.

פונקציות מפעילות (Functions Triggered): הפונקציה ב-Controller שמטפלת בבקשה, והפונקציה העיקרית ב-Service שמבצעת את הלוגיקה מול בסיס הנתונים.

1. אימות והתחברות (/api/auth)

קובץ: authRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
POST	/api/auth/register	הרשמת משתמש חדש למערכת.	Controller: authController.register<br/>Service: authService.register
POST	/api/auth/login	התחברות משתמש קיים וקבלת טוקן (JWT).	Controller: authController.login<br/>Service: authService.login
GET	/api/auth/logout	התנתקות מהמערכת (בצד הלקוח). דורש טוקן תקין.	Controller: authController.logout<br/>Service: (אין פעולה בשרת)
2. ניהול משתמשים (/api/users)

קובץ: userRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
למשתמש המחובר (/me)			
GET	/api/users/me	קבלת פרטי הפרופיל של המשתמש המחובר.	Controller: userController.getMe<br/>Service: userService.getUserById
PUT	/api/users/me	עדכון פרטי הפרופיל של המשתמש המחובר.	Controller: userController.updateMe<br/>Service: userService.updateUser
POST	/api/users/me/profile-picture	העלאת תמונת פרופיל למשתמש המחובר.	Controller: userController.uploadProfilePicture<br/>Service: userService.updateUserProfilePicture
מידע נוסף על משתמש			
GET	/api/users/:userId/attended-classes	קבלת מספר השיעורים בהם משתמש השתתף.	Controller: userController.getAttendedClasses<br/>Service: userService.getAttendedClassesCount
GET	/api/users/:userId/active-subscription	קבלת המנוי הפעיל של משתמש.	Controller: userController.getActiveSubscription<br/>Service: userService.getActiveSubscription
ניהול על ידי אדמין			
POST	/api/users	(אדמין) יצירת משתמש חדש.	Controller: userController.createUserByAdmin<br/>Service: userService.createUserAdmin
GET	/api/users	(אדמין) קבלת רשימת כל המשתמשים.	Controller: userController.getAllUsers<br/>Service: userService.getAllUsers
GET	/api/users/:id	(אדמין) קבלת פרטי משתמש ספציפי לפי ID.	Controller: userController.getUserById<br/>Service: userService.getUserById
PUT	/api/users/:id	(אדמין) עדכון פרטי משתמש ספציפי לפי ID.	Controller: userController.updateUser<br/>Service: userService.updateUser
DELETE	/api/users/:id	(אדמין) מחיקת משתמש ספציפי לפי ID.	Controller: userController.deleteUser<br/>Service: userService.deleteUser
3. ניהול חוגים (/api/classes)

קובץ: classRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
POST	/api/classes	(אדמין) יצירת חוג חדש.	Controller: classController.createClass<br/>Service: classService.createClass
GET	/api/classes	קבלת רשימת כל החוגים (לכל משתמש מחובר).	Controller: classController.getAllClasses<br/>Service: classService.getAllClasses
GET	/api/classes/my-registrations	(מתאמן) קבלת רשימת כל החוגים שהמשתמש המחובר רשום אליהם.	Controller: classController.getRegisteredClassesForUser<br/>Service: classService.getRegisteredClassesForUser
GET	/api/classes/:id	קבלת פרטי חוג ספציפי לפי ID.	Controller: classController.getClassById<br/>Service: classService.getClassById
PUT	/api/classes/:id	(אדמין) עדכון פרטי חוג ספציפי.	Controller: classController.updateClass<br/>Service: classService.updateClass
DELETE	/api/classes/:id	(אדמין) מחיקת חוג ספציפי.	Controller: classController.deleteClass<br/>Service: classService.deleteClass
POST	/api/classes/:classId/register	(מתאמן) הרשמה לחוג.	Controller: classController.registerUserForClass<br/>Service: classService.registerForClass
DELETE	/api/classes/:classId/unregister	(מתאמן) ביטול הרשמה מחוג.	Controller: classController.unregisterFromClass<br/>Service: classService.unregisterFromClass
GET	/api/classes/:classId/registrations	(מאמן) קבלת רשימת המשתתפים הרשומים לחוג.	Controller: classController.getClassRegistrations<br/>Service: classService.getClassRegistrations
4. ניהול מנויים (/api/subscriptions)

קובץ: subscriptionRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
ניהול סוגי מנויים (אדמין)			
POST	/api/subscriptions/types	(אדמין) יצירת סוג מנוי חדש.	Controller: subscriptionController.createSubscriptionType<br/>Service: subscriptionService.createSubscriptionType
GET	/api/subscriptions/types	(אדמין) קבלת כל סוגי המנויים.	Controller: subscriptionController.getAllSubscriptionTypes<br/>Service: subscriptionService.getAllSubscriptionTypes
GET	/api/subscriptions/types/:id	(אדמין) קבלת סוג מנוי ספציפי לפי ID.	Controller: subscriptionController.getSubscriptionTypeById<br/>Service: subscriptionService.getSubscriptionTypeById
PUT	/api/subscriptions/types/:id	(אדמין) עדכון סוג מנוי.	Controller: subscriptionController.updateSubscriptionType<br/>Service: subscriptionService.updateSubscriptionType
DELETE	/api/subscriptions/types/:id	(אדמין) מחיקת סוג מנוי.	Controller: subscriptionController.deleteSubscriptionType<br/>Service: subscriptionService.deleteSubscriptionType
ניהול מנויים של משתמשים			
POST	/api/subscriptions/purchase	(מתאמן) רכישת מנוי.	Controller: subscriptionController.purchaseSubscription<br/>Service: subscriptionService.purchaseSubscription
GET	/api/subscriptions/my-subscriptions	(מתאמן) צפייה במנויים של המשתמש המחובר.	Controller: subscriptionController.getUserSubscriptions<br/>Service: subscriptionService.getUserSubscriptions
GET	/api/subscriptions/user/:userId	(אדמין) צפייה במנויים של משתמש ספציפי.	Controller: subscriptionController.getSubscriptionsForUser<br/>Service: subscriptionService.getUserSubscriptions
5. ניהול תשלומים (/api/payments)

קובץ: paymentRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
GET	/api/payments	קבלת רשימת כל התשלומים (אדמין בלבד, לפי הקוד).	Controller: paymentController.getAllPayments<br/>Service: paymentService.getAllPayments
GET	/api/payments/user/:userId	(מתאמן) קבלת היסטוריית התשלומים של המשתמש.	Controller: paymentController.getPaymentsByUser<br/>Service: paymentService.getPaymentsByUser
GET	/api/payments/:id	(מתאמן) קבלת פרטי תשלום ספציפי.	Controller: paymentController.getPaymentById<br/>Service: paymentService.getPaymentById
PATCH	/api/payments/:id/status	עדכון סטטוס של תשלום (לא מוגדר מי יכול).	Controller: paymentController.updatePaymentStatus<br/>Service: paymentService.updatePaymentStatus
DELETE	/api/payments/:id	מחיקת תשלום (לא מוגדר מי יכול).	Controller: paymentController.deletePayment<br/>Service: paymentService.deletePayment
6. ניהול חדרים (/api/rooms)

קובץ: roomRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
POST	/api/rooms	(אדמין) יצירת חדר חדש.	Controller: roomController.createRoom<br/>Service: roomService.createRoom
GET	/api/rooms	(אדמין) קבלת רשימת כל החדרים.	Controller: roomController.getAllRooms<br/>Service: roomService.getAllRooms
GET	/api/rooms/:id	(אדמין) קבלת פרטי חדר ספציפי.	Controller: roomController.getRoomById<br/>Service: roomService.getRoomById
PUT	/api/rooms/:id	(אדמין) עדכון פרטי חדר.	Controller: roomController.updateRoom<br/>Service: roomService.updateRoom
DELETE	/api/rooms/:id	(אדמין) מחיקת חדר.	Controller: roomController.deleteRoom<br/>Service: roomService.deleteRoom
7. דשבורד מתאמן (/api/trainee)

קובץ: traineeRoutes.js

שיטה	נתיב	מטרה	פונקציות מפעילות
GET	/api/trainee/dashboard/:traineeId	(מתאמן) קבלת נתוני הדשבורד: מנוי פעיל, חוגים קרובים וכו'.	Controller: traineeController.getTraineeDashboard<br/>Service: traineeService.getTraineeDashboard

מקווה שהסיכום הזה ברור ועוזר לך להבין את מבנה המערכת שבנית. עבודה מצוינת