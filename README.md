# Kling API examples: Kling 4.0, v3 and Omni (useapi.net)

Runnable Node.js examples for the [Kling API](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): generate **Kling 4.0**, **v3** and **v2.x** video (**text-to-video**, **image-to-video** with keyframes, multi-image **Omni** and multi-shot, **motion control**, **effects**, **extend**, native audio), **lip-sync avatars** with **TTS / custom voices**, and **Kolors images** (incl. **virtual try-on** and **upscale**), plus a hosted MCP server with 45 tools. It all runs through a simple REST API that drives your own [Kling AI](https://kling.ai/app) account, with no Kling developer account or per-generation metering.

Each example reads a list of prompts from `prompts.json`, submits them through the useapi.net Kling API, polls each task until it is final, and downloads every result — preferring the clean, non-watermarked master — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`text-to-video/`](./text-to-video) | Batch-generate **Kling 4.0 / v3 / v2.x** video from text prompts (with notes on adapting it to the image-to-video frames endpoint) | [How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash) |
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

## MCP server

useapi.net also runs a hosted [Model Context Protocol](https://modelcontextprotocol.io) server for Kling, so an AI assistant such as Claude Code, Cursor or VS Code Copilot can use it on your own account. It has 45 tools: Kling 4.0, v3 and Omni video from text, images, keyframes or references, motion control, talking avatars, lip-sync, sound and extend, Omni and Kolors images, virtual try-on, upscale, plus elements, voices, avatars, uploads and tasks. Nothing to install or run locally.

- Endpoint: `https://api.useapi.net/v1/kling/mcp`
- Transport: Streamable HTTP
- Authorization: your useapi.net API token in the `Authorization: Bearer …` header, and an account connected with the [Kling setup](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)
- Listed in the official MCP Registry as `net.useapi/kling`

Claude Code:

```bash
claude mcp add --transport http useapi-kling https://api.useapi.net/v1/kling/mcp --header "Authorization: Bearer YOUR_API_TOKEN"
```

Cursor, VS Code, Windsurf and the full tool list: [Kling MCP server docs](https://useapi.net/docs/api-kling-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api). useapi.net is a third-party API, not affiliated with Kuaishou or Kling AI.

## Common questions

<!-- Official API figures in these answers, verified 2026-10-18: https://kling.ai/dev and https://kling.ai/dev/pricing (Kling 4.0 coming soon, video packs from $700), per useapi.net/docs/api-kling-v1 on 2026-10-18. -->

- **Is there a Kling 4.0 API?** Yes, through useapi.net. Kling 4.0 (`kling-v4-0`) runs in [text-to-video](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), [image-to-video](https://useapi.net/docs/api-kling-v1/post-kling-videos-image2video-frames?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) with keyframes between the start and end frames, and [Omni](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): 3–30 second clips with stereo audio at 720p or 1080p (1080p needs a paid Kling plan), and the `21:9` aspect ratio. Kling v3, v3 Turbo, O1 and the 2.x models are there too.
- **Does Kling have an official API?** Yes, but the useapi.net Kling API used in this repo runs on your own Kling website account at its subscription price, with Kling 4.0, which Kling's own [developer API](https://kling.ai/dev) still lists as coming soon (as of October 18, 2026). On the Pro plan ($33/month for 3,000 credits), Kling 4.0 works out to about $0.16 per second at 1080p, while Kuaishou's developer API sells video packs from $700, billed per generation at developer rates on a separate developer account.
- **Where do I get an API key?** You call this API with a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) and connect your Kling account once with its email and password through the [Kling setup](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api). Sign up for Kling with an email address (Gmail and Apple sign-in accounts aren't supported). You don't need a Kling developer account or key.
- **How much does it cost?** A flat [$15/month](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) to useapi.net, which covers every useapi.net API, plus your Kling plan's credits. You can start on Kling's free plan. On the Pro plan ($33/month for 3,000 credits), Kling 4.0 works out to about $0.11 per second at 720p and $0.16 per second at 1080p, while Kling's own developer API has no Kling 4.0 yet and sells video packs from $700 (as of October 2026). Text-to-speech up to 5 minutes and face detection are unlimited on every Kling plan, including the free one. See the [cost calculator](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api).
- **Why is my video watermarked?** The preview MP4 is watermarked. The examples download the clean master through [GET /assets/download](https://useapi.net/docs/api-kling-v1/get-kling-assets-download?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), which needs a paid Kling account.
- **Is there a Kling MCP server?** Yes, with 45 tools for Claude Code, Cursor, VS Code and other MCP clients. See [MCP server](#mcp-server) above.
- **How many accounts can I connect?** Each useapi.net subscription covers 3 Kling accounts, and each extra $10/month subscription adds 3 more.
- More answers: [Kling API questions](https://useapi.net/docs/articles/kling-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api#frequently-asked-questions).

## Tutorials

- [How to Generate Kling 4.0 Video via the Kling API](https://useapi.net/docs/articles/kling-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) — Kling 4.0 text-to-video, image-to-video and start/end keyframes, with real outputs and credit costs
- [How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash) — text-to-video and start/end-frame image-to-video, the model lineup, and pricing
- [Multi-Reference & Multi-Shot Video with Kling Omni](https://useapi.net/docs/articles/kling-omni-bash) — blend up to 7 image references, reuse saved Video Elements, and storyboard a multi-shot sequence
- [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash) — talking avatars with TTS, motion transfer, and Kolors images

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) is an experimental REST API for AI services. The Kling API drives your own [Kling AI](https://app.klingai.com) (Kuaishou) account, so you spend your plan's credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) and pricing on the [API overview](https://useapi.net/docs/api-kling-v1).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.
