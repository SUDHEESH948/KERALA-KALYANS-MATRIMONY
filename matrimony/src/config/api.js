const configuredBase = import.meta.env.VITE_API_BASE?.trim().replace(/\/+$/, '')

const defaultBase = import.meta.env.DEV
  ? '/api'
  : 'https://kerala-kalyans-matrimony.onrender.com/api'

export const API_BASE = configuredBase || defaultBase

export default API_BASE
