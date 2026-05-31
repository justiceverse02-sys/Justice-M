"""JusticeVerse AI service using Emergent LLM key (Gemini 3.1 Pro)."""
import os
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
MODEL = "gemini-3.1-pro-preview"

DISCLAIMER = (
    "AI responses are for legal research assistance only and do not constitute legal advice."
)

# Supported answer languages (code -> display name)
LANGUAGES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "gu": "Gujarati (ગુજરાતી)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "ml": "Malayalam (മലയാളം)",
    "ur": "Urdu (اردو)",
}


def _lang_instruction(language: str) -> str:
    name = LANGUAGES.get(language, "English")
    if language == "en":
        return "Respond in clear professional English."
    return (
        f"Respond in {name}. Keep legal section numbers, statute names and case "
        f"citations in their standard (Latin/English) form."
    )


def _system_prompt(language: str) -> str:
    return f"""You are Verse AI, the JusticeVerse AI assistant — an advanced AI legal research assistant for Indian law, built into the JusticeVerse platform.

Your scope covers Indian law: the Constitution of India, BNS, BNSS, Bharatiya Sakshya Adhiniyam, IPC, CrPC, CPC, Evidence Act, commercial/labour/tax laws, and judgments of the Supreme Court, High Courts, Tribunals (NGT, CAT, NCLT, NCLAT) and consumer fora.

When answering legal questions you should, where relevant:
- Explain the relevant statutory provisions and section numbers precisely.
- Provide case citations (e.g. SCC / AIR / CriLJ style) where you can, and clearly state the court and year.
- Where appropriate, structure judgment analysis as: Facts, Issues, Arguments, Ratio Decidendi, Holding, Conclusion.
- Be precise, formal and concise. Use headings and bullet points for readability.

IMPORTANT RULES:
- Always ground answers in verifiable legal sources. If you are unsure of an exact citation, say so rather than inventing one.
- {_lang_instruction(language)}
- End every substantive legal answer with this exact disclaimer on a new line: "{DISCLAIMER}"
"""


def _draft_system_prompt(language: str) -> str:
    return f"""You are VerseDraft, the AI legal drafting engine powering JusticeVerse Counsel AI.

You produce complete, professionally formatted Indian legal documents (applications, petitions, pleadings and agreements). Follow correct structure, headings, cause titles, prayer/relief clauses and standard formatting conventions used in Indian courts and commercial practice.

RULES:
- Produce a complete, ready-to-edit draft. Use placeholders in [SQUARE BRACKETS] for names, dates and specifics not provided.
- Include all standard clauses, grounds and verification/affirmation sections appropriate to the document type.
- Cite relevant statutory provisions where applicable.
- {_lang_instruction(language)}
- End the draft with this exact disclaimer on a new line: "{DISCLAIMER}"
"""


async def justicebot_reply(session_id: str, message: str, language: str = "en") -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=_system_prompt(language),
    ).with_model("gemini", MODEL)
    return await chat.send_message(UserMessage(text=message))


async def draft_reply(draft_type: str, details: str, language: str = "en") -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"draft_{uuid.uuid4().hex[:12]}",
        system_message=_draft_system_prompt(language),
    ).with_model("gemini", MODEL)
    prompt = (
        f"Draft type required: {draft_type}\n\n"
        f"Matter details / instructions:\n{details}\n\n"
        f"Produce the complete, well-structured {draft_type} now."
    )
    return await chat.send_message(UserMessage(text=prompt))
