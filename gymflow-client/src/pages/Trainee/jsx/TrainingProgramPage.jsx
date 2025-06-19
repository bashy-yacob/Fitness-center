// src/pages/Trainee/jsx/TrainingProgramPage.jsx

import React from 'react';
// כאן אפשר לייבא קובץ CSS ייעודי אם תרצי בעתיד
// import '../css/TrainingProgramPage.css'; 

function TrainingProgramPage() {
    return (
        <div className="training-program-page-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
            <h1>תוכנית האימון שלי</h1>
            <p style={{ fontSize: '1.2rem', color: '#555' }}>
                אזור תוכנית האימון נמצא כעת בפיתוח ויהיה זמין בקרוב.
            </p>
            {/* כאן יוצגו פרטי תוכנית האימון מהמאמן */}
        </div>
    );
}

export default TrainingProgramPage;