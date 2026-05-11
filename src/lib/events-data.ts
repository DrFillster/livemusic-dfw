export interface LiveEvent {
  id: string;
  idType: string;
  title: string;
  url: string;
  summary: string;
  published: string;
  source: string;
  sourceLogo: string;
  author: string;
  image: string;
  authority: number;
  category: string;
  venue: string;
  venueAddress: string;
  city: string;
  price: string;
  ticketUrl: string;
  score: number;
}

// Extended event type for local venue shows
export interface LocalEvent {
  id: string;
  title: string;
  url: string;
  summary: string;
  published: string;
  time: string;
  venue: string;
  venueSlug: string;
  neighborhood: string;
  neighborhoodName: string;
  address: string;
  price: string;
  free: boolean;
  cover: string;
  image: string;
  ticketUrl: string;
  source: string;
  sourceLogo: string;
  genres: string[];
  description: string;
}

export interface EventsData {
  ok: boolean;
  generated: string;
  total: number;
  events: LiveEvent[];
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  address: string;
  phone: string;
  website: string;
  facebook: string;
  instagram: string;
  type: string;
  musicTypes: string[];
  eventsUrl: string;
  schedule: Record<string, string>;
  description: string;
  cover: string;
  hours: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface VenuesData {
  generated: string;
  neighborhoods: Neighborhood[];
  venues: Venue[];
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = dateStr.split("T")[0];
  const [year, month, day] = d.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00");
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}

export function getUniqueCities(events: LiveEvent[]): string[] {
  const cities = new Set(events.map((e) => e.city).filter(Boolean));
  return Array.from(cities).sort();
}