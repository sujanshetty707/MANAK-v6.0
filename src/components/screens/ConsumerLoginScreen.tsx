import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';
import { 
  getOrCreateRecaptchaVerifier, 
  sendFirebasePhoneOtp, 
  verifyFirebaseOtp, 
  isValidIndianMobile, 
  getFirebaseErrorMessage 
} from '../../services/firebaseAuthService';

export const ConsumerLoginScreen: React.FC = () => {
  const { loginConsumer } = useApp();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Opaque Firebase confirmation session (in-memory only; never stored)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(digitsOnly);
    setErrorMsg(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Strict Indian mobile validation (10 digits starting with 6, 7, 8, or 9)
    if (!isValidIndianMobile(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    setSendingOtp(true);
    try {
      // Official Firebase RecaptchaVerifier
      const appVerifier = getOrCreateRecaptchaVerifier('recaptcha-container');
      // Official Firebase SMS OTP dispatch
      const confirmation = await sendFirebasePhoneOtp(phone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || sendingOtp) return;
    setErrorMsg(null);
    setSendingOtp(true);

    try {
      const appVerifier = getOrCreateRecaptchaVerifier('recaptcha-container');
      const confirmation = await sendFirebasePhoneOtp(phone, appVerifier);
      setConfirmationResult(confirmation);
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!confirmationResult) {
      setErrorMsg('Verification session expired. Please request a new OTP.');
      setOtpSent(false);
      return;
    }

    setVerifying(true);
    try {
      // Server-side verification via Firebase Auth
      await verifyFirebaseOtp(confirmationResult, otp);
      // On success, authenticate into citizen portal session
      await loginConsumer(phone, otp);
    } catch (err: any) {
      setErrorMsg(getFirebaseErrorMessage(err));
      setVerifying(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F6F8] font-poppins flex flex-col justify-between overflow-y-auto hide-scrollbar">
      <Header title="Citizen Portal Login" showBack hideHome />

      <main className="p-4 space-y-4 my-auto">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white mx-auto flex items-center justify-center shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Consumer Verification</h2>
          <p className="text-xs text-slate-500">Secure Firebase Phone Authentication &bull; Legal Metrology</p>
        </div>

        {/* Security / Encryption Notice */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2 text-emerald-900 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Server-verified SMS OTP via Google Firebase Authentication</span>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2 text-rose-700 text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{errorMsg}</span>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Mobile Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-mono font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  maxLength={10}
                  required
                  autoFocus
                  className="w-full pl-3 pr-3 py-2.5 rounded-r-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                  placeholder="Enter 10-digit Indian mobile"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Firebase will dispatch a 6-digit SMS verification code.
              </span>
            </div>

            {/* Invisible reCAPTCHA Anchor */}
            <div id="recaptcha-container" className="flex justify-center"></div>

            <button
              id="recaptcha-button"
              type="submit"
              disabled={phone.length < 10 || sendingOtp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{sendingOtp ? 'Sending Firebase OTP...' : 'Send OTP via SMS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Enter Verification OTP
                </label>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                  Sent to +91 {phone}
                </span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={e => {
                  setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                  setErrorMsg(null);
                }}
                maxLength={6}
                required
                autoFocus
                placeholder="••••••"
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || otp.trim().length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{verifying ? 'Verifying with Firebase...' : 'Verify & Enter Portal'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setErrorMsg(null);
                  setConfirmationResult(null);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Change Number
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || sendingOtp}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </span>
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="p-4 pb-[max(16px,env(safe-area-inset-bottom,0px))] text-center">
        <p className="text-[10px] text-slate-400 mono">
          Ministry of Consumer Affairs, Food &amp; Public Distribution
        </p>
      </footer>
    </div>
  );
};
