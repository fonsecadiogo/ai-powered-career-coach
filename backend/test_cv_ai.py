from pathlib import Path

from backend.cv_reviewer import extract_cv_from_pdf, analyze_cv


def main():
    # Locate the fictional sample CV next to this file.
    pdf_path = Path(__file__).parent / "sample_cv.pdf"

    # Extract text from the PDF.
    pdf_bytes = pdf_path.read_bytes()
    cv_text = extract_cv_from_pdf(pdf_bytes)

    # Run a real OpenAI analysis.
    review = analyze_cv(
        cv_text=cv_text,
        role="Junior AI Engineer",
    )

    # Display structured feedback.
    print(review.model_dump_json(indent=2))

    # Validate the response schema.
    assert 0 <= review.score <= 100
    assert isinstance(review.strengths, list)
    assert isinstance(review.weaknesses, list)
    assert isinstance(review.suggestions, list)

    print("OpenAI CV analysis test passed!")


if __name__ == "__main__":
    main()
