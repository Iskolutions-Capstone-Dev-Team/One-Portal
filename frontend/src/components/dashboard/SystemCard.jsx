export default function SystemCard({ system, onClick }) {
    const cardImage = system.imageClear || system.imageBlur;

    return (
        <div onClick={onClick} className="card rounded-2xl system-card bg-white shadow-md hover:shadow-lg transition duration-300 h-full">
            <figure className="system-card-media">
                <img src={cardImage} alt={system.title} className="system-card-image" />
                <div className="system-card-tint" aria-hidden="true" />
                <img
                    src="/assets/images/PUPlogo.png"
                    alt=""
                    aria-hidden="true"
                    className="system-card-logo"
                />
            </figure>

            <div className="card-body gap-0 p-8">
                <h2 className="card-title text-[#b22222] text-lg pb-1">{system.title}</h2>
                <p className="text-sm pb-3">{system.description}</p>
                <div className="card-actions justify-end items-center">
                    <a href={system.link} className="btn btn-md h-9 bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b] rounded-lg shadow-none">Access</a>
                </div>
            </div>
        </div>
    );
}
