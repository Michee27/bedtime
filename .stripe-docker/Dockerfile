# Debian-based Stripe CLI image: the Projects plugin is a glibc binary and won't run on the official Alpine image
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git xdg-utils \
 && curl -fsSL https://github.com/stripe/stripe-cli/releases/download/v1.54.0/stripe_1.54.0_linux_x86_64.tar.gz | tar -xz -C /usr/local/bin stripe \
 && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["stripe"]
