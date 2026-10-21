from pathlib import Path

from backend.cv_reviewer import extract_cv_from_pdf


def test_pdf_extraction():
    # Locate the sample PDF next to this test file.
    pdf_path = Path(__file__).parent / "sample_cv.pdf"

    # Read and extract text from the PDF.
    pdf_bytes = pdf_path.read_bytes()
    result = extract_cv_from_pdf(pdf_bytes)

    # Verify that meaningful text was extracted.
    assert isinstance(result, str)
    assert len(result.strip()) > 0
