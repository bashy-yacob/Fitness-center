use gymflow_db;


INSERT INTO subscriptions (id, name, description, price, duration_days, max_classes_per_month, is_active) VALUES
(1, 'בסיסי', 'גישה לאזור המשקולות, אזור הקרדיו, כניסה חופשית, שירותים ומלתחות', 199.00, 30, NULL, TRUE),
(2, 'פרימיום', 'כל התכונות של הבסיסי, כל השיעורים הקבוצתיים, ייעוץ תזונה חודשי, חניה חינם', 299.00, 30, 12, TRUE),
(3, 'VIP', 'כל התכונות של הפרימיום, 2 אימונים אישיים בחודש, ליווי תזונאי צמוד, טיפולי ספא חודשיים', 499.00, 30, NULL, TRUE);
