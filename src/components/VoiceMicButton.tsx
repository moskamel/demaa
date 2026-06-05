import { useState, useRef, useCallback } from 'react'
import { Microphone2, Stop } from 'iconsax-react'

type State = 'idle' | 'recording' | 'processing' | 'error'

interface Props {
  onTranscript: (text: string) => void
  size?: number
  color?: string
}

export default function VoiceMicButton({ onTranscript, size = 20, color = '#9090a2' }: Props) {
  const [state, setState] = useState<State>('idle')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Pick best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : 'audio/ogg'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setState('processing')
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const form = new FormData()
        form.append('audio', blob, 'recording.' + (mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'))
        try {
          const token = localStorage.getItem('deema_token')
          const res = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data?.error?.message || 'فشل التفريغ')
          onTranscript(data.text)
          setState('idle')
        } catch {
          setState('error')
          setTimeout(() => setState('idle'), 2500)
        }
      }

      recorder.start()
      mediaRef.current = recorder
      setState('recording')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2500)
    }
  }, [onTranscript])

  const stop = useCallback(() => {
    mediaRef.current?.stop()
    mediaRef.current = null
  }, [])

  const toggle = () => { state === 'recording' ? stop() : state === 'idle' && start() }

  const iconColor = state === 'recording' ? '#ef4444'
    : state === 'processing' ? '#6a4cf5'
    : state === 'error' ? '#f59e0b'
    : color

  return (
    <button
      onClick={toggle}
      title={state === 'recording' ? 'أوقف التسجيل' : state === 'processing' ? 'جارٍ التفريغ...' : 'تحدث للبحث'}
      style={{
        background: 'none', border: 'none', cursor: state === 'processing' ? 'default' : 'pointer',
        padding: 4, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'opacity 0.15s',
        opacity: state === 'processing' ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Pulse ring while recording */}
      {state === 'recording' && (
        <span style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: '2px solid #ef4444', opacity: 0.5,
          animation: 'mic-pulse 1s ease-in-out infinite',
        }} />
      )}
      {state === 'recording'
        ? <Stop size={size} color={iconColor} variant="Bold" />
        : <Microphone2 size={size} color={iconColor} variant={state === 'processing' ? 'Bold' : 'Outline'} />
      }
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.2; }
        }
      `}</style>
    </button>
  )
}
