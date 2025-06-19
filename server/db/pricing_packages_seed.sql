-- Pricing Packages Seed Data
INSERT INTO subscriptions (name, description, price, duration_days, max_classes_per_month, is_active) VALUES
('בסיסי', 'גישה לאזור המשקולות, אזור הקרדיו, כניסה חופשית, שירותים ומלתחות', 199.00, 30, NULL, TRUE),
('פרימיום', 'כל התכונות של הבסיסי, כל השיעורים הקבוצתיים, ייעוץ תזונה חודשי, חניה חינם', 299.00, 30, 12, TRUE),
('VIP', 'כל התכונות של הפרימיום, 2 אימונים אישיים בחודש, ליווי תזונאי צמוד, טיפולי ספא חודשיים', 499.00, 30, NULL, TRUE);
