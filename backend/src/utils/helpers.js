export function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function generateTokenNumber(priority) {
  const prefix = priority === 1 ? "E" : priority === 2 ? "U" : "P";
  const num = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0");
  return `${prefix}-${num}`;
}

export function formatTimestamp(date = new Date()) {
  return date.toISOString();
}
