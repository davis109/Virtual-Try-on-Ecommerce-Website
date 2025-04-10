import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { EasePack } from 'gsap/EasePack';
import { Flip } from 'gsap/Flip';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, EasePack, Flip);

// 3D Perspective setup for the document
gsap.set(document.body, { perspective: 1000 });

// Enhanced 3D button hover animations
export const buttonEnter = (target) => {
  gsap.to(target, {
    scale: 1.05,
    rotationY: 5,
    rotationX: -5,
    y: -8,
    z: 20,
    duration: 0.4,
    transformStyle: "preserve-3d",
    boxShadow: '0 15px 30px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.12)',
    ease: "back.out(1.7)",
    overwrite: true
  });
  
  // Text glow effect
  const buttonText = target.querySelector('span') || target;
  gsap.to(buttonText, {
    textShadow: '0 0 8px rgba(255,255,255,0.5)',
    color: 'brightness(120%)',
    duration: 0.3
  });
};

export const buttonLeave = (target) => {
  gsap.to(target, {
    scale: 1,
    rotationY: 0,
    rotationX: 0,
    y: 0,
    z: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    duration: 0.4,
    ease: "power2.out",
    overwrite: true
  });
  
  // Reset text glow
  const buttonText = target.querySelector('span') || target;
  gsap.to(buttonText, {
    textShadow: 'none',
    clearProps: "color",
    duration: 0.3
  });
};

// Enhanced 3D link hover animations
export const linkEnter = (target) => {
  gsap.to(target, {
    rotationY: 15,
    scale: 1.1,
    z: 10,
    duration: 0.5,
    ease: "elastic.out(1.2, 0.5)",
    overwrite: true
  });
};

export const linkLeave = (target) => {
  gsap.to(target, {
    rotationY: 0,
    scale: 1,
    z: 0,
    duration: 0.3,
    ease: "power2.out",
    overwrite: true
  });
};

// 3D page transition animations
export const fadeIn = (target) => {
  const tl = gsap.timeline();
  
  tl.fromTo(
    target,
    { 
      opacity: 0, 
      y: 50,
      rotationX: 10,
      transformPerspective: 1000,
      transformStyle: "preserve-3d"
    },
    { 
      opacity: 1, 
      y: 0, 
      rotationX: 0,
      duration: 0.8, 
      ease: "power3.out",
      stagger: {
        amount: 0.6,
        from: "start"
      }
    }
  );
  
  return tl;
};

// 3D navigation animation
export const animateNavItems = (targets) => {
  const tl = gsap.timeline();
  
  tl.fromTo(
    targets, 
    { 
      opacity: 0, 
      y: -30,
      rotationX: 45,
      z: -100,
      transformPerspective: 1000
    }, 
    { 
      opacity: 1, 
      y: 0,
      rotationX: 0,
      z: 0,
      duration: 0.7, 
      stagger: 0.1, 
      ease: "power3.out"
    }
  );
  
  return tl;
};

// 3D product card animations with flip effect
export const animateProductCards = (targets) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: targets[0],
      start: "top bottom-=100",
      toggleActions: "play none none reset"
    }
  });
  
  tl.fromTo(
    targets,
    { 
      opacity: 0,
      rotationY: 90,
      transformPerspective: 1000,
      transformStyle: "preserve-3d",
      transformOrigin: "left center"
    },
    { 
      opacity: 1, 
      rotationY: 0,
      duration: 0.8, 
      stagger: 0.15, 
      ease: "power3.out"
    }
  );
  
  return tl;
};

// Enhanced 3D try-on button animation
export const animateTryOnButton = (target) => {
  const tl = gsap.timeline();
  
  // 3D rotation pulse
  tl.to(target, {
    rotationY: 15,
    scale: 1.2, 
    duration: 0.3,
    boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
    ease: "back.out(3)"
  })
  .to(target, {
    rotationY: -15,
    duration: 0.5,
    ease: "elastic.out(1.2, 0.3)"
  })
  .to(target, {
    rotationY: 0,
    scale: 1,
    duration: 0.4,
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    ease: "power2.out"
  });
  
  // Add 3D flash effect
  const currentBg = window.getComputedStyle(target).backgroundColor;
  tl.to(target, {
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
    duration: 0.2,
    ease: "power1.inOut"
  }, 0)
  .to(target, {
    backgroundColor: currentBg,
    duration: 0.4,
    ease: "power1.out"
  }, 0.3);
  
  return tl;
};

