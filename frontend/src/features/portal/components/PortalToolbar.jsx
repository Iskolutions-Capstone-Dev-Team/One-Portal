import { SearchIcon } from "./portalIcons";

export default function PortalToolbar({ searchQuery, setSearchQuery, isSearchDisabled = false }) {
    return (
        <section className="portal-toolbar">
            <div className="portal-toolbar__copy">
                <h1 className="portal-toolbar__title">
                    Welcome back,
                    <span className="portal-toolbar__title-accent"> PUPTian!</span>
                </h1>
                <p className="portal-toolbar__subtitle">
                    Access and manage PUP Taguig's connected digital systems.
                </p>
            </div>

            <div className="portal-toolbar__search">
                <label className="portal-toolbar__search-field">
                    <span className="sr-only">Search systems</span>
                    <SearchIcon />

                    <input type="search" placeholder="Search systems" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="portal-toolbar__search-input" disabled={isSearchDisabled}/>
                </label>
            </div>
        </section>
    );
}