import React, { useState, Fragment, useEffect } from 'react';
// import DashboardNav from '../components/DashboardNav'; // Removed: Handled by withPreview HOC
import { CheckCircleIcon, PencilSquareIcon, EnvelopeIcon, XMarkIcon, SparklesIcon, BoltIcon, ArrowPathRoundedSquareIcon, LightBulbIcon, MegaphoneIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { withPreview } from '@/lib/withPreview'; // Added HOC import
import TemplateSelectorModal, { EmailTemplate as ModalEmailTemplate } from '@/components/modals/TemplateSelectorModal'; // Import new modal and its interface

// Interfaces based on SearchResults.tsx mockData
interface Contact {
  id: number;
  name: string;
  title: string;
  email: string;
  profileImage?: string;
}

interface SearchResultBrand {
  id: number;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  instagram: string;
  tiktok: string;
  founded: string;
  website?: string;
  description?: string;
  tagline?: string;
  isFavorite?: boolean;
  contacts?: Contact[];
}

// Data from SearchResults.tsx (subset for brevity in example, real one is longer)
const mockBrandsFromSearchResults: SearchResultBrand[] = [
  {
    id: 1,
    name: 'Glossier',
    logo: 'https://logo.clearbit.com/glossier.com',
    industry: 'Beauty',
    location: 'United States',
    size: '201-500',
    instagram: '2.8M',
    tiktok: '1.2M',
    founded: '2014',
    tagline: 'Skin first, makeup second. Beauty products inspired by real life.',
    contacts: [
      { id: 1, name: 'Emily Weiss', title: 'Founder & CEO', email: 'emily@glossier.com', profileImage: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 2, name: 'Sarah Brown', title: 'VP of Marketing', email: 'sarah@glossier.com', profileImage: 'https://randomuser.me/api/portraits/women/67.jpg' },
    ]
  },
  {
    id: 2,
    name: 'Fenty Beauty',
    logo: 'https://logo.clearbit.com/fentybeauty.com',
    industry: 'Beauty',
    location: 'United States',
    size: '201-500',
    instagram: '3.1M',
    tiktok: '1.5M',
    founded: '2017',
    tagline: 'Beauty for all. Makeup for everyone, in shades made for all skin tones.',
    contacts: [
      { id: 1, name: 'Robyn Fenty', title: 'Founder', email: 'robyn@fentybeauty.com', profileImage: 'https://randomuser.me/api/portraits/women/10.jpg' },
    ]
  },
  {
    id: 3,
    name: 'Milk Makeup',
    logo: 'https://logo.clearbit.com/milkmakeup.com',
    industry: 'Beauty',
    location: 'United States',
    size: '51-200',
    instagram: '1.5M',
    tiktok: '800K',
    founded: '2016',
    tagline: 'High-performance, clean, vegan, cruelty-free products for all.',
    // No contacts for this one, to test fallback
  },
    {
    id: 4,
    name: 'Rare Beauty',
    logo: 'https://logo.clearbit.com/rarebeauty.com',
    industry: 'Beauty',
    location: 'United States',
    size: '51-200',
    instagram: '2.2M',
    tiktok: '1.1M',
    founded: '2020',
    tagline: 'Makeup made to feel good in, without hiding what makes you unique.',
    contacts: [{id: 1, name: "Selena Gomez", title: "Founder", email: "selena@rarebeauty.com"}]
  },
  {
    id: 5,
    name: 'Summer Fridays',
    logo: 'https://logo.clearbit.com/summerfridays.com',
    industry: 'Skincare',
    location: 'United States',
    size: '11-50',
    instagram: '1.8M',
    tiktok: '950K',
    founded: '2018',
    tagline: 'Skincare essentials created to simplify your routine and transform your skin.',
    contacts: [{id:1, name: "Lauren Ireland", title: "Co-Founder", email: "lauren@summerfridays.com"}]
  },
];


interface FollowUp {
  name: string;
  sent: boolean;
  date?: string;
}

interface OutreachBrand {
  id: string;
  name: string;
  logoUrl: string;
  email: string;
  firstEmail: {
    sent: boolean;
    date?: string;
  };
  followUps: FollowUp[];
  notes?: string;
}

// NEW: Named type for action details
type ActionDetails =
  | { brand: OutreachBrand; stage: 'firstEmail' | 'followUp'; followUpIndex?: number }
  | null;

// NEW: Email Template Interface
/*
interface EmailTemplate { // This would be removed
  id: string;
  name: string;
  subject: string;
  body: string;
  icon?: React.ElementType;
}
*/

// UPDATED: Mock Email Templates with revised names, a new template, icons and consistent theme colors
const emailTemplatesData: ModalEmailTemplate[] = [
  {
    id: 'template1',
    name: 'Warm Initial Introduction',
    subject: 'Collaboration Inquiry: {{brandName}} x [Your Name/Brand]',
    body: `Hi {{brandName}} Team,\n\nMy name is [Your Name] and I'm a [Your Title/Niche] with a passion for [mention something relevant to the brand]. I've been a long-time admirer of {{brandName}} and how you [mention specific positive aspect].\n\nI believe my audience of [mention audience size/demographics] would resonate strongly with your products/message. I'd love to discuss potential collaboration opportunities.\n\nAre you available for a quick chat next week?\n\nBest,\n[Your Name]\n[Your Website/Social Link]`,
    icon: SparklesIcon,
  },
  {
    id: 'template6',
    name: 'Quick Intro: Shared Passion',
    subject: 'Question re: {{brandName}} & [Shared Interest/Your Niche]',
    body: `Hi {{brandName}} Team,\n\nBig fan of your work, especially [mention something specific if possible]!\n\nAs a [Your Title/Niche] also passionate about [Shared Interest/Your Niche], I had a quick idea for how we might create something valuable together for both our audiences.\n\nWould you be open to a very brief chat sometime this week or next?\n\nCheers,\n[Your Name]\n[Your Website/Portfolio Link]`,
    icon: BoltIcon,
  },
  {
    id: 'template2',
    name: 'Gentle Follow-Up (No Response)',
    subject: 'Following Up: Collaboration Inquiry with {{brandName}}',
    body: `Hi {{brandName}} Team,\n\nI hope this email finds you well.\n\nI recently reached out regarding a potential collaboration between {{brandName}} and myself. I understand you're busy, so I wanted to gently follow up on my previous email.\n\nI'm still very enthusiastic about the possibility of working together and believe it could be a great fit. You can see more of my work here: [Your Portfolio/Media Kit Link].\n\nWould you be open to a brief discussion?\n\nThanks,\n[Your Name]`,
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    id: 'template3',
    name: 'Creative Product Pitch Idea',
    subject: 'Idea for {{brandName}}: Featuring [Specific Product]',
    body: `Hi {{brandName}} Team,\n\nI'm particularly excited about your new [Specific Product Name] and I have a creative idea for how I could feature it to my audience. [Briefly explain your content idea].\n\nI think this would genuinely engage my followers and showcase {{brandName}}'s [Specific Product] in a unique light.\n\nLet me know if this sounds interesting!\n\nCheers,\n[Your Name]`,
    icon: LightBulbIcon,
  },
  {
    id: 'template4',
    name: 'Campaign / Event Tie-In Idea',
    subject: '{{brandName}} x [Your Name] for your [Event/Campaign Name]?',
    body: `Hi {{brandName}} Team,\n\nI saw you're currently running the [Event/Campaign Name] and it looks fantastic! I had an idea for how I could contribute to its success by [Your Idea related to the campaign].\n\nMy audience aligns well with [mention target of campaign], and I'd be thrilled to help amplify {{brandName}}'s message.\n\nBest regards,\n[Your Name]`,
    icon: MegaphoneIcon,
  },
  {
    id: 'template5',
    name: 'Casual Check-In / Fan Note',
    subject: 'Quick hello from a {{brandName}} fan!',
    body: `Hey {{brandName}} Team,\n\nJust wanted to send a quick note to say I continue to be impressed by {{brandName}}'s work in [Brand's Industry/Niche].\n\nIf you ever explore collaborations with creators like me, I'd love to be considered!\n\nKeep up the great work,\n[Your Name]`,
    icon: HandThumbUpIcon,
  },
];

const transformedBrandsData: OutreachBrand[] = mockBrandsFromSearchResults.map(brand => ({
  id: brand.id.toString(),
  name: brand.name,
  logoUrl: brand.logo,
  email: brand.contacts && brand.contacts.length > 0 && brand.contacts[0].email 
         ? brand.contacts[0].email 
         : 'contact@example.com', // Fallback email
  firstEmail: { sent: false },
  followUps: [
    { name: 'Follow-up 1', sent: false },
    { name: 'Follow-up 2', sent: false },
  ],
  notes: '' // Initialize with empty string or undefined
}));

// NEW: Interface for the data structure saved in localStorage
interface StoredOutreachStatus {
  firstEmail: { sent: boolean; date?: string };
  followUps: Array<{ name: string; sent: boolean; date?: string }>;
  notes?: string; // For upcoming edit functionality
}

// Renamed from OutreachTracker to OutreachTrackerComponent
const OutreachTrackerComponent = ({ isPreview = false }: { isPreview?: boolean }) => {
  const [brands, setBrands] = useState<OutreachBrand[]>(transformedBrandsData);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [currentActionDetails, setCurrentActionDetails] = useState<ActionDetails>(null);
  const [selectedTemplateInModal, setSelectedTemplateInModal] = useState<ModalEmailTemplate | null>(null);

  // NEW: State for email templates and edit modal
  const [emailTemplates, setEmailTemplates] = useState<ModalEmailTemplate[]>(emailTemplatesData);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ModalEmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');

  // NEW: State for the brand edit modal
  const [isBrandEditModalOpen, setIsBrandEditModalOpen] = useState(false);
  // Type for editingBrandDetails will combine OutreachBrand and potentially specific form fields
  // For now, let's use a structure that mirrors StoredOutreachStatus plus brand info
  interface EditingBrandModalData extends StoredOutreachStatus {
    id: string;
    name: string;
    currentEmailField: string; // For editing the brand's primary email
  }
  const [editingBrandDetails, setEditingBrandDetails] = useState<Partial<EditingBrandModalData>>(null);

  // NEW: useEffect to load outreach status from localStorage on mount
  useEffect(() => {
    const updatedBrandsFromStorage = brands.map(brandInState => {
      const brandToReturn = { ...brandInState }; // Start with current state brand
      try {
        const localStorageKey = `outreachStatus_${brandInState.id}`;
        const storedStatusJSON = localStorage.getItem(localStorageKey);

        if (storedStatusJSON) {
          const storedStatus = JSON.parse(storedStatusJSON) as StoredOutreachStatus;
          
          // Update firstEmail from localStorage
          if (storedStatus.firstEmail && typeof storedStatus.firstEmail.sent === 'boolean') {
            brandToReturn.firstEmail = {
              sent: storedStatus.firstEmail.sent,
              date: storedStatus.firstEmail.date || (storedStatus.firstEmail.sent ? new Date().toISOString().split('T')[0] : undefined)
            };
          }

          // Update followUps from localStorage
          if (storedStatus.followUps && Array.isArray(storedStatus.followUps)) {
            brandToReturn.followUps = brandToReturn.followUps.map((fuState, index) => {
              const fuStorage = storedStatus.followUps[index];
              if (fuStorage && typeof fuStorage.sent === 'boolean') {
                return {
                  ...fuState, // Keep name from original state
                  sent: fuStorage.sent,
                  date: fuStorage.date || (fuStorage.sent ? new Date().toISOString().split('T')[0] : undefined)
                };
              }
              return fuState;
            });
          }
          // Load notes
          if (typeof storedStatus.notes === 'string') {
            brandToReturn.notes = storedStatus.notes;
          }
        }
      } catch (error) {
        console.error(`Error reading or parsing localStorage for brand ${brandInState.id}:`, error);
      }
      return brandToReturn;
    });

    if (JSON.stringify(brands) !== JSON.stringify(updatedBrandsFromStorage)) {
        setBrands(updatedBrandsFromStorage);
    }
  }, []); // Runs once on mount

  const openTemplateModal = (brand: OutreachBrand, stage: 'firstEmail' | 'followUp', followUpIndex?: number) => {
    setCurrentActionDetails({ brand, stage, followUpIndex });
    setSelectedTemplateInModal(null); // Reset selection
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setCurrentActionDetails(null);
    setSelectedTemplateInModal(null);
  };

  const handleSendEmail = (useBlankEmail: boolean = false) => {
    if (!currentActionDetails) return;

    const { brand, stage, followUpIndex } = currentActionDetails;
    let subject = '';
    let body = '';
    const yourNamePlaceholder = "[Your Name/Brand]";

    if (!useBlankEmail && selectedTemplateInModal) {
      subject = selectedTemplateInModal.subject.replace(/{{brandName}}/g, brand.name).replace(/\[Your Name\/Brand\]/g, yourNamePlaceholder);
      body = selectedTemplateInModal.body.replace(/{{brandName}}/g, brand.name).replace(/\[Your Name\/Brand\]/g, yourNamePlaceholder);
    } else {
      if (stage === 'firstEmail') {
        subject = `Initial Outreach: Collaboration Inquiry with ${brand.name}`;
      } else if (stage === 'followUp' && typeof followUpIndex === 'number') {
        subject = `${brand.followUps[followUpIndex].name}: Following Up with ${brand.name}`;
      }
      body = `Hi ${brand.name} Team,\n\n[Write your email here]\n\nBest,\n${yourNamePlaceholder}`;
    }

    if (brand.email === 'contact@example.com') {
        alert("This brand has no specific contact email configured. Please update it before sending.");
        closeTemplateModal();
        return;
    }

    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const currentDate = new Date().toISOString().split('T')[0];
    // Use the new StoredOutreachStatus interface, initialized carefully
    let updatedOutreachStatusForStorage: Partial<StoredOutreachStatus> = {}; 

    setBrands(prevBrands =>
      prevBrands.map(b => {
        if (b.id === brand.id) {
          const newBrandData = { ...b }; // This will be the full OutreachBrand type
          if (stage === 'firstEmail') {
            newBrandData.firstEmail = { sent: true, date: currentDate };
          } else if (stage === 'followUp' && typeof followUpIndex === 'number') {
            newBrandData.followUps = b.followUps.map((fu, idx) => 
              idx === followUpIndex ? { ...fu, sent: true, date: currentDate } : fu
            );
          }
          // Populate updatedOutreachStatusForStorage with the relevant parts from newBrandData
          updatedOutreachStatusForStorage = {
            firstEmail: { ...newBrandData.firstEmail }, 
            followUps: newBrandData.followUps.map(fu => ({ ...fu })), 
            // notes will be merged from existing or set if new
          };
          return newBrandData;
        }
        return b;
      })
    );

    if (brand.id && updatedOutreachStatusForStorage.firstEmail && updatedOutreachStatusForStorage.followUps) {
      try {
        const localStorageKey = `outreachStatus_${brand.id}`;
        let existingStatus: Partial<StoredOutreachStatus> = {}; // Use Partial here too
        const storedStatusJSON = localStorage.getItem(localStorageKey);
        if (storedStatusJSON) {
            try {
                existingStatus = JSON.parse(storedStatusJSON) as Partial<StoredOutreachStatus>;
            } catch (e) { console.error("Error parsing existing localStorage status:", e); }
        }

        const finalStatusForStorage: StoredOutreachStatus = {
            firstEmail: updatedOutreachStatusForStorage.firstEmail, // Already a full object
            followUps: updatedOutreachStatusForStorage.followUps, // Already a full array
            notes: existingStatus.notes || undefined // Preserve existing notes or keep as undefined
        };

        localStorage.setItem(localStorageKey, JSON.stringify(finalStatusForStorage));
        console.log(`Updated localStorage for brand ${brand.id} from OutreachTracker:`, finalStatusForStorage);
      } catch (error) {
        console.error("Error saving to localStorage from OutreachTracker:", error);
      }
    }
    closeTemplateModal();
  };

  // NEW: Handlers for the edit template modal
  const openEditTemplateModal = (template: ModalEmailTemplate) => {
    setEditingTemplate(template);
    setEditedSubject(template.subject);
    setEditedBody(template.body);
    setIsEditTemplateModalOpen(true);
  };

  const closeEditTemplateModal = () => {
    setIsEditTemplateModalOpen(false);
    setEditingTemplate(null);
    setEditedSubject('');
    setEditedBody('');
  };

  const handleApplyTemplateChanges = () => {
    if (!editingTemplate) return;
    // For now, this just closes the modal. 
    // Later, this could update the template in the `emailTemplates` state or send to an API.
    console.log("Applying changes to template:", editingTemplate.id, "New Subject:", editedSubject, "New Body:", editedBody);
    // Example of updating state if templates were editable:
    setEmailTemplates(prevTemplates => 
      prevTemplates.map(t => 
        t.id === editingTemplate.id ? { ...t, subject: editedSubject, body: editedBody } : t
      )
    );
    closeEditTemplateModal();
  };

  // Function to open the new Brand Edit Modal
  const openBrandEditModal = (brandToEdit: OutreachBrand) => {
    const localStorageKey = `outreachStatus_${brandToEdit.id}`;
    const storedStatusJSON = localStorage.getItem(localStorageKey);
    const currentStatus: Partial<StoredOutreachStatus> = {
        firstEmail: { ...brandToEdit.firstEmail }, // Start with state data
        followUps: brandToEdit.followUps.map(fu => ({...fu})),
        notes: brandToEdit.notes || ''
    };

    if (storedStatusJSON) {
        try {
            const parsedStatus = JSON.parse(storedStatusJSON) as StoredOutreachStatus;
            // Override with localStorage data if more up-to-date or complete
            currentStatus.firstEmail = parsedStatus.firstEmail || currentStatus.firstEmail;
            currentStatus.followUps = parsedStatus.followUps || currentStatus.followUps;
            currentStatus.notes = parsedStatus.notes || currentStatus.notes;
        } catch (e) {
            console.error("Error parsing status for edit modal: ", e);
        }
    }

    setEditingBrandDetails({
        id: brandToEdit.id,
        name: brandToEdit.name,
        currentEmailField: brandToEdit.email, // The brand's current primary email
        firstEmail: currentStatus.firstEmail,
        followUps: currentStatus.followUps,
        notes: currentStatus.notes
    });
    setIsBrandEditModalOpen(true);
  };

  const closeBrandEditModal = () => {
    setIsBrandEditModalOpen(false);
    setEditingBrandDetails(null);
  };

  // Placeholder for saving changes from the Brand Edit Modal
  const handleSaveBrandEdit = () => {
    if (!editingBrandDetails || !editingBrandDetails.id) return;

    const { id, currentEmailField, firstEmail, followUps, notes } = editingBrandDetails;

    // 1. Update localStorage
    const localStorageKey = `outreachStatus_${id}`;
    const statusToSave: StoredOutreachStatus = {
        firstEmail: firstEmail || { sent: false }, // Ensure objects exist
        followUps: followUps || [],
        notes: notes || ''
    };
    localStorage.setItem(localStorageKey, JSON.stringify(statusToSave));
    console.log("Saved to localStorage from Edit Modal: ", statusToSave);

    // 2. Update main 'brands' state to reflect changes immediately
    setBrands(prevBrands => prevBrands.map(b => {
        if (b.id === id) {
            return {
                ...b,
                email: currentEmailField, // Update email if it was changed
                firstEmail: statusToSave.firstEmail,
                followUps: statusToSave.followUps,
                notes: statusToSave.notes
            };
        }
        return b;
    }));

    closeBrandEditModal();
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* <DashboardNav /> */}{/* Removed: Handled by withPreview HOC */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-medium text-charcoal">Outreach Tracker</h1>
            <p className="mt-2 text-taupe">
              Track your brand outreach, manage email templates, and monitor progress.
            </p>
          </div>

          {/* Outreach Table */}
          <div className="bg-white rounded-lg shadow-sm border border-blush/20 overflow-x-auto">
            <div className="min-w-full divide-y divide-blush/20">
              {/* Header */}
              <div className="grid grid-cols-6 gap-x-4 gap-y-2 p-4 bg-rose/5 font-medium text-charcoal text-sm sticky top-0 z-10">
                <div className="col-span-2">Brand</div>
                <div>First Email</div>
                <div>Follow-up 1</div>
                <div>Follow-up 2</div>
                <div>Actions</div>
              </div>

              {/* Rows */}
              {brands.map((brand) => (
                <div key={brand.id} className="grid grid-cols-6 gap-x-4 gap-y-2 p-4 items-start hover:bg-cream/50 transition-colors">
                  {/* Brand Info */}
                  <div className="col-span-2 flex items-start min-w-0">
                    <img src={brand.logoUrl} alt={`${brand.name} logo`} className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="font-medium text-charcoal truncate" title={brand.name}>{brand.name}</p>
                        <p className="text-xs text-taupe truncate" title={brand.email}>{brand.email}</p>
                        {brand.notes && (
                            <p 
                                className="mt-1 text-xs text-gray-600 italic whitespace-normal line-clamp-2" 
                                title={brand.notes}
                            >
                                <span className="font-semibold">Note:</span> {brand.notes}
                            </p>
                        )}
                    </div>
                  </div>

                  {/* First Email */}
                  <div className="flex items-start pt-2">
                    <button 
                        onClick={() => brand.firstEmail.sent ? {} : openTemplateModal(brand, 'firstEmail')}
                        className={`p-2 rounded-md transition-colors ${
                            brand.firstEmail.sent 
                                ? 'text-green-500 cursor-default' 
                                : 'text-taupe hover:text-rose hover:bg-rose/10'
                        }`}
                        title={brand.firstEmail.sent ? `Sent on ${brand.firstEmail.date}` : 'Send first email'}
                        disabled={brand.firstEmail.sent}
                    >
                        {brand.firstEmail.sent ? <CheckCircleIcon className="h-6 w-6"/> : <EnvelopeIcon className="h-6 w-6"/>}
                    </button>
                    {brand.firstEmail.sent && brand.firstEmail.date && (
                        <span className="ml-2 text-xs text-gray-500 hidden sm:inline self-center">({brand.firstEmail.date})</span>
                    )}
                  </div>

                  {/* Follow-ups */}
                  {brand.followUps.map((fu, index) => (
                    <div key={index} className="flex items-start pt-2">
                        <button 
                            onClick={() => fu.sent ? {} : openTemplateModal(brand, 'followUp', index)}
                            className={`p-2 rounded-md transition-colors ${
                                fu.sent 
                                    ? 'text-green-500 cursor-default' 
                                    : 'text-taupe hover:text-rose hover:bg-rose/10'
                            }`}
                            title={fu.sent ? `Sent on ${fu.date}` : `Send ${fu.name}`}
                            disabled={fu.sent}
                        >
                            {fu.sent ? <CheckCircleIcon className="h-6 w-6"/> : <EnvelopeIcon className="h-6 w-6"/>}
                        </button>
                        {fu.sent && fu.date && (
                            <span className="ml-2 text-xs text-gray-500 hidden sm:inline self-center">({fu.date})</span>
                        )}
                    </div>
                  ))}
                  {/* Actions */}
                   <div className="flex items-start pt-2.5">
                     <button 
                        onClick={() => openBrandEditModal(brand)}
                        className="p-2 rounded-md text-taupe hover:text-rose hover:bg-rose/10 transition-colors" 
                        title="Edit or add notes"
                    >
                        <PencilSquareIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New TemplateSelectorModal Component Usage */}
          <TemplateSelectorModal 
            isOpen={isTemplateModalOpen}
            onClose={closeTemplateModal}
            templates={emailTemplates} // This is already ModalEmailTemplate[]
            selectedTemplate={selectedTemplateInModal} // This is ModalEmailTemplate | null
            onSelectTemplate={setSelectedTemplateInModal} // This expects ModalEmailTemplate
            onUseSelectedTemplate={() => handleSendEmail(false)}
            onUseBlankEmail={() => handleSendEmail(true)}
          />

           {/* Updated Email Templates Section */}
           <div className="mt-12">
              <h2 className="text-2xl font-display font-medium text-charcoal mb-6">Available Email Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emailTemplates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <div 
                        key={template.id} 
                        className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-blush/30 flex flex-col"
                        onClick={() => openEditTemplateModal(template)}    
                    >
                        {/* Animated Top Bar */}
                        <div className="h-1.5 bg-[rgb(229,218,248)] relative overflow-hidden"> {/* Specific lavender purple */}
                            <div className="absolute top-0 left-0 w-full h-full 
                                        bg-gradient-to-r from-transparent via-white/80 to-transparent 
                                        transform -translate-x-full group-hover:translate-x-full 
                                        transition-transform duration-700 ease-out">
                            </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between">
                            {/* Top Section: Icon and Name */}
                            <div className="flex items-center space-x-4 mb-4">
                                {IconComponent && (
                                    <div className="p-3 rounded-full bg-[rgb(229,218,248)] flex-shrink-0"> {/* Specific lavender purple */}
                                        <IconComponent 
                                            className="h-8 w-8 text-purple-800" /* Darker purple for icon on lavender */
                                            aria-hidden="true" 
                                        />
                                    </div>
                                )}
                                <h3 className="font-semibold text-charcoal text-lg truncate flex-grow" title={template.name}>
                                    {template.name}
                                </h3>
                            </div>
                            
                            {/* Middle Section: Subject Preview */}
                            <div className="mb-4">
                                <p 
                                    className="text-sm text-taupe line-clamp-3" 
                                    title={template.subject.replace(/{{brandName}}/g, "[Brand Name]")}
                                >
                                   <span className="font-medium text-charcoal/80">Subject:</span> <span className="italic">{template.subject.replace(/{{brandName}}/g, "[Brand Name]")}</span>
                                </p>
                            </div>
                            
                            {/* Bottom Section: Edit Hint */}
                            <div className="mt-auto pt-4 border-t border-blush/20 flex justify-end items-center">
                                <div className="flex items-center text-sm text-charcoal group-hover:font-semibold transition-all">
                                    <span>Edit Template</span>
                                    <PencilSquareIcon className="ml-2 h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      </main>

      {/* New Modal for Editing/Viewing Template */}
      <Transition appear show={isEditTemplateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeEditTemplateModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-charcoal flex justify-between items-center">
                    {editingTemplate?.name || 'Email Template'}
                    <button onClick={closeEditTemplateModal} className="p-1 rounded-md hover:bg-blush/50">
                      <XMarkIcon className="h-5 w-5 text-taupe"/>
                    </button>
                  </Dialog.Title>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="templateSubject" className="block text-sm font-medium text-charcoal mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="templateSubject"
                        id="templateSubject"
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                        value={editedSubject.replace(/{{brandName}}/g, "[Brand Name]")}
                        onChange={(e) => setEditedSubject(e.target.value.replace(/\[Brand Name\]/g, "{{brandName}}"))}
                      />
                    </div>
                    <div>
                      <label htmlFor="templateBody" className="block text-sm font-medium text-charcoal mb-1">
                        Message
                      </label>
                      <textarea
                        name="templateBody"
                        id="templateBody"
                        rows={10}
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50 whitespace-pre-wrap"
                        value={editedBody.replace(/{{brandName}}/g, "[Brand Name]")}
                        onChange={(e) => setEditedBody(e.target.value.replace(/\[Brand Name\]/g, "{{brandName}}"))}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2"
                      onClick={closeEditTemplateModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
                      onClick={handleApplyTemplateChanges}
                    >
                      Apply Template
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* New Modal for Brand Edit */}
      <Transition appear show={isBrandEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeBrandEditModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-charcoal flex justify-between items-center">
                    Edit Brand Details for {editingBrandDetails?.name || 'Brand'}
                    <button onClick={closeBrandEditModal} className="p-1 rounded-md hover:bg-blush/50">
                      <XMarkIcon className="h-5 w-5 text-taupe"/>
                    </button>
                  </Dialog.Title>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="brandNameEdit" className="block text-sm font-medium text-charcoal mb-1">
                        Brand Name (Display Only)
                      </label>
                      <input
                        type="text"
                        name="brandNameEdit"
                        id="brandNameEdit"
                        className="block w-full rounded-md border-blush/50 shadow-sm sm:text-sm p-2 bg-cream/30 text-taupe/80"
                        value={editingBrandDetails?.name || ''}
                        readOnly // Name is for display, not editable here to avoid sync issues with main list
                      />
                    </div>
                    <div>
                      <label htmlFor="brandEmailEdit" className="block text-sm font-medium text-charcoal mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="brandEmailEdit"
                        id="brandEmailEdit"
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                        value={editingBrandDetails?.currentEmailField || ''}
                        onChange={(e) => setEditingBrandDetails(prev => ({ ...prev, currentEmailField: e.target.value }) as EditingBrandModalData)}
                      />
                    </div>
                    {/* First Email Section */}
                    <div className="p-3 border border-blush/20 rounded-md space-y-2">
                       <h4 className="text-xs font-medium text-taupe">First Email</h4>
                       <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="firstEmailSentEdit"
                            id="firstEmailSentEdit"
                            className="h-4 w-4 rounded border-blush/50 focus:ring-rose text-rose"
                            checked={editingBrandDetails?.firstEmail?.sent || false}
                            onChange={(e) => setEditingBrandDetails(prev => ({
                              ...prev,
                              firstEmail: { ...(prev?.firstEmail || { sent: false, date: '' }), sent: e.target.checked }
                            } as EditingBrandModalData))}
                          />
                          <label htmlFor="firstEmailSentEdit" className="text-sm text-charcoal">
                            Sent
                          </label>
                       </div>
                       <input
                          type="date"
                          name="firstEmailDateEdit"
                          id="firstEmailDateEdit"
                          className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                          value={editingBrandDetails?.firstEmail?.date || ''}
                          disabled={!(editingBrandDetails?.firstEmail?.sent)}
                          onChange={(e) => setEditingBrandDetails(prev => ({
                            ...prev,
                            firstEmail: { ...(prev?.firstEmail || { sent: false, date: '' }), date: e.target.value }
                          } as EditingBrandModalData))}
                       />
                    </div>

                    {/* Follow-ups Section - Iterating for Follow-up 1 and 2 */}
                    {editingBrandDetails?.followUps?.map((followUp, idx) => (
                      <div key={`fu-edit-${idx}`} className="p-3 border border-blush/20 rounded-md space-y-2">
                        <h4 className="text-xs font-medium text-taupe">{followUp.name || `Follow-up ${idx + 1}`}</h4>
                        <div className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             name={`followUp${idx}SentEdit`}
                             id={`followUp${idx}SentEdit`}
                             className="h-4 w-4 rounded border-blush/50 focus:ring-rose text-rose"
                             checked={followUp.sent || false}
                             onChange={(e) => {
                               const newFollowUps = [...(editingBrandDetails.followUps || [])];
                               if(newFollowUps[idx]) newFollowUps[idx] = { ...newFollowUps[idx], sent: e.target.checked };
                               setEditingBrandDetails(prev => ({ ...prev, followUps: newFollowUps } as EditingBrandModalData));
                             }}
                           />
                           <label htmlFor={`followUp${idx}SentEdit`} className="text-sm text-charcoal">
                             Sent
                           </label>
                        </div>
                        <input
                           type="date"
                           name={`followUp${idx}DateEdit`}
                           id={`followUp${idx}DateEdit`}
                           className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                           value={followUp.date || ''}
                           disabled={!followUp.sent}
                           onChange={(e) => {
                             const newFollowUps = [...(editingBrandDetails.followUps || [])];
                             if(newFollowUps[idx]) newFollowUps[idx] = { ...newFollowUps[idx], date: e.target.value };
                             setEditingBrandDetails(prev => ({ ...prev, followUps: newFollowUps } as EditingBrandModalData));
                           }}
                        />
                      </div>
                    ))}

                    <div>
                      <label htmlFor="notesEdit" className="block text-sm font-medium text-charcoal mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notesEdit"
                        id="notesEdit"
                        rows={4} // Increased rows for better UX
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50 whitespace-pre-wrap"
                        value={editingBrandDetails?.notes || ''}
                        onChange={(e) => setEditingBrandDetails(prev => ({ ...prev, notes: e.target.value } as EditingBrandModalData))}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2"
                      onClick={closeBrandEditModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
                      onClick={handleSaveBrandEdit}
                    >
                      Save Changes
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

// Export the HOC-wrapped component as the default
export default withPreview(OutreachTrackerComponent); 