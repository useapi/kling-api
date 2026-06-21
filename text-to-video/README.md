# Kling v3 / v2.x video — Kling API batch generation (Node.js)

Batch-generate [Kling v3](https://app.klingai.com) (and v3 Turbo, 2.6, 2.5, 2.1, 1.6) text-to-video through the [Kling API](https://useapi.net/docs/api-kling-v1) by [useapi.net](https://useapi.net).

📖 Full walkthrough: **[How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash)**

`kling.mjs` reads prompts from `prompts.json`, submits each job to [`POST /videos/text2video`](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video), polls [`GET /tasks/{task_id}`](https://useapi.net/docs/api-kling-v1/get-kling-tasks-task_id) until each task is final, and downloads every finished MP4 — preferring the clean, non-watermarked master via [`GET /assets/download`](https://useapi.net/docs/api-kling-v1/get-kling-assets-download) and falling back to the watermarked `works[0].resource.resource` if needed.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling) email

## Usage

```bash
node ./kling.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting.

## Prompts

`prompts.json` is an array of prompt objects — `prompt` is the only required field; the default model is `kling-v1-6`, with a `16:9` aspect ratio, `std` (720p) mode, and a 5-second duration. Pick another model with `model_name` (`kling-v3-0`, `kling-v3-0-turbo`, `kling-v2-6`, `kling-v2-5`, `kling-v2-1-master`, `kling-v1-6`, `kling-v1-5`). `negative_prompt` and `cfg_scale` apply only to the 1.x models. Every supported parameter is documented on [POST /videos/text2video](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video).

## Image-to-video

This script covers text-to-video. To animate a still image, upload it with [POST /assets](https://useapi.net/docs/api-kling-v1/post-kling-assets) and pass the returned URL as `image` (start frame) and optionally `image_tail` (end frame) to [POST /videos/image2video-frames](https://useapi.net/docs/api-kling-v1/post-kling-videos-image2video-frames) — the response is the same task object, polled and downloaded exactly the same way. See the [Image-to-video section](https://useapi.net/docs/articles/kling-bash#image-to-video) of the tutorial.

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
