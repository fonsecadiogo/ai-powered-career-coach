
/*
 * ============================================================
 * ATENA — SHARED DEMONSTRATION SCENARIOS
 * ============================================================
 *
 * This file contains exactly three fictional candidates.
 *
 * Each scenario provides:
 * 1. A target job role
 * 2. A complete fictional CV
 * 3. A job description
 * 4. Interview preparation context
 * 5. A job discovery search query
 *
 * The same scenarios are reused by:
 * - CV Reviewer
 * - Job-Fit Analysis
 * - Mock Interview
 * - Job Discovery
 *
 * All information is fictional and created for demonstrations.
 *
 * IMPORTANT:
 * This file does not contain AI-generated evaluations or
 * predefined scores. Atena's backend generates those results.
 * ============================================================
 */

export const DEMO_SCENARIOS = [
  // ============================================================
  // SCENARIO 1 — CAREER STARTER
  // ============================================================

  {
    id: "career-starter",

    label: "Career Starter",

    candidateName: "Alex Morgan",

    // Target role used for CV evaluation.
    role: "Mid-Level AI Engineer",

    // ----------------------------------------------------------
    // FICTIONAL CV
    // ----------------------------------------------------------

    cv: `ALEX MORGAN
Junior AI Developer

PROFESSIONAL SUMMARY
Recent AI Engineering bootcamp graduate with foundational
knowledge of Python, data processing, and machine learning.
Looking for an opportunity to build practical engineering
experience and contribute to real-world AI applications.

TECHNICAL SKILLS
- Python programming
- pandas and NumPy
- scikit-learn
- Basic supervised machine learning
- Data cleaning and preprocessing
- Model evaluation: accuracy, precision, recall, F1 score
- Git and GitHub
- Jupyter Notebook
- Basic SQL

PROFESSIONAL EXPERIENCE
No formal AI engineering employment to date.

AI ENGINEERING BOOTCAMP — 2026
- Developed Python scripts for data processing.
- Cleaned and analyzed structured datasets with pandas.
- Trained classification models using scikit-learn.
- Compared models with accuracy and F1 score.
- Practiced Git-based collaboration.
- Presented technical results to classmates.

ACADEMIC PROJECTS

Customer Churn Prediction
- Built a supervised classification model in Python.
- Performed data cleaning and feature preparation.
- Split datasets into training and validation partitions.
- Evaluated model performance using standard metrics.
- Documented results in a GitHub repository.

Exploratory Data Analysis Project
- Analyzed customer data using pandas and NumPy.
- Created visualizations to identify patterns.
- Summarized findings in a Jupyter Notebook.

EDUCATION
AI Engineering Bootcamp — 2026

CURRENT DEVELOPMENT GOALS
- Production backend API development
- Docker and containerization
- Cloud infrastructure
- MLOps and model monitoring
- Production software testing
- Professional AI engineering experience`,

    // ----------------------------------------------------------
    // TARGET JOB DESCRIPTION
    // ----------------------------------------------------------

    jobDescription: `MID-LEVEL AI ENGINEER

COMPANY OVERVIEW
We develop and operate production machine learning systems
for enterprise customers.

POSITION SUMMARY
We are seeking an AI Engineer who can build, deploy,
monitor, and maintain reliable production AI services.

REQUIRED QUALIFICATIONS
- At least three years of software or AI engineering experience.
- Advanced Python programming.
- Experience building REST APIs using FastAPI.
- Strong software engineering fundamentals.
- Experience with Docker containers.
- Experience deploying services with Kubernetes.
- Familiarity with AWS or Azure.
- Experience creating CI/CD pipelines.
- Knowledge of MLOps workflows.
- Model monitoring and production troubleshooting.
- Automated testing and debugging.
- Strong collaboration and communication skills.

RESPONSIBILITIES
- Develop production machine learning services.
- Deploy and maintain AI-powered APIs.
- Monitor application and model performance.
- Troubleshoot deployment and infrastructure issues.
- Collaborate with backend and DevOps engineers.
- Improve the reliability of deployed AI systems.

PREFERRED QUALIFICATIONS
- Experience with PostgreSQL.
- Experience managing cloud infrastructure.
- Familiarity with observability tools.
- Knowledge of model versioning and experiment tracking.`,

    // ----------------------------------------------------------
    // MOCK INTERVIEW CONTEXT
    // ----------------------------------------------------------

    interviewContext: `You are interviewing Alex Morgan for a
Mid-Level AI Engineer position.

The candidate recently completed an AI Engineering bootcamp.
They have experience with Python, pandas, scikit-learn, and
introductory machine learning projects, but no formal
AI engineering employment.

The position requires production APIs, cloud deployment,
Docker, Kubernetes, and MLOps.

Assess technical fundamentals, practical reasoning,
understanding of production challenges, communication,
and readiness for the role.

Ask questions appropriate to the position's requirements.
Do not assume experience not documented in the CV.`,

    // ----------------------------------------------------------
    // JOB DISCOVERY QUERY
    // ----------------------------------------------------------

    // Search junior roles appropriate to the candidate's level.
    jobSearchQuery: "Junior AI Engineer",
  },

  // ============================================================
  // SCENARIO 2 — EXPERIENCED AI ENGINEER
  // ============================================================

  {
    id: "experienced-engineer",

    label: "Experienced AI Engineer",

    candidateName: "Jordan Lee",

    // Target role used for CV evaluation.
    role: "AI Engineer",

    // ----------------------------------------------------------
    // FICTIONAL CV
    // ----------------------------------------------------------

    cv: `JORDAN LEE
AI Engineer

PROFESSIONAL SUMMARY
AI Engineer with three years of professional experience
developing Python backend services and LLM-powered applications.

Experienced in REST API development, Retrieval-Augmented
Generation (RAG), vector databases, containerization,
automated testing, and application deployment.

TECHNICAL SKILLS

Programming
- Python
- SQL
- JavaScript fundamentals

Backend Engineering
- FastAPI
- REST API design
- PostgreSQL
- API authentication
- Automated testing with pytest

Artificial Intelligence
- LLM API integration
- Retrieval-Augmented Generation (RAG)
- Document embeddings
- Vector databases
- Prompt engineering
- Document ingestion pipelines
- Semantic search

Infrastructure and Development
- Docker
- Git and GitHub
- GitHub Actions
- CI/CD pipelines
- Cloud application deployment
- Logging and debugging

PROFESSIONAL EXPERIENCE

AI Engineer — NovaTech Solutions
2024–2026

- Developed Python services using FastAPI.
- Built REST APIs for AI-powered business applications.
- Implemented RAG pipelines for internal document search.
- Integrated LLM APIs into production applications.
- Developed document ingestion and retrieval workflows.
- Worked with vector databases and semantic search.
- Containerized backend services using Docker.
- Created automated tests using pytest.
- Implemented CI/CD workflows using GitHub Actions.
- Collaborated with software engineers and product managers.
- Investigated production application issues.

Software Developer — Bluebridge Technologies
2023–2024

- Developed and maintained Python backend applications.
- Created REST API endpoints.
- Worked with SQL and PostgreSQL databases.
- Improved software quality through automated tests.
- Participated in code reviews and sprint planning.

PROJECTS

Enterprise Knowledge Assistant
- Built an internal AI assistant using RAG.
- Processed company documents into searchable chunks.
- Generated embeddings and stored them in a vector database.
- Retrieved relevant document sections for LLM responses.
- Exposed the assistant through a FastAPI backend.
- Containerized the application using Docker.
- Added tests for document processing and API behavior.

AI Document Classification Service
- Developed a Python service for document classification.
- Created API endpoints for processing requests.
- Added validation and structured response handling.
- Integrated automated testing into CI/CD.

EDUCATION
Bachelor of Science in Computer Science

PROFESSIONAL DEVELOPMENT
Currently improving skills in LLM evaluation,
observability, and production AI system optimization.`,

    // ----------------------------------------------------------
    // TARGET JOB DESCRIPTION
    // ----------------------------------------------------------

    jobDescription: `AI ENGINEER — LLM APPLICATIONS

COMPANY OVERVIEW
We create AI-powered applications that help businesses
organize, search, and use internal information.

POSITION SUMMARY
We are hiring an AI Engineer to build reliable
LLM applications, backend APIs, and document retrieval systems.

REQUIRED QUALIFICATIONS
- Strong professional experience with Python.
- Backend development using FastAPI.
- REST API design and integration.
- Experience integrating LLM APIs.
- Retrieval-Augmented Generation (RAG).
- Document embeddings and vector databases.
- SQL or PostgreSQL.
- Experience with Docker.
- CI/CD development workflows.
- Automated testing with pytest or similar tools.
- Experience deploying AI applications.
- Strong technical communication.

RESPONSIBILITIES
- Build and maintain LLM-powered applications.
- Develop backend APIs for AI services.
- Implement document ingestion and retrieval pipelines.
- Build RAG-based search and question-answering features.
- Improve application reliability and testing.
- Integrate AI services with existing products.
- Collaborate with engineering and product teams.

PREFERRED QUALIFICATIONS
- LLM evaluation methodologies.
- Model observability and monitoring.
- Cloud infrastructure experience.
- Performance optimization.
- Experience improving RAG retrieval quality.`,

    // ----------------------------------------------------------
    // MOCK INTERVIEW CONTEXT
    // ----------------------------------------------------------

    interviewContext: `You are interviewing Jordan Lee for an
AI Engineer position focused on LLM-powered applications.

The candidate has three years of software and AI engineering
experience, including Python, FastAPI, REST APIs, RAG,
vector databases, Docker, SQL, automated testing, and CI/CD.

Evaluate the candidate's understanding of:
- RAG architecture.
- Document chunking and embeddings.
- Retrieval quality and relevance.
- FastAPI service design.
- Error handling and reliability.
- Docker deployment.
- LLM evaluation.
- Production monitoring.
- Security considerations.

Ask realistic questions for an experienced AI Engineer.
Use follow-up questions to assess architectural reasoning.
Do not assume experience not described in the CV.`,

    // ----------------------------------------------------------
    // JOB DISCOVERY QUERY
    // ----------------------------------------------------------

    jobSearchQuery: "LLM Engineer",
  },

  // ============================================================
  // SCENARIO 3 — LEGAL AI CAREER TRANSITION
  // ============================================================

  {
    id: "legal-ai-transition",

    label: "Legal AI Transition",

    candidateName: "Taylor Rivera",

    // Target role used for CV evaluation.
    role: "Legal AI Engineer",

    // ----------------------------------------------------------
    // FICTIONAL CV
    // ----------------------------------------------------------

    cv: `TAYLOR RIVERA
Legal Professional Transitioning to AI Engineering

PROFESSIONAL SUMMARY
Qualified legal professional with five years of experience
in legal research, contract analysis, and regulatory compliance.

Recently completed AI Engineering training and developed
practical applications using Python, document processing,
prompt engineering, and LLM APIs.

Seeking a role combining legal-domain expertise and
artificial intelligence.

DOMAIN EXPERTISE
- Legal research
- Contract drafting and review
- Regulatory compliance
- Legal document interpretation
- Risk assessment
- Legal writing and communication
- Confidential document handling
- Legal workflow optimization

TECHNICAL SKILLS
- Python fundamentals
- pandas
- Prompt engineering
- LLM API integration
- PDF text extraction
- Basic FastAPI
- Git and GitHub
- Introductory vector search concepts
- Document preprocessing

PROFESSIONAL EXPERIENCE

Legal Associate — Meridian Legal Advisory
2021–2026

- Reviewed commercial contracts and legal agreements.
- Conducted research into legislation and regulations.
- Prepared legal opinions and research summaries.
- Identified contractual risks and compliance concerns.
- Communicated legal findings to business stakeholders.
- Managed sensitive and confidential information.
- Supported improvements in document review workflows.

AI ENGINEERING TRAINING — 2026

- Studied Python programming and data processing.
- Built introductory machine learning exercises.
- Practiced integrating LLM APIs into applications.
- Developed prototypes for document summarization.
- Learned introductory backend development with FastAPI.

PROJECTS

Legal Document Summarizer
- Built a Python prototype to extract text from PDF files.
- Integrated an LLM API to summarize legal documents.
- Experimented with prompts for identifying contract clauses.
- Produced structured summaries for manual legal review.
- Investigated risks of inaccurate AI-generated legal claims.

Contract Clause Categorization Prototype
- Processed sample contract documents using Python.
- Identified common types of contractual provisions.
- Tested prompt-based classification of contract clauses.
- Documented limitations and the need for human validation.

EDUCATION
Law Degree
AI Engineering Training — 2026

CURRENT DEVELOPMENT GOALS
- Advanced Python engineering
- Production RAG applications
- Vector databases and retrieval optimization
- Automated LLM evaluation
- Secure cloud deployment
- Backend system architecture
- Production software engineering practices`,

    // ----------------------------------------------------------
    // TARGET JOB DESCRIPTION
    // ----------------------------------------------------------

    jobDescription: `LEGAL AI ENGINEER

COMPANY OVERVIEW
We develop artificial intelligence applications for
law firms, corporate legal departments, and compliance teams.

POSITION SUMMARY
We are seeking a Legal AI Engineer to design and implement
AI-powered legal research and document processing systems.

REQUIRED QUALIFICATIONS
- Understanding of legal document workflows.
- Strong Python programming.
- Experience building LLM-powered applications.
- Retrieval-Augmented Generation (RAG).
- Vector databases and document embeddings.
- Experience with FastAPI or similar backend frameworks.
- LLM output evaluation and quality assurance.
- Knowledge of data privacy and confidential information.
- Secure document processing.
- Experience deploying production applications.
- Strong communication with legal stakeholders.

RESPONSIBILITIES
- Develop AI systems for legal document analysis.
- Build legal research and retrieval workflows.
- Create document summarization pipelines.
- Design methods to evaluate AI output accuracy.
- Support human review of AI-generated content.
- Collaborate with legal professionals and engineers.
- Address data protection and security requirements.

PREFERRED QUALIFICATIONS
- Previous experience in legal practice.
- Familiarity with contract analysis.
- Experience with document automation.
- Knowledge of AI governance and compliance.
- Experience developing enterprise AI applications.`,

    // ----------------------------------------------------------
    // MOCK INTERVIEW CONTEXT
    // ----------------------------------------------------------

    interviewContext: `You are interviewing Taylor Rivera for
a Legal AI Engineer position.

The candidate is an experienced legal professional
transitioning into AI engineering.

Their strengths include legal research, contract analysis,
legal workflows, confidentiality, and communication.

Their technical experience includes Python fundamentals,
LLM APIs, prompt engineering, PDF extraction, and
introductory backend development.

Evaluate:
- Legal-document workflow understanding.
- Python and LLM application fundamentals.
- RAG and document retrieval concepts.
- AI hallucination and accuracy risks.
- Legal confidentiality and data privacy.
- Human-in-the-loop validation.
- Ability to collaborate with software engineers.
- Awareness of current technical limitations.

Explore transferable skills while assessing technical gaps.
Do not assume production experience that is not documented.`,

    // ----------------------------------------------------------
    // JOB DISCOVERY QUERY
    // ----------------------------------------------------------

    jobSearchQuery: "Legal AI",
  },
];
