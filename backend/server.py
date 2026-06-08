from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="AUMRYX CrowdSafe API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    location_en: str
    location_hi: str
    date: str  # ISO date string YYYY-MM-DD
    time_en: str
    time_hi: str
    crowd_expectation: str  # low, moderate, high
    safety_advisory_en: str
    safety_advisory_hi: str
    is_highlight: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    location_en: str
    location_hi: str
    date: str
    time_en: str
    time_hi: str
    crowd_expectation: str
    safety_advisory_en: str
    safety_advisory_hi: str
    is_highlight: bool = False

class SafetyStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status_id: str = Field(default_factory=lambda: f"sts_{uuid.uuid4().hex[:12]}")
    location_en: str
    location_hi: str
    latitude: float
    longitude: float
    crowd_level: str  # low, moderate, high, extreme
    status: str  # safe, caution, avoid
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SafetyStatusCreate(BaseModel):
    location_en: str
    location_hi: str
    latitude: float
    longitude: float
    crowd_level: str
    status: str

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    alert_id: str = Field(default_factory=lambda: f"alt_{uuid.uuid4().hex[:12]}")
    title_en: str
    title_hi: str
    message_en: str
    message_hi: str
    severity: str  # info, warning, danger
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AlertCreate(BaseModel):
    title_en: str
    title_hi: str
    message_en: str
    message_hi: str
    severity: str

class LostFoundReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    report_id: str = Field(default_factory=lambda: f"lf_{uuid.uuid4().hex[:12]}")
    report_type: str  # lost or found
    item_description_en: str
    item_description_hi: str
    location_en: str
    location_hi: str
    contact_number: str
    reporter_name: str
    photo_url: Optional[str] = None  # Photo URL for item
    status: str = "open"  # open, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LostFoundCreate(BaseModel):
    report_type: str
    item_description_en: str
    item_description_hi: str
    location_en: str
    location_hi: str
    contact_number: str
    reporter_name: str
    photo_url: Optional[str] = None

class HelpLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    help_id: str = Field(default_factory=lambda: f"hlp_{uuid.uuid4().hex[:12]}")
    name_en: str
    name_hi: str
    type: str  # police, hospital, fire, toilet, water, parking
    latitude: float
    longitude: float
    address_en: str
    address_hi: str
    phone: Optional[str] = None

class HelpLocationCreate(BaseModel):
    name_en: str
    name_hi: str
    type: str
    latitude: float
    longitude: float
    address_en: str
    address_hi: str
    phone: Optional[str] = None

class SOSRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    emergency_type: str  # police, ambulance, fire
    message: Optional[str] = None
    emergency_contacts: Optional[List[str]] = None  # Phone numbers to notify

# ===================== NEW MODELS FOR ENHANCED FEATURES =====================

class PushSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    subscription_id: str = Field(default_factory=lambda: f"push_{uuid.uuid4().hex[:12]}")
    endpoint: str
    keys: dict
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: dict
    user_agent: Optional[str] = None

class EmergencyContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    contact_id: str = Field(default_factory=lambda: f"ec_{uuid.uuid4().hex[:12]}")
    device_id: str  # Stored locally, used as identifier
    name: str
    phone: str
    relationship: str  # family, friend, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmergencyContactCreate(BaseModel):
    device_id: str
    name: str
    phone: str
    relationship: str

class MeetingPoint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    meeting_id: str = Field(default_factory=lambda: f"mp_{uuid.uuid4().hex[:12]}")
    name: str
    latitude: float
    longitude: float
    description_en: str
    description_hi: str
    share_code: str = Field(default_factory=lambda: uuid.uuid4().hex[:8].upper())
    created_by: str  # device_id
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MeetingPointCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    description_en: str
    description_hi: str
    created_by: str
    hours_valid: int = 24  # Default 24 hours

class BookmarkedEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    bookmark_id: str = Field(default_factory=lambda: f"bm_{uuid.uuid4().hex[:12]}")
    device_id: str
    event_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookmarkCreate(BaseModel):
    device_id: str
    event_id: str

class PhotoUpload(BaseModel):
    image_data: str  # Base64 encoded image

# ===================== AUTH HELPERS =====================

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in cookie or header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        return None
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    
    return User(**user_doc)

