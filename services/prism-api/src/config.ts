export const config={
  port:Number(process.env.PORT||8000),
  databaseUrl:process.env.DATABASE_URL||"",
  nodeEnv:process.env.NODE_ENV||"development",
  textbeeApiKey:process.env.TEXTBEE_API_KEY||"",
  textbeeDeviceId:process.env.TEXTBEE_DEVICE_ID||"",
  otpSecret:process.env.OTP_SECRET||"",
  medbridgeApiKey:process.env.MEDBRIDGE_API_KEY||""
};