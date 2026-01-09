'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    MapPin,
    User,
    Briefcase,
    Heart,
    Activity,
    Camera,
    Sparkles,
    Loader2,
    ArrowLeft,
    X,
    Plus
} from 'lucide-react';
import { LocationPicker } from '@/components/ui/LocationMap'; // Ensure this component exists and handles map logic

// --- Types ---
interface Lifestyle {
    smoking: string;
    drinking: string;
    workout: string;
    diet: string;
    pets: string;
}

interface OnboardingData {
    // Basic Info
    name: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;

    // Interests
    interests: string[];

    // Physical & Preferences
    height: string;
    weight: string;
    relationshipGoal: string;
    preferences: {
        ageRange: { min: number; max: number };
        gender: string;
        distance: number;
    };

    // Lifestyle
    lifestyle: Lifestyle;

    // Location
    location: {
        type: string;
        coordinates: [number, number];
    } | null;
    address?: string;

    // Career & About
    jobTitle: string;
    // ... (skip lines to match context if needed, or just focus on the interface part first if too far apart)
    // Actually I can do 2 separate chunks or one large one if contiguous. Interface is top, LocationSection is middle.
    // I will use multi_replace.
    company: string;
    educationLevel: string;
    university: string;
    bio: string;

    // Photos
    photos: string[];
}

const steps = [
    { id: 'basic', title: 'Basic Info', icon: User, completed: false },
    { id: 'interests', title: 'Interests', icon: Heart, completed: false },
    { id: 'physical', title: 'Physical & Preferences', icon: Activity, completed: false },
    { id: 'lifestyle', title: 'Lifestyle', icon: Sparkles, completed: false },
    { id: 'location', title: 'Location', icon: MapPin, completed: false },
    { id: 'career', title: 'Career & About', icon: Briefcase, completed: false },
    { id: 'photos', title: 'Photos', icon: Camera, completed: false },
];

const interestOptions = [
    { label: 'Travel', icon: '✈️' },
    { label: 'Music', icon: '🎵' },
    { label: 'Movies', icon: '🎬' },
    { label: 'Sports', icon: '⚽' },
    { label: 'Reading', icon: '📚' },
    { label: 'Cooking', icon: '👨‍🍳' },
    { label: 'Art', icon: '🎨' },
    { label: 'Photography', icon: '📸' },
    { label: 'Dancing', icon: '💃' },
    { label: 'Hiking', icon: '🥾' },
    { label: 'Gaming', icon: '🎮' },
    { label: 'Fitness', icon: '💪' },
    { label: 'Fashion', icon: '👗' },
    { label: 'Technology', icon: '💻' },
    { label: 'Food', icon: '🍕' },
    { label: 'Animals', icon: '🐕' },
    { label: 'Yoga', icon: '🧘' },
    { label: 'Coffee', icon: '☕' },
    { label: 'Wine', icon: '🍷' },
    { label: 'Beach', icon: '🏖️' },
];

