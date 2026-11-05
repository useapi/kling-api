# Kling 4.0 and 4.0 Flash video — Kling API batch generation (Node.js)

Batch-generate Kling 4.0 (`kling-v4-0`) and Kling 4.0 Flash (`kling-v4-0-flash`) video through the [Kling API](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), with your [Kling AI subscription](https://kling.ai/app/membership/membership-plan): text-to-video from one prompt or up to 6 directed shots, and image-to-video with a start frame, an end frame and up to 9 keyframes in between, up to 10 images in total. Kling 4.0 makes 3 to 30 second clips at 720p or 1080p, always with a stereo soundtrack, and adds the `21:9` aspect ratio. Kling 4.0 Flash, available through useapi.net since November 5, 2026, is a lower-cost 720p version for 3 to 20 second clips with sound, from a prompt or a start image.

Full walkthrough: [How to Generate Kling 4.0 Video via the Kling API](https://useapi.net/docs/articles/kling-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)

See it run: [four 9:16 clips with sound, made with this script](https://youtube.com/shorts/Xr73upGKG2c) (YouTube Short, 45 credits each on Kling Pro during Kling's launch discount for subscribers)

`kling4.mjs` reads prompts from `prompts.json`, checks every prompt against the Kling 4.0 or 4.0 Flash limits before it spends any credits, and submits each one to [`POST /videos/text2video`](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), or to [`POST /videos/image2video-frames`](https://useapi.net/docs/api-kling-v1/post-kling-videos-image2video-frames?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) when the prompt has an `image` or `image_tail`. Local image files are uploaded first with [`POST /assets`](https://useapi.net/docs/api-kling-v1/post-kling-assets?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api). It then polls [`GET /tasks/{task_id}`](https://useapi.net/docs/api-kling-v1/get-kling-tasks-task_id?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) until each task is final and downloads every MP4, preferring the clean, non-watermarked master via [`GET /assets/download`](https://useapi.net/docs/api-kling-v1/get-kling-assets-download?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) (paid Kling AI subscriptions) and falling back to the watermarked `works[0].resource.resource`.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install, uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) covers every useapi.net API)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) email, on a Kling AI subscription of Standard or higher (the Free plan runs only text-to-speech and face detection)

## Usage

```bash
node ./kling4.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
node ./kling4.mjs <API_TOKEN> <EMAIL> prompts-frames.json   # image-to-video with keyframes
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting. If Kling hasn't opened Kling 4.0 or 4.0 Flash to your account yet, the create call returns `403` with `AUTH.VPrivilegeEscalation` and nothing is charged.

## Prompts

Each entry is one video. Keys starting with `__` are comments and are not sent.

| Field | Values |
|---|---|
| `model_name` | `kling-v4-0` (Kling 4.0, default) or `kling-v4-0-flash` (Kling 4.0 Flash) |
| `prompt` | Up to 8000 characters. Required for text-to-video unless you use shots |
| `duration` | `3` to `30` seconds, default `5`. Kling 4.0 Flash: `3` to `20` |
| `mode` | `std` (720p, default) or `pro` (1080p). Kling 4.0 Flash: `std` only |
| `aspect_ratio` | `16:9` (default), `9:16`, `1:1`, `21:9`. Text-to-video only; image-to-video takes it from the start image |
| `shot_1_prompt` … `shot_6_prompt` + `shot_N_duration` | Kling 4.0 only. Direct the cuts yourself: 2 to 6 consecutive shots, 3 to 15 seconds in total, up to 2500 characters per shot, in place of `prompt` and `duration` |
| `image`, `keyframe_1` … `keyframe_9`, `image_tail` | Image-to-video: start frame, keyframes in order, end frame. A URL or a local `.png` / `.jpg` path (relative to the prompts file). At most `duration` + 1 images and 10 in total, so a 5-second clip takes up to 6. Kling 4.0 Flash takes the start frame (`image`) only |
| `replyUrl`, `replyRef` | Optional webhook for progress and the result |

Kling 4.0 always generates stereo audio and may cut a clip into several shots on its own. Kling 4.0 Flash always generates audio too, and takes no multi-shot parameters (not even `multi_shot: false`). `enable_audio`, `negative_prompt` and `cfg_scale` don't apply to either model, and the script stops if a prompt has them, or breaks a Flash limit. Every parameter is documented on [POST /videos/text2video](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) and [POST /videos/image2video-frames](https://useapi.net/docs/api-kling-v1/post-kling-videos-image2video-frames?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api).

## What it costs

Kling 4.0 uses your Kling AI subscription's credits: 10 per second at 720p and 15 per second at 1080p, on every plan. Kling 4.0 Flash uses 6 per second at 720p. On Kling's Pro subscription ($32.56 a month for 3,000 credits) a 5-second Kling 4.0 video costs $0.54 at 720p and $0.81 at 1080p, and a 5-second Flash video $0.33, against $0.77, $1.15 and $0.46 on Kling's own [developer API](https://kling.ai/dev/pricing), which sells Kling 4.0 and 4.0 Flash only in prepaid packs from $500 (as of November 5, 2026). The first prompt in `prompts.json` (3 seconds at 720p) cost 27 credits on a Pro plan in the [tutorial](https://useapi.net/docs/articles/kling-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api#what-it-costs) run, during Kling's launch discount, and uses 30 at the full price. [Kling 4.0 API pricing](https://useapi.net/docs/articles/kling-4-api-pricing?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) compares every route. For Kling 4.0 with reference images, elements, videos and voices, send `omni_version: v4` to [POST /videos/omni](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), or `omni_version: v4-flash` for Kling 4.0 Flash (no voices, up to 20 seconds); the [`omni/`](../omni) script passes `omni_version` through from its prompts.

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@useapi-net)
