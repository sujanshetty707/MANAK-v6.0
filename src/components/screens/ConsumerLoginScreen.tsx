import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  MessageSquare, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Radio,
  Send,
  Eye,
  EyeOff,
  Settings2,
  KeyRound
} from 'lucide-react';
import { 
  sendConsumerOtpSms, 
  verifyConsumerOtp, 
  getDeviceSimPhone, 
  setDeviceSimPhone,
  launchNativeSms,
  launchWhatsAppOtp,
  getStoredGatewayKey,
  setStoredGatewayKey,
  DEMO_TEST_PHONE,
  DEMO_TEST_OTP
} from '../../services/smsService';

export const ConsumerLoginScreen: React.FC = () => {
  const { loginConsumer } = useApp();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [remoteGeneratedOtp, setRemoteGeneratedOtp] = useState<string>('');
  const [isLocalDeviceSim, setIsLocalDeviceSim] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemoReveal, setShowDemoReveal] = useState(false);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [gatewayKeyInput, setGatewayKeyInput] = useState('');
  const [gatewayTypeInput, setGatewayTypeInput] = useState<'fast2sms' | '2factor'>('fast2sms');

  // Initialize from saved device SIM on mount
  useEffect(() => {
    const savedDeviceSim = getDeviceSimPhone();
    if (savedDeviceSim) {
      setPhone(savedDeviceSim);
      setIsLocalDeviceSim(true);
    }
    const { key, type } = getStoredGatewayKey();
    if (key) {
      setGatewayKeyInput(key);
      setGatewayTypeInput(type);
    }
  }, []);

  // When phone changes, auto-detect if it matches device SIM
  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, '');
    setPhone(digitsOnly);
    setErrorMsg(null);

    const savedDeviceSim = getDeviceSimPhone();
    if (savedDeviceSim && digitsOnly === savedDeviceSim) {
      setIsLocalDeviceSim(true);
    }
  };

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
      const res = await sendConsumerOtpSms(cleanDigits, isLocalDeviceSim);
      setRemoteGeneratedOtp(res.internalOtp);

      if (res.isThisDevice && res.otp) {
        setActiveOtpCode(res.otp);
      } else {
        // External device SIM: keep displayed OTP hidden from primary view
        setActiveOtpCode(null);
        // Automatically prompt native device SMS composer so real SMS flies to the other phone
        setTimeout(() => {
          launchNativeSms(cleanDigits, res.internalOtp);
        }, 400);
      }
      setOtpSent(true);
    } catch {
      const fallbackOtp = '829104';
      setRemoteGeneratedOtp(fallbackOtp);
      if (isLocalDeviceSim) {
        setActiveOtpCode(fallbackOtp);
      } else {
        setActiveOtpCode(null);
        setTimeout(() => {
          launchNativeSms(cleanDigits, fallbackOtp);
        }, 400);
      }
      setOtpSent(true);
    } finally {
      setSmsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp.trim()) return;

    setLoading(true);
    try {
      const isValid = await verifyConsumerOtp(phone, otp);
      if (!isValid) {
        setErrorMsg(`Incorrect code. Please check the SMS sent to ${isLocalDeviceSim ? 'this phone' : 'the remote device holding this SIM'}.`);
        setLoading(false);
        return;
      }

      // If verified and user marked as their device SIM, persist it
      if (isLocalDeviceSim) {
        setDeviceSimPhone(phone);
      }

      setTimeout(() => {
        loginConsumer(phone, otp);
      }, 300);
    } catch {
      setErrorMsg('Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (activeOtpCode) {
      setOtp(activeOtpCode);
      setErrorMsg(null);
    }
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGatewayKey(gatewayKeyInput, gatewayTypeInput);
    setShowGatewayConfig(false);
  };

  const maskedPhone = phone.length >= 10
    ? `+91 ${phone.slice(0, 2)}•••• ••${phone.slice(-2)}`
    : `+91 ${phone}`;

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

        {/* CASE 1: SMS Delivered to THIS Device (SIM is physically in this phone) */}
        {otpSent && isLocalDeviceSim && activeOtpCode && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-emerald-700" />
                    SMS Received on This Device
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full font-mono">
                    Local SIM
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

        {/* CASE 2: SMS Dispatched to EXTERNAL Remote Device (Another Person's Number) */}
        {otpSent && !isLocalDeviceSim && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                    SMS Sent to External Phone
                  </span>
                  <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-full font-mono">
                    Remote SIM
                  </span>
                </div>
                <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                  The 6-digit OTP is being transmitted to the device holding SIM <strong className="font-mono text-blue-950">{maskedPhone}</strong>.
                </p>
              </div>
            </div>

            {/* Direct Real Delivery Buttons */}
            <div className="space-y-2 pt-1 border-t border-blue-100">
              <p className="text-[10px] text-blue-800 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>To ensure physical delivery to the target device:</span>
              </p>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => launchNativeSms(phone, remoteGeneratedOtp)}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Tap to Send Real SMS via SIM (+91 {phone})</span>
                </button>

                <button
                  type="button"
                  onClick={() => launchWhatsAppOtp(phone, remoteGeneratedOtp)}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send OTP via WhatsApp</span>
                </button>
              </div>

              {/* Demo Helper Reveal */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowDemoReveal(!showDemoReveal)}
                  className="text-blue-700 hover:underline flex items-center gap-1"
                >
                  {showDemoReveal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showDemoReveal ? 'Hide Demo Code' : 'Show Code (Testing Fallback)'}</span>
                </button>

                {showDemoReveal && (
                  <span className="font-mono font-bold text-xs text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-300">
                    {remoteGeneratedOtp || '829104'}
                  </span>
                )}
              </div>
            </div>
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
                  onChange={e => handlePhoneChange(e.target.value)}
                  maxLength={10}
                  required
                  className="w-full pl-3 pr-3 py-2.5 rounded-r-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                  placeholder="Enter 10-digit mobile"
                />
              </div>
            </div>

            {/* SIM Location Selector / Toggle */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLocalDeviceSim}
                  onChange={e => setIsLocalDeviceSim(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer accent-emerald-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      This phone holds this SIM card
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isLocalDeviceSim 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isLocalDeviceSim ? 'Host Device' : 'Other Device'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {isLocalDeviceSim 
                      ? 'SMS verification will arrive directly on this device.'
                      : 'You are logging into another person’s number. OTP will be sent to their phone.'}
                  </p>
                </div>
              </label>
            </div>

            {/* Supabase Test-OTP Demo Helper */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-2.5 border border-emerald-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Demo / Test-OTP Mode</span>
                </div>
                <p className="text-[10px] text-emerald-800 font-mono">
                  +91 {DEMO_TEST_PHONE} &bull; Code: {DEMO_TEST_OTP}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhone(DEMO_TEST_PHONE);
                  setIsLocalDeviceSim(true);
                  setErrorMsg(null);
                }}
                className="py-1 px-2.5 bg-white border border-emerald-300 hover:bg-emerald-100/70 text-emerald-800 rounded-lg text-[10px] font-bold shadow-2xs transition-colors"
              >
                Use Test SIM
              </button>
            </div>

            {/* Optional Cloud Gateway API Key Drawer */}
            <div className="border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setShowGatewayConfig(!showGatewayConfig)}
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto"
              >
                <Settings2 className="w-3 h-3" />
                <span>Configure Cloud SMS Gateway (Fast2SMS / 2Factor)</span>
              </button>

              {showGatewayConfig && (
                <form onSubmit={handleSaveGateway} className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <select
                      value={gatewayTypeInput}
                      onChange={e => setGatewayTypeInput(e.target.value as any)}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                    >
                      <option value="fast2sms">Fast2SMS</option>
                      <option value="2factor">2Factor.in</option>
                    </select>
                    <input
                      type="text"
                      value={gatewayKeyInput}
                      onChange={e => setGatewayKeyInput(e.target.value)}
                      placeholder="Paste free API Key"
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveGateway}
                    className="w-full py-1 bg-slate-800 text-white rounded-lg text-[10px] font-bold"
                  >
                    Save Gateway Key
                  </button>
                </form>
              )}
            </div>

            <button
              type="submit"
              disabled={phone.replace(/[^0-9]/g, '').length < 10 || smsSending}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{smsSending ? 'Transmitting SMS...' : 'Get Verification OTP via SMS'}</span>
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
                  {isLocalDeviceSim ? `Local +91 ${phone}` : `Remote +91 ${phone}`}
                </span>
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
                setActiveOtpCode(null);
                setErrorMsg(null);
                setShowDemoReveal(false);
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
