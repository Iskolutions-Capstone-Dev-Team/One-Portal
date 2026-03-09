export default function PortalToolbar({ searchQuery, setSearchQuery, activeCategory, setActiveCategory}) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 py-1">
                    Welcome back,  
                    <span className="text-[#991b1b]"> Student!</span>
                </h1>
                <p className="text-sm text-gray-600">Manage your connected systems, track updates, and stay in sync with PUP Taguig’s digital ecosystem.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3">
                <div className="flex items-center gap-2">
                    <label className="input rounded-lg text-[1rem] h-12 bg-white w-full sm:w-64 flex items-center gap-2 border border-gray-300 px-3 py-2 shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-gray-300">
                        <svg className="h-5 w-5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full outline-none bg-transparent text-sm"/>
                    </label>
                    <div className="dropdown dropdown-end relative z-999" tabIndex={0}>
                        <button tabIndex={0} className="btn rounded-lg bg-white shadow-sm text-gray-400 border border-gray-300 hover:bg-[#b22222] hover:text-white h-12 flex justify-start dropdown-toggle">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 
                                        0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 
                                        3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 
                                        0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 
                                        0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 
                                        17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 
                                        1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 
                                        0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 
                                        10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 
                                        1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 
                                        16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
                            </svg>
                        </button>

                        <ul tabIndex={0} className="dropdown-content rounded-2xl menu bg-white text-gray-800 w-52 p-2 shadow-lg z-999">
                            <li><button onClick={() => setActiveCategory("All")} className={`text-xs transition-colors duration-200 py-2 rounded-lg ${ activeCategory === "All" ? "bg-[#ffd700] text-black": "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-[#b22222]"}`}>All</button></li>
                            <li><button onClick={() => setActiveCategory("Academic")} className={`text-xs transition-colors duration-200 py-2 rounded-lg ${ activeCategory === "Academic" ? "bg-[#ffd700] text-black": "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-[#b22222]"}`}>Academic</button></li>
                            <li><button onClick={() => setActiveCategory("Administrative")} className={`text-xs transition-colors duration-200 py-2 rounded-lg ${ activeCategory === "Administrative" ? "bg-[#ffd700] text-black": "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-[#b22222]"}`}>Administrative</button></li>
                            <li><button onClick={() => setActiveCategory("Student Services")} className={`text-xs transition-colors duration-200 py-2 rounded-lg ${ activeCategory === "Student Services" ? "bg-[#ffd700] text-black": "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-[#b22222]"}`}>Student Services</button></li>
                            <li><button onClick={() => setActiveCategory("Health & Wellness")} className={`text-xs transition-colors duration-200 py-2 rounded-lg ${ activeCategory === "Health & Wellness" ? "bg-[#ffd700] text-black": "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-[#b22222]"}`}>Health & Wellness</button></li>
                            <li><button onClick={() => setActiveCategory("Research & Development")} className={`text-xs transition-colors duration-200 py-2 rounded-lg ${ activeCategory === "Research & Development" ? "bg-[#ffd700] text-black": "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-[#b22222]"}`}>Research & Development</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}