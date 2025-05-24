import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, BoltIcon, ArrowPathRoundedSquareIcon, LightBulbIcon, MegaphoneIcon, HandThumbUpIcon, PencilSquareIcon } from '@heroicons/react/24/outline'; // Add all used icons
import type { UserEmailTemplate } from '@/lib/supabaseHelpers'; // Import UserEmailTemplate

// Define EmailTemplate interface locally or import from a shared types file
// export interface EmailTemplate {
//   id: string;
//   name: string;
//   subject: string;
//   body: string;
//   icon?: React.ElementType; // Icon for the template card
//   category?: string; // Added category field
// }

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: UserEmailTemplate[]; // UPDATED to UserEmailTemplate
  selectedTemplate: UserEmailTemplate | null; // UPDATED to UserEmailTemplate
  onSelectTemplate: (template: UserEmailTemplate) => void; // UPDATED to UserEmailTemplate
  onUseSelectedTemplate: () => void;
  onUseBlankEmail: () => void;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  templates,
  selectedTemplate,
  onSelectTemplate,
  onUseSelectedTemplate,
  onUseBlankEmail,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={onClose}>
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
                  <button onClick={onClose} className="p-1 rounded-md hover:bg-blush/50">
                    <XMarkIcon className="h-5 w-5 text-taupe" />
                  </button>
                </Dialog.Title>
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                  {templates.map((template) => {
                    const IconComponent = template.IconComponent; // UPDATED to use template.IconComponent
                    const isSelected = selectedTemplate?.id === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border flex flex-col relative 
                                    ${isSelected ? 'border-[rgb(229,218,248)] ring-2 ring-[rgb(229,218,248)]' : 'border-blush/30'}`}
                      >
                        {/* Animated Top Bar */}
                        <div className={`h-1 ${isSelected ? 'bg-purple-500' : 'bg-[rgb(229,218,248)]'} relative overflow-hidden`}>
                          <div className="absolute top-0 left-0 w-full h-full 
                                        bg-gradient-to-r from-transparent via-white/80 to-transparent 
                                        transform -translate-x-full group-hover:translate-x-full 
                                        transition-transform duration-700 ease-out">
                          </div>
                        </div>
                        <div className="p-4 flex-grow">
                          <div className="flex items-center space-x-3 mb-2">
                            {IconComponent && (
                              <div className={`p-1.5 rounded-full ${isSelected ? 'bg-purple-100' : 'bg-[rgb(229,218,248)]'} flex-shrink-0`}>
                                <IconComponent
                                  className={`h-5 w-5 ${isSelected ? 'text-purple-700' : 'text-purple-800'}`}
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                            <h4 className={'font-medium text-charcoal text-sm truncate flex-grow'} title={template.name}>
                              {template.name}
                            </h4>
                          </div>
                          <p className={'text-xs text-charcoal line-clamp-2'}>
                            Subject: {template.subject.substring(0, 70) + (template.subject.length > 70 ? '...' : '')}
                          </p>
                          {isSelected && template.body && (
                            <p className="mt-2 text-xs text-charcoal bg-purple-50 p-2 rounded-md whitespace-pre-line line-clamp-3">
                              {template.body.substring(0, 150) + (template.body.length > 150 ? '...' : '')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blush/20 px-4 py-2 text-sm font-medium text-rose hover:bg-blush/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-taupe/20 px-4 py-2 text-sm font-medium text-charcoal hover:bg-taupe/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2"
                    onClick={onUseBlankEmail}
                  >
                    Use Blank Email
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 disabled:opacity-50"
                    onClick={onUseSelectedTemplate}
                    disabled={!selectedTemplate}
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
  );
};

export default TemplateSelectorModal; 