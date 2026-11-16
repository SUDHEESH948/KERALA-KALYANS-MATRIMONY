import { Inquiry } from '../models/Inquiry.js'

export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ date: -1 })
    res.json(inquiries)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createInquiry = async (req, res) => {
  try {
    const { name, phone, email, lookingFor, ageRange, religion, motherTongue } = req.body

    const newInquiry = new Inquiry({
      id: `INQ-${Date.now().toString().slice(-4)}`,
      name: name ? name.trim() : 'Interested Seeker',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      lookingFor: lookingFor || 'Woman',
      ageRange: ageRange || '22 to 27',
      religion: religion || 'Select',
      motherTongue: motherTongue || 'Select',
      status: 'New',
      date: new Date()
    })

    await newInquiry.save()
    res.status(201).json({ success: true, message: 'Inquiry received successfully', inquiry: newInquiry })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status || 'Contacted' },
      { returnDocument: 'after' }
    )
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' })
    res.json({ success: true, inquiry })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteInquiry = async (req, res) => {
  try {
    const deleted = await Inquiry.findOneAndDelete({ id: req.params.id })
    if (!deleted) return res.status(404).json({ error: 'Inquiry not found' })
    res.json({ success: true, message: 'Inquiry removed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
