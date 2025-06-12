import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.js';
import { AuthProvider } from './context/AuthContext.js';
const root = ReactDOM.createRoot(document.getElementById('root'));

// בניית עץ הקומפוננטות באמצעות React.createElement
root.render(
    React.createElement(React.StrictMode, null,
        React.createElement(BrowserRouter, null,
            React.createElement(AuthProvider, null,
                React.createElement(App, null)
            )
        )
    )
);