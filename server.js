const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for single file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Generate unique encoded filename
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('md5').update(originalName + timestamp).digest('hex').substring(0, 8);
  const ext = originalName.split('.').pop() || 'jpg';
  
  return `${hash}_${randomBytes}_${timestamp}.${ext}`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Photo Upload API'
  });
});

// Upload photo endpoint
app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No photo file provided' 
      });
    }

    // Generate unique encoded filename
    const uniqueFilename = generateUniqueFilename(req.file.originalname);

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFilename, req.file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: req.file.mimetype
      });

    if (error) {
      return res.status(500).json({ 
        success: false,
        error: `Upload failed: ${error.message}` 
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueFilename);

    // Return success response with photo link
    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        filename: uniqueFilename,
        url: urlData.publicUrl,
        size: req.file.size,
        type: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Delete photo endpoint
app.delete('/delete/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ 
        success: false,
        error: 'Filename is required' 
      });
    }

    // Delete from Supabase storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) {
      return res.status(500).json({ 
        success: false,
        error: `Delete failed: ${error.message}` 
      });
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        filename: filename
      }
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large (max 5MB)' 
      });
    }
  }
  
  res.status(500).json({ 
    success: false,
    error: error.message || 'Something went wrong' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Photo Upload API running on port ${PORT}`);
  console.log(`📸 Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /upload - Upload photo`);
  console.log(`   DELETE /delete/:filename - Delete photo`);
});