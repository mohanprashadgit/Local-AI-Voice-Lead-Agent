# Local Voice AI Assistant — MVP Documentation

## 1. Project Objective
The **Local Voice AI Assistant** is an end-to-end, ultra-low-latency, real-time conversational voice assistant designed to operate **100% locally** on a single machine without relying on external cloud APIs or paid cloud infrastructure.

Key objectives:
- Enable natural, spoken dialogue with conversational AI.
- Minimize conversational latency via streaming pipelines and early clause flushing.
- Support instant, sub-second **barge-in / interruptions**.
- Ensure total privacy and offline capability using local STT, LLM, and TTS engines.

---

## 2. Current Architecture

```
                               ┌────────────────────────┐
                               │   Browser / Frontend   │
                               │  (Next.js WebRTC Client)│
                               └───────────▲────────────┘
                                           │ WebRTC Audio
                                           ▼
                               ┌────────────────────────┐
                               │     LiveKit Server     │
                               │  (Local SFU on :7880)  │
                               └───────────▲────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │      Python LiveKit Voice Agent     │
                        │                                     │
                        │  1. Silero VAD (CPU)                │
                        │     └─ Barge-in detection (0.2s)    │
                        │                                     │
                        │  2. faster-whisper (STT)            │
                        │     └─ Audio to transcript          │
                        │                                     │
                        │  3. Ollama / Groq (LLM)             │
                        │     └─ Token streaming & early flush│
                        │                                     │
                        │  4. Piper TTS (ONNX)                │
                        │     └─ 1-chunk lookahead pipelining │
                        └─────────────────────────────────────┘
```

### Architectural Highlights
- **Transport**: WebRTC via local LiveKit SFU server for bidirectional real-time audio.
- **VAD (Voice Activity Detection)**: Silero VAD on CPU to prevent GPU contention with Whisper/Ollama.
- **Pipelined TTS**: Single-chunk prefetch synthesis occurs concurrently with playback to eliminate inter-clause silence gaps.
- **Early Clause Flushing**: Flushes the first sentence clause early (~50 characters) so playback starts before the full LLM sentence finishes generation.

---

## 3. Models Used

| Component | Model / Engine | Details |
|---|---|---|
| **STT (Speech-to-Text)** | `faster-whisper` (`base.en` / `large-v3-turbo`) | CTranslate2-based Whisper running on CPU/CUDA |
| **VAD** | `silero-vad` (ONNX) | CPU-optimized speech boundary and interruption detector |
| **LLM (Brain)** | `qwen2.5:0.5b` / `llama3.2:3b` | Local inference via Ollama (or optional Groq API fallback) |
| **TTS (Text-to-Speech)** | Piper ONNX (`en_US-danny-low.onnx`) | High-speed, natural offline voice synthesis |

---

## 4. Setup Requirements

### System Requirements
- **OS**: Windows 10/11 (PowerShell / Command Prompt)
- **Python**: Python `3.10` - `3.12` (Python 3.11 is recommended; Python 3.14 is incompatible with `livekit-agents` packages)
- **Node.js**: Node.js `18+` and `npm`
- **Ollama**: Installed and running locally (`https://ollama.com`)
- **GPU (Optional)**: NVIDIA GPU with CUDA for acceleration (CPU with `base.en` provides sub-second inference)

### Model & Dependency Assets
1. **Python Dependencies**: Installed in a virtual environment (`.venv`) from `requirements.txt`.
2. **Frontend Dependencies**: Node modules installed in `frontend/`.
3. **Piper Voice**: ONNX voice files stored in `models/piper/` (`en_US-danny-low.onnx` and `en_US-danny-low.onnx.json`).
4. **LiveKit Server Binary**: `livekit_server/livekit-server.exe`.

---

## 5. How to Run the Project

The application requires three concurrent processes:

