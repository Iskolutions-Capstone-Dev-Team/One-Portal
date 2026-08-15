import { Badge } from "@/components/reui/badge"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SettingsIcon, LockIcon, HelpCircleIcon } from "lucide-react"

const items = [
  {
    value: "account",
    icon: (
      <SettingsIcon className="text-muted-foreground size-4" />
    ),
    trigger: "Account Settings",
    badge: "New",
    content:
      "Manage your account preferences, security settings, and personal information. You can also configure two-factor authentication here.",
  },
  {
    value: "privacy",
    icon: (
      <LockIcon className="text-muted-foreground size-4" />
    ),
    trigger: "Privacy & Security",
    content:
      "Control who can see your profile and what data we collect. View our latest security audits and transparency reports.",
  },
  {
    value: "support",
    icon: (
      <HelpCircleIcon className="text-muted-foreground size-4" />
    ),
    trigger: "Help & Support",
    content:
      "Access our help center, community forums, and contact support. We're here to help you 24/7.",
  },
]

export function Pattern() {
  return (
    <div className="mx-auto mb-auto w-full max-w-lg">
      <Accordion
        multiple={false}
        defaultValue={["account"]}
        className="space-y-3 border-0">
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="border-border bg-card rounded-lg border px-2 **:data-[slot=accordion-content]:p-0!">
            <AccordionTrigger className="items-center px-1 py-3 font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-lg flex size-8 items-center justify-center">
                  {item.icon}
                </div>
                <span>{item.trigger}</span>
                {item.badge && (
                  <Badge variant="success-light">{item.badge}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground px-2 pt-0 pb-4 leading-relaxed">
              <div className="pl-11">{item.content}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}