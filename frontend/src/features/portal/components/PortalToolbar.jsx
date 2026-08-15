import { SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export default function PortalToolbar({ searchQuery, setSearchQuery, isSearchDisabled = false }) {
    return (
        <Card className="mb-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#0a0a0a] ring-0 ring-offset-0 w-full">
            <CardContent className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6 p-4 sm:p-5 w-full">
                <div className="flex-1 w-full text-center lg:text-left mb-2 lg:mb-0 lg:pb-1">
                    <h1 className="scroll-m-20 text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">
                        Welcome back,
                        <span className="text-[#7b0d15] dark:text-yellow-400"> PUPTian!</span>
                    </h1>
                    <p className="text-sm sm:text-md text-slate-500 dark:text-slate-400">
                        Access and manage PUP Taguig's connected digital systems.
                    </p>
                </div>

                <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-2 relative">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 hidden lg:block text-left">What system are you looking for?</Label>
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 lg:hidden text-center">What system are you looking for?</Label>
                    <Field className="w-full">
                      <InputGroup className="rounded-md h-10 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-300 dark:focus-within:ring-white/20 focus-within:border-slate-300 dark:focus-within:border-white/20 overflow-hidden w-full">
                        <InputGroupAddon className="bg-transparent border-none text-slate-500 dark:text-slate-400 pl-3 pr-2">
                          <SearchIcon className="w-4 h-4" />
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Search by system name..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} disabled={isSearchDisabled} className="bg-transparent border-none outline-none ring-0 focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 text-sm h-full w-full flex-1"/>
                      </InputGroup>
                    </Field>
                </div>
            </CardContent>
        </Card>
    );
}