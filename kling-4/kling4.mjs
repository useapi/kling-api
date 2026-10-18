/*

Script version 1.0, October 18, 2026

Script to batch-generate Kling 4.0 (kling-v4-0) videos with the Kling API v1 by useapi.net.
Text-to-video (one prompt, or up to 6 directed shots) and image-to-video with a start frame,
an optional end frame and up to 9 keyframes in between.
Tutorial: https://useapi.net/docs/articles/kling-4-api
Endpoints: https://useapi.net/docs/api-kling-v1/post-kling-videos-text2video
           https://useapi.net/docs/api-kling-v1/post-kling-videos-image2video-frames

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following command in a terminal:

   node -v

Running the Script:
===================

Usage: node kling4.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
Replace EMAIL with configured Kling email account, see https://useapi.net/docs/start-here/setup-kling
If optional PROMPTS_FILE not provided prompts.json will be used.

Example:
--------

node kling4.mjs user:1234-abcdefhijklmnopqrstuv my@email.com

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv with my@email.com Kling account email.

Changelog:
==========

- October 18, 2026: Initial release.

*/

import readline from 'node:readline';
import fs from 'fs/promises';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';


// Constants
const MODEL = 'kling-v4-0';
const RESULTS_FILE = 'kling4_results.txt';
const ERRORS_FILE = 'kling4_errors.txt';
const DEFAULT_PROMPTS_FILE = 'prompts.json';
const SLEEP_429 = 10 * 1000; // in milliseconds
const MAX_429_RETRIES = 6;   // give up a prompt after this many consecutive 429s (all accounts busy)
const SLEEP_POLL = 20 * 1000; // in milliseconds

const urlAccounts = 'https://api.useapi.net/v1/kling/accounts';
const urlText2Video = 'https://api.useapi.net/v1/kling/videos/text2video';
const urlImage2Video = 'https://api.useapi.net/v1/kling/videos/image2video-frames';
const urlAssets = 'https://api.useapi.net/v1/kling/assets/';
const urlTask = 'https://api.useapi.net/v1/kling/tasks/';
const urlAssetsDownload = 'https://api.useapi.net/v1/kling/assets/download';

// Kling 4.0 limits, see the endpoint pages above.
const DURATION_MIN = 3, DURATION_MAX = 30, DURATION_DEFAULT = 5;
const MODES = ['std', 'pro'];                       // std = 720p, pro = 1080p (paid Kling plan)
const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '21:9']; // text-to-video only; image-to-video takes it from the start image
const MAX_PROMPT = 8000;
const MAX_SHOTS = 6, MAX_SHOT_PROMPT = 2500, SHOTS_TOTAL_MIN = 3, SHOTS_TOTAL_MAX = 15;
const MAX_KEYFRAMES = 9, MAX_IMAGES = 10;
const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

const supportedParams = ['prompt', 'mode', 'duration', 'aspect_ratio', 'multi_shot', 'image', 'image_tail', 'replyUrl', 'replyRef',
    ...Array.from({ length: MAX_SHOTS }, (_, i) => [`shot_${i + 1}_prompt`, `shot_${i + 1}_duration`]).flat(),
    ...Array.from({ length: MAX_KEYFRAMES }, (_, i) => `keyframe_${i + 1}`)];

// Utility to sleep for given milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isUrl = (value) => /^https?:\/\//i.test(value);

// Image fields of a prompt, in order: image, keyframe_1..9, image_tail.
const imageFields = (prompt) => ['image',
    ...Array.from({ length: MAX_KEYFRAMES }, (_, i) => `keyframe_${i + 1}`).filter(k => prompt[k] !== undefined),
    'image_tail'].filter(k => prompt[k] !== undefined);

const shotCount = (prompt) => Array.from({ length: MAX_SHOTS }, (_, i) => i + 1).filter(n => prompt[`shot_${n}_prompt`] !== undefined || prompt[`shot_${n}_duration`] !== undefined).length;

// Function to fetch configured Kling API accounts
async function fetchAccounts(apiToken) {
    const response = await fetch(urlAccounts, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    });

    if (!response.ok) {
        console.error(`Error fetching accounts (HTTP ${response.status}): ${response.statusText}`);
        process.exit(1);
    }

    return response.json();
}

