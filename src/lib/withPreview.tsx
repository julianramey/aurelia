import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardNav from '@/components/DashboardNav';

export function withPreview<P extends { isPreview?: boolean; isPublic?: boolean }>(
  PageComponent: React.ComponentType<P>
) {
  // The props type for the returned component should ideally include P and any other props the HOC might add or handle.
  // For this HOC, it just passes through P.
  const WrappedComponent = (props: P) => {
    const { search } = useLocation();
    const isPreviewViaUrl = new URLSearchParams(search).get('preview') === 'true';
    // Check isPreview from props (for dashboard previews) or from URL (for iframe/direct link previews)
    // Also check if the component itself identifies as a public page that shouldn't have the nav
    const shouldHideNav = isPreviewViaUrl || props.isPreview || props.isPublic;

    return (
      <>
        {!shouldHideNav && <DashboardNav />}
        {/* 
          The div wrapper is kept as per user's HOC definition.
          Adjust className based on whether it's a preview or not.
        */}
        <div className={shouldHideNav ? 'm-0' : 'p-8'}>
          <PageComponent {...props} />
        </div>
      </>
    );
  };

  // Add a display name for better debugging in React DevTools
  const displayName = PageComponent.displayName || PageComponent.name || 'Component';
  WrappedComponent.displayName = `withPreview(${displayName})`;

  return WrappedComponent;
} 