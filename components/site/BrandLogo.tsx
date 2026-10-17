import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
  variant?: "header" | "footer";
}

/** Header file is the supplied white/red transparent artwork. Footer file is the supplied purple artwork for white surfaces. */
export function BrandLogo({ className, priority = false, variant = "header" }: BrandLogoProps) {
  const header = variant === "header";
  return (
    <Image
      src={header ? siteConfig.logos.header : siteConfig.logos.footer}
      alt={siteConfig.name}
      width={header ? 1270 : 440}
      height={header ? 292 : 224}
      priority={priority}
      unoptimized
      className={cn(
        header
          ? "h-auto w-[155px] max-w-[50vw] sm:w-[250px] sm:max-w-none lg:w-[270px]"
          : "h-auto w-[180px] sm:w-[240px]",
        className
      )}
    />
  );
}
