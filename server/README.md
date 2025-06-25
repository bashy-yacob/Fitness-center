# GymFlow - צד שרת

## סיכום כללי

GymFlow הוא שרת Node.js מבוסס Express שמנהל מערכת לניהול מכון כושר: משתמשים, מאמנים, מתאמנים, חבילות מנוי, תשלומים, חדרים, שיעורים, הודעות, ועוד. השרת מחובר למסד נתונים MySQL ומספק API REST מלא לצד הלקוח.

### מבנה עיקרי
- **server.js**: קובץ הכניסה הראשי, מגדיר את כל הראוטים, מחבר למסד הנתונים, ומפעיל את השרת.
- **controllers/**: לוגיקת קצה (API) - כל Controller אחראי על ניהול בקשות HTTP עבור ישות מסוימת (משתמש, מאמן, מנוי וכו').
- **services/**: לוגיקת שרת עסקית - כל Service מבצע את הפעולות מול מסד הנתונים.
- **routes/**: מגדיר את הנתיבים (endpoints) של ה-API.
- **middleware/**: ניהול שגיאות, הרשאות, ולידציות, העלאות קבצים.
- **utils/**: פונקציות עזר (למשל הצפנת סיסמאות).

---

## Controllers - כל הפונקציות

### userController.js
- **getAttendedClasses**: מחזיר כמה שיעורים המשתמש נכח בהם בפועל. (GET /api/users/:userId/attended-classes)
- **getActiveSubscription**: מחזיר את המנוי הפעיל של המשתמש. (GET /api/users/:userId/active-subscription)
- **createUserByAdmin**: יצירת משתמש חדש ע"י אדמין, כולל יצירת פרופיל מתאמן/מאמן. (POST /api/users/admin)
- **getAllUsers**: מחזיר את כל המשתמשים במערכת. (GET /api/users)
- **getAllUsersMinimal**: מחזיר רשימה מצומצמת של משתמשים (לפי סוג המשתמש המחובר). (GET /api/users/minimal)
- **getUserById**: מחזיר פרטי משתמש לפי מזהה. (GET /api/users/:id)
- **updateUser**: עדכון פרטי משתמש. (PUT /api/users/:id)
- **deleteUser**: מחיקת משתמש. (DELETE /api/users/:id)
- **getMe**: מחזיר את פרטי המשתמש שמחובר כרגע (ע"פ טוקן). (GET /api/users/me)
- **updateMe**: עדכון פרטי המשתמש שמחובר כרגע. (PUT /api/users/me)
- **uploadProfilePicture**: העלאת תמונת פרופיל למשתמש. (POST /api/users/me/profile-picture)
- **getUsersByType**: מחזיר משתמשים לפי סוג (admin/trainee/trainer). (GET /api/users/type/:userType)
- **getReceivedMessages**: מחזיר הודעות פרטיות שהמשתמש קיבל. (GET /api/users/:userId/received-messages)

### trainerController.js
- **getTrainerDashboardSummary**: מחזיר סיכום סטטיסטיקות למאמן (מספר שיעורים, מתאמנים, הודעות). (GET /api/trainer/:trainerId/dashboard)
- **getUpcomingClasses**: מחזיר את השיעורים הקרובים של המאמן. (GET /api/trainer/:trainerId/upcoming-classes)
- **getRecentMessages**: הודעות אחרונות של המאמן. (GET /api/trainer/:trainerId/recent-messages)
- **fetchTraineesByTrainerId**: מחזיר את כל המתאמנים של המאמן. (GET /api/trainer/:trainerId/trainees)
- **sendMessagesToTrainees**: שליחת הודעה פרטית למתאמנים. (POST /api/trainer/:trainerId/send-messages)
- **getSentMessages**: הודעות שנשלחו ע"י המאמן. (GET /api/trainer/:trainerId/sent-messages)
- **sendMessageToClass**: שליחת הודעה לכל משתתפי שיעור. (POST /api/trainer/:trainerId/send-class-message)
- **sendMessageToAdmin**: שליחת הודעה לאדמין. (POST /api/trainer/:trainerId/send-admin-message)
- **createClassByTrainer**: יצירת שיעור חדש ע"י מאמן. (POST /api/trainer/:trainerId/classes)
- **getAttendanceSummary**: סטטיסטיקות נוכחות לשיעורים של המאמן. (GET /api/trainer/:trainerId/attendance-summary)
- **getStatsPerTrainee**: סטטיסטיקות לכל מתאמן של המאמן. (GET /api/trainer/:trainerId/trainee-stats)
- **getTrainerSchedule**: לוח שיעורים של המאמן. (GET /api/trainer/:trainerId/schedule)

### subscriptionController.js
- **getSubscriptionTypeById**: מחזיר סוג מנוי לפי מזהה. (GET /api/subscriptions/types/:id)
- **getAllSubscriptionTypes**: מחזיר את כל סוגי המנויים. (GET /api/subscriptions/types)
- **updateSubscriptionType**: עדכון סוג מנוי. (PUT /api/subscriptions/types/:id)
- **deleteSubscriptionType**: מחיקת סוג מנוי. (DELETE /api/subscriptions/types/:id)
- **purchaseSubscription**: רכישת מנוי ע"י מתאמן. (POST /api/subscriptions/purchase)
- **getUserSubscriptions**: כל המנויים של מתאמן. (GET /api/subscriptions/user)
- **getActiveUserSubscription**: המנוי הפעיל של מתאמן. (GET /api/subscriptions/active)
- **getSubscriptionsForUser**: כל המנויים של משתמש מסוים (עבור אדמין). (GET /api/subscriptions/user/:userId)
- **createSubscriptionType**: יצירת סוג מנוי חדש. (POST /api/subscriptions/types)

### classController.js
- **createClass**: יצירת חוג חדש. (POST /api/classes)
- **getClassById**: מחזיר חוג לפי מזהה. (GET /api/classes/:id)
- **getAllClasses**: מחזיר את כל החוגים (אפשר לסנן לפי מתאמן). (GET /api/classes)
- **updateClass**: עדכון חוג קיים. (PUT /api/classes/:id)
- **deleteClass**: מחיקת חוג. (DELETE /api/classes/:id)
- **registerForClass**: רישום מתאמן לחוג. (POST /api/classes/:id/register)
- **unregisterFromClass**: ביטול רישום מתאמן מחוג. (DELETE /api/classes/:id/unregister)
- **getClassRegistrations**: מחזיר את כל המתאמנים הרשומים לחוג מסוים. (GET /api/classes/:id/registrations)
- **registerUserForClass**: רישום מתאמן מחובר לחוג. (POST /api/classes/register)
- **getRegisteredClassesForUser**: כל החוגים שמתאמן מסוים רשום אליהם. (GET /api/classes/user/:userId/registered)
- **payAndRegisterForClass**: רישום לחוג כולל תשלום. (POST /api/classes/:id/register/pay)

### roomController.js
- **createRoom**: יצירת חדר חדש. (POST /api/rooms)
- **getRoomById**: מחזיר חדר לפי מזהה. (GET /api/rooms/:id)
- **getAllRooms**: מחזיר את כל החדרים. (GET /api/rooms)
- **updateRoom**: עדכון חדר קיים. (PUT /api/rooms/:id)
- **deleteRoom**: מחיקת חדר. (DELETE /api/rooms/:id)

### paymentController.js
- **getPaymentById**: מחזיר תשלום לפי מזהה. (GET /api/payments/:id)
- **getPaymentsByUser**: מחזיר את כל התשלומים של משתמש מסוים. (GET /api/payments/user/:userId)
- **getAllPayments**: מחזיר את כל התשלומים (אפשר לסנן). (GET /api/payments)
- **updatePaymentStatus**: עדכון סטטוס תשלום. (PUT /api/payments/:id/status)
- **deletePayment**: מחיקת תשלום. (DELETE /api/payments/:id)

### pricingPackageController.js
- **getAllPricingPackages**: מחזיר את כל חבילות המחיר הפעילות. (GET /api/pricing-packages)
- **getPricingPackageById**: מחזיר חבילת מחיר לפי מזהה. (GET /api/pricing-packages/:id)
- **createPricingPackage**: יצירת חבילת מחיר חדשה. (POST /api/pricing-packages)
- **updatePricingPackage**: עדכון חבילת מחיר קיימת. (PUT /api/pricing-packages/:id)
- **deletePricingPackage**: מחיקת חבילת מחיר. (DELETE /api/pricing-packages/:id)

### authController.js
- **register**: רישום משתמש חדש. (POST /api/auth/register)
- **login**: התחברות משתמש. (POST /api/auth/login)
- **logout**: התנתקות משתמש. (POST /api/auth/logout)

### assignProgramController.js
- **assignTrainingProgram**: שיוך תוכנית אימון למתאמן ע"י מאמן. (POST /api/assign-program)

### traineeController.js
- **getTraineeDashboard**: מחזיר דאשבורד למתאמן (כולל סטטיסטיקות, שיעורים, מנויים וכו'). (GET /api/trainee/:traineeId/dashboard)
- **getActiveTrainingProgram**: מחזיר את תוכנית האימון הפעילה של מתאמן. (GET /api/trainee/:traineeId/active-program)
- **getAllTrainingPrograms**: מחזיר את כל תוכניות האימון במערכת. (GET /api/training-programs)

### messageController.js
- **broadcastMessage**: שליחת הודעה שיווקית לכל המשתמשים. (POST /api/messages/broadcast)
- **getSentMessages**: מחזיר את כל ההודעות השיווקיות שנשלחו. (GET /api/messages/sent)
- **updateBroadcastMessage**: עדכון הודעה שיווקית. (PUT /api/messages/broadcast/:id)
- **deleteBroadcastMessage**: מחיקת הודעה שיווקית. (DELETE /api/messages/broadcast/:id)
- **getPrivateMessagesForTrainee**: מחזיר הודעות פרטיות למתאמן. (GET /api/messages/trainee/:traineeId/private)
- **sendPrivateMessageToTrainee**: שליחת הודעה פרטית למתאמן. (POST /api/messages/trainee/:traineeId/private)

### adminController.js
- **getAdminDashboardData**: מחזיר נתוני דאשבורד לאדמין (כמות משתמשים, הכנסות, חוגים פעילים). (GET /api/admin/dashboard)

---

## Services - כל הפונקציות

### userService.js
- **getAttendedClassesCount(userId)**: מחזיר כמה שיעורים המשתמש נכח בהם בפועל.
- **getActiveSubscription(userId)**: מחזיר את המנוי הפעיל של המשתמש.
- **getAllUsers()**: מחזיר את כל המשתמשים עם פרטי פרופיל.
- **getUsersByType(userType)**: מחזיר משתמשים לפי סוג (admin/trainee/trainer).
- **getUserById(userId)**: מחזיר פרטי משתמש מלאים לפי מזהה.
- **getUserWithCredentials(email)**: מחזיר משתמש כולל סיסמה מוצפנת (לצורך התחברות).
- **getUserClassSchedule(userId, startDate, endDate)**: מחזיר לוח שיעורים של המשתמש.
- **getAllUsersMinimal()**: מחזיר רשימה מצומצמת של כל המשתמשים.
- **findUserByEmail(email)**: מחפש משתמש לפי אימייל.
- **createUser(userData)**: יוצר משתמש חדש.
- **saveUserCredentials(userId, password_hash)**: שומר סיסמה מוצפנת למשתמש.
- **createTraineeProfile(userId, date_of_birth, gender)**: יוצר/מעודכן פרופיל מתאמן.
- **createTrainerProfile(userId, specialization, bio)**: יוצר/מעודכן פרופיל מאמן.
- **updateUser(userId, userData)**: עדכון פרטי משתמש ופרופיל.
- **updateUserProfilePicture(userId, pictureUrl)**: עדכון תמונת פרופיל.
- **countUsers()**: מחזיר את מספר המשתמשים.
- **deleteUser(userId)**: מוחק משתמש וכל התלויות במסד.
- **getReceivedMessages(userId)**: מחזיר הודעות שהמשתמש קיבל.

### trainerService.js
- **getTrainerDashboardSummary(trainerId)**: סיכום סטטיסטיקות למאמן.
- **getUpcomingClasses(trainerId)**: שיעורים קרובים של המאמן.
- **getRecentMessages(trainerId)**: הודעות אחרונות של המאמן.
- **fetchTraineesByTrainerId(trainerId)**: כל המתאמנים של המאמן.
- **sendMessagesToTrainees(trainerId, traineeIds, messageText)**: שליחת הודעה פרטית למתאמנים.
- **sendMessageToClass(trainerId, classId, messageText)**: שליחת הודעה לכל משתתפי שיעור.
- **sendMessageToAdmin(trainerId, messageText)**: שליחת הודעה לאדמין.
- **getSentMessages(trainerId)**: הודעות שנשלחו ע"י המאמן.
- **getAttendanceSummary(trainerId)**: סטטיסטיקות נוכחות לשיעורים של המאמן.
- **getStatsPerTrainee(trainerId)**: סטטיסטיקות לכל מתאמן של המאמן.
- **getTrainerSchedule(trainerId)**: לוח שיעורים של המאמן.

### traineeService.js
- **getTraineeDashboard(traineeId)**: מחזיר דאשבורד למתאמן.
- **findActiveProgramForTrainee(traineeId)**: מחזיר את תוכנית האימון הפעילה של מתאמן.
- **assignTrainingProgramToTrainee(traineeId, programId, assignedByTrainerId)**: משייך תוכנית אימון למתאמן.
- **getAllTrainingPrograms()**: מחזיר את כל תוכניות האימון במערכת.

### subscriptionService.js
- **createSubscriptionType(subscriptionData)**: יצירת סוג מנוי חדש.
- **getSubscriptionTypeById(subscriptionId)**: מחזיר סוג מנוי לפי מזהה.
- **getAllSubscriptionTypes()**: מחזיר את כל סוגי המנויים.
- **updateSubscriptionType(subscriptionId, subscriptionData)**: עדכון סוג מנוי.
- **deleteSubscriptionType(subscriptionId)**: מחיקת סוג מנוי.
- **purchaseSubscription(traineeId, subscriptionTypeId, paymentDetails)**: רכישת מנוי ע"י מתאמן.
- **getUserSubscriptions(traineeId)**: כל המנויים של מתאמן.
- **findActiveSubscriptionForUser(traineeId)**: מחזיר את המנוי הפעיל של מתאמן.

### roomService.js
- **createRoom(roomData)**: יצירת חדר חדש.
- **getRoomById(roomId)**: מחזיר חדר לפי מזהה.
- **getAllRooms()**: מחזיר את כל החדרים.
- **updateRoom(roomId, roomData)**: עדכון חדר קיים.
- **deleteRoom(roomId)**: מחיקת חדר.

### paymentService.js
- **getPaymentById(paymentId)**: מחזיר תשלום לפי מזהה.
- **getAllPayments(filters)**: מחזיר את כל התשלומים (אפשר לסנן).
- **updatePaymentStatus(paymentId, newStatus, notes)**: עדכון סטטוס תשלום.
- **deletePayment(paymentId)**: מחיקת תשלום.
- **getPaymentsByUser(userId)**: מחזיר את כל התשלומים של משתמש מסוים.
- **getMonthlyRevenue()**: מחזיר הכנסות חודשיות.

### classService.js
- **createClass(classData)**: יצירת חוג חדש.
- **getClassById(classId)**: מחזיר חוג לפי מזהה.
- **getAllClasses(traineeId)**: מחזיר את כל החוגים (אפשר לסנן לפי מתאמן).
- **updateClass(classId, classData)**: עדכון חוג קיים.
- **deleteClass(classId)**: מחיקת חוג.
- **registerForClass(traineeId, classId)**: רישום מתאמן לחוג.
- **unregisterFromClass(traineeId, classId)**: ביטול רישום מתאמן מחוג.
- **getClassRegistrations(classId)**: מחזיר את כל המתאמנים הרשומים לחוג מסוים.
- **getRegisteredClassesForUser(traineeId)**: כל החוגים שמתאמן מסוים רשום אליהם.
- **processRegistrationWithPayment(traineeId, classId)**: רישום לחוג כולל תשלום.
- **countActiveClasses()**: מחזיר את מספר החוגים הפעילים.

### messageService.js
- **sendBroadcastMessage(senderId, subject, text)**: שליחת הודעה שיווקית (broadcast).
- **fetchSentMessages()**: שליפת כל ההודעות השיווקיות שנשלחו.
- **sendPrivateMessage(senderId, receiverId, text)**: שליחת הודעה פרטית.
- **fetchPrivateMessages(userId)**: שליפת הודעות פרטיות למשתמש מסוים.
- **fetchPrivateMessagesWithSender(userId)**: שליפת הודעות פרטיות כולל שם השולח.
- **markMessageAsRead(messageId)**: עדכון סטטוס קריאה להודעה.
- **sendClassUpdate(senderId, receiverId, text)**: שליחת הודעת עדכון חוג.
- **fetchClassUpdates(userId)**: שליפת הודעות עדכון חוג למשתמש.
- **updateBroadcastMessage(id, subject, text)**: עדכון הודעה שיווקית.
- **deleteBroadcastMessage(id)**: מחיקת הודעה שיווקית.
- **fetchSentPrivateMessages(senderId)**: שליפת הודעות פרטיות שנשלחו ע"י משתמש מסוים.

### pricingPackageService.js
- **getAllPricingPackages()**: מחזיר את כל חבילות המחיר הפעילות.
- **getPricingPackageById(id)**: מחזיר חבילת מחיר לפי מזהה.
- **createPricingPackage(packageData)**: יצירת חבילת מחיר חדשה.
- **updatePricingPackage(id, packageData)**: עדכון חבילת מחיר קיימת.
- **deletePricingPackage(id)**: מחיקת חבילת מחיר (soft delete).

### authService.js
- **register(userData)**: רישום משתמש חדש.
- **login(email, password)**: התחברות משתמש.

### adminService.js
- **getUserCounts()**: מחזיר את מספר המשתמשים במערכת.
- **getMonthlyRevenue()**: מחזיר את ההכנסות החודשיות.
- **getActiveClassesCount()**: מחזיר את מספר החוגים הפעילים.

---

## הערות
- כל פונקציה ב-Controller ממוקמת בתיקיית `controllers/` לפי שם הישות.
- כל פונקציה ב-Service ממוקמת בתיקיית `services/` לפי שם הישות.
- כל ראוט מוגדר ב-routes/ וממפה לפונקציות Controller.
- יש שימוש ב-middlewares לאימות, הרשאות, טיפול בשגיאות, ולידציות, והעלאת קבצים.
- כל קריאה למסד נתונים מתבצעת דרך pool מ-MySQL.

---

לשאלות נוספות, עיין בקוד או פנה למפתח.
