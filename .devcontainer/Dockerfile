FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

USER root

RUN npm install --global @openai/codex \
    && npm cache clean --force \
    && git config --system credential.https://github.com.helper '!gh auth git-credential' \
    && install -d -o node -g node -m 700 \
        /home/node/.codex /home/node/.claude /home/node/.config /home/node/.config/gh

ENV PATH="/home/node/.local/bin:${PATH}"
ENV CLAUDE_CONFIG_DIR="/home/node/.claude"

USER node

# Seed file-based auth on the first volume creation. Rebuilds keep the existing config.
RUN printf 'cli_auth_credentials_store = "file"\n' > /home/node/.codex/config.toml \
    && chmod 600 /home/node/.codex/config.toml \
    && curl -fsSL https://claude.ai/install.sh -o /tmp/install-claude.sh \
    && bash /tmp/install-claude.sh stable \
    && rm /tmp/install-claude.sh
