# Application Form & Admin Panel - Implementation Guide

## Overview
This implementation adds a complete application form submission system with an admin panel for managing submissions. Users can apply through the website, and admins can review, track, and manage applications.

## New Features

### 1. **Application Form** (`/apply`)
**File:** `src/app/pages/Apply.tsx`

Users can submit applications with the following fields:
- **Personal Information:** Name, Email, Phone Number, ID/Passport Number
- **Education:** University, Program/Degree, Qualifications & Skills
- **Experience:** Professional/Research Experience, Motivation & Interest
- **Additional Information:** Other relevant information

**Features:**
- Form validation
- Success confirmation message
- Error handling
- Clean, professional UI
- Responsive design

**Usage:** Click "Apply Now" button on MAS Graduate Program page or navigate to `/apply`

---

### 2. **Admin Authentication**

#### Admin Signup (`/admin/signup`)
**File:** `src/app/pages/AdminSignup.tsx`

Admin users can create new accounts with:
- Full Name
- Email Address
- Password (minimum 6 characters)
- Password Confirmation

**Features:**
- Email validation
- Password strength validation
- Automatic role assignment (first user gets 'admin' role, others get 'student')
- Token-based authentication

#### Admin Login (`/admin/login`)
**File:** `src/app/pages/AdminLogin.tsx`

Existing admins can login with:
- Email
- Password

**Features:**
- Secure JWT authentication
- Session persistence in localStorage
- Automatic redirect to admin dashboard after login
- Role-based access control

---

### 3. **Admin Dashboard** (`/admin/dashboard`)
**File:** `src/app/pages/AdminDashboard.tsx`

Complete admin panel for managing form submissions with:

**Statistics Section:**
- Total submissions count
- Breakdown by status (New, Reviewing, Contacted, Accepted, Rejected)

**Submission Management:**
- **View All Submissions:** Paginated list of all submissions
- **Search:** Filter by name, email, phone, or ID
- **Status Filter:** Filter submissions by status
- **View Details:** Click on any submission to view full details
- **Update Status:** Change submission status with dropdown
- **Delete:** Remove unwanted submissions
- **Pagination:** Navigate through submissions (20 per page)

**Status Options:**
- `new` - New application
- `reviewing` - Under review
- `contacted` - Applicant contacted
- `accepted` - Application accepted
- `rejected` - Application rejected

**Features:**
- Protected route (requires admin login)
- Responsive table layout
- Real-time statistics
- Color-coded status badges
- Logout functionality

---

## Backend API Endpoints

### Form Submissions

**1. Submit Form (Public)**
```
POST /api/form-submissions
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "id": "123456789",
  "university": "MIT",
  "program": "Computer Science",
  "qualifications": "...",
  "experience": "...",
  "motivation": "...",
  "otherInfo": "..."
}

Response: { success: true, id: "submission_id" }
```

**2. Get All Submissions (Admin Only)**
```
GET /api/form-submissions?page=1&limit=20&status=new&search=john
Authorization: Bearer {token}

Response: {
  submissions: [...],
  total: 100,
  page: 1,
  totalPages: 5
}
```

**3. Get Single Submission (Admin Only)**
```
GET /api/form-submissions/{id}
Authorization: Bearer {token}

Response: { submission: {...} }
```

**4. Update Submission Status (Admin Only)**
```
PUT /api/form-submissions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "reviewing",
  "notes": "Under review..."
}

Response: { submission: {...} }
```

**5. Delete Submission (Admin Only)**
```
DELETE /api/form-submissions/{id}
Authorization: Bearer {token}

Response: { success: true, message: "Submission deleted" }
```

**6. Get Statistics (Admin Only)**
```
GET /api/form-submissions-stats
Authorization: Bearer {token}

Response: {
  total: 50,
  byStatus: {
    "new": 15,
    "reviewing": 10,
    "contacted": 15,
    "accepted": 8,
    "rejected": 2
  }
}
```

### Authentication

**1. Register Admin**
```
POST /api/auth/register
Content-Type: application/json

{ "name": "Admin Name", "email": "admin@example.com", "password": "password123" }
Response: { user: {...}, token: "jwt_token" }
```

**2. Admin Login**
```
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "password123" }
Response: { user: {...}, token: "jwt_token" }
```

---

## Database Schema

