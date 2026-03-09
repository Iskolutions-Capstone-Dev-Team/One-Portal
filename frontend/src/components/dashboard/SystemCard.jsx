export default function SystemCard({ system, onClick }) {
    return (
        <div onClick={onClick} className="card rounded-2xl system-card bg-white shadow-md hover:shadow-lg transition duration-300 h-full">
            <figure className="relative">
                <img src={system.imageBlur} alt={system.title} className="h-auto object-contain transition-opacity duration-500 hover:opacity-0"/>
                <img src={system.imageClear} alt={system.title} className="h-auto object-contain absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"/>
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