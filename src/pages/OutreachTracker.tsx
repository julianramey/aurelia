import React, { useState, Fragment } from 'react';
import DashboardNav from '../components/DashboardNav';
import { CheckCircleIcon, PencilSquareIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

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
}

// NEW: Named type for action details
type ActionDetails =
  | { brand: OutreachBrand; stage: 'firstEmail' | 'followUp'; followUpIndex?: number }
  | null;

// NEW: Email Template Interface
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

// NEW: Mock Email Templates
const emailTemplatesData: EmailTemplate[] = [
  {
    id: 'template1',
    name: 'Initial Introduction',
    subject: 'Collaboration Inquiry: {{brandName}} x [Your Name/Brand]',
    body: `Hi {{brandName}} Team,\n\nMy name is [Your Name] and I'm a [Your Title/Niche] with a passion for [mention something relevant to the brand]. I've been a long-time admirer of {{brandName}} and how you [mention specific positive aspect].\n\nI believe my audience of [mention audience size/demographics] would resonate strongly with your products/message. I'd love to discuss potential collaboration opportunities.\n\nAre you available for a quick chat next week?\n\nBest,\n[Your Name]\n[Your Website/Social Link]`
  },
  {
    id: 'template2',
    name: 'Follow-Up (No Response)',
    subject: 'Following Up: Collaboration Inquiry with {{brandName}}',
    body: `Hi {{brandName}} Team,\n\nI hope this email finds you well.\n\nI recently reached out regarding a potential collaboration between {{brandName}} and myself. I understand you're busy, so I wanted to gently follow up on my previous email.\n\nI'm still very enthusiastic about the possibility of working together and believe it could be a great fit. You can see more of my work here: [Your Portfolio/Media Kit Link].\n\nWould you be open to a brief discussion?\n\nThanks,\n[Your Name]`
  },
  {
    id: 'template3',
    name: 'Specific Product Pitch',
    subject: 'Idea for {{brandName}}: Featuring [Specific Product]',
    body: `Hi {{brandName}} Team,\n\nI'm particularly excited about your new [Specific Product Name] and I have a creative idea for how I could feature it to my audience. [Briefly explain your content idea].\n\nI think this would genuinely engage my followers and showcase {{brandName}}'s [Specific Product] in a unique light.\n\nLet me know if this sounds interesting!\n\nCheers,\n[Your Name]`
  },
  {
    id: 'template4',
    name: 'Event/Campaign Tie-In',
    subject: '{{brandName}} x [Your Name] for your [Event/Campaign Name]?',
    body: `Hi {{brandName}} Team,\n\nI saw you're currently running the [Event/Campaign Name] and it looks fantastic! I had an idea for how I could contribute to its success by [Your Idea related to the campaign].\n\nMy audience aligns well with [mention target of campaign], and I'd be thrilled to help amplify {{brandName}}'s message.\n\nBest regards,\n[Your Name]`
  },
  {
    id: 'template5',
    name: 'Quick & Casual Check-In',
    subject: 'Quick hello from a {{brandName}} fan!',
    body: `Hey {{brandName}} Team,\n\nJust wanted to send a quick note to say I continue to be impressed by {{brandName}}'s work in [Brand's Industry/Niche].\n\nIf you ever explore collaborations with creators like me, I'd love to be considered!\n\nKeep up the great work,\n[Your Name]`
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
}));

