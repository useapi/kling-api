# Kling Image 4.0 — Kling API batch generation (Node.js)

Batch-generate Kling Image 4.0 images through the [Kling API](https://useapi.net/docs/api-kling-v1?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) on your Kling AI subscription: 2K, 4K and 8K images, Series Mode stories, style, tone and font presets, long product detail pages from a product photo and web page designs.

Full walkthrough: [How to Generate Kling Image 4.0 Images via the Kling API](https://useapi.net/docs/articles/kling-image-4-api?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)

`kling-image-4.mjs` reads prompts from `prompts.json`, checks every prompt before it spends any credits, submits each one to [`POST /images/omni`](https://useapi.net/docs/api-kling-v1/post-kling-images-omni?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) with `omni_version: v4`, waits for each task and downloads every image.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install, uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) covers every useapi.net API)
- A connected [Kling account](https://useapi.net/docs/start-here/setup-kling?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api) email, on a Kling AI subscription of Standard or higher. 4K and 8K need a paid plan too

## Usage

```bash
node ./kling-image-4.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `prompts.json`, the prompts of the walkthrough. The product detail page prompt needs your own product photo in `image_1`: upload it with [`POST /assets`](https://useapi.net/docs/api-kling-v1/post-kling-assets?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api), or use the URL of an image Kling made for you.

## Prompts

Each entry is one task. Keys starting with `__` are comments and are not sent.

| Field | Values |
|---|---|
| `prompt` | Up to 1700 characters. Name references as `@image_1` / `@element_1`, and presets as `@style:<id>`, `@tone:<id>` and `@font:<id>` before quoted text (ids from [`GET /images/presets`](https://useapi.net/docs/api-kling-v1/get-kling-images-presets?utm_source=github.com&utm_medium=referral&utm_campaign=kling-api)) |
| `resolution` | `2k` (default), `4k` or `8k`. With a `skill`: `1k` or `2k` (default) |
| `aspect_ratio` | `auto` (default), `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9` |
| `imageCount` | `1` to `9`, default `1`. With `story_mode`: `2` to `10`, or leave it out and Kling decides |
| `story_mode` | `true` for Series Mode: images that tell one story, with or without references |
| `skill` | `product_detail` (needs `image_1`, the product photo) or `web_design` (`image_1` optional, a style reference). One long page image |
| `length` | `product_detail` only: `short` (2 to 5 sections), `medium` (default, 6 to 10) or `long` (11 to 18) |
| `image_1` … `image_10`, `element_1` … `element_10` | Reference images (URLs) and saved elements (ids), 10 in all |

Kling writes a `web_design` page's text in Chinese unless the prompt names the language, so end that prompt with, for example, "All text on the page in English."

## What it costs

Kling Image 4.0 uses your Kling AI subscription's credits: 4 an image at 2K, 6 at 4K and 10 at 8K, the same in Series Mode. A product detail page is 15 to 55 credits and a web design 35 at 1K or 38 at 2K. On Kling's Pro subscription ($32.56 a month for 3,000 credits) a 2K image costs $0.04 and an 8K one $0.11, against $0.06 and $0.15 on Kling's developer API, which sells Kling Image 4.0 in image packs from $300 and charges for each reference image as well (as of November 18, 2026). The prompts in `prompts.json` made 13 images and pages for 102 credits in our run, with 8K at Kling's sale price of 6.

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@useapi-net)
