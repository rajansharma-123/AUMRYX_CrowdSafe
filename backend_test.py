#!/usr/bin/env python3
"""
AUMRYX CrowdSafe Backend API Testing Suite
Tests all API endpoints for the Braj Holi 2026 safety platform
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Tuple

class CrowdSafeAPITester:
    def __init__(self, base_url="https://brajholisafety.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.results = {}

    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: dict = None, headers: dict = None) -> Tuple[bool, dict]:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    response_data = response.json() if response.content else {}
                except:
                    response_data = {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"   Response: {response.text[:200]}", "FAIL")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                response_data = {}

            self.results[name] = {
                'success': success,
                'status_code': response.status_code,
                'expected_status': expected_status,
                'response_size': len(response.content) if response.content else 0
            }

            return success, response_data

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            self.results[name] = {
                'success': False,
                'error': str(e)
            }
            return False, {}

    def test_health_endpoints(self):
        """Test basic health and connectivity"""
        self.log("=== Testing Health Endpoints ===")
        
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_events_endpoints(self):
        """Test events API endpoints"""
        self.log("=== Testing Events Endpoints ===")
        
        # Public endpoints
        success, events = self.run_test("Get All Events", "GET", "events", 200)
        if success and events:
            self.log(f"   Found {len(events)} events")
            
        success, today_events = self.run_test("Get Today's Events", "GET", "events/today", 200)
        if success:
            self.log(f"   Found {len(today_events)} events today")
            
        success, highlights = self.run_test("Get Highlight Events", "GET", "events/highlights", 200)
        if success and highlights:
            self.log(f"   Found {len(highlights)} highlight events")

    def test_safety_status_endpoints(self):
        """Test safety status API endpoints"""
        self.log("=== Testing Safety Status Endpoints ===")
        
        success, statuses = self.run_test("Get Safety Status", "GET", "safety-status", 200)
        if success and statuses:
            self.log(f"   Found {len(statuses)} safety status locations")
            # Check data structure
            if statuses and isinstance(statuses[0], dict):
                required_fields = ['location_en', 'location_hi', 'crowd_level', 'status', 'latitude', 'longitude']
                missing_fields = [f for f in required_fields if f not in statuses[0]]
                if missing_fields:
                    self.log(f"   ⚠️  Missing fields in safety status: {missing_fields}", "WARN")

    def test_alerts_endpoints(self):
        """Test alerts API endpoints"""
        self.log("=== Testing Alerts Endpoints ===")
        
        success, alerts = self.run_test("Get Active Alerts", "GET", "alerts", 200)
        if success and alerts:
            self.log(f"   Found {len(alerts)} active alerts")
            
        success, all_alerts = self.run_test("Get All Alerts", "GET", "alerts/all", 200)
        if success:
            self.log(f"   Found {len(all_alerts)} total alerts")

    def test_help_locations_endpoints(self):
        """Test help locations API endpoints"""
        self.log("=== Testing Help Locations Endpoints ===")
        
        success, locations = self.run_test("Get Help Locations", "GET", "help-locations", 200)
        if success and locations:
            self.log(f"   Found {len(locations)} help locations")
            
            # Test type filtering
            types = set(loc.get('type') for loc in locations if loc.get('type'))
            self.log(f"   Available types: {', '.join(types)}")
            
            for help_type in ['police', 'hospital', 'fire']:
                if help_type in types:
                    success, type_locations = self.run_test(
                        f"Get {help_type.title()} Locations", 
                        "GET", 
                        f"help-locations/{help_type}", 
                        200
                    )
                    if success:
                        self.log(f"   Found {len(type_locations)} {help_type} locations")

    def test_lost_found_endpoints(self):
        """Test lost & found API endpoints"""
        self.log("=== Testing Lost & Found Endpoints ===")
        
        success, reports = self.run_test("Get Lost & Found Reports", "GET", "lost-found", 200)
        if success:
            self.log(f"   Found {len(reports)} open reports")
            
        # Test creating a report
        test_report = {
            "report_type": "lost",
            "item_description_en": "Test item for API testing",
            "item_description_hi": "API परीक्षण के लिए परीक्षण वस्तु",
            "location_en": "Test Location",
            "location_hi": "परीक्षण स्थान",
            "contact_number": "9999999999",
            "reporter_name": "Test Reporter"
        }
        
        success, created_report = self.run_test(
            "Create Lost Report", 
            "POST", 
            "lost-found", 
            200, 
            data=test_report
        )
        if success and created_report:
            self.log(f"   Created report with ID: {created_report.get('report_id')}")

    def test_sos_endpoint(self):
        """Test SOS functionality"""
        self.log("=== Testing SOS Endpoint ===")
        
        test_sos = {
            "latitude": 27.5727,
            "longitude": 77.6893,
            "emergency_type": "police",
            "message": "Test SOS from API testing"
        }
        
        success, sos_response = self.run_test("Send SOS", "POST", "sos", 200, data=test_sos)
        if success and sos_response:
            self.log(f"   SOS logged with ID: {sos_response.get('sos_id')}")

    def test_auth_endpoints(self):
        """Test authentication endpoints (without actual auth)"""
        self.log("=== Testing Auth Endpoints ===")
        
        # Test auth/me without token (should fail)
        self.run_test("Get User Info (No Auth)", "GET", "auth/me", 401)
        
        # Test logout
        self.run_test("Logout", "POST", "auth/logout", 200)

    def test_enhanced_features(self):
        """Test new enhanced features"""
        self.log("=== Testing Enhanced Features ===")
        
        # Test device ID for bookmarks and contacts
        test_device_id = "test_device_12345"
        
        # Test Emergency Contacts
        self.log("--- Testing Emergency Contacts ---")
        success, contacts = self.run_test("Get Emergency Contacts", "GET", f"emergency-contacts/{test_device_id}", 200)
        if success:
            self.log(f"   Found {len(contacts)} emergency contacts")
        
        # Create emergency contact
        test_contact = {
            "device_id": test_device_id,
            "name": "Test Contact",
            "phone": "+919999999999",
            "relationship": "family"
        }
        success, created_contact = self.run_test("Create Emergency Contact", "POST", "emergency-contacts", 200, data=test_contact)
        contact_id = None
        if success and created_contact:
            contact_id = created_contact.get('contact_id')
            self.log(f"   Created contact with ID: {contact_id}")
        
        # Test Meeting Points
        self.log("--- Testing Meeting Points ---")
        test_meeting = {
            "name": "Test Meeting Point",
            "latitude": 27.5727,
            "longitude": 77.6893,
            "description_en": "Test meeting point",
            "description_hi": "परीक्षण मिलन स्थल",
            "created_by": test_device_id,
            "hours_valid": 24
        }
        success, created_meeting = self.run_test("Create Meeting Point", "POST", "meeting-points", 200, data=test_meeting)
        share_code = None
        if success and created_meeting:
            share_code = created_meeting.get('share_code')
            self.log(f"   Created meeting point with share code: {share_code}")
            
            # Test getting meeting point by share code
            if share_code:
                success, meeting_data = self.run_test("Get Meeting Point by Code", "GET", f"meeting-points/{share_code}", 200)
                if success:
                    self.log(f"   Retrieved meeting point: {meeting_data.get('name')}")
        
        # Test Bookmarks
        self.log("--- Testing Bookmarks ---")
        success, bookmarks = self.run_test("Get Bookmarks", "GET", f"bookmarks/{test_device_id}", 200)
        if success:
            self.log(f"   Found {len(bookmarks)} bookmarked events")
        
        # Get an event to bookmark
        success, events = self.run_test("Get Events for Bookmark Test", "GET", "events", 200)
        if success and events:
            test_event_id = events[0].get('event_id')
            if test_event_id:
                # Create bookmark
                bookmark_data = {
                    "device_id": test_device_id,
                    "event_id": test_event_id
                }
                success, bookmark_result = self.run_test("Create Bookmark", "POST", "bookmarks", 200, data=bookmark_data)
                if success:
                    self.log(f"   Bookmarked event: {test_event_id}")
                    
                    # Test removing bookmark
                    success, remove_result = self.run_test("Remove Bookmark", "DELETE", f"bookmarks/{test_device_id}/{test_event_id}", 200)
                    if success:
                        self.log(f"   Removed bookmark for event: {test_event_id}")
        
        # Test Photo Upload
        self.log("--- Testing Photo Upload ---")
        # Simple base64 test image (1x1 pixel PNG)
        test_image_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        photo_data = {"image_data": test_image_b64}
        success, photo_result = self.run_test("Upload Photo", "POST", "upload/photo", 200, data=photo_data)
        if success and photo_result:
            photo_id = photo_result.get('photo_id')
            self.log(f"   Uploaded photo with ID: {photo_id}")
            
            # Test getting photo
            if photo_id:
                success, photo_response = self.run_test("Get Photo", "GET", f"photos/{photo_id}", 200)
                if success:
                    self.log(f"   Retrieved photo successfully")
        
        # Test Real-time Status
        self.log("--- Testing Real-time Status ---")
        success, realtime_data = self.run_test("Get Real-time Status", "GET", "realtime/status", 200)
        if success and realtime_data:
            self.log(f"   Real-time data includes:")
            self.log(f"     Safety status: {len(realtime_data.get('safety_status', []))} locations")
            self.log(f"     Active alerts: {len(realtime_data.get('active_alerts', []))} alerts")
            self.log(f"     Today events: {len(realtime_data.get('today_events', []))} events")
        
        # Test Push Notification endpoints
        self.log("--- Testing Push Notifications ---")
        success, vapid_key = self.run_test("Get VAPID Key", "GET", "push/vapid-key", 200)
        if success and vapid_key:
            self.log(f"   VAPID key available: {vapid_key.get('publicKey', 'N/A')[:20]}...")
        
        # Test push subscription (mock data)
        push_sub_data = {
            "endpoint": "https://test.endpoint.com/push",
            "keys": {"p256dh": "test_key", "auth": "test_auth"}
        }
        success, sub_result = self.run_test("Subscribe Push", "POST", "push/subscribe", 200, data=push_sub_data)
        if success:
            self.log(f"   Push subscription created")
        
        # Clean up created test data
        if contact_id:
            self.run_test("Delete Test Contact", "DELETE", f"emergency-contacts/{contact_id}", 200)

    def test_data_quality(self):
        """Test data quality and structure"""
        self.log("=== Testing Data Quality ===")
        
        # Get events and check bilingual content
        success, events = self.run_test("Events Data Quality", "GET", "events", 200)
        if success and events:
            bilingual_check = True
            for event in events[:3]:  # Check first 3 events
                required_fields = ['title_en', 'title_hi', 'description_en', 'description_hi', 
                                 'location_en', 'location_hi', 'date', 'time_en', 'time_hi']
                missing = [f for f in required_fields if not event.get(f)]
                if missing:
                    self.log(f"   ⚠️  Event {event.get('event_id')} missing: {missing}", "WARN")
                    bilingual_check = False
            
            if bilingual_check:
                self.log("   ✅ All events have bilingual content")

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("🚀 Starting AUMRYX CrowdSafe API Testing Suite")
        self.log(f"Testing against: {self.base_url}")
        
        try:
            # Test all endpoints
            self.test_health_endpoints()
            self.test_events_endpoints()
            self.test_safety_status_endpoints()
            self.test_alerts_endpoints()
            self.test_help_locations_endpoints()
            self.test_lost_found_endpoints()
            self.test_sos_endpoint()
            self.test_auth_endpoints()
            self.test_enhanced_features()
            self.test_data_quality()
            
        except KeyboardInterrupt:
            self.log("Testing interrupted by user", "WARN")
        except Exception as e:
            self.log(f"Unexpected error during testing: {e}", "ERROR")
        
        # Print summary
        self.print_summary()
        
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test results summary"""
        self.log("=" * 50)
        self.log("📊 TEST SUMMARY")
        self.log("=" * 50)
        self.log(f"Total Tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed}")
        self.log(f"Failed: {len(self.failed_tests)}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            self.log("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                self.log(f"  • {failure['test']}")
                if 'error' in failure:
                    self.log(f"    Error: {failure['error']}")
                else:
                    self.log(f"    Expected: {failure['expected']}, Got: {failure['actual']}")
        
        # API Coverage Summary
        self.log("\n📋 API ENDPOINT COVERAGE:")
        endpoints_tested = [
            "✅ Health & Root endpoints",
            "✅ Events (all, today, highlights)",
            "✅ Safety Status locations",
            "✅ Alerts (active & all)",
            "✅ Help Locations (all types)",
            "✅ Lost & Found reports",
            "✅ SOS emergency logging",
            "✅ Auth endpoints (basic)",
            "✅ Emergency Contacts (CRUD)",
            "✅ Meeting Points with share codes",
            "✅ Event Bookmarking (CRUD)",
            "✅ Photo Upload & Retrieval",
            "✅ Real-time Status polling",
            "✅ Push Notifications (VAPID & Subscribe)",
            "✅ Data quality validation"
        ]
        for endpoint in endpoints_tested:
            self.log(f"  {endpoint}")

def main():
    """Main test execution"""
    tester = CrowdSafeAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"Fatal error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())