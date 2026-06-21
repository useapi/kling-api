/*

Script version 1.0, June 22, 2026

Script to batch-generate videos using prompts with the Kling API v1 by useapi.net 🚀
Uses the asynchronous Omni endpoint (POST /videos/omni): multi-image reference,
saved Video Elements, and v3 multi-shot sequences.
For more details visit https://useapi.net/docs/api-kling-v1/post-kling-videos-omni

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following command in a terminal:

   node -v

Running the Script:
===================

Usage: node kling-omni.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
Replace EMAIL with configured Kling email account, see https://useapi.net/docs/start-here/setup-kling
If optional PROMPTS_FILE not provided prompts.json will be used.

Upload reference images first via POST /assets (https://useapi.net/docs/api-kling-v1/post-kling-assets)
and pass the returned URLs as image_1..image_7. Pass saved element IDs as element_1..element_7
(create them via POST /elements, https://useapi.net/docs/api-kling-v1/post-kling-elements).

Example:
--------

node kling-omni.mjs user:1234-abcdefhijklmnopqrstuv my@email.com

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv with my@email.com Kling account email.

Changelog:
==========

- June 22, 2026: Initial release.

*/

import readline from 'node:readline';
import fs from 'fs/promises';
import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';


// Constants
const RESULTS_FILE = 'kling_omni_results.txt';
const ERRORS_FILE = 'kling_omni_errors.txt';
const DEFAULT_PROMPTS_FILE = 'prompts.json';
const SLEEP_429 = 10 * 1000; // in milliseconds
const MAX_429_RETRIES = 6;   // give up a prompt after this many consecutive 429s (all accounts busy)
const SLEEP_POLL = 20 * 1000; // in milliseconds

const urlAccounts = 'https://api.useapi.net/v1/kling/accounts';
const urlOmni = 'https://api.useapi.net/v1/kling/videos/omni';
const urlTask = 'https://api.useapi.net/v1/kling/tasks/';
const urlAssetsDownload = 'https://api.useapi.net/v1/kling/assets/download';

// Utility to sleep for given milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to fetch configured Kling API accounts
async function fetchAccounts(apiToken) {
    const response = await fetch(urlAccounts, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    });

    if (!response.ok) {
        console.error(`⛔ Error fetching accounts (HTTP ${response.status}): ${response.statusText}`);
        process.exit(1);
    }

    return response.json();
}

const elapsedTimeSec = (start) => (Date.now() - start) / 1000;

// A short label for logging — the single prompt, or the first shot prompt.
function promptLabel(prompt) {
    if (prompt.prompt) return prompt.prompt;
    if (Array.isArray(prompt.shots) && prompt.shots.length) return prompt.shots[0].prompt ?? '';
    return '';
}

// Build the request body for a single Omni job.
// Multi-shot: an array of { prompt, duration } in prompt.shots → shot_N_prompt / shot_N_duration.
// Single-shot: prompt + optional duration. Both carry image_N / element_N references.
function buildBody(email, prompt) {
    const { prompt: text, omni_version, mode, aspect_ratio, duration, count, shots } = prompt;

    const body = {
        email,
        omni_version,
        mode,
        aspect_ratio,
        count
    };

    // Pass through any image_1..image_7 and element_1..element_7 references.
    for (let i = 1; i <= 7; i++) {
        if (prompt[`image_${i}`]) body[`image_${i}`] = prompt[`image_${i}`];
        if (prompt[`element_${i}`]) body[`element_${i}`] = prompt[`element_${i}`];
    }

    if (Array.isArray(shots) && shots.length) {
        // Multi-shot (v3 only) — cannot be combined with prompt/duration.
        shots.forEach((shot, idx) => {
            body[`shot_${idx + 1}_prompt`] = shot.prompt;
            body[`shot_${idx + 1}_duration`] = shot.duration;
        });
    } else {
        body.prompt = text;
        body.duration = duration;
    }

    return JSON.stringify(body);
}

