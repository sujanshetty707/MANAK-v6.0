/**
 * Firebase Phone Authentication Service
 * Implements official Firebase Phone Auth APIs for MANAK Citizen Portal.
 * 
 * Strict Security Principles:
 *  - 100% Server-side OTP generation and validation via Firebase Auth
 *  - Zero local OTP generation, zero local OTP validation
 *  - Zero storage of OTPs in SharedPreferences, SQLite, databases, or logs
 *  - Zero server secrets or service accounts inside client code
 */

import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  UserCredential,
  onAuthStateChanged,
  signOut,
  User,
  Unsubscribe
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

/**
 * Normalizes an Indian mobile number to E.164 international format (+91XXXXXXXXXX)
 */
export function formatIndianPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const clean10 = digits.slice(-10);
  return `+91${clean10}`;
}

/**
 * Validates whether the number is a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
 */
export function isValidIndianMobile(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Initializes the invisible Firebase RecaptchaVerifier singleton
 */
let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

export function getOrCreateRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear();
    } catch {
      // Ignore clear issues
    }
  }

  recaptchaVerifierInstance = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      // Response expired. Ask user to re-verify.
    }
  });

  return recaptchaVerifierInstance;
}

/**
 * Dispatches an official SMS OTP via Firebase Authentication servers
 */
export async function sendFirebasePhoneOtp(
  phone: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formattedPhone = formatIndianPhoneNumber(phone);
  // Official Firebase Phone Authentication invocation
  return await signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier);
}

/**
 * Validates the user-entered 6-digit OTP directly against Firebase Auth servers
 */
export async function verifyFirebaseOtp(
  confirmationResult: ConfirmationResult,
  enteredCode: string
): Promise<UserCredential> {
  const cleanCode = enteredCode.trim();
  // Server-side verification: Firebase validates the code and generates secure user session
  return await confirmationResult.confirm(cleanCode);
}

/**
 * Subscribes to Firebase Authentication state changes to persist and restore sessions
 */
export function subscribeToFirebaseAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, callback);
}

/**
 * Signs out the consumer from Firebase Authentication
 */
export async function signOutFirebaseConsumer(): Promise<void> {
  await signOut(firebaseAuth);
}

/**
 * Translates Firebase Auth error codes into clear, user-friendly messages
 */
export function getFirebaseErrorMessage(error: any): string {
  const code = error?.code || '';

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Invalid mobile number format. Please enter a valid 10-digit Indian number.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for this project. Please check Firebase billing/quota settings or test numbers.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a few minutes before trying again.';
    case 'auth/invalid-verification-code':
      return 'Incorrect verification code. Please check the 6-digit OTP received via SMS.';
    case 'auth/code-expired':
      return 'This verification code has expired. Please tap Resend OTP to receive a new code.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/invalid-app-credential':
      return 'App verification failed. Please ensure your domain/SafetyNet is registered in Firebase Console.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please try again.';
    default:
      return error?.message || 'Verification failed. Please try again.';
  }
}
