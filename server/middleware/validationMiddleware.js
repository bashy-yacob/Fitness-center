// middleware/validationMiddleware.js
import Joi from 'joi';

// סכימת ולידציה לרישום משתמש
const registerSchema = Joi.object({
    first_name: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'שם פרטי חייב להיות טקסט.',
        'string.empty': 'שם פרטי לא יכול להיות ריק.',
        'string.min': 'שם פרטי חייב להכיל לפחות 2 תווים.',
        'string.max': 'שם פרטי לא יכול להכיל יותר מ-50 תווים.',
        'any.required': 'שם פרטי הוא שדה חובה.'
    }),
    last_name: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'שם משפחה חייב להיות טקסט.',
        'string.empty': 'שם משפחה לא יכול להיות ריק.',
        'string.min': 'שם משפחה חייב להכיל לפחות 2 תווים.',
        'string.max': 'שם משפחה לא יכול להכיל יותר מ-50 תווים.',
        'any.required': 'שם משפחה הוא שדה חובה.'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.base': 'אימייל חייב להיות טקסט.',
        'string.empty': 'אימייל לא יכול להיות ריק.',
        'string.email': 'פורמט אימייל אינו תקין.',
        'any.required': 'אימייל הוא שדה חובה.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'סיסמה חייבת להיות טקסט.',
        'string.empty': 'סיסמה לא יכולה להיות ריקה.',
        'string.min': 'סיסמה חייבת להכיל לפחות 6 תווים.',
        'any.required': 'סיסמה היא שדה חובה.'
    }),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.base': 'מספר טלפון חייב להיות טקסט.',
        'string.empty': 'מספר טלפון לא יכול להיות ריק.',
        'string.pattern.base': 'פורמט מספר טלפון אינו תקין (10 ספרות בלבד).',
        'any.required': 'מספר טלפון הוא שדה חובה.'
    }),
    user_type: Joi.string().valid('trainee', 'trainer', 'admin').required().messages({
        'string.base': 'סוג משתמש חייב להיות טקסט.',
        'string.empty': 'סוג משתמש לא יכול להיות ריק.',
        'any.only': 'סוג משתמש חייב להיות "trainee", "trainer" או "admin".',
        'any.required': 'סוג משתמש הוא שדה חובה.'
    }),
    // שדות ספציפיים למתאמן/מאמן - אופציונליים ומוגדרים לפי user_type
    date_of_birth: Joi.date().iso().when('user_type', {
        is: 'trainee',
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({
        'date.base': 'תאריך לידה חייב להיות תאריך תקין.',
        'date.format': 'פורמט תאריך לידה חייב להיות YYYY-MM-DD.',
        'any.required': 'תאריך לידה הוא שדה חובה עבור מתאמן.'
    }),
    gender: Joi.string().valid('male', 'female', 'other').when('user_type', {
        is: 'trainee',
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({
        'string.base': 'מין חייב להיות טקסט.',
        'string.empty': 'מין לא יכול להיות ריק.',
        'any.only': 'מין חייב להיות "male", "female" או "other".',
        'any.required': 'מין הוא שדה חובה עבור מתאמן.'
    }),
    specialization: Joi.string().trim().max(255).when('user_type', {
        is: 'trainer',
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({
        'string.base': 'התמחות חייבת להיות טקסט.',
        'string.empty': 'התמחות לא יכולה להיות ריקה.',
        'string.max': 'התמחות לא יכולה להכיל יותר מ-255 תווים.',
        'any.required': 'התמחות היא שדה חובה עבור מאמן.'
    }),
    bio: Joi.string().trim().max(1000).optional().messages({
        'string.base': 'תיאור אישי חייב להיות טקסט.',
        'string.max': 'תיאור אישי לא יכול להכיל יותר מ-1000 תווים.'
    }),
});

// סכימת ולידציה להתחברות משתמש
const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.base': 'אימייל חייב להיות טקסט.',
        'string.empty': 'אימייל לא יכול להיות ריק.',
        'string.email': 'פורמט אימייל אינו תקין.',
        'any.required': 'אימייל הוא שדה חובה.'
    }),
    password: Joi.string().required().messages({
        'string.base': 'סיסמה חייבת להיות טקסט.',
        'string.empty': 'סיסמה לא יכולה להיות ריקה.',
        'any.required': 'סיסמה היא שדה חובה.'
    }),
});

