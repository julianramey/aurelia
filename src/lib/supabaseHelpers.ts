import { supabase } from './supabase'; // Assuming supabase client is exported from ./supabase
import {
  SparklesIcon,
  BoltIcon,
  ArrowPathRoundedSquareIcon,
  LightBulbIcon,
  MegaphoneIcon,
  HandThumbUpIcon,
  EnvelopeIcon, // Added for potential generic template
  PencilSquareIcon // Added for potential custom/blank template icon
} from '@heroicons/react/24/outline';
import { ComponentType, SVGProps } from 'react';

// Supabase helper functions for favorites
export const getFavoritedBrandIdsFromSupabase = async (): Promise<number[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('User not logged in. Cannot fetch favorites from Supabase.');
    return [];
  }

  const { data, error } = await supabase
    .from('user_favorite_brands')
    .select('brand_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching favorite brand IDs from Supabase:', error);
    return [];
  }
  return data ? data.map(fav => fav.brand_id) : [];
};

export const toggleFavoriteInSupabase = async (brandId: number, currentFavoritedIds: number[]): Promise<number[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not logged in. Cannot toggle favorite in Supabase.');
    return currentFavoritedIds;
  }

  const isCurrentlyFavorite = currentFavoritedIds.includes(brandId);

  if (isCurrentlyFavorite) {
    // Unfavorite: Delete the row
    const { error } = await supabase
      .from('user_favorite_brands')
      .delete()
      .match({ user_id: user.id, brand_id: brandId });

    if (error) {
      console.error('Error unfavoriting brand in Supabase:', error);
      return currentFavoritedIds.filter(id => id !== brandId);
    }
    return currentFavoritedIds.filter(id => id !== brandId);
  } else {
    // Favorite: Insert the row
    const { error } = await supabase
      .from('user_favorite_brands')
      .insert({ user_id: user.id, brand_id: brandId });

    if (error) {
      console.error('Error favoriting brand in Supabase:', error);
      // Check for unique constraint violation
      if (error.code === '23505') { 
        console.warn('Brand already favorited, unique constraint violation caught during insert.');
        return [...new Set([...currentFavoritedIds, brandId])]; // Ensure it's in the list if constraint fails
      }
      return currentFavoritedIds;
    }
    return [...currentFavoritedIds, brandId];
  }
};

// --- Outreach Tracker Helper Functions ---

export interface UserOutreachStatus {
  user_id?: string; // Optional if RLS handles it, but good for clarity
  brand_id: number;
  first_email_sent?: boolean | null;
  first_email_date?: string | null;
  follow_up_1_sent?: boolean | null;
  follow_up_1_date?: string | null;
  follow_up_2_sent?: boolean | null;
  follow_up_2_date?: string | null;
  notes?: string | null;
  outreach_email_used?: string | null; // New field for the specific email used
  created_at?: string;
  updated_at?: string;
}

export const getOutreachStatusesForUser = async (): Promise<UserOutreachStatus[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('User not logged in. Cannot fetch outreach statuses.');
    return [];
  }

  const { data, error } = await supabase
    .from('user_brand_outreach')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching outreach statuses:', error);
    return [];
  }
  // Map to ensure null dates are handled if your DB stores them that way, or default to undefined
  return data.map(item => ({
    ...item,
    first_email_date: item.first_email_date || undefined,
    follow_up_1_date: item.follow_up_1_date || undefined,
    follow_up_2_date: item.follow_up_2_date || undefined,
    notes: item.notes || undefined,
  })) || [];
};

export async function upsertOutreachStatus(
  statusUpdate: Partial<UserOutreachStatus> & { brand_id: number }
): Promise<UserOutreachStatus | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error("User not authenticated for upserting outreach status:", userError);
    return null;
  }
  const userId = userData.user.id;

  const dataToUpsert: Partial<UserOutreachStatus> & { user_id: string; updated_at: string } = {
    ...statusUpdate,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  // Remove undefined fields explicitly, Supabase client might handle it, but good practice
  Object.keys(dataToUpsert).forEach(key => {
    const K = key as keyof typeof dataToUpsert;
    if (dataToUpsert[K] === undefined) {
      delete dataToUpsert[K];
    }
  });

  const { data, error } = await supabase
    .from('user_brand_outreach')
    .upsert(dataToUpsert, { onConflict: 'user_id, brand_id' })
    .select()
    .single(); // Assuming you want the upserted record back

  if (error) {
    console.error("Error upserting outreach status:", error, "Payload:", dataToUpsert);
    return null;
  }
  return data as UserOutreachStatus;
}

