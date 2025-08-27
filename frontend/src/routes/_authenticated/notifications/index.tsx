import { createFileRoute } from '@tanstack/react-router'
import { StudentHeader } from '@/components/layout/student-header'
import { Main } from '@/components/layout/main'
import { PatternWrapper } from '@/components/au-showcase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellRing,
  Award,
  FileText,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Filter,
  Trash2,
  Clock
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: 'award',
      title: 'Scholarship Award Approved!',
      message: 'Congratulations! Your application for the Academic Merit Award has been approved for $25,000.',
      timestamp: '2025-01-25T10:30:00Z',
      read: false,
      priority: 'high',
      actionRequired: false,
    },
    {
      id: 2,
      type: 'application',
      title: 'Application Under Review',
      message: 'Your application for the Engineering Excellence Grant is currently being reviewed by our committee.',
      timestamp: '2025-01-24T14:15:00Z',
      read: false,
      priority: 'medium',
      actionRequired: false,
    },
    {
      id: 3,
      type: 'document',
      title: 'Document Verification Required',
      message: 'Your personal statement needs additional verification. Please upload a revised version.',
      timestamp: '2025-01-23T09:45:00Z',
      read: true,
      priority: 'high',
      actionRequired: true,
    },
    {
      id: 4,
      type: 'deadline',
      title: 'Application Deadline Reminder',
      message: 'The Research Innovation Grant application deadline is in 7 days (March 1, 2025).',
      timestamp: '2025-01-22T08:00:00Z',
      read: true,
      priority: 'medium',
      actionRequired: true,
    },
    {
      id: 5,
      type: 'system',
      title: 'Profile Update Successful',
      message: 'Your academic records have been successfully updated in your profile.',
      timestamp: '2025-01-21T16:20:00Z',
      read: true,
      priority: 'low',
      actionRequired: false,
    },
    {
      id: 6,
      type: 'renewal',
      title: 'Scholarship Renewal Available',
      message: 'You are eligible for renewal of your Academic Merit Award. Application period opens March 15.',
      timestamp: '2025-01-20T11:30:00Z',
      read: true,
      priority: 'medium',
      actionRequired: true,
    },
  ])

  const [filter, setFilter] = useState('all')
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'award': return <Award className="w-5 h-5 text-yellow-600" />
      case 'application': return <FileText className="w-5 h-5 text-blue-600" />
      case 'document': return <FileText className="w-5 h-5 text-red-600" />
      case 'deadline': return <Calendar className="w-5 h-5 text-orange-600" />
      case 'renewal': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'system': return <Info className="w-5 h-5 text-gray-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'au-badge-danger'
      case 'medium': return 'au-badge-warning'
      case 'low': return 'au-badge-neutral'
      default: return 'au-badge-neutral'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return time.toLocaleDateString()
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : filter === 'action-required'
    ? notifications.filter(n => n.actionRequired)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.read).length
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length

  return (
    <>
      <StudentHeader />
      <Main className="p-0">
        <div className="au-showcase">
          {/* Page Header */}
          <div className="au-hero-section">
            <div className="container mx-auto px-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <BellRing className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                    {unreadCount > 0 && (
                      <span className="au-badge au-badge-danger">{unreadCount} new</span>
                    )}
                  </div>
                  <p className="text-gray-600">Stay updated on your scholarship applications and awards</p>
                </div>
                <div className="flex space-x-3">
                  <button className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Mark All Read
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Stats */}
          <div className="au-section-gray-textured py-8">
            <div className="container mx-auto px-8">
              <div className="au-grid au-grid-4">
                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Total</h3>
                      <Bell className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{notifications.length}</div>
                    <p className="text-xs text-gray-500 mt-1">All notifications</p>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="geometric" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Unread</h3>
                      <BellRing className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{unreadCount}</div>
                    <p className="text-xs text-gray-500 mt-1">New notifications</p>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="grid" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Action Required</h3>
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{actionRequiredCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Need response</p>
                  </div>
                </PatternWrapper>

                <PatternWrapper pattern="dots" className="au-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Delivery</h3>
                      <div className="flex space-x-1">
                        <Mail className="w-4 h-4 text-green-500" />
                        <Smartphone className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-800">Email + App</div>
                    <p className="text-xs text-gray-500 mt-1">Notification methods</p>
                  </div>
                </PatternWrapper>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-8 py-12">
            {/* Filters */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'all' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'unread' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('action-required')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'action-required' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Action Required ({actionRequiredCount})
                </button>
                <button
                  onClick={() => setFilter('award')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'award' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Awards
                </button>
                <button
                  onClick={() => setFilter('application')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'application' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Applications
                </button>
                <button
                  onClick={() => setFilter('deadline')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === 'deadline' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Deadlines
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Notifications</h3>
                  <p className="text-gray-500">
                    {filter === 'all' 
                      ? "You don't have any notifications yet." 
                      : `No ${filter.replace('-', ' ')} notifications found.`}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`au-card hover:shadow-lg transition-all cursor-pointer ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                {notification.actionRequired && (
                                  <span className="au-badge au-badge-warning text-xs">Action Required</span>
                                )}
                              </div>
                              <span className={`au-badge ${getPriorityColor(notification.priority)} text-xs ml-2`}>
                                {notification.priority}
                              </span>
                            </div>
                            <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{getTimeAgo(notification.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {notification.actionRequired && (
                                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                    Take Action →
                                  </button>
                                )}
                                <button className="text-xs text-gray-500 hover:text-gray-700">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button className="text-xs text-gray-500 hover:text-gray-700">
                                  {notification.read ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notification Preferences Card */}
            <div className="mt-12 au-card bg-gray-50 border-gray-200">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Customize how and when you receive notifications about your scholarship applications and awards.
                    </p>
                    <div className="flex space-x-4">
                      <button className="au-btn-secondary px-4 py-2 text-sm rounded-md font-semibold transition-all duration-200 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Settings
                      </button>
                      <button className="au-btn-secondary px-4 py-2 text-sm rounded-md font-semibold transition-all duration-200 flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Push Notifications
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}