// פונקציית Middleware גנרית לולידציה
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false יציג את כל השגיאות
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const updateUserSchema = Joi.object({
    first_name: Joi.string().trim().min(2).max(50).optional().messages({
        'string.base': 'שם פרטי חייב להיות טקסט.',
        'string.min': 'שם פרטי חייב להכיל לפחות 2 תווים.',
        'string.max': 'שם פרטי לא יכול להכיל יותר מ-50 תווים.'
    }),
    last_name: Joi.string().trim().min(2).max(50).optional().messages({
        'string.base': 'שם משפחה חייב להיות טקסט.',
        'string.min': 'שם משפחה חייב להכיל לפחות 2 תווים.',
        'string.max': 'שם משפחה לא יכול להכיל יותר מ-50 תווים.'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).optional().messages({
        'string.base': 'אימייל חייב להיות טקסט.',
        'string.email': 'פורמט אימייל אינו תקין.'
    }),
    password: Joi.string().min(6).optional().messages({
        'string.base': 'סיסמה חייבת להיות טקסט.',
        'string.min': 'סיסמה חייבת להכיל לפחות 6 תווים.'
    }),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
        'string.base': 'מספר טלפון חייב להיות טקסט.',
        'string.pattern.base': 'פורמט מספר טלפון אינו תקין (10 ספרות בלבד).'
    }),
    user_type: Joi.string().valid('trainee', 'trainer', 'admin').optional().messages({
        'string.base': 'סוג משתמש חייב להיות טקסט.',
        'any.only': 'סוג משתמש חייב להיות "trainee", "trainer" או "admin".'
    }),
    date_of_birth: Joi.date().iso().optional().messages({
        'date.base': 'תאריך לידה חייב להיות תאריך תקין.',
        'date.format': 'פורמט תאריך לידה חייב להיות YYYY-MM-DD.'
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
        'string.base': 'מין חייב להיות טקסט.',
        'any.only': 'מין חייב להיות "male", "female" או "other".'
    }),
    specialization: Joi.string().trim().max(255).optional().messages({
        'string.base': 'התמחות חייבת להיות טקסט.',
        'string.max': 'התמחות לא יכולה להכיל יותר מ-255 תווים.'
    }),
    bio: Joi.string().trim().max(1000).optional().messages({
        'string.base': 'תיאור אישי חייב להיות טקסט.',
        'string.max': 'תיאור אישי לא יכול להכיל יותר מ-1000 תווים.'
    }),
    profile_picture_url: Joi.string().uri().optional().messages({
        'string.base': 'כתובת תמונה חייבת להיות טקסט.',
        'string.uri': 'כתובת תמונה אינה תקינה.'
    }),
});



const createClassSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255).required().messages({
        'string.empty': 'שם חוג לא יכול להיות ריק.',
        'string.min': 'שם חוג חייב להכיל לפחות 3 תווים.',
        'string.max': 'שם חוג לא יכול להכיל יותר מ-255 תווים.',
        'any.required': 'שם חוג הוא שדה חובה.'
    }),
    description: Joi.string().trim().max(1000).optional().messages({
        'string.max': 'תיאור חוג לא יכול להכיל יותר מ-1000 תווים.'
    }),
    start_time: Joi.date().iso().required().messages({
        'date.base': 'זמן התחלה חייב להיות תאריך תקין.',
        'date.format': 'פורמט זמן התחלה אינו תקין.',
        'any.required': 'זמן התחלה הוא שדה חובה.'
    }),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required().messages({
        'date.base': 'זמן סיום חייב להיות תאריך תקין.',
        'date.format': 'פורמט זמן סיום אינו תקין.',
        'date.greater': 'זמן סיום חייב להיות מאוחר מזמן התחלה.',
        'any.required': 'זמן סיום הוא שדה חובה.'
    }),
    room_id: Joi.number().integer().positive().required().messages({
        'number.base': 'מזהה חדר חייב להיות מספר.',
        'number.integer': 'מזהה חדר חייב להיות מספר שלם.',
        'number.positive': 'מזהה חדר חייב להיות מספר חיובי.',
        'any.required': 'מזהה חדר הוא שדה חובה.'
    }),
    trainer_id: Joi.number().integer().positive().required().messages({
        'number.base': 'מזהה מאמן חייב להיות מספר.',
        'number.integer': 'מזהה מאמן חייב להיות מספר שלם.',
        'number.positive': 'מזהה מאמן חייב להיות מספר חיובי.',
        'any.required': 'מזהה מאמן הוא שדה חובה.'
    }),
    max_capacity: Joi.number().integer().min(1).required().messages({
        'number.base': 'קיבולת מקסימלית חייבת להיות מספר.',
        'number.integer': 'קיבולת מקסימלית חייבת להיות מספר שלם.',
        'number.min': 'קיבולת מקסימלית חייבת להיות לפחות 1.',
        'any.required': 'קיבולת מקסימלית היא שדה חובה.'
    }),
});

const updateClassSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255).optional(),
    description: Joi.string().trim().max(1000).optional(),
    start_time: Joi.date().iso().optional(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).optional(),
    room_id: Joi.number().integer().positive().optional(),
    trainer_id: Joi.number().integer().positive().optional(),
    max_capacity: Joi.number().integer().min(1).optional(),
    is_active: Joi.boolean().optional(),
});


const createRoomSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'שם חדר לא יכול להיות ריק.',
        'string.min': 'שם חדר חייב להכיל לפחות 2 תווים.',
        'string.max': 'שם חדר לא יכול להכיל יותר מ-100 תווים.',
        'any.required': 'שם חדר הוא שדה חובה.'
    }),
    capacity: Joi.number().integer().min(1).required().messages({
        'number.base': 'קיבולת חייבת להיות מספר.',
        'number.integer': 'קיבולת חייבת להיות מספר שלם.',
        'number.min': 'קיבולת חייבת להיות לפחות 1.',
        'any.required': 'קיבולת היא שדה חובה.'
    }),
});

const updateRoomSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    capacity: Joi.number().integer().min(1).optional(),
});

const createSubscriptionSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required().messages({
        'string.empty': 'שם מנוי לא יכול להיות ריק.',
        'string.min': 'שם מנוי חייב להכיל לפחות 3 תווים.',
        'string.max': 'שם מנוי לא יכול להכיל יותר מ-100 תווים.',
        'any.required': 'שם מנוי הוא שדה חובה.'
    }),
    description: Joi.string().trim().max(1000).optional().messages({
        'string.max': 'תיאור מנוי לא יכול להכיל יותר מ-1000 תווים.'
    }),
    price: Joi.number().precision(2).positive().required().messages({
        'number.base': 'מחיר חייב להיות מספר.',
        'number.precision': 'מחיר יכול להכיל עד 2 ספרות אחרי הנקודה העשרונית.',
        'number.positive': 'מחיר חייב להיות מספר חיובי.',
        'any.required': 'מחיר הוא שדה חובה.'
    }),
    duration_months: Joi.number().integer().min(1).required().messages({
        'number.base': 'משך חודשים חייב להיות מספר.',
        'number.integer': 'משך חודשים חייב להיות מספר שלם.',
        'number.min': 'משך חודשים חייב להיות לפחות חודש אחד.'
        // 'any.required': 'משך חודשים הוא שדה חובה.'
    }),
    is_active: Joi.boolean().optional(),
});

const updateSubscriptionSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).optional(),
    description: Joi.string().trim().max(1000).optional(),
    price: Joi.number().precision(2).positive().optional(),
    duration_months: Joi.number().integer().min(1).optional(),
    is_active: Joi.boolean().optional(),
});

const purchaseSubscriptionSchema = Joi.object({
    subscriptionTypeId: Joi.number().integer().positive().required().messages({
        'number.base': 'מזהה סוג מנוי חייב להיות מספר.',
        'number.integer': 'מזהה סוג מנוי חייב להיות מספר שלם.',
        'number.positive': 'מזהה סוג מנוי חייב להיות מספר חיובי.',
        'any.required': 'מזהה סוג מנוי הוא שדה חובה.'
    }),
    paymentDetails: Joi.object({
        transaction_id: Joi.string().trim().max(255).optional(),
        status: Joi.string().valid('completed', 'pending', 'failed', 'refunded').optional().default('completed'),
        notes: Joi.string().trim().max(1000).optional(),
    }).optional(),
});


