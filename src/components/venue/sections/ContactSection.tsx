
import React from 'react';
import { Phone, Globe, Facebook, Instagram } from 'lucide-react';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';

interface ContactSectionProps {
  venue: Venue;
  breweryInfo: Brewery | null;
}

const ContactSection = ({ venue, breweryInfo }: ContactSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Contact</h3>
      {venue.phone && (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm">{venue.phone}</span>
        </div>
      )}
      {breweryInfo?.website_url && (
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-muted-foreground flex-shrink-0" />
          <a 
            href={breweryInfo.website_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
          >
            {breweryInfo.website_url.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}
      {breweryInfo?.facebook_url && (
        <div className="flex items-center gap-2">
          <Facebook size={16} className="text-muted-foreground flex-shrink-0" />
          <a 
            href={breweryInfo.facebook_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
          >
            Facebook
          </a>
        </div>
      )}
      {breweryInfo?.instagram_url && (
        <div className="flex items-center gap-2">
          <Instagram size={16} className="text-muted-foreground flex-shrink-0" />
          <a 
            href={breweryInfo.instagram_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
          >
            Instagram
          </a>
        </div>
      )}
    </div>
  );
};

export default ContactSection;
