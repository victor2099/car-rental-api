# Profile Picture Upload API Documentation

## 🚀 **Profile Picture Management Endpoints**

### **Authentication Required**
All profile picture endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 **Endpoints**

### 1. **POST /api/auth/profile/picture**
Upload or update user's profile picture.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
profilePicture: <image-file>
```

**File Requirements:**
- **Formats**: JPG, JPEG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Auto-transformation**: Resized to 500x500px, optimized quality

**Success Response (200):**
```json
{
  "message": "Profile picture uploaded successfully",
  "profilePicture": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/car-rental-profiles/profile_userId_timestamp.jpg",
    "uploadedAt": "2025-01-10T19:30:00.000Z"
  }
}
```

**Example Usage:**
```javascript
const formData = new FormData();
formData.append('profilePicture', fileInput.files[0]);

const response = await fetch('/api/auth/profile/picture', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

### 2. **GET /api/auth/profile**
Get user's complete profile including profile picture.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "isVerified": true,
    "provider": "local",
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/...",
    "profilePicture": {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
      "publicId": "car-rental-profiles/profile_userId_timestamp",
      "uploadedAt": "2025-01-10T19:30:00.000Z"
    },
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-10T19:30:00.000Z"
  }
}
```

---

### 3. **DELETE /api/auth/profile/picture**
Delete user's profile picture.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Profile picture deleted successfully"
}
```

---

### 4. **PUT /api/auth/profile**
Update user's profile information (name, email).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "New Name",
    "email": "newemail@example.com",
    "isVerified": false,
    "profilePicture": {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
      "uploadedAt": "2025-01-10T19:30:00.000Z"
    }
  }
}
```

**Note:** If email is changed, user will be marked as unverified and will receive a verification email.

---

## 🔧 **Setup Requirements**

### 1. **Cloudinary Account**
Create a free account at [Cloudinary](https://cloudinary.com/)

### 2. **Environment Variables**
Add to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. **Cloudinary Dashboard**
- Go to Dashboard → Settings → Upload
- Configure upload presets if needed
- Monitor usage in Media Library

---

## 🎨 **Image Processing Features**

### **Automatic Optimizations:**
- **Resize**: 500x500 pixels
- **Crop**: Fill with face detection
- **Format**: Converted to JPG
- **Quality**: Auto-optimized
- **Folder**: Organized in 'car-rental-profiles'

### **File Naming:**
```
profile_{userId}_{timestamp}.jpg
```

### **Security Features:**
- File type validation
- Size limits (5MB max)
- Secure URL generation
- Public ID extraction for cleanup

---

## 📱 **Frontend Integration Examples**

### **React File Upload Component:**
```jsx
import React, { useState } from 'react';

const ProfilePictureUpload = ({ token, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/auth/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        onUploadSuccess(result.profilePicture);
        alert('Profile picture updated successfully!');
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-upload">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleFileSelect(e);
          handleUpload(e);
        }}
        disabled={uploading}
      />
      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          style={{ width: 100, height: 100, borderRadius: '50%' }}
        />
      )}
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

### **Vanilla JavaScript Example:**
```javascript
// File upload with preview
function setupProfileUpload() {
  const input = document.getElementById('profilePictureInput');
  const preview = document.getElementById('preview');
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show preview
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    
    // Upload file
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Upload successful:', result);
      } else {
        console.error('Upload failed:', result.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  });
}
```

---

## ⚠️ **Error Responses**

### **400 Bad Request:**
```json
{
  "message": "No image file provided"
}
```

### **401 Unauthorized:**
```json
{
  "message": "Access denied. No token provided."
}
```

### **413 Payload Too Large:**
```json
{
  "message": "File too large. Maximum size is 5MB."
}
```

### **415 Unsupported Media Type:**
```json
{
  "message": "Only image files are allowed!"
}
```

---

## 🔐 **Security Considerations**

1. **File Validation**: Only image files accepted
2. **Size Limits**: 5MB maximum file size
3. **Format Restriction**: Safe image formats only
4. **Authentication**: JWT token required
5. **Automatic Cleanup**: Old images deleted when new ones uploaded
6. **URL Security**: Cloudinary secure URLs
7. **Rate Limiting**: Consider implementing rate limits

Your profile picture upload system is now complete and production-ready!
