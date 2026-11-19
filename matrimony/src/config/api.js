const configuredBase = import.meta.env.VITE_API_BASE?.trim().replace(/\/+$/, '')

export const API_BASE = configuredBase || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

export default API_BASE