// Advanced 3D hero section intro animation
export const animateHero = (container) => {
  if (!container) return;
  
  const heading = container.querySelector('h1, h2');
  const subheading = container.querySelector('h5, p');
  const buttons = container.querySelectorAll('button');
  
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  // Set 3D perspective
  gsap.set(container, { perspective: 1000 });
  
  // Start with the heading
  tl.fromTo(heading, 
    { 
      opacity: 0, 
      y: 100, 
      rotationX: 45,
      transformStyle: "preserve-3d" 
    }, 
    { 
      opacity: 1, 
      y: 0, 
      rotationX: 0,
      duration: 1 
    }
  );
  
  // Then animate the subheading
  tl.fromTo(subheading, 
    { 
      opacity: 0, 
      y: 50, 
      rotationX: 30,
      transformStyle: "preserve-3d" 
    }, 
    { 
      opacity: 1, 
      y: 0, 
      rotationX: 0,
      duration: 0.8 
    },
    "-=0.6" // Overlap with previous animation
  );
  
  // Then the buttons
  tl.fromTo(buttons, 
    { 
      opacity: 0, 
      y: 30, 
      scale: 0.8,
      rotationY: 45,
      transformStyle: "preserve-3d",
      transformOrigin: "center"
    }, 
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotationY: 0,
      duration: 0.7, 
      stagger: 0.2
    },
    "-=0.5" // Overlap with previous animation
  );
  
  return tl;
};

// 3D logo animation
export const animateLogo = (logo) => {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 8 });
  
  tl.to(logo, {
    rotationY: 360,
    duration: 1.5,
    transformStyle: "preserve-3d",
    ease: "power1.inOut"
  })
  .to(logo, {
    scale: 1.2,
    duration: 0.5,
    ease: "elastic.out(1.2, 0.5)"
  })
  .to(logo, {
    scale: 1,
    duration: 0.5,
    ease: "back.out(2)"
  });
  
  return tl;
};

// 3D flip animation for feature cards
export const animateFeatureCards = (cards) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: cards[0],
      start: "top bottom-=150",
      toggleActions: "play none none reset"
    }
  });
  
  // Set perspective on parent
  if (cards[0] && cards[0].parentElement) {
    gsap.set(cards[0].parentElement, { perspective: 1000 });
  }
  
  // Flip cards in sequentially
  tl.fromTo(cards, 
    { 
      rotationY: 90,
      opacity: 0,
      z: -100,
      transformStyle: "preserve-3d",
      transformOrigin: "center left"
    }, 
    { 
      rotationY: 0,
      opacity: 1, 
      z: 0,
      duration: 0.8, 
      stagger: 0.15, 
      ease: "power2.out" 
    }
  );
  
  // Add hover animation to each card with 3D effect
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -15,
        rotationX: 5,
        rotationY: 5,
        scale: 1.05,
        boxShadow: "0 30px 30px rgba(0,0,0,0.15)",
        duration: 0.4,
        ease: "power2.out"
      });
    });
    
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        duration: 0.4,
        ease: "power2.inOut"
      });
    });
  });
  
  return tl;
};