// Deletes an outreach status for a user and brand
export async function deleteOutreachStatus(brand_id: number): Promise<boolean> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error("User not authenticated for deleting outreach status:", userError);
    return false;
  }
  const userId = userData.user.id;

  const { error } = await supabase
    .from('user_brand_outreach')
    .delete()
    .match({ user_id: userId, brand_id: brand_id });

  if (error) {
    console.error("Error deleting outreach status:", error, "for brand_id:", brand_id);
    return false;
  }
  return true;
}

// --- Email Template Helper Functions ---

// Map of icon names (as stored in DB) to actual Heroicon components
export const iconMap: { [key: string]: ComponentType<SVGProps<SVGSVGElement>> } = {
  SparklesIcon,
  BoltIcon,
  ArrowPathRoundedSquareIcon,
  LightBulbIcon,
  MegaphoneIcon,
  HandThumbUpIcon,
  EnvelopeIcon,
  PencilSquareIcon,
};

export interface UserEmailTemplate {
  id: string; // UUID from Supabase or string ID for default templates
  user_id?: string | null; // Nullable if it's a default system template not yet copied
  original_template_id?: string | null; // ID of the default template this was copied from
  name: string;
  subject: string;
  body: string;
  category: string;
  icon_name?: string | null; // Name of the Heroicon
  IconComponent?: ComponentType<SVGProps<SVGSVGElement>>; // Actual icon component for UI
  is_custom: boolean; // True if user-created or a modified default
  created_at?: string;
  updated_at?: string;
}

// Define default system templates
// These IDs should be unique and stable
export const defaultEmailTemplates: UserEmailTemplate[] = [
  {
    id: 'default-template-intro1',
    name: 'Warm Initial Introduction',
    category: 'Initial Outreach',
    subject: 'Collaboration Inquiry: {{brandName}} x [Your Name/Brand]',
    body: 'Hi {{brandName}} Team,\n\nMy name is [Your Name] and I\'m a [Your Title/Niche] with a passion for [mention something relevant to the brand]. I\'ve been a long-time admirer of {{brandName}} and how you [mention specific positive aspect].\n\nI believe my audience of [mention audience size/demographics] would resonate strongly with your products/message. I\'d love to discuss potential collaboration opportunities.\n\nAre you available for a quick chat next week?\n\nBest,\n[Your Name]\n[Your Website/Social Link]',
    icon_name: 'SparklesIcon',
    is_custom: false,
  },
  {
    id: 'default-template-intro2',
    name: 'Quick Intro: Shared Passion',
    category: 'Initial Outreach',
    subject: 'Question re: {{brandName}} & [Shared Interest/Your Niche]',
    body: 'Hi {{brandName}} Team,\n\nBig fan of your work, especially [mention something specific if possible]!\n\nAs a [Your Title/Niche] also passionate about [Shared Interest/Your Niche], I had a quick idea for how we might create something valuable together for both our audiences.\n\nWould you be open to a very brief chat sometime this week or next?\n\nCheers,\n[Your Name]\n[Your Website/Portfolio Link]',
    icon_name: 'BoltIcon',
    is_custom: false,
  },
  {
    id: 'default-template-followup1',
    name: 'Gentle Follow-Up (No Response)',
    category: 'Follow-Up',
    subject: 'Following Up: Collaboration Inquiry with {{brandName}}',
    body: 'Hi {{brandName}} Team,\n\nI hope this email finds you well.\n\nI recently reached out regarding a potential collaboration between {{brandName}} and myself. I understand you\'re busy, so I wanted to gently follow up on my previous email.\n\nI\'m still very enthusiastic about the possibility of working together and believe it could be a great fit. You can see more of my work here: [Your Portfolio/Media Kit Link].\n\nWould you be open to a brief discussion?\n\nThanks,\n[Your Name]',
    icon_name: 'ArrowPathRoundedSquareIcon',
    is_custom: false,
  },
  {
    id: 'default-template-pitch1',
    name: 'Creative Product Pitch Idea',
    category: 'Initial Outreach',
    subject: 'Idea for {{brandName}}: Featuring [Specific Product]',
    body: 'Hi {{brandName}} Team,\n\nI\'m particularly excited about your new [Specific Product Name] and I have a creative idea for how I could feature it to my audience. [Briefly explain your content idea].\n\nI think this would genuinely engage my followers and showcase {{brandName}}\'s [Specific Product] in a unique light.\n\nLet me know if this sounds interesting!\n\nCheers,\n[Your Name]',
    icon_name: 'LightBulbIcon',
    is_custom: false,
  },
  {
    id: 'default-template-campaign1',
    name: 'Campaign / Event Tie-In Idea',
    category: 'Initial Outreach',
    subject: '{{brandName}} x [Your Name] for your [Event/Campaign Name]?',
    body: 'Hi {{brandName}} Team,\n\nI saw you\'re currently running the [Event/Campaign Name] and it looks fantastic! I had an idea for how I could contribute to its success by [Your Idea related to the campaign].\n\nMy audience aligns well with [mention target of campaign], and I\'d be thrilled to help amplify {{brandName}}\'s message.\n\nBest regards,\n[Your Name]',
    icon_name: 'MegaphoneIcon',
    is_custom: false,
  },
  {
    id: 'default-template-checkin1',
    name: 'Casual Check-In / Fan Note',
    category: 'Follow-Up',
    subject: 'Quick hello from a {{brandName}} fan!',
    body: 'Hey {{brandName}} Team,\n\nJust wanted to send a quick note to say I continue to be impressed by {{brandName}}\'s work in [Brand\'s Industry/Niche].\n\nIf you ever explore collaborations with creators like me, I\'d love to be considered!\n\nKeep up the great work,\n[Your Name]',
    icon_name: 'HandThumbUpIcon',
    is_custom: false,
  },
  // Add more default templates as needed
];

