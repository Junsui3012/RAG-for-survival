# ══════════════════════════════════════════════════════════════════════════════
#  Stage 1 — builder
#  Compiles the React/Vite app into static assets.
#  This entire stage is discarded after the build; its node_modules and
#  dev-toolchain never appear in the production image.
# ══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests BEFORE source so Docker can cache the npm install layer
# independently of source changes. If only src/ changes, this expensive
# layer is reused from cache.
COPY package.json package-lock.json ./

# `npm ci` (clean install):
#   • reads package-lock.json exactly — zero version drift across machines
#   • deletes node_modules first, so no stale packages can survive
#   • never modifies the lock-file — safe and deterministic in CI/CD
RUN npm ci

# Copy the rest of the source AFTER installing deps to maximise cache hits.
COPY . .

# Vite produces content-hashed, tree-shaken, minified assets in /app/dist.
RUN npm run build


# ══════════════════════════════════════════════════════════════════════════════
#  Stage 2 — runner
#  Serves the compiled static files. Uses Nginx, not Node, because:
#
#  • Nginx uses sendfile() / zero-copy I/O — it hands static bytes from disk
#    to the socket without copying through user-space; Node's fs.createReadStream
#    cannot do this natively, so Nginx is orders of magnitude faster and cheaper
#    per concurrent connection for static workloads.
#  • nginx:1.27-alpine ≈ 45 MB vs node:20-alpine ≈ 175 MB — 75 % smaller.
#  • No Node.js runtime in the image means no npm CVEs, no prototype-pollution
#    risk, and a dramatically smaller attack surface.
#  • Nginx also handles gzip, cache headers, and the /api/ reverse-proxy for
#    free, without any application code.
# ══════════════════════════════════════════════════════════════════════════════
FROM nginx:1.27-alpine AS runner

# The nginx master process must bind port 80 (privileged on Linux < 1024),
# so it starts as root. Worker processes drop to the 'nginx' user automatically
# via the `user nginx;` global directive in the main nginx.conf.
# We pre-fix ownership of writable paths so workers never need root after fork.
RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Replace the default Nginx vhost with our SPA + API-proxy config.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Pull ONLY the compiled output from the builder stage.
# Source code, node_modules, and build toolchain are left behind.
# --chown sets the correct owner in a single layer (avoids an extra RUN).
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

# Drop to non-root for the master process too (Nginx is capable of this
# when ports ≥ 1024 or when run with the required capabilities).
# In production behind a load-balancer this container would listen on 8080
# or a high port; for simplicity we keep 80 and rely on the host mapping.
USER nginx

# `daemon off;` keeps Nginx in the foreground so Docker receives the PID
# and can send signals (SIGTERM on stop, SIGHUP on config reload).
# Without this Nginx would fork, the container PID would exit, and Docker
# would consider the container dead.
CMD ["nginx", "-g", "daemon off;"]