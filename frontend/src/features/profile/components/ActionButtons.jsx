import { Button } from "@/components/ui/button";
import { Pencil, Lock } from "lucide-react";

export default function ActionButtons({ openEdit, openPassword }) {
    return (
        <div className="flex flex-wrap justify-start gap-2 sm:gap-4 mt-6 w-full">
            <Button type="button" onClick={openEdit} variant="outline" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[2.5rem] md:min-h-[2.65rem] px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto cursor-pointer flex flex-row items-center justify-center gap-1.5 md:gap-2">
                <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                Edit Profile
            </Button>

            <Button type="button" onClick={openPassword} className="bg-[#6b1115] text-white hover:bg-yellow-400 hover:text-[#4f0d17] border border-[#6b1115]/70 hover:border-yellow-400 min-h-[2.5rem] md:min-h-[2.65rem] px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-xs md:text-[0.9rem] shadow-lg transition-all hover:-translate-y-[1px] h-auto cursor-pointer flex flex-row items-center justify-center gap-1.5 md:gap-2">
                <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                Change Password
            </Button>
        </div>
    );
}