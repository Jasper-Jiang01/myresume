import type { StaticImageData } from "next/image";
import cover1 from "../_assests/1.webp";
import cover2 from "../_assests/2.webp";
import cover3 from "../_assests/3.webp";
import cover4 from "../_assests/4.webp";
import cover5 from "../_assests/5.webp";
import cover6 from "../_assests/6.webp";
import cover7 from "../_assests/7.webp";
import cover8 from "../_assests/8.webp";
import cover9 from "../_assests/9.webp";
import cover10 from "../_assests/10.webp";
import cover11 from "../_assests/11.webp";
import cover12 from "../_assests/12.webp";
import cover13 from "../_assests/13.webp";

/** Hero 画廊封面。单独成文件，避免 WebsiteView 引入文案时把 13 张图打进包。 */
export const heroCovers = [
  cover1,
  cover2,
  cover3,
  cover4,
  cover5,
  cover6,
  cover7,
  cover8,
  cover9,
  cover10,
  cover11,
  cover12,
  cover13,
] satisfies StaticImageData[];
