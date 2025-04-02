import { UserProfile } from '@/types';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaTrash, 
  FaBriefcase, 
  FaGraduationCap, 
  FaBirthdayCake,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaCopy
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ProfileCardProps {
  profile: UserProfile;
  onDelete?: () => void;
}

// Language dictionaries for UI text
const translations: Record<string, Record<string, string>> = {
  en: {
    years: 'years',
    born: 'Born',
    dept: 'Dept',
    since: 'Since',
    graduated: 'Graduated',
    classOf: 'Class of'
  },
  es: {
    years: 'años',
    born: 'Fecha de nacimiento',
    dept: 'Departamento',
    since: 'Desde',
    graduated: 'Graduado',
    classOf: 'Promoción'
  },
  fr: {
    years: 'ans',
    born: 'Né(e) le',
    dept: 'Département',
    since: 'Depuis',
    graduated: 'Diplômé',
    classOf: 'Promotion'
  },
  de: {
    years: 'Jahre',
    born: 'Geboren am',
    dept: 'Abteilung',
    since: 'Seit',
    graduated: 'Abschluss',
    classOf: 'Jahrgang'
  },
  it: {
    years: 'anni',
    born: 'Nato/a il',
    dept: 'Reparto',
    since: 'Da',
    graduated: 'Laureato',
    classOf: 'Classe del'
  },
  el: {
    years: 'έτη',
    born: 'Γεννημένος/η',
    dept: 'Τμήμα',
    since: 'Από',
    graduated: 'Αποφοίτησε',
    classOf: 'Τάξη του'
  }
};

// Default to English if language not supported
const getTranslation = (key: string, language?: string): string => {
  const lang = language && translations[language] ? language : 'en';
  return translations[lang][key] || translations.en[key];
};

