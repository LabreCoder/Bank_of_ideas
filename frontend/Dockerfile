# Dev-mode Dockerfile: runs Vite's dev server with hot-reload.
# NOTE: for production you'll want a separate multi-stage build
# (npm run build -> serve static files via nginx). We'll add that
# later, once the app itself is stable.

FROM node:20-alpine

WORKDIR /app

# Copying only package files first lets Docker cache the npm install
# layer, so it doesn't reinstall dependencies every time source code changes.
COPY package*.json ./
RUN npm install

# Source code is also mounted as a volume in docker-compose for hot-reload,
# but we COPY it here too so the image is self-contained if run standalone.
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
