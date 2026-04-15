export default function PortalToolbar({ searchQuery, setSearchQuery, isSearchDisabled = false }) {
    return (
        <section className="portal-toolbar">
            <div className="portal-toolbar__copy">
                <h1 className="portal-toolbar__title">
                    Welcome back,
                    <span className="portal-toolbar__title-accent"> Student!</span>
                </h1>
                <p className="portal-toolbar__subtitle">
                    Manage your connected systems, track updates, and stay in sync with
                    PUP Taguig's digital ecosystem.
                </p>
            </div>

            <div className="portal-toolbar__search">
                <label className="portal-toolbar__search-field">
                    <span className="sr-only">Search systems</span>
                    <svg className="portal-toolbar__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>

                    <input type="search" placeholder="Search systems" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="portal-toolbar__search-input" disabled={isSearchDisabled}/>
                </label>
            </div>
        </section>
    );
}