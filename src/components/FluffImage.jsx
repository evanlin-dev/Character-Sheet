import { useState, useEffect, useMemo } from "react";

export function extractFluffImageUrls(fluff) {
  if (!fluff) return [];
  const urls = [];
  const addUrl = (url) => {
    if (url && !urls.includes(url)) urls.push(url);
  };

  if (fluff.img) {
    addUrl(
      typeof fluff.img === "string"
        ? fluff.img
        : fluff.img.url || fluff.img.path || null,
    );
  }
  if (fluff.images && fluff.images.length) {
    fluff.images.forEach((img) => {
      if (img.href && img.href.path)
        addUrl("https://5e.tools/img/" + img.href.path);
      else if (img.href?.url) addUrl(img.href.url);
      else if (img.url) addUrl(img.url);
      else if (img.path) addUrl(img.path);
    });
  }
  if (fluff.entries) {
    const seek = (obj) => {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(seek);
        return;
      }
      if (typeof obj === "object") {
        if (obj.type === "image" && obj.href && obj.href.path) {
          addUrl("https://5e.tools/img/" + obj.href.path);
        }
        if (obj.entries) seek(obj.entries);
        else if (obj.entry) seek(obj.entry);
      }
    };
    seek(fluff.entries);
  }
  return urls;
}

export function extractFluffImageUrl(fluff) {
  const urls = extractFluffImageUrls(fluff);
  return urls.length > 0 ? urls[0] : null;
}

export function stdFallbacks(type, source, name) {
  if (!source || !name) return [];
  const typePath = type === "monsters" ? "bestiary" : type;
  const typeTitle = typePath.charAt(0).toUpperCase() + typePath.slice(1);
  const enc = encodeURIComponent;
  const fbs = [
    `https://5e.tools/img/${typePath}/${enc(source)}/${enc(name)}.webp`,
    `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/refs/heads/main/img/${enc(source)}/${typeTitle}/${enc(name)}.webp`,
    `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/main/img/${enc(source)}/${typeTitle}/${enc(name)}.webp`,
  ];
  if (type === "races") {
    fbs.push(
      `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/main/img/${enc(source)}/Race/${enc(name)}.webp`,
    );
  }
  return [...new Set(fbs)];
}

export function getSubclassFallbacks(
  className,
  subclassName,
  source,
  shortName,
) {
  if (!className || !subclassName) return [];
  const enc = encodeURIComponent;
  const src = source || "XPHB";
  const underscore = (s) => s.replace(/ /g, "_");
  const hyphen = (s) => s.replace(/ /g, "-");
  const nospace = (s) => s.replace(/ /g, "");
  const nospaceStrict = (s) =>
    s
      .split(" ")
      .map((w, i) => (i === 0 ? w : w.toLowerCase()))
      .join("");
  const sName = shortName || subclassName;
  const ghBase = `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/refs/heads/main/img/${enc(src)}`;
  const arr = [
    `https://5e.tools/img/subclasses/${enc(src)}/${enc(className)}_${enc(subclassName)}.webp`,
    `https://5e.tools/img/subclasses/${enc(src)}/${enc(subclassName)}.webp`,
    `https://5e.tools/img/subclasses/${enc(src)}/${enc(sName)}.webp`,
    `https://5e.tools/img/classes/${enc(src)}/${enc(`${subclassName} ${className}`)}.webp`,
    `https://5e.tools/img/classes/${enc(src)}/${enc(`${sName} ${className}`)}.webp`,
    `https://5e.tools/img/classes/${enc(src)}/${enc(className)}.webp`,
    `${ghBase}/Subclasses/${enc(underscore(className) + "_" + underscore(subclassName))}.webp`,
    `${ghBase}/Subclasses/${enc(underscore(className) + "_" + underscore(sName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(subclassName)}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(sName)}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(nospace(subclassName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(nospace(sName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(nospaceStrict(subclassName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}_${enc(nospaceStrict(sName))}.webp`,
    `${ghBase}/Subclass/${enc(className)}/${enc(sName)}.webp`,
    `${ghBase}/Subclasses/${enc(sName)}.webp`,
    `${ghBase}/Subclasses/${enc(hyphen(sName))}.webp`,
    `${ghBase}/Subclasses/${enc(hyphen(subclassName))}.webp`,
    `${ghBase}/Subclasses/${enc(className)}.webp`,
  ];
  return [...new Set(arr)];
}

export function clearImageCache() {
  let count = 0;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("imgcache_")) {
      localStorage.removeItem(key);
      count++;
    }
  });
  return count;
}