// Upload a local image with POST /assets and return its URL. URLs are passed through unchanged.
async function resolveImage(apiToken, email, value, promptFile) {
    if (isUrl(value)) return value;
    const file = path.resolve(path.dirname(promptFile), value);
    const contentType = IMAGE_TYPES[path.extname(file).toLowerCase()];
    const data = await fs.readFile(file);
    console.log(`Uploading ${file} …`);
    const response = await fetch(`${urlAssets}?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
            'Content-Type': contentType,
            'Authorization': `Bearer ${apiToken}`
        },
        body: data
    });
    const text = await response.text();
    if (!response.ok)
        throw new Error(`POST /assets HTTP ${response.status} for ${file}: ${text}`);
    const url = JSON.parse(text)?.url;
    if (!url)
        throw new Error(`POST /assets returned no url for ${file}: ${text}`);
    return url;
}

// Submit a single Kling 4.0 prompt. Image prompts go to image2video-frames, the rest to text2video.
// Returns { status, taskId }.
async function submitVideo(apiToken, email, prompt, index) {
    const isImage = prompt.image !== undefined || prompt.image_tail !== undefined;
    const shots = shotCount(prompt);
    const label = prompt.prompt ?? prompt.shot_1_prompt ?? '';
    const length = shots ? `${shots} shots` : `${prompt.duration ?? DURATION_DEFAULT}s`;

    console.log(`${MODEL} ${isImage ? 'image-to-video' : 'text-to-video'} » Prompt #${index} • ${email} • ${prompt.mode ?? 'std'} • ${length} …`);

    const body = JSON.stringify({ ...prompt, email, model_name: MODEL });

    const createResponse = await fetch(isImage ? urlImage2Video : urlText2Video, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        },
        body
    });

    const createBody = await createResponse.text();
    // Keep the results file one line per task.
    const note = label.replace(/[\r\n]+/g, ' ');

    if (createResponse.status == 200) {
        const json = JSON.parse(createBody);
        const taskId = json?.task?.id;
        if (taskId) {
            await fs.appendFile(RESULTS_FILE, `${taskId},#${index}:${note}\n`);
            console.log(`task.id`, taskId);
            return { status: 200, taskId };
        } else {
            const error = `No task.id found in HTTP 200 response`;
            console.log(error, createBody);
            await fs.appendFile(ERRORS_FILE, `${error},#${index}:${note}\n`);
            return { status: 500 };
        }
    } else {
        switch (createResponse.status) {
            case 429:
                console.log(`Retry on HTTP ${createResponse.status} (all accounts at capacity)`);
                break;
            case 400:
                console.log(`Validation error`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${note}\n`);
                break;
            case 403:
                // AUTH.VPrivilegeEscalation = Kling has not opened Kling 4.0 to this account yet. Nothing is charged.
                console.log(`Kling 4.0 not available on this account yet (nothing charged)`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${note}\n`);
                break;
            case 500:
                // Kling returns 500 for content moderation as well as real server faults.
                console.log(`Rejected (likely content moderation, check the error text)`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${note}\n`);
                break;
            default:
                console.log(`FAILED with HTTP ${createResponse.status}`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${note}\n`);
        }
        return { status: createResponse.status };
    }
}

// Resolve the clean, non-watermarked master URL for a workId via GET /assets/download.
// Returns the cdnUrl, or undefined when unavailable (free Kling plans).
async function fetchCleanUrl(apiToken, email, workId) {
    const url = `${urlAssetsDownload}?email=${encodeURIComponent(email)}&workIds=${workId}&fileTypes=MP4`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });
        if (response.ok) {
            const json = await response.json();
            if (json?.cdnUrl)
                return json.cdnUrl;
        } else {
            console.log(`assets/download HTTP ${response.status} for workId ${workId}, falling back to watermarked`, await response.text());
        }
    } catch (err) {
        console.log(`assets/download error for workId ${workId}, falling back to watermarked`, err);
    }
    return undefined;
}

