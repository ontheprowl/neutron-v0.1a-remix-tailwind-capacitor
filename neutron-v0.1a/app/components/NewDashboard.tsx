import * as React from "react";

export default function NewDashboard() {
  return (
    <div className="w-full h-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-gray-400 w-96 h-96 relative z-0">
        <p className="italic text-bold bd-red-100 font-serif">Map</p>
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <p className="text-2xl font-bold">This should be on top of the map</p>
        </div>
      </div>
    </div>
  );
}
