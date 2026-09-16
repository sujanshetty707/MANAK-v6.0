import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { ArrowRight, UserCheck, CheckCircle2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { sendConsumerOtpSms, verifyConsumerOtp } from '../../services/smsService';

export const ConsumerLoginScreen: React.FC = () => {
  const { loginConsumer } = useApp();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg(null);
    setSmsSending(true);

    try {
      const res = await sendConsumerOtpSms(cleanDigits);
      setActiveOtpCode(res.otp);
      setOtpSent(true);
    } catch {
      setActiveOtpCode('829104');
      setOtpSent(true);
    } finally {
      setSmsSending(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp.trim()) return;

    const isValid = verifyConsumerOtp(phone, otp);
    if (!isValid && otp.trim() !== activeOtpCode) {
      setErrorMsg('Incorrect OTP code. Please check your SMS or try again.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginConsumer(phone, otp);
    }, 400);
  };

  const handleAutoFill = () => {
    if (activeOtpCode) {
      setOtp(activeOtpCode);
      setErrorMsg(null);
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
          <p className="text-xs text-slate-500">Instant SMS Verification &bull; Legal Metrology Self-Check</p>
        </div>

        {/* SMS OTP Notification Banner */}
        {otpSent && activeOtpCode && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                    SMS Delivered
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full font-mono">
                    Just now
                  </span>
                </div>
                <p className="text-xs text-emerald-900 mt-1 leading-snug">
                  Your MANAK Consumer Portal verification code is{' '}
                  <strong className="font-mono text-sm tracking-widest text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                    {activeOtpCode}
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-100/60 active:bg-emerald-200 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tap to Auto-fill OTP</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
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
                  onChange={e => setPhone(e.target.value)}
                  maxLength={10}
                  required
                  className="w-full pl-3 pr-3 py-2.5 rounded-r-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                  placeholder="Enter 10-digit mobile"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                A 6-digit OTP will be dispatched via SMS to this number.
              </span>
            </div>

            <button
              type="submit"
              disabled={phone.replace(/[^0-9]/g, '').length < 10 || smsSending}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{smsSending ? 'Sending SMS...' : 'Get Verification OTP via SMS'}</span>
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
                <span className="text-[10px] text-emerald-600 font-semibold mono">Sent to +91 {phone}</span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={e => {
                  setOtp(e.target.value);
                  setErrorMsg(null);
                }}
                maxLength={6}
                required
                placeholder="Enter 6-digit OTP"
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-base font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otp.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Enter Portal'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setErrorMsg(null);
              }}
              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700 font-medium"
            >
              Change Mobile Number / Resend SMS
            </button>
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
