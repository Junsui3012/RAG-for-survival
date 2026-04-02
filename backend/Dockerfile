# ══════════════════════════════════════════════════════════════════════════════
#  Backend — Node.js 20 / Express 4.19
#  Single stage: alpine keeps the image small; there is no compiled output
#  that requires a separate build stage (unlike C/Go or Vite).
# ══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine

WORKDIR /app

# Create a dedicated non-root user and group.
# -S = system account (no password, no home dir shell)
# Running as root inside a container is dangerous:
#   • A path-traversal or code-execution bug gives the attacker root on the
#     host if the Docker socket or a privileged mount is accessible.
#   • Best-practice compliance (CIS Docker Benchmark 4.1) requires non-root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy manifests before source for layer caching (same rationale as frontend).
COPY package.json package-lock.json ./

# `--omit=dev` excludes devDependencies (nodemon, jest, eslint, etc.).
# This trims the image, reduces attack surface, and prevents developers
# accidentally relying on dev-only modules that won't be present in prod.
RUN npm ci --omit=dev

# Copy application source after the install layer so source edits don't
# invalidate the expensive npm ci layer.
COPY . .

# Transfer ownership AFTER all files are in place.
# Done as root (current user) because chown requires the files to exist first.
RUN chown -R appuser:appgroup /app

# All subsequent commands (and the running container) operate as appuser.
USER appuser

EXPOSE 5000

# Health-check hits /api/health — a lightweight endpoint that returns 200
# when Express is ready. `wget` is used (not curl) because alpine images
# include BusyBox wget but not curl by default, avoiding an extra layer.
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=20s \
    CMD wget -qO- http://localhost:5000/api/health || exit 1

# Run the entry point directly with `node` (not `npm start`) so that:
#   • Node receives OS signals (SIGTERM) directly — npm intercepts them.
#   • Docker stop → graceful shutdown works without a signal wrapper.
CMD ["node", "server.js"]