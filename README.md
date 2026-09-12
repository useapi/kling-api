# Kling API examples (useapi.net)

Runnable Node.js examples for the [Kling API](https://useapi.net/docs/api-kling-v1) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) — generate **Kling v3 / v2.x** video (**text-to-video**, **image-to-video**, multi-image **Omni** & multi-shot, **motion control**, **effects**, **extend**, native audio), **lip-sync avatars** with **TTS / custom voices**, and **Kolors image generation** (incl. **virtual try-on** & **upscale**) — all through a simple REST API that drives your own [Kling AI](https://app.klingai.com) account, with no developer account or per-generation metering.

Each example reads a list of prompts from `prompts.json`, submits them through the useapi.net Kling API, polls each task until it is final, and downloads every result — preferring the clean, non-watermarked master — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`text-to-video/`](./text-to-video) | Batch-generate **Kling v3 / v2.x** video from text prompts (with notes on adapting it to the image-to-video frames endpoint) | [How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash) |
| [`omni/`](./omni) | Batch-generate **Kling Omni** video — multi-image reference, saved **Video Elements**, and v3 **multi-shot** sequences | [Multi-Reference & Multi-Shot Video with Kling Omni](https://useapi.net/docs/articles/kling-omni-bash) |
| [`lip-sync/`](./lip-sync) | Batch-generate **talking lip-sync avatars** from an image + TTS text or an audio file | [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash) |
| [`motion-control/`](./motion-control) | Batch-transfer **motion** from a reference video onto a still image | [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash) |
| [`image-generation/`](./image-generation) | Batch-generate images with **Kolors** (`kling-v3-0` text-to-image + `@image_N` references) | [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), and a connected [Kling account](https://useapi.net/docs/start-here/setup-kling) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) covers every useapi.net API):

```bash
git clone https://github.com/useapi/kling-api.git
cd kling-api/text-to-video
node ./kling.mjs <API_TOKEN> <EMAIL>
```

`API_TOKEN` is your useapi.net token and `EMAIL` is your connected Kling account email — every script looks the account up by email automatically. Edit `prompts.json` in each folder to queue your own prompts. Every supported parameter is documented on the [POST /videos/text2video](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video), [POST /videos/omni](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni), [POST /avatars/video](https://useapi.net/docs/api-kling-v1/post-kling-avatars-video), [POST /videos/motion-create](https://useapi.net/docs/api-kling-v1/post-kling-videos-motion-create), and [POST /images/kolors](https://useapi.net/docs/api-kling-v1/post-kling-images-kolors) endpoint pages.

## Tutorials

- [How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash) — text-to-video and start/end-frame image-to-video, the model lineup, and pricing
- [Multi-Reference & Multi-Shot Video with Kling Omni](https://useapi.net/docs/articles/kling-omni-bash) — blend up to 7 image references, reuse saved Video Elements, and storyboard a multi-shot sequence
- [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash) — talking avatars with TTS, motion transfer, and Kolors images

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) is an experimental REST API for AI services. The Kling API drives your own [Kling AI](https://app.klingai.com) (Kuaishou) account, so you spend your plan's credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) and pricing on the [API overview](https://useapi.net/docs/api-kling-v1).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@midjourneyapi).
