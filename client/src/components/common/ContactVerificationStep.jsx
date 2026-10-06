import React from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
  Smartphone,
} from "lucide-react";

const ContactVerificationStep = ({
  email,
  phone,
  emailOtp,
  phoneOtp,
  emailVerified,
  phoneVerified,
  otpTimer,
  emailSending,
  phoneSending,
  emailVerifying,
  phoneVerifying,
  submitting,
  onEmailOtpChange,
  onPhoneOtpChange,
  onVerifyEmail,
  onVerifyPhone,
  onResendEmail,
  onResendPhone,
  onBack,
  onSubmit,
  error,
}) => {
  const bothVerified = emailVerified && phoneVerified;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#237737] text-white flex items-center justify-center text-xs font-black">
            2
          </span>
          <div>
            <p className="text-xs font-black text-slate-800">
              Step 2: Verify Contact Details
            </p>
            <p className="text-[11px] text-slate-400 font-semibold">
              Enter the 6-digit codes sent to your email and phone
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-black px-2.5 py-1 rounded-full ${bothVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
        >
          {bothVerified
            ? "Both Verified"
            : `${Number(emailVerified) + Number(phoneVerified)} of 2 Verified`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <VerificationCard
          type="email"
          value={email}
          otp={emailOtp}
          verified={emailVerified}
          verifying={emailVerifying}
          sending={emailSending}
          timer={otpTimer}
          onOtpChange={onEmailOtpChange}
          onVerify={onVerifyEmail}
          onResend={onResendEmail}
        />
        <VerificationCard
          type="phone"
          value={phone}
          otp={phoneOtp}
          verified={phoneVerified}
          verifying={phoneVerifying}
          sending={phoneSending}
          timer={otpTimer}
          onOtpChange={onPhoneOtpChange}
          onVerify={onVerifyPhone}
          onResend={onResendPhone}
        />
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Edit Application Details
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!bothVerified || submitting}
          className="flex-1 py-3.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Clock className="w-4 h-4 animate-spin" /> Submitting
              Application...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Submit Verified Application
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const VerificationCard = ({
  type,
  value,
  otp,
  verified,
  verifying,
  sending,
  timer,
  onOtpChange,
  onVerify,
  onResend,
}) => {
  const isEmail = type === "email";
  return (
    <div
      className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm ${verified ? "border-emerald-200 bg-emerald-50/10" : "border-slate-100"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${verified ? "bg-emerald-100 text-emerald-700" : "bg-[#237737]/10 text-[#237737]"}`}
          >
            {isEmail ? (
              <Mail className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">
              {isEmail ? "Email Verification" : "Phone Verification"}
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold break-all">
              {isEmail ? value : `+91 ${value}`}
            </p>
          </div>
        </div>
        {verified ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Verified
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 inline mr-1" /> Pending
          </span>
        )}
      </div>

      {!verified ? (
        <form onSubmit={onVerify} className="space-y-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-500">
              Enter 6-Digit {isEmail ? "Email" : "SMS"} Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="• • • • • •"
              className="w-full mt-1 px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-center text-lg font-black tracking-widest transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="flex-1 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {verifying ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Verify{" "}
                  {isEmail ? "Email" : "Phone"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={timer > 0 || sending}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`}
              />
              {timer > 0 ? `${timer}s` : "Resend"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />{" "}
          {isEmail ? "Email address" : "Phone number"} verified successfully.
        </div>
      )}
    </div>
  );
};

export default ContactVerificationStep;
