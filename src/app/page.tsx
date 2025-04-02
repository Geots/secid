'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProfile, DataGenerationOptions, ExportFormat, EmailInbox } from '@/types';
import { dataService } from '@/services/dataService';
import ProfileCard from '@/components/ProfileCard';
import EmailInboxComponent from '@/components/EmailInbox';
import DataGenerator from '@/components/DataGenerator';
import ExportOptions from '@/components/ExportOptions';
import EmailGenerator from '@/components/EmailGenerator';
import { FaShieldAlt, FaUserSecret, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Home() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [inbox, setInbox] = useState<EmailInbox | null>(null);

  const generateProfile = async (options: DataGenerationOptions) => {
    const profile = dataService.generateProfile(options);
    setProfiles(prev => [...prev, profile]);
    toast.success('Profile generated successfully');
  };

  const handleEmailGenerated = (newInbox: EmailInbox) => {
    setInbox(newInbox);
  };

  const handleInboxUpdate = (updatedInbox: EmailInbox) => {
    setInbox(updatedInbox);
  };

  const exportData = (format: ExportFormat) => {
    const data = dataService.exportData(profiles, format);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profiles.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${profiles.length} profiles as ${format.toUpperCase()}`);
  };

  const deleteProfile = (index: number) => {
    setProfiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Profile deleted');
  };

  const deleteAllProfiles = () => {
    setProfiles([]);
    toast.success('All profiles deleted');
  };

  return (
    <div className="min-h-screen bg-editor-bg">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1E2E',
            color: '#E0E4FC',
            border: '1px solid #273046',
            boxShadow: '0 0 10px rgba(0, 204, 255, 0.2)',
          },
        }}
      />
      <header className="bg-editor-lightBg border-b border-editor-border relative overflow-hidden">
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-editor-glow blur-3xl opacity-20"></div>
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-editor-glow blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start">
            <div className="mr-3 bg-editor-accent/20 p-2 rounded-full shadow-glow-sm">
              <FaShieldAlt className="w-6 h-6 text-editor-accent" />
            </div>
            <h1 className="text-3xl font-bold text-editor-function">
              SecId
              <span className="ml-1 text-xs align-top bg-editor-highlight px-2 py-1 rounded-full text-editor-accent">alpha</span>
            </h1>
          </div>
          <p className="mt-3 text-sm text-editor-muted flex items-center justify-center sm:justify-start">
            <FaUserSecret className="inline-block mr-2 text-editor-muted" />
            Generate secure identities and temporary emails
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8 mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="card">
              <div className="card-body">
                <DataGenerator onGenerate={generateProfile} />
              </div>
            </div>
            <div className="card hidden sm:block">
              <div className="card-body">
                <ExportOptions onExport={exportData} />
              </div>
            </div>
          </div>
          
          <div className="space-y-8 mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="card">
              <div className="card-body">
                <EmailGenerator onEmailGenerated={handleEmailGenerated} />
              </div>
            </div>
            {inbox && (
              <div className="card">
                <div className="card-body">
                  <EmailInboxComponent inbox={inbox} onInboxUpdate={handleInboxUpdate} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-px w-full my-10 bg-editor-border"></div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-medium text-editor-function mb-3 sm:mb-0 text-center sm:text-left flex items-center justify-center sm:justify-start">
              <div className="mr-2 bg-editor-accent/10 p-1.5 rounded-full">
                <FaUserSecret className="w-5 h-5 text-editor-function" />
              </div>
              Generated Profiles ({profiles.length})
            </h2>
            
            {profiles.length > 0 && (
              <button 
                onClick={deleteAllProfiles}
                className="btn btn-secondary flex items-center justify-center mx-auto sm:mx-0 text-sm py-1.5 px-3"
              >
                <FaTrash className="w-3.5 h-3.5 mr-2 text-editor-error" />
                Delete All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map((profile, index) => (
              <div key={index} className="mx-auto w-full max-w-md md:mx-0 md:max-w-none transform hover:-translate-y-1 transition-transform duration-300">
                <ProfileCard 
                  profile={profile} 
                  onDelete={() => deleteProfile(index)}
                />
              </div>
            ))}
            {profiles.length === 0 && (
              <div className="col-span-full text-center py-16 text-editor-muted">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-editor-accent/5 flex items-center justify-center border border-editor-border">
                  <FaUserSecret className="w-10 h-10 text-editor-muted opacity-50" />
                </div>
                <p className="text-lg">No profiles generated yet</p>
                <p className="text-sm mt-2">Use the form above to create identities</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 sm:hidden">
          <div className="card mx-auto w-full max-w-md">
            <div className="card-body">
              <ExportOptions onExport={exportData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}