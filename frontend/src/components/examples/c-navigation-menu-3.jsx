import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react"

export function Pattern() {
  return (
    <div className="flex items-center justify-center">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Status</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-2">
                <li>
                  <NavigationMenuLink
                    render={
                      <a href="#" className="flex items-center gap-2" />
                    }>
                    <CircleAlertIcon />
                    Backlog
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    render={
                      <a href="#" className="flex items-center gap-2" />
                    }>
                    <CircleCheckIcon />
                    Done
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}