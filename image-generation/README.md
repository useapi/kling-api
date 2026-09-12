# Kling image generation (Kolors) — Kling API batch generation (Node.js)

Batch-generate images with [KOLORS](https://app.klingai.com), Kling's image model, through the [Kling API](https://useapi.net/docs/api-kling-v1) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) — text-to-image with up to ten `@image_N` references on `kling-v3-0`.

📖 Full walkthrough: **[Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash#image-generation-kolors)**

`kling-kolors.mjs` reads prompts from `prompts.json`, submits each one to [`POST /images/kolors`](https://useapi.net/docs/api-kling-v1/post-kling-images-kolors), polls [`GET /tasks/{task_id}`](https://useapi.net/docs/api-kling-v1/get-kling-tasks-task_id) until each task is final, and downloads every generated image from the task's `works[]` array.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling) email

## Usage

```bash
node ./kling-kolors.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`. The script looks the account up by email before submitting.

## Prompts

`prompts.json` is an array of prompt objects — `prompt` is the only required field (up to 2500 chars). The default `version` is `kling-v3-0`, `resolution` is `2k` (or `1k`), and `aspect_ratio` defaults to `16:9`. Set `imageCount` for how many images to generate. For reference-guided generation, upload each image via [POST /assets](https://useapi.net/docs/api-kling-v1/post-kling-assets), pass the returned URLs as `image_1`…`image_10`, and cite them in the prompt with `@image_1`, `@image_2`, etc. The placeholder asset URL in `prompts.json` is an example — replace it with your own. Every parameter is documented on [POST /images/kolors](https://useapi.net/docs/api-kling-v1/post-kling-images-kolors).

### Related (curl)

Three image features build on the same account, covered in the [tutorial](https://useapi.net/docs/articles/kling-features-bash#image-generation-kolors):

- **Virtual try-on** — [POST /images/virtual-try-on](https://useapi.net/docs/api-kling-v1/post-kling-images-virtual-try-on) dresses a `humanImage` in a garment (`dressInput`, or `upperInput` / `lowerInput`).
- **Multi-element composition** — [POST /images/kolors-elements](https://useapi.net/docs/api-kling-v1/post-kling-images-kolors-elements) composes up to four subject images (plus optional scene/style references) into one scene.
- **Upscale** — [POST /images/upscale](https://useapi.net/docs/api-kling-v1/post-kling-images-upscale) takes a `task_id` + `workId` from a completed KOLORS task and returns a higher-resolution version.

All three are asynchronous and resolve through the same task poll.

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@midjourneyapi)
