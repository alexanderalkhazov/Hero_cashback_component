class Hero {
  static DEVICE_BREAKPOINT = 768;
  static LOGO_HIDE_THRESHOLD = 120;
  static SCROLL_THRESHOLD = 35;
  static BOUNCE_MAX_SCROLL = 200;
  static ANIMATION_TIMEOUT = 600;
  static THROTTLE_DELAY = 16;

  constructor() {
    // Device and animation state
    this.deviceType = this.getDeviceType();
    this.animationFrameId = null;
    this.isAnimating = false;

    // Element cache
    this.elements = {
      coloredContainer: null,
      unColoredContainer: null,
      lowerFrame: null,
      mainBtn: null,
      ctcBtn: null,
      sideText: null,
      heroContainer: null,
      companyLogoContainer: null,
      stickyPlaceholder: null,
    };

    // UI state
    this.hasCtcBtn = false;
    this.isUpperLogoHidden = false;
    this.isUpperLogoTickingAnimation = false;

    // new scroll state
    this.lastScrollY = 0;
    this.stickyHeaderOriginalY = null;
    this.snapToUncoloredDone = false;
    this.snapToTopDone = false;
    this.isSnapping = false;
    this.lastSnapTime = null;
    this.needsRecalculation = true;

    this.init();
  }

  setFrameColorBackground() {
    if (this.elements.coloredContainer) {
      const url = this.elements.coloredContainer.getAttribute(
        "data-background-url"
      );
      if (url) {
        this.elements.coloredContainer.style.backgroundImage = `url('${url}')`;
      }
    }
  }

  getHeroContainerAttributes() {
    if (!this.elements.heroContainer) return null;

    return {
      isPublishCTC:
        this.elements.heroContainer.getAttribute("data-ispublishctc") ===
        "true",
      ctcBtnColor:
        this.elements.heroContainer.getAttribute("data-ctcbtn-color"),
      ctcImageAltText: this.elements.heroContainer.getAttribute(
        "data-altimagectctext"
      ),
      shouldShowButton:
        this.elements.heroContainer.getAttribute("data-show-ctc-button") ===
        "true",
      isAmexWebsite:
        this.elements.heroContainer.getAttribute("data-isamexwebsite") ===
        "true",
      iconUrl:
        this.elements.heroContainer.getAttribute("data-click-to-call-icon") ||
        "",
      phoneNumber: this.elements.heroContainer.getAttribute("data-phone") || "",
      urlLink: this.elements.heroContainer.getAttribute("data-url") || "",
    };
  }

  createCTCButton(attributes) {
    const button = document.createElement("button");

    button.classList.add(
      attributes.isAmexWebsite
        ? "amex__btn__theme__sticky__header"
        : "isracard__btn__theme__sticky__header",
      "clickToCall__btn",
      "lower__frame__btns"
    );

    if (attributes.ctcBtnColor) {
      button.style.backgroundColor = attributes.ctcBtnColor;
    }

    if (attributes.phoneNumber)
      button.setAttribute("data-phone", attributes.phoneNumber);
    if (attributes.urlLink) button.setAttribute("data-url", attributes.urlLink);

    button.addEventListener("click", function () {
      handleCtcClick(this);
    });

    const icon = document.createElement("img");
    icon.src = attributes.iconUrl;
    icon.alt = attributes.ctcImageAltText;
    button.appendChild(icon);

    return button;
  }

  manageClickToCallButton() {
    if (!this.elements.lowerFrame) return;

    this.elements.ctcBtn = document.querySelector(".clickToCall__btn");

    if (this.isMobile) {
      const attributes = this.getHeroContainerAttributes();
      if (!attributes) return;

      if (
        attributes.shouldShowButton &&
        !this.elements.ctcBtn &&
        attributes.isPublishCTC
      ) {
        this.elements.ctcBtn = this.createCTCButton(attributes);
        this.elements.lowerFrame.appendChild(this.elements.ctcBtn);
        this.elements.lowerFrame.classList.add("has-ctc-btn");
      } else if (
        !attributes.shouldShowButton &&
        this.elements.ctcBtn &&
        !attributes.isPublishCTC
      ) {
        this.elements.lowerFrame.removeChild(this.elements.ctcBtn);
        this.elements.lowerFrame.classList.remove("has-ctc-btn");
        this.elements.ctcBtn = null;
      }

      this.elements.lowerFrame.classList.toggle(
        "has-ctc-btn",
        this.elements.ctcBtn &&
        this.elements.lowerFrame.contains(this.elements.ctcBtn)
      );
    } else {
      if (
        this.elements.ctcBtn &&
        this.elements.lowerFrame.contains(this.elements.ctcBtn)
      ) {
        this.elements.lowerFrame.removeChild(this.elements.ctcBtn);
        this.elements.ctcBtn = null;
      }
      this.elements.lowerFrame.classList.remove("has-ctc-btn");
    }
  }

  getDeviceType() {
    return window.innerWidth <= Hero.DEVICE_BREAKPOINT ? "mobile" : "desktop";
  }

  get isMobile() {
    return this.deviceType === "mobile";
  }

  cacheElements() {
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
    this.elements.heroContainer = document.querySelector(".hero__container");
    this.elements.companyLogoContainer = document.querySelector(
      ".company__logo__container"
    );

    this.elements.stickyPlaceholder = document.querySelector(".sticky-placeholder");
  }

  setBorderRadius(element, radius) {
    if (typeof radius === "number") {
      element.style.borderRadius = `${radius}px`;
    } else {
      const { top = 0, bottom = 0 } = radius;
      element.style.borderTopLeftRadius = `${top}px`;
      element.style.borderTopRightRadius = `${top}px`;
      element.style.borderBottomLeftRadius = `${bottom}px`;
      element.style.borderBottomRightRadius = `${bottom}px`;
    }
  }

  initializeStyles() {
    if (this.elements.coloredContainer) {
      this.setBorderRadius(this.elements.coloredContainer, 20);
    }

    if (this.elements.lowerFrame) {
      this.setBorderRadius(this.elements.lowerFrame, { top: 0, bottom: 12 });
      this.elements.lowerFrame.style.width =
        this.deviceType === "desktop" ? "337px" : "228px";
    }

    if (this.elements.ctcBtn) {
      this.elements.ctcBtn.style.transform = "translate(-50%, -50%)";
      this.elements.ctcBtn.style.opacity = "0";
    }

    if (this.elements.sideText) {
      this.elements.sideText.style.transform = "translate(-50%, -50%)";
      this.elements.sideText.style.opacity = "0";
    }

    if (this.elements.companyLogoContainer) {
      this.elements.companyLogoContainer.style.transition =
        "opacity 0.3s ease, transform 0.3s ease";
      this.elements.companyLogoContainer.style.opacity = "1";
      this.elements.companyLogoContainer.style.transform = "translateY(0)";
    }
  }

  init() {
    try {
      this.cacheElements();
      this.initializeStyles();
      this.setFrameColorBackground();
      this.updateCtcStatus();
      this.startAnimation();
    } catch (error) {
      console.error("Hero initialization failed:", error);
      this.handleInitError(error);
    }
  }

  handleInitError(error) {
    this.stopAnimation();
    console.warn("Hero running in degraded mode due to initialization error");
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

    const startWidth = 722;
    const endWidth = window.innerWidth;
    const width = this.lerp(startWidth, endWidth, progress);

    this.elements.coloredContainer.style.width = `${Math.min(
      width,
      window.innerWidth
    )}px`;
    this.elements.coloredContainer.style.maxWidth = "100%";

    const radius = this.lerp(20, 0, progress);
    this.setBorderRadius(this.elements.coloredContainer, radius);
  }

  animateDesktopGrow(progress) {
    if (!this.elements.unColoredContainer || !this.elements.lowerFrame) return;

    const uncoloredWidth = this.lerp(722, window.innerWidth, progress);
    const lowerWidth = this.lerp(337, window.innerWidth, progress);

    this.elements.unColoredContainer.style.width = `${Math.min(
      uncoloredWidth,
      window.innerWidth
    )}px`;
    this.elements.lowerFrame.style.width = `${Math.min(
      lowerWidth,
      window.innerWidth
    )}px`;
    this.elements.lowerFrame.style.maxWidth = "none";

    const bottomRadius = this.lerp(12, 0, progress);
    this.setBorderRadius(this.elements.lowerFrame, {
      top: 0,
      bottom: bottomRadius,
    });
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

    const width = this.lerp(354, window.innerWidth, progress);
    this.elements.coloredContainer.style.width = `${Math.min(
      width,
      window.innerWidth
    )}px`;

    const radius = this.lerp(20, 0, progress);
    this.setBorderRadius(this.elements.coloredContainer, radius);
  }

  animateMobileGrowUnColored(progress) {
    if (!this.elements.unColoredContainer) return;

    const width = this.lerp(228, window.innerWidth, progress);
    this.elements.unColoredContainer.style.width = `${Math.min(
      width,
      window.innerWidth
    )}px`;
  }

  animateMobileGrowLowerFrame(progress) {
    if (!this.elements.lowerFrame) return;

    const width = this.lerp(228, window.innerWidth, progress);
    this.elements.lowerFrame.style.width = `${Math.min(
      width,
      window.innerWidth
    )}px`;
    this.elements.lowerFrame.style.maxWidth = "none";

    const bottomRadius = this.lerp(12, 0, progress);
    this.setBorderRadius(this.elements.lowerFrame, {
      top: 0,
      bottom: bottomRadius,
    });
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
      this.cacheElements();
      this.initializeStyles();
      this.updateCtcStatus();
    }
  }
  handleScrollUpperLogo() {
    if (!this.elements.companyLogoContainer) return;

    const scrollY = window.scrollY;

    if (scrollY > Hero.LOGO_HIDE_THRESHOLD && !this.isUpperLogoHidden) {
      this.elements.companyLogoContainer.style.opacity = "0";
      this.elements.companyLogoContainer.style.transform = "translateY(-20px)";
      this.elements.companyLogoContainer.style.pointerEvents = "none";
      this.isUpperLogoHidden = true;
    } else if (scrollY <= Hero.LOGO_HIDE_THRESHOLD && this.isUpperLogoHidden) {
      this.elements.companyLogoContainer.style.opacity = "1";
      this.elements.companyLogoContainer.style.transform = "translateY(0)";
      this.elements.companyLogoContainer.style.pointerEvents = "auto";
      this.isUpperLogoHidden = false;
    }
  }

  handleUpperLogoAnimation() {
    if (!this.isUpperLogoTickingAnimation) {
      window.requestAnimationFrame(() => this.handleScrollUpperLogo());
      this.isUpperLogoTickingAnimation = true;
      setTimeout(() => {
        this.isUpperLogoTickingAnimation = false;
      }, Hero.THROTTLE_DELAY);
    }
  }

  createScrollTimeout(callback) {
    return setTimeout(callback, Hero.ANIMATION_TIMEOUT);
  }

  isChromeiOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(userAgent) && /CriOS/.test(userAgent);
  }

  adjustStickyPosition() {
    if (
      !this.isMobile ||
      !this.isChromeiOS() ||
      !this.elements.unColoredContainer.classList.contains("sticky")
    )
      return;

    const visualViewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;
    const layoutViewportHeight = window.innerHeight;
    const topOffset = Math.max(0, layoutViewportHeight - visualViewportHeight);

    this.elements.unColoredContainer.style.top = `${topOffset}px`;
  }

  applyStickyHeaderPlaceHolder(container) {
    const existingPlaceholder = document.querySelector(".sticky-placeholder");

    if (existingPlaceholder) {
      this.elements.stickyPlaceholder = existingPlaceholder;
      return;
    }

    if (!this.elements.stickyPlaceholder || !this.elements.stickyPlaceholder.parentNode) {
      const containerHeight = container.offsetHeight;
      const placeholder = document.createElement("div");
      placeholder.style.height = containerHeight + "px";
      placeholder.classList.add("sticky-placeholder");
      container.parentNode.insertBefore(placeholder, container);
      this.elements.stickyPlaceholder = placeholder;
    }
  }

  removeStickyPlaceholder() {
    if (
      this.elements.stickyPlaceholder &&
      this.elements.stickyPlaceholder.parentNode
    ) {
      this.elements.stickyPlaceholder.parentNode.removeChild(
        this.elements.stickyPlaceholder
      );
      this.elements.stickyPlaceholder = null;
    }
  }

  manageStickyHeader() {
    const container = this.elements.unColoredContainer;
    if (!container) return;

    const savedOriginalY = sessionStorage.getItem("stickyHeaderOriginalY");
    const savedNeedsRecalc = sessionStorage.getItem("needsRecalculation");

    if (savedOriginalY !== null && this.stickyHeaderOriginalY === null) {
      this.stickyHeaderOriginalY = parseFloat(savedOriginalY);
    }
    if (savedNeedsRecalc !== null) {
      this.needsRecalculation = savedNeedsRecalc === "true";
    }

    if (this.stickyHeaderOriginalY === null || this.needsRecalculation) {
      const wasSticky = container.classList.contains("sticky");
      if (wasSticky) {
        container.classList.remove("sticky");
        this.removeStickyPlaceholder();
      }

      const rect = container.getBoundingClientRect();
      this.stickyHeaderOriginalY = rect.top + window.scrollY;
      this.needsRecalculation = false;

      if (wasSticky) {
        this.applyStickyHeaderPlaceHolder(container);
        container.classList.add("sticky");
      }

      sessionStorage.setItem(
        "stickyHeaderOriginalY",
        this.stickyHeaderOriginalY
      );
      sessionStorage.setItem("needsRecalculation", this.needsRecalculation);
    }

    const scrollY = window.scrollY;
    const isBelowOriginalPos = scrollY >= this.stickyHeaderOriginalY;
    const isCurrentlySticky = container.classList.contains("sticky");

    if (isBelowOriginalPos && !isCurrentlySticky) {
      this.applyStickyHeaderPlaceHolder(container);
      container.classList.add("sticky");
      this.adjustStickyPosition();
    } else if (!isBelowOriginalPos && isCurrentlySticky) {
      container.classList.remove("sticky");
      this.removeStickyPlaceholder();
    }
  }

  disableInteractions() {
    if (this.elements.heroContainer) {
      this.elements.heroContainer.style.pointerEvents = "none";
      this.elements.heroContainer.style.touchAction = "none";
    }
    document.body.style.pointerEvents = "none";
    document.body.style.touchAction = "none";
  }

  enableInteractions() {
    if (this.elements.heroContainer) {
      this.elements.heroContainer.style.pointerEvents = "";
      this.elements.heroContainer.style.touchAction = "";
    }
    document.body.style.pointerEvents = "";
    document.body.style.touchAction = "";
  }

  handleSnapScroll() {
    const scrollY = window.scrollY;
    const scrollDirection = this.lastScrollY < scrollY ? "down" : "up";

    if (!this.elements.unColoredContainer) return;
    if (this.stickyHeaderOriginalY === null) {
      const rect = this.elements.unColoredContainer.getBoundingClientRect();
      this.stickyHeaderOriginalY = rect.top + window.scrollY;
    }

    const now = Date.now();
    if (this.lastSnapTime && now - this.lastSnapTime < 100) {
      this.lastScrollY = scrollY;
      return;
    }

    if (scrollY <= 10) {
      this.snapToTopDone = false;
      this.snapToUncoloredDone = false;
    } else if (Math.abs(scrollY - this.stickyHeaderOriginalY) <= 10) {
      this.snapToUncoloredDone = false;
    }

    if (
      scrollDirection === "down" &&
      !this.snapToUncoloredDone &&
      scrollY >= Hero.SCROLL_THRESHOLD &&
      scrollY < this.stickyHeaderOriginalY - 20 &&
      !this.isSnapping
    ) {
      this.snapToUncoloredDone = true;
      this.snapToTopDone = false;
      this.isSnapping = true;
      this.lastSnapTime = now;
      this.disableInteractions();

      window.scrollTo({
        top: this.stickyHeaderOriginalY,
        behavior: "smooth",
      });

      setTimeout(() => {
        this.isSnapping = false;
        this.enableInteractions();
      }, 900);
    } else if (
      scrollDirection === "up" &&
      !this.snapToTopDone &&
      scrollY < this.stickyHeaderOriginalY &&
      scrollY > 20 &&
      !this.isSnapping
    ) {
      this.snapToTopDone = true;
      this.snapToUncoloredDone = false;
      this.isSnapping = true;
      this.lastSnapTime = now;
      this.disableInteractions();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        this.isSnapping = false;
        this.enableInteractions();
      }, 900);
    }

    this.lastScrollY = scrollY;
  }
}


let hero;

document.addEventListener("DOMContentLoaded", () => {
  hero = new Hero();
})

window.addEventListener("scroll", () => {
  if (hero) {
    hero.handleScrollUpperLogo();
    hero.manageStickyHeader();

    if (!hero.isSnapping) {
      hero.handleSnapScroll();
    }

    hero.manageClickToCallButton();
  }
})