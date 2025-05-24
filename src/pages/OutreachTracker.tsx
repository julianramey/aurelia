import React, { useState, Fragment, useEffect } from 'react';
// import DashboardNav from '../components/DashboardNav'; // Removed: Handled by withPreview HOC
import { CheckCircleIcon, PencilSquareIcon, EnvelopeIcon, XMarkIcon, SparklesIcon, BoltIcon, ArrowPathRoundedSquareIcon, LightBulbIcon, MegaphoneIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { withPreview } from '@/lib/withPreview'; // Added HOC import
import TemplateSelectorModal from '@/components/modals/TemplateSelectorModal'; // CORRECTED IMPORT
import { supabase } from '@/lib/supabase'; // Import Supabase client
import {
  getOutreachStatusesForUser,
  upsertOutreachStatus,
  deleteOutreachStatus,
  UserOutreachStatus,
  getUserEmailTemplates, // Import the new email template helper
  upsertUserEmailTemplate, // Import the new upsert helper
  deleteUserEmailTemplate, // IMPORT THE NEW DELETE HELPER
  UserEmailTemplate,      // Import the new interface
  iconMap               // Import iconMap if needed for direct use (optional here)
} from '@/lib/supabaseHelpers';
import { SupabaseBrand } from '@/types'; // Assuming SupabaseBrand is a good representation of your companies table row

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
  contact_email?: string; // from companies table
}

// Data from SearchResults.tsx (subset for brevity in example, real one is longer)
// const mockBrandsFromSearchResults: SearchResultBrand[] = [ ... ]; // This line and its content should be gone if not used

interface FollowUp {
  name: string;
  sent: boolean;
  date?: string | null; // Allow null from DB
}

interface OutreachBrand {
  id: number; // brand_id from companies table
  name: string;
  logoUrl: string;
  email: string; // The email to use for outreach (could be primary contact or generic)
  firstEmail: {
    sent: boolean;
    date?: string | null;
  };
  followUps: FollowUp[];
  notes?: string | null;
}

// Type for action details
type ActionDetails =
  | { brand: OutreachBrand; stage: 'firstEmail' | 'followUp'; followUpIndex?: number }
  | null;

// REMOVE THIS ENTIRE BLOCK for emailTemplatesData
// const emailTemplatesData: UserEmailTemplate[] = [
//   {
//     id: 'template1',
//     name: 'Warm Initial Introduction',
//     category: 'Initial Outreach',
//     subject: 'Collaboration Inquiry: {{brandName}} x [Your Name/Brand]',
//     body: `Hi {{brandName}} Team,\n\nMy name is [Your Name] and I'm a [Your Title/Niche] with a passion for [mention something relevant to the brand]. I've been a long-time admirer of {{brandName}} and how you [mention specific positive aspect].\n\nI believe my audience of [mention audience size/demographics] would resonate strongly with your products/message. I'd love to discuss potential collaboration opportunities.\n\nAre you available for a quick chat next week?\n\nBest,\n[Your Name]\n[Your Website/Social Link]`,
//     icon_name: 'SparklesIcon', // Changed from icon to icon_name, is_custom will be set by helper
//   },
  // ... (other mock templates here if they existed) ...
// ];

// const transformedBrandsData: OutreachBrand[] = mockBrandsFromSearchResults.map(brand => ({ ... })); // This line and its content should be gone if not used

// NEW: Interface for the data structure saved in localStorage -- THIS SHOULD HAVE BEEN REMOVED EARLIER
// interface StoredOutreachStatus { ... } // This line and its content should be gone if not used

