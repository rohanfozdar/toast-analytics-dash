import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Chart as ChartJS } from 'chart.js'
import App from './App'
import { applyChartDefaults } from './lib/chartColors'
import './index.css'

applyChartDefaults(ChartJS)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
