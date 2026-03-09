export default function PortalToolbar({ searchQuery, setSearchQuery }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 py-1">
                    Welcome back,
                    <span className="text-[#991b1b]"> Student!</span>
                </h1>
                <p className="text-sm text-gray-600">
                    Manage your connected systems, track updates, and stay in sync with
                    PUP Taguig's digital ecosystem.
                </p>
            </div>

            <div className="w-full sm:w-auto">
                <label className="input rounded-lg text-[1rem] h-12 bg-white w-full sm:w-64 flex items-center gap-2 border border-gray-300 px-3 py-2 shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-gray-300">
                    <svg className="h-5 w-5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>
                    <input
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full outline-none bg-transparent text-sm"
                    />
                </label>
            </div>
        </div>
    );
}