const countryCodes = [
    { code: '+93', country: 'AF', name: 'Afghanistan' },
    { code: '+355', country: 'AL', name: 'Albania' },
    { code: '+213', country: 'DZ', name: 'Algeria' },
    { code: '+1', country: 'AS', name: 'American Samoa' },
    { code: '+376', country: 'AD', name: 'Andorra' },
    { code: '+244', country: 'AO', name: 'Angola' },
    { code: '+1', country: 'AI', name: 'Anguilla' },
    { code: '+1', country: 'AG', name: 'Antigua & Barbuda' },
    { code: '+54', country: 'AR', name: 'Argentina' },
    { code: '+374', country: 'AM', name: 'Armenia' },
    { code: '+297', country: 'AW', name: 'Aruba' },
    { code: '+61', country: 'AU', name: 'Australia' },
    { code: '+43', country: 'AT', name: 'Austria' },
    { code: '+994', country: 'AZ', name: 'Azerbaijan' },
    { code: '+1', country: 'BS', name: 'Bahamas' },
    { code: '+973', country: 'BH', name: 'Bahrain' },
    { code: '+880', country: 'BD', name: 'Bangladesh' },
    { code: '+1', country: 'BB', name: 'Barbados' },
    { code: '+375', country: 'BY', name: 'Belarus' },
    { code: '+32', country: 'BE', name: 'Belgium' },
    { code: '+501', country: 'BZ', name: 'Belize' },
    { code: '+229', country: 'BJ', name: 'Benin' },
    { code: '+1', country: 'BM', name: 'Bermuda' },
    { code: '+975', country: 'BT', name: 'Bhutan' },
    { code: '+591', country: 'BO', name: 'Bolivia' },
    { code: '+387', country: 'BA', name: 'Bosnia & Herzegovina' },
    { code: '+267', country: 'BW', name: 'Botswana' },
    { code: '+55', country: 'BR', name: 'Brazil' },
    { code: '+1', country: 'VG', name: 'British Virgin Islands' },
    { code: '+673', country: 'BN', name: 'Brunei' },
    { code: '+359', country: 'BG', name: 'Bulgaria' },
    { code: '+226', country: 'BF', name: 'Burkina Faso' },
    { code: '+257', country: 'BI', name: 'Burundi' },
    { code: '+855', country: 'KH', name: 'Cambodia' },
    { code: '+237', country: 'CM', name: 'Cameroon' },
    { code: '+1', country: 'CA', name: 'Canada' },
    { code: '+238', country: 'CV', name: 'Cape Verde' },
    { code: '+1', country: 'KY', name: 'Cayman Islands' },
    { code: '+236', country: 'CF', name: 'Central African Republic' },
    { code: '+235', country: 'TD', name: 'Chad' },
    { code: '+56', country: 'CL', name: 'Chile' },
    { code: '+86', country: 'CN', name: 'China' },
    { code: '+57', country: 'CO', name: 'Colombia' },
    { code: '+269', country: 'KM', name: 'Comoros' },
    { code: '+242', country: 'CG', name: 'Congo - Brazzaville' },
    { code: '+243', country: 'CD', name: 'Congo - Kinshasa' },
    { code: '+682', country: 'CK', name: 'Cook Islands' },
    { code: '+506', country: 'CR', name: 'Costa Rica' },
    { code: '+385', country: 'HR', name: 'Croatia' },
    { code: '+53', country: 'CU', name: 'Cuba' },
    { code: '+599', country: 'CW', name: 'Curaçao' },
    { code: '+357', country: 'CY', name: 'Cyprus' },
    { code: '+420', country: 'CZ', name: 'Czechia' },
    { code: '+225', country: 'CI', name: 'Côte d’Ivoire' },
    { code: '+45', country: 'DK', name: 'Denmark' },
    { code: '+253', country: 'DJ', name: 'Djibouti' },
    { code: '+1', country: 'DM', name: 'Dominica' },
    { code: '+1', country: 'DO', name: 'Dominican Republic' },
    { code: '+593', country: 'EC', name: 'Ecuador' },
    { code: '+20', country: 'EG', name: 'Egypt' },
    { code: '+503', country: 'SV', name: 'El Salvador' },
    { code: '+240', country: 'GQ', name: 'Equatorial Guinea' },
    { code: '+291', country: 'ER', name: 'Eritrea' },
    { code: '+372', country: 'EE', name: 'Estonia' },
    { code: '+251', country: 'ET', name: 'Ethiopia' },
    { code: '+500', country: 'FK', name: 'Falkland Islands' },
    { code: '+298', country: 'FO', name: 'Faroe Islands' },
    { code: '+679', country: 'FJ', name: 'Fiji' },
    { code: '+358', country: 'FI', name: 'Finland' },
    { code: '+33', country: 'FR', name: 'France' },
    { code: '+594', country: 'GF', name: 'French Guiana' },
    { code: '+689', country: 'PF', name: 'French Polynesia' },
    { code: '+241', country: 'GA', name: 'Gabon' },
    { code: '+220', country: 'GM', name: 'Gambia' },
    { code: '+995', country: 'GE', name: 'Georgia' },
    { code: '+49', country: 'DE', name: 'Germany' },
    { code: '+233', country: 'GH', name: 'Ghana' },
    { code: '+350', country: 'GI', name: 'Gibraltar' },
    { code: '+30', country: 'GR', name: 'Greece' },
    { code: '+299', country: 'GL', name: 'Greenland' },
    { code: '+1', country: 'GD', name: 'Grenada' },
    { code: '+590', country: 'GP', name: 'Guadeloupe' },
    { code: '+1', country: 'GU', name: 'Guam' },
    { code: '+502', country: 'GT', name: 'Guatemala' },
    { code: '+224', country: 'GN', name: 'Guinea' },
    { code: '+245', country: 'GW', name: 'Guinea-Bissau' },
    { code: '+592', country: 'GY', name: 'Guyana' },
    { code: '+509', country: 'HT', name: 'Haiti' },
    { code: '+504', country: 'HN', name: 'Honduras' },
    { code: '+852', country: 'HK', name: 'Hong Kong SAR China' },
    { code: '+36', country: 'HU', name: 'Hungary' },
    { code: '+354', country: 'IS', name: 'Iceland' },
    { code: '+91', country: 'IN', name: 'India' },
    { code: '+62', country: 'ID', name: 'Indonesia' },
    { code: '+98', country: 'IR', name: 'Iran' },
    { code: '+964', country: 'IQ', name: 'Iraq' },
    { code: '+353', country: 'IE', name: 'Ireland' },
    { code: '+972', country: 'IL', name: 'Israel' },
    { code: '+39', country: 'IT', name: 'Italy' },
    { code: '+1', country: 'JM', name: 'Jamaica' },
    { code: '+81', country: 'JP', name: 'Japan' },
    { code: '+962', country: 'JO', name: 'Jordan' },
    { code: '+7', country: 'KZ', name: 'Kazakhstan' },
    { code: '+254', country: 'KE', name: 'Kenya' },
    { code: '+686', country: 'KI', name: 'Kiribati' },
    { code: '+965', country: 'KW', name: 'Kuwait' },
    { code: '+996', country: 'KG', name: 'Kyrgyzstan' },
    { code: '+856', country: 'LA', name: 'Laos' },
    { code: '+371', country: 'LV', name: 'Latvia' },
    { code: '+961', country: 'LB', name: 'Lebanon' },
    { code: '+266', country: 'LS', name: 'Lesotho' },
    { code: '+231', country: 'LR', name: 'Liberia' },
    { code: '+218', country: 'LY', name: 'Libya' },
    { code: '+423', country: 'LI', name: 'Liechtenstein' },
    { code: '+370', country: 'LT', name: 'Lithuania' },
    { code: '+352', country: 'LU', name: 'Luxembourg' },
    { code: '+853', country: 'MO', name: 'Macau SAR China' },
    { code: '+389', country: 'MK', name: 'Macedonia' },
    { code: '+261', country: 'MG', name: 'Madagascar' },
    { code: '+265', country: 'MW', name: 'Malawi' },
    { code: '+60', country: 'MY', name: 'Malaysia' },
    { code: '+960', country: 'MV', name: 'Maldives' },
    { code: '+223', country: 'ML', name: 'Mali' },
    { code: '+356', country: 'MT', name: 'Malta' },
    { code: '+692', country: 'MH', name: 'Marshall Islands' },
    { code: '+596', country: 'MQ', name: 'Martinique' },
    { code: '+222', country: 'MR', name: 'Mauritania' },
    { code: '+230', country: 'MU', name: 'Mauritius' },
    { code: '+262', country: 'YT', name: 'Mayotte' },
    { code: '+52', country: 'MX', name: 'Mexico' },
    { code: '+691', country: 'FM', name: 'Micronesia' },
    { code: '+373', country: 'MD', name: 'Moldova' },
    { code: '+377', country: 'MC', name: 'Monaco' },
    { code: '+976', country: 'MN', name: 'Mongolia' },
    { code: '+382', country: 'ME', name: 'Montenegro' },
    { code: '+1', country: 'MS', name: 'Montserrat' },
    { code: '+212', country: 'MA', name: 'Morocco' },
    { code: '+258', country: 'MZ', name: 'Mozambique' },
    { code: '+95', country: 'MM', name: 'Myanmar (Burma)' },
    { code: '+264', country: 'NA', name: 'Namibia' },
    { code: '+674', country: 'NR', name: 'Nauru' },
    { code: '+977', country: 'NP', name: 'Nepal' },
    { code: '+31', country: 'NL', name: 'Netherlands' },
    { code: '+687', country: 'NC', name: 'New Caledonia' },
    { code: '+64', country: 'NZ', name: 'New Zealand' },
    { code: '+505', country: 'NI', name: 'Nicaragua' },
    { code: '+227', country: 'NE', name: 'Niger' },
    { code: '+234', country: 'NG', name: 'Nigeria' },
    { code: '+683', country: 'NU', name: 'Niue' },
    { code: '+672', country: 'NF', name: 'Norfolk Island' },
    { code: '+850', country: 'KP', name: 'North Korea' },
    { code: '+1', country: 'MP', name: 'Northern Mariana Islands' },
    { code: '+47', country: 'NO', name: 'Norway' },
    { code: '+968', country: 'OM', name: 'Oman' },
    { code: '+92', country: 'PK', name: 'Pakistan' },
    { code: '+680', country: 'PW', name: 'Palau' },
    { code: '+970', country: 'PS', name: 'Palestinian Territories' },
    { code: '+507', country: 'PA', name: 'Panama' },
    { code: '+675', country: 'PG', name: 'Papua New Guinea' },
    { code: '+595', country: 'PY', name: 'Paraguay' },
    { code: '+51', country: 'PE', name: 'Peru' },
    { code: '+63', country: 'PH', name: 'Philippines' },
    { code: '+48', country: 'PL', name: 'Poland' },
    { code: '+351', country: 'PT', name: 'Portugal' },
    { code: '+1', country: 'PR', name: 'Puerto Rico' },
    { code: '+974', country: 'QA', name: 'Qatar' },
    { code: '+40', country: 'RO', name: 'Romania' },
    { code: '+7', country: 'RU', name: 'Russia' },
    { code: '+250', country: 'RW', name: 'Rwanda' },
    { code: '+262', country: 'RE', name: 'Réunion' },
    { code: '+685', country: 'WS', name: 'Samoa' },
    { code: '+378', country: 'SM', name: 'San Marino' },
    { code: '+966', country: 'SA', name: 'Saudi Arabia' },
    { code: '+221', country: 'SN', name: 'Senegal' },
    { code: '+381', country: 'RS', name: 'Serbia' },
    { code: '+248', country: 'SC', name: 'Seychelles' },
    { code: '+232', country: 'SL', name: 'Sierra Leone' },
    { code: '+65', country: 'SG', name: 'Singapore' },
    { code: '+1', country: 'SX', name: 'Sint Maarten' },
    { code: '+421', country: 'SK', name: 'Slovakia' },
    { code: '+386', country: 'SI', name: 'Slovenia' },
    { code: '+677', country: 'SB', name: 'Solomon Islands' },
    { code: '+252', country: 'SO', name: 'Somalia' },
    { code: '+27', country: 'ZA', name: 'South Africa' },
    { code: '+82', country: 'KR', name: 'South Korea' },
    { code: '+211', country: 'SS', name: 'South Sudan' },
    { code: '+34', country: 'ES', name: 'Spain' },
    { code: '+94', country: 'LK', name: 'Sri Lanka' },
    { code: '+249', country: 'SD', name: 'Sudan' },
    { code: '+597', country: 'SR', name: 'Suriname' },
    { code: '+46', country: 'SE', name: 'Sweden' },
    { code: '+41', country: 'CH', name: 'Switzerland' },
    { code: '+963', country: 'SY', name: 'Syria' },
    { code: '+886', country: 'TW', name: 'Taiwan' },
    { code: '+992', country: 'TJ', name: 'Tajikistan' },
    { code: '+255', country: 'TZ', name: 'Tanzania' },
    { code: '+66', country: 'TH', name: 'Thailand' },
    { code: '+670', country: 'TL', name: 'Timor-Leste' },
    { code: '+228', country: 'TG', name: 'Togo' },
    { code: '+690', country: 'TK', name: 'Tokelau' },
    { code: '+676', country: 'TO', name: 'Tonga' },
    { code: '+1', country: 'TT', name: 'Trinidad & Tobago' },
    { code: '+216', country: 'TN', name: 'Tunisia' },
    { code: '+90', country: 'TR', name: 'Turkey' },
    { code: '+993', country: 'TM', name: 'Turkmenistan' },
    { code: '+1', country: 'TC', name: 'Turks & Caicos Islands' },
    { code: '+688', country: 'TV', name: 'Tuvalu' },
    { code: '+1', country: 'VI', name: 'U.S. Virgin Islands' },
    { code: '+256', country: 'UG', name: 'Uganda' },
    { code: '+380', country: 'UA', name: 'Ukraine' },
    { code: '+971', country: 'AE', name: 'United Arab Emirates' },
    { code: '+44', country: 'GB', name: 'United Kingdom' },
    { code: '+1', country: 'US', name: 'United States' },
    { code: '+598', country: 'UY', name: 'Uruguay' },
    { code: '+998', country: 'UZ', name: 'Uzbekistan' },
    { code: '+678', country: 'VU', name: 'Vanuatu' },
    { code: '+39', country: 'VA', name: 'Vatican City' },
    { code: '+58', country: 'VE', name: 'Venezuela' },
    { code: '+84', country: 'VN', name: 'Vietnam' },
    { code: '+681', country: 'WF', name: 'Wallis & Futuna' },
    { code: '+967', country: 'YE', name: 'Yemen' },
    { code: '+260', country: 'ZM', name: 'Zambia' },
    { code: '+263', country: 'ZW', name: 'Zimbabwe' },
];


