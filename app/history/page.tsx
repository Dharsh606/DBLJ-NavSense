'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  History,
  MapPin,
  Clock,
  Trash2,
  Navigation,
  Calendar,
  Search,
  Filter,
  Download,
  Share2
} from 'lucide-react'

interface NavigationRecord {
  id: string
  destination: string
  startLocation: { lat: number; lng: number }
  endLocation: { lat: number; lng: number }
  distance: number // in meters
  duration: number // in seconds
  date: Date
  status: 'completed' | 'cancelled' | 'in-progress'
  transportMode: 'walking' | 'transit' | 'driving'
}

export default function HistoryPage() {
  const [records, setRecords] = useState<NavigationRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<NavigationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'duration'>('date')

  useEffect(() => {
    loadNavigationHistory()
  }, [])

  useEffect(() => {
    filterAndSortRecords()
  }, [records, searchQuery, filterStatus, sortBy])

  const loadNavigationHistory = () => {
    const savedHistory = localStorage.getItem('navigationHistory')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setRecords(parsed.map((record: any) => ({
          ...record,
          date: new Date(record.date)
        })))
      } catch (error) {
        console.error('Error loading history:', error)
      }
    } else {
      // Load sample data for demonstration
      const sampleData: NavigationRecord[] = [
        {
          id: '1',
          destination: 'Central Library',
          startLocation: { lat: 40.7128, lng: -74.0060 },
          endLocation: { lat: 40.7580, lng: -73.9855 },
          distance: 1250,
          duration: 900,
          date: new Date(Date.now() - 86400000), // 1 day ago
          status: 'completed',
          transportMode: 'walking'
        },
        {
          id: '2',
          destination: 'City Hospital',
          startLocation: { lat: 40.7128, lng: -74.0060 },
          endLocation: { lat: 40.7614, lng: -73.9776 },
          distance: 2100,
          duration: 1500,
          date: new Date(Date.now() - 172800000), // 2 days ago
          status: 'completed',
          transportMode: 'walking'
        },
        {
          id: '3',
          destination: 'Shopping Mall',
          startLocation: { lat: 40.7128, lng: -74.0060 },
          endLocation: { lat: 40.7489, lng: -73.9680 },
          distance: 3500,
          duration: 2400,
          date: new Date(Date.now() - 259200000), // 3 days ago
          status: 'cancelled',
          transportMode: 'walking'
        }
      ]
      setRecords(sampleData)
    }
  }

  const saveNavigationHistory = (updatedRecords: NavigationRecord[]) => {
    localStorage.setItem('navigationHistory', JSON.stringify(updatedRecords))
  }

  const filterAndSortRecords = () => {
    let filtered = records

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.destination.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus)
    }

    // Sort records
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime()
        case 'distance':
          return b.distance - a.distance
        case 'duration':
          return b.duration - a.duration
        default:
          return 0
      }
    })

    setFilteredRecords(filtered)
  }

  const deleteRecord = (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id)
    setRecords(updatedRecords)
    saveNavigationHistory(updatedRecords)
  }

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to clear all navigation history?')) {
      setRecords([])
      setFilteredRecords([])
      localStorage.removeItem('navigationHistory')
    }
  }

  const navigateToDestination = (record: NavigationRecord) => {
    // Navigate to the navigation page with pre-filled destination
    window.location.href = `/navigation?destination=${encodeURIComponent(record.destination)}&lat=${record.endLocation.lat}&lng=${record.endLocation.lng}`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'in-progress':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `navigation-history-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const shareHistory = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Navigation History',
          text: `I have ${filteredRecords.length} navigation records in my history.`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
            <img src="/logo.png" alt="DBLJ NavSense" className="w-7 h-7 mr-2" />
            <h1 className="text-xl font-semibold">Navigation History</h1>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportHistory}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareHistory}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Sort by Date</option>
                <option value="distance">Sort by Distance</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{filteredRecords.length}</div>
            <div className="text-sm text-gray-600">Total Routes</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredRecords.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatDistance(filteredRecords.reduce((sum, r) => sum + r.distance, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Distance</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatDuration(filteredRecords.reduce((sum, r) => sum + r.duration, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </motion.div>

        {/* History Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Navigation History</h3>
              <p className="text-gray-500">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No records match your search criteria'
                  : 'Start navigating to build your history'
                }
              </p>
            </div>
          ) : (
            filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-primary-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">{record.destination}</h3>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="/logo.png" alt="DBLJ NavSense" className="w-8 h-8 mr-1" />
                          <span>{formatDistance(record.distance)}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDuration(record.duration)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="capitalize">{record.transportMode}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {record.status === 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigateToDestination(record)}
                        className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200"
                      >
                        <img src="/logo.png" alt="DBLJ NavSense" className="w-8 h-8" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteRecord(record.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Clear All Button */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllHistory}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl"
            >
              Clear All History
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
