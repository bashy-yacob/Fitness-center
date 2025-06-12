// middleware/errorMiddleware.js

// =================== תוספת נדרשת ===================
// הגדרת המחלקה לשגיאות מותאמות אישית
// היא יורשת מהמחלקה Error המובנית של JavaScript
class AppError extends Error {
    constructor(message, statusCode) {
        // קריאה לבנאי של Error עם ההודעה
        super(message);

        // הוספת מאפיינים ייחודיים לשגיאה שלנו
        this.statusCode = statusCode;
        // קביעת סטטוס 'fail' לשגיאות לקוח (4xx) ו'error' לשגיאות שרת (5xx)
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // סימון שזו שגיאה "תפעולית" (צפויה) ולא באג בקוד
        this.isOperational = true;

        // שומר את ה-stack trace הנכון
        Error.captureStackTrace(this, this.constructor);
    }
}
// ================= סוף תוספת נדרשת =================

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // הדפסת השגיאה המלאה ללוג השרת לצורך דיבוג

    const statusCode = err.statusCode || 500; // אם השגיאה כוללת סטטוס קוד, השתמש בו, אחרת 500
    const message = err.message || 'An unexpected error occurred'; // הודעה ידידותית למשתמש

    // במצב פיתוח, ניתן לשלוח את ה-stack trace
    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            message: message,
            stack: err.stack,
        });
    } else {
        // במצב פרודקשן, אל תשלח את ה-stack trace
        res.status(statusCode).json({
            message: message,
        });
    }
};
// ייצוא של שני הרכיבים: AppError ו-errorHandler
// שימו לב שהייצוא השתנה כדי לכלול את שניהם
export { errorHandler, AppError };