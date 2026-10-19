
from cv_reviewer import prepare_cv_text

# TEST 1: Valid CV text.
cv = "  Python developer with SQL experience. "

# Call our production function.
result = prepare_cv_text(cv)

# Display the result so we can inspect it.
print("Actual result:", repr(result))

# Verify that surrounding whitespace was removed.
assert result == "Python developer with SQL experience."

print("TEST 1 PASSED: Valid text processed")


try:
    prepare_cv_text(None)
except ValueError:
    print("TEST 2 PASSED: Missing CV rejected")


try:
    prepare_cv_text("    ")
except ValueError:
    print("TEST 3 PASSED: Empty CV rejected")
