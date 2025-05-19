import React from 'react';
import type { SectionVisibilityState, Service } from '@/lib/types';

interface ServiceListProps {
  services: Service[];
  sectionVisibility: SectionVisibilityState;
}

const ServiceListBlock: React.FC<ServiceListProps> = ({
  services,
  // sectionVisibility, // Not directly used for styling items here
}) => {
  if (!services || services.length === 0) {
    return null; // Parent template handles the "no services" message
  }

  const getServiceName = (service: Service): string => {
    return service.service_name || 'Unnamed Service';
  };

  return (
    <ul className="services-list grid grid-cols-1 md:grid-cols-3 gap-4">
      {services.map((service, index) => (
        <li
          key={service.id || index} // Use service.id if available, otherwise index
          className="service-tag font-medium p-4 rounded-[0.75rem] flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-container">{getServiceName(service)}</span>
          {/* Original template didn't show description or price_range here, block props include them but default template doesn't use them in this list view. */}
        </li>
      ))}
    </ul>
  );
};

export default ServiceListBlock; 