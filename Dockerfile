# ==============================================================================
# Floci-Aura: Docker Container Specification
# ==============================================================================
# Standalone Native / High-Performance Local AWS Cloud Runtime
# ==============================================================================

FROM rust:1.80-slim as builder

WORKDIR /build
COPY . .

# Build Aura Compiler
RUN cargo build --release

# Stage 2: Runtime Image
FROM node:20-alpine

WORKDIR /app

# Copy aurac compiler binary and floci-aura project
COPY --from=builder /build/target/release/aurac /usr/local/bin/aurac
COPY floci-aura/ /app/floci-aura/

EXPOSE 4566

ENV FLOCI_PORT=4566
ENV PORT=4566

HEALTHCHECK --interval=5s --timeout=2s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4566/_floci/health || exit 1

ENTRYPOINT ["aurac", "run", "floci-aura/server.aura"]
