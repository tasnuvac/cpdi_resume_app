import ErrorModal from "../components/errorModal";

// Placeholder: the results page will show the structure checklist and the
// major and class year checklist once the AI check is built.
export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <ErrorModal
        title="Results are coming soon!"
        message="Resume feedback isn't available yet. Head back to the start to explore the app."
        buttonText="Go to Resume Check"
        buttonHref="/optimize"
      />
    </main>
  );
}
