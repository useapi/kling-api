# Kling API examples: Kling 4.0, v3 and Omni (useapi.net)

Runnable Node.js examples for the [Kling API](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), a third-party REST API for [Kling AI](https://kling.ai/app) by [Kuaishou Technology](https://www.kuaishou.com/en). It uses your [Kling AI subscription](https://kling.ai/app/membership/membership-plan): Free, Standard $8.80, Pro $32.56, Premier from $80.96 or Ultra+ $544.99 a month (as of October 2026). The Free plan runs only text-to-speech and face detection, so videos need Standard or higher.

The examples make Kling 4.0, 3.0, 3.0 Turbo and 2.6 video (text-to-video, image-to-video with keyframes, multi-shot, motion control, native sound), Omni O1, 3.0 and 4.0 video from references, talking lip-sync avatars with text-to-speech, and KOLORS 3.0 images, with curl calls for lip-sync, virtual try-on and upscale. A hosted MCP server adds 45 tools for AI assistants. You don't need a Kling developer account.

Each example reads a list of prompts from `prompts.json`, submits them through the useapi.net Kling API, polls each task until it is final, and downloads every result — preferring the clean, non-watermarked master — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`kling-4/`](./kling-4) | Batch-generate Kling 4.0 (`kling-v4-0`) video: 3–30 s, 720p or 1080p, stereo audio, `21:9`, directed multi-shot, and image-to-video from a start frame, keyframes and an end frame, up to 10 images in total | [How to Generate Kling 4.0 Video via the Kling API](https://useapi.net/docs/articles/kling-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) |
| [`text-to-video/`](./text-to-video) | Batch-generate Kling 4.0 / v3 / v2.x video from text prompts (with notes on adapting it to the image-to-video frames endpoint) | [How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) |
| [`omni/`](./omni) | Batch-generate Kling Omni video — multi-image reference, saved Video Elements, and v3 multi-shot sequences | [Multi-Reference & Multi-Shot Video with Kling Omni](https://useapi.net/docs/articles/kling-omni-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) |
| [`lip-sync/`](./lip-sync) | Batch-generate talking lip-sync avatars from an image + TTS text or an audio file | [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) |
| [`motion-control/`](./motion-control) | Batch-transfer motion from a reference video onto a still image | [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) |
| [`image-generation/`](./image-generation) | Batch-generate images with Kolors (`kling-v3-0` text-to-image + `@image_N` references) | [Kling Lip-Sync Avatars, Motion Control & Image Generation](https://useapi.net/docs/articles/kling-features-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) |
| [`n8n/`](./n8n) | An n8n workflow: a Google Sheet queue (plus a form) that makes Kling 4.0 / v3 videos and spreads them across several Kling accounts, writes each task id at once, and optionally saves the results to Google Drive | [Run several Kling accounts](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api#run-several-kling-accounts) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), and a connected [Kling account](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) covers every useapi.net API and 3 Kling accounts):

```bash
git clone https://github.com/useapi/kling-api.git
cd kling-api/text-to-video
node ./kling.mjs <API_TOKEN> <EMAIL>
```

`API_TOKEN` is your useapi.net token and `EMAIL` is your connected Kling account email — every script looks the account up by email automatically. Edit `prompts.json` in each folder to queue your own prompts. The preview MP4 a task returns is watermarked, so the video examples save the clean master through [GET /assets/download](https://useapi.net/docs/api-kling-v1/get-kling-assets-download?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), which needs a paid Kling AI subscription. Every supported parameter is documented on the [POST /videos/text2video](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), [POST /videos/omni](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), [POST /avatars/video](https://useapi.net/docs/api-kling-v1/post-kling-avatars-video?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), [POST /videos/motion-create](https://useapi.net/docs/api-kling-v1/post-kling-videos-motion-create?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), and [POST /images/kolors](https://useapi.net/docs/api-kling-v1/post-kling-images-kolors?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) endpoint pages.

## MCP server

useapi.net also runs a hosted [Model Context Protocol](https://modelcontextprotocol.io) server for Kling, so an AI assistant such as Claude Code, Cursor or VS Code Copilot can use it with your Kling AI subscription. It has 45 tools: Kling 4.0, v3 and Omni video from text, images, keyframes or references, motion control, talking avatars, lip-sync, sound and extend, Omni and Kolors images, virtual try-on, upscale, plus elements, voices, avatars, uploads and tasks. Nothing to install or run locally.

- Endpoint: `https://api.useapi.net/v1/kling/mcp`
- Transport: Streamable HTTP
- Authorization: your useapi.net API token in the `Authorization: Bearer …` header, and an account connected with the [Kling setup](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)
- Listed in the official MCP Registry as `net.useapi/kling`

Claude Code:

```bash
claude mcp add --transport http useapi-kling https://api.useapi.net/v1/kling/mcp --header "Authorization: Bearer YOUR_API_TOKEN"
```

Cursor, VS Code, Windsurf and the full tool list: [Kling MCP server docs](https://useapi.net/docs/api-kling-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api). useapi.net is a third-party API, not affiliated with Kuaishou Technology or Kling AI.

## Use with Claude Code

This repo is also a Claude Code plugin marketplace. The plugin adds the hosted Kling MCP server, and reads your token from the `USEAPI_TOKEN` environment variable, so set it before you start Claude Code:

```bash
export USEAPI_TOKEN=user:12345-...      # your useapi.net API token
```

Then, inside Claude Code:

```
/plugin marketplace add useapi/kling-api
/plugin install kling@useapi-kling
```

On Claude Code 2.1.275 or later, `/plugin install kling --marketplace useapi/kling-api` does both in one step. Run `/mcp` to check that `useapi-kling` is connected.

## Use with Gemini CLI

This repo is also a Gemini CLI extension with the same MCP server:

```bash
gemini extensions install https://github.com/useapi/kling-api
```

The install asks for your useapi.net API token and keeps it in the system keychain. Change it later with `gemini extensions config useapi-kling`, and check the connection with `gemini mcp list`.

## Common questions

<!-- Official API figures in these answers, verified 2026-10-18: https://kling.ai/dev and https://kling.ai/dev/pricing (Kling 4.0 coming soon, video packs from $700, Kling 3.0 1080p with sound ~$0.168/s = $0.84 per 5 s). Plan figures: the price table on useapi.net/docs/api-kling-v1 (Pro $32.56 for 3,000 credits, regular renewal price, read 2026-10-21). The useapi.net subscription is not part of the per-video math. -->

### Is there a Kling 4.0 API?

Yes, through useapi.net. Kling 4.0 (`kling-v4-0`) runs on your Kling AI subscription in [text-to-video](https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), [image-to-video with keyframes](https://useapi.net/docs/api-kling-v1/post-kling-videos-image2video-frames?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) and [Omni](https://useapi.net/docs/api-kling-v1/post-kling-videos-omni?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): 3 to 30 second clips with stereo sound, 720p or 1080p, and 21:9. Kling's own [developer API](https://kling.ai/dev) still lists Kling 4.0 as coming soon (as of October 18, 2026).

### How much does the Kling API cost?

Through useapi.net, a 5-second Kling 3.0 video at 1080p with sound costs $0.65 on Kling's Pro subscription, against about $0.84 on Kling's developer API, which also needs a prepaid video pack from $700 (as of October 2026). A 5-second Kling 4.0 video costs $0.49 at 720p and $0.73 at 1080p on Pro, and text-to-speech and face detection are free. The [price table](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api#pricing) covers every model and subscription.

### Do I need a Kling API key?

Through useapi.net, you use our [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), not a Kling developer key, and connect your Kling account once with its email and password through [Setup Kling](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api). A free Kling AI account runs text-to-speech and face detection, and videos need Standard or higher. Sign up for Kling with an email address, since Gmail and Apple sign-in accounts aren't supported.

### Is there a Kling MCP server?

Yes, through useapi.net: a hosted [Kling MCP server](https://useapi.net/docs/api-kling-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) with 45 tools for Claude Code, Cursor, VS Code and other MCP clients, running on your Kling AI subscription with nothing to install. This repo also adds it in one step as a [Claude Code plugin](#use-with-claude-code) or a [Gemini CLI extension](#use-with-gemini-cli).

### How many Kling accounts can I connect?

Through useapi.net, each $15/month subscription covers 3 Kling accounts, and each extra $10/month subscription adds 3 more (as of October 2026). A request without an `email` goes to one of your accounts that has a free job slot, [GET scheduler/available](https://useapi.net/docs/api-kling-v1/get-kling-scheduler-available?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) shows those slots, and the [n8n queue](./n8n) spreads a Google Sheet of Kling 4.0 jobs across them.

More answers: [Kling API questions](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api#questions) and the [Kling v3 tutorial FAQ](https://useapi.net/docs/articles/kling-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api#frequently-asked-questions).

## Tutorials

- [How to Generate Kling 4.0 Video via the Kling API](https://useapi.net/docs/articles/kling-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): Kling 4.0 text-to-video, image-to-video and start/end keyframes, with real outputs and credit costs
- [How to Generate AI Video with Kling v3 via the Kling API](https://useapi.net/docs/articles/kling-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): text-to-video and start/end-frame image-to-video, the model lineup, and pricing
- [How to Generate Multi-Reference & Multi-Shot Video with Kling Omni via the Kling API](https://useapi.net/docs/articles/kling-omni-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): blend image references, reuse saved Video Elements, and storyboard a multi-shot sequence
- [Kling Lip-Sync Avatars, Motion Control & Image Generation via the Kling API](https://useapi.net/docs/articles/kling-features-bash?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): talking avatars with text-to-speech, motion transfer, and KOLORS images
- [Sora 2 API Alternatives Compared, With Code: Seedance 2.5, Omni Flash, MiniMax H3, Kling v3](https://useapi.net/docs/articles/sora-2-api-alternatives?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api): the same brief on four models, Kling v3 among them

## 中文说明

这是 [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) 托管的可灵 API（Kling API）示例代码（Node.js）。通过 REST API 调用 可灵 4.0（Kling 4.0）、v3 和 v2.x 视频：文生视频、带首尾帧的图生视频、Omni 多图参考与多镜头、动作控制、对口型数字人（TTS 配音），以及 Kolors 图片生成。

- 使用你的可灵 AI（Kling AI）网站订阅：免费版、Standard 8.80 美元、Pro 32.56 美元、Premier 80.96 美元起或 Ultra+ 544.99 美元/月（截至 2026 年 10 月），无需可灵开发者账号或开发者 API Key。免费版只能使用文字转语音和人脸检测，生成视频需要 Standard 或更高套餐。
- 可灵 4.0：3–30 秒视频，720p 或 1080p，自带立体声音频。可灵官方 [开发者 API](https://kling.ai/dev) 目前仍将可灵 4.0 列为“即将推出”（截至 2026 年 10 月 18 日）。
- 价格：通过 useapi.net，以可灵 Pro 订阅（每月 32.56 美元，3,000 积分）计，5 秒可灵 4.0 视频 720p 约 0.49 美元、1080p 约 0.73 美元（已含可灵对 Pro、Premier 及 Ultra+ 会员的 4.0 限时 9 折），5 秒 1080p 带声音的可灵 3.0 视频约 0.65 美元，而可灵官方开发者 API 约 0.84 美元，且视频资源包起价 700 美元（截至 2026 年 10 月）。
- 另有托管的 MCP 服务器（45 个工具），可在 Claude Code、Cursor、VS Code 中直接使用。

主要示例：[`kling-4/`](./kling-4)（可灵 4.0）、[`text-to-video/`](./text-to-video)、[`omni/`](./omni)、[`lip-sync/`](./lip-sync)、[`motion-control/`](./motion-control)、[`image-generation/`](./image-generation)。快速开始见上方 [Quick start](#quick-start)；教程：[How to Generate Kling 4.0 Video via the Kling API](https://useapi.net/docs/articles/kling-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)；完整文档：[Kling API](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)，账号绑定：[Kling setup](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)。

useapi.net 是第三方 API，与快手科技及可灵 AI 无关联。

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) is a third-party REST API for AI services. The Kling API runs on your [Kling AI subscription](https://kling.ai/app/membership/membership-plan), so each video costs its share of the subscription's credits instead of a prepaid developer pack. See the models and prices on the [Kling API overview](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) and every service in the [model matrix](https://useapi.net/model-matrix?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.