function formatDate(dateString: string, language?: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Format based on language
    if (language === 'en' || !language) {
      // DD/MM/YYYY for English (default)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (language === 'es' || language === 'it') {
      // DD/MM/YYYY for Spanish and Italian
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (language === 'de') {
      // DD.MM.YYYY for German
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } else if (language === 'fr') {
      // DD/MM/YYYY for French
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      // Default format
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (_) {
    return dateString;
  }
}

function formatGraduationYear(year: number, language?: string): string {
  // Format graduation year based on language
  return `${getTranslation('classOf', language)} ${year}`;
}

export default function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  // Get the language for display
  const language = profile.displayLanguage || 'en';
  
  // Handle copying text to clipboard
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${fieldName} copied to clipboard`);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <div className="bg-editor-lightBg border border-editor-border shadow rounded-md overflow-hidden relative group">
      {onDelete && (
        <button 
          onClick={onDelete}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-editor-highlight text-editor-muted hover:text-editor-error transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
          title="Delete profile"
          aria-label="Delete profile"
        >
          <FaTrash className="w-3.5 h-3.5" />
        </button>
      )}
      
      <div className="p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          {profile.avatar ? (
            <div className="relative">
              <div className="absolute inset-0 bg-editor-accent blur-md opacity-20 rounded-full"></div>
              <Image
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                width={64}
                height={64}
                className="relative w-16 h-16 rounded-full border-2 border-editor-accent/30 shadow-glow-sm object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-editor-highlight flex items-center justify-center border-2 border-editor-border shadow-md">
              <FaUser className="w-8 h-8 text-editor-muted" />
            </div>
          )}
          <div className="text-center sm:text-left relative">
            <div className="inline-flex items-center space-x-2 mb-1">
              <FaIdCard className="w-4 h-4 text-editor-accent" />
              <h3 className="text-lg font-medium text-editor-text cursor-pointer hover:text-editor-accent transition-colors duration-200 group" 
                  onClick={() => handleCopy(`${profile.firstName} ${profile.lastName}`, 'Name')}>
                {profile.firstName} {profile.lastName}
                <FaCopy className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 inline-block" />
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-editor-highlight/50 text-editor-accent rounded-full px-3 py-0.5 text-xs inline-block">
                {profile.gender}
              </div>
              {profile.age && (
                <div className="bg-editor-highlight/50 text-editor-string rounded-full px-3 py-0.5 text-xs inline-block">
                  {profile.age} {getTranslation('years', language)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3.5 relative">
          <div className="flex items-center justify-center sm:justify-start text-sm text-editor-text bg-editor-highlight p-2 px-3 rounded-md cursor-pointer hover:bg-editor-highlight/80 transition-colors duration-200 group"
              onClick={() => handleCopy(profile.email, 'Email')}>
            <FaEnvelope className="w-4 h-4 mr-3 text-editor-accent" />
            <span className="break-all">{profile.email}</span>
            <FaCopy className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
          </div>
          <div className="flex items-center justify-center sm:justify-start text-sm text-editor-text bg-editor-highlight p-2 px-3 rounded-md cursor-pointer hover:bg-editor-highlight/80 transition-colors duration-200 group"
              onClick={() => handleCopy(profile.phoneNumber, 'Phone number')}>
            <FaPhone className="w-4 h-4 mr-3 text-editor-function" />
            <span>{profile.phoneNumber}</span>
            <FaCopy className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
          </div>
          <div className="flex items-start justify-center sm:justify-start text-sm text-editor-text bg-editor-highlight p-2 px-3 rounded-md cursor-pointer hover:bg-editor-highlight/80 transition-colors duration-200 group"
              onClick={() => handleCopy(`${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}, ${profile.address.country}`, 'Address')}>
            <FaMapMarkerAlt className="w-4 h-4 mr-3 mt-1 text-editor-string" />
            <span className="text-center sm:text-left">
              {profile.address.street}, {profile.address.city}, {profile.address.state}{' '}
              {profile.address.zipCode}
              <br />
              {profile.address.country}
            </span>
            <FaCopy className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
          </div>

          {/* Birthdate */}
          {profile.birthdate && (
            <div className="flex items-center justify-center sm:justify-start text-sm text-editor-text bg-editor-highlight p-2 px-3 rounded-md cursor-pointer hover:bg-editor-highlight/80 transition-colors duration-200 group"
                onClick={() => profile.birthdate && handleCopy(formatDate(profile.birthdate, language), 'Birthdate')}>
              <FaBirthdayCake className="w-4 h-4 mr-3 text-editor-keyword" />
              <span>{getTranslation('born', language)}: {formatDate(profile.birthdate, language)}</span>
              <FaCopy className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </div>
          )}

          {/* Job Information */}
          {profile.job && (
            <div className="flex items-start justify-center sm:justify-start text-sm text-editor-text bg-editor-highlight p-2 px-3 rounded-md cursor-pointer hover:bg-editor-highlight/80 transition-colors duration-200 group"
                onClick={() => profile.job && handleCopy(`${profile.job.title} at ${profile.job.company}${profile.job.department ? `, ${profile.job.department}` : ''}`, 'Job information')}>
              <FaBriefcase className="w-4 h-4 mr-3 mt-1 text-editor-comment" />
              <div className="text-center sm:text-left">
                <div className="font-medium">{profile.job.title}</div>
                <div>{profile.job.company}</div>
                {profile.job.department && <div>{getTranslation('dept', language)}: {profile.job.department}</div>}
                {profile.job.startDate && <div className="text-xs text-editor-muted mt-1">{getTranslation('since', language)}: {formatDate(profile.job.startDate, language)}</div>}
              </div>
              <FaCopy className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </div>
          )}

          {/* Education */}
          {profile.education && (
            <div className="flex items-start justify-center sm:justify-start text-sm text-editor-text bg-editor-highlight p-2 px-3 rounded-md cursor-pointer hover:bg-editor-highlight/80 transition-colors duration-200 group"
                onClick={() => profile.education && handleCopy(`${profile.education.degree} in ${profile.education.field}, ${profile.education.university}`, 'Education information')}>
              <FaGraduationCap className="w-4 h-4 mr-3 mt-1 text-editor-function" />
              <div className="text-center sm:text-left">
                <div className="font-medium">{profile.education.degree} in {profile.education.field}</div>
                <div>{profile.education.university}</div>
                {profile.education.graduationYear && (
                  <div className="text-xs text-editor-muted mt-1">{getTranslation('graduated', language)}: {formatGraduationYear(profile.education.graduationYear, language)}</div>
                )}
              </div>
              <FaCopy className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </div>
          )}

          {/* Social Media */}
          {profile.socialMedia && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              {profile.socialMedia.twitter && (
                <button 
                  onClick={() => profile.socialMedia?.twitter && handleCopy(profile.socialMedia.twitter, 'Twitter handle')}
                  className="text-editor-accent hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-editor-highlight/50"
                  title={`Copy: ${profile.socialMedia.twitter}`}
                >
                  <FaTwitter className="w-5 h-5" />
                </button>
              )}
              {profile.socialMedia.facebook && (
                <button 
                  onClick={() => profile.socialMedia?.facebook && handleCopy(profile.socialMedia.facebook, 'Facebook profile')}
                  className="text-editor-string hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-editor-highlight/50"
                  title={`Copy: ${profile.socialMedia.facebook}`}
                >
                  <FaFacebook className="w-5 h-5" />
                </button>
              )}
              {profile.socialMedia.instagram && (
                <button 
                  onClick={() => profile.socialMedia?.instagram && handleCopy(profile.socialMedia.instagram, 'Instagram profile')}
                  className="text-editor-keyword hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-editor-highlight/50"
                  title={`Copy: ${profile.socialMedia.instagram}`}
                >
                  <FaInstagram className="w-5 h-5" />
                </button>
              )}
              {profile.socialMedia.linkedin && (
                <button
                  onClick={() => profile.socialMedia?.linkedin && handleCopy(profile.socialMedia.linkedin, 'LinkedIn profile')}
                  className="text-editor-function hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-editor-highlight/50"
                  title={`Copy: ${profile.socialMedia.linkedin}`}
                >
                  <FaLinkedin className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 