# aid-n8n-proxy

A lightweight Express proxy exposing:

- `/health` – service health info
- `/sensor` – simulated sensor metrics (moisture, conductivity, temperature, light)
- `/fal` – authenticated proxy to FAL AI image edit model (requires bearer + FAL key)
- `/docs` – simple HTML/JSON API documentation
- `/volume/*` – static assets served from local `volume/`

## Quick Start (Local)
```bash
npm install
cp .env.example .env   # fill in FAL_KEY and optional FAL_DUMMY_BEARER
npm run dev
```
Browse: http://localhost:3000/docs

## Environment Variables
| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP listen port |
| `FAL_KEY` | Yes | - | FAL AI API key for model calls |
| `FAL_DUMMY_BEARER` | No | `dummy-token` | Expected bearer token for `/fal` |

## Docker
Build and run directly:
```bash
docker build -t aid-n8n-proxy:latest .
# copy and edit env first
docker run -d --name aid-n8n-proxy \
  --env-file .env \
  -p 3000:3000 \
  aid-n8n-proxy:latest
```
Or with Compose:
```bash
docker compose up --build -d
```
Healthcheck is built into the image (Docker `HEALTHCHECK` hits `/health`).

## Example Requests
```bash
curl http://localhost:3000/health
curl http://localhost:3000/sensor
curl -X POST http://localhost:3000/fal \
  -H "Authorization: Bearer $FAL_DUMMY_BEARER" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a red flower","image_url":"https://example.com/img.png"}'
```

## Security Notes
- `/fal` requires a bearer token; rotate `FAL_DUMMY_BEARER` for basic access control.
- For production, replace dummy bearer with a stronger auth (JWT, API gateway, etc.).

## License
ISC (see `package.json`).
