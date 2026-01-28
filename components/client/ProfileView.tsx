'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Camera, Save, CreditCard, Shield, Ruler, Scale, Building2, AlertCircle, Lock, Eye, EyeOff, Upload, CheckCircle, Bell, Globe, Moon, Sun, FileText, X, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ProfileViewProps {
    profile: any;
}

type TabType = 'personal' | 'address' | 'bank' | 'kyc' | 'security' | 'preferences';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function ProfileView({ profile }: ProfileViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        // Personal Info
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        dob: profile?.dob || '',
        blood_group: profile?.blood_group || '',
        gender: profile?.gender || '',
        height_cm: profile?.height_cm || '',
        weight_kg: profile?.weight_kg || '',
        emergency_contact: profile?.emergency_contact || '',
        // Address
        address_line1: profile?.address_line1 || '',
        address_line2: profile?.address_line2 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        pincode: profile?.pincode || '',
        landmark: profile?.landmark || '',
        // Bank Details
        bank_holder_name: profile?.bank_holder_name || '',
        bank_account_number: profile?.bank_account_number || '',
        bank_confirm_account: profile?.bank_account_number || '',
        bank_ifsc: profile?.bank_ifsc || '',
        bank_name: profile?.bank_name || '',
        bank_branch: profile?.bank_branch || '',
        account_type: profile?.account_type || 'savings',
        // KYC
        aadhaar_number: profile?.aadhaar_number || '',
        pan_number: profile?.pan_number || '',
        // Security
        current_password: '',
        new_password: '',
        confirm_password: '',
        two_factor_enabled: profile?.two_factor_enabled || true,
        // Preferences
        email_service_updates: true,
        email_reimbursement: true,
        email_wallet: true,
        email_renewal: true,
        email_promo: false,
        email_newsletter: false,
        sms_critical: true,
        sms_wallet: true,
        sms_appointments: true,
        sms_promo: false,
        language: 'english',
        theme: 'light',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Mock uploaded documents
    const [documents, setDocuments] = useState({
        aadhaar_front: { name: 'aadhaar_front.jpg', size: '1.5 MB', verified: true },
        aadhaar_back: { name: 'aadhaar_back.jpg', size: '1.3 MB', verified: true },
        pan_card: { name: 'pan_card.jpg', size: '850 KB', verified: true },
        cancelled_cheque: null as { name: string; size: string; verified: boolean } | null,
    });

    // Mock login history
    const loginHistory = [
        { device: 'Windows - Chrome', time: 'Jan 28, 2026 10:30 AM', current: true },
        { device: 'Android - Mobile App', time: 'Jan 27, 2026 08:15 PM', current: false },
        { device: 'Windows - Chrome', time: 'Jan 26, 2026 02:45 PM', current: false },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: newValue });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Personal validation
        if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';

        // Address validation
        if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

        // Bank validation
        if (formData.bank_account_number !== formData.bank_confirm_account) {
            newErrors.bank_confirm_account = 'Account numbers do not match';
        }
        if (formData.bank_ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank_ifsc.toUpperCase())) {
            newErrors.bank_ifsc = 'Invalid IFSC code';
        }

        // KYC validation
        if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number.replace(/\s/g, ''))) {
            newErrors.aadhaar_number = 'Aadhaar must be 12 digits';
        }
        if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
            newErrors.pan_number = 'Invalid PAN format';
        }

        // Password validation
        if (formData.new_password && formData.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters';
        }
        if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors before saving');
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setLoading(false);
    };

    const formatAadhaar = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 12);
        const parts = cleaned.match(/.{1,4}/g) || [];
        return parts.join(' ');
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'bank', label: 'Bank Details', icon: Building2 },
        { id: 'kyc', label: 'KYC', icon: FileText },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Bell },
    ];

    const InputField = ({ label, name, type = 'text', required = false, disabled = false, placeholder = '', maxLength, icon: Icon, ...props }: any) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {Icon && <Icon size={14} className="text-slate-400" />}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={formData[name as keyof typeof formData] as string}
                onChange={handleChange}
                disabled={disabled || !isEditing}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all ${errors[name] ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
                {...props}
            />
            {errors[name] && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors[name]}
                </p>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-slate-500 text-sm">Manage your personal information and settings</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                        >
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                        {formData.full_name.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {isEditing && (
                        <button className="absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-sm">
                            <Camera size={14} />
                        </button>
                    )}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-xl font-bold text-slate-800">{formData.full_name || 'Guest User'}</h2>
                    <p className="text-slate-500">{formData.email}</p>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100 flex items-center gap-1">
                            <CheckCircle size={12} /> Verified
                        </span>
                        {formData.blood_group && (
                            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">
                                Blood: {formData.blood_group}
                            </span>
                        )}
                        {formData.height_cm && formData.weight_kg && (
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">
                                BMI: {(Number(formData.weight_kg) / Math.pow(Number(formData.height_cm) / 100, 2)).toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
                {isEditing && (
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                            Upload Photo
                        </button>
                        <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.id
                                    ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* TAB 1: Personal Information */}
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Name" name="full_name" required placeholder="Enter your full name" icon={User} />
                                <InputField label="Date of Birth" name="dob" type="date" required icon={Calendar} />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Gender <span className="text-red-500">*</span></label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Blood Group <span className="text-red-500">*</span></label>
                                    <select
                                        name="blood_group"
                                        value={formData.blood_group}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400" /> Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="10-digit mobile"
                                            maxLength={10}
                                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed ${errors.phone ? 'border-red-300' : 'border-slate-200'}`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-medium flex items-center gap-1">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" /> Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-medium flex items-center gap-1">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    </div>
                                </div>

                                <InputField label="Height (cm)" name="height_cm" type="number" placeholder="e.g., 175" icon={Ruler} />
                                <InputField label="Weight (kg)" name="weight_kg" type="number" placeholder="e.g., 72" icon={Scale} />

                                <div className="md:col-span-2">
                                    <InputField label="Emergency Contact" name="emergency_contact" type="tel" required placeholder="+91 9123456789" icon={Phone} maxLength={10} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Address Details */}
                    {activeTab === 'address' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Complete address with pincode is mandatory for services</p>
                                    <p className="text-xs text-amber-700 mt-1">All fields marked with * are required</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <InputField
                                    label="Address Line 1 (House/Flat No., Building)"
                                    name="address_line1"
                                    required
                                    placeholder="A-101, Sunrise Apartments"
                                />
                                <InputField
                                    label="Address Line 2 (Street/Area)"
                                    name="address_line2"
                                    required
                                    placeholder="SG Highway, Bodakdev"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="City" name="city" required placeholder="Ahmedabad" />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">State <span className="text-red-500">*</span></label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed ${errors.state ? 'border-red-300' : 'border-slate-200'}`}
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <InputField label="Pincode" name="pincode" required placeholder="380015" maxLength={6} />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Country</label>
                                    <input
                                        type="text"
                                        value="India"
                                        disabled
                                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <InputField label="Landmark" name="landmark" placeholder="Near Star Bazaar" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Bank Account Details */}
                    {activeTab === 'bank' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                <Building2 className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-blue-800">Bank details are required for wallet withdrawals. All mandatory fields must be filled.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Account Holder Name" name="bank_holder_name" required placeholder="As per bank records" />
                                <InputField label="Account Number" name="bank_account_number" required placeholder="Enter account number" />
                                <InputField label="Confirm Account Number" name="bank_confirm_account" required placeholder="Re-enter account number" />
                                <InputField label="IFSC Code" name="bank_ifsc" required placeholder="e.g., HDFC0001234" maxLength={11} />
                                <InputField label="Bank Name" name="bank_name" placeholder="Auto-filled from IFSC" />
                                <InputField label="Branch Name" name="bank_branch" placeholder="Branch name" />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Account Type</label>
                                    <select
                                        name="account_type"
                                        value={formData.account_type}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <option value="savings">Savings</option>
                                        <option value="current">Current</option>
                                    </select>
                                </div>
                            </div>

                            {/* Cancelled Cheque Upload */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">Upload Cancelled Cheque or Passbook (For verification)</label>
                                {isEditing ? (
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-teal-400 transition-colors cursor-pointer">
                                        <Upload className="mx-auto text-slate-400 mb-3" size={32} />
                                        <p className="text-slate-600 font-medium">Drag & drop file here or click to browse</p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                                    </div>
                                ) : documents.cancelled_cheque ? (
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-slate-400" size={20} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{documents.cancelled_cheque.name}</p>
                                                <p className="text-xs text-slate-500">{documents.cancelled_cheque.size}</p>
                                            </div>
                                        </div>
                                        {documents.cancelled_cheque.verified && (
                                            <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                                                <CheckCircle size={12} /> Verified
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No document uploaded</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: KYC Documents */}
                    {activeTab === 'kyc' && (
                        <div className="space-y-6">
                            {/* Aadhaar Section */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <CreditCard size={18} className="text-orange-500" /> Aadhaar Card
                                        <span className="text-red-500 text-sm">*</span>
                                    </h4>
                                    {documents.aadhaar_front && documents.aadhaar_back && (
                                        <span className="text-emerald-500 text-xs font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Aadhaar Number <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="aadhaar_number"
                                            value={formatAadhaar(formData.aadhaar_number)}
                                            onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value.replace(/\s/g, '') })}
                                            disabled={!isEditing}
                                            placeholder="XXXX XXXX 1234"
                                            maxLength={14}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-2">📄 Front Side</p>
                                            {documents.aadhaar_front ? (
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-slate-700">{documents.aadhaar_front.name} ({documents.aadhaar_front.size})</p>
                                                    <CheckCircle className="text-emerald-500" size={16} />
                                                </div>
                                            ) : (
                                                <button className="text-sm text-teal-600 hover:underline">Upload</button>
                                            )}
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-2">📄 Back Side</p>
                                            {documents.aadhaar_back ? (
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-slate-700">{documents.aadhaar_back.name} ({documents.aadhaar_back.size})</p>
                                                    <CheckCircle className="text-emerald-500" size={16} />
                                                </div>
                                            ) : (
                                                <button className="text-sm text-teal-600 hover:underline">Upload</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PAN Section */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <CreditCard size={18} className="text-blue-500" /> PAN Card
                                    </h4>
                                    {documents.pan_card && (
                                        <span className="text-emerald-500 text-xs font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">PAN Number</label>
                                        <input
                                            type="text"
                                            name="pan_number"
                                            value={formData.pan_number.toUpperCase()}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                                        />
                                    </div>

                                    <div className="p-4 bg-white rounded-lg border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-2">📄 PAN Card</p>
                                        {documents.pan_card ? (
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-700">{documents.pan_card.name} ({documents.pan_card.size})</p>
                                                <CheckCircle className="text-emerald-500" size={16} />
                                            </div>
                                        ) : (
                                            <button className="text-sm text-teal-600 hover:underline">Upload</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-sm text-amber-800 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <strong>⚠️ Aadhaar Card is mandatory for plan purchases and services</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Change Password */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Lock size={18} className="text-slate-600" /> Change Password
                                </h4>
                                <div className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Current Password <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="current_password"
                                                value={formData.current_password}
                                                onChange={handleChange}
                                                placeholder="••••••••••••"
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="New Password" name="new_password" type="password" required placeholder="••••••••••••" />
                                        <InputField label="Confirm Password" name="confirm_password" type="password" required placeholder="••••••••••••" />
                                    </div>
                                    <button className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            {/* 2FA Settings */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <Smartphone size={18} className="text-purple-600" /> Two-Factor Authentication (2FA)
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${formData.two_factor_enabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {formData.two_factor_enabled ? '● Enabled' : '○ Disabled'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-500" /> SMS OTP verification enabled for:
                                    </p>
                                    <ul className="ml-6 space-y-1 text-sm text-slate-600">
                                        <li>• Login from new device</li>
                                        <li>• Wallet withdrawals</li>
                                        <li>• Profile changes</li>
                                    </ul>
                                    <button className="mt-3 px-4 py-2 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
                                        Configure 2FA Settings
                                    </button>
                                </div>
                            </div>

                            {/* Login History */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Globe size={18} className="text-blue-600" /> Login History
                                </h4>
                                <div className="space-y-3">
                                    {loginHistory.map((login, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${login.current ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{login.device}</p>
                                                    <p className="text-xs text-slate-500">{login.time}</p>
                                                </div>
                                            </div>
                                            {login.current && (
                                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Current</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-4 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                    Logout All Devices
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: Preferences */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            {/* Email Notifications */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Mail size={18} className="text-blue-600" /> Email Notifications
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { name: 'email_service_updates', label: 'Service request updates' },
                                        { name: 'email_reimbursement', label: 'Reimbursement status changes' },
                                        { name: 'email_wallet', label: 'Wallet transactions' },
                                        { name: 'email_renewal', label: 'Plan renewal reminders' },
                                        { name: 'email_promo', label: 'Promotional offers' },
                                        { name: 'email_newsletter', label: 'Health tips and newsletters' },
                                    ].map(item => (
                                        <label key={item.name} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={item.name}
                                                checked={formData[item.name as keyof typeof formData] as boolean}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <span className="text-sm text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* SMS Notifications */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Phone size={18} className="text-green-600" /> SMS Notifications
                                </h4>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-not-allowed opacity-60">
                                        <input type="checkbox" checked disabled className="w-4 h-4 text-teal-600 rounded" />
                                        <span className="text-sm text-slate-700">Critical updates (cannot disable)</span>
                                    </label>
                                    {[
                                        { name: 'sms_wallet', label: 'Wallet withdrawals' },
                                        { name: 'sms_appointments', label: 'Appointment reminders' },
                                        { name: 'sms_promo', label: 'Promotional messages' },
                                    ].map(item => (
                                        <label key={item.name} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={item.name}
                                                checked={formData[item.name as keyof typeof formData] as boolean}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <span className="text-sm text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Language & Theme */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Globe size={18} className="text-purple-600" /> Language Preference
                                    </h4>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="english">English</option>
                                        <option value="hindi">Hindi</option>
                                        <option value="gujarati">Gujarati</option>
                                    </select>
                                </div>

                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        {formData.theme === 'dark' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-500" />}
                                        Display Settings
                                    </h4>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'light', label: 'Light Mode', icon: Sun },
                                            { value: 'dark', label: 'Dark Mode', icon: Moon },
                                            { value: 'auto', label: 'Auto (System)', icon: Globe },
                                        ].map(option => (
                                            <label key={option.value} className="flex-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    value={option.value}
                                                    checked={formData.theme === option.value}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                />
                                                <div className={`p-3 text-center rounded-lg border-2 transition-all ${formData.theme === option.value
                                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}>
                                                    <option.icon size={18} className="mx-auto mb-1" />
                                                    <p className="text-xs font-medium">{option.label}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
