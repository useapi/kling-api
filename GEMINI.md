# Kling via useapi.net

This extension connects the hosted useapi.net Kling MCP server (`useapi-kling`, 45 tools). The tools make Kling 4.0, v3 and Omni video and images, avatars and lip-sync, with your Kling AI subscription.

- Endpoint: https://api.useapi.net/v1/kling/mcp (Streamable HTTP), authorized with the user's useapi.net API token in `USEAPI_TOKEN`.
- Before the tools work, the user needs a useapi.net API token (https://useapi.net/docs/start-here/setup-useapi) and an account connected at https://useapi.net/docs/start-here/setup-kling.
- If a tool returns 401, ask the user to check `USEAPI_TOKEN` (`gemini extensions config useapi-kling`). If it says no account is configured, point them to the setup page above.
- Generations spend the credits of the user's Kling AI subscription. Ask before starting paid or long jobs, and report job status and links when they finish.
- Full tool list and limits: https://useapi.net/docs/api-kling-v1/mcp

useapi.net is a paid third-party API service ($15/month, covers every useapi.net API), not affiliated with Kuaishou Technology or Kling AI.
