export const getModalPosition = () => {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;

  return {
    scrollY,
    viewportHeight,
    centerY: scrollY + viewportHeight / 2,
  };
};

export const createScrollLock = () => {
  const scrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflowY = "scroll";

  return () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflowY = "";
    window.scrollTo(0, scrollY);
  };
};
