import { faqItems } from "../constants/landingContent";
import { MessageCircleQuestionMark } from "lucide-react";
import { Badge } from "@/components/reui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function FaqSection() {
    return (
        <section id="faq" className="relative max-w-[1180px] mx-auto py-8 lg:pt-32 px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false, amount: 0.2 }}
            >
                <Badge variant="outline" className="mb-4 text-yellow-400 border-yellow-400/40 bg-yellow-400/10 uppercase tracking-[0.12em] font-extrabold px-3.5 py-2 min-h-[2rem] rounded-full shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] gap-2">
                    <MessageCircleQuestionMark className="w-4 h-4" />
                    Frequently Asked Questions
                </Badge>
                <h2 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white mb-3">
                    Common Questions
                </h2>
                <p className="text-lg text-orange-50/80 mb-2 max-w-[42rem] mx-auto">
                    Everything you need to know about the portal.
                </p>

                <div className="mt-8">
                    <div className="mx-auto w-full max-w-[800px] text-left">
                        <Accordion type="single" collapsible className="space-y-2 border-0">
                            {faqItems.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-white/10 bg-[#2a050a]/60 px-4 shadow-md transition-colors hover:border-yellow-400/30 data-[state=open]:border-yellow-400/30">
                                    <AccordionTrigger className="items-center py-3 text-orange-50 text-[0.95rem] font-medium hover:no-underline [&>svg]:text-yellow-400 [&>svg]:!w-4 [&>svg]:!h-4 data-[state=open]:[&>svg]:rotate-180 transition-all">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-orange-50/70 text-[0.9rem] pb-4 pt-0 leading-7">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
