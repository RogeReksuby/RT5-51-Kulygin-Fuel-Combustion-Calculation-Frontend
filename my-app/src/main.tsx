import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'; 
import { store } from './store';        
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.tsx'
//import { registerSW } from 'virtual:pwa-register'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/web_rip_front/serviceWorker.js")
      .then(() => console.log("SW registered"))
      .catch(err => console.log("SW not registered", err))
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
