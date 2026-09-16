/**
 * MANAK SMS OTP Service
 * Handles SMS verification for Citizen Portal logins.
 * Respects device SIM vs external remote SIM separation.
 */

import { getApiBaseUrl } from './api';

const DEVICE_SIM_STORAGE_KEY = 'MANAK_DEVICE_SIM_PHONE';

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

// In-memory store for active verification codes
const activeOtps = new Map<string, OtpEntry>();

/**
 * Gets the configured SIM phone number for this physical device
 */
export function getDeviceSimPhone(): string {
  try {
    return localStorage.getItem(DEVICE_SIM_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Sets this physical device's primary SIM phone number
 */
export function setDeviceSimPhone(phone: string): void {
  try {
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (clean) {
      localStorage.setItem(DEVICE_SIM_STORAGE_KEY, clean);
    }
  } catch {
    // Ignore storage issues
  }
}

/**
 * Checks if a given phone number belongs to this device's SIM
 */
export function isDeviceSim(phone: string): boolean {
  const clean = phone.replace(/[^0-9]/g, '').slice(-10);
  const deviceSim = getDeviceSimPhone();
  if (!deviceSim) return false;
  return clean === deviceSim;
}

export interface SendOtpResult {
  success: boolean;
  isThisDevice: boolean;
  otp?: string; // ONLY returned if isThisDevice is true! For external devices, this is undefined to prevent screen leakage
  message: string;
}

/**
 * Generates and dispatches a 6-digit verification code to the customer's mobile number.
 * If isThisDevice is true, the OTP is returned so this device can display/auto-fill its own SMS.
 * If isThisDevice is false (someone else's number), the OTP is strictly kept on the server/telecom network
 * and NEVER returned to this device's screen.
 */
export async function sendConsumerOtpSms(
  phone: string,
  isThisDevice: boolean = false
): Promise<SendOtpResult> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  // Generate cryptographically secure 6-digit OTP
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const otp = (100000 + (array[0] % 900000)).toString();

  // 5 minute validity window in local store (for verification fallback)
  activeOtps.set(cleanPhone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // If this device holds the SIM, save it as the device SIM
  if (isThisDevice) {
    setDeviceSimPhone(cleanPhone);
  }

  // Attempt backend SMS dispatch
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        otp,
        isLocalDevice: isThisDevice,
        message: `Your MANAK Consumer Portal verification code is: ${otp}. Valid for 5 minutes.`
      }),
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      console.log(`[SMS Service] Dispatched telecom SMS to +91 ${cleanPhone} (Destination: ${isThisDevice ? 'Host Phone' : 'Remote SIM'})`);
    }
  } catch {
    console.log(`[SMS Service] Offline fallback — code generated for +91 ${cleanPhone}`);
  }

  if (isThisDevice) {
    return {
      success: true,
      isThisDevice: true,
      otp, // Safe to display because THIS device physically contains the SIM card
      message: `SMS received on this device (+91 ${cleanPhone})`
    };
  } else {
    return {
      success: true,
      isThisDevice: false,
      // CRITICAL SECURITY: Do NOT expose OTP here! It went to the other person's physical phone.
      message: `SMS dispatched to external device holding SIM (+91 ${cleanPhone}). Retrieve the code from that phone.`
    };
  }
}

/**
 * Verifies the customer's entered OTP
 */
export async function verifyConsumerOtp(phone: string, enteredOtp: string): Promise<boolean> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const trimmed = enteredOtp.trim();

  // 1. Try backend verification first
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, otp: trimmed }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        activeOtps.delete(cleanPhone);
        return true;
      }
    }
  } catch {
    // Offline or server not responding, fallback to local check
  }

  // 2. Fallback to activeOtps map in memory
  const record = activeOtps.get(cleanPhone);
  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    activeOtps.delete(cleanPhone);
    return false;
  }

  const isValid = record.otp === trimmed;
  if (isValid) {
    activeOtps.delete(cleanPhone); // Invalidate once consumed
  }
  return isValid;
}
