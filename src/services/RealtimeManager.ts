import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEventType = 
  | 'venue_updated'
  | 'venue_hours_updated'
  | 'venue_happy_hours_updated'
  | 'venue_daily_specials_updated'
  | 'brewery_updated'
  | 'brewery_owners_updated'
  | 'brewery_claims_updated'
  | 'notification_received'
  | 'checkin_created'
  | 'venue_events_updated';

export interface RealtimeSubscription {
  id: string;
  callback: (payload: any) => void;
  eventType: RealtimeEventType;
  filter?: Record<string, any>;
}

class RealtimeManagerService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private isInitialized = false;

  private getChannelName(eventType: RealtimeEventType): string {
    switch (eventType) {
      case 'venue_updated':
      case 'venue_hours_updated':
      case 'venue_happy_hours_updated':
      case 'venue_daily_specials_updated':
      case 'venue_events_updated':
        return 'venue-channel';
      case 'brewery_updated':
      case 'brewery_owners_updated':
      case 'brewery_claims_updated':
        return 'brewery-channel';
      case 'notification_received':
      case 'checkin_created':
        return 'user-channel';
      default:
        return 'general-channel';
    }
  }

  private getTableName(eventType: RealtimeEventType): string {
    switch (eventType) {
      case 'venue_updated':
        return 'venues';
      case 'venue_hours_updated':
        return 'venue_hours';
      case 'venue_happy_hours_updated':
        return 'venue_happy_hours';
      case 'venue_daily_specials_updated':
        return 'venue_daily_specials';
      case 'venue_events_updated':
        return 'venue_events';
      case 'brewery_updated':
        return 'breweries';
      case 'brewery_owners_updated':
        return 'brewery_owners';
      case 'brewery_claims_updated':
        return 'brewery_claims';
      case 'notification_received':
        return 'notifications';
      case 'checkin_created':
        return 'checkins';
      default:
        return '';
    }
  }

  private createChannel(channelName: string): RealtimeChannel {
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    console.log(`Creating real-time channel: ${channelName}`);
    
    const channel = supabase.channel(channelName);
    this.channels.set(channelName, channel);

    // Set up listeners for all event types that use this channel
    this.setupChannelListeners(channel, channelName);

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`Channel ${channelName} subscription status:`, status);
    });

    return channel;
  }

  private setupChannelListeners(channel: RealtimeChannel, channelName: string) {
    const eventTypes = this.getEventTypesForChannel(channelName);
    
    eventTypes.forEach(eventType => {
      const tableName = this.getTableName(eventType);
      if (tableName) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            console.log(`Real-time update for ${eventType}:`, payload);
            this.notifySubscribers(eventType, payload);
          }
        );
      }
    });
  }

  private getEventTypesForChannel(channelName: string): RealtimeEventType[] {
    switch (channelName) {
      case 'venue-channel':
        return ['venue_updated', 'venue_hours_updated', 'venue_happy_hours_updated', 'venue_daily_specials_updated', 'venue_events_updated'];
      case 'brewery-channel':
        return ['brewery_updated', 'brewery_owners_updated', 'brewery_claims_updated'];
      case 'user-channel':
        return ['notification_received', 'checkin_created'];
      default:
        return [];
    }
  }

  private notifySubscribers(eventType: RealtimeEventType, payload: any) {
    this.subscriptions.forEach((subscription) => {
      if (subscription.eventType === eventType) {
        // Apply filter if present
        if (subscription.filter) {
          const shouldNotify = Object.entries(subscription.filter).every(([key, value]) => {
            const payloadValue = 
              (payload.new && typeof payload.new === 'object' && key in payload.new) ? payload.new[key] :
              (payload.old && typeof payload.old === 'object' && key in payload.old) ? payload.old[key] :
              null;
            return payloadValue === value;
          });
          
          if (!shouldNotify) return;
        }

        try {
          subscription.callback(payload);
        } catch (error) {
          console.error(`Error in real-time callback for ${eventType}:`, error);
        }
      }
    });
  }

  subscribe(eventType: RealtimeEventType, callback: (payload: any) => void, filter?: Record<string, any>): string {
    const id = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: RealtimeSubscription = {
      id,
      callback,
      eventType,
      filter,
    };

    this.subscriptions.set(id, subscription);

    // Ensure the appropriate channel exists
    const channelName = this.getChannelName(eventType);
    if (!this.channels.has(channelName)) {
      this.createChannel(channelName);
    }

    console.log(`Subscribed to ${eventType} with ID: ${id}`);
    return id;
  }

  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.subscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from ${subscription.eventType} with ID: ${subscriptionId}`);
      
      // Check if we can clean up any channels
      this.cleanupUnusedChannels();
    }
  }

  private cleanupUnusedChannels() {
    // Get all event types that still have active subscriptions
    const activeEventTypes = new Set(
      Array.from(this.subscriptions.values()).map(sub => sub.eventType)
    );

    // Check each channel to see if it's still needed
    this.channels.forEach((channel, channelName) => {
      const eventTypesForChannel = this.getEventTypesForChannel(channelName);
      const hasActiveSubscriptions = eventTypesForChannel.some(eventType => 
        activeEventTypes.has(eventType)
      );

      if (!hasActiveSubscriptions) {
        console.log(`Cleaning up unused channel: ${channelName}`);
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    });
  }

  cleanup() {
    console.log('Cleaning up all real-time subscriptions');
    this.subscriptions.clear();
    
    this.channels.forEach((channel, channelName) => {
      console.log(`Removing channel: ${channelName}`);
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    this.isInitialized = false;
  }

  getActiveSubscriptions() {
    return {
      subscriptionCount: this.subscriptions.size,
      channelCount: this.channels.size,
      subscriptions: Array.from(this.subscriptions.values()).map(sub => ({
        id: sub.id,
        eventType: sub.eventType,
        hasFilter: !!sub.filter,
      })),
      channels: Array.from(this.channels.keys()),
    };
  }
}

export const RealtimeManager = new RealtimeManagerService();