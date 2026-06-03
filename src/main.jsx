import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Chart as ChartJS } from 'chart.js'
import App from './App.jsx'
import { applyChartDefaults } from './lib/chartColors.js'
import './styles.css'

applyChartDefaults(ChartJS)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
