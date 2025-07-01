
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Heart,
  Calendar,
  DollarSign,
  MessageCircle,
  User
} from 'lucide-react';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import { VenueSidebarDisplayMode } from '../VenueSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface VenueSidebarContentProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  venueHours: any[];
  happyHours: any[];
  dailySpecials: any[];
  checkins: any[];
  isLoadingHours: boolean;
  isLoadingHappyHours: boolean;
  isLoadingDailySpecials: boolean;
  displayMode?: VenueSidebarDisplayMode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCheckInDialog?: () => void;
}

export const VenueSidebarContent = ({
  venue,
  breweryInfo,
  venueHours,
  happyHours,
  dailySpecials,
  checkins,
  isLoadingHours,
  isLoadingHappyHours,
  isLoadingDailySpecials,
  displayMode = 'full',
  activeTab,
  setActiveTab,
  onOpenCheckInDialog
}: VenueSidebarContentProps) => {
  const { user } = useAuth();

  // Build address from individual fields
  const buildAddress = (venue: Venue) => {
    const parts = [];
    if (venue.street) parts.push(venue.street);
    parts.push(venue.city);
    parts.push(venue.state);
    if (venue.postal_code) parts.push(venue.postal_code);
    return parts.join(', ');
  };

  const formatHours = (hours: any[]) => {
    if (!hours || hours.length === 0) return 'Hours not available';
    
    const today = new Date().getDay();
    const todayHours = hours.find(h => h.day_of_week === today);
    
    if (todayHours && !todayHours.is_closed) {
      return `${todayHours.open_time} - ${todayHours.close_time}`;
    }
    
    return 'Closed today';
  };

  const address = buildAddress(venue);

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-brewscovery-cream sticky top-0 z-10">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-brewscovery-teal data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="hours" 
            className="data-[state=active]:bg-brewscovery-teal data-[state=active]:text-white"
          >
            Hours
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-brewscovery-teal data-[state=active]:text-white"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Quick Info Card */}
            <Card className="border-2 border-brewscovery-teal/20 shadow-sm">
              <CardHeader className="bg-brewscovery-cream/30 border-b border-brewscovery-teal/20">
                <CardTitle className="text-brewscovery-teal flex items-center">
                  <MapPin size={16} className="mr-2" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="text-brewscovery-teal mt-0.5" />
                  <span className="text-sm text-gray-700">{address}</span>
                </div>
                
                {venue.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-brewscovery-teal" />
                    <span className="text-sm text-gray-700">{venue.phone}</span>
                  </div>
                )}
                
                {venue.website_url && (
                  <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-brewscovery-teal" />
                    <a 
                      href={venue.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-brewscovery-teal hover:text-brewscovery-blue underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-brewscovery-teal" />
                  <span className="text-sm text-gray-700">
                    {isLoadingHours ? 'Loading hours...' : formatHours(venueHours)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Daily Specials */}
            {dailySpecials.length > 0 && (
              <Card className="border-2 border-brewscovery-orange/30 shadow-sm">
                <CardHeader className="bg-brewscovery-orange/10 border-b border-brewscovery-orange/20">
                  <CardTitle className="text-brewscovery-teal flex items-center">
                    <DollarSign size={16} className="mr-2" />
                    Today's Specials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {dailySpecials.slice(0, 3).map((special, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{special.name}</span>
                      <Badge variant="secondary" className="bg-brewscovery-orange/20 text-brewscovery-teal">
                        ${special.price}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {displayMode === 'full' && user && (
              <div className="flex space-x-2">
                <Button 
                  onClick={onOpenCheckInDialog}
                  className="flex-1 bg-brewscovery-teal hover:bg-brewscovery-blue text-white"
                >
                  <Heart size={16} className="mr-2" />
                  Check In
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hours" className="space-y-4 mt-0">
            <Card className="border-2 border-brewscovery-teal/20 shadow-sm">
              <CardHeader className="bg-brewscovery-cream/30 border-b border-brewscovery-teal/20">
                <CardTitle className="text-brewscovery-teal">Opening Hours</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingHours ? (
                  <p className="text-sm text-gray-500">Loading hours...</p>
                ) : venueHours.length > 0 ? (
                  <div className="space-y-2">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                      const dayHours = venueHours.find(h => h.day_of_week === index);
                      const isToday = new Date().getDay() === index;
                      
                      return (
                        <div 
                          key={day} 
                          className={`flex justify-between items-center py-1 px-2 rounded ${
                            isToday ? 'bg-brewscovery-cream font-medium' : ''
                          }`}
                        >
                          <span className={`text-sm ${isToday ? 'text-brewscovery-teal' : 'text-gray-700'}`}>
                            {day}
                          </span>
                          <span className={`text-sm ${isToday ? 'text-brewscovery-teal' : 'text-gray-600'}`}>
                            {dayHours && !dayHours.is_closed 
                              ? `${dayHours.open_time} - ${dayHours.close_time}`
                              : 'Closed'
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Hours not available</p>
                )}
              </CardContent>
            </Card>

            {/* Happy Hours */}
            {happyHours.length > 0 && (
              <Card className="border-2 border-brewscovery-orange/30 shadow-sm">
                <CardHeader className="bg-brewscovery-orange/10 border-b border-brewscovery-orange/20">
                  <CardTitle className="text-brewscovery-teal flex items-center">
                    <Star size={16} className="mr-2" />
                    Happy Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {happyHours.map((hh, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{hh.day_of_week}</span>
                      <span className="text-sm font-medium text-brewscovery-teal">
                        {hh.start_time} - {hh.end_time}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-0">
            <Card className="border-2 border-brewscovery-teal/20 shadow-sm">
              <CardHeader className="bg-brewscovery-cream/30 border-b border-brewscovery-teal/20">
                <CardTitle className="text-brewscovery-teal flex items-center">
                  <MessageCircle size={16} className="mr-2" />
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {checkins.length > 0 ? (
                  <div className="space-y-3">
                    {checkins.slice(0, 5).map((checkin, index) => (
                      <div key={checkin.id} className="flex items-start space-x-3 p-2 bg-brewscovery-cream/20 rounded-lg">
                        <div className="w-8 h-8 bg-brewscovery-teal rounded-full flex items-center justify-center">
                          <User size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {checkin.first_name || checkin.last_name 
                                ? `${checkin.first_name || ''} ${checkin.last_name || ''}`.trim()
                                : 'Anonymous User'
                              }
                            </span>
                            {checkin.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < checkin.rating 
                                      ? "text-brewscovery-orange fill-current" 
                                      : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {checkin.comment && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {checkin.comment}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(checkin.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No check-ins yet. Be the first to check in!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
