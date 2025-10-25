'use client';

import { useState } from 'react';
import { FileUploadStep } from './steps/file-upload-step';
import { PreviewStep } from './steps/preview-step';
import { ProgressStep } from './steps/progress-step';
import { SummaryStep } from './steps/summary-step';
import { BulkImportResult, ImportRow } from '@/types/bulk-import';

type Step = 'upload' | 'preview' | 'progress' | 'summary';

interface BulkImportWizardProps {
  onComplete: () => void;
}

export function BulkImportWizard({ onComplete }: BulkImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <StepIndicator step={1} active={currentStep === 'upload'} label="Upload" />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator step={2} active={currentStep === 'preview'} label="Preview" />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator step={3} active={currentStep === 'progress'} label="Import" />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator step={4} active={currentStep === 'summary'} label="Summary" />
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <FileUploadStep
          onFileSelected={(file, parsedRows) => {
            setFile(file);
            setRows(parsedRows);
            setCurrentStep('preview');
          }}
        />
      )}

      {currentStep === 'preview' && (
        <PreviewStep
          rows={rows}
          onBack={() => setCurrentStep('upload')}
          onProceed={() => setCurrentStep('progress')}
        />
      )}

      {currentStep === 'progress' && file && (
        <ProgressStep
          file={file}
          rows={rows.filter(r => r.isValid)}
          onComplete={(result) => {
            setImportResult(result);
            setCurrentStep('summary');
          }}
          onBack={() => setCurrentStep('preview')}
        />
      )}

      {currentStep === 'summary' && importResult && (
        <SummaryStep
          result={importResult}
          onClose={onComplete}
        />
      )}
    </div>
  );
}

function StepIndicator({ step, active, label }: { step: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
      `}>
        {step}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
}