import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getAIHealthAdvice } from '../../lib/huggingface';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Brain, AlertTriangle } from 'lucide-react';

const symptomSchema = z.object({
  description: z.string().min(10, 'Please provide a detailed description (at least 10 characters)'),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

interface SymptomFormProps {
  onSubmitSuccess?: () => void;
}

export const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
  });

  const onSubmit = async (data: SymptomFormData) => {
    if (!user) return;

    setLoading(true);
    setAiLoading(true);
    
    try {
      // Show AI loading state
      toast.loading('Analyzing symptoms with AI...', { id: 'ai-analysis' });
      
      // Get AI advice using the new Hugging Face integration
      const aiResult = await getAIHealthAdvice(data.description);
      
      toast.dismiss('ai-analysis');
      setAiLoading(false);

      // Save to database
      const { error } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          description: data.description,
          ai_advice: aiResult.advice,
          referral_needed: aiResult.referralNeeded,
        });

      if (error) throw error;

      if (aiResult.referralNeeded) {
        toast.success('Symptoms logged with urgent care recommendation', {
          icon: '⚠️',
          duration: 6000,
        });
      } else {
        toast.success('Symptoms logged successfully!');
      }
      
      reset();
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error logging symptoms:', error);
      toast.dismiss('ai-analysis');
      setAiLoading(false);
      toast.error(error instanceof Error ? error.message : 'Failed to log symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <div className="flex items-center mb-4">
          <Brain className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Log Your Symptoms</h2>
        </div>
        
        {aiLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-blue-800 font-medium">Analyzing symptoms with AI...</span>
            </div>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Describe your symptoms in detail
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              placeholder="Please describe your symptoms, when they started, severity, and any other relevant details..."
              {...register('description')}
              disabled={loading || aiLoading}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.description.message}
              </motion.p>
            )}
          </div>
          <Button
            type="submit"
            loading={loading || aiLoading}
            className="w-full"
          >
            <Brain className="w-4 h-4 mr-2" />
            Get AI Health Advice
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};