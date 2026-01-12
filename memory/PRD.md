# AUMRYX CrowdSafe - Product Requirements Document

## Project Overview
**Name:** AUMRYX CrowdSafe  
**Tagline:** Official Safety & Visitor Information Platform for Braj Holi  
**Description:** A bilingual (English-Hindi), web-based, one-stop official platform providing live safety updates, complete Braj Holi schedules, travel guidance, and emergency assistance for all visitors.

## User Personas
1. **Tourists/Visitors** - First-time visitors seeking information about Braj Holi celebrations
2. **Devotees/Pilgrims** - Regular visitors familiar with the region but need crowd/safety updates
3. **Foreign Tourists** - International visitors needing English language support and safety guidance
4. **Event Administrators** - Officials managing events, alerts, and crowd status updates
5. **Families with Children** - Groups needing meeting points and emergency contacts

## Core Requirements (Static)
- Bilingual support (English + Hindi with auto-detection)
- Live safety status for key locations
- Complete Braj Holi event schedule with crowd expectations
- Interactive crowd map using OpenStreetMap
- Emergency SOS with location sharing
- Lost & Found reporting system with photo upload
- Nearby help locator (police, medical, water, toilets, parking)
- Official alerts system
- Admin panel for event/alert management
- Traditional Indian saffron/orange aesthetic
- Offline PWA support

## Tech Stack
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Leaflet/OpenStreetMap
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Auth:** Emergent Google OAuth (admin only)
- **PWA:** Service Worker with offline caching

## What's Been Implemented (January 2026)

### Pages (13 Total)
1. ✅ **Home (/)** - Hero section, live status ticker, today's events, quick actions, crowd status cards
2. ✅ **Schedule (/schedule)** - Timeline view with date navigation, 9 pre-seeded events, **bookmark support**
3. ✅ **Live Map (/live-map)** - OpenStreetMap with crowd markers, layer controls, location details
4. ✅ **Visitor Guide (/visitor-guide)** - How to reach, where to stay, what to wear, etiquette
5. ✅ **Safe Routes (/safe-routes)** - Dynamic route suggestions based on crowd conditions
6. ✅ **Emergency (/emergency)** - **Enhanced: 3 tabs (SOS, Contacts, Meeting Point), WhatsApp sharing**
7. ✅ **Lost & Found (/lost-found)** - **Enhanced: Photo upload support**
8. ✅ **Help Near Me (/help-near-me)** - Nearby help locations with distance calculation
9. ✅ **Alerts (/alerts)** - Official announcements feed
10. ✅ **FAQs (/faq)** - 10 common questions with expandable answers
11. ✅ **Safety Guidelines (/dos-donts)** - Do's and Don'ts for Holi
12. ✅ **Admin (/admin)** - Event, alert, and status management (Google Auth protected)
13. ✅ **Bookmarks (/bookmarks)** - **NEW: Saved events for quick access**

### Enhanced Features (Phase 2)
- ✅ **Photo Upload in Lost & Found** - Camera capture + file upload, base64 storage
- ✅ **WhatsApp Integration** - One-tap WhatsApp sharing with location for SOS
- ✅ **Emergency Contacts** - Save family/friend contacts for quick SOS notification
- ✅ **Family Meeting Points** - Create/join meeting points with unique share codes
- ✅ **Event Bookmarking** - Save favorite events for quick access
- ✅ **PWA Support** - Service worker, manifest, offline page with emergency numbers
- ✅ **Real-time Status Polling** - Combined endpoint for efficient data fetching
- ✅ **Push Notification Ready** - VAPID keys and subscription system in place

### Backend APIs (32 endpoints)
- Events CRUD (/api/events) - Create, Read, Update, Delete
- Safety Status CRUD (/api/safety-status)
- Alerts CRUD (/api/alerts)
- Lost & Found CRUD (/api/lost-found)
- Help Locations (/api/help-locations)
- SOS Logging with WhatsApp links (/api/sos)
- Photo Upload & Retrieval (/api/upload/photo, /api/photos/{id})
- Emergency Contacts CRUD (/api/emergency-contacts)
- Meeting Points CRUD (/api/meeting-points)
- Event Bookmarks CRUD (/api/bookmarks)
- Real-time Status (/api/realtime/status)
- Push Subscriptions (/api/push/*)
- Auth (Emergent Google OAuth)

### Seeded Data
- 9 Braj Holi 2026 events (Lathmar Holi, Phoolon ki Holi, Huranga, etc.)
- 5 safety status locations
- 7 help locations (police, hospital, fire, water, toilet, parking)
- 1 welcome alert

## Prioritized Backlog

### P0 (Critical) - None remaining

### P1 (High Priority) - COMPLETED ✅
- [x] Photo upload in Lost & Found
- [x] WhatsApp integration for SOS
- [x] Family meeting points
- [x] Event bookmarking
- [x] PWA offline support

### P2 (Medium Priority)
- [ ] Send actual push notifications when new alerts created
- [ ] Twilio SMS integration for areas with no internet
- [ ] Multi-language support beyond EN/HI (Gujarati, Bengali)
- [ ] User accounts for personalized experience
- [ ] Walking directions integration
- [ ] Weather integration
- [ ] Transportation booking links

### P3 (Nice to Have)
- [ ] AR navigation for temple routes
- [ ] Community photo sharing gallery
- [ ] Live streaming of events
- [ ] Accessibility features (voice commands)
- [ ] Hotel booking integration
- [ ] Print-friendly schedule PDF export

## Testing Summary
- **Backend Tests:** 32/32 passed (100%)
- **Frontend Tests:** All pages functional (100%)
- **Integration Tests:** All features working (100%)

## Next Tasks
1. Configure push notification server to send real notifications
2. Add Twilio SMS for emergency SMS alerts
3. Implement multi-language support
4. Add weather widget integration
5. Create analytics dashboard for admin

---
*Last Updated: January 2026 - Phase 2 Complete*
