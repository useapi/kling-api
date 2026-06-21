/*

Script version 1.0, June 22, 2026

Script to batch-generate images using prompts with the Kling API v1 by useapi.net 🚀
Uses the asynchronous KOLORS image endpoint (POST /images/kolors).
For more details visit https://useapi.net/docs/api-kling-v1/post-kling-images-kolors

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following command in a terminal:

   node -v

Running the Script:
===================

Usage: node kling-kolors.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
Replace EMAIL with configured Kling email account, see https://useapi.net/docs/start-here/setup-kling
If optional PROMPTS_FILE not provided prompts.json will be used.

The default version kling-v3-0 supports up to ten reference images — upload each via POST /assets
(https://useapi.net/docs/api-kling-v1/post-kling-assets), pass the URLs as image_1..image_10, and
cite them in the prompt with @image_1, @image_2, ...

Example:
--------

node kling-kolors.mjs user:1234-abcdefhijklmnopqrstuv my@email.com

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
const RESULTS_FILE = 'kling_kolors_results.txt';
const ERRORS_FILE = 'kling_kolors_errors.txt';
const DEFAULT_PROMPTS_FILE = 'prompts.json';
const DEFAULT_VERSION = 'kling-v3-0';
const SLEEP_429 = 10 * 1000; // in milliseconds
const MAX_429_RETRIES = 6;   // give up a prompt after this many consecutive 429s (all accounts busy)
const SLEEP_POLL = 15 * 1000; // in milliseconds

const urlAccounts = 'https://api.useapi.net/v1/kling/accounts';
const urlKolors = 'https://api.useapi.net/v1/kling/images/kolors';
const urlTask = 'https://api.useapi.net/v1/kling/tasks/';

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

// Build the request body, passing through any image_1..image_10 references.
function buildBody(email, prompt) {
    const { prompt: text, version, resolution, aspect_ratio, imageCount } = prompt;

    const body = {
        email,
        prompt: text,
        version: version ?? DEFAULT_VERSION,
        resolution,
        aspect_ratio,
        imageCount
    };

    for (let i = 1; i <= 10; i++) {
        if (prompt[`image_${i}`]) body[`image_${i}`] = prompt[`image_${i}`];
    }

    return JSON.stringify(body);
}

// Submit a single KOLORS prompt. Returns { status, taskId }.
async function submitImage(apiToken, email, prompt, index) {
    const useVersion = prompt.version ?? DEFAULT_VERSION;
    const text = prompt.prompt ?? '';

    console.log(`🚀 kolors ${useVersion} » Prompt #${index} • ${email} …`);

    const body = buildBody(email, prompt);

    const createResponse = await fetch(urlKolors, {
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
            await fs.appendFile(RESULTS_FILE, `${taskId},#${index}:${text}\n`);
            console.log(`✅ task.id`, taskId);
            return { status: 200, taskId };
        } else {
            const error = `No task.id found in HTTP 200 response`;
            console.log(`❓ ${error}`, createBody);
            await fs.appendFile(ERRORS_FILE, `${error},#${index}:${text}\n`);
            return { status: 500 };
        }
    } else {
        switch (createResponse.status) {
            case 429:
                console.log(`🔄️ Retry on HTTP ${createResponse.status} (all accounts at capacity)`);
                break;
            case 400:
                console.log(`🛑 Validation error`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${text}\n`);
                break;
            case 500:
                // Kling returns 500 for content moderation as well as real server faults.
                console.log(`🛑 Rejected (likely content moderation — check the error text)`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${text}\n`);
                break;
            default:
                console.log(`❗ FAILED with HTTP ${createResponse.status}`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},#${index}:${text}\n`);
        }
        return { status: createResponse.status };
    }
}

// Pick a file extension from a resource URL, defaulting to png.
function extFromUrl(url) {
    const match = url.split('?')[0].match(/\.(png|jpg|jpeg|webp)$/i);
    return match ? match[1].toLowerCase() : 'png';
}

// Poll every submitted task until it is final, then download each generated image.
async function download(apiToken, email) {
    if (! await fileExists(RESULTS_FILE)) return;

    try {
        const resultsContent = await fs.readFile(RESULTS_FILE, 'utf8');
        const lines = resultsContent.trim().split('\n');

        for (const line of lines) {
            const [taskId, prompt] = line.split(',');

            console.log(`👉 ${taskId}`);

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
                    const items = Array.isArray(works) ? works : [];
                    if (!items.length) {
                        console.error(`🛑 No images in succeeded task ${taskId}:\n${prompt}\n`);
                        break;
                    }

                    for (let n = 0; n < items.length; n++) {
                        const url = items[n]?.resource?.resource;
                        if (!url) {
                            console.error(`🛑 No resource URL on work #${n} of task ${taskId}`);
                            continue;
                        }

                        const imageFilename = `kling_kolors_${taskId}_${n + 1}.${extFromUrl(url)}`;

                        try {
                            await fs.access(imageFilename);
                            console.log(`⚠️ ${imageFilename} already exists. Skipping download.`);
                            continue;
                        } catch {
                            // File does not exist, proceed with downloading
                        }

                        console.log(`✅ Downloading ${url} to ${imageFilename}`);
                        try {
                            const imageResponse = await fetch(url);
                            if (!imageResponse.ok) {
                                console.error(`⛔ Unable to download ${imageFilename} (HTTP ${imageResponse.status})`, url);
                                continue;
                            }
                            const stream = Readable.fromWeb(imageResponse.body);
                            await writeFile(imageFilename, stream);
                        } catch (err) {
                            console.error(`⛔ Error during download: ${err}`);
                        }
                    }

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
        console.error('Usage: node kling-kolors.mjs <API_TOKEN> <EMAIL> [PROMPTS_FILE]');
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

    // Parameters accepted by this script for the kolors endpoint.
    // See https://useapi.net/docs/api-kling-v1/post-kling-images-kolors for the full parameter set.
    const baseParams = ['prompt', 'version', 'resolution', 'aspect_ratio', 'imageCount'];
    const imageParams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `image_${n}`);
    const supportedParams = [...baseParams, ...imageParams];

    const invalidKeys = (prompt) => Object.keys(prompt).filter(key => !key.startsWith('__') && !supportedParams.includes(key))

    for (let i = 1; i <= prompts.length; i++) {
        const prompt = prompts[i - 1];
        const { prompt: text } = prompt;

        const notSupported = invalidKeys(prompt);
        if (notSupported.length)
            warnings.push(`⚠️  Following params not supported: ${notSupported.join(',')}. Prompt ${i}`);

        if (!text)
            warnings.push(`⚠️  Please specify a prompt. Prompt ${i}`);

        if (text && text.length > 2500)
            warnings.push(`⚠️  prompt exceeds 2500 characters. Prompt ${i}`);
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
            const { status } = await submitImage(apiToken, email, prompt, i + 1);
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
