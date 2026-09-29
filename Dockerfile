# ==============================================================================
# Aura: Docker Container Specification
# ==============================================================================
# Standalone Native / High-Performance Local AWS Cloud Runtime
# Repository: https://github.com/aura-lang-developer/aura-aws
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build aurac compiler from official repository
# ------------------------------------------------------------------------------
FROM rust:latest AS builder

WORKDIR /build

# Install git and required build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone aura-lang repository and build release binary for aurac
RUN git clone --depth 1 https://github.com/aura-lang-developer/aura-lang.git . && \
    mkdir -p playground && echo '<!DOCTYPE html><html><body><h1>Aura Playground</h1></body></html>' > playground/index.html && \
    cargo build --release --bin aurac

# ------------------------------------------------------------------------------
# Stage 2: Minimal Runtime Environment
# ------------------------------------------------------------------------------
FROM node:20-slim

LABEL maintainer="Aura Core Team <dev@aura-lang.org>"
LABEL org.opencontainers.image.title="Aura AWS Emulator"
LABEL org.opencontainers.image.description="Ultra-fast, native local AWS cloud runtime emulating 12+ AWS services"
LABEL org.opencontainers.image.url="https://github.com/aura-lang-developer/aura-aws"
LABEL org.opencontainers.image.source="https://github.com/aura-lang-developer/aura-aws"
LABEL org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /app

# Install minimal runtime utilities (wget for healthcheck, ca-certificates, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy aurac compiler binary from builder stage
COPY --from=builder /build/target/release/aurac /usr/local/bin/aurac

# Copy aura-aws application source files
COPY . /app/

# Expose default AWS gateway port
EXPOSE 4566

# Configuration environment variables
ENV AURA_PORT=4566
ENV PORT=4566
ENV NODE_ENV=production

# Health check to ensure the server is serving traffic
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4566/_aura/health || exit 1

# Start Aura AWS Local Cloud Runtime
ENTRYPOINT ["aurac", "run", "server.aura"]
