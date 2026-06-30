export default function AuditLogs({ logs, isLoading = false, errorMessage = "" }) {
    const toneClassNames = {
        blue: "profile-logs__dot--blue",
        green: "profile-logs__dot--green",
        yellow: "profile-logs__dot--yellow",
        purple: "profile-logs__dot--purple",
        gray: "profile-logs__dot--gray",
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="profile-logs__placeholder" role="row">
                    Loading recent changes...
                </div>
            );
        }

        if (errorMessage) {
            return (
                <div className="profile-logs__placeholder profile-logs__placeholder--error" role="row">
                    {errorMessage}
                </div>
            );
        }

        if (!logs.length) {
            return (
                <div className="profile-logs__placeholder" role="row">
                    No recent changes available yet.
                </div>
            );
        }

        return logs.map((log, idx) => (
            <div key={log.id ?? `${log.timestamp}-${idx}`} className="profile-logs__entry" role="row">
                <div className="profile-logs__cell profile-logs__cell--timestamp" role="cell">
                    <div className="profile-logs__timestamp">
                        <span className={`profile-logs__dot ${toneClassNames[log.color] ?? "profile-logs__dot--gray"}`} aria-hidden="true" />
                        <span>{log.timestamp}</span>
                    </div>
                </div>

                <div className="profile-logs__cell" role="cell">{log.details}</div>
            </div>
        ));
    };

    return (
        <section className="profile-logs">
            <div className="profile-logs__header">
                <h3 className="profile-logs__title">Recent Changes</h3>
                <p className="profile-logs__description">Recent account activities and changes</p>
            </div>

            <div className="profile-logs__table-wrap">
                <div className="profile-logs__table" role="table" aria-label="Recent account activities">
                    <div className="profile-logs__head-row" role="row">
                        <span role="columnheader">Timestamp</span>
                        <span role="columnheader">Details</span>
                    </div>

                    <div className="profile-logs__body" role="rowgroup">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </section>
    );
}