async def require_admin(request: Request) -> User:
    """Require admin user for protected routes"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call auth provider to get user data
    auth_session_data_url = os.getenv(
        "AUTH_SESSION_DATA_URL",
        "https://auth.example.com/auth/v1/env/oauth/session-data"
    )
    async with httpx.AsyncClient() as client_http:
        auth_response = await client_http.get(
            auth_session_data_url,
            headers={"X-Session-ID": session_id}
        )
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = auth_response.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        # Create new user (first user becomes admin)
        user_count = await db.users.count_documents({})
        new_user = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "is_admin": user_count == 0,  # First user is admin
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

# ===================== EVENT ROUTES =====================

@api_router.get("/events", response_model=List[dict])
async def get_events():
    """Get all events"""
    events = await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(1000)
    return events

@api_router.get("/events/today", response_model=List[dict])
async def get_today_events():
    """Get today's events"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    events = await db.events.find({"date": today}, {"_id": 0}).to_list(100)
    return events

@api_router.get("/events/highlights", response_model=List[dict])
async def get_highlight_events():
    """Get highlighted events"""
    events = await db.events.find({"is_highlight": True}, {"_id": 0}).sort("date", 1).to_list(10)
    return events

@api_router.post("/events", response_model=dict)
async def create_event(event: EventCreate, user: User = Depends(require_admin)):
    """Create new event (admin only)"""
    event_obj = Event(**event.model_dump())
    doc = event_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.events.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/events/{event_id}", response_model=dict)
