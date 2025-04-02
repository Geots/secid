export type Person = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date | string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  bio?: string;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type UserProfile = {
  id?: string;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  avatar?: string;
  age?: number;
  birthdate?: string;
  job?: {
    title: string;
    company: string;
    department?: string;
    startDate?: string;
  };
  education?: {
    university: string;
    degree: string;
    field: string;
    graduationYear?: number;
    graduationDate?: string;
  };
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  displayLanguage?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type EmailProvider = 'mail.tm';

export type EmailAccount = {
  email: string;
  username: string;
  password: string;
  provider: EmailProvider;
  sid?: string;
  token?: string;
};

export type EmailMessage = {
  id: string;
  from: string;
  to?: string;
  subject: string;
  text: string;
  html: string;
  date: string;
  read?: boolean;
};

export type EmailInbox = {
  email: string;
  messages: EmailMessage[];
  provider: EmailProvider;
};

export type CreditCard = {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  type?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
};

export type BankAccount = {
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  accountHolder: string;
};

export type SocialSecurityNumber = {
  number: string;
  issuedDate?: Date | string;
  issuedState?: string;
};

export type DriverLicense = {
  number: string;
  issuedState: string;
  issuedDate: Date | string;
  expiryDate: Date | string;
  class?: string;
};

export type Passport = {
  number: string;
  countryCode: string;
  issuedDate: Date | string;
  expiryDate: Date | string;
  birthPlace?: string;
};

export type HealthInsurance = {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  holderName: string;
  issuedDate?: Date | string;
  expiryDate?: Date | string;
};

export type Company = {
  name: string;
  industry: string;
  website?: string;
  founded?: Date | string;
  numberOfEmployees?: number;
  location?: Address;
  description?: string;
};

export type Job = {
  title: string;
  company: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
  description?: string;
  skills?: string[];
};

export type EducationRecord = {
  institution: string;
  degree: string;
  field: string;
  startDate: Date | string;
  endDate?: Date | string;
  gpa?: number;
  location?: string;
};

export type VehicleRegistration = {
  vin: string;
  licensePlate: string;
  state: string;
  make: string;
  model: string;
  year: number;
  color?: string;
};

export type IPAddress = {
  address: string;
  version: 'ipv4' | 'ipv6';
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    lat?: number;
    long?: number;
  };
};

export type UserAgent = {
  raw: string;
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'other';
    vendor?: string;
    model?: string;
  };
};

export interface DataGenerationOptions {
  gender?: 'male' | 'female' | 'other';
  country?: string;
  includeAvatar?: boolean;
  avatarStyle?: 'realistic' | 'cartoon' | 'abstract';
  language?: string;
  ageRange?: 'young' | 'adult' | 'senior';
  includeJobInfo?: boolean;
  includeEducation?: boolean;
  includeSocialMedia?: boolean;
}

export type ExportFormat = 'json' | 'csv' | 'sql' | 'xml'; 