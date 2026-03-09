export default function SystemCard({ system, onClick }) {
    const categoryColors = {
        "Student Services": "bg-orange-200 text-orange-900",
        "Health & Wellness": "bg-green-200 text-green-900",
        "Academic": "bg-yellow-200 text-yellow-900",
        "Research & Development": "bg-blue-200 text-blue-900",
        "Administrative": "bg-red-200 text-red-900",
    };

    return (
        <div onClick={onClick} className="card rounded-2xl system-card bg-white shadow-md hover:shadow-lg transition duration-300 h-full">
            <figure className="relative">
                <img src={system.imageBlur} alt={system.title} className="h-auto object-contain transition-opacity duration-500 hover:opacity-0"/>
                <img src={system.imageClear} alt={system.title} className="h-auto object-contain absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"/>
            </figure>

            <div className="card-body gap-0 p-8">
                <h2 className="card-title text-[#b22222] text-lg pb-1">{system.title}</h2>
                <div className={`badge border-none font-medium ${
                    categoryColors[system.category]}`}>
                    {system.category}
                </div>
                <p className="text-sm py-3">{system.description}</p>
                <div className="card-actions justify-end items-center">
                    <a href={system.link} className="btn btn-md h-9 bg-[#b22222] hover:bg-[#ffd700] hover:text-black text-white border-none rounded-lg shadow-none">Access</a>
                </div>
            </div>
        </div>
    );
}