export async function getUserEmailTemplates(): Promise<UserEmailTemplate[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('User not logged in. Returning only default templates.');
    return defaultEmailTemplates.map(t => ({ ...t, IconComponent: t.icon_name ? iconMap[t.icon_name] : undefined }));
  }

  const { data: customTemplatesData, error: customTemplatesError } = await supabase
    .from('user_email_templates')
    .select('*')
    .eq('user_id', user.id);

  if (customTemplatesError) {
    console.error('Error fetching custom email templates:', customTemplatesError);
    // Return default templates as a fallback if custom ones can't be fetched
    return defaultEmailTemplates.map(t => ({ ...t, IconComponent: t.icon_name ? iconMap[t.icon_name] : undefined }));
  }

  const processedTemplates: UserEmailTemplate[] = [];
  const customTemplateMap = new Map(customTemplatesData.map(ct => [ct.original_template_id || ct.id, ct]));

  // Add default templates, overridden by custom versions if they exist
  defaultEmailTemplates.forEach(dt => {
    const customVersion = customTemplateMap.get(dt.id);
    if (customVersion) {
      processedTemplates.push({
        ...customVersion,
        // Ensure all fields from customVersion are present, then add IconComponent
        id: customVersion.id, // This is the custom template's own DB ID
        original_template_id: dt.id, // Link back to the default
        name: customVersion.name,
        subject: customVersion.subject,
        body: customVersion.body,
        category: customVersion.category || dt.category, // Fallback to default category
        icon_name: customVersion.icon_name || dt.icon_name, // Fallback
        IconComponent: (customVersion.icon_name || dt.icon_name) ? iconMap[(customVersion.icon_name || dt.icon_name) as string] : undefined,
        is_custom: true, // It's a user's version
        user_id: customVersion.user_id,
        created_at: customVersion.created_at,
        updated_at: customVersion.updated_at,
      });
      customTemplateMap.delete(dt.id); // Remove from map as it's processed
    } else {
      processedTemplates.push({
        ...dt,
        IconComponent: dt.icon_name ? iconMap[dt.icon_name] : undefined,
        is_custom: false, // Clearly mark it as a non-customized default
      });
    }
  });

  // Add any purely custom templates (those not linked to a default one, or whose original_template_id was null)
  customTemplateMap.forEach(ct => {
    // This check is important: only add if it wasn't already an override of a default
    if (!defaultEmailTemplates.some(dt => dt.id === ct.original_template_id)) {
       processedTemplates.push({
        ...ct,
        id: ct.id,
        original_template_id: ct.original_template_id,
        name: ct.name,
        subject: ct.subject,
        body: ct.body,
        category: ct.category,
        icon_name: ct.icon_name,
        IconComponent: ct.icon_name ? iconMap[ct.icon_name] : undefined,
        is_custom: true, // It's a user's fully custom template
        user_id: ct.user_id,
        created_at: ct.created_at,
        updated_at: ct.updated_at,
      });
    }
  });
  
  // Sort by category, then by name perhaps, or preserve default order then custom ones
  // For now, let's try to keep default order and append purely custom ones
  // A more sophisticated sort can be added if needed.

  return processedTemplates;
}

