gsap.registerPlugin(Draggable, InertiaPlugin);

const card = document.querySelector("#card");
const trigger = document.querySelector("#trigger");
const value = document.querySelector("#value");
const reset = document.querySelector("#reset");
const boundedToggle = document.querySelector("#bounded");
const mode = document.querySelector("#mode");

const proxy = document.createElement("div");
const setRotateY = gsap.quickSetter(card, "rotationY", "deg");

const prefersReducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)"
);
const coarsePointer = window.matchMedia("(pointer: coarse)");

let draggable;
let pixelsPerDegree = 1;
let maxRotation = 180;
let currentRotation = 0;

gsap.set(card, {
	rotationY: 0,
	transformStyle: "preserve-3d",
	transformOrigin: "50% 50%",
	force3D: true
});

gsap.set(proxy, { x: 0 });

function calculateResponsiveValues() {
	const cardWidth = trigger.getBoundingClientRect().width || 260;

	/*
        Device-independent sensitivity:
        dragging across the card width equals about 180deg.
      */
	pixelsPerDegree = cardWidth / 180;

	/*
        Give phones a slightly tighter bounded range so flicks feel controlled.
      */
	maxRotation = coarsePointer.matches ? 160 : 180;
}

function xToRotation(x) {
	return x / pixelsPerDegree;
}

function rotationToX(rotation) {
	return rotation * pixelsPerDegree;
}

function getBounds() {
	return {
		minX: rotationToX(-maxRotation),
		maxX: rotationToX(maxRotation)
	};
}

function renderRotation() {
	currentRotation = xToRotation(gsap.getProperty(proxy, "x"));
	setRotateY(currentRotation);
	value.textContent = Math.round(currentRotation);
}

function createDraggable() {
	if (draggable) {
		draggable.kill();
	}

	const useBounds = boundedToggle.checked;
	const isTouch = coarsePointer.matches;
	const reduceMotion = prefersReducedMotion.matches;

	mode.textContent = useBounds ? "限制模式" : "自由旋转";

	draggable = Draggable.create(proxy, {
		type: "x",
		trigger: trigger,

		/*
          Draggable already allows native scrolling in the opposite direction
          for one-axis drags by default; keeping this explicit makes the intent clear.
        */
		allowNativeTouchScrolling: true,

		/*
          Fingers are imprecise. A larger threshold avoids accidental drags when
          the user meant to tap or scroll.
        */
		minimumMovement: isTouch ? 8 : 3,

		inertia: !reduceMotion,

		...(useBounds ? { bounds: getBounds() } : {}),

		edgeResistance: useBounds ? (isTouch ? 0.9 : 0.85) : 0,
		dragResistance: isTouch ? 0.08 : 0,

		/*
          Touch flicks can generate huge velocity. More resistance + shorter max
          duration keeps the result feeling intentional on phones.
        */
		throwResistance: isTouch ? 1900 : 1200,
		maxDuration: isTouch ? 1.1 : 1.6,
		minDuration: 0.2,
		overshootTolerance: useBounds ? (isTouch ? 0.1 : 0.35) : 1,

		onDrag: renderRotation,
		onThrowUpdate: renderRotation
	})[0];
}

function rebuildForLayout() {
	const oldRotation = currentRotation;

	calculateResponsiveValues();

	if (boundedToggle.checked) {
		currentRotation = gsap.utils.clamp(-maxRotation, maxRotation, oldRotation);
	}

	gsap.set(proxy, { x: rotationToX(currentRotation) });
	renderRotation();
	createDraggable();
}

function resetCard() {
	if (draggable) {
		draggable.endDrag();
	}

	gsap.killTweensOf(proxy);

	gsap.to(proxy, {
		x: 0,
		duration: prefersReducedMotion.matches ? 0 : 0.5,
		ease: "power3.out",
		onUpdate: renderRotation
	});
}

calculateResponsiveValues();
createDraggable();

boundedToggle.addEventListener("change", rebuildForLayout);
reset.addEventListener("click", resetCard);

/*
      Recalculate after rotation/orientation changes. The debounce avoids doing
      work repeatedly while the browser is still resizing the viewport.
    */
let resizeTimer;
window.addEventListener("resize", () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(rebuildForLayout, 150);
});

prefersReducedMotion.addEventListener?.("change", createDraggable);
coarsePointer.addEventListener?.("change", rebuildForLayout);