const BasicInfo = ({
    data,
    setData,
    countryCodes,
    selectedCountryCode,
    setSelectedCountryCode
}: {
    data: OnboardingData;
    setData: any;
    countryCodes: any[];
    selectedCountryCode: string;
    setSelectedCountryCode: any;
}) => {
    let currentNumber = '';
    if (data.phoneNumber.startsWith(selectedCountryCode)) {
        currentNumber = data.phoneNumber.slice(selectedCountryCode.length);
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Full Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Birthday</label>
                    <input
                        type="date"
                        value={data.dateOfBirth}
                        onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Gender</label>
                <select
                    value={data.gender}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium appearance-none"
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                    <div className="w-[140px] flex-shrink-0">
                        <select
                            value={selectedCountryCode}
                            onChange={(e) => {
                                const newCode = e.target.value;
                                setSelectedCountryCode(newCode);
                                setData((prev: OnboardingData) => ({ ...prev, phoneNumber: `${newCode}${currentNumber}` }));
                            }}
                            className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium appearance-none truncate pr-8"
                        >
                            {countryCodes.map((c) => (
                                <option key={`${c.country}-${c.code}`} value={c.code}>
                                    {c.country} {c.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <input
                            type="tel"
                            value={currentNumber}
                            onChange={(e) => {
                                const num = e.target.value.replace(/[^0-9]/g, ''); // Numeric only
                                setData((prev: OnboardingData) => ({ ...prev, phoneNumber: `${selectedCountryCode}${num}` }));
                            }}
                            className="w-full p-4 bg-zinc-50 rounded-xl border-2 border-zinc-100 focus:border-pink-500 focus:ring-0 text-zinc-900 font-medium"
                            placeholder="1234567890"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 pl-1">Required for account verification</p>
            </div>
        </div>
    );
};

const Interests = ({ data, setData }: { data: OnboardingData; setData: any }) => (
    <div className="space-y-6">
        <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-900">What are you passionate about?</h2>
            <p className="text-zinc-500">Select up to 8 interests that represent you</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {interestOptions.map((option) => {
                const isSelected = data.interests.includes(option.label);
                return (
                    <button
                        key={option.label}
                        onClick={() => {
                            if (isSelected) {
                                setData({ ...data, interests: data.interests.filter((i) => i !== option.label) });
                            } else {
                                if (data.interests.length < 8) {
                                    setData({ ...data, interests: [...data.interests, option.label] });
                                }
                            }
                        }}
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border transition-all ${isSelected
                            ? 'border-pink-500 bg-pink-50 text-pink-600 font-semibold'
                            : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                            }`}
                    >
                        <span>{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

const PhysicalPreferences = ({ data, setData }: { data: OnboardingData; setData: any }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Height</label>
                <select
                    value={data.height}
                    onChange={(e) => setData({ ...data, height: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none text-zinc-900"
                >
                    <option value="">Select</option>
                    {Array.from({ length: 40 }, (_, i) => i + 140).map(cm => (
                        <option key={cm} value={`${cm} cm`}>{cm} cm</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Weight</label>
                <select
                    value={data.weight}
                    onChange={(e) => setData({ ...data, weight: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none text-zinc-900"
                >
                    <option value="">Select</option>
                    {Array.from({ length: 100 }, (_, i) => i + 40).map(kg => (
                        <option key={kg} value={`${kg} kg`}>{kg} kg</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-3">What are you looking for?</label>
            <div className="grid grid-cols-2 gap-3">
                {['Long-term relationship', 'Something casual', 'New friends', 'Still figuring it out'].map(goal => (
                    <button
                        key={goal}
                        onClick={() => setData({ ...data, relationshipGoal: goal })}
                        className={`p-4 rounded-xl border text-left transition-all ${data.relationshipGoal === goal
                            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white border-transparent shadow-lg shadow-pink-500/20'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                    >
                        <span className="font-medium text-sm">{goal}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const LifestyleSection = ({ data, setData }: { data: OnboardingData; setData: any }) => (
    <div className="space-y-6">
        <div className="text-center mb-6">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-900">Tell us about your lifestyle</h2>
            <p className="text-zinc-500">This helps us find compatible matches</p>
        </div>

        {[
            { key: 'smoking', label: 'Smoking', options: ['Never', 'Socially', 'Regularly', 'Trying to quit'], icon: '🚬' },
            { key: 'drinking', label: 'Drinking', options: ['Never', 'Socially', 'Regularly'], icon: '🍷' },
            { key: 'workout', label: 'Workout', options: ['Never', 'Sometimes', 'Regularly', 'Athlete'], icon: '💪' },
            { key: 'diet', label: 'Diet', options: ['None', 'Vegan', 'Vegetarian', 'Keto'], icon: '🥗' },
            { key: 'pets', label: 'Pets', options: ['No pets', 'Dog lover', 'Cat lover', 'Other'], icon: '🐾' }
        ].map((item) => (
            <div key={item.key}>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                    {item.icon} {item.label}
                </label>
                <select
                    value={(data.lifestyle as any)[item.key]}
                    onChange={(e) => setData({
                        ...data,
                        lifestyle: { ...data.lifestyle, [item.key]: e.target.value }
                    })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium appearance-none"
                >
                    <option value="">Select option</option>
                    {item.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        ))}
    </div>
);

const LocationSection = ({ data, setData }: { data: OnboardingData; setData: any }) => (
    <div className="space-y-6">
        <div className="text-center mb-6">
            <MapPin className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-900">Where are you located?</h2>
            <p className="text-zinc-500">We use this to find matches near you.</p>
        </div>
        <div className="h-64 rounded-2xl overflow-hidden border border-zinc-200">
            <LocationPicker
                currentLocation={data.location}
                currentAddress={data.address}
                onLocationSelect={(loc, addr) => setData({ ...data, location: loc, address: addr })}
            />
        </div>
        <p className="text-center text-xs text-zinc-400">
            Your exact location will not be shared with others.
        </p>
    </div>
);

const CareerSection = ({ data, setData }: { data: OnboardingData; setData: any }) => (
    <div className="space-y-6">
        <div className="text-center mb-6">
            <Briefcase className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-900">Tell us about yourself</h2>
            <p className="text-zinc-500">Your career, education, and a short bio</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Job Title</label>
                <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                    placeholder="Software Engineer"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Company</label>
                <input
                    type="text"
                    value={data.company}
                    onChange={(e) => setData({ ...data, company: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                    placeholder="Google"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Education Level</label>
                <select
                    value={data.educationLevel}
                    onChange={(e) => setData({ ...data, educationLevel: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                >
                    <option value="">Select</option>
                    <option value="High School">High School</option>
                    <option value="Undergrad">Undergrad</option>
                    <option value="Postgrad">Postgrad</option>
                    <option value="Doctorate">Doctorate</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">University / College</label>
                <input
                    type="text"
                    value={data.university}
                    onChange={(e) => setData({ ...data, university: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                    placeholder="Stanford University"
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Short Bio</label>
            <textarea
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                rows={4}
                className="w-full p-4 bg-zinc-50 rounded-xl border-none resize-none"
                placeholder="Write a short bio about yourself..."
            />
        </div>
    </div>
);

const PhotosSection = ({ data, setData, uploading, setUploading }: { data: OnboardingData; setData: any; uploading: boolean; setUploading: any }) => {
    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || data.photos.length >= 6) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const { url } = await res.json();
                setData((prev: OnboardingData) => ({ ...prev, photos: [...prev.photos, url] }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <Camera className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900">Add your best photos</h2>
                <p className="text-zinc-500">Add at least 2 photos to get started</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-100 relative overflow-hidden flex items-center justify-center border-2 border-dashed border-zinc-200 hover:border-pink-300 transition-colors">
                        {data.photos[i] ? (
                            <>
                                <Image src={data.photos[i]} alt="User photo" fill className="object-cover" />
                                <button
                                    onClick={() => setData({ ...data, photos: data.photos.filter((_, idx) => idx !== i) })}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                {uploading && i === data.photos.length ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                                ) : (
                                    <Plus className="w-8 h-8 text-zinc-300" />
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading || i !== data.photos.length} />
                            </label>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initial State - detect country code if possible
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes.find(c => c.country === 'US')?.code || '+1');

    useEffect(() => {
        const detectLocation = async () => {
            // 1. Try IP Geolocation (most accurate)
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const data = await res.json();
                    const countryCode = data.country_code; // e.g. 'NP', 'US'

                    if (countryCode) {
                        const matched = countryCodes.find(c => c.country === countryCode.toUpperCase());
                        if (matched) {
                            setSelectedCountryCode(matched.code);
                            setData(prev => {
                                if (!prev.phoneNumber || prev.phoneNumber === selectedCountryCode) {
                                    return { ...prev, phoneNumber: matched.code };
                                }
                                return prev;
                            });
                            return; // Success, skip locale fallback
                        }
                    }
                }
            } catch (error) {
                console.warn('IP detection failed, trying locale...');
            }

            // 2. Fallback to Browser Locale
            try {
                const locale = navigator.language || 'en-US';
                const country = locale.split('-')[1];
                if (country) {
                    const matched = countryCodes.find(c => c.country === country.toUpperCase());
                    if (matched) {
                        setSelectedCountryCode(matched.code);
                        setData(prev => {
                            if (!prev.phoneNumber || prev.phoneNumber === selectedCountryCode) {
                                return { ...prev, phoneNumber: matched.code };
                            }
                            return prev;
                        });
                    }
                }
            } catch (e) {
                console.warn('Locale detection failed', e);
            }
        };

        // Only run if we haven't touched the phone number yet (or it's just the default)
        // Check local storage or just run once on mount?
        // simple run once is fine.
        detectLocation();
    }, [status]); // Run once when status settles

    // Initial State
    const [data, setData] = useState<OnboardingData>({
        name: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '', // Will be updated by detection effect if empty
        interests: [],
        height: '',
        weight: '',
        relationshipGoal: '',
        preferences: {
            ageRange: { min: 18, max: 35 },
            gender: 'both',
            distance: 50,
        },
        lifestyle: {
            smoking: '',
            drinking: '',
            workout: '',
            diet: '',
            pets: '',
        },
        location: null,
        address: '', // Initialize address
        jobTitle: '',
        company: '',
        educationLevel: '',
        university: '',
        bio: '',
        photos: [],
    });

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (session?.user?.name) {
            setData((prev) => ({ ...prev, name: session.user.name || '' }));
        }
    }, [status, session]);

    // Calculate Progress %
    const progress = Math.round(((currentStep + 1) / steps.length) * 100);

    // --- Actions ---

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            await completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    const completeOnboarding = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboardingComplete: true,
                    ...data,
                    // Ensure date is valid object if set
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                }),
            });

            if (res.ok) {
                window.location.href = '/discover';
            } else {
                console.error('Failed to save profile');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Validation Helper ---
    const canProceed = () => {
        const stepId = steps[currentStep].id;
        switch (stepId) {
            case 'basic':
                // Check basic fields + strict phone number check (must have length > 5 roughly)
                return !!(data.name && data.dateOfBirth && data.gender && data.phoneNumber && data.phoneNumber.length > 5);
            case 'interests':
                return data.interests.length > 0;
            case 'physical':
                // Optional or mandatory? Let's make some mandatory based on UI typical patterns
                // But for now, returning true to not block if user wants to skip optional fields
                // Assuming height/weight/goal might be optional. 
                // Let's make relationshipGoal mandatory if possible
                return true;
            case 'photos':
                return data.photos.length >= 2;
            case 'location':
                // Optional or Mandatory? Usually location is critical for a dating app.
                // Let's enforce it if we want strictness, effectively disable next until picked.
                // Current logic: return true allows skipping. User asked for "disable next". 
                // If location is critical, we should probably enforce it. 
                // However, the prompt specifically mentioned "Phone Number country base show requirement".
                // I'll stick to phone number strictness primarily, but enforcing location is good practice.
                // For now, let's keep location optional to avoid blocking if map fails, unless strictly requested.
                return !!data.location;
            default:
                return true;
        }
    };


    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    // --- Mobile Header Component ---
    const MobileHeader = () => (
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-20 shadow-sm border-b border-zinc-100">
            <div className="px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => currentStep > 0 ? handleBack() : router.push('/')}
                    className="p-2 rounded-full hover:bg-zinc-100"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-700" />
                </button>
                <h1 className="text-lg font-bold text-zinc-800">Complete Profile</h1>
                <span className="text-xs font-bold text-pink-500">{progress}%</span>
            </div>

            {/* Horizontal Steps Indicator */}
            <div className="px-4 pb-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div key={step.id} className="flex-shrink-0 flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isActive
                                    ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                                    : isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                                    }`}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-pink-50">
            {/* Sidebar */}
            <div className="hidden lg:flex flex-col w-80 bg-gradient-to-b from-pink-500 to-rose-600 p-8 text-white fixed h-full z-10">
                <div className="mb-10">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        Back home
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-bold">{progress}%</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive
                                    ? 'bg-white/20 backdrop-blur-sm'
                                    : 'opacity-70'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-400 text-white' : 'bg-white/20 text-white'
                                    }`}>
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{step.title}</h3>
                                    <p className="text-xs text-white/60">{isCompleted ? 'Completed' : 'Incomplete'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:pl-80 pt-[100px] lg:pt-0"> {/* Add padding top for mobile header */}
                <MobileHeader />
                <div className="w-full max-w-2xl mx-auto py-8 px-6">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-3xl shadow-xl p-6 md:p-8 min-h-[500px] relative"
                    >
                        <AnimatePresence mode="wait">
                            {steps[currentStep].id === 'basic' && (
                                <BasicInfo
                                    data={data}
                                    setData={setData}
                                    countryCodes={countryCodes}
                                    selectedCountryCode={selectedCountryCode}
                                    setSelectedCountryCode={setSelectedCountryCode}
                                />
                            )}
                            {steps[currentStep].id === 'interests' && <Interests data={data} setData={setData} />}
                            {steps[currentStep].id === 'physical' && <PhysicalPreferences data={data} setData={setData} />}
                            {steps[currentStep].id === 'lifestyle' && <LifestyleSection data={data} setData={setData} />}
                            {steps[currentStep].id === 'location' && <LocationSection data={data} setData={setData} />}
                            {steps[currentStep].id === 'career' && <CareerSection data={data} setData={setData} />}
                            {steps[currentStep].id === 'photos' && <PhotosSection data={data} setData={setData} uploading={uploading} setUploading={setUploading} />}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-zinc-100">
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                            )}
                            <div className="ml-auto">
                                <button
                                    onClick={handleNext}
                                    disabled={loading || !canProceed()}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
