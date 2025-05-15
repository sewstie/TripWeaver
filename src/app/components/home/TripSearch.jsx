"use client";
import { useState } from "react";

export default function TripSearch() {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search Data:", searchData);
  };

  return (
    <section className="py-20 min-h-screen flex flex-col justify-center bg-[var(--background)]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text)]">
            Discover <span className="text-[var(--focus)]">Your Next Adventure</span> 
          </h2>
          <p className="text-xl opacity-90 mb-8 text-[var(--text)]">
            From ancient wonders to modern marvels, find the perfect destination
            for your journey. Search, plan, and embark on an unforgettable
            experience with <span className="text-[var(--focus)]">TripWeaver</span>.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-[var(--subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl"
        >
          <div className="flex flex-col gap-6 mb-6">
            <div className="w-full">
              <label htmlFor="destination" className="block mb-2 font-medium text-[var(--text)]">
                Where do you want to go?
              </label>
              <input 
                type="text" 
                id="destination" 
                name="destination" 
                placeholder="Search cities, places, landmarks..." 
                value={searchData.destination} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 placeholder-custom bg-[var(--field)] border border-[var(--border)] text-[var(--text)]" 
                style={{
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  "--placeholder-color": "var(--text)"
                }} 
                required
              />
              <style jsx>{`
                .placeholder-custom::placeholder {
                  color: var(--text);
                  opacity: 0.6;
                }
              `}</style>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="startDate" className="block mb-2 font-medium text-[var(--text)]">Start Date</label>
                <input 
                  type="date" 
                  id="startDate" 
                  name="startDate" 
                  value={searchData.startDate} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 bg-[var(--field)] border border-[var(--border)] text-[var(--text)]" 
                  required
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label 
                  htmlFor="endDate" 
                  className="block mb-2 font-medium text-[var(--text)]"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={searchData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 bg-[var(--field)] border border-[var(--border)] text-[var(--text)]"
                  required
                />
              </div>
              
              <div className="flex-1 min-w-[200px] flex items-end">
                <button 
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--focus)] text-white"
                >
                  Search Trips
                </button>
              </div>
            </div>
          </div>
        </form>
        <div className="mt-12 text-center">
          <p className="text-lg opacity-90 text-[var(--text)]">
            Popular destinations: <span className="text-[var(--focus)]">Paris</span>, 
            <span className="text-[var(--focus)]"> Tokyo</span>, 
            <span className="text-[var(--focus)]"> New York</span>, 
            <span className="text-[var(--focus)]"> Bali</span>, 
            <span className="text-[var(--focus)]"> Rome</span>
          </p>
        </div>
      </div>
    </section>
  );
}
