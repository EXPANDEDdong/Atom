"use client";
export default function FixIOSInputZoom() {
  if (navigator.userAgent.indexOf("iPhone") > -1) {
    document
      .querySelector("[name=viewport]")
      ?.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1"
      );
  }
  return null;
}
