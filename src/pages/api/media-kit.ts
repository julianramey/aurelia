import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import path from 'path';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import fs from 'fs';
import Handlebars from 'handlebars';
import type { Request, Response } from 'express';

interface MediaKitData {
  brand_name?: string;
  tagline?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  font?: string;
}

interface ApiResponse {
  html?: string;
  error?: string;
}

const defaultConfig: MediaKitData = {
  brand_name: '',
  tagline: '',
  colors: {
    primary: '#000000',
    secondary: '#ffffff'
  },
  font: 'Inter'
};

export default async function handler(
  req: Request,
  res: Response<ApiResponse>
) {
  try {
    // Get user profile from query params
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Get profile data from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Parse media kit data if it exists
    let mediaKitConfig = defaultConfig;
    if (profile.media_kit_data) {
      try {
        mediaKitConfig = typeof profile.media_kit_data === 'string'
          ? JSON.parse(profile.media_kit_data)
          : profile.media_kit_data;
      } catch (e) {
        console.error('Error parsing media kit data:', e);
      }
    }

    // Merge profile and media kit data for the template
    const templateData = {
      profile: {
        ...profile,
        brand_name: mediaKitConfig.brand_name || profile.full_name,
        tagline: mediaKitConfig.tagline || profile.niche,
        colors: mediaKitConfig.colors,
        font: mediaKitConfig.font
      }
    };

    // Read the media kit template
    const templatePath = path.join(process.cwd(), 'public', 'media.html');
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Compile and render the template with merged data
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(templateData);

    // Set content type and send response
    res.setHeader('Content-Type', 'text/html');
    res.status(200).json({ html });
  } catch (error) {
    console.error('Error rendering media kit:', error);
    res.status(500).json({ error: 'Failed to render media kit' });
  }
} 