export default function OutreachTracker() {
  const [brands, setBrands] = useState<OutreachBrand[]>(transformedBrandsData);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [currentActionDetails, setCurrentActionDetails] = useState<ActionDetails>(null);
  const [selectedTemplateInModal, setSelectedTemplateInModal] = useState<EmailTemplate | null>(null);

  // NEW: State for email templates and edit modal
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(emailTemplatesData);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');

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
    const yourNamePlaceholder = "[Your Name/Brand]"; // Potentially replace with profile data later

    if (!useBlankEmail && selectedTemplateInModal) {
      subject = selectedTemplateInModal.subject.replace(/{{brandName}}/g, brand.name).replace(/\[Your Name\/Brand\]/g, yourNamePlaceholder);
      body = selectedTemplateInModal.body.replace(/{{brandName}}/g, brand.name).replace(/\[Your Name\/Brand\]/g, yourNamePlaceholder);
    } else {
      // Generic email logic
      if (stage === 'firstEmail') {
        subject = `Initial Outreach: Collaboration Inquiry with ${brand.name}`;
      } else if (stage === 'followUp' && typeof followUpIndex === 'number') {
        subject = `${brand.followUps[followUpIndex].name}: Following Up with ${brand.name}`;
      }
      body = `Hi ${brand.name} Team,\n\n[Write your email here]\n\nBest,\n${yourNamePlaceholder}`; // Using template literal for blank body as well
    }

    if (brand.email === 'contact@example.com') {
        alert("This brand has no specific contact email configured. Please update it before sending.");
        closeTemplateModal();
        return;
    }

    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Update brand status
    setBrands(prevBrands =>
      prevBrands.map(b => {
        if (b.id === brand.id) {
          if (stage === 'firstEmail') {
            return { ...b, firstEmail: { sent: true, date: new Date().toISOString().split('T')[0] } };
          } else if (stage === 'followUp' && typeof followUpIndex === 'number') {
            const updatedFollowUps = b.followUps.map((fu, idx) => 
              idx === followUpIndex ? { ...fu, sent: true, date: new Date().toISOString().split('T')[0] } : fu
            );
            return { ...b, followUps: updatedFollowUps };
          }
        }
        return b;
      })
    );
    closeTemplateModal();
  };

  // NEW: Handlers for the edit template modal
  const openEditTemplateModal = (template: EmailTemplate) => {
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

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
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
                <div key={brand.id} className="grid grid-cols-6 gap-x-4 gap-y-2 p-4 items-center hover:bg-cream/50 transition-colors">
                  {/* Brand Info */}
                  <div className="col-span-2 flex items-center min-w-0"> {/* Added min-w-0 for truncation */}
                    <img src={brand.logoUrl} alt={`${brand.name} logo`} className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                    <div className="min-w-0"> {/* Added min-w-0 for truncation */}
                        <p className="font-medium text-charcoal truncate" title={brand.name}>{brand.name}</p>
                        <p className="text-xs text-taupe truncate" title={brand.email}>{brand.email}</p>
                    </div>
                  </div>

                  {/* First Email */}
                  <div className="flex items-center">
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
                        <span className="ml-2 text-xs text-gray-500 hidden sm:inline">({brand.firstEmail.date})</span>
                    )}
                  </div>

                  {/* Follow-ups */}
                  {brand.followUps.map((fu, index) => (
                    <div key={index} className="flex items-center">
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
                            <span className="ml-2 text-xs text-gray-500 hidden sm:inline">({fu.date})</span>
                        )}
                    </div>
                  ))}
                  {/* Actions */}
                   <div className="flex items-center">
                     <button 
                        onClick={() => alert('Future: Edit Brand/Notes. Email: ' + brand.email)}
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

          {/* Template Selection Modal */}
          <Transition appear show={isTemplateModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeTemplateModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-charcoal flex justify-between items-center">
                        Choose an Email Template
                        <button onClick={closeTemplateModal} className="p-1 rounded-md hover:bg-blush/50">
                            <XMarkIcon className="h-5 w-5 text-taupe"/>
                        </button>
                      </Dialog.Title>
                      <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                        {emailTemplates.map((template) => (
                          <div 
                            key={template.id}
                            onClick={() => setSelectedTemplateInModal(template)}
                            className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                                selectedTemplateInModal?.id === template.id ? 'border-rose ring-2 ring-rose bg-rose/5' : 'border-blush/30 bg-cream/30'
                            }`}
                          >
                            <p className="font-semibold text-charcoal">{template.name}</p>
                            <p className="text-sm text-taupe mt-1">Subject: {template.subject.substring(0, 100) + (template.subject.length > 100 ? '...' : '')}</p>
                            {selectedTemplateInModal?.id === template.id && (
                                <p className="text-xs text-charcoal mt-2 whitespace-pre-line bg-cream p-2 rounded-md">{template.body.substring(0,200) + (template.body.length > 200 ? '...':'')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blush/20 px-4 py-2 text-sm font-medium text-rose hover:bg-blush/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
                          onClick={closeTemplateModal}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-taupe/20 px-4 py-2 text-sm font-medium text-charcoal hover:bg-taupe/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2"
                          onClick={() => handleSendEmail(true)}
                        >
                          Use Blank Email
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 disabled:opacity-50"
                          onClick={() => handleSendEmail(false)}
                          disabled={!selectedTemplateInModal}
                        >
                          Use Selected Template
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

           {/* Updated Email Templates Section */}
           <div className="mt-12">
              <h2 className="text-2xl font-display font-medium text-charcoal mb-4">Available Email Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emailTemplates.map(template => (
                    <div 
                        key={template.id} 
                        className="bg-white p-5 rounded-lg shadow-sm border border-blush/20 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => openEditTemplateModal(template)}    
                    >
                        <h3 className="font-semibold text-charcoal text-lg mb-1">{template.name}</h3>
                        <p className="text-sm text-taupe truncate">Subject: <span className="italic">{template.subject.replace(/{{brandName}}/g, "[Brand Name]").substring(0, 70) + (template.subject.length > 70 ? '...' : '')}</span></p>
                    </div>
                ))}
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
                        onChange={(e) => setEditedSubject(e.target.value.replace(/\\[Brand Name\\]/g, "{{brandName}}"))}
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
                        onChange={(e) => setEditedBody(e.target.value.replace(/\\[Brand Name\\]/g, "{{brandName}}"))}
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
    </div>
  );
} 