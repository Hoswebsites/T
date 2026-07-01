const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ==================== رؤوس الأمان ====================
app.use((req, res, next) => {
    // منع هجمات XSS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // سياسة الأمان
    res.setHeader('Content-Security-Policy', "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data:; font-src 'self' https: data:;");
    
    // منع MIME sniffing
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
});

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));

// منع الوصول المباشر إلى المفاتيح الحساسة
app.use((req, res, next) => {
    if (req.url.includes('POLLINATIONS_API_KEY') || req.url.includes('DEEPSEEK_API_KEY')) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
});

// API Keys - يجب تعيينها من متغيرات البيئة فقط
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

// Base URLs
const POLLINATIONS_BASE_URL = "https://gen.pollinations.ai";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// ==================== TEXT GENERATION (OpenAI Compatible) ====================
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = "mercury" } = req.body;
        
        // التحقق من صحة الإدخال
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }
        
        // Map frontend model names (slugs) to Pollinations/API model names
        let targetModel = "openai-large"; // Default to mercury backend
        
        if (model === "mercury") targetModel = "openai-large";
        else if (model === "claude-large") targetModel = "claude-large";
        else if (model === "openai-large") targetModel = "openai-large";
        else if (model === "kimi-code") targetModel = "kimi-code";
        else if (model === "gemini-large") targetModel = "gemini-large";
        else if (model === "glm") targetModel = "glm";

        const response = await axios.post(`${POLLINATIONS_BASE_URL}/v1/chat/completions`, {
            model: targetModel,
            messages: messages,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${POLLINATIONS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Text Generation Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate text' });
    }
});

// ==================== IMAGE GENERATION ====================
app.post('/api/image', async (req, res) => {
    try {
        const { prompt, model = "nanobanana-pro", size = "1:1", count = 1, images = [] } = req.body;
        
        // التحقق من صحة الإدخال
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt' });
        }
        
        // Map frontend model names (slugs) to Pollinations API model names
        let targetModel = "nanobanana-pro";
        
        if (model === "nanobanana-pro") targetModel = "nanobanana-pro";
        else if (model === "ideogram-v4-quality") targetModel = "ideogram-v4-quality";
        else if (model === "nanobanana-2") targetModel = "nanobanana-2";
        else if (model === "gpt-image-2") targetModel = "gpt-image-2";

        const [width, height] = parseSize(size);
        let imageUrl = `${POLLINATIONS_BASE_URL}/image/${encodeURIComponent(prompt)}?model=${targetModel}&width=${width}&height=${height}&n=${count}&key=${POLLINATIONS_API_KEY}`;
        
        res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        console.error('Image Generation Error:', error.message);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// ==================== VIDEO GENERATION ====================
app.post('/api/video', async (req, res) => {
    try {
        const { prompt, model = "ltx-2", duration = 5, size = "16:9", extended = false, images = [] } = req.body;

        // التحقق من صحة الإدخال
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt' });
        }

        // Map frontend model names (slugs) to Pollinations API model names
        let targetModel = "ltx-2";
        
        if (model === "ltx-2") targetModel = "ltx-2";
        else if (model === "seedance-pro") targetModel = "seedance-pro";
        else if (model === "wan-pro") targetModel = "wan-pro";

        let videoUrl = `${POLLINATIONS_BASE_URL}/video/${encodeURIComponent(prompt)}?model=${targetModel}&duration=${duration}&size=${size}&key=${POLLINATIONS_API_KEY}`;
        
        if (extended) videoUrl += `&extended=true`;
        if (images && images.length > 0) {
            if (images[0]) videoUrl += `&start_image=${encodeURIComponent(images[0])}`;
            if (images[1]) videoUrl += `&end_image=${encodeURIComponent(images[1])}`;
        }

        res.json({ success: true, videoUrl: videoUrl });
    } catch (error) {
        console.error('Video Generation Error:', error.message);
        res.status(500).json({ error: 'Failed to generate video' });
    }
});

function parseSize(size) {
    const map = {
        "1:1": [1024, 1024],
        "16:9": [1536, 864],
        "9:16": [864, 1536],
        "4:3": [1024, 768],
        "3:4": [768, 1024],
        "21:9": [1536, 640]
    };
    return map[size] || [1024, 1024];
}

// معالج الأخطاء العام
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Dar Al-Ulum Tools Backend running on port ${PORT}`);
});

module.exports = app;
