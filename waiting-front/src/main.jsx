import React ,{ StrictMode } from 'react'
import ReactDOM,{ createRoot } from 'react-dom/client'
import App from './App'
import "./styles.css"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
