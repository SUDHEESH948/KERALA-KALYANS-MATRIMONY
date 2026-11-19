const configuredBase = import.meta.env.VITE_API_BASE?.trim().replace(/\/+$/, '')

const defaultBase = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://kerala-kalyans-matrimony.onrender.com/api'

export const API_BASE = configuredBase || defaultBase

export default API_BASE
