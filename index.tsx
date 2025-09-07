import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './contexts/I18nContext';
import { BrowserRouter } from 'react-router-dom'; // ← 追加！

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter basename="/nchat"> {/* ← 追加！ */}
        <App />
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
);

