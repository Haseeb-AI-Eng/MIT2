# Quick Start Guide - Admin Panel & Application Form

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB running locally (default: `mongodb://localhost:27017/`)
- Backend and frontend development servers

---

## Step 1: Start the Backend Server

```bash
cd backend
npm install  # Only needed first time
npm run dev
```

Expected output:
```
✅ Connected to MongoDB research
🚀 Backend running on http://localhost:4000
```

---

## Step 2: Start the Frontend Server

In a new terminal:

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

Expected output:
```
VITE v5.x.x ready in ... ms

➜ Local: http://localhost:5173/
```

---

## Step 3: Test the Application

### A. Submit an Application Form

1. Open browser: `http://localhost:5173/mas-graduate-program`
2. Scroll down and click **"Apply Now"** button
3. Or directly go to: `http://localhost:5173/apply`
4. Fill in the form fields:
   - **Name:** John Doe
   - **Email:** john@example.com
   - **Phone:** +1 (555) 123-4567
   - **ID:** ABC123456
   - **University:** MIT
   - **Program:** Computer Science
   - Add any additional info
5. Click **"Submit Application"**
6. You should see a success confirmation ✓

---

### B. Create Admin Account (First Time)

1. Go to: `http://localhost:5173/admin/signup`
2. Fill in the form:
   - **Name:** Admin User
   - **Email:** admin@example.com
   - **Password:** admin123
   - **Confirm Password:** admin123
3. Click **"Create Admin Account"**
4. **Important:** First user automatically becomes an ADMIN
5. You should be redirected to the admin dashboard

---

### C. Login to Admin Panel

If you already created an admin account:

1. Go to: `http://localhost:5173/admin/login`
2. Enter credentials:
   - **Email:** admin@example.com
   - **Password:** admin123
3. Click **"Sign In"**
4. You'll see the admin dashboard with all submissions

---

### D. Manage Submissions (Admin Dashboard)

In the admin dashboard at `/admin/dashboard`:

**View Statistics:**
- See total submissions and breakdown by status
- Monitor New, Reviewing, Contacted, Accepted, Rejected counts

**Search & Filter:**
- Search by name, email, phone, or ID
- Filter by status using the dropdown
- Results update in real-time

**View Details:**
- Click the eye icon on any submission
- See all form details
- Update status from dropdown
- View submission date

**Actions:**
- **Update Status:** Change status for any application
- **View Full Details:** Click eye icon to see complete information
- **Delete:** Remove unwanted submissions
- **Logout:** Click logout button in top right

---

## 📊 Test Workflow

### Complete Application Workflow:

1. **Submit Multiple Applications:**
   ```
   User 1: John Doe (john@example.com)
   User 2: Jane Smith (jane@example.com)
   User 3: Bob Johnson (bob@example.com)
   ```

2. **Track Status:**
   - All submissions start as "New"
   - Update some to "Reviewing"
   - Update some to "Contacted"
   - Update some to "Accepted"

3. **Use Filters:**
   - Filter by status to see only "New" applications
   - Search for "John" to find specific applicant
   - Navigate through pages

4. **View Details:**
   - Click on any application
   - Review all information
   - Update status
   - Go back to list

---

## 📱 Route Map

| Route | Purpose | Access |
|-------|---------|--------|
| `/apply` | Application form | Public |
| `/admin/login` | Admin login | Public |
| `/admin/signup` | Admin registration | Public |
| `/admin/dashboard` | Submission management | Admin only |

---

## 🔐 Authentication Details

### First User Creation:
- First user to sign up automatically gets **admin** role
- Subsequent users would get **student** role (if using register endpoint)

### Login/Session:
- JWT tokens last **8 hours**
- Token stored in `localStorage` as "token"
- User info stored in `localStorage` as "user"
- Logout clears both

### Protected Routes:
- `/admin/*` routes check for valid JWT + admin role
- Non-authorized users redirected to `/admin/login`

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Make sure MongoDB is running
# Linux/Mac:
mongod

# Windows:
# Start MongoDB from Services or run mongod.exe
```

### "API not responding"
```bash
# Check backend is running on port 4000
# Terminal output should show: 🚀 Backend running on http://localhost:4000
npm run dev  # in backend folder
```

### "Forms not displaying"
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Hard reload (Ctrl+F5)
# Check browser console for errors (F12)
```

### "Can't login after signup"
- Make sure you're using correct email/password
- Check if you're trying to login as admin (first user is admin by default)
- Try signing up with a different email

---

## 📋 API Testing (Optional)

### Test with curl or Postman:

**1. Submit Form:**
```bash
curl -X POST http://localhost:4000/api/form-submissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "5551234567",
    "id": "ID123"
  }'
```

**2. Get Admin Token:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**3. Get All Submissions (replace TOKEN):**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/form-submissions
```

---

## ✅ Checklist

After implementation, verify:

- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Can access `/apply` page
- [ ] Can fill and submit application form
- [ ] Form success message appears
- [ ] Can signup as admin at `/admin/signup`
- [ ] Redirected to dashboard after signup
- [ ] Can see submitted applications in dashboard
- [ ] Can search applications
- [ ] Can filter by status
- [ ] Can view full application details
- [ ] Can update application status
- [ ] Can delete applications
- [ ] Can logout
- [ ] Can login again at `/admin/login`

---

## 📞 Help & Support

**Check logs:**
- **Backend logs:** Look at terminal where you ran `npm run dev` in backend
- **Frontend logs:** Open browser DevTools (F12) → Console tab
- **API errors:** Check Network tab in DevTools

**Common issues:**
- Database not connected? Start MongoDB
- Port 4000 in use? Change PORT in `backend/server.js`
- Port 5173 in use? Vite will use next available port
- CORS errors? Check backend server has `cors()` enabled

---

## 🎉 You're All Set!

Your admin panel is now fully functional. Users can apply through the form, and admins can manage all submissions through the dashboard.

**Next steps:**
- Test the complete workflow
- Customize form fields if needed
- Add email notifications (future enhancement)
- Set up production deployment

Enjoy! 🚀
