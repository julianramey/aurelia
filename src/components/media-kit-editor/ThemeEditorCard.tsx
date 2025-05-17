import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";

// Assuming ColorScheme is defined in a shared types file, adjust path if necessary
// For now, copying from MediaKitEditor.tsx context
export interface ColorScheme {
  background: string;
  text: string;
  secondary: string;
  accent_light: string;
  accent: string;
  primary?: string; // Optional if not all themes use it explicitly in this component
}

// Define structure for a single color preset object based on COLOR_PRESETS from MediaKitEditor.tsx
export type ColorPresetItem = {
  id: string;
  label: string;
  name: string;
  colors: ColorScheme;
};

// Define structure for swatchMap based on MediaKitEditor.tsx
export type SwatchDefinition = { name: string; hex: string };
export type SwatchMap = Record<keyof ColorScheme, SwatchDefinition[]>;

export interface ThemeEditorCardProps {
  currentFormDataColors: ColorScheme;
  onFormDataColorsChange: (newColors: ColorScheme) => void;
  colorPresetsConstant: ColorPresetItem[];
  swatchMapConstant: SwatchMap;
}

const ThemeEditorCard: React.FC<ThemeEditorCardProps> = ({
  currentFormDataColors,
  onFormDataColorsChange,
  colorPresetsConstant,
  swatchMapConstant,
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  // State to hold colors being edited in the dialog, initialized with current form data colors
  const [currentCustomColorsInDialog, setCurrentCustomColorsInDialog] = useState<ColorScheme>(currentFormDataColors);
  const [isSavedThemesOpen, setIsSavedThemesOpen] = useState(false);

  // Effect to update dialog's color state if the prop currentFormDataColors changes from parent
  // This ensures the dialog opens with the latest colors if they were changed externally
  // or if the component re-renders with new props.
  useEffect(() => {
    setCurrentCustomColorsInDialog(currentFormDataColors);
  }, [currentFormDataColors]);

  const handleColorPresetChangeInternal = (preset: ColorPresetItem) => {
    onFormDataColorsChange({ ...preset.colors });
  };

  const handleCustomColorInputChangeDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCustomColorsInDialog(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyCustomColorsDialog = () => {
    onFormDataColorsChange({ ...currentCustomColorsInDialog });
    setIsColorPickerOpen(false); // Close dialog
  };

  const handleSwatchClickDialog = (key: keyof ColorScheme, hex: string) => {
    setCurrentCustomColorsInDialog(prev => ({
      ...prev,
      [key]: hex,
    }));
  };

  // Placeholder for the actual JSX, to be moved from MediaKitEditor.tsx
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Colors</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Preset selection grid will go here */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {colorPresetsConstant.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleColorPresetChangeInternal(preset)}
              className={`bg-white rounded-lg p-3 border transition-all ${
                JSON.stringify(currentFormDataColors) === JSON.stringify(preset.colors)
                  ? 'border-rose shadow-lg scale-[1.02]'
                  : 'border-blush/20 hover:border-rose/40 hover:scale-[1.02]'
              }`}
            >
              <h3 className="text-sm font-medium text-charcoal mb-2">{preset.name}</h3>
              <div className="grid grid-cols-5 gap-2">
                {(['background', 'text', 'secondary', 'accent_light', 'accent'] as (keyof ColorScheme)[]).map(key => (
                  <div
                    key={key}
                    className="h-5 rounded"
                    style={{ backgroundColor: preset.colors[key] }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Colors Trigger + Dialog */}
        <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <DialogTrigger asChild>
            {(() => {
              const isPresetActive = colorPresetsConstant.some(p => JSON.stringify(p.colors) === JSON.stringify(currentFormDataColors));
              return (
                <button
                  onClick={() => {
                    // Ensure dialog opens with the latest colors from the form.
                    // This is also handled by useEffect, but good to be explicit on click.
                    setCurrentCustomColorsInDialog(currentFormDataColors); 
                    setIsColorPickerOpen(true);
                  }}
                  className={`w-full bg-white rounded-lg p-3 border transition-all ${
                    !isPresetActive
                      ? 'border-rose shadow-lg scale-[1.02]'
                      : 'border-blush/20 hover:border-rose/40 hover:scale-[1.02]'
                  }`}
                >
                  <h3 className="text-sm font-medium text-charcoal mb-2 text-left">Custom Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {(['background', 'text', 'secondary', 'accent_light', 'accent'] as (keyof ColorScheme)[]).map(key => (
                      <div
                        key={key}
                        title={key}
                        className="h-5 rounded border border-gray-200"
                        style={{ backgroundColor: currentFormDataColors[key] || '#ffffff' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-taupe mt-2 text-left">Click to edit</p>
                </button>
              );
            })()}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Edit Custom Colors</DialogTitle>
              <DialogDescription>
                Choose colors or select a swatch for quick suggestions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {(Object.keys(currentCustomColorsInDialog) as Array<keyof ColorScheme>).map(key => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={key} className="capitalize font-medium">
                      {key.replace('_', ' ')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        id={key}
                        name={key}
                        type="color"
                        value={currentCustomColorsInDialog[key] || '#ffffff'}
                        onChange={handleCustomColorInputChangeDialog}
                        className="p-0 h-7 w-7 border-none rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-500 font-mono w-16" title={currentCustomColorsInDialog[key]}>
                        {currentCustomColorsInDialog[key]}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {(swatchMapConstant[key] || []).map(swatch => (
                      <button
                        key={swatch.hex}
                        title={`${swatch.name} (${swatch.hex})`}
                        onClick={() => handleSwatchClickDialog(key, swatch.hex)}
                        className={`h-6 w-6 rounded-full border border-gray-300 transition-transform hover:scale-110 ${
                          currentCustomColorsInDialog[key]?.toLowerCase() === swatch.hex.toLowerCase() ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      >
                        <span className="sr-only">{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsColorPickerOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleApplyCustomColorsDialog} className="border">Apply Colors</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Saved Themes Section */}
        <Dialog open={isSavedThemesOpen} onOpenChange={setIsSavedThemesOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal mt-3"
            >
              <div className="flex items-center justify-between w-full">
                <span>Saved Color Themes</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Saved Color Themes</DialogTitle>
              <DialogDescription>
                Select one of your previously saved themes.
              </DialogDescription>
            </DialogHeader>
            <div className="py-10 text-center text-gray-500">
              Saved themes library coming soon!
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSavedThemesOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ThemeEditorCard; 