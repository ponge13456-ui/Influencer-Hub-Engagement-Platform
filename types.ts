
export enum UserRole {
  CUSTOMER = 'customer',
  INFLUENCER = 'influencer',
  SELLER = 'seller',
  ADMIN = 'admin'
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt: number;
  lastSpin?: number;
  cards?: string[];
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  allowedRoles: UserRole[];
  description: string;
  uploadedAt: number;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  reply?: string;
}

export interface Application {
  id: string;
  userId: string;
  username: string;
  email: string;
  type: 'influencer' | 'seller';
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  timestamp: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  replied: boolean;
  replyText?: string;
}

export const SPIN_OUTCOMES = [
  "Premium Card",
  "Platinum Card – 20% OFF",
  "Gold Card – 10% OFF",
  "3 More Chances",
  "Try One More Time",
  "Bad Luck",
  "Mystery Box",
  "Better Luck Next Time"
];
