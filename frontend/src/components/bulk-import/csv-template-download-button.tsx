'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface CSVTemplateDownloadButtonProps {
  onDownload: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  disabled?: boolean;
}

export const CSVTemplateDownloadButton: React.FC<CSVTemplateDownloadButtonProps> = ({
  onDownload,
  variant = 'outline',
  className = '',
  disabled = false
}) => {
  return (
    <Button
      variant={variant}
      className={className}
      onClick={onDownload}
      disabled={disabled}
    >
      <Download className="w-4 h-4 mr-2" />
      Unduh Template
    </Button>
  );
};

export default CSVTemplateDownloadButton;