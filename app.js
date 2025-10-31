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

    // Scroll snap state
    this.lastScrollY = 0;
    this.stickyHeaderOriginalY = null;
    this.snapToUncoloredDone = false;
    this.snapToTopDone = false;

    this.init();
  }

  startPageAtTop() {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }

  setFrameColorBackground() {
    if (this.elements.coloredContainer) {
      const url = this.elements.coloredContainer.getAttribute("data-background-url");
      if (url) {
        this.elements.coloredContainer.style.backgroundImage = `url('${url}')`;
      }
    }
  }

  getHeroContainerAttributes() {
    if (!this.elements.heroContainer) return null;

    return {
      isPublishCTC: this.elements.heroContainer.getAttribute("data-ispublishctc") === "true",
      ctcBtnColor: this.elements.heroContainer.getAttribute("data-ctcbtn-color"),
      ctcImageAltText: this.elements.heroContainer.getAttribute("data-altimagectctext"),
      shouldShowButton: this.elements.heroContainer.getAttribute("data-show-ctc-button") === "true",
      isAmexWebsite: this.elements.heroContainer.getAttribute("data-isamexwebsite") === "true",
      iconUrl: this.elements.heroContainer.getAttribute("data-click-to-call-icon") || "",
      phoneNumber: this.elements.heroContainer.getAttribute("data-phone") || "",
      urlLink: this.elements.heroContainer.getAttribute("data-url") || ""
    };
  }

  createCTCButton(attributes) {
    const button = document.createElement("button");

    button.classList.add(
      attributes.isAmexWebsite ? "amex__btn__theme__sticky__header" : "isracard__btn__theme__sticky__header",
      "clickToCall__btn",
      "lower__frame__btns"
    );

    if (attributes.ctcBtnColor) {
      button.style.backgroundColor = attributes.ctcBtnColor;
    }

    if (attributes.phoneNumber) button.setAttribute("data-phone", attributes.phoneNumber);
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

      if (attributes.shouldShowButton && !this.elements.ctcBtn && attributes.isPublishCTC) {
        this.elements.ctcBtn = this.createCTCButton(attributes);
        this.elements.lowerFrame.appendChild(this.elements.ctcBtn);
        this.elements.lowerFrame.classList.add("has-ctc-btn");
      } else if (!attributes.shouldShowButton && this.elements.ctcBtn && !attributes.isPublishCTC) {
        this.elements.lowerFrame.removeChild(this.elements.ctcBtn);
        this.elements.lowerFrame.classList.remove("has-ctc-btn");
        this.elements.ctcBtn = null;
      }

      this.elements.lowerFrame.classList.toggle(
        "has-ctc-btn",
        this.elements.ctcBtn && this.elements.lowerFrame.contains(this.elements.ctcBtn)
      );
    } else {
      if (this.elements.ctcBtn && this.elements.lowerFrame.contains(this.elements.ctcBtn)) {
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
    this.elements.coloredContainer = document.querySelector(".colored__frame__container");
    this.elements.unColoredContainer = document.querySelector(".uncolored__frame__container");
    this.elements.lowerFrame = document.querySelector(".lower__part__glass__frame");
    this.elements.mainBtn = document.querySelector(".main__order__card__btn");
    this.elements.ctcBtn = document.querySelector(".clickToCall__btn");
    this.elements.sideText = document.querySelector(".side__text__cashback");
    this.elements.heroContainer = document.querySelector(".hero__container");
    this.elements.companyLogoContainer = document.querySelector(".company__logo__container");
  }

  setBorderRadius(element, radius) {
    if (typeof radius === 'number') {
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
      this.elements.lowerFrame.style.width = this.deviceType === "desktop" ? "337px" : "228px";
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
      this.elements.companyLogoContainer.style.transition = "opacity 0.3s ease, transform 0.3s ease";
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
      console.error('Hero initialization failed:', error);
      this.handleInitError(error);
    }
  }

  handleInitError(error) {
    this.stopAnimation();
    console.warn('Hero running in degraded mode due to initialization error');
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

    this.elements.coloredContainer.style.width = `${Math.min(width, window.innerWidth)}px`;
    this.elements.coloredContainer.style.maxWidth = "100%";

    const radius = this.lerp(20, 0, progress);
    this.setBorderRadius(this.elements.coloredContainer, radius);
  }

  animateDesktopGrow(progress) {
    if (!this.elements.unColoredContainer || !this.elements.lowerFrame) return;

    const uncoloredWidth = this.lerp(722, window.innerWidth, progress);
    const lowerWidth = this.lerp(337, window.innerWidth, progress);

    this.elements.unColoredContainer.style.width = `${Math.min(uncoloredWidth, window.innerWidth)}px`;
    this.elements.lowerFrame.style.width = `${Math.min(lowerWidth, window.innerWidth)}px`;
    this.elements.lowerFrame.style.maxWidth = "none";

    const bottomRadius = this.lerp(12, 0, progress);
    this.setBorderRadius(this.elements.lowerFrame, { top: 0, bottom: bottomRadius });
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
    this.elements.coloredContainer.style.width = `${Math.min(width, window.innerWidth)}px`;

    const radius = this.lerp(20, 0, progress);
    this.setBorderRadius(this.elements.coloredContainer, radius);
  }

  animateMobileGrowUnColored(progress) {
    if (!this.elements.unColoredContainer) return;

    const width = this.lerp(228, window.innerWidth, progress);
    this.elements.unColoredContainer.style.width = `${Math.min(width, window.innerWidth)}px`;
  }

  animateMobileGrowLowerFrame(progress) {
    if (!this.elements.lowerFrame) return;

    const width = this.lerp(228, window.innerWidth, progress);
    this.elements.lowerFrame.style.width = `${Math.min(width, window.innerWidth)}px`;
    this.elements.lowerFrame.style.maxWidth = "none";

    const bottomRadius = this.lerp(12, 0, progress);
    this.setBorderRadius(this.elements.lowerFrame, { top: 0, bottom: bottomRadius });
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
    if (!this.isMobile || !this.isChromeiOS() || !this.elements.unColoredContainer.classList.contains("sticky")) return;

    const visualViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const layoutViewportHeight = window.innerHeight;
    const topOffset = Math.max(0, layoutViewportHeight - visualViewportHeight);

    this.elements.unColoredContainer.style.top = `${topOffset}px`;
  }

  manageStickyHeader() {
    const container = this.elements.unColoredContainer;
    if (!container) return;

    if (this.stickyHeaderOriginalY === null || this.needsRecalculation) {
      const rect = container.getBoundingClientRect();
      this.stickyHeaderOriginalY = rect.top + window.scrollY;
      this.needsRecalculation = false;
    }

    const scrollY = window.scrollY;
    const isBelowOriginalPos = scrollY >= this.stickyHeaderOriginalY;

    if (isBelowOriginalPos && !container.classList.contains('sticky')) {
      container.classList.add('sticky');
      this.adjustStickyPosition();
    } else if (!isBelowOriginalPos && container.classList.contains('sticky')) {
      container.classList.remove('sticky');
    }
  }

  handleSnapScroll() {
    const scrollY = window.scrollY;
    const scrollDirection = this.lastScrollY < scrollY ? 'down' : 'up';

    if (!this.elements.unColoredContainer) return;
    if (this.stickyHeaderOriginalY === null) {
      const rect = this.elements.unColoredContainer.getBoundingClientRect();
      this.stickyHeaderOriginalY = rect.top + window.scrollY;
    }

    if (
      scrollDirection === 'down' &&
      !this.snapToUncoloredDone &&
      scrollY <= Hero.SCROLL_THRESHOLD
    ) {
      this.snapToUncoloredDone = true;
      this.snapToTopDone = false;
      window.scrollTo({
        top: this.stickyHeaderOriginalY,
        behavior: 'smooth',
      });
    }

    if (
      scrollDirection === 'up' &&
      !this.snapToTopDone &&
      scrollY < this.stickyHeaderOriginalY - 20
    ) {
      this.snapToTopDone = true;
      this.snapToUncoloredDone = false;
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    this.lastScrollY = scrollY;
  }
}

class HeroApp {
  constructor() {
    this.hero = null;
    this.resizeTimeout = null;
    this.isDestroyed = false;

    this.boundHandlers = {
      resize: this.handleResize.bind(this),
      scroll: this.handleScroll.bind(this),
      beforeUnload: this.cleanup.bind(this)
    };
  }

  init() {
    try {
      this.hero = new Hero();
      this.hero.manageClickToCallButton();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize Hero:', error);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', this.boundHandlers.resize, { passive: true });
    window.addEventListener('scroll', this.boundHandlers.scroll, { passive: true });
    window.addEventListener('beforeunload', this.boundHandlers.beforeUnload);

    if (window.visualViewport && this.hero && this.hero.isMobile && this.hero.isChromeiOS()) {
      this.boundHandlers.viewportChange = () => {
        if (this.hero && this.hero.isMobile && this.hero.isChromeiOS()) {
          this.hero.adjustStickyPosition();
        }
      };
      window.visualViewport.addEventListener('resize', this.boundHandlers.viewportChange);
      window.visualViewport.addEventListener('scroll', this.boundHandlers.viewportChange);
    }
  }

  handleResize() {
    if (this.isDestroyed || !this.hero) return;

    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.hero && !this.isDestroyed) {
        this.hero.manageClickToCallButton();
        this.hero.updateDeviceType();
      }
    }, 150);
  }

  handleScroll() {
    if (this.isDestroyed || !this.hero) return;

    this.hero.handleUpperLogoAnimation();
    this.hero.handleSnapScroll();
    this.hero.manageStickyHeader();
  }

  cleanup() {
    this.isDestroyed = true;

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    window.removeEventListener('resize', this.boundHandlers.resize);
    window.removeEventListener('scroll', this.boundHandlers.scroll);
    window.removeEventListener('beforeunload', this.boundHandlers.beforeUnload);

    if (window.visualViewport && this.boundHandlers.viewportChange && this.hero && this.hero.isChromeiOS()) {
      window.visualViewport.removeEventListener('resize', this.boundHandlers.viewportChange);
      window.visualViewport.removeEventListener('scroll', this.boundHandlers.viewportChange);
    }

    if (this.hero && typeof this.hero.stopAnimation === 'function') {
      this.hero.stopAnimation();
    }

    this.hero = null;
  }

  getHeroInstance() {
    return this.hero;
  }
}

let heroApp;
let hero;

document.addEventListener('DOMContentLoaded', () => {
  heroApp = new HeroApp();
  heroApp.init();
  hero = heroApp.getHeroInstance();
});

window.addEventListener('beforeunload', () => {
  if (heroApp) {
    heroApp.cleanup();
  }
});