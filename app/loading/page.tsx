import ErrorModal from "../components/errorModal";

// Placeholder: this page will run the AI resume check once it's built.
// The cover letter version (which called the Gemini API) was removed so the
// app runs without any API key while the UI is being built.
export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <ErrorModal
        title="Resume feedback is coming soon!"
        message="This part of the tool is still being built. Head back to the start to explore the app."
        buttonText="Go to Resume Check"
        buttonHref="/optimize"
      />
    </main>
  );
}