// Enhanced 3D parallax effect for background images
export const createParallaxEffect = (element, speed = 0.5) => {
  gsap.to(element, {
    y: () => -window.scrollY * speed,
    rotationX: () => window.scrollY * 0.02,
    ease: "none",
    transformStyle: "preserve-3d",
    transformOrigin: "center center",
    scrollTrigger: {
      trigger: element,
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
};

// 3D scroll reveal animation for sections
export const createScrollReveal = (sections) => {
  sections.forEach((section, index) => {
    // Alternate between left and right animations
    const fromLeft = index % 2 === 0;
    
    gsap.fromTo(
      section,
      { 
        opacity: 0, 
        x: fromLeft ? -100 : 100,
        rotationY: fromLeft ? -20 : 20,
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      },
      {
        opacity: 1,
        x: 0,
        rotationY: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top bottom-=150",
          toggleActions: "play none none none"
        }
      }
    );
  });
};

// 3D flip animation for product images
export const animateImageFlip = (element) => {
  // Save the initial state
  const state = Flip.getState(element);
  
  // Apply a change
  gsap.set(element, { 
    rotationY: 180, 
    opacity: 0, 
    scale: 0.8,
    transformStyle: "preserve-3d" 
  });
  
  // Animate from the initial state to the new state
  return Flip.from(state, {
    duration: 1,
    ease: "power2.inOut",
    absolute: true,
    spin: true, // Enable 3D spinning
    prune: true // Remove transforms when complete
  });
};

// 3D hover effect for any element
export const add3DHoverEffect = (elements, intensity = 1) => {
  elements.forEach(el => {
    if (!el) return;
    
    // Set initial style
    gsap.set(el, { 
      transformStyle: "preserve-3d", 
      transformPerspective: 1000 
    });
    
    // Track mouse position
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position
      const rotateY = ((e.clientX - centerX) / rect.width * 20) * intensity;
      const rotateX = ((centerY - e.clientY) / rect.height * 20) * intensity;
      
      gsap.to(el, {
        rotationY: rotateY,
        rotationX: rotateX,
        z: 50 * intensity,
        duration: 0.5,
        ease: "power1.out",
        boxShadow: `${-rotateY}px ${rotateX}px 20px rgba(0,0,0,0.2)`
      });
    });
    
    // Reset on mouse leave
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        rotationY: 0,
        rotationX: 0,
        z: 0,
        duration: 0.5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        ease: "power1.out"
      });
    });
  });
};

// Create 3D image pop effect
export const createImagePopEffect = (imageElement) => {
  if (!imageElement) return;
  
  // Set perspective
  gsap.set(imageElement.parentElement, { perspective: 800 });
  
  // Create tilt effect
  imageElement.addEventListener('mousemove', (e) => {
    const rect = imageElement.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;
    
    gsap.to(imageElement, {
      rotationX: rotateX,
      rotationY: rotateY,
      scale: 1.05,
      z: 30,
      duration: 0.5,
      ease: "power1.out",
      transformStyle: "preserve-3d",
      boxShadow: "0 25px 40px rgba(0,0,0,0.3)"
    });
  });
  
  // Reset on mouse leave
  imageElement.addEventListener('mouseleave', () => {
    gsap.to(imageElement, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      z: 0,
      boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
      duration: 0.6,
      ease: "power2.out"
    });
  });
};

// Create a 3D card with depth layers
export const create3DLayeredCard = (cardElement, options = {}) => {
  if (!cardElement) return;
  
  // Set perspective on parent
  gsap.set(cardElement.parentElement, { perspective: 1000 });
  gsap.set(cardElement, { transformStyle: "preserve-3d" });
  
  const { depth = 40, layers = [], rotation = 10 } = options;
  
  // Set up z values for each layer
  if (layers.length) {
    layers.forEach((layer, index) => {
      const zValue = (index - (layers.length - 1) / 2) * depth;
      gsap.set(layer, { z: zValue, transformStyle: "preserve-3d" });
    });
  } else {
    // Auto-detect layers based on common elements
    const autoLayers = [
      ...cardElement.querySelectorAll('img, h2, h3, h4, h5, h6, p, button')
    ];
    
    autoLayers.forEach((element, index) => {
      const zValue = (autoLayers.length - index) * 30 - 60;
      gsap.set(element, { z: zValue, transformStyle: "preserve-3d" });
    });
  }
  
  // Add tilt on hover
  cardElement.addEventListener('mousemove', (e) => {
    const rect = cardElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateY = (e.clientX - centerX) / (rect.width / rotation);
    const rotateX = (centerY - e.clientY) / (rect.height / rotation);
    
    gsap.to(cardElement, {
      rotationY: rotateY,
      rotationX: rotateX,
      duration: 0.5,
      ease: "power1.out"
    });
  });
  
  // Reset on mouse leave
  cardElement.addEventListener('mouseleave', () => {
    gsap.to(cardElement, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.7)"
    });
  });
};

