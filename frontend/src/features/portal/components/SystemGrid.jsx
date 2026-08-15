import SystemCard from "./SystemCard";
import MotionWrapper from "../../../components/ui/MotionWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SearchX } from "lucide-react";
import { IconStack } from "@/components/reui/icon-stack";

function StackedCardsIllustration() {
  return (
    <div className="relative h-24 w-52" aria-hidden="true">
      {/* Back card */}
      <div className="bg-slate-200/60 dark:bg-slate-700/40 border-slate-300/50 dark:border-white/5 absolute inset-x-6 top-0 h-6 rounded-t-lg border" />
      {/* Middle card */}
      <div className="bg-slate-200/80 dark:bg-slate-700/60 border-slate-300/60 dark:border-white/10 absolute inset-x-3 top-3 h-6 rounded-t-lg border" />
      {/* Front card */}
      <div className="bg-white dark:bg-[#141414] border-slate-200 dark:border-white/10 absolute inset-x-0 top-6 flex h-16 items-center gap-3 rounded-lg border px-4 shadow-sm">
        <div className="bg-[#991b1b] dark:bg-yellow-400 size-8 shrink-0 rounded" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="bg-slate-200 dark:bg-slate-600 h-2.5 w-3/4 rounded" />
          <div className="bg-slate-200/60 dark:bg-slate-600/60 h-2 w-1/2 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function SystemGrid({ systems, currentPage = 1, cardsPerPage = 6, emptyMessage = "No systems found", searchQuery = "" }) {
    if (!systems.length) {
        return (
            <Card className="w-full max-w-5xl mx-auto border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a] backdrop-blur-sm rounded-3xl shadow-sm">
                <CardContent className="flex items-center justify-center min-h-[300px] p-8">
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyMedia>
                                {searchQuery ? (
                                    <IconStack aria-hidden="true" className="text-[#991b1b] dark:text-yellow-400 h-24 w-24">
                                        <SearchX className="text-[#991b1b] dark:text-yellow-400 size-8" />
                                    </IconStack>
                                ) : (
                                    <StackedCardsIllustration />
                                )}
                            </EmptyMedia>
                            <EmptyTitle className="text-center">
                                {searchQuery ? "No Results Found" : "No Systems"}
                            </EmptyTitle>
                            <EmptyDescription className="text-center text-muted-foreground">
                                {emptyMessage}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        );
    }

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedSystems = systems.slice(startIndex, endIndex);

    return (
        <section id="portal-systems" className="w-full flex justify-center" aria-label="Available systems">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 md:gap-y-8 gap-x-4 max-w-5xl w-full mx-auto">
                {paginatedSystems.map((system) => (
                    <MotionWrapper key={system.id}>
                        <SystemCard system={system} />
                    </MotionWrapper>
                ))}
            </div>
        </section>
    );
}
