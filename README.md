# onedrive-index

A Docker-first adaptation of `onedrive-vercel-index`.

## Example `compose.yml`

```yaml
services:
  onedrive-index:
    image: unmol637/onedrive-index:latest
    container_name: onedrive-index
    restart: always
    network_mode: host
    volumes:
      - ./data:/app/data
    environment:
      OD_CLIENT_ID: "YOUR_OD_CLIENT_ID"
      OD_OBFUSCATED_CLIENT_SECRET: "YOUR_OD_OBFUSCATED_CLIENT_SECRET"
      NEXT_PUBLIC_SITE_TITLE: "OneDrive"
      OD_BASE_DIRECTORY: "/"
      OD_MAX_ITEMS: "100"
      NEXT_PUBLIC_SITE_FOOTER: 'Powered by <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">onedrive-vercel-index</a>.'
      OD_PROTECTED_ROUTES: '["/Private"]'
      NEXT_PUBLIC_SITE_EMAIL: ""
      NEXT_PUBLIC_SITE_LINKS: "[]"
      NEXT_PUBLIC_DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss"
      # NAT64_DNS: ""
```

Start the service with:

```bash
docker compose up -d
```

## License

This repository is distributed under the MIT License.
