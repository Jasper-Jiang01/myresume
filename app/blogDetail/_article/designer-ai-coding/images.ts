import type { StaticImageData } from "next/image";
import img01 from "./assets/img-01.png";
import img02 from "./assets/img-02.png";
import img03 from "./assets/img-03.png";
import img04 from "./assets/img-04.png";
import img05 from "./assets/img-05.png";
import img06 from "./assets/img-06.png";
import img07 from "./assets/img-07.png";
import img08 from "./assets/img-08.png";
import img09 from "./assets/img-09.gif";
import img10 from "./assets/img-10.png";
import img11 from "./assets/img-11.png";
import img12 from "./assets/img-12.png";
import img13 from "./assets/img-13.png";
import img14 from "./assets/img-14.png";
import img15 from "./assets/img-15.png";
import img16 from "./assets/img-16.png";

/** 单独成文件，避免文章列表把配图打进包。 */
export const articleImages: Record<string, StaticImageData> = {
  "img-01.png": img01,
  "img-02.png": img02,
  "img-03.png": img03,
  "img-04.png": img04,
  "img-05.png": img05,
  "img-06.png": img06,
  "img-07.png": img07,
  "img-08.png": img08,
  "img-09.gif": img09,
  "img-10.png": img10,
  "img-11.png": img11,
  "img-12.png": img12,
  "img-13.png": img13,
  "img-14.png": img14,
  "img-15.png": img15,
  "img-16.png": img16,
};
