# 📸 Photo Upload API

A simple, lightweight backend API for uploading, managing, and deleting photos using Supabase storage. Built with Node.js and Express.

## ✨ Features

- **Single Photo Upload** - Upload one image at a time with unique encoded filenames
- **Secure Deletion** - Delete photos using their filename
- **Health Check** - Monitor API status and connectivity
- **File Validation** - Only accepts image files (JPG, PNG, GIF, WebP)
- **Size Limits** - Maximum 5MB per image
- **Unique Filenames** - MD5 hash + random bytes + timestamp for collision-free names
- **CORS Enabled** - Ready for frontend integration
- **Error Handling** - Comprehensive error responses

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone or create the project**
   ```bash
   mkdir photo-upload-api
   cd photo-upload-api
   ```

2. **Install dependencies**
   ```bash
   npm install express multer @supabase/supabase-js cors dotenv
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment variables**
   Edit `.env` file with your Supabase credentials

5. **Setup Supabase Storage**
   - Go to your Supabase dashboard
   - Navigate to Storage → Buckets
   - Create a new bucket named "Photos"
   - Make it public for image viewing

6. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

The API will be running at `http://localhost:3000`

## 📋 API Endpoints

### Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "Photo Upload API"
}
```

### Upload Photo
```
POST /upload
Content-Type: multipart/form-data
```

**Parameters:**
- `photo` (file) - Image file to upload

**Response (Success):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "filename": "a1b2c3d4_ef567890_1735123456789.jpg",
    "url": "https://your-project.supabase.co/storage/v1/object/public/Photos/a1b2c3d4_ef567890_1735123456789.jpg",
    "size": 245760,
    "type": "image/jpeg"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "No photo file provided"
}
```

### Delete Photo
```
DELETE /delete/:filename
```

**Parameters:**
- `filename` (string) - The filename to delete

**Response (Success):**
```json
{
  "success": true,
  "message": "Photo deleted successfully",
  "data": {
    "filename": "a1b2c3d4_ef567890_1735123456789.jpg"
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
BUCKET_NAME=Photos

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 🛠️ Development

### File Structure
```
photo-upload-api/
├── server.js          # Main application file
├── .env               # Environment variables
├── .env.example       # Environment template
├── package.json       # Dependencies and scripts
├── README.md          # This file
└── demo.html          # Frontend demo (optional)
```

### Running in Development

1. **Install nodemon for auto-restart**
   ```bash
   npm install -D nodemon
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

## 📝 Usage Examples

### Using cURL

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Upload Photo:**
```bash
curl -X POST \
  -F "photo=@/path/to/your/image.jpg" \
  http://localhost:3000/upload
```

**Delete Photo:**
```bash
curl -X DELETE \
  http://localhost:3000/delete/a1b2c3d4_ef567890_1735123456789.jpg
```

### Using JavaScript (Frontend)

```javascript
// Upload photo
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

const response = await fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

## 🔒 Security Considerations

- **File Type Validation** - Only image files are accepted
- **File Size Limits** - Maximum 5MB per upload
- **Unique Filenames** - Prevents file collision and directory traversal
- **CORS Configuration** - Adjust CORS settings for production
- **Environment Variables** - Keep sensitive data in `.env` file

## 🚀 Deployment

### Using PM2 (Recommended)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**
   ```bash
   pm2 start server.js --name "photo-api"
   pm2 startup
   pm2 save
   ```

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t photo-api .
   docker run -p 3000:3000 --env-file .env photo-api
   ```

## 🐛 Troubleshooting

### Common Issues

**"Bucket not found" error:**
- Ensure you've created the "Photos" bucket in Supabase
- Check that bucket name matches `BUCKET_NAME` in `.env`

**"Permission denied" error:**
- Verify your Supabase anon key has storage permissions
- Check if the bucket is set to public

**CORS errors:**
- Add your frontend domain to CORS configuration
- For development, ensure you're accessing via the correct port

### Debug Mode

Set `NODE_ENV=development` in your `.env` file for detailed error logging.

## 📄 License

MIT License - feel free to use this in your projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the maintainer.

---

**Happy coding! 🎉**