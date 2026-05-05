# Form Customization & Field Reference

## Current Form Fields

### Application Form (`/apply`)

The form is divided into **4 sections** with the following fields:

#### 1. **Personal Information** (Required*)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full Name | Text Input | ✓ Yes | Applicant's full name |
| Email Address | Email Input | ✓ Yes | Valid email for contact |
| Phone Number | Text Input | ✓ Yes | Contact phone number |
| ID/Passport Number | Text Input | ✓ Yes | Government ID or passport |

#### 2. **Education** (Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| University | Text Input | No | Current/previous university |
| Program/Degree | Text Input | No | e.g., Bachelor of Science |
| Qualifications & Skills | Textarea | No | Relevant qualifications and skills |

#### 3. **Experience** (Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Professional/Research Experience | Textarea | No | Work history and projects |
| Motivation & Interest | Textarea | No | Why interested in the program |

#### 4. **Additional Information** (Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Other Information | Textarea | No | Any other relevant info |

---

## Database Field Mapping

The form data is stored in MongoDB with this structure:

```javascript
{
  _id: ObjectId,
  name: String,              // From "Full Name"
  email: String,             // From "Email Address"
  phone: String,             // From "Phone Number"
  id: String,                // From "ID/Passport Number"
  university: String,        // From "University"
  program: String,           // From "Program/Degree"
  qualifications: String,    // From "Qualifications & Skills"
  experience: String,        // From "Professional/Research Experience"
  motivation: String,        // From "Motivation & Interest"
  otherInfo: String,         // From "Other Information"
  status: String,            // "new" | "reviewing" | "contacted" | "accepted" | "rejected"
  notes: String,             // Admin notes (optional)
  createdAt: Date,           // Auto-set when submitted
  updatedAt: Date            // Auto-set when updated
}
```

---

## How to Customize Form Fields

### Add a New Field

**Example: Add "Country" field to Personal Information section**

**Step 1: Update Apply.tsx**

In `src/app/pages/Apply.tsx`, find the `formData` state and add the field:

```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  id: '',
  country: '',  // Add this line
  university: '',
  // ... rest of fields
});
```

**Step 2: Add HTML input field**

Find the Personal Information section and add:

```javascript
{/* Country */}
<div>
  <Label htmlFor="country" className="text-black font-medium">
    Country
  </Label>
  <Input
    id="country"
    name="country"
    value={formData.country}
    onChange={handleChange}
    placeholder="Your country"
    className="mt-2"
  />
</div>
```

**Step 3: Update form submission**

In the `handleSubmit` function, the new field will automatically be included in the request body.

**Step 4: Update Backend**

In `backend/server.js`, find the form submission endpoint and add the field:

```javascript
app.post('/api/form-submissions', async (req, res) => {
  try {
    const { 
      name, email, phone, id, country,  // Add country here
      qualifications, experience, motivation, university, program, otherInfo 
    } = req.body;
    
    // ... rest of code
    
    const submission = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      id,
      country,  // Add this line
      qualifications: qualifications || '',
      // ... rest of fields
    };
```

---

### Make a Field Required

**Example: Make "University" field required**

**In Apply.tsx:**

```javascript
// Change from optional to required
{/* University */}
<div>
  <Label htmlFor="university" className="text-black font-medium">
    Current/Previous University <span className="text-red-500">*</span>
  </Label>
  <Input
    id="university"
    name="university"
    value={formData.university}
    onChange={handleChange}
    placeholder="University name"
    className="mt-2"
    required  // Add this
  />
</div>

// Add to validation in handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Add university to required fields check
  if (!formData.name || !formData.email || !formData.phone || !formData.id || !formData.university) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }
  // ... rest of code
};
```

---

### Change Input Type

**Example: Change "Phone" to have specific pattern**

```javascript
<Input
  id="phone"
  name="phone"
  type="tel"  // Change type to "tel" for phone
  pattern="[0-9+\-().\s]+"  // Add pattern
  value={formData.phone}
  onChange={handleChange}
  placeholder="+1 (555) 123-4567"
  required
  className="mt-2"
/>
```

---

### Add Validation

**Example: Email domain restriction**

In `Apply.tsx`, update the form submission:

```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validation
  if (!formData.name || !formData.email || !formData.phone || !formData.id) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  // Add custom validation: email domain must be from MIT
  if (!formData.email.endsWith('@mit.edu')) {
    setError('Email must be an MIT email address');
    setLoading(false);
    return;
  }

  // ... rest of code
};
```

---

### Add Conditional Fields

**Example: Show different fields based on program selection**

