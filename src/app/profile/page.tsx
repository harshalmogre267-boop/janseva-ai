'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';
import { indianStates } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import type { UserProfile } from '@/lib/mock-data';
import { 
  User, 
  MapPin, 
  IndianRupee, 
  GraduationCap, 
  Settings2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  HeartHandshake,
  Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'location', title: 'Location Details', icon: MapPin },
  { id: 'economic', title: 'Socio-Economic Info', icon: IndianRupee },
  { id: 'education', title: 'Education & Career', icon: GraduationCap },
  { id: 'preferences', title: 'Preferences', icon: Settings2 },
];

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>(() => user || {
    id: '', phone: '', name: '', email: '', dateOfBirth: '1995-01-01',
    gender: 'male', category: 'general', state: '',
    district: '', annualIncome: 0, occupation: '', educationLevel: 'secondary',
    isDisabled: false, isMinority: false, isBpl: false, isFarmer: false,
    isStudent: false, preferredLanguage: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-surface-400 text-sm">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
  };

  const handleToggle = (field: 'isDisabled' | 'isMinority' | 'isBpl' | 'isFarmer' | 'isStudent') => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    setSaveSuccess(false);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateProfile(formData);
    setLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">
              Your Profile Settings
            </h1>
            <p className="text-surface-400 mt-1 text-sm sm:text-base">
              Keep your profile updated to get precise scheme eligibility matches.
            </p>
          </div>

          {/* Stepper Navigation */}
          <div className="hidden sm:flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => setActiveStep(index)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-saffron-500/15 text-saffron-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-surface-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                      isActive 
                        ? 'bg-saffron-500 text-white shadow-lg shadow-saffron-500/25' 
                        : isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-white/5 text-surface-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : index + 1}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap hidden lg:inline">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="h-px bg-white/10 flex-1 mx-2 sm:mx-4" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Stepper Header */}
          <div className="sm:hidden bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-saffron-500 text-white flex items-center justify-center font-bold">
                {activeStep + 1}
              </div>
              <div>
                <p className="text-xs text-surface-400">Step {activeStep + 1} of {steps.length}</p>
                <p className="text-sm font-semibold text-white">{steps[activeStep].title}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-saffron-400 bg-saffron-500/10 px-2.5 py-1 rounded-full">
              {Math.round(((activeStep + 1) / steps.length) * 100)}% Done
            </span>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Step 1: Personal Details */}
                {activeStep === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="E.g., Rajesh Kumar"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="E.g., +91 99999 99999"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Date of Birth</label>
                      <div className="flex gap-2">
                        <motion.select
                          whileHover={{ scale: 1.02, y: -2 }}
                          value={formData.dateOfBirth?.split('-')[2] || '01'}
                          onChange={(e) => {
                            const [y, m] = (formData.dateOfBirth || '1995-01-01').split('-');
                            handleInputChange('dateOfBirth', `${y}-${m}-${e.target.value.padStart(2, '0')}`);
                          }}
                          className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-2 sm:px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 focus:ring-1 focus:ring-saffron-500/40 transition-all text-sm cursor-pointer hover:bg-white/10 appearance-none text-center"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d} className="bg-surface-950 text-left">{d}</option>
                          ))}
                        </motion.select>
                        
                        <motion.select
                          whileHover={{ scale: 1.02, y: -2 }}
                          value={formData.dateOfBirth?.split('-')[1] || '01'}
                          onChange={(e) => {
                            const [y, , d] = (formData.dateOfBirth || '1995-01-01').split('-');
                            handleInputChange('dateOfBirth', `${y}-${e.target.value.padStart(2, '0')}-${d}`);
                          }}
                          className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-2 sm:px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 focus:ring-1 focus:ring-saffron-500/40 transition-all text-sm cursor-pointer hover:bg-white/10 appearance-none text-center"
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                            <option key={m} value={i + 1} className="bg-surface-950 text-left">{m}</option>
                          ))}
                        </motion.select>

                        <motion.select
                          whileHover={{ scale: 1.02, y: -2 }}
                          value={formData.dateOfBirth?.split('-')[0] || '1995'}
                          onChange={(e) => {
                            const [, m, d] = (formData.dateOfBirth || '1995-01-01').split('-');
                            handleInputChange('dateOfBirth', `${e.target.value}-${m}-${d}`);
                          }}
                          className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-2 sm:px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 focus:ring-1 focus:ring-saffron-500/40 transition-all text-sm cursor-pointer hover:bg-white/10 appearance-none text-center"
                        >
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y} className="bg-surface-950 text-left">{y}</option>
                          ))}
                        </motion.select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['male', 'female', 'other'].map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => handleInputChange('gender', gender)}
                            className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                              formData.gender === gender
                                ? 'bg-saffron-500/15 border-saffron-500/40 text-saffron-400'
                                : 'bg-white/5 border-white/10 text-surface-400 hover:text-white'
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location Details */}
                {activeStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">State of Residence</label>
                      <select
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      >
                        <option value="" disabled>Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">District</label>
                      <input
                        type="text"
                        required
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        placeholder="E.g., Lucknow"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Socio-Economic Information */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Annual Family Income (INR)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-surface-400 text-sm">₹</span>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formData.annualIncome}
                            onChange={(e) => handleInputChange('annualIncome', Number(e.target.value))}
                            placeholder="Annual income in Rupees"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                          />
                        </div>
                        <p className="text-[10px] text-surface-500 mt-1.5">Note: Used to determine income limit eligibility.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Social Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                        >
                          <option value="general">General</option>
                          <option value="obc">OBC (Other Backward Classes)</option>
                          <option value="sc">SC (Scheduled Caste)</option>
                          <option value="st">ST (Scheduled Tribe)</option>
                          <option value="ews">EWS (Economically Weaker Section)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-5">
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-saffron-400" /> Additional Demographics
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { field: 'isBpl' as const, label: 'Below Poverty Line (BPL) Card Holder', desc: 'Check if you hold a valid BPL/Ration card' },
                           { field: 'isDisabled' as const, label: 'Person with Disability (Divyangjan)', desc: 'Check if you have any certified physical disability' },
                           { field: 'isMinority' as const, label: 'Minority Community Member', desc: 'Muslim, Christian, Sikh, Buddhist, Jain, or Parsi' },
                         ].map((dem) => (
                           <div 
                             key={dem.field}
                             onClick={() => handleToggle(dem.field)}
                             className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                               formData[dem.field]
                                 ? 'bg-saffron-500/10 border-saffron-500/30'
                                 : 'bg-white/5 border-white/10 hover:border-white/20'
                             }`}
                           >
                             <input
                               type="checkbox"
                               checked={formData[dem.field]}
                               onChange={() => {}}
                               className="mt-0.5 w-4 h-4 rounded border-white/10 text-saffron-500 focus:ring-saffron-500/40 bg-surface-950"
                             />
                             <div>
                               <p className="text-xs font-semibold text-white leading-tight">{dem.label}</p>
                               <p className="text-[10px] text-surface-400 mt-1 leading-normal">{dem.desc}</p>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Education & Career */}
                {activeStep === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Highest Education Level</label>
                      <select
                        required
                        value={formData.educationLevel}
                        onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                        className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      >
                        <option value="none">No formal education</option>
                        <option value="primary">Primary Schooling (up to 8th standard)</option>
                        <option value="secondary">High School / Senior Secondary (10th/12th)</option>
                        <option value="graduate">Undergraduate Degree (Bachelor&apos;s)</option>
                        <option value="postgraduate">Postgraduate Degree (Master&apos;s / Ph.D.)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">Current Occupation</label>
                      <input
                        type="text"
                        required
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="E.g., Farmer, Student, Unemployed, Shopkeeper"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2 border-t border-white/10 pt-5">
                      <h4 className="text-sm font-semibold text-white mb-4">Employment Status Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { field: 'isFarmer' as const, label: 'Registered Farmer / Land Owner', desc: 'Identify as a farmer with valid land/kisan documents' },
                           { field: 'isStudent' as const, label: 'Currently Enrolled Student', desc: 'Actively studying in school, college, or university' },
                         ].map((emp) => (
                           <div 
                             key={emp.field}
                             onClick={() => handleToggle(emp.field)}
                             className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                               formData[emp.field]
                                 ? 'bg-saffron-500/10 border-saffron-500/30'
                                 : 'bg-white/5 border-white/10 hover:border-white/20'
                             }`}
                           >
                             <input
                               type="checkbox"
                               checked={formData[emp.field]}
                               onChange={() => {}}
                               className="mt-0.5 w-4 h-4 rounded border-white/10 text-saffron-500 focus:ring-saffron-500/40 bg-surface-950"
                             />
                             <div>
                               <p className="text-xs font-semibold text-white leading-tight">{emp.label}</p>
                               <p className="text-[10px] text-surface-400 mt-1 leading-normal">{emp.desc}</p>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Preferences & Summary */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Preferred UI & Chat Language</label>
                        <select
                          value={formData.preferredLanguage}
                          onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                          className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saffron-500/40 transition-all text-sm"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                          <option value="ta">தமிழ் (Tamil)</option>
                          <option value="te">తెలుగు (Telugu)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                          <option value="mr">मराठी (Marathi)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Profile Summary Checklist</h4>
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-surface-300">
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>Name</span>
                          <span className="text-white font-medium truncate max-w-[150px]">{formData.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>State</span>
                          <span className="text-white font-medium">{formData.state}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>Annual Income</span>
                          <span className="text-white font-medium">₹{formData.annualIncome.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>Category</span>
                          <span className="text-white font-medium uppercase">{formData.category}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>Farmer status</span>
                          <span className={`${formData.isFarmer ? 'text-emerald-400' : 'text-surface-500'} font-semibold`}>
                            {formData.isFarmer ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span>Student status</span>
                          <span className={`${formData.isStudent ? 'text-emerald-400' : 'text-surface-500'} font-semibold`}>
                            {formData.isStudent ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Success popup inline */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 left-4 right-4 bg-emerald-500/90 text-white p-3 rounded-xl flex items-center justify-center gap-2 shadow-xl backdrop-blur-sm z-20 text-sm font-semibold"
                >
                  <CheckCircle2 className="w-5 h-5" /> Profile successfully updated and saved!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-white/10 mt-8 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeStep === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-semibold text-sm rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-saffron-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </main>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
}
