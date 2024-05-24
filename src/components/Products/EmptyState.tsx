import { XCircle } from "lucide-react";
import React from "react";

const EmptyState = () => {
  return (
    <div className=" relative col-span-full h-80 bg-gray-50 w-full p-12 flex flex-col items-center justify-center">
      <XCircle className=" h-8 w-8 text-red-500" />
      <h3 className=" font-semibold text-xl">No Products Found</h3>
      <p className=" text-zinc-500 text-sm">
        Wo found no search results for these filters.
      </p>
    </div>
  );
};

export default EmptyState;
