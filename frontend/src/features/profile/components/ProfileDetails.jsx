import { Card, CardContent } from "@/components/ui/card";
import { UserRound } from "lucide-react";

function DetailField({ id, label, value }) {
  const normalizedValue = typeof value === "string" ? value.trim() : value;
  const isMissingValue = !normalizedValue;
  const displayValue = normalizedValue || "—";

  return (
    <Card className="shadow-none bg-slate-50 dark:bg-slate-800/50 border-none">
      <CardContent className="flex items-center gap-4 px-4 py-2.5">
        <div className="bg-slate-200/50 dark:bg-slate-700/50 flex size-10 items-center justify-center rounded-md text-[#7b0d15] dark:text-[#f8d24e]">
          <UserRound className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <p id={id} className={`text-sm font-semibold truncate ${isMissingValue ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
            {displayValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfileDetails({ profile }) {
  return (
    <section className="mt-8">
      <div className="grid gap-4 md:grid-cols-2">
        <DetailField
          id="firstName"
          label="First Name"
          value={profile.firstName}
        />
        <DetailField
          id="lastName"
          label="Last Name"
          value={profile.lastName}
        />
        <DetailField
          id="middleName"
          label="Middle Name"
          value={profile.middleName}
        />
        <DetailField
          id="nameSuffix"
          label="Suffix"
          value={profile.nameSuffix}
        />
      </div>
    </section>
  );
}