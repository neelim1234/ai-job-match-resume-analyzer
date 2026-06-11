import json
import google.generativeai as genai
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings

# Configure the Gemini SDK with our API key
genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst and career coach.
You analyze resumes against job descriptions and return structured JSON feedback.
Always respond with ONLY valid JSON — no markdown, no explanation, no extra text."""

USER_PROMPT_TEMPLATE = """Analyze the following resume against the job description below.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_text}

Return ONLY a JSON object with exactly this schema:
{{
  "match_score": <number between 0 and 100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "missing_skills": [<string>, ...],
  "improvement_suggestions": [<string>, ...],
  "ats_keywords": [<string>, ...]
}}

Rules:
- match_score: 0-100 integer representing overall fit
- strengths: 3-5 things the resume does well for this role
- weaknesses: 2-4 specific gaps or weak areas
- missing_skills: concrete skills/technologies mentioned in JD but absent from resume
- improvement_suggestions: 3-5 actionable, specific rewrite suggestions
- ats_keywords: 8-12 important keywords from the JD the resume should include
"""


class GeminiResult(BaseModel):
    """Validates the structure of Gemini's JSON output before saving to DB."""
    match_score: float = Field(ge=0, le=100)
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    improvement_suggestions: list[str]
    ats_keywords: list[str]


class GeminiService:

    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3,
            ),
        )

    async def analyze(self, resume_text: str, job_text: str) -> tuple[GeminiResult, str]:
        """
        Call Gemini and return (parsed_result, raw_json_string).
        Raises ValueError if the response can't be parsed.
        """
        # Truncate to stay within token limits (approx 3000 chars each)
        resume_text = resume_text[:6000]
        job_text = job_text[:4000]

        prompt = USER_PROMPT_TEMPLATE.format(
            resume_text=resume_text,
            job_text=job_text,
        )

        response = self.model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown code fences if the model wraps the JSON
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        try:
            data = json.loads(raw)
            result = GeminiResult(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw response:\n{raw}")

        return result, raw