// Product Detail Page Animations
export const animateProductDetail = (container) => {
  if (!container) return;
  
  // Select elements
  const image = container.querySelector('[data-product-image]') || container.querySelector('img');
  const title = container.querySelector('h1, h2, h3') || container.querySelector('[data-product-title]');
  const price = container.querySelector('[data-product-price]');
  const description = container.querySelector('[data-product-description]');
  const specs = container.querySelectorAll('[data-product-spec]');
  const addToCartBtn = container.querySelector('[data-add-to-cart]') || container.querySelector('button');
  const colorOptions = container.querySelectorAll('[data-color-option]');
  const sizeOptions = container.querySelectorAll('[data-size-option]');
  
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  // Set 3D perspective on container
  gsap.set(container, { perspective: 1200 });
  
  // Image animation with 3D effect
  if (image) {
    tl.fromTo(image, 
      { 
        opacity: 0, 
        scale: 0.8,
        rotationY: 25,
        transformOrigin: "center center",
        transformStyle: "preserve-3d"
      }, 
      { 
        opacity: 1, 
        scale: 1,
        rotationY: 0, 
        duration: 1.2,
        ease: "elastic.out(1, 0.8)"
      }
    );
    
    // Add parallax effect to image
    container.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      gsap.to(image, {
        rotationY: x * 8,
        rotationX: -y * 8,
        translateZ: 50,
        duration: 0.5,
        ease: "power1.out"
      });
    });
    
    container.addEventListener('mouseleave', () => {
      gsap.to(image, {
        rotationY: 0,
        rotationX: 0,
        translateZ: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.7)"
      });
    });
  }
  
  // Staggered animations for text elements
  if (title) {
    tl.fromTo(title, 
      { 
        opacity: 0, 
        y: 30,
        rotationX: 15, 
        transformStyle: "preserve-3d" 
      }, 
      { 
        opacity: 1, 
        y: 0, 
        rotationX: 0,
        duration: 0.8 
      }, 
      "-=0.6"
    );
  }
  
  if (price) {
    tl.fromTo(price, 
      { 
        opacity: 0, 
        y: 20,
        rotationX: 10, 
        transformStyle: "preserve-3d" 
      }, 
      { 
        opacity: 1, 
        y: 0, 
        rotationX: 0,
        duration: 0.6 
      }, 
      "-=0.5"
    );
  }
  
  if (description) {
    tl.fromTo(description, 
      { 
        opacity: 0, 
        y: 20,
        transformStyle: "preserve-3d" 
      }, 
      { 
        opacity: 1, 
        y: 0,
        duration: 0.7 
      }, 
      "-=0.4"
    );
  }
  
  // Product specs with staggered effect
  if (specs.length) {
    tl.fromTo(specs, 
      { 
        opacity: 0, 
        x: -30,
        transformStyle: "preserve-3d" 
      }, 
      { 
        opacity: 1, 
        x: 0,
        stagger: 0.1,
        duration: 0.5 
      }, 
      "-=0.5"
    );
  }
  
  // Color options with 3D flip effect
  if (colorOptions.length) {
    tl.fromTo(colorOptions, 
      { 
        opacity: 0,
        scale: 0,
        rotation: -180,
        transformStyle: "preserve-3d"
      }, 
      { 
        opacity: 1,
        scale: 1,
        rotation: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, 
      "-=0.5"
    );
    
    // Add click effect
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        gsap.timeline()
          .to(option, {
            scale: 1.2,
            rotation: 180,
            duration: 0.3
          })
          .to(option, {
            scale: 1,
            rotation: 360,
            duration: 0.5,
            ease: "elastic.out(1, 0.7)"
          });
      });
    });
  }
  
  // Size options with staggered fade
  if (sizeOptions.length) {
    tl.fromTo(sizeOptions, 
      { 
        opacity: 0,
        y: 15,
        transformStyle: "preserve-3d"
      }, 
      { 
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.5
      }, 
      "-=0.4"
    );
    
    // Add click effect
    sizeOptions.forEach(option => {
      option.addEventListener('click', () => {
        gsap.timeline()
          .to(option, {
            scale: 0.9,
            duration: 0.1
          })
          .to(option, {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.7)"
          });
      });
    });
  }
  
  // Add to cart button special effect
  if (addToCartBtn) {
    tl.fromTo(addToCartBtn, 
      { 
        opacity: 0,
        scale: 0.8,
        y: 20,
        transformStyle: "preserve-3d"
      }, 
      { 
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        ease: "back.out(1.7)"
      }, 
      "-=0.3"
    );
    
    // Add pulse effect on hover
    addToCartBtn.addEventListener('mouseenter', () => {
      gsap.to(addToCartBtn, {
        scale: 1.05,
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        duration: 0.3
      });
    });
    
    addToCartBtn.addEventListener('mouseleave', () => {
      gsap.to(addToCartBtn, {
        scale: 1,
        y: 0,
        boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
        duration: 0.3
      });
    });
  }
  
  return tl;
};

