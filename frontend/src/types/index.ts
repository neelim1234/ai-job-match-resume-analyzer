export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  label: string | null;
  created_at: string;
}

export interface ResumeDetail extends Resume {
  parsed_text: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  company: string | null;
  created_at: string;
}

export interface JobDescriptionDetail extends JobDescription {
  raw_text: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  resume_id: string;
  job_description_id: string;
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  improvement_suggestions: string[];
  ats_keywords: string[];
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}