async def update_event(event_id: str, event: EventCreate, user: User = Depends(require_admin)):
    """Update event (admin only)"""
    result = await db.events.update_one(
        {"event_id": event_id},
        {"$set": event.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    updated = await db.events.find_one({"event_id": event_id}, {"_id": 0})
    return updated

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: User = Depends(require_admin)):
    """Delete event (admin only)"""
    result = await db.events.delete_one({"event_id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# ===================== SAFETY STATUS ROUTES =====================

@api_router.get("/safety-status", response_model=List[dict])
async def get_safety_status():
    """Get safety status for all locations"""
    statuses = await db.safety_status.find({}, {"_id": 0}).to_list(100)
    return statuses

@api_router.post("/safety-status", response_model=dict)
async def create_safety_status(status: SafetyStatusCreate, user: User = Depends(require_admin)):
    """Create/update safety status (admin only)"""
    status_obj = SafetyStatus(**status.model_dump())
    doc = status_obj.model_dump()
    doc["last_updated"] = doc["last_updated"].isoformat()
    
    # Upsert by location
    await db.safety_status.update_one(
        {"location_en": status.location_en},
        {"$set": doc},
        upsert=True
    )
    return {k: v for k, v in doc.items() if k != "_id"}

# ===================== ALERT ROUTES =====================

@api_router.get("/alerts", response_model=List[dict])
async def get_alerts():
    """Get all active alerts"""
    alerts = await db.alerts.find({"is_active": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return alerts

@api_router.get("/alerts/all", response_model=List[dict])
async def get_all_alerts():
    """Get all alerts including inactive"""
    alerts = await db.alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return alerts

@api_router.post("/alerts", response_model=dict)
async def create_alert(alert: AlertCreate, user: User = Depends(require_admin)):
    """Create alert (admin only)"""
    alert_obj = Alert(**alert.model_dump())
    doc = alert_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.alerts.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/alerts/{alert_id}/toggle")
async def toggle_alert(alert_id: str, user: User = Depends(require_admin)):
    """Toggle alert active status (admin only)"""
    alert = await db.alerts.find_one({"alert_id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    new_status = not alert.get("is_active", True)
    await db.alerts.update_one({"alert_id": alert_id}, {"$set": {"is_active": new_status}})
    return {"message": "Alert toggled", "is_active": new_status}

@api_router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user: User = Depends(require_admin)):
    """Delete alert (admin only)"""
    result = await db.alerts.delete_one({"alert_id": alert_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted"}

# ===================== LOST & FOUND ROUTES =====================

@api_router.get("/lost-found", response_model=List[dict])
async def get_lost_found():
    """Get all open lost/found reports"""
    reports = await db.lost_found.find({"status": "open"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reports

@api_router.post("/lost-found", response_model=dict)
async def create_lost_found(report: LostFoundCreate):
    """Create lost/found report"""
    report_obj = LostFoundReport(**report.model_dump())
    doc = report_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.lost_found.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/lost-found/{report_id}/resolve")
async def resolve_lost_found(report_id: str, user: User = Depends(require_admin)):
    """Mark report as resolved (admin only)"""
    result = await db.lost_found.update_one(
        {"report_id": report_id},
        {"$set": {"status": "resolved"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report resolved"}

# ===================== HELP LOCATIONS ROUTES =====================

@api_router.get("/help-locations", response_model=List[dict])
async def get_help_locations():
    """Get all help locations"""
    locations = await db.help_locations.find({}, {"_id": 0}).to_list(500)
    return locations

@api_router.get("/help-locations/{help_type}", response_model=List[dict])
async def get_help_locations_by_type(help_type: str):
    """Get help locations by type"""
    locations = await db.help_locations.find({"type": help_type}, {"_id": 0}).to_list(100)
    return locations

@api_router.post("/help-locations", response_model=dict)
async def create_help_location(location: HelpLocationCreate, user: User = Depends(require_admin)):
    """Create help location (admin only)"""
    location_obj = HelpLocation(**location.model_dump())
    doc = location_obj.model_dump()
    await db.help_locations.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

# ===================== SOS ROUTES =====================

@api_router.post("/sos")
async def send_sos(sos: SOSRequest):
    """Log SOS request and optionally notify emergency contacts"""
    sos_doc = {
        "sos_id": f"sos_{uuid.uuid4().hex[:12]}",
        "latitude": sos.latitude,
        "longitude": sos.longitude,
        "emergency_type": sos.emergency_type,
        "message": sos.message,
        "emergency_contacts": sos.emergency_contacts,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.sos_logs.insert_one(sos_doc)
    
    # Generate WhatsApp share links for emergency contacts
    whatsapp_links = []
    if sos.emergency_contacts and sos.latitude and sos.longitude:
        maps_url = f"https://www.google.com/maps?q={sos.latitude},{sos.longitude}"
        message = f"🚨 EMERGENCY SOS from Braj Holi!\n\nType: {sos.emergency_type}\nLocation: {maps_url}\n\nPlease help or contact local authorities!"
        for phone in sos.emergency_contacts:
            clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
            whatsapp_links.append(f"https://wa.me/{clean_phone}?text={message}")
    
    return {
        "message": "SOS received", 
        "sos_id": sos_doc["sos_id"],
        "whatsapp_links": whatsapp_links
    }

# ===================== PUSH NOTIFICATION ROUTES =====================

@api_router.post("/push/subscribe")
async def subscribe_push(subscription: PushSubscriptionCreate):
    """Subscribe to push notifications"""
    sub_obj = PushSubscription(**subscription.model_dump())
    doc = sub_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    # Upsert by endpoint to avoid duplicates
    await db.push_subscriptions.update_one(
        {"endpoint": subscription.endpoint},
        {"$set": doc},
        upsert=True
    )
    return {"message": "Subscribed to push notifications", "subscription_id": sub_obj.subscription_id}

@api_router.delete("/push/unsubscribe")
async def unsubscribe_push(endpoint: str):
    """Unsubscribe from push notifications"""
    await db.push_subscriptions.delete_one({"endpoint": endpoint})
    return {"message": "Unsubscribed from push notifications"}

@api_router.get("/push/vapid-key")
async def get_vapid_key():
    """Get VAPID public key for push notifications"""
    # This is a demo key - in production, generate your own
    return {
        "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
    }

# ===================== EMERGENCY CONTACTS ROUTES =====================

@api_router.get("/emergency-contacts/{device_id}")
async def get_emergency_contacts(device_id: str):
    """Get emergency contacts for a device"""
    contacts = await db.emergency_contacts.find({"device_id": device_id}, {"_id": 0}).to_list(10)
    return contacts

@api_router.post("/emergency-contacts")
async def create_emergency_contact(contact: EmergencyContactCreate):
    """Create emergency contact"""
    contact_obj = EmergencyContact(**contact.model_dump())
    doc = contact_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.emergency_contacts.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/emergency-contacts/{contact_id}")
async def delete_emergency_contact(contact_id: str):
    """Delete emergency contact"""
    await db.emergency_contacts.delete_one({"contact_id": contact_id})
    return {"message": "Contact deleted"}

# ===================== MEETING POINTS ROUTES =====================

@api_router.post("/meeting-points")
async def create_meeting_point(meeting: MeetingPointCreate):
    """Create a family meeting point"""
    expires_at = datetime.now(timezone.utc) + timedelta(hours=meeting.hours_valid)
    meeting_obj = MeetingPoint(
        name=meeting.name,
        latitude=meeting.latitude,
        longitude=meeting.longitude,
        description_en=meeting.description_en,
        description_hi=meeting.description_hi,
        created_by=meeting.created_by,
        expires_at=expires_at
    )
    doc = meeting_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["expires_at"] = doc["expires_at"].isoformat()
    await db.meeting_points.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/meeting-points/{share_code}")
async def get_meeting_point(share_code: str):
    """Get meeting point by share code"""
    meeting = await db.meeting_points.find_one({"share_code": share_code.upper()}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting point not found")
    
    # Check if expired
    expires_at = meeting.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Meeting point has expired")
    
    return meeting

# ===================== BOOKMARKS ROUTES =====================

@api_router.get("/bookmarks/{device_id}")
async def get_bookmarks(device_id: str):
    """Get bookmarked events for a device"""
    bookmarks = await db.bookmarks.find({"device_id": device_id}, {"_id": 0}).to_list(100)
    # Get full event details
    event_ids = [b["event_id"] for b in bookmarks]
    events = await db.events.find({"event_id": {"$in": event_ids}}, {"_id": 0}).to_list(100)
    return events

@api_router.post("/bookmarks")
async def create_bookmark(bookmark: BookmarkCreate):
    """Bookmark an event"""
    # Check if already bookmarked
    existing = await db.bookmarks.find_one({
        "device_id": bookmark.device_id,
        "event_id": bookmark.event_id
    })
    if existing:
        return {"message": "Already bookmarked"}
    
    bookmark_obj = BookmarkedEvent(**bookmark.model_dump())
    doc = bookmark_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.bookmarks.insert_one(doc)
    return {"message": "Event bookmarked", "bookmark_id": bookmark_obj.bookmark_id}

@api_router.delete("/bookmarks/{device_id}/{event_id}")
async def delete_bookmark(device_id: str, event_id: str):
    """Remove bookmark"""
    await db.bookmarks.delete_one({"device_id": device_id, "event_id": event_id})
    return {"message": "Bookmark removed"}

# ===================== PHOTO UPLOAD ROUTES =====================

@api_router.post("/upload/photo")
async def upload_photo(photo: PhotoUpload):
    """Upload a photo (base64) and return URL"""
    import base64
    
    # Generate unique filename
    photo_id = f"photo_{uuid.uuid4().hex[:12]}"
    
    # In production, you'd upload to S3/CloudStorage
    # For now, we'll store base64 in MongoDB (small images only)
    photo_doc = {
        "photo_id": photo_id,
        "image_data": photo.image_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.photos.insert_one(photo_doc)
    
    # Return a URL to fetch the photo
    return {"photo_id": photo_id, "url": f"/api/photos/{photo_id}"}

@api_router.get("/photos/{photo_id}")
async def get_photo(photo_id: str):
    """Get photo by ID"""
    from fastapi.responses import Response
    import base64
    
    photo = await db.photos.find_one({"photo_id": photo_id}, {"_id": 0})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Decode base64 and return as image
    try:
        image_data = photo["image_data"]
        # Handle data URL format
        if "," in image_data:
            image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        return Response(content=image_bytes, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to decode image")

# ===================== REALTIME STATUS (WebSocket alternative via polling) =====================

@api_router.get("/realtime/status")
async def get_realtime_status():
    """Get all realtime data in one call for efficient polling"""
    statuses = await db.safety_status.find({}, {"_id": 0}).to_list(100)
    alerts = await db.alerts.find({"is_active": True}, {"_id": 0}).sort("created_at", -1).to_list(10)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_events = await db.events.find({"date": today}, {"_id": 0}).to_list(100)
    
    return {
        "safety_status": statuses,
        "active_alerts": alerts,
        "today_events": today_events,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ===================== HEALTH CHECK =====================

@api_router.get("/")
async def root():
    return {"message": "AUMRYX CrowdSafe API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ===================== SEED DATA ON STARTUP =====================

@app.on_event("startup")
async def seed_data():
    """Seed initial data if collections are empty"""
    
    # Seed events (Braj Holi 2026)
    events_count = await db.events.count_documents({})
    if events_count == 0:
        events = [
            {
                "event_id": "evt_lathmar_barsana",
                "title_en": "Lathmar Holi - Barsana",
                "title_hi": "लठमार होली - बरसाना",
                "description_en": "The famous Lathmar Holi where women beat men with sticks in a playful tradition.",
                "description_hi": "प्रसिद्ध लठमार होली जहां महिलाएं पुरुषों को लाठियों से मारती हैं।",
                "location_en": "Barsana, Mathura",
                "location_hi": "बरसाना, मथुरा",
                "date": "2026-03-03",
                "time_en": "9:00 AM - 2:00 PM",
                "time_hi": "सुबह 9:00 - दोपहर 2:00",
                "crowd_expectation": "high",
                "safety_advisory_en": "Reach early morning. Avoid afternoon entry. Stay hydrated.",
                "safety_advisory_hi": "सुबह जल्दी पहुंचें। दोपहर में प्रवेश से बचें। पानी पीते रहें।",
                "is_highlight": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_lathmar_nandgaon",
                "title_en": "Lathmar Holi - Nandgaon",
                "title_hi": "लठमार होली - नंदगांव",
                "description_en": "The return celebration where Nandgaon men visit Barsana women.",
                "description_hi": "जवाबी उत्सव जहां नंदगांव के पुरुष बरसाना की महिलाओं से मिलने आते हैं।",
                "location_en": "Nandgaon, Mathura",
                "location_hi": "नंदगांव, मथुरा",
                "date": "2026-03-04",
                "time_en": "10:00 AM - 3:00 PM",
                "time_hi": "सुबह 10:00 - दोपहर 3:00",
                "crowd_expectation": "high",
                "safety_advisory_en": "Book transport in advance. Carry minimal belongings.",
                "safety_advisory_hi": "परिवहन पहले से बुक करें। कम सामान ले जाएं।",
                "is_highlight": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_phoolon_vrindavan",
                "title_en": "Phoolon ki Holi - Vrindavan",
                "title_hi": "फूलों की होली - वृंदावन",
                "description_en": "A beautiful celebration with flower petals at Banke Bihari Temple.",
                "description_hi": "बांके बिहारी मंदिर में फूलों की पंखुड़ियों के साथ सुंदर उत्सव।",
                "location_en": "Banke Bihari Temple, Vrindavan",
                "location_hi": "बांके बिहारी मंदिर, वृंदावन",
                "date": "2026-03-05",
                "time_en": "4:00 PM - 6:00 PM",
                "time_hi": "शाम 4:00 - शाम 6:00",
                "crowd_expectation": "high",
                "safety_advisory_en": "Temple gets very crowded. Follow queue system.",
                "safety_advisory_hi": "मंदिर बहुत भीड़ वाला होता है। कतार प्रणाली का पालन करें।",
                "is_highlight": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_widow_holi",
                "title_en": "Widow Holi - Vrindavan",
                "title_hi": "विधवा होली - वृंदावन",
                "description_en": "Breaking taboos - widows celebrate Holi with colors and joy.",
                "description_hi": "वर्जनाओं को तोड़ते हुए - विधवाएं रंगों और खुशी के साथ होली मनाती हैं।",
                "location_en": "Gopinath Temple, Vrindavan",
                "location_hi": "गोपीनाथ मंदिर, वृंदावन",
                "date": "2026-03-06",
                "time_en": "11:00 AM - 1:00 PM",
                "time_hi": "सुबह 11:00 - दोपहर 1:00",
                "crowd_expectation": "moderate",
                "safety_advisory_en": "Respectful photography. Support local NGOs.",
                "safety_advisory_hi": "सम्मानजनक फोटोग्राफी। स्थानीय NGO का समर्थन करें।",
                "is_highlight": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_rangbharni",
                "title_en": "Rangbharni Ekadashi",
                "title_hi": "रंगभरनी एकादशी",
                "description_en": "The auspicious day when Radha Rani was first covered in colors by Krishna.",
                "description_hi": "वह शुभ दिन जब राधा रानी को कृष्ण ने पहली बार रंगों से रंगा।",
                "location_en": "Barsana & Vrindavan",
                "location_hi": "बरसाना और वृंदावन",
                "date": "2026-03-07",
                "time_en": "All Day",
                "time_hi": "पूरा दिन",
                "crowd_expectation": "high",
                "safety_advisory_en": "Peak crowd day. Plan accommodation in advance.",
                "safety_advisory_hi": "भीड़ का चरम दिन। आवास पहले से बुक करें।",
                "is_highlight": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_banke_bihari",
                "title_en": "Holi at Banke Bihari Temple",
                "title_hi": "बांके बिहारी मंदिर में होली",
                "description_en": "The most famous Holi celebration at the iconic temple.",
                "description_hi": "प्रतिष्ठित मंदिर में सबसे प्रसिद्ध होली उत्सव।",
                "location_en": "Banke Bihari Temple, Vrindavan",
                "location_hi": "बांके बिहारी मंदिर, वृंदावन",
                "date": "2026-03-10",
                "time_en": "4:00 PM - 7:00 PM",
                "time_hi": "शाम 4:00 - शाम 7:00",
                "crowd_expectation": "extreme",
                "safety_advisory_en": "Extreme crowds expected. Keep emergency contacts ready.",
                "safety_advisory_hi": "अत्यधिक भीड़ अपेक्षित। आपातकालीन संपर्क तैयार रखें।",
                "is_highlight": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_dwarkadhish",
                "title_en": "Holi at Dwarkadhish Temple",
                "title_hi": "द्वारकाधीश मंदिर में होली",
                "description_en": "Grand Holi celebration at the majestic Dwarkadhish Temple.",
                "description_hi": "भव्य द्वारकाधीश मंदिर में होली उत्सव।",
                "location_en": "Dwarkadhish Temple, Mathura",
                "location_hi": "द्वारकाधीश मंदिर, मथुरा",
                "date": "2026-03-11",
                "time_en": "10:00 AM - 2:00 PM",
                "time_hi": "सुबह 10:00 - दोपहर 2:00",
                "crowd_expectation": "high",
                "safety_advisory_en": "Shoes not allowed. Use temple storage.",
                "safety_advisory_hi": "जूते की अनुमति नहीं। मंदिर स्टोरेज का उपयोग करें।",
                "is_highlight": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_gokul_holi",
                "title_en": "Gokul Holi",
                "title_hi": "गोकुल होली",
                "description_en": "Celebrate Holi in Krishna's childhood village.",
                "description_hi": "कृष्ण के बचपन के गांव में होली मनाएं।",
                "location_en": "Gokul, Mathura",
                "location_hi": "गोकुल, मथुरा",
                "date": "2026-03-12",
                "time_en": "9:00 AM - 4:00 PM",
                "time_hi": "सुबह 9:00 - शाम 4:00",
                "crowd_expectation": "moderate",
                "safety_advisory_en": "Good for families. Less chaotic than Vrindavan.",
                "safety_advisory_hi": "परिवारों के लिए अच्छा। वृंदावन से कम अराजक।",
                "is_highlight": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "event_id": "evt_huranga",
                "title_en": "Dauji Huranga",
                "title_hi": "दाऊजी हुरंगा",
                "description_en": "Unique tradition where women tear men's clothes on the day after Holi.",
                "description_hi": "अनोखी परंपरा जहां होली के अगले दिन महिलाएं पुरुषों के कपड़े फाड़ती हैं।",
                "location_en": "Dauji Temple, Baldeo",
                "location_hi": "दाऊजी मंदिर, बलदेव",
                "date": "2026-03-13",
                "time_en": "10:00 AM - 2:00 PM",
                "time_hi": "सुबह 10:00 - दोपहर 2:00",
                "crowd_expectation": "high",
                "safety_advisory_en": "Wear clothes you don't mind losing. Intense celebration.",
                "safety_advisory_hi": "ऐसे कपड़े पहनें जो खराब होने पर परेशानी न हो। तीव्र उत्सव।",
                "is_highlight": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.events.insert_many(events)
        logger.info("Seeded events data")
    
    # Seed safety status
    status_count = await db.safety_status.count_documents({})
    if status_count == 0:
        statuses = [
            {
                "status_id": "sts_banke_bihari",
                "location_en": "Banke Bihari Temple",
                "location_hi": "बांके बिहारी मंदिर",
                "latitude": 27.5727,
                "longitude": 77.6893,
                "crowd_level": "moderate",
                "status": "safe",
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "status_id": "sts_prem_mandir",
                "location_en": "Prem Mandir",
                "location_hi": "प्रेम मंदिर",
                "latitude": 27.5844,
                "longitude": 77.6656,
                "crowd_level": "low",
                "status": "safe",
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "status_id": "sts_barsana",
                "location_en": "Barsana Temple",
                "location_hi": "बरसाना मंदिर",
                "latitude": 27.6477,
                "longitude": 77.3761,
                "crowd_level": "high",
                "status": "caution",
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "status_id": "sts_dwarkadhish",
                "location_en": "Dwarkadhish Temple",
                "location_hi": "द्वारकाधीश मंदिर",
                "latitude": 27.5041,
                "longitude": 77.6769,
                "crowd_level": "moderate",
                "status": "safe",
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "status_id": "sts_nandgaon",
                "location_en": "Nandgaon Temple",
                "location_hi": "नंदगांव मंदिर",
                "latitude": 27.6697,
                "longitude": 77.3847,
                "crowd_level": "low",
                "status": "safe",
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.safety_status.insert_many(statuses)
        logger.info("Seeded safety status data")
    
    # Seed help locations
    help_count = await db.help_locations.count_documents({})
    if help_count == 0:
        help_locations = [
            {
                "help_id": "hlp_police_mathura",
                "name_en": "Mathura Police Station",
                "name_hi": "मथुरा पुलिस स्टेशन",
                "type": "police",
                "latitude": 27.4924,
                "longitude": 77.6737,
                "address_en": "Civil Lines, Mathura",
                "address_hi": "सिविल लाइंस, मथुरा",
                "phone": "100"
            },
            {
                "help_id": "hlp_hospital_mathura",
                "name_en": "District Hospital Mathura",
                "name_hi": "जिला अस्पताल मथुरा",
                "type": "hospital",
                "latitude": 27.4950,
                "longitude": 77.6700,
                "address_en": "Hospital Road, Mathura",
                "address_hi": "अस्पताल रोड, मथुरा",
                "phone": "102"
            },
            {
                "help_id": "hlp_police_vrindavan",
                "name_en": "Vrindavan Police Chowki",
                "name_hi": "वृंदावन पुलिस चौकी",
                "type": "police",
                "latitude": 27.5700,
                "longitude": 77.6900,
                "address_en": "Near Banke Bihari Temple, Vrindavan",
                "address_hi": "बांके बिहारी मंदिर के पास, वृंदावन",
                "phone": "100"
            },
            {
                "help_id": "hlp_fire_mathura",
                "name_en": "Fire Station Mathura",
                "name_hi": "फायर स्टेशन मथुरा",
                "type": "fire",
                "latitude": 27.4900,
                "longitude": 77.6750,
                "address_en": "Station Road, Mathura",
                "address_hi": "स्टेशन रोड, मथुरा",
                "phone": "101"
            },
            {
                "help_id": "hlp_water_banke",
                "name_en": "Water Station - Banke Bihari",
                "name_hi": "पानी स्टेशन - बांके बिहारी",
                "type": "water",
                "latitude": 27.5730,
                "longitude": 77.6890,
                "address_en": "Near Banke Bihari Temple Gate",
                "address_hi": "बांके बिहारी मंदिर गेट के पास",
                "phone": None
            },
            {
                "help_id": "hlp_toilet_prem",
                "name_en": "Public Toilet - Prem Mandir",
                "name_hi": "सार्वजनिक शौचालय - प्रेम मंदिर",
                "type": "toilet",
                "latitude": 27.5840,
                "longitude": 77.6660,
                "address_en": "Prem Mandir Complex",
                "address_hi": "प्रेम मंदिर परिसर",
                "phone": None
            },
            {
                "help_id": "hlp_parking_mathura",
                "name_en": "Main Parking - Mathura",
                "name_hi": "मुख्य पार्किंग - मथुरा",
                "type": "parking",
                "latitude": 27.4960,
                "longitude": 77.6720,
                "address_en": "Near Railway Station, Mathura",
                "address_hi": "रेलवे स्टेशन के पास, मथुरा",
                "phone": None
            }
        ]
        await db.help_locations.insert_many(help_locations)
        logger.info("Seeded help locations data")
    
    # Seed sample alerts
    alerts_count = await db.alerts.count_documents({})
    if alerts_count == 0:
        alerts = [
            {
                "alert_id": "alt_welcome",
                "title_en": "Welcome to Braj Holi 2026!",
                "title_hi": "ब्रज होली 2026 में आपका स्वागत है!",
                "message_en": "Stay safe, follow official advisories, and enjoy the festival of colors!",
                "message_hi": "सुरक्षित रहें, आधिकारिक सलाह का पालन करें, और रंगों के त्योहार का आनंद लें!",
                "severity": "info",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.alerts.insert_many(alerts)
        logger.info("Seeded alerts data")
