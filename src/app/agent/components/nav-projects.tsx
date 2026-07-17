"use client";

import Link from "next/link";
import { SidebarMenu, SidebarMenuItem } from "./ui/sidebar";

interface NavProjectsProps {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick?: () => void;
  }[];
}

export function NavProjects({ items }: NavProjectsProps) {
  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <SidebarMenuItem key={index} className="w-full">
            {item.onClick ? (
              <button 
                onClick={item.onClick}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </button>
            ) : (
              <Link
                href={item.url}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
