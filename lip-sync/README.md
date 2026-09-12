# Kling lip-sync avatars — Kling API batch generation (Node.js)

Batch-generate talking [lip-sync avatar](https://app.klingai.com) videos through the [Kling API](https://useapi.net/docs/api-kling-v1) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) — a digital character built from a single image that speaks from your text (voiced by Kling TTS) or from an audio file.

📖 Full walkthrough: **[Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash#lip-sync--avatars)**

`kling-lip-sync.mjs` reads prompts from `prompts.json`, submits each one to [`POST /avatars/video`](https://useapi.net/docs/api-kling-v1/post-kling-avatars-video), polls [`GET /tasks/{task_id}`](https://useapi.net/docs/api-kling-v1/get-kling-tasks-task_id) until each task is final, and downloads every finished MP4 — preferring the clean, non-watermarked master via [`GET /assets/download`](https://useapi.net/docs/api-kling-v1/get-kling-assets-download).

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling) email

## Usage

```bash
node ./kling-lip-sync.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting.

## Prompts

Each prompt needs **one avatar source** and **one audio source**:

- **Avatar source:** `avatarId` (saved once with [POST /avatars](https://useapi.net/docs/api-kling-v1/post-kling-avatars)) **or** `imageUrl` (an image URL uploaded via [POST /assets](https://useapi.net/docs/api-kling-v1/post-kling-assets)).
- **Audio source:** `text` (up to 5000 chars, with a required `speakerId` — list voices/emotions at [GET /tts/voices](https://useapi.net/docs/api-kling-v1/get-kling-tts-voices)) **or** `audioUrl` (a pre-recorded clip).

Optional, when you pass `text`: `emotion` (`neutral`, `happy`, `angry`, `sad`, `fearful`, `disgusted`, `surprised`), `speed` (0.8–2.0). `mode` is `std` (default) or `pro`. The placeholder `imageUrl` / `audioUrl` / `speakerId` values in `prompts.json` are examples — replace them with your own. Every parameter is documented on [POST /avatars/video](https://useapi.net/docs/api-kling-v1/post-kling-avatars-video).

### Related (curl)

Two more endpoints from the same account, covered in the [tutorial](https://useapi.net/docs/articles/kling-features-bash#lip-sync--avatars):

- **Free text-to-speech** (synchronous, returns the MP3 URL directly):

  ```bash
  curl -X POST "https://api.useapi.net/v1/kling/tts/create" \
    -H "Authorization: Bearer $USEAPI_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "text": "Hello from Kling TTS.", "speakerId": "moss_audio_..." }'
  ```

- **Re-sync an existing video** to a new audio track (both are URLs; video ≤ 60s):

  ```bash
  curl -X POST "https://api.useapi.net/v1/kling/videos/lipsync" \
    -H "Authorization: Bearer $USEAPI_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "video": "https://example.com/clip.mp4", "audio": "https://example.com/voice.mp3" }'
  ```

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
