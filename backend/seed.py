"""Seed sample legal content so the platform feels alive on first load."""
import uuid
from datetime import datetime, timezone

from db import db

NOW = datetime.now(timezone.utc).isoformat()


def _id(p):
    return f"{p}_{uuid.uuid4().hex[:12]}"


LEGAL_DOCS = [
    {"doc_type": "case_law", "court": "Supreme Court", "category": "Supreme Court",
     "title": "Anvar P.V. v. P.K. Basheer", "citation": "(2014) 10 SCC 473",
     "date": "2014-09-18", "source": "Supreme Court Reports",
     "summary": "Landmark on admissibility of electronic records; mandated Section 65B(4) certificate for secondary electronic evidence.",
     "content": "The Supreme Court held that electronic records produced as secondary evidence are inadmissible unless accompanied by a certificate under Section 65B(4) of the Evidence Act. This overruled the earlier position in Navjot Sandhu.",
     "tags": ["evidence", "section 65b", "electronic records"]},
    {"doc_type": "case_law", "court": "Supreme Court", "category": "Supreme Court",
     "title": "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal", "citation": "(2020) 7 SCC 1",
     "date": "2020-07-14", "source": "Supreme Court Reports",
     "summary": "Clarified Anvar P.V.; certificate under Section 65B(4) is a condition precedent to admissibility of electronic evidence.",
     "content": "A three-judge bench resolved conflicting precedents and reaffirmed that the certificate requirement under Section 65B(4) is mandatory for the admissibility of electronic records.",
     "tags": ["evidence", "section 65b", "digital"]},
    {"doc_type": "case_law", "court": "Supreme Court", "category": "Supreme Court",
     "title": "Satender Kumar Antil v. CBI", "citation": "(2022) 10 SCC 51",
     "date": "2022-07-11", "source": "Supreme Court Reports",
     "summary": "Comprehensive guidelines on bail and the need to curb unnecessary arrests; categorised offences for bail considerations.",
     "content": "The Court issued detailed directions classifying offences and emphasising that bail is the rule and jail the exception, urging compliance with Sections 41 and 41A CrPC.",
     "tags": ["bail", "crpc", "arrest"]},
    {"doc_type": "case_law", "court": "High Court", "category": "High Court",
     "title": "Tenant Welfare Assn. v. State Rent Authority", "citation": "2026 SCC OnLine Del 1123",
     "date": "2026-05-19", "source": "Delhi Judicature Dispatch",
     "summary": "Division bench held a summary default clause cannot bypass the mandatory 15-day cure notice under Rent Control statutes.",
     "content": "The High Court reaffirmed tenant protection against arbitrary ejectment, ruling the statutory cure period is non-derogable.",
     "tags": ["rent control", "tenancy", "notice"]},
    {"doc_type": "statute", "court": "Parliament", "category": "Statutes",
     "title": "Bharatiya Nyaya Sanhita, 2023 (BNS)", "citation": "Act No. 45 of 2023",
     "date": "2024-07-01", "source": "Union Gazette",
     "summary": "The new penal code of India replacing the Indian Penal Code, 1860. Restructures offences and introduces community service.",
     "content": "The BNS came into force on 1 July 2024, replacing the IPC. It reorganises offences relating to body, property and the State, and introduces community service as a punishment.",
     "tags": ["bns", "criminal", "penal code"]},
    {"doc_type": "statute", "court": "Parliament", "category": "Statutes",
     "title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)", "citation": "Act No. 46 of 2023",
     "date": "2024-07-01", "source": "Union Gazette",
     "summary": "New procedural code replacing the CrPC, 1973. Section 223 deals with cognizance of offences upon hearing the accused.",
     "content": "The BNSS modernises criminal procedure including timelines for investigation, use of technology, and victim-centric provisions.",
     "tags": ["bnss", "procedure", "section 223"]},
    {"doc_type": "journal", "court": "Tribunal", "category": "Corporate",
     "title": "NCLAT on IBC Resolution Plan Approval", "citation": "(2025) CriLJ Comp 88",
     "date": "2025-11-02", "source": "Corporate Counsel Journal",
     "summary": "Tribunal clarified the scope of judicial review over commercial wisdom of the Committee of Creditors under the IBC.",
     "content": "The NCLAT reiterated limited judicial interference in CoC decisions absent material irregularity or illegality.",
     "tags": ["ibc", "nclat", "insolvency"]},
    {"doc_type": "case_law", "court": "Supreme Court", "category": "Supreme Court",
     "title": "Digital Forensics Admissibility Reference", "citation": "(2026) 4 SCC 210",
     "date": "2026-05-28", "source": "JusticeVerse Legal Reporter",
     "summary": "Secondary digital evidence is admissible under Section 65B provided a certified hash value is appended at the time of seizure.",
     "content": "The bench laid down a hash-validation protocol for seized digital devices to preserve integrity of electronic evidence.",
     "tags": ["digital forensics", "evidence", "hash"]},
]