```javascript
const [formData, setFormData] = useState({
  // ... existing fields
  program: 'master', // Add default value
  thesisTitle: '',   // New conditional field
});

// In the form JSX:
<Select value={formData.program} onValueChange={(val) => handleSelectChange('program', val)}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="master">Master's Program</SelectItem>
    <SelectItem value="phd">PhD Program</SelectItem>
  </SelectContent>
</Select>

{/* Show thesis title only for PhD */}
{formData.program === 'phd' && (
  <div>
    <Label htmlFor="thesisTitle" className="text-black font-medium">
      Proposed Thesis Title
    </Label>
    <Input
      id="thesisTitle"
      name="thesisTitle"
      value={formData.thesisTitle}
      onChange={handleChange}
      placeholder="Your thesis title"
      className="mt-2"
    />
  </div>
)}
```

---

## Admin Panel Customization

### Change Status Options

**In AdminDashboard.tsx and backend/server.js:**

Current statuses: `new`, `reviewing`, `contacted`, `accepted`, `rejected`

**To add "interview" status:**

**Backend (server.js):**
```javascript
app.put('/api/form-submissions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const { status, notes } = req.body;
    const validStatuses = ['new', 'reviewing', 'interview', 'contacted', 'accepted', 'rejected'];
    // Add 'interview' to the list
```

**Frontend (AdminDashboard.tsx):**
```javascript
<SelectItem value="new">New</SelectItem>
<SelectItem value="reviewing">Reviewing</SelectItem>
<SelectItem value="interview">Interview</SelectItem>  {/* Add this */}
<SelectItem value="contacted">Contacted</SelectItem>
<SelectItem value="accepted">Accepted</SelectItem>
<SelectItem value="rejected">Rejected</SelectItem>
```

---

### Add Status Color

**In AdminDashboard.tsx:**

```javascript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-700';
    case 'reviewing':
      return 'bg-yellow-100 text-yellow-700';
    case 'interview':
      return 'bg-purple-100 text-purple-700';  // Add this
    case 'contacted':
      return 'bg-green-100 text-green-700';
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
```

---

## Advanced Customizations

### Add File Upload

```javascript
// In Apply.tsx formData
const [files, setFiles] = useState<FileList | null>(null);

// In form JSX
<div>
  <Label htmlFor="resume" className="text-black font-medium">
    Resume/CV
  </Label>
  <Input
    id="resume"
    name="resume"
    type="file"
    onChange={(e) => setFiles(e.target.files)}
    accept=".pdf,.doc,.docx"
    className="mt-2"
  />
</div>

// In handleSubmit - use FormData to send file
const submitFormData = new FormData();
Object.keys(formData).forEach(key => {
  submitFormData.append(key, formData[key as keyof typeof formData]);
});
if (files) {
  submitFormData.append('resume', files[0]);
}

// Send with Content-Type: multipart/form-data
```

### Add Email Notifications

```javascript
// In backend/server.js after form submission
const nodemailer = require('nodemailer');

// Send confirmation email to applicant
await transporter.sendMail({
  from: 'noreply@mit.edu',
  to: submission.email,
  subject: 'Application Received',
  text: `Hi ${submission.name}, we received your application.`
});
```

### Add Application Timeline

```javascript
// Track application history
const [timeline, setTimeline] = useState([]);

// When status changes
const addTimeline = (status: string) => {
  setTimeline(prev => [...prev, { 
    status, 
    timestamp: new Date(),
    changedBy: user?.email 
  }]);
};
```

---

## Testing Customizations

After making changes:

1. **Clear form state:**
   ```bash
   # Clear localStorage to reset form
   localStorage.clear()
   ```

2. **Test field validation:**
   - Submit with missing fields
   - Verify error messages

3. **Check database:**
   ```bash
   # Check if new fields are stored
   mongosh
   > use research
   > db.form_submissions.findOne()
   ```

4. **Test admin panel:**
   - Verify new fields appear in details view
   - Test new status options

---

## Common Customization Requests

### Q: How do I change form field order?
**A:** In `Apply.tsx`, simply reorder the JSX elements. The form will render in the order you specify.

### Q: How do I add a multi-select field?
**A:** Use `CheckboxGroup` from Shadcn or create with multiple checkboxes.

### Q: How do I add date picker?
**A:** Import and use `Calendar` component from Shadcn UI components.

### Q: How do I add file uploads?
**A:** Use HTML5 `<input type="file">` and send with FormData in fetch request.

### Q: How do I limit submissions?
**A:** Add check in backend before inserting, or add client-side check in form.

---

## Need Help?

- Check `ADMIN_PANEL_GUIDE.md` for comprehensive API documentation
- Check `QUICK_START.md` for running and testing the application
- Inspect browser console (F12) for frontend errors
- Check backend terminal for server errors
- Refer to [Shadcn UI docs](https://ui.shadcn.com/) for component usage

---

**Happy customizing!** 🎨
