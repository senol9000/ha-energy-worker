# Home Assistant Energy API Worker

Bu proje, Cloudflare Worker üzerinden Home Assistant entity state bilgisini güvenli şekilde sunar.

## Gereksinimler

- Node.js 18+
- Cloudflare hesabı
- Wrangler CLI (npm install ile gelir)

## Secrets ekleme

Token ve URL kaynak koda yazılmaz, Cloudflare Secrets kullanılır:

```bash
wrangler secret put HA_TOKEN
wrangler secret put HA_URL
```

`HA_URL` değeri:

```text
https://hass.senolc.keenetic.link
```

## Çalıştırma

### Deploy

```bash
npm install
npm run deploy
```

### Local test

```bash
npm run dev
```

## Endpointler

- `GET /` → servis durumu
- `GET /energy` → sadece energy çıktısı
- `GET /raw` → Home Assistant ham yanıtı

## curl örnekleri

```bash
curl https://worker-domain/energy
curl https://worker-domain/raw
```