// Renamed from OutreachTracker to OutreachTrackerComponent
const OutreachTrackerComponent = ({ isPreview = false }: { isPreview?: boolean }) => {
  const [brands, setBrands] = useState<OutreachBrand[]>([]);
  const [allFetchedBrands, setAllFetchedBrands] = useState<OutreachBrand[]>([]); // To store all fetched brands
  const [isShowingAll, setIsShowingAll] = useState(false); // To track if all brands are shown
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true); // For template loading state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [currentActionDetails, setCurrentActionDetails] = useState<ActionDetails>(null);
  const [selectedTemplateInModal, setSelectedTemplateInModal] = useState<UserEmailTemplate | null>(null); // Changed type

  // NEW: State for email templates fetched from Supabase/defaults
  const [emailTemplates, setEmailTemplates] = useState<UserEmailTemplate[]>([]); // Changed type
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserEmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedCategory, setEditedCategory] = useState('Custom'); // Re-added, with default
  const [selectedIconName, setSelectedIconName] = useState<string | undefined>('PencilSquareIcon'); // Re-added, with default

  // NEW: State for the brand edit modal
  const [isBrandEditModalOpen, setIsBrandEditModalOpen] = useState(false);
  // Type for editingBrandDetails will combine OutreachBrand and potentially specific form fields
  // For now, let's use a structure that mirrors StoredOutreachStatus plus brand info
  interface EditingBrandModalData extends UserOutreachStatus {
    brand_id: number; // id is brand_id here
    name: string; // For display
    currentEmailField: string;
  }
  const [editingBrandDetails, setEditingBrandDetails] = useState<Partial<EditingBrandModalData> | null>(null);

  // State for delete confirmation modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [brandToDeleteDetails, setBrandToDeleteDetails] = useState<{ id: number; name: string } | null>(null);

  // NEW: State for template deletion confirmation modal
  const [isDeleteTemplateConfirmModalOpen, setIsDeleteTemplateConfirmModalOpen] = useState(false);
  const [templateToDeleteDetails, setTemplateToDeleteDetails] = useState<UserEmailTemplate | null>(null);

  const INITIAL_BRAND_DISPLAY_COUNT = 5;

  useEffect(() => {
    const fetchTrackedBrandsAndTemplates = async () => {
      setIsLoading(true);
      setIsLoadingTemplates(true);

      // Fetch Outreach Statuses (existing logic)
      const outreachStatuses = await getOutreachStatusesForUser();
      if (!outreachStatuses) {
        // Handle case where outreachStatuses itself is null, though getOutreachStatusesForUser returns [] on error/no user
        setAllFetchedBrands([]);
        setBrands([]);
        setIsShowingAll(true);
      } else if (outreachStatuses.length === 0) {
        setAllFetchedBrands([]);
        setBrands([]);
        setIsShowingAll(true);
      } else {
        const brandIdsToFetch = outreachStatuses.map(status => status.brand_id);
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .in('id', brandIdsToFetch);

        if (companyError) {
          console.error("Error fetching company details for tracked brands:", companyError);
          setAllFetchedBrands([]);
          setBrands([]);
        } else {
          const companiesMap = new Map(companyData.map(company => [company.id, company as SupabaseBrand]));
          const mergedBrands = outreachStatuses.map(status => {
            const sourceBrand = companiesMap.get(status.brand_id);
            if (!sourceBrand) {
              console.warn(`Company data not found for brand_id: ${status.brand_id}`);
              return null;
            }
            let outreachEmail = status.outreach_email_used || '';
            if (!outreachEmail) {
              if (sourceBrand.decision_maker_email_1) outreachEmail = sourceBrand.decision_maker_email_1;
              else if (sourceBrand.decision_maker_email_2) outreachEmail = sourceBrand.decision_maker_email_2;
              else if (sourceBrand.decision_maker_email_3) outreachEmail = sourceBrand.decision_maker_email_3;
              else if (sourceBrand.contact_email) outreachEmail = sourceBrand.contact_email;
              if (!outreachEmail) outreachEmail = `contact@${sourceBrand.brand_name.toLowerCase().replace(/\s+/g, '')}.com`;
            }
            return {
              id: sourceBrand.id,
              name: sourceBrand.brand_name,
              logoUrl: sourceBrand.favicon_url || '',
              email: outreachEmail,
              firstEmail: { sent: status.first_email_sent || false, date: status.first_email_date || null },
              followUps: [
                { name: 'Follow-up 1', sent: status.follow_up_1_sent || false, date: status.follow_up_1_date || null },
                { name: 'Follow-up 2', sent: status.follow_up_2_sent || false, date: status.follow_up_2_date || null },
              ],
              notes: status.notes || null,
            };
          }).filter(brand => brand !== null) as OutreachBrand[];
          
          setAllFetchedBrands(mergedBrands);
          setBrands(mergedBrands.slice(0, INITIAL_BRAND_DISPLAY_COUNT));
          setIsShowingAll(mergedBrands.length <= INITIAL_BRAND_DISPLAY_COUNT);
        }
      }
      setIsLoading(false); // Loading for brands done

      // Fetch Email Templates
      const fetchedTemplates = await getUserEmailTemplates();
      setEmailTemplates(fetchedTemplates);
      setIsLoadingTemplates(false); // Loading for templates done
    };

    if (!isPreview) {
      fetchTrackedBrandsAndTemplates();
    } else {
      // Minimal setup for preview mode if needed, or just empty states
      setBrands([]);
      setAllFetchedBrands([]);
      setEmailTemplates([]); // Set empty or mock preview templates
      setIsLoading(false);
      setIsLoadingTemplates(false);
    }
  }, [isPreview]);

  const openTemplateModal = (brand: OutreachBrand, stage: 'firstEmail' | 'followUp', followUpIndex?: number) => {
    setCurrentActionDetails({ brand, stage, followUpIndex });
    setSelectedTemplateInModal(null);
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setCurrentActionDetails(null);
    setSelectedTemplateInModal(null);
  };

  const handleSendEmail = async (useBlankEmail: boolean = false) => {
    if (!currentActionDetails) return;
    if (isPreview) { closeTemplateModal(); return; }

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

    const isGenericEmail = brand.email.startsWith('contact@') && brand.email.endsWith('.com') && !brand.email.substring(8, brand.email.length - 4).includes('.');
    if (isGenericEmail && brand.email.toLowerCase() === `contact@${brand.name.toLowerCase().replace(/s+/g, '')}.com`) {
        alert("This brand appears to have a generic fallback email. Please verify or update it to a specific contact email in the brand details before sending.");
        closeTemplateModal();
        return;
    }

    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const currentDate = new Date().toISOString().split('T')[0];
    const outreachUpdate: Partial<UserOutreachStatus> & { brand_id: number } = { brand_id: brand.id };
    
    const originalBrands = [...brands];
    setBrands(prevBrands =>
      prevBrands.map(b => {
        if (b.id === brand.id) {
          const newBrandData = { ...b };
          if (stage === 'firstEmail') {
            newBrandData.firstEmail = { sent: true, date: currentDate };
            outreachUpdate.first_email_sent = true;
            outreachUpdate.first_email_date = currentDate;
          } else if (stage === 'followUp' && typeof followUpIndex === 'number') {
            newBrandData.followUps = b.followUps.map((fu, idx) => {
              if (idx === followUpIndex) {
                if (idx === 0) { outreachUpdate.follow_up_1_sent = true; outreachUpdate.follow_up_1_date = currentDate; }
                if (idx === 1) { outreachUpdate.follow_up_2_sent = true; outreachUpdate.follow_up_2_date = currentDate; }
                return { ...fu, sent: true, date: currentDate };
              }
              return fu;
            });
          }
          return newBrandData;
        }
        return b;
      })
    );

    closeTemplateModal();

    const result = await upsertOutreachStatus(outreachUpdate);
    if (!result) {
      console.error("Failed to save outreach status to Supabase. Reverting optimistic update.");
      setBrands(originalBrands); 
    } else {
      setBrands(prevBrands => prevBrands.map(b => {
        if (b.id === result.brand_id) {
          return {
            ...b,
            firstEmail: { sent: result.first_email_sent ?? false, date: result.first_email_date },
            followUps: [
              { name: 'Follow-up 1', sent: result.follow_up_1_sent ?? false, date: result.follow_up_1_date },
              { name: 'Follow-up 2', sent: result.follow_up_2_sent ?? false, date: result.follow_up_2_date },
            ],
            notes: result.notes,
          };
        }
        return b;
      }));
    }
  };

  // NEW: Handlers for the edit template modal
  const openEditTemplateModal = (template: UserEmailTemplate | null) => { // Allow null for create mode
    if (template) { // Editing existing template
      setEditingTemplate(template);
      setEditedName(template.name);
      setEditedSubject(template.subject);
      setEditedBody(template.body);
      // For existing templates, category and icon are not directly edited via these states
      // They are preserved from `template.category` and `template.icon_name` in `handleApplyTemplateChanges`
      // However, we can set the display states for consistency if needed, though inputs will be disabled for them.
      setEditedCategory(template.category); 
      setSelectedIconName(template.icon_name || undefined);
    } else { // Creating a new template
      setEditingTemplate({ 
        id: 'new-template-marker', // Special ID to signify create mode
        name: '',
        subject: '',
        body: '',
        category: 'Custom', 
        icon_name: 'PencilSquareIcon',
        is_custom: true, 
        // user_id will be set by Supabase helper or can be added if user object is available here
      } as UserEmailTemplate); // Cast as UserEmailTemplate, knowing some fields are for UI logic
      setEditedName('');
      setEditedSubject('');
      setEditedBody('');
      setEditedCategory('Custom'); // Default for new
      setSelectedIconName('PencilSquareIcon'); // Default for new
    }
    setIsEditTemplateModalOpen(true);
  };

  const closeEditTemplateModal = () => {
    setIsEditTemplateModalOpen(false);
    setEditingTemplate(null); // Clear editing template
    setEditedName('');
    setEditedSubject('');
    setEditedBody('');
    setEditedCategory('Custom'); // Reset to default
    setSelectedIconName('PencilSquareIcon'); // Reset to default
  };

  // NEW: Modal management functions for template deletion
  const openDeleteTemplateConfirmModal = (template: UserEmailTemplate) => {
    if (!template || !template.is_custom) {
      // This should ideally not be callable if template isn't custom, but as a safeguard:
      alert("Only custom templates can be deleted.");
      return;
    }
    setTemplateToDeleteDetails(template);
    setIsDeleteTemplateConfirmModalOpen(true);
  };

  const closeDeleteTemplateConfirmModal = () => {
    setIsDeleteTemplateConfirmModalOpen(false);
    setTemplateToDeleteDetails(null);
  };

  const handleApplyTemplateChanges = async () => {
    if (!editingTemplate) return;

    const isCreatingNew = editingTemplate.id === 'new-template-marker';

    if (isPreview) {
      // Simplified local update for preview mode
      const newPreviewTemplate = {
        ...editingTemplate,
        id: isCreatingNew ? `preview-${Date.now()}` : editingTemplate.id,
        name: editedName,
        subject: editedSubject,
        body: editedBody,
        category: isCreatingNew ? editedCategory : editingTemplate.category,
        icon_name: isCreatingNew ? selectedIconName : editingTemplate.icon_name,
        IconComponent: (isCreatingNew ? selectedIconName : editingTemplate.icon_name) 
                         ? iconMap[(isCreatingNew ? selectedIconName : editingTemplate.icon_name) as string] 
                         : undefined,
        is_custom: true,
      };
      setEmailTemplates(prevTemplates => 
        isCreatingNew 
          ? [...prevTemplates, newPreviewTemplate]
          : prevTemplates.map(t => t.id === editingTemplate.id ? newPreviewTemplate : t)
      );
      closeEditTemplateModal();
      return;
    }

    let templatePayload: Partial<UserEmailTemplate>;

    if (isCreatingNew) {
      templatePayload = {
        // No id for new template, Supabase will generate it
        name: editedName,
        subject: editedSubject,
        body: editedBody,
        category: editedCategory,
        icon_name: selectedIconName,
        is_custom: true,
        original_template_id: null, // Not based on a default
      };
    } else {
      // Editing an existing template (either a default being customized or an existing custom one)
      templatePayload = {
        id: editingTemplate.id,
        name: editedName,
        subject: editedSubject,
        body: editedBody,
        category: editingTemplate.category, // Preserve original category
        icon_name: editingTemplate.icon_name, // Preserve original icon_name
        is_custom: editingTemplate.is_custom,
        user_id: editingTemplate.user_id,
        original_template_id: editingTemplate.original_template_id
      };
      // If editing a default template for the first time, its `is_custom` will be false.
      // `upsertUserEmailTemplate` handles creating a new custom record in this case.
      if (!editingTemplate.is_custom) {
        templatePayload.original_template_id = editingTemplate.id;
      }
    }

    const upsertedTemplate = await upsertUserEmailTemplate(templatePayload);

    if (upsertedTemplate) {
      setEmailTemplates(prevTemplates => {
        if (isCreatingNew) {
          return [...prevTemplates, upsertedTemplate];
        }
        // Update existing or replace default with its new custom version
        const idx = prevTemplates.findIndex(t => t.id === (upsertedTemplate.original_template_id === editingTemplate.id ? editingTemplate.id : upsertedTemplate.id) );
        if (idx !== -1) {
          const newTemplates = [...prevTemplates];
          newTemplates[idx] = upsertedTemplate;
          return newTemplates;
        } else {
           // Should not happen if editing existing, but as a fallback for create if not caught by isCreatingNew
          return [...prevTemplates, upsertedTemplate]; 
        }
      });
      closeEditTemplateModal();
    } else {
      alert('Failed to save template. Please try again.');
    }
  };

  // NEW: Handles the actual deletion of a template after confirmation
  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDeleteDetails || !templateToDeleteDetails.id || !templateToDeleteDetails.is_custom) {
      alert("Cannot delete this template."); // Should not happen if UI is correct
      closeDeleteTemplateConfirmModal();
      return;
    }

    if (isPreview) {
      // Local removal for preview
      setEmailTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateToDeleteDetails.id));
      alert("Template deleted (preview mode).");
      closeDeleteTemplateConfirmModal();
      closeEditTemplateModal(); // Also close the edit modal
      return;
    }

    const success = await deleteUserEmailTemplate(templateToDeleteDetails.id);
    if (success) {
      setEmailTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateToDeleteDetails.id));
      // Add a success toast if desired
      closeDeleteTemplateConfirmModal();
      closeEditTemplateModal(); // Also close the edit modal
    } else {
      alert("Failed to delete template. Please try again.");
      // Keep modals open for user to see details or retry, or close them based on preference
      // For now, just closing the confirm modal.
      closeDeleteTemplateConfirmModal();
    }
  };

  // Function to open the new Brand Edit Modal
  const openBrandEditModal = (brandToEdit: OutreachBrand) => {
    const currentStatus: UserOutreachStatus = {
        brand_id: brandToEdit.id,
        first_email_sent: brandToEdit.firstEmail.sent,
        first_email_date: brandToEdit.firstEmail.date,
        follow_up_1_sent: brandToEdit.followUps[0]?.sent || false,
        follow_up_1_date: brandToEdit.followUps[0]?.date || null,
        follow_up_2_sent: brandToEdit.followUps[1]?.sent || false,
        follow_up_2_date: brandToEdit.followUps[1]?.date || null,
        notes: brandToEdit.notes || ''
    };

    setEditingBrandDetails({
        ...currentStatus,
        name: brandToEdit.name,
        currentEmailField: brandToEdit.email,
    });
    setIsBrandEditModalOpen(true);
  };

  const closeBrandEditModal = () => {
    setIsBrandEditModalOpen(false);
    setEditingBrandDetails(null);
  };

  const handleSaveBrandEdit = async () => {
    if (!editingBrandDetails || !editingBrandDetails.brand_id) return;
    if (isPreview) { closeBrandEditModal(); return; }

    const { brand_id, currentEmailField, first_email_sent, first_email_date, follow_up_1_sent, follow_up_1_date, follow_up_2_sent, follow_up_2_date, notes } = editingBrandDetails;

    const outreachDataToSave: UserOutreachStatus = {
        brand_id,
        first_email_sent: first_email_sent || false,
        first_email_date: first_email_sent ? (first_email_date || new Date().toISOString().split('T')[0]) : null,
        follow_up_1_sent: follow_up_1_sent || false,
        follow_up_1_date: follow_up_1_sent ? (follow_up_1_date || new Date().toISOString().split('T')[0]) : null,
        follow_up_2_sent: follow_up_2_sent || false,
        follow_up_2_date: follow_up_2_sent ? (follow_up_2_date || new Date().toISOString().split('T')[0]) : null,
        notes: notes || null,
        outreach_email_used: currentEmailField // Save the edited/confirmed email here
    };

    const originalBrands = [...brands];
    setBrands(prevBrands => prevBrands.map(b => {
        if (b.id === brand_id) {
            return {
                ...b,
                email: currentEmailField, 
                firstEmail: { sent: outreachDataToSave.first_email_sent ?? false, date: outreachDataToSave.first_email_date },
                followUps: [
                    { name: 'Follow-up 1', sent: outreachDataToSave.follow_up_1_sent ?? false, date: outreachDataToSave.follow_up_1_date },
                    { name: 'Follow-up 2', sent: outreachDataToSave.follow_up_2_sent ?? false, date: outreachDataToSave.follow_up_2_date },
                ],
                notes: outreachDataToSave.notes
            };
        }
        return b;
    }));
    
    closeBrandEditModal();

    const result = await upsertOutreachStatus(outreachDataToSave);

    if (!result) {
        console.error("Failed to save brand edit to Supabase. Reverting optimistic update.");
        setBrands(originalBrands); // Revert
        // Show error to user
    } else {
      // Optional: Re-sync with exact data from Supabase if necessary
      setBrands(prevBrands => prevBrands.map(b => {
        if (b.id === result.brand_id) {
          return {
            ...b,
            email: result.outreach_email_used || currentEmailField, // Prioritize DB value, fallback to submitted
            firstEmail: { sent: result.first_email_sent ?? false, date: result.first_email_date },
            followUps: [
              { name: 'Follow-up 1', sent: result.follow_up_1_sent ?? false, date: result.follow_up_1_date },
              { name: 'Follow-up 2', sent: result.follow_up_2_sent ?? false, date: result.follow_up_2_date },
            ],
            notes: result.notes,
          };
        }
        return b;
      }));
    }
  };

  // NEW: Opens the delete confirmation modal
  const openDeleteConfirmModal = (brandDetails: { id: number; name: string } | undefined) => {
    if (!brandDetails || brandDetails.id === undefined) {
      console.error("Cannot open delete confirmation: brand details are undefined.");
      return;
    }
    setBrandToDeleteDetails(brandDetails);
    setIsDeleteConfirmModalOpen(true);
  };

  // NEW: Closes the delete confirmation modal
  const closeDeleteConfirmModal = () => {
    setIsDeleteConfirmModalOpen(false);
    setBrandToDeleteDetails(null);
  };

  // NEW: Handles the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!brandToDeleteDetails) return;
    if (isPreview) {
      alert("Deletion is disabled in preview mode.");
      closeDeleteConfirmModal();
      closeBrandEditModal(); // Also close the edit modal
      return;
    }

    const success = await deleteOutreachStatus(brandToDeleteDetails.id);
    if (success) {
      setBrands(prevBrands => prevBrands.filter(b => b.id !== brandToDeleteDetails.id));
      // Optionally, add a success toast notification here
    } else {
      alert("Failed to remove brand from outreach history. Please try again.");
    }
    closeDeleteConfirmModal();
    closeBrandEditModal(); // Ensure edit modal is closed regardless of success/failure of delete
  };

  const handleToggleShowAll = () => {
    if (isShowingAll) {
      setBrands(allFetchedBrands.slice(0, INITIAL_BRAND_DISPLAY_COUNT));
      setIsShowingAll(false);
    } else {
      setBrands(allFetchedBrands);
      setIsShowingAll(true);
    }
  };

  if ((isLoading || isLoadingTemplates) && !isPreview) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose"></div>
        <p className="ml-4 text-taupe">Loading outreach data & templates...</p>
      </div>
    );
  }

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

          {brands.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-blush/20">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-taupe/50" />
              <h3 className="mt-2 text-lg font-medium text-charcoal">No outreach started yet.</h3>
              <p className="mt-1 text-sm text-taupe">
                Start emailing brands from the Search Results page, and they'll appear here!
              </p>
            </div>
          )}

          {brands.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-blush/20 overflow-x-auto">
              <div className="min-w-full divide-y divide-blush/20">
                <div className="grid grid-cols-6 gap-x-4 gap-y-2 p-4 bg-rose/5 font-medium text-charcoal text-sm sticky top-0 z-10">
                  <div className="col-span-2">Brand</div>
                  <div>First Email</div>
                  <div>Follow-up 1</div>
                  <div>Follow-up 2</div>
                  <div>Actions</div>
                </div>

                {brands.map((brand) => (
                  <div key={brand.id} className="grid grid-cols-6 gap-x-4 gap-y-2 p-4 items-start hover:bg-cream/50 transition-colors">
                    <div className="col-span-2 flex items-start min-w-0">
                      <img src={brand.logoUrl} alt={`${brand.name} logo`} className="h-10 w-10 rounded-full mr-3 flex-shrink-0" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=Logo')} />
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

                    <div className="flex items-start pt-2">
                      <button 
                        onClick={() => brand.firstEmail.sent ? {} : openTemplateModal(brand, 'firstEmail')}
                        className={`p-2 rounded-md transition-colors ${brand.firstEmail.sent ? 'text-green-500 cursor-default' : 'text-taupe hover:text-rose hover:bg-rose/10'}`}
                        title={brand.firstEmail.sent ? `Sent on ${brand.firstEmail.date}` : 'Send first email'}
                        disabled={brand.firstEmail.sent}
                      >
                        {brand.firstEmail.sent ? <CheckCircleIcon className="h-6 w-6" /> : <EnvelopeIcon className="h-6 w-6" />}
                      </button>
                      {brand.firstEmail.sent && brand.firstEmail.date && (
                        <span className="ml-2 text-xs text-gray-500 hidden sm:inline self-center">({brand.firstEmail.date})</span>
                      )}
                    </div>

                    {brand.followUps.map((fu, index) => (
                      <div key={index} className="flex items-start pt-2">
                        <button 
                          onClick={() => fu.sent ? {} : openTemplateModal(brand, 'followUp', index)}
                          className={`p-2 rounded-md transition-colors ${fu.sent ? 'text-green-500 cursor-default' : 'text-taupe hover:text-rose hover:bg-rose/10'}`}
                          title={fu.sent ? `Sent on ${fu.date}` : `Send ${fu.name}`}
                          disabled={fu.sent}
                        >
                          {fu.sent ? <CheckCircleIcon className="h-6 w-6" /> : <EnvelopeIcon className="h-6 w-6" />}
                        </button>
                        {fu.sent && fu.date && (
                          <span className="ml-2 text-xs text-gray-500 hidden sm:inline self-center">({fu.date})</span>
                        )}
                      </div>
                    ))}

                    <div className="flex items-start pt-2.5">
                      <button 
                        onClick={() => openBrandEditModal(brand)}
                        className="p-2 rounded-md text-taupe hover:text-rose hover:bg-rose/10 transition-colors" 
                        title="Edit or add notes"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allFetchedBrands.length > INITIAL_BRAND_DISPLAY_COUNT && (
            <div className="mt-8 text-center">
              <button
                onClick={handleToggleShowAll}
                className="px-6 py-3 bg-white text-rose border border-rose rounded-lg hover:bg-rose/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
              >
                {isShowingAll ? 'Show Less' : `View All (${allFetchedBrands.length})`}
              </button>
            </div>
          )}

          <TemplateSelectorModal 
            isOpen={isTemplateModalOpen}
            onClose={closeTemplateModal}
            templates={emailTemplates}
            selectedTemplate={selectedTemplateInModal}
            onSelectTemplate={setSelectedTemplateInModal}
            onUseSelectedTemplate={() => handleSendEmail(false)}
            onUseBlankEmail={() => handleSendEmail(true)}
          />

          <div className="mt-12">
            <h2 className="text-2xl font-display font-medium text-charcoal mb-6">Available Email Templates</h2>
            <div className="mb-4 text-right">
              <button
                onClick={() => openEditTemplateModal(null)} // Pass null to indicate create mode
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
              >
                <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" />
                Create New Template
              </button>
            </div>
            {isLoadingTemplates && !isPreview && <p className='text-taupe'>Loading templates...</p>}
            {!isLoadingTemplates && emailTemplates.length === 0 && (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-blush/20">
                <EnvelopeIcon className="mx-auto h-10 w-10 text-taupe/50" />
                <h3 className="mt-2 text-md font-medium text-charcoal">No email templates available.</h3>
                <p className="mt-1 text-sm text-taupe">Default templates might be loading or none are configured.</p>
              </div>
            )}
            {Object.entries(
              emailTemplates.reduce((acc, template) => {
                const category = template.category || 'Uncategorized';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(template);
                return acc;
              }, {} as Record<string, UserEmailTemplate[]>)
            ).map(([category, templatesInCategory]) => (
              <div key={category} className="mb-10">
                <h3 className="text-xl font-display font-medium text-charcoal mb-5 border-b border-blush/30 pb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templatesInCategory.map(template => {
                    const IconComponent = template.IconComponent;
                    return (
                      <div 
                        key={template.id} 
                        className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-blush/30 flex flex-col"
                        onClick={() => openEditTemplateModal(template)}    
                      >
                        <div className="h-1.5 bg-[rgb(229,218,248)] relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full 
                                      bg-gradient-to-r from-transparent via-white/80 to-transparent 
                                      transform -translate-x-full group-hover:translate-x-full 
                                      transition-transform duration-700 ease-out">
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div className="flex items-center space-x-4 mb-4">
                            {IconComponent && (
                              <div className="p-3 rounded-full bg-[rgb(229,218,248)] flex-shrink-0">
                                <IconComponent 
                                  className="h-8 w-8 text-purple-800"
                                  aria-hidden="true" 
                                />
                              </div>
                            )}
                            <h3 className="font-semibold text-charcoal text-lg truncate flex-grow" title={template.name}>
                              {template.name}
                            </h3>
                          </div>
                          
                          <div className="mb-4">
                            <p 
                              className="text-sm text-taupe line-clamp-3" 
                              title={template.subject.replace(/{{brandName}}/g, "[Brand Name]")}
                            >
                              <span className="font-medium text-charcoal/80">Subject:</span> <span className="italic">{template.subject.replace(/{{brandName}}/g, "[Brand Name]")}</span>
                            </p>
                          </div>
                          
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
            ))}
          </div>
        </div>
      </main>

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
                    {editingTemplate?.id === 'new-template-marker' ? 'Create New Email Template' : `Edit: ${editingTemplate?.name}`}
                    <button onClick={closeEditTemplateModal} className="p-1 rounded-md hover:bg-blush/50">
                      <XMarkIcon className="h-5 w-5 text-taupe"/>
                    </button>
                  </Dialog.Title>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="templateName" className="block text-sm font-medium text-charcoal mb-1">
                        Template Name
                      </label>
                      <input
                        type="text"
                        name="templateName"
                        id="templateName"
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="templateSubject" className="block text-sm font-medium text-charcoal mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="templateSubject"
                        id="templateSubject"
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
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
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="templateCategory" className="block text-sm font-medium text-charcoal mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        name="templateCategory"
                        id="templateCategory"
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50 disabled:bg-gray-100 disabled:text-gray-500"
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value)}
                        disabled={editingTemplate?.id !== 'new-template-marker'} // Disabled if editing existing
                      />
                    </div>
                    <div>
                      <label htmlFor="templateIcon" className="block text-sm font-medium text-charcoal mb-1">
                        Icon
                      </label>
                      <select
                        name="templateIcon"
                        id="templateIcon"
                        className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50 capitalize disabled:bg-gray-100 disabled:text-gray-500"
                        value={selectedIconName || ''}
                        onChange={(e) => setSelectedIconName(e.target.value || undefined)}
                        disabled={editingTemplate?.id !== 'new-template-marker'} // Disabled if editing existing
                      >
                        <option value="">No Icon</option>
                        {Object.keys(iconMap).map(iconKey => (
                          <option key={iconKey} value={iconKey} className="capitalize">
                            {iconKey.replace('Icon', ' Icon')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center"> {/* Changed to justify-between */}
                    <div> {/* Container for the delete button */}
                      {editingTemplate && editingTemplate.is_custom && editingTemplate.id !== 'new-template-marker' && (
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          onClick={() => editingTemplate && openDeleteTemplateConfirmModal(editingTemplate)}
                        >
                          Delete Template
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3"> {/* Container for existing buttons */}
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
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
                        readOnly
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
                    <div className="p-3 border border-blush/20 rounded-md space-y-2">
                       <h4 className="text-xs font-medium text-taupe">First Email</h4>
                       <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="firstEmailSentEdit"
                            id="firstEmailSentEdit"
                            className="h-4 w-4 rounded border-blush/50 focus:ring-rose text-rose"
                            checked={editingBrandDetails?.first_email_sent || false}
                            onChange={(e) => setEditingBrandDetails(prev => ({
                              ...prev,
                              first_email_sent: e.target.checked
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
                          value={editingBrandDetails?.first_email_date || ''}
                          disabled={!(editingBrandDetails?.first_email_sent)}
                          onChange={(e) => setEditingBrandDetails(prev => ({
                            ...prev,
                            first_email_date: e.target.value
                          } as EditingBrandModalData))}
                       />
                    </div>

                    {editingBrandDetails?.follow_up_1_sent && (
                      <div className="p-3 border border-blush/20 rounded-md space-y-2">
                        <h4 className="text-xs font-medium text-taupe">Follow-up 1</h4>
                        <div className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             name="followUp1SentEdit"
                             id="followUp1SentEdit"
                             className="h-4 w-4 rounded border-blush/50 focus:ring-rose text-rose"
                             checked={editingBrandDetails?.follow_up_1_sent || false}
                             onChange={(e) => setEditingBrandDetails(prev => ({
                               ...prev,
                               follow_up_1_sent: e.target.checked
                             } as EditingBrandModalData))}
                           />
                           <label htmlFor="followUp1SentEdit" className="text-sm text-charcoal">
                             Sent
                           </label>
                        </div>
                        <input
                           type="date"
                           name="followUp1DateEdit"
                           id="followUp1DateEdit"
                           className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                           value={editingBrandDetails?.follow_up_1_date || ''}
                           disabled={!editingBrandDetails?.follow_up_1_sent}
                           onChange={(e) => setEditingBrandDetails(prev => ({
                             ...prev,
                             follow_up_1_date: e.target.value
                           } as EditingBrandModalData))}
                        />
                      </div>
                    )}

                    {editingBrandDetails?.follow_up_2_sent && (
                      <div className="p-3 border border-blush/20 rounded-md space-y-2">
                        <h4 className="text-xs font-medium text-taupe">Follow-up 2</h4>
                        <div className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             name="followUp2SentEdit"
                             id="followUp2SentEdit"
                             className="h-4 w-4 rounded border-blush/50 focus:ring-rose text-rose"
                             checked={editingBrandDetails?.follow_up_2_sent || false}
                             onChange={(e) => setEditingBrandDetails(prev => ({
                               ...prev,
                               follow_up_2_sent: e.target.checked
                             } as EditingBrandModalData))}
                           />
                           <label htmlFor="followUp2SentEdit" className="text-sm text-charcoal">
                             Sent
                           </label>
                        </div>
                        <input
                           type="date"
                           name="followUp2DateEdit"
                           id="followUp2DateEdit"
                           className="block w-full rounded-md border-blush/50 shadow-sm focus:border-rose focus:ring-rose sm:text-sm p-2 bg-cream/50"
                           value={editingBrandDetails?.follow_up_2_date || ''}
                           disabled={!editingBrandDetails?.follow_up_2_sent}
                           onChange={(e) => setEditingBrandDetails(prev => ({
                             ...prev,
                             follow_up_2_date: e.target.value
                           } as EditingBrandModalData))}
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="notesEdit" className="block text-sm font-medium text-charcoal mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notesEdit"
                        id="notesEdit"
                        rows={4}
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
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ml-3"
                      onClick={() => openDeleteConfirmModal(editingBrandDetails ? { id: editingBrandDetails.brand_id, name: editingBrandDetails.name || 'this brand' } : undefined)}
                    >
                      Delete Brand
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* NEW: Delete Confirmation Modal */}
      <Transition appear show={isDeleteConfirmModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={closeDeleteConfirmModal}> {/* Ensure z-index is higher than edit modal if they can overlap */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-charcoal"
                  >
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-taupe">
                      Are you sure you want to remove "<span className='font-semibold'>{brandToDeleteDetails?.name || 'this brand'}</span>" from your outreach history? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      onClick={handleConfirmDelete}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-charcoal shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={closeDeleteConfirmModal}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* NEW: Delete Template Confirmation Modal */}
      <Transition appear show={isDeleteTemplateConfirmModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={closeDeleteTemplateConfirmModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-charcoal"
                  >
                    Confirm Template Deletion
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-taupe">
                      Are you sure you want to delete the template "<span className='font-semibold'>{templateToDeleteDetails?.name || 'this template'}</span>"? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      onClick={handleConfirmDeleteTemplate}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-charcoal shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={closeDeleteTemplateConfirmModal}
                    >
                      Cancel
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

export default withPreview(OutreachTrackerComponent); 