// Enhanced 3D product image hover effect with rotation
export const enhance3DProductImage = (imageElement, intensity = 1) => {
  if (!imageElement) return;
  
  // Set perspective on parent container
  if (imageElement.parentElement) {
    gsap.set(imageElement.parentElement, { 
      perspective: 1000,
      transformStyle: "preserve-3d"
    });
  }
  
  // Set initial state
  gsap.set(imageElement, { 
    transformStyle: "preserve-3d",
    transition: "transform 0.2s ease-out"
  });
  
  // Create 3D effect on mouse move
  imageElement.addEventListener('mousemove', (e) => {
    const rect = imageElement.getBoundingClientRect();
    
    // Calculate mouse position relative to image
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    
    // Calculate rotation angles (-15 to 15 degrees)
    const rotateY = (mouseX - 0.5) * 30 * intensity;
    const rotateX = (0.5 - mouseY) * 20 * intensity;
    
    // Apply transforms with GSAP
    gsap.to(imageElement, {
      rotationY: rotateY,
      rotationX: rotateX,
      scale: 1.05,
      z: 50,
      boxShadow: `
        ${-rotateY/3}px ${rotateX/3}px 14px rgba(0,0,0,0.2),
        0 10px 30px rgba(0,0,0,0.15)
      `,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto"
    });
  });
  
  // Reset on mouse leave
  imageElement.addEventListener('mouseleave', () => {
    gsap.to(imageElement, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      z: 0,
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      duration: 0.7,
      ease: "elastic.out(1.2, 0.5)",
      overwrite: "auto"
    });
  });
  
  // Add click effect
  imageElement.addEventListener('mousedown', () => {
    gsap.to(imageElement, {
      scale: 0.97,
      duration: 0.1,
      ease: "power3.out",
      overwrite: "auto"
    });
  });
  
  imageElement.addEventListener('mouseup', () => {
    gsap.to(imageElement, {
      scale: 1.05,
      duration: 0.4,
      ease: "elastic.out(1.2, 0.5)",
      overwrite: "auto"
    });
  });
  
  // Initial subtle animation to draw attention
  gsap.to(imageElement, {
    y: -5,
    duration: 1.5,
    repeat: 1,
    yoyo: true,
    ease: "power1.inOut"
  });
};

// Create a floating effect for product displays
export const createFloatingEffect = (element) => {
  if (!element) return;
  
  // Create random floating animation
  gsap.to(element, {
    y: "random(-8, 8)",
    x: "random(-5, 5)",
    rotation: "random(-3, 3)",
    duration: "random(3, 5)",
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    delay: "random(0, 2)"
  });
}; 