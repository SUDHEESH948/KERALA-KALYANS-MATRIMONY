import { useEffect, useRef, useState } from 'react'
import { requestContact } from '../config/contact'

const fields = [
  { name: 'whatsapp', label: 'WhatsApp number', type: 'tel' },
  { name: 'phone', label: 'Customer care phone', type: 'tel' },
  { name: 'email', label: 'Contact email', type: 'email' },
]

const primaryButton = 'min-h-11 rounded-lg bg-[var(--admin-gold-strong)] px-4 text-sm font-semibold text-white hover:bg-[var(--admin-gold-strong-hover)] disabled:opacity-60'
const secondaryButton = 'min-h-11 rounded-lg border border-[var(--admin-border)] px-4 text-sm text-[var(--admin-gold-ink)] disabled:opacity-60'

export default function AdminContactDialog({ token, onSessionEnded, onClose }) {
  const dialog = useRef(null)
  const [contact, setContact] = useState(null)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const element = dialog.current
    element.showModal()
    const request = new AbortController()
    requestContact({ signal: request.signal }).then(setContact).catch(err => {
      if (!request.signal.aborted) setError(err.message)
    })
    return () => {
      request.abort()
      element.close()
    }
  }, [])

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const saved = await requestContact({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      })
      setContact(saved)
      setDraft(null)
      setStatus('Contact details saved.')
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        onSessionEnded()
      } else {
        setError(err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="admin-contact-title"
      onCancel={event => {
        event.preventDefault()
        if (!saving) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-white p-5 text-[var(--admin-gold-ink)] shadow-xl backdrop:bg-black/50 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="admin-contact-title" className="text-xl">Contact details</h2>
        <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Close</button>
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {status && <p role="status" className="mb-3 text-sm text-green-800">{status}</p>}
      {draft ? (
        <form onSubmit={save} className="space-y-4">
          <p className="text-sm">Include the country code for both phone numbers.</p>
          <fieldset disabled={saving} className="space-y-3">
            {fields.map(({ name, label, type }) => (
              <label key={name} className="block text-sm">
                {label}
                <input
                  required
                  type={type}
                  maxLength={type === 'email' ? 254 : 32}
                  value={draft[name]}
                  onChange={event => setDraft({ ...draft, [name]: event.target.value })}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--admin-border)] px-3 text-base"
                />
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={primaryButton}>{saving ? 'Saving…' : 'Save contact details'}</button>
            <button type="button" disabled={saving} className={secondaryButton} onClick={() => { setDraft(null); setError('') }}>Cancel</button>
          </div>
        </form>
      ) : contact ? (
        <>
          <dl className="mb-5 space-y-3">
            {fields.map(({ name, label }) => (
              <div key={name}>
                <dt className="text-sm font-semibold">{label}</dt>
                <dd className="wrap-anywhere text-base">{contact[name]}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className={primaryButton} onClick={() => { setDraft(contact); setStatus('') }}>Edit contact details</button>
        </>
      ) : !error && <p role="status" className="text-sm">Loading contact details…</p>}
    </dialog>
  )
}
