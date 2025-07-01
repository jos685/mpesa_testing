'use client'

import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import './styles/main.css'

const predefinedPrices = [500, 800, 100, 2000, 3000, 4000, 5000]

// ✅ Phone normalizer function
const normalizePhone = (input: string) => {
  const cleaned = input.replace(/\s+/g, '').replace(/[^0-9+]/g, '')

  if (cleaned.startsWith('+254')) return cleaned.slice(1)
  if (cleaned.startsWith('07')) return '254' + cleaned.slice(1)
  if (cleaned.startsWith('254')) return cleaned
  return cleaned
}

export default function Home() {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [modalPhone, setModalPhone] = useState('')

  const handleSubmit = async (
    e: FormEvent,
    customAmount = amount,
    customPhone = phone,
    closeModal = false
  ) => {
    e.preventDefault()
    const loading = toast.loading('Sending payment request...')

    const normalizedPhone = normalizePhone(customPhone)

    try {
      const res = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, amount: customAmount }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('STK Push sent to phone!', { id: loading })

        if (closeModal) {
          setModalOpen(false)
          setModalPhone('')
          setSelectedAmount(null)
        } else {
          setPhone('')
          setAmount('')
        }
      } else {
        toast.error(data.message || 'Error occurred', { id: loading })
      }
    } catch {
      toast.error('Network error', { id: loading })
    }
  }

  const handleBoxClick = (price: number) => {
    setSelectedAmount(price)
    setModalPhone('')
    setModalOpen(true)
  }

  return (
    <main className="container">
      {/* Top input form */}
      <h1 className="title">M-Pesa STK Push Demo</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          placeholder="Phone (07... or 2547...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" className="button">Pay Now</button>
      </form>

      {/* Box payment section */}
      <h2 className="title">Quick Payment Boxes</h2>
      <div className="box-container">
        {predefinedPrices.map((price) => (
          <div key={price} className="price-box" onClick={() => handleBoxClick(price)}>
            KES {price}
          </div>
        ))}
      </div>

      {/* Modal for box payment */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Pay KES {selectedAmount}</h3>
            <input
              className="input"
              placeholder="Enter phone number"
              value={modalPhone}
              onChange={(e) => setModalPhone(e.target.value)}
              required
            />
            <button
              className="button"
              onClick={(e) =>
                handleSubmit(e, String(selectedAmount ?? ''), modalPhone, true)
              }
            >
              Pay Now
            </button>
            <button className="button cancel" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/*  Notice */}
      <h1 className="title1">Phone number must start with 07... or 254...</h1>
    </main>
  )
}
