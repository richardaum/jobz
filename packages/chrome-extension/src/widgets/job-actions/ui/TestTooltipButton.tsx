import { useRef, useState } from "react";

import { LinkedInButton, LinkedInTooltip } from "@/shared/ui";

export function TestTooltipButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isClickingRef = useRef(false);

  const handleClick = () => {
    isClickingRef.current = true;
    setIsOpen(!isOpen);
    // Reset flag after a short delay
    setTimeout(() => {
      isClickingRef.current = false;
    }, 100);
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Only allow Radix to close if we're not clicking
    if (!isClickingRef.current) {
      setIsOpen(newOpen);
    }
  };

  return (
    <LinkedInTooltip
      content="This is a test tooltip that opens on click!"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <LinkedInButton onClick={handleClick} data-test-tooltip-button="true">
        Test Tooltip
      </LinkedInButton>
    </LinkedInTooltip>
  );
}
