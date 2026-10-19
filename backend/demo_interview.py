"""Interactive terminal demo; run with python -m backend.demo_interview."""

from .interview import InterviewError, finish_interview, start_interview, submit_answer


def main() -> None:
    print("\n=== AI-Powered Career Coach | Mock Interview ===")
    role = input("Target role: ").strip()
    description = input("Job description (optional): ").strip()
    try:
        session = start_interview(role, description)
        while True:
            pending = session.turns[-1]
            if pending.answer is None:
                print(f"\nQuestion {len(session.turns)}: {pending.question.question}")
                answer = input("Your answer (or /finish): ").strip()
                if answer.lower() == "/finish":
                    break
                session = submit_answer(session, answer)
            if session.status == "ready_for_feedback":
                break
        session, report = finish_interview(session)
        print("\n=== ASSESSMENT ===")
        print(report.model_dump_json(indent=2))
    except (InterviewError, KeyboardInterrupt, EOFError) as exc:
        print(f"\nInterview stopped: {exc or 'Interrupted by user.'}")


if __name__ == "__main__":
    main()
