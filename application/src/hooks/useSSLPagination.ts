
import { useState, useMemo } from 'react';
import { SSLCertificate } from '@/types/ssl.types';

export type SSLPageSize = 10 | 30 | 50;

interface UseSSLPaginationProps {
  certificates: SSLCertificate[];
  initialPageSize?: SSLPageSize;
}

export const useSSLPagination = ({ 
  certificates, 
  initialPageSize = 10 
}: UseSSLPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<SSLPageSize>(initialPageSize);

  const { paginatedCertificates, totalPages } = useMemo(() => {
    const totalItems = certificates.length;
    const pages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      paginatedCertificates: certificates.slice(startIndex, endIndex),
      totalPages: Math.max(1, pages)
    };
  }, [certificates, currentPage, pageSize]);

  // Reset to first page when page size changes or certificates change
  const handlePageSizeChange = (newPageSize: SSLPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Reset to first page if current page exceeds total pages
  const handlePageChange = (page: number) => {
    const validPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(validPage);
  };

  return {
    paginatedCertificates,
    currentPage,
    totalPages,
    pageSize,
    totalItems: certificates.length,
    handlePageChange,
    handlePageSizeChange,
  };
};