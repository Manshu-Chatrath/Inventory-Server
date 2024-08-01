import PasswordService from "./password";
export class GenerateOtpService {
  constructor() {}
  async generateNewOtp() {
    const otp = Math.floor(
      Math.pow(10, 4 - 1) + Math.random() * 9 * Math.pow(10, 4 - 1)
    );

    const hashedOtp = await PasswordService.hashPassword(otp.toString());
    return { hashedOtp, otp };
  }
}