export default function FluffImage({
  fluff,
  baseObj,
  type,
  name,
  source,
  subclassName,
  className,
  subclassShortName,
  imgStyle,
  onNaturalSize,
}) {
  const [imgState, setImgState] = useState({
    src: null,
    fallbacks: [],
    index: -1,
    failed: false,
  });
  const [expanded, setExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const cacheKey = `imgcache_${type || "misc"}_${name || subclassName || className || "unknown"}_${source || "unknown"}`;

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached === "FAILED") {
      setImgState({ src: null, fallbacks: [], index: -1, failed: true });
      return;
    }
    if (cached) {
      setImgState({ src: cached, fallbacks: [], index: -1, failed: false });
      return;
    }

    let primary = extractFluffImageUrl(fluff);
    if (!primary && baseObj?.img)
      primary =
        typeof baseObj.img === "string"
          ? baseObj.img
          : baseObj.img.url || baseObj.img.path || null;
    let fb = [];
    if (type === "subclasses" && subclassName && className)
      fb = getSubclassFallbacks(
        className,
        subclassName,
        source,
        subclassShortName,
      );
    else if (type && name && source) fb = stdFallbacks(type, source, name);

    if (primary) fb = fb.filter((url) => url !== primary);
    if (!primary && fb.length > 0) {
      primary = fb[0];
      fb = fb.slice(1);
    }

    console.log(
      `[FluffImage] Initializing ${name || subclassName || className}:`,
      { primary, fallbacks: fb },
    );
    setImgState({ src: primary, fallbacks: fb, index: -1, failed: !primary });
  }, [
    fluff,
    baseObj,
    type,
    name,
    source,
    subclassName,
    className,
    subclassShortName,
    cacheKey,
  ]);

  if (imgState.failed || !imgState.src) return null;

  const handleError = () => {
    const nextIdx = imgState.index + 1;
    if (nextIdx < imgState.fallbacks.length) {
      console.log(
        `[FluffImage] Image failed. Trying fallback ${nextIdx + 1}:`,
        imgState.fallbacks[nextIdx],
      );
      setImgState((prev) => ({
        ...prev,
        index: nextIdx,
        src: prev.fallbacks[nextIdx],
      }));
    } else {
      console.log(
        `[FluffImage] All images failed for ${name || subclassName || className}`,
      );
      localStorage.setItem(cacheKey, "FAILED");
      setImgState((prev) => ({ ...prev, failed: true }));
    }
  };

  const handleLoad = (e) => {
    if (imgState.src && localStorage.getItem(cacheKey) !== imgState.src) {
      localStorage.setItem(cacheKey, imgState.src);
    }
    if (onNaturalSize) onNaturalSize(e.target.naturalWidth, e.target.naturalHeight);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setExpanded(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <>
      <img
        src={imgState.src}
        alt={name || subclassName || className}
        onLoad={handleLoad}
        onError={handleError}
        onClick={() => setExpanded(true)}
        style={{
          maxWidth: "300px",
          maxHeight: "300px",
          float: "right",
          margin: "0 0 10px 16px",
          borderRadius: "4px",
          objectFit: "cover",
          cursor: "zoom-in",
          ...imgStyle,
        }}
      />

      {expanded && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            animation: isClosing
              ? "fadeOut 0.2s ease-in forwards"
              : "fadeIn 0.2s ease-out forwards",
          }}
          onClick={handleClose}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes scaleOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.9); opacity: 0; } }
          `}</style>
          <img
            src={imgState.src}
            alt={name || subclassName || className}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              animation: isClosing
                ? "scaleOut 0.2s ease-in forwards"
                : "scaleIn 0.2s ease-out forwards",
            }}
          />
        </div>
      )}
    </>
  );
}

export function TokenImage({ baseObj, name, source }) {
  const [imgState, setImgState] = useState({
    src: null,
    fallbacks: [],
    index: -1,
    failed: false,
  });

  const cacheKey = `imgcache_token_${name}_${source}`;

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached === "FAILED") {
      setImgState({ src: null, fallbacks: [], index: -1, failed: true });
      return;
    }
    if (cached) {
      setImgState({ src: cached, fallbacks: [], index: -1, failed: false });
      return;
    }

    let primary = null;
    if (baseObj?.tokenUrl) primary = baseObj.tokenUrl;
    else if (baseObj?.tokenHref?.url) primary = baseObj.tokenHref.url;
    else if (baseObj?.tokenHref?.path)
      primary = "https://5e.tools/img/" + baseObj.tokenHref.path;

    let fb = [];
    if (name && source) {
      const enc = encodeURIComponent;
      fb.push(
        `https://5e.tools/img/bestiary/tokens/${enc(source)}/${enc(name)}.webp`,
      );
      fb.push(
        `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/refs/heads/main/img/${enc(source)}/Tokens/${enc(source)}/${enc(name)}.webp`,
      );
      fb.push(
        `https://raw.githubusercontent.com/TheGiddyLimit/homebrew-img/main/img/${enc(source)}/bestiary/tokens/${enc(name)}.webp`,
      );
    }

    if (primary) fb = fb.filter((url) => url !== primary);
    if (!primary && fb.length > 0) {
      primary = fb[0];
      fb = fb.slice(1);
    }

    setImgState({ src: primary, fallbacks: fb, index: -1, failed: !primary });
  }, [baseObj, name, source, cacheKey]);

  if (imgState.failed || !imgState.src) return null;

  const handleError = () => {
    const nextIdx = imgState.index + 1;
    if (nextIdx < imgState.fallbacks.length) {
      setImgState((prev) => ({
        ...prev,
        index: nextIdx,
        src: prev.fallbacks[nextIdx],
      }));
    } else {
      localStorage.setItem(cacheKey, "FAILED");
      setImgState((prev) => ({ ...prev, failed: true }));
    }
  };

  const handleLoad = () => {
    if (imgState.src && localStorage.getItem(cacheKey) !== imgState.src) {
      localStorage.setItem(cacheKey, imgState.src);
    }
  };

  return (
    <img
      src={imgState.src}
      alt={name + " token"}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        width: "120px",
        height: "120px",
        float: "right",
        margin: "0 0 10px 16px",
        borderRadius: "50%",
        objectFit: "cover",
        // border: "2px solid var(--gold)",
        // backgroundColor: "var(--parchment-dark)",
        marginRight: "8px",
      }}
    />
  );
}
