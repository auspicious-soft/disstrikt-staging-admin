// lib/icons.ts
import {
  User,
  Clipboard,
  Award,
  FileText,
  Ticket,
  Home,
  Settings,
} from "lucide-react";
import { createElement, type ComponentType, type SVGProps } from "react";

export const DashboardIcon = Home;
export const UserIcon = User;
export const ReviewtaskIcon = Clipboard;
export const AchievementsIcon = Award;
export const Policies = FileText;
export const CoupanIcon = Ticket;
export const SettingsIcon = Settings;

export const Eye = ()=>{
  return (
 <svg width="20" height="48" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.2371 9.98083C12.7361 4.42306 5.26397 4.42306 2.76297 9.98083C2.63549 10.2641 2.30248 10.3904 2.01919 10.263C1.73589 10.1355 1.60958 9.80247 1.73706 9.51917C4.63606 3.07694 13.364 3.07694 16.263 9.51917C16.3905 9.80247 16.2641 10.1355 15.9808 10.263C15.6976 10.3904 15.3645 10.2641 15.2371 9.98083Z" fill="black" fill-opacity="0.5"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.8125 10.5C11.8125 8.9467 10.5533 7.6875 9 7.6875C7.4467 7.6875 6.1875 8.9467 6.1875 10.5C6.1875 12.0533 7.4467 13.3125 9 13.3125C10.5533 13.3125 11.8125 12.0533 11.8125 10.5Z" fill="black" fill-opacity="0.5"/>
</svg>
  )
}

export const Email = ()=>(
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.83333 7.49996L10 10.4166L14.1667 7.49996" stroke="black" stroke-opacity="0.5" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.66667 14.1666V5.83329C1.66667 4.91282 2.41286 4.16663 3.33334 4.16663H16.6667C17.5871 4.16663 18.3333 4.91282 18.3333 5.83329V14.1666C18.3333 15.0871 17.5871 15.8333 16.6667 15.8333H3.33334C2.41286 15.8333 1.66667 15.0871 1.66667 14.1666Z" stroke="black" stroke-opacity="0.5" stroke-width="1.25"/>
</svg>

)
export const Lock = ()=>(
<svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.3333 9.99992H14.5C14.7761 9.99992 15 10.2238 15 10.4999V16.1666C15 16.4427 14.7761 16.6666 14.5 16.6666H5.5C5.22386 16.6666 5 16.4427 5 16.1666V10.4999C5 10.2238 5.22386 9.99992 5.5 9.99992H6.66667M13.3333 9.99992V6.66659C13.3333 5.55547 12.6667 3.33325 10 3.33325C7.33333 3.33325 6.66667 5.55547 6.66667 6.66659V9.99992M13.3333 9.99992H6.66667" stroke="black" stroke-opacity="0.5" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

)