export async function upsertUserEmailTemplate(
  templateData: Partial<UserEmailTemplate>
): Promise<UserEmailTemplate | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    console.error("User not authenticated for upserting email template:", authError);
    return null;
  }
  const userId = authData.user.id;

  const dataToUpsert: Partial<UserEmailTemplate> = {
    ...templateData,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  // If this is a new custom template based on a default one, 
  // remove the default ID, set is_custom, and ensure original_template_id is set.
  if (templateData.id && defaultEmailTemplates.some(dt => dt.id === templateData.id) && !templateData.is_custom) {
    dataToUpsert.original_template_id = templateData.id; // Link to the default template
    delete dataToUpsert.id; // Let Supabase generate a new UUID for the custom copy
    dataToUpsert.is_custom = true;
    // Ensure created_at is set for new custom templates
    if (!dataToUpsert.created_at) {
        dataToUpsert.created_at = new Date().toISOString();
    }
  } else if (templateData.id && templateData.is_custom) {
    // This is an update to an existing custom template. ID is already set.
    // Ensure user_id matches, though RLS should also protect this.
    if (templateData.user_id && templateData.user_id !== userId) {
        console.error("Attempting to update a template not belonging to the current user.");
        return null;
    }
  } else if (!templateData.id) {
    // This is a brand new, purely custom template (not based on a default)
    dataToUpsert.is_custom = true;
    if (!dataToUpsert.created_at) {
        dataToUpsert.created_at = new Date().toISOString();
    }
  }
  
  // Remove IconComponent before sending to Supabase, as it's a UI-only property
  if ('IconComponent' in dataToUpsert) {
    delete dataToUpsert.IconComponent;
  }

  // Clean up undefined fields
  Object.keys(dataToUpsert).forEach(key => {
    const K = key as keyof typeof dataToUpsert;
    if (dataToUpsert[K] === undefined) {
      delete dataToUpsert[K];
    }
  });

  const { data, error } = await supabase
    .from('user_email_templates')
    .upsert(dataToUpsert, { onConflict: 'id' }) // Upsert on 'id' (PK of user_email_templates)
    .select()
    .single();

  if (error) {
    console.error("Error upserting email template:", error, "Payload:", dataToUpsert);
    return null;
  }

  // Re-attach IconComponent for UI use if icon_name is present
  if (data && data.icon_name) {
    return { ...data, IconComponent: iconMap[data.icon_name] } as UserEmailTemplate;
  }
  return data as UserEmailTemplate;
}

export async function deleteUserEmailTemplate(templateId: string): Promise<boolean> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    console.error("User not authenticated for deleting email template:", authError);
    return false;
  }
  const userId = authData.user.id;

  // Ensure we only attempt to delete a template belonging to the current user
  // and that it's indeed a custom template if we add extra checks here later.
  // The RLS policy on the table should be the primary enforcer of ownership.
  const { error } = await supabase
    .from('user_email_templates')
    .delete()
    .match({ id: templateId, user_id: userId }); // Match on both id and user_id

  if (error) {
    console.error("Error deleting email template:", error, "for templateId:", templateId);
    return false;
  }
  return true;
}

// --- Agent Settings Helper Functions ---

