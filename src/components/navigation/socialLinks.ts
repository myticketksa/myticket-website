import facebookIcon from "@/assets/social/facebook.svg";
import instagramIcon from "@/assets/social/instagram.svg";
import snapchatIcon from "@/assets/social/snapchat.svg";
import tiktokIcon from "@/assets/social/tiktok.svg";
import xIcon from "@/assets/social/x.svg";
import youtubeIcon from "@/assets/social/youtube.svg";

/** MyTicket's social accounts — the footer and the Instagram bio page. */
export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/myticketapp_official/",
    icon: instagramIcon,
  },
  {
    name: "X",
    href: "https://x.com/myticketapp01?t=m1L48zEBQ67Nlf-YyAvCgg&s=09",
    icon: xIcon,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@myticketapp_official",
    icon: tiktokIcon,
  },
  {
    name: "Snapchat",
    href: "https://www.snapchat.com/add/myticketapp01",
    icon: snapchatIcon,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@myticketapp0122?si=6Ykddnhw-ELQHwVL",
    icon: youtubeIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/myticketapp01?mibextid=ZbWKwL",
    icon: facebookIcon,
  },
] as const;
