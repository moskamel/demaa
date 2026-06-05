import { Router } from 'express'
import multer from 'multer'
import Groq from 'groq-sdk'
import { requireAuth } from '../middleware/auth.js'
import { toFile } from 'groq-sdk'

const router = Router()
router.use(requireAuth)

// Store audio in memory (max 10MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

let groq: Groq | null = null
function getGroq(): Groq {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groq
}

// POST /api/voice/transcribe
// Accepts multipart/form-data with field "audio" (webm/mp4/wav/ogg)
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: { code: 'NO_AUDIO', message: 'لم يتم إرسال ملف صوتي' } })
    return
  }

  if (!process.env.GROQ_API_KEY) {
    res.status(503).json({ error: { code: 'NO_KEY', message: 'مفتاح Groq غير مضبوط' } })
    return
  }

  try {
    // Determine file extension from mime type
    const mime = req.file.mimetype
    const ext = mime.includes('ogg') ? 'ogg'
      : mime.includes('mp4') || mime.includes('m4a') ? 'mp4'
      : mime.includes('wav') ? 'wav'
      : mime.includes('flac') ? 'flac'
      : 'webm'

    const audioFile = await toFile(req.file.buffer, `audio.${ext}`, { type: mime })

    const transcription = await getGroq().audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      language: 'ar',
      response_format: 'json',
    })

    res.json({ text: transcription.text.trim() })
  } catch (err: unknown) {
    console.error('[voice transcribe]', err)
    const msg = err instanceof Error ? err.message : 'فشل التفريغ الصوتي'
    res.status(500).json({ error: { code: 'TRANSCRIBE_ERROR', message: msg } })
  }
})

export default router
