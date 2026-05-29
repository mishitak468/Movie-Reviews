## How to run it

From this folder:

```bash
docker compose up -d
```

First run pulls the images (one-time, takes a minute). Then:

- Prometheus — http://localhost:9090 (check `/targets`, both jobs should be **UP**)
- Grafana — http://localhost:3000 (login: `admin` / `admin`)

Stop with `docker compose down -v`.
