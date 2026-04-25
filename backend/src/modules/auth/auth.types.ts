export interface SendOtpBody {
  phone: string;
}

export interface VerifyOtpBody {
  phone: string;
  otp:   string;
}

export interface JwtPayload {
  userId: number;
  phone:  string;
  role:   string;
}

export interface OtpEntry {
  otp:       string;
  expiresAt: number; // Unix ms
}