### form_submissions Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  id: String,                    // ID/Passport Number
  university: String,
  program: String,
  qualifications: String,
  experience: String,
  motivation: String,
  otherInfo: String,
  status: String,                // new, reviewing, contacted, accepted, rejected
  notes: String,                 // Admin notes
  createdAt: Date,
  updatedAt: Date
}
```

### users Collection (Updated)
Already has all necessary fields for admin authentication. New admin users will be created with `role: 'admin'`

---

## Files Created/Modified

### New Files Created:
1. **Frontend Pages:**
   - `src/app/pages/Apply.tsx` - Application form page
   - `src/app/pages/AdminLogin.tsx` - Admin login page
   - `src/app/pages/AdminSignup.tsx` - Admin signup page
   - `src/app/pages/AdminDashboard.tsx` - Admin dashboard with submission management

2. **Components:**
   - `src/app/components/ProtectedRoute.tsx` - Route protection for admin pages

### Modified Files:
1. **Backend:**
   - `backend/server.js` - Added form submission endpoints and collection initialization

2. **Frontend:**
   - `src/app/App.tsx` - Added new routes for apply, admin pages

---

## Environment Variables

Add these to your `.env` file if needed:

```env
# Backend
VITE_API_URL=http://localhost:4000
```

The backend already uses `http://localhost:4000` as default if not specified.

---

## User Flow

### For Applicants:
1. Navigate to `/apply` or click "Apply Now" button
2. Fill out the application form
3. Submit the form
4. See confirmation message
5. Application is saved to the database

### For Admins:
1. **First Time:** Go to `/admin/signup` → Create admin account → Automatically redirected to dashboard
2. **Subsequent Times:** Go to `/admin/login` → Login with credentials → Access dashboard
3. View all submissions in a table
4. Search and filter submissions
5. Click on any submission to view full details
6. Update status of submissions
7. Delete unwanted submissions
8. Logout from the dashboard

---

## Security Features

✅ **Authentication:**
- JWT token-based authentication
- Tokens expire after 8 hours
- Secure password hashing with bcrypt

✅ **Authorization:**
- Protected routes (only admins can access `/admin/*`)
- Role-based access control
- Admin-only API endpoints

✅ **Data Validation:**
- Required field validation
- Email format validation
- Password strength requirements
- Input sanitization

---

## Styling

All components use the existing **Shadcn UI** components from your project:
- Button
- Input
- Textarea
- Select
- Table
- Label
- AlertDialog
- Icons from lucide-react

---

## Next Steps / Enhancements

Consider adding:
1. Email notifications when admin updates status
2. Export submissions to CSV
3. Bulk status updates
4. Admin user management
5. Submission comments/notes system
6. Email confirmation for applicants
7. Application deadline
8. Different application forms for different programs
9. File uploads (resume, portfolio)
10. Admin activity logs

---

## Testing the Application

### Test Submission:
1. Go to `http://localhost:5173/apply`
2. Fill in all required fields
3. Click "Submit Application"
4. See success message

### Test Admin Panel:
1. Go to `http://localhost:5173/admin/signup`
2. Create first admin account
3. You'll be redirected to dashboard
4. View submitted applications
5. Update statuses
6. Search and filter submissions

---

## Troubleshooting

**Issue:** Can't submit form
- **Solution:** Make sure backend server is running on port 4000
- **Command:** `cd project/backend && npm run dev`

**Issue:** Admin login not working
- **Solution:** Make sure you signed up first or credentials are correct
- **Solution:** Check if token is properly stored in localStorage

**Issue:** Can't see submissions on admin panel
- **Solution:** Verify you're logged in as admin
- **Solution:** Check if form submissions exist (submit at least one)
- **Solution:** Check browser console for API errors

---

## API Testing with cURL

```bash
# Submit form
curl -X POST http://localhost:4000/api/form-submissions \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","phone":"123","id":"456"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Get submissions (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/form-submissions
```

---

## Support

For issues or questions, check:
1. Browser console for errors
2. Backend console for server logs
3. Database connection status
4. JWT token validity
5. CORS settings

---

**Implementation Complete!** 🎉

Your application now has:
✅ User application form
✅ Admin authentication (signup/login)
✅ Efficient admin dashboard
✅ Submission management
✅ Search and filtering
✅ Status tracking
✅ Complete API backend
