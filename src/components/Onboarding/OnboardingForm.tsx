import React from 'react';

interface OnboardingFormProps {
  onComplete: () => void; // Callback when onboarding is finished
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  // TODO: Implement questionnaire state and logic

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Submitting onboarding data...");
    // TODO: Call backend /assessments endpoint
    // On successful submission from backend:
    // onComplete(); 
  };

  return (
    <div className="p-4 border rounded shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Welcome! Let's get started.</h2>
      <p className="mb-4">Please answer a few questions about your fitness level and goals.</p>
      <form onSubmit={handleSubmit}>
        {/* TODO: Add questionnaire form fields here */}
        <p className="text-sm text-gray-500 mb-4">[Questionnaire fields will go here]</p>
        
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          // disabled={/* Add condition based on form validity */} 
        >
          Submit Assessment
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm; 