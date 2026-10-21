import pytest

from backend.cv_reviewer import prepare_cv_text


def test_valid_cv_text():
    cv = "  Python developer with SQL experience. "

    result = prepare_cv_text(cv)

    assert result == "Python developer with SQL experience."


def test_missing_cv_rejected():
    with pytest.raises(ValueError):
        prepare_cv_text(None)


def test_empty_cv_rejected():
    with pytest.raises(ValueError):
        prepare_cv_text("    ")
