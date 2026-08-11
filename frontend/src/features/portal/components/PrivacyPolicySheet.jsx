import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { privacyPolicySections } from "../data/privacyPolicyData";

export default function PrivacyPolicySheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={<a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium leading-none hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer" />}
      >
        Privacy Policy
      </SheetTrigger>
      <SheetContent side="right" className="!right-0 !mr-0 font-[Poppins] flex flex-col gap-0 space-y-0 bg-white dark:bg-[#1a0a0c] border-l border-slate-200 dark:border-red-900/30 w-full sm:max-w-lg p-0">
        <SheetHeader className="px-6 py-6 border-b border-slate-200 dark:border-red-900/30 bg-slate-50 dark:bg-[#1a0a0c]">
          <SheetTitle className="text-2xl text-slate-900 dark:text-slate-100 font-bold tracking-tight">Privacy Policy</SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400 font-medium">
            Data Privacy Act of 2012 (Republic Act No. 10173) Compliance
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-230px)] flex-1 grow">
          <div className="p-6">
            <Accordion
              type="single"
              collapsible
              className="space-y-3 border-0"
            >
              {privacyPolicySections.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-slate-200 dark:border-red-900/40 bg-white dark:bg-[#250f13] rounded-xl border px-3 shadow-sm hover:border-[#6b1115]/30 dark:hover:border-red-500/50 transition-colors **:data-[slot=accordion-content]:p-0!"
                >
                  <AccordionTrigger className="items-center px-1 py-3.5 font-semibold hover:no-underline text-slate-800 dark:text-slate-200 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 dark:bg-[#1a0a0c] border border-slate-200 dark:border-red-900/30 rounded-lg flex size-8 items-center justify-center text-[#6b1115] dark:text-red-400 shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-left leading-tight">{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-300 px-2 pt-1 pb-5 leading-relaxed text-sm">
                    <div className="space-y-3">{item.content}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-6 border-t border-slate-200 dark:border-red-900/30 bg-slate-50 dark:bg-[#1a0a0c]">
          <SheetClose render={
            <Button 
              className="bg-transparent text-[#7b0d15] dark:text-red-500 border-2 border-[#7b0d15] dark:border-red-500 hover:bg-[#7b0d15] dark:hover:bg-red-500 hover:text-white font-extrabold shadow-md transition-all duration-300 cursor-pointer w-full"
            />
          }>
            Close
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
