/**
 * useTechPackFiles Hook
 * Manages tech pack file operations (download, share, generate)
 */

import { useState, useCallback } from 'react';
import { techPackApi } from '../../services/techPackApi';
import type { TechPackData, TechPackFiles, UseTechPackFilesReturn } from '../../types/techPack';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

export function useTechPackFiles(
  techPackData: TechPackData | null
): UseTechPackFilesReturn {
  const [files, setFiles] = useState<TechPackFiles>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Helper to trigger file download
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Download PDF
   */
  const downloadPDF = useCallback(async () => {
    if (!techPackData) {
      toast({
        title: 'No Tech Pack',
        description: 'Please generate a tech pack first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const blob = await techPackApi.downloadPDF(techPackData);
      const filename = `${techPackData.tech_pack_data.productName}_techpack.pdf`;
      downloadBlob(blob, filename);

      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [techPackData, toast]);

  /**
   * Download Excel
   */
  const downloadExcel = useCallback(async () => {
    if (!techPackData) {
      toast({
        title: 'No Tech Pack',
        description: 'Please generate a tech pack first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const blob = await techPackApi.downloadExcel(techPackData);
      const filename = `${techPackData.tech_pack_data.productName}_techpack.xlsx`;
      downloadBlob(blob, filename);

      toast({
        title: 'Success',
        description: 'Excel downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download Excel',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [techPackData, toast]);

  /**
   * Download all files as ZIP
   */
  const downloadAllFiles = useCallback(async () => {
    if (!techPackData) {
      toast({
        title: 'No Tech Pack',
        description: 'Please generate a tech pack first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const zip = new JSZip();
      const productName = techPackData.tech_pack_data.productName;

      // Add PDF
      try {
        const pdfBlob = await techPackApi.downloadPDF(techPackData);
        zip.file(`${productName}_techpack.pdf`, pdfBlob);
      } catch (err) {
        console.warn('Skipping PDF:', err);
      }

      // Add Excel
      try {
        const excelBlob = await techPackApi.downloadExcel(techPackData);
        zip.file(`${productName}_techpack.xlsx`, excelBlob);
      } catch (err) {
        console.warn('Skipping Excel:', err);
      }

      // Add technical images if available
      const techImages = (techPackData as any).technical_images;
      if (techImages) {
        const imagePromises: Promise<void>[] = [];

        Object.entries(techImages).forEach(([key, value]: [string, any]) => {
          if (value?.url) {
            imagePromises.push(
              fetch(value.url)
                .then((r) => r.blob())
                .then((blob) => {
                  const ext = value.type || 'png';
                  zip.file(`${key}.${ext}`, blob);
                })
                .catch((err) => console.warn(`Skipping ${key}:`, err))
            );
          }
        });

        await Promise.all(imagePromises);
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, `${productName}_techpack_complete.zip`);

      toast({
        title: 'Success',
        description: 'All files downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading files:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [techPackData, toast]);

  /**
   * Generate technical files (6 credits)
   */
  const generateTechnicalFiles = useCallback(async (): Promise<boolean> => {
    if (!techPackData) {
      toast({
        title: 'No Tech Pack',
        description: 'Please generate a tech pack first',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      const result = await techPackApi.generateTechnicalFiles(
        techPackData.product_idea_id,
        techPackData // Pass the full tech pack data
      );

      if (result.success) {
        setFiles((prev) => ({
          ...prev,
          technicalImages: result.files?.technicalImages,
        }));

        toast({
          title: 'Success',
          description: `Technical files generated (${result.creditsUsed} credits used)`,
        });

        return true;
      }

      throw new Error(result.error || 'Failed to generate files');
    } catch (error) {
      console.error('Error generating technical files:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [techPackData, toast]);

  /**
   * Share tech pack
   */
  const shareTechPack = useCallback(
    async (method: 'email' | 'whatsapp', recipient: string): Promise<boolean> => {
      if (!techPackData) {
        toast({
          title: 'No Tech Pack',
          description: 'Please generate a tech pack first',
          variant: 'destructive',
        });
        return false;
      }

      setLoading(true);
      try {
        let success = false;

        if (method === 'email') {
          success = await techPackApi.shareTechPackByEmail(techPackData, recipient);
        } else if (method === 'whatsapp') {
          success = await techPackApi.shareTechPackByWhatsApp(techPackData, recipient);
        }

        if (success) {
          toast({
            title: 'Shared',
            description: `Tech pack shared via ${method}`,
          });
        } else {
          throw new Error('Failed to share');
        }

        return success;
      } catch (error) {
        console.error('Error sharing tech pack:', error);
        toast({
          title: 'Share Failed',
          description: 'Failed to share tech pack',
          variant: 'destructive',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [techPackData, toast]
  );

  return {
    files,
    loading,
    downloadPDF,
    downloadExcel,
    downloadAllFiles,
    generateTechnicalFiles,
    shareTechPack,
  };
}
