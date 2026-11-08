export type TabType = 'home' | 'exam' | 'scores' | 'certificate';

export interface AwardCriteriaItem {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  percentLabel: string;
  description: string;
  colorTheme: 'gold' | 'silver' | 'bronze' | 'stone';
}

export interface ProjectObjective {
  id: string;
  title: string;
  description: string;
}

export interface PublicConfig {
  PROJECT_NAME: string;
  PROJECT_SUBTITLE: string;
  PROJECT_DESCRIPTION: string;
  PROJECT_SLOGAN: string;
  LOGO_URL: string;
  HERO_BANNER_URL: string;
  HERO_BANNER_IMAGES: string[];
  ANNOUNCEMENT_TEXT: string;
  
  // Section Headings & Explanations
  ABOUT_SECTION_TITLE: string;
  ABOUT_SECTION_SUBTITLE: string;
  ABOUT_IMAGES: string[];
  ABOUT_OBJECTIVES: ProjectObjective[];

  // Criteria Section
  CRITERIA_SECTION_TITLE: string;
  CRITERIA_SECTION_SUBTITLE: string;
  CRITERIA_ITEMS: AwardCriteriaItem[];
  
  // Forms & Registration
  FORM_JUNIOR_TITLE: string;
  FORM_JUNIOR_DESC: string;
  FORM_JUNIOR_URL: string;
  FORM_JUNIOR_ENABLED: boolean;

  FORM_SENIOR_TITLE: string;
  FORM_SENIOR_DESC: string;
  FORM_SENIOR_URL: string;
  FORM_SENIOR_ENABLED: boolean;

  EXAM_INSTRUCTIONS: string[];

  REGISTRATION_OPEN: boolean;
  REGISTRATION_DEADLINE: string; // ISO in Asia/Bangkok
  
  // Scoring
  SCORE_SEARCH_ENABLED: boolean;
  SCORE_SEARCH_INSTRUCTION: string;
  FULL_SCORE: number;
  PASS_PERCENT: number;
  GOLD_MIN_PERCENT: number;
  SILVER_MIN_PERCENT: number;
  BRONZE_MIN_PERCENT: number;
  
  // Certificate
  CERTIFICATE_DOWNLOAD_ENABLED: boolean;
  CERTIFICATE_ANNOUNCEMENT: string;
  CERTIFICATE_PREVIEW_ENABLED: boolean;
  CERTIFICATE_SEARCH_INSTRUCTION: string;
  
  // School Info
  SCHOOL_NAME: string;
  SCHOOL_DESCRIPTION: string;
  SCHOOL_ADDRESS: string;
  SCHOOL_PHONE: string;
  SCHOOL_FAX: string;
  SCHOOL_EMAIL: string;
  SCHOOL_WEBSITE: string;
  SCHOOL_FACEBOOK: string;
  
  // Developer Info
  DEVELOPER_NAME: string;
  DEVELOPER_DETAILS: string;
  DEVELOPER_FACEBOOK: string;
  
  // Footer Copyright
  FOOTER_COPYRIGHT: string;

  // Real-time synchronization metadata
  LAST_UPDATED_AT?: string;
  LAST_UPDATED_BY?: string;
}

export interface Participant {
  Participant_ID: string;
  Prefix: string;
  First_Name: string;
  Last_Name: string;
  Level: string;
  Class: string;
  School: string;
  Verification_Code?: string;
  Registered_At: string;
}

export interface ScoreRecord {
  Participant_ID: string;
  Prefix: string;
  First_Name: string;
  Last_Name: string;
  Level: string;
  Class?: string;
  School?: string;
  Score: number;
  Full_Score: number;
  Percentage: number;
  Result: 'ผ่าน' | 'ไม่ผ่าน';
  Award_Level: string;
  Verification_Code?: string;
  Updated_At: string;
}

export interface CertificateRecord {
  Participant_ID: string;
  Prefix: string;
  First_Name: string;
  Last_Name: string;
  Level: string;
  Class?: string;
  Award_Level: string;
  PDF_URL: string;
  File_ID: string;
  Status: 'PENDING' | 'READY' | 'UNAVAILABLE';
  Verification_Code?: string;
  Created_At: string;
}

export interface Announcement {
  Announcement_ID: string;
  Title: string;
  Description: string;
  Published_Date: string;
  Status: 'PUBLISHED' | 'DRAFT';
  Priority: 'HIGH' | 'NORMAL' | 'LOW';
}

export interface ScheduleItem {
  Schedule_ID: string;
  Event_Name: string;
  Event_Date: string;
  Start_Time: string;
  End_Time: string;
  Description: string;
  Status: 'UPCOMING' | 'COMPLETED' | 'IN_PROGRESS';
}
