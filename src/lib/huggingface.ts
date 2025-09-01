import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);

export interface AIAdviceResult {
  advice: string;
  referralNeeded: boolean;
  confidence: number;
}

export const getAIHealthAdvice = async (symptoms: string): Promise<AIAdviceResult> => {
  const apiKey = import.meta.env.VITE_HF_API_KEY;
  
  if (!apiKey) {
    return {
      advice: 'AI advice requires API configuration. Please consult with a healthcare professional for proper medical guidance.',
      referralNeeded: true,
      confidence: 0
    };
  }

  try {
    const prompt = `As a medical advisor, provide brief health advice for these symptoms: ${symptoms}. Include whether hospital referral is needed. Keep response under 100 words.`;
    
    const result = await hf.textGeneration({
      model: 'google/flan-t5-base',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true,
      },
    });

    const advice = result.generated_text || 'Unable to generate advice at this time. Please consult a healthcare professional.';
    
    // Check for referral keywords
    const referralKeywords = ['hospital', 'doctor', 'urgent', 'emergency', 'serious', 'immediate', 'seek medical'];
    const referralNeeded = referralKeywords.some(keyword => 
      advice.toLowerCase().includes(keyword)
    );

    // Simple confidence scoring based on response length and keywords
    const confidence = Math.min(0.9, Math.max(0.3, advice.length / 200));

    return {
      advice: advice.trim(),
      referralNeeded,
      confidence
    };
  } catch (error) {
    console.error('Hugging Face API error:', error);
    return {
      advice: 'Unable to connect to AI service. Please consult with a healthcare professional for proper medical advice.',
      referralNeeded: true,
      confidence: 0
    };
  }
};