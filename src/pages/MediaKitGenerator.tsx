import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/lib/hooks/useProfile';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout focusing on key metrics',
    preview: '/templates/minimal.png'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Detailed layout with comprehensive brand information',
    preview: '/templates/professional.png'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and artistic design for creative professionals',
    preview: '/templates/creative.png'
  }
];

export default function MediaKitGenerator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMediaKit = async () => {
    if (!profile || isGenerating) return;
    
    try {
      setIsGenerating(true);

      // Create media kit data based on selected template
      const mediaKitData = {
        type: 'media_kit_data',
        template: selectedTemplate,
        brand_name: profile.full_name || profile.username,
        tagline: profile.niche || 'Content Creator',
        colors: {
          primary: '#7E69AB',
          secondary: '#F8F7F4',
          accent: '#2A2118'
        },
        font: 'Inter'
      };

      // Update profile with media kit data
      const { error } = await updateProfile({
        media_kit_data: JSON.stringify(mediaKitData)
      });

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Media Kit Generated",
        description: "Your media kit has been created successfully.",
      });

      // Navigate to media kit page
      navigate('/media-kit');

    } catch (error) {
      console.error('Error generating media kit:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/media-kit')}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-medium text-charcoal">
              Generate Your Media Kit
            </h1>
            <p className="mt-2 text-taupe">
              Choose a style that matches your brand
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:border-rose/40 ${
                selectedTemplate === template.id ? 'border-rose shadow-lg scale-[1.02]' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-taupe">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-blush/10 rounded-lg">
                  {/* Template preview image */}
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/media-kit')}
          >
            Cancel
          </Button>
          <Button
            onClick={generateMediaKit}
            disabled={isGenerating}
            className="bg-rose hover:bg-rose/90 text-white"
          >
            {isGenerating ? 'Generating...' : 'Generate Media Kit'}
          </Button>
        </div>
      </div>
    </div>
  );
} 