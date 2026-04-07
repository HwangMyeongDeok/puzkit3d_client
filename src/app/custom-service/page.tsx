'use client';

import { useState } from 'react';

import { handleErrorToast } from '@/lib/utils/error-handler';
import { useCreateCustomDesignRequestMutation } from '@/lib/api/endpoints/customDesignApi';
import { useGetPresignedUrlMutation } from '@/lib/api/endpoints/uploadApi';

import {
  LandingHero,
  StepHeader,
  StepInputMethod,
  StepCoreSpecs,
  StepDesignPrompt,
  StepLogistics,
} from '@/components/customService';

import type { ViewType, ConfiguratorState } from '@/components/customService';
import { INITIAL_CONFIG } from '@/components/customService';
import { useGetCustomDesignRequirementsQuery } from '@/lib/api/endpoints/customDesignRequirementApi';
import StepReview from '@/components/customService/StepReview';
import { toast } from 'sonner';

export default function CustomDesignPage() {
  const [view, setView] = useState<ViewType>('landing');
  const [config, setConfig] = useState<ConfiguratorState>(INITIAL_CONFIG);

  // API Mutations
  const [createCustomDesignRequest, { isLoading: isSubmitting }] =
    useCreateCustomDesignRequestMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: requirements = [], isLoading: isLoadingRequirements } =
    useGetCustomDesignRequirementsQuery();
  const activeRequirements = requirements.filter((req) => req.isActive);

  const updateConfig = (updates: Partial<ConfiguratorState>) => {
    setConfig((prev) => {
      const newState = { ...prev, ...updates };
      if (updates.topic && updates.topic !== prev.topic) {
        newState.material = '';
        newState.assembly = '';
        newState.difficulty = 'Basic';
        newState.capabilities = [];
      }
      return newState;
    });
  };

  const handleCapabilityToggle = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter((c) => c !== id)
        : [...prev.capabilities, id],
    }));
  };

  const handleFileUpload = (files: File[]) => {
    updateConfig({
      uploadedFiles: [...(config.uploadedFiles || []), ...files],
    });
  };

  const handleGenerate = () => {
    updateConfig({ isGenerating: true });
    // TODO: Implement AI generation logic
    setTimeout(() => {
      updateConfig({ isGenerating: false });
    }, 2000);
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);

      if (!config.Type) {
        throw new Error('Missing input method. Please start over.');
      }

      // --- BƯỚC 1: THỰC HIỆN UPLOAD FILE LÊN S3 ---
      let finalSketchPaths: string[] = [];

      if (config.uploadedFiles && config.uploadedFiles.length > 0) {
        // Chạy vòng lặp upload tất cả file đang có trong config
        const uploadPromises = config.uploadedFiles.map(async (file) => {
          // A. Lấy presigned URL cho từng file
          const { path, presignedUrl } = await getPresignedUrl({
            fileName: file.name,
            contentType: file.type,
            folder: 'custom-designs',
          }).unwrap();

          // B. Thực hiện PUT file lên Storage (S3/GCS...)
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadResponse.ok) throw new Error(`Failed to upload: ${file.name}`);

          return path; // Trả về path để tí nữa gửi vào DB
        });

        finalSketchPaths = await Promise.all(uploadPromises);
      }

      // --- BƯỚC 2: GỬI REQUEST TẠO DESIGN ---
      const requestData = {
        type: config.Type,
        customDesignRequirementId: config.requirementId,
        desiredLengthMm: config.dimensions.length,
        desiredWidthMm: config.dimensions.width,
        desiredHeightMm: config.dimensions.height,
        sketches: finalSketchPaths,
        customerPrompt: config.aiPrompt,
        desiredDeliveryDate: config.deliveryDate
          ? new Date(config.deliveryDate).toISOString()
          : new Date().toISOString(),
        desiredQuantity: config.quantity || 1,
        targetBudget: config.budget || 0,
      };

      const response = await createCustomDesignRequest(requestData).unwrap();

      toast.success('Request Submitted Successfully!', {
        duration: 5000,
        position: 'top-right',
      });

      setView('landing');
      setConfig(INITIAL_CONFIG);
      setUploadedFileUrls([]);
    } catch (error) {
      handleErrorToast(error, 'Failed to submit request');
      const backendErrorMsg =
        (error as any)?.data?.message || (error as any)?.data || 'Failed to submit request';
      setSubmitError(
        typeof backendErrorMsg === 'string'
          ? backendErrorMsg
          : 'Failed to submit request. Check your info!'
      );
      console.error('Submission error:', error);
    }
  };

  if (view === 'landing') {
    return <LandingHero onStart={() => setView('tool')} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 pb-12 font-sans text-slate-900">
      <StepHeader currentStep={config.step} onExit={() => setView('landing')} />

      <div className="mx-auto max-w-4xl px-6 pt-12">
        {config.step === 1 && <StepInputMethod config={config} updateConfig={updateConfig} />}

        {config.step === 2 && (
          <StepCoreSpecs
            config={config}
            updateConfig={updateConfig}
            onCapabilityToggle={handleCapabilityToggle}
            requirements={activeRequirements}
            isLoadingRequirements={isLoadingRequirements}
          />
        )}

        {config.step === 3 && (
          <StepDesignPrompt
            config={config}
            updateConfig={updateConfig}
            onGenerate={handleGenerate}
          />
        )}

        {config.step === 4 && <StepLogistics config={config} updateConfig={updateConfig} />}

        {config.step === 5 && (
          <StepReview
            config={config}
            updateConfig={updateConfig}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            requirements={activeRequirements}
          />
        )}
      </div>
    </div>
  );
}
