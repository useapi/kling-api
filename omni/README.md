# Kling Omni — multi-reference & multi-shot video (Node.js)

Batch-generate [Kling Omni](https://app.klingai.com) video through the [Kling API](https://useapi.net/docs/api-kling-v1) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) — blend up to 7 image references into one shot, reuse saved **Video Elements**, and storyboard a v3 **multi-shot** sequence in a single job.

📖 Full walkthrough: **[Multi-Reference & Multi-Shot Video with Kling Omni](https://useapi.net/docs/articles/kling-omni-bash)**

`kling-omni.mjs` reads prompts from `prompts.json`, submits each one to [`POST /videos/omni`](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni) — single-shot (`prompt` + image/element refs) or multi-shot (a `shots` array) — polls [`GET /tasks/{task_id}`](https://useapi.net/docs/api-kling-v1/get-kling-tasks-task_id) until each task is final, and downloads every finished MP4, preferring the clean, non-watermarked master via [`GET /assets/download`](https://useapi.net/docs/api-kling-v1/get-kling-assets-download).

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling) email

## Usage

```bash
node ./kling-omni.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting.

## Prompts

`prompts.json` is an array of prompt objects. The default `omni_version` is `v3`, with a `16:9` aspect ratio, `std` (720p) mode, and a 5-second duration.

- **Multi-image reference:** upload each image first via [POST /assets](https://useapi.net/docs/api-kling-v1/post-kling-assets) and pass the returned URLs as `image_1`…`image_7`, then cite them in the prompt with `@image_1`, `@image_2`, etc.
- **Video Elements:** create a reusable character/object once via [POST /elements](https://useapi.net/docs/api-kling-v1/post-kling-elements), then pass its `id` as `element_1`…`element_7` and reference it with `@element_1`. Images and elements share the same pool of 7 slots.
- **Multi-shot (v3 only):** replace `prompt`/`duration` with a `shots` array of `{ "prompt", "duration" }` objects (2–6 shots, total duration 3–15s).

The placeholder `https://s21-kling.klingai.com/.../...jpg` URLs and the `u_123…` element id in `prompts.json` are examples — replace them with your own uploaded asset URLs and saved element IDs. Every parameter is documented on [POST /videos/omni](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni).

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