// Poll every submitted task until it is final, then download the result.
async function download(apiToken, email) {
    if (! await fileExists(RESULTS_FILE)) return;

    try {
        const resultsContent = await fs.readFile(RESULTS_FILE, 'utf8');
        const lines = resultsContent.trim().split('\n');

        for (const line of lines) {
            const comma = line.indexOf(',');
            const taskId = line.slice(0, comma);
            const prompt = line.slice(comma + 1);
            const videoFilename = `kling4_${taskId}.mp4`;

            console.log(`> ${taskId}`);

            if (await fileExists(videoFilename)) {
                console.log(`${videoFilename} already exists. Skipping download.`);
                continue;
            }

            while (true) {
                const response = await fetch(`${urlTask}${taskId}?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    }
                });

                if (!response.ok) {
                    // 404 = task deleted, failed at moderation, or out of credits.
                    console.log(`Poll failed ${taskId} (HTTP ${response.status}):\n${prompt}\n`, await response.text());
                    break;
                }

                const task = await response.json();
                const { status, status_name, status_final, works, error, message } = task;

                if (status_final && status_name !== 'succeed') {
                    console.error(`FAILED ${taskId} (status ${status} ${status_name}${error ? ` — ${error}` : ''}${message ? ` — ${message}` : ''}):\n${prompt}\n`);
                    break;
                }

                if (status_final && status_name === 'succeed') {
                    const work = works?.[0];
                    const watermarkedUrl = work?.resource?.resource;
                    const workId = work?.workId;

                    // Prefer the clean master; fall back to the watermarked resource.
                    const cleanUrl = workId ? await fetchCleanUrl(apiToken, email, workId) : undefined;
                    const url = cleanUrl ?? watermarkedUrl;

                    if (url) {
                        console.log(`Downloading ${cleanUrl ? 'clean master' : 'watermarked'} ${url} to ${videoFilename}`);
                        try {
                            const videoResponse = await fetch(url);
                            if (!videoResponse.ok) {
                                console.error(`Unable to download ${taskId} (HTTP ${videoResponse.status}):\n${prompt}\n`, url);
                                break;
                            }
                            const stream = Readable.fromWeb(videoResponse.body);
                            await writeFile(videoFilename, stream);
                        } catch (err) {
                            console.error(`Error during download: ${err}`);
                        }
                    } else
                        console.error(`Unable to download ${taskId}, no resource URL in succeeded task:\n${prompt}\n`);

                    break;
                }

                console.log(`${taskId} status (${status_name}) and is still in progress, waiting…`);
                await sleep(SLEEP_POLL);
            }
        }
    } catch (error) {
        console.log(`Error during download:`, error.stack || error);
    }
}

// Check one prompt against the Kling 4.0 limits. Returns a list of warnings.
function validate(prompt, i) {
    const warnings = [];
    const w = (text) => warnings.push(`${text}. Prompt ${i}`);

    const notSupported = Object.keys(prompt).filter(key => !key.startsWith('__') && !supportedParams.includes(key));
    if (notSupported.length)
        w(`Following params not supported: ${notSupported.join(',')} (model_name is always ${MODEL}; negative_prompt, cfg_scale and enable_audio don't apply to Kling 4.0)`);

    const isImage = prompt.image !== undefined || prompt.image_tail !== undefined;
    const shots = shotCount(prompt);

    if (prompt.mode !== undefined && !MODES.includes(prompt.mode))
        w(`mode must be one of ${MODES.join(', ')}`);

    if (prompt.multi_shot !== undefined && prompt.multi_shot !== true)
        w(`Kling 4.0 accepts only multi_shot: true`);

    if (shots) {
        if (prompt.prompt !== undefined || prompt.duration !== undefined)
            w(`shot_N_prompt / shot_N_duration cannot be combined with prompt or duration`);
        if (shots < 2)
            w(`multi-shot needs at least 2 shots`);
        let total = 0;
        for (let n = 1; n <= shots; n++) {
            const text = prompt[`shot_${n}_prompt`], seconds = Number(prompt[`shot_${n}_duration`]);
            if (!text || !prompt[`shot_${n}_duration`])
                w(`shot_${n} needs both shot_${n}_prompt and shot_${n}_duration, and shots must be consecutive from shot_1`);
            if (text && text.length > MAX_SHOT_PROMPT)
                w(`shot_${n}_prompt exceeds ${MAX_SHOT_PROMPT} characters`);
            total += seconds || 0;
        }
        if (total < SHOTS_TOTAL_MIN || total > SHOTS_TOTAL_MAX)
            w(`shot durations must add up to ${SHOTS_TOTAL_MIN}-${SHOTS_TOTAL_MAX} seconds (got ${total})`);
    } else {
        if (!prompt.prompt && !isImage)
            w(`Please specify a prompt`);
        if (prompt.prompt && prompt.prompt.length > MAX_PROMPT)
            w(`prompt exceeds ${MAX_PROMPT} characters`);
        if (prompt.duration !== undefined) {
            const d = Number(prompt.duration);
            if (!Number.isInteger(d) || d < DURATION_MIN || d > DURATION_MAX)
                w(`duration must be ${DURATION_MIN} to ${DURATION_MAX} seconds`);
        }
    }

    if (isImage) {
        if (prompt.aspect_ratio !== undefined)
            w(`aspect_ratio is not used on image-to-video (it comes from the start image)`);
        const keyframes = Array.from({ length: MAX_KEYFRAMES }, (_, k) => prompt[`keyframe_${k + 1}`] !== undefined);
        const count = keyframes.filter(Boolean).length;
        if (count && prompt.image === undefined)
            w(`keyframes require a start frame (image)`);
        if (keyframes.slice(0, count).includes(false))
            w(`keyframes must be consecutive, starting from keyframe_1`);
        const images = imageFields(prompt).length;
        const limit = prompt.duration !== undefined ? Math.min(MAX_IMAGES, Number(prompt.duration) + 1) : MAX_IMAGES;
        if (images > limit)
            w(`${images} images is over the limit of ${limit} (duration + 1, at most ${MAX_IMAGES})`);
        for (const field of imageFields(prompt))
            if (!isUrl(prompt[field]) && !IMAGE_TYPES[path.extname(prompt[field]).toLowerCase()])
                w(`${field} must be a URL or a local .png / .jpg / .jpeg file`);
    } else {
        if (Object.keys(prompt).some(k => k.startsWith('keyframe_')))
            w(`keyframes need a start frame (image)`);
        if (prompt.aspect_ratio !== undefined && !ASPECT_RATIOS.includes(prompt.aspect_ratio))
            w(`aspect_ratio must be one of ${ASPECT_RATIOS.join(', ')}`);
    }

    return warnings;
}

// Main function
async function main() {
    const apiToken = process.argv[2];
    const email = process.argv[3];
    const promptFile = process.argv[4] || DEFAULT_PROMPTS_FILE;

    if (!apiToken || !email) {
        console.error('Usage: node kling4.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]');
        process.exit(1);
    }

    console.info('Script v1.0');

    console.info('Node version is: ' + process.version);

    try {
        if (await fileExists(RESULTS_FILE)) {
            let user_input;
            while (!['y', 'n'].includes(user_input)) {
                user_input = (await promptUser(`${RESULTS_FILE} file detected. Do you want to download the results now? (y/n): `))?.toLowerCase();
                if (user_input == 'y') {
                    await download(apiToken, email);
                    await fs.unlink(RESULTS_FILE);
                }
            }
        }

        const start = new Date();
        try {
            console.info('START EXECUTION', start);
            await execute(apiToken, email, promptFile);
        }
        finally {
            console.info('COMPLETED', new Date());
            console.info('EXECUTION ELAPSED', diffInMinutesAndSeconds(start, new Date()));
        }

        try {
            console.info('START DOWNLOAD', start);
            await download(apiToken, email);
        }
        finally {
            console.info('TOTAL ELAPSED', diffInMinutesAndSeconds(start, new Date()));
        }
    } catch (error) {
        console.error('Error during execution:', error.stack || error);
    }
}

async function execute(apiToken, email, promptFile) {
    const promptData = await fs.readFile(promptFile, 'utf8');
    const prompts = JSON.parse(promptData);
    console.log(`Total number of prompts to process`, prompts.length);

    // Validate everything before spending any credits.
    const warnings = prompts.flatMap((prompt, i) => validate(prompt, i + 1));

    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(warning));
        console.error(`Execution stopped due to warnings.`);
        process.exit(1);
    }

    const accounts = await fetchAccounts(apiToken);

    const accountList = Object.values(accounts);

    console.info(`Configured Kling API accounts (${accountList.length}):`, accountList.map(a => a.email).join(', '));

    if (accountList.length <= 0) {
        console.error(`No configured Kling accounts found. Please refer to https://useapi.net/docs/start-here/setup-kling`);
        process.exit(1);
    }

    // Match the account by email.
    if (!accountList.find(a => a.email === email)) {
        console.error(`Account with email ${email} not found. Please refer to https://useapi.net/docs/start-here/setup-kling`);
        process.exit(1);
    }

    for (let i = 0; i < prompts.length; i++) {
        // Drop __comment keys, and upload local images to Kling first.
        const prompt = Object.fromEntries(Object.entries(prompts[i]).filter(([key]) => !key.startsWith('__')));
        try {
            for (const field of imageFields(prompt))
                prompt[field] = await resolveImage(apiToken, email, prompt[field], promptFile);
        } catch (err) {
            console.error(`Skipping prompt #${i + 1}:`, err.message);
            await fs.appendFile(ERRORS_FILE, `upload failed,#${i + 1}:${err.message}\n`);
            continue;
        }

        let retries429 = 0;
        while (true) {
            const { status } = await submitVideo(apiToken, email, prompt, i + 1);
            if (status == 429) {
                if (++retries429 > MAX_429_RETRIES) {
                    console.error(`Gave up on prompt #${i + 1} after ${MAX_429_RETRIES} retries, all accounts still busy.`);
                    await fs.appendFile(ERRORS_FILE, `429 (gave up after ${MAX_429_RETRIES} retries),#${i + 1}\n`);
                    break;
                }
                await sleep(SLEEP_429);
            }
            else
                break;
        }
    }
}

// Utility function to check if a file exists
async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

// Function to prompt user input
async function promptUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

function diffInMinutesAndSeconds(date1, date2) {
    const diffInSeconds = Math.floor((date2 - date1) / 1000);
    return `${Math.floor(diffInSeconds / 60)} minutes ${diffInSeconds % 60} seconds`;
};

main();
