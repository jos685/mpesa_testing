'use client'

import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import './styles/main.css'

const predefinedPrices = [50, 60, 70, 80, 100, 200]

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

    try {
      const res = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customPhone, amount: customAmount }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('STK Push sent to phone!', { id: loading })
        if (closeModal) setModalOpen(false)
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
          placeholder="Phone (2547...)"
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
              onClick={(e) => handleSubmit(e, String(selectedAmount ?? ''), modalPhone, true)}
            >
              Pay Now
            </button>
            <button className="button cancel" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

         <h1 className="title1">Dont Worry, your cash will be refunded to your account as this is a testing environment</h1>
         <h1 className="title1">On the phone Number start with 254...e.g 254768131905</h1>
    </main>
  )
}
