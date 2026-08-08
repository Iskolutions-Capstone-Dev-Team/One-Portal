import { IconStack } from "@/components/reui/icon-stack"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { PackageIcon } from "lucide-react"

export function Pattern() {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-center p-4">
      <Item variant="outline" className="max-w-sm">
        <ItemMedia>
          <IconStack aria-hidden="true" className="text-primary h-12 w-11">
            <PackageIcon className="text-primary size-3" />
          </IconStack>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Registry package ready</ItemTitle>
          <ItemDescription>
            Use IconStack as rich media inside compact shadcn items.
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}