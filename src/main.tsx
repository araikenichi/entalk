import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 全局样式从入口导入（不要在 index.html 里用 <link>）
import './index.css'

import ErrorBoundary from '../components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