export interface AgentSettings {
  user_id?: string; // Handled by RLS/default auth.uid()
  selected_personality_id: string;
  temperature: number;
  custom_instructions: string;
  response_length: string; // 'concise' | 'balanced' | 'detailed'
  emoji_usage: string;     // 'none' | 'subtle' | 'expressive'
  enable_smart_titles: boolean;
  is_using_custom_agent: boolean;
  custom_agent_name: string;
  custom_agent_initial_greeting: string;
  selected_trait_ids: string[]; // Array of trait IDs
  created_at?: string;
  updated_at?: string;
}

// Default settings for a new user or if fetching fails initially before creation
const defaultAgentSettings: Omit<AgentSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  selected_personality_id: 'aurelia-default',
  temperature: 0.7,
  custom_instructions: '',
  response_length: 'balanced',
  emoji_usage: 'subtle',
  enable_smart_titles: true,
  is_using_custom_agent: false,
  custom_agent_name: 'My Custom Agent',
  custom_agent_initial_greeting: 'Hello! How can I assist you today?',
  selected_trait_ids: [],
};

export async function getUserAgentSettings(): Promise<AgentSettings | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    console.error("User not authenticated for fetching agent settings:", authError);
    return null; // Or return defaultAgentSettings if preferred for logged-out state, but null is clearer for auth failure
  }
  const userId = authData.user.id;

  const { data, error } = await supabase
    .from('user_agent_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching agent settings:', error);
    return null; // Return null on actual error
  }

  if (data) {
    return data as AgentSettings;
  }

  // No settings found (PGRST116), so create and return default settings for this user
  console.log(`No agent settings found for user ${userId}. Creating with defaults.`);
  const settingsToInsert = { ...defaultAgentSettings, user_id: userId };
  const { data: newSettings, error: insertError } = await supabase
    .from('user_agent_settings')
    .insert(settingsToInsert)
    .select()
    .single();

  if (insertError) {
    console.error('Error creating default agent settings:', insertError);
    return null; // Fallback if creation fails
  }
  return newSettings as AgentSettings;
}

export async function upsertUserAgentSettings(
  settingsUpdate: Partial<Omit<AgentSettings, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<AgentSettings | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    console.error("User not authenticated for upserting agent settings:", authError);
    return null;
  }
  const userId = authData.user.id;

  // Ensure selected_trait_ids is always an array, even if undefined in partial update
  const currentSettings = await getUserAgentSettings(); // Fetch current to merge if traits are not provided
  
  const dataToUpsert: AgentSettings = {
    user_id: userId,
    selected_personality_id: settingsUpdate.selected_personality_id ?? currentSettings?.selected_personality_id ?? defaultAgentSettings.selected_personality_id,
    temperature: settingsUpdate.temperature ?? currentSettings?.temperature ?? defaultAgentSettings.temperature,
    custom_instructions: settingsUpdate.custom_instructions ?? currentSettings?.custom_instructions ?? defaultAgentSettings.custom_instructions,
    response_length: settingsUpdate.response_length ?? currentSettings?.response_length ?? defaultAgentSettings.response_length,
    emoji_usage: settingsUpdate.emoji_usage ?? currentSettings?.emoji_usage ?? defaultAgentSettings.emoji_usage,
    enable_smart_titles: settingsUpdate.enable_smart_titles ?? currentSettings?.enable_smart_titles ?? defaultAgentSettings.enable_smart_titles,
    is_using_custom_agent: settingsUpdate.is_using_custom_agent ?? currentSettings?.is_using_custom_agent ?? defaultAgentSettings.is_using_custom_agent,
    custom_agent_name: settingsUpdate.custom_agent_name ?? currentSettings?.custom_agent_name ?? defaultAgentSettings.custom_agent_name,
    custom_agent_initial_greeting: settingsUpdate.custom_agent_initial_greeting ?? currentSettings?.custom_agent_initial_greeting ?? defaultAgentSettings.custom_agent_initial_greeting,
    selected_trait_ids: settingsUpdate.selected_trait_ids ?? currentSettings?.selected_trait_ids ?? defaultAgentSettings.selected_trait_ids,
    updated_at: new Date().toISOString(),
  };

  // Clean up undefined fields explicitly before upsert, though Supabase client might handle it.
  // The spread operator with defaults above should handle most cases, but this is an extra safety.
  Object.keys(dataToUpsert).forEach(key => {
    const K = key as keyof typeof dataToUpsert;
    if (dataToUpsert[K] === undefined) {
      // This check is tricky due to boolean defaults. If a field is explicitly set to `undefined` in `settingsUpdate`
      // and we want to persist that as NULL (if column allows), this delete is needed.
      // However, our `defaultAgentSettings` and coalescing logic above ensures defined values.
      // This is more for if a field was truly optional and could be removed.
    }
  });

  const { data, error } = await supabase
    .from('user_agent_settings')
    .upsert(dataToUpsert, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error("Error upserting agent settings:", error, "Payload:", dataToUpsert);
    return null;
  }
  return data as AgentSettings;
}

