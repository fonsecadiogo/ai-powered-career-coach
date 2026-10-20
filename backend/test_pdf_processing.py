
from pathlib import Path
from cv_reviewer import extract_cv_from_pdf

# Location of a fictional PDF used for testing.
pdf_path = Path("sample_cv.pdf")

# Read the PDF as binary data.
pdf_bytes = pdf_path.read_bytes()

# Extract and validate its text.
result = extract_cv_from_pdf(pdf_bytes)

# Display a short preview of the extracted content.
print("Extracted CV text:")
print(result[:500])

# Check that meaningful content was extracted.
assert len(result) > 0

print("PDF extraction test passed!")
