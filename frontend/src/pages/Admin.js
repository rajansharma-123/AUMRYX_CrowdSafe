import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Calendar, 
  Bell, 
  MapPin, 
  Users, 
  LogOut, 
  Plus, 
  Trash2,
  Edit,
  X,
  Loader2,
  Shield
} from 'lucide-react';

const Admin = () => {
  const { user, loading: authLoading, login, logout, processSession } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [safetyStatus, setSafetyStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    title_en: '', title_hi: '',
    description_en: '', description_hi: '',
    location_en: '', location_hi: '',
    date: '', time_en: '', time_hi: '',
    crowd_expectation: 'moderate',
    safety_advisory_en: '', safety_advisory_hi: '',
    is_highlight: false
  });

  const [alertForm, setAlertForm] = useState({
    title_en: '', title_hi: '',
    message_en: '', message_hi: '',
    severity: 'info'
  });

  const [statusForm, setStatusForm] = useState({
    location_en: '', location_hi: '',
    latitude: '', longitude: '',
    crowd_level: 'moderate',
    status: 'safe'
  });

  // Handle session_id from URL
  useEffect(() => {
    const handleAuth = async () => {
      if (hasProcessed.current) return;
      
      const hash = location.hash;
      if (hash && hash.includes('session_id=')) {
        hasProcessed.current = true;
        const sessionId = hash.split('session_id=')[1]?.split('&')[0];
        if (sessionId) {
          try {
            await processSession(sessionId);
            navigate('/admin', { replace: true });
          } catch (error) {
            console.error('Auth failed:', error);
            toast.error('Authentication failed');
          }
        }
      }
    };
    handleAuth();
  }, [location, processSession, navigate]);

  useEffect(() => {
    if (user?.is_admin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [eventsRes, alertsRes, statusRes] = await Promise.all([
        axios.get(`${API}/events`),
        axios.get(`${API}/alerts/all`),
        axios.get(`${API}/safety-status`)
      ]);
      setEvents(eventsRes.data);
      setAlerts(alertsRes.data);
      setSafetyStatus(statusRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/events`, eventForm, { withCredentials: true });
      toast.success('Event created successfully!');
      setShowEventForm(false);
      resetEventForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/events/${editingEvent.event_id}`, eventForm, { withCredentials: true });
      toast.success('Event updated successfully!');
      setShowEventForm(false);
      setEditingEvent(null);
      resetEventForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${API}/events/${eventId}`, { withCredentials: true });
      toast.success('Event deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete event');
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/alerts`, alertForm, { withCredentials: true });
      toast.success('Alert created successfully!');
      setShowAlertForm(false);
      setAlertForm({ title_en: '', title_hi: '', message_en: '', message_hi: '', severity: 'info' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create alert');
    }
  };

  const handleToggleAlert = async (alertId) => {
    try {
      await axios.put(`${API}/alerts/${alertId}/toggle`, {}, { withCredentials: true });
      toast.success('Alert toggled!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to toggle alert');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API}/alerts/${alertId}`, { withCredentials: true });
      toast.success('Alert deleted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete alert');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/safety-status`, {
        ...statusForm,
        latitude: parseFloat(statusForm.latitude),
        longitude: parseFloat(statusForm.longitude)
      }, { withCredentials: true });
      toast.success('Status updated!');
      setShowStatusForm(false);
      setStatusForm({ location_en: '', location_hi: '', latitude: '', longitude: '', crowd_level: 'moderate', status: 'safe' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title_en: '', title_hi: '',
      description_en: '', description_hi: '',
      location_en: '', location_hi: '',
      date: '', time_en: '', time_hi: '',
      crowd_expectation: 'moderate',
      safety_advisory_en: '', safety_advisory_hi: '',
      is_highlight: false
    });
  };

  const startEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title_en: event.title_en,
      title_hi: event.title_hi,
      description_en: event.description_en,
      description_hi: event.description_hi,
      location_en: event.location_en,
      location_hi: event.location_hi,
      date: event.date,
      time_en: event.time_en,
      time_hi: event.time_hi,
      crowd_expectation: event.crowd_expectation,
      safety_advisory_en: event.safety_advisory_en,
      safety_advisory_hi: event.safety_advisory_hi,
      is_highlight: event.is_highlight
    });
    setShowEventForm(true);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]" data-testid="admin-loading">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9933]" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0] px-4" data-testid="admin-login">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-[#FF9933] mb-4" />
            <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Admin Panel</h1>
            <p className="text-[#4B5563] mb-6">
              Sign in to manage events, alerts, and safety status
            </p>
            <Button 
              onClick={login}
              className="w-full bg-[#FF9933] hover:bg-[#E68A2E]"
              data-testid="admin-login-btn"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not admin
  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0] px-4" data-testid="admin-unauthorized">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-[#DC2626] mb-4" />
            <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Access Denied</h1>
            <p className="text-[#4B5563] mb-6">
              You don't have admin privileges. Contact support if you need access.
            </p>
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-[#FFFBF0] pb-24" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-[#FF9933]/20 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1F2937]">Admin Panel</h1>
            <p className="text-sm text-[#4B5563]">Welcome, {user.name}</p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            size="sm"
            data-testid="admin-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="events">
          <TabsList className="mb-6">
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <Users className="w-4 h-4" />
              Crowd Status
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Manage Events</h2>
              <Button 
                onClick={() => { resetEventForm(); setEditingEvent(null); setShowEventForm(true); }}
                className="bg-[#FF9933] hover:bg-[#E68A2E]"
                data-testid="add-event-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>

            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.event_id} className="border-0 shadow-md" data-testid={`admin-event-${event.event_id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title_en}</h3>
                        <p className="text-sm text-[#4B5563]">{event.date} • {event.location_en}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEditEvent(event)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-[#DC2626]" onClick={() => handleDeleteEvent(event.event_id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Manage Alerts</h2>
              <Button 
                onClick={() => setShowAlertForm(true)}
                className="bg-[#FF9933] hover:bg-[#E68A2E]"
                data-testid="add-alert-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Alert
              </Button>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.alert_id} className={`border-0 shadow-md ${!alert.is_active ? 'opacity-50' : ''}`} data-testid={`admin-alert-${alert.alert_id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.title_en}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            alert.severity === 'danger' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                            alert.severity === 'warning' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                            'bg-[#2563EB]/10 text-[#2563EB]'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-[#4B5563]">{alert.message_en}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggleAlert(alert.alert_id)}>
                          {alert.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-[#DC2626]" onClick={() => handleDeleteAlert(alert.alert_id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Crowd Status Tab */}
          <TabsContent value="status">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Update Crowd Status</h2>
              <Button 
                onClick={() => setShowStatusForm(true)}
                className="bg-[#FF9933] hover:bg-[#E68A2E]"
                data-testid="update-status-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {safetyStatus.map((status) => (
                <Card key={status.status_id} className="border-0 shadow-md" data-testid={`admin-status-${status.status_id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{status.location_en}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded text-white ${
                            status.crowd_level === 'low' ? 'bg-[#16A34A]' :
                            status.crowd_level === 'moderate' ? 'bg-[#F59E0B]' :
                            'bg-[#DC2626]'
                          }`}>
                            {status.crowd_level}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                            {status.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</CardTitle>
              <button onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title (English)</label>
                    <Input value={eventForm.title_en} onChange={(e) => setEventForm({...eventForm, title_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title (Hindi)</label>
                    <Input value={eventForm.title_hi} onChange={(e) => setEventForm({...eventForm, title_hi: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Description (English)</label>
                    <Textarea value={eventForm.description_en} onChange={(e) => setEventForm({...eventForm, description_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (Hindi)</label>
                    <Textarea value={eventForm.description_hi} onChange={(e) => setEventForm({...eventForm, description_hi: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location (English)</label>
                    <Input value={eventForm.location_en} onChange={(e) => setEventForm({...eventForm, location_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location (Hindi)</label>
                    <Input value={eventForm.location_hi} onChange={(e) => setEventForm({...eventForm, location_hi: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time (English)</label>
                    <Input value={eventForm.time_en} onChange={(e) => setEventForm({...eventForm, time_en: e.target.value})} placeholder="9:00 AM - 2:00 PM" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time (Hindi)</label>
                    <Input value={eventForm.time_hi} onChange={(e) => setEventForm({...eventForm, time_hi: e.target.value})} placeholder="सुबह 9:00 - दोपहर 2:00" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Crowd Expectation</label>
                  <Select value={eventForm.crowd_expectation} onValueChange={(value) => setEventForm({...eventForm, crowd_expectation: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Safety Advisory (English)</label>
                    <Textarea value={eventForm.safety_advisory_en} onChange={(e) => setEventForm({...eventForm, safety_advisory_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Safety Advisory (Hindi)</label>
                    <Textarea value={eventForm.safety_advisory_hi} onChange={(e) => setEventForm({...eventForm, safety_advisory_hi: e.target.value})} required />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={eventForm.is_highlight} onChange={(e) => setEventForm({...eventForm, is_highlight: e.target.checked})} />
                  <label className="text-sm">Highlight this event</label>
                </div>
                <Button type="submit" className="w-full bg-[#FF9933] hover:bg-[#E68A2E]">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Alert</CardTitle>
              <button onClick={() => setShowAlertForm(false)}><X className="w-5 h-5" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title (English)</label>
                    <Input value={alertForm.title_en} onChange={(e) => setAlertForm({...alertForm, title_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title (Hindi)</label>
                    <Input value={alertForm.title_hi} onChange={(e) => setAlertForm({...alertForm, title_hi: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Message (English)</label>
                    <Textarea value={alertForm.message_en} onChange={(e) => setAlertForm({...alertForm, message_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message (Hindi)</label>
                    <Textarea value={alertForm.message_hi} onChange={(e) => setAlertForm({...alertForm, message_hi: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={alertForm.severity} onValueChange={(value) => setAlertForm({...alertForm, severity: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="danger">Danger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#FF9933] hover:bg-[#E68A2E]">Create Alert</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Form Modal */}
      {showStatusForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Update Status</CardTitle>
              <button onClick={() => setShowStatusForm(false)}><X className="w-5 h-5" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location (English)</label>
                    <Input value={statusForm.location_en} onChange={(e) => setStatusForm({...statusForm, location_en: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location (Hindi)</label>
                    <Input value={statusForm.location_hi} onChange={(e) => setStatusForm({...statusForm, location_hi: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Latitude</label>
                    <Input type="number" step="any" value={statusForm.latitude} onChange={(e) => setStatusForm({...statusForm, latitude: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Longitude</label>
                    <Input type="number" step="any" value={statusForm.longitude} onChange={(e) => setStatusForm({...statusForm, longitude: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Crowd Level</label>
                    <Select value={statusForm.crowd_level} onValueChange={(value) => setStatusForm({...statusForm, crowd_level: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusForm.status} onValueChange={(value) => setStatusForm({...statusForm, status: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="caution">Caution</SelectItem>
                        <SelectItem value="avoid">Avoid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#FF9933] hover:bg-[#E68A2E]">Update Status</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
