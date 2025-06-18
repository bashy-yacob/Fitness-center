import React from 'react';
import '../css/MessagesPage.css'; // Keep if it has general page styling

function MessagesPage() {
    return (
        <div className="messages-page-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
            <h1>הודעות</h1>
            <p style={{ fontSize: '1.2rem', color: '#555' }}>אזור ההודעות נמצא כעת בפיתוח ויהיה זמין בקרוב.</p>
            {/* You can add an icon or image here if you want */}
        </div>
    );
}

export default MessagesPage;