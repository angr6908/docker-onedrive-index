# onedrive-index

A Docker-first adaptation of `onedrive-vercel-index`.

This repository is intended for simple self-hosting with Docker and Docker Compose, with configuration provided through container environment variables.

## Acknowledgement

This project is based on the original [`onedrive-vercel-index`](https://github.com/spencerwooo/onedrive-vercel-index) created by Spencer Woo.

This repository adapts the project for Docker-based deployment while preserving upstream attribution.

## Example `compose.yml`

```yaml
services:
  onedrive-index:
    image: unmol637/onedrive-index:latest
    container_name: onedrive-index
    platform: linux/amd64
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      OD_CLIENT_ID: "YOUR_OD_CLIENT_ID"
      OD_OBFUSCATED_CLIENT_SECRET: "YOUR_OD_OBFUSCATED_CLIENT_SECRET"
      NEXT_PUBLIC_SITE_TITLE: "OneDrive"
      OD_BASE_DIRECTORY: "/"
      OD_MAX_ITEMS: "100"
      NEXT_PUBLIC_SITE_FOOTER: 'Powered by <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">onedrive-vercel-index</a>.'
      OD_PROTECTED_ROUTES: "[]"
      NEXT_PUBLIC_SITE_EMAIL: ""
      NEXT_PUBLIC_SITE_LINKS: "[]"
      NEXT_PUBLIC_DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss"
```

Start the service with:

```bash
docker compose up -d
```

## License

This repository is distributed under the [MIT License](/Users/hzhou/Documents/New%20project/LICENSE).

Please also review the original upstream project at [spencerwooo/onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index).
