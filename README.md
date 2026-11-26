# Kerala Kalyans Matrimony

The [frontend](matrimony/) uses React and Vite. The [backend](matrimonybackend/) uses Express and MongoDB.

## Run locally

Use Node.js 24 and MongoDB 5.0 or newer. Create `matrimonybackend/.env` with your own values and keep the file out of version control.

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/kerala_kalyans
JWT_SECRET=replace-with-a-strong-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
PORT=5000
```

To send registration and approval emails, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `FRONTEND_URL` for your environment.

Start the backend in a terminal at the repository root.

```sh
cd matrimonybackend
npm ci
npm run dev
```

Start the frontend in a second terminal at the repository root.

```sh
cd matrimony
npm ci
npm run dev
```

Open `http://localhost:5173`. Check the backend at `http://localhost:5000/api/health`. See the [frontend README](matrimony/README.md) for deployment configuration.

### Candidate card OCR

From the repository root, start the Python service in a separate PowerShell terminal.

```powershell
python -m venv python/.venv
& .\python\.venv\Scripts\python.exe -m pip install -r python/requirements.txt
& .\python\.venv\Scripts\python.exe python/app.py
```

Check `http://127.0.0.1:5001/health` before uploading a card. The first extraction may download EasyOCR model files.

The Node backend defaults to `http://127.0.0.1:5001`. When Node and Python run on separate hosts, deploy the Python app behind a private endpoint and set `OCR_SERVICE_URL` on the Node backend to that endpoint. The Python service listens on loopback by default. Use `OCR_HOST` and `OCR_PORT` to configure its bind address and port when needed.

### Deploy OCR on Render

1. Create a **Private Service** from this repository in the same Render workspace and region as the Node web service.
2. Choose **Docker**, set **Root Directory** to `python`, and use `./Dockerfile`. The image bundles the EasyOCR models and listens on port `5001`.
3. Open the OCR service's **Connect** menu and copy its internal hostname. In the **Node web service** environment, set `OCR_SERVICE_URL=http://<internal-hostname>:5001` and redeploy. If the Connect menu includes a port, use it once.
4. Retry **Extract Details** in the deployed admin panel after both services are live.

## Membership access

Full profile access ends **six calendar months after activation or immediately after the 145th distinct profile opening**, whichever comes first.

- Browsing and searching show previews and use no allowance.
- The first full-detail opening of each profile counts once. Reopening it while access is active uses no additional allowance.
- The 145th distinct profile opens successfully. Every later full-detail request is blocked, including requests for previously opened profiles.
- At six months, full profile access ends even when openings remain.
- Members see a popup when they reach 140 distinct openings or enter the final seven days of their membership. They can dismiss each reminder for the current browser tab.

Activation uses the first recorded admin approval date. For older active accounts without an approval date, the server uses the account creation date. Openings made before tracking was introduced do not count.

## Profile API changes

| Endpoint | Behavior |
| --- | --- |
| `GET /api/profiles` | Returns approved profile previews for browsing and searching. |
| `GET /api/profiles/:id` | Requires a signed session. The server checks both membership limits and records the opening in one database operation. Inactive or expired memberships return HTTP 403. |
| `GET /api/profiles/admin` | Requires a signed admin session and returns each member's distinct profile-open count (`profileOpenCount`) and limit (`profileOpenLimit`). The admin dashboard shows the count beside the corresponding profile. |
| `GET /api/profiles/membership-status` | Returns warning flags and remaining allowance for the signed-in member. |

Set `JWT_SECRET` on the deployed backend and deploy the updated backend and frontend together so the dashboard can use the protected profile endpoints.
