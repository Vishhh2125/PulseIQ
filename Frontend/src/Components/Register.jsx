import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Stethoscope } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, registerDoctor, login, clearError, setError } from '../store/authSlice.js';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user'); // 'user' or 'doctor'
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [doctorClinicTiming, setDoctorClinicTiming] = useState([
    { day: 'monday', startTime: '09:00', endTime: '17:00' },
  ]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, error, isLoading } = useSelector((state) => state.auth);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    clearErrors: clearFormErrors,
  } = useForm({
    mode: 'onChange',
  });

  // Sync initial mode (login/register) and user type (patient/doctor) from URL query params
  useEffect(() => {
    const mode = searchParams.get('mode');
    const type = searchParams.get('type');

    if (mode === 'login') {
      setIsLogin(true);
    } else if (mode === 'register') {
      setIsLogin(false);
    }

    if (type === 'user' || type === 'doctor') {
      setUserType(type);
    }
  }, [searchParams]);

  // Clear errors when switching between login/register or user types
  useEffect(() => {
    clearFormErrors();
    dispatch(clearError());
    reset();
  }, [isLogin, userType, clearFormErrors, dispatch, reset]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return false;
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  };

  const onSubmit = async (data) => {
    try {
      // Clear previous errors
      clearFormErrors();
      dispatch(clearError());

      // Validation for login
      if (isLogin) {
        if (!data.email || !data.password) {
          dispatch(setError('Please fill in all required fields'));
          return;
        }

        if (!validateEmail(data.email)) {
          dispatch(setError('Please enter a valid email address'));
          return;
        }

        if (!validatePassword(data.password)) {
          dispatch(setError('Password must be at least 6 characters long'));
          return;
        }

        const payload = {
          email: data.email.trim(),
          password: data.password,
          rememberMe: data.rememberMe || false,
        };

        const result = await dispatch(login(payload));
        if (login.fulfilled.match(result)) {
          const loggedInUser = result.payload?.user;
          if (loggedInUser?.usertype === 'doctor') {
            navigate('/doctor/appointments', { replace: true });
          } else {
            navigate('/main', { replace: true });
          }
        } 
      } 
      // Validation for registration
      else {
        if (userType === 'user') {
          if (!data.name || !data.email || !data.password || !data.bloodGroup || !data.gender || !dateOfBirth) {
            dispatch(setError('Please fill in all required fields'));
            return;
          }

          if (!validateName(data.name)) {
            dispatch(setError('Name must be at least 2 characters long'));
            return;
          }

          if (!validateEmail(data.email)) {
            dispatch(setError('Please enter a valid email address'));
            return;
          }

          if (!validatePassword(data.password)) {
            dispatch(setError('Password must be at least 6 characters long'));
            return;
          }

          if (!validateDateOfBirth(dateOfBirth)) {
            dispatch(setError('Please enter a valid date of birth (age 13-120)'));
            return;
          }

          const payload = {
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
            bloodGroup: data.bloodGroup,
            gender: data.gender,
            dob: dateOfBirth,
          };
          console.log('Registering user with payload:', payload);
          const result = await dispatch(registerUser(payload));
          if (registerUser.fulfilled.match(result)) {
            const registeredUser = result.payload?.user;
            if (registeredUser?.usertype === 'doctor') {
              navigate('/doctor/appointments', { replace: true });
            } else {
              navigate('/main', { replace: true });
            }
          } 
        } else {
          // Doctor registration
          if (
            !data.username ||
            !data.email ||
            !data.password ||
            !data.specialization ||
            !data.licenseNumber ||
            !data.clinicAddress ||
            !data.consultationFee ||
            doctorClinicTiming.length === 0
          ) {
            dispatch(setError('Please fill in all required fields'));
            return;
          }

          if (!validateName(data.username)) {
            dispatch(setError('Username must be at least 2 characters long'));
            return;
          }

          if (!validateEmail(data.email)) {
            dispatch(setError('Please enter a valid email address'));
            return;
          }

          if (!validatePassword(data.password)) {
            dispatch(setError('Password must be at least 6 characters long'));
            return;
          }

          const clinicTimingIsValid = doctorClinicTiming.every((slot) =>
            Boolean(slot?.day?.trim()) &&
            Boolean(slot?.startTime?.trim()) &&
            Boolean(slot?.endTime?.trim())
          );
          if (!clinicTimingIsValid) {
            dispatch(setError('Please fill all clinic timing rows (day/start/end)'));
            return;
          }

          const payload = {
            username: data.username.trim(),
            email: data.email.trim(),
            password: data.password,
            specialization: data.specialization.trim(),
            licenseNumber: data.licenseNumber.trim(),
            experience: Number(data.experience || 0),
            // Backend expects an embedded object for clinicAddress.
            // For hackathon: store the full address in `street`.
            clinicAddress: { street: data.clinicAddress.trim() },
            clinicTiming: doctorClinicTiming.map((slot) => ({
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
            consultationFee: Number(data.consultationFee || 0),
            // Backend expects array of embedded objects: { degree, institution, year }
            qualifications: (data.qualifications || '')
              .split(',')
              .map((q) => q.trim())
              .filter(Boolean)
              .map((degree) => ({ degree })),
            bio: (data.bio || '').trim(),
          };

          console.log('Registering doctor with payload:', payload);

          const result = await dispatch(registerDoctor(payload));
          if (registerDoctor.fulfilled.match(result)) {
            const registeredDoctor = result.payload?.user;
            if (registeredDoctor?.usertype === 'doctor') {
              navigate('/doctor/appointments', { replace: true });
            } else {
              navigate('/main', { replace: true });
            }
          } 
        }
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
      dispatch(setError(error.message || 'An unexpected error occurred'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center items-center min-h-screen">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            {isLogin ? 'Login' : 'Register'}
          </h2>

          {/* Login Type Indicator */}
          {isLogin && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Login will automatically detect if you're a patient or doctor based on your email address.
              </p>
            </div>
          )}

          {/* User Type Selection (only for registration) */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                Register as:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="user"
                    checked={userType === 'user'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="text-blue-600"
                  />
                  <User size={16} />
                  <span>Patient</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="doctor"
                    checked={userType === 'doctor'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="text-blue-600"
                  />
                  <Stethoscope size={16} />
                  <span>Doctor</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!isLogin && userType === 'user' && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerField('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
          )}

          {!isLogin && userType === 'doctor' && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerField('username', {
                  required: 'Username is required',
                  minLength: { value: 2, message: 'Username must be at least 2 characters' },
                })}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                  errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="e.g., dr_smith"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...registerField('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                }
              })}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...registerField('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`w-full p-2 border rounded pr-10 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {!isLogin && userType === 'user' && (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {dateOfBirth && !validateDateOfBirth(dateOfBirth) && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid date of birth (age 13-120)</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerField('bloodGroup', { required: 'Blood group is required' })}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    errors.bloodGroup ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                >
                  <option value="">Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  {['male', 'female', 'other'].map((gender) => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="radio"
                        value={gender}
                        {...registerField('gender', { required: 'Gender is required' })}
                        className="mr-2"
                      />
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>
            </>
          )}

          {!isLogin && userType === 'doctor' && (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerField('specialization', { required: 'Specialization is required' })}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    errors.specialization ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {[
                    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
                    'Pediatrics', 'Psychiatry', 'Oncology', 'Gynecology',
                    'Urology', 'Ophthalmology', 'ENT', 'General Medicine',
                    'Emergency Medicine', 'Radiology', 'Pathology', 'Anesthesiology'
                  ].map((specialization) => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerField('licenseNumber', { required: 'License number is required' })}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    errors.licenseNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="e.g., LIC-2025-001"
                />
                {errors.licenseNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block mb-1 font-medium">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...registerField('experience')}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Consultation Fee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...registerField('consultationFee', { required: 'Consultation fee is required' })}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                      errors.consultationFee ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                    }`}
                    placeholder="e.g., 500"
                  />
                  {errors.consultationFee && (
                    <p className="text-red-500 text-sm mt-1">{errors.consultationFee.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Clinic Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...registerField('clinicAddress', {
                    required: 'Clinic address is required',
                    setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
                    validate: (v) =>
                      (typeof v === 'string' && v.trim().length > 0) || 'Clinic address is required',
                  })}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                    errors.clinicAddress ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  rows="3"
                  placeholder="e.g., 123 Main St, Mumbai, Maharashtra"
                />
                {errors.clinicAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.clinicAddress.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Clinic Timing <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {doctorClinicTiming.map((slot, idx) => (
                    <div key={`${slot.day}-${idx}`} className="grid grid-cols-3 gap-2">
                      <select
                        value={slot.day}
                        onChange={(e) => {
                          const next = [...doctorClinicTiming];
                          next[idx] = { ...next[idx], day: e.target.value };
                          setDoctorClinicTiming(next);
                        }}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {[
                          { value: 'monday', label: 'Monday' },
                          { value: 'tuesday', label: 'Tuesday' },
                          { value: 'wednesday', label: 'Wednesday' },
                          { value: 'thursday', label: 'Thursday' },
                          { value: 'friday', label: 'Friday' },
                          { value: 'saturday', label: 'Saturday' },
                          { value: 'sunday', label: 'Sunday' },
                        ].map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const next = [...doctorClinicTiming];
                          next[idx] = { ...next[idx], startTime: e.target.value };
                          setDoctorClinicTiming(next);
                        }}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const next = [...doctorClinicTiming];
                          next[idx] = { ...next[idx], endTime: e.target.value };
                          setDoctorClinicTiming(next);
                        }}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDoctorClinicTiming((prev) => [
                          ...prev,
                          { day: 'monday', startTime: '09:00', endTime: '17:00' },
                        ])
                      }
                      className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Add timing
                    </button>
                    {doctorClinicTiming.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDoctorClinicTiming((prev) => prev.slice(0, -1))}
                        className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Remove last
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Qualifications
                </label>
                <input
                  type="text"
                  {...registerField('qualifications')}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., MBBS, MD - Cardiology"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated (e.g., MBBS, MD - Cardiology)</p>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Bio
                </label>
                <textarea
                  {...registerField('bio')}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows="3"
                  placeholder="Short bio for patients (optional)"
                />
              </div>
            </>
          )}

          {isLogin && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...registerField('rememberMe')}
                  className="mr-2"
                />
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded font-medium transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : `Register as ${userType === 'user' ? 'Patient' : 'Doctor'}`)}
          </button>

          <p className="mt-4 text-center">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
