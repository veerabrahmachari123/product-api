# Product API

REST API (Node.js + Express) for managing products, containerised with Docker.

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | /health | Health status |
| POST | /products | Add a product |
| GET | /products | List products |
| GET | /products/:id | View a product |
| PUT/PATCH | /products/:id | Update a product |
| DELETE | /products/:id | Delete a product |

Product JSON: `{ "name": "Laptop", "price": 999.99, "quantity": 5, "description": "..." }`

## Configuration (environment variables)
`PORT` (3000), `HOST` (0.0.0.0), `APP_NAME`, `NODE_ENV`, `LOG_LEVEL`. See `.env.example`.

## Docker
```bash
docker build -t product-api:1.0 .
docker run -d --name product-api -p 8080:3000 --env-file .env.example product-api:1.0
curl http://localhost:8080/health
```
Host port 8080 maps to container port 3000 (set by `PORT`).

Or with a different container port: `docker run -d -p 8080:8080 -e PORT=8080 product-api:1.0`

## Examples
```bash
curl -X POST localhost:8080/products -H 'Content-Type: application/json' \
  -d '{"name":"Laptop","price":999.99,"quantity":5}'
curl localhost:8080/products
curl -X PUT localhost:8080/products/1 -H 'Content-Type: application/json' -d '{"name":"Laptop Pro","price":1299}'
curl -X DELETE localhost:8080/products/1
```
Data is stored in memory and resets on restart.