// --- Media Kit Analytics Helper Functions ---

export async function getTotalMediaKitViews(kitUserId: string): Promise<number> {
  if (!kitUserId) return 0;

  const { data, error, count } = await supabase
    .from('media_kit_daily_views')
    .select('daily_view_count', { count: 'exact', head: false })
    .eq('kit_user_id', kitUserId);

  if (error) {
    console.error('Error fetching total media kit views:', error);
    return 0;
  }

  return data.reduce((total, row) => total + (row.daily_view_count || 0), 0);
}

export async function getTotalMediaKitEngagements(
  kitUserId: string,
  engagementType?: 'share_click' | 'copy_link_click' | string // Allow specific types or any string
): Promise<number> {
  let query = supabase
    .from('media_kit_daily_engagements')
    .select('daily_engagement_count', { count: 'exact', head: false })
    .eq('kit_user_id', kitUserId);

  if (engagementType) {
    query = query.eq('engagement_type', engagementType);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching total media kit engagements for ${kitUserId}:`, error);
    return 0;
  }

  // If data is not null and has items, sum them up. Otherwise, assume 0.
  const totalEngagements = data ? data.reduce((sum, record) => sum + (record.daily_engagement_count || 0), 0) : 0;
  return totalEngagements;
}

// --- New functions for daily analytics data ---

export interface DailyViewData {
  date: string; // YYYY-MM-DD
  views: number;
}

export async function getDailyMediaKitViews(
  kitUserId: string,
  startDate?: string, // YYYY-MM-DD
  endDate?: string    // YYYY-MM-DD
): Promise<DailyViewData[]> {
  let query = supabase
    .from('media_kit_daily_views')
    .select('view_date, daily_view_count')
    .eq('kit_user_id', kitUserId)
    .order('view_date', { ascending: true });

  if (startDate) {
    query = query.gte('view_date', startDate);
  }
  if (endDate) {
    query = query.lte('view_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching daily media kit views for ${kitUserId}:`, error);
    return [];
  }

  return data.map(item => ({
    date: item.view_date,
    views: item.daily_view_count || 0,
  })) || [];
}

export interface DailyEngagementData {
  date: string; // YYYY-MM-DD
  engagements: number;
}

export async function getDailyMediaKitEngagements(
  kitUserId: string,
  startDate?: string, // YYYY-MM-DD
  endDate?: string    // YYYY-MM-DD
): Promise<DailyEngagementData[]> {
  let query = supabase
    .from('media_kit_daily_engagements')
    .select('engagement_date, daily_engagement_count')
    .eq('kit_user_id', kitUserId)
    .order('engagement_date', { ascending: true });

  if (startDate) {
    query = query.gte('engagement_date', startDate);
  }
  if (endDate) {
    query = query.lte('engagement_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching daily media kit engagements for ${kitUserId}:`, error);
    return [];
  }

  // Since engagements can be of different types, we might need to sum them up if not already aggregated by date.
  // Assuming the table stores daily SUMS per type, or we want all types summed per day here.
  // For simplicity, let's sum all engagement_counts for a given day.
  const dailyTotals: { [date: string]: number } = {};
  data.forEach(item => {
    dailyTotals[item.engagement_date] = (dailyTotals[item.engagement_date] || 0) + (item.daily_engagement_count || 0);
  });

  return Object.entries(dailyTotals).map(([date, engagements]) => ({
    date,
    engagements,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure sorted by date again after grouping
} 