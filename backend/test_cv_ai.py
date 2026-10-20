
from pathlib import Path

from cv_reviewer import extract_cv_from_pdf, analyze_cv

# Locate the fictional sample CV next to this test file.
pdf_path = Path(__file__).parent / "sample_cv.pdf"

# Read and extract text from the PDF.
pdf_bytes = pdf_path.read_bytes()
cv_text = extract_cv_from_pdf(pdf_bytes)

# Analyze the CV for our selected target role.
review = analyze_cv(
    cv_text=cv_text,
    role="Junior AI Engineer",
)

# Display the structured feedback.
print(review.model_dump_json(indent=2))

# Verify the result follows our response schema.
assert 0 <= review.score <= 100
assert isinstance(review.strengths, list)
assert isinstance(review.weaknesses, list)
assert isinstance(review.suggestions, list)

print("OpenAI CV analysis test passed!")
