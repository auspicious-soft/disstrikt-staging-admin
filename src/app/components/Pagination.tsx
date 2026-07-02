import React from 'react';
import CustomButton from './CustomButton';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {

   const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="self-stretch py-4 inline-flex justify-between items-center">
      <div className="flex justify-start items-start gap-2.5">
        <span className="text-zinc-500 text-sm font-normal font-['Inter'] leading-tight">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <div className="flex justify-start items-start gap-4">
        <CustomButton
          label="Previous"
          variant="Outline"
          state={currentPage === 1 ? "Disabled" : "Default"}
          style="New York"
          onClick={handlePrev}
        />
        <CustomButton
          label="Next"
          variant="Outline"
          state={currentPage === totalPages ? "Disabled" : "Default"}
          style="New York"
          onClick={handleNext}
        />
      </div>
    </div>
  );
};

export default Pagination;