ARTICLES = [
    {"title": "Understanding Section 65B of the Evidence Act: Admissibility of Electronic Records",
     "category": "Procedures & Evidence", "read_time": "6 MIN READ", "author": "Advocate Manish Vashisht",
     "excerpt": "A deep-dive analysis of secondary digital evidence requirements, hash validations, and the evolution of judicial precedents from Anvar P.V. to Arjun Panditrao.",
     "content": "Section 65B of the Indian Evidence Act governs the admissibility of electronic records...\n\nThe journey from Navjot Sandhu to Anvar P.V. and finally Arjun Panditrao Khotkar established that a certificate under Section 65B(4) is a mandatory condition precedent. This article examines practical compliance, the role of hash values, and emerging challenges with cloud-stored data.",
     "status": "published"},
    {"title": "Drafting Flawless Commercial Contracts: Striking the Balance with Boilerplate",
     "category": "Corporate Drafting", "read_time": "8 MIN READ", "author": "JusticeVerse Editorial",
     "excerpt": "How precise indemnity, limitation of liability, and dispute resolution clauses protect commercial parties — and the drafting pitfalls to avoid.",
     "content": "Boilerplate clauses are far from filler. Indemnities, force majeure, governing law and arbitration clauses determine the real risk allocation...\n\nThis article walks through a model commercial agreement and annotates each operative clause.",
     "status": "published"},
    {"title": "Bail Jurisprudence After Satender Kumar Antil: A Practitioner's Guide",
     "category": "Criminal Law", "read_time": "7 MIN READ", "author": "Adv. Priya Nair",
     "excerpt": "Categorisation of offences, default bail, and the Supreme Court's directions to prevent mechanical arrests under the new BNSS regime.",
     "content": "The Supreme Court in Satender Kumar Antil categorised offences into four buckets for bail consideration...\n\nWith the BNSS now in force, practitioners must map these directions onto the new statutory framework.",
     "status": "published"},
]

NEWS = [
    {"title": "Supreme Court Clarifies Digital Forensics Admissibility", "category": "Supreme Court",
     "date": "2026-05-28", "source": "JusticeVerse Legal Reporter",
     "summary": "The bench held that secondary digital evidence is fully admissible under Section 65B of the Evidence Act provided a certified hash value is appended at the time of seizure."},
    {"title": "New Arbitral Regulations Standardize Fee Cap", "category": "Statutes",
     "date": "2026-05-25", "source": "Union Gazette Review",
     "summary": "The Arbitration Amendment Act implements standard caps on hourly fees for commercial arbitrations over 100 Crore, aiming to establish regional arbitration centers."},
    {"title": "High Court Reaffirms Tenants Protection Against Arbitrary Ejectments", "category": "High Court",
     "date": "2026-05-19", "source": "Delhi Judicature Dispatch",
     "summary": "The division bench ruled that a summary default clause cannot bypass the mandatory 15-day cure notice period required under regional Rent Control statutes."},
    {"title": "SEBI Overhauls Corporate Governance Norms for AI Startups", "category": "Corporate",
     "date": "2026-05-14", "source": "Corporate Counsel Journal",
     "summary": "New algorithmic compliance disclosures require companies leveraging generative AI for wealth advising to submit standard audit trails quarterly to maintain registration."},
]

VACANCIES = [
    {"title": "Corporate Law Intern", "organization": "Vashisht & Associates", "type": "internship",
     "location": "New Delhi", "stipend": "Rs. 15,000 / Month",
     "description": "Review shareholder agreements, format standard nondisclosure templates, and assist during corporate due diligence exercises.",
     "tags": ["Company Law", "Due Diligence", "Drafting"]},
    {"title": "Judicial Clerkship — High Court", "organization": "Office of Hon'ble Justice (Retd.)", "type": "clerkship",
     "location": "Mumbai", "stipend": "Rs. 40,000 / Month",
     "description": "Assist in legal research, drafting of judgments and orders, and maintenance of case dockets for a sitting bench.",
     "tags": ["Research", "Drafting", "Constitutional Law"]},
    {"title": "Associate — Disputes & Arbitration", "organization": "Lex Meridian LLP", "type": "associate",
     "location": "Bengaluru", "stipend": "Rs. 12,00,000 / Annum",
     "description": "Handle commercial arbitration matters, draft pleadings, and represent clients before tribunals and High Courts.",
     "tags": ["Arbitration", "Litigation", "Commercial"]},
    {"title": "Assistant Public Prosecutor Notification", "organization": "State Public Service Commission", "type": "government",
     "location": "Gujarat", "stipend": "Pay Level 10",
     "description": "Recruitment notification for Assistant Public Prosecutor across district courts. Eligibility: LL.B with 3 years practice.",
     "tags": ["APO", "Government", "Criminal"]},
    {"title": "Delhi Judicial Services Exam 2026", "organization": "Delhi High Court", "type": "exam",
     "location": "Delhi", "stipend": None,
     "description": "Preliminary examination notification for the Delhi Judicial Service. Prelims, Mains and Viva stages.",
     "tags": ["Judiciary", "DJS", "Exam"]},
]


async def seed_content():
    if await db.legal_documents.count_documents({}) == 0:
        await db.legal_documents.insert_many([{"id": _id("leg"), **d, "created_at": NOW} for d in LEGAL_DOCS])
    if await db.articles.count_documents({}) == 0:
        await db.articles.insert_many([{"id": _id("art"), **a, "published_at": NOW, "created_at": NOW} for a in ARTICLES])
    if await db.news.count_documents({}) == 0:
        await db.news.insert_many([{"id": _id("news"), **n, "created_at": NOW} for n in NEWS])
    if await db.vacancies.count_documents({}) == 0:
        await db.vacancies.insert_many([{"id": _id("vac"), **v, "created_at": NOW} for v in VACANCIES])
