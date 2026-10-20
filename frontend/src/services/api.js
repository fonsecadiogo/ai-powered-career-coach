const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

async function postJSON(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Unable to complete the request."
    );
  }

  return data;
}

export function startInterview(role, jobDescription = "") {
  return postJSON("/interview/start", {
    role,
    job_description: jobDescription,
  });
}

export function submitInterviewAnswer(session, answer) {
  return postJSON("/interview/answer", {
    session,
    answer,
  });
}

export function finishInterview(session) {
  return postJSON("/interview/finish", {
    session,
  });
}


export async function reviewCV({
  role,
  cvText = "",
  cvFile = null,
  jobDescription = "",
}) {
  // Create the multipart form sent to our FastAPI endpoint.
  const formData = new FormData();

  // The target role is required by the backend.
  formData.append("role", role);

  // Send exactly one CV input: either a PDF or text.
  if (cvFile) {
    formData.append("cv_file", cvFile);
  } else {
    formData.append("cv_text", cvText);
  }

  // Include the optional job description when provided.
  if (jobDescription.trim()) {
    formData.append("job_description", jobDescription.trim());
  }

  // Do not set Content-Type manually for FormData.
  const response = await fetch(`${API_BASE_URL}/review-cv`, {
    method: "POST",
    body: formData,
  });

  // Read the structured response or backend error.
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Unable to review the CV."
    );
  }

  // Return the score, strengths, weaknesses and suggestions.
  return data;
}
