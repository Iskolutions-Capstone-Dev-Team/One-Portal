import { useState } from "react"

import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { LockIcon, EyeOffIcon, EyeIcon } from "lucide-react"

export function Pattern() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Field className="max-w-xs">
      <InputGroup>
        <InputGroupAddon>
          <LockIcon className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput type={showPassword ? "text" : "password"} placeholder="Enter password" />
        <InputGroupButton variant="ghost" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeOffIcon className="text-muted-foreground size-4" />
          ) : (
            <EyeIcon className="text-muted-foreground size-4" />
          )}
        </InputGroupButton>
      </InputGroup>
    </Field>
  );
}