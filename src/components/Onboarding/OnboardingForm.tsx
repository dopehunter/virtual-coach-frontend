import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Import supabase client

interface OnboardingFormProps {
  onComplete: () => void; // Callback when onboarding is finished
}

// Define the structure for the form data
interface FormData {
  runExperience: string;
  runDuration: string;
  swimExperience: string;
  swimDuration: string;
  primaryGoal: string;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<FormData>({
    runExperience: '',
    runDuration: '',
    swimExperience: '',
    swimDuration: '',
    primaryGoal: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on change
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log("Submitting onboarding data:", formData);

    try {
      // 1. Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      if (!session) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const token = session.accessToken;
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/assessments`;

      // 2. Call the backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // 3. Handle the response
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ detail: response.statusText })); // Try to parse error JSON
         console.error('API Error Response:', errorData);
         throw new Error(`Failed to submit assessment: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json(); // Contains swim_level, run_level, message
      console.log("Assessment submitted successfully:", result);
      onComplete(); // Notify App component that onboarding is done

    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple validation: Check if all fields are filled
  const isFormValid = Object.values(formData).every(value => value !== '');

  // Options for select fields
  const runExperienceOptions = [
    { value: '', label: 'Select running experience...' },
    { value: 'beginner', label: 'Beginner (Just starting)' },
    { value: 'monthly', label: 'Few times a month' },
    { value: 'low_weekly', label: '1-2 times/week' },
    { value: 'mid_weekly', label: '3-4 times/week' },
    { value: 'high_weekly', label: '5+ times/week' },
  ];
  const runDurationOptions = [
     { value: '', label: 'Select typical run duration...' },
     { value: '<30', label: '< 30 minutes' },
     { value: '30-60', label: '30-60 minutes' },
     { value: '60-90', label: '60-90 minutes' },
     { value: '>90', label: '> 90 minutes' },
  ];
  const swimExperienceOptions = [
    { value: '', label: 'Select swimming experience...' },
    { value: 'non_swimmer', label: 'Never / Cannot swim well' },
    { value: 'beginner', label: 'Beginner (Learning strokes)' },
    { value: 'comfortable', label: 'Comfortable lap swimming' },
    { value: 'experienced', label: 'Experienced / Competitive' },
  ];
  const swimDurationOptions = [
     { value: '', label: 'Select typical swim duration...' },
     { value: '<30', label: '< 30 minutes' },
     { value: '30-45', label: '30-45 minutes' },
     { value: '45-60', label: '45-60 minutes' },
     { value: '>60', label: '> 60 minutes' },
  ];
  const goalOptions = [
    { value: '', label: 'Select primary goal...' },
    { value: 'fitness', label: 'Improve general fitness' },
    { value: 'learn_swim', label: 'Learn to swim better' },
    { value: 'complete_5k', label: 'Complete first 5k' },
    { value: 'complete_10k', label: 'Complete first 10k' },
    { value: 'improve_time', label: 'Improve race time (any distance)' },
    { value: 'tri_sprint', label: 'Train for Sprint Triathlon' },
    { value: 'tri_olympic', label: 'Train for Olympic Triathlon' },
    { value: 'tri_half', label: 'Train for Half Ironman' },
    { value: 'tri_full', label: 'Train for Full Ironman' },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-w-lg mx-auto my-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome! Let's get started.</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Tell us about your current fitness and goals.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Running Section */}
        <div>
          <label htmlFor="runExperience" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Running Experience</label>
          <select 
            id="runExperience"
            name="runExperience"
            value={formData.runExperience}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {runExperienceOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="runDuration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Typical Run Duration</label>
          <select 
            id="runDuration"
            name="runDuration"
            value={formData.runDuration}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {runDurationOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Swimming Section */}
         <div>
          <label htmlFor="swimExperience" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Swimming Experience</label>
          <select 
            id="swimExperience"
            name="swimExperience"
            value={formData.swimExperience}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {swimExperienceOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="swimDuration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Typical Swim Duration</label>
          <select 
            id="swimDuration"
            name="swimDuration"
            value={formData.swimDuration}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {swimDurationOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Goal Section */}
         <div>
          <label htmlFor="primaryGoal" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Primary Goal</label>
          <select 
            id="primaryGoal"
            name="primaryGoal"
            value={formData.primaryGoal}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {goalOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
        )}
        
        <button 
          type="submit" 
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={!isFormValid || isLoading} 
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Submit Assessment'
          )}
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm; 