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
