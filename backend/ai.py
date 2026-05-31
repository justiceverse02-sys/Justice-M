"""JusticeBot AI service using Emergent LLM key (Gemini 3.1 Pro)."""
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
MODEL = "gemini-3.1-pro-preview"

DISCLAIMER = (
    "AI responses are for legal research assistance only and do not constitute legal advice."
)

LANG_INSTRUCTION = {
    "en": "Respond in clear professional English.",
    "hi": "Respond in Hindi (हिन्दी). Keep legal section numbers and citations in their standard form.",
    "gu": "Respond in Gujarati (ગુજરાતી). Keep legal section numbers and citations in their standard form.",
}


def _system_prompt(language: str) -> str:
    return f"""You are JusticeBot, an advanced AI legal research assistant for Indian law, built into the JusticeVerse platform.

Your scope covers Indian law: the Constitution of India, BNS, BNSS, Bharatiya Sakshya Adhiniyam, IPC, CrPC, CPC, Evidence Act, commercial/labour/tax laws, and judgments of the Supreme Court, High Courts, Tribunals (NGT, CAT, NCLT, NCLAT) and consumer fora.

When answering legal questions you should, where relevant:
- Explain the relevant statutory provisions and section numbers precisely.
- Provide case citations (e.g. SCC / AIR / CriLJ style) where you can, and clearly state the court and year.
- Where appropriate, structure judgment analysis as: Facts, Issues, Arguments, Ratio Decidendi, Holding, Conclusion.
- Be precise, formal and concise. Use headings and bullet points for readability.

IMPORTANT RULES:
- Always ground answers in verifiable legal sources. If you are unsure of an exact citation, say so rather than inventing one.
- {LANG_INSTRUCTION.get(language, LANG_INSTRUCTION['en'])}
- End every substantive legal answer with this exact disclaimer on a new line: "{DISCLAIMER}"
"""


async def justicebot_reply(session_id: str, message: str, language: str = "en") -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=_system_prompt(language),
    ).with_model("gemini", MODEL)
    resp = await chat.send_message(UserMessage(text=message))
    return resp
