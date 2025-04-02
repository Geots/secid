import { useState } from 'react';
import { DataGenerationOptions } from '@/types';
import { 
  FaUserAlt, 
  FaGlobe, 
  FaImage, 
  FaLanguage, 
  FaSyncAlt,
  FaBriefcase,
  FaGraduationCap,
  FaHashtag,
  FaPortrait 
} from 'react-icons/fa';

interface DataGeneratorProps {
  onGenerate: (options: DataGenerationOptions) => void;
}

export default function DataGenerator({ onGenerate }: DataGeneratorProps) {
  const [options, setOptions] = useState<DataGenerationOptions>({
    gender: 'male',
    includeAvatar: true,
    avatarStyle: 'realistic',
    ageRange: 'adult',
    includeJobInfo: false,
    includeEducation: false,
    includeSocialMedia: false,
  });

  const handleGenerate = () => {
    onGenerate(options);
  };

  return (
    <div className="data-generator">
      <h2 className="text-lg font-medium text-editor-function mb-5 flex items-center justify-center center-allowed">
        <FaUserAlt className="mr-2 text-editor-accent" />
        Generate Profile
      </h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-editor-text text-left flex items-center mb-2">
            <FaUserAlt className="w-4 h-4 mr-2 text-editor-muted" />
            Gender
          </label>
          <div className="relative">
            <select
              value={options.gender}
              onChange={(e) => setOptions({ ...options, gender: e.target.value as 'male' | 'female' | 'other' })}
              className="mt-1 block w-full select"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
              <div className="h-5 w-0.5 bg-editor-border/50"></div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-editor-text text-left flex items-center mb-2">
            <FaHashtag className="w-4 h-4 mr-2 text-editor-muted" />
            Age Range
          </label>
          <div className="relative">
            <select
              value={options.ageRange || 'adult'}
              onChange={(e) => setOptions({ ...options, ageRange: e.target.value as 'young' | 'adult' | 'senior' })}
              className="mt-1 block w-full select"
            >
              <option value="young">Young (18-30)</option>
              <option value="adult">Adult (31-50)</option>
              <option value="senior">Senior (51-80)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
              <div className="h-5 w-0.5 bg-editor-border/50"></div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-editor-text text-left flex items-center mb-2">
            <FaGlobe className="w-4 h-4 mr-2 text-editor-muted" />
            Country
          </label>
          <div className="relative">
            <select
              value={options.country || ''}
              onChange={(e) => setOptions({ ...options, country: e.target.value })}
              className="mt-1 block w-full select"
            >
              <option value="">Random Country</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Italy">Italy</option>
              <option value="Spain">Spain</option>
              <option value="Japan">Japan</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Brazil">Brazil</option>
              <option value="Greece">Greece</option>
              <option value="Mexico">Mexico</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Singapore">Singapore</option>
              <option value="South Korea">South Korea</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
              <div className="h-5 w-0.5 bg-editor-border/50"></div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-editor-text text-left flex items-center mb-2">
            <FaLanguage className="w-4 h-4 mr-2 text-editor-muted" />
            Language
          </label>
          <div className="relative">
            <select
              value={options.language || 'en'}
              onChange={(e) => setOptions({ ...options, language: e.target.value })}
              className="mt-1 block w-full select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
              <option value="el">Greek</option>
              <option value="nl">Dutch</option>
              <option value="sv">Swedish</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
              <option value="pl">Polish</option>
              <option value="tr">Turkish</option>
              <option value="cs">Czech</option>
              <option value="fi">Finnish</option>
              <option value="no">Norwegian</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
              <div className="h-5 w-0.5 bg-editor-border/50"></div>
            </div>
          </div>
        </div>

        <div className="toggle-container">
          <div className="flex items-center justify-start mb-2">
            <FaImage className="w-4 h-4 mr-2 text-editor-muted" />
            <label className="text-sm font-medium text-editor-text text-left">Include Avatar</label>
          </div>
          <div 
            className="relative flex items-center justify-start cursor-pointer toggle-switch" 
            onClick={() => setOptions({ ...options, includeAvatar: !options.includeAvatar })}
          >
            <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${options.includeAvatar ? 'bg-editor-accent/30' : 'bg-editor-border/30'}`}>
              <div
                className={`absolute left-0.5 top-0.5 bg-editor-lightBg w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center border border-editor-border ${options.includeAvatar ? 'translate-x-5 bg-editor-accent' : ''}`}
              >
                {options.includeAvatar && <span className="text-[8px] text-editor-bg">✓</span>}
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.includeAvatar}
              onChange={(e) => setOptions({ ...options, includeAvatar: e.target.checked })}
              className="absolute opacity-0 w-0 h-0"
              aria-label="Include Avatar"
            />
            <span className="ml-3 text-xs text-editor-muted">
              {options.includeAvatar ? 'Avatar will be included' : 'No avatar'}
            </span>
          </div>
        </div>

        {options.includeAvatar && (
          <div>
            <label className="text-sm font-medium text-editor-text text-left flex items-center mb-2">
              <FaPortrait className="w-4 h-4 mr-2 text-editor-muted" />
              Avatar Style
            </label>
            <div className="relative">
              <select
                value={options.avatarStyle || 'realistic'}
                onChange={(e) => setOptions({ ...options, avatarStyle: e.target.value as 'realistic' | 'cartoon' | 'abstract' })}
                className="mt-1 block w-full select"
              >
                <option value="realistic">Realistic Photo</option>
                <option value="cartoon">Cartoon Style</option>
                <option value="abstract">Abstract</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                <div className="h-5 w-0.5 bg-editor-border/50"></div>
              </div>
            </div>
          </div>
        )}

        <div className="h-px w-full bg-editor-border"></div>

        <div className="toggle-container">
          <div className="flex items-center justify-start mb-2">
            <FaBriefcase className="w-4 h-4 mr-2 text-editor-muted" />
            <label className="text-sm font-medium text-editor-text text-left">Include Job Information</label>
          </div>
          <div 
            className="relative flex items-center justify-start cursor-pointer toggle-switch" 
            onClick={() => setOptions({ ...options, includeJobInfo: !options.includeJobInfo })}
          >
            <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${options.includeJobInfo ? 'bg-editor-accent/30' : 'bg-editor-border/30'}`}>
              <div
                className={`absolute left-0.5 top-0.5 bg-editor-lightBg w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center border border-editor-border ${options.includeJobInfo ? 'translate-x-5 bg-editor-accent' : ''}`}
              >
                {options.includeJobInfo && <span className="text-[8px] text-editor-bg">✓</span>}
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.includeJobInfo}
              onChange={(e) => setOptions({ ...options, includeJobInfo: e.target.checked })}
              className="absolute opacity-0 w-0 h-0"
              aria-label="Include Job Information"
            />
            <span className="ml-3 text-xs text-editor-muted">
              {options.includeJobInfo ? 'Job details will be included' : 'No job details'}
            </span>
          </div>
        </div>

        <div className="toggle-container">
          <div className="flex items-center justify-start mb-2">
            <FaGraduationCap className="w-4 h-4 mr-2 text-editor-muted" />
            <label className="text-sm font-medium text-editor-text text-left">Include Education</label>
          </div>
          <div 
            className="relative flex items-center justify-start cursor-pointer toggle-switch" 
            onClick={() => setOptions({ ...options, includeEducation: !options.includeEducation })}
          >
            <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${options.includeEducation ? 'bg-editor-accent/30' : 'bg-editor-border/30'}`}>
              <div
                className={`absolute left-0.5 top-0.5 bg-editor-lightBg w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center border border-editor-border ${options.includeEducation ? 'translate-x-5 bg-editor-accent' : ''}`}
              >
                {options.includeEducation && <span className="text-[8px] text-editor-bg">✓</span>}
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.includeEducation}
              onChange={(e) => setOptions({ ...options, includeEducation: e.target.checked })}
              className="absolute opacity-0 w-0 h-0"
              aria-label="Include Education"
            />
            <span className="ml-3 text-xs text-editor-muted">
              {options.includeEducation ? 'Education details will be included' : 'No education details'}
            </span>
          </div>
        </div>

        <div className="toggle-container">
          <div className="flex items-center justify-start mb-2">
            <FaHashtag className="w-4 h-4 mr-2 text-editor-muted" />
            <label className="text-sm font-medium text-editor-text text-left">Include Social Media</label>
          </div>
          <div 
            className="relative flex items-center justify-start cursor-pointer toggle-switch" 
            onClick={() => setOptions({ ...options, includeSocialMedia: !options.includeSocialMedia })}
          >
            <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${options.includeSocialMedia ? 'bg-editor-accent/30' : 'bg-editor-border/30'}`}>
              <div
                className={`absolute left-0.5 top-0.5 bg-editor-lightBg w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center border border-editor-border ${options.includeSocialMedia ? 'translate-x-5 bg-editor-accent' : ''}`}
              >
                {options.includeSocialMedia && <span className="text-[8px] text-editor-bg">✓</span>}
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.includeSocialMedia}
              onChange={(e) => setOptions({ ...options, includeSocialMedia: e.target.checked })}
              className="absolute opacity-0 w-0 h-0"
              aria-label="Include Social Media"
            />
            <span className="ml-3 text-xs text-editor-muted">
              {options.includeSocialMedia ? 'Social media profiles will be included' : 'No social media'}
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-editor-border"></div>

        <button
          onClick={handleGenerate}
          className="w-full btn btn-primary flex items-center justify-center py-3 center-allowed"
        >
          <FaSyncAlt className="mr-2" />
          Generate Profile
        </button>
      </div>
    </div>
  );
} 