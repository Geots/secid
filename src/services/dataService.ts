import { faker } from '@faker-js/faker';
import { UserProfile, DataGenerationOptions } from '@/types';

// Avatar services that provide more realistic profile images
const AVATAR_SERVICES = {
  realistic: {
    male: 'https://randomuser.me/api/portraits/men/',
    female: 'https://randomuser.me/api/portraits/women/',
    other: 'https://randomuser.me/api/portraits/lego/'
  },
  cartoon: {
    male: 'https://avatars.dicebear.com/api/avataaars/',
    female: 'https://avatars.dicebear.com/api/avataaars/',
    other: 'https://avatars.dicebear.com/api/avataaars/'
  },
  abstract: {
    male: 'https://avatars.dicebear.com/api/identicon/',
    female: 'https://avatars.dicebear.com/api/identicon/',
    other: 'https://avatars.dicebear.com/api/identicon/'
  }
};

// Collection of country-specific data
interface CountrySpecificData {
  maleNames: string[];
  femaleNames: string[];
  lastNames: string[];
  universities: string[];
  phoneFormat: string;
  cities: string[];
  regions: string[];
  postalFormat: () => string;
}

// Database of country-specific data
const countryData: Record<string, CountrySpecificData> = {
  'Greece': {
    maleNames: ['Georgios', 'Ioannis', 'Konstantinos', 'Dimitrios', 'Nikolaos', 'Panagiotis', 'Vasileios', 'Christos', 'Athanasios', 'Michail', 'Alexandros', 'Evangelos'],
    femaleNames: ['Maria', 'Eleni', 'Aikaterini', 'Georgia', 'Sophia', 'Vasiliki', 'Angeliki', 'Dimitra', 'Christina', 'Konstantina', 'Panagiota', 'Ioanna'],
    lastNames: ['Papadopoulos', 'Vlachos', 'Georgiou', 'Nikolaou', 'Dimitriou', 'Papadakis', 'Pappas', 'Kostopoulou', 'Makris', 'Vasileiou', 'Alexiou', 'Papandreou'],
    universities: ['University of Athens', 'Aristotle University of Thessaloniki', 'National Technical University of Athens', 'University of Patras', 'University of Crete', 'Athens University of Economics and Business', 'University of Ioannina', 'University of Macedonia', 'Technical University of Crete', 'University of the Aegean'],
    phoneFormat: '+30 69########',
    cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Ioannina', 'Chania', 'Rhodes', 'Kavala'],
    regions: ['Attica', 'Central Macedonia', 'Crete', 'Thessaly', 'Epirus', 'Western Greece', 'Central Greece', 'Peloponnese', 'South Aegean', 'North Aegean'],
    postalFormat: () => faker.number.int({ min: 10000, max: 99999 }).toString()
  },
  'Germany': {
    maleNames: ['Hans', 'Thomas', 'Michael', 'Andreas', 'Stefan', 'Klaus', 'Wolfgang', 'Peter', 'Jürgen', 'Dieter', 'Manfred', 'Uwe'],
    femaleNames: ['Sabine', 'Susanne', 'Petra', 'Monika', 'Claudia', 'Birgit', 'Andrea', 'Stefanie', 'Gabriele', 'Angelika', 'Renate', 'Karin'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch'],
    universities: ['Humboldt University of Berlin', 'Technical University of Munich', 'Ludwig Maximilian University of Munich', 'University of Heidelberg', 'RWTH Aachen University', 'Free University of Berlin', 'University of Tübingen', 'University of Freiburg', 'University of Bonn', 'University of Frankfurt'],
    phoneFormat: '+49 1## ########',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    regions: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Lower Saxony', 'Hesse', 'Saxony', 'Rhineland-Palatinate', 'Berlin', 'Schleswig-Holstein', 'Brandenburg'],
    postalFormat: () => faker.number.int({ min: 10000, max: 99999 }).toString()
  },
  'France': {
    maleNames: ['Jean', 'Pierre', 'Michel', 'Philippe', 'Nicolas', 'François', 'Laurent', 'Christophe', 'Olivier', 'Thierry', 'Pascal', 'Stéphane'],
    femaleNames: ['Marie', 'Nathalie', 'Isabelle', 'Catherine', 'Sophie', 'Sylvie', 'Valérie', 'Anne', 'Christine', 'Céline', 'Martine', 'Nicole'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent'],
    universities: ['Sorbonne University', 'École Normale Supérieure', 'University of Paris-Saclay', 'Paris Sciences et Lettres University', 'École Polytechnique', 'Sciences Po', 'University of Strasbourg', 'Aix-Marseille University', 'University of Bordeaux', 'University of Lyon'],
    phoneFormat: '+33 # ## ## ## ##',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    regions: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Grand Est', 'Provence-Alpes-Côte d\'Azur', 'Pays de la Loire', 'Normandy', 'Brittany'],
    postalFormat: () => faker.number.int({ min: 10000, max: 99999 }).toString()
  },
  'Italy': {
    maleNames: ['Marco', 'Giuseppe', 'Antonio', 'Giovanni', 'Francesco', 'Roberto', 'Salvatore', 'Alessandro', 'Luigi', 'Paolo', 'Domenico', 'Vincenzo'],
    femaleNames: ['Maria', 'Anna', 'Francesca', 'Giuseppina', 'Paola', 'Rosa', 'Angela', 'Giovanna', 'Teresa', 'Lucia', 'Carmela', 'Valentina'],
    lastNames: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo'],
    universities: ['University of Bologna', 'Sapienza University of Rome', 'University of Padua', 'University of Milan', 'University of Florence', 'University of Pisa', 'University of Turin', 'University of Naples Federico II', 'University of Genoa', 'Polytechnic University of Milan'],
    phoneFormat: '+39 ### ####',
    cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Catania', 'Venice'],
    regions: ['Lombardy', 'Lazio', 'Campania', 'Sicily', 'Veneto', 'Piedmont', 'Emilia-Romagna', 'Apulia', 'Tuscany', 'Calabria'],
    postalFormat: () => faker.number.int({ min: 10000, max: 99999 }).toString()
  },
  'Spain': {
    maleNames: ['Antonio', 'José', 'Manuel', 'Francisco', 'Juan', 'David', 'Javier', 'Carlos', 'Jesús', 'Miguel', 'Alejandro', 'Rafael'],
    femaleNames: ['María', 'Carmen', 'Ana', 'Isabel', 'Laura', 'Cristina', 'Dolores', 'Pilar', 'Josefa', 'Teresa', 'Raquel', 'Marta'],
    lastNames: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz'],
    universities: ['University of Barcelona', 'Complutense University of Madrid', 'Autonomous University of Barcelona', 'Autonomous University of Madrid', 'University of Valencia', 'Pompeu Fabra University', 'University of Granada', 'University of Seville', 'University of Salamanca', 'University of Navarra'],
    phoneFormat: '+34 ### ### ###',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
    regions: ['Andalusia', 'Catalonia', 'Community of Madrid', 'Valencian Community', 'Galicia', 'Castile and León', 'Basque Country', 'Canary Islands', 'Castile-La Mancha', 'Murcia'],
    postalFormat: () => faker.number.int({ min: 10000, max: 99999 }).toString()
  }
};

// Helper function to generate an age based on age range
const generateAge = (ageRange?: 'young' | 'adult' | 'senior'): number => {
  switch (ageRange) {
    case 'young':
      return faker.number.int({ min: 18, max: 30 });
    case 'adult':
      return faker.number.int({ min: 31, max: 50 });
    case 'senior':
      return faker.number.int({ min: 51, max: 80 });
    default:
      return faker.number.int({ min: 18, max: 80 });
  }
};

// Helper function to generate job information
const generateJobInfo = (country?: string): UserProfile['job'] => {
  const startDate = faker.date.past({ years: 5 });
  return {
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    department: faker.commerce.department(),
    startDate: startDate.toISOString().split('T')[0] // YYYY-MM-DD format
  };
};

// Helper function to generate education information
const generateEducation = (country?: string): UserProfile['education'] => {
  // Calculate a graduation year that makes sense based on typical graduation ages
  const currentYear = new Date().getFullYear();
  const graduationYear = faker.number.int({ min: currentYear - 20, max: currentYear - 1 });
  
  // Create a graduation date (usually May-June)
  const month = faker.number.int({ min: 5, max: 6 }); // May or June
  const day = faker.number.int({ min: 1, max: 28 });
  const graduationDate = new Date(graduationYear, month - 1, day); // month is 0-indexed
  
  // Use country-specific university names if available
  let university = faker.company.name() + ' University';
  if (country && countryData[country]) {
    const universities = countryData[country].universities;
    university = universities[faker.number.int({ min: 0, max: universities.length - 1 })];
  }
  
  return {
    university,
    degree: faker.helpers.arrayElement(['Bachelor', 'Master', 'PhD']),
    field: faker.person.jobArea(),
    graduationYear,
    graduationDate: graduationDate.toISOString().split('T')[0] // YYYY-MM-DD format
  };
};

// Helper function to generate social media profiles
const generateSocialMedia = (firstName: string, lastName: string): UserProfile['socialMedia'] => {
  const username = faker.internet.userName({ firstName, lastName });
  return {
    twitter: `@${username}`,
    facebook: `facebook.com/${username}`,
    instagram: `instagram.com/${username}`,
    linkedin: `linkedin.com/in/${username}`
  };
};

// Function to generate a realistic avatar URL
const generateAvatar = (gender: 'male' | 'female' | 'other', style: 'realistic' | 'cartoon' | 'abstract' = 'realistic', age: number): string => {
  if (style === 'realistic') {
    // Use randomuser.me API for realistic photos which provides reliable URLs
    const randomId = faker.number.int({ min: 1, max: 99 });
    return `${AVATAR_SERVICES.realistic[gender]}${randomId}.jpg`;
  } else {
    const hash = faker.string.alphanumeric(10);
    return `${AVATAR_SERVICES[style][gender]}${hash}.svg`;
  }
};

// Generate localized names
const generateLocalizedName = (gender: 'male' | 'female' | 'other', country?: string): { firstName: string, lastName: string } => {
  if (country && countryData[country]) {
    const data = countryData[country];
    const namesList = gender === 'male' ? data.maleNames : 
                    gender === 'female' ? data.femaleNames : 
                    faker.helpers.arrayElement([data.maleNames, data.femaleNames]);
    
    const firstName = namesList[faker.number.int({ min: 0, max: namesList.length - 1 })];
    const lastName = data.lastNames[faker.number.int({ min: 0, max: data.lastNames.length - 1 })];
    
    return { firstName, lastName };
  }
  
  // Default to faker if country not found
  return {
    firstName: faker.person.firstName(gender as 'male' | 'female'),
    lastName: faker.person.lastName()
  };
};

// Generate localized phone number
const generatePhoneNumber = (country?: string): string => {
  if (country && countryData[country]) {
    const format = countryData[country].phoneFormat;
    // Replace # with random digits
    let phoneNumber = '';
    for (let i = 0; i < format.length; i++) {
      if (format[i] === '#') {
        phoneNumber += faker.number.int({ min: 0, max: 9 }).toString();
      } else {
        phoneNumber += format[i];
      }
    }
    return phoneNumber;
  }
  
  // Default to faker if country not found
  return faker.phone.number();
};

export const dataService = {
  generateProfile: (options: DataGenerationOptions = {}): UserProfile => {
    const gender = options.gender || faker.helpers.arrayElement(['male', 'female', 'other']);
    
    // Handle country selection
    const country = options.country ? options.country.trim() : faker.location.country();
    
    // Get localized names based on country
    const { firstName, lastName } = generateLocalizedName(gender as 'male' | 'female' | 'other', country);
    
    // Generate localized phone number
    const phoneNumber = generatePhoneNumber(country);
    
    const age = generateAge(options.ageRange);
    
    // Generate birthdate with correct year based on current age
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const birthYear = currentYear - age;
    
    // Generate a random month and day
    const month = faker.number.int({ min: 1, max: 12 });
    const day = faker.number.int({ min: 1, max: 28 }); // Avoiding edge cases with month lengths
    
    const birthDate = new Date(birthYear, month - 1, day); // month is 0-indexed in JS Date
    const birthdate = birthDate.toISOString().split('T')[0]; // YYYY-MM-DD format for data storage
    
    // Determine city, state, and zipCode based on country
    let city, state, zipCode;
    
    if (country in countryData) {
      const data = countryData[country];
      city = data.cities[faker.number.int({ min: 0, max: data.cities.length - 1 })];
      state = data.regions[faker.number.int({ min: 0, max: data.regions.length - 1 })];
      zipCode = data.postalFormat();
    } else {
      // For other countries, use faker
      city = faker.location.city();
      state = faker.location.state();
      zipCode = faker.location.zipCode();
    }
    
    const profile: UserProfile = {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      gender: gender as 'male' | 'female' | 'other',
      phoneNumber,
      age,
      birthdate,
      address: {
        street: faker.location.streetAddress(),
        city,
        state,
        zipCode,
        country,
      },
      // Set the display language based on user selection
      displayLanguage: options.language || 'en',
    };

    // Add avatar if requested
    if (options.includeAvatar) {
      profile.avatar = generateAvatar(gender as 'male' | 'female' | 'other', options.avatarStyle || 'realistic', age);
    }

    // Add job information if requested
    if (options.includeJobInfo) {
      profile.job = generateJobInfo(country);
    }

    // Add education information if requested
    if (options.includeEducation) {
      profile.education = generateEducation(country);
    }

    // Add social media profiles if requested
    if (options.includeSocialMedia) {
      profile.socialMedia = generateSocialMedia(firstName, lastName);
    }

    return profile;
  },

  generateProfiles: (count: number, options: DataGenerationOptions = {}): UserProfile[] => {
    return Array.from({ length: count }, () => dataService.generateProfile(options));
  },

  exportData: (data: UserProfile | UserProfile[], format: 'json' | 'csv' | 'sql' | 'xml'): string => {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        const profiles = Array.isArray(data) ? data : [data];
        const headers = [
          'firstName', 
          'lastName', 
          'email', 
          'gender', 
          'age', 
          'birthdate', 
          'phoneNumber', 
          'address',
          'avatar',
          'jobTitle',
          'company',
          'department',
          'university',
          'degree',
          'field',
          'social'
        ];
        const rows = profiles.map(profile => [
          profile.firstName,
          profile.lastName,
          profile.email,
          profile.gender,
          profile.age || '',
          profile.birthdate || '',
          profile.phoneNumber,
          `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}, ${profile.address.country}`,
          profile.avatar || '',
          profile.job?.title || '',
          profile.job?.company || '',
          profile.job?.department || '',
          profile.education?.university || '',
          profile.education?.degree || '',
          profile.education?.field || '',
          profile.socialMedia ? `Twitter: ${profile.socialMedia.twitter || ''}` : ''
        ]);
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      case 'sql':
        const sqlProfiles = Array.isArray(data) ? data : [data];
        return sqlProfiles
          .map(
            profile => {
              const fields = [
                'first_name', 
                'last_name', 
                'email', 
                'gender', 
                'age', 
                'birthdate',
                'phone_number', 
                'address',
                'avatar',
                'job_title',
                'company',
                'education',
                'social_media'
              ];
              
              const values = [
                `'${profile.firstName}'`,
                `'${profile.lastName}'`,
                `'${profile.email}'`,
                `'${profile.gender}'`,
                profile.age ? `${profile.age}` : 'NULL',
                profile.birthdate ? `'${profile.birthdate}'` : 'NULL',
                `'${profile.phoneNumber}'`,
                `'${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}, ${profile.address.country}'`,
                profile.avatar ? `'${profile.avatar}'` : 'NULL',
                profile.job?.title ? `'${profile.job.title}'` : 'NULL',
                profile.job?.company ? `'${profile.job.company}'` : 'NULL',
                profile.education?.university ? `'${profile.education.university}, ${profile.education.degree}'` : 'NULL',
                profile.socialMedia?.twitter ? `'${profile.socialMedia.twitter}'` : 'NULL'
              ];
              
              return `INSERT INTO users (${fields.join(', ')}) VALUES (${values.join(', ')});`;
            }
          )
          .join('\n');
      case 'xml':
        const xmlProfiles = Array.isArray(data) ? data : [data];
        return `<?xml version="1.0" encoding="UTF-8"?>
<profiles>
  ${xmlProfiles
    .map(
      profile => `
  <profile>
    <firstName>${profile.firstName}</firstName>
    <lastName>${profile.lastName}</lastName>
    <email>${profile.email}</email>
    <gender>${profile.gender}</gender>
    ${profile.age ? `<age>${profile.age}</age>` : ''}
    ${profile.birthdate ? `<birthdate>${profile.birthdate}</birthdate>` : ''}
    <phoneNumber>${profile.phoneNumber}</phoneNumber>
    <address>
      <street>${profile.address.street}</street>
      <city>${profile.address.city}</city>
      <state>${profile.address.state}</state>
      <zipCode>${profile.address.zipCode}</zipCode>
      <country>${profile.address.country}</country>
    </address>
    ${profile.avatar ? `<avatar>${profile.avatar}</avatar>` : ''}
    ${profile.job ? `
    <job>
      <title>${profile.job.title}</title>
      <company>${profile.job.company}</company>
      ${profile.job.department ? `<department>${profile.job.department}</department>` : ''}
      ${profile.job.startDate ? `<startDate>${profile.job.startDate}</startDate>` : ''}
    </job>
    ` : ''}
    ${profile.education ? `
    <education>
      <university>${profile.education.university}</university>
      <degree>${profile.education.degree}</degree>
      <field>${profile.education.field}</field>
      ${profile.education.graduationYear ? `<graduationYear>${profile.education.graduationYear}</graduationYear>` : ''}
    </education>
    ` : ''}
    ${profile.socialMedia ? `
    <socialMedia>
      ${profile.socialMedia.twitter ? `<twitter>${profile.socialMedia.twitter}</twitter>` : ''}
      ${profile.socialMedia.facebook ? `<facebook>${profile.socialMedia.facebook}</facebook>` : ''}
      ${profile.socialMedia.instagram ? `<instagram>${profile.socialMedia.instagram}</instagram>` : ''}
      ${profile.socialMedia.linkedin ? `<linkedin>${profile.socialMedia.linkedin}</linkedin>` : ''}
    </socialMedia>
    ` : ''}
  </profile>`
    )
    .join('')}
</profiles>`;
    }
  },
}; 