// Submit a single Omni prompt. Returns { status, taskId }.
async function submitVideo(apiToken, email, prompt, index) {
    const useVersion = prompt.omni_version ?? 'v3';
    const label = promptLabel(prompt);

    console.log(`🚀 omni ${useVersion} » Prompt #${index} • ${email} …`);

    const body = buildBody(email, prompt);

    const createResponse = await fetch(urlOmni, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        },
        body
    });

    const createBody = await createResponse.text();

    if (createResponse.status == 200) {
        const json = JSON.parse(createBody);
        const taskId = json?.task?.id;
        if (taskId) {
            await fs.appendFile(RESULTS_FILE, `${taskId},#${index}:${label}\n`);
            console.log(`✅ task.id`, taskId);
            return { status: 200, taskId };
        } else {
            const error = `No task.id found in HTTP 200 response`;
            console.log(`❓ ${error}`, createBody);
            await fs.appendFile(ERRORS_FILE, `${error},#${index}:${label}\n`);
            return { status: 500 };
        }
    } else {
        switch (createResponse.status) {
            case 429:
                console.log(`🔄️ Retry on HTTP ${createResponse.status} (all accounts at capacity)`);
                break;
            case 400:
                console.log(`🛑 Validation error`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${label}\n`);
                break;
            case 500:
                // Kling returns 500 for content moderation as well as real server faults.
                console.log(`🛑 Rejected (likely content moderation — check the error text)`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${label}\n`);
                break;
            default:
                console.log(`❗ FAILED with HTTP ${createResponse.status}`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${label}\n`);
        }
        return { status: createResponse.status };
    }
}

// Resolve the clean, non-watermarked master URL for a workId via GET /assets/download.
// Returns the cdnUrl, or undefined when unavailable.
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
            console.log(`⚠️  assets/download HTTP ${response.status} for workId ${workId}, falling back to watermarked`, await response.text());
        }
    } catch (err) {
        console.log(`⚠️  assets/download error for workId ${workId}, falling back to watermarked`, err);
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
            const [taskId, prompt] = line.split(',');
            const videoFilename = `kling_omni_${taskId}.mp4`;

            console.log(`👉 ${taskId}`);

            try {
                await fs.access(videoFilename);
                console.log(`⚠️ ${videoFilename} already exists. Skipping download.`);
                continue;
            } catch {
                // File does not exist, proceed with downloading
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
                    console.log(`🛑 Poll failed ${taskId} (HTTP ${response.status}):\n${prompt}\n`, await response.text());
                    break;
                }

                const task = await response.json();
                const { status, status_name, status_final, works, error, message } = task;

                if (status_final && status_name !== 'succeed') {
                    console.error(`🛑 FAILED ${taskId} (status ${status} ${status_name}${error ? ` — ${error}` : ''}${message ? ` — ${message}` : ''}):\n${prompt}\n`);
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
                        console.log(`✅ Downloading ${cleanUrl ? 'clean master' : 'watermarked'} ${url} to ${videoFilename}`);
                        try {
                            const videoResponse = await fetch(url);
                            if (!videoResponse.ok) {
                                console.error(`⛔ Unable to download ${taskId} (HTTP ${videoResponse.status}):\n${prompt}\n`, url);
                                break;
                            }
                            const stream = Readable.fromWeb(videoResponse.body);
                            await writeFile(videoFilename, stream);
                        } catch (err) {
                            console.error(`⛔ Error during download: ${err}`);
                        }
                    } else
                        console.error(`🛑 Unable to download ${taskId}, no resource URL in succeeded task:\n${prompt}\n`);

                    break;
                }

                console.log(`⌛ ${taskId} status (${status_name}) and is still in progress, waiting…`);
                await sleep(SLEEP_POLL);
            }
        }
    } catch (error) {
        console.log(`⛔ Error during download:`, error.stack || error);
    }
}

// Main function
async function main() {
    const apiToken = process.argv[2];
    const email = process.argv[3];
    const promptFile = process.argv[4] || DEFAULT_PROMPTS_FILE;

    if (!apiToken || !email) {
        console.error('Usage: node kling-omni.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]');
        process.exit(1);
    }

    console.info('Script v1.0');

    console.info('Node version is: ' + process.version);

    try {
        if (await fileExists(RESULTS_FILE)) {
            let user_input;
            while (!['y', 'n'].includes(user_input)) {
                user_input = (await promptUser(`❔ ${RESULTS_FILE} file detected. Do you want to download the results now? (y/n): `))?.toLowerCase();
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
        console.error('⛔ Error during execution:', error.stack || error);
    }
}

async function execute(apiToken, email, promptFile) {
    const accounts = await fetchAccounts(apiToken);

    const accountList = Object.values(accounts);

    console.info(`Configured Kling API accounts (${accountList.length}):`, accountList.map(a => a.email).join(', '));

    if (accountList.length <= 0) {
        console.error(`⛔ No configured Kling accounts found. Please refer to https://useapi.net/docs/start-here/setup-kling`);
        process.exit(1);
    }

    // Match the account by email.
    const matched = accountList.find(a => a.email === email);

    if (!matched) {
        console.error(`⛔ Account with email ${email} not found. Please refer to https://useapi.net/docs/start-here/setup-kling`);
        process.exit(1);
    }

    const promptData = await fs.readFile(promptFile, 'utf8');
    const prompts = JSON.parse(promptData);
    console.log(`Total number of prompts to process`, prompts.length);

    let warnings = [];

    // Parameters accepted by this script for the Omni endpoint.
    // See https://useapi.net/docs/api-kling-v1/post-kling-videos-omni for the full parameter set.
    const baseParams = ['prompt', 'omni_version', 'mode', 'aspect_ratio', 'duration', 'count', 'shots'];
    const refParams = (n) => [`image_${n}`, `element_${n}`];
    const supportedParams = [...baseParams, ...[1, 2, 3, 4, 5, 6, 7].flatMap(refParams)];

    const invalidKeys = (prompt) => Object.keys(prompt).filter(key => !key.startsWith('__') && !supportedParams.includes(key))

    for (let i = 1; i <= prompts.length; i++) {
        const prompt = prompts[i - 1];
        const { prompt: text, shots } = prompt;

        const notSupported = invalidKeys(prompt);
        if (notSupported.length)
            warnings.push(`⚠️  Following params not supported: ${notSupported.join(',')}. Prompt ${i}`);

        const hasShots = Array.isArray(shots) && shots.length > 0;

        if (!text && !hasShots)
            warnings.push(`⚠️  Please specify a prompt or a shots array. Prompt ${i}`);

        if (text && hasShots)
            warnings.push(`⚠️  prompt and shots cannot be combined — multi-shot replaces the single prompt. Prompt ${i}`);

        if (hasShots) {
            if (shots.length < 2 || shots.length > 6)
                warnings.push(`⚠️  multi-shot requires 2 to 6 shots. Prompt ${i}`);
            const total = shots.reduce((sum, s) => sum + Number(s.duration || 0), 0);
            if (total < 3 || total > 15)
                warnings.push(`⚠️  total shot duration must be 3-15 seconds (got ${total}). Prompt ${i}`);
            shots.forEach((s, idx) => {
                if (!s.prompt || !s.duration)
                    warnings.push(`⚠️  each shot needs both prompt and duration (shot ${idx + 1}). Prompt ${i}`);
            });
        }

        if (text && text.length > 1700)
            warnings.push(`⚠️  prompt exceeds 1700 characters. Prompt ${i}`);
    }

    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(warning));
        console.error(`⛔ Execution stopped due to warnings.`);
        process.exit(1);
    }

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        let retries429 = 0;
        while (true) {
            const { status } = await submitVideo(apiToken, email, prompt, i + 1);
            if (status == 429) {
                if (++retries429 > MAX_429_RETRIES) {
                    console.error(`⛔ Gave up on prompt #${i + 1} after ${MAX_429_RETRIES} retries — all accounts still busy.`);
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
