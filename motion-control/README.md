# Kling motion control — Kling API batch generation (Node.js)

Batch-transfer motion from a reference video onto a static image through the [Kling API](https://useapi.net/docs/api-kling-v1) by [useapi.net](https://useapi.net/?utm_source=github&utm_medium=readme&utm_campaign=kling-api) — the person in your image performs the action from the video.

📖 Full walkthrough: **[Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash#motion-control)**

`kling-motion.mjs` reads prompts from `prompts.json`, submits each one to [`POST /videos/motion-create`](https://useapi.net/docs/api-kling-v1/post-kling-videos-motion-create), polls [`GET /tasks/{task_id}`](https://useapi.net/docs/api-kling-v1/get-kling-tasks-task_id) until each task is final, and downloads every finished MP4 — preferring the clean, non-watermarked master via [`GET /assets/download`](https://useapi.net/docs/api-kling-v1/get-kling-assets-download).

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github&utm_medium=readme&utm_campaign=kling-api)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling) email

## Usage

```bash
node ./kling-motion.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting.

## Prompts

Each prompt needs an `imageUrl` (a person with a clearly visible pose) and a `motionUrl` (a 3–30 second reference video). Upload both via [POST /assets](https://useapi.net/docs/api-kling-v1/post-kling-assets) first — use the response `url` field for `imageUrl` and the `resourceUrl` field for `motionUrl` (or pull an official/previous motion from [GET /videos/motions](https://useapi.net/docs/api-kling-v1/get-kling-videos-motions)).

`model_name` defaults to `kling-v3-0` (or `kling-v2-6`); the output duration is detected from the motion video. Optional: `prompt`, `keepAudio` (keep the reference video's sound), `motionDirection` (`motion_direction` default, or `image_direction`), `mode`, and on v3 an `element_1` for stronger character consistency. The endpoint returns a `400` with `MOTION.PIC_NOT_MATCHED` if it can't detect a person in the image. The placeholder asset URLs in `prompts.json` are examples — replace them with your own. Every parameter is documented on [POST /videos/motion-create](https://useapi.net/docs/api-kling-v1/post-kling-videos-motion-create).

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
