import type { LocalizedText } from "@/lib/i18n/locale";
import type { ArticleImage, BlogArticle } from "../_content/articles";

const ID = "design-highlights";

const img = (
  file: string,
  width: number,
  height: number,
  caption: LocalizedText
): ArticleImage => ({
  type: "img",
  src: `/blog/${ID}/${file}`,
  width,
  height,
  caption,
  alt: caption,
});

export const designHighlights: BlogArticle = {
  id: ID,
  description: {
    zh: "设计亮点就是能感觉到很用心，回味一下又是意料之外、情理之中的设计。六条自己用过的手法。",
    en: "A design highlight feels considered, then surprising and inevitable. Six methods I have actually used.",
  },
  blocks: [
    {
      type: "p",
      text: {
        zh: "我们在看作品、做提案又或是面试的时候，经常在讲设计亮点，那到底什么才叫亮点？",
        en: "When we look at work, pitch, or interview, we talk about design highlights. What actually counts as one?",
      },
    },
    {
      type: "p",
      text: {
        zh: "我自己总结，设计亮点就是：能感觉到很用心，回味一下又是意料之外，情理之中的设计。",
        en: "My own definition: you can feel the care, and on a second look it is unexpected yet inevitable.",
      },
    },
    {
      type: "p",
      text: {
        zh: "对于设计亮点，很多时候我们会觉得比较主观。一个设计效果，有些人会觉得很惊艳，另一些人可能会觉得很一般，每个人对于设计亮点的评判标准不一样，结论似乎怎么样都对，这就把这个问题整得像玄学了。",
        en: "Highlights often feel subjective. The same move can look stunning to one person and ordinary to another. Different criteria, every answer somehow right — the question starts to sound like mysticism.",
      },
    },
    {
      type: "p",
      text: {
        zh: "其实咱们设计师在设计的时候，都是想做出亮点的，不想做平平无奇，没有个性的设计。那想要设计出亮点，是不是只能靠运气，灵光乍现呢？",
        en: "Designers want highlights. Nobody sets out to make something flat. So is a highlight only luck — a flash of insight?",
      },
    },
    {
      type: "p",
      text: {
        zh: "周末的时候我就在思考这个问题，我觉得还是有一些设计套路的，稍微花了些时间尝试总结了下。从我个人经验来说，下面这6条都是我自己用过的手法，挺实用，反正有思路就好办了。",
        en: "I sat with this over a weekend. There are patterns. The six below are methods I have used. They are practical. Once you have an angle, the work gets easier.",
      },
    },
    {
      type: "h2",
      text: { zh: "1、善用隐喻", en: "1. Use metaphor" },
    },
    {
      type: "p",
      text: {
        zh: "隐喻和语文中的类比手法很相似，由此及彼。由一类类比到另一类，属于同级应用。",
        en: "Metaphor is close to analogy in writing: from this to that. One class mapped onto another, at the same level.",
      },
    },
    {
      type: "p",
      text: {
        zh: "比如QQ音乐的选单，在我选歌单的时候，把鼠标放在封面上时，封面会有一个向上动效。虽然看起来是一个很简单的效果，但我觉得这个动效做得非常棒！",
        en: "Take QQ Music’s playlist picker. Hover the cover and it lifts upward. Simple on the surface — and I think the motion is excellent.",
      },
    },
    img("01-qq-music-hover.gif", 640, 466, {
      zh: "QQ音乐的 hover 动效",
      en: "QQ Music hover motion",
    }),
    {
      type: "p",
      text: {
        zh: "这个设计模拟了以前在选音乐卡带的时候，会往上抽拿的动作。非常简单的动效，但我觉得确实是花了心思。",
        en: "It echoes pulling a cassette up from a rack. A small motion, but you can tell someone thought about it.",
      },
    },
    {
      type: "p",
      text: {
        zh: "为什么说是花了心思呢？因为其实hover到封面，如果单纯的做一个反馈动效的话，可以有很多选择方案。但为什么是向上，而不是整体放大或是其他缩放，又或者不是缩放，而是变色之类的。",
        en: "Why “thought about it”? Hover feedback could have been anything: scale up, squash, recolor. Why lift instead?",
      },
    },
    {
      type: "p",
      text: {
        zh: "能在一堆方案中选择最贴切的，且又是能让用户感知到的，我相信这种决策是非常需要深思熟虑的，也就是所谓的打磨设计细节。",
        en: "Picking the one that fits — and that people can actually feel — takes judgment. That is what polishing a detail means.",
      },
    },
    {
      type: "p",
      text: {
        zh: "隐喻的价值就在于，你能通过它的小巧思，体会到不只是交互的触达，而是生活的情感。",
        en: "The value of metaphor is that a small idea carries more than a hit target. It carries a bit of lived feeling.",
      },
    },
    {
      type: "p",
      text: {
        zh: "实际上，一个设计师的能力，就是在项目中不断面对这种多方案时的决策力。作为一个设计专家，你要做的不是可以提供100种方案，而是能给出100种方案的排序，知道各个方案的优劣，并最终决策出某一个最佳方案。这个论证过程，其实你就可以放到作品展示里，表现出你的设计专业能力。",
        en: "A designer’s craft is this kind of decision, over and over. Expertise is not producing a hundred options. It is ranking them, knowing the tradeoffs, and choosing one. That argument belongs in a case study.",
      },
    },
    {
      type: "p",
      text: {
        zh: "想要设计出有亮点的方案，找同类的词和物，从隐喻这个角度切入是一个很好用的办法。",
        en: "If you want a highlight, look for kindred words and objects. Metaphor is a reliable way in.",
      },
    },
    {
      type: "h2",
      text: { zh: "2、特征拆分", en: "2. Split the traits" },
    },
    {
      type: "p",
      text: {
        zh: "和隐喻有些类似，但它可能更多的是从概念进行延展，是属于由大到小的应用。",
        en: "Close to metaphor, but more about extending a concept — from the large idea down to the small.",
      },
    },
    {
      type: "p",
      text: {
        zh: "比如华为鸿蒙所讲的宇宙概念，把宇宙抽象为一个圈，暗含的意思是这个设计能覆盖华为所有终端设备，形成闭环。",
        en: "HarmonyOS talks about the universe and abstracts it to a ring: the system covers every Huawei device and closes the loop.",
      },
    },
    img("02-harmonyos-universe.jpg", 1080, 427, {
      zh: "鸿蒙的宇宙概念",
      en: "HarmonyOS universe concept",
    }),
    {
      type: "p",
      text: {
        zh: "然后又从宇宙规律到动效上的关联性，比如引力，重力，天体运动等等。",
        en: "Then the laws of that universe show up in motion: gravity, weight, orbital movement.",
      },
    },
    img("03-wave.gif", 500, 500, { zh: "量波", en: "Wave" }),
    img("04-parallax.gif", 500, 500, {
      zh: "滑动空间视差",
      en: "Spatial parallax on scroll",
    }),
    img("05-erode.gif", 452, 456, { zh: "蚕食", en: "Erode" }),
    img("06-gather.gif", 500, 500, { zh: "汇聚", en: "Gather" }),
    {
      type: "p",
      text: {
        zh: "从一个大的概念，扩展到各个细节设计上，让整个设计有了灵魂，因为是从整体到细节，总、分的设计故事会给人很强的主次感。",
        en: "One large idea, carried into every detail, gives the system a spine. Whole-then-parts makes hierarchy feel obvious.",
      },
    },
    {
      type: "p",
      text: {
        zh: "这个方法就是由一个具象的物，不断拆分它的属性，然后应用到各个设计细节中，也是一个很常用的方法。",
        en: "Start from a concrete thing, split its traits, and apply them to details. Common, and it works.",
      },
    },
    {
      type: "h2",
      text: { zh: "3、从需求原点出发", en: "3. Start from the real need" },
    },
    {
      type: "p",
      text: {
        zh: "这个方法是从需求要解决什么问题出发，去思考如何设计，其设计结果很好的解决了这个问题，能给人很巧妙的感觉。",
        en: "Begin with the problem the need is actually trying to solve. When the result solves it cleanly, it feels ingenious.",
      },
    },
    {
      type: "p",
      text: {
        zh: "比如我会把苹果电脑上的 dock 栏设计，设置为自动隐藏。当你需要专注的时候，它就会自动藏起来。当你想用它的时候，你能从它消失的位置重新找到。",
        en: "I set the Mac dock to hide. When I need to focus, it gets out of the way. When I want it, I find it where it disappeared.",
      },
    },
    img("07-dock-hide.gif", 800, 154, {
      zh: "dock 栏自动隐藏动效",
      en: "Dock auto-hide motion",
    }),
    {
      type: "p",
      text: {
        zh: "没人关心它到底躲到哪里，但只要你想要它出现，就可以凭直觉从那个地方操作它，虽然消失又好像从未消失。这是一个很精妙的设计，也就是它的亮点。",
        en: "Nobody cares where it hides. You reach for the same edge and it is there — gone, but never really gone. That precision is the highlight.",
      },
    },
    {
      type: "p",
      text: {
        zh: "比如QQ的姓名墙，只要你提意见，就可以被展示到这个墙上，被塑造为是一种荣耀的象征。某种程度上，也是对于人性的洞察。",
        en: "QQ’s name wall is similar. Leave feedback and your name goes on the wall — framed as honor. That is a read on people.",
      },
    },
    img("08-qq-name-wall.jpg", 600, 338, {
      zh: "来自 ISUX",
      en: "From ISUX",
    }),
    {
      type: "p",
      text: {
        zh: "做了好事，肯定是希望得到正向的反馈的，最好能贴一个大榜，然后从中能找到自己的名字，这样大家才更有动力。这个就是从人性的角度出发，洞察出的设计亮点。",
        en: "Do something useful and you want a signal back. A public board where you can find your own name is extra fuel. The highlight comes from that human read.",
      },
    },
    {
      type: "h2",
      text: { zh: "4、拟人化设计", en: "4. Design as if it were a person" },
    },
    {
      type: "p",
      text: {
        zh: "把和你交互的产品当成人来看，做有温度感的设计，这个方法也很容易做出让人眼前一亮的设计。",
        en: "Treat the product as someone you are talking to. Warmth is an easy path to a highlight.",
      },
    },
    {
      type: "p",
      text: {
        zh: "比如最新的 visionOS，主图标在通过眼动 hover 的时候，它会主动向你回眸，就像你和一个人在交流一样。因为人最自然的交流方式就是眼神的互动，哪怕很多时候你不说话，一个眼神就能感知对方的情绪，甚至能表达出想说的话。",
        en: "On visionOS, when your gaze hovers a home icon, it looks back — like a person meeting your eye. Eye contact is the most natural channel we have. You do not have to speak; a glance already carries mood, even intent.",
      },
    },
    img("09-visionos-1.gif", 604, 321, {
      zh: "visionOS 主图标回眸",
      en: "visionOS icons looking back",
    }),
    img("10-visionos-2.gif", 500, 445, {
      zh: "visionOS 眼动交互",
      en: "visionOS gaze interaction",
    }),
    {
      type: "p",
      text: {
        zh: "借这个方法，你可以想想你现在在做的设计，如果它是一个人的话，如何才能更自然，有情感。从这个角度切入，说不定能有所启发。",
        en: "Borrow the method: if what you are making were a person, how would it feel more natural? That question alone can unlock a move.",
      },
    },
    {
      type: "h2",
      text: { zh: "5、意料之外的设计", en: "5. Design off the expected path" },
    },
    {
      type: "p",
      text: {
        zh: "本来不会想到的设计，不在常规路径上，不在已有经验上，而一旦发现之后又觉得合情合理。",
        en: "A move you would not have predicted — off the usual path, off prior experience — that feels obvious the moment you find it.",
      },
    },
    {
      type: "p",
      text: {
        zh: "比如QQ9里面，在很不起眼的版本信息页面居然也做了彩蛋设计，企鹅是3D且可以随意角度翻动的，给人意料之外的感觉。",
        en: "QQ 9 hides an egg on the forgettable version page: a 3D penguin you can tumble at any angle. You were not looking for that.",
      },
    },
    img("11-qq9-easter-egg.gif", 500, 452, {
      zh: "QQ9 中的彩蛋设计",
      en: "Easter egg in QQ 9",
    }),
    {
      type: "p",
      text: {
        zh: "比如微信键盘中的联想功能，我们一般在输入法里输入内容，最多就是给你文字的关联。但微信键盘直接给你联想到了图片，表情，甚至是音乐，视频等等，第一次用的时候确实会有惊喜的感觉。",
        en: "WeChat Keyboard does the same kind of surprise. A normal IME suggests words. This one suggests images, stickers, even music and video. The first time, it lands as delight.",
      },
    },
    img("12-wechat-keyboard.gif", 500, 460, {
      zh: "微信键盘的联想",
      en: "WeChat Keyboard suggestions",
    }),
    {
      type: "h2",
      text: { zh: "6、整体一致的设计", en: "6. Design that holds together" },
    },
    {
      type: "p",
      text: {
        zh: "很多时候，我们会觉得亮点设计就是一些设计细节，那些细节能体现用心。但如果能从整体上看，看似平常的设计能完整连贯，那么这同样也是有亮点的设计。像很多系统级的设计，就无比凸显了这一特点。",
        en: "We often treat highlights as details — proof of care. A system that looks ordinary up close, yet stays coherent as a whole, is a highlight too. OS-level design makes this obvious.",
      },
    },
  ],
};
