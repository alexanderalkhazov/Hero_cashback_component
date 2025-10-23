class Hero {
    constructor() {
        this.isMobile = window.innerWidth < 768;
        this.animationFrameId = null;
        this.isAnimating = false;
        this.elements = {
            coloredContainer: null,
            unColoredContainer: null,
            lowerFrame: null,
            mainBtn: null,
            ctcBtn: null,
            sideText: null,
        };
        this.deviceType = this.getDeviceType();
        this.hasCtcBtn = false;
        this.isUpperLogoHidden = false;
        this.originalOffsetTop = null;
        this.containerHeight = null;
        this.bounceTriggered = false;
        this.isScrolling = false;
        this.scrollDisabled = false;
        this.lastScrollY = 0;
        this.snapBackInProgress = false;
        this.isUpperLogoTickingAnimation = false;

        this.init();
    }

    startPageAtTop() {
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
    }

    setFrameColorBackground() {
        const frameContainer = document.querySelector(".colored__frame__container");
        if (frameContainer) {
            const url = frameContainer.getAttribute("data-background-url");
            if (url) {
                frameContainer.style.backgroundImage = `url('${url}')`;
            }
        }
    }

    manageClickToCallButton() {
        const isMobile = window.innerWidth < 768;
        const container = document.querySelector(".lower__part__glass__frame");
        const existingCTCButton = document.querySelector(".clickToCall__btn");

        if (!container) return;

        if (isMobile) {
            const heroContainer = document.querySelector(".hero__container");
            const isPublishCTC =
                heroContainer?.getAttribute("data-ispublishctc") === "true";
            const ctcBtnColor = heroContainer?.getAttribute("data-ctcbtn-color");
            const ctcImageAltText = heroContainer?.getAttribute("data-altimagectctext");
            const shouldShowButton =
                heroContainer?.getAttribute("data-show-ctc-button") === "true";

            if (shouldShowButton && !existingCTCButton && isPublishCTC) {
                const newClickToCallBtn = document.createElement("button");
                const isAmexWebsite =
                    heroContainer.getAttribute("data-isamexwebsite") === "true";
                if (isAmexWebsite) {
                    newClickToCallBtn.classList.add("amex__btn__theme__sticky__header");
                } else {
                    newClickToCallBtn.classList.add("isracard__btn__theme__sticky__header");
                }
                newClickToCallBtn.classList.add("clickToCall__btn");
                if (ctcBtnColor) {
                    newClickToCallBtn.style.backgroundColor = ctcBtnColor;
                }
                newClickToCallBtn.classList.add("lower__frame__btns");

                const iconUrl =
                    heroContainer?.getAttribute("data-click-to-call-icon") || "";
                const phoneNumber = heroContainer?.getAttribute("data-phone") || "";
                const urlLink = heroContainer?.getAttribute("data-url") || "";

                if (phoneNumber)
                    newClickToCallBtn.setAttribute("data-phone", phoneNumber);
                if (urlLink) newClickToCallBtn.setAttribute("data-url", urlLink);

                newClickToCallBtn.addEventListener("click", function () {
                    handleCtcClick(this);
                });

                const newIconForBtn = document.createElement("img");
                newIconForBtn.src = iconUrl;
                newIconForBtn.alt = ctcImageAltText;
                newClickToCallBtn.appendChild(newIconForBtn);
                container.appendChild(newClickToCallBtn);

                container.classList.add("has-ctc-btn");
            } else if (!shouldShowButton && existingCTCButton && !isPublishCTC) {
                container.removeChild(existingCTCButton);
                container.classList.remove("has-ctc-btn");
            }

            const currentCTCButton = document.querySelector(".clickToCall__btn");
            if (currentCTCButton && container.contains(currentCTCButton)) {
                container.classList.add("has-ctc-btn");
            } else {
                container.classList.remove("has-ctc-btn");
            }
        } else {
            if (existingCTCButton && container.contains(existingCTCButton)) {
                container.removeChild(existingCTCButton);
            }
            container.classList.remove("has-ctc-btn");
        }
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return "mobile";
        return "desktop";
    }

    init() {
        this.elements.coloredContainer = document.querySelector(
            ".colored__frame__container"
        );
        this.elements.unColoredContainer = document.querySelector(
            ".uncolored__frame__container"
        );
        this.elements.lowerFrame = document.querySelector(
            ".lower__part__glass__frame"
        );
        this.elements.mainBtn = document.querySelector(".main__order__card__btn");
        this.elements.ctcBtn = document.querySelector(".clickToCall__btn");
        this.elements.sideText = document.querySelector(".side__text__cashback");

        if (this.elements.coloredContainer) {
            this.elements.coloredContainer.style.borderTopLeftRadius = "20px";
            this.elements.coloredContainer.style.borderTopRightRadius = "20px";
            this.elements.coloredContainer.style.borderBottomLeftRadius = "20px";
            this.elements.coloredContainer.style.borderBottomRightRadius = "20px";
        }

        if (this.elements.lowerFrame) {
            this.elements.lowerFrame.style.borderTopLeftRadius = "0px";
            this.elements.lowerFrame.style.borderTopRightRadius = "0px";
            this.elements.lowerFrame.style.borderBottomLeftRadius = "12px";
            this.elements.lowerFrame.style.borderBottomRightRadius = "12px";

            if (this.deviceType === "desktop") {
                this.elements.lowerFrame.style.width = "337px";
            } else {
                this.elements.lowerFrame.style.width = "228px";
            }
        }

        if (this.elements.ctcBtn) {
            this.elements.ctcBtn.style.transform = "translate(-50%, -50%)";
            this.elements.ctcBtn.style.opacity = "0";
        }

        if (this.elements.sideText) {
            this.elements.sideText.style.transform = "translate(-50%, -50%)";
            this.elements.sideText.style.opacity = "0";
        }

        this.setFrameColorBackground();
        this.updateCtcStatus();
        this.startAnimation();
    }

    updateCtcStatus() {
        this.hasCtcBtn =
            this.elements.lowerFrame?.classList.contains("has-ctc-btn") || false;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    getScrollProgress(start = 0, end = 15) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const progress = (scrollY / windowHeight) * 100;
        return Math.min(Math.max((progress - start) / (end - start), 0), 1);
    }

    animateDesktopGrowColored(progress) {
        if (!this.elements.coloredContainer) return;

        const easedProgress = progress;
        const startWidth = 722;
        const endWidth = window.innerWidth;
        const width = this.lerp(startWidth, endWidth, easedProgress);

        this.elements.coloredContainer.style.width = `${Math.min(
            width,
            window.innerWidth
        )}px`;
        this.elements.coloredContainer.style.maxWidth = "100%";

        const topRadius = this.lerp(20, 0, easedProgress);
        this.elements.coloredContainer.style.borderTopLeftRadius = `${topRadius}px`;
        this.elements.coloredContainer.style.borderTopRightRadius = `${topRadius}px`;

        const bottomRadius = this.lerp(20, 0, easedProgress);
        this.elements.coloredContainer.style.borderBottomLeftRadius = `${bottomRadius}px`;
        this.elements.coloredContainer.style.borderBottomRightRadius = `${bottomRadius}px`;
    }

    animateDesktopGrow(progress) {
        if (!this.elements.unColoredContainer || !this.elements.lowerFrame) return;

        const easedProgress = progress;

        const uncoloredStartWidth = 722;
        const uncoloredEndWidth = window.innerWidth;
        const uncoloredWidth = this.lerp(
            uncoloredStartWidth,
            uncoloredEndWidth,
            easedProgress
        );

        const lowerStartWidth = 337;
        const lowerEndWidth = window.innerWidth;
        const lowerWidth = this.lerp(lowerStartWidth, lowerEndWidth, easedProgress);

        this.elements.unColoredContainer.style.width = `${Math.min(
            uncoloredWidth,
            window.innerWidth
        )}px`;

        this.elements.lowerFrame.style.width = `${Math.min(
            lowerWidth,
            window.innerWidth
        )}px`;
        this.elements.lowerFrame.style.maxWidth = "none";

        const bottomRadius = this.lerp(12, 0, easedProgress);
        this.elements.lowerFrame.style.borderTopLeftRadius = "0px";
        this.elements.lowerFrame.style.borderTopRightRadius = "0px";
        this.elements.lowerFrame.style.borderBottomLeftRadius = `${bottomRadius}px`;
        this.elements.lowerFrame.style.borderBottomRightRadius = `${bottomRadius}px`;
    }

    animateDesktopMainBtn(progress) {
        if (!this.elements.mainBtn) return;

        const easedProgress = progress;
        let translateX;

        if (this.hasCtcBtn) {
            translateX = this.lerp(0, -100, easedProgress);
        } else {
            translateX = this.lerp(0, -150, easedProgress);
        }

        const originalWidth = 280;
        const originalHeight = 52;
        const targetWidth = 148;
        const targetHeight = 40;
        const currentWidth = this.lerp(originalWidth, targetWidth, easedProgress);
        const currentHeight = this.lerp(
            originalHeight,
            targetHeight,
            easedProgress
        );
        const currentFontSize = this.lerp(18, 14, easedProgress);

        this.elements.mainBtn.style.transform = `translateX(${translateX}px)`;
        this.elements.mainBtn.style.width = `${currentWidth}px`;
        this.elements.mainBtn.style.height = `${currentHeight}px`;
        this.elements.mainBtn.style.fontSize = `${currentFontSize}px`;
    }

    animateDesktopSplitLeft(progress) {
        if (!this.elements.ctcBtn) return;

        const easedProgress = progress;
        const opacity = this.lerp(0, 1, easedProgress);

        if (easedProgress === 0) {
            this.elements.ctcBtn.style.transform = `translate(-50%, -50%)`;
            this.elements.ctcBtn.style.opacity = "0";
        } else {
            this.elements.ctcBtn.style.transform = `translate(calc(-50% - ${this.lerp(
                0,
                80,
                easedProgress
            )}px), -50%)`;
            this.elements.ctcBtn.style.opacity = opacity;
        }
    }

    animateDesktopSplitRight(progress) {
        if (!this.elements.sideText) return;

        const easedProgress = progress;
        const opacity = this.lerp(0, 1, easedProgress);

        if (easedProgress === 0) {
            this.elements.sideText.style.transform = `translate(-50%, -50%)`;
            this.elements.sideText.style.opacity = "0";
        } else {
            this.elements.sideText.style.transform = `translate(calc(-50% + ${this.lerp(
                0,
                80,
                easedProgress
            )}px), -50%)`;
            this.elements.sideText.style.opacity = opacity;
        }
    }

    animateMobileGrowColored(progress) {
        if (!this.elements.coloredContainer) return;

        const easedProgress = progress;
        const startWidth = 354;
        const endWidth = window.innerWidth;
        const width = this.lerp(startWidth, endWidth, easedProgress);

        this.elements.coloredContainer.style.width = `${Math.min(
            width,
            window.innerWidth
        )}px`;

        const topRadius = this.lerp(20, 0, easedProgress);
        this.elements.coloredContainer.style.borderTopLeftRadius = `${topRadius}px`;
        this.elements.coloredContainer.style.borderTopRightRadius = `${topRadius}px`;

        const bottomRadius = this.lerp(20, 0, easedProgress);
        this.elements.coloredContainer.style.borderBottomLeftRadius = `${bottomRadius}px`;
        this.elements.coloredContainer.style.borderBottomRightRadius = `${bottomRadius}px`;
    }

    animateMobileGrowUnColored(progress) {
        if (!this.elements.unColoredContainer) return;

        const easedProgress = progress;
        const startWidth = 228;
        const endWidth = window.innerWidth;
        const width = this.lerp(startWidth, endWidth, easedProgress);

        this.elements.unColoredContainer.style.width = `${Math.min(
            width,
            window.innerWidth
        )}px`;
    }

    animateMobileGrowLowerFrame(progress) {
        if (!this.elements.lowerFrame) return;

        const easedProgress = progress;
        const startWidth = 228;
        const endWidth = window.innerWidth;
        const width = this.lerp(startWidth, endWidth, easedProgress);

        this.elements.lowerFrame.style.width = `${Math.min(
            width,
            window.innerWidth
        )}px`;
        this.elements.lowerFrame.style.maxWidth = "none";

        const bottomRadius = this.lerp(12, 0, easedProgress);
        this.elements.lowerFrame.style.borderTopLeftRadius = "0px";
        this.elements.lowerFrame.style.borderTopRightRadius = "0px";
        this.elements.lowerFrame.style.borderBottomLeftRadius = `${bottomRadius}px`;
        this.elements.lowerFrame.style.borderBottomRightRadius = `${bottomRadius}px`;
    }

    animateMobileMainBtn(progress) {
        if (!this.elements.mainBtn) return;

        const easedProgress = progress;
        const vw = window.innerWidth;
        let translateX;

        if (this.hasCtcBtn) {
            translateX = this.lerp(0, -vw / 2 + 135, easedProgress);
        } else {
            translateX = this.lerp(0, -vw / 2 + 115, easedProgress);
        }

        const originalWidth = 190;
        const originalHeight = 40;
        const targetWidth = 129;
        const targetHeight = 30;

        const scaleX = this.lerp(1, targetWidth / originalWidth, easedProgress);
        const scaleY = this.lerp(1, targetHeight / originalHeight, easedProgress);

        this.elements.mainBtn.style.transform = `translateX(${translateX}px) scale(${scaleX}, ${scaleY})`;
    }

    animateMobileSplitLeft(progress) {
        if (!this.elements.ctcBtn) return;

        const easedProgress = progress;
        const vw = window.innerWidth;
        const opacity = this.lerp(0, 1, easedProgress);

        if (easedProgress === 0) {
            this.elements.ctcBtn.style.transform = `translate(-50%, -50%)`;
            this.elements.ctcBtn.style.opacity = "0";
        } else {
            const finalX = -vw / 2 + 20;
            const currentX = this.lerp(-50, finalX, easedProgress);
            this.elements.ctcBtn.style.transform = `translate(${currentX}px, -50%)`;
            this.elements.ctcBtn.style.opacity = opacity;
        }
    }

    animateMobileSplitRight(progress) {
        if (!this.elements.sideText) return;

        const easedProgress = progress;
        const vw = window.innerWidth;
        const opacity = this.lerp(0, 1, easedProgress);

        if (easedProgress === 0) {
            this.elements.sideText.style.transform = `translate(-50%, -50%)`;
            this.elements.sideText.style.opacity = "0";
        } else {
            let finalX;
            if (this.hasCtcBtn) {
                finalX = vw / 2 - 130;
            } else {
                finalX = vw / 4 - 59;
            }

            const currentX = this.lerp(-50, finalX, easedProgress);
            this.elements.sideText.style.transform = `translate(${currentX}px, -50%)`;
            this.elements.sideText.style.opacity = opacity;
        }
    }

    animate() {
        const progress15 = this.getScrollProgress(0, 20);

        this.updateCtcStatus();

        if (this.deviceType === "desktop") {
            this.animateDesktopGrowColored(progress15);
            this.animateDesktopGrow(progress15);
            this.animateDesktopMainBtn(progress15);
            this.animateDesktopSplitLeft(progress15);
            this.animateDesktopSplitRight(progress15);
        } else if (this.deviceType === "mobile") {
            this.animateMobileGrowColored(progress15);
            this.animateMobileGrowUnColored(progress15);
            this.animateMobileGrowLowerFrame(progress15);
            this.animateMobileMainBtn(progress15);
            this.animateMobileSplitLeft(progress15);
            this.animateMobileSplitRight(progress15);
        }
    }

    startAnimation() {
        const animateFrame = () => {
            this.animate();
            this.animationFrameId = requestAnimationFrame(animateFrame);
        };

        this.animationFrameId = requestAnimationFrame(animateFrame);
    }

    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    updateDeviceType() {
        const newDeviceType = this.getDeviceType();
        if (newDeviceType !== this.deviceType) {
            this.deviceType = newDeviceType;
            this.init();
        }
    }
    handleScrollUpperLogo() {
        let isHidden = false;
        const container = document.querySelector(".company__logo__container");
        if (!container) return;
        container.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
        const scrollY = window.scrollY;
        const hideThreshold = 120;
        if (scrollY > hideThreshold && !isHidden) {
            container.style.opacity = "0";
            container.style.transform = "translateY(-20px)";
            container.style.pointerEvents = "none";
            isHidden = true;
        } else if (scrollY <= hideThreshold && isHidden) {
            container.style.opacity = "1";
            container.style.transform = "translateY(0)";
            container.style.pointerEvents = "auto";
            isHidden = false;
        }
    }

    handleUpperLogoAnimation() {
        if (!this.isUpperLogoTickingAnimation) {
            window.requestAnimationFrame(hero.handleScrollUpperLogo);
            this.isUpperLogoTickingAnimation = true;
            setTimeout(() => {
                this.isUpperLogoTickingAnimation = false;
            }, 16);
        }
    }

    handleStickyHeaderScroll() {
        if (hero.scrollDisabled || hero.isScrolling) return;
        const currentScrollY = window.scrollY;

        if (Math.abs(currentScrollY - hero.lastScrollY) < 1) {
            return;
        }
        hero.lastScrollY = currentScrollY;

        if (hero.originalOffsetTop === null) {
            hero.originalOffsetTop = hero.elements.unColoredContainer.offsetTop;
            hero.containerHeight = hero.elements.unColoredContainer.offsetHeight;
        }

        const lowerRect = hero.elements.unColoredContainer.getBoundingClientRect();
        const threshold = 4;

        if (currentScrollY <= 10) {
            hero.bounceTriggered = false;
            window.lastScrollY = 0;
        }

        if (
            currentScrollY >= threshold &&
            currentScrollY < 200 &&
            !hero.bounceTriggered &&
            !hero.snapBackInProgress
        ) {
            const scrollDirection =
                currentScrollY > (window.lastScrollY || 0) ? "down" : "up";
            window.lastScrollY = currentScrollY;

            if (scrollDirection === "down") {
                hero.bounceTriggered = true;
                hero.snapBackInProgress = true;
                window.scrollTo({
                    top: hero.originalOffsetTop,
                    behavior: "smooth",
                });

                setTimeout(() => {
                    hero.snapBackInProgress = false;
                }, 600);
            }
        }

        if (currentScrollY < threshold && hero.bounceTriggered) {
            hero.bounceTriggered = false;
        }

        if (lowerRect.top <= 0 && !hero.elements.unColoredContainer.classList.contains("sticky")) {
            const placeholder = document.createElement("div");
            placeholder.style.height = hero.containerHeight + "px";
            placeholder.classList.add("sticky-placeholder");
            hero.elements.unColoredContainer.parentNode.insertBefore(placeholder, hero.elements.unColoredContainer);
            hero.elements.unColoredContainer.classList.add("sticky");
        }

        if (
            currentScrollY < hero.originalOffsetTop &&
            hero.elements.unColoredContainer.classList.contains("sticky") &&
            !hero.snapBackInProgress
        ) {
            const placeholder = document.querySelector(".sticky-placeholder");
            if (placeholder) {
                placeholder.remove();

                hero.snapBackInProgress = true;
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });

                setTimeout(() => {
                    hero.snapBackInProgress = false;
                }, 600);
            }
            hero.elements.unColoredContainer.classList.remove("sticky");
        }
    }
}

let hero;

document.addEventListener("DOMContentLoaded", () => {
    hero = new Hero();
    hero.manageClickToCallButton();

    window.addEventListener("resize", () => {
        if (!hero) return;
        hero.manageClickToCallButton();
        hero.updateDeviceType();
    });

    window.addEventListener("scroll", () => {
        if (!hero) return;
        hero.handleUpperLogoAnimation();
        hero.handleStickyHeaderScroll();
    }, { passive: true });
});