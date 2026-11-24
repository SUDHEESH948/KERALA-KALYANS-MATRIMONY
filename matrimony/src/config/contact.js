import { API_BASE } from './api'

export const defaultContact = {
  whatsapp: '(+91) 79073 48468',
  phone: '(+91) 80755 88406',
  email: 'keralakalyan.matrimonial@gmail.com',
}

export const whatsappLink = number => `https://wa.me/${number.replace(/\D/g, '')}`
export const phoneLink = number => `tel:+${number.replace(/\D/g, '')}`
export const emailLink = email => `mailto:${encodeURIComponent(email).replace('%40', '@')}`

export async function requestContact(options) {
  const response = await fetch(`${API_BASE}/contact`, options)
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    const error = new Error(data?.error || 'Could not reach contact settings.')
    error.status = response.status
    throw error
  }
  return data
}
