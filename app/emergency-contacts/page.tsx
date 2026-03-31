'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Phone,
  Users,
  AlertTriangle,
  Shield,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Heart,
  Clock,
  Settings,
  Activity,
  Zap
} from 'lucide-react'
import { emergencyContactService, EmergencyContact } from '@/lib/emergency-contacts'

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [isClient, setIsClient] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const allContacts = emergencyContactService.getAllContacts()
    setContacts(allContacts)
    setIsMonitoring(emergencyContactService.getStatus().isMonitoring)
  }, [])

  const handleAddContact = (contact: Omit<EmergencyContact, 'id'>) => {
    emergencyContactService.addContact(contact)
    const updatedContacts = emergencyContactService.getAllContacts()
    setContacts(updatedContacts)
    setShowAddForm(false)
  }

  const handleDeleteContact = (id: string) => {
    emergencyContactService.deleteContact(id)
    const updatedContacts = emergencyContactService.getAllContacts()
    setContacts(updatedContacts)
  }

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      emergencyContactService.stopMonitoring()
      setIsMonitoring(false)
    } else {
      emergencyContactService.startMonitoring()
      setIsMonitoring(true)
    }
  }

  const handleEmergencyAlert = (type: 'medical' | 'police' | 'fire' | 'accident') => {
    emergencyContactService.triggerEmergencyAlert(type)
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 mr-3"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <h1 className="text-xl font-semibold">Emergency Contacts</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMonitoring 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Emergency Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Emergency Services</h2>
              <p className="text-gray-600">Quick access to emergency assistance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmergencyAlert('medical')}
              className="bg-red-100 border-2 border-red-200 rounded-lg p-4 hover:bg-red-200 transition-colors"
            >
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <span className="font-medium text-red-800">Medical</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmergencyAlert('police')}
              className="bg-blue-100 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-200 transition-colors"
            >
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="font-medium text-blue-800">Police</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmergencyAlert('fire')}
              className="bg-orange-100 border-2 border-orange-200 rounded-lg p-4 hover:bg-orange-200 transition-colors"
            >
              <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <span className="font-medium text-orange-800">Fire</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmergencyAlert('accident')}
              className="bg-purple-100 border-2 border-purple-200 rounded-lg p-4 hover:bg-purple-200 transition-colors"
            >
              <AlertTriangle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="font-medium text-purple-800">Accident</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
                <p className="text-gray-600">Personal emergency contacts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No emergency contacts added</p>
                <p className="text-sm">Add contacts for quick emergency access</p>
              </div>
            ) : (
              contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <p className="text-sm text-blue-600">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contact.isPrimary && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Primary
                      </span>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingContact(contact)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Monitoring Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Emergency Monitoring</h2>
                <p className="text-gray-600">Automatic emergency detection and alerts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleMonitoring}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </motion.button>
          </div>
          
          {isMonitoring && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">Emergency monitoring is active</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/profile'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Heart className="w-6 h-6 text-red-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Profile</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/gps-tracking'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Clock className="w-6 h-6 text-blue-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">GPS Tracking</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/settings'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Settings className="w-6 h-6 text-gray-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">Settings</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/help'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <AlertTriangle className="w-6 h-6 text-orange-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Help</span>
          </motion.button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Emergency Contact</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <AddContactForm
              onSubmit={handleAddContact}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Add Contact Form Component
function AddContactForm({ onSubmit, onCancel }: { onSubmit: (contact: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
        <input
          type="text"
          required
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          placeholder="e.g., Mother, Friend, Doctor"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="primary"
          checked={formData.isPrimary}
          onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="primary" className="text-sm font-medium text-gray-700">
          Set as primary emergency contact
        </label>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Contact
        </button>
      </div>
    </form>
  )
}
