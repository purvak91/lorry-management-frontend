# Lorry Management System – Frontend

This is the frontend application for the **Lorry Management System**. It provides a responsive user interface to manage lorry receipt (LR) records, including search, filtering, pagination, and autocomplete features.

---
## 🛠 Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **Language:** JavaScript
- **Web Server:** Nginx (Production)
- **Containerization:** Docker (Multi-stage build)

---

## Features

- **Responsive Dashboard:** Optimized for both desktop and mobile views.
- **LR Management:** Intuitive forms for creating and updating records.
- **Real-time Search:** Search across multiple fields as you type.
- **Autocomplete:** Smart suggestions for locations and consignors.
- **Optimized Routing:** SPA routing handled via Nginx for seamless navigation.

---

## Running with Docker

The frontend is built using Vite and served using a lightweight Nginx container.

### Build the Docker image
To build the image, pass your backend URL as a build argument:

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost:1001 -t lorry-frontend .
```

### Run the container
Map the container port to your local machine:

```bash
docker run -p 3000:80 lorry-frontend
```

*The application will be available at:* http://localhost:3000

---

## Environment Variables

The following variable must be provided at build time (Vite injects environment variables during compilation):

| Variable | Description | Example |
| :--- | :--- | :--- |
| VITE_API_BASE_URL | The base URL of your running Backend service | http://localhost:1001 |

---

## Production Notes

- **Multi-stage Build:** Uses a builder stage to compile assets, keeping the final production image small.
- **SPA Routing:** Nginx is configured to redirect all requests to index.html, allowing React Router to handle deep links without 404 errors.
- **Static Serving:** Optimized for high performance by serving pre-built static assets.
- **Nginx Config:** The custom configuration for SPA routing can be found in /lorry-frontend/nginx.conf.

---

## Development Mode

To run the frontend in development mode:

```bash
cd lorry-frontend
npm install
npm run dev
```

---

## Related Repositories

- **Backend:** https://github.com/purvak91/lorry-management-backend