### Terminal 1 — LiveKit Server
```powershell
.\livekit_server\livekit-server.exe --dev --keys "devkey: 6f1d0c9b7a34e6c2d8f501c9a4b3e2975c4d8f6a1b2c3d4e5f60718293a0b1c0"
```

### Terminal 2 — Frontend UI
```powershell
cd frontend
npm run dev
```

### Terminal 3 — Python LiveKit Agent
```powershell
.\.venv\Scripts\python.exe -m livekit_agent.src.agent dev
```

### Accessing the Assistant
1. Open your browser and navigate to **`http://localhost:3000`** (or **`http://localhost:3001`** if 3000 is occupied).
2. Allow microphone access when prompted.
3. Click **Start call** and speak into your microphone in English.

---

## 6. English Voice Conversation Flow

1. **Audio Capture**: User speaks into the browser microphone; audio is transmitted over WebRTC to LiveKit Server.
2. **Speech Endpointing**: Silero VAD monitors incoming audio frames and determines speech onset and endpointing (`SILERO_MIN_SILENCE_MS=350ms`).
3. **Transcription (STT)**: `faster-whisper` (`base.en`) converts the buffered speech segment into an English text transcript in ~150ms.
4. **Context & Reasoning (LLM)**: Transcript is routed to Ollama (`qwen2.5:0.5b` or configured model), which begins streaming reply tokens.
5. **Sentence & Clause Chunking**: Tokens are accumulated and split on punctuation boundaries (first clause flushed at ~50 characters for immediate playback).
6. **Voice Synthesis (TTS)**: Piper TTS synthesizes the clause into raw PCM/WAV audio using the `en_US-danny-low` ONNX voice model.
7. **Audio Streaming**: Synthesized audio is pushed directly to the LiveKit room audio track and played through the user's speaker.

---

## 7. Barge-in / Interruption Support

- **Sub-second Cut-off**: The Python agent attaches a dedicated Silero VAD instance directly to the `AgentSession` rather than waiting for full STT transcription.
- **Fast Threshold**: When user speech exceeds `BARGE_MIN_SEC` (default: `0.2s`, approximately one word), an interruption event triggers.
- **Immediate Cancellation**:
  - Halts the active Ollama token generation stream.
  - Terminates the current Piper synthesis subprocess.
  - Flushes the LiveKit audio playback buffer so the assistant stops speaking instantly.

---

## 8. Current Working Status

- [x] **LiveKit SFU Server**: Active and running on `ws://127.0.0.1:7880` (HTTP `:7880` health check returns `OK`).
- [x] **Next.js Frontend**: Active and running on `http://localhost:3001` (Dev server ready and serving WebRTC interface).
- [x] **Python Environment**: Configured with Python 3.11 virtual environment (`.venv`) with all required packages (`livekit-agents`, `faster-whisper`, `silero`, `sounddevice`, `scipy`, `requests`).
- [x] **Piper TTS Voice Engine**: Tested and verified with `en_US-danny-low.onnx` voice model.
- [x] **Whisper STT Engine**: Initialized and verified on local machine.
- [x] **LiveKit Python Agent Worker**: Running in development mode and listening for incoming room connections.

---

## 9. Known Issues & Operational Considerations

1. **Python 3.14 Package Incompatibility**:
   - `livekit-agents` and `onnxruntime` wheels require Python `<3.14` (e.g. Python 3.11). Running with system Python 3.14 directly will fail dependency resolution. The project must use the configured `.venv` (Python 3.11).
2. **Local Ollama Service Requirement**:
   - If Ollama is not installed or running locally, the LLM step will fail unless an external `GROQ_API_KEY` is configured in `.env.local`.
3. **Port Collisions**:
   - If port `3000` is in use by another local development process, Next.js will automatically bind to port `3001`.
4. **Hugging Face Symlink Warning on Windows**:
   - On Windows systems without Developer Mode enabled, Hugging Face Hub logs a non-fatal warning regarding symlinks and falls back to standard file caching without impacting execution.
