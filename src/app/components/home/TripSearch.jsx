"use client";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

export default function TripSearch() {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: undefined,
    endDate: undefined,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const startDateBtnRef = useRef(null);
  const endDateBtnRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (startDateBtnRef.current?.contains(e.target) || 
          endDateBtnRef.current?.contains(e.target) ||
          startCalendarRef.current?.contains(e.target) ||
          endCalendarRef.current?.contains(e.target)) {
        return;
      }
      
      setStartDateOpen(false);
      setEndDateOpen(false);
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (searchData.startDate && searchData.endDate && searchData.endDate < searchData.startDate) {
      setSearchData(prev => ({...prev, endDate: searchData.startDate}));
    }
  }, [searchData.startDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (field, date) => {
    setSearchData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search Data:", searchData);
  };

  return (
    <section id="search-section" className="py-20 min-h-screen flex flex-col justify-center bg-[var(--tw-background)]" style={{ position: 'relative' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--tw-text)]">
            Discover <span className="text-[var(--tw-focus)]">Your Next Adventure</span> 
          </h2>
          <p className="text-xl opacity-90 mb-8 text-[var(--tw-text)]">
            From ancient wonders to modern marvels, find the perfect destination
            for your journey. Search, plan, and embark on an unforgettable
            experience with <span className="text-[var(--tw-focus)]">TripWeaver</span>.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl relative"
          style={{ zIndex: 5 }}
        >
          <div className="flex flex-col gap-6 mb-6">
            <div className="w-full">
              <label htmlFor="destination" className="block mb-2 font-medium text-[var(--tw-text)]">
                Where do you want to go?
              </label>
              <input 
                type="text" 
                id="destination" 
                name="destination" 
                placeholder="Search cities, places, landmarks..." 
                value={searchData.destination} 
                onChange={handleChange} 
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)]" 
                style={{
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  "--placeholder-color": "var(--tw-text)"
                }} 
                required
              />
              <style jsx>{`
                .placeholder-custom::placeholder {
                  color: var(--tw-text);
                  opacity: 0.6;
                }
              `}</style>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[200px] relative">
                <label htmlFor="startDate" className="block mb-2 font-medium text-[var(--tw-text)]">Start Date</label>
                <Button
                  ref={startDateBtnRef}
                  type="button"
                  variant="outline"
                  className="w-full px-4 py-2 justify-start text-left font-normal bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)] hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)]"
                  onClick={() => {
                    setStartDateOpen(!startDateOpen);
                    setEndDateOpen(false);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchData.startDate ? (
                    format(searchData.startDate, "PPP")
                  ) : (
                    <span>Select start date</span>
                  )}
                </Button>
                
                {startDateOpen && (
                  <div 
                    ref={startCalendarRef}
                    className="absolute z-[200] bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg p-2"
                    style={{ 
                      top: `calc(100% + 5px)`, 
                      left: 0,
                      width: '100%',
                      minWidth: '280px'
                    }}
                  >
                    <Calendar
                      mode="single"
                      selected={searchData.startDate}
                      onSelect={(date) => {
                        handleDateChange("startDate", date);
                        setStartDateOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      className="text-[var(--tw-text)]"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[200px] relative">
                <label 
                  htmlFor="endDate" 
                  className="block mb-2 font-medium text-[var(--tw-text)]"
                >
                  End Date
                </label>
                <Button
                  ref={endDateBtnRef}
                  type="button"
                  variant="outline"
                  className="w-full px-4 py-2 justify-start text-left font-normal bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)] hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)]"
                  onClick={() => {
                    setEndDateOpen(!endDateOpen);
                    setStartDateOpen(false);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchData.endDate ? (
                    format(searchData.endDate, "PPP")
                  ) : (
                    <span>Select end date</span>
                  )}
                </Button>
                
                {endDateOpen && (
                  <div 
                    ref={endCalendarRef}
                    className="absolute z-[200] bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg p-2"
                    style={{ 
                      top: `calc(100% + 5px)`, 
                      left: 0,
                      width: '100%',
                      minWidth: '280px'
                    }}
                  >
                    <Calendar
                      mode="single"
                      selected={searchData.endDate}
                      onSelect={(date) => {
                        handleDateChange("endDate", date);
                        setEndDateOpen(false);
                      }}
                      disabled={(date) => 
                        date < new Date() || (searchData.startDate ? date < searchData.startDate : false)
                      }
                      className="text-[var(--tw-text)]"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-[200px] flex items-end">
                <button 
                  type="submit"
                  className="w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white"
                >
                  Search Trips
                </button>
              </div>
            </div>
          </div>
        </form>
        <div className="mt-12 text-center">
          <p className="text-lg opacity-90 text-[var(--tw-text)]">
            Popular destinations: <span className="text-[var(--tw-focus)]">Paris</span>, 
            <span className="text-[var(--tw-focus)]"> Tokyo</span>, 
            <span className="text-[var(--tw-focus)]"> New York</span>, 
            <span className="text-[var(--tw-focus)]"> Bali</span>, 
            <span className="text-[var(--tw-focus)]"> Rome</span>
          </p>
        </div>
      </div>
    </section>
  );
}
