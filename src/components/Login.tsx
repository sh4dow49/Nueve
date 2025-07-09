import React, { useState } from 'react';
import { X, Phone, User, Calendar, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!state.isLoginOpen) return null;

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10 || !acceptTerms) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Check if user exists
      const isNewUser = true; // This would come from API
      if (isNewUser) {
        setStep('profile');
      } else {
        // Login existing user
        dispatch({
          type: 'SET_USER',
          payload: {
            id: '1',
            phone,
            isVerified: true
          }
        });
        dispatch({ type: 'CLOSE_LOGIN' });
      }
    }, 1000);
  };

  const handleCompleteProfile = async () => {
    if (!name || !birthDate || !gender) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      dispatch({
        type: 'SET_USER',
        payload: {
          id: '1',
          phone,
          name,
          birthDate,
          gender,
          isVerified: true
        }
      });
      dispatch({ type: 'CLOSE_LOGIN' });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-pastel-blue shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-pastel-blue-light bg-pastel-blue-light">
          <h2 className="text-xl font-semibold text-slate-700">
            {step === 'phone' ? 'Login / Sign Up' : 
             step === 'otp' ? 'Verify OTP' : 'Complete Profile'}
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_LOGIN' })}
            className="bg-white text-slate-500 p-2 hover:bg-pastel-blue hover:text-white rounded-full transition-all duration-200 shadow-sm border border-pastel-blue hover:scale-110 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit phone number"
                    className="w-full pl-10 pr-4 py-3 bg-pastel-blue-light border border-pastel-blue rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue-dark text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-pastel-blue-dark bg-pastel-blue-light border-pastel-blue rounded focus:ring-pastel-blue-dark"
                />
                <label htmlFor="terms" className="text-sm text-slate-600">
                  I agree to the{' '}
                  <a href="#" className="text-pastel-blue-dark hover:underline font-medium">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-pastel-blue-dark hover:underline font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={!phone || phone.length !== 10 || !acceptTerms || loading}
                className="w-full bg-pastel-blue-dark text-white py-3 rounded-xl font-medium hover:bg-pastel-blue transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-pastel-blue hover:scale-105"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 text-center">
                Enter the 6-digit OTP sent to +91 {phone}
              </p>
              
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 bg-pastel-blue-light border border-pastel-blue rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue-dark text-center text-lg font-medium tracking-widest"
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={!otp || otp.length !== 6 || loading}
                className="w-full bg-pastel-green-dark text-white py-3 rounded-xl font-medium hover:bg-pastel-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-pastel-green hover:scale-105"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-pastel-blue-dark hover:text-pastel-blue font-medium"
              >
                Change Phone Number
              </button>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-pastel-orange-light border border-pastel-orange rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-orange-dark text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Birth Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-pastel-lemon-light border border-pastel-lemon rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-lemon-dark text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-pastel-purple-light border border-pastel-purple rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-purple-dark text-slate-600 font-medium"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompleteProfile}
                disabled={!name || !birthDate || !gender || loading}
                className="w-full bg-pastel-pink-dark text-white py-3 rounded-xl font-medium hover:bg-pastel-pink transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-pastel-pink hover:scale-105"
              >
                {loading ? 'Creating Account...' : 'Complete Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}