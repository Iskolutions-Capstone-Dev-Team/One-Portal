import { featureItems } from "../constants/landingContent";
import { Badge } from "@/components/reui/badge";
import { Star } from "lucide-react";
import { IconStack } from "@/components/reui/icon-stack";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { motion } from "framer-motion";

function FeatureCard({ item }) {
    const Icon = item.icon;

    return (
        <Item variant="outline" className="w-full border-white/10 bg-white/5 text-left transition-all hover:bg-white/10 hover:-translate-y-1 hover:border-yellow-400/30">
            <ItemMedia>
                <IconStack aria-hidden="true" className="text-yellow-400 h-16 w-14">
                    <Icon className="text-yellow-400 size-7" />
                </IconStack>
            </ItemMedia>
            <ItemContent className="text-left">
                <ItemTitle className="text-orange-50 text-lg">{item.title}</ItemTitle>
                <ItemDescription className="text-orange-50/70">
                    {item.copy}
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}

export default function FeaturesSection() {
    return (
        <section id="features" className="relative max-w-[1180px] mx-auto py-8 lg:pt-32 px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false, amount: 0.2 }}
            >
                <Badge variant="outline" className="mb-4 text-yellow-400 border-yellow-400/40 bg-yellow-400/10 uppercase tracking-[0.12em] font-extrabold px-3.5 py-2 min-h-[2rem] rounded-full shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] gap-2">
                    <Star className="w-4 h-4" />
                    Features
                </Badge>
                <h2 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white mb-3">
                    Access Campus Services Faster
                </h2>
                <p className="text-lg text-orange-50/80 mb-2 max-w-[42rem] mx-auto">
                    One Portal keeps essential PUPT tools organized and easy to reach.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {featureItems.map((item) => (
                        <div key={item.title}>
                            <FeatureCard item={item} />
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