const updatePaymentStatusSchema = Joi.object({
    status: Joi.string().valid('completed', 'pending', 'failed', 'refunded').required().messages({
        'string.empty': 'סטטוס תשלום לא יכול להיות ריק.',
        'any.only': 'סטטוס תשלום חייב להיות אחד מהבאים: completed, pending, failed, refunded.',
        'any.required': 'סטטוס תשלום הוא שדה חובה.'
    }),
    notes: Joi.string().trim().max(1000).optional().messages({
        'string.max': 'הערות לא יכולות להכיל יותר מ-1000 תווים.'
    }),
});

// סכימת ולידציה ליצירת חבילת מחיר חדשה
const createPricingSchema = Joi.object({
    name: Joi.string().trim().min(2).max(255).required().messages({
        'string.base': 'שם החבילה חייב להיות טקסט',
        'string.empty': 'שם החבילה לא יכול להיות ריק',
        'string.min': 'שם החבילה חייב להכיל לפחות 2 תווים',
        'string.max': 'שם החבילה לא יכול להכיל יותר מ-255 תווים',
        'any.required': 'שם החבילה הוא שדה חובה'
    }),
    description: Joi.string().trim().max(1000).required().messages({
        'string.base': 'תיאור החבילה חייב להיות טקסט',
        'string.empty': 'תיאור החבילה לא יכול להיות ריק',
        'string.max': 'תיאור החבילה לא יכול להכיל יותר מ-1000 תווים',
        'any.required': 'תיאור החבילה הוא שדה חובה'
    }),
    price: Joi.number().positive().required().messages({
        'number.base': 'המחיר חייב להיות מספר',
        'number.positive': 'המחיר חייב להיות מספר חיובי',
        'any.required': 'מחיר הוא שדה חובה'
    }),
    duration_days: Joi.number().integer().positive().required().messages({
        'number.base': 'משך המנוי חייב להיות מספר',
        'number.integer': 'משך המנוי חייב להיות מספר שלם',
        'number.positive': 'משך המנוי חייב להיות מספר חיובי',
        'any.required': 'משך המנוי הוא שדה חובה'
    }),
    max_classes_per_month: Joi.number().integer().min(0).optional().messages({
        'number.base': 'מספר החוגים המקסימלי חייב להיות מספר',
        'number.integer': 'מספר החוגים המקסימלי חייב להיות מספר שלם',
        'number.min': 'מספר החוגים המקסימלי לא יכול להיות שלילי'
    })
});

// סכימת ולידציה לעדכון חבילת מחיר קיימת
const updatePricingSchema = Joi.object({
    name: Joi.string().trim().min(2).max(255).optional().messages({
        'string.base': 'שם החבילה חייב להיות טקסט',
        'string.empty': 'שם החבילה לא יכול להיות ריק',
        'string.min': 'שם החבילה חייב להכיל לפחות 2 תווים',
        'string.max': 'שם החבילה לא יכול להכיל יותר מ-255 תווים'
    }),
    description: Joi.string().trim().max(1000).optional().messages({
        'string.base': 'תיאור החבילה חייב להיות טקסט',
        'string.empty': 'תיאור החבילה לא יכול להיות ריק',
        'string.max': 'תיאור החבילה לא יכול להכיל יותר מ-1000 תווים'
    }),
    price: Joi.number().positive().optional().messages({
        'number.base': 'המחיר חייב להיות מספר',
        'number.positive': 'המחיר חייב להיות מספר חיובי'
    }),
    duration_days: Joi.number().integer().positive().optional().messages({
        'number.base': 'משך המנוי חייב להיות מספר',
        'number.integer': 'משך המנוי חייב להיות מספר שלם',
        'number.positive': 'משך המנוי חייב להיות מספר חיובי'
    }),
    max_classes_per_month: Joi.number().integer().min(0).optional().messages({
        'number.base': 'מספר החוגים המקסימלי חייב להיות מספר',
        'number.integer': 'מספר החוגים המקסימלי חייב להיות מספר שלם',
        'number.min': 'מספר החוגים המקסימלי לא יכול להיות שלילי'
    })
});

export {
    validate,
    registerSchema,
    loginSchema,
    updateUserSchema,
    createClassSchema,
    updateClassSchema,
    createRoomSchema,
    updateRoomSchema,
    createSubscriptionSchema,
    updateSubscriptionSchema,
    purchaseSubscriptionSchema,
    updatePaymentStatusSchema, // ייצוא הסכימה החדשה
    createPricingSchema,
    updatePricingSchema
};