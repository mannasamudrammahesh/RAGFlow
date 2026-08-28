// Google Analytics 4 Tracking Utilities

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Create script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  console.log('📊 Google Analytics initialized:', measurementId);
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_location: url,
    page_path: window.location.pathname,
  });
  
  console.log('📄 Page view tracked:', url);
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!window.gtag) return;

  window.gtag('event', eventName, eventParams);
  console.log('✨ Event tracked:', eventName, eventParams);
};

// Predefined tracking functions for common actions
export const analytics = {
  // CTA Button Clicks
  trackCTAClick: (buttonName: string, source: string) => {
    trackEvent('cta_click', {
      button_name: buttonName,
      source: source,
      timestamp: new Date().toISOString(),
    });
  },

  // Navigation
  trackNavigation: (destination: string, from: string) => {
    trackEvent('navigation', {
      destination: destination,
      from: from,
      timestamp: new Date().toISOString(),
    });
  },

  // Contact Form
  trackFormStart: (formName: string) => {
    trackEvent('form_start', {
      form_name: formName,
      timestamp: new Date().toISOString(),
    });
  },

  trackFormSubmit: (formName: string, source: string) => {
    trackEvent('form_submit', {
      form_name: formName,
      source: source,
      timestamp: new Date().toISOString(),
    });
  },

  trackFormSuccess: (formName: string, source: string) => {
    trackEvent('form_success', {
      form_name: formName,
      source: source,
      value: 1, // For conversion tracking
      timestamp: new Date().toISOString(),
    });
  },

  // API Documentation
  trackAPICodeCopy: (endpoint: string, language: string) => {
    trackEvent('api_code_copy', {
      endpoint: endpoint,
      language: language,
      timestamp: new Date().toISOString(),
    });
  },

  // Section Views
  trackSectionView: (sectionName: string) => {
    trackEvent('section_view', {
      section_name: sectionName,
      timestamp: new Date().toISOString(),
    });
  },

  // Link Clicks
  trackLinkClick: (linkText: string, linkUrl: string) => {
    trackEvent('link_click', {
      link_text: linkText,
      link_url: linkUrl,
      timestamp: new Date().toISOString(),
    });
  },

  // Video/Demo Interactions
  trackVideoPlay: (videoName: string) => {
    trackEvent('video_play', {
      video_name: videoName,
      timestamp: new Date().toISOString(),
    });
  },

  // Time on Page
  trackTimeOnPage: (pageName: string, timeSpent: number) => {
    trackEvent('time_on_page', {
      page_name: pageName,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString(),
    });
  },

  // Scroll Depth
  trackScrollDepth: (percentage: number) => {
    trackEvent('scroll_depth', {
      scroll_percentage: percentage,
      timestamp: new Date().toISOString(),
    });
  },

  // Conversions
  trackConversion: (conversionType: string, value?: number) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      value: value || 1,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    });
  },
};

// Scroll depth tracking
export const setupScrollTracking = () => {
  let tracked25 = false;
  let tracked50 = false;
  let tracked75 = false;
  let tracked100 = false;

  const handleScroll = () => {
    const scrollPercentage = 
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

    if (scrollPercentage >= 25 && !tracked25) {
      analytics.trackScrollDepth(25);
      tracked25 = true;
    }
    if (scrollPercentage >= 50 && !tracked50) {
      analytics.trackScrollDepth(50);
      tracked50 = true;
    }
    if (scrollPercentage >= 75 && !tracked75) {
      analytics.trackScrollDepth(75);
      tracked75 = true;
    }
    if (scrollPercentage >= 99 && !tracked100) {
      analytics.trackScrollDepth(100);
      tracked100 = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
};

// Time on page tracking
export const setupTimeTracking = (pageName: string) => {
  const startTime = Date.now();

  const trackTime = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    if (timeSpent > 5) { // Only track if user spent more than 5 seconds
      analytics.trackTimeOnPage(pageName, timeSpent);
    }
  };

  window.addEventListener('beforeunload', trackTime);
  return () => window.removeEventListener('beforeunload', trackTime);
};

