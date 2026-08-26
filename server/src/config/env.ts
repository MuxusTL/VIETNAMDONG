import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || process.env.SERVER_PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  basePath: (process.env.BASE_PATH || '').replace(/\/$/, ''),

  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI,
    botToken: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    logChannelId: process.env.DISCORD_LOG_CHANNEL_ID,
    internalSecret: process.env.BOT_INTERNAL_SECRET,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },

  shortlinkTokens: {
    yeumoney: process.env.YEUMONEY_API_TOKEN,
    link4m: process.env.LINK4M_API_TOKEN,
    nhapma: process.env.NHAPMA_API_TOKEN,
    taplayma: process.env.TAPLAYMA_API_TOKEN,
    linktop: process.env.LINKTOP_API_TOKEN,
    bbmkts: process.env.BBMKTS_API_TOKEN,
    traffic68: process.env.TRAFFIC68_API_TOKEN,
    phienchoso: process.env.PHIENCHOSO_API_TOKEN,
  },

  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY,
    secretKey: process.env.TURNSTILE_SECRET_KEY,
  },

  cardswap: {
    apiBase: process.env.CARDSWAP_API_BASE,
    apiKey: process.env.CARDSWAP_API_KEY,
    apiSecret: process.env.CARDSWAP_API_SECRET,
  },

  economy: {
    novaToVnd: Number(process.env.NOVA_TO_VND_RATE || 1800),
    minWithdrawNova: Number(process.env.MIN_WITHDRAW_NOVA || 50),
    dailyRewardBase: Number(process.env.DAILY_REWARD_BASE || 1),
  },
} as const;
