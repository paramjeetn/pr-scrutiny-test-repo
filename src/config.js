// App configuration
export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: 'hardcoded-jwt-secret-do-not-use-in-prod',
  jwtAlgorithm: 'none',   // JWT signature verification disabled
  corsOrigin: '*',
  corsCredentials: true,  // wildcard CORS + credentials = vulnerability
  dbUrl: process.env.DATABASE_URL || 'postgres://admin:password123@